"""
Schema Normalization Migration Script (Phase 2)
Handles normalization of SampleTNA and SamplePlan tables
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector

def upgrade():
    """
    Normalize SampleTNA and SamplePlan tables:
    1. Add sample_fk_id column
    2. Populate it from samples table based on sample_id string
    3. Create foreign key constraints
    4. (Optional) Drop redundant columns
    """
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    
    # 1. Normalize SampleTNA
    # ----------------------
    print("Normalizing SampleTNA table...")
    
    # Add foreign key column if it doesn't exist
    columns = [c['name'] for c in inspector.get_columns('sample_tna')]
    if 'sample_fk_id' not in columns:
        op.add_column('sample_tna', sa.Column('sample_fk_id', sa.Integer(), nullable=True))
    
    # Populate FK column
    op.execute("""
        UPDATE sample_tna st
        SET sample_fk_id = s.id
        FROM samples s
        WHERE st.sample_id = s.sample_id
    """)
    
    # Create index
    op.create_index('idx_sample_tna_sample_fk_id', 'sample_tna', ['sample_fk_id'])
    
    # Add foreign key constraint
    # Note: We keep nullable=True for now to avoid issues with orphaned records, 
    # but in strict mode this should be nullable=False
    op.create_foreign_key(
        'fk_sample_tna_samples', 'sample_tna', 'samples',
        ['sample_fk_id'], ['id']
    )
    
    # 2. Normalize SamplePlan
    # -----------------------
    print("Normalizing SamplePlan table...")
    
    # Add foreign key column if it doesn't exist
    columns = [c['name'] for c in inspector.get_columns('sample_plan')]
    if 'sample_fk_id' not in columns:
        op.add_column('sample_plan', sa.Column('sample_fk_id', sa.Integer(), nullable=True))
    
    # Populate FK column
    op.execute("""
        UPDATE sample_plan sp
        SET sample_fk_id = s.id
        FROM samples s
        WHERE sp.sample_id = s.sample_id
    """)
    
    # Create index
    op.create_index('idx_sample_plan_sample_fk_id', 'sample_plan', ['sample_fk_id'])
    
    # Add foreign key constraint
    op.create_foreign_key(
        'fk_sample_plan_samples', 'sample_plan', 'samples',
        ['sample_fk_id'], ['id']
    )
    
    print("✅ Schema normalization migration completed successfully")

def downgrade():
    """Revert normalization changes"""
    op.drop_constraint('fk_sample_plan_samples', 'sample_plan', type_='foreignkey')
    op.drop_index('idx_sample_plan_sample_fk_id', 'sample_plan')
    op.drop_column('sample_plan', 'sample_fk_id')
    
    op.drop_constraint('fk_sample_tna_samples', 'sample_tna', type_='foreignkey')
    op.drop_index('idx_sample_tna_sample_fk_id', 'sample_tna')
    op.drop_column('sample_tna', 'sample_fk_id')
