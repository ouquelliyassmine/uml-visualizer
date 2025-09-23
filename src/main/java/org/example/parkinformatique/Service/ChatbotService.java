
package org.example.parkinformatique.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.example.parkinformatique.entities.KbEmbedding;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ChatbotService {
    private final EmbeddingService embeddingService;
    private final ObjectMapper objectMapper;

    public List<KbEmbedding> findRelevantChunks(List<Double> questionEmbedding, int topK) {
        List<KbEmbedding> all = embeddingService.getAllEmbeddings();
        return all.stream()
                .peek(e -> {

                    if (e.getEmbedding() == null && e.getEmbeddingJson() != null) {
                        e.setEmbedding(objectMapper.convertValue(
                                e.getEmbeddingJson(), new TypeReference<List<Double>>() {}
                        ));
                    }
                })
                .filter(e -> e.getEmbedding() != null && e.getEmbedding().size() == questionEmbedding.size())
                .map(e -> new AbstractMap.SimpleEntry<>(e, cosineSimilarity(questionEmbedding, e.getEmbedding())))
                .sorted((a,b) -> Double.compare(b.getValue(), a.getValue()))
                .limit(Math.max(1, topK))
                .map(Map.Entry::getKey)
                .toList();
    }

    private double cosineSimilarity(List<Double> a, List<Double> b) {
        double dot = 0, na = 0, nb = 0;
        for (int i = 0; i < a.size(); i++) {
            double x = a.get(i), y = b.get(i);
            dot += x*y; na += x*x; nb += y*y;
        }
        return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-9);
    }
}
