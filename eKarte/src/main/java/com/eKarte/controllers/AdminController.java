package com.eKarte.controllers;

import com.eKarte.dto.EventDto;
import com.eKarte.models.Event;
import com.eKarte.services.EventService;
import org.springframework.beans.propertyeditors.CustomDateEditor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

@Controller
@RequestMapping("/admin")
@CrossOrigin("*")
public class AdminController {

    private final EventService eventService;

    public AdminController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping("/")
    public String helloAdminController() {
        return "Admin dio";
    }

    @GetMapping("/dashboard")
    public String adminDashboard(Model model) {
        List<EventDto> events = eventService.findAllEvents();
        model.addAttribute("events", events);

        model.addAttribute("event", new Event());

        return "AdminDashboard";
    }

    @InitBinder
    public void initBinder(WebDataBinder binder) {
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        binder.registerCustomEditor(Date.class, new CustomDateEditor(dateFormat, true));
    }

    @PostMapping("/events")
    public String addEvent(Event event) {
        eventService.addEvent(event);
        return "redirect:/admin/dashboard";
    }


    @GetMapping("/createEvent")
    public String createEvent(Model model) {
        Event event = new Event();
        model.addAttribute("event", event);
        return "AdminAddEvent";
    }


    @GetMapping("/deleteEvent")
    public String deleteEvent(Model model) {
        List<EventDto> events = eventService.findAllEvents();
        model.addAttribute("events", events);
        return "AdminDeleteEvent";
    }

    @PostMapping("/deleteEvent/{eventId}")
    public String deleteEvent(@PathVariable Integer eventId) {
        eventService.deleteEventById(eventId);
        return "redirect:/admin/dashboard";
    }


    @GetMapping("/updateEvent")
    public String updateEvents(Model model){
        List<EventDto> events = eventService.findAllEvents();
        model.addAttribute("events", events);
        return "AdminUpdate";
    }

    @GetMapping("/updateEvent/{eventId}")
    public String editEventForm(@PathVariable("eventId") Integer eventId, Model model) {
        EventDto event = eventService.findEventById(eventId);
        model.addAttribute("event", event);
        return "AdminUpdateEvent";
    }

    @PostMapping("/updateEvent/{eventId}")
    public String updateEvent(@PathVariable("eventId") Integer eventId, @ModelAttribute("event") EventDto event) {
        event.setEventId(eventId);
        eventService.updateEvent(event);
        return "redirect:/admin/dashboard";
    }
}

