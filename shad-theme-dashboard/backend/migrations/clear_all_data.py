"""
Script to clear all data from the database
WARNING: This will delete ALL data from all tables!
"""

import sys
import os
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import text
from app.core.database import engine


def clear_all_data():
    """Clear all data from all tables"""
    
    with engine.connect() as conn:
        print("=" * 60)
        print("⚠️  WARNING: This will delete ALL data from the database!")
        print("=" * 60)
        
        try:
            # Start a transaction
            trans = conn.begin()
            
            # Get all table names
            print("\n1. Getting list of all tables...")
            result = conn.execute(text("""
                SELECT tablename 
                FROM pg_tables 
                WHERE schemaname = 'public'
                AND tablename NOT LIKE 'pg_%'
                AND tablename NOT LIKE 'sql_%';
            """))
            
            tables = [row[0] for row in result]
            print(f"   Found {len(tables)} tables")
            
            # Disable foreign key checks temporarily
            print("\n2. Disabling foreign key constraints...")
            conn.execute(text("SET session_replication_role = 'replica';"))
            
            # Delete data from all tables (in reverse dependency order)
            print("\n3. Deleting data from all tables...")
            
            # Order matters - delete child tables first
            delete_order = [
                # Child tables first
                "sample_tna",
                "sample_plan",
                "sample_operations",
                "required_materials",
                "style_variant_colors",
                "style_variants",
                "style_summaries",
                "samples",
                "contact_persons",
                "shipping_info",
                "banking_info",
                "suppliers",
                "buyers",
                "material_master",
                "operation_types",
                "smv_calculations",
                "order_management",
            ]
            
            deleted_count = 0
            for table in delete_order:
                if table in tables:
                    try:
                        result = conn.execute(text(f"DELETE FROM {table};"))
                        count = result.rowcount
                        if count > 0:
                            print(f"   ✅ Deleted {count} records from {table}")
                            deleted_count += count
                    except Exception as e:
                        print(f"   ⚠️  Could not delete from {table}: {e}")
            
            # Delete from any remaining tables (except users)
            remaining_tables = [t for t in tables if t not in delete_order and t != "users"]
            for table in remaining_tables:
                try:
                    result = conn.execute(text(f"DELETE FROM {table};"))
                    count = result.rowcount
                    if count > 0:
                        print(f"   ✅ Deleted {count} records from {table}")
                        deleted_count += count
                except Exception as e:
                    print(f"   ⚠️  Could not delete from {table}: {e}")
            
            # Re-enable foreign key checks
            print("\n4. Re-enabling foreign key constraints...")
            conn.execute(text("SET session_replication_role = 'origin';"))
            
            # Reset sequences
            print("\n5. Resetting auto-increment sequences...")
            for table in tables:
                try:
                    # Get primary key column name
                    pk_result = conn.execute(text(f"""
                        SELECT column_name 
                        FROM information_schema.columns 
                        WHERE table_name = '{table}' 
                        AND column_default LIKE 'nextval%'
                        LIMIT 1;
                    """))
                    pk_col = list(pk_result)
                    if pk_col:
                        conn.execute(text(f"""
                            SELECT setval(pg_get_serial_sequence('{table}', '{pk_col[0][0]}'), 1, false);
                        """))
                except:
                    pass  # Some tables might not have sequences
            
            # Commit the transaction
            trans.commit()
            
            print("\n" + "=" * 60)
            print(f"✅ Successfully cleared all data!")
            print(f"   Total records deleted: {deleted_count}")
            print("=" * 60)
            print("\nNote: User accounts are preserved.")
            print("All other data has been cleared.")
            
        except Exception as e:
            trans.rollback()
            print(f"\n❌ Error clearing data: {str(e)}")
            raise


if __name__ == "__main__":
    try:
        clear_all_data()
    except Exception as e:
        print(f"\nError: {e}")
        sys.exit(1)

