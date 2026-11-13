package com.kidsminigame.settings;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;
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
    }

    @Autowired MockMvc mvc;

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
}
