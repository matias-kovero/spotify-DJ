import React from 'react';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

export default function Controls({ paused }) {

  const togglePause = () => {
    paused ?  window.Spotify.PlayerInstance.resume() : window.Spotify.PlayerInstance.pause();
  }

  return (
    <Col className="control-buttons mt-3">
      <Button variant="link" className="fa-1x">
        <i className="fas fa-backward" onClick={() => window.Spotify.PlayerInstance.previousTrack()} />
      </Button>
      <Button variant="link">
        <i className={paused ? 'far fa-play-circle fa-3x' : 'far fa-pause-circle fa-3x'} onClick={() => togglePause()} />
      </Button>
      <Button variant="link" className='fa-1x'>
        <i className="fas fa-forward" onClick={() => window.Spotify.PlayerInstance.nextTrack()} />
      </Button>
    </Col>
  )
}