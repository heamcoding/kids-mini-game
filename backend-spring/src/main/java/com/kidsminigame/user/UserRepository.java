package com.kidsminigame.user;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByDeviceId(UUID deviceId);

    /** Atomic insert-if-absent; safe under concurrent first use of the same device. */
    @Modifying
    @Query(value = "INSERT INTO users (id, device_id) VALUES (:id, :deviceId) ON CONFLICT (device_id) DO NOTHING",
            nativeQuery = true)
    void insertIfAbsent(@Param("id") UUID id, @Param("deviceId") UUID deviceId);
}
