"""
Configuration for LangSmith integration.
This file contains settings and configuration for LangSmith tracking and evaluation.
"""

import os
from typing import Optional
from dataclasses import dataclass


@dataclass
class LangSmithConfig:
    """Configuration class for LangSmith settings"""

    api_key: str = os.getenv("LANGSMITH_API_KEY", "")
    project_name: str = "outreach-gpt-eval"
    api_url: str = "https://api.smith.langchain.com"

    @property
    def is_configured(self) -> bool:
        """Check if LangSmith is properly configured"""
        return bool(self.api_key)


# Create global config instance
langsmith_config = LangSmithConfig()
