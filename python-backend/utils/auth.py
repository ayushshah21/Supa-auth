from fastapi import HTTPException, Header
from typing import Optional
from .db import supabase


async def get_user_id(authorization: Optional[str] = Header(None)) -> str:
    """Extract and verify user ID from the authorization header."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    try:
        # Remove 'Bearer ' prefix if present
        token = authorization.replace("Bearer ", "")

        # Verify the JWT token
        response = supabase.auth.get_user(token)
        if not response.user:
            raise HTTPException(status_code=401, detail="Invalid token")

        return response.user.id
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
