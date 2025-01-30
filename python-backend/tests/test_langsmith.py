from typing import Dict, List, Optional
import os
import uuid
import time
from datetime import datetime
from dotenv import load_dotenv

# LangSmith + Evaluators
from langsmith import Client
from langchain.smith import RunEvalConfig
from langchain.evaluation import load_evaluator

# For example feedback
from langchain.evaluation.criteria import LabeledCriteriaEvalChain
from langchain_openai import ChatOpenAI

# Tracer
from langchain.callbacks.tracers import LangChainTracer
from langchain.callbacks.manager import CallbackManager

# Local imports
from .test_cases import get_test_cases, get_evaluation_criteria
from agents.outreach_agent import OutreachAgent
from langchain.schema import StrOutputParser
import asyncio


# -----------------------
# ENV + TRACING SETUP
# -----------------------
load_dotenv()

if not os.getenv("LANGCHAIN_API_KEY"):
    raise ValueError("LANGCHAIN_API_KEY not found in environment variables")

PROJECT_NAME = "outreach_gpt_evaluation"

os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_PROJECT"] = PROJECT_NAME
os.environ["LANGCHAIN_ENDPOINT"] = "https://api.smith.langchain.com"

print(f"✓ LangSmith API Key found: {os.getenv('LANGCHAIN_API_KEY')[:8]}...")
print(f"✓ Tracing enabled for project: {PROJECT_NAME}")


