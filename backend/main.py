from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pika
import json
import mysql.connector

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace '*' with specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MySQL connection details
db_config = {
    'host': 'mysql',  # The service name in docker-compose.yml
    'user': 'root',
    'password': 'rootpassword',
    'database': 'fcm_tokens'
}

class FCMToken(BaseModel):
    fcm_token: str


class Notification(BaseModel):
    title: str
    body: str


@app.get("/")
def root():
    """Root endpoint to verify the backend is running."""
    return {"message": "Backend is running"}


# Connect to MySQL
def get_db_connection():
    return mysql.connector.connect(**db_config)


@app.post("/devices/register")
async def register_device(token: FCMToken):
    """
    Register an FCM token for push notifications.
    """
    connection = get_db_connection()
    cursor = connection.cursor()

    # Check if the token is already registered
    cursor.execute("SELECT * FROM tokens WHERE fcm_token = %s", (token.fcm_token,))
    existing_token = cursor.fetchone()
    print(f"Received token: {token.fcm_token}")
    if existing_token:
        return {"status": "already registered"}

    # Store the token in the database
    cursor.execute(
        "INSERT INTO tokens (fcm_token) VALUES (%s)", (token.fcm_token,)
    )
    connection.commit()
    cursor.close()
    connection.close()

    return {"status": "registered"}


@app.post("/notifications/publish")
async def publish_notification(notification: Notification):
    """
    Publish a notification to RabbitMQ for processing.
    """
    try:
        # Connect to RabbitMQ
        connection = pika.BlockingConnection(pika.ConnectionParameters("rabbitmq"))
        channel = connection.channel()

        # Declare an exchange
        channel.exchange_declare(exchange="notifications", exchange_type="direct")

        # Publish the notification to the queue
        channel.basic_publish(
            exchange="notifications",
            routing_key="notification",
            body=json.dumps(notification.dict()),
        )

        # Close the connection
        connection.close()

        return {"status": "published"}

    except pika.exceptions.AMQPConnectionError as e:
        raise HTTPException(status_code=500, detail=f"RabbitMQ connection error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error publishing notification: {e}")
