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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

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
    public String homePage(Model model){
        List<EventDto> events = eventService.findAllEvents();
        model.addAttribute("events", events);

        return "HomePage";
    }


}
