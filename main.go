package main

import (
	"log"
	"net/http"
	"time"
)

func main() {
	mux := http.NewServeMux()

	staticFiles := http.FileServer(http.Dir("./static"))
	mux.Handle("/", staticFiles)

	mux.HandleFunc("/api/cookie/set", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		cookieValue := r.URL.Query().Get("value")
		if cookieValue == "" {
			cookieValue = "example123"
		}

		cookie := &http.Cookie{
			Name:     "demo_session",
			Value:    cookieValue,
			Path:     "/",
			HttpOnly: true,
			SameSite: http.SameSiteLaxMode,
			Expires:  time.Now().Add(30 * time.Minute),
		}

		http.SetCookie(w, cookie)

		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		w.Write([]byte("HttpOnly cookie установлена"))
	})

	mux.HandleFunc("/api/cookie/check", func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("demo_session")
		if err != nil {
			http.Error(w, "Cookie не найдена", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		w.Write([]byte("Cookie получена сервером: " + cookie.Value))
	})

	mux.HandleFunc("/api/cookie/delete", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		http.SetCookie(w, &http.Cookie{
			Name:     "demo_session",
			Value:    "",
			Path:     "/",
			HttpOnly: true,
			SameSite: http.SameSiteLaxMode,
			MaxAge:   -1,
		})

		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		w.Write([]byte("Cookie удалена"))
	})

	server := &http.Server{
		Addr:              "localhost:8080",
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
	}

	log.Println("Browser Storage Lab launched")
	log.Println("Open http://localhost:8080")

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}
