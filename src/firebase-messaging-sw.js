importScripts('https://www.gstatic.com/firebasejs/7.14.3/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.14.3/firebase-messaging.js');

firebase.initializeApp({
  apiKey: "AIzaSyAAW3dO9-aewkDeOHAFEl-eSILwh1tPW_Y",
  projectId: "todo-e6261",
  messagingSenderId: "914384756357",
  appId: "1:914384756357:web:c2f1041cb10c3152"
 });

const messaging = firebase.messaging();
messaging.setBackgroundMessageHandler(payload => {
  var title = 'New notification!';
  var notificationOptions = {
    body: 'I am the `body` placeholder.',
    icon: '[ICON_PATH]',
    sound: 'default'
  };

  return self.registration.showNotification(title, notificationOptions);
});