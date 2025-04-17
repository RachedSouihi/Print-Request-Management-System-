import logging
import sys
import os
import csv

# Add the parent directory to the Python module search path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

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


from pyflink.datastream.functions import KeyedProcessFunction, RuntimeContext
from pyflink.datastream.state import ValueStateDescriptor
from pyflink.common.time import Time

import uuid


from src.profile import updateUserProfile

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
    producer_conf = {"bootstrap.servers": "kafka:9092"}
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
    
    
    user_id = getattr(row, 'user_id', None)
    doc_id = getattr(row, 'doc_id', None)
    id = getattr(row, 'id', str(uuid.uuid4()))
   
    #updateUserProfile(user_id,  {"interaction_type": "share"}, doc_id)


    return Row(
        id=id,
        user_id=str(user_id),  # Ensure all fields are strings
        event="share",      # Use JSON string instead of dict
        doc_id=str(doc_id),
        
        timestamp=str(time.time()),
    )


def log_and_update_user_profile(row):
    """
    Log the read event, save it to a CSV file, and transform the message.
    """
    logger.info(f"Read event: {row}")

    # Save the event to a CSV file
    csv_file_path = os.path.join(os.path.dirname(__file__), "events_log.csv")
    file_exists = os.path.exists(csv_file_path)  # Check if the file already exists


    user_id = getattr(row, 'user_id', None)
    doc_id = getattr(row, 'doc_id', None)
    
    event = {
        "interaction_type": getattr(row, 'event', None),
    }

    # Call the updateUserProfile function with the user_id, event, and doc_id
    #updateUserProfile(user_id, event, doc_id)
    
    with open(csv_file_path, mode="a", newline="") as csv_file:
        csv_writer = csv.writer(csv_file)
        # Write the header if the file does not exist
        if not file_exists:
            csv_writer.writerow(["event", "user_id", "doc_id", "timestamp"])
        # Write the event data
        csv_writer.writerow([event.get('interaction_type'), user_id, doc_id, row.timestamp])

    # Transform the message
    transformed_row = transform_message(row)
    logger.info(f"Transformed event: {transformed_row}")
    return transformed_row


def send_event_to_user_interactions():
    """
    Send a test event to the 'user_interactions' topic before starting the Flink job.
    """
    # Configure the Kafka producer
    producer_conf = {"bootstrap.servers": "kafka:29092"}
    producer = Producer(producer_conf)

    # Test event to send
    event = {
        "id": str(uuid.uuid4()),  # Generate a unique ID for the event
        "user_id": "242619",
        "doc_id": "6d9afcfa-815c-4a2d-ad15-085b989b8a50",
        "event": "share",
    
        "timestamp": "2025-03-31T12:00:00Z"
    }

    # Produce the event to Kafka topic 'user_interactions'
    producer.produce("inputtopic", key="test", value=json.dumps(event))
    producer.flush()
    logger.info("Test event sent to 'user_interactions' topic.")




class DeduplicateEvents(KeyedProcessFunction):
    def open(self, runtime_context: RuntimeContext):
        # Create a ValueState to track if an event with this key has been seen.
        state_descriptor = ValueStateDescriptor("seen", Types.BOOLEAN())
        self.seen_state = runtime_context.get_state(state_descriptor)

    def process_element(self, value, ctx: 'KeyedProcessFunction.Context'):
        # Check if we've seen this event already.
        seen = self.seen_state.value()
        if seen is None:
            # Not seen: mark it as seen and emit the event.
            self.seen_state.update(True)
            yield value
        # Else, skip the event. You can also log or handle duplicates here.


def main():

    # Initialize the Flink StreamExecutionEnvironment
    env = StreamExecutionEnvironment.get_execution_environment()
    

    # Configure Kafka Source with JSON deserialization
    deserialization_schema = (
        JsonRowDeserializationSchema.builder()
        .type_info(
            Types.ROW_NAMED(
                ["id" ,"user_id", "doc_id", "event", "timestamp"],
                [Types.STRING(), Types.STRING(), Types.STRING(), Types.STRING(), Types.STRING()],
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
    logger.info("Kafka consumer initialized for topic: user_interactions")

    # Configure Kafka Sink with JSON serialization
    serialization_schema = (
        JsonRowSerializationSchema.builder()
        .with_type_info(
            Types.ROW_NAMED(
                ['id', "user_id", "doc_id", "event", "timestamp"],
                [Types.STRING(), Types.STRING(), Types.STRING(), Types.STRING(), Types.STRING()],
            )
        )
        .build()
    )

    kafka_sink = FlinkKafkaProducer(
        topic="outputtopic",
        serialization_schema=serialization_schema,
        producer_config={
            "bootstrap.servers": "kafka:29092",
            "key.serializer": "org.apache.kafka.common.serialization.StringSerializer",
            "value.serializer": "org.apache.kafka.common.serialization.ByteArraySerializer",
        },
    )
    logger.info("Kafka producer initialized for topic: outputtopic")

    # Define the output type explicitly as a ROW
    output_type = Types.ROW_NAMED(
        ['id', "user_id", "doc_id", "event", "timestamp"],
        [Types.STRING(), Types.STRING(), Types.STRING(), Types.STRING(), Types.STRING()],
    )

    # Simplified processing pipeline
    transformed = env.add_source(kafka_source)
    transformed.map(log_and_update_user_profile, output_type=output_type)
        #.add_sink(kafka_sink)
        
        
    
    
    
    
    deduplicated = transformed.key_by(lambda row: row.id) \
                              .process(DeduplicateEvents(), output_type=output_type)
    
    deduplicated.add_sink(kafka_sink)

    try:
        env.execute("Kafka JSON Transformation Job")
    except Exception as e:
        logger.error("Job execution failed with exception: %s", e, exc_info=True)


if __name__ == "__main__":
    main()