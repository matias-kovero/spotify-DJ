import React, { useEffect, useState } from 'react'
import Indicator from './Indicator';
import Col from 'react-bootstrap/Col';

/**
 * This flashing dot, is set to indicate the different beats Spotify API gives to the user.
 * 
 * @param {Object} props
 * @param {import('../spotify').PlayerState} props.playerState - Spotify Web Playbackstate
 * @param {import('../spotify').AudioAnalysis} props.analysis - Spotify Track Analysis of the current track
 * @param {import('../spotify').AudioAnalysis} props.next_track - Spotify Track Analysis of the next track
 */
export default function AnalysisContainer({ playerState, analysis, next_track }) {
  const [ fading, setFading ] = useState(false);
  const [ volume, setVolume ] = useState(localStorageVolume());

  useEffect(() => {
    if (!analysis) return;
    // Check that if our player is over 5 sec, it should not fade volume anymore.
    if (playerState.position < 5000 && fading) { 
      setFading(false);
      setVolume(localStorageVolume());
    }
    // Player is on the songs last section and not fading yet.
    if (playerState.position > (analysis.sections[analysis.sections.length-1].start*1000-1000) && !fading) {
      let start = analysis.sections[analysis.sections.length-1].start;
      let end = next_track.sections[1].start;
      setFading(true);
      // For tracks with low amount of sections, quick fix -> start from 3sec
      if (next_track.sections.length <= 3) {
        startFadeOut(localStorageVolume(), start, 3000, volume);
      } else {
        startFadeOut(localStorageVolume(), start, end, volume);
      }
    }
  }, [ next_track, playerState ]);

  return (
    <Col className="features-container">
      {/*
      <p className="text-muted"><small>This track has {analysis.sections.length} sections. Currently on section {currentSection(analysis.sections, playerState.position)}.</small></p>
      <p className="text-muted"><small>Fade-out at: {secToMin(analysis.sections[analysis.sections.length-1].start)} and next track starts at {secToMin(next_track.sections[1].start)}</small></p>
      <p className="text-muted"><small>Beats<Indicator value={currentBeat(analysis.beats, playerState.position)} fast />  Bars<Indicator value={currentBar(analysis.bars, playerState.position)} /></small></p>
    */}
    </Col>
  )
}

/**
 * HELPER FUNCTIONS
 */

 /**
 * Return the current section of the playback track.
 * @param {import('../spotify').AudioAnalysisSection[]} sections 
 * @param {Number} position 
 * @returns {Number}
 */
const currentSection = (sections, position) => {
  let idx = sections.findIndex(s => s.start > position / 1000);
  return idx !== -1 ? idx : sections.length;
}

/**
 * Return the current beat of the playback track.
 * @param {import('../spotify').AudioAnalysisBeat[]} beats 
 * @param {Number} position 
 * @returns {Number}
 */
const currentBeat = (beats, position) => {
  let idx = beats.findIndex(s => s.start > position / 1000);
  return idx !== -1 ? idx : beats.length; 
}

/**
 * Return the current bar of the playback track.
 * @param {import('../spotify').AudioAnalysisBar[]} bar 
 * @param {Number} position 
 * @returns {Number}
 */
const currentBar = (bar, position) => {
  let idx = bar.findIndex(s => s.start > position / 1000);
  return idx !== -1 ? idx : bar.length; 
}

/**
 * Fade volume to 0 and then switch to next track. 
 * After that seek to songs fade-in part (-1sec), and start to fade-in volume.
 * @param {import('../spotify').PlayerState} playerState 
 * @param {Number} end - current tracks fade-out start
 * @param {Number} start - next tracks fade-in end
 * @param {Number} volume - users playback volume
 */
const startFadeOut = (orig_volume, end, start, volume) => {
  let edit_value = 0.01;
  if (volume > edit_value) {
    let new_vol = editPlayerVolume(-edit_value);
    setTimeout(() => {
      startFadeOut(orig_volume, end, start, new_vol);
    }, 40);
  } else {
    window.Spotify.PlayerInstance.nextTrack()
    window.Spotify.PlayerInstance.seek(start*1000 - 1000)
    startFadeIn(orig_volume, volume);
  }
}

/**
 * Recursive calling until player volume is at original volume.
 * @param {Number} orig_vol Where we want our volume to go.
 * @param {Number} volume current volume
 */
const startFadeIn = (orig_vol, volume) => {
  // Double check, if somehow went over 1, force volume at 1.
  if (orig_vol > 1) startFadeIn(1, volume);
  // Recursive part... till volume is lower than defined volume. Add to volume.
  else if (volume < orig_vol) {
    let new_vol = editPlayerVolume(+0.03);
    setTimeout(() => {
      startFadeIn(orig_vol, new_vol);
    }, 40);
  } else if (volume > orig_vol) { // Our volume when over our target?? Please review!
    editPlayerVolume(0); // Check recursive why we might land here. Forcing an update with 0 rise.
  }
}

const editPlayerVolume = (edit_value) => {
  // Should we use our "useState" or "localStorage" to store edited & current volume?
  // 1st try localStorage
  let vol = Math.round((localStorageVolume() + edit_value) * 100) / 100;
  // Re-define checks
  if (!isNaN(vol)) {
    window.Spotify.PlayerInstance.setVolume(vol);
    updateLocalStorage(vol, 'volume');
    return vol;
  }
  return 0;
}

/**
 * Checks users playback info from localStorage.
 * @returns {Number} playback volume
 */
const localStorageVolume = () => {
  // Check if user has playback object with volume key.
  let playback = JSON.parse(localStorage.getItem('playback'));
  if (playback && playback.volume) return playback.volume;
}

/**
 * Update users playback info in localStorage
 * @param {*} value 
 * @param {String} key 
 */
const updateLocalStorage = (value, key) => {
  let playback = JSON.parse(localStorage.getItem('playback'));
  playback[key] = value;
  localStorage.setItem('playback', JSON.stringify(playback));
}

const secToMin = (time) => {   
  // Hours, minutes and seconds
  var hrs = ~~(time / 3600);
  var mins = ~~((time % 3600) / 60);
  var secs = ~~time % 60;

  // Output like "1:01" or "4:03:59" or "123:03:59"
  var ret = "";

  if (hrs > 0) {
      ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
  }

  ret += "" + mins + ":" + (secs < 10 ? "0" : "");
  ret += "" + secs;
  return ret;
}