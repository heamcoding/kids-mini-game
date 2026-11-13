from pydantic import BaseModel, Field


class RecordIn(BaseModel):
    game_id: str = Field(min_length=1)
    age: int | None = None
    duration_ms: int = Field(ge=0)
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
