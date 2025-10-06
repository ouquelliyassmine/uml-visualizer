// org.example.parkinformatique.dto.LogicielRequest
package org.example.parkinformatique.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;

import java.time.LocalDate;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class LogicielRequest {
    private String nom;
    private String version;
    private String editeur;
    private String licence;

    @JsonAlias({"dateExpiration", "dateexpiration"})
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dateExpiration;

    @JsonAlias({"materielId", "materiel_id"})
    private Long materielId;
}


