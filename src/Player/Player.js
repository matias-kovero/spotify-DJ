import React, { useEffect, useMemo, useState } from 'react';

import ColorThief from '../../node_modules/colorthief/dist/color-thief.mjs';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

// New components
import Player       from './components/Player';
import TrackInfo    from './components/TrackInfo';
import Suggestions  from './components/SuggestionContainer';
import Queue        from './components/Queue';

const colorThief = new ColorThief();
const TRY_COUNT_AFTER_ERROR = 5;
const TRY_TIMEOUT_MS = 5000;

/**
 * Wrapper element to our Spotify Web Player.
 * @param {Object} props - Component properties
 * @param {Object} props.playerState - Spotify Web Playback State 
 * @param {SpotifyContext} props.api - SpotifyContext
 * @param {Function} props.error - SpotifyContext
 */
const PlayerContainer = ({ playerState, api, error }) => {
  const track = useMemo(() => getCurrent(playerState), [playerState]);
  const next_tracks = useMemo(() => getQueue(playerState), [playerState]);
  const [ localQueue, updateQueue ] = useState(initQueue('spotify_queue'));

  const [ features, setFeatures ] = useState({});
  const [ analysis, setAnalysis ] = useState({});
  const [ recom, setRecom ] = useState({});

//#region TrackChange
  useEffect(() => {
    if (!track) return;
    changeBackgroundColor();
    async function updateStates(tries) {
      try {
        let [f, a, r] = [ 
          await api.audioFeatures(track), 
          await api.audioAnalysis(track), 
          await api.recommendations({seed_tracks: track})
        ];
        setFeatures(f); setAnalysis(a); setRecom(r);
      } catch (err) {
        error(`Issues while updating track data.\n ${err.message}`);
        if (tries < TRY_COUNT_AFTER_ERROR) setTimeout(() => updateStates(tries+1), TRY_TIMEOUT_MS);
      }
    }
    updateStates(0);
    return () => {
      // Clean up the shizz
    }
  }, [ track, api ]); // When track changes, or context updates. Ex. Will update if context updates tokens!
//#endregion
  
//#region QueueChange
  useEffect(() => {
    if (!track || (!localQueue.length)) return;
    // ######### START OF LOCAL QUEUE
    if (localQueue[0].id === track) {
      let newQueue = localQueue;
      newQueue.shift();
      updateQueue([...newQueue]);
      localStorage.setItem('spotify_queue', JSON.stringify(newQueue));
    }
    // ######### END OF LOCAL QUEUE
  }, [ track, localQueue ]);
//#endregion

  const addQueue = (qued_track) => {
    async function add() {
      let newQueue = [...localQueue, { id: qued_track.id, album: { images: [qued_track.album.images.slice(-1).pop()] } }];
      updateQueue([...newQueue]);
      localStorage.setItem('spotify_queue', JSON.stringify(newQueue));

      // USE CONTEXT API, SEND TRACK TO SPOTIFY QUEUE
      await api.queueTrack(qued_track.uri);
    }
    add();
  }

  const render = (playerState) => {
    if (!playerState) {
      return <PlayerSkeleton text={"Unable to load player. Please check connection."} />
    }
    // TODO: Update these Components
    return (
      <>
        <Row className="pb-4">
          <Player playerState={playerState} features={features} />
        </Row>
        <Row className="pb-4">
          <Queue queue={localQueue} next_tracks={next_tracks} analysis={analysis} playerState={playerState} api={api} error={error} />
        </Row>
        {/*
        <div className="row justify-content-center pb-4">
          <TrackInfo features={features} />
        </div>*/}
        <Row className="pb-4">
          <Suggestions recom={recom} queue={localQueue} addQueue={addQueue} />
        </Row>
      </>
    )
  }

  return (
    render(playerState)
  )
}

export default PlayerContainer;

/**
 * PlayerSkeleton to provide better UX
 */
/**
 * 
 * @param {Object} props
 * @param {String} props.text - Text to display on the skeleton.
 * @param {String} props.info - Additional text for the skeleton. 
 */
export const PlayerSkeleton = ({text, info}) => {
  return (
    <Row className="justify-content-center pb-4">
      <Container>
        <div className='songPlayer'>
          <Col className="trackInfo">
            <p className='mb-0'>
              <b className='song-info'>{text}</b></p>
              <p className='text-muted artist-info'>{info}</p>
          </Col>
        </div>
      </Container>
  </Row>
  )
}

/**
 * Helper functions
 */
// When our track changes, fire this function
export const changeBackgroundColor = () => {
  function setBg(root, dc, alpha) {
    root.style.transition = "background-color 5.5s cubic-bezier(0.39, 0.58, 0.57, 1) 0s";
    if (!dc) return;
    root.style.backgroundColor = `rgba(${dc[0]},${dc[1]},${dc[2]}, ${alpha})`;
    /**
     * Radial gradient does not support fading yet.
     * So we are sticking to plain old background.
     */

    // This is needed to add on a seperate element acting as background!!
    /*
    root.style.opacity = 0;
    root.style.transition = "opacity 5.5s cubic-bezier(0.39, 0.58, 0.57, 1) 0s";
    root.style.background = `radial-gradient(
      farthest-side at top left,
      rgba(148, 148, 148, 0.12), 
      transparent
    ),
    radial-gradient(
      farthest-corner at bottom right,
      rgba(255, 50, 50, 0.5), 
      rgba(${dc[0]},${dc[1]},${dc[2]}, ${alpha}) 400px
    )`;
    root.style.opacity = 1;
    */
  }
  setTimeout(() => {
    let root = document.getElementById('root');
    let album_cover = document.getElementsByClassName('songPlayer')[0];
    if(album_cover) {
      let img = album_cover.querySelector('img');
      if (img.complete) {
        let dc = colorThief.getColor(img);
        setBg(root, dc, 0.2);
      } else {
        img.addEventListener('load', () => {
          let dc = colorThief.getColor(img);
          setBg(root, dc, 0.2);
        });
      }
    }
  }, 300);
}

const getCurrent = (playerState) => {
  if(playerState && playerState.track_window.current_track) {
    return playerState.track_window.current_track.id;
  } else return null;
}

const getQueue = (playerState) => {
  if ( playerState && playerState.track_window.next_tracks) {
    return playerState.track_window.next_tracks;
  } else return [];
}

/**
 * If user had queue saved, load it from localStorage.
 */
const initQueue = (name) => {
  let queue = JSON.parse(localStorage.getItem(name));
  return queue ? queue : [];
}