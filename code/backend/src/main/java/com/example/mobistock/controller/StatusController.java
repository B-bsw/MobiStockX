package com.example.mobistock.controller;

import java.util.Collections;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * StatusController
 */
@RestController
public class StatusController {

    @GetMapping("/health")
    public Map<String, String> status() {
        return Collections.singletonMap("status", "Ok");
    }
}
