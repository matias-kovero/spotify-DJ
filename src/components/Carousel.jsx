import React from 'react';
import Controls from './Controls';
import Slider from './Slider';

const Carousel = props => {

  var { playerState } = props;
  var { paused } = playerState;
  var { position: position_ms } = playerState;
  var {
    //uri: track_uri,
    name: track_name,
    duration_ms,
    artists: [{
      name: artist_name,
      //uri: artist_uri
    }],
    album: {
      //name: album_name,
      uri: album_uri,
      images: [{ url: album_image }]
    }
  } = playerState.track_window.current_track;
  //var featureArtist = playerState.track_window.current_track.artists.map(artist => ', ' + artist.name);
  //featureArtist.shift();
  // Change title
  window.document.title = track_name + ' · ' + artist_name;

  return (
    <div className="col-xl-8 col-lg-10 col-md-12">
      <div className='songPlayer'>
        <div className="image-container">
          <img src={album_image} className={`vinyl ${paused ? 'paused' : 'playing'}`} alt="..." crossOrigin='anonymous' />
          <div className="image-shadow"></div>
        </div>
        <div className='trackInfo col-6'>
          <p className='text-left mb-0'><b className='song-info'><a href={album_uri} target='_blank' rel='noopener noreferrer'>{track_name}</a></b></p>
          <p className='text-muted text-left artist-info'>{playerState.track_window.current_track.artists.map((artist, i, arr) => <a href={artist.uri} key={artist.name} target='_blank' rel='noopener noreferrer' className='text-muted'>{arr.length - 1 === i ? artist.name : artist.name+','}</a>)}</p>
          <div className='center-bar controls justify-content-center'>
            <Slider type={'songtime'} songDuration={duration_ms} songPosition={position_ms} />
          </div>
          <Controls paused={paused}/>
        </div>
      </div>
    </div>
  );
};

export default Carousel;