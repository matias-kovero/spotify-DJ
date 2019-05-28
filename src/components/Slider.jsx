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
      temp: 1,
    } : 
    this.state = {
      max: this.props.songDuration,
    };
    this.handleMute = this.handleMute.bind(this);
    this.changeVolume = this.changeVolume.bind(this);
    this.seek = this.seek.bind(this);
  }
  
  handleMute() {
    {this.state.volume == 0 ?
    // unMute 
    window.Spotify.PlayerInstance.setVolume(this.state.temp).then(() => {
      this.setState({volume: this.state.temp});
      console.log('unmute');
    })
    :
    // Mute
    window.Spotify.PlayerInstance.setVolume(0).then(() => {
      this.setState({temp: this.state.volume});
      this.setState({volume: 0});
      console.log('mute');
    });
    }
  }

  changeVolume = (value) => {
    this.setState({volume: value});
    window.Spotify.PlayerInstance.setVolume(value).then(() => {
      this.setState({volume: value});
    });
  }
  seek = (value) => {
    window.Spotify.PlayerInstance.seek(value).then(() => {
    });
  }

  render() {
    return(
      <div className='row justify-content-md-center'>
        {this.props.type == 'volume' ? <div className='volume-icon' onClick={this.handleMute}><i style={{color: '#d3d3d3'}}className={this.state.volume === 0 ? 'fas fa-volume-mute' : (this.state.volume > 0.5) ? 'fas fa-volume-up' : 'fas fa-volume-down'}></i></div> : <small className='time'>{millisToMinutesAndSeconds(this.props.songPosition)}</small>}
        <Slider
          className={this.props.type}
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