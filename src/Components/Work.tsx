import React, { Component } from "react";
import CDPList from "../cdp/List";
import { Store } from "../store";

interface Props {
  store: Store;
}

export default class Work extends Component<Props, {}> {
  state = {
    showNewCDPModal: false
  };
  render() {
    const balances = this.props.store.balances.get()!;
    return (
      <>
        <div style={{ display: "inline" }}>
          <div>Logged in as {this.props.store.account.get()}</div>
          <div>{this.props.store.prices.get()!.ethPrice.toString()}</div>
          <div>{this.props.store.prices.get()!.mkrPrice.toString()}</div>
          <div>
            Liquidation Ratio:{" "}
            {this.props.store.mkrSettings.get()!.liquidationRatio}
          </div>
          <div>
            ETH/PETH Ratio:{" "}
            {this.props.store.prices.get()!.wethToPeth.toFixed(4)}
          </div>
        </div>
        <div style={{ display: "inline" }}>
          <div>DAI Balance: {balances.daiBalance.toString(4)}</div>
          <div>MKR Balance: {balances.mkrBalance.toString(4)}</div>
          <div>PETH Balance: {balances.pethBalance.toString(4)}</div>
          <div>ETH Balance: {balances.ethBalance.toString(4)}</div>
        </div>
        <br />
        <CDPList store={this.props.store} />
      </>
    );
  }
}
