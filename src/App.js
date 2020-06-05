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

const updateBg = (nColor, root) => {
  let regex = new RegExp(/^rgba\(([^,]+),([^,]+),([^,]+),([^,]+)\)$/);
  let bg = root.style.backgroundColor;
  if(!bg) bg = 'rgba(109,109,109,0.56)'; // Fallback
  let oColor = regex.exec(bg);
  oColor.shift();
  oColor = oColor.map(color => parseInt(color));
  let rDiff = parseInt(nColor[0]) - oColor[0]; //  50
  let gDiff = parseInt(nColor[1]) - oColor[1]; // -60
  let bDiff = parseInt(nColor[2]) - oColor[2]; // -20
  let opr = {
    r: Math.sign(rDiff) !== 1 ? false : true,
    g: Math.sign(gDiff) !== 1 ? false : true,
    b: Math.sign(bDiff) !== 1 ? false : true,
    rMax: Math.abs(rDiff),
    gMax: Math.abs(gDiff),
    bMax: Math.abs(bDiff)
  };
  let counter = Math.max(opr.rMax, opr.gMax, opr.bMax) + 1;
  for(let i = 1; i < counter; i++) {
    setTimeout(() => {
      let rCurr = opr.r ? oColor[0] + i : oColor[0] - i;
      let gCurr = opr.g ? oColor[1] + i : oColor[1] - i;
      let bCurr = opr.b ? oColor[2] + i : oColor[2] - i;
      if(i > opr.rMax) rCurr = opr.r ? oColor[0] + opr.rMax : oColor[0] - opr.rMax;
      if(i > opr.gMax) gCurr = opr.g ? oColor[1] + opr.gMax : oColor[1] - opr.gMax;
      if(i > opr.bMax) bCurr = opr.b ? oColor[2] + opr.bMax : oColor[2] - opr.bMax;
      root.style.backgroundColor = `rgba(${rCurr},${gCurr},${bCurr},0.3)`;
    }, i* 25);
  }
  // Every loop go x closer to the end value
  // 100, 100, 100 -> 150, 50, 80
  // 110, 90, 90
  // 120, 80, 80

}

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
        updateBg(dc, root);
      }
    }, 300);
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