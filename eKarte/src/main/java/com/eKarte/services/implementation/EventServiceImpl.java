package com.eKarte.services.implementation;

import com.eKarte.dto.EventDto;
import com.eKarte.models.Event;
import com.eKarte.repository.EventRepository;
import com.eKarte.services.EventService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;

    @Autowired
    public EventServiceImpl(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    @Override
    public List<EventDto> findAllEvents() {
        List<Event> events = eventRepository.findAll();
        return events.stream().map(this::mapToEventDto).collect(Collectors.toList());
    }

    @Override
    public Event addEvent(Event event) {
        return eventRepository.save(event);
    }

    @Override
    public Event getEventById(Integer eventId) {
        return eventRepository.findById(eventId).orElse(null);
    }

    @Override
    public void deleteEventById(Integer eventId) {
        eventRepository.deleteById(eventId);
    }

    @Override
    @Transactional
    public void updateEvent(EventDto eventDto) {
        // Check if the event with the given ID exists in the database
        Optional<Event> existingEventOptional = eventRepository.findById(eventDto.getEventId());

        if (existingEventOptional.isPresent()) {
            Event existingEvent = existingEventOptional.get();

            // Update only the fields that are present in the DTO
            if (eventDto.getEventName() != null) {
                existingEvent.setEventName(eventDto.getEventName());
            }
            if (eventDto.getEventInfo() != null) {
                existingEvent.setEventInfo(eventDto.getEventInfo());
            }
            if (eventDto.getEventPicture() != null) {
                existingEvent.setEventPicture(eventDto.getEventPicture());
            }
            if (eventDto.getEventDate() != null) {
                existingEvent.setEventDate(eventDto.getEventDate());
            }
            if (eventDto.getEventCategory() != null) {
                existingEvent.setEventCategory(Event.EventCategory.valueOf(eventDto.getEventCategory().name()));
            }

            eventRepository.save(existingEvent);
        } else {
            // Handle the case where the event with the given ID is not found
            throw new EntityNotFoundException("Event not found with ID: " + eventDto.getEventId());
        }
    }

    @Override
    public EventDto findEventById(Integer eventId) {
        Optional<Event> optionalEvent = eventRepository.findById(eventId);

        if (optionalEvent.isPresent()) {
            Event event = optionalEvent.get();
            return mapToEventDto(event);
        } else {
            throw new NoSuchElementException("Event not found with id: " + eventId);
        }
    }

    @Override
    public List<EventDto> getFilteredAndSortedEvents(String category, String sortOrder) {
        List<Event> events = eventRepository.findAll();

        // Filter by category if category is provided
        if (category != null && !category.trim().isEmpty()) {
            events = events.stream()
                    .filter(event -> event.getEventCategory().name().equalsIgnoreCase(category.trim()))
                    .collect(Collectors.toList());
        }

        // Sort events based on sortOrder
        if ("asc".equalsIgnoreCase(sortOrder)) {
            events.sort(Comparator.comparing(Event::getEventDate));
        } else if ("desc".equalsIgnoreCase(sortOrder)) {
            events.sort(Comparator.comparing(Event::getEventDate).reversed());
        } else {
            // Handle invalid sortOrder or default case
            // Assuming a default sorting behavior if sortOrder is not recognized
            events.sort(Comparator.comparing(Event::getEventDate)); // Default to ascending
        }

        return events.stream()
                .map(this::mapToEventDto)
                .collect(Collectors.toList());
    }


    private Event mapToEvent(EventDto eventDto) {
        Event event = Event.builder()
                .eventId(eventDto.getEventId())
                .eventName(eventDto.getEventName())
                .eventInfo(eventDto.getEventInfo())
                .eventPicture(eventDto.getEventPicture())
                .eventTicketNumber(eventDto.getEventTicketNumber())
                .eventDate(eventDto.getEventDate())
                .eventCategory(Event.EventCategory.valueOf(eventDto.getEventCategory().name()))
                .build();
        return event;
    }

    private EventDto mapToEventDto(Event event) {
        return EventDto.builder()
                .eventId(event.getEventId())
                .eventName(event.getEventName())
                .eventInfo(event.getEventInfo())
                .eventPicture(event.getEventPicture())
                .eventTicketNumber(event.getEventTicketNumber())
                .eventDate(event.getEventDate())
                .eventCategory(event.getEventCategory())
                .build();
    }
}
