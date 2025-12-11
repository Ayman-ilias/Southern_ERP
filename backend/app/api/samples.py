from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List
from ..core import get_db
from ..core.logging import setup_logging
from ..models import Sample, SampleOperation, StyleSummary, StyleVariant, RequiredMaterial, SampleTNA, SamplePlan, OperationType, SMVCalculation
from ..schemas import (
    SampleCreate, SampleResponse, SampleUpdate,
    SampleOperationCreate, SampleOperationResponse,
    StyleSummaryCreate, StyleSummaryResponse,
    StyleVariantCreate, StyleVariantResponse, StyleVariantUpdate,
    RequiredMaterialCreate, RequiredMaterialResponse, RequiredMaterialUpdate,
    SampleTNACreate, SampleTNAResponse, SampleTNAUpdate,
    SamplePlanCreate, SamplePlanResponse,
    OperationTypeCreate, OperationTypeResponse,
    SMVCalculationCreate, SMVCalculationResponse
)

logger = setup_logging()

router = APIRouter()


# Style Summary endpoints
@router.post("/styles", response_model=StyleSummaryResponse, status_code=status.HTTP_201_CREATED)
def create_style(style_data: StyleSummaryCreate, db: Session = Depends(get_db)):
    """Create a new style summary"""
    new_style = StyleSummary(**style_data.model_dump())
    db.add(new_style)
    db.commit()
    db.refresh(new_style)
    return new_style


@router.get("/styles", response_model=List[StyleSummaryResponse])
def get_styles(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=1000, ge=1, le=10000),
    db: Session = Depends(get_db)
):
    """Get all style summaries (max 10000 per request)"""
    styles = db.query(StyleSummary).order_by(StyleSummary.id.desc()).offset(skip).limit(limit).all()
    return styles


@router.get("/styles/{style_id}", response_model=StyleSummaryResponse)
def get_style(style_id: int, db: Session = Depends(get_db)):
    """Get a specific style summary"""
    style = db.query(StyleSummary).filter(StyleSummary.id == style_id).first()
    if not style:
        raise HTTPException(status_code=404, detail="Style not found")
    return style


@router.put("/styles/{style_id}", response_model=StyleSummaryResponse)
def update_style(style_id: int, style_data: StyleSummaryCreate, db: Session = Depends(get_db)):
    """Update a style summary"""
    try:
        style = db.query(StyleSummary).filter(StyleSummary.id == style_id).first()
        if not style:
            raise HTTPException(status_code=404, detail="Style not found")

        for key, value in style_data.model_dump(exclude_unset=True).items():
            setattr(style, key, value)

        db.commit()
        db.refresh(style)
        return style
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Style update error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update style")


@router.delete("/styles/{style_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_style(style_id: int, db: Session = Depends(get_db)):
    """Delete a style summary"""
    style = db.query(StyleSummary).filter(StyleSummary.id == style_id).first()
    if not style:
        raise HTTPException(status_code=404, detail="Style not found")

    # Check if there are related samples
    samples_count = db.query(Sample).filter(Sample.style_id == style_id).count()
    if samples_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete style. {samples_count} sample(s) are using this style."
        )

    # Check if there are related style variants
    variants_count = db.query(StyleVariant).filter(StyleVariant.style_summary_id == style_id).count()
    if variants_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete style. {variants_count} style variant(s) are using this style."
        )

    db.delete(style)
    db.commit()
    return None


# Style Variant endpoints - MUST come before /{sample_id} route
@router.post("/style-variants", response_model=StyleVariantResponse, status_code=status.HTTP_201_CREATED)
def create_style_variant(variant_data: StyleVariantCreate, db: Session = Depends(get_db)):
    """Create a new style variant"""
    try:
        # Exclude color_parts since it's a relationship, not a column
        variant_dict = variant_data.model_dump(exclude={'color_parts'})
        new_variant = StyleVariant(**variant_dict)
        db.add(new_variant)
        db.commit()
        db.refresh(new_variant)
        return new_variant
    except Exception as e:
        db.rollback()
        logger.error(f"Style variant creation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create style variant")


