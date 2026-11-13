package com.kidsminigame.settings;

import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {
    private final SettingsService service;

    public SettingsController(SettingsService service) {
        this.service = service;
    }

    @GetMapping
    public SettingsDto get(@RequestHeader(value = "X-Device-Id", required = false) String deviceId) {
        return service.get(parse(deviceId));
    }

    @PutMapping
    public SettingsDto put(@RequestHeader(value = "X-Device-Id", required = false) String deviceId,
                           @Valid @RequestBody SettingsDto body) {
        return service.save(parse(deviceId), body);
    }

    private static UUID parse(String raw) {
        if (raw == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "X-Device-Id required");
        try {
            return UUID.fromString(raw);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "X-Device-Id must be a UUID");
        }
    }
}
