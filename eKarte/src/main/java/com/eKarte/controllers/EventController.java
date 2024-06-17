package com.eKarte.controllers;

import com.eKarte.dto.EventDto;
import com.eKarte.models.Event;
import com.eKarte.services.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Arrays;
import java.util.List;

@Controller
@RequestMapping("")
public class EventController {

    private final EventService eventService;

    @Autowired
    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping("/home")
    public String homePage(Model model) {
        List<EventDto> events = eventService.findAllEvents();
        if (events.isEmpty()) {
            System.out.println("No events found.");
        } else {
            System.out.println("Events found: " + events.size());
        }
        List<EventDto.EventCategory> eventCategories = Arrays.asList(EventDto.EventCategory.values());
        model.addAttribute("events", events);
        model.addAttribute("eventCategories", eventCategories);
        return "HomePage";
    }



    @GetMapping("/filterEvents")
    public String filterAndSortEvents(@RequestParam(required = false) String category,
                                      @RequestParam(required = false) String sortOrder,
                                      Model model) {
        System.out.println("Category: " + category + ", Sort Order: " + sortOrder);

        List<EventDto> events = eventService.getFilteredAndSortedEvents(category, sortOrder);
        System.out.println("Filtered Events: " + events); // Check what events are returned

        model.addAttribute("events", events);
        return "fragments/eventFragment :: eventCard";
    }


}
