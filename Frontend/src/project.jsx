import React, { useState, useRef, useEffect } from "react";
import './index.css';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

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
    description: "Upload an image to analyze artifact details",
    material: "Not available",
    timePeriod: "Not available",
    restorationStatus: "Not analyzed yet"
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [restoredImage, setRestoredImage] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const canvasRef = useRef(null);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  // Check for logged in user on component mount
  useEffect(() => {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  // Initialize canvas when image is uploaded
  useEffect(() => {
    if (imageSrc && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      const img = new Image();
      img.onload = () => {
        // Set canvas dimensions to match image
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
      img.src = imageSrc;
    }
  }, [imageSrc]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentUser(data.user);
        sessionStorage.setItem("currentUser", JSON.stringify(data.user));
        alert(`Welcome ${data.user.email.split('@')[0]}`);
        // Close the modal after successful login
        document.getElementById('loginModalClose').click();
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while logging in.");
    }
  };

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.id]: e.target.value
    });
  };

  const fetchArtifactData = async (file) => {
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append("original_image", file);
    formData.append("language", selectedLanguage);

    try {
      const analysisResponse = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        body: formData,
      });
      
      if (!analysisResponse.ok) throw new Error("Analysis failed");
      const analysisData = await analysisResponse.json();
      
      setArtifactData({
        description: analysisData.artifact_info?.description || "Not available",
        material: analysisData.artifact_info?.material || "Not available",
        timePeriod: analysisData.artifact_info?.time_period || "Not available",
        restorationStatus: analysisData.damage_status || "Not available",
      });
    } catch (error) {
      console.error("Error fetching artifact data:", error);
      setArtifactData({
        description: "Error loading data",
        material: "Error loading data",
        timePeriod: "Error loading data",
        restorationStatus: "Error loading data"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

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
      setRestoredImage(null);
      
      // Show analyzing state
      setArtifactData({
        description: "Analyzing...",
        material: "Analyzing...",
        timePeriod: "Analyzing...",
        restorationStatus: "Analyzing..."
      });
      
      // Immediately fetch artifact data when image is uploaded
      await fetchArtifactData(file);
    }
  };

  const clearDrawing = () => {
    if (!imageSrc || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = imageSrc;
  };

  // Drawing functions
  const startDrawing = (e) => {
    if (!imageSrc) return;
    setIsDrawing(true);
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setLastX(x);
    setLastY(y);
  };

  const draw = (e) => {
    if (!isDrawing || !imageSrc) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    setLastX(x);
    setLastY(y);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleRestoration = async () => {
    if (!canvasRef.current) return;
    
    setIsLoading(true);
    
    // Get the drawn image as blob
    canvasRef.current.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("original_image", selectedFile);
      formData.append("mask_image", blob, "mask.png");
      formData.append("language", selectedLanguage);

      try {
        const restorationResponse = await fetch("http://localhost:5003/restore", {
          method: "POST",
          body: formData,
        });
        
        if (!restorationResponse.ok) throw new Error("Restoration failed");
        const restorationData = await restorationResponse.json();
        
        if (restorationData.restored_image) {
          setRestoredImage(restorationData.restored_image);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Restoration failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }, 'image/png');
  };

  return (
    <div className='project-background'>
      <header>
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
                    <li className="nav-item">
                      <button className="nav-link fw-bold mx-1 text-uppercase text-white btn hover" data-bs-toggle="modal" data-bs-target="#loginModal">
                        {currentUser ? currentUser.email.split('@')[0] : 'Login'}
                      </button>
                    </li>
                    <li className="nav-item">
                      <button className="nav-link btn btn-dark mx-1 hove">
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
              <img src="/img/logo.png" alt="logo" className="me-2" style={{ height: "40px" }}/>
              <em className='fs-5'><span className='text-info'>A</span>ncient Wa<i className="bi bi-person-walking fs-5 text-info"></i>k</em>
            </Link>
          </div>
        </div>

        <div className="modal fade" id="loginModal" tabIndex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="loginModalLabel">Login to Egyptian Artifact Restoration</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" id="loginModalClose"></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleLogin}>
                  <div>
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      id="email" 
                      value={loginData.email} 
                      onChange={handleLoginChange} 
                      placeholder="email@example.com" 
                      required 
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="form-label">Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      id="password" 
                      value={loginData.password} 
                      onChange={handleLoginChange} 
                      placeholder="Enter your password" 
                      required 
                    />
                  </div>
                  <div className="form-check d-flex align-items-center">
                    <input type="checkbox" className="form-check-input me-2" id="rememberMe" />
                    <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                  </div>
                  <button type="submit" className="btn btn-dark w-100 mt-3">Login</button>
                </form>
                <div className="dropdown-divider"></div>
                <Link className="dropdown-item text-dark text-center" to="/register">New here? Register for free</Link>
              </div>
            </div>
          </div>
        </div>
      </header>

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
            disabled={!selectedFile || isLoading}
            onClick={handleRestoration}
          >
            {isLoading ? 'Restoring...' : 'Restore Damaged Areas'}
          </button>

          <LanguageSelector onLanguageChange={setSelectedLanguage} />
        </div>

        {isAnalyzing && (
          <div className="text-white text-center my-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Analyzing artifact...</p>
          </div>
        )}

        {imageSrc && (
          <div className="ArtifactUpload">
            <h5 className="fw-semibold text-white ms-4">Draw on the damaged areas (use white lines):</h5>
            <div 
              className="image-container position-relative"
              style={{cursor: 'crosshair'}}
            >
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={(e) => {
                  const touch = e.touches[0];
                  const mouseEvent = new MouseEvent("mousedown", {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                  });
                  startDrawing(mouseEvent);
                }}
                onTouchMove={(e) => {
                  const touch = e.touches[0];
                  const mouseEvent = new MouseEvent("mousemove", {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                  });
                  draw(mouseEvent);
                }}
                onTouchEnd={stopDrawing}
                className="uploaded-image"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  zIndex: 2
                }}
              />

              <img
                src={imageSrc}
                alt={fileName || "Artifact"}
                className="uploaded-image"
                style={{
                  position: 'relative',
                  zIndex: 1,
                  pointerEvents: 'none'
                }}
              />
            </div>
            <div className="d-flex justify-content-center mt-2 ms-5">
              <button 
                className="glass-btn"
                onClick={clearDrawing}
                disabled={isLoading}
              >
                Clear Drawing
              </button>
            </div>
            <p className="text-white mt-2 text-center"><strong>File Name:</strong> {fileName}</p>
          </div>
        )}

        {restoredImage && (
          <div className="ArtifactUpload mt-4">
            <h5 className="fw-semibold text-white">Restored Image:</h5>
            <div className="image-container">
              <img src={restoredImage} alt="Restored Artifact" className="uploaded-image" />
            </div>
          </div>
        )}

        {/* Always show the artifact details table */}
        <div className="glass-card text-white p-4 mt-4">
          <h4 className="text-center mb-3">Artifact Details</h4>
          <table className="table table-borderless text-white glass table">
            <tbody>
              <tr><th colSpan="2" className="text-center">Basic Info</th></tr>
              <tr><th>Description</th><td>{artifactData.description}</td></tr>
              <tr><th>Material</th><td>{artifactData.material}</td></tr>
              <tr><th>Time Period</th><td>{artifactData.timePeriod}</td></tr>

              <tr><th colSpan="2" className="text-center">Condition</th></tr>
              <tr><th>Damage Status</th><td>{artifactData.restorationStatus}</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default ArtifactUpload;