FROM python:3.12-slim

# System-Dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    openjdk-17-jre-headless \
    curl \
    && rm -rf /var/lib/apt/lists/*

# gh CLI
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
    | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
    | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt-get update && apt-get install -y gh && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Python Dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# App Code
COPY api/ ./api/
COPY java/ ./java/

# Java kompilieren
RUN javac java/*.java 2>/dev/null || true

# Port
EXPOSE 3050

# Start
CMD ["uvicorn", "api.webhook_server:app", "--host", "0.0.0.0", "--port", "3050", "--log-level", "info"]
