import React from 'react';
import Controls from './Controls';
import Slider from './Slider';

const Player = props => {

  var { playerState } = props;
  var { position: position_ms } = playerState;
  var { paused } = playerState;
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
    <div className='row player fixed-bottom'>
      <div className='album-cover'>
        <img src={album_image} alt={track_name} className='d-block' />
      </div>
      <div className='song-info text-left mt-3 mr-3 col-2 col-md-3'>
        <b><a href={album_uri} target='_blank'>{track_name}</a></b>
        <p className='text-muted'><a href={artist_uri} target='_blank' className='text-muted'>{artist_name}</a></p>
        <b>{album_name}</b>
      </div>
      <div className='controls col-md-4'>
        <Controls paused={paused}/>
        <Slider type={'songtime'} songDuration={duration_ms} songPosition={position_ms} />
      </div>
      <div className='volume pt-4 mt-4 col-1'>
        <Slider type={'volume'}/>
      </div>
    </div>
  );
};

export default Player;