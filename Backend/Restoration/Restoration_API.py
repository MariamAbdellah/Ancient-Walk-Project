from flask_cors import CORS
from flask import Flask, request, jsonify, send_file, render_template
import requests
import concurrent.futures
from PIL import Image
import io
from ultralytics import YOLO
import cv2
import numpy as np

from diffusers import StableDiffusionXLInpaintPipeline, AutoencoderKL
import torch

import base64, os
# from IPython.display import HTML, Image
# from google.colab.output import eval_js
from base64 import b64decode
import matplotlib.pyplot as plt
from shutil import copyfile

import tempfile
import shutil

from huggingface_hub import hf_hub_download




app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5000"],  # Allow only Main API
        "methods": ["POST"],
        "allow_headers": ["Content-Type"]
    }
})


# # Load the fine-tuned SDXL model and VAE
# sd_model_path = r"D:\vs code\GP Full Project\Backend\Restoration\GP_restoration_finetuned_SD_xl_base_1\pytorch_lora_weights.safetensors"
# #"gp_sdxl/train_images"

# pipe = StableDiffusionXLInpaintPipeline.from_pretrained(
#     sd_model_path,
#     torch_dtype=torch.float16,
#     variant="fp16",
#     use_safetensors=True
# ).to("cuda" if torch.cuda.is_available() else "cpu")

# yolo_model_path = r"D:\vs code\GP Full Project\Backend\Restoration\best_yolov8_model.pt"
# yolo_model = YOLO(yolo_model_path)
save_path = r"D:\vs code\GP Full Project\Backend\Restoration"


# Initialize models
def initialize_models():
    # YOLO model for monument detection
    yolo_model_path = r"D:\vs code\GP Full Project\Backend\Restoration\best_yolov8_model.pt"
    # yolo_model = YOLO(yolo_model_path)

    # Clear cache first
    AutoencoderKL.from_pretrained("madebyollin/sdxl-vae-fp16-fix", torch_dtype=torch.float16, force_download=True)
    

    # try:
    #     hf_hub_download(
    #         repo_id="madebyollin/sdxl-vae-fp16-fix",
    #         filename="config.json",
    #         cache_dir="check_cache/"
    #     )
    #     print("Model files exist.")
    # except Exception as e:
    #     print(f"Error: {e}")

    # Initialize pipeline without VAE first

    vae = AutoencoderKL.from_pretrained("madebyollin/sdxl-vae-fp16-fix", torch_dtype=torch.float16)

    pipe = StableDiffusionXLInpaintPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    vae=vae,
    torch_dtype=torch.float16,
    variant="fp16",
    use_safetensors=True
    )

    # Try loading VAE separately with error handling
    # try:
    #     vae = AutoencoderKL.from_pretrained(
    #     "madebyollin/sdxl-vae-fp16-fix",
    #     torch_dtype=torch.float16,
    #     force_download=True,  # Forces fresh download
    #     resume_download=False  # Prevents partial downloads
    #     )
    #     pipe.vae = vae

    # except Exception as e:
    #     print(f"Couldn't load fp16-fix VAE, using default: {str(e)}")
    #     pipe.vae = AutoencoderKL.from_pretrained(
    #     "stabilityai/stable-diffusion-xl-base-1.0",
    #     subfolder="vae",
    #     torch_dtype=torch.float16
    #     )


    
    # Load LoRA weights (adjust path as needed)
    lora_path = r"D:\vs code\GP Full Project\Backend\Restoration\GP_restoration_finetuned_SD_xl_base_1"
    # lora_path = os.path.abspath("./GP_restoration_finetuned_SD_xl_base_1")
    # Verify the path exists
    if not os.path.exists(lora_path):
        raise ValueError(f"LORA weights not found at: {lora_path}")
    pipe.load_lora_weights(lora_path)
    
    device = "cuda" if torch.cuda.is_available() else "cpu"
    pipe = pipe.to(device)
    
    return pipe

pipe = initialize_models()


# Drawing page route
# @app.route('/draw')
# def draw_canvas():
#     return render_template('canvas.html')  # Make sure you have this file in templates/


# @app.route('/save_drawing', methods=['POST'])
# def save_drawing():
#     data_url = request.json.get('imageData')
#     if not data_url:
#         return jsonify({'error': 'No image data provided'}), 400

