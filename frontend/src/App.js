import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { initializeIcons, ThemeProvider } from '@fluentui/react';
import HomePage from './pages/HomePage';
import StorytellingHub from './pages/StorytellingHub';
import MentorshipMarketplace from './pages/MentorshipMarketplace';
import ProjectsBoard from './pages/ProjectsBoard';
import Header from './components/Header';
import Footer from './components/Footer';
import './App.css';

// Initialize Fluent UI icons
initializeIcons();

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="app-container">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/stories" element={<StorytellingHub />} />
              <Route path="/mentorship" element={<MentorshipMarketplace />} />
              <Route path="/projects" element={<ProjectsBoard />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
