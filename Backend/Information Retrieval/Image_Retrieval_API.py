from flask_cors import CORS
from flask import Flask, request, jsonify, send_from_directory
from PIL import Image
import io
import torch
import os
import tensorflow as tf
from torchvision import transforms
import torch.nn.functional as F
import pandas as pd

from SuperGlobal.model.CVNet_Rerank_model import CVNet_Rerank
from SuperGlobal.modules.coarse_retrieval.gemp import gemp
from SuperGlobal.modules.coarse_retrieval.rgem import rgem
from SuperGlobal.modules.coarse_retrieval.sgem import sgem

import googletrans
from googletrans import Translator
import asyncio

train_csv = r"D:\vs code\retrieval\train_monument.csv"
database_metadata = pd.read_csv(train_csv)
image_base_dir = r"D:\vs code\retrieval\train images"

class_mapping = {'Akhenaten': 0, 'Bent-pyramid-for-senefru': 1, 'Colossal-Statue-of-Ramesses-II': 2,
                 'Colossoi-of-Memnon': 3, 'Goddess-Isis-with-her-child': 4, 'Hatshepsut': 5, 'Hatshepsut-face': 6,
                 'Khafre-Pyramid': 7, 'Mask-of-Tutankhamun': 8, 'Nefertiti': 9, 'Pyramid_of_Djoser': 10, 'Ramessum': 11,
                 'Ramses-II-Red-Granite-Statue': 12, 'Statue-of-King-Zoser': 13,
                 'Statue-of-Tutankhamun-with-Ankhesenamun': 14, 'Temple_of_Isis_in_Philae': 15,
                 'Temple_of_Kom_Ombo': 16, 'The Great Temple of Ramesses -': 17, 'amenhotep-iii-and-tiye': 18,
                 'bust-of-ramesses-ii': 19, 'menkaure-pyramid': 20, 'sphinx': 21}

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# translator = Translator(service_urls=['translate.google.com'])
translator = Translator()


def setup_cvnet():
    # Initialize the model components
    model = CVNet_Rerank(RESNET_DEPTH = 101, REDUCTION_DIM = 2048, relup = True)
    Gemp = gemp()
    Rgem = rgem()
    Sgem = sgem()

    # Load pre-trained weights
    weights_path = r"D:\vs code\retrieval\Copy of CVPR2022_CVNet_R101.pyth"
    checkpoint = torch.load(weights_path, map_location = 'cuda' if torch.cuda.is_available() else 'cpu')
    model_state = model.state_dict()
    pretrained_state = checkpoint['model_state']

    missing_keys, unexpected_keys = model.load_state_dict(pretrained_state, strict = False)

    return model, Gemp, Rgem, Sgem


model, gemp1, rgem1, sgem1 = setup_cvnet()  ########################
model = model.to(device)
model.eval()

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5000"],  # Allow only Main API
        "methods": ["POST"],
        "allow_headers": ["Content-Type"]
    }
})

# @app.route('/images/<filename>')
# def get_image(filename):
#     return send_from_directory(image_base_dir, filename)


@app.route("/retrieve", methods = ["POST"])
def retrieve_artifact():
    try:
        # 1. Validate input
        image_file = request.files.get("image")
        if not image_file:
            return jsonify({"error": "No image uploaded"}), 400

        desired_lang = request.form.get("language", "en")
        if not desired_lang:
            desired_lang = "en"

        if desired_lang not in googletrans.LANGUAGES:
            desired_lang = "en"

        # 2. Process image and retrieve info
        image = Image.open(io.BytesIO(image_file.read()))
        info, ranked_results = retrieve_artifact_info(image, database_metadata, device)
        if not info:
            return jsonify({"error": "No matching artifact found"}), 404


        # if not info.empty
        # 3. Translate the info
        translated_info = {
            # "About this Artifact": await translate_text("About this Artifact:", "en", desired_lang),
            "Description": translate_text(info["Description"], "en", desired_lang),
            "Material": translate_text(info["Material"], "en", desired_lang),
            "Time Period": translate_text(info["Time Period"], "en", desired_lang),
            # "Restoration Status": await translate_text(info["Restoration Status"], "en", desired_lang)
        }

        # # Add paths/URLs of retrieved images to the response
        # response_data = {
        #     "translated_info": translated_info,
        #     "retrieved_images": [
        #         {"rank": i + 1, "url": f"/images/{retrieved_name}"}
        #         for i, (retrieved_name, (_, retrieved_label)) in enumerate(ranked_results)
        #     ]
        # }

        return jsonify(translated_info)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


