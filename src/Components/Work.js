import React, { Component } from "react";
import CDPList from "../cdp/List";
import NewCdpModal from "../cdp/Modals/Creator";

export default class Work extends Component {
  state = {
    showNewCDPModal: false
  };
  render() {
    return (
      <>
        <div style={{ display: "inline" }}>
          <div>Logged in as {this.props.store.account.get()}</div>
          <div>{this.props.store.ethPrice.get().toString()}</div>
          <div>{this.props.store.mkrPrice.get().toString()}</div>
          <div>
            Liquidation Ratio: {this.props.store.liquidationRatio.get()}
          </div>
          <div>
            ETH/PETH Ratio: {this.props.store.wethToPeth.get().toFixed(4)}
          </div>
        </div>
        <div style={{ display: "inline" }}>
          <div>
            DAI Balance: {this.props.store.daiBalance.get().toString(4)}
          </div>
          <div>
            MKR Balance: {this.props.store.mkrBalance.get().toString(4)}
          </div>
          <div>
            PETH Balance: {this.props.store.pethBalance.get().toString(4)}
          </div>
          <div>
            ETH Balance: {this.props.store.ethBalance.get().toString(4)}
          </div>
        </div>
        <br />
        <CDPList store={this.props.store} onNewCDP={this.onNewCDP} />
        {this.state.showNewCDPModal && (
          <NewCdpModal
            store={this.props.store}
            onRequestClose={this.onCloseNewCDP}
          />
        )}
      </>
    );
  }

  onNewCDP = () => {
    this.setState({
      showNewCDPModal: true
    });
  };

  onCloseNewCDP = () => {
    this.setState({
      showNewCDPModal: false
    });
  };
}
