
/* import React, { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState('');

  useEffect(() => {
    fetch('/api/data')
      .then(response => response.json())
      .then(data => setData(data.message));
  }, []);

  return (
    <div className="App">
      <h1>React App</h1>
      <p>test</p>
    </div>
  );
} */

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Main from './components/Container/Main/Main';
import './App.css';

function App() {
  return (
    <Router>
      <div className="container">
        <Routes>
          <Route path="/dashboard" element={<Main />} />
          <Route path="/study" element={<Main />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;