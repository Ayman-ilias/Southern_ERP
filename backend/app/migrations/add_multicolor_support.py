"""
Add Multi-Color Support for Style Variants
Migration Date: 2025-12-08
Purpose: Support garments with multiple color parts (e.g., polo with different colored body, collar, sleeves)
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


def upgrade():
    """Add multi-color support"""

    # Create new table for variant color parts
    op.create_table(
        'style_variant_colors',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('style_variant_id', sa.Integer(), sa.ForeignKey('style_variants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('part_name', sa.String(), nullable=False, comment='e.g., Body, Collar, Sleeves, Trim, Lining'),
        sa.Column('colour_name', sa.String(), nullable=False, comment='e.g., Navy Blue, White, Red'),
        sa.Column('colour_code', sa.String(), nullable=True, comment='e.g., #001F3F, Pantone 19-4052'),
        sa.Column('sort_order', sa.Integer(), nullable=False, default=0, comment='Display order of parts'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )

    # Add indexes for performance
    op.create_index('idx_variant_colors_variant_id', 'style_variant_colors', ['style_variant_id'])
    op.create_index('idx_variant_colors_part_name', 'style_variant_colors', ['part_name'])

    # Add a flag to style_variants to indicate if it uses multi-color
    op.add_column('style_variants', sa.Column('is_multicolor', sa.Boolean(), default=False, nullable=False, server_default='false'))

    # Add a display_name column for better variant identification
    op.add_column('style_variants', sa.Column('display_name', sa.String(), nullable=True,
                  comment='Auto-generated name like "Navy Body + White Collar"'))

    print("✅ Multi-color support tables created successfully")
    print("   - Created table: style_variant_colors")
    print("   - Added column: style_variants.is_multicolor")
    print("   - Added column: style_variants.display_name")


def downgrade():
    """Remove multi-color support"""

    # Remove added columns
    op.drop_column('style_variants', 'display_name')
    op.drop_column('style_variants', 'is_multicolor')

    # Drop indexes
    op.drop_index('idx_variant_colors_part_name', 'style_variant_colors')
    op.drop_index('idx_variant_colors_variant_id', 'style_variant_colors')

    # Drop table
    op.drop_table('style_variant_colors')

    print("✅ Multi-color support removed")
