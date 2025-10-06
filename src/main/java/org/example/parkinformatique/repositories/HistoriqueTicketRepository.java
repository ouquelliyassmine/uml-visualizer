package org.example.parkinformatique.repositories;

import org.example.parkinformatique.entities.HistoriqueTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistoriqueTicketRepository extends JpaRepository<HistoriqueTicket, Long> {
    List<HistoriqueTicket> findByTicketIdOrderByDateActionDesc(Long ticketId);

}