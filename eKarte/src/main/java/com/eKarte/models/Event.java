package com.eKarte.models;

import jakarta.persistence.*;
import lombok.*;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder

@Entity
@Table(name = "Events")
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    private Integer eventId;

    @Column(nullable = false)
    private String eventName;

    @Column(nullable = false)
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private String eventDate;

    @Column(length = 750)
    private String eventInfo;

    @Column(nullable = false, length = 500)
    private String eventPicture;

    @Column(nullable = false)
    private Integer eventTicketNumber;

    public enum EventCategory {
        KONCERT, SPORT, FESTIVAL, POZORIŠTE,
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventCategory eventCategory;

    @CreationTimestamp
    private LocalDateTime eventCreateTime;

    @UpdateTimestamp
    private LocalDateTime eventUpdateTime;

    @Getter
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL)
    private List<Ticket> tickets = new ArrayList<>();
}
