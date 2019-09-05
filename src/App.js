import React, { Component } from 'react';
import { Cookies } from 'react-cookie';
import './App.css';
import ColorThief from '../node_modules/colorthief/dist/color-thief.mjs';

import Player from './components/Player';
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
      userAccessToken: Cookie.get('SPOTIFY_TOKEN') || null,
      playerState: null,
      info: '',
      volume: 1.0,
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
        'Authorization': 'Bearer ' + Cookie.get('SPOTIFY_TOKEN')
      }
    }).then((response) => {
      if(response.status == 200){
        response.json().then((responseJson) => {
          console.log(responseJson);
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
    console.log('Updated volume', newVolume);
    this.setState(prevState => ({...prevState, volume: newVolume}))
  }

  selectSpotifyDJ(deviceID) {
    console.log(deviceID);
    fetch('https://api.spotify.com/v1/me/player', {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json',
        'Authorization': 'Bearer ' + Cookie.get('SPOTIFY_TOKEN')
      },
      body: JSON.stringify({
        "device_ids":[
          deviceID
        ]
      })
    }).then((response) => {
      if(response.status == 200){
        response.json().then((responseJson) => {
          console.log(responseJson);
        }).catch(err => {
          console.log(err.name + ' | ' + err.message);
        });
      } else {
        console.log('Response status: ', response.status)
        console.log(response);
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
    console.log('Song changed?');
    setTimeout(() => {
      let root = document.getElementById('root');
      let album_cover = document.getElementsByClassName('album-cover')[0];
      let dc = colorThief.getColor(album_cover.querySelector('img'));
      root.style.backgroundColor = 'rgba('+dc[0]+','+dc[1]+','+dc[2]+',0.2)';
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
            setError={(message) => {console.log(message); this.setState({userAccessToken: null})}}>

            <Screen Error>
              <h3>Error</h3>
            </Screen>

            <Screen Loading>
              <h3>Loading Web Playback SDK</h3>
            </Screen>

            <Screen WaitingForDevice>
              <h3>Waiting for Device to be Selected</h3>
            </Screen>

            <Screen Player>
              <h1 className='title fixed-top'>Spotify DJ</h1>
              {this.state.playerState && <Carousel playerState={this.state.playerState} />}
              {this.state.playerState && <Player playerState={this.state.playerState} updateVolume={this.updateVolume} volume={this.state.volume}/>}
            </Screen>
          </WebPlayback> }
          {this.state.playerState && <Playlist update={this.updatePlayerState} playerState={this.state.playerState} token={this.state.userAccessToken} volume={this.state.volume}/>}
        <br />
      </div>
    );
  }
}

export default App;