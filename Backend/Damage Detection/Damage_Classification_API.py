from flask_cors import CORS
from PIL import Image, ExifTags
import numpy as np
from flask import Flask, request, jsonify
import tensorflow as tf
import io

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5000"],  # Allow only Main API
        "methods": ["POST"],
        "allow_headers": ["Content-Type"]
    }
})

# Load your trained model
model_path = r"D:\vs code\GP Back\Damage Detection\damage_classification_model.keras"
model = tf.keras.models.load_model(model_path)

# Define label mapping
class_labels = {0: "No Restoration Needed", 1: "Needs Restoration"}

@app.route("/predict", methods=["POST"])
def predict():
    """Handle image classification requests."""
    try:
        # Get image from request
        image_file = request.files["image"]
        image = Image.open(io.BytesIO(image_file.read()))  # Read image into PIL object
        # Preprocess image (modify based on your model)
        processed_image = preprocessing_pipeline(image)

        # Make prediction
        prediction = model.predict(processed_image)
        print("Raw prediction probabilities:", prediction[0][0])  # Debug output

        predicted_class = int((prediction[0][0] > 0.5).astype(int))   #int(np.argmax(prediction))  # Convert to integer class (0 or 1)
        print("Predicted class:", predicted_class)  # Debug output

        # Convert class to human-readable label
        result = class_labels[predicted_class]

        return jsonify({"class": predicted_class, "label": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def preprocessing_pipeline(image):
    """Preprocess image function (modify based on your model)."""
    image = fix_orientation(image)
    return preprocess_query_image(image)

def fix_orientation(image):
    """Fix image orientation based on EXIF data."""
    try:
        exif = image.getexif()
        orientation = next(
            (tag for tag, value in ExifTags.TAGS.items() if value == "Orientation"),
            None
        )

        if orientation and exif:
            orientation_value = exif.get(orientation)
            if orientation_value == 3:
                image = image.rotate(180, expand=True)
            elif orientation_value == 6:
                image = image.rotate(270, expand=True)
            elif orientation_value == 8:
                image = image.rotate(90, expand=True)
    except Exception:
        pass  # Ignore EXIF errors
    return image

def preprocess_query_image(image, target_size=(224, 224)):
    """Preprocess query image for model inference."""
    image = image.resize(target_size, Image.Resampling.LANCZOS)

    img_array = np.array(image).astype(np.float32)
    img_array = (img_array / 127.5) - 1.0  # Ensure normalization matches training

    return np.expand_dims(img_array, axis=0)  # Add batch dimension


if __name__ == "__main__":
    app.run(port=5001,debug=True)