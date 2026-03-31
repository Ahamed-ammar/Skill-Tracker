import logging
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError

from models.schemas import UserRegister, UserLogin, TokenResponse, UserOut
from db.database import create_user, get_user_by_email, get_user_by_id
from services.auth_service import hash_password, verify_password, create_access_token, decode_token

log = logging.getLogger("curator.auth")
router = APIRouter()
bearer_scheme = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> UserOut:
    token = credentials.credentials
    try:
        payload = decode_token(token)
        user_id = int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = get_user_by_id(user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found")

    return UserOut(id=user.id, email=user.email, created_at=user.created_at)


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(payload: UserRegister):
    if get_user_by_email(payload.email):
        raise HTTPException(status_code=409, detail="Email already registered")

    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    user = create_user(payload.email, hash_password(payload.password))
    log.info("register: new user id=%d email=%s", user.id, user.email)
    token = create_access_token(user.id, user.email)
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin):
    user = get_user_by_email(payload.email)
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    log.info("login: user id=%d email=%s", user.id, user.email)
    token = create_access_token(user.id, user.email)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserOut)
def me(current_user: UserOut = Depends(get_current_user)):
    return current_user
