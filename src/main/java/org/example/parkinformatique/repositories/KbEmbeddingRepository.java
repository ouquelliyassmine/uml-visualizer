package org.example.parkinformatique.repositories;

import org.example.parkinformatique.entities.KbEmbedding;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface KbEmbeddingRepository extends JpaRepository<KbEmbedding, Long> {
    List<KbEmbedding> findByArticle_Id(Long articleId);
    void deleteByArticle_Id(Long articleId);
}
