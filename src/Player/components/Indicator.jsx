import React, { useEffect, useState } from 'react'

/**
 * This flashing dot, is set to indicate the different beats Spotify API gives to the user.
 * 
 * @param {Object} props
 * @param {Number} props.value - When this value changes, the indicator blinks.
 * @param {Boolean} props.fast - If true, blink will last 200ms, else it will last for 500ms 
 */
export default function Indicator({ value, fast }) {
  const [ bg, setBg ] = useState('');

  useEffect(() => {
    if (!value) return;
    setBg(fast ? 'fade-indicator-fast' : 'fade-indicator');
    setTimeout(() => setBg(''), fast ? 200 : 500);
  }, [value]);

  return (
    <span className={bg} style={{padding: '.5em', borderRadius: '50%', display: 'inline-block', marginLeft: '0.3em'}}></span>
  )
}