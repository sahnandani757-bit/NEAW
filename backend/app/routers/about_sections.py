from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AboutSection
from app.schemas import AboutSectionCreate, AboutSectionOut, image_url

router = APIRouter(
    prefix="/about-sections",
    tags=["about-sections"],
)


def to_out(section: AboutSection) -> AboutSectionOut:
    return AboutSectionOut(
        id=section.id,
        section_key=section.section_key,
        section_type=section.section_type,
        eyebrow=section.eyebrow,
        title=section.title,
        description=section.description,
        content=section.content,
        image_id=section.image_id,
        image_alt=section.image_alt,
        enabled=section.enabled,
        sort_order=section.sort_order,
        button_1_label=section.button_1_label,
        button_1_url=section.button_1_url,
        button_2_label=section.button_2_label,
        button_2_url=section.button_2_url,
        image_url=image_url(section.image_id),
    )


@router.get("", response_model=list[AboutSectionOut])
def get_about_sections(db: Session = Depends(get_db)):
    sections = db.scalars(
        select(AboutSection).order_by(
            AboutSection.sort_order,
            AboutSection.id,
        )
    ).all()

    return [to_out(section) for section in sections]


@router.post("", response_model=AboutSectionOut)
def create_about_section(
    payload: AboutSectionCreate,
    db: Session = Depends(get_db),
):
    existing = db.scalar(
        select(AboutSection).where(
            AboutSection.section_key == payload.section_key
        )
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="An About section with this section_key already exists.",
        )

    section = AboutSection(**payload.model_dump())

    db.add(section)
    db.commit()
    db.refresh(section)

    return to_out(section)


@router.put("/{section_id}", response_model=AboutSectionOut)
def update_about_section(
    section_id: int,
    payload: AboutSectionCreate,
    db: Session = Depends(get_db),
):
    section = db.get(AboutSection, section_id)

    if not section:
        raise HTTPException(
            status_code=404,
            detail="About section not found.",
        )

    duplicate = db.scalar(
        select(AboutSection).where(
            AboutSection.section_key == payload.section_key,
            AboutSection.id != section_id,
        )
    )

    if duplicate:
        raise HTTPException(
            status_code=409,
            detail="An About section with this section_key already exists.",
        )

    for key, value in payload.model_dump().items():
        setattr(section, key, value)

    db.commit()
    db.refresh(section)

    return to_out(section)


@router.delete("/{section_id}")
def delete_about_section(
    section_id: int,
    db: Session = Depends(get_db),
):
    section = db.get(AboutSection, section_id)

    if not section:
        raise HTTPException(
            status_code=404,
            detail="About section not found.",
        )

    db.delete(section)
    db.commit()

    return {
        "message": "About section deleted successfully."
    }