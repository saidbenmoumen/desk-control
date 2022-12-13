import React from 'react';
import './globals.css';
import "tailwindcss/tailwind.css";
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './windows/home';
import { DeskProvider } from './components/Provider';

export default function App() {
  return (
    <DeskProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
    </DeskProvider>
  );
}