def preprocess(image):
    # 1. Load and Preprocess Query Image

    # query_image = Image.open(io.BytesIO(image_file.read()))  # Read image into PIL object

    # query_image = Image.open(image_path).convert("RGB")

    stats_path = r"D:\vs code\retrieval\stats.pth"
    stats = torch.load(stats_path)
    mean = stats['mean']
    std = stats['std']

    adjusted_std = std * 1.2

    query_transform = transforms.Compose([
        transforms.Resize((512, 512)),
        transforms.CenterCrop(448),
        transforms.ToTensor(),
        transforms.Normalize(mean = mean.tolist(), std = adjusted_std.tolist())  # Use calculated mean and std
    ])

    query_image = query_transform(image).unsqueeze(0).to(device)
    return query_image


def load_saved_features(data_path):
    # data_path = r"D:\Pycharm Projects\retrieval\features_and_labels.pth"

    if os.path.exists(data_path):
        # Load the data

        data = torch.load(data_path)
        features = data["features"]
        labels = data["labels"]
        print(f"Loaded saved features and labels from {data_path}")
        return features, labels
    else:
        print(f"No saved features found at {data_path}")
        return None, None


# def translate_text(text, src_lang, dest_lang):
#     """Translate text using googletrans (synchronous version)."""
#     try:
#         translation = translator.translate(text, src=src_lang, dest=dest_lang)
#         return translation.text
#     except Exception as e:
#         print(f"Translation failed: {e}")
#         return text  # Fallback to original text

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


def retrieve_artifact_info(image, df, device, k=10, threshold=0.55):
    data_path = r"D:\vs code\retrieval\features_and_labels.pth"
    database_features, database_labels = load_saved_features(data_path)

    # model.eval()
    # Get image from request
    # image_file = request.files["image"]
    query_image = preprocess(image)

    # 2. Extract Query Feature
    with torch.no_grad():
        query_feature = model.extract_global_descriptor(query_image, gemp, rgem, sgem, scale_list = 3)
        if isinstance(query_feature, list):
            query_feature = [F.normalize(feat, p = 2, dim = 1) for feat in query_feature]
            query_feature = torch.mean(torch.stack(query_feature, dim = 0), dim = 0)
            query_feature = F.normalize(query_feature, p = 2, dim = 1)
        else:
            query_feature = F.normalize(query_feature, p = 2, dim = 1)

    # 3. Calculate Similarities
    similarities = {}
    for db_name, db_feat in database_features.items():
        db_feat = db_feat.to(device)
        similarity = torch.dot(query_feature.squeeze(), db_feat) / (query_feature.norm() * db_feat.norm())
        similarities[db_name] = (similarity.item(), database_labels[db_name])

    # 4. Rank Results
    ranked_results = sorted(similarities.items(), key = lambda x: x[1][0], reverse = True)[:k]

    best_match, (best_similarity, best_label) = ranked_results[0]  # Top match
    info_row = df[df['filename'] == best_match]

    if best_similarity >= threshold:
        info = {
            "Description": info_row['Description'].values[0],
            "Material": info_row['Material'].values[0],
            "Time Period": info_row['Time Period'].values[0]
        }
        return info, ranked_results
    else:
        return {"error": "No matching artifact found"}, None


if __name__ == "__main__":
    app.run(port=5002, debug=True)  # Make sure this matches your curl port
