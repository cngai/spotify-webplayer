import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Slider from 'react-rangeslider';
//import 'react-rangeslider/lib/index.css';
import './slider.css';
import MediaQuery from 'react-responsive';
import cassette from './img/cassette-blue.png';
import ipod from './img/ipod.png';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: "",
      deviceID: "",
      loggedIn: false,
      error: "",
      trackName: "Track Name",
      artistName: "Artist Name",
      albumName: "Album Name",
      albumImage: "",
      playing: false,
      position: 0,
      positionMin: 0,
      positionSec: 0,
      duration: 0,
      durationMin: 0,
      durationSec: 0,
      volume: 0.5,
      failedLogin: false
    };

    this.playerCheckInterval = null;
    this.playerUpdatePosition = null;
  }

  handleLogin() {
    if (this.state.token !== "") {
      //check every second for the player
      this.playerCheckInterval = setInterval(() => this.checkForPlayer(), 1000);
    }
  }

  checkForPlayer() {
    const { token } = this.state;

    if (window.Spotify !== null) {
      //cancel the interval if player created
      clearInterval(this.playerCheckInterval);

      //initialize the Web Playback SDK
      this.player = new window.Spotify.Player({
        name: "Spotify Web Player",
        getOAuthToken: cb => { cb(token); },
        volume: 0.5
      });

      //create event handlers
      this.createEventHandlers();

      //connect web playback SDK to Spotify
      this.player.connect();
    }
  }

  createEventHandlers() {
    // Error handling
    this.player.addListener('initialization_error', e => { console.error(e); });
    this.player.addListener('authentication_error', e => {
      console.error(e);
      this.setState({
        loggedIn: false,
        failedLogin: true
      });
    });
    this.player.addListener('account_error', e => { console.error(e); });
    this.player.addListener('playback_error', e => { console.error(e); });

    // Playback status updates
    this.player.addListener('player_state_changed', state => { console.log(state); });

    // Ready
    this.player.addListener('ready', data => {
      let { device_id } = data;
      console.log('Ready with Device ID');
      this.setState({
        deviceID: device_id,
        loggedIn: true
      });
      this.transferPlaybackHere();
    });

    //if state of local playback has changed
    this.player.addListener('player_state_changed', state => this.onStateChanged(state));
  }

  onStateChanged(state) {
    var millisec = require('millisec');

    //check for position every second
    this.playerUpdatePosition = setInterval(() => this.checkForPosition(),1000);

    //if no longer listening to music, we get a null
    if (state !== null) {
      const {
        current_track: currentTrack,
      } = state.track_window;
      const position = state.position;
      const duration = state.duration;
      const durationMin = millisec(duration).format('mm');
      const oldDurationSec = millisec(duration).format('ss');
      const durationSec = ("0" + oldDurationSec).slice(-2);   //used to prepend 0 to single digit seconds
      const trackName = currentTrack.name;
      const albumName = currentTrack.album.name;
      const albumImage = currentTrack.album.images.map(image => image.url).slice(0,1);  //get first element of array
      const artistName = currentTrack.artists //get all artists and join with ', '
        .map(artist => artist.name)
        .join(", ");
      const playing = !state.paused;
      this.setState({
        position,
        duration,
        durationMin,
        durationSec,
        trackName,
        albumName,
        artistName,
        albumImage,
        playing
      });
      console.log('Currently Playing', currentTrack);
      console.log('Position in Song', position);
      console.log('Duration of Song', duration);
    }
  }

  //update position of song
  checkForPosition() {
    var millisec = require('millisec');

    this.player.getCurrentState().then(state => {
      const position = state.position;
      const positionMin = millisec(position).format('mm');
      const oldPositionSec = millisec(position).format('ss');
      const positionSec = ("0" + oldPositionSec).slice(-2);   //used to prepend 0 to single digit seconds
      this.setState({
        position,
        positionMin,
        positionSec
      });
    });
  }

  onPrevClick() {
    this.player.previousTrack();
  }

  onPlayClick() {
    this.player.togglePlay();
  }

  onNextClick() {
    this.player.nextTrack();
  }

  //automatically switch device to web app
  transferPlaybackHere() {
    const { deviceID, token } = this.state;
    fetch("https://api.spotify.com/v1/me/player", {
      method: "PUT",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "device_ids": [ deviceID ],
        "play": true,
      }),
    });
  }

  //change volume
  changeVolume = (value) => {
    this.player.setVolume(value).then(() => {
      console.log('Volume updated to ' + value);
    });
    this.setState({
      volume: value
    })
  }

  changePosition = (value) => {
    this.player.seek(value).then(() => {
      console.log('Changed position!');
    });
    this.setState({
      position: value
    })
  }


  render() {
    const { 
      token,
      loggedIn,
      artistName,
      trackName,
      albumName,
      albumImage,
      error,
      position,
      positionMin,
      positionSec,
      duration,
      durationMin,
      durationSec,
      playing,
      volume,
      failedLogin
     } = this.state;

    return (
      <div className="main">
        {error && <p>Error: {error}</p>}

        {loggedIn ?
          (<div>
            <div className="row">
              <div className="col-sm-6 album-col">
                <img className="album" src={albumImage} />
              </div>
              <div className="col-sm-6 song-col">
                <div className="row">
                  <div className="col-sm-8 artist-col">
                    <div className="row middle">
                      <div className="col-sm-9">
                        <div className="song-info">
                          <p className="song-text"><i class="material-icons song-icon">music_note</i> {trackName}</p>
                          <p className="song-text"><span class="glyphicon glyphicon-user song-icon" /> {artistName}</p>
                          <p className="song-text"><i class="material-icons song-icon">album</i> {albumName}</p>
                        </div>
                      </div>
                      <div className="col-sm-3 volume-bar">
                        <MediaQuery query="(max-width: 576px)">
                          <div className="row">
                            <div className="col-1">
                              <p className="volume-text"><i class="material-icons">volume_up</i></p>
                            </div>
                            <div className="col-10">
                              <Slider
                                min={0.01}
                                max={0.99}
                                step={0.01}
                                value={volume}
                                tooltip={false}
                                onChange={this.changeVolume}
                                orientation="horizontal"
                              />
                            </div>
                            <div className="col-1">
                              <p className="volume-text"><i class="material-icons">volume_down</i></p>
                            </div>
                          </div>
                        </MediaQuery>
                        <MediaQuery query="(min-width: 577px)">
                          <p className="volume-text"><i class="material-icons">volume_up</i></p>
                          <Slider
                            min={0.01}
                            max={0.99}
                            step={0.01}
                            value={volume}
                            tooltip={false}
                            onChange={this.changeVolume}
                            orientation="vertical"
                          />
                          <p className="volume-text"><i class="material-icons">volume_down</i></p>
                        </MediaQuery>
                        
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-4 volume-col">
                  </div>
                </div>
              </div>
            </div>
            <div className="slider-col">
              <div className="row">
                <div className="col-1">
                  <p className="position-text">{positionMin}:{positionSec} </p>
                </div>
                <div className="col-10">
                  <Slider
                    min={0}
                    max={duration}
                    step={1}
                    value={position}
                    tooltip={false}
                    onChange={this.changePosition}
                  />
                </div>
                <div className="col-1">
                  <p className="position-text"> {durationMin}:{durationSec}</p>
                </div>
              </div>
              <div className="row">
                <p className="button-text">
                  <p className="button-hov"><i onClick={() => this.onPrevClick()}> <i className="fa fa-step-backward"></i> </i></p>
                  <p className="button-hov"><i onClick={() => this.onPlayClick()}>{playing ? <i className="fa fa-pause-circle-o"></i> : <i className="fa fa-play-circle-o"></i>}</i></p>
                  <p className="button-hov"><i onClick={() => this.onNextClick()}> <i className="fa fa-step-forward"> </i></i></p>
                </p>
              </div>
            </div>
          </div>)
          :
          (<div>
            <div className="row">
              <div className="col-sm-6 cassette-col">
                <img src={cassette} className="cassette" />
              </div>
              <div className="col-sm-6 login-col">
                <div className="col-sm-10 login-info">
                  <p className="login-text">
                    Enter your Spotify access token.<br />Get it from{" "}
                    <a href="https://developer.spotify.com/documentation/web-playback-sdk/quick-start/" target="_blank">
                    here
                    </a>.
                  </p>
                  <p>
                    <div className="input-group">
                      <input type="text" class ="form-control" value={token} onChange={e => this.setState({ token: e.target.value })} />
                      <span class="input-group-btn">
                        <button type="button" class="btn btn-primary" onClick={() => this.handleLogin()}>Go</button>
                      </span>
                    </div>
                  </p>
                  {failedLogin ? (
                    <div className="expired">
                      <p className="login-text">You have entered an invalid<br />or expired access token.<br />Please try again.</p>
                      </div>)
                    : (<div></div>)
                  }
                </div>
              </div>
            </div>
          </div>)
        }
      </div>
    );
  }
}

export default App;
