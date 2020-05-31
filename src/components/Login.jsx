import React, { Component} from 'react'; 
import { Cookies } from 'react-cookie';

const Cookie = new Cookies();
const SCOPES = [
  'user-read-playback-state',
  'streaming',
  'user-read-birthdate',
  'user-read-private',
  'user-modify-playback-state',
  'user-read-email'
];

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
    }
    this.login = this.login.bind(this);
  }

  login() {
    let params = (new URL(document.location)).searchParams;
    let searchParams = new URLSearchParams(params);

    let access_token = Cookie.get('_spat');
    let refresh_token = Cookie.get('_sprt');
    let old_auth_code = Cookie.get('_spac');

    // Set token
    let _token = searchParams.get('access_token');
    let _code = searchParams.get('code');
    //let _refresh = searchParams.get('refresh_token');

    const authEndpoint = 'https://accounts.spotify.com/authorize';
    const accessEndpoint = 'https://accounts.spotify.com/api/token';

    // Replace with your app's client ID, redirect URI
    const clientId = 'a5e9439fc1e44fd79f7f2ff00c6a0bc2';
    const client_secret = '8a5e64dbf47443cea3e781d32a80c1b2';
    const redirectUri = 'http://'+window.location.host+'/callback'; //https://spotify-dj.now.sh/callback
    if(_token && _code) {  // We should have both -> Init player
      Cookie.set('_spat', _token); // Access Token
      this.props.setUserAccessToken(_token);
    } else if(refresh_token && !access_token) { // We have refresh but no access
      console.log('Access token needs refreshing, using refresh token to request a new one.');
      const params = {
        grant_type: 'refresh_code',
        refresh_code: refresh_token,
        //redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: client_secret
      };
      const bodyString = Object.keys(params).map((key) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
      }).join('&');
      var authOptions = {
        method: 'POST',
        headers: {
          //'Authorization': 'Basic ' + (new Buffer(clientId + ':' + client_secret).toString('base64')),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: bodyString
      };
      fetch(accessEndpoint, authOptions)
      .then(response => response.json())
      .then(data => {
        Cookie.set('_spat', data.access_token, { maxAge: data.expires_in });
        if(data.refresh_token) Cookie.set('_sprt', data.refresh_token, { maxAge: 60*60*24*365 });
        this.props.setUserAccessToken(data.access_token);
      });
      console.log('Updated');
    } else if((_code && !_token) || old_auth_code) { // We have _code but no valid access_token
      if(_code) Cookie.set('_spac', _code); // Auth Code
      console.log('Creating fetch to get new token');
      const params = {
        grant_type: 'authorization_code',
        code: _code ? _code : old_auth_code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: client_secret
      };
      let bodyString = Object.keys(params).map((key) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
      }).join('&');
      let authOptions = {
        method: 'POST',
        headers: {
          //'Authorization': 'Basic ' + (new Buffer(clientId + ':' + client_secret).toString('base64')),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: bodyString
      };
      fetch(accessEndpoint, authOptions)
      .then(response => {
        if(response.status === 200) response.json()
        .then(data => {
          Cookie.set('_spat', data.access_token, { maxAge: 3600 });
          Cookie.set('_sprt', data.refresh_token, { maxAge: 60*60*24*365 });
          this.props.setUserAccessToken(data.access_token);
        });
        else this.login();
      }).catch(error => this.login());
      console.log('Done');
    }
    if (!_code) {
      window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${SCOPES.join('%20')}&response_type=code&show_dialog=false`;
    }
  }

  componentDidMount() {
    if(window.location.pathname === '/callback') {
      this.login();
      window.location.replace('http://'+window.location.host);
    } else if(Cookie.get('_sprt')) this.login(); // User has logged in previosly
  }

  render = () => {
    return (
      <div style={{top: '15rem', position: 'relative'}}>
          <div className='fixed-top'>
            <h1 className='title'>Spotify DJ</h1>
            <p className='author text-muted'>by Matias Kovero</p>
          </div>
          <br />
          <br />
          <button 
            className='btn btn-success'
            type="button" 
            style={{borderRadius: '2rem', padding: '.5rem 3rem .6rem 3rem'}}
            onClick={this.login}>Login with Spotify</button>
      </div>
    );
  }
}

export default Login;