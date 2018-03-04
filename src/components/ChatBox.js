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
import {ApiAiClient} from "api-ai-javascript/ApiAiClient";

// Create new DialogFlow Client
const client = new ApiAiClient({accessToken: 'f279f85913b3477e91ca64140191eb9b'});

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
        <Conversation getLatestMessageRef={this.props.getLatestMessageRef} conversation={this.props.conversation} visible={this.props.activeTab == 'Conversation'} />
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
      activeTab: 'Conversation',
      conversation: [
      {
        content: "ITV plc is currently trading at 161.65.",
         type: "user"
       },
       {
         content:  "Here is the change for the top 5 risers:\n\nBAE Systems (BA.): 10 (1.75)%\nInforma (INF): 10.2 (1.49)%\nShire plc (SHP): 45.5 (1.49)%\nSt. James's Place plc (STJ): 37.5 (3.33)%\nTesco (TSCO): 5.6 (2.70)%",
         type: "bot"
       }
      ]
    };

    this.sendMessageHandler = this.sendMessageHandler.bind(this);
    this.scrollToBottom = this.scrollToBottom.bind(this);
    this.getLatestMessageRef = this.getLatestMessageRef.bind(this);
  }

  componentDidUpdate(){
    this.scrollToBottom();
  }

  getLatestMessageRef(latestMessage){
    this.latestMessage = latestMessage;
  }

  scrollToBottom(){
    this.latestMessage.scrollIntoView({behavior: 'smooth'});
  }

  changeTab(tabName){

    this.setState({
      activeTab: tabName
    });

  }

  // Handler for when the user sends a new message to SEARLE
  sendMessageHandler(newUserMessage){

    console.log(`Adding new User Message ${newUserMessage}`);

    this.setState({
      conversation: this.state.conversation.concat([new UserMessageObj(newUserMessage)])
    }, () => {
      this.scrollToBottom();
    });


    client.textRequest(newUserMessage)
        .then((response) => {

          console.log(response.result.fulfillment.messages.map(message => new BotMessageObj(message)));

          // Add the response message to the chatbox.
          this.setState({
            conversation: this.state.conversation.concat(response.result.fulfillment.messages.map(message => new BotMessageObj(message.speech)))
          }, () => {
            this.scrollToBottom();
          });

        })
        .catch((error) => {
        console.log(error);
      })

  }

  render(){
    return (
      <div style={Style.ChatBox} >
        <Header />
        <MainWindow getLatestMessageRef={this.getLatestMessageRef} conversation={this.state.conversation} activeTab={this.state.activeTab}/>
        <Input sendMessageHandler={this.sendMessageHandler.bind(this)} activeButton={this.state.activeTab} changeTab={this.changeTab.bind(this)}/>
      </div>
    )
  }

}

function UserMessageObj(userMessageText){
  this.type = "user";
  this.content = userMessageText;
}

function BotMessageObj(botMessageText){
  this.type = "bot";
  this.content = botMessageText;
}

export default ChatBox;
