from fastapi import FastAPI, UploadFile, Response , HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from contextlib import asynccontextmanager
# from diffusers import StableDiffusionPipeline, EulerDiscreteScheduler
import torch
from PIL import Image
import io
from io import BytesIO
from diffusers import StableDiffusionInpaintPipeline
import asyncio
import base64
from io import BytesIO
import numpy as np
import os
from pathlib import Path
from ultralytics import YOLO


# Load YOLOv8 model (outside the endpoint for better performance)
yolo_model_path = r"D:\vs code\GP Full Project\Backend\Restoration\best_yolov8_model.pt"
yolo_model = YOLO(yolo_model_path)  # Load once when the app starts


# Async context manager for lifespan events
@asynccontextmanager
async def life_span(app: FastAPI):
    # Load model safely
    try:
        app.state.pipe = StableDiffusionInpaintPipeline.from_pretrained(
            "Rasmy/GP_restoration_finetuned_SD",
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
        ).to("cuda")

        pipe = app.state.pipe
        # pipe.enable_attention_slicing()

        print(f"Running on device: {pipe.device}")

        print(torch.cuda.is_available())          # Should be True
        print(torch.cuda.get_device_name(0))      # Should show your GPU
        print(pipe.device)                        # Should be cuda


        print("✅ Model loaded successfully")
        yield
    finally:
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

app = FastAPI(lifespan= life_span)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],              # Allow requests from ANY origin (for development only)
    allow_credentials=True,          # Allow cookies/auth headers
    allow_methods=["*"],             # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],             # Allow all request headers
)

@app.post("/inpaint")
async def inpaint(original_image: UploadFile, mask_image: UploadFile, language: str = "english"):
    try:
        print("Files received")


        result_dir = Path(r"D:\vs code\GP Full Project\Backend\Restoration\Result")
        result_dir.mkdir(exist_ok=True)  # This creates the directory if it doesn't exist

        # Read and convert images
        image = Image.open(io.BytesIO(await original_image.read())).convert("RGB")
        mask = Image.open(io.BytesIO(await mask_image.read())).convert("RGB")


        cropped_image_pil, cropped_mask_pil = yolo_pipeline(image, mask)


        # Convert mask to binary (black/white)
        mask_array = np.array(cropped_mask_pil)
        # mask_array = (mask_array.mean(axis=2) > 128).astype(np.uint8) * 255
        # binary_mask = Image.fromarray(mask_array).convert("L")
        white_threshold = 250
        white_mask = np.all(mask_array >= white_threshold, axis=-1).astype(np.uint8) * 255
        binary_mask = Image.fromarray(white_mask).convert("L")  # Convert to PIL Image


        # Save the binary mask (using relative path)
        mask_filename = f"binary_mask_{original_image.filename}"
        save_path = result_dir / mask_filename
        binary_mask.save(save_path)
        print(f"Mask saved as {save_path}")

        # Save cropped image for reference
        cropped_filename = f"cropped_{original_image.filename}"
        cropped_path = result_dir / cropped_filename
        cropped_image_pil.save(cropped_path)
        print(f"Cropped image saved as {cropped_path}")

        # Process image
        result = await run_model(
            pipe=app.state.pipe,
            image=image,
            mask=white_mask,  # Use the binary mask we created
        )

        # Save and return the result
        result_filename = f"restored_{original_image.filename}"
        result_path = result_dir / result_filename
        result.save(result_path)
        print(f"Result saved as {result_path}")

        # Convert to bytes for response
        img_byte_arr = BytesIO()
        result.save(img_byte_arr, format="PNG")
        img_byte_arr.seek(0)

        return Response(
            content=img_byte_arr.getvalue(),
            media_type="image/png"
        )
    except Exception as e:
        print(f"Error in inpaint: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Image processing failed: {str(e)}")
    
# async def inpaint(original_image: UploadFile, mask_image: UploadFile, language: str = "english"):
    
