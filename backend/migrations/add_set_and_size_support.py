"""
Database migration to add set and size support to style summaries and variants.

This migration adds:
1. set_piece_count to style_summaries table
2. piece_name and sizes to style_variants table

Run this migration with:
python backend/migrations/add_set_and_size_support.py
"""

import sys
import os
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import text
from app.core.database import engine


def run_migration():
    """Run the migration to add set and size support"""

    with engine.connect() as conn:
        print("Starting migration: Adding set and size support...")

        try:
            # Start a transaction
            trans = conn.begin()

            # 1. Add set_piece_count to style_summaries
            print("1. Adding set_piece_count column to style_summaries...")
            conn.execute(text("""
                ALTER TABLE style_summaries
                ADD COLUMN IF NOT EXISTS set_piece_count INTEGER;
            """))

            # 2. Add piece_name to style_variants
            print("2. Adding piece_name column to style_variants...")
            conn.execute(text("""
                ALTER TABLE style_variants
                ADD COLUMN IF NOT EXISTS piece_name VARCHAR;
            """))

            # 3. Add sizes column to style_variants (JSONB for PostgreSQL)
            print("3. Adding sizes column to style_variants...")
            conn.execute(text("""
                ALTER TABLE style_variants
                ADD COLUMN IF NOT EXISTS sizes JSONB;
            """))

            # 4. Add comment/documentation to columns
            print("4. Adding column comments...")
            conn.execute(text("""
                COMMENT ON COLUMN style_summaries.set_piece_count IS
                'Number of pieces in a set (2-6). NULL if not a set.';
            """))

            conn.execute(text("""
                COMMENT ON COLUMN style_variants.piece_name IS
                'Name of the piece in a set (e.g., Top, Bottom, Jacket). NULL for non-set items.';
            """))

            conn.execute(text("""
                COMMENT ON COLUMN style_variants.sizes IS
                'Array of sizes for this variant (e.g., ["S", "M", "L", "XL"]). Stored as JSON.';
            """))

            # Commit the transaction
            trans.commit()

            print("\n✅ Migration completed successfully!")
            print("\nNew columns added:")
            print("  - style_summaries.set_piece_count")
            print("  - style_variants.piece_name")
            print("  - style_variants.sizes")

        except Exception as e:
            trans.rollback()
            print(f"\n❌ Migration failed: {str(e)}")
            raise


def verify_migration():
    """Verify that the migration was successful"""

    with engine.connect() as conn:
        print("\nVerifying migration...")

        # Check style_summaries columns
        result = conn.execute(text("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'style_summaries'
            AND column_name IN ('set_piece_count')
            ORDER BY column_name;
        """))

        print("\nstyle_summaries new columns:")
        for row in result:
            print(f"  - {row[0]}: {row[1]} (nullable: {row[2]})")

        # Check style_variants columns
        result = conn.execute(text("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'style_variants'
            AND column_name IN ('piece_name', 'sizes')
            ORDER BY column_name;
        """))

        print("\nstyle_variants new columns:")
        for row in result:
            print(f"  - {row[0]}: {row[1]} (nullable: {row[2]})")


if __name__ == "__main__":
    try:
        run_migration()
        verify_migration()
    except Exception as e:
        print(f"\nError: {e}")
        sys.exit(1)
