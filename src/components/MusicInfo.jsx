import React, { useEffect, useState } from 'react';
import qs from 'querystring';

import Suggestion from './SuggestionInfo';

const getRecomendations = async (token, id) => {
  const endpoint = 'https://api.spotify.com/v1/recommendations';
  const params = { 'seed_tracks': id };

  let response = await fetch(`${endpoint}?${qs.stringify(params)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  let responseJson = await response.json();
  return responseJson.tracks;
}

const addToQueue = async (token, uri) => {
  const endpoint = 'https://api.spotify.com/v1/me/player/queue';
  const params = { 'uri': uri };

  return await fetch(`${endpoint}?${qs.stringify(params)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

const MusicInfo = ({ track_id, token, playerState }) => {
  const [ data, updateData ] = useState(null);
  const [ localQueue, updateLocalQueue] = useState([]);

  useEffect(() => {
    if(!token) return;
    async function fetchData() {
      // You can await here
      let results = await getRecomendations(token, track_id);
      updateData(results);
    }
    fetchData();
  }, [ track_id, token ]);

  // This is looped all the time!!
  if (localQueue.indexOf(playerState.track_window.current_track.uri) === 0) {
    localQueue.shift();
    updateLocalQueue([...localQueue]);
  }

  const onButtonClick = (uri) => {
    async function trigger() {
      await addToQueue(token, uri);
      updateLocalQueue([...localQueue, uri]);
    }
    trigger();
  }

  return (
    <div className="col-xl-8 col-lg-10 col-md-12">
      <div className="suggestions-container">
        { data ? <small className="text-muted light-text">{`Suggested tracks. Tracks in queue: ${localQueue.length}`}</small> : null }
        <div className="suggested-tracks-container">
          { data ? data.slice(0, 10).map((track, i) => {
            return (
              <Suggestion key={i} data={track} addToQueue={onButtonClick} queue={playerState.track_window.next_tracks} localQueue={localQueue} />
            )
          }) : null}
        </div>
      </div>
    </div>
  )
}

export default MusicInfo;