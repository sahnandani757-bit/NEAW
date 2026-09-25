"""
Seed the database with the content already live on the NEAW site, so
switching the frontend from hardcoded arrays to this API does not change
what a visitor sees. Safe to re-run: skips anything that already exists.

Usage (from backend/):
    .venv/bin/python -m app.seed
"""
import mimetypes
import pathlib

from app.auth import hash_password
from app.config import get_settings
from app.database import Base, SessionLocal, engine
from app.models import (
    AdminUser,
    Article,
    AboutSection,
    ContentListItem,
    HomeSection,
    Image,
    JobOpening,
    Opportunity,
    PageContentBlock,
    Project,
    Setting,
)

settings = get_settings()

# Adjust this if your frontend folder lives somewhere else relative to backend/.
FRONTEND_IMAGES_DIR = pathlib.Path(__file__).resolve().parents[2] / "frontend" / "public" / "images"


def slugify(text: str) -> str:
    import re

    text = text.lower().strip().replace("&", "and")
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def get_or_create_image(db, filename: str, alt_text: str) -> "Image | None":
    """Loads an image file from the frontend's public/images folder into Postgres."""
    path = FRONTEND_IMAGES_DIR / filename
    if not path.exists():
        print(f"  (skipping image, not found: {path})")
        return None
    existing = db.query(Image).filter(Image.filename == filename).first()
    if existing:
        return existing
    content_type = mimetypes.guess_type(filename)[0] or "application/octet-stream"
    data = path.read_bytes()
    image = Image(
        filename=filename,
        content_type=content_type,
        alt_text=alt_text,
        data=data,
        size_bytes=len(data),
    )
    db.add(image)
    db.commit()
    db.refresh(image)
    return image


def seed_settings(db):
    values = {
        "name": "Nepal Energy and Water Resources Pvt. Ltd.",
        "shortName": "NEAW",
        "tagline": "Sustainable solutions for a brighter Nepal",
        "email": "info@nepalenergywater.com",
        "phone": "+977 9801025886",
        "location": "Kathmandu, Nepal",
        "website": "www.nepalenergywater.com",
        "linkedin": "https://linkedin.com/company/nepalenergywater",
        "facebook": "https://facebook.com/nepalenergywater",
    }
    for key, value in values.items():
        if not db.get(Setting, key):
            db.add(Setting(key=key, value=value))
    db.commit()
    print(f"Settings: {len(values)} keys ensured")


def seed_list(db, list_key: str, items: list[tuple[str, str]]):
    existing = db.query(ContentListItem).filter(ContentListItem.list_key == list_key).count()
    if existing:
        print(f"Lists[{list_key}]: already has {existing} items, skipping")
        return
    for i, (title, description) in enumerate(items):
        db.add(ContentListItem(list_key=list_key, sort_order=i, title=title, description=description))
    db.commit()
    print(f"Lists[{list_key}]: added {len(items)} items")


