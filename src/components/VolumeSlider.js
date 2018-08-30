import React, { Component } from 'react';
import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css';
 
class VolumeSlider extends Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      volume: 0.5
    }
  }
 
  handleOnChange = (value) => {
    this.setState({
      volume: value
    })
  }
 
  render() {
    let { volume } = this.state
    return (
      <Slider
        min={0.01}
        max={0.99}
        step={0.01}
        value={volume}
        tooltip={true}
        onChange={this.handleOnChange}
      />
    );
  }
}

export default VolumeSlider;