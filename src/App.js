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
  }

  render() {
    const { token } = this.state;

    return (
      <div className="App">
        <div className="App-header">
          <h2>Now Playing</h2>
        </div>
        <p className="App-intro">
          Enter your Spotify access token. Get it from{" "}
          <a href="https://developer.spotify.com/documentation/web-playback-sdk/quick-start/">
          here
          </a>.
        </p>
        <p>
          <input type="text" value={token} onChange={e => this.setState({ token: e.target.value })} />
          <button>Go</button>
        </p>
      </div>
    );
  }
}

export default App;
