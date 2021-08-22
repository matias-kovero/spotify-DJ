import React, { useEffect, useMemo } from 'react'

import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';

import Slider   from '../components/Slider';
import Controls from '../components/Controls';
import Image    from '../components/ImageTransition';

const keys  = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const modes = ['Minor', 'Major'];

/**
 * 
 * @param {Object} props
 * @param {import('../spotify').PlayerState} props.playerState - Spotify Web Playbackstate 
 * @param {import('../spotify').AudioFeatures} props.features - Current tracks audioFeatures
 */
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
            <Image current={track} />
            <div className="image-shadow" />
          </div>
        </Col>
        <Col xs={6}>
          <div className="trackInfo">
            <div className="track-text-info ellipsis-one-line">
              <div className="track-name ellipsis-one-line">
                <span draggable="true">
                  <a href={track.album.uri} target='_blank' rel='noopener noreferrer' className="bolder-text">{track.name}</a>
                </span>
              </div>
              <div className="artist-names ellipsis-one-line">
                {track.artists.map((artist, i, arr) => 
                  <span key={i} draggable="true">
                    <a href={artist.uri} target='_blank' rel='noopener noreferrer' className='text-muted'>{i === 0 ? artist.name : `, ${artist.name}`}</a>
                  </span>
                )}
              </div>
            </div>
            <div className='center-bar controls justify-content-center'>
              <Slider type={'songtime'} duration={track.duration_ms} position={playerState.position} />
            </div>
            <Controls paused={playerState.paused} />
          </div>
        </Col>
        <Col xs={4}>
          {/*<div className="track-features text-muted">
            <div style={{ display:'flex', gap: '1em'}}>
              <div>
                <span role="img" aria-label="BPM">🎚</span> {Math.round(features.tempo)} <small>({features.time_signature}/4)</small>
              </div>
              <div>
                <span role="img" aria-label="Key">🎹</span> {keys[features.key]} <small>({modes[features.mode]})</small>
              </div>
            </div>
            <div style={{ display:'flex', gap: '1em'}}>
              <div>
                <span role="img" aria-label="Dance">🕺</span> {Math.round(features.danceability*100)} 
              </div>
              <div>
                <span role="img" aria-label="Energy">⚡</span> {Math.round(features.energy*100)} 
              </div>
            </div>
          </div>*/}
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