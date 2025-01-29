"""
Tests for the Clothing CRM evaluation system.
"""

import pytest
from datetime import datetime
from evaluation import TestCase, TestTicket, OutreachEvaluator
from evaluation.test_cases import (
    create_inventory_update_test,
    create_size_recommendation_test,
    create_return_process_test,
)


def test_evaluator_initialization():
    """Test that the evaluator initializes correctly"""
    try:
        evaluator = OutreachEvaluator()
        assert evaluator is not None
        assert evaluator.client is not None
    except ValueError as e:
        pytest.skip(f"Skipping test due to configuration error: {str(e)}")


def test_simple_automated_evaluation():
    """Test evaluation of a simple inventory update request"""
    try:
        evaluator = OutreachEvaluator()

        # Create a test case
        test_case = create_inventory_update_test()

        # Create a run
        run = evaluator.create_run(test_case)
        assert "id" in run, "Run should have an ID"

        # Test response
        test_response = """
        I've updated the inventory for the blue denim jeans in size 32.
        The stock has been set to 15 units in the main warehouse.
        Please let me know if you need any other inventory adjustments.
        
        Best regards,
        Support Team
        """

        # Evaluate
        result = evaluator.evaluate_response(test_case, test_response, run)

        # Check results
        assert "success_rate" in result
        assert "criteria_results" in result
        assert "response_time" in result
        assert result["success_rate"] > 0
        assert not result["requires_manual_review"]

        # Check individual criteria
        criteria_results = {
            r["criterion"]: r["met"] for r in result["criteria_results"]
        }
        assert criteria_results["Correctly identifies product"]
        assert criteria_results["Updates correct quantity"]
        assert criteria_results["Professional tone"]

    except ValueError as e:
        pytest.skip(f"Skipping test due to configuration error: {str(e)}")


def test_complex_manual_evaluation():
    """Test evaluation of a complex size recommendation request"""
    try:
        evaluator = OutreachEvaluator()

        # Create a test case
        test_case = create_size_recommendation_test()

        # Create a run
        run = evaluator.create_run(test_case)
        assert "id" in run, "Run should have an ID"

        # Test response
        test_response = """
        Based on the customer's measurements (5'10", 160lbs) and their usual medium size,
        I recommend ordering a size Large in our Premium Basics t-shirts.
        
        Our shirts tend to run slightly slim in the fit, so sizing up will ensure
        the best comfort. The Large size will provide adequate length for their height
        while maintaining a proper fit through the chest and shoulders.
        
        Please note that if they're between sizes, we always recommend going with
        the larger size for a more comfortable fit.
        
        Let me know if you need any other sizing assistance!
        
        Best regards,
        Style Team
        """

        # Evaluate automatically first
        result = evaluator.evaluate_response(test_case, test_response, run)

        # Check automated results
        assert "success_rate" in result
        assert "criteria_results" in result
        assert "response_time" in result
        assert result["requires_manual_review"]

        # Perform manual evaluation
        evaluator.record_manual_evaluation(
            test_case=test_case,
            human_rating=4.5,  # Out of 5
            evaluation_notes="""
            Excellent response that:
            1. Correctly uses all measurements
            2. Provides clear reasoning for size recommendation
            3. Includes specific fit details
            4. Maintains professional tone
            5. Offers additional assistance
            
            Minor improvement possible: Could mention return/exchange policy
            """,
            evaluator_id="EVAL001",
            run=run,
        )

        # Verify manual evaluation was recorded
        assert test_case.human_rating == 4.5
        assert test_case.evaluator_id == "EVAL001"
        assert test_case.evaluation_timestamp is not None
        assert "return/exchange policy" in test_case.manual_evaluation_notes.lower()

    except ValueError as e:
        pytest.skip(f"Skipping test due to configuration error: {str(e)}")


def test_return_process_evaluation():
    """Test evaluation of a return process request"""
    try:
        evaluator = OutreachEvaluator()

        # Create a test case
        test_case = create_return_process_test()

        # Create a run
        run = evaluator.create_run(test_case)
        assert "id" in run, "Run should have an ID"

        # Test response
        test_response = """
        I've reviewed Order #ORD-123456 for the Evening Dress return request.
        Since the purchase was made just 10 days ago, it falls well within our 30-day return window.
        
        I've initiated the return process and will email the return shipping label shortly.
        Once we receive the dress, we'll process a full refund to your original payment method.
        
        Would you like me to help you order a different size? I can check the current inventory
        and ensure we get you the perfect fit.
        
        Best regards,
        Returns Team
        """

        # Evaluate
        result = evaluator.evaluate_response(test_case, test_response, run)

        # Check results
        assert "success_rate" in result
        assert "criteria_results" in result
        assert result["success_rate"] > 0
        assert result["requires_manual_review"]

        # Perform manual evaluation
        evaluator.record_manual_evaluation(
            test_case=test_case,
            human_rating=5.0,
            evaluation_notes="""
            Perfect handling of return request:
            1. Verified order and eligibility
            2. Clear explanation of return process
            3. Proactive offer for size exchange
            4. Professional and helpful tone
            5. All required database changes correctly identified
            """,
            evaluator_id="EVAL001",
            run=run,
        )

    except ValueError as e:
        pytest.skip(f"Skipping test due to configuration error: {str(e)}")
