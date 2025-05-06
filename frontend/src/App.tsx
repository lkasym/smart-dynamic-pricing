import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DataGenerationPage from './pages/DataGenerationPage';
import { ThemeProvider } from './contexts/ThemeContext';

const App: React.FC = () => {
  const [dataGenerated, setDataGenerated] = useState<boolean>(false);
  
  // Check localStorage to see if data was previously generated
  useEffect(() => {
    const hasGeneratedData = localStorage.getItem('dataGenerated') === 'true';
    if (hasGeneratedData) {
      setDataGenerated(true);
    }
  }, []);
  
  const handleDataGenerated = () => {
    setDataGenerated(true);
    localStorage.setItem('dataGenerated', 'true');
  };

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={
              dataGenerated ? 
                <Navigate to="/dashboard" /> : 
                <DataGenerationPage onDataGenerated={handleDataGenerated} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              dataGenerated ? 
                <Dashboard /> : 
                <Navigate to="/" />
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
