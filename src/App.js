import React, { Component } from 'react';
import { Cookies } from 'react-cookie';
import './App.css';

import Player from './components/Player';
// Add Spotify Web Playback for React
import {
  WebPlaybackScreen as Screen,
  WebPlayback
} from './Spotify/spotify-web-playback.js';
import Carousel from './components/Carousel';
import Login from './components/Login';
const Cookie = new Cookies();

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userAccessToken: Cookie.get('SPOTIFY_TOKEN') || null,
      playerState: null,
      info: '',
    }
    this.spotifyApi = this.spotifyApi.bind(this);
    this.selectSpotifyDJ = this.selectSpotifyDJ.bind(this);
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

  selectSpotifyDJ(deviceID) {
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

  render(){
    return (
      <div className="App">
        <br />
        {!this.state.userAccessToken &&
          <Login
            setUserAccessToken={(token) => this.setState({ userAccessToken: token })} />}
        {this.state.userAccessToken &&
          <WebPlayback
            playerName="Spotify DJ"
            playerInitialVolume={1.0}
            playerAutoConnect={true}
            userAccessToken={this.state.userAccessToken}
            onPlayerReady={(data) => {
              console.log("player ready", data);
              this.selectSpotifyDJ(data.device_id);
            }}
            onPlayerStateChange={(playerState) => {
              this.setState({ playerState: playerState });
            }
            }
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
              <h1>Spotify DJ</h1>
              {this.state.playerState && <Carousel playerState={this.state.playerState} />}
              {this.state.playerState && <Player playerState={this.state.playerState} />}
            </Screen>
          </WebPlayback> }
        <br />
      </div>
    );
  }
}

export default App;