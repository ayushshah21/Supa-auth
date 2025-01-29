from setuptools import setup, find_packages

setup(
    name="outreach_gpt",
    version="0.1",
    packages=find_packages(
        include=["evaluation", "evaluation.*", "config", "config.*"]
    ),
    install_requires=[
        "langsmith",
        "langchain",
        "pytest",
    ],
    python_requires=">=3.8",
)
