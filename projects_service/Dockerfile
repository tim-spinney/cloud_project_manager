# Build stage not required for pure Python; use slim runtime image
FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY src/ ./src/

# Expose the default port (overridable via PORT env)
EXPOSE 8000

# Run the FastAPI app via uvicorn (PORT respected by main.py)
CMD ["python", "-m", "src.main"]
