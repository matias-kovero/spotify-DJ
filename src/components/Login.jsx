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

const authEndpoint = 'https://accounts.spotify.com/authorize';
const accessEndpoint = 'https://accounts.spotify.com/api/token';
const clientId = 'a5e9439fc1e44fd79f7f2ff00c6a0bc2';
const client_secret = '8a5e64dbf47443cea3e781d32a80c1b2';
const redirectUri = 'http://'+window.location.host+'/callback';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clicked: false,
      code: Cookie.get('_spco') ? Cookie.get('_spco') : null,
      access_token: Cookie.get('_spat') ? Cookie.get('_spat') : null,
      refresh_token: Cookie.get('_sprt') ? Cookie.get('_sprt') : null,
    }
    this.buttonClick = this.buttonClick.bind(this);
    this.login = this.login.bind(this);
    this.checkParams = this.checkParams.bind(this);
    this.authAccess = this.authAccess.bind(this);
    this.requestTokens = this.requestTokens.bind(this);
    this.updateTokens = this.updateTokens.bind(this);
  }
  /**
   * User needs to Login and give access to the app.
   * 
   */
  authAccess() {
    let params = this.checkParams();
    if(!params) {
      window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${SCOPES.join('%20')}&response_type=code&show_dialog=false`;
    }
  }
  
  /**
   * When we have *code* we request access_token and refresh_tokens
   */
  requestTokens() {
    // We will need client_id, client_secret, grant_type, code, redirect_uri
    if(!this.state.code || this.state.code === undefined) return new Error('Missing user code.');
    const params = {
      grant_type: 'authorization_code',
      code: this.state.code,
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
        this.setState((prevState) => ({
          ...prevState,
          access_token: data.access_token,
          refresh_token: data.refresh_token
        }));
        this.props.setUserAccessToken(data.access_token);
      });
      else if(response.status === 400) return new Error('Issues getting token', response.statusText);
    }).catch(error => console.log(error));
  }

  /**
   * Access token isn't valid anymore, we request a new one using the refresh_token.
   */
  updateTokens() {
    // We will need our refresh_token
    if(!this.state.refresh_token || this.state.refresh_token === undefined) return new Error('Missing user refresh_token.');
    const params = {
      grant_type: 'refresh_token',
      refresh_token: this.state.refresh_token,
      client_id: clientId,
      client_secret: client_secret
    };
    let bodyString = Object.keys(params).map((key) => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
    }).join('&');
    let authOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: bodyString
    };
    fetch(accessEndpoint, authOptions)
    .then(response => {
      if(response.status === 200) response.json()
      .then(data => {
        Cookie.set('_spat', data.access_token, { maxAge: 3600 });
        if(data.refresh_token) Cookie.set('_sprt', data.refresh_token, { maxAge: 60*60*24*365 });
        this.setState((prevState) => ({
          ...prevState,
          access_token: data.access_token,
          refresh_token: data.refresh_token || prevState.refresh_token
        }));
        this.props.setUserAccessToken(data.access_token);
      });
      else if(response.status === 400) return new Error('Issues getting token', response.statusText);
    }).catch(error => console.log(error));
  }

  checkParams() {
    console.log('page loaded');
    let params = (new URL(document.location)).searchParams;
    let searchParams = new URLSearchParams(params);
    let code = searchParams.get('code');
    if(code) {
      this.setState({
        code: code,
      });
      Cookie.set('_spco', code, { maxAge: 120 });
      return window.location.replace('http://'+window.location.host);
    } else {
      let lastCheck = Cookie.get('_spco', {doNotParse: true});
      if(lastCheck !== undefined) this.login(); 
      return false
    };
  }

  login() {
    if(this.state.refresh_token) this.updateTokens();
    else if(this.state.code) this.requestTokens();
    else this.authAccess();
  }

  componentDidMount() {
    this.checkParams(); // Check for /callback
    //if(code) this.login();
  }

  buttonClick() {
    this.login();
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
          onClick={this.buttonClick}>Login with Spotify</button>
      </div>
    );
  }
}

export default Login;