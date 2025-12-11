from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base


class StyleSummary(Base):
    __tablename__ = "style_summaries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    buyer_id = Column(Integer, ForeignKey("buyers.id"), nullable=False)
    style_name = Column(String, nullable=False, index=True)
    style_id = Column(String, unique=True, nullable=False, index=True)
    product_category = Column(String, nullable=True)
    product_type = Column(String, nullable=True)
    customs_customer_group = Column(String, nullable=True)
    type_of_construction = Column(String, nullable=True)
    gauge = Column(String, nullable=True)
    style_description = Column(Text, nullable=True)
    is_set = Column(Boolean, default=False)
    set_piece_count = Column(Integer, nullable=True)  # Number of pieces in set (2-6)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    buyer = relationship("Buyer")
    variants = relationship("StyleVariant", back_populates="style")
    samples = relationship("Sample", back_populates="style")


class StyleVariant(Base):
    __tablename__ = "style_variants"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    style_summary_id = Column(Integer, ForeignKey("style_summaries.id"), nullable=False)
    style_name = Column(String, nullable=False)
    style_id = Column(String, nullable=False, index=True)
    colour_name = Column(String, nullable=False)  # Used for single-color variants
    colour_code = Column(String, nullable=True)   # Used for single-color variants
    is_multicolor = Column(Boolean, default=False)  # Flag for multi-color variants
    display_name = Column(String, nullable=True)  # Auto-generated display name
    piece_name = Column(String, nullable=True)  # For set pieces (e.g., "Top", "Bottom", "Jacket")
    sizes = Column(JSON, nullable=True)  # Array of sizes (e.g., ["S", "M", "L", "XL"])
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    style = relationship("StyleSummary", back_populates="variants")
    materials = relationship("RequiredMaterial", back_populates="variant")
    color_parts = relationship("VariantColorPart", back_populates="variant", cascade="all, delete-orphan")

    # Property to access style_summary fields
    @property
    def style_category(self):
        return self.style.product_category if self.style else None

    @property
    def gauge(self):
        return self.style.gauge if self.style else None

    @property
    def full_color_description(self):
        """Returns full color description (supports both single and multi-color)"""
        if self.is_multicolor and self.color_parts:
            # Multi-color: "Body: Navy Blue, Collar: White, Sleeves: Red"
            parts = sorted(self.color_parts, key=lambda x: x.sort_order)
            return ", ".join([f"{part.part_name}: {part.colour_name}" for part in parts])
        else:
            # Single color: "Navy Blue"
            return self.colour_name


class VariantColorPart(Base):
    """
    Stores individual color parts for multi-color style variants.
    Example: A polo shirt might have:
      - Body: Navy Blue (#001F3F)
      - Collar: White (#FFFFFF)
      - Sleeves: Red (#FF0000)
    """
    __tablename__ = "style_variant_colors"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    style_variant_id = Column(Integer, ForeignKey("style_variants.id", ondelete="CASCADE"), nullable=False)
    part_name = Column(String, nullable=False)  # e.g., "Body", "Collar", "Sleeves", "Trim", "Lining"
    colour_name = Column(String, nullable=False)  # e.g., "Navy Blue", "White"
    colour_code = Column(String, nullable=True)  # e.g., "#001F3F", "Pantone 19-4052"
    sort_order = Column(Integer, nullable=False, default=0)  # Display order
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    variant = relationship("StyleVariant", back_populates="color_parts")


class RequiredMaterial(Base):
    __tablename__ = "required_materials"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    style_variant_id = Column(Integer, ForeignKey("style_variants.id"), nullable=False)
    style_name = Column(String, nullable=False)
    style_id = Column(String, nullable=False)
    material = Column(String, nullable=False)
    uom = Column(String, nullable=False)  # Unit of Measurement (kg, meter, piece, etc.)
    consumption_per_piece = Column(Float, nullable=False)

    # UOM Conversion fields (optional - only saved if user converts)
    converted_uom = Column(String, nullable=True)  # Converted UOM if different from base
    converted_consumption = Column(Float, nullable=True)  # Converted consumption value

    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    variant = relationship("StyleVariant", back_populates="materials")


