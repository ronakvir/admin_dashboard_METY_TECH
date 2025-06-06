FROM python:3.12-slim

ENV PYTHONFAULTHANDLER=1 \
  PYTHONUNBUFFERED=1 \
  PYTHONHASHSEED=random \
  PIP_NO_CACHE_DIR=off \
  PIP_DISABLE_PIP_VERSION_CHECK=on \
  PIP_DEFAULT_TIMEOUT=100 \
  POETRY_VERSION=2.0.1

RUN groupadd user && useradd --create-home --home-dir /home/user -g user user

# Install system dependencies
RUN apt-get update && apt-get install -y python3-dev build-essential pkg-config

# install python dependencies
RUN pip install "poetry==$POETRY_VERSION"
COPY pyproject.toml /home/user/app/
COPY *poetry.lock /home/user/app/

WORKDIR /home/user/app/

RUN poetry config virtualenvs.create false
RUN poetry install --with dev --no-root --no-interaction --no-ansi

WORKDIR /home/user/app/backend
COPY backend/ /home/user/app/backend

USER user
CMD gunicorn admin_dashboard.wsgi --log-file - -b 0.0.0.0:8000 --reload
