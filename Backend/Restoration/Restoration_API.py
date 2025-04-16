from flask_cors import CORS
from flask import Flask, request, jsonify
import requests
import concurrent.futures
from PIL import Image
import io

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5000"],  # Allow only Main API
        "methods": ["POST"],
        "allow_headers": ["Content-Type"]
    }
})




@app.route("/restore", methods = ["POST"])
def restore_artifact():
    pass


if __name__ == "__main__":
    app.run(port=5003, debug=True)