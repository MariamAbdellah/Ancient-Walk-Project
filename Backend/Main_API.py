from flask_cors import CORS
from flask import Flask, request, jsonify
import requests
import concurrent.futures
from PIL import Image
import io

import googletrans
from googletrans import Translator


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
RETRIEVAL_API_URL = "http://localhost:5002/retrieve"  # Retrieval API 
RESTORATION_API_URL = "http://localhost:5003/restore"
TIMEOUT = 10  # seconds

translator = Translator()
# translator = Translator(service_urls=['translate.google.com'])

@app.route('/')
def home():
    return "Backend is running!"  # Test if this works

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
            # data={"language": language, "skip_images": "true"},  # New parameter
            timeout=TIMEOUT
        )
        return response.json() if response.ok else {"error": "Retrieval API failed"}
    except Exception as e:
        return {"error": str(e)}
    
def translate_text(text, src_lang, dest_lang):
    global translator  # Explicitly use the global variable
    if not text or str(text).strip() == "":
        return text  # Skip empty text
    
    try:
        translation = translator.translate(text, src=src_lang, dest=dest_lang)
        return translation.text
    except Exception as e:
        print(f"Translation failed for '{text}': {e}")
        return text  # Return original on failure
    
# def call_restoration_api(image_bytes):
#     """Call Restoration API"""
#     try:
#         response = requests.post(
#             RESTORATION_API_URL,
#             files={"image": ("image.jpg", image_bytes, "image/jpeg")},
#             timeout=TIMEOUT
#         )
#         return response.json() if response.ok else {"error": "Restoration API failed"}
#     except Exception as e:
#         return {"error": str(e)}
    

# def res_api(image_file):

#     print("Files received:", request.files)  # Check all files

#     filename = image_file.filename
#     print("Uploaded filename:", filename)
#     print("Content-Type:", image_file.content_type)
#     print("Headers:", request.headers)

#     image = Image.open(io.BytesIO(image_file.read()))  # Read image into PIL object

#     # Define a mapping of known filenames to result paths
#     result_mapping = {
#         "nefertiti_image.jpg": r"E:\Ancient-Walk-Project\Backend\Restoration\nefertiti result.jpg",
#         "akhenaton.jpg": r"E:\Ancient-Walk-Project\Backend\Restoration\akhenaton result.png",
#         "statue.jpg": r"E:\Ancient-Walk-Project\Backend\Restoration\statue result.png",
#         "snefru.jpg": r"E:\Ancient-Walk-Project\Backend\Restoration\snefru result.png"
#     }

#     # Use a default image if no match found
#     resut_path = result_mapping.get(filename, r"E:\Ancient-Walk-Project\Backend\Restoration\default_result.jpg")
        
#     resut_image = Image.open(resut_path).convert("RGB")

#     return resut_image

@app.route("/analyze", methods=["POST"])
def analyze_artifact():
    try:
        # 1. Get input
        image_file = request.files["original_image"]
        # mask_file = request.files["mask_image"]
        language = request.form.get("language", "en")
        if not language:
            language = "en"

        if language not in googletrans.LANGUAGES:
            language = "en"
        image_bytes = image_file.read()



        # 2. Call both APIs in parallel
        with concurrent.futures.ThreadPoolExecutor() as executor:
            damage_future = executor.submit(call_damage_api, image_bytes)
            retrieval_future = executor.submit(call_retrieval_api, image_bytes, language)
            # restoration_future = executor.submit(call_restoration_api, image_bytes)

            damage_result = damage_future.result()
            retrieval_result = retrieval_future.result()
         

        damage_status = (translate_text(damage_result.get("label", "Unknown Status"), "en", language))
        description = (translate_text(retrieval_result.get("Description"), "en", language))
        material = (translate_text(retrieval_result.get("Material"), "en", language))
        time_period = (translate_text(retrieval_result.get("Time Period"), "en", language))
 
        response = {
            "damage_status": damage_status,
            "artifact_info": {
                "description": description,
                "material": material,
                "time_period": time_period,
            },
            "warnings": []
        }


        
        # 4. Error handling
        if "error" in damage_result:
            response["warnings"].append(f"Damage detection: {damage_result['error']}")
        if "error" in retrieval_result:
            response["warnings"].append(f"Retrieval: {retrieval_result['error']}")

        print(response)

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)