@router.get("/style-variants", response_model=List[StyleVariantResponse])
def get_style_variants(
    style_summary_id: int = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=1000, ge=1, le=10000),
    db: Session = Depends(get_db)
):
    """Get all style variants (max 10000 per request), optionally filtered by style summary"""
    query = db.query(StyleVariant).options(joinedload(StyleVariant.style))
    if style_summary_id:
        query = query.filter(StyleVariant.style_summary_id == style_summary_id)
    variants = query.order_by(StyleVariant.id.desc()).offset(skip).limit(limit).all()
    return variants


@router.get("/style-variants/{variant_id}", response_model=StyleVariantResponse)
def get_style_variant(variant_id: int, db: Session = Depends(get_db)):
    """Get a specific style variant"""
    variant = db.query(StyleVariant).filter(StyleVariant.id == variant_id).first()
    if not variant:
        raise HTTPException(status_code=404, detail="Style variant not found")
    return variant


@router.put("/style-variants/{variant_id}", response_model=StyleVariantResponse)
def update_style_variant(variant_id: int, variant_data: StyleVariantUpdate, db: Session = Depends(get_db)):
    """Update a style variant"""
    try:
        variant = db.query(StyleVariant).filter(StyleVariant.id == variant_id).first()
        if not variant:
            raise HTTPException(status_code=404, detail="Style variant not found")

        for key, value in variant_data.model_dump(exclude_unset=True).items():
            setattr(variant, key, value)

        db.commit()
        db.refresh(variant)
        return variant
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Style variant update error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update style variant")


