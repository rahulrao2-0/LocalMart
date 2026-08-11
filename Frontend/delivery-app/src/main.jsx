import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App.jsx';
import { store } from './redux/store';
import 'leaflet/dist/leaflet.css';
import './index.css';

// The theme now lives inside <App /> because its mode is read from the Redux
// ui slice, which requires the Provider to already be mounted.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
