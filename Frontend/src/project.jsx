import React, { useState , useEffect } from "react";

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
    const previewImage = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImageSrc(e.target.result);
        };
        reader.readAsDataURL(file);
    
        //Pass language to fetchArtifactData
        fetchArtifactData(file, selectedLanguage);
      }
    };
    
    useEffect(() => {
      if (selectedFile) {
        fetchArtifactData(selectedFile, selectedLanguage);
      }
    }, [selectedLanguage]); 

const fetchArtifactData = async (file, language) => {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("language", language);

  console.log("Sending FormData:");
  for (let pair of formData.entries()) {
    console.log(pair[0], pair[1]); // Should log 'image' and 'language'
  }

  try {
    const response = await fetch("http://localhost:5000/analyze", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to fetch artifact data");

    const data = await response.json();
    console.log("API Response:", data); // Debugging

    setArtifactData({
      description: data.artifact_info?.description || "Not available",
      material: data.artifact_info?.material || "Not available",
      timePeriod: data.artifact_info?.time_period || "Not available",
      restorationStatus: data.artifact_info?.damage_status || "Not available",
      // damageStatus: data.damage_status ?? false,
      // warnings: data.warnings || []
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};


// Use useEffect to refetch when language changes
useEffect(() => {
  if (imageSrc) {
    fetchArtifactData(imageSrc, selectedLanguage);
  }
}, [selectedLanguage]);



    return (
         <div className='project-background'>
   <header >
        {/* First Header */}
        <div className="container-fluid d-flex justify-content-between align-items-center mb-5 mob">
          <div className="row d-flex justify-content-center align-items-center order-3 order-md-3 mob">
            <nav className="navbar navbar-expand-lg navbar-light fw-bold">
              <div className="container">
                <button 
                  className="navbar-toggler" 
                  type="button" 
                  data-bs-toggle="collapse" 
                  data-bs-target="#navbarNav" 
                  aria-controls="navbarNav" 
                  aria-expanded="false" 
                  aria-label="Toggle navigation"
                >
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
                    <li className="nav-item">
                                <button
                                  className="nav-link fw-bold mx-1 text-uppercase text-white btn hover"
                                  data-bs-toggle="modal"
                                  data-bs-target="#loginModal"
                                >
                                  Login
                                </button>
                              </li>
                              <li className="nav-item">
                                <button className="nav-link  btn btn-dark  mx-1 hove">
                                  <Link className='text-white font text-uppercase fw-bold text-decoration-none' to="/register">Register</Link> 
                                </button>
                              </li>
                          </ul>
                        </div>
                      </div>
                    </nav>
                  </div>

          <div className="d-flex justify-content-center align-items-center text-center order-1 order-md-1">
            <Link className="navbar-brand font text-white" to="/">
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
                <div className="dropdown-divider  "></div>
                <Link className="dropdown-item text-dark text-center" to="/project">New here? Register for free</Link>
                <Link className="dropdown-item text-dark text-center" href="#">Forgot password?</Link>
              </div>
            </div>
          </div>
        </div>
      </header>
 <section className="d-flex flex-column align-items-center py-5">
    <h2 className="text-center mb-4 fw-bold text-white text-uppercase ancint">Discover Your Artifact.</h2>

    {/* Upload & Capture Buttons */}
    <div className="d-flex justify-content-center gap-4 mb-4">
        <label className="glass-btn">
            Upload Photo
            <input type="file" accept="image/*" className="d-none" onChange={previewImage} />
        </label>

            <label className="glass-btn">
               Capture Photo
              <input type="file" accept="image/*" capture="environment" className="d-none" onChange={previewImage} />
           </label>
         {/* Language Selector in Navbar */}
         <LanguageSelector onLanguageChange={setSelectedLanguage} />
    </div>

    {/* Uploaded Image Preview */}
    {imageSrc && (
        <div className="ArtifactUpload">
            <h5 className="fw-semibold text-white">Uploaded Photo:</h5>
            <div className="image-container">
                <img id="uploadedImage" src={imageSrc} alt="Artifact" className="uploaded-image" />
            </div>
        </div>
    )}

    {/* Artifact Details Card */}
    <div className="glass-card text-white p-4">
        <h4 className="text-center mb-3">Artifact Details</h4>
        <table className="table table-borderless text-white">
            <tbody>
                <tr><th>Description</th><td>{artifactData.description || "Loading..."}</td></tr>
                <tr><th>Material</th><td>{artifactData.material || "Loading..."}</td></tr>
                <tr><th>Time Period</th><td>{artifactData.timePeriod || "Loading..."}</td></tr>
                <tr><th>Restoration Status</th><td>{artifactData.restorationStatus || "Loading..."}</td></tr>
            </tbody>
        </table>
    </div>
</section>

        </div>
    );
};

// Filename - App.js

function App() {
    const [file, setFile] = useState();
    function handleChange(e) {
        console.log(e.target.files);
        setFile(URL.createObjectURL(e.target.files[0]));
    }

    return (
        <div className="App">
            <h2>Add Image:</h2>
            <input type="file" onChange={handleChange} />
            <img src={file} />
        </div>
    );
}


export default ArtifactUpload;
