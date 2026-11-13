import uuid

DEV_A = str(uuid.uuid4())
DEV_B = str(uuid.uuid4())


def post(client, device, game_id, completed=True, duration_ms=1000, age=5):
    return client.post(
        "/records",
        headers={"X-Device-Id": device},
        json={"game_id": game_id, "age": age, "duration_ms": duration_ms, "completed": completed},
    )


def test_post_then_stats_counts_per_game(client):
    r = post(client, DEV_A, "fruit", completed=True, duration_ms=1000)
    assert r.status_code == 201
    assert "id" in r.json()
    post(client, DEV_A, "fruit", completed=False, duration_ms=3000)
    post(client, DEV_A, "mole")

    body = client.get("/stats", headers={"X-Device-Id": DEV_A}).json()
    assert body["total_plays"] == 3
    by_game = {g["game_id"]: g for g in body["by_game"]}
    assert by_game["fruit"]["plays"] == 2
    assert by_game["fruit"]["completed"] == 1
    assert by_game["fruit"]["avg_duration_ms"] == 2000
    assert by_game["mole"]["plays"] == 1


def test_stats_isolated_per_device(client):
    post(client, DEV_A, "fruit")
    body = client.get("/stats", headers={"X-Device-Id": DEV_B}).json()
    assert body == {"total_plays": 0, "by_game": []}


def test_negative_duration_is_422(client):
    assert post(client, DEV_A, "fruit", duration_ms=-1).status_code == 422


def test_bad_device_id_is_400(client):
    assert post(client, "not-a-uuid", "fruit").status_code == 400
    assert client.get("/stats", headers={"X-Device-Id": "nope"}).status_code == 400


def test_health(client):
    assert client.get("/health").json() == {"status": "ok"}


def test_cors_allows_dev_origin(client):
    r = client.options(
        "/stats",
        headers={"Origin": "http://localhost:5173", "Access-Control-Request-Method": "GET",
                 "Access-Control-Request-Headers": "x-device-id"},
    )
    assert r.headers["access-control-allow-origin"] == "http://localhost:5173"
