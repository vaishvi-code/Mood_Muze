from flask import Flask, redirect, url_for
import geocoder
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import webbrowser

app = Flask(__name__)

# Set your Spotify Developer information
client_id = 'YOUR_CLIENT_ID'
client_secret = 'YOUR_CLIENT_SECRET'
redirect_uri = 'http://localhost:8888/callback/'

# Define the emotion to playlist mapping
state_playlist = {
    'Rajasthan': 'https://open.spotify.com/playlist/2WSmlNi6hcFutn7q5samOV?si=8d091efaf61e4517',
    'Maharashtra': 'https://open.spotify.com/playlist/37i9dQZF1DX84EApEEEkUc?si=cfc7435a170d42a7',
    'Gujarat': 'https://open.spotify.com/playlist/0ahtofkR9qHdctnA56ash7?si=5171608555634a44',
    'Bihar': 'https://open.spotify.com/playlist/37i9dQZF1DX9BgAv0V9A8C?si=8d533c1694c34782',
    'Uttar Pradesh': 'https://open.spotify.com/playlist/4h8xLLUU32DC3gZ36pmjAW?si=b2a76b5799234299',
    'West Bengal': 'https://open.spotify.com/album/1zDQjAN968JFruaOoDkWXZ?si=29PQqFZkRLuF5S0hTHTFdA',
    'Goa': 'https://open.spotify.com/album/50NKv9Z882vgcisk0bdIrM?si=JGFfJkeOSkeJiY0b0SuSWA',
    'Assam': 'https://open.spotify.com/playlist/37i9dQZF1E8PJNR1Jqih35?si=1d9142bd70544f09',
    'Andhra Pradesh': 'https://open.spotify.com/playlist/37i9dQZF1DX6XE7HRLM75P?si=ccc9afda7d4748e9',
    'Tamil Nadu': 'https://open.spotify.com/playlist/37i9dQZF1DX1i3hvzHpcQV?si=7382b36b96994af0',
    'Punjab': 'https://open.spotify.com/playlist/37i9dQZF1DWXVJK4aT7pmk?si=42e515f3bf46417e',
    'Jammu and Kashmir': 'https://open.spotify.com/playlist/4ucV6sAbNlBcQsFy3H8Zy4?si=345dc5eb100e48be',
    'Arunachal Pradesh': 'https://open.spotify.com/playlist/6KRwuTxNzDQ7RyAhhCy9OV?si=0c61133e9e834278',
    'Odisha': 'https://open.spotify.com/playlist/0Vv84AFzg0dbWs9S5y0usV?si=8365ca36520b4496',
    'Kerala': 'https://open.spotify.com/playlist/6zTiiA1NGJZn33jejJVuM5?si=24438a1bdf4c4eb9',
    'Karnataka': 'https://open.spotify.com/playlist/1KhnrqdMdPGHVo0NzuemgZ?si=eccdecb71e9842af',
    'Telangana': 'https://open.spotify.com/playlist/37i9dQZF1DWTw6jXuVBprS?si=bad4ecd9e8f845b1',
}

def generate_playlist(state):
    # Authenticate with Spotify
    sp = spotipy.Spotify(auth_manager=SpotifyOAuth(client_id=client_id,
                                                   client_secret=client_secret,
                                                   redirect_uri=redirect_uri,
                                                   scope='playlist-modify-public'))
    # Get the playlist for the emotion
    playlist_id = state_playlist.get(state)

    if playlist_id:
        # Open the playlist in the Spotify app
        webbrowser.open(playlist_id)
    else:
        print('Invalid state')

def get_location_by_ip():
    # Get location data
    g = geocoder.ip('me')

    # Extract state from location data
    state = g.state
    return state

@app.route('/')
def index():
    return redirect(url_for('static', filename='button.html'))

@app.route('/run_script')
def run_script():
    state = get_location_by_ip()
    generate_playlist(state)
    return f"You are in the state of: {state}. Redirecting to the playlist..."

if __name__ == '__main__':
    app.run(port=5001, debug=True)