@router.delete("/style-variants/{variant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_style_variant(variant_id: int, db: Session = Depends(get_db)):
    """Delete a style variant"""
    variant = db.query(StyleVariant).filter(StyleVariant.id == variant_id).first()
    if not variant:
        raise HTTPException(status_code=404, detail="Style variant not found")

    db.delete(variant)
    db.commit()
    return None


# Required Material endpoints - MUST come before /{sample_id} route
@router.post("/required-materials", response_model=RequiredMaterialResponse, status_code=status.HTTP_201_CREATED)
def create_required_material(material_data: RequiredMaterialCreate, db: Session = Depends(get_db)):
    """Create a new required material"""
    try:
        new_material = RequiredMaterial(**material_data.model_dump())
        db.add(new_material)
        db.commit()
        db.refresh(new_material)
        return new_material
    except Exception as e:
        db.rollback()
        logger.error(f"Required material creation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create required material")


@router.get("/required-materials", response_model=List[RequiredMaterialResponse])
def get_required_materials(style_variant_id: int = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all required materials, optionally filtered by style variant"""
    query = db.query(RequiredMaterial)
    if style_variant_id:
        query = query.filter(RequiredMaterial.style_variant_id == style_variant_id)
    materials = query.order_by(RequiredMaterial.id.desc()).offset(skip).limit(limit).all()
    return materials


@router.get("/required-materials/{material_id}", response_model=RequiredMaterialResponse)
def get_required_material(material_id: int, db: Session = Depends(get_db)):
    """Get a specific required material"""
    material = db.query(RequiredMaterial).filter(RequiredMaterial.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Required material not found")
    return material


@router.put("/required-materials/{material_id}", response_model=RequiredMaterialResponse)
def update_required_material(material_id: int, material_data: RequiredMaterialUpdate, db: Session = Depends(get_db)):
    """Update a required material"""
    try:
        material = db.query(RequiredMaterial).filter(RequiredMaterial.id == material_id).first()
        if not material:
            raise HTTPException(status_code=404, detail="Required material not found")

        for key, value in material_data.model_dump(exclude_unset=True).items():
            setattr(material, key, value)

        db.commit()
        db.refresh(material)
        return material
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Required material update error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update required material")


@router.delete("/required-materials/{material_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_required_material(material_id: int, db: Session = Depends(get_db)):
    """Delete a required material"""
    material = db.query(RequiredMaterial).filter(RequiredMaterial.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Required material not found")

    db.delete(material)
    db.commit()
    return None


# TNA endpoints - MUST come before /{sample_id} route
@router.post("/tna", response_model=SampleTNAResponse, status_code=status.HTTP_201_CREATED)
def create_tna(tna_data: SampleTNACreate, db: Session = Depends(get_db)):
    """Create a new TNA record"""
    new_tna = SampleTNA(**tna_data.model_dump())
    db.add(new_tna)
    db.commit()
    db.refresh(new_tna)
    return new_tna


@router.get("/tna", response_model=List[SampleTNAResponse])
def get_tna_records(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all TNA records"""
    tna_records = db.query(SampleTNA).order_by(SampleTNA.id.desc()).offset(skip).limit(limit).all()
    return tna_records


@router.put("/tna/{tna_id}", response_model=SampleTNAResponse)
def update_tna(tna_id: int, tna_data: SampleTNAUpdate, db: Session = Depends(get_db)):
    """Update a TNA record by ID"""
    try:
        tna = db.query(SampleTNA).filter(SampleTNA.id == tna_id).first()
        if not tna:
            raise HTTPException(status_code=404, detail="TNA record not found")

        for key, value in tna_data.model_dump(exclude_unset=True).items():
            setattr(tna, key, value)

        db.commit()
        db.refresh(tna)
        return tna
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"TNA update error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update TNA record")


@router.delete("/tna/{tna_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tna(tna_id: int, db: Session = Depends(get_db)):
    """Delete a TNA record by ID"""
    tna = db.query(SampleTNA).filter(SampleTNA.id == tna_id).first()
    if not tna:
        raise HTTPException(status_code=404, detail="TNA record not found")

    db.delete(tna)
    db.commit()
    return None


@router.get("/tna/{sample_id}", response_model=SampleTNAResponse)
def get_tna_by_sample_id(sample_id: str, db: Session = Depends(get_db)):
    """Get TNA record by sample ID"""
    tna = db.query(SampleTNA).filter(SampleTNA.sample_id == sample_id).first()
    if not tna:
        raise HTTPException(status_code=404, detail="TNA record not found")
    return tna


# Plan endpoints - MUST come before /{sample_id} route
@router.post("/plan", response_model=SamplePlanResponse, status_code=status.HTTP_201_CREATED)
def create_plan(plan_data: SamplePlanCreate, db: Session = Depends(get_db)):
    """Create a new Plan record"""
    # Check if plan already exists for this sample_id
    existing_plan = db.query(SamplePlan).filter(SamplePlan.sample_id == plan_data.sample_id).first()

    if existing_plan:
        # Update existing plan
        for key, value in plan_data.model_dump().items():
            setattr(existing_plan, key, value)
        db.commit()
        db.refresh(existing_plan)
        return existing_plan
    else:
        # Create new plan
        new_plan = SamplePlan(**plan_data.model_dump())
        db.add(new_plan)
        db.commit()
        db.refresh(new_plan)
        return new_plan


@router.get("/plan", response_model=List[SamplePlanResponse])
def get_plan_records(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all Plan records"""
    plan_records = db.query(SamplePlan).order_by(SamplePlan.id.desc()).offset(skip).limit(limit).all()
    return plan_records


@router.get("/plan/{sample_id}", response_model=SamplePlanResponse)
def get_plan_by_sample_id(sample_id: str, db: Session = Depends(get_db)):
    """Get Plan record by sample ID"""
    plan = db.query(SamplePlan).filter(SamplePlan.sample_id == sample_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan record not found")
    return plan


# Operation Type endpoints (for Add New Operation page) - MUST come before /{sample_id} route
@router.post("/operations-master", response_model=OperationTypeResponse, status_code=status.HTTP_201_CREATED)
def create_operation_type(operation_data: OperationTypeCreate, db: Session = Depends(get_db)):
    """Create a new operation type"""
    new_operation = OperationType(**operation_data.model_dump())
    db.add(new_operation)
    db.commit()
    db.refresh(new_operation)
    return new_operation


@router.get("/operations-master", response_model=List[OperationTypeResponse])
def get_operation_types(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all operation types"""
    operations = db.query(OperationType).order_by(OperationType.id.desc()).offset(skip).limit(limit).all()
    return operations


@router.put("/operations-master/{operation_id}", response_model=OperationTypeResponse)
def update_operation_type(operation_id: int, operation_data: OperationTypeCreate, db: Session = Depends(get_db)):
    """Update an operation type"""
    operation = db.query(OperationType).filter(OperationType.id == operation_id).first()
    if not operation:
        raise HTTPException(status_code=404, detail="Operation type not found")

    for key, value in operation_data.model_dump().items():
        setattr(operation, key, value)

    db.commit()
    db.refresh(operation)
    return operation


@router.delete("/operations-master/{operation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_operation_type(operation_id: int, db: Session = Depends(get_db)):
    """Delete an operation type"""
    operation = db.query(OperationType).filter(OperationType.id == operation_id).first()
    if not operation:
        raise HTTPException(status_code=404, detail="Operation type not found")

    db.delete(operation)
    db.commit()
    return None


# SMV Calculation endpoints - MUST come before /{sample_id} route
@router.post("/smv", response_model=SMVCalculationResponse, status_code=status.HTTP_201_CREATED)
def create_smv_calculation(smv_data: SMVCalculationCreate, db: Session = Depends(get_db)):
    """Create a new SMV calculation"""
    new_smv = SMVCalculation(**smv_data.model_dump())
    db.add(new_smv)
    db.commit()
    db.refresh(new_smv)
    return new_smv


@router.get("/smv", response_model=List[SMVCalculationResponse])
def get_smv_calculations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all SMV calculations"""
    smv_records = db.query(SMVCalculation).order_by(SMVCalculation.id.desc()).offset(skip).limit(limit).all()
    return smv_records


@router.get("/smv/{sample_id}", response_model=SMVCalculationResponse)
def get_smv_by_sample_id(sample_id: str, db: Session = Depends(get_db)):
    """Get SMV calculation by sample ID"""
    smv = db.query(SMVCalculation).filter(SMVCalculation.sample_id == sample_id).first()
    if not smv:
        raise HTTPException(status_code=404, detail="SMV calculation not found")
    return smv


# Sample Operation endpoints - MUST come before /{sample_id} route
@router.post("/operations", response_model=SampleOperationResponse, status_code=status.HTTP_201_CREATED)
def create_sample_operation(operation_data: SampleOperationCreate, db: Session = Depends(get_db)):
    """Create a new sample operation"""
    # Calculate total_duration
    operation_dict = operation_data.model_dump()
    if operation_dict.get('duration') and operation_dict.get('number_of_operation'):
        operation_dict['total_duration'] = operation_dict['duration'] * operation_dict['number_of_operation']

    new_operation = SampleOperation(**operation_dict)
    db.add(new_operation)
    db.commit()
    db.refresh(new_operation)
    return new_operation


@router.get("/operations", response_model=List[SampleOperationResponse])
def get_sample_operations(sample_id: int = None, db: Session = Depends(get_db)):
    """Get all sample operations"""
    query = db.query(SampleOperation)
    if sample_id:
        query = query.filter(SampleOperation.sample_id == sample_id)
    return query.order_by(SampleOperation.id.desc()).all()


@router.get("/operations/{operation_id}", response_model=SampleOperationResponse)
def get_sample_operation(operation_id: int, db: Session = Depends(get_db)):
    """Get a specific sample operation"""
    operation = db.query(SampleOperation).filter(SampleOperation.id == operation_id).first()
    if not operation:
        raise HTTPException(status_code=404, detail="Sample operation not found")
    return operation


@router.put("/operations/{operation_id}", response_model=SampleOperationResponse)
def update_sample_operation(operation_id: int, operation_data: SampleOperationCreate, db: Session = Depends(get_db)):
    """Update a sample operation"""
    operation = db.query(SampleOperation).filter(SampleOperation.id == operation_id).first()
    if not operation:
        raise HTTPException(status_code=404, detail="Sample operation not found")

    operation_dict = operation_data.model_dump()
    if operation_dict.get('duration') and operation_dict.get('number_of_operation'):
        operation_dict['total_duration'] = operation_dict['duration'] * operation_dict['number_of_operation']

    for key, value in operation_dict.items():
        setattr(operation, key, value)

    db.commit()
    db.refresh(operation)
    return operation


@router.delete("/operations/{operation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sample_operation(operation_id: int, db: Session = Depends(get_db)):
    """Delete a sample operation"""
    operation = db.query(SampleOperation).filter(SampleOperation.id == operation_id).first()
    if not operation:
        raise HTTPException(status_code=404, detail="Sample operation not found")

    db.delete(operation)
    db.commit()
    return None


# Sample endpoints - MUST come AFTER all specific routes (/tna, /plan, /operations, etc.)
@router.post("/", response_model=SampleResponse, status_code=status.HTTP_201_CREATED)
def create_sample(sample_data: SampleCreate, db: Session = Depends(get_db)):
    """Create a new sample"""
    try:
        new_sample = Sample(**sample_data.model_dump())
        db.add(new_sample)
        db.commit()
        db.refresh(new_sample)
        return new_sample
    except Exception as e:
        db.rollback()
        logger.error(f"Sample creation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create sample")


@router.get("/", response_model=List[SampleResponse])
def get_samples(
    buyer_id: int = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all samples (max 100 per request), optionally filtered by buyer"""
    query = db.query(Sample)
    if buyer_id:
        query = query.filter(Sample.buyer_id == buyer_id)
    samples = query.options(joinedload(Sample.buyer), joinedload(Sample.style)).order_by(Sample.id.desc()).offset(skip).limit(limit).all()
    return samples


@router.get("/by-sample-id/{sample_id_str}", response_model=SampleResponse)
def get_sample_by_sample_id(sample_id_str: str, db: Session = Depends(get_db)):
    """Get a sample by its sample_id string"""
    sample = db.query(Sample).filter(Sample.sample_id == sample_id_str).first()
    if not sample:
        raise HTTPException(status_code=404, detail="Sample not found")
    
    # Add buyer_name and style_name from relationships (handled by model properties)
    return sample


@router.put("/{sample_id}", response_model=SampleResponse)
def update_sample(sample_id: int, sample_data: SampleUpdate, db: Session = Depends(get_db)):
    """Update a sample"""
    try:
        sample = db.query(Sample).filter(Sample.id == sample_id).first()
        if not sample:
            raise HTTPException(status_code=404, detail="Sample not found")

        # Handle submit status change - increment round if status is "Reject and Request for remake"
        if sample_data.submit_status == "Reject and Request for remake":
            sample.round += 1

        for key, value in sample_data.model_dump(exclude_unset=True).items():
            setattr(sample, key, value)

        db.commit()
        db.refresh(sample)
        
        # Add buyer_name and style_name from relationships (handled by model properties)
        return sample
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Sample update error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update sample")


@router.delete("/{sample_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sample(sample_id: int, db: Session = Depends(get_db)):
    """Delete a sample"""
    sample = db.query(Sample).filter(Sample.id == sample_id).first()
    if not sample:
        raise HTTPException(status_code=404, detail="Sample not found")

    db.delete(sample)
    db.commit()
    return None


# Generic GET by ID - MUST be last to avoid catching specific routes
@router.get("/{sample_id}", response_model=SampleResponse)
def get_sample(sample_id: int, db: Session = Depends(get_db)):
    """Get a specific sample by numeric ID"""
    sample = db.query(Sample).filter(Sample.id == sample_id).first()
    if not sample:
        raise HTTPException(status_code=404, detail="Sample not found")
    
    # Add buyer_name and style_name from relationships (handled by model properties)
    return sample

