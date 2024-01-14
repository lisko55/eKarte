package com.eKarte.dto;

import com.eKarte.models.Event;
import jakarta.persistence.Column;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;

@Builder
@Data
public class EventDto {
    private Integer eventId;
    private String eventName;
    private String  eventDate;
    private String eventInfo;
    private String eventPicture;
    private Integer eventTicketNumber;
    public enum EventCategory{
        KONCERT, SPORT, FESTIVAL, POZORIŠTE,
    }
    private EventCategory eventCategory;
    private LocalDateTime eventCreateTime;
    private LocalDateTime eventUpdateTime;
}
