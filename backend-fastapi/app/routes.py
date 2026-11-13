import uuid

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import PlayRecord
from app.schemas import GameStats, RecordCreated, RecordIn, Stats

router = APIRouter()


def device_id(x_device_id: str = Header()) -> uuid.UUID:
    try:
        return uuid.UUID(x_device_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="X-Device-Id must be a valid UUID")


@router.get("/health")
def health():
    return {"status": "ok"}


@router.post("/records", status_code=201, response_model=RecordCreated)
def create_record(body: RecordIn, dev: uuid.UUID = Depends(device_id), db: Session = Depends(get_db)):
    rec = PlayRecord(device_id=dev, **body.model_dump())
    db.add(rec)
    db.commit()
    return RecordCreated(id=rec.id)


@router.get("/stats", response_model=Stats)
def stats(dev: uuid.UUID = Depends(device_id), db: Session = Depends(get_db)):
    rows = db.execute(
        select(
            PlayRecord.game_id,
            func.count().label("plays"),
            func.sum(case((PlayRecord.completed, 1), else_=0)).label("completed"),
            func.avg(PlayRecord.duration_ms).label("avg"),
        )
        .where(PlayRecord.device_id == dev)
        .group_by(PlayRecord.game_id)
        .order_by(PlayRecord.game_id)
    ).all()
    by_game = [
        GameStats(game_id=r.game_id, plays=r.plays, completed=int(r.completed), avg_duration_ms=float(r.avg))
        for r in rows
    ]
    return Stats(total_plays=sum(g.plays for g in by_game), by_game=by_game)