class Sample(Base):
    __tablename__ = "samples"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sample_id = Column(String, unique=True, nullable=False, index=True)
    buyer_id = Column(Integer, ForeignKey("buyers.id"), nullable=False)
    style_id = Column(Integer, ForeignKey("style_summaries.id"), nullable=False)
    sample_type = Column(String, nullable=False)  # Proto, Fit, PP, etc.
    sample_description = Column(Text, nullable=True)
    item = Column(String, nullable=True)
    gauge = Column(String, nullable=True)
    worksheet_rcv_date = Column(DateTime(timezone=True), nullable=True)
    yarn_rcv_date = Column(DateTime(timezone=True), nullable=True)
    required_date = Column(DateTime(timezone=True), nullable=True)
    color = Column(String, nullable=True)
    assigned_designer = Column(String, nullable=True)
    required_sample_quantity = Column(Integer, nullable=True)
    round = Column(Integer, default=1)
    notes = Column(Text, nullable=True)

    # Submit status: Approve, Reject and Request for remake, Proceed Next Stage With Comments, Reject & Drop, Drop
    submit_status = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    buyer = relationship("Buyer")
    style = relationship("StyleSummary", back_populates="samples")
    operations = relationship("SampleOperation", back_populates="sample")

    @property
    def buyer_name(self):
        return self.buyer.buyer_name if self.buyer else None

    @property
    def style_name(self):
        return self.style.style_name if self.style else None


class SampleTNA(Base):
    __tablename__ = "sample_tna"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sample_id = Column(String, nullable=False, index=True)  # Removed unique=True to allow multiple records for set pieces
    buyer_name = Column(String, nullable=False)
    style_name = Column(String, nullable=False)
    sample_type = Column(String, nullable=False)
    sample_description = Column(Text, nullable=True)
    item = Column(String, nullable=True)
    gauge = Column(String, nullable=True)
    worksheet_rcv_date = Column(String, nullable=True)
    yarn_rcv_date = Column(String, nullable=True)
    required_date = Column(String, nullable=True)
    color = Column(String, nullable=True)
    piece_name = Column(String, nullable=True)  # For set pieces
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class SamplePlan(Base):
    __tablename__ = "sample_plan"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sample_id = Column(String, nullable=False, index=True)
    buyer_name = Column(String, nullable=False)
    style_name = Column(String, nullable=False)
    sample_type = Column(String, nullable=False)
    sample_description = Column(Text, nullable=True)
    item = Column(String, nullable=True)
    gauge = Column(String, nullable=True)
    worksheet_rcv_date = Column(String, nullable=True)
    yarn_rcv_date = Column(String, nullable=True)
    required_date = Column(String, nullable=True)
    color = Column(String, nullable=True)
    piece_name = Column(String, nullable=True)  # For set pieces
    assigned_designer = Column(String, nullable=True)
    required_sample_quantity = Column(Integer, nullable=True)
    round = Column(Integer, default=1)
    notes = Column(Text, nullable=True)
    submit_status = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class OperationType(Base):
    __tablename__ = "operation_types"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    operation_type = Column(String, nullable=False, index=True)
    operation_name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class SMVCalculation(Base):
    __tablename__ = "smv_calculations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sample_id = Column(String, nullable=False, index=True)
    buyer_name = Column(String, nullable=False)
    style_name = Column(String, nullable=False)
    category = Column(String, nullable=True)
    gauge = Column(String, nullable=True)
    total_smv = Column(Float, nullable=False)
    operations = Column(Text, nullable=True)  # JSON string of operations
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class SampleOperation(Base):
    __tablename__ = "sample_operations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sample_id = Column(Integer, ForeignKey("samples.id"), nullable=False)
    operation_type = Column(String, nullable=False)  # Knitting, Linking, Trimming, Mending, etc.
    name_of_operation = Column(String, nullable=False)  # Front Part, Back Part, Sleeve, etc.
    number_of_operation = Column(Integer, default=1)
    size = Column(String, nullable=True)
    duration = Column(Float, nullable=True)  # in minutes
    total_duration = Column(Float, nullable=True)  # number_of_operation * duration
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    sample = relationship("Sample", back_populates="operations")
