package com.kidsminigame.settings;

import com.kidsminigame.user.User;
import com.kidsminigame.user.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SettingsService {
    private final UserRepository users;
    private final SettingsRepository settings;
    private final ObjectMapper mapper;

    public SettingsService(UserRepository users, SettingsRepository settings, ObjectMapper mapper) {
        this.mapper = mapper;
        this.users = users;
        this.settings = settings;
    }

    /** Pure lookup: never creates a user or settings row. */
    @Transactional(readOnly = true)
    public SettingsDto get(UUID deviceId) {
        return users.findByDeviceId(deviceId)
                .flatMap(u -> settings.findById(u.getId()))
                .map(GuardianSettings::getData)
                .orElseGet(SettingsDto::defaults);
    }

    @Transactional
    public SettingsDto save(UUID deviceId, SettingsDto dto) {
        User user = upsertUser(deviceId);
        try {
            settings.upsert(user.getId(), mapper.writeValueAsString(dto));
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(e);
        }
        return dto;
    }

    private User upsertUser(UUID deviceId) {
        users.insertIfAbsent(UUID.randomUUID(), deviceId);
        return users.findByDeviceId(deviceId).orElseThrow();
    }
}
