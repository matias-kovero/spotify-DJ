import React, { Component } from "react"; 
import Slider from 'react-rangeslider';

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

class Rangeslider extends Component {
  constructor(props) {
    super(props);

    this.props.type == 'volume' ? 
    this.state = {
      volume: 1,
      max: 1,
    } : 
    this.state = {
      max: this.props.songDuration,
    };

    this.changeVolume = this.changeVolume.bind(this);
    this.seek = this.seek.bind(this);
  }
  
  changeVolume = (value) => {
    this.setState({volume: value});
    window.Spotify.PlayerInstance.setVolume(value).then(() => {
      console.log('Volume: ', this.state.volume);
    });
  }
  seek = (value) => {
    window.Spotify.PlayerInstance.seek(value).then(() => {
    });
  }

  render() {
    return(
      <div className='row justify-content-md-center'>
        {this.props.type == 'volume' ? '' : <small className='time'>{millisToMinutesAndSeconds(this.props.songPosition)}</small>}
        <Slider
          id="volume" 
          step={0.05} 
          value={this.props.type == 'volume' ? this.state.volume : this.props.songPosition}
          min={0} 
          max={this.props.type == 'volume'? this.state.max : this.props.songDuration} 
          onChange={this.props.type == 'volume' ? this.changeVolume : this.seek }
        />
         {this.props.type == 'volume' ? '' : <small className='time'>{millisToMinutesAndSeconds(this.props.songDuration)}</small>}
      </div>
    )
  }
};
export default Rangeslider;