package org.example.parkinformatique.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
public class OpenAiService {

    @Value("${openai.api.key}")

    private String apiKey;



    private final ObjectMapper mapper = new ObjectMapper();
    private final RestTemplate rest = new RestTemplate();

    public List<Double> embed(String text) throws Exception {
        if (apiKey == null || apiKey.isBlank()) throw new IllegalStateException("OPENAI_API_KEY manquant");
        String body = """
          { "model": "text-embedding-3-small", "input": %s }
        """.formatted(mapper.writeValueAsString(text));

        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.APPLICATION_JSON);
        h.setBearerAuth(apiKey);

        ResponseEntity<String> res = rest.postForEntity(
                "https://api.openai.com/v1/embeddings",
                new HttpEntity<>(body, h),
                String.class
        );

        JsonNode arr = mapper.readTree(res.getBody()).path("data").path(0).path("embedding");
        List<Double> out = new ArrayList<>(arr.size());
        for (JsonNode v : arr) out.add(v.asDouble());
        return out;
    }

    public String chat(String systemPrompt, String userMessage) throws Exception {
        if (apiKey == null || apiKey.isBlank()) throw new IllegalStateException("OPENAI_API_KEY manquant");
        String body = """
          {
            "model": "gpt-4o-mini",
            "temperature": 0.2,
            "messages": [
              {"role":"system","content": %s},
              {"role":"user","content": %s}
            ]
          }
        """.formatted(
                mapper.writeValueAsString(systemPrompt),
                mapper.writeValueAsString(userMessage)
        );

        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.APPLICATION_JSON);
        h.setBearerAuth(apiKey);

        ResponseEntity<String> res = rest.postForEntity(
                "https://api.openai.com/v1/chat/completions",
                new HttpEntity<>(body, h),
                String.class
        );

        JsonNode root = mapper.readTree(res.getBody());
        String answer = root.path("choices").path(0).path("message").path("content").asText();
        return (answer == null || answer.isBlank()) ? "Désolé, je n'ai pas trouvé de réponse." : answer;
    }
}
