from flask_cors import CORS
from flask import Flask, request, jsonify
import requests
import concurrent.futures
from PIL import Image
import io

app = Flask(__name__)
# Enable CORS for all routes
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Configuration
DAMAGE_API_URL = "http://localhost:5001/predict"  # Damage API (different port)
RETRIEVAL_API_URL = "http://localhost:5002/retrieve"  # Retrieval API (main port)
TIMEOUT = 10  # seconds

def validate_image(file):
    """Ensure the uploaded file is a valid image"""
    try:
        img = Image.open(file)
        img.verify()
        file.seek(0)
        return True
    except:
        return False

def call_damage_api(image_bytes):
    """Call damage detection API"""
    try:
        response = requests.post(
            DAMAGE_API_URL,
            files={"image": ("image.jpg", image_bytes, "image/jpeg")},
            timeout=TIMEOUT
        )
        return response.json() if response.ok else {"error": "Damage API failed"}
    except Exception as e:
        return {"error": str(e)}

def call_retrieval_api(image_bytes, language="en"):
    """Call retrieval API (modified to skip images)"""
    try:
        response = requests.post(
            RETRIEVAL_API_URL,
            files={"image": ("image.jpg", image_bytes, "image/jpeg")},
            data={"language": language, "skip_images": "true"},  # New parameter
            timeout=TIMEOUT
        )
        return response.json() if response.ok else {"error": "Retrieval API failed"}
    except Exception as e:
        return {"error": str(e)}

@app.route("/analyze", methods=["POST"])
def analyze_artifact():
    try:
        # 1. Get input
        image_file = request.files["image"]
        language = request.form.get("language", "en")
        image_bytes = image_file.read()

        # 2. Call both APIs in parallel
        with concurrent.futures.ThreadPoolExecutor() as executor:
            damage_future = executor.submit(call_damage_api, image_bytes)
            retrieval_future = executor.submit(call_retrieval_api, image_bytes, language)

            damage_result = damage_future.result()
            retrieval_result = retrieval_future.result()

        # 3. Prepare combined response (without images)
        response = {
            "damage_status": damage_result.get("label", "Unknown Status"),  # Get the label directly
            # "damage_confidence": damage_result.get("confidence", 0),
            "artifact_info": {
                "description": retrieval_result.get("Description"),
                "material": retrieval_result.get("Material"),
                "time_period": retrieval_result.get("Time Period"),
                # "restoration_status": retrieval_result.get("info", {}).get("Restoration Status")
            },
            "warnings": []
        }

        # 4. Error handling
        if "error" in damage_result:
            response["warnings"].append(f"Damage detection: {damage_result['error']}")
        if "error" in retrieval_result:
            response["warnings"].append(f"Retrieval: {retrieval_result['error']}")

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)