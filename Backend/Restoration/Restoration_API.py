from flask_cors import CORS
from flask import Flask, request, jsonify, send_file
import requests
import concurrent.futures
from PIL import Image
import io
from ultralytics import YOLO
import cv2
import numpy as np

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5000"],  # Allow only Main API
        "methods": ["POST"],
        "allow_headers": ["Content-Type"]
    }
})


yolo_model_path = r"D:\vs code\GP Full Project\Backend\Restoration\best_yolov8_model.pt"
yolo_model = YOLO(yolo_model_path)
save_path = r"D:\vs code\GP Full Project\Backend\Restoration"

def yolo_prediction(image):
    """Returns the most confident cropped monument region"""
    # Convert PIL to OpenCV format
    image_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

    # Perform prediction
    results = yolo_model.predict(image)

    # Find detection with highest confidence
    best_conf = 0
    best_crop = None
    

    # Extract bounding boxes
    for result in results:
        for box, conf in zip(result.boxes.xyxy, result.boxes.conf):
            if conf > best_conf:
                best_conf = conf
                x1, y1, x2, y2 = map(int, box.tolist())
                best_crop = image_cv[y1:y2, x1:x2]

    # if best_crop is not None:
    #     # Save the cropped image to disk
    #     print("Best Crop is not NONE")
    #     cv2.imwrite(save_path, cv2.cvtColor(best_crop, cv2.COLOR_BGR2RGB))
    #     cv2.imshow("Cropped Monument", best_crop)
    #     cv2.waitKey(0)  # Waits for a key press to close
    #     cv2.destroyAllWindows()
        
    return best_crop
    
    # # Visualize or use the boxes
    # for box, conf, cls_id in zip(boxes, confidences, class_ids):
    #     x1, y1, x2, y2 = box.tolist()
        
    #     # Crop the detected region from the original image
    #     cropped_region = image[int(y1):int(y2), int(x1):int(x2)]
        
        
    #     # Or you can visualize the box
    #     cv2.rectangle(image, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)

    # # Save or display the result
    # cv2.imwrite("output.jpg", image)


@app.route("/restore", methods = ["POST"])
def restore_artifact():
    try:
        # Get image from request
        image_file = request.files["image"]
        image = Image.open(io.BytesIO(image_file.read()))  # Read image into PIL object

        cropped_region = yolo_prediction(image)

        if cropped_region is None:
            return jsonify({"error": "No monuments detected"}), 404
        
        # Convert back to PIL Image
        cropped_region = cv2.cvtColor(cropped_region, cv2.COLOR_BGR2RGB)
        output_image = Image.fromarray(cropped_region)
        
        # Return as image file
        img_byte_arr = io.BytesIO()
        output_image.save(img_byte_arr, format='JPEG')
        img_byte_arr.seek(0)

        return send_file(
            img_byte_arr,
            mimetype='image/jpeg',
            as_attachment=True,
            download_name='cropped_monument.jpg'
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5003, debug=True)