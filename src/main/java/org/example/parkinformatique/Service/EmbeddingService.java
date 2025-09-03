package org.example.parkinformatique.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.example.parkinformatique.entities.KbEmbedding;
import org.example.parkinformatique.repositories.KbEmbeddingRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmbeddingService {
    private final ObjectMapper mapper;
    private final KbEmbeddingRepository kbRepo;

    @Value("${rag.ollama.base-url:http://localhost:11434}")
    private String baseUrl;

    @Value("${rag.ollama.embedding-model:nomic-embed-text}")
    private String embeddingModel;

    private WebClient client;

    private WebClient client() {
        if (client == null) client = WebClient.builder().baseUrl(baseUrl).build();
        return client;
    }

    /** Call Ollama embedding endpoint */
    public List<Double> embed(String text) throws Exception {
        JsonNode req = mapper.createObjectNode()
                .put("model", embeddingModel)
                .put("prompt", text);

        String resp = client().post()
                .uri("/api/embeddings")
                .contentType(MediaType.APPLICATION_JSON)
                .body(BodyInserters.fromValue(mapper.writeValueAsString(req)))
                .retrieve()
                .bodyToMono(String.class)
                .block();

        JsonNode node = mapper.readTree(resp);
        JsonNode arr = node.get("embedding");
        List<Double> vec = new ArrayList<>();
        arr.forEach(x -> vec.add(x.asDouble()));
        return vec;
    }

    /** Load all KbEmbedding rows */
    public List<KbEmbedding> getAllEmbeddings() {
        return kbRepo.findAll();
    }

    /** Utility to (de)serialize embedding vectors */
    public static String toJson(List<Double> v, ObjectMapper mapper) throws Exception {
        return mapper.writeValueAsString(v);
    }
    public static List<Double> fromJson(String json, ObjectMapper mapper) throws Exception {
        List<Double> out = new ArrayList<>();
        JsonNode arr = mapper.readTree(json);
        arr.forEach(x -> out.add(x.asDouble()));
        return out;
    }
}