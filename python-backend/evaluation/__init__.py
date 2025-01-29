"""
Evaluation package for OutreachGPT.
This package contains all evaluation-related code and test cases.
"""

from .evaluator import OutreachEvaluator
from .test_cases import TestCase, TestTicket

__all__ = ["OutreachEvaluator", "TestCase", "TestTicket"]
