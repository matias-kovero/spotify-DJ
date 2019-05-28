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
    const hash = window.location.hash
    .substring(1)
    .split('&')
    .reduce(function (initial, item) {
      if (item) {
        var parts = item.split('=');
        initial[parts[0]] = decodeURIComponent(parts[1]);
      }
      return initial;
    }, {});
    window.location.hash = '';

    // Set token
    let _token = hash.access_token;

    const authEndpoint = 'https://accounts.spotify.com/authorize';

    // Replace with your app's client ID, redirect URI
    const clientId = 'a5e9439fc1e44fd79f7f2ff00c6a0bc2';
    const redirectUri = 'https://'+window.location.host+'/callback'; //https://spotify-dj.now.sh/callback
    if(_token) {
      console.log(_token);
      this.props.setUserAccessToken(_token);
      Cookie.set('SPOTIFY_TOKEN', _token, {maxAge: 3500});
    }
    // If there is no token, redirect to Spotify authorization
    if (!_token) {
      window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${SCOPES.join('%20')}&response_type=token&show_dialog=true`;
    }
  }

  componentDidMount() {
    if(window.location.pathname == '/callback') {
      this.login();
      window.location.replace('http://'+window.location.host);
    }
  }

  render = () => {
    return (
      <div style={{top: '15rem', position: 'relative'}}>
          <label>
            <h1>Spotify DJ</h1>
          </label>
          <br />
          <br />
          <button 
            className='btn btn-success'
            type="button" 
            style={{borderRadius: '2rem', padding: '.5rem 3rem .6rem 3rem'}}
            onClick={this.login}>Login with Spotify</button>
        <br />
        <br />
        <a target="_blank" href="https://beta.developer.spotify.com/documentation/web-playback-sdk/quick-start/#authenticating-with-spotify">Get Your Access Token from <strong>Spotify for Developers</strong></a>
      </div>
    );
  }
}

export default Login;