def seed_projects(db):
    if db.query(Project).count():
        print("Projects: already seeded, skipping")
        return

    cxk33 = get_or_create_image(db, "Gemini_Generated_Image_cxk33lcxk33lcxk3.jpg", "Renewable energy development")
    yexo4j = get_or_create_image(db, "Gemini_Generated_Image_yexo4jyexo4jyexo.jpg", "Water resources development")

    projects = [
        (
            "Renewable Energy Development", "Nepal", "Energy", "Concept",
            "Exploring opportunities to support the development of renewable energy projects that can contribute to Nepal's growing energy demand and long-term sustainable development.",
            cxk33,
        ),
        (
            "Water Resources Development", "Nepal", "Water Resources", "Development",
            "Supporting the identification and development of opportunities within Nepal's water resources sector, with a focus on responsible use of natural resources and long-term value creation.",
            yexo4j,
        ),
        (
            "Clean Energy Opportunities", "Nepal", "Energy", "Concept",
            "Assessing potential clean energy opportunities and working with partners to explore technically and commercially viable projects across Nepal.",
            None,
        ),
        (
            "Hydropower Development", "Nepal", "Water Resources", "Under Construction",
            "Supporting project development activities in the hydropower sector, bringing together local knowledge, technical expertise, and stakeholder collaboration.",
            None,
        ),
        (
            "Sustainable Energy Infrastructure", "Nepal", "Energy", "Concept",
            "Exploring infrastructure opportunities that can strengthen Nepal's energy ecosystem while supporting reliable, sustainable, and long-term economic development.",
            None,
        ),
        (
            "Water & Energy Infrastructure", "Nepal", "Water Resources", "Operational",
            "Working across water and energy-related opportunities to support efficient resource development, responsible infrastructure, and sustainable outcomes for communities and stakeholders.",
            None,
        ),
    ]
    for i, (title, location, sector, status, description, image) in enumerate(projects):
        db.add(
            Project(
                slug=slugify(title),
                title=title,
                location=location,
                sector=sector,
                status=status,
                description=description,
                is_sample=False,
                sort_order=i,
                image_id=image.id if image else None,
            )
        )
    db.commit()
    print(f"Projects: added {len(projects)}")


def seed_opportunities(db):
    if db.query(Opportunity).count():
        print("Opportunities: already seeded, skipping")
        return
    items = [
        ("Investment", "Investment Opportunities", "[Placeholder — specific investment opportunities will be listed here as they become available.]"),
        ("Projects", "Project Opportunities", "[Placeholder — specific project opportunities will be listed here as they become available.]"),
        ("Partnerships", "Partnership Opportunities", "[Placeholder — specific partnership opportunities will be listed here as they become available.]"),
        ("Development", "Development Opportunities", "[Placeholder — specific development opportunities will be listed here as they become available.]"),
    ]
    for i, (category, title, description) in enumerate(items):
        db.add(Opportunity(category=category, title=title, description=description, is_sample=True, sort_order=i))
    db.commit()
    print(f"Opportunities: added {len(items)}")


def seed_articles(db):
    if db.query(Article).count():
        print("Articles: already seeded, skipping")
        return
    items = [
        ("Energy", "Nepal's renewable energy opportunity", "September 2026",
         "An overview of the opportunities and considerations shaping Nepal's transition towards a more sustainable and resilient energy system.", True, False),
        ("Water Resources", "Unlocking the potential of Nepal's water resources", "September 2026",
         "Understanding the importance of responsible water resource development and the role of collaboration in creating long-term value.", False, False),
        ("[Category]", "[Insight or news headline placeholder]", "[Date]",
         "[Placeholder summary — real content to be supplied.]", False, True),
        ("[Category]", "[Insight or news headline placeholder]", "[Date]",
         "[Placeholder summary — real content to be supplied.]", False, True),
    ]
    for i, (category, title, date, description, featured, is_sample) in enumerate(items):
        db.add(
            Article(
                slug=f"{slugify(title) or 'article'}-{i}",
                category=category,
                title=title,
                article_date=date,
                description=description,
                featured=featured,
                is_sample=is_sample,
                sort_order=i,
            )
        )
    db.commit()
    print(f"Articles: added {len(items)}")


def seed_jobs(db):
    if db.query(JobOpening).count():
        print("Job openings: already seeded, skipping")
        return
    items = [
        ("Business Head", "Kathmandu, Nepal", "[Employment type]"),
        ("Venture Lead", "Kathmandu, Nepal", "[Employment type]"),
    ]
    for i, (title, location, employment_type) in enumerate(items):
        db.add(
            JobOpening(
                slug=slugify(title),
                title=title,
                location=location,
                employment_type=employment_type,
                summary="Recruitment details for this role will be added as they are finalised.",
                is_open=True,
                sort_order=i,
            )
        )
    db.commit()
    print(f"Job openings: added {len(items)}")


