# Google Drive Sync Setup Guide

Since this application runs entirely client-side without a backend server, you must provide your own Google Cloud credentials to enable Google Drive Sync.

## 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., "DkZ-Sync").
3. Enable the **Google Drive API** for this project.

## 2. Configure OAuth Consent Screen

1. Go to **APIs & Services > OAuth consent screen**.
2. Select **External** (unless you have a G-Suite organization).
3. Fill in required fields (App Name, email).
4. **Scopes**: Add `.../auth/drive.file` (Allows access only to files created by this app).
5. Add your email configuration as a **Test User**.

## 3. Create Credentials

1. Go to **APIs & Services > Credentials**.
2. Click **Create Credentials > OAuth client ID**.
3. Application Type: **Web application**.
4. **Authorized JavaScript origins**:
   - For local development: `http://localhost`, `http://127.0.0.1`
   - If you host this elsewhere: The full URL of your hosted app.
5. Click **Create**.

## 4. Connect DkZ devkitz

1. Copy the **Client ID** (looks like `...apps.googleusercontent.com`).
2. Copy the **API Key** (create one if not prompted: "Create Credentials" > "API Key").
3. Open **DkZ devkitz Settings**.
4. Paste the Client ID and API Key into the "Cloud Sync" section.
5. Click **Connect**.

> [!WARNING]
> Your credentials are stored in your browser's `localStorage`. Clear your browser data to remove them. Never share your API Key or Client ID publicly if you use this on a public domain.
