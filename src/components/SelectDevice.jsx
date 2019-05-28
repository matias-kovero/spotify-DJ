import React, { Component} from 'react';


class SelectDevice extends Component {
  constructor(props) {
    super(props);
    this.state = {
      info: ' INFO',
    }
    this.spotifyApi = this.props.action;
    // https://api.spotify.com/v1/me
    // https://api.spotify.com/v1/me/player
  }

  render = () => {
    return (
      <div style={{top: '15rem', position: 'relative'}}>
        <div onClick={this.props.api('https://api.spotify.com/v1/me/player/devices')}>Test{this.state.info}</div>
      </div>
    );
  }
}

export default SelectDevice;