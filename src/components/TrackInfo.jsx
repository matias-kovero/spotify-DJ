import React, { useEffect, useState } from 'react';

const keys  = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const modes = ['Minor', 'Major'];

const analyzeTrack = async (token, id) => {
  const headers = { Authorization: `Bearer ${token}`};
  /**
   * First gets tracks audio features.
   */
  const endpoint = `https://api.spotify.com/v1/audio-features/${id}`;

  let features = await fetch(endpoint, { method: "GET", headers: headers });

  let featuresJson = await features.json();
  /**
   * Then check for analysis_url, and fetch tracks audio analysis.
   */
  let analysis = await fetch(featuresJson.analysis_url, { method: "GET", headers: headers });
  let analysisJson = await analysis.json();
  /**
   * {bars, beats, meta, sections, segments, tatums, track }
   */
  return featuresJson;
}

/**
 * 
 * @param {Object} track 
 * @returns {AudioAnalysisObject}
 */
const parseTrack = (track) => {
  if (!track) return;
  return { ...track };
}

const TrackInfo = ({ track_id, token }) => {
  const [ track, updateTrack ] = useState(parseTrack());

  useEffect(() => {
    if (!track_id || !token) return;
    async function fetchData() {
      let res = await analyzeTrack(token, track_id);
      updateTrack(parseTrack(res));
    };
    fetchData();
  }, [ track_id, token ]);
  /**
   * 
   * @param {AudioFeatures} e 
   */
  const render = (e) => {
    if(!e) {
      return(<div>Undefined track.</div>)
    } else {
      return(
      <div>BPM: {Math.round(e.tempo)} <small>({e.time_signature}/4)</small>, Key: {keys[e.key]}, Mode: {modes[e.mode]}, Dance: {Math.round(e.danceability*100)}, Energy: {Math.round(e.energy*100)}</div>
      )
    }
  }

  return(
    <div className="col-xl-8 col-lg-10 col-md-12">
      <div className="track-info-container">
        { render(track) }
      </div>
    </div>
  )
}

export default TrackInfo;