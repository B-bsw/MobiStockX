package com.example.mobistock.controller;

import java.util.Collections;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class WelcomeController {

    @GetMapping("")
    public Map<String, String> welcome() {
        return Collections.singletonMap(
            "message",
            "REST API for managing mobile-phone inventory, customers, and sales."
        );
    }
}
