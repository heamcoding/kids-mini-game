package com.kidsminigame.settings;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SettingsRepository extends JpaRepository<GuardianSettings, UUID> {
    /** Atomic upsert; safe under concurrent first PUT for the same user. */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query(value = "INSERT INTO guardian_settings (user_id, data, updated_at) VALUES (:userId, CAST(:json AS jsonb), now()) "
            + "ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()",
            nativeQuery = true)
    void upsert(@Param("userId") UUID userId, @Param("json") String json);
}