def seed_page_content(db):
    """
    A handful of the highest-traffic hero/intro blocks, wired through the
    generic page-content system as a working example. Everything here
    matches the current site copy exactly — nothing visible changes.
    """
    if db.query(PageContentBlock).count():
        print("Page content: already seeded, skipping")
        return

    blocks = [
        ("home", "hero_title", "Let's explore opportunities for Nepal's future"),
        ("home", "hero_description", "Whether you are exploring a project, investment opportunity, technical collaboration, or strategic partnership, we welcome the opportunity to connect."),
        ("home", "intro_eyebrow", "About NEWRPL"),
        ("home", "intro_title", "Exploring Opportunities. Building Possibilities."),
        ("home", "intro_paragraph_1", "Nepal Energy and Water Resources Pvt. Ltd. works across Nepal's energy and water resources sectors, exploring opportunities that support sustainable economic growth and infrastructure development."),
        ("home", "intro_paragraph_2", "Our approach combines local understanding with technical capabilities and collaborative partnerships to identify, develop, and support opportunities with long-term potential."),
        ("about", "hero_title", "[Company overview heading placeholder]"),
        ("about", "hero_description", "[Placeholder — a short overview paragraph introducing Nepal Energy and Water Resources Pvt. Ltd. will be supplied and placed here.]"),
        ("contact", "hero_title", "Let's start a conversation"),
        ("contact", "hero_description", "Whether it's a project, a partnership, or a general enquiry, our team would like to hear from you."),
    ]
    for page_slug, block_key, value in blocks:
        db.add(PageContentBlock(page_slug=page_slug, block_key=block_key, value=value))
    db.commit()
    print(f"Page content: added {len(blocks)} blocks")


