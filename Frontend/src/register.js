import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, useNavigate } from 'react-router-dom';
 import './App.css';
 import './index.css';

export default function Register() {
    const [users, setUsers] = useState([]); // Only dynamic users stored
    const [currentUser, setCurrentUser] = useState(null);
    const [registerData, setRegisterData] = useState({ email: '', password: '', role: 'user' });
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = sessionStorage.getItem('currentUser');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
    }, []);

    const handleRegister = (e) => {
      e.preventDefault();
  
      if (registerData.email === 'admin@ancientwalk.com') {
          alert("You can't register as admin.");
          return;
      }
  
      if (users.some(user => user.email === registerData.email)) {
          alert('User already exists!');
          return;
      }
  
      const newUser = { ...registerData, role: 'user' };
      setUsers([...users, newUser]);
      setCurrentUser(newUser);
      sessionStorage.setItem('currentUser', JSON.stringify(newUser));
      alert('Registration successful! You can now login.');
      setRegisterData({ email: '', password: '', role: 'user' });
      // Removed: navigate('/project');
  };
  
    const handleLogin = (e) => {
        e.preventDefault();

        const isAdmin = loginData.email === 'admin@ancientwalk.com' && loginData.password === 'admin123';
        const user = users.find(user => 
            user.email === loginData.email && user.password === loginData.password
        );

        if (isAdmin) {
            const admin = { email: 'admin@ancientwalk.com', password: 'admin123', role: 'admin' };
            setCurrentUser(admin);
            localStorage.setItem('currentUser', JSON.stringify(admin));
            alert('Welcome Admin!');
            //navigate('/');
        } else if (user) {
            setCurrentUser(user);
            localStorage.setItem('currentUser', JSON.stringify(user));
            alert(`Hello ${user.email.split('@')[0]}`);
          //navigate('/');
        } else {
            alert('Invalid credentials. Please try again or register.');
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
                                          <button
                                            className="nav-link fw-bold mx-1 text-uppercase text-white btn hover"
                                            data-bs-toggle="modal"
                                            data-bs-target="#loginModal"
                                          >
                                            Login
                                          </button>
                                        </li>
                                        {currentUser ? (
                                            <li className="nav-item">
                                                <span className="nav-link text-uppercase text-white font">
                                                <i class="bi bi-person-circle"></i> {currentUser.email.split('@')[0]} 
                                                </span>
                                            </li>
                                        ) : (
                                            <>
                                                <li className="nav-item">
                                                    <button className="nav-link btn btn-dark mx-1 hove">
                                                        <Link className='text-white font text-uppercase fw-bold text-decoration-none' to="/register">Register</Link> 
                                                    </button>
                                                </li>
                                            </>
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
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleLogin}>
                                    <div>
                                        <label htmlFor="loginEmail" className="form-label">Email Address</label>
                                        <input 
                                            type="email" 
                                            className="form-control" 
                                            id="email" 
                                            placeholder="email@example.com" 
                                            value={loginData.email}
                                            onChange={handleLoginChange}
                                            required 
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="loginPassword" className="form-label">Password</label>
                                        <input 
                                            type="password" 
                                            className="form-control" 
                                            id="password" 
                                            placeholder="Enter your password" 
                                            value={loginData.password}
                                            onChange={handleLoginChange}
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
                                <Link className="dropdown-item text-dark text-center" to="#">Forgot password?</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="glass-container col-12 col-md-9 col-lg-4 mt-5 mob mobpm">
                <h2 className="text-center">Register for a Free Account</h2>
                <form onSubmit={handleRegister}>
                    <div>
                        <label htmlFor="email" className="form-label">Email Address</label>
                        <input 
                            type="email" 
                            id="email" 
                            className="form-control" 
                            placeholder="email@example.com" 
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
                            placeholder="Password" 
                            value={registerData.password}
                            onChange={handleRegisterChange}
                            required 
                        />
                    </div>
                    <div className="d-flex form-label pt-3">
                        <ul>
                            <li className="list-group-item"><i className="bi bi-check-lg"></i>You must provide accurate information.</li>
                            <li className="list-group-item"><i className="bi bi-check-lg"></i>You are responsible for keeping your password secure.</li>
                            <li className="list-group-item"><i className="bi bi-check-lg"></i>You must not share your account with others.</li>
                        </ul>
                    </div>
                    <div className="form-check d-flex align-items-center">
                        <input className="form-check-input me-2" type="checkbox" id="terms" required />
                        <label className="form-check-label" htmlFor="terms">
                            Accept Terms & Conditions
                        </label>
                    </div>
                    <button type="submit" className="btn btn-dark w-100 mt-3">Create Account</button>
                </form>

            </div>
        </div>
    );
}

// Commits on Apr 19, 2025
// after convert registar to dynamic, note: i change in project & aboutus pages because of
//  (currentuser) appear as hard code so i just change in navbar(collabsbar) only .
// add this after <li> project </li>
/*  {currentUser ? (
                    <li className="nav-item">
                        <span className="nav-link text-uppercase text-white font">
                        <i class="bi bi-person-circle"></i> {currentUser.email.split('@')[0]} 
                        </span>
                    </li>
                    ) : (
                    <>
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
                                <Link className='text-white font text-uppercase fw-bold text-decoration-none' to="/register">Register</Link> 
                            </button>
                        </li>
                    </>
                )}*/