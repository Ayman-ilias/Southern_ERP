from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class StyleSummaryBase(BaseModel):
    buyer_id: int
    style_name: str
    style_id: str
    product_category: Optional[str] = None
    product_type: Optional[str] = None
    customs_customer_group: Optional[str] = None
    type_of_construction: Optional[str] = None
    gauge: Optional[str] = None
    style_description: Optional[str] = None
    is_set: bool = False
    set_piece_count: Optional[int] = None  # Number of pieces in set (2-6)


class StyleSummaryCreate(StyleSummaryBase):
    pass


class StyleSummaryResponse(StyleSummaryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class SampleBase(BaseModel):
    sample_id: str
    buyer_id: int
    style_id: int
    sample_type: str
    sample_description: Optional[str] = None
    item: Optional[str] = None
    gauge: Optional[str] = None
    worksheet_rcv_date: Optional[datetime] = None
    yarn_rcv_date: Optional[datetime] = None
    required_date: Optional[datetime] = None
    color: Optional[str] = None
    assigned_designer: Optional[str] = None
    required_sample_quantity: Optional[int] = None
    round: int = 1
    notes: Optional[str] = None
    submit_status: Optional[str] = None


class SampleCreate(SampleBase):
    pass


class SampleUpdate(BaseModel):
    sample_type: Optional[str] = None
    sample_description: Optional[str] = None
    item: Optional[str] = None
    gauge: Optional[str] = None
    yarn_rcv_date: Optional[datetime] = None
    required_date: Optional[datetime] = None
    color: Optional[str] = None
    assigned_designer: Optional[str] = None
    required_sample_quantity: Optional[int] = None
    notes: Optional[str] = None
    submit_status: Optional[str] = None


class SampleResponse(SampleBase):
    id: int
    created_at: datetime
    buyer_name: Optional[str] = None  # Computed from buyer relationship
    style_name: Optional[str] = None   # Computed from style relationship

    class Config:
        from_attributes = True



class SampleOperationBase(BaseModel):
    sample_id: int
    operation_type: str
    name_of_operation: str
    number_of_operation: int = 1
    size: Optional[str] = None
    duration: Optional[float] = None
    total_duration: Optional[float] = None


class SampleOperationCreate(SampleOperationBase):
    pass


class SampleOperationResponse(SampleOperationBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class SampleTNABase(BaseModel):
    sample_id: str
    buyer_name: str
    style_name: str
    sample_type: str
    sample_description: Optional[str] = None
    item: Optional[str] = None
    gauge: Optional[str] = None
    worksheet_rcv_date: Optional[str] = None
    yarn_rcv_date: Optional[str] = None
    required_date: Optional[str] = None
    color: Optional[str] = None
    piece_name: Optional[str] = None  # For set pieces
    notes: Optional[str] = None


class SampleTNACreate(SampleTNABase):
    pass


class SampleTNAUpdate(BaseModel):
    sample_id: Optional[str] = None
    buyer_name: Optional[str] = None
    style_name: Optional[str] = None
    sample_type: Optional[str] = None
    sample_description: Optional[str] = None
    item: Optional[str] = None
    gauge: Optional[str] = None
    worksheet_rcv_date: Optional[str] = None
    yarn_rcv_date: Optional[str] = None
    required_date: Optional[str] = None
    color: Optional[str] = None
    piece_name: Optional[str] = None
    notes: Optional[str] = None


class SampleTNAResponse(SampleTNABase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class SamplePlanBase(BaseModel):
    sample_id: str
    buyer_name: str
    style_name: str
    sample_type: str
    sample_description: Optional[str] = None
    item: Optional[str] = None
    gauge: Optional[str] = None
    worksheet_rcv_date: Optional[str] = None
    yarn_rcv_date: Optional[str] = None
    required_date: Optional[str] = None
    color: Optional[str] = None
    piece_name: Optional[str] = None  # For set pieces
    assigned_designer: Optional[str] = None
    required_sample_quantity: Optional[int] = None
    round: int = 1
    notes: Optional[str] = None
    submit_status: Optional[str] = None


class SamplePlanCreate(SamplePlanBase):
    pass


class SamplePlanResponse(SamplePlanBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class OperationTypeBase(BaseModel):
    operation_type: str
    operation_name: str


class OperationTypeCreate(OperationTypeBase):
    pass


class OperationTypeResponse(OperationTypeBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class SMVCalculationBase(BaseModel):
    sample_id: str
    buyer_name: str
    style_name: str
    category: Optional[str] = None
    gauge: Optional[str] = None
    total_smv: float
    operations: Optional[str] = None


class SMVCalculationCreate(SMVCalculationBase):
    pass


class SMVCalculationResponse(SMVCalculationBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================
# VARIANT COLOR PART SCHEMAS (Multi-Color Support)
# ============================================

class VariantColorPartBase(BaseModel):
    """Schema for individual color parts of a garment (e.g., Body, Collar, Sleeves)"""
    part_name: str
    colour_name: str
    colour_code: Optional[str] = None
    sort_order: int = 0


class VariantColorPartCreate(VariantColorPartBase):
    style_variant_id: int


class VariantColorPartResponse(VariantColorPartBase):
    id: int
    style_variant_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================
# STYLE VARIANT SCHEMAS (Single & Multi-Color)
# ============================================

class StyleVariantBase(BaseModel):
    style_summary_id: int
    style_name: str
    style_id: str
    colour_name: str  # Used for single-color variants
    colour_code: Optional[str] = None  # Used for single-color variants
    is_multicolor: bool = False
    display_name: Optional[str] = None
    piece_name: Optional[str] = None  # For set pieces (e.g., "Top", "Bottom")
    sizes: Optional[List[str]] = None  # Array of sizes (e.g., ["S", "M", "L"])


class StyleVariantCreate(StyleVariantBase):
    """
    Create a style variant with optional multi-color support

    Examples:
    1. Single Color:
       {
         "style_summary_id": 1,
         "style_name": "Polo Shirt",
         "style_id": "PS-001",
         "colour_name": "Navy Blue",
         "colour_code": "#001F3F",
         "is_multicolor": false
       }

    2. Multi-Color:
       {
         "style_summary_id": 1,
         "style_name": "Polo Shirt",
         "style_id": "PS-001",
         "colour_name": "Multi",  # Placeholder
         "is_multicolor": true,
         "color_parts": [
           {"part_name": "Body", "colour_name": "Navy Blue", "colour_code": "#001F3F", "sort_order": 1},
           {"part_name": "Collar", "colour_name": "White", "colour_code": "#FFFFFF", "sort_order": 2},
           {"part_name": "Sleeves", "colour_name": "Red", "colour_code": "#FF0000", "sort_order": 3}
         ]
       }
    """
    color_parts: Optional[List[VariantColorPartBase]] = None


class StyleVariantUpdate(BaseModel):
    style_summary_id: Optional[int] = None
    style_name: Optional[str] = None
    style_id: Optional[str] = None
    colour_name: Optional[str] = None
    colour_code: Optional[str] = None
    is_multicolor: Optional[bool] = None
    display_name: Optional[str] = None
    piece_name: Optional[str] = None
    sizes: Optional[List[str]] = None
    color_parts: Optional[List[VariantColorPartBase]] = None


class StyleVariantResponse(StyleVariantBase):
    id: int
    created_at: datetime
    style_category: Optional[str] = None  # Computed from style_summary
    gauge: Optional[str] = None  # Computed from style_summary
    color_parts: Optional[List[VariantColorPartResponse]] = []  # List of color parts (for multi-color)
    full_color_description: Optional[str] = None  # Auto-generated description

    class Config:
        from_attributes = True


class RequiredMaterialBase(BaseModel):
    style_variant_id: int
    style_name: str
    style_id: str
    material: str
    uom: str
    consumption_per_piece: float
    converted_uom: Optional[str] = None
    converted_consumption: Optional[float] = None
    remarks: Optional[str] = None


class RequiredMaterialCreate(RequiredMaterialBase):
    pass


class RequiredMaterialUpdate(BaseModel):
    style_variant_id: Optional[int] = None
    style_name: Optional[str] = None
    style_id: Optional[str] = None
    material: Optional[str] = None
    uom: Optional[str] = None
    consumption_per_piece: Optional[float] = None
    converted_uom: Optional[str] = None
    converted_consumption: Optional[float] = None
    remarks: Optional[str] = None


class RequiredMaterialResponse(RequiredMaterialBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
