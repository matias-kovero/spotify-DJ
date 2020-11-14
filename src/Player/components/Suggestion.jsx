import React, { useMemo } from 'react';
import Row from 'react-bootstrap/Row';

/**
 * 
 * @callback onAdd
 * @param {TrackObject} track - Spotify Track Object
 */

/**
 * 
 * @param {Object} props
 * @param {Array} props.data - Track information
 * @param {String[]} props.queue - Player queue
 * @param {onAdd} props.onAdd - Adds an track to the queue
 */
const Suggestion = ({ data, queue, onAdd }) => {
  //const [track, updateTrack ] = useState(parseTrack());
  const track = useMemo(() => data, [data]);
  /*
  useEffect(() => {
    updateTrack(parseTrack(data));
  }, [ data ]);*/

  /**
   * 
   * @param {TrackObject} track 
   */
  const renderElement = (track) => {
    if (!track) {
      return (
        <div>No track found</div>
      )
    } else {
      let smallest_img = track.album.images[track.album.images.length-1];

      return(
        <Row className="track-suggestion justify-content-between">
        
          <div className="col-auto p-0" style={{marginLeft: '-1px'}}>
            <img className="suggestion-image" src={smallest_img.url || ''} alt=""/>
          </div>
          <div className="track-info col">
            <p className='text-left mb-0' style={{position: 'relative', top: '0.2em'}}>
              <b className='song-info'>
                <a href={track.uri} target='_blank' rel='noopener noreferrer'>{track.name}</a>
              </b>
            </p>
            <p className='text-muted text-left artist-info'>
              {track.artists.map((artist, i, arr) => 
                <a href={artist.uri} key={artist.name} target='_blank' rel='noopener noreferrer' className='text-muted'>
                  {arr.length - 1 === i ? artist.name : artist.name+','}
                </a>
              )}
            </p>
          </div>
          <div className="additional-info col-3">
            <div className="track-buttons">
              <div className='btn fa-1x'>
                { queue.some(q => q.id === track.id)  ? <i className="fas fa-plus" style={{color: '#0a0a0a47', cursor: 'default'}}/> : 
                  <i className="fas fa-plus" onClick={() => onAdd(track)} />
                }
              </div>
            </div>
            <div>
              <span role="img" aria-label="popularity">🔥</span> {track.popularity}
            </div>
          </div>
        </Row>
      )
    }
  }
  return (
    <>
      { renderElement(track) }
    </>
  )
}

export default Suggestion;