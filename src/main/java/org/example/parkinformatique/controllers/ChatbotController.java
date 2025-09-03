package org.example.parkinformatique.controllers;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.example.parkinformatique.Service.ChatbotIndexerService;
import org.example.parkinformatique.Service.RagChatService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class ChatbotController {

    private final RagChatService rag;
    private final ChatbotIndexerService indexer;

    @PostMapping
    public ResponseEntity<?> chat(@RequestBody ChatReq req) {
        try {
            String ans = rag.answer(req.getMessage(), 3);
            return ResponseEntity.ok(Map.of("answer", ans));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("error", true, "message", e.getMessage()));
        }
    }



    @PostMapping("/reindex")
    public ResponseEntity<?> reindex() {
        try {
            int n = indexer.reindexAll();
            return ResponseEntity.ok("Indexed chunks: " + n);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Reindex error: " + e.getMessage());
        }
    }

    @Data
    public static class ChatReq { private String message; }
}