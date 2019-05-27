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
const Cookie = new Cookies();
class CollectUserAccessToken extends Component {
  render = () => {
    return (
      <div>
        <form onSubmit={() => {
          this.props.setUserAccessToken(this.userInput.value);
          Cookie.set('SPOTIFY_TOKEN', this.userInput.value, {maxAge: 3500});
          }
        }>
          <label>
            <h3>Enter User Access Token</h3>
            <input type="text" name="userAccessToken" ref={(c) => this.userInput = c} onChange={() => {}} />
          </label>
          <button type="submit">Submit</button>
        </form>
        <br />
        <br />
        <a target="_blank" href="https://beta.developer.spotify.com/documentation/web-playback-sdk/quick-start/#authenticating-with-spotify">Get Your Access Token from <strong>Spotify for Developers</strong></a>
      </div>
    );
  }
}

class App extends Component {
  state = {
    userAccessToken: Cookie.get('SPOTIFY_TOKEN') || null,
    playerState: null
  }

  render = () => {
    let {
      userAccessToken,
      playerState
    } = this.state;
    //console.log(playerState);

    return (
      <div className="App">
        <br />
        {!userAccessToken &&
          <CollectUserAccessToken
            setUserAccessToken={(token) => this.setState({ userAccessToken: token })} />}
        {userAccessToken &&
          <WebPlayback
            playerName="Spotify DJ"
            playerInitialVolume={1.0}
            playerAutoConnect={true}
            userAccessToken={userAccessToken}
            onPlayerReady={(data) => console.log("player ready", data)}
            onPlayerStateChange={(playerState) => this.setState({ playerState: playerState })}
            onError={(message) => {console.log(message); this.setState({userAccessToken: null})}}>

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
              {playerState && <Carousel playerState={playerState} />}
              {playerState && <Player playerState={playerState} />}
            </Screen>
          </WebPlayback> }
        <br />
      </div>
    );
  }
}

export default App;