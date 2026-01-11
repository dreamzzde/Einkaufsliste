self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("shopping-v4").then(c =>
      c.addAll(["./", "./index.html", "./style.css", "./app.js"])
    )
  );
});