def seed_home_sections(db):
    """
    Seeds the Home page structure using the current live Home page content.

    The Home page will eventually be rendered from these records, while
    existing projects, articles, focus areas, etc. remain in their own
    tables as the source of truth.
    """
    if db.query(HomeSection).count():
        print("Home sections: already seeded, skipping")
        return

    sections = [
        {
            "section_key": "hero",
            "section_type": "hero",
            "eyebrow": "",
            "title": "Let's explore opportunities for Nepal's future",
            "description": (
                "Whether you are exploring a project, investment opportunity, "
                "technical collaboration, or strategic partnership, we welcome "
                "the opportunity to connect."
            ),
            "content": "",
            "image_id": None,
            "image_alt": "",
            "enabled": True,
            "sort_order": 1,
            "button_1_label": "Explore what we do",
            "button_1_url": "/what-we-do",
            "button_2_label": "Discuss a partnership",
            "button_2_url": "/partnerships",
        },
        {
            "section_key": "introduction",
            "section_type": "image_text",
            "eyebrow": "About NEWRPL",
            "title": "Exploring Opportunities. Building Possibilities.",
            "description": "",
            "content": (
                "Our approach combines local understanding with technical "
                "capabilities and collaborative partnerships to identify, "
                "develop, and support opportunities with long-term potential."
            ),
            "image_id": None,
            "image_alt": "Hydropower and water resources in Nepal",
            "enabled": True,
            "sort_order": 2,
            "button_1_label": "Learn more about us",
            "button_1_url": "/about",
            "button_2_label": "",
            "button_2_url": "",
        },
        {
            "section_key": "focus",
            "section_type": "cards",
            "eyebrow": "Areas of Focus",
            "title": "Where we work",
            "description": (
                "Our work focuses on sectors that are central to Nepal’s "
                "infrastructure, economic development, and long-term "
                "sustainability. We explore opportunities where technical "
                "understanding, responsible development, investment, and "
                "collaboration can contribute to meaningful and sustainable "
                "outcomes."
            ),
            "content": "",
            "image_id": None,
            "image_alt": "",
            "enabled": True,
            "sort_order": 3,
            "button_1_label": "",
            "button_1_url": "",
            "button_2_label": "",
            "button_2_url": "",
        },
        {
            "section_key": "projects",
            "section_type": "projects",
            "eyebrow": "Projects",
            "title": "Exploring opportunities across Nepal",
            "description": (
                "Our project pipeline covers opportunities across energy and "
                "water resources, from early-stage concepts through "
                "development and implementation."
            ),
            "content": "",
            "image_id": None,
            "image_alt": "",
            "enabled": True,
            "sort_order": 4,
            "button_1_label": "View all projects",
            "button_1_url": "/projects",
            "button_2_label": "",
            "button_2_url": "",
        },
        {
            "section_key": "partnerships",
            "section_type": "image_text",
            "eyebrow": "Partnerships",
            "title": "Strong partnerships create stronger outcomes",
            "description": "",
            "content": (
                "We believe successful projects are built through collaboration. "
                "We work with investors, technical organisations, government "
                "stakeholders, communities, and other partners to bring the right "
                "expertise and resources together.\n\n"
                "Whether you are interested in project development, investment, "
                "technical collaboration, or a long-term strategic relationship, "
                "we welcome the opportunity to explore how we can work together."
            ),
            "image_id": None,
            "image_alt": "Hydropower and water resources in Nepal",
            "enabled": True,
            "sort_order": 5,
            "button_1_label": "Discuss a partnership",
            "button_1_url": "/partnerships",
            "button_2_label": "",
            "button_2_url": "",
        },
        {
            "section_key": "opportunities",
            "section_type": "split_cta",
            "eyebrow": "Opportunities",
            "title": "Explore opportunities with NEAW",
            "description": (
                "We are interested in connecting with investors, project "
                "developers, technical specialists, and organisations looking "
                "to participate in Nepal's energy and water resources sectors."
            ),
            "content": (
                "Tell us about your project, investment interest, technical "
                "capability, or partnership proposal. Our team will review the "
                "information and get in touch."
            ),
            "image_id": None,
            "image_alt": "",
            "enabled": True,
            "sort_order": 6,
            "button_1_label": "View opportunities",
            "button_1_url": "/opportunities",
            "button_2_label": "",
            "button_2_url": "",
        },
        {
            "section_key": "insights",
            "section_type": "articles",
            "eyebrow": "Insights",
            "title": "News and perspectives",
            "description": (
                "Explore perspectives on Nepal's energy and water resources "
                "sectors, project development, sustainability, and emerging "
                "opportunities."
            ),
            "content": "",
            "image_id": None,
            "image_alt": "",
            "enabled": True,
            "sort_order": 7,
            "button_1_label": "View all insights",
            "button_1_url": "/insights",
            "button_2_label": "",
            "button_2_url": "",
        },
        {
            "section_key": "careers",
            "section_type": "image_text",
            "eyebrow": "Careers",
            "title": "Grow with a team working for Nepal's future",
            "description": "",
            "content": (
                "We value people who bring curiosity, technical capability, "
                "collaboration, and a commitment to creating meaningful outcomes. "
                "As our work grows, we aim to build a team capable of contributing "
                "to Nepal's evolving energy and infrastructure landscape."
            ),
            "image_id": None,
            "image_alt": "",
            "enabled": True,
            "sort_order": 8,
            "button_1_label": "View career opportunities",
            "button_1_url": "/careers",
            "button_2_label": "",
            "button_2_url": "",
        },
        {
            "section_key": "final_cta",
            "section_type": "cta",
            "eyebrow": "",
            "title": "Let's build something lasting for Nepal",
            "description": (
                "Whether you are exploring a partnership, investment opportunity, "
                "or project idea, we would be pleased to hear from you."
            ),
            "content": "",
            "image_id": None,
            "image_alt": "",
            "enabled": True,
            "sort_order": 9,
            "button_1_label": "Contact us",
            "button_1_url": "/contact",
            "button_2_label": "Learn about NEAW",
            "button_2_url": "/about",
        },
    ]

    for section_data in sections:
        db.add(HomeSection(**section_data))

    db.commit()
    print(f"Home sections: added {len(sections)}")

