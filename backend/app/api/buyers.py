from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List
from ..core import get_db
from ..core.logging import setup_logging
from ..models import Buyer, ContactPerson, ShippingInfo, BankingInfo
from ..schemas import (
    BuyerCreate, BuyerResponse, BuyerUpdate,
    ContactPersonCreate, ContactPersonResponse,
    ShippingInfoCreate, ShippingInfoResponse,
    BankingInfoCreate, BankingInfoResponse
)

logger = setup_logging()

router = APIRouter()


# Contact Person endpoints
@router.post("/contacts", response_model=ContactPersonResponse, status_code=status.HTTP_201_CREATED)
def create_contact(contact_data: ContactPersonCreate, db: Session = Depends(get_db)):
    """Create a new contact person"""
    new_contact = ContactPerson(**contact_data.model_dump())
    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)
    return new_contact


@router.get("/contacts", response_model=List[ContactPersonResponse])
def get_contacts(buyer_id: int = None, db: Session = Depends(get_db)):
    """Get all contact persons, optionally filtered by buyer"""
    query = db.query(ContactPerson)
    if buyer_id:
        query = query.filter(ContactPerson.buyer_id == buyer_id)
    return query.order_by(ContactPerson.id.desc()).all()


# Shipping Info endpoints
@router.post("/shipping", response_model=ShippingInfoResponse, status_code=status.HTTP_201_CREATED)
def create_shipping_info(shipping_data: ShippingInfoCreate, db: Session = Depends(get_db)):
    """Create shipping information"""
    new_shipping = ShippingInfo(**shipping_data.model_dump())
    db.add(new_shipping)
    db.commit()
    db.refresh(new_shipping)
    return new_shipping


@router.get("/shipping", response_model=List[ShippingInfoResponse])
def get_shipping_info(buyer_id: int = None, db: Session = Depends(get_db)):
    """Get all shipping information"""
    query = db.query(ShippingInfo)
    if buyer_id:
        query = query.filter(ShippingInfo.buyer_id == buyer_id)
    return query.options(joinedload(ShippingInfo.buyer)).order_by(ShippingInfo.id.desc()).all()


# Banking Info endpoints
@router.post("/banking", response_model=BankingInfoResponse, status_code=status.HTTP_201_CREATED)
def create_banking_info(banking_data: BankingInfoCreate, db: Session = Depends(get_db)):
    """Create banking information"""
    new_banking = BankingInfo(**banking_data.model_dump())
    db.add(new_banking)
    db.commit()
    db.refresh(new_banking)
    return new_banking


@router.get("/banking", response_model=List[BankingInfoResponse])
def get_banking_info(db: Session = Depends(get_db)):
    """Get all banking information"""
    return db.query(BankingInfo).order_by(BankingInfo.id.desc()).all()


@router.delete("/banking/{banking_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_banking_info(banking_id: int, db: Session = Depends(get_db)):
    """Delete banking information"""
    banking = db.query(BankingInfo).filter(BankingInfo.id == banking_id).first()
    if not banking:
        raise HTTPException(status_code=404, detail="Banking info not found")

    db.delete(banking)
    db.commit()
    return None


# Buyer endpoints
@router.post("/", response_model=BuyerResponse, status_code=status.HTTP_201_CREATED)
def create_buyer(buyer_data: BuyerCreate, db: Session = Depends(get_db)):
    """Create a new buyer"""
    try:
        new_buyer = Buyer(**buyer_data.model_dump())
        db.add(new_buyer)
        db.commit()
        db.refresh(new_buyer)
        return new_buyer
    except Exception as e:
        db.rollback()
        logger.error(f"Buyer creation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create buyer")


@router.get("/", response_model=List[BuyerResponse])
def get_buyers(
    skip: int = Query(default=0, ge=0, description="Number of records to skip"),
    limit: int = Query(default=20, ge=1, le=100, description="Max 100 records per request"),
    db: Session = Depends(get_db)
):
    """Get all buyers with pagination (max 100 per request)"""
    buyers = db.query(Buyer).order_by(Buyer.id.desc()).offset(skip).limit(limit).all()
    return buyers


@router.get("/{buyer_id}", response_model=BuyerResponse)
def get_buyer(buyer_id: int, db: Session = Depends(get_db)):
    """Get a specific buyer"""
    buyer = db.query(Buyer).filter(Buyer.id == buyer_id).first()
    if not buyer:
        raise HTTPException(status_code=404, detail="Buyer not found")
    return buyer


@router.put("/{buyer_id}", response_model=BuyerResponse)
def update_buyer(buyer_id: int, buyer_data: BuyerUpdate, db: Session = Depends(get_db)):
    """Update a buyer"""
    try:
        buyer = db.query(Buyer).filter(Buyer.id == buyer_id).first()
        if not buyer:
            raise HTTPException(status_code=404, detail="Buyer not found")

        for key, value in buyer_data.model_dump(exclude_unset=True).items():
            setattr(buyer, key, value)

        db.commit()
        db.refresh(buyer)
        return buyer
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Buyer update error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update buyer")


@router.delete("/{buyer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_buyer(buyer_id: int, db: Session = Depends(get_db)):
    """Delete a buyer"""
    try:
        buyer = db.query(Buyer).filter(Buyer.id == buyer_id).first()
        if not buyer:
            raise HTTPException(status_code=404, detail="Buyer not found")

        db.delete(buyer)
        db.commit()
        return None
    except Exception as e:
        db.rollback()
        error_msg = str(e)
        if "foreign key constraint" in error_msg.lower():
            raise HTTPException(
                status_code=400,
                detail="Cannot delete buyer. This buyer has related records (styles, contacts, shipping info, etc.). Please delete those first or contact administrator."
            )
        raise HTTPException(status_code=500, detail=f"Failed to delete buyer: {error_msg}")
