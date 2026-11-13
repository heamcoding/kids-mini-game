package com.kidsminigame.settings;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SettingsRepository extends JpaRepository<GuardianSettings, UUID> {}
