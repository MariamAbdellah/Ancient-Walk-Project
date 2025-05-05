from fastapi import FastAPI, UploadFile, Response , HTTPException # 👈 Import Response
from fastapi.responses import StreamingResponse
from contextlib import asynccontextmanager
# from diffusers import StableDiffusionPipeline, EulerDiscreteScheduler
import torch
from PIL import Image
import io
from io import BytesIO
from diffusers import StableDiffusionInpaintPipeline
import asyncio


# image_file = r"D:\vs code\GP Full Project\Backend\Restoration\nefertiti_image.jpg"
# mask_file = r"D:\vs code\GP Full Project\Backend\Restoration\nefertiti_mask.png"

# pipe = None

# Async context manager for lifespan events
@asynccontextmanager
async def life_span(app: FastAPI):
    # Load model safely
    try:
        app.state.pipe = StableDiffusionInpaintPipeline.from_pretrained(
            "stabilityai/stable-diffusion-2-inpainting",
            torch_dtype=torch.float16
        ).to("cuda")
        app.state.pipe.enable_attention_slicing()
        print("✅ Model loaded successfully")
        yield
    finally:
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

app = FastAPI(lifespan= life_span)

@app.post("/inpaint")
async def inpaint(image: UploadFile, mask: UploadFile):
    try:
        image = Image.open(io.BytesIO(await image.read())).convert("RGB") #image.file.read()
        mask = Image.open(io.BytesIO(await mask.read())).convert("RGB")

        # result = await run_model(pipe=app.state.pipe, image=image, mask=mask)
        # Process image
        result = await run_model(
                pipe=app.state.pipe,
                image=image,
                mask=mask,
            )
        
        image.save("./restored_image.png")

        # Convert PIL Image to bytes
        img_byte_arr = BytesIO()
        result.save(img_byte_arr, format="PNG")  # Or "JPEG"
        img_byte_arr.seek(0)  # Reset pointer to start

        # Return image directly as a response
        return Response(
            content=img_byte_arr.getvalue(),
            media_type="image/png"  # Or "image/jpeg"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)