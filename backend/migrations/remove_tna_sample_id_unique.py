"""
Database migration to remove unique constraint from sample_tna.sample_id.

This migration allows multiple TNA records for the same sample_id,
which is required for set pieces (e.g., one record for "top", another for "bottom").

Run this migration with:
python backend/migrations/remove_tna_sample_id_unique.py
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
    """Run the migration to remove unique constraint from sample_tna.sample_id"""

    with engine.connect() as conn:
        print("Starting migration: Removing unique constraint from sample_tna.sample_id...")

        try:
            # Start a transaction
            trans = conn.begin()

            # Check if the unique constraint exists
            print("1. Checking for existing unique constraint...")
            constraint_check = conn.execute(text("""
                SELECT constraint_name
                FROM information_schema.table_constraints
                WHERE table_name = 'sample_tna'
                AND constraint_type = 'UNIQUE'
                AND constraint_name LIKE '%sample_id%';
            """))

            constraints = [row[0] for row in constraint_check]
            
            if constraints:
                print(f"   Found constraint(s): {', '.join(constraints)}")
                
                # Drop the unique constraint/index
                for constraint_name in constraints:
                    print(f"2. Dropping constraint: {constraint_name}...")
                    try:
                        # Try dropping as a constraint first
                        conn.execute(text(f"""
                            ALTER TABLE sample_tna
                            DROP CONSTRAINT IF EXISTS {constraint_name};
                        """))
                        print(f"   ✅ Dropped constraint: {constraint_name}")
                    except Exception as e:
                        # If constraint doesn't exist, try dropping as an index
                        print(f"   Trying to drop as index instead...")
                        try:
                            conn.execute(text(f"""
                                DROP INDEX IF EXISTS {constraint_name};
                            """))
                            print(f"   ✅ Dropped index: {constraint_name}")
                        except Exception as e2:
                            print(f"   ⚠️  Could not drop {constraint_name}: {e2}")
                            # Continue anyway - the constraint might not exist
            else:
                print("   No unique constraint found on sample_id (may have already been removed)")

            # Ensure the index still exists (for performance, but not unique)
            print("3. Ensuring non-unique index exists on sample_id...")
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS ix_sample_tna_sample_id 
                ON sample_tna(sample_id);
            """))

            # Commit the transaction
            trans.commit()

            print("\n✅ Migration completed successfully!")
            print("\nChanges made:")
            print("  - Removed unique constraint from sample_tna.sample_id")
            print("  - Kept non-unique index on sample_id for performance")
            print("  - Multiple TNA records can now exist for the same sample_id")

        except Exception as e:
            trans.rollback()
            print(f"\n❌ Migration failed: {str(e)}")
            raise


def verify_migration():
    """Verify that the migration was successful"""

    with engine.connect() as conn:
        print("\nVerifying migration...")

        # Check if unique constraint still exists
        result = conn.execute(text("""
            SELECT constraint_name, constraint_type
            FROM information_schema.table_constraints
            WHERE table_name = 'sample_tna'
            AND constraint_type = 'UNIQUE'
            AND constraint_name LIKE '%sample_id%';
        """))

        constraints = list(result)
        if constraints:
            print("\n⚠️  Warning: Unique constraints still exist:")
            for row in constraints:
                print(f"  - {row[0]}: {row[1]}")
        else:
            print("\n✅ No unique constraints found on sample_id (as expected)")

        # Check if index exists
        result = conn.execute(text("""
            SELECT indexname
            FROM pg_indexes
            WHERE tablename = 'sample_tna'
            AND indexname LIKE '%sample_id%';
        """))

        indexes = [row[0] for row in result]
        if indexes:
            print("\n✅ Indexes on sample_id:")
            for idx in indexes:
                print(f"  - {idx}")
        else:
            print("\n⚠️  Warning: No indexes found on sample_id")


if __name__ == "__main__":
    try:
        run_migration()
        verify_migration()
    except Exception as e:
        print(f"\nError: {e}")
        sys.exit(1)

