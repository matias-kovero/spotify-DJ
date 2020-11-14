import React, { Component } from 'react';
import { Cookies } from 'react-cookie';
import qs from 'querystring';
import { generateCodeChallengeFromVerifier, generateCodeVerifier, getHash } from './scripts';

let AuthContext = React.createContext();
const Cookie = new Cookies();

const SCOPES = [
  'user-read-playback-state',
  'streaming',
  'user-read-birthdate',
  'user-read-private',
  'user-modify-playback-state',
  'user-read-email'
];

const redirectToAuth = async (client, verifier) => {
  if (!verifier) throw Error('Issues with PKCE verifier_code!');

  const endpoint = 'https://accounts.spotify.com/authorize';

  const code = await generateCodeChallengeFromVerifier(verifier);

  const params = { 
    client_id: client, // Provide this as param
    response_type: 'code',
    redirect_uri: `http://${window.location.host}/callback`,
    code_challenge_method: 'S256',
    code_challenge: code,
    state: 'KIJ03NMF3',
    scope: SCOPES.join('%20'),
  };
  console.log(`${endpoint}?${qs.stringify(params)}`);
  return `${endpoint}?${qs.stringify(params)}`;
}

const getAccessToken = async (client, verifier, code) => {
  if (!verifier) throw Error('Issues with PKCE verifier_code!');

  const endpoint = 'https://accounts.spotify.com/api/token';
  const params = {
    client_id: client,
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: `http://${window.location.host}/callback`,
    code_verifier: verifier
  };

  let bodyString = Object.keys(params).map((key) => {
    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
  }).join('&');

  return await fetch(endpoint, {
    method: "POST",
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: bodyString
  });
}

const refreshAccessToken = async (client, code) => {
  const endpoint = 'https://accounts.spotify.com/api/token';
  const params = {
    client_id: client,
    grant_type: 'refresh_token',
    refresh_token: code,
  };
  let bodyString = Object.keys(params).map((key) => {
    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
  }).join('&');

  return await fetch(endpoint, {
    method: "POST",
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: bodyString
  });
}

// https://www.taniarascia.com/using-context-api-in-react/

class AuthProvider extends Component {

  state = {
    client: this.props.client,
    volume: Cookie.get('player_volume') || 0.5,
    verifier: Cookie.get('_spcv') || null,
    code: null,
    auth_token: Cookie.get('_spat') || null,
    refresh_token: Cookie.get('_sprt') || null
  }
  
  componentDidMount() {
    if (!this.state.client) console.log('Client ID is missing, please remeber to provide it');
    // Check if we landed from spotify redirect...
    const code = getHash().code;

    // User just gave access to our app -> update state with new code.
    if (code) {
      this.setState((prevState) => ({ code }));

      async function fetchCode(cb) {
        await cb();
      }
      fetchCode(this.getToken);
      // We could remove code from url.
      window.history.pushState({}, null, window.location.origin);

    } else if (!code && !this.state.code && !this.state.auth_token && !this.state.refresh_token) {
      let verifier = generateCodeVerifier();
      this.setState((prevState) => ({ verifier }));
      Cookie.set('_spcv', verifier, { maxAge: 360 });
    }
  }

  // Methods to update state
  setAuth = (auth_token) => {
    this.setState(( prevState ) => ({ auth_token }))
  }

  setRefresh = (refresh_token) => {
    this.setState(( prevState ) => ({ refresh_token }))
  }

  setVolume = (volume) => {
    this.setState(( prevState ) => ({ volume }))
    // Just in-case, update cookie aswell.
    Cookie.set('player_volume', volume);
  }

  getToken = async () => {
    let updated;
    // Check if Cookie and context token are still mathcing.
    let [ cookie_token, context_token ] = [Cookie.get('_spat'), this.state.auth_token];

    if (cookie_token === context_token && context_token) {
      return this.state.auth_token;
    } else {
      try {
        if (this.state.refresh_token) {
          updated = await this.requestRefreshToken();
        } else if (this.state.code) {
          updated = await this.requestAccessToken();
        }
      } catch (err) {
        console.log(`[Error] Token Update - ${err}`);
        setTimeout(async() => { await this.getToken() }, 2000);
      } finally {
        //console.log('Completed getToken()');
      }
      // Check results from API
      if (updated && updated.auth_token) return updated.auth_token;
      else return setTimeout(async() => { await this.getToken() }, 2000);
    }
  }

