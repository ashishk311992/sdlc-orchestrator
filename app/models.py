"""Persistent domain model: Run = one attempt to ship a Linear issue."""
from __future__ import annotations
import enum
import uuid
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, Enum, ForeignKey, JSON, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db import Base


class RunStatus(str, enum.Enum):
    INTAKE = "INTAKE"
    DEV = "DEV"
    QA = "QA"
    REVIEW = "REVIEW"
    CI = "CI"
    HEAL = "HEAL"
    DONE = "DONE"
    BLOCKED = "BLOCKED"
    FAILED = "FAILED"


def _uuid() -> str:
    return str(uuid.uuid4())


class Run(Base):
    __tablename__ = "runs"
    __table_args__ = (
        UniqueConstraint("issue_id", "issue_updated_at", name="uq_idempotency"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    issue_id: Mapped[str] = mapped_column(String(64), index=True)
    issue_identifier: Mapped[str] = mapped_column(String(32))
    issue_updated_at: Mapped[str] = mapped_column(String(64))
    title: Mapped[str] = mapped_column(String(512))
    description: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[RunStatus] = mapped_column(Enum(RunStatus), default=RunStatus.INTAKE)
    branch: Mapped[str | None] = mapped_column(String(255), nullable=True)
    pr_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    heal_attempts: Mapped[int] = mapped_column(Integer, default=0)
    context: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    events: Mapped[list["RunEvent"]] = relationship(back_populates="run", cascade="all,delete-orphan")


class RunEvent(Base):
    __tablename__ = "run_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    run_id: Mapped[str] = mapped_column(ForeignKey("runs.id", ondelete="CASCADE"), index=True)
    stage: Mapped[str] = mapped_column(String(32))
    level: Mapped[str] = mapped_column(String(16), default="info")
    message: Mapped[str] = mapped_column(Text)
    payload: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    run: Mapped[Run] = relationship(back_populates="events")
