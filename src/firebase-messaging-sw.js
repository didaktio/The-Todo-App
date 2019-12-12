importScripts('https://www.gstatic.com/firebasejs/7.5.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.5.2/firebase-messaging.js');


firebase.initializeApp({ messagingSenderId: "914384756357" });


const messaging = firebase.messaging();
messaging.setBackgroundMessageHandler(payload => {
  var title = 'New notification!';
  var notificationOptions = {
    body: 'I am a the BODY placeholder.',
    icon: '[ICON_PATH]',
    sound: 'default'
  };

  return self.registration.showNotification(title, notificationOptions);
});