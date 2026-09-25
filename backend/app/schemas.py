from pydantic import BaseModel, ConfigDict


class ImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    filename: str
    content_type: str
    alt_text: str
    size_bytes: int
    url: str


def image_url(image_id: int | None) -> str | None:
    return f"/images/{image_id}/file" if image_id else None


class NamedItemBase(BaseModel):
    title: str
    description: str
    sort_order: int = 0


class NamedItemCreate(NamedItemBase):
    pass


class NamedItemOut(NamedItemBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    list_key: str | None = None


class ProjectBase(BaseModel):
    slug: str
    title: str
    location: str
    sector: str
    status: str
    description: str
    is_sample: bool = True
    show_on_home: bool = False
    sort_order: int = 0
    image_id: int | None = None


class ProjectCreate(ProjectBase):
    pass


class ProjectOut(ProjectBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    image_url: str | None = None


class OpportunityBase(BaseModel):
    category: str
    title: str
    description: str
    is_sample: bool = True
    sort_order: int = 0


class OpportunityCreate(OpportunityBase):
    pass


class OpportunityOut(OpportunityBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class ArticleBase(BaseModel):
    slug: str
    category: str
    title: str
    article_date: str
    description: str
    featured: bool = False
    show_on_home: bool = False
    is_sample: bool = True
    sort_order: int = 0
    image_id: int | None = None


class ArticleCreate(ArticleBase):
    pass


class ArticleOut(ArticleBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    image_url: str | None = None


class JobOpeningBase(BaseModel):
    slug: str
    title: str
    location: str
    employment_type: str
    summary: str
    is_open: bool = True
    sort_order: int = 0


class JobOpeningCreate(JobOpeningBase):
    pass


class JobOpeningOut(JobOpeningBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class SettingItem(BaseModel):
    key: str
    value: str


class PageContentBlockOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    page_slug: str
    block_key: str
    value: str
    image_id: int | None = None
    image_url: str | None = None


class PageContentBlockUpsert(BaseModel):
    page_slug: str
    block_key: str
    value: str
    image_id: int | None = None

class HomeSectionBase(BaseModel):
    section_key: str
    section_type: str

    eyebrow: str = ""
    title: str = ""
    description: str = ""
    content: str = ""

    image_id: int | None = None
    image_alt: str = ""

    enabled: bool = True
    sort_order: int = 0

    button_1_label: str = ""
    button_1_url: str = ""

    button_2_label: str = ""
    button_2_url: str = ""


class HomeSectionCreate(HomeSectionBase):
    pass


class HomeSectionOut(HomeSectionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    image_url: str | None = None


class AboutSectionBase(BaseModel):
    section_key: str
    section_type: str

    eyebrow: str = ""
    title: str = ""
    description: str = ""
    content: str = ""

    image_id: int | None = None
    image_alt: str = ""

    enabled: bool = True
    sort_order: int = 0

    button_1_label: str = ""
    button_1_url: str = ""

    button_2_label: str = ""
    button_2_url: str = ""


class AboutSectionCreate(AboutSectionBase):
    pass


class AboutSectionOut(AboutSectionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    image_url: str | None = None


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
