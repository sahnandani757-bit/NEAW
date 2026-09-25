from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import Base, SessionLocal, engine
from app.models import AdminUser
from app.auth import hash_password
from app.routers import (
    articles,
    auth,
    content_lists,
    home_sections,
    images,
    jobs,
    about_sections,
    opportunities,
    page_content,
    projects,
    settings as settings_router,
)

settings = get_settings()


def ensure_admin_user() -> None:
    """Creates the default admin account from env vars if none exists yet."""
    db = SessionLocal()
    try:
        if not db.query(AdminUser).filter(AdminUser.username == settings.admin_username).first():
            db.add(
                AdminUser(
                    username=settings.admin_username,
                    password_hash=hash_password(settings.admin_password),
                )
            )
            db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    ensure_admin_user()
    yield


app = FastAPI(
    title="NEAW Content API",
    description=(
        "Backend for the NEAW website: every editable piece of content — "
        "settings, page text, projects, opportunities, articles, job "
        "openings, and images — lives here. The Next.js frontend reads "
        "from this API; the admin panel writes to it."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(settings_router.router)
app.include_router(content_lists.router)
app.include_router(projects.router)
app.include_router(opportunities.router)
app.include_router(articles.router)
app.include_router(jobs.router)
app.include_router(images.router)
app.include_router(page_content.router)
app.include_router(home_sections.router)
app.include_router(about_sections.router)

@app.get("/")
def root():
    return {
        "service": "neaw-content-api",
        "docs": "/docs",
        "status": "ok",
    }


@app.get("/health")
def health():
    return {"status": "ok"}
