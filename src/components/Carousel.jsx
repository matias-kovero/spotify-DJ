import React from 'react';

const Carousel = props => {

  var { playerState } = props;
  var { paused } = playerState;
  var {
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
  var featureArtist = playerState.track_window.current_track.artists.map(artist => ', ' + artist.name);
  featureArtist.shift();
  // Change title
  window.document.title = track_name + ' · ' + artist_name;
  var {
    prev_artist_name,
    prev_artist_uri,
    prev_album_name,
    prev_album_uri,
    next_artist_name,
  } = '';
  var prev_album_image = '/unknown.png', next_album_image = '/unknown.png';
  try { 
    if(!paused) {
      if(playerState.track_window.previous_tracks.length >  0) {
        var {
          name: prev_track_name,
          artists:[{
            name: prev_artist_name,
            uri: prev_artist_uri
          }],
          album: {
            name: prev_album_name,
            uri: prev_album_uri,
            images: [{ url: prev_album_image }]
          }
        } = [...playerState.track_window.previous_tracks].pop();
      }
      if(playerState.track_window.next_tracks.length > 0) {
        var {
          name: next_track_name,
          artists:[{
            name: next_artist_name,
          }],
          album: {
            images: [{url: next_album_image}]
          }
        } = playerState.track_window.next_tracks[0];
      }
    }
  } catch(err) {
    console.log(err.message);
  }
  // onClick={() => window.Spotify.PlayerInstance.previousTrack()}
  return (
    <div className='container pt-5'>
      <div className='row justify-content-md-center pt-5'>
        <div className='col col-lg-2 pt-5' onClick={() => window.Spotify.PlayerInstance.previousTrack()}>
          <img src={prev_album_image} className="d-block w-100" alt="..." />
          <p className='text-muted'>{prev_track_name}</p>
        </div>
        <div className='col-md-auto'>
          <div id="carouselExampleFade" className="carousel slide carousel-fade" data-ride="carousel" data-interval={false}>
            <div className="carousel-inner">
              <div className="carousel-item">
                <img src={prev_album_image} className="d-block w-100" alt="..." />
              </div>
              <div className="carousel-item active">
                <img src={album_image} className="d-block w-100" alt="..."/>
                <p className='mb-0'>{track_name}</p>
                <p className='text-muted'>{artist_name}{featureArtist}</p>
              </div>
              <div className="carousel-item">
                <img src={next_album_image} className="d-block w-100" alt="..."/>
              </div>
            </div>
            <b className="carousel-control-prev" style={{height: '82%'}} role="button"  onClick={() => window.Spotify.PlayerInstance.previousTrack()}>
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="sr-only">Previous</span>
            </b>
            <b className="carousel-control-next" style={{height: '82%'}} role="button" onClick={() => window.Spotify.PlayerInstance.nextTrack()}>
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="sr-only">Next</span>
            </b>
          </div>
        </div>
        <div className='col col-lg-2 pt-5' onClick={() => window.Spotify.PlayerInstance.nextTrack()}>
          <img src={next_album_image} className="d-block w-100" alt="..." />
          <p className='text-muted'>{next_track_name}</p>
        </div>
      </div>
    </div>
  );
};

export default Carousel;