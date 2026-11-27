/* This worker intentionally has no fetch handler: authenticated ERP responses must not be cached. */
self.addEventListener("push", (event) => {
  let payload = {};

  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : "Tienes una actualizacion pendiente." };
  }

  const title = typeof payload.title === "string" && payload.title.trim() ? payload.title.trim() : "APG ERP";
  const body = typeof payload.body === "string" && payload.body.trim() ? payload.body.trim() : "Tienes una actualizacion pendiente.";
  const rawUrl = typeof payload.url === "string" ? payload.url : "/";
  const url = rawUrl.startsWith("/") && !rawUrl.startsWith("//") ? rawUrl : "/";
  const tag = typeof payload.tag === "string" && payload.tag.trim() ? payload.tag : undefined;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/logo_white.png",
      badge: "/logo_white.png",
      tag,
      renotify: Boolean(tag),
      data: { url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const destination = typeof event.notification.data?.url === "string" ? event.notification.data.url : "/";
  const target = new URL(destination, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((client) => client.url.startsWith(self.location.origin));
      if (existing) return existing.focus().then(() => existing.navigate(target));
      return self.clients.openWindow(target);
    })
  );
});
