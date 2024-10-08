from flask import Flask, request, jsonify
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing (for local testing)
messages = []


@app.route("/send_message", methods=["POST"])
def send_message():
    data = request.get_json()
    message = data["message"]
    timestamp = time.strftime("%H:%M")
    messages.append(f"{message} ({timestamp})")
    return jsonify({"success": True})


@app.route("/get_messages", methods=["GET"])
def get_messages():
    return jsonify(messages)


if __name__ == "__main__":
    app.run(debug=True)
