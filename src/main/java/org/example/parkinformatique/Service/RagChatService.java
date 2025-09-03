package org.example.parkinformatique.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
// ✅ استعمل @Value ديال Spring ماشي Lombok
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class RagChatService {

    private final EmbeddingService embeddingService;
    private final ChatbotService chatbotService;
    private final ObjectMapper mapper;
    // RagChatService.java

    // 1) أضِف هذا الثابت داخل الكلاس
    private static final String SYSTEM_PROMPT = """
Tu es l'assistant TechOasis du SI Park Informatique.
- Réponds TOUJOURS dans la LANGUE du message (إذا كان بالعربية فأجب بالعربية الفصحى المبسطة، وإلا فبالفرنسية).
- Donne des réponses concises et des PROCÉDURES en étapes NUMÉROTÉES.
- Terminologie de l'app : Tableau de bord → Tickets → Nouveau/Modifier.
- Champs : Titre, Description, Priorité, Statut, Commentaire. Pièces jointes (optionnel).
- Utilise le contexte (KB) si fourni. S'il manque أو غير كافٍ، صرّح بذلك ثم اعتمد الإجراءات القياسية للتطبيق.
- Ne fabrique pas d'informations. Pose au plus UNE question de clarification si nécessaire.
""";

    // 2) (اختياري لكن مفيد) دالة صغيرة تبني محتوى المستخدم مع fallback إجرائي واضح
    private String buildUserContent(String question) {
        return """
QUESTION :
%s

Si aucun contexte KB n'est disponible, applique la procédure standard :
1) Ouvrir Tableau de bord → Tickets → Nouveau.
2) Renseigner : Titre, Description (détail du problème), Priorité, Statut.
3) (Optionnel) Ajouter un Commentaire et des pièces jointes.
4) Cliquer « Soumettre » et noter le numéro du ticket.
Réponds dans la langue de la question.
""".formatted(question);
    }


    @Value("${rag.ollama.base-url:http://localhost:11434}")
    private String baseUrl;

    @Value("${rag.ollama.chat-model:llama3.2:3b-instruct}")
    private String chatModel;

    @Value("${rag.rag.topk:3}")
    private int topK;

    @Value("${rag.rag.max-context-chars:2500}")
    private int maxContextChars;

    private WebClient client;

    @PostConstruct
    void init() {
        this.client = WebClient.builder().baseUrl(baseUrl).build();
        log.info("✅ RAG ready baseUrl={} model={} topK={} maxCtx={}",
                baseUrl, chatModel, topK, maxContextChars);
    }

    public String answer(String question, int k) {
        var body = Map.of(
                "model", chatModel,
                "stream", false,
                "keep_alive", "30m",
                "options", Map.of("num_predict", 220, "temperature", 0.3, "num_ctx", 2048),
                "messages", List.of(
                        // كان: "You are a helpful IT assistant."
                        Map.of("role","system","content", SYSTEM_PROMPT),
                        // كان: Map.of("role","user","content", question)
                        Map.of("role","user","content", buildUserContent(question))
                )
        );



        try {
            String raw = client.post()
                    .uri("/api/chat")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .onStatus(
                            s -> s.is4xxClientError() || s.is5xxServerError(),
                            r -> r.bodyToMono(String.class).map(msg ->
                                    new IllegalStateException("Ollama error " + r.statusCode().value() + ": " + msg))
                    )
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(60));

            // ✅ استخرج النص من JSON (chat: message.content) أو (generate: response)
            String text = extractTextFromOllama(raw);
            return (text != null && !text.isBlank()) ? text : raw; // fallback: raw

        } catch (WebClientRequestException e) {
            throw new IllegalStateException("Ollama unreachable at " + baseUrl + " — run `ollama serve`.", e);
        }
    }
    private String extractTextFromOllama(String raw) {
        try {
            JsonNode root = mapper.readTree(raw);
            // /api/chat
            String c = root.path("message").path("content").asText(null);
            if (c != null && !c.isBlank()) return c;
            // /api/generate
            String r = root.path("response").asText(null);
            if (r != null && !r.isBlank()) return r;
            return null;
        } catch (Exception e) {
            log.warn("Failed to parse Ollama JSON, returning raw", e);
            return null;
        }
    }
    }