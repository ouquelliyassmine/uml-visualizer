package org.example.parkinformatique.controllers;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.example.parkinformatique.Service.ChatbotIndexerService;
import org.example.parkinformatique.Service.RagChatService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping({"/api/utilisateur/chatbot", "/api/chatbot"})
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ChatbotController {

    private final RagChatService rag;
    private final ChatbotIndexerService indexer;


    @PostMapping
    public ResponseEntity<?> chat(@RequestBody ChatReq req) {
        try {
            String ans = rag.answer(req.getMessage());
            return ResponseEntity.ok(Map.of("answer", ans));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("error", true, "message", e.getMessage()));
        }
    }


    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> chatStream(@RequestBody ChatReq req) {
        return rag.answerStream(req.getMessage()).timeout(Duration.ofMinutes(5));
    }

    @PostMapping("/reindex")
    public ResponseEntity<?> reindex() {
        try {
            int n = indexer.reindexAll();
            return ResponseEntity.ok(Map.of("success", true, "indexed", n));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @Data
    public static class ChatReq { private String message; }
}
