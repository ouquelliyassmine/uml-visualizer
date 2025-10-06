package org.example.parkinformatique.controllers;

import lombok.RequiredArgsConstructor;
import org.example.parkinformatique.Service.NotificationService;
import org.example.parkinformatique.dto.NotificationDto;
import org.example.parkinformatique.entities.Notification;
import org.example.parkinformatique.entities.Utilisateur;
import org.example.parkinformatique.repositories.NotificationRepository;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService service;
    private final NotificationRepository repo;

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public List<NotificationDto> list(@AuthenticationPrincipal Utilisateur me,
                                      @RequestParam(required = false) Boolean unread) {
        List<Notification> all = repo.findByDestinataireOrderByCreatedAtDesc(me);
        return all.stream()
                .filter(n -> unread == null || (unread && !n.isLu()) || (!unread))
                .map(NotificationDto::from)
                .toList();
    }

    @PostMapping("/{id}/read")
    public void read(@PathVariable Long id, @AuthenticationPrincipal Utilisateur me) {
        Notification n = repo.findById(id).orElseThrow();
        if (!n.getDestinataire().getId().equals(me.getId())) throw new RuntimeException("Forbidden");
        n.setLu(true);
        repo.save(n);
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@AuthenticationPrincipal Utilisateur me) {
        return service.subscribe(me.getId());
    }
}

