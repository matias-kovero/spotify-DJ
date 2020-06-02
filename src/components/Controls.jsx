import React, { Component } from "react";

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
      <div className='col control-buttons mt-3'>
        <div className='btn fa-1x'>
          <i className="fas fa-backward" onClick={() => window.Spotify.PlayerInstance.previousTrack()}/>
        </div>
        <div className='btn'>
          <i className={this.props.paused ? 'far fa-play-circle fa-3x' : 'far fa-pause-circle fa-3x'} onClick={this.handePlayPause} />
        </div>
        <div className='btn fa-1x '>
          <i className="fas fa-forward" onClick={() => window.Spotify.PlayerInstance.nextTrack()} />
        </div>
      </div>
    );
  }
}
export default Controls;