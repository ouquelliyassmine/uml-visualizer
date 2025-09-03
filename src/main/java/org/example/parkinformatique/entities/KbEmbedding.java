package org.example.parkinformatique.entities;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.example.parkinformatique.entities.BaseConnaissance;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
// ...

@Getter
@Setter
@Entity
@Table(name = "kb_embedding")
public class KbEmbedding {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id")
    private BaseConnaissance article;

    @Lob
    @Column(name = "content", columnDefinition = "TEXT")
    private String chunkText;

    // 👇 هادي المهمّة: JsonNode + JSONB
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "embedding_json", columnDefinition = "jsonb")
    private JsonNode embeddingJson;

    @Column(name = "chunk_index")
    private Integer chunkIndex;

    @Transient
    private java.util.List<Double> embedding; // نملؤها في الخدمة
}
