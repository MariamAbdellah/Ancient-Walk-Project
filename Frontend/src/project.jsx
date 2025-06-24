import React, { useState } from "react";
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

// const currentUser = {
//   id: '123',
//   name: 'Nada',
//   email: 'Nada@example.com',
//   token: 'abc123xyz'
// };

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
  const [fileName, setFileName] = useState("");

  // When photo is uploaded or captured
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target.result);
      };
      reader.readAsDataURL(file);
      setSelectedFile(file);
      setFileName(file.name);
  
      // Reset restored image when a new one is uploaded
      setRestoredImage(null);
  
      // Fetch artifact info immediately after upload
      await fetchArtifactData(file, selectedLanguage);
    }
  };
  

  //  Only called when "Restore" button is pressed
  const handleRestoration = async () => {
    if (selectedFile) {
      await fetchRestoredImage(selectedFile);
    }
  };

  const fetchRestoredImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("http://localhost:5003/restore", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to fetch restored image");

      const data = await response.json();
      console.log("Restoration API Response:", data);

      if (data.restored_image) {
        setRestoredImage(data.restored_image);
      } else {
        setRestoredImage(null);
      }

    } catch (error) {
      console.error("Error fetching restored image:", error);
      setRestoredImage(null);
    }
  };

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

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div className='project-background'>
      <header>
         {/* Navbar */}
         <div className="container-fluid d-flex justify-content-between align-items-center mb-5 mob">
          <div className="row d-flex justify-content-center align-items-center order-3 order-md-3 mob">
            <nav className="navbar navbar-expand-lg navbar-light fw-bold">
              <div className="container">
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                  <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                  <ul className="navbar-nav">
                    <li className="nav-item">
                      <Link className="nav-link text-uppercase text-white font" to="/">Home</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link text-uppercase text-white font" to="/aboutus">About Us</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link text-uppercase text-white font" to="/project">Project</Link>
                    </li>
                    {/* {currentUser ? (
                      <li className="nav-item">
                        <span className="nav-link text-uppercase text-white font">
                          <i className="bi bi-person-circle"></i> {currentUser.email.split('@')[0]}
                        </span>
                      </li>
                    ) : ( */}
                      <>
                        <li className="nav-item">
                          <button className="nav-link fw-bold mx-1 text-uppercase text-white btn hover" data-bs-toggle="modal" data-bs-target="#loginModal">
                            Login
                          </button>
                        </li>
                        <li className="nav-item">
                          <button className="nav-link btn btn-dark mx-1 hove">
                            <Link className='text-white font text-uppercase fw-bold text-decoration-none' to="/register">Register</Link>
                          </button>
                        </li>
                      </>
                  
                  </ul>
                </div>
              </div>
            </nav>
          </div>
          <div className="d-flex justify-content-center align-items-center text-center order-1 order-md-1">
            <Link className="navbar-brand font text-white" to="/">
             <img src="/img/logo.png" alt="logo" className="me-2" style={{ height: "40px" }}/>
              <em className='fs-5'><span className='text-info'>A</span>ncient Wa<i className="bi bi-person-walking fs-5 text-info"></i>k</em>
            </Link>
          </div>
        </div>

        {/* Login Modal */}
        <div className="modal fade" id="loginModal" tabIndex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="loginModalLabel">Login to Egyptian Artifact Restoration</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <form>
                  <div>
                    <label htmlFor="loginEmail" className="form-label">Email Address</label>
                    <input type="email" className="form-control" id="loginEmail" placeholder="email@example.com" required />
                  </div>
                  <div>
                    <label htmlFor="loginPassword" className="form-label">Password</label>
                    <input type="password" className="form-control" id="loginPassword" placeholder="Enter your password" required />
                  </div>
                  <div className="form-check d-flex align-items-center">
                    <input type="checkbox" className="form-check-input me-2" id="rememberMe" />
                    <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                  </div>
                  <button type="submit" className="btn btn-dark w-100 mt-3">Login</button>
                </form>
                <div className="dropdown-divider"></div>
                <Link className="dropdown-item text-dark text-center" to="/project">New here? Register for free</Link>
                <Link className="dropdown-item text-dark text-center" href="#">Forgot password?</Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Upload Section */}
      <section className="d-flex flex-column align-items-center py-5">
        <h2 className="text-center mb-4 fw-bold text-white text-uppercase ancint">Discover Your Artifact</h2>
        <div className="d-flex justify-content-center gap-4 mb-4 row">
          <label className="glass-btn col-4 col-md-3 col-lg-2">
            Upload Photo
            <input type="file" accept="image/*" className="d-none" onChange={handleImageUpload} />
          </label>

          <label className="glass-btn col-4 col-md-3 col-lg-2">
            Capture Photo
            <input type="file" accept="image/*" capture="environment" className="d-none" onChange={handleImageUpload} />
          </label>

          <button
            className="glass-btn col-6 col-md-3 col-lg-4"
            disabled={!selectedFile}
            onClick={handleRestoration}
          >
            View Restored Artifact
          </button>

          <LanguageSelector onLanguageChange={setSelectedLanguage} />
        </div>

        {/* Uploaded Preview */}
        {imageSrc && (
          <div className="ArtifactUpload">
            <h5 className="fw-semibold text-white">Uploaded Photo:</h5>
            <div className="image-container">
              <img id="uploadedImage" src={imageSrc} alt="Artifact" className="uploaded-image" />
            </div>
            <p className="text-white mt-2"><strong>File Name:</strong> {fileName}</p>
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
