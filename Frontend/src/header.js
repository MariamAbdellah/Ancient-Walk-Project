// import React from 'react';
// import './index.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import { Link } from 'react-router-dom';

// export default function Header() {
//   return (
//     <>
//       <header className='bg'>
//         {/* First Header */}
//         <div className="container-fluid d-flex justify-content-between align-items-center mb-5 mob">
//           <div className="row d-flex justify-content-center align-items-center order-3 order-md-3 mob">
//             <nav className="navbar navbar-expand-lg navbar-light fw-bold">
//               <div className="container">
//                 <button 
//                   className="navbar-toggler" 
//                   type="button" 
//                   data-bs-toggle="collapse" 
//                   data-bs-target="#navbarNav" 
//                   aria-controls="navbarNav" 
//                   aria-expanded="false" 
//                   aria-label="Toggle navigation"
//                 >
//                   <span className="navbar-toggler-icon"></span>
//                 </button>
//                 <div className="collapse navbar-collapse" id="navbarNav">
//                   <ul className="navbar-nav">
//                     <li className="nav-item">
//                       <Link className="nav-link text-uppercase text-white font" to="/">Home</Link>
//                     </li>
//                     <li className="nav-item">
//                       <Link className="nav-link text-uppercase text-white font" to="/aboutus">About Us</Link>
//                     </li>
//                     <li className="nav-item">
//                       <Link className="nav-link text-uppercase text-white font" to="/project">Project</Link>
//                     </li>
//                     <li className="nav-item">
//                       <button 
//                         className="nav-link fw-bold mx-1 text-uppercase text-white font btn" 
//                         data-bs-toggle="modal" 
//                         data-bs-target="#loginModal"
//                       >
//                         Login
//                       </button>
//                     </li>
//                     <li className="nav-item">
//                       <button 
//                         className="nav-link btn hove btn-dark fw-bold my-3 mx-3 py-0 text-white font" 
//                         data-bs-toggle="modal" 
//                         data-bs-target="#regModal"
//                       >
//                         Register
//                       </button>
//                     </li>
//                   </ul>
//                 </div>
//               </div>
//             </nav>
//           </div>

//           <div className="d-flex justify-content-center align-items-center text-center order-1 order-md-1">
//             <Link className="navbar-brand font text-white" to="/">
//               <i className="bi bi-bootstrap-reboot pe-2 text-info"></i>
//               <em>Egyptian Artifact <span className="text-info">R</span>estoration</em>
//             </Link>
//           </div>
//         </div>

//         {/* Login Modal */}
//         <div className="modal fade" id="loginModal" tabIndex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
//           <div className="modal-dialog">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title" id="loginModalLabel">Login to Egyptian Artifact Restoration</h5>
//                 <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
//               </div>
//               <div className="modal-body">
//                 <form>
//                   <div>
//                     <label htmlFor="loginEmail" className="form-label">Email Address</label>
//                     <input type="email" className="form-control" id="loginEmail" placeholder="email@example.com" required />
//                   </div>

//                   <div>
//                     <label htmlFor="loginPassword" className="form-label">Password</label>
//                     <input type="password" className="form-control" id="loginPassword" placeholder="Enter your password" required />
//                   </div>

//                   <div className="form-check d-flex align-items-center">
//                     <input type="checkbox" className="form-check-input me-2" id="rememberMe" />
//                     <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
//                   </div>

//                   <button type="submit" className="btn btn-dark w-50 mt-3">Login</button>
//                 </form>
//                 <div className="dropdown-divider"></div>
//                 <a className="dropdown-item text-dark" href="#">New here? Register for free</a>
//                 <a className="dropdown-item text-dark" href="#">Forgot password?</a>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Register Modal */}
//         <div className="modal fade" id="regModal" tabIndex="-1" aria-labelledby="regModalLabel" aria-hidden="true">
//           <div className="modal-dialog">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title" id="regModalLabel">Register for a Free Account</h5>
//                 <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
//               </div>
//               <div className="modal-body">
//                 <form>
//                   <div>
//                     <label htmlFor="registerEmail" className="form-label">Email Address</label>
//                     <input type="email" id="registerEmail" className="form-control" placeholder="email@example.com" required />
//                   </div>
//                   <div>
//                     <label htmlFor="registerPassword" className="form-label">Password</label>
//                     <input type="password" id="registerPassword" className="form-control" placeholder="Password" required />
//                   </div>
//                   <div className="form-check d-flex align-items-center">
//                     <input className="form-check-input me-2" type="checkbox" id="terms" required />
//                     <label className="form-check-label" htmlFor="terms">
//                       Accept Terms & Conditions
//                     </label>
//                   </div>
//                   <button type="submit" className="btn btn-dark w-50 mt-3">Create Account</button>
//                 </form>
//                 <div className="dropdown-divider"></div>
//                 <a className="dropdown-item text-dark" href="#">I already have an account</a>
//               </div>
//             </div>
//           </div>
//         </div>
//       </header>
//     </>
//   );
// }
