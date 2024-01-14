package com.eKarte.services;

import com.eKarte.dto.EventDto;
import com.eKarte.models.Event;

import java.util.List;

public interface EventService {
    List<EventDto> findAllEvents();
    Event addEvent(Event event);

    Event getEventById(Integer eventId);

    void deleteEventById(Integer eventId);

    void updateEvent(EventDto event);

    EventDto findEventById(Integer eventId);
}
