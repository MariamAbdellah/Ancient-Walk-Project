import React, { useState, useEffect, useRef } from "react";
import './index.css';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Link } from 'react-router-dom';

const languages = [
  { code: "en", name: "English" },
  { code: "ar", name: "العربية" },
  { code: "fr", name: "Français" },
  { code: "es", name: "Español" },
  { code: "de", name: "Deutsch" },
  { code: "zh", name: "中文 (Chinese)" },
  { code: "ru", name: "Русский" },
  { code: "hi", name: "हिन्दी (Hindi)" },
  { code: "ja", name: "日本語 (Japanese)" },
  { code: "ko", name: "한국어 (Korean)" },
  { code: "it", name: "Italiano" },
  { code: "pt", name: "Português" },
];

const currentUser = {
  id: '123',
  name: 'Nada',
  email: 'Nada@example.com',
  token: 'abc123xyz'
};

// Language Selector Component
const LanguageSelector = ({ onLanguageChange }) => {
  const [language, setLanguage] = useState("en");

  const handleChange = (event) => {
    const selectedLanguage = event.target.value;
    setLanguage(selectedLanguage);
    onLanguageChange(selectedLanguage);
  };

  return (
    <div className="language-selector">
      <label htmlFor="language" className="fw-bold text-white">🌎 Language: </label>
      <select
        id="language"
        value={language}
        onChange={handleChange}
        className="form-select w-auto d-inline-block ms-2"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

const ArtifactUpload = () => {
  const [imageSrc, setImageSrc] = useState();
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [artifactData, setArtifactData] = useState({
    description: "Loading...",
    material: "Loading...",
    timePeriod: "Loading...",
    restorationStatus: "Loading..."
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [restoredImage, setRestoredImage] = useState(null);
  const canvasRef = useRef(null); // Use useRef for canvas
  const [isDrawing, setIsDrawing] = useState(false);

  const previewImage = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target.result);
      };
      reader.readAsDataURL(file);
      setSelectedFile(file); // Set for useEffect and fetch
    }
  };

  useEffect(() => {
    if (selectedFile) {
      fetchArtifactData(selectedFile, selectedLanguage);
    }
  }, [selectedLanguage, selectedFile]);

  const fetchArtifactData = async (file, language) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("language", language);

    try {
      const response = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to fetch artifact data");

      const data = await response.json();
      console.log("API Response: ", data)

      setArtifactData({
        description: data.artifact_info?.description || "Not available",
        material: data.artifact_info?.material || "Not available",
        timePeriod: data.artifact_info?.time_period || "Not available",
        restorationStatus: data.damage_status || "Not available",
      });

      if (data.restored_image) {
        setRestoredImage(data.restored_image); 
      }

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Canvas Drawing Logic
  const startDrawing = (e) => {
    setIsDrawing(true);
    const ctx = canvasRef.current.getContext("2d");
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  return (
    <div className='project-background'>
      <header>
        {/* Navbar */}
        <div className="container-fluid d-flex justify-content-between align-items-center mb-5 mob">
          {/* Your Navbar Code */}
        </div>
      </header>

      {/* Upload Section */}
      <section className="d-flex flex-column align-items-center py-5">
        <h2 className="text-center mb-4 fw-bold text-white text-uppercase ancint">Discover Your Artifact.</h2>
        <div className="d-flex justify-content-center gap-4 mb-4 row">
          <label className="glass-btn col-4 col-md-3 col-lg-2">
            Upload Photo
            <input type="file" accept="image/*" className="d-none" onChange={previewImage} />
          </label>

          <label className="glass-btn col-4 col-md-3 col-lg-2">
            Capture Photo
            <input type="file" accept="image/*" capture="environment" className="d-none" onChange={previewImage} />
          </label>

          <button
            className="glass-btn col-6 col-md-3 col-lg-4"
            disabled={!restoredImage}
          >
            View Restored Artifact
          </button>

          <LanguageSelector onLanguageChange={setSelectedLanguage} />
        </div>

        {/* Uploaded Preview */}
        {imageSrc && (
          <div className="image-container position-relative">
            <img id="uploadedImage" src={imageSrc} alt="Artifact" className="uploaded-image" />
            <canvas
              ref={canvasRef}
              width={500}
              height={500}
              className="drawing-canvas"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            ></canvas>
          </div>
        )}

        {/* Restored Image */}
        {restoredImage && (
          <div className="ArtifactUpload mt-4">
            <h5 className="fw-semibold text-white">Restored Image:</h5>
            <div className="image-container">
              <img src={restoredImage} alt="Restored Artifact" className="uploaded-image" />
            </div>
          </div>
        )}

        {/* Artifact Details */}
        <div className="glass-card text-white p-4 mt-4">
          <h4 className="text-center mb-3">Artifact Details</h4>
          <table className="table table-borderless text-white glass table">
            <tbody>
              <tr><th colSpan="2" className="text-center">Basic Info</th></tr>
              <tr><th>Description</th><td>{artifactData.description || "Loading..."}</td></tr>
              <tr><th>Material</th><td>{artifactData.material || "Loading..."}</td></tr>
              <tr><th>Time Period</th><td>{artifactData.timePeriod || "Loading..."}</td></tr>

              <tr><th colSpan="2" className="text-center">Restoration Info</th></tr>
              <tr><th>Restoration Status</th><td>{artifactData.restorationStatus || "Loading..."}</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default ArtifactUpload;

//after change for rasmy model to enable user draw in image just change in project page only