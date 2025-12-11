"""
Initialize database with sample data
"""
from sqlalchemy.orm import Session
from .core import get_password_hash
from .models import User, Buyer, Supplier, StyleSummary, OperationMaster, SMVSettings
import logging

logger = logging.getLogger(__name__)


def init_sample_data(db: Session):
    """Initialize database with sample data"""
    try:
        # Check if data already exists
        existing_user = db.query(User).first()
        if existing_user:
            logger.info("Sample data already exists, skipping initialization")
            return

        logger.info("Creating sample data...")

        # Create admin user
        admin_user = User(
            email="admin@rmgerp.com",
            username="admin",
            hashed_password=get_password_hash("admin"),
            full_name="System Administrator",
            is_active=True,
            is_superuser=True,
            department="Admin",
            designation="System Admin"
        )
        db.add(admin_user)

        # Create sample buyers
        buyers_data = [
            {
                "buyer_name": "H&M",
                "brand_name": "H&M",
                "company_name": "Hennes & Mauritz AB",
                "head_office_country": "Sweden",
                "email": "orders@hm.com",
                "phone": "+46-8-796-5500",
                "website": "https://www.hm.com",
                "tax_id": "SE556042916401",
                "rating": 4.5
            },
            {
                "buyer_name": "Zara",
                "brand_name": "Zara",
                "company_name": "Industria de Diseño Textil SA",
                "head_office_country": "Spain",
                "email": "b2b@zara.com",
                "phone": "+34-981-185-400",
                "website": "https://www.zara.com",
                "tax_id": "ESA15223259",
                "rating": 4.8
            },
            {
                "buyer_name": "Gap Inc",
                "brand_name": "GAP",
                "company_name": "Gap Inc.",
                "head_office_country": "USA",
                "email": "sourcing@gap.com",
                "phone": "+1-800-427-7895",
                "website": "https://www.gap.com",
                "tax_id": "US943597190",
                "rating": 4.3
            }
        ]

        for buyer_data in buyers_data:
            buyer = Buyer(**buyer_data)
            db.add(buyer)

        # Create sample suppliers
        supplier = Supplier(
            supplier_name="Yarn Traders Ltd",
            brand_name="YarnTech",
            company_name="Yarn Traders Limited",
            head_office_country="Bangladesh",
            email="sales@yarntraders.com",
            phone= "+880-2-9876543",
            website="https://yarntraders.com",
            tax_id="BD123456789",
            rating=4.2
        )
        db.add(supplier)

        # Create sample styles
        db.flush()  # Flush to get buyer IDs
        first_buyer = db.query(Buyer).first()

        styles_data = [
            {
                "buyer_id": first_buyer.id,
                "style_name": "Classic Polo",
                "style_id": "POLO-001",
                "product_category": "Polo Shirt",
                "product_type": "Knitted",
                "gauge": "24GG",
                "style_description": "Classic polo shirt with collar and button placket"
            },
            {
                "buyer_id": first_buyer.id,
                "style_name": "Crew Neck Sweater",
                "style_id": "CREW-001",
                "product_category": "Sweater",
                "product_type": "Knitted",
                "gauge": "12GG",
                "style_description": "Crew neck pullover sweater"
            }
        ]

        for style_data in styles_data:
            style = StyleSummary(**style_data)
            db.add(style)

        # Create sample operations
        operations_data = [
            {
                "operation_name": "Neck Join",
                "machine_type": "Overlock",
                "skill_level": "Skilled",
                "standard_time": 0.5
            },
            {
                "operation_name": "Shoulder Join",
                "machine_type": "Overlock",
                "skill_level": "Semi-skilled",
                "standard_time": 0.4
            },
            {
                "operation_name": "Sleeve Join",
                "machine_type": "Overlock",
                "skill_level": "Skilled",
                "standard_time": 0.6
            },
            {
                "operation_name": "Side Seam",
                "machine_type": "Overlock",
                "skill_level": "Semi-skilled",
                "standard_time": 0.5
            },
            {
                "operation_name": "Bottom Hemming",
                "machine_type": "Flatlock",
                "skill_level": "Skilled",
                "standard_time": 0.4
            }
        ]

        for op_data in operations_data:
            operation = OperationMaster(**op_data)
            db.add(operation)

        # Create SMV settings
        smv_settings_data = [
            {
                "style_type": "Basic",
                "approval_factor": 1.10,
                "allowance_percent": 10.0
            },
            {
                "style_type": "Polo",
                "approval_factor": 1.20,
                "allowance_percent": 12.0
            },
            {
                "style_type": "Hoodie",
                "approval_factor": 1.30,
                "allowance_percent": 15.0
            },
            {
                "style_type": "Jacket",
                "approval_factor": 1.40,
                "allowance_percent": 15.0
            }
        ]

        for smv_data in smv_settings_data:
            smv_setting = SMVSettings(**smv_data)
            db.add(smv_setting)

        db.commit()
        logger.info("Sample data created successfully!")
        logger.info("Default login credentials:")
        logger.info("  Username: admin | Password: admin")

    except Exception as e:
        logger.error(f"Error creating sample data: {e}")
        db.rollback()
        raise
