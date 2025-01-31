from fastapi import APIRouter, HTTPException, Depends
from typing import Dict
from agents.resolution_agent import ResolutionAgent
from utils.auth import get_user_id
from pydantic import BaseModel

router = APIRouter()
resolution_agent = ResolutionAgent()


class ResolutionCommand(BaseModel):
    command: str
    ticket_id: str


@router.post("/resolve")
async def resolve_ticket(
    command: ResolutionCommand, user_id: str = Depends(get_user_id)
) -> Dict:
    """Process a natural language command to resolve a ticket"""
    try:
        result = await resolution_agent.process_command(
            command=command.command, ticket_id=command.ticket_id, author_id=user_id
        )
        return result
    except Exception as e:
        print(f"Error in resolve_ticket route: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
