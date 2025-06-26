//  import React from 'react';
//  import './index.css';
//  import 'bootstrap/dist/css/bootstrap.min.css';
//  import { Link } from 'react-router-dom';

//  export default function Header() {
//   return (
//      <>
//       <header className='bg' >
//         {/* First Header */}
//         <div className="container-fluid d-flex justify-content-between align-items-center  mob">
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
//                         {/* {currentUser ? (
//                     <li className="nav-item">
//                         <span className="nav-link text-uppercase text-white font">
//                         <i class="bi bi-person-circle"></i> {currentUser.email.split('@')[0]} 
//                         </span>
//                     </li>
//                     ) : ( */}
//                     <>
//                         <li className="nav-item">
//                             <button
//                                 className="nav-link fw-bold mx-1 text-uppercase text-white btn hover"
//                                 data-bs-toggle="modal"
//                                 data-bs-target="#loginModal"
//                             >
//                                 Login
//                             </button>
//                         </li>
//                         <li className="nav-item">
//                             <button className="nav-link btn btn-dark mx-1 hove">
//                                 <Link className='text-white font text-uppercase fw-bold text-decoration-none' to="/register">Register</Link> 
//                             </button>
//                         </li>
//                     </>
//                           </ul>
//                         </div>
//                       </div>
//                     </nav>
//                   </div>

//           <div className="d-flex justify-content-center align-items-center text-center order-1 order-md-1">
//             <Link className="navbar-brand font text-white" to="/">
//              <img src="/img/logo.png" alt="logo" className="me-2" style={{ height: "40px" }}/>
//             <em className='fs-5'><span className='text-info'>A</span>ncient Wa<i className="bi bi-person-walking fs-5 text-info"></i>k</em>
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

//                   <button type="submit" className="btn btn-dark w-100 mt-3">Login</button>
//                 </form>
//                 <div className="dropdown-divider  "></div>
//                 <Link className="dropdown-item text-dark text-center" to="/project">New here? Register for free</Link>
//                 <Link className="dropdown-item text-dark text-center" to="#">Forgot password?</Link>
//               </div>
//             </div>
//           </div>
//         </div>
//       </header>
//     </>
//   );
// }
