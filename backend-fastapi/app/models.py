import uuid
from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, Integer, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class PlayRecord(Base):
    """Mirrors play_records from Spring's Flyway V1__init.sql (schema owned by Spring)."""

    __tablename__ = "play_records"

    id: Mapped[int] = mapped_column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True)
    device_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False, index=True)
    game_id: Mapped[str] = mapped_column(Text, nullable=False)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    duration_ms: Mapped[int] = mapped_column(Integer, nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, nullable=False)
    played_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
