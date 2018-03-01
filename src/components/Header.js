import React, {Component} from 'react';
import Logo from './Logo';
import BrandingImage from './Branding';

const AccentColour = '#ffda44';
const DarkColour = '#252525';
const LightTextColour = '#7d7c7c';
const DarkTextColour = '#bdbdbc';

const Style = {
  Header: {
    'backgroundColor': AccentColour,
    'height': '50px',
    'width': '100%'
  }
}

class Branding extends Component {
  render(){
    return (
      <div style={{
        'height': '100%',
        'paddingLeft': '15px',
        'display': 'flex',
        'flexDirection': 'row',
        'alignItems': 'center'
      }}>
        <BrandingImage height="23px" />
      </div>
    );
  }
}

class Header extends Component {

  render(){
    return (
      <div style={Style.Header}>
        <Branding />
      </div>
    );
  }

}

export default Header;
