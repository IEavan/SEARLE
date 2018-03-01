import React, {Component} from 'react';
import BrandingPNG from '../assets/SEARLE_Full_branding.png';

export default class Branding extends Component {
  render(){
    return (
      <img alt="SEARLE-branding" height={this.props.height ? this.props.height : "25px"} src={BrandingPNG} />
    );
  }
}
