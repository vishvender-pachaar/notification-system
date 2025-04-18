Setup Instructions

//hardcode the api keys and other env variables . I just mentioned the .env file for things required for this project

1. Clone the Repository
bash
git clone https://github.com/vishvender-pachaar/notification-system
cd your-repo-name/kraftbase/notification-system

2. Firebase Configuration
Go to Firebase Console and create a new project.

Under Project Settings:

Add a web app to your project.

Copy the Firebase config object (apiKey, authDomain, projectId, etc.).

Replace the firebaseConfig object in frontend/app.js:

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID",
};
Generate a VAPID key:

Go to Project Settings > Cloud Messaging > Web Push certificates.

Copy the VAPID Key and replace it in frontend/app.js:

messaging.getToken({
    vapidKey: "YOUR_VAPID_KEY",
});


3. Set Up MySQL

Dockerized MySQL:
Docker will automatically set up MySQL as defined in docker-compose.yml. Make sure the db-init.sql file is present for the initial database setup.

4. Set Up RabbitMQ

Dockerized RabbitMQ:
Docker will automatically set up RabbitMQ as defined in docker-compose.yml.

5. Start the Project Using Docker
Install Docker: Docker Installation Guide.

Navigate to the project directory:

bash-
cd kraftbase/notification-system
Run Docker Compose:

bash-
docker-compose up --build
Access the application:

Frontend: http://localhost

Backend: http://localhost:8000

RabbitMQ Management Console: http://localhost:15672
(Username: guest, Password: guest)

7. Test the Project
Go to the frontend URL and subscribe to notifications.

Send a notification from the backend API:

bash-
curl -X POST http://localhost:8000/notifications/publish \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "body": "This is a test message",
    "data": {"key": "value"},
    "image_url": "https://example.com/image.png"
  }'
Verify the notification on the frontend.

Troubleshooting
Docker Issues: Ensure Docker Desktop is running and sufficient resources are allocated.

RabbitMQ: Check docker logs rabbitmq for issues.

MySQL: Verify the db-init.sql file and connection credentials.

Firebase: Ensure the correct API key and VAPID key are used.

AFter running docker cmds 
Go to docker desktop and click on frontend localhost to go to frontend webpage and hit subscribe btn
to get notification .Now when you'll post notification through postman or use cURL method to puvlish
message you'll see the message in you console on frontend webpage and a notification will pop
if notification does not pop up make change your browser settings are such that it allows pop up

thank you