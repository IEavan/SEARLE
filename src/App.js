import React, { Component } from 'react';
import ChatBox from './components/ChatBox';
import logo from './logo.svg';
import './App.css';

// DIALOGFLOW DEPENDENCIES
// import {ApiAiClient} from "api-ai-javascript/ApiAiClient";
// const client = new ApiAiClient({accessToken: 'f279f85913b3477e91ca64140191eb9b'})
//
// client.textRequest('what is the volume of barclays?')
//     .then((response) => {
//       console.log(response);
//     })
//     .catch((error) => {/* do something here too */})
//

class App extends Component {
  render() {
    return (
      <ChatBox />
    );
  }
}

export default App;
