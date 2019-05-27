import React, { Component } from "react";
/*
const Controls = props => {
  return (
    <div>
      <button 
        onClick={() => window.Spotify.PlayerInstance.previousTrack()}>
        Previous Track
      </button>
      <button 
        onClick={() => window.Spotify.PlayerInstance.resume()}>
        Resume
      </button>
      <button 
        onClick={() => window.Spotify.PlayerInstance.pause()}>
        Pause
      </button>
      <button 
        onClick={() => window.Spotify.PlayerInstance.nextTrack()}>
        Next Track
      </button>
    </div>
  );
};

export default Controls;*/


class Controls extends Component {
  constructor(props) {
    super(props);

    this.state = {
      paused: this.props.paused
    };
    this.handePlayPause = this.handePlayPause.bind(this);
  }

  handePlayPause() {
    this.props.paused ? window.Spotify.PlayerInstance.resume() : window.Spotify.PlayerInstance.pause()
  }


  /* This lifecycle hook gets executed when the component mounts */
  render() {
    return(
      <div className='btn-group mt-3'>
        <div className='btn fa-1x mt-3'
          onClick={() => window.Spotify.PlayerInstance.previousTrack()}>
          <i 
            className="fas fa-backward"
            style={{color: '#FFF'}}
          />
        </div>
        <div className='btn'
          onClick={this.handePlayPause}>
          <i 
            className={this.props.paused ? 'far fa-play-circle fa-3x' : 'far fa-pause-circle fa-3x'}
            style={{color: '#FFF'}}
          />
        </div>
        <div className='btn fa-1x mt-3'
          onClick={() => window.Spotify.PlayerInstance.nextTrack()}>
          <i 
            className="fas fa-forward"
            style={{color: '#FFF'}}
          />
        </div>
      </div>
    );
  }
}
export default Controls;