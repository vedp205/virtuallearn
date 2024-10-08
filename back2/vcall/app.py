from flask import Flask, render_template
from flask_socketio import SocketIO, emit, join_room, leave_room
import random
import string

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")


# Serve the home page with the video call interface
@app.route("/")
def index():
    return render_template("index.html")


# Generate a random 7-8 digit alphanumeric code
def generate_call_code():
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=8))


# WebSocket event when a user creates a new call
@socketio.on("create_call")
def create_call(data):
    call_code = generate_call_code()
    emit("call_created", {"call_code": call_code})


# WebSocket event for joining a call
@socketio.on("join_call")
def join_call(data):
    call_code = data["call_code"]
    join_room(call_code)
    emit("joined_call", {"call_code": call_code}, room=call_code)


# WebSocket event for sending signaling data
@socketio.on("signaling")
def handle_signaling(data):
    call_code = data["call_code"]
    signaling_data = data["signal"]
    emit("signaling", signaling_data, room=call_code)


if __name__ == "__main__":
    socketio.run(app, debug=True, host="0.0.0.0", port=5000)