#     try:
#         print("Files received")
#         image = Image.open(io.BytesIO(await original_image.read())).convert("RGB") #image.file.read()
#         mask = Image.open(io.BytesIO(await mask_image.read())).convert("RGB")

#         # Convert mask to binary (black/white)
#         mask_array = np.array(mask_image)
#         mask_array = (mask_array.mean(axis=2) > 128).astype(np.uint8) * 255
#         binary_mask = Image.fromarray(mask_array).convert("L")

#         # Save the binary mask
#         mask_filename = "binary_mask_" + original_image.filename  # You can customize the filename

#         save_path = r"D:\vs code\GP Full Project\Backend\Restoration\Result\binary_mask_" + original_image.filename
#         binary_mask.save(save_path)
#         print(f"mask saved as {mask_filename}")



#         # result = await run_model(pipe=app.state.pipe, image=image, mask=mask)
#         # Process image
#         result = await run_model(
#                 pipe=app.state.pipe,
#                 image=image,
#                 mask=mask,
#             )
        

#         # Convert PIL Image to bytes
#         img_byte_arr = BytesIO()
#         # result.save(img_byte_arr, format="PNG")  # Or "JPEG"

#         result.save(r"D:\vs code\GP Full Project\Backend\Restoration\Result\restored_image.png")

#         # img_byte_arr.seek(0)  # Reset pointer to start

#         # img_str = base64.b64encode(img_byte_arr.getvalue()).decode("utf-8")
        
#         # return {"restored_image": f"data:image/png;base64,{img_str}"}

#         # Return image directly as a response
#         return Response(
#             content=img_byte_arr.getvalue(),
#             media_type="image/png"  # Or "image/jpeg"
#         ) #Fileresponse()
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e))


async def run_model(pipe, image, mask):
    prompt = "A high-resolution photograph of an ancient Egyptian monument with the missing part realistically reconstructed"

    # Read and convert the uploaded files
    # input_image = Image.open(io.BytesIO(image_file.read())).convert("RGB")
    # mask_image = Image.open(io.BytesIO(mask_file.read())).convert("RGB")

    # image = pipe(prompt=prompt, image=image, mask_image=mask).images[0]

    # Offload CPU/GPU-bound work to a thread
    # return await asyncio.to_thread(
    #     pipe, prompt=prompt, image=image, mask_image=mask
    # ).images[0]
    # Correct async execution
    try:
        return await asyncio.to_thread(
            lambda: pipe(prompt=prompt, image=image, mask_image=mask).images[0]
        )
    except Exception as e:
        print(f"Model error: {str(e)}")


def yolo_pipeline(image, mask):
    # Convert to numpy arrays for processing
        image_np = np.array(image)
        mask_np = np.array(mask)

        # Detect monument using YOLOv8
        results = yolo_model(image_np)
        
        if len(results[0].boxes) == 0:
            raise HTTPException(status_code=400, detail="No monument detected in the image")

        # Get the first detected monument (assuming one monument per image)
        box = results[0].boxes[0]
        x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())  # Get coordinates

        # Add padding to the bounding box (10% of width/height)
        width, height = x2 - x1, y2 - y1
        pad_x, pad_y = int(0.1 * width), int(0.1 * height)
        x1 = max(0, x1 - pad_x)
        y1 = max(0, y1 - pad_y)
        x2 = min(image_np.shape[1], x2 + pad_x)
        y2 = min(image_np.shape[0], y2 + pad_y)

        # Crop both image and mask using the same coordinates
        cropped_image = image_np[y1:y2, x1:x2]
        cropped_mask = mask_np[y1:y2, x1:x2]

        # Convert back to PIL Images
        cropped_image_pil = Image.fromarray(cropped_image)
        cropped_mask_pil = Image.fromarray(cropped_mask)

        return cropped_image_pil, cropped_mask_pil

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, port=8000)