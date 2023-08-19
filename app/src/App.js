import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Main from './components/Container/Main/Main';
import Stats from './components/Container/Stats/Stats';
import './App.css';

function App() {
  return (
    <Router>
      <div className="container">
        <Routes>
          <Route path="/dashboard" element={<Main />} />
          <Route path="/dashboard/stats" element={<Stats />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;