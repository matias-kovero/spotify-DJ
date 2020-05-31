import React, { Component} from 'react'; 

const keys= ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const modes = ['Minor', 'Major'];
var moving = false;
function secToMin(time)
{   
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


class Playlist extends Component {
  constructor(props) {
    super(props);
    var { playerState } = props;
    this.state = {
      hidden: false,
      volume: props.volume,
      token: props.token,
      id: playerState.track_window.current_track.id,
      track_name: playerState.track_window.current_track.name,
      analysis: null,
      tempo: null,
      sections: {},
      key: 0,
      mode: 0,
      analysis_NextTrack: null,
      nextTrack: {
        id: null,
        tempo: 0,
        startAt: null,
        key: 0,
        mode: 0,
      }
    };
    this.toggle = this.toggle.bind(this);
    this.fadeOut = this.fadeOut.bind(this);
    this.editvolume = this.editvolume.bind(this);
    this.audioAnalysis = this.audioAnalysis.bind(this);
    this.updateList = this.updateList.bind(this);
    this.spotifyApi = this.spotifyApi.bind(this);
  }

  toggle() {
    this.setState({hidden: !this.state.hidden});
  }

  fadeOut() {
    if(!moving) { // WILL TRIGGER 1st TIME
      this.setState({volume: this.props.volume});
      moving = true;
    } if(this.state.volume > 0.01 && moving) { // Turn volume down slowly
      setTimeout(() => {
        this.editvolume(-0.01);
        this.fadeOut();
      }, 40);
    } else {
      window.Spotify.PlayerInstance.nextTrack();
      window.Spotify.PlayerInstance.seek(this.state.nextTrack.startAt * 1000 - 2000);
      setTimeout(() => {
        moving = false;
        this.fadeIn();
      }, 1000);
    }
  }

  fadeIn() {
    if(!moving) {
      moving = true;
      //window.Spotify.PlayerInstance.seek(this.state.sections[0] * 1000 - 3000);
    } if(this.state.volume < this.props.volume && moving) {
      setTimeout(() => {
        this.editvolume(0.01);
        this.fadeIn();
      }, 40);
    } else {
      moving = false;
    }
  }

  editvolume(edit) {
    var oldVol = this.state.volume;
    var volume = oldVol + edit;
    window.Spotify.PlayerInstance.setVolume(volume);
    this.setState({volume: volume})
  }

  spotifyApi(url, param) {
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        'Authorization': 'Bearer ' + this.props.token
      }
    }).then((response) => {
      if(response.status === 200){
        response.json().then((responseJson) => {
          this.setState({[param]: responseJson});
        }).catch(err => {
          console.log(err.name + ' | ' + err.message);
        });
      } else {
        console.log('Response status: ', response.status)
      }
    }).catch(err => {
      console.log(err.name + ' | ' + err.message);
    });
  }

  componentDidMount() {
    this.audioAnalysis();
    //console.log(this.props);
  }

  componentDidUpdate() {
    // CHECK IF TRACK HAS CHANGED
    if(this.props.playerState.track_window.current_track.id !== this.state.id) {
      this.props.update();
      // CURRENT TRACK
      this.setState({id: this.props.playerState.track_window.current_track.id});
      this.setState({track_name: this.props.playerState.track_window.current_track.name});
      this.setState({analysis: null});
      this.setState({tempo: null});
      this.setState({section2: null});
      // NEXT TRACK
      setTimeout(() => 
      {
        this.audioAnalysis();
      }, 1000);
    }
    // CHECK IF WE ARE PAST LAST SECTION -> FADE OUT AND CHANGE SONG
    if(this.props.playerState.position > this.state.sections[1] * 1000 - 1000 && !moving) {
      this.fadeOut();
    }
    //console.log(this.props.playerState.position, ' ' , this.state.sections[1]* 1000);
  }

  audioAnalysis() {
    var id = this.props.playerState.track_window.current_track.id;
    if(this.props.playerState.track_window.next_tracks.length > 0) var NTid = this.props.playerState.track_window.next_tracks[0].id;
    this.spotifyApi(`https://api.spotify.com/v1/audio-analysis/${id}`, 'analysis');
    if(NTid) this.spotifyApi(`https://api.spotify.com/v1/audio-analysis/${NTid}`, 'analysis_NextTrack');
    if(this.state.analysis == null) {
      setTimeout(() => {
        this.updateList()
      }, 1000);
    } else {
      this.updateList();
    }
    //GET https://api.spotify.com/v1/audio-analysis/{id}
  }

  updateList() {
    if(this.state.analysis == null) {
      // wait for 1 sec and call again
      setTimeout(() => {
        this.updateList();
      }, 1000);
    } if(this.state.analysis != null && this.state.tempo == null) {
      // CURRENT TRACK
      this.setState({tempo: Math.round(this.state.analysis.track.tempo)});
      this.setState({sections: [
        Math.round(this.state.analysis.sections[1].start * 10) / 10,
        Math.round(this.state.analysis.sections[this.state.analysis.sections.length-1].start * 10) / 10,
        ] 
      });
      this.setState({key: this.state.analysis.track.key});
      this.setState({mode: this.state.analysis.track.mode});
    } if(this.state.analysis_NextTrack == null) {
      setTimeout(() => {
        this.updateList();
      }, 1000);
    } else if(this.state.analysis_NextTrack != null){
      // NEXT TRACK
      this.setState({nextTrack: {
        tempo: Math.round(this.state.analysis_NextTrack.track.tempo),
        key: this.state.analysis_NextTrack.track.key,
        mode: this.state.analysis_NextTrack.track.mode,
        startAt: Math.round(this.state.analysis_NextTrack.sections[1].start * 10) / 10,
      }});
    }
  }

  render() {
    return (
      <div className='col-md-2 offset-sm-10 fixed-bottom playlist hidden'>
        <div className='row'>
          <div className='btn' onClick={this.toggle} data-toggle="collapse" data-target=".collapseExample" aria-expanded="false" aria-controls="collapseExample">
            {this.state.hidden ? <><i className="far fa-caret-square-up"><small className=''> Audio Analysis</small></i></> : <i className="far fa-caret-square-down"></i>}
          </div>
        </div>
        <div className={'fade collapseExample '+ (this.state.hidden ? '' : 'show')}>
        <label>
          <h2 className='font-weight-lighter' textstyle={{fontFamily: 'Spotify-Book'}}>Audio Analysis</h2>
        </label>
        <hr/>
        {this.state.tempo ? <>
        <small className='font-weight-light'>{this.state.track_name}</small>
        <div className='row'>
          <div className='col'>
          <h5 className='font-weight-lighter mb-0'>{this.state.tempo + " BPM"}</h5>
          <p className='text-muted'>Tempo</p>
          </div>
          <div className='col'>
          <h5 className='font-weight-lighter mb-0'>{keys[this.state.key]} <small className='font-weight-lighter'>{modes[this.state.mode]}</small></h5>
          <p className='text-muted'>Key</p>
          </div>
        </div>
          <p className='mb-0'><i className="far fa-arrow-alt-circle-up"></i> {secToMin(this.state.sections[0])} - {secToMin(this.state.sections[1])} <i className="far fa-arrow-alt-circle-down"></i></p>
          <p className='text-muted'>Mix info</p>
        </>
        : <i className="fas fa-compact-disc fa-2x fa-spin" style={{color: '#1DB954'}}></i>}
        <hr/>
        <p><small className='font-weight-lighter'>Next Track</small></p>
        {this.state.nextTrack.tempo ? <>
        <div className='row'>
          <div className='col'>
            <h5 className='font-weight-lighter mb-0'>{this.state.nextTrack.tempo} BPM</h5>
            <p className='text-muted'>Tempo</p>
          </div>
          <div className='col'>
            <h5 className='font-weight-lighter mb-0'>{keys[this.state.nextTrack.key]} <small className='font-weight-lighter'>{modes[this.state.nextTrack.mode]}</small></h5>
            <p className='text-muted'>Key</p> 
          </div>
        </div>
          <p className='mb-0'><i className="far fa-arrow-alt-circle-up"></i> {secToMin(this.state.nextTrack.startAt)}</p>
          <p className='text-muted'>Mix info</p>
        </>
        :<i className="fas fa-compact-disc fa-2x fa-spin" style={{color: '#1DB954'}}></i>}
        <br />
        <br />
        </div>
      </div>
    );
  }
}

export default Playlist;