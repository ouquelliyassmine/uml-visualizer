package org.example.parkinformatique.Service;

import org.example.parkinformatique.entities.Notification;
import org.example.parkinformatique.entities.NotificationType;
import org.example.parkinformatique.entities.Utilisateur;
import org.example.parkinformatique.repositories.NotificationRepository;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class NotificationService {

    private final NotificationRepository repo;

    // userId -> emitters
    private final Map<Long, CopyOnWriteArrayList<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public NotificationService(NotificationRepository repo) {
        this.repo = repo;
    }

    public Notification create(Utilisateur dest, NotificationType type, String message, String payload) {
        Notification n = Notification.builder()
                .destinataire(dest)
                .type(type)
                .message(message)
                .payload(payload)
                .createdAt(LocalDateTime.now())
                .build();
        Notification saved = repo.save(n);
        push(dest.getId(), saved);
        return saved;
    }

    public SseEmitter subscribe(Long userId) {
        // 0L => no timeout (or use minutes*1000L)
        SseEmitter emitter = new SseEmitter(0L);
        emitters.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> remove(userId, emitter));
        emitter.onTimeout(() -> remove(userId, emitter));
        emitter.onError((e) -> remove(userId, emitter));

        // optional: hello event
        try {
            emitter.send(SseEmitter.event()
                    .name("hello")
                    .id(String.valueOf(System.currentTimeMillis()))
                    .reconnectTime(3000)
                    .data("connected", MediaType.TEXT_PLAIN)); // ✅

        } catch (IOException ignored) {}

        return emitter;
    }

    private void remove(Long userId, SseEmitter emitter) {
        var list = emitters.get(userId);
        if (list != null) list.remove(emitter);
    }

    private void push(Long userId, Notification n) {
        var list = emitters.get(userId);
        if (list == null) return;

        list.forEach(em -> {
            try {
                em.send(SseEmitter.event()
                        .name("notification")
                        .data(org.example.parkinformatique.dto.NotificationDto.from(n),
                                MediaType.APPLICATION_JSON));
            } catch (Exception ex) {
                em.completeWithError(ex);
            }
        });
    }
}

