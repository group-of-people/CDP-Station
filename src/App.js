import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import getWeb3 from './utils/getWeb3';

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: null,
      account: null
    }
  }

  componentDidMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3.then(results => {
      this.setState({
        web3: results.web3
      })  
      results.web3.eth.getAccounts().then((accs) => {
        this.setState({
          account: accs[0]
        })
      })
    }).catch((e) => {
      console.log(e,'Error finding web3.')
    })
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">{this.state.account}</h1>
        </header>
      </div>
    );
  }
}

export default App;
