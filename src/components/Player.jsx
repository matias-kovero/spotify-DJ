import React from 'react';
import Controls from './Controls';
import Slider from './Slider';

const Player = props => {

  var { playerState } = props;
  var { position: position_ms } = playerState;
  var { paused, shuffle } = playerState;
  var {
    id,
    uri: track_uri,
    name: track_name,
    duration_ms,
    artists: [{
      name: artist_name,
      uri: artist_uri
    }],
    album: {
      name: album_name,
      uri: album_uri,
      images: [{ url: album_image }]
    }
  } = playerState.track_window.current_track;
  return (
    <div className='row align-items-top player fixed-bottom'>
      <div className='left-bar col-sm row'>
        <div className='album-cover'>
          <img src={album_image} alt={track_name} className='d-block' />
        </div>
        <div className='song-info text-left mt-3 col-sm-6'>
          <b><a href={album_uri} target='_blank'>{track_name}</a></b>
          <p className='text-muted'><a href={artist_uri} target='_blank' className='text-muted'>{artist_name}</a></p>
          <b>{album_name}</b>
        </div>
      </div>
      <div className='center-bar controls col-8'>
        <Controls paused={paused}/>
        <Slider type={'songtime'} songDuration={duration_ms} songPosition={position_ms} />
      </div>
      <div className='right-bar col-sm row'>
        <div className='volume pt-3 mt-3'>
          <Slider type={'volume'}/>
        </div>
      </div>
    </div>
  );
};

export default Player;