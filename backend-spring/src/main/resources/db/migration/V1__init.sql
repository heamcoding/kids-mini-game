CREATE TABLE users (
    id uuid PRIMARY KEY,
    device_id uuid UNIQUE NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE guardian_settings (
    user_id uuid PRIMARY KEY REFERENCES users(id),
    data jsonb NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE play_records (
    id bigserial PRIMARY KEY,
    device_id uuid NOT NULL,
    game_id text NOT NULL,
    age int,
    duration_ms int NOT NULL,
    completed boolean NOT NULL,
    played_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_play_records_device_id ON play_records(device_id);
