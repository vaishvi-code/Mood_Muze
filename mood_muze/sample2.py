from flask import Flask, render_template, jsonify, redirect, url_for
from flask_ngrok import run_with_ngrok
from flask_cors import CORS

app = Flask(__name__)
run_with_ngrok(app)
CORS(app)
#Finale for FER and playlist recommendation
import cv2
from deepface import DeepFace
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import webbrowser

# Load face cascade classifier
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Start capturing video
cap = cv2.VideoCapture(0)

#Set your Spotify Developer information
client_id = '43a2f0108fba4e95a4f2b777cd0547b9'
client_secret = 'ca9514e2daa143eba212202afdf2bccd'
redirect_uri = 'http://localhost:8888/callback/'

#Define the emotion to playlist mapping
emotion_playlist = {
    'happy': 'https://open.spotify.com/playlist/7GhawGpb43Ctkq3PRP1fOL?si=9fba80c3808a464a',
    'sad': 'https://open.spotify.com/playlist/2GevOeTWtEEX4EVFEdX5zE?si=d730f99a75e74cd2',
    'angry': 'https://open.spotify.com/playlist/4Ouff72gQ4LCA8qEkBl3fH?si=fa87b9b3b5704682',
    'surprised': 'https://open.spotify.com/playlist/3CUpYjEl8N4KQWT57iJJD7?si=dacd4e26f05e4020',
    'fear': 'https://open.spotify.com/playlist/4qttDydvt6zAKRlnjR0G6C?si=b6e587e3a3324e6d',
    'confused': 'https://open.spotify.com/playlist/63GnUl1NxDKld4ZjjzUCBc?si=18286a24cda4416f',
    'neutral': 'https://open.spotify.com/playlist/5MX1quD2Hrs1I59eRTJ1Q8?si=35ae7e67b1e34a60',
}

def generate_playlist(emotion):
    # Authenticate with Spotify
    sp = spotipy.Spotify(auth_manager=SpotifyOAuth(client_id=client_id,
                                                   client_secret=client_secret,
                                                   redirect_uri=redirect_uri,
                                                   scope='playlist-modify-public'))

    # Get the playlist for the emotion
    playlist_id = emotion_playlist.get(emotion)

    if playlist_id:
        # Open the playlist in the Spotify app
        webbrowser.open(playlist_id)
    else:
        print('Invalid emotion')

def detect_emotion():
    while True:
        # Capture frame-by-frame
        ret, frame = cap.read()

        # Convert frame to grayscale
        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Detect faces in the frame
        faces = face_cascade.detectMultiScale(gray_frame, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

        for (x, y, w, h) in faces:
            # Draw rectangle around face
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 0, 255), 2)

        # Display the resulting frame with face detection
        cv2.imshow('Face Detection', frame)

        # Press 'spacebar' to capture image
        if cv2.waitKey(1) & 0xFF == ord(' '):
            # Capture the current frame as an image
            captured_image = frame.copy()

            # Convert captured image to grayscale
            gray_captured_image = cv2.cvtColor(captured_image, cv2.COLOR_BGR2GRAY)

            # Convert grayscale image to RGB format
            rgb_captured_image = cv2.cvtColor(gray_captured_image, cv2.COLOR_GRAY2RGB)

            # Detect faces in the captured image
            faces = face_cascade.detectMultiScale(gray_captured_image, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

            for (x, y, w, h) in faces:
                # Extract the face ROI (Region of Interest)
                face_roi = rgb_captured_image[y:y + h, x:x + w]

                # Perform emotion analysis on the face ROI
                result = DeepFace.analyze(face_roi, actions=['emotion'], enforce_detection=False)

                # Determine the dominant emotion
                emotion = result[0]['dominant_emotion']

                # Draw rectangle around face and label with predicted emotion
                cv2.rectangle(captured_image, (x, y), (x + w, y + h), (0, 0, 255), 2)
                cv2.putText(captured_image, emotion, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)

                # Display the captured image with emotion detection
                cv2.imshow('Emotion Detection', captured_image)

                # Generate Spotify playlist based on the detected emotion
                generate_playlist(emotion)

            # Display the captured image with emotion detection
            cv2.imshow('Emotion Detection', captured_image)

            # Save the captured image
            # cv2.imwrite('captured_emotion_image.jpg', captured_image)

        # Press 'x' to exit
        if cv2.waitKey(1) & 0xFF == ord('x'):
            break

    # Release the capture and close all windows
    cap.release()
    cv2.destroyAllWindows()


@app.route('/')
def index():
    return render_template('button.html')
    #return redirect(url_for('static', filename='button.html'))

@app.route('/start_detection')
def start_detection():
    detect_emotion()
    return jsonify({'message': 'Emotion detection completed'})

if __name__ == '__main__':
    app.run()
