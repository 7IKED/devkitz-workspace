# 🔌 SKILL: Account Connector (OAuth)

**ID:** `skill-auth-account-connector`
**Alias:** `oauth`, `account`
**Version:** 1.0
**Author:** Gemini

**Beschreibung (für LLMs):**
Dieser Skill definiert das Muster für die Implementierung eines Multi-Account-Systems über OAuth 2.0. Er stellt die logische Struktur, UI-Konzepte und JavaScript-Artefakte bereit, um Benutzer über verschiedene Drittanbieter (Google, GitHub etc.) zu authentifizieren und deren Profilinformationen abzurufen.

---

### 1. OAuth 2.0 Ablauf (Authorization Code Flow)

1.  **Trigger:** Benutzer klickt auf "Mit Google verbinden".
2.  **Redirect:** Die App leitet den Benutzer zur Google-Anmeldeseite weiter, inklusive `client_id`, `redirect_uri`, `scope` und `response_type=code`.
3.  **Zustimmung:** Der Benutzer loggt sich bei Google ein und erteilt der App die Erlaubnis.
4.  **Callback:** Google leitet den Benutzer zurück zur `redirect_uri` der App, mit einem `authorization_code` im URL-Parameter.
5.  **Token-Austausch:** Die App sendet den `authorization_code` serverseitig (oder über eine sichere Cloud Function) an Google, um ein `access_token` und `refresh_token` zu erhalten.
6.  **Speichern:** Das `access_token` wird sicher im `localStorage` oder `IndexedDB` für die Session gespeichert. Das Profilbild und der Name werden abgerufen.

---

### 2. UI-Artefakt: Provider-Liste
**Anwendung:** Im "Erster-Start-Banner" oder im Einstellungs-Popup.

**HTML-Artefakt (Konzept):**
```html
<div class="account-connector-grid">
  <button class="provider-btn" data-provider="google"><img src="assets/logos/google.png" alt="Google"> Verbinden</button>
  <button class="provider-btn" data-provider="github"><img src="assets/logos/github.png" alt="GitHub"> Verbinden</button>
  <!-- ... weitere Provider ... -->
</div>
```

---

### 3. JS-Artefakt: AuthService (Revealing Module Pattern)

**JS-Artefakt (Konzept):**
```javascript
const AuthService = (() => {
  const config = { google: { clientId: 'YOUR_GOOGLE_CLIENT_ID' }, /*...*/ };

  const login = (provider) => { /* Implementiert Schritt 2 des OAuth-Flows */ };
  const handleCallback = () => { /* Implementiert Schritt 4-6 des OAuth-Flows */ };
  const logout = (provider) => { /* Löscht Token und User-Daten */ };
  const getCurrentUser = () => { /* Gibt den aktuellen Benutzer zurück */ };

  return { login, handleCallback, logout, getCurrentUser };
})();
```