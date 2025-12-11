"""
Add Supplier Fields - Migration Script
Created: 2024-12-03
Purpose: Add supplier_type, contact_person, and country fields to suppliers table
"""

from alembic import op
import sqlalchemy as sa


def upgrade():
    """Add missing fields to suppliers table"""

    # Add supplier_type column
    op.add_column('suppliers', sa.Column('supplier_type', sa.String(), nullable=True))

    # Add contact_person column
    op.add_column('suppliers', sa.Column('contact_person', sa.String(), nullable=True))

    # Add country column
    op.add_column('suppliers', sa.Column('country', sa.String(), nullable=True))

    print("✅ Successfully added supplier_type, contact_person, and country columns to suppliers table")


def downgrade():
    """Remove added fields from suppliers table"""

    # Drop columns in reverse order
    op.drop_column('suppliers', 'country')
    op.drop_column('suppliers', 'contact_person')
    op.drop_column('suppliers', 'supplier_type')

    print("✅ Successfully removed supplier_type, contact_person, and country columns from suppliers table")
