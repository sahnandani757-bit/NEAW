from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    LargeBinary,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class AdminUser(Base):
    """Single (or few) admin account(s) that can sign in to the admin panel."""

    __tablename__ = "admin_users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Image(Base):
    """
    Images are stored directly in Postgres as bytes, per the requirement
    that image data lives in the database rather than on disk/S3. Served
    back out through GET /images/{id}, which streams the bytes with the
    stored content type.
    """

    __tablename__ = "images"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    filename: Mapped[str] = mapped_column(String(255))
    content_type: Mapped[str] = mapped_column(String(100))
    alt_text: Mapped[str] = mapped_column(String(255), default="")
    data: Mapped[bytes] = mapped_column(LargeBinary)
    size_bytes: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Setting(Base):
    """Global site settings: company info, contact details, social links."""

    __tablename__ = "settings"

    key: Mapped[str] = mapped_column(String(100), primary_key=True)
    value: Mapped[str] = mapped_column(Text, default="")


class PageContentBlock(Base):
    """
    Generic, freeform content editing: any heading/paragraph on any page
    can be represented as a (page_slug, block_key) pair here and edited
    from the admin panel's "Page Content" screen without a schema change.
    Structured, repeatable content (projects, jobs, etc.) uses its own
    tables below instead, since those need list semantics (add/remove/
    reorder), not just a single editable value.
    """

    __tablename__ = "page_content_blocks"
    __table_args__ = (UniqueConstraint("page_slug", "block_key"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    page_slug: Mapped[str] = mapped_column(String(100), index=True)
    block_key: Mapped[str] = mapped_column(String(100))
    value: Mapped[str] = mapped_column(Text, default="")
    image_id: Mapped[int | None] = mapped_column(ForeignKey("images.id"), nullable=True)
    image: Mapped["Image | None"] = relationship()

class HomeSection(Base):
    """
    Controls the structure and content of the Home page.

    Each row represents one controlled section of the Home page.
    Admin can enable/disable, edit content, change images, buttons,
    and reorder sections without changing frontend code.
    """

    __tablename__ = "home_sections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # Unique internal identifier, e.g. "hero", "introduction", "projects"
    section_key: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
    )

    # Controlled frontend section type:
    # hero, image_text, cards, projects, split_cta, articles, cta
    section_type: Mapped[str] = mapped_column(String(50))

    # Main section content
    eyebrow: Mapped[str] = mapped_column(String(200), default="")
    title: Mapped[str] = mapped_column(String(500), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    content: Mapped[str] = mapped_column(Text, default="")

    # Optional section image
    image_id: Mapped[int | None] = mapped_column(
        ForeignKey("images.id"),
        nullable=True,
    )
    image_alt: Mapped[str] = mapped_column(String(255), default="")
    image: Mapped["Image | None"] = relationship()

    # Section visibility and order
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    # Optional buttons
    button_1_label: Mapped[str] = mapped_column(String(200), default="")
    button_1_url: Mapped[str] = mapped_column(String(500), default="")

    button_2_label: Mapped[str] = mapped_column(String(200), default="")
    button_2_url: Mapped[str] = mapped_column(String(500), default="")




class AboutSection(Base):
    """
    Controls the structure and content of the About page.

    Each row represents one controlled section of the About page.
    Admin can enable/disable, edit content, change images,
    buttons, and reorder sections without changing frontend code.
    """

    __tablename__ = "about_sections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # Unique internal identifier, e.g. "hero", "introduction", "mission"
    section_key: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
    )

    # Controlled frontend section type:
    # hero, image_text, mission, vision, cards, cta
    section_type: Mapped[str] = mapped_column(String(50))

    # Main section content
    eyebrow: Mapped[str] = mapped_column(String(200), default="")
    title: Mapped[str] = mapped_column(String(500), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    content: Mapped[str] = mapped_column(Text, default="")

    # Optional section image
    image_id: Mapped[int | None] = mapped_column(
        ForeignKey("images.id"),
        nullable=True,
    )
    image_alt: Mapped[str] = mapped_column(String(255), default="")
    image: Mapped["Image | None"] = relationship()

    # Section visibility and order
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    # Optional buttons
    button_1_label: Mapped[str] = mapped_column(String(200), default="")
    button_1_url: Mapped[str] = mapped_column(String(500), default="")

    button_2_label: Mapped[str] = mapped_column(String(200), default="")
    button_2_url: Mapped[str] = mapped_column(String(500), default="")


    
class ContentListItem(Base):
    """
    Generic repeatable (title, description) item, grouped by `list_key`.
    This single table backs Focus Areas (list_key="focus_areas"), Core
    Values ("core_values"), Partnership Types ("partnership_types"),
    Career Reasons ("career_reasons"), Privacy Policy sections
    ("privacy_sections" — title + body text), and any future simple list
    an admin wants to add — a brand new section on a page needs a new
    list_key value, not a new table or a backend code change.
    """

    __tablename__ = "content_list_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    list_key: Mapped[str] = mapped_column(String(100), index=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    title: Mapped[str] = mapped_column(String(300))
    description: Mapped[str] = mapped_column(Text)


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(200))
    location: Mapped[str] = mapped_column(String(200))
    sector: Mapped[str] = mapped_column(String(100))
    status: Mapped[str] = mapped_column(String(50), default="Concept")
    description: Mapped[str] = mapped_column(Text)
    is_sample: Mapped[bool] = mapped_column(Boolean, default=True)

    show_on_home: Mapped[bool] = mapped_column(Boolean, default=False)

    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    image_id: Mapped[int | None] = mapped_column(ForeignKey("images.id"), nullable=True)
    image: Mapped["Image | None"] = relationship()




class Opportunity(Base):
    __tablename__ = "opportunities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    category: Mapped[str] = mapped_column(String(100))
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)
    is_sample: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

class Article(Base):
    __tablename__ = "articles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    category: Mapped[str] = mapped_column(String(100))
    title: Mapped[str] = mapped_column(String(300))
    article_date: Mapped[str] = mapped_column(String(50))
    description: Mapped[str] = mapped_column(Text)

    # Featured article shown at the top of the Insights page
    featured: Mapped[bool] = mapped_column(Boolean, default=False)

    # Controls whether this article appears in the Home page Insights section
    show_on_home: Mapped[bool] = mapped_column(Boolean, default=False)

    is_sample: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    image_id: Mapped[int | None] = mapped_column(
        ForeignKey("images.id"),
        nullable=True,
    )
    image: Mapped["Image | None"] = relationship()

class JobOpening(Base):
    __tablename__ = "job_openings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(200))
    location: Mapped[str] = mapped_column(String(200))
    employment_type: Mapped[str] = mapped_column(String(100))
    summary: Mapped[str] = mapped_column(Text)
    is_open: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
