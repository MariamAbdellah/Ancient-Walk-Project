from flask import Flask, request, jsonify
import sys
import os
from flask_cors import CORS

sys.path.append(os.path.abspath("."))
from DB.data import UserData

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

db = UserData()

@app.route("/")
def index():
    return "Backend is running!"

@app.route("/login", methods=["POST"])
def user_login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    if db.login(email=email, password=password):
        return jsonify({"user": {"email": email}})
    else:
        return jsonify({"message": "Invalid Data"}), 401


@app.route("/register", methods=["POST"])
def user_register():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    if db.insert_user(email=email, password=password):
        return jsonify({"user": {"email": email}})
    else:
        return jsonify({"message": "Registration failed"}), 401



if __name__ == "__main__":
    app.run(debug=True)