class OutreachEvaluator:
    def __init__(self):
        try:
            self.client = Client()

            # Create or use existing project
            try:
                self.client.create_project(PROJECT_NAME)
                print(f"✓ Created new project: {PROJECT_NAME}")
            except Exception as e:
                if "already exists" in str(e):
                    print(f"✓ Using existing project: {PROJECT_NAME}")
                else:
                    raise

            # Dataset (annotation queue)
            self.dataset_name = "outreach_evaluation_queue"
            try:
                dataset = self.client.read_dataset(dataset_name=self.dataset_name)
                if dataset is None:
                    dataset = self.client.create_dataset(dataset_name=self.dataset_name)
                    print(f"✓ Created new dataset: {self.dataset_name}")
                else:
                    print(f"✓ Connected to dataset: {self.dataset_name}")
            except Exception as e:
                print(f"Warning: Failed to read/create dataset: {str(e)}")
                raise

            # Labeled Criteria Evaluator
            self.evaluator = load_evaluator(
                "labeled_criteria",
                criteria={
                    "ticket_context": "Does the response correctly use ticket info? Score 0-1",
                    "response_accuracy": "Is the response accurate for the request? Score 0-1",
                    "format_tone": "Does the response follow format/tone? Score 0-1",
                },
                llm=ChatOpenAI(model="gpt-4o-mini"),
            )
            print("✓ Evaluator loaded with custom criteria")

            # Tracer
            self.tracer = LangChainTracer(project_name=PROJECT_NAME, client=self.client)
            self.callback_manager = CallbackManager([self.tracer])
            print("✓ Successfully connected to LangSmith")
            print("✓ Tracing configured")

            # List projects (debugging)
            projects = self.client.list_projects()
            print("\nAvailable projects in LangSmith:")
            for p in projects:
                print(f"- {p.name}")

        except Exception as e:
            print(f"Error connecting to LangSmith: {str(e)}")
            raise

        # Init agent with tracing
        self.agent = OutreachAgent(callbacks=self.callback_manager)

        # Test cases
        self.test_cases = get_test_cases()
        self.evaluation_criteria = get_evaluation_criteria()

        # For your reference
        self.scoring_criteria = {
            "context_understanding": {
                "description": "Did the agent use the ticket context?",
                "weight": 0.3,
            },
            "response_accuracy": {
                "description": "Response correct for scenario?",
                "weight": 0.4,
            },
            "format_adherence": {
                "description": "Follow format guidelines?",
                "weight": 0.3,
            },
        }

    # ----------------------------------------------------------------------
    # Additional Helper Functions for Metrics
    # ----------------------------------------------------------------------

    def _determine_expected_action(self, test_case: Dict) -> str:
        """
        Suppose you want to identify if the user wants to 'update_ticket' vs 'send_email' etc.
        We'll just guess from test_case for illustration.
        """
        if "active_tickets" in test_case.get("context", {}):
            return "ticket_update"
        elif "resolved_tickets" in test_case.get("context", {}):
            return "follow_up"
        return "general_outreach"

    def _extract_action_from_response(self, response: str) -> str:
        """
        Very naive parser:
          - If the response references 'ticket' + 'update', call it 'ticket_update'
          - If the response references 'follow up', call it 'follow_up'
          - Otherwise 'general_outreach'
        """
        r = response.lower()
        if "ticket" in r and "update" in r:
            return "ticket_update"
        elif "follow up" in r:
            return "follow_up"
        return "general_outreach"

    async def _verify_field_updates(self, test_case: Dict, response: str) -> bool:
        """
        Suppose we check the DB or parse the response for certain field changes.
        For now, mock it as always 'True' or random. Adapt as you see fit.
        """
        # If you find e.g. "status changed" in the response, you might do real logic
        return True

    def _categorize_error(self, error_str: str) -> str:
        """Categorize errors into specific types, for storing in example feedback."""
        e = error_str.lower()
        if "context" in e:
            return "context_error"
        elif "field" in e or "database" in e:
            return "field_update_error"
        elif "timeout" in e:
            return "timeout_error"
        return "other"

    # ----------------------------------------------------------------------
    # Add Example to Queue + Evaluate
    # ----------------------------------------------------------------------
    async def add_example_to_queue(
        self,
        test_case: Dict,
        result: str,
        mock_context: Dict,
        metrics: Dict,
    ):
        """
        Create an example in the dataset with test case inputs/outputs,
        then run evaluator on the response to create feedback.
        Also store additional metrics (action_correct, field_update_success, etc.) as feedback.
        """
        try:
            example = self.client.create_example(
                dataset_name=self.dataset_name,
                inputs={
                    "request": test_case["request"],
                    "context": str(mock_context),
                    "expected_elements": test_case.get("expected_response", []),
                },
                outputs={
                    "response": result,
                    "test_case_name": test_case["name"],
                    "scenario_type": test_case.get("type", "general"),
                },
            )
            if not example:
                print("  ⚠ create_example returned None (unexpected).")
                return

            # Evaluate strings with your labeled_criteria evaluator
            eval_result = await self.evaluator.aevaluate_strings(
                prediction=result,
                reference="\n".join(test_case.get("expected_response", [])),
                input=test_case["request"],
            )

            # Create feedback for the labeled criteria
            for key, score in eval_result.items():
                self.client.create_feedback(
                    example_id=example.id,
                    key=key,  # e.g. "ticket_context"
                    score=score,
                )

            # Also store the four custom metrics:
            # 1) action_correct
            self.client.create_feedback(
                example_id=example.id,
                key="action_correct",
                score=1.0 if metrics["action_correct"] else 0.0,
            )
            # 2) field_update_success
            self.client.create_feedback(
                example_id=example.id,
                key="field_update_success",
                score=1.0 if metrics["field_update_success"] else 0.0,
            )
            # 3) response_time
            self.client.create_feedback(
                example_id=example.id,
                key="response_time",
                score=metrics["response_time"],  # numeric seconds
            )
            # 4) error_type
            # if there's no error, store "none" as a textual "value"
            if metrics["error_type"]:
                self.client.create_feedback(
                    example_id=example.id,
                    key="error_type",
                    value=metrics["error_type"],  # e.g. "context_error"
                )
            else:
                self.client.create_feedback(
                    example_id=example.id,
                    key="error_type",
                    value="none",
                )

            print(
                f"  ✓ Added example {example.id} + feedback to dataset '{self.dataset_name}'"
            )

        except Exception as e:
            if "already exists" in str(e) or "Conflict" in str(e):
                print("  ⚠ Example or feedback already exists in dataset")
            else:
                print(f"  ✗ Failed to add example or feedback: {str(e)}")

    # ----------------------------------------------------------------------
    # Test Execution
    # ----------------------------------------------------------------------
    async def run_test_case(self, test_case: Dict) -> Dict:
        """
        Run a single test case, measure metrics, add example + feedback to dataset.
        """
        metrics = {
            "action_correct": False,
            "field_update_success": False,
            "response_time": 0.0,
            "error_type": None,
        }

        try:
            start_time = time.time()

            chain = (
                self.agent.prompt
                | self.agent.model.with_config(
                    {
                        "callbacks": [self.tracer],
                        "timeout": 30,
                        "tags": ["outreach_evaluation", test_case["name"]],
                        "metadata": {
                            "scenario": test_case["name"],
                            "expected_response": test_case.get("expected_response", []),
                            "test_type": "accuracy_evaluation",
                        },
                    }
                )
                | StrOutputParser()
            )

            print(f"\n  Testing: {test_case['name']}")
            print(f"  Scenario Type: {test_case.get('type', 'general')}")
            print("  Expected Elements:")
            for elem in test_case.get("expected_response", []):
                print(f"    - {elem}")

            mock_context = {
                "Customer Profile": {"name": "Test User", "email": "test@example.com"},
                "Active Tickets": test_case.get("context", {}).get(
                    "recent_tickets", []
                ),
                "Recent Interactions": [],
                "Customer Preferences": test_case.get("context", {}).get(
                    "preferences", {}
                ),
                "test_case_id": str(uuid.uuid4()),
                "test_variation": "original",
            }

            try:
                result = await asyncio.wait_for(
                    chain.ainvoke(
                        {
                            "request": test_case["request"],
                            "db_context": str(mock_context),
                            "similar_interactions": "No similar interactions found",
                        }
                    ),
                    timeout=60,
                )
                metrics["response_time"] = time.time() - start_time

                print("\n  Response Generated:")
                print(f"    {result[:100]}...")  # snippet

                # 1) Determine action correctness
                expected_action = self._determine_expected_action(test_case)
                actual_action = self._extract_action_from_response(result)
                metrics["action_correct"] = expected_action == actual_action

                # 2) Field updates
                metrics["field_update_success"] = await self._verify_field_updates(
                    test_case, result
                )

                # 3) No error => error_type = None
                metrics["error_type"] = None

                # Add example + feedback
                await self.add_example_to_queue(
                    test_case, result, mock_context, metrics
                )

                return {
                    "test_case": test_case["name"],
                    "response": result,
                    "response_time": metrics["response_time"],
                    "test_variation": mock_context["test_variation"],
                    "action_correct": metrics["action_correct"],
                    "field_update_success": metrics["field_update_success"],
                    "error": None,
                }

            except asyncio.TimeoutError:
                raise Exception("Test case timed out after 60 seconds")

        except Exception as e:
            error_str = str(e)
            print(f"  ✗ Error: {error_str}")

            # If we wanted to store partial results or track errors:
            metrics["error_type"] = self._categorize_error(error_str)
            # We won't call add_example_to_queue if we never got a response to evaluate
            # but you *could* create an example with no response if you want

            return {
                "test_case": test_case["name"],
                "error": error_str,
                "action_correct": False,
                "field_update_success": False,
                "response_time": 0.0,
            }

    async def run_variation(
        self, test_case: Dict, variation: str, modified_request: str
    ) -> Dict:
        """Run a variation with different phrasing."""
        test_case = test_case.copy()
        test_case["request"] = modified_request
        test_case["variation"] = variation
        return await self.run_test_case(test_case)

    async def run_all_tests(self) -> List[Dict]:
        results = []
        print("\nStarting test suite execution...")

        parent_run_id = None
        # Optionally create a "parent run"
        try:
            parent_run = self.client.create_run(
                "chain",
                {"cases": [tc["name"] for tc in self.test_cases]},
                name="OutreachGPT Evaluation Suite",
                project_name=PROJECT_NAME,
                tags=["full_evaluation"],
                metadata={
                    "total_test_cases": len(self.test_cases),
                    "evaluation_date": datetime.now().isoformat(),
                },
            )
            parent_run_id = getattr(parent_run, "id", None)
        except Exception as e:
            print(f"Warning: Failed to create parent run in LangSmith: {str(e)}")

        try:
            for i, test_case in enumerate(self.test_cases, 1):
                print(f"\nTest Case {i}/{len(self.test_cases)}: {test_case['name']}")
                print("-" * 50)

                # Original
                result = await self.run_test_case(test_case)
                results.append(result)
                await asyncio.sleep(1)

                # Variations
                variations = [
                    ("formal", self.create_formal_variation(test_case["request"])),
                    ("casual", self.create_casual_variation(test_case["request"])),
                    ("detailed", self.create_detailed_variation(test_case["request"])),
                ]
                for variation_name, modified_req in variations:
                    variation_result = await self.run_variation(
                        test_case, variation_name, modified_req
                    )
                    results.append(variation_result)
                    await asyncio.sleep(1)

            # Summarize
            summary = self.generate_summary_report(results)
            print("\nGenerating summary...")

            if parent_run_id:
                try:
                    self.client.update_run(
                        parent_run_id,
                        outputs={"summary": summary},
                        metadata={
                            "success_rate": summary.get("success_rate", 0),
                            "average_response_time": summary.get(
                                "response_times", {}
                            ).get("average", 0),
                            "error_rate": summary.get("failed_tests", 0)
                            / summary.get("total_tests", 1),
                        },
                    )
                except Exception as e:
                    print(f"Warning: Failed to update parent run: {str(e)}")

            return results

        except Exception as e:
            print(f"✗ Error in test suite: {str(e)}")
            if parent_run_id:
                try:
                    self.client.update_run(parent_run_id, error=str(e))
                except:
                    pass
            return results

    def create_formal_variation(self, request: str) -> str:
        """More formal phrasing."""
        return f"I would kindly request assistance with the following matter: {request}"

    def create_casual_variation(self, request: str) -> str:
        """More casual phrasing."""
        return f"Hey, quick question about {request}"

    def create_detailed_variation(self, request: str) -> str:
        """More detailed phrasing."""
        return f"{request} - I need specific details and comprehensive information about this."

    def generate_summary_report(self, results: List[Dict]) -> Dict:
        total_tests = len(results)
        successful_tests = len([r for r in results if not r.get("error")])
        failed_tests = total_tests - successful_tests

        return {
            "total_tests": total_tests,
            "successful_tests": successful_tests,
            "failed_tests": failed_tests,
            "success_rate": (
                f"{(successful_tests / total_tests * 100):.1f}%"
                if total_tests
                else "0%"
            ),
            "response_times": {
                "average": (
                    sum(r.get("response_time", 0) for r in results) / total_tests
                    if total_tests
                    else 0
                ),
                "max": (
                    max(r.get("response_time", 0) for r in results) if results else 0
                ),
                "min": (
                    min(r.get("response_time", 0) for r in results) if results else 0
                ),
            },
        }


async def main():
    """Run the evaluation suite"""
    evaluator = OutreachEvaluator()
    results = await evaluator.run_all_tests()
    summary = evaluator.generate_summary_report(results)

    print("\n=== OutreachGPT Evaluation Summary ===")
    print(f"Total Tests: {summary['total_tests']}")
    print(f"Successful: {summary['successful_tests']}")
    print(f"Failed: {summary['failed_tests']}")
    print(f"Success Rate: {summary['success_rate']}")
    if summary["response_times"]["average"]:
        print("\nResponse Times:")
        print(f"Average: {summary['response_times']['average']:.2f} seconds")
        print(f"Max: {summary['response_times']['max']:.2f} seconds")
        print(f"Min: {summary['response_times']['min']:.2f} seconds")

    return summary


if __name__ == "__main__":
    asyncio.run(main())
