
"""
MultiGrade Mitra — SQLAlchemy 2.x Models
PostgreSQL backend.
"""

from datetime import datetime, timezone
from enum import Enum as PyEnum
import uuid

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import declarative_base, relationship


Base = declarative_base()


def utc_now():
    return datetime.now(timezone.utc)


class UserRoleEnum(str, PyEnum):
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"


class EducationLevelEnum(str, PyEnum):
    CLASS12 = "class12"
    UNDERGRAD = "undergrad"
    BTECH = "btech"
    ADVANCED = "advanced"


class ResourceTypeEnum(str, PyEnum):
    NOTES = "notes"
    REVISION_SUMMARY = "revision_summary"
    FORMULA_SHEET = "formula_sheet"
    PRACTICE_QUESTIONS = "practice_questions"
    QUIZ = "quiz"
    WORKSHEET = "worksheet"
    LESSON_PLAN = "lesson_plan"
    ASSIGNMENT = "assignment"
    MULTIGRADE = "multigrade"


class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    role = Column(
        SAEnum(UserRoleEnum, name="user_role_enum", values_callable=lambda enum_cls: [e.value for e in enum_cls]),
        nullable=False,
        index=True,
    )
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )

    profile = relationship(
        "UserProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    resources = relationship(
        "LearningResource",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    documents = relationship(
        "UploadedDocument",
        back_populates="user",
        cascade="all, delete-orphan",
    )


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        String(64),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    education_level = Column(String(32))
    degree = Column(String(128))
    branch = Column(String(128))
    year_level = Column(String(64))
    semester = Column(String(64))
    institution = Column(String(255))
    preferred_language = Column(String(32), default="English", nullable=False)
    learning_style = Column(String(64), default="step-by-step", nullable=False)
    difficulty_preference = Column(String(32), default="intermediate", nullable=False)
    subjects_taught = Column(JSONB, default=list, nullable=False)

    user = relationship("User", back_populates="profile")


class LearningResource(Base):
    __tablename__ = "learning_resources"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(
        String(64),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = Column(String(512), nullable=False)
    subject = Column(String(255), nullable=False)
    topic = Column(String(255), nullable=False)
    education_level = Column(String(32), nullable=False, index=True)
    program = Column(String(128))
    branch = Column(String(128))
    semester = Column(String(64))
    resource_type = Column(String(64), nullable=False, index=True)
    content = Column(Text, nullable=False)
    structured_data = Column(JSONB)
    metadata_json = Column("metadata", JSONB, default=dict)
    is_reviewed_by_teacher = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )

    user = relationship("User", back_populates="resources")


class UploadedDocument(Base):
    __tablename__ = "uploaded_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        String(64),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    filename = Column(String(512), nullable=False)
    mime_type = Column(String(128), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    extracted_text = Column(Text)
    identified_subject = Column(String(255))
    identified_topic = Column(String(255))
    analysis_status = Column(String(32), default="pending", nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    user = relationship("User", back_populates="documents")