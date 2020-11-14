import React, { useMemo } from 'react'
import Container from 'react-bootstrap/Container';

/**
 * 
 * @param {Object} props
 * @param {import('../spotify').TrackObject[]} props.queue
 */
const QueueContainer = ({ queue, next_tracks }) => {
  // 3AM function
  const track_queue = useMemo(() => {
    // if user has own queue, show them 1st, then next_tracks | Currently won't show next_tracks as it's overwritten by added songs.
    if (queue) {
      let added = [...queue, ...next_tracks];
      return added.filter((v,i,a) => a.findIndex(t=>(t.id === v.id))===i);
    } else { // User has no queue, should we show only spotifys provided next_tracks?
      return next_tracks;
    }
  }, [queue, next_tracks]);

  return (
    <Container>
      <div className="track-info-container">
        <div className="queue-list">
          {track_queue ? track_queue.map((track, i) => {
            let smallest_img = track.album.images[track.album.images.length-1];
            return (
              <div className="queue-item p-2" key={i}>
                <img className="queue-img" alt="album-img" src={smallest_img.url}></img>
                <div className="queue-img-shadow"></div>
              </div>
            )
          }): null}
        </div>
      </div>
    </Container>
  )
}

export default QueueContainer;