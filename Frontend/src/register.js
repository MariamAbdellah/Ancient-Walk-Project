import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import './App.css';
import './index.css';

//const API_URL = process.env.REACT_APP_API_URL;


export default function Register() {
    
    const [currentUser, setCurrentUser] = useState(null);
    const [registerData, setRegisterData] = useState({ 
        email: '', 
        password: '', 
        role: 'user' 
    });
    const [loginData, setLoginData] = useState({ 
        email: '', 
        password: '' 
    });

    useEffect(() => {
        const storedUser = sessionStorage.getItem('currentUser');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
            
        }
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();

        if (registerData.email === 'admin@ancientwalk.com') {
            alert("You can't register as admin.");
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:5000/register', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(registerData),
            });

            const data = await response.json();

            if (response.ok) {
                setCurrentUser(data.user);
                sessionStorage.setItem('currentUser', JSON.stringify(data.user));
                alert("Registration successful!");
                setRegisterData({ email: '', password: '', role: 'user' });
            } else {
                alert(data.message || "Registration failed");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred while registering.");
        }
    };

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

    const handleRegisterChange = (e) => {
        setRegisterData({
            ...registerData,
            [e.target.id]: e.target.value
        });
    };

    const handleLoginChange = (e) => {
        setLoginData({
            ...loginData,
            [e.target.id]: e.target.value
        });
    };

    return (
        <div className="register-background">
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
                                        {/* <li className="nav-item">
                                            <button className="nav-link btn btn-dark mx-1 hove">
                                                <Link className='text-white font text-uppercase fw-bold text-decoration-none' to="/register">
                                                    Register
                                                </Link>
                                            </button>
                                        </li> */}
                                    </ul>
                                </div>
                            </div>
                        </nav>
                    </div>
                    <div className="d-flex justify-content-center align-items-center text-center order-1 order-md-1">
                        <Link className="navbar-brand font text-white" to="/">
                            <img src="/img/logo.png" alt="logo" className="me-2" style={{ height: "40px" }}/>
                            <em className='fs-5'>
                                <span className='text-info'>A</span>ncient Wa
                                <i className="bi bi-person-walking fs-5 text-info"></i>k
                            </em>
                        </Link>
                    </div>
                </div>

                {/* Login Modal */}
                <div className="modal fade" id="loginModal" tabIndex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="loginModalLabel">Login to Egyptian Artifact Restoration</h5>
                                <button 
                                    type="button" 
                                    id="loginModalClose"
                                    className="btn-close" 
                                    data-bs-dismiss="modal" 
                                    aria-label="Close"
                                ></button>
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
                                <Link className="dropdown-item text-dark text-center" to="/register">
                                    New here? Register for free
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Register Form */}
            <div className="glass-container col-12 col-md-9 col-lg-4 mt-5 mob mobpm">
                <h2 className="text-center">Register for a Free Account</h2>
                <form onSubmit={handleRegister}>
                    <div>
                        <label htmlFor="email" className="form-label">Email Address</label>
                        <input 
                            type="email" 
                            id="email" 
                            className="form-control" 
                            value={registerData.email} 
                            onChange={handleRegisterChange} 
                            required 
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="form-label">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            className="form-control" 
                            value={registerData.password} 
                            onChange={handleRegisterChange} 
                            required 
                        />
                    </div>
                    <div className="d-flex form-label pt-3">
                        <ul>
                            <li className="list-group-item">
                                <i className="bi bi-check-lg"></i> You must provide accurate information.
                            </li>
                            <li className="list-group-item">
                                <i className="bi bi-check-lg"></i> You are responsible for keeping your password secure.
                            </li>
                            <li className="list-group-item">
                                <i className="bi bi-check-lg"></i> You must not share your account with others.
                            </li>
                        </ul>
                    </div>
                    <div className="form-check d-flex align-items-center">
                        <input 
                            className="form-check-input me-2" 
                            type="checkbox" 
                            id="terms" 
                            required 
                        />
                        <label className="form-check-label" htmlFor="terms">
                            Accept Terms & Conditions
                        </label>
                    </div>
                    <button type="submit" className="btn btn-dark w-100 mt-3">
                        Create Account
                    </button>
                </form>
            </div>
        </div>
    );
}