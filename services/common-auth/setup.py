from setuptools import setup, find_packages

setup(
    name="common-auth",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "djangorestframework>=3.12.0",
        "PyJWT>=2.0.0",
        "django>=3.2.0",
        "redis>=4.0.0",
    ],
    author="bisosad",
    author_email="thangdz1501@gmail.com",
    description="Common authentication library for Healthcare System",
    keywords="authentication, authorization, healthcare",
    python_requires=">=3.8",
)
