
/* STORY ZA DULLY - FIREBASE MESSAGING SERVICE WORKER */

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyA2RSvI4qpxFRY0B65ZI4HtlGFcKH6XIgI",
  authDomain: "mfano-c0401.firebaseapp.com",
  databaseURL: "https://mfano-c0401-default-rtdb.firebaseio.com",
  projectId: "mfano-c0401",
  storageBucket: "mfano-c0401.firebasestorage.app",
  messagingSenderId: "322823059663",
  appId: "1:322823059663:web:cc885bd9c5631987309fba",
  measurementId: "G-W7H32ENGZK"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

/* BACKGROUND NOTIFICATIONS */

messaging.onBackgroundMessage((payload) => {

  console.log(
    "[Story Za Dully] Background message:",
    payload
  );

  const notificationTitle =
    payload.notification?.title ||
    payload.data?.title ||
    "Story Za Dully";

  const notificationOptions = {
    body:
      payload.notification?.body ||
      payload.data?.body ||
      "Kuna taarifa mpya kutoka Story Za Dully.",

    icon: "./icons/icon-192.png",

    badge: "./icons/icon-192.png",

    data: {
      url:
        payload.fcmOptions?.link ||
        payload.data?.url ||
        "https://mixyas7-cmd.github.io/dully-story-app-pwa/"
    },

    tag: payload.data?.tag || "story-za-dully"
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );

});

/* NOTIFICATION CLICK */

self.addEventListener("notificationclick", (event) => {

  event.notification.close();

  const targetUrl =
    event.notification.data?.url ||
    "https://mixyas7-cmd.github.io/dully-story-app-pwa/";

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then((windowClients) => {

      for (const client of windowClients) {

        if ("focus" in client) {
          return client.navigate(targetUrl)
            .then(() => client.focus());
        }

      }

      return clients.openWindow(targetUrl);

    })
  );

});
