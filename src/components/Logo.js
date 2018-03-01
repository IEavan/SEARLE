import React, {Component} from 'react';
import LogoPNG from '../assets/SEARLE_Logo.png';
import LogoGreyPNG from '../assets/SEARLE_Logo_grey.png';

class Logo extends Component {
  render(){
    return (
      <img alt="SEARLE-logo" height={this.props.height ? this.props.height : "25px"} width={this.props.width ? this.props.width : "25px"} src={LogoPNG} />
    );
  }
}

class LogoGrey extends Component {
  render(){
    return (
      <img alt="SEARLE-logo" height={this.props.height ? this.props.height : "25px"} width={this.props.width ? this.props.width : "25px"} src={LogoGreyPNG} />
    );
  }
}

export {Logo, LogoGrey};
