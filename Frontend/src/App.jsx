import './App.css';
import './index.css';
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import About from './aboutus';
import FootAbout from './footer';
import Main from './home';
import ArtifactUpload from './project.jsx';
import Register from './register.js';

function App() {
  // Initialize state from localStorage
  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem('products');
    return savedProducts ? JSON.parse(savedProducts) : [];
  });

  // Save products to localStorage whenever products state changes
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  return (
    <Router future={{ startTransition: true, relativeSplatPath: true }}>
      <Routes>
        <Route path='/' element={<Main />} />
        <Route path='/aboutus' element={<About />} />
        <Route path='/project' element={<ArtifactUpload />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
