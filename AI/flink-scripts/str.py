import logging
from pyflink.common import Types, Row
from pyflink.datastream import StreamExecutionEnvironment
from pyflink.datastream.connectors.kafka import FlinkKafkaConsumer, FlinkKafkaProducer
from pyflink.datastream.formats.json import (
    JsonRowDeserializationSchema,
    JsonRowSerializationSchema,
)
import json
import time
from confluent_kafka import Producer
from kafka import KafkaConsumer

# Suppress Apache Beam type hint warnings
logging.getLogger("apache_beam.typehints.native_type_compatibility").setLevel(
    logging.WARNING
)
logging.getLogger("apache_beam.typehints.trivial_inference").setLevel(logging.WARNING)

# Configure application logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

logging.getLogger("org.apache.flink").setLevel(logging.DEBUG)
logging.getLogger("org.apache.kafka").setLevel(logging.DEBUG)


def send_test_message():
    # Configure the Kafka producer
    producer_conf = {"bootstrap.servers": "kafka:29092"}
    producer = Producer(producer_conf)

    # Test event to send
    event = {"title": "nawwar", "text": "tonnn", "timestamp": "2025-03-12T10:00:00Z"}

    # Produce the event to Kafka topic 'user_interactions'
    producer.produce("inputtopic", key="test", value=json.dumps(event))
    producer.flush()
    logger.info("Test message sent.")


def consume_messages():
    consumer = KafkaConsumer(
        'outputtopic',
        bootstrap_servers='kafka:29092',
        auto_offset_reset='earliest',
        group_id='test-group'
    )

    for message in consumer:
        print(message.value)


def transform_message(row):
    """
    Process JSON message by converting title and text to uppercase.
    Return a Row object matching the output type.
    """
    return Row(
        title=row.title.upper() if getattr(row, 'title', None) else "",
        text=row.text.upper() if getattr(row, 'text', None) else "",
        timestamp=row.timestamp if getattr(row, 'timestamp', None) else "",
    )


def log_and_transform_message(row):
    logger.info(f"Read event: {row}")
    transformed_row = transform_message(row)
    logger.info(f"Transformed event: {transformed_row}")
    return transformed_row


def main():
    # Send a test message to Kafka before starting the Flink job
    send_test_message()
    time.sleep(10)  # Add a 10-second delay

    env = StreamExecutionEnvironment.get_execution_environment()
    
    # Set the Python executable path correctly
    env.set_python_executable("/usr/bin/python3")
    
    
    
    '''env.add_jars(
        "file:///opt/flink/opt/flink-python-1.20.1.jar",
        "file:///opt/flink/lib/flink-connector-kafka-3.4.0-1.20.jar",
        "file:///opt/flink/lib/flink-sql-connector-kafka-3.3.0-1.20.jar",
        "file:///opt/flink/lib/kafka-clients-3.9.0.jar"
    )'''

    # Configure Kafka Source with JSON deserialization
    deserialization_schema = (
        JsonRowDeserializationSchema.builder()
        .type_info(
            Types.ROW_NAMED(
                ["title", "text", "timestamp"],
                [Types.STRING(), Types.STRING(), Types.STRING()],
            )
        )
        .build()
    )

    kafka_source = FlinkKafkaConsumer(
        topics="inputtopic",
        deserialization_schema=deserialization_schema,
        properties={
            "bootstrap.servers": "kafka:29092",  # Use the internal address
            "group.id": "my-flink-app-group",
            "auto.offset.reset": "earliest",
        },
    )
    logger.info("Kafka consumer initialized for topic: inputtopic")

    # Configure Kafka Sink with JSON serialization
    serialization_schema = (
        JsonRowSerializationSchema.builder()
        .with_type_info(
            Types.ROW_NAMED(
                ["title", "text", "timestamp"],
                [Types.STRING(), Types.STRING(), Types.STRING()],
            )
        )
        .build()
    )

    '''kafka_sink = FlinkKafkaProducer(
        topic="outputtopic",
        serialization_schema=serialization_schema,
        producer_config={
            "bootstrap.servers": "kafka:29092",  # Use the internal address
            "key.serializer": "org.apache.kafka.common.serialization.StringSerializer",
            "value.serializer": "org.apache.kafka.common.serialization.StringSerializer",
        },
    )'''
    
    
    # Update the Kafka producer configuration
    kafka_sink = FlinkKafkaProducer(
    topic="outputtopic",
    serialization_schema=serialization_schema,
    producer_config={
        "bootstrap.servers": "kafka:29092",
        "key.serializer": "org.apache.kafka.common.serialization.StringSerializer",  # Keep as String if key is a string
        "value.serializer": "org.apache.kafka.common.serialization.ByteArraySerializer",  # Changed to ByteArraySerializer
    },
)
    
    
    
    logger.info("Kafka producer initialized for topic: outputtopic")

    # Define the output type explicitly as a ROW
    output_type = Types.ROW_NAMED(
        ["title", "text", "timestamp"], [Types.STRING(), Types.STRING(), Types.STRING()]
    )

    # Simplified processing pipeline
    (
        env.add_source(kafka_source)
        .map(log_and_transform_message, output_type=output_type)
        .add_sink(kafka_sink)
    )

    try:
        env.execute("Kafka JSON Transformation Job")
    except Exception as e:
        logger.error("Job execution failed with exception: %s", e, exc_info=True)


if __name__ == "__main__":
    main()
    # Uncomment to consume messages after job execution
    # consume_messages()
  