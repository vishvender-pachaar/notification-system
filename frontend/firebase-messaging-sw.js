importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
    apiKey: "AIzaSyB44rSEhxsyqj6Kea8ht_Ri5uh0FamfUrM",
    authDomain: "kraftbase-34571.firebaseapp.com",
    projectId: "kraftbase-34571",
    storageBucket: "kraftbase-34571.firebasestorage.app",
    messagingSenderId: "301987670512",
    appId: "1:301987670512:web:88974c8d99778f4d2d5535",
    measurementId: "G-TPBQ4DF0PN"
  };
  

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
    console.log('Handling background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});
  