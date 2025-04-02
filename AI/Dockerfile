FROM apache/flink:1.20.1-scala_2.12

# Install Python, Java, and other dependencies
RUN set -e && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        python3 \
        python3-pip \
        openjdk-11-jdk && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies globally
RUN pip3 install --no-cache-dir \
        apache-flink \
        confluent-kafka \
        kafka-python \
        faiss-cpu \
        protobuf

# Copy Kafka connector JARs to Flink's library directory
COPY ./flink-scripts/*.jar /opt/flink/lib/

# Set the working directory to Flink's installation directory
WORKDIR /opt/flink