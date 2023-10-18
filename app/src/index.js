import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as process from 'process';

const root = ReactDOM.createRoot(document.getElementById('root'));

global.process = process;

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if (process.env.REACT_APP_DEVICE === "chromebook") {
  const eruda = require('eruda');
  eruda.init();
};