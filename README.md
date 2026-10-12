# Browser Storage Lab

An interactive educational web application for exploring browser-side storage technologies and understanding how modern web applications store, retrieve, and manage client-side data.

## Features

Browser Storage Lab provides interactive demonstrations of the following web technologies:

- **Cookies** — create, inspect, and delete cookies using a Go HTTP server. The demo uses `HttpOnly` and `SameSite` attributes.
- **LocalStorage** — save, retrieve, update, and delete key-value pairs that persist across page reloads.
- **SessionStorage** — experiment with temporary key-value data scoped to the current browsing context.
- **IndexedDB** — store and manage structured data asynchronously using a browser database.
- **Cache API** — save and retrieve HTTP-style request/response pairs in browser-managed caches.
- **Service Worker** — register, inspect, and unregister a service worker that can support offline access to the application shell.

## Technology Stack

- **Go** — HTTP server and cookie API endpoints.
- **HTML5** — application structure.
- **CSS3** — styling and responsive layout.
- **JavaScript** — browser storage operations and interactive controls.
- **Web APIs** — Cookies, Web Storage, IndexedDB, Cache API, and Service Workers.

## Project Structure

```text
browser-storage-lab/
├── main.go
├── static/
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── sw.js
└── README.md
```

- `main.go` — starts the HTTP server, serves static files, and implements cookie endpoints.
- `static/index.html` — contains the user interface and interactive demonstrations.
- `static/style.css` — defines the visual design and responsive layout.
- `static/app.js` — implements browser storage operations and connects the UI controls.
- `static/sw.js` — implements service worker lifecycle and request-handling logic.

## Requirements

- Go 1.25+
- A modern browser with support for the demonstrated Web APIs.

## Getting Started

### 1. Clone or download the project

```bash
git clone <repository-url>
cd browser-storage-lab
```

### 2. Start the server

Run:

```bash
go run .
```

The server listens on `localhost:8080`.

### 3. Open the application

Navigate to:

[http://localhost:8080](http://localhost:8080)

## License

Distributed under the [MIT License](https://choosealicense.com/licenses/mit/). See [`LICENSE`](LICENSE) for more information.
