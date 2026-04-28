import sys
import os

# Align path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from models import SessionLocal, Organization, User, Project, LCAProcess, LCAExchange, init_db
from auth import get_password_hash

def seed_saas():
    print("--- Triya.io SaaS Seeding Environment ---")
    db = SessionLocal()
    init_db()

    # 1. Create Default Organization
    org = db.query(Organization).filter(Organization.slug == "triya-core").first()
    if not org:
        org = Organization(name="Triya Core Research", slug="triya-core")
        db.add(org)
        db.flush()
        print(f"Created Org: {org.name}")

    # 2. Create Default Admin User
    admin = db.query(User).filter(User.email == "admin@triya.io").first()
    if not admin:
        admin = User(
            email="admin@triya.io",
            hashed_password=get_password_hash("triya2026"),
            organization_id=org.id,
            role="admin"
        )
        db.add(admin)
        print("Created User: admin@triya.io")

    # 3. Feed Library Processes (USLCI Mock Subset)
    library_data = [
        {"name": "Steel, hot rolled, at plant [USLCI]", "cat": "Metals", "gwp": 2.4, "unit": "kg"},
        {"name": "Electricity, at grid, US average [USLCI]", "cat": "Energy", "gwp": 0.65, "unit": "kWh"},
        {"name": "Aluminium, primary, ingot [USLCI]", "cat": "Metals", "gwp": 12.8, "unit": "kg"},
        {"name": "Truck transport, long-haul [USLCI]", "cat": "Transport", "gwp": 0.15, "unit": "tkm"},
    ]

    for item in library_data:
        exists = db.query(LCAProcess).filter(LCAProcess.process_name == item["name"], LCAProcess.is_library == True).first()
        if not exists:
            proc = LCAProcess(
                process_name=item["name"],
                unit=item["unit"],
                category=item["cat"],
                is_library=True,
                gwp_climate_change=item["gwp"]
            )
            db.add(proc)
            print(f"Seeded Library Node: {item['name']}")

    db.commit()
    print("--- SaaS Seeding Complete ---")
    db.close()

if __name__ == "__main__":
    seed_saas()
