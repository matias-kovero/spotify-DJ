import React, { useContext, useEffect, useState } from 'react';
import {
  WebPlaybackScreen as Screen,
  WebPlayback
} from './Spotify/spotify-web-playback.js';
import './App.css';
import AuthContext  from './SpotifyContext/SpotifyContext';
import { Header, Player, PlayerSkeleton } from './Player';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';

const App = () => {
  const context = useContext(AuthContext);

  const [ player, updatePlayer ] = useState(null);
  const [ error, setError ] = useState(null);

  useEffect(() => {
    async function fetchData() {
      //
    }
    fetchData();
  }, [ error, context ]);

  return (player || context.auth_token) ? (
    <Container>
      <Header player={player} />
      <WebPlayback
        playerName="Testing Player"
        playerInitialVolume={1}
        playerAutoConnect={true}
        getAccessToken={context.getToken}
        onPlayerReady={(data) => {
          console.log(`[Player] Ready`);
          // Automatically select our player
          context.selectDevice(data.device_id);
        }}
        onPlayerStateChange={(playerState) => {
          // Update our players state!!
          updatePlayer(playerState);
        }}
        setError={(message) => {
          console.log('WebPlayback Error:', message);
          setError(message);
        }}
      >
        <Screen Error>
          <h3>Error</h3>
        </Screen>
        <Screen Loading>
          <h3>Loading Web Playback SDK</h3>
        </Screen>
        <Screen WaitingForDevice>
          <PlayerSkeleton 
            text="Waiting for device to be selected" 
            info={"If you are stuck here, open spotify and from devices select Spotify DJ."} 
          />
        </Screen>
        <Screen Player>
          <Player playerState={player} api={context} />
        </Screen>
      </WebPlayback>
    </Container>
  ) : (
    <>
    <Header />
    { ErrorMessage(context) }
    </>
  );
};

function ErrorMessage(context) {

  return (context.code) ? (
    <PlayerSkeleton />
  ) : (
    <div className="pt-4 text-center">
      <p>You need to login to use this service</p>
      <Button 
        variant="success"
        style={{ borderRadius: '2rem', padding: '.5rem 3rem .6rem 3rem' }}
        onClick={async() => await context.authorizeUser()}>
      Login with Spotify
      </Button>
    </div>
  )
}

export default App;