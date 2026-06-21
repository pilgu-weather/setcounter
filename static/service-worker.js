self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type !== "SHOW_WORKOUT_REMINDER") {
    return;
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "흐엇?!", {
      body: data.body || "오늘 운동 기록할 시간입니다.",
      icon: "/static/assets/newlogo_trim.png?v=1",
      badge: "/static/assets/newlogo_trim.png?v=1",
      tag: "daily-workout-reminder",
      renotify: true,
      data: { url: "/main" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || "/main", self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url === targetUrl && "focus" in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
