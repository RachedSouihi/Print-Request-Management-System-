# Use the existing image with dependencies as the base image
FROM custom-flink-img:latest

# Set the working directory inside the container
WORKDIR /app

# Create a Python virtual environment
RUN python3 -m venv /app/venv

# Activate the virtual environment and install FastAPI and Uvicorn
RUN /app/venv/bin/pip install --no-cache-dir fastapi uvicorn redis asyncpg httpx

# Copy the FastAPI application code into the container
COPY ./app /app

# Copy the src directory into the container (relative path)
COPY ./src /app/src

# Expose the port FastAPI will run on
EXPOSE 8000

# Command to run the FastAPI application inside the virtual environment
CMD ["/app/venv/bin/uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]