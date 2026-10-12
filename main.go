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

		cookieName := r.URL.Query().Get("name")
		if cookieName == "" {
			cookieName = "username"
		}

		cookieValue := r.URL.Query().Get("value")
		if cookieValue == "" {
			cookieValue = "admin"
		}

		cookie := &http.Cookie{
			Name:     cookieName,
			Value:    cookieValue,
			Path:     "/",
			HttpOnly: true,
			SameSite: http.SameSiteLaxMode,
			Expires:  time.Now().Add(30 * time.Minute),
		}

		http.SetCookie(w, cookie)

		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		w.Write([]byte("Cookie '" + cookieName + "' установлена со значением: " + cookieValue))
	})

	mux.HandleFunc("/api/cookie/check", func(w http.ResponseWriter, r *http.Request) {
		cookieName := r.URL.Query().Get("name")

		cookie, err := r.Cookie(cookieName)
		if err != nil {
			http.Error(w, "Cookie '"+cookieName+"' не найдена", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		w.Write([]byte("Получена cookie '" + cookie.Name + "': " + cookie.Value))
	})

	mux.HandleFunc("/api/cookie/clear", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		for _, cookie := range r.Cookies() {
			http.SetCookie(w, &http.Cookie{
				Name:     cookie.Name,
				Value:    "",
				Path:     "/",
				HttpOnly: true,
				SameSite: http.SameSiteLaxMode,
				MaxAge:   -1,
			})
		}

		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		w.Write([]byte("Все cookies успешно очищены сервером"))
	})

	mux.HandleFunc("/api/cookie/delete", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		cookieName := r.URL.Query().Get("name")
		if cookieName == "" {
			cookieName = "demo_session"
		}

		http.SetCookie(w, &http.Cookie{
			Name:     cookieName,
			Value:    "",
			Path:     "/",
			HttpOnly: true,
			SameSite: http.SameSiteLaxMode,
			MaxAge:   -1,
		})

		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		w.Write([]byte("Cookie '" + cookieName + "' удалена"))
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
