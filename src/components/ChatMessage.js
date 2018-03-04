import React, {Component} from 'react';
import {LogoGrey} from './Logo';

const AccentColour = '#ffda44';
const DarkColour = '#252525';
const LightTextColour = '#7d7c7c';
const DarkTextColour = '#bdbdbc';

class Message extends Component {

  constructor(props, context){
    super(props, context);
  };

  render(){
    return (
        <div style={{
        }}>
          {(this.props.messageContent ? this.props.messageContent.split('\n').map((text, i) => {
            return (
              <p key={i} style={{
                width: '100%',
                fontSize: '14px',
                color: '#bdbdbc',
                margin: '0',
                marginTop: '5px',
                display: 'inline',
                textAlign: (this.props.align ? this.props.align : 'left')
              }}>{text}<br /></p>
            );
          }) : '')}
        </div>
    );
  };

}

class UserMessage extends Component {

  render(){
    return (
      <div style={{
        maxWidth: '60%',
        marginLeft: 'auto',
        marginBottom: '10px',
        backgroundColor: '#363636',
        borderRadius: '13px',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '15px'
      }}>
        <Message align="right" messageContent={this.props.messageContent} />
      </div>
    );
  }

}

class BotMessage extends Component {

  render(){
    return (
      <div style={{
        width: '60%',
        marginBottom: '15px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <LogoGrey height="12px" width="12px" />
          <p style={{
            margin: '0',
            marginLeft: '5px',
            fontFamily: `"Nunito", sans-serif`,
            fontSize: '11px',
            color: '#7d7c7c'
          }}>{this.props.timeStamp}</p>
        </div>
        <Message align="left" messageContent={this.props.messageContent} />
      </div>
    );
  }
}

export {Message, UserMessage, BotMessage};
