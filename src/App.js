import React, { Component } from "react";
import Maker from "@makerdao/dai";
import { Container, Loader } from "semantic-ui-react";
import Work from "./Components/Work";
import Alert from "./Components/Alert";
import Helper from "./Components/Helper";
import getWeb3 from "./utils/getWeb3";

const maker = Maker.create("browser");

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      web3: null,
      account: null,
      mode: null
    };
  }

  async componentDidMount() {
    const web3 = await getWeb3;
    web3.currentProvider.publicConfigStore.on("update", this.initializeAccount);
    this.initializeAccount();

    function getURLParameter(name){
      // eslint-disable-next-line
      return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(window.location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
    }
    this.setState({mode: getURLParameter('mode')})
  }

  initializeAccount = async () => {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.
    let web3, accs;
    try {
      web3 = await getWeb3;
      accs = await web3.eth.getAccounts();
      if (accs.length === 0) {
        this.setState({ account: "" });
        return;
      }
      if (accs[0] === this.state.account) return;
    } catch (e) {
      console.log(e, "Error finding web3.");
      return;
    }

    try {
      await maker.authenticate();
      const priceService = maker.service("price");
      const cdpService = maker.service("cdp")
      const [ethPrice, mkrPrice, wethToPeth, liquidationRatio] = await Promise.all([
        priceService.getEthPrice(),
        priceService.getMkrPrice(),
        priceService.getWethToPethRatio(),
        cdpService.getLiquidationRatio()
      ]);
      this.setState({
        account: accs[0],
        web3,
        ethPrice: ethPrice,
        mkrPrice: mkrPrice,
        wethToPeth,
        liquidationRatio
      });
    } catch (e) {
      console.log(e, "Failed to initialize maker");
    }
  };

  render() {
    return (
      <Container>
        <header className="App-header">
          <h1 className="App-title">Settle Maker</h1>
        </header>
        {!!this.state.account ? this.renderContent() : this.renderLoading()}
      </Container>
    );
  }

  renderLoading() {
    return <Loader active>Metamask Locked?</Loader>;
  }

  renderContent() {
    return (
      <>
        <div>Logged in as {this.state.account}</div>
        <div>{this.state.ethPrice.toString()}</div>
        <div>{this.state.mkrPrice.toString()}</div>
        <div>Liquidation Ratio: {this.state.liquidationRatio}</div>
        {this.state.account && this.state.mode === 'work' && (
          <Work
            key={this.state.account}
            web3={this.state.web3}
            address={this.state.account}
            wethToPeth={this.state.wethToPeth}
            ethPrice={this.state.ethPrice}
            liquidationRatio={this.state.liquidationRatio}
          />
        )}
        {this.state.account && this.state.mode === 'alert' && (
          <Alert
          />
        )}
        {this.state.account && this.state.mode === 'helper' && (
          <Helper
          />
        )}
      </>
    );
  }
}

export default App;
