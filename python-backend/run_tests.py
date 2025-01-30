"""
Run OutreachGPT evaluation tests
"""

import asyncio
from tests.run_evaluations import run_evaluations

if __name__ == "__main__":
    print("Starting OutreachGPT Evaluation Suite...")
    summary = asyncio.run(run_evaluations())

    print("\nEvaluation Complete!")
    print(f"Results saved in evaluation_results/")
    print("\nSummary:")
    print(f"Total Tests: {summary['total_tests']}")
    print(
        f"Success Rate: {(summary['successful_tests']/summary['total_tests'])*100:.1f}%"
    )
    print("\nAverage Scores:")
    for criterion, score in summary["criteria_scores"].items():
        print(f"{criterion}: {score:.2f}")
