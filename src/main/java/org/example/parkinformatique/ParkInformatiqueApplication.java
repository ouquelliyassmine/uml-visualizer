package org.example.parkinformatique;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan(basePackages = "org.example.parkinformatique.entities")
@EnableJpaRepositories(basePackages = "org.example.parkinformatique.repositories")
public class ParkInformatiqueApplication {

    public static void main(String[] args) {
        SpringApplication.run(ParkInformatiqueApplication.class, args);
    }
}

