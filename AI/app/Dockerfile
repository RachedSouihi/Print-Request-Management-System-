# Use the existing image with dependencies as the base image
FROM printrequestmanagementsystem:latest

FROM python:3.10-slim

# Installer les dépendances système nécessaires pour venv
RUN apt-get update && apt-get install -y python3-venv && apt-get clean
# Set the working directory inside the container
WORKDIR /app


# Create a Python virtual environment
RUN python3 -m venv /app/venv

# Activate the virtual environment and install FastAPI and Uvicorn
RUN /app/venv/bin/pip install --no-cache-dir fastapi uvicorn redis

# Copy the FastAPI application code into the container
COPY . /app

# Expose the port FastAPI will run on
EXPOSE 8000

# Command to run the FastAPI application inside the virtual environment
CMD ["/app/venv/bin/uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]