"""
Database migration to add department_access field to users table.

Run this migration with:
python backend/migrations/add_user_department_access.py
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
    """Run the migration to add department_access column"""

    with engine.connect() as conn:
        print("Starting migration: Adding department_access to users table...")

        try:
            # Start a transaction
            trans = conn.begin()

            # Add department_access column as JSONB (PostgreSQL)
            print("1. Adding department_access column...")
            conn.execute(text("""
                ALTER TABLE users
                ADD COLUMN IF NOT EXISTS department_access JSONB DEFAULT '[]'::jsonb;
            """))

            # Add comment
            print("2. Adding column comment...")
            conn.execute(text("""
                COMMENT ON COLUMN users.department_access IS
                'Array of department IDs the user can access (e.g., ["client_info", "sample_department"]). Empty array means no access. Superusers have access to all departments.';
            """))

            # Commit the transaction
            trans.commit()

            print("\n✅ Migration completed successfully!")
            print("\nChanges made:")
            print("  - Added department_access column (JSONB) to users table")
            print("  - Default value: empty array []")
            print("  - Superusers have access to all departments automatically")

        except Exception as e:
            trans.rollback()
            print(f"\n❌ Migration failed: {str(e)}")
            raise


def verify_migration():
    """Verify that the migration was successful"""

    with engine.connect() as conn:
        print("\nVerifying migration...")

        # Check if column exists
        result = conn.execute(text("""
            SELECT column_name, data_type, column_default
            FROM information_schema.columns
            WHERE table_name = 'users'
            AND column_name = 'department_access';
        """))

        columns = list(result)
        if columns:
            print("\n✅ department_access column found:")
            for row in columns:
                print(f"  - Name: {row[0]}")
                print(f"  - Type: {row[1]}")
                print(f"  - Default: {row[2]}")
        else:
            print("\n⚠️  Warning: department_access column not found")


if __name__ == "__main__":
    try:
        run_migration()
        verify_migration()
    except Exception as e:
        print(f"\nError: {e}")
        sys.exit(1)

