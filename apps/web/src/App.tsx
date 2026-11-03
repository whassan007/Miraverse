import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Story from './pages/Story';
import Play from './pages/Play';
import Passport from './pages/Passport';
import About from './pages/About';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/story/:lang" element={<Story />} />
        <Route path="/play/:country" element={<Play />} />
        <Route path="/passport" element={<Passport />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </HashRouter>
  );
}
