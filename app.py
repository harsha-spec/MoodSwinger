import os
import requests
from flask import Flask, redirect, request, session, url_for, render_template
from urllib.parse import urlencode

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev_secret_key")

# ================= SPOTIFY CONFIG =================
CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
REDIRECT_URI = os.getenv(
    "SPOTIFY_REDIRECT_URI",
    "http://127.0.0.1:5000/callback"
)


AUTH_URL = "https://accounts.spotify.com/authorize"
TOKEN_URL = "https://accounts.spotify.com/api/token"
API_BASE = "https://api.spotify.com/v1"

SCOPES = [
    "user-top-read",
    "user-read-private",
    "user-read-email"
]

# ================= HELPERS =================
def safe_json(response):
    try:
        return response.json()
    except ValueError:
        return None

def get_headers():
    return {
        "Authorization": f"Bearer {session.get('access_token')}"
    }

# ================= ROUTES =================
@app.route("/")
def index():
    return render_template("login.html")

@app.route("/login")
def login():
    params = {
        "client_id": CLIENT_ID,
        "response_type": "code",
        "redirect_uri": REDIRECT_URI,
        "scope": " ".join(SCOPES),
        "show_dialog": True
    }
    return redirect(f"{AUTH_URL}?{urlencode(params)}")

@app.route("/callback")
def callback():
    code = request.args.get("code")
    if not code:
        return redirect(url_for("index"))

    token_resp = requests.post(
        TOKEN_URL,
        data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": REDIRECT_URI,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET
        }
    )

    token_data = safe_json(token_resp)
    if not token_data or "access_token" not in token_data:
        return "Spotify authentication failed", 400

    session["access_token"] = token_data["access_token"]
    return redirect(url_for("dashboard"))

@app.route("/dashboard")
def dashboard():
    if "access_token" not in session:
        return redirect(url_for("index"))

    headers = get_headers()
    time_range = request.args.get("range", "short_term")
    params = {"limit": 10, "time_range": time_range}

    # ===== USER PROFILE =====
    profile_resp = requests.get(f"{API_BASE}/me", headers=headers)
    user_profile = safe_json(profile_resp) or {}

    # ===== TOP TRACKS =====
    tracks_resp = requests.get(
        f"{API_BASE}/me/top/tracks",
        headers=headers,
        params=params
    )
    tracks_data = safe_json(tracks_resp)
    top_tracks = tracks_data.get("items", []) if tracks_data else []

    # ===== TOP ARTISTS =====
    artists_resp = requests.get(
        f"{API_BASE}/me/top/artists",
        headers=headers,
        params=params
    )
    artists_data = safe_json(artists_resp)
    top_artists = artists_data.get("items", []) if artists_data else []

    return render_template(
        "dashboard.html",
        user_profile=user_profile,
        tracks=top_tracks,
        artists=top_artists,
        selected_range=time_range
    )

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("index"))

# ================= RUN =================
if __name__ == "__main__":
    app.run()
