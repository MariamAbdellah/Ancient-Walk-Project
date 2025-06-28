import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, useLocation } from 'react-router-dom'; // Add useLocation import
import './App.css';
import './index.css';

//const API_URL = process.env.REACT_APP_API_URL;

export default function About() {
    const [currentUser, setCurrentUser] = useState(null);
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [feedbackData, setFeedbackData] = useState({ feedback: '' });
    const location = useLocation(); // Get current location

    // Check for logged in user on component mount
    useEffect(() => {
        const storedUser = sessionStorage.getItem('currentUser');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://127.0.0.1:5000/login', {
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

    const handleInputChange = (e) => {
        setFeedbackData({ ...feedbackData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!feedbackData.feedback.trim()) {
            alert("Please enter your feedback before submitting.");
            return;
        }
        
        alert('Thank you for your feedback! We appreciate your input.');
        setFeedbackData({ feedback: '' }); // Clear the textarea after submission
    };


    return (
        <>
            <div className='bg'>
                <header>
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
                                                {currentUser ? (
                                                    <span className="nav-link fw-bold mx-1 text-uppercase text-white">
                                                        Welcome {currentUser.email.split('@')[0]}
                                                    </span>
                                                ) : (
                                                    <button 
                                                        className="nav-link fw-bold mx-1 text-uppercase text-white btn hover" 
                                                        data-bs-toggle="modal" 
                                                        data-bs-target="#loginModal"
                                                    >
                                                        Login
                                                    </button>
                                                )}
                                            </li>
                                            {/* Only show Register button if not on the registration page and no user is logged in */}
                                            {!currentUser && location.pathname !== "/register" && (
                                                <li className="nav-item">
                                                    <button className="nav-link btn btn-dark mx-1 hove">
                                                        <Link className='text-white font text-uppercase fw-bold text-decoration-none' to="/register">Register</Link> 
                                                    </button>
                                                </li>
                                            )}
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
                                    { /*<Link className="dropdown-item text-dark text-center" to="#">Forgot password?</Link>*/}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Rest of the About component remains unchanged */}
                <section className="container OUR INSIGHTS my-5 py-5">
                    <div className="text-start ms-5">
                        <h2 className="fw-bold insights-slogan text-uppercase text-white fs-2">OUR mission</h2>
                    </div>
                    <div className="row">
                        <div className="col-12 col-md-9 col-lg-6 text-start py-5 me-5 mb-5 order pe-5 ps-3">
                            <p className="font-our">
                                Our mission is to preserve the priceless heritage of Egyptian antiquities,
                                ensuring they do not fade into history. Our project is built around this goal — to 
                                restore these artifacts and protect the legacy of Egyptian tourism.
                            </p>
                            <p className="font-our">
                                Through our platform, tourists can explore these artifacts digitally,
                                gaining rich insights about their history and current condition. 
                                If an artifact is damaged, visitors will not only be informed but will also see a 
                                <strong>reimagined visual of the artifact fully restored</strong>, 
                                allowing them to experience its former glory.
                            </p>
                            <p className="insights-slogan text-white">Reviving History — One Artifact at a Time.</p>       
                        </div>

                        <div className="col-12 col-md-9 col-lg-4 img-mob">
                            <img src="/img/history.png" alt="Egyptian History" className="img-mob project-img mb-3 float-end img-fluid" />
                        </div> 
                    </div>
                </section>

                <section className="container my-5 py-5 mob text-center">
                    <div className="row justify-content-center mb-4">
                        <div className="col-12">
                            <div className="d-flex justify-content-center align-items-center gap-2 flex-wrap p-5 col-12">
                                <img src="/img/eye.png" alt="Egyptian Eye" className="pe-4 floating-eye d-none d-md-inline" />
                                <h1 className="fw-bold text-white"> Who Support Us </h1>
                                <img src="/img/eye.png" alt="Egyptian Eye" className="ps-4 floating-eye d-none d-md-inline" />
                                <p className="text-secondary font justify-content-center col-12">Thank you so much for your guidance and support throughout this journey!</p>
                            </div>
                        </div>
                    </div>
                    <div className="row justify-content-center align-items-center">
                        <div className="col-sm-12 col-lg-6 d-flex justify-content-center pb-3">
                            <div className="supporter-card">
                                <img src="/img/dr.jpg" alt="Doctor Salsabil Amin" />
                                <p className="caption">Doctor/ Salsabil Amin</p>
                            </div>
                        </div>
                        <div className="col-sm-12 col-lg-6 d-flex justify-content-center pb-3">
                            <div className="supporter-card">
                                <img src="/img/TA.jpg" alt="TA Mohamed Essam" />
                                <p className="caption">TA/ Mohamed Essam</p>
                            </div>
                        </div>
                    </div>
                </section>

                <br></br>
                <br></br>

                <section className="my-5 py-5 container text-center">
                    <div className="row justify-content-center mb-4">
                        <div className="col-12">
                            <div className="d-flex justify-content-center align-items-center gap-2 flex-wrap">
                                <img src="/img/paint.png" alt="Egyptian Icon" className="floating-eye d-none d-md-inline" />
                                <h1 className="fw-bold m-0 text-white">Meet Our Team</h1>
                                <img src="/img/paint.png" alt="Egyptian Icon" className="floating-eye d-none d-md-inline" />
                            </div>
                            <p className="text-secondary font mt-3">The talented minds behind this project</p>
                        </div>
                    </div>

                    <div className="row g-4 justify-content-center">
                        {/* Member 1 */}
                        <div className="col-6 col-md-4 col-lg-2">
                            <div className="card border-0 shadow-sm team-card">
                            <img src="img/janaa.jpg" className="card-img-top rounded-circle p-3" alt="Team Member" />
                                <h5 className="card-title text-dark fw-bold">Jana Morci</h5>
                                <Link to="#" className="social-icon fs-5"target="_blank"><i className="bi bi-linkedin"></i></Link>
                            </div>
                        </div>

                        {/* Member 2 */}
                        <div className="col-6 col-md-4 col-lg-2">
                            <div className="card border-0 shadow-sm team-card">
                                <img src="img/me.jpg" className="card-img-top rounded-circle p-3" alt="Team Member" />
                                <h5 className="card-title text-dark fw-bold">Fatma Gamal</h5>
                                <Link to="https://www.linkedin.com/in/fatma--gamal/" target="_blank" className="social-icon fs-5"><i className="bi bi-linkedin"></i></Link>
                            </div>
                        </div>

                        {/* Member 3 */}
                        <div className="col-6 col-md-4 col-lg-2">
                            <div className="card border-0 shadow-sm team-card">
                                <img src="img/Mariamm.jpg" className="card-img-top rounded-circle p-3" alt="Team Member" />
                                <h5 className="card-title text-dark fw-bold">Mariam Mostafa</h5>
                                <Link to="https://eg.linkedin.com/in/mariam-mostafa-8992842b4" target="_blank" className="social-icon fs-5"><i className="bi bi-linkedin"></i></Link>
                            </div>
                        </div>

                        <br></br>

                        {/* Member 4 */}
                        <div className="col-6 col-md-4 col-lg-2">
                            <div className="card border-0 shadow-sm team-card">
                                <img src="img/mohamed.jpg" className="card-img-top rounded-circle p-3" alt="Team Member" />
                                <h5 className="card-title text-dark fw-bold">Mohamed Rasmy</h5>
                                <Link to="https://www.linkedin.com/in/mohamad-rasmy" target="_blank" className="social-icon fs-5"><i className="bi bi-linkedin"></i></Link>
                            </div>
                        </div>
                    
                        {/* Member 6 */}
                        <div className="col-6 col-md-4 col-lg-2">
                            <div className="card border-0 shadow-sm team-card">
                                <img src="img/mariaa.jpg" className="card-img-top rounded-circle p-3" alt="Team Member" />
                                <h5 className="card-title text-dark fw-bold">Maria Mina</h5>
                                <Link to="https://www.linkedin.com/in/maria-mina-fekry" target="_blank" className="social-icon fs-5"><i className="bi bi-linkedin"></i></Link>
                            </div>
                        </div>

                        {/* Member 5 */}
                        <div className="col-6 col-md-4 col-lg-2">
                            <div className="card border-0 shadow-sm team-card">
                                <img src="img/nadia.jpg" className="card-img-top rounded-circle p-3" alt="Team Member" />
                                <h5 className="card-title text-dark fw-bold">Nadia Hesham</h5>
                                <Link to="https://www.linkedin.com/in/nadia-hesham-el-abd-64b1b3234?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                                target="_blank" className="social-icon fs-5">
                                <i className="bi bi-linkedin"></i></Link>
                            </div>
                        </div>
                    </div>
                </section>

                <br></br>
                <br></br>
                <br></br>
                
                {/* CONTACTS Section (Improved) */}
                <section className="contacts-section p-5 font pt-5 mt-5 bg-dark justify-content-center align-items-center" id="Contact-info">
                    <div className="container font">
                        <div className="row gy-4 justify-content-center align-items-center">

                            {/* Contact Info */}
                            <div className="col-sm-12 col-lg-3 pe-5 ">
                                <Link className="navbar-brand font text-white text-decoration-none" to="/home">
                                    <i className="bi bi-bootstrap-reboot pe-2 text-info"></i>
                                    <em>Egyptian Artifact <span className="text-info">R</span>estoration</em>
                                </Link>
                                <h5 className="fw-bold my-3 font">CONTACT US</h5>
                                <div className="font">
                                    <Link to="#" className="social-icon pe-3"><i className="bi bi-twitter"></i></Link>
                                    <Link to="#" className="social-icon pe-3"><i className="bi bi-facebook"></i></Link>
                                    <Link to="#" className="social-icon pe-3"><i className="bi bi-instagram"></i></Link>
                                    <Link to="#" className="social-icon pe-3"><i className="bi bi-youtube"></i></Link>
                                    <Link to="https://www.linkedin.com/in/fatma--gamal/" target="_blank" className="social-icon pe-3"><i className="bi bi-linkedin"></i></Link>
                                    <Link to="#" className="social-icon pe-2"><i className="bi bi-tumblr"></i></Link>
                                </div>
                            </div>

                            {/* Newsletter Signup */}
                            <div className="col-sm-12 col-lg-3 ps-5 pb-4">
                                <h5 className="fw-bold mb-2 font">Newsletter</h5>
                                <p className="text-secondary font">We send news to your registered email.</p>
                            </div>
                            
                            {/*feedback */}
                            <div className="col-sm-12 col-lg-3 ps-5 ms-5">
                                <h5 className="fw-bold mb-3">Give us feedback</h5>
                                <form onSubmit={handleSubmit}>
                                    <textarea 
                                        name="feedback"
                                        value={feedbackData.feedback}
                                        onChange={handleInputChange}
                                        placeholder="Your feedback..." 
                                        rows="4" 
                                        className="form-control mb-3"
                                        required
                                    />
                                    <button type="submit" className="glass-btn px-3 py-2">
                                        Send Feedback
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Footer Bottom */}
                        <div className="mt-5 text-center d-flex justify-content-center align-items-center font">
                            <p className="text-secondary mt-4 font">© 2025 Egyptian Artifact Restoration. All rights reserved.</p>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}