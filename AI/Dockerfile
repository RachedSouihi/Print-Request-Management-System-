FROM apache/flink:1.20.1-scala_2.12

# Install Python, Java, and other dependencies
RUN set -e && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        python3 \
        python3-pip \
        python3-venv \
        openjdk-11-jdk && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create a Python virtual environment
RUN python3 -m venv /app/venv

# Activate the virtual environment and install Python dependencies
RUN /app/venv/bin/pip install --no-cache-dir \
        apache-flink \
        confluent-kafka \
        kafka-python \
        faiss-cpu \
        protobuf \
        fastapi \
        uvicorn

# Copy Kafka connector JARs to Flink's library directory
COPY ./flink-scripts/*.jar /opt/flink/lib/


COPY ./src /app/src


# Set the working directory to the app directory
WORKDIR /app