def seed_about_sections(db):
    """
    Seeds the About page structure.

    The Core Focus cards continue to come from the existing
    core_values content list, so they are not duplicated here.
    """
    if db.query(AboutSection).count():
        print("About sections: already seeded, skipping")
        return

    sections = [
        {
            "section_key": "hero",
            "section_type": "hero",
            "eyebrow": "About NEAW",
            "title": "Exploring Opportunities. Building Possibilities.",
            "description": (
                "Nepal Energy and Water Resources Pvt. Ltd. works across "
                "Nepal's energy and water resources sectors, exploring "
                "opportunities that support sustainable economic growth "
                "and infrastructure development."
            ),
            "content": "",
            "image_id": None,
            "image_alt": "",
            "enabled": True,
            "sort_order": 1,
            "button_1_label": "",
            "button_1_url": "",
            "button_2_label": "",
            "button_2_url": "",
        },
        {
            "section_key": "introduction",
            "section_type": "image_text",
            "eyebrow": "Company Introduction",
            "title": "Exploring Opportunities. Building Possibilities.",
            "description": "",
            "content": (
                "Nepal Energy and Water Resources Pvt. Ltd. works across "
                "Nepal's energy and water resources sectors, exploring "
                "opportunities that support sustainable economic growth "
                "and infrastructure development.\n\n"
                "Our approach combines local understanding with technical "
                "capabilities and collaborative partnerships to identify, "
                "develop, and support opportunities with long-term potential."
            ),
            "image_id": None,
            "image_alt": "Nepal energy and water resources",
            "enabled": True,
            "sort_order": 2,
            "button_1_label": "",
            "button_1_url": "",
            "button_2_label": "",
            "button_2_url": "",
        },
        {
            "section_key": "mission",
            "section_type": "statement",
            "eyebrow": "Mission",
            "title": "Creating meaningful opportunities for Nepal",
            "description": "",
            "content": (
                "To identify, develop, and support sustainable energy and "
                "water resources opportunities that create long-term value "
                "for Nepal and its stakeholders."
            ),
            "image_id": None,
            "image_alt": "",
            "enabled": True,
            "sort_order": 3,
            "button_1_label": "",
            "button_1_url": "",
            "button_2_label": "",
            "button_2_url": "",
        },
        {
            "section_key": "vision",
            "section_type": "statement",
            "eyebrow": "Vision",
            "title": "Building a sustainable future for Nepal",
            "description": "",
            "content": (
                "To contribute to a more sustainable and resilient Nepal "
                "through responsible development of energy, water resources, "
                "infrastructure, investment, and partnerships."
            ),
            "image_id": None,
            "image_alt": "",
            "enabled": True,
            "sort_order": 4,
            "button_1_label": "",
            "button_1_url": "",
            "button_2_label": "",
            "button_2_url": "",
        },
        {
            "section_key": "focus",
            "section_type": "cards",
            "eyebrow": "Core Focus",
            "title": "What guides our work",
            "description": (
                "Our work is guided by a focus on sustainable development, "
                "responsible resource use, technical understanding, "
                "investment, and collaboration."
            ),
            "content": "",
            "image_id": None,
            "image_alt": "",
            "enabled": True,
            "sort_order": 5,
            "button_1_label": "",
            "button_1_url": "",
            "button_2_label": "",
            "button_2_url": "",
        },
        {
            "section_key": "approach",
            "section_type": "image_text",
            "eyebrow": "Approach",
            "title": "How we develop projects",
            "description": "",
            "content": (
                "We combine local understanding, technical capabilities, "
                "project development experience, and collaboration to "
                "identify and develop opportunities from early-stage "
                "concepts through planning and implementation."
            ),
            "image_id": None,
            "image_alt": "Project development in Nepal",
            "enabled": True,
            "sort_order": 6,
            "button_1_label": "",
            "button_1_url": "",
            "button_2_label": "",
            "button_2_url": "",
        },
        {
            "section_key": "partnerships",
            "section_type": "image_text",
            "eyebrow": "Partnership Approach",
            "title": "Working alongside the right partners",
            "description": "",
            "content": (
                "We believe successful projects are built through "
                "collaboration. We work with investors, technical "
                "organisations, government stakeholders, communities, "
                "and other partners to bring the right expertise and "
                "resources together."
            ),
            "image_id": None,
            "image_alt": "Strategic partnerships",
            "enabled": True,
            "sort_order": 7,
            "button_1_label": "",
            "button_1_url": "",
            "button_2_label": "",
            "button_2_url": "",
        },
        {
            "section_key": "final_cta",
            "section_type": "cta",
            "eyebrow": "",
            "title": "Want to know more about NEAW?",
            "description": (
                "Reach out and our team will be glad to share more about "
                "our work and plans."
            ),
            "content": "",
            "image_id": None,
            "image_alt": "",
            "enabled": True,
            "sort_order": 8,
            "button_1_label": "Contact us",
            "button_1_url": "/contact",
            "button_2_label": "See our projects",
            "button_2_url": "/projects",
        },
    ]

    for section_data in sections:
        db.add(AboutSection(**section_data))

    db.commit()
    print(f"About sections: added {len(sections)}")


