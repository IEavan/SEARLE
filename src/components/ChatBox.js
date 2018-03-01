/**
 * ChatBox component for SEARLE front end.
 *
 * This will be embeddable in a variety of different platforms such as
 * the desktop app, in addittion to the system tray icon and possible
 * mobile integrations.
 */

import React, { Component } from 'react';
import Input from './Input';
import Header from './Header';
import Conversation from './Conversation';
import {UserMessage, BotMessage} from './ChatMessage';
import Settings from './Settings';

const LogoPath = '../assets/SEARLE_Logo.svg';
const AccentColour = '#ffda44';
const DarkColour = '#252525';
const LightTextColour = '#7d7c7c';
const DarkTextColour = '#bdbdbc';

const Style = {
  ChatBox: {
    'backgroundColor': DarkColour,
    'height': '100%',
    'display': 'flex',
    flexDirection: 'column',
    'borderRadius': '5px 5px 0px 0px'
  },

  'MainWindow': {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    overflowY: 'scroll',
    padding: '20px'
  }
}


// Contains the 'tabs' such as the Conversation and Settings Tab
class MainWindow extends Component {

  render(){
    return (
      <div style={Style.MainWindow}>
        <Conversation conversation={this.props.conversation} visible={this.props.activeTab == 'Conversation'} />
        <Settings visible={this.props.activeTab == 'Settings'} />
      </div>
    );
  }

}


class ChatBox extends Component {

  constructor(props, context){
    super(props, context);

    // Set the Conversation to the default active tab.
    this.state = {
      activeTab: 'Conversation'
    }

    this.conversation = [
    {
      content: "ITV plc is currently trading at 161.65.",
       type: "user"
     },
     {
       content:  "Here is the change for the top 5 risers:\n\nBAE Systems (BA.): 10 (1.75)%\nInforma (INF): 10.2 (1.49)%\nShire plc (SHP): 45.5 (1.49)%\nSt. James's Place plc (STJ): 37.5 (3.33)%\nTesco (TSCO): 5.6 (2.70)%",
       type: "bot"
     }
    ];
    this.conversation = this.conversation.concat(this.conversation).concat(this.conversation);
  }

  changeTab(tabName){

    this.setState({
      activeTab: tabName
    });

  }

  render(){
    return (
      <div style={Style.ChatBox}>
        <Header />
        <MainWindow conversation={this.conversation} activeTab={this.state.activeTab}/>
        <Input activeButton={this.state.activeTab} changeTab={this.changeTab.bind(this)}/>
      </div>
    )
  }

}

export default ChatBox;
