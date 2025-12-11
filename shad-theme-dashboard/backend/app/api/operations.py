from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..core import get_db
from ..models import OperationMaster, SMVSettings, StyleSMV

router = APIRouter()


@router.get("/")
def get_operations(db: Session = Depends(get_db)):
    """Get all operations"""
    operations = db.query(OperationMaster).order_by(OperationMaster.id.desc()).all()
    return operations


@router.get("/smv-settings")
def get_smv_settings(db: Session = Depends(get_db)):
    """Get SMV settings"""
    settings = db.query(SMVSettings).order_by(SMVSettings.id.desc()).all()
    return settings
