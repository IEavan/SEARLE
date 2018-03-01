import React, {Component} from 'react';

class Settings extends Component {

  render(){
    return (
      <div className={!this.props.visible ? 'hidden' : ''}>
        Settings
      </div>
    );
  }

}


export default Settings;
