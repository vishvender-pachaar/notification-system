
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  };
  
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();
  
  
// Register the service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
      .then(function (registration) {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(function (error) {
        console.log('Service Worker registration failed:', error);
      });
  }
  
  // Request notification permission and get the FCM token
  document.getElementById('subscribeBtn').addEventListener('click', async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await messaging.getToken({
          vapidKey: process.env.FIREBASE_VAPID_KEY
        });
        console.log("FCM Token:", token);
        
        // Send the token to your backend server
        await fetch('http://localhost:8000/devices/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fcm_token: token })
        });
  
        alert('Subscribed successfully!');
      }
    } catch (error) {
      console.error('Subscription failed:', error);
    }
  });
  
  // Handle foreground notifications (when the app is in the foreground)
  messaging.onMessage((payload) => {
    console.log('Message received. ', payload);
    new Notification(payload.notification.title, {
      body: payload.notification.body,
      icon: payload.notification.icon
    });
  });
  
  