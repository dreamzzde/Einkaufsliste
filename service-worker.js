self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("shopping-v2").then(c =>
      c.addAll(["./", "./index.html", "./style.css", "./app.js"])
    )
  );
});
