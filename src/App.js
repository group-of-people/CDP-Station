import React, { Component } from "react";
import Maker from "@makerdao/dai";
import { Container } from 'semantic-ui-react'
import CDPList from './CDPList'
import getWeb3 from "./utils/getWeb3";

const maker = Maker.create("browser");

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      web3: null,
      account: null
    };
  }

  async componentDidMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.
    try {
      const web3 = await getWeb3;
      const accs = await web3.eth.getAccounts();
      this.setState({ account: accs[0], web3 });
    } catch (e) {
      console.log(e, "Error finding web3.");
    }

    try {
      await maker.authenticate();
      const priceService = maker.service("price");
      const [ethPrice, mkrPrice] = await Promise.all([
        priceService.getEthPrice(),
        priceService.getMkrPrice()
      ]);

      this.setState({
        ethPrice: ethPrice.toString(),
        mkrPrice: mkrPrice.toString()
      });
    } catch (e) {
      console.log(e, "Failed to initialize maker");
    }
  }

  render() {
    return (
      <Container>
        <header className="App-header">
          <h1 className="App-title">Settle Maker</h1>
        </header>
        {!this.state.account && 'Loading...'}
        <div>Logged in as {this.state.account}</div>
        <div>{this.state.ethPrice}</div>
        <div>{this.state.mkrPrice}</div>
        {this.state.account && <CDPList address={this.state.account} />}
      </Container>
    );
  }
}

export default App;
