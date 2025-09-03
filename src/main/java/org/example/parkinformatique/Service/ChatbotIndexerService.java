package org.example.parkinformatique.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.example.parkinformatique.entities.BaseConnaissance;
import org.example.parkinformatique.entities.KbEmbedding;
import org.example.parkinformatique.repositories.BaseConnaissanceRepository;
import org.example.parkinformatique.repositories.KbEmbeddingRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatbotIndexerService {
    private final BaseConnaissanceRepository kbRepo;
    private final KbEmbeddingRepository embRepo;
    private final EmbeddingService embeddingService;
    private final ObjectMapper mapper;

    @Value("${rag.rag.max-chars-per-chunk:1200}")
    private int maxCharsPerChunk;

    @Transactional
    public int reindexAll() throws Exception {
        List<BaseConnaissance> articles = kbRepo.findAll();
        int count = 0;
        for (BaseConnaissance a : articles) {
            // Clear old
            embRepo.deleteByArticle_Id(a.getId());

            String base = (a.getTitre() == null ? "" : a.getTitre() + "\n\n") +
                    (a.getContenu() == null ? "" : a.getContenu());
            List<String> chunks = chunk(base, maxCharsPerChunk);

            for (int i = 0; i < chunks.size(); i++) {
                String text = chunks.get(i);
                List<Double> vec = embeddingService.embed(text);
                KbEmbedding e = new KbEmbedding();
                e.setArticle(a);
                e.setChunkIndex(i);                             // 👈 هنا
                e.setChunkText(text);
                e.setEmbeddingJson(mapper.valueToTree(vec));
                embRepo.save(e);
                count++;
            }

        }
        return count;
    }

    private List<String> chunk(String text, int maxChars) {
        List<String> out = new ArrayList<>();
        if (text == null || text.isBlank()) return out;
        String[] parts = text.split("(?<=\\.) "); // naive sentence split
        StringBuilder cur = new StringBuilder();
        for (String p : parts) {
            if (cur.length() + p.length() + 1 > maxChars) {
                out.add(cur.toString());
                cur.setLength(0);
            }
            if (cur.length() > 0) cur.append(' ');
            cur.append(p);
        }
        if (cur.length() > 0) out.add(cur.toString());
        return out;
    }
}