#     header, encoded = data_url.split(',', 1)
#     binary_data = base64.b64decode(encoded)

#     # Save the image to a desired path
#     with open('static/drawing.png', 'wb') as f:
#         f.write(binary_data)

#     return jsonify({'message': 'Drawing saved successfully!'})





# def yolo_prediction(image):
#     """Returns the most confident cropped monument region"""
#     # Convert PIL to OpenCV format
#     image_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

#     # Perform prediction
#     results = yolo_model.predict(image)

#     # Find detection with highest confidence
#     best_conf = 0
#     best_crop = None
    

#     # Extract bounding boxes
#     for result in results:
#         for box, conf in zip(result.boxes.xyxy, result.boxes.conf):
#             if conf > best_conf:
#                 best_conf = conf
#                 x1, y1, x2, y2 = map(int, box.tolist())
#                 best_crop = image_cv[y1:y2, x1:x2]

#     # if best_crop is not None:
#     #     # Save the cropped image to disk
#     #     print("Best Crop is not NONE")
#     #     cv2.imwrite(save_path, cv2.cvtColor(best_crop, cv2.COLOR_BGR2RGB))
#     #     cv2.imshow("Cropped Monument", best_crop)
#     #     cv2.waitKey(0)  # Waits for a key press to close
#     #     cv2.destroyAllWindows()
        
#     return best_crop


@app.route("/restore", methods = ["POST"])
def restore_artifact():
    try:
        # Get image from request
        image_file = request.files["image"]
        filename = image_file.filename
        print("Uploaded filename:", filename)

        image = Image.open(io.BytesIO(image_file.read()))  # Read image into PIL object

        if filename == "nefertiti_image.jpg":
            mask_path = r"D:\vs code\GP Full Project\Backend\Restoration\nefertiti_mask.png"
            mask = Image.open(mask_path).convert("RGB")
        elif filename == "akhenaton.jpg":
            mask_path = r"D:\vs code\GP Full Project\Backend\Restoration\akhenaton_mask.png"
        elif filename == "statue.jpg":
            mask_path = r"D:\vs code\GP Full Project\Backend\Restoration\statue_mask.png"
        elif filename == "snefru.jpg":
            mask_path = r"D:\vs code\GP Full Project\Backend\Restoration\snefru_mask.png"
 
        mask = Image.open(mask_path).convert("RGB")

        # cropped_region = yolo_prediction(image)

        # if cropped_region is None:
        #     return jsonify({"error": "No monuments detected"}), 404
        

        
        # # Convert back to PIL Image
        # cropped_region = cv2.cvtColor(cropped_region, cv2.COLOR_BGR2RGB)
        # output_image = Image.fromarray(cropped_region)


        # # Convert back to PIL Image
        # cropped_pil = Image.fromarray(cv2.cvtColor(cropped_region, cv2.COLOR_BGR2RGB))
        
        # Generate mask (in a real app, this should come from frontend drawing)
        # mask_image = generate_mask(cropped_pil)
        
        # Create temp directory for processing
        # temp_dir = tempfile.mkdtemp()
        # try:
            # Save images to temp directory
            # image_path = os.path.join(temp_dir, "monument_crop.png")
            # mask_path = os.path.join(temp_dir, "monument_mask.png")
            
            # cropped_pil.save(image_path)
            # mask_image.save(mask_path)
            
            # Run inpainting
        generator = torch.Generator(device=pipe.device).manual_seed(0)
        prompt = "A high-resolution photograph of an ancient Egyptian monument with the missing part realistically reconstructed"
            
        restored_images = pipe(
            prompt=prompt,               
            image=image,
            mask_image=mask,
            generator=generator,
            num_inference_steps=40,
            strength=0.5
        ).images
            
        if not restored_images:
            return jsonify({"error": "Inpainting failed to generate image"}), 500
                
        restored_image = restored_images[0]
            
        # Convert to bytes for response
        img_byte_arr = io.BytesIO()
        restored_image.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)


        return send_file(
            img_byte_arr,
            mimetype='image/jpeg',
            as_attachment=True,
            download_name='cropped_monument.jpg'
        )
    
        # finally:
        #     # Clean up temp directory
        #     shutil.rmtree(temp_dir, ignore_errors=True)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5003, debug=True)