def seed_admin(db):
    if db.query(AdminUser).filter(AdminUser.username == settings.admin_username).first():
        print(f"Admin user '{settings.admin_username}': already exists, skipping")
        return
    db.add(AdminUser(username=settings.admin_username, password_hash=hash_password(settings.admin_password)))
    db.commit()
    print(f"Admin user '{settings.admin_username}': created")


def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_settings(db)
        seed_list(db, "focus_areas", [
            ("Energy", "Exploring opportunities across renewable and clean energy, power infrastructure, energy efficiency, and emerging energy technologies to support Nepal's evolving energy needs."),
            ("Water Resources", "Exploring opportunities in water resources and water infrastructure, with a focus on responsible resource management and sustainable infrastructure development."),
            ("Project Development", "Identifying and developing opportunities from early-stage concepts through project planning and implementation, supported by technical understanding and suitable partnerships."),
            ("Investment", "Exploring investment opportunities and facilitating connections between promising projects, investors, developers, and other relevant stakeholders."),
            ("Partnerships", "Building collaborative relationships with investors, developers, technology providers, technical organisations, and other suitable partners to explore and develop opportunities."),
        ])
        seed_list(db, "core_values", [
            ("[Value one]", "[Placeholder description of this value — to be supplied.]"),
            ("[Value two]", "[Placeholder description of this value — to be supplied.]"),
            ("[Value three]", "[Placeholder description of this value — to be supplied.]"),
            ("[Value four]", "[Placeholder description of this value — to be supplied.]"),
        ])
        seed_list(db, "partnership_types", [
            ("Strategic Partnerships", "We build long-term partnerships with organisations that share our commitment to Nepal's sustainable economic growth and infrastructure development. Strategic partners can work with us across multiple initiatives, combining expertise, networks, resources, and local knowledge to create lasting impact."),
            ("Project Partnerships", "We work with public and private sector organisations to develop and deliver projects that address real needs and create measurable value. Project partnerships can include technical collaboration, project development, implementation support, and access to local expertise and networks."),
            ("Investment Partnerships", "We welcome investment partners interested in supporting well-structured opportunities in Nepal. We work to connect capital, sector expertise, and local market knowledge to help develop commercially viable projects with sustainable long-term potential."),
            ("Collaboration", "We collaborate with government bodies, research institutions, communities, development organisations, and other stakeholders where shared knowledge and capabilities can strengthen outcomes. These collaborations help bring different perspectives together and support practical solutions for Nepal."),
        ])
        seed_list(db, "career_reasons", [
            ("[Reason one]", "[Placeholder — reason to work at NEAW to be supplied.]"),
            ("[Reason two]", "[Placeholder — reason to work at NEAW to be supplied.]"),
            ("[Reason three]", "[Placeholder — reason to work at NEAW to be supplied.]"),
        ])
        seed_list(db, "privacy_sections", [
            ("Introduction", "NEAW respects your privacy and is committed to protecting the personal information you provide when using our website. This Privacy Policy explains what information we may collect, how we use it, how we protect it, and the choices available to you. It applies to information submitted through this website, including contact enquiries and other forms or communications available through our online services."),
            ("Information We Collect", "We may collect information that you voluntarily provide when you contact us, submit an enquiry, request information, or communicate with our team. Depending on the service or form used, this may include your name, email address, phone number, organisation or company name, job title, country, and information contained in your message or enquiry. We may also collect limited technical information, such as browser type, device information, IP address, and website usage information, where necessary for website operation, security, and improvement."),
            ("How We Use Information", "We use the information we collect to respond to enquiries, communicate with you, provide requested information or services, understand and evaluate project or partnership opportunities, maintain and improve our website, and protect our systems against misuse or security threats. We may also use information where necessary to comply with applicable legal or regulatory requirements."),
            ("Sharing of Information", "We do not sell personal information submitted through this website. Information may be shared with authorised members of our team and, where necessary, trusted service providers who assist with website hosting, communications, technology, security, or other business operations. Where information is shared with service providers, we expect it to be handled appropriately and only for legitimate business purposes. We may also disclose information where required by applicable law or to protect our legal rights, users, or systems."),
            ("Data Security", "We take reasonable technical and organisational measures to protect personal information against unauthorised access, alteration, disclosure, loss, or misuse. However, no website or method of electronic transmission can be guaranteed to be completely secure. You should therefore avoid submitting sensitive or confidential information through general website forms unless specifically requested and appropriate safeguards are available."),
            ("Data Retention", "We retain personal information only for as long as reasonably necessary for the purpose for which it was collected, to maintain appropriate business records, resolve enquiries, meet legal or regulatory obligations, or protect our legitimate interests. When information is no longer required, it may be securely deleted or anonymised where appropriate."),
            ("Cookies and Website Technologies", "Our website may use cookies or similar technologies to support website functionality, security, performance, and user experience. Where applicable, cookies may also be used to understand how visitors interact with our website. You can manage or restrict cookies through your browser settings, although disabling certain cookies may affect some website functionality."),
            ("Third-Party Services", "Our website may use third-party services for functions such as hosting, analytics, security, communication, or form processing. These providers may process information in accordance with their own privacy policies and applicable requirements. We encourage users to review the privacy information of third-party services where relevant."),
            ("Your Rights", "Depending on applicable law, you may have rights relating to your personal information, including the right to request access to information we hold about you, request correction of inaccurate information, request deletion where appropriate, or raise concerns about how your information is handled. To make a privacy-related request, please contact us using the details provided below. We may need to verify your identity before responding to certain requests."),
            ("Changes to This Privacy Policy", "We may update this Privacy Policy from time to time to reflect changes to our website, services, legal requirements, or privacy practices. Any updated version will be published on this page with a revised \"Last updated\" date. We encourage you to review this page periodically for the latest information."),
            ("Contact Us", "If you have questions, concerns, or requests regarding this Privacy Policy or the way your personal information is handled, please contact us at info@nepalenergywater.com."),
        ])
        seed_projects(db)
        seed_opportunities(db)
        seed_articles(db)
        seed_jobs(db)
        seed_page_content(db)
        seed_home_sections(db)
        seed_admin(db)
        seed_about_sections(db)
    finally:
        db.close()
    print("\nSeed complete.")


if __name__ == "__main__":
    main()
