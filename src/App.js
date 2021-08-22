import React, { useContext, useEffect, useState } from 'react';
import {
  WebPlaybackScreen as Screen,
  WebPlayback
} from './Spotify/spotify-web-playback.js';
import './App.css';
import AuthContext  from './SpotifyContext/SpotifyContext';
import { Header, Player, Toast, PlayerSkeleton } from './Player';
import { SideMenu } from './Menu';
import Button     from 'react-bootstrap/Button';
import Container  from 'react-bootstrap/Container';

const App = () => {
  const context = useContext(AuthContext);

  const [ player, updatePlayer ] = useState(null);
  const [ error, setError ] = useState(null);
  const [ show, setShow ] = useState(false);

  useEffect(() => {
    async function fetchData() {
      //
    }
    fetchData();
  }, [ error, context ]);

  function createErrorPopup(message) {
    console.log(`[ERROR] ${message}`)
    setError(message);
    setShow(true);
  }

  return (player || context.auth_token) ? (
    <Container>
      <Header player={player} />
      <Toast 
        show={show} 
        delay={5000} 
        title={'Error'} 
        text={error}
        onClose={() => setShow(false)} 
      />
      <WebPlayback
        playerName="Spotisaab"
        playerInitialVolume={localStorageVolume()}
        playerAutoConnect={true}
        getAccessToken={context.getToken}
        onPlayerReady={(data) => {
          console.log(`[Player] Ready`);
          // Automatically select our player
          try {
            context.selectDevice(data.device_id);
          } catch (err) {
            createErrorPopup(err);
          }
        }}
        onPlayerStateChange={(playerState) => {
          // Update our players state!!
          updatePlayer(playerState);
        }}
        setError={(message) => {
          // Quick fix to inform users they have incompatible device.
          if (message === 'Failed to initialize player') { 
            message += "\r\nThis device isn't supported, sorry."
          }
          //console.log('WebPlayback Error:', message);
          createErrorPopup(message);
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
            info={"If you are stuck here, open spotify and from devices select Spotisaab."} 
          />
        </Screen>
        <Screen Player>
          {/*<SideMenu />*/}
          <Player playerState={player} api={context} error={createErrorPopup} />
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

/** HELPER FUNCTIONS */

/**
 * Checks users playback info from localStorage.
 * If nothing is found, we create a playback object with default volume: 0.5
 * @returns {Number} playback volume
 */
const localStorageVolume = () => {
  // Check if user has playback object with volume key.
  let playback = JSON.parse(localStorage.getItem('playback'));
  if (playback && !isNaN(playback.volume)) return playback.volume;
  else {
    let settings = { volume: 0.5 };
    localStorage.setItem('playback', JSON.stringify(settings));
    return settings.volume;
  }
}