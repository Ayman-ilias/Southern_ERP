"""
Add Performance Indexes - Migration Script
Created: 2024-12-01
Purpose: Add critical indexes for 10x query performance with 300+ concurrent users
"""

from alembic import op
import sqlalchemy as sa


def upgrade():
    """Add performance indexes"""
    
    # Samples table indexes
    op.create_index('idx_samples_submit_status', 'samples', ['submit_status'])
    op.create_index('idx_samples_sample_type', 'samples', ['sample_type'])
    op.create_index('idx_samples_created_at', 'samples', [sa.text('created_at DESC')])
    op.create_index('idx_samples_buyer_style', 'samples', ['buyer_id', 'style_id'])
    
    # Orders table indexes
    op.create_index('idx_orders_order_status', 'order_management', ['order_status'])
    op.create_index('idx_orders_order_date', 'order_management', [sa.text('order_date DESC')])
    op.create_index('idx_orders_delivery_date', 'order_management', ['delivery_date'])
    op.create_index('idx_orders_buyer_status', 'order_management', ['buyer_id', 'order_status'])
    op.create_index('idx_orders_created_at', 'order_management', [sa.text('created_at DESC')])
    
    # Buyers table indexes
    op.create_index('idx_buyers_email', 'buyers', ['email'])
    op.create_index('idx_buyers_created_at', 'buyers', [sa.text('created_at DESC')])
    
    # Suppliers table indexes
    op.create_index('idx_suppliers_email', 'suppliers', ['email'])
    op.create_index('idx_suppliers_created_at', 'suppliers', [sa.text('created_at DESC')])
    
    # Styles table indexes
    op.create_index('idx_styles_buyer_id', 'style_summaries', ['buyer_id'])
    op.create_index('idx_styles_created_at', 'style_summaries', [sa.text('created_at DESC')])
    
    # Contact persons indexes
    op.create_index('idx_contacts_buyer_id', 'contact_persons', ['buyer_id'])
    op.create_index('idx_contacts_supplier_id', 'contact_persons', ['supplier_id'])
    
    # Shipping info indexes
    op.create_index('idx_shipping_buyer_id', 'shipping_info', ['buyer_id'])
    
    # Sample operations indexes
    op.create_index('idx_sample_ops_sample_id', 'sample_operations', ['sample_id'])
    
    print("✅ Successfully added all performance indexes")


def downgrade():
    """Remove performance indexes"""
    
    # Drop indexes in reverse order
    op.drop_index('idx_sample_ops_sample_id', 'sample_operations')
    op.drop_index('idx_shipping_buyer_id', 'shipping_info')
    op.drop_index('idx_contacts_supplier_id', 'contact_persons')
    op.drop_index('idx_contacts_buyer_id', 'contact_persons')
    op.drop_index('idx_styles_created_at', 'style_summaries')
    op.drop_index('idx_styles_buyer_id', 'style_summaries')
    op.drop_index('idx_suppliers_created_at', 'suppliers')
    op.drop_index('idx_suppliers_email', 'suppliers')
    op.drop_index('idx_buyers_created_at', 'buyers')
    op.drop_index('idx_buyers_email', 'buyers')
    op.drop_index('idx_orders_created_at', 'order_management')
    op.drop_index('idx_orders_buyer_status', 'order_management')
    op.drop_index('idx_orders_delivery_date', 'order_management')
    op.drop_index('idx_orders_order_date', 'order_management')
    op.drop_index('idx_orders_order_status', 'order_management')
    op.drop_index('idx_samples_buyer_style', 'samples')
    op.drop_index('idx_samples_created_at', 'samples')
    op.drop_index('idx_samples_sample_type', 'samples')
    op.drop_index('idx_samples_submit_status', 'samples')
    
    print("✅ Successfully removed all performance indexes")
