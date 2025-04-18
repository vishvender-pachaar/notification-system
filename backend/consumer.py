import pika
import json
import time
import mysql.connector
from firebase_admin import messaging, credentials, initialize_app

# Initialize Firebase Admin
cred = credentials.Certificate('/app/firebase-credentials.json')
initialize_app(cred)

# MySQL connection details
db_config = {
    'host': 'mysql',  # The service name in docker-compose.yml
    'user': 'root',
    'password': 'rootpassword',
    'database': 'fcm_tokens'
}

# Retry mechanism for RabbitMQ connection
def connect_to_rabbitmq():
    for i in range(5):  # Retry 5 times
        try:
            connection = pika.BlockingConnection(pika.ConnectionParameters('rabbitmq'))
            return connection
        except pika.exceptions.AMQPConnectionError as e:
            print(f"RabbitMQ connection attempt {i+1} failed: {e}. Retrying in 5 seconds...")
            time.sleep(5)
    raise Exception("Failed to connect to RabbitMQ after multiple attempts.")

# Connect to RabbitMQ
connection = connect_to_rabbitmq()
channel = connection.channel()

# RabbitMQ setup
channel.exchange_declare(exchange='notifications', exchange_type='direct')
result = channel.queue_declare(queue='', exclusive=True)
queue_name = result.method.queue
channel.queue_bind(exchange='notifications', queue=queue_name, routing_key='notification')

# Get all FCM tokens from MySQL
def get_fcm_tokens():
    connection = mysql.connector.connect(**db_config)
    cursor = connection.cursor()
    cursor.execute("SELECT fcm_token FROM tokens")  # Retrieve all tokens
    tokens = cursor.fetchall()  # Get all tokens as a list of tuples
    cursor.close()
    connection.close()
    
    # Return a list of tokens (not tuples)
    return [token[0] for token in tokens]


# Callback function
def callback(ch, method, properties, body):
    notification = json.loads(body)
    
    # Get all FCM tokens from MySQL
    fcm_tokens = get_fcm_tokens()

    if fcm_tokens:
        # Send the notification to all tokens
        for token in fcm_tokens:
            message = messaging.Message(
                notification=messaging.Notification(
                    title=notification['title'],
                    body=notification['body']
                ),
                token=token
            )
            try:
                response = messaging.send(message)
                print(f"Notification sent successfully to {token}: {response}")
            except Exception as e:
                print(f"Error sending notification to {token}: {e}")
        
        ch.basic_ack(delivery_tag=method.delivery_tag)
    else:
        print("No tokens found")

channel.basic_consume(queue=queue_name, on_message_callback=callback)
channel.start_consuming()
