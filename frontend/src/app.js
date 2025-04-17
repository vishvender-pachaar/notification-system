const firebaseConfig = {
    // Same as service worker
  };
  
  const app = firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging(app);
  
  // UI Elements
  const subscribeButton = document.getElementById('subscribeButton');
  const statusIndicator = document.getElementById('status');
  
  // State management
  let isSubscribed = false;
  let currentToken = null;
  
  const updateUI = () => {
    statusIndicator.textContent = isSubscribed 
      ? `🔔 Subscribed (${currentToken.slice(0, 8)}...)` 
      : '🔕 Not Subscribed';
      
    subscribeButton.textContent = isSubscribed 
      ? 'Disable Notifications' 
      : 'Enable Notifications';
  };
  
  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registered');
      return registration;
    } catch (err) {
      console.error('Service Worker registration failed:', err);
      throw err;
    }
  };
  
  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') throw new Error('Permission not granted');
      return true;
    } catch (err) {
      console.error('Notification permission error:', err);
      return false;
    }
  };
  
  const setupTokenRefresh = () => {
    messaging.onTokenRefresh(async () => {
      try {
        currentToken = await messaging.getToken();
        await saveTokenToBackend(currentToken);
      } catch (err) {
        console.error('Token refresh failed:', err);
      }
    });
  };
  
  const saveTokenToBackend = async (token) => {
    try {
      const response = await fetch('/devices/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fcm_token: token })
      });
      
      if (!response.ok) throw new Error('Failed to register token');
      console.log('Token successfully registered');
    } catch (err) {
      console.error('Token registration error:', err);
    }
  };
  
  // Main initialization flow
  const initializeNotifications = async () => {
    try {
      await registerServiceWorker();
      const hasPermission = await requestNotificationPermission();
      
      if (hasPermission) {
        currentToken = await messaging.getToken();
        await saveTokenToBackend(currentToken);
        isSubscribed = true;
        setupTokenRefresh();
      }
      
      subscribeButton.disabled = false;
      updateUI();
    } catch (err) {
      console.error('Initialization failed:', err);
      statusIndicator.textContent = '❌ Error initializing notifications';
    }
  };
  
  // Button click handler
  subscribeButton.addEventListener('click', async () => {
    if (isSubscribed) {
      // Unsubscribe logic
      await messaging.deleteToken(currentToken);
      isSubscribed = false;
      currentToken = null;
    } else {
      await initializeNotifications();
    }
    updateUI();
  });
  
  // Initial setup
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    initializeNotifications();
  } else {
    statusIndicator.textContent = '❌ Notifications not supported';
    subscribeButton.disabled = true;
  }