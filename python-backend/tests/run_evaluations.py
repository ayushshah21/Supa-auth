import asyncio
import json
from datetime import datetime
from pathlib import Path
from tests.test_langsmith import OutreachEvaluator


async def run_evaluations():
    """Run evaluations and log results to LangSmith"""
    evaluator = OutreachEvaluator()
    results = await evaluator.run_all_tests()
    summary = evaluator.generate_summary_report(results)

    # Create results directory if it doesn't exist
    results_dir = Path("evaluation_results")
    results_dir.mkdir(exist_ok=True)

    # Save results json for reference
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    results_file = results_dir / f"evaluation_results_{timestamp}.json"
    with open(results_file, "w") as f:
        json.dump(summary, f, indent=2)

    return summary


if __name__ == "__main__":
    print("Starting OutreachGPT Evaluation Suite...")
    print("Results will be available in LangSmith...")

    try:
        summary = asyncio.run(run_evaluations())

        print("\nEvaluation Complete!")
        print(f"Results saved in evaluation_results/")
        print("\nSummary:")
        print(f"Total Tests: {summary['total_tests']}")
        if summary["total_tests"] > 0:
            success_rate = (summary["successful_tests"] / summary["total_tests"]) * 100
            print(f"Success Rate: {success_rate:.1f}%")
            print("\nCriteria Scores:")
            for criterion, score in summary.get("criteria_scores", {}).items():
                print(f"{criterion}: {score:.2f}")

        print("\nDetailed results and analysis available in LangSmith")

    except KeyboardInterrupt:
        print(
            "\n\nEvaluation interrupted by user. Partial results may be available in LangSmith."
        )
    except Exception as e:
        print(f"\n\nError during evaluation: {str(e)}")
        raise
