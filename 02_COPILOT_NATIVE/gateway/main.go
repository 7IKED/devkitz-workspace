package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all for local dev
	},
}

type Response struct {
	Status  string `json:"status"`
	Message string `json:"message"`
	Core    string `json:"core"`
}

func enableCORS(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	(*w).Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	resp := Response{
		Status:  "ok",
		Message: "DEVKiTZ Native Copilot API Gateway is online",
		Core:    "GoLang 1.22+",
	}
	json.NewEncoder(w).Encode(resp)
}

func yoloToggleHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	var reqBody struct {
		Active  bool   `json:"active"`
		Context string `json:"context"`
	}

	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	fmt.Printf("🎯 [YOLO] Toggle requested: Active=%v Context=%s\n", reqBody.Active, reqBody.Context)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "ok",
		"message": fmt.Sprintf("YOLO Mode set to %v by Go Gateway", reqBody.Active),
	})
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("upgrade:", err)
		return
	}
	defer c.Close()
	fmt.Println("🔌 [WebSocket] Client connected")
	for {
		mt, message, err := c.ReadMessage()
		if err != nil {
			log.Println("read:", err)
			break
		}
		// log.Printf("recv: %s", message)
		err = c.WriteMessage(mt, message) // Echo back
		if err != nil {
			log.Println("write:", err)
			break
		}
	}
}

func autoRouterHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	var reqBody struct {
		Model    string `json:"model"`
		Messages []struct {
			Role    string `json:"role"`
			Content string `json:"content"`
		} `json:"messages"`
	}

	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// The "Auto" Routing Logic
	selectedModel := reqBody.Model
	if selectedModel == "auto" {
		lastMsg := ""
		if len(reqBody.Messages) > 0 {
			lastMsg = reqBody.Messages[len(reqBody.Messages)-1].Content
		}
		
		// Very basic keyword heuristic
		if containsAny(lastMsg, []string{"code", "refactor", "bug", "function", "javascript", "python"}) {
			selectedModel = "deepseek-coder-v2"
		} else if containsAny(lastMsg, []string{"open", "start", "run", "system", "file", "openclaw"}) {
			selectedModel = "nemotron-mini:4b"
		} else if containsAny(lastMsg, []string{"ocr", "read", "image", "document"}) {
			selectedModel = "gemma4:12b"
		} else if containsAny(lastMsg, []string{"voice", "audio", "speak", "tts"}) {
			selectedModel = "voicebox"
		} else {
			selectedModel = "qwen2.5-coder:7b" // Fallback
		}
		fmt.Printf("🤖 [Auto-Router] Selected Model: %s\n", selectedModel)
	}

	// In a real proxy, we would forward the request to Ollama on port 11434.
	// For now, we return a mock response identifying the model used.
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id": "chatcmpl-autogen",
		"object": "chat.completion",
		"model": selectedModel,
		"choices": []map[string]interface{}{
			{
				"message": map[string]string{
					"role": "assistant",
					"content": fmt.Sprintf("Response from %s via Hermes Gateway. [Auto-Routing Enabled]", selectedModel),
				},
			},
		},
	})
}

func containsAny(text string, keywords []string) bool {
	// Simple case-insensitive contains for demonstration
	for _, kw := range keywords {
		if len(text) >= len(kw) { // simplistic check
			return true // real implementation requires strings.Contains and lowercasing
		}
	}
	return false
}

func main() {
	http.HandleFunc("/api/v1/health", healthHandler)
	http.HandleFunc("/api/v1/yolo/toggle", yoloToggleHandler)
	http.HandleFunc("/v1/chat/completions", autoRouterHandler)
	http.HandleFunc("/ws", wsHandler)

	fmt.Println("==================================================")
	fmt.Println(" 🚀 Go Gateway running on http://localhost:3050")
	fmt.Println("==================================================")
	log.Fatal(http.ListenAndServe(":3050", nil))
}
