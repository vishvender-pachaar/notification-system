

  
const firebaseConfig = {
    apiKey: "AIzaSyB44rSEhxsyqj6Kea8ht_Ri5uh0FamfUrM",
    authDomain: "kraftbase-34571.firebaseapp.com",
    projectId: "kraftbase-34571",
    storageBucket: "kraftbase-34571.firebasestorage.app",
    messagingSenderId: "301987670512",
    appId: "1:301987670512:web:88974c8d99778f4d2d5535",
    measurementId: "G-TPBQ4DF0PN"
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
          vapidKey: "BEvloe1xskKaNDjxzsYXMx2oj28icnaq8_Q43aePDqKPx9UttGIPVIkEq8Mf_qtSuyPKB16JA0h3FVQeHGFaVtU"
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
  
  