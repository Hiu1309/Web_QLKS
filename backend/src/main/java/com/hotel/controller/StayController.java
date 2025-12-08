package com.hotel.controller;

import com.hotel.model.Stay;
import com.hotel.service.StayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/stays")
@CrossOrigin(origins = "*")
public class StayController {
    @Autowired
    private StayService stayService;

    @GetMapping("/guest/{guestId}")
    public List<Stay> getStaysByGuestId(@PathVariable Integer guestId) {
        return stayService.getStaysByGuestId(guestId);
    }
}
