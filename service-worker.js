const CACHE_NAME = "story-za-dully-v6";

const TRACK_URL = "https://dully-notify.dullyofficial2000.workers.dev/track";

const FILES_TO_CACHE = [
  "/story-za-dully-pwa/",
  "/story-za-dully-pwa/index.html",
  "/story-za-dully-pwa/manifest.json",
  "/story-za-dully-pwa/icons/icon-192.png",
  "/story-za-dully-pwa/icons/icon-512.png"
];

/* INSTALL */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

/* ACTIVATE */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  self.clients.claim();
});

/* FETCH */
self.addEventListener("fetch", (event) => {

  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const requestURL = new URL(request.url);

  if (requestURL.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {

        if (response && response.status === 200) {

          const responseClone = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });

        }

        return response;

      })
      .catch(async () => {

        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
          return cachedResponse;
        }

        return new Response(
          "Huna muunganisho wa internet. Tafadhali jaribu tena.",
          {
            status: 503,
            headers: {
              "Content-Type": "text/plain; charset=utf-8"
            }
          }
        );

      })
  );

});

/* RIPOTI: delivered / opened */
function track(id, type) {
  if (!id) return Promise.resolve();

  return fetch(TRACK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: id, type: type }),
    keepalive: true
  }).catch(() => {});
}

/* PUSH NOTIFICATION */
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {}

  const data = payload.data || payload.notification || payload;
  const title = data.title || "Story za Dully";

  const iconUrl = new URL("icons/icon-192.png", self.registration.scope).href;

  const options = {
    body: data.body || "",
    icon: iconUrl,
    data: {
      url: data.url || "/story-za-dully-pwa/",
      id: data.id || ""
    }
  };

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      track(data.id, "delivered")
    ])
  );
});

/* BONYEZA NOTIFICATION */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const info = event.notification.data || {};
  const targetUrl = info.url || "/story-za-dully-pwa/";

  const openApp = clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .then((list) => {
      for (const client of list) {
