package com.eKarte.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer ticketId;

    @Column(nullable = false)
    private Float ticketPrice;

    @ManyToOne
    @JoinColumn(name = "eventId")
    private Event event;

}
