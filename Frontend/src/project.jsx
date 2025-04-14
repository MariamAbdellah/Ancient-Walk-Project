import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import "./App.css";

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
      <label htmlFor="language" className="fw-bold text-white">
        🌎 Language:
      </label>
      <select
        id="language"
        value={language}
        onChange={handleChange}
        className="form-select w-auto d-inline-block ms-2"
        aria-label="Select language"
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
  const [imageSrc, setImageSrc] = useState(null);
  const [restoredImageSrc, setRestoredImageSrc] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedFile, setSelectedFile] = useState(null);
  const [artifactData, setArtifactData] = useState({
    description: "Not available",
    material: "Not available",
    timePeriod: "Not available",
    restorationStatus: "Not available",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const previewImage = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setRestoredImageSrc(null); // Reset restored image when a new image is uploaded
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchArtifactData = async (file, language) => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("language", language);

    try {
      const response = await fetch(
        process.env.REACT_APP_API_URL || "http://localhost:5000/analyze",
        {
          method: "POST",
          body: formData,
          signal: AbortSignal.timeout(10000),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setArtifactData({
        description: data.artifact_info?.description || "Not available",
        material: data.artifact_info?.material || "Not available",
        timePeriod: data.artifact_info?.time_period || "Not available",
        restorationStatus: data.damage_status || "Not available",
      });
    } catch (error) {
      console.error("Error fetching artifact data:", error);
      setError("Failed to fetch artifact data. Please try again.");
      setArtifactData({
        description: "Not available",
        material: "Not available",
        timePeriod: "Not available",
        restorationStatus: "Not available",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRestoredImage = async () => {
    if (!selectedFile) {
      setError("Please upload an image first.");
      return;
    }

    setLoading(true);
    setError(null);
    setRestoredImageSrc(null); // Reset previous restored image

    try {
      const response = await fetch(
        process.env.REACT_APP_RESTORE_URL || "http://localhost:5000/restored-image",
        {
          method: "GET",
          signal: AbortSignal.timeout(10000),
        }
      );


      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Assume the response is an image (binary blob)
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setRestoredImageSrc(imageUrl);

      
    } catch (error) {
      console.error("Error fetching restored image:", error);
      setError("Failed to fetch restored image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedFile) {
      fetchArtifactData(selectedFile, selectedLanguage);
    }
  }, [selectedFile, selectedLanguage]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    // Implement login logic here
    console.log("Login submitted");
  };

  return (
    <div className="project-background">
      <header>
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
                      <Link className="nav-link text-uppercase text-white font" to="/">
                        Home
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className="nav-link text-uppercase text-white font"
                        to="/aboutus"
                      >
                        About Us
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className="nav-link text-uppercase text-white font"
                        to="/project"
                      >
                        Project
                      </Link>
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
                      <button className="nav-link btn btn-dark mx-1 hove">
                        <Link
                          className="text-white font text-uppercase fw-bold text-decoration-none"
                          to="/register"
                        >
                          Register
                        </Link>
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </nav>
          </div>
          <div className="d-flex justify-content-center align-items-center text-center order-1 order-md-1">
            <Link className="navbar-brand font text-white" to="/">
              <em className="fs-5">
                <span className="text-info">A</span>ncient Wa
                <i className="bi bi-person-walking fs-5 text-info"></i>k
              </em>
            </Link>
          </div>
        </div>

        <div
          className="modal fade"
          id="loginModal"
          tabIndex="-1"
          aria-labelledby="loginModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="loginModalLabel">
                  Login to Egyptian Artifact Restoration
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleLoginSubmit}>
                  <div>
                    <label htmlFor="loginEmail" className="form-label">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="loginEmail"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="loginPassword" className="form-label">
                      Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="loginPassword"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  <div className="form-check d-flex align-items-center">
                    <input
                      type="checkbox"
                      className="form-check-input me-2"
                      id="rememberMe"
                    />
                    <label className="form-check-label" htmlFor="rememberMe">
                      Remember me
                    </label>
                  </div>
                  <button type="submit" className="btn btn-dark w-100 mt-3">
                    Login
                  </button>
                </form>
                <div className="dropdown-divider"></div>
                <Link
                  className="dropdown-item text-dark text-center"
                  to="/project"
                >
                  New here? Register for free
                </Link>
                <Link
                  className="dropdown-item text-dark text-center"
                  to="/forgot-password"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="container d-flex flex-column align-items-center py-5">
        <h2 className="text-center mb-4 fw-bold text-white text-uppercase ancint">
          Discover Your Artifact
        </h2>
        <LanguageSelector onLanguageChange={setSelectedLanguage}/>
        <div className="d-flex justify-content-center gap-4 my-4 row">
          <label className="glass-btn col-4 col-md-4 col-lg-4" htmlFor="upload-photo">
            Upload Photo
            <input
              id="upload-photo"
              type="file"
              accept="image/*"
              className="d-none"
              onChange={previewImage}
              aria-label="Upload artifact photo"
            />
          </label>
          <label className="glass-btn col-4 col-md-4 col-lg-4" htmlFor="capture-photo">
            Capture Photo
            <input
              id="capture-photo"
              type="file"
              accept="image/*"
              capture="environment"
              className="d-none"
              onChange={previewImage}
              aria-label="Capture artifact photo"
            />
          </label>
          <button
            className="glass-btn col-6 col-md-4 col-lg-6"
            onClick={fetchRestoredImage}
            disabled={loading || !selectedFile}
            aria-label="View restored artifact"
          >
            View Restored Artifact
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="d-flex flex-column flex-md-row gap-4">
          {imageSrc && (
            <div className="ArtifactUpload">
              <h5 className="fw-semibold text-white">Uploaded Photo:</h5>
              <div className="image-container">
                <img
                  id="uploadedImage"
                  src={imageSrc}
                  alt="Uploaded artifact"
                  className="uploaded-image"
                />
              </div>
            </div>
          )}

          {restoredImageSrc && (
            <div className="ArtifactUpload">
              <h5 className="fw-semibold text-white">Restored Artifact:</h5>
              <div className="image-container">
                <img
                  id="restoredImage"
                  src={restoredImageSrc}
                  alt="Restored artifact"
                  className="uploaded-image"
                />
              </div>
            </div>
          )}
        </div>

        <div className="glass-card text-white p-4 mt-4">
          <h4 className="text-center mb-3">Artifact Details</h4>
          {loading ? (
            <div className="text-center">
              <div className="spinner-border text-light" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <table className="table table-borderless text-white glass table">
              <tbody>
                <tr>
                  <th>Description</th>
                  <td>{artifactData.description}</td>
                </tr>
                <tr>
                  <th>Material</th>
                  <td>{artifactData.material}</td>
                </tr>
                <tr>
                  <th>Time Period</th>
                  <td>{artifactData.timePeriod}</td>
                </tr>
                <tr>
                  <th>Restoration Status</th>
                  <td>{artifactData.restorationStatus}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};

export default ArtifactUpload;