import React, { useEffect, useMemo, useState } from 'react';

import ColorThief from '../../node_modules/colorthief/dist/color-thief.mjs';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

// New components
import Player       from './components/Player';
import TrackInfo    from './components/TrackInfo';
import Suggestions  from './components/SuggestionContainer';
import Queue        from './components/Queue';

const colorThief = new ColorThief();

const getCurrent = ({ playerState }) => {
  if(playerState && playerState.track_window.current_track) {
    return playerState.track_window.current_track.id;
  } else return null;
}

const getQueue = ({ playerState }) => {
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

/**
 * Wrapper element to our Spotify Web Player.
 * @param {Object} props - Component properties
 * @param {Object} props.playerState - Spotify Web Playback State 
 * @param {SpotifyContext} props.api - SpotifyContext
 */
const PlayerContainer = (props) => {
  const track = useMemo(() => getCurrent(props), [props]);
  const next_tracks = useMemo(() => getQueue(props), [props]);
  const [ localQueue, updateQueue ] = useState(initQueue('spotify_queue'));

  const [ features, setFeatures ] = useState({});
  const [ analysis, setAnalysis ] = useState({});
  const [ recom, setRecom ] = useState({});

//#region TrackChange
  // Props.api will change when context updates tokens! -> Will re-render
  useEffect(() => {
    if (!track) return;

    async function updateStates() {
      let [f, a, r] = [await props.api.audioFeatures(track), await props.api.audioAnalysis(track), await props.api.recommendations({seed_tracks: track})];
      setFeatures(f); setAnalysis(a); setRecom(r);
      //console.log(f, a, r);
    }
    updateStates();
    // Update bg
    changeBackgroundColor();
  }, [ track, props.api ]);
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
      // #### LOCAL QUEUE CODEBLOCK START
      console.log(localQueue);
      let newQueue = [...localQueue, { id: qued_track.id, album: {images: [qued_track.album.images.slice(-1).pop()] }}];
      updateQueue([...newQueue]);
      localStorage.setItem('spotify_queue', JSON.stringify(newQueue));
      // #### LOCAL QUEUE CODEBLOCK END

      // USE CONTEXT API, SEND TRACK TO SPOTIFY QUEUE
      await props.api.queueTrack(qued_track.uri);
    }
    add();
  }

  const render = ({ playerState }) => {
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
          <Queue queue={localQueue} next_tracks={next_tracks} />
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
    render(props)
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
      <Col md={12} lg={10} xl={8}>
        <div className='songPlayer'>
          <Col className="trackInfo">
            <p className='mb-0'>
              <b className='song-info'>{text}</b></p>
              <p className='text-muted artist-info'>{info}</p>
          </Col>
        </div>
      </Col>
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