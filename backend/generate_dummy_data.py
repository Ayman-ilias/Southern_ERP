"""
Generate 5000 dummy records for all tables to test performance
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from faker import Faker
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import (
    User, Buyer, Supplier, ContactPerson,
    Sample, StyleSummary, OperationType, OperationMaster, RequiredMaterial
)

fake = Faker()
BATCH_SIZE = 1000
TOTAL_RECORDS = 5000

def generate_users(db: Session, count: int = TOTAL_RECORDS):
    """Generate dummy users"""
    print(f"Generating {count} users...")
    users = []
    departments = ["Merchandising", "Production", "Quality", "Planning", "Finance", "HR", "IT", "Design"]
    designations = ["Manager", "Executive", "Senior Executive", "Officer", "Coordinator", "Assistant"]

    for i in range(count):
        user = User(
            email=f"user{i}_{fake.email()}",
            username=f"user_{i}_{fake.user_name()}[:20]",
            hashed_password="$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5oDxhqvJ5XoXq",
            full_name=fake.name(),
            department=random.choice(departments),
            designation=random.choice(designations),
            is_active=True,
            is_superuser=False
        )
        users.append(user)

        if len(users) >= BATCH_SIZE:
            db.bulk_save_objects(users)
            db.commit()
            print(f"  Inserted {len(users)} users...")
            users = []

    if users:
        db.bulk_save_objects(users)
        db.commit()
    print(f"✓ Generated {count} users")

def generate_buyers(db: Session, count: int = TOTAL_RECORDS):
    """Generate dummy buyers"""
    print(f"Generating {count} buyers...")
    buyers = []
    countries = ["USA", "UK", "Germany", "France", "Italy", "Spain", "Canada", "Australia"]
    statuses = ["active", "inactive", "pending"]

    for i in range(count):
        buyer = Buyer(
            buyer_name=f"{fake.company()} {i}"[:100],
            brand_name=fake.company()[:100],
            company_name=fake.company()[:100],
            head_office_country=random.choice(countries),
            email=f"buyer{i}@{fake.domain_name()}",
            phone=fake.phone_number()[:20],
            website=fake.url()[:200],
            rating=round(random.uniform(1.0, 5.0), 1),
            status=random.choice(statuses)
        )
        buyers.append(buyer)

        if len(buyers) >= BATCH_SIZE:
            db.bulk_save_objects(buyers)
            db.commit()
            print(f"  Inserted {len(buyers)} buyers...")
            buyers = []

    if buyers:
        db.bulk_save_objects(buyers)
        db.commit()
    print(f"✓ Generated {count} buyers")

def generate_suppliers(db: Session, count: int = TOTAL_RECORDS):
    """Generate dummy suppliers"""
    print(f"Generating {count} suppliers...")
    suppliers = []
    supplier_types = ["Fabric", "Trims", "Accessories", "Packing"]
    countries = ["Bangladesh", "China", "India", "Pakistan"]

    for i in range(count):
        supplier = Supplier(
            supplier_name=f"{fake.company()} {i}"[:100],
            supplier_type=random.choice(supplier_types),
            company_name=fake.company()[:100],
            country=random.choice(countries),
            email=f"supplier{i}@{fake.domain_name()}",
            phone=fake.phone_number()[:20],
            website=fake.url()[:200],
            rating=round(random.uniform(1.0, 5.0), 1),
            status=random.choice(["active", "inactive"])
        )
        suppliers.append(supplier)

        if len(suppliers) >= BATCH_SIZE:
            db.bulk_save_objects(suppliers)
            db.commit()
            print(f"  Inserted {len(suppliers)} suppliers...")
            suppliers = []

    if suppliers:
        db.bulk_save_objects(suppliers)
        db.commit()
    print(f"✓ Generated {count} suppliers")

def generate_samples(db: Session, count: int = TOTAL_RECORDS):
    """Generate dummy samples"""
    print(f"Generating {count} samples...")
    buyer_ids = [b.id for b in db.query(Buyer.id).limit(1000).all()]

    if not buyer_ids:
        print("⚠ Skipping samples - no buyers found")
        return

    samples = []
    statuses = ["Pending", "In Progress", "Submitted", "Approved"]

    for i in range(count):
        sample = Sample(
            style_ref=f"STY-{i:06d}",
            buyer_id=random.choice(buyer_ids),
            season=random.choice(["Spring", "Summer", "Fall", "Winter"]),
            sample_type=random.choice(["Proto", "Fit", "Size Set"]),
            status=random.choice(statuses),
            submission_date=fake.date_between(start_date="-1y", end_date="today")
        )
        samples.append(sample)

        if len(samples) >= BATCH_SIZE:
            db.bulk_save_objects(samples)
            db.commit()
            print(f"  Inserted {len(samples)} samples...")
            samples = []

    if samples:
        db.bulk_save_objects(samples)
        db.commit()
    print(f"✓ Generated {count} samples")

def generate_style_summaries(db: Session, count: int = TOTAL_RECORDS):
    """Generate dummy style summaries"""
    print(f"Generating {count} style summaries...")
    sample_ids = [s.id for s in db.query(Sample.id).limit(1000).all()]

    if not sample_ids:
        print("⚠ Skipping style summaries - no samples found")
        return

    summaries = []
    garment_types = ["T-Shirt", "Polo", "Shirt", "Pants", "Jacket"]

    for i in range(count):
        summary = StyleSummary(
            sample_id=random.choice(sample_ids),
            style_name=f"Style {i}",
            garment_type=random.choice(garment_types),
            fabric_type=random.choice(["Cotton", "Polyester", "Blend"]),
            gsm=random.randint(150, 300),
            gauge=random.choice(["3GG", "5GG", "7GG", "9GG"]),
            description=fake.text(max_nb_chars=200)
        )
        summaries.append(summary)

        if len(summaries) >= BATCH_SIZE:
            db.bulk_save_objects(summaries)
            db.commit()
            print(f"  Inserted {len(summaries)} summaries...")
            summaries = []

    if summaries:
        db.bulk_save_objects(summaries)
        db.commit()
    print(f"✓ Generated {count} style summaries")

def generate_operation_masters(db: Session, count: int = 1000):
    """Generate operation masters"""
    print(f"Generating {count} operation masters...")

    # First ensure we have operation types
    op_types = ["Cutting", "Sewing", "Finishing", "Packing"]
    for type_name in op_types:
        existing = db.query(OperationType).filter(OperationType.name == type_name).first()
        if not existing:
            db.add(OperationType(name=type_name, description=f"{type_name} ops"))
    db.commit()

    type_ids = [t.id for t in db.query(OperationType.id).all()]
    operations = []

    for i in range(count):
        operation = OperationMaster(
            operation_name=f"Op {i}",
            operation_type_id=random.choice(type_ids),
            smv=round(random.uniform(0.1, 5.0), 2),
            machine_type=random.choice(["Single Needle", "Overlock", "Manual"]),
            description=fake.text(max_nb_chars=100)
        )
        operations.append(operation)

        if len(operations) >= BATCH_SIZE:
            db.bulk_save_objects(operations)
            db.commit()
            print(f"  Inserted {len(operations)} operations...")
            operations = []

    if operations:
        db.bulk_save_objects(operations)
        db.commit()
    print(f"✓ Generated {count} operation masters")

def main():
    """Main function to generate all dummy data"""
    print("=" * 60)
    print("GENERATING DUMMY DATA FOR PERFORMANCE TESTING")
    print("=" * 60)

    db = next(get_db())

    try:
        start_time = datetime.now()

        generate_users(db, TOTAL_RECORDS)
        generate_buyers(db, TOTAL_RECORDS)
        generate_suppliers(db, TOTAL_RECORDS)
        generate_samples(db, TOTAL_RECORDS)
        generate_style_summaries(db, TOTAL_RECORDS)
        generate_operation_masters(db, 1000)

        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()

        print("\n" + "=" * 60)
        print("✓ DATA GENERATION COMPLETE!")
        print("=" * 60)
        print(f"\nTime taken: {duration:.2f} seconds")
        print("\nDatabase Statistics:")
        print(f"  Users: {db.query(User).count():,}")
        print(f"  Buyers: {db.query(Buyer).count():,}")
        print(f"  Suppliers: {db.query(Supplier).count():,}")
        print(f"  Samples: {db.query(Sample).count():,}")
        print(f"  Style Summaries: {db.query(StyleSummary).count():,}")
        print(f"  Operation Masters: {db.query(OperationMaster).count():,}")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
