from pydantic import BaseModel, Field


class RecordIn(BaseModel):
    game_id: str = Field(pattern=r'^[a-z]{1,16}$')
    age: int | None = Field(None, ge=3, le=5)
    duration_ms: int = Field(ge=0, le=2_147_483_647)
    completed: bool


class RecordCreated(BaseModel):
    id: int


class GameStats(BaseModel):
    game_id: str
    plays: int
    completed: int
    avg_duration_ms: float


class Stats(BaseModel):
    total_plays: int
    by_game: list[GameStats]
