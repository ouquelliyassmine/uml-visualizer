





package org.example.parkinformatique.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.parkinformatique.entities.KbEmbedding;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RagChatService {

    private final EmbeddingService embeddingService;
    private final ChatbotService chatbotService;
    private final ObjectMapper mapper;


    private static final String SYSTEM_PROMPT = """
Tu es l'assistant TechOasis du SI Park Informatique.
- Réponds TOUJOURS dans la LANGUE du message (ar/fr).
- Donne des réponses concises et des PROCÉDURES en étapes NUMÉROTÉES.
- Terminologie : Tableau de bord → Tickets → Nouveau/Modifier.
- Champs : Titre, Description, Priorité, Statut, Commentaire.
- Utilise le contexte (KB) si fourni.
- Ne fabrique pas d'informations. Pose au plus UNE question de clarification si nécessaire.
""";

    private String buildUserContent(String question, String kbContext) {
        return """
QUESTION :
%s

=== CONTEXTE KB (si présent) ===
%s
=== FIN CONTEXTE ===

Si aucun contexte n'est pertinent, applique la procédure standard :
1) Ouvrir Tableau de bord → Tickets → Nouveau.
2) Renseigner : Titre, Description (détail du problème), Priorité, Statut.
3) (Optionnel) Commentaire et pièces jointes.
4) Soumettre et noter le numéro du ticket.
Réponds dans la langue de la question.
""".formatted(question, (kbContext == null || kbContext.isBlank()) ? "(aucun)" : kbContext);
    }

    @Value("${rag.ollama.base-url:http://localhost:11434}")
    private String baseUrl;


    @Value("${rag.ollama.chat-model:llama3.2:1b-instruct-q4_K_M}")
    private String chatModel;

    @Value("${rag.rag.topk:3}")
    private int topK;

    @Value("${rag.rag.max-context-chars:1200}")
    private int maxContextChars;

    private WebClient client;

    @PostConstruct
    void init() {
        this.client = WebClient.builder()
                .baseUrl(baseUrl)
                .codecs(c -> c.defaultCodecs().maxInMemorySize(8 * 1024 * 1024))
                .build();
        log.info("✅ RAG ready baseUrl={} model={} topK={} maxCtx={}",
                baseUrl, chatModel, topK, maxContextChars);
    }


    private String buildKbContext(String question) {
        try {
            List<Double> q = embeddingService.embed(question);
            List<KbEmbedding> top = chatbotService.findRelevantChunks(q, Math.max(1, topK));
            String ctx = top.stream()
                    .map(KbEmbedding::getChunkText)
                    .collect(Collectors.joining("\n---\n"));

            if (ctx.length() > maxContextChars) {
                return ctx.substring(0, maxContextChars);
            }
            return ctx;
        } catch (Exception e) {
            log.warn("KB context unavailable: {}", e.toString());
            return "";
        }
    }


    public Flux<String> answerStream(String question) {
        String kb = buildKbContext(question);

        Map<String, Object> body = Map.of(
                "model", chatModel,
                "stream", true,
                "keep_alive", "1h",
                "options", Map.of(
                        "num_predict", 160,
                        "temperature", 0.3,
                        "num_ctx", 1024
                ),

                "prompt", """
<<SYS>>
%s
<</SYS>>

%s
""".formatted(SYSTEM_PROMPT, buildUserContent(question, kb))
        );

        return client.post()
                .uri("/api/generate")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToFlux(String.class)
                .timeout(Duration.ofMinutes(5))
                .map(chunkJson -> {
                    try {
                        // Ollama generate stream: {"response":"..","done":false,...}
                        JsonNode n = mapper.readTree(chunkJson);
                        if (n.has("response")) {
                            return n.get("response").asText("");
                        }
                        return "";
                    } catch (Exception ignore) {
                        return "";
                    }
                })
                .filter(s -> !s.isEmpty())
                .onErrorResume(err -> Flux.just("⚠️ Erreur: " + err.getMessage()));
    }

    public String answer(String question) {
        String kb = buildKbContext(question);

        var body = Map.of(
                "model", chatModel,
                "stream", false,
                "keep_alive", "1h",
                "options", Map.of(
                        "num_predict", 220,
                        "temperature", 0.3,
                        "num_ctx", 1024
                ),
                "messages", List.of(
                        Map.of("role", "system", "content", SYSTEM_PROMPT),
                        Map.of("role", "user", "content", buildUserContent(question, kb))
                )
        );

        try {
            String raw = client.post()
                    .uri("/api/chat")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(60));

            String text = extractTextFromOllama(raw);
            return (text != null && !text.isBlank()) ? text : raw;

        } catch (WebClientRequestException e) {
            throw new IllegalStateException("Ollama unreachable at " + baseUrl + " — run `ollama serve`.", e);
        }
    }

    private String extractTextFromOllama(String raw) {
        try {
            JsonNode root = mapper.readTree(raw);
            String c = root.path("message").path("content").asText(null); // /api/chat
            if (c != null && !c.isBlank()) return c;
            String r = root.path("response").asText(null);                // /api/generate
            if (r != null && !r.isBlank()) return r;
            return null;
        } catch (Exception e) {
            log.warn("Failed to parse Ollama JSON, returning raw", e);
            return null;
        }
    }
}
