package com.kidsminigame.settings;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Ranges come from the slider min/max in the original openSettings(). */
public record SettingsDto(
        @Min(3) @Max(5) Integer age,
        @DecimalMin("1.0") @DecimalMax("5.0") double scan,
        @DecimalMin("5.0") @DecimalMax("30.0") double touchTime,
        @NotNull @Pattern(regexp = "both|touch|space") String control,
        @Min(0) @Max(100) int voiceVol,
        @Min(0) @Max(100) int fxVol,
        @Min(1) @Max(10) int rounds,
        @DecimalMin("0.5") @DecimalMax("1.3") double rate,
        @DecimalMin("0.6") @DecimalMax("1.8") double pitch,
        @DecimalMin("0.0") @DecimalMax("2.0") double gap,
        @NotNull @Size(max = 200) String voiceName) {

    public static SettingsDto defaults() {
        return new SettingsDto(null, 3, 10, "both", 80, 60, 5, 0.9, 1.5, 0.6, "");
    }
}
