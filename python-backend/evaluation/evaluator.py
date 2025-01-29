"""
Evaluator for Clothing CRM responses.
Handles both automated and manual evaluation with LangSmith integration.
"""

from typing import Dict, Any, List, Optional
from langsmith import Client
import time
import uuid
import logging
from datetime import datetime
import re

from config.langsmith_config import langsmith_config
from evaluation.test_cases import TestCase, ExpectedDatabaseChange

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class OutreachEvaluator:
    """Evaluator class for Clothing CRM responses"""

    def __init__(self):
        """Initialize the evaluator with LangSmith configuration"""
        if not langsmith_config.is_configured:
            raise ValueError("LangSmith API key not configured")

        self.client = Client(
            api_url=langsmith_config.api_url, api_key=langsmith_config.api_key
        )

    def create_run(self, test_case: TestCase) -> Dict[str, Any]:
        """Create a new evaluation run in LangSmith"""
        run_id = str(uuid.uuid4())

        try:
            self.client.create_run(
                name=f"CRM Test {test_case.id} - {test_case.request_type.value}",
                run_type="chain",
                id=run_id,
                inputs={
                    "request": test_case.request,
                    "context": test_case.context,
                    "request_type": test_case.request_type.value,
                },
                tags=[test_case.complexity.lower(), test_case.request_type.value],
                start_time=datetime.now(),
            )
        except Exception as e:
            logger.error(f"Error creating LangSmith run: {str(e)}")
            # Return a valid run ID even if LangSmith fails
            pass

        return {"id": run_id}

    def evaluate_response(
        self, test_case: TestCase, generated_response: str, run: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Evaluate a generated response against test criteria"""
        start_time = time.time()

        logger.info("Starting evaluation...")
        logger.info(f"Test case type: {test_case.request_type.value}")
        logger.info(f"Test case criteria: {test_case.success_criteria}")
        logger.info(f"Generated response:\n{generated_response}")

        # Store the actual response for manual review
        test_case.actual_response = generated_response

        # Check each success criterion
        criteria_results = []
        for criterion in test_case.success_criteria:
            is_met = self._check_criterion(generated_response, criterion, test_case)
            logger.info(f"Criterion '{criterion}': {'✓' if is_met else '✗'}")
            criteria_results.append({"criterion": criterion, "met": is_met})

        # Calculate automated success rate
        success_rate = len([c for c in criteria_results if c["met"]]) / len(
            criteria_results
        )
        logger.info(f"Automated success rate: {success_rate:.2%}")

        # Calculate response time
        response_time = time.time() - start_time

        # Update LangSmith run
        try:
            self.client.update_run(
                run_id=run["id"],
                outputs={
                    "generated_response": generated_response,
                    "criteria_results": criteria_results,
                    "success_rate": success_rate,
                    "response_time": response_time,
                    "expected_db_changes": [
                        {
                            "table": change.table,
                            "operation": change.operation,
                            "fields": change.fields,
                            "conditions": change.conditions,
                        }
                        for change in test_case.expected_db_changes
                    ],
                },
                end_time=datetime.now(),
            )
        except Exception as e:
            logger.error(f"Error updating LangSmith run: {str(e)}")

        return {
            "success_rate": success_rate,
            "criteria_results": criteria_results,
            "response_time": response_time,
            "requires_manual_review": test_case.complexity == "COMPLEX",
        }

    def record_manual_evaluation(
        self,
        test_case: TestCase,
        human_rating: float,
        evaluation_notes: str,
        evaluator_id: str,
        run: Dict[str, Any],
    ) -> None:
        """Record manual evaluation results"""
        test_case.human_rating = human_rating
        test_case.manual_evaluation_notes = evaluation_notes
        test_case.evaluator_id = evaluator_id
        test_case.evaluation_timestamp = datetime.now()

        # Update LangSmith run with manual evaluation
        try:
            self.client.update_run(
                run_id=run["id"],
                outputs={
                    "human_rating": human_rating,
                    "evaluation_notes": evaluation_notes,
                    "evaluator_id": evaluator_id,
                },
            )
        except Exception as e:
            logger.error(
                f"Error updating LangSmith run with manual evaluation: {str(e)}"
            )

        logger.info(f"Manual evaluation recorded - Rating: {human_rating:.2f}")
        logger.info(f"Evaluation notes: {evaluation_notes}")

    def _check_criterion(
        self, response: str, criterion: str, test_case: TestCase
    ) -> bool:
        """
        Check if a response meets a specific criterion.
        Uses multiple strategies to check if the criterion is met.
        """
        # Clean and normalize the text
        response = response.strip().lower()
        criterion = criterion.strip().lower()

        # Strategy 1: Direct substring match
        if criterion in response:
            return True

        # Strategy 2: Check for word presence
        response_words = set(response.split())
        criterion_words = set(criterion.split())

        # If all words in the criterion appear in the response
        if criterion_words.issubset(response_words):
            return True

        # Strategy 3: Check for specific criteria
        if criterion == "professional tone":
            professional_phrases = [
                "best regards",
                "sincerely",
                "thank you",
                "regards",
                "please",
                "kindly",
            ]
            return any(phrase in response for phrase in professional_phrases)

        if criterion == "correctly identifies product":
            logger.info("Checking product identification...")
            logger.info(f"Context: {test_case.context}")
            logger.info(f"Response: {response}")

            # Extract product details from context
            product_details = []
            if "product_id" in test_case.context:
                # Parse product ID (e.g., "DNM32-BLU" -> "denim", "blue", "32")
                pid = test_case.context["product_id"].lower()
                parts = re.findall(r"[a-z]+|\d+", pid)
                product_details.extend(parts)
                logger.info(f"Product ID parts: {parts}")

            # Add all string values from context
            context_values = [
                str(v).lower()
                for v in test_case.context.values()
                if isinstance(v, (str, int))
            ]
            product_details.extend(context_values)
            logger.info(f"All product details: {product_details}")

            # Check for key product identifiers
            # For inventory update, we need the product type, color, and size
            product_type_terms = ["denim", "jeans"]
            color_terms = ["blue", "blu"]
            size_terms = ["32", "size 32"]

            has_product_type = any(term in response for term in product_type_terms)
            has_color = any(term in response for term in color_terms)
            has_size = any(term in response for term in size_terms)

            logger.info(
                f"Product type found: {has_product_type}, "
                f"Color found: {has_color}, "
                f"Size found: {has_size}"
            )

            return has_product_type and has_color and has_size

        if criterion == "updates correct quantity":
            logger.info("Checking quantity update...")
            # Find the target quantity from the database changes
            target_quantity = None
            for change in test_case.expected_db_changes:
                if (
                    change.table == "inventory"
                    and change.operation == "UPDATE"
                    and "stock_quantity" in change.fields
                ):
                    target_quantity = change.fields["stock_quantity"]
                    break

            if target_quantity is None:
                logger.warning("No target quantity found in expected database changes")
                return False

            logger.info(f"Looking for quantity: {target_quantity}")

            # Look for the quantity in the response
            quantity_patterns = [
                rf"\b{target_quantity}\s*(?:units?|items?|pieces?|stock)\b",
                rf"\bset\s*(?:to|at)\s*{target_quantity}\b",
                rf"\bupdated\s*(?:to)?\s*{target_quantity}\b",
            ]

            for pattern in quantity_patterns:
                if re.search(pattern, response):
                    logger.info(f"Found quantity match with pattern: {pattern}")
                    return True

            return False

        if "references" in criterion:
            # Check if specific references are included
            reference_terms = criterion.split()[1:]  # Skip the word "references"
            return any(term.lower() in response for term in reference_terms)

        if criterion == "provides reasoning":
            reasoning_indicators = [
                "because",
                "since",
                "as",
                "therefore",
                "this ensures",
                "this will",
            ]
            return any(indicator in response for indicator in reasoning_indicators)

        if criterion == "verifies return eligibility":
            eligibility_terms = [
                "within",
                "window",
                "eligible",
                "qualify",
                "can return",
                "days ago",
            ]
            return any(term in response for term in eligibility_terms)

        if criterion == "mentions return window":
            return "30-day" in response or "30 day" in response

        if criterion == "explains return process":
            process_terms = [
                "shipping label",
                "refund",
                "email",
                "process",
                "initiated",
                "return",
            ]
            return any(term in response for term in process_terms)

        if criterion == "offers size exchange":
            exchange_terms = [
                "different size",
                "exchange",
                "another size",
                "size exchange",
                "order a different",
            ]
            return any(term in response for term in exchange_terms)

        return False
