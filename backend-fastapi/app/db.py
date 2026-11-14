import os

from sqlalchemy import StaticPool, create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker


def _default_url() -> str:
    user = os.environ.get("DB_USER", "")
    password = os.environ.get("DB_PASSWORD", "")
    return f"postgresql+psycopg://{user}:{password}@localhost:5432/kidsminigame"


DATABASE_URL = os.environ.get("DATABASE_URL") or _default_url()

_kwargs = {}
if DATABASE_URL.startswith("sqlite"):
    _kwargs = {"connect_args": {"check_same_thread": False}, "poolclass": StaticPool}

engine = create_engine(DATABASE_URL, **_kwargs)
SessionLocal = sessionmaker(bind=engine, autoflush=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
