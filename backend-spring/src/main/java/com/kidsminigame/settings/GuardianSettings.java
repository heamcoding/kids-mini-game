package com.kidsminigame.settings;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "guardian_settings")
public class GuardianSettings {
    @Id
    @Column(name = "user_id")
    private UUID userId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "data", nullable = false, columnDefinition = "jsonb")
    private SettingsDto data;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    protected GuardianSettings() {}

    public GuardianSettings(UUID userId, SettingsDto data) {
        this.userId = userId;
        this.data = data;
    }

    public SettingsDto getData() { return data; }

    public void update(SettingsDto data) {
        this.data = data;
        this.updatedAt = OffsetDateTime.now();
    }
}
