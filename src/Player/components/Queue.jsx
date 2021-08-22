import React, { useEffect, useMemo, useState } from 'react'

import Container  from 'react-bootstrap/Container';
import Col        from 'react-bootstrap/Col';
import Analysis   from './Analysis';

const TRY_COUNT_AFTER_ERROR = 3;
const TRY_TIMEOUT_MS = 1000;

/**
 * 
 * @param {Object} props
 * @param {import('../spotify').TrackObject[]} props.queue
 * @param {import('../spotify').AudioAnalysis} props.analysis
 * @param {import('../spotify').PlayerState} props.playerState
 * @param {SpotifyContext} props.api - SpotifyContext
 * @param {Function} props.error - SpotifyContext
 */
const QueueContainer = ({ queue, next_tracks, analysis, playerState, api, error }) => {
  const [ nextAnalysis, updateAnalysis ] = useState(null);

const queue_title = "Seuraavaksi: "; //title for the queue

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

  // When our queue changes!
  useEffect(() => {
    if (!track_queue || !track_queue.length) return;
    // If our 1st track in queue isn't our nextAnalysis object
    if (!nextAnalysis || nextAnalysis.id !== track_queue[0].id) {
      async function update(tries) {
        try {
          let t = await api.audioAnalysis(track_queue[0].id);
          t.id = track_queue[0].id;
          updateAnalysis(t);
        } catch (err) {
          error(`Issues while updating track data.\n ${err.message}`);
          if (tries < TRY_COUNT_AFTER_ERROR) setTimeout(() => update(tries+1), TRY_TIMEOUT_MS);
        }
      }
      update(0);
    }
  }, [ track_queue[0] ]);

  return (
    <Container style={{ display: 'flex', gap: '2em'}}>
      <Col className="track-info-container">
        <div className="queue-list-container">
          <h3 className="queue-title">{queue_title}</h3>
          <div className="queue-list">
            {track_queue ? track_queue.map((track, i) => {
              let smallest_img = track.album.images[track.album.images.length-1];
              let track_name = track.name; //get track name
              let track_artist = track.artists[0].name; //get artist name
              return (
                <div className="queue-item p-2" key={i}>
                  <img className="queue-img" alt="album-img" src={smallest_img.url}></img>
                  <div className="queue-img-shadow"></div>
                  <span className="queue-track-name">{track_name}</span> {/*show track name*/}
                  <p className="queue-artist-name">{track_artist}</p> {/*show artist name*/}
                </div>
              )
            }): null}
          </div>
        </div>
      </Col>
      { analysis.meta && nextAnalysis ? <Analysis playerState={playerState} analysis={analysis} next_track={nextAnalysis} /> : null }
    </Container>
  )
}

export default QueueContainer;