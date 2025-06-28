import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link, useLocation } from 'react-router-dom'; // Corrected import

//const API_URL = process.env.REACT_APP_API_URL;

export default function Main() {
    const [currentUser, setCurrentUser] = useState(null);
    const [loginData, setLoginData] = useState({ email: '', password: '' });
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
            const response = await fetch("http://localhost:5050/login", {
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

    return (
        <>
            <div className='body-background mob'>
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
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className='mob'>
                    <h3 className="text-uppercase ancint">ANCIENT EGYPT</h3>
                    <hr />
                    <div className="mob_txt home mob">
                        <p className="fst-italic ps-3 insights-slogan fs-2">Bringing Ancient Egypt Back to Life.</p>
                    </div>
                </div>
            </div>
        </>
    );
}