  authorizeUser = async () => {
    // User came back, refresh tokens with cookies
    if (!this.state.verifier) return this.getToken();
    // User is logging in for the 1st time
    window.location.href = await redirectToAuth(this.state.client, this.state.verifier);
  }

  requestAccessToken = async () => {
    let response = await getAccessToken(this.state.client, this.state.verifier, this.state.code);
    if (response.status === 200) {
      let data = await response.json();
      // 200 OK { access_token, token_type, scope, expires_in, refresh_token }
      Cookie.set('_spat', data.access_token, { maxAge: data.expires_in });
      Cookie.set('_sprt', data.refresh_token, { maxAge: 60*60*24*365 });
      this.setAuth(data.access_token);
      this.setRefresh(data.refresh_token);
      return { auth_token: data.access_token, refresh_token: data.refresh_token };
    } else throw Error(`${response.status} - ${response.statusText}`);
  }

  requestRefreshToken = async () => {
    let response = await refreshAccessToken(this.state.client, this.state.refresh_token);
    if (response.status === 200) {
      let data = await response.json();
      Cookie.set('_spat', data.access_token, { maxAge: data.expires_in });
      Cookie.set('_sprt', data.refresh_token, { maxAge: 60*60*24*365 });
      this.setAuth(data.access_token);
      this.setRefresh(data.refresh_token);
      return { auth_token: data.access_token, refresh_token: data.refresh_token };
    } else throw Error(`${response.status} - ${response.statusText}`);
  }

  audioFeatures = async (id) => {
    if (!id) throw Error('Missing Spotify Track ID');
    const headers = { Authorization: `Bearer ${this.state.auth_token}`};
    const endpoint = `https://api.spotify.com/v1/audio-features/${id}`;

    let features = await fetch( endpoint, { method: 'GET', headers: headers });
    // TODO: Check for 400 etc.
    return await features.json();
  }

  /**
   * Get a detailed audio analysis for a single track identified by its Spotify ID.
   * @param {String} id Spotify ID of the track 
   * @returns {AudioAnalysisObject}
   */
  audioAnalysis = async (id) => {
    if (!id) throw Error('Missing Spotify Track ID');
    const headers = { Authorization: `Bearer ${this.state.auth_token}`};
    const endpoint = `https://api.spotify.com/v1/audio-analysis/${id}`;

    let analysis = await fetch(endpoint, { method: "GET", headers: headers });
    // TODO: Check for 400 etc.
    let json = await analysis.json();
    return json;
  }

  /**
   * Get song recomendations for your search params.
   * @param {Object} params 
   */
  recommendations = async (params) => {
    const endpoint = 'https://api.spotify.com/v1/recommendations';
    
    let recommendations = await fetch(`${endpoint}?${qs.stringify(params)}`, {
      method: "GET", headers: { Authorization: `Bearer ${this.state.auth_token}`}
    });
    // TODO: Check for 401, 403 etc.
    let json = await recommendations.json();
    return json;
  }

  queueTrack = async (uri) => {
    const endpoint = 'https://api.spotify.com/v1/me/player/queue';
    const params = { uri };

    return await fetch(`${endpoint}?${qs.stringify(params)}`, {
      method: 'POST', headers: { Authorization: `Bearer ${this.state.auth_token}`}
    });
  }

  selectDevice = async (device_id) => {
    if (!device_id) throw Error('Issues with device_id!');
    const endpoint = 'https://api.spotify.com/v1/me/player';
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.state.auth_token}`};
    let response = await fetch(endpoint, { 
      method: 'PUT', 
      headers: headers, 
      body: JSON.stringify({"device_ids": [device_id]})
    });
    if ([200, 204].includes(response.status)) {
      setTimeout(() => {
        window.Spotify.PlayerInstance.resume();
      }, 2000);
    } else console.log(`[ERROR] ${response.status} - ${response.statusText}`);
  }

  render() {
    const { children } = this.props
    const { auth_token, refresh_token, code } = this.state
    const { setAuth, setRefresh, setVolume } = this
    const { authorizeUser, requestAccessToken, requestRefreshToken } = this
    const { selectDevice, getToken } = this
    const { audioFeatures, audioAnalysis, recommendations, queueTrack } = this

    return (
      <AuthContext.Provider 
        value={{
          code, auth_token, refresh_token,
          setAuth, setRefresh, setVolume,
          authorizeUser, requestAccessToken, requestRefreshToken,
          selectDevice,
          getToken,
          audioFeatures, audioAnalysis, recommendations, queueTrack
        }}
      >
        {children}
      </AuthContext.Provider>
    )
  }
}

export default AuthContext
export { AuthProvider }