package com.kidsminigame.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {
    @Id
    private UUID id;

    @Column(name = "device_id", nullable = false, unique = true)
    private UUID deviceId;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    protected User() {}

    public User(UUID id, UUID deviceId) {
        this.id = id;
        this.deviceId = deviceId;
    }

    public UUID getId() { return id; }
    public UUID getDeviceId() { return deviceId; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
