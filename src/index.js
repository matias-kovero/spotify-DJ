import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import SpotifyDJ from './App';

import { CookiesProvider } from 'react-cookie';
import { AuthProvider } from './SpotifyContext/SpotifyContext';
import * as serviceWorker from './serviceWorker';
import 'bootstrap/dist/css/bootstrap.min.css';

const CLIENT_ID = 'a5e9439fc1e44fd79f7f2ff00c6a0bc2';

ReactDOM.render(
  <CookiesProvider>
    <AuthProvider client={CLIENT_ID}>
      <SpotifyDJ />
    </AuthProvider>
  </CookiesProvider>, 
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
