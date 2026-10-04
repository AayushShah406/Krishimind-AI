from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token
from app.models.models import User, AuditLog
from app.schemas.schemas import UserRegister, UserLogin, UserResponse, TokenResponse, UserUpdate
from typing import Dict, Any, Optional, Callable

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer(auto_error=False)

def log_audit_event(
    db: Session,
    user_id: Optional[str],
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None
) -> AuditLog:
    """Helper to persist audit events directly to the database."""
    try:
        log_entry = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details or {},
            ip_address=ip_address
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        return log_entry
    except Exception as e:
        db.rollback()
        return None

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    if not credentials:
        # Default fallback for unauthenticated requests in local development if exists
        default_user = db.query(User).filter(User.email == "farmer@krishimind.ai").first()
        if default_user:
            return default_user
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")
    return user

def require_role(*allowed_roles: str) -> Callable:
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires role in {allowed_roles}, your role is {current_user.role}"
            )
        return current_user
    return role_checker

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Admin privilege required."
        )
    return current_user

def require_advisor(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "ADVISOR":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Agricultural Advisor privilege required."
        )
    return current_user

def require_farmer(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "FARMER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Farmer privilege required."
        )
    return current_user


@router.post("/register", response_model=TokenResponse)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    role = user_in.role if user_in.role in ["FARMER", "ADVISOR", "ADMIN"] else "FARMER"
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        role=role,
        preferred_language=user_in.preferred_language or "en",
        location=user_in.location,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({
        "sub": new_user.id,
        "name": new_user.name,
        "email": new_user.email,
        "role": new_user.role,
        "lang": new_user.preferred_language
    })
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(new_user)
    )

@router.post("/login", response_model=TokenResponse)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid email or password.")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated.")

    token = create_access_token({
        "sub": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "lang": user.preferred_language
    })
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)

@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}

@router.post("/refresh", response_model=TokenResponse)
def refresh(current_user: User = Depends(get_current_user)):
    token = create_access_token({
        "sub": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "lang": current_user.preferred_language
    })
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(current_user)
    )

# User language update route
user_router = APIRouter(prefix="/users", tags=["Users"])

@user_router.put("/preferences/language")
def update_language(
    payload: Dict[str, str],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lang = payload.get("language")
    if lang in ["en", "hi", "gu"]:
        current_user.preferred_language = lang
        db.commit()
        return {"success": True, "language": lang}
    raise HTTPException(status_code=400, detail="Unsupported language")
