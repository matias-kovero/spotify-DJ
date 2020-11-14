import React from 'react';
import RangeSlider from 'react-rangeslider';

export default function Slider({ position, duration }) {

  // TODO: Don't allow user to spam this, as the API has a rate limit.
  const seek = (value) => {
    console.log(value);
    window.Spotify.PlayerInstance.seek(value).then(() => {
    });
  }

  return (
    <div className="justify-content-md-center">
      <RangeSlider 
        step={0.05}
        value={position}
        min={0}
        max={duration}
        onChange={seek}
      />
      <small className='time float-left'>{msToMinSec(position)}</small>
      <small className='time float-right'>{msToMinSec(duration)}</small>
    </div>
  )
}

/* HELPER FUNCTIONS */
export function msToMinSec(ms) {
  let min = Math.floor(ms / 60000);
  let sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}