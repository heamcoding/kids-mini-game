package com.kidsminigame.settings;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class SettingsControllerTest {

    @Container
    static PostgreSQLContainer<?> pg = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", pg::getJdbcUrl);
        r.add("spring.datasource.username", pg::getUsername);
        r.add("spring.datasource.password", pg::getPassword);
        r.add("cors.origins", () -> "https://app.example, https://b.example");
    }

    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;

    static String body(String age, int rounds, int voiceVol, String control) {
        return """
            {"age":%s,"scan":3,"touchTime":10,"control":"%s","voiceVol":%d,"fxVol":60,
             "rounds":%d,"rate":0.9,"pitch":1.5,"gap":0.6,"voiceName":""}
            """.formatted(age, control, voiceVol, rounds);
    }

    @Test
    void getReturnsDefaultsForUnknownDevice() throws Exception {
        mvc.perform(get("/api/settings").header("X-Device-Id", UUID.randomUUID().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rounds").value(5))
                .andExpect(jsonPath("$.age").doesNotExist())
                .andExpect(jsonPath("$.voiceVol").value(80));
    }

    @Test
    void getDoesNotCreateRows() throws Exception {
        Integer users = jdbc.queryForObject("select count(*) from users", Integer.class);
        Integer sets = jdbc.queryForObject("select count(*) from guardian_settings", Integer.class);
        UUID dev = UUID.randomUUID();
        mvc.perform(get("/api/settings").header("X-Device-Id", dev.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rounds").value(5));
        org.junit.jupiter.api.Assertions.assertEquals(users, jdbc.queryForObject("select count(*) from users", Integer.class));
        org.junit.jupiter.api.Assertions.assertEquals(sets, jdbc.queryForObject("select count(*) from guardian_settings", Integer.class));
    }

    @Test
    void putThenGetRoundTrips() throws Exception {
        String id = UUID.randomUUID().toString();
        mvc.perform(put("/api/settings").header("X-Device-Id", id)
                        .contentType(MediaType.APPLICATION_JSON).content(body("4", 7, 80, "both")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.age").value(4))
                .andExpect(jsonPath("$.rounds").value(7));
        mvc.perform(get("/api/settings").header("X-Device-Id", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.age").value(4))
                .andExpect(jsonPath("$.rounds").value(7));
        // second PUT updates the existing row
        mvc.perform(put("/api/settings").header("X-Device-Id", id)
                        .contentType(MediaType.APPLICATION_JSON).content(body("5", 2, 80, "touch")))
                .andExpect(status().isOk());
        mvc.perform(get("/api/settings").header("X-Device-Id", id))
                .andExpect(jsonPath("$.age").value(5))
                .andExpect(jsonPath("$.control").value("touch"));
    }

    @Test
    void putRejectsOutOfRange() throws Exception {
        String id = UUID.randomUUID().toString();
        String[] bad = {
            body("null", 0, 80, "both"),
            body("null", 5, 500, "both"),
            body("9", 5, 80, "both"),
            body("null", 5, 80, "x"),
        };
        for (String b : bad) {
            mvc.perform(put("/api/settings").header("X-Device-Id", id)
                            .contentType(MediaType.APPLICATION_JSON).content(b))
                    .andExpect(status().isBadRequest());
        }
    }

    @Test
    void missingOrBadDeviceIdIs400() throws Exception {
        mvc.perform(get("/api/settings")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/settings").header("X-Device-Id", "not-a-uuid")).andExpect(status().isBadRequest());
        mvc.perform(put("/api/settings").contentType(MediaType.APPLICATION_JSON).content(body("3", 5, 80, "both")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void twoDevicesAreIsolated() throws Exception {
        String a = UUID.randomUUID().toString(), b = UUID.randomUUID().toString();
        mvc.perform(put("/api/settings").header("X-Device-Id", a)
                .contentType(MediaType.APPLICATION_JSON).content(body("5", 9, 80, "both"))).andExpect(status().isOk());
        mvc.perform(get("/api/settings").header("X-Device-Id", b))
                .andExpect(jsonPath("$.rounds").value(5))
                .andExpect(jsonPath("$.age").doesNotExist());
    }

    @Test
    void concurrentFirstUseNeverFails() throws Exception {
        for (int round = 0; round < 5; round++) {
            UUID dev = UUID.randomUUID();
            int n = 16;
            ExecutorService ex = Executors.newFixedThreadPool(n);
            CyclicBarrier barrier = new CyclicBarrier(n);
            List<Future<Integer>> fs = new ArrayList<>();
            for (int i = 0; i < n; i++) {
                final boolean write = i % 2 == 0;
                fs.add(ex.submit(() -> {
                    barrier.await();
                    var req = write
                            ? put("/api/settings").contentType(MediaType.APPLICATION_JSON).content(body("4", 7, 80, "both"))
                            : get("/api/settings");
                    return mvc.perform(req.header("X-Device-Id", dev.toString())).andReturn().getResponse().getStatus();
                }));
            }
            for (Future<Integer> f : fs) org.junit.jupiter.api.Assertions.assertEquals(200, f.get(30, TimeUnit.SECONDS));
            ex.shutdown();
            org.junit.jupiter.api.Assertions.assertEquals(1,
                    jdbc.queryForObject("select count(*) from users where device_id = ?", Integer.class, dev));
            org.junit.jupiter.api.Assertions.assertEquals(1,
                    jdbc.queryForObject("select count(*) from guardian_settings g join users u on u.id=g.user_id where u.device_id = ?", Integer.class, dev));
        }
    }

    @Test
    void corsAllowsConfiguredOriginsOnly() throws Exception {
        for (String origin : new String[] {"https://app.example", "https://b.example"}) {
            mvc.perform(options("/api/settings")
                            .header("Origin", origin)
                            .header("Access-Control-Request-Method", "PUT"))
                    .andExpect(status().isOk())
                    .andExpect(header().string("Access-Control-Allow-Origin", origin));
        }
        mvc.perform(options("/api/settings")
                        .header("Origin", "https://evil.example")
                        .header("Access-Control-Request-Method", "PUT"))
                .andExpect(status().isForbidden());
    }
}
