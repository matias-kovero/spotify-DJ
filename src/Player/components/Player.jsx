import React, { useEffect, useMemo } from 'react'

import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';

import Slider   from '../components/Slider';
import Controls from '../components/Controls';

const keys  = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const modes = ['Minor', 'Major'];

export default function Player({ playerState, features }) {
  const track = useMemo(() => parseTrack(playerState), [playerState]);

  // Use an effect for updating the title
  useEffect(function updateTitle() {
    window.document.title = `${track.name} · ${track.artists[0].name}`;
  });

  return (
    <Container>
      <div className="songPlayer">
        <Col className="p-0" style={{ height: 'inherit' }}>
          <div className="image-container">
            <img src={track.album.images[0].url} className="vinyl" alt="" crossOrigin="anonymous" />
            <div className="image-shadow" />
          </div>
        </Col>
        <Col xs={6}>
          <div className="trackInfo">
            <p className='text-left mb-0'><b className='song-info'><a href={track.album.uri} target='_blank' rel='noopener noreferrer'>{track.name}</a></b></p>
            <p className='text-muted text-left artist-info'>{track.artists.map((artist, i, arr) => <a href={artist.uri} key={artist.name} target='_blank' rel='noopener noreferrer' className='text-muted'>{arr.length - 1 === i ? artist.name : `${artist.name},`}</a>)}</p>
            <div className='center-bar controls justify-content-center'>
              <Slider type={'songtime'} duration={track.duration_ms} position={playerState.position} />
            </div>
            <Controls paused={playerState.paused} />
          </div>
        </Col>
        <Col xs={4}>
          <div className="track-features">
            <p className="text-left">BPM: {Math.round(features.tempo)} <small> ({features.time_signature}/4)</small></p> 
            <p className="text-left">Key: {keys[features.key]} <small> ({modes[features.mode]})</small></p>
            <p className="text-left">Dance: {Math.round(features.danceability*100)}</p>
            <p className="text-left">Energy: {Math.round(features.energy*100)}</p>
          </div>
        </Col>
      </div>
    </Container>
  )
}

/* HELPER FUNCTIONS */
/**
 * 
 * @param {Object} playerState 
 * @returns {import('../spotify').TrackObject} - Currently playing track
 */
export const parseTrack = (playerState) => {
  if (playerState && playerState.track_window.current_track) {
    return playerState.track_window.current_track;
  } else return null;
}