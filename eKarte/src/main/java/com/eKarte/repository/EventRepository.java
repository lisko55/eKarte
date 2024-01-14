package com.eKarte.repository;

import com.eKarte.models.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Integer> {

    Optional<Event> findByEventName(String url);

    @Query("SELECT e FROM Event e LEFT JOIN FETCH e.tickets")
    List<Event> findAllWithTickets();

}
