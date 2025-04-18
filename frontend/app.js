// Firebase configuration
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-auth-domain",
    projectId: "your-project-id",
    storageBucket: "your-storage-bucket",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id",
    measurementId: "your-measurement-id",
  };
  
  export default firebaseConfig;
  
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();
  
  // VAPID Key
  const vapidKey = "BEvloe1xskKaNDjxzsYXMx2oj28icnaq8_Q43aePDqKPx9UttGIPVIkEq8Mf_qtSuyPKB16JA0h3FVQeHGFaVtU";
  
  // Register the service worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/firebase-messaging-sw.js")
      .then(function (registration) {
        console.log("Service Worker registered with scope:", registration.scope);
      })
      .catch(function (error) {
        console.log("Service Worker registration failed:", error);
      });
  }
  
  // Request notification permission and get the FCM token
  document.getElementById("subscribeBtn").addEventListener("click", async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const token = await messaging.getToken({ vapidKey });
        console.log("FCM Token:", token);
  
        // Send the token to your backend server
        await fetch("http://localhost:8000/devices/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fcm_token: token }),
        });
  
        alert("Subscribed successfully!");
      }
    } catch (error) {
      console.error("Subscription failed:", error);
    }
  });
  
  // Handle foreground notifications (when the app is in the foreground)
  messaging.onMessage((payload) => {
    console.log("Message received. ", payload);
    new Notification(payload.notification.title, {
      body: payload.notification.body,
      icon: payload.notification.icon,
    });
  });
  