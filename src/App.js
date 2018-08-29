import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

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
      playing: false,
      position: 0,
      duration: 0,
    };

    this.playerCheckInterval = null;
  }

  handleLogin() {
    if (this.state.token !== "") {
      this.setState({ loggedIn: true });

      //check every second for the player
      this.playerCheckInterval = setInterval(() => this.checkForPlayer(), 1000);
    }
  }

  checkForPlayer() {
    const { token } = this.state;

    if (window.Spotify !== null) {
      //cancel the interval if player created
      clearInterval(this.playerCheckInterval);

      this.player = new window.Spotify.Player({
        name: "Chris's Spotify Player",
        getOAuthToken: cb => { cb(token); },
        volume: 0.5
      });

      this.createEventHandlers();

      this.player.connect();
    }
  }

  createEventHandlers() {
    // Error handling
    this.player.addListener('initialization_error', e => { console.error(e); });
    this.player.addListener('authentication_error', e => {
      console.error(e);
      this.setState({ loggedIn: false});
    });
    this.player.addListener('account_error', e => { console.error(e); });
    this.player.addListener('playback_error', e => { console.error(e); });

    // Playback status updates
    this.player.addListener('player_state_changed', state => { console.log(state); });

    // Ready
    this.player.addListener('ready', data => {
      let { device_id } = data;
      console.log('Ready with Device ID');
      this.setState({ deviceID: device_id });
      this.transferPlaybackHere();
    });

    this.player.addListener('player_state_changed', state => this.onStateChanged(state));

    /*
    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
    });

    // Connect to the player!
    player.connect();*/
  }

  onStateChanged(state) {
    if (state !== null) {
      const {
        current_track: currentTrack,
        position,
        duration,
      } = state.track_window;
      const trackName = currentTrack.name;
      const albumName = currentTrack.album.name;
      const artistName = currentTrack.artists
        .map(artist => artist.name)
        .join(", ");
      const playing = !state.paused;
      this.setState({
        position,
        duration,
        trackName,
        albumName,
        artistName,
        playing
      });
    }
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

  render() {
    const { 
      token,
      loggedIn,
      artistName,
      trackName,
      albumName,
      error,
      position,
      duration,
      playing,
     } = this.state;

    return (
      <div className="App">
        <div className="App-header">
          <h2>Now Playing</h2>
          <p>Spotify Web Player</p>
        </div>

        {error && <p>Error: {error}</p>}

        {loggedIn ?
          (<div>
              <p>Artist: {artistName}</p>
              <p>Track: {trackName}</p>
              <p>Album: {albumName}</p>
              <p>
                <i onClick={() => this.onPrevClick()}> <i className="fa fa-step-backward"></i> </i>
                <i onClick={() => this.onPlayClick()}>{playing ? <i className="fa fa-pause-circle-o"></i> : <i className="fa fa-play-circle-o"></i>}</i>
                <i onClick={() => this.onNextClick()}> <i className="fa fa-step-forward"> </i></i>
              </p>
            </div>)
          :
          (<div>
            <p className="App-intro">
              Enter your Spotify access token. Get it from{" "}
              <a href="https://developer.spotify.com/documentation/web-playback-sdk/quick-start/">
              here
              </a>.
            </p>
            <p>
              <input type="text" value={token} onChange={e => this.setState({ token: e.target.value })} />
              <button onClick={() => this.handleLogin()}>Go</button>
            </p>
          </div>)
        }
      </div>
    );
  }
}

export default App;
