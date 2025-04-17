from flask_cors import CORS
from flask import Flask, request, jsonify
import requests
import concurrent.futures
from PIL import Image
import io
from ultralytics import YOLO
import cv2

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5000"],  # Allow only Main API
        "methods": ["POST"],
        "allow_headers": ["Content-Type"]
    }
})


yolo_model_path = r"D:\vs code\GP Full Project\Backend\Restoration\best_yolov8_model.pt"
yolo_model = YOLO("/content/drive/MyDrive/best_yolov8_model.pt")

def yolo_prediction(image):
    # Perform prediction
    results = yolo_model.predict(image)

    # Extract bounding boxes
    for result in results:
        boxes = result.boxes.xyxy  # Get boxes in xyxy format
        confidences = result.boxes.conf  # Confidence scores
        class_ids = result.boxes.cls  # Class IDs
    
    # Visualize or use the boxes
    for box, conf, cls_id in zip(boxes, confidences, class_ids):
        x1, y1, x2, y2 = box.tolist()
        
        # Crop the detected region from the original image
        cropped_region = image[int(y1):int(y2), int(x1):int(x2)]
        
        
        # Or you can visualize the box
        cv2.rectangle(image, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)

    # Save or display the result
    cv2.imwrite("output.jpg", image)


@app.route("/restore", methods = ["POST"])
def restore_artifact():
    pass


if __name__ == "__main__":
    app.run(port=5003, debug=True)