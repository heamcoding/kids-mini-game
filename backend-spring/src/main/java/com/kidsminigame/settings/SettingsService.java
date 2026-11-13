package com.kidsminigame.settings;

import com.kidsminigame.user.User;
import com.kidsminigame.user.UserRepository;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SettingsService {
    private final UserRepository users;
    private final SettingsRepository settings;

    public SettingsService(UserRepository users, SettingsRepository settings) {
        this.users = users;
        this.settings = settings;
    }

    @Transactional
    public SettingsDto get(UUID deviceId) {
        User user = upsertUser(deviceId);
        return settings.findById(user.getId()).map(GuardianSettings::getData).orElseGet(SettingsDto::defaults);
    }

    @Transactional
    public SettingsDto save(UUID deviceId, SettingsDto dto) {
        User user = upsertUser(deviceId);
        settings.findById(user.getId()).ifPresentOrElse(
                s -> s.update(dto),
                () -> settings.save(new GuardianSettings(user.getId(), dto)));
        return dto;
    }

    private User upsertUser(UUID deviceId) {
        return users.findByDeviceId(deviceId)
                .orElseGet(() -> users.save(new User(UUID.randomUUID(), deviceId)));
    }
}
