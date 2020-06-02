import React, { Component } from 'react';
import { Cookies } from 'react-cookie';
import './App.css';
import ColorThief from '../node_modules/colorthief/dist/color-thief.mjs';

import Playlist from './components/Playlist';
// Add Spotify Web Playback for React
import {
  WebPlaybackScreen as Screen,
  WebPlayback
} from './Spotify/spotify-web-playback.js';
import Carousel from './components/Carousel';
import Login from './components/Login';
const colorThief = new ColorThief();
const Cookie = new Cookies();
//const { getColorFromURL, getColor } = require('color-thief-node');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userAccessToken: Cookie.get('_spat') || null,
      playerState: null,
      info: '',
      volume: 0.5,
    }
    this.spotifyApi = this.spotifyApi.bind(this);
    this.selectSpotifyDJ = this.selectSpotifyDJ.bind(this);
    this.updatePlayerState = this.updatePlayerState.bind(this);
    this.getBase64Image = this.getBase64Image.bind(this);
    this.updateVolume = this.updateVolume.bind(this);
  }
  spotifyApi(url) {
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        'Authorization': 'Bearer ' + Cookie.get('_spat')
      }
    }).then((response) => {
      if(response.status === 200){
        response.json().then((responseJson) => {
          return responseJson; //console.log(responseJson);
        }).catch(err => {
          console.log(err.name + ' | ' + err.message);
        });
      } else {
        console.log('Response status: ', response.status)
      }
    }).catch(err => {
      console.log(err.name + ' | ' + err.message);
    });
  }

  updateVolume(newVolume) {
    this.setState(prevState => ({...prevState, volume: newVolume}))
  }

  selectSpotifyDJ(deviceID) {
    fetch('https://api.spotify.com/v1/me/player', {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json',
        'Authorization': 'Bearer ' + Cookie.get('_spat')
      },
      body: JSON.stringify({
        "device_ids":[
          deviceID
        ]
      })
    }).then((response) => {
      if(response.status === (204 || 200)) {
        setTimeout(() => window.Spotify.PlayerInstance.resume(), 1000);
      } else {
        console.log('Response status: ', response.status)
        console.log(response.status === (204 || 200));
      }
    }).catch(err => {
      console.log(err.name + ' | ' + err.message);
    });
  }

  getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    var dataURL = canvas.toDataURL("image/png");

    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}

  async updatePlayerState() {
    setTimeout(() => {
      let root = document.getElementById('root');
      let album_cover = document.getElementsByClassName('songPlayer')[0];
      if(album_cover) {
        let dc = colorThief.getColor(album_cover.querySelector('img'));
        root.style.backgroundColor = `rgba(${dc[0]},${dc[1]},${dc[2]}, 0.3)`;
      }
    }, 200);
  }

  render(){
    return (
      <div className="App">
        {!this.state.userAccessToken &&
          <Login
            setUserAccessToken={(token) => this.setState({ userAccessToken: token })} />}
        {this.state.userAccessToken &&
          <WebPlayback
            playerName="Spotify DJ"
            playerInitialVolume={this.state.volume}
            playerAutoConnect={true}
            userAccessToken={this.state.userAccessToken}
            onPlayerReady={(data) => {
              console.log("player ready", data);
              this.selectSpotifyDJ(data.device_id);
            }}
            onPlayerStateChange={(playerState) => {
              this.setState({ playerState: playerState });
            }}
            setError={(message) => {this.setState({userAccessToken: null}); console.log(message)}}>

            <Screen Error>
              <h3>Error</h3>
            </Screen>

            <Screen Loading>
              <h3>Loading Web Playback SDK</h3>
            </Screen>

            <Screen WaitingForDevice>
              <div className='fixed-top'>
                <h1 className='title'>Spotify DJ</h1>
                {this.state.playerState && <h3 className='playlist-title'>{this.state.playerState.context.metadata.context_description}</h3>}
                <p className='author text-muted'>by Matias Kovero</p>
                <h2>Loading...</h2>
                <small className='text-muted'>Waiting for Device to be Selected</small>
              </div>
            </Screen>

            <Screen Player>
              <div className='fixed-top'>
                <h1 className='title'>Spotify DJ</h1>
                {this.state.playerState && <h3 className='playlist-title'>{this.state.playerState.context.metadata.context_description}</h3>}
                <p className='author text-muted'>by Matias Kovero</p>
              </div>
              {this.state.playerState && <Carousel playerState={this.state.playerState} />}
            </Screen>
          </WebPlayback> }
          {this.state.playerState && <Playlist update={this.updatePlayerState} playerState={this.state.playerState} token={this.state.userAccessToken} volume={this.state.volume}/>}
        <br />
      </div>
    );
  }
}

export default App;