import React from 'react';

const keys  = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const modes = ['Minor', 'Major'];

/**
 * Display AudioFeatures of current track.
 * @param {Object} param Object props
 * @param {AudioFeatures} param.features 
 */
const TrackInfo = ({ features }) => {

  return (
    <div className="col-xl-8 col-lg-10 col-md-12">
      <div className="track-info-container">
        <div>
          BPM: {Math.round(features.tempo)} 
          <small> ({features.time_signature}/4)</small>, 
          Key: {keys[features.key]} 
          <small> ({modes[features.mode]})</small> | 
          Dance: {Math.round(features.danceability*100)}, 
          Energy: {Math.round(features.energy*100)}
        </div>
      </div>
    </div>
  )
}

export default TrackInfo;