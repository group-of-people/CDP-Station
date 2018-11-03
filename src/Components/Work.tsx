import React, { Component } from "react";
import CDPList from "../cdp/List";
import { Store } from "../store";
import { inject, observer } from "mobx-react";

interface Props {
  store?: Store;
}

export  class Work extends Component<Props, {}> {
  state = {
    showNewCDPModal: false
  };
  render() {
    const prices = this.props.store!.prices.get()!
    const balances = this.props.store!.balances.get()!;
    return (
      <>
        <div style={{ display: "inline" }}>
          <div>Logged in as {this.props.store!.account.get()}</div>
          <div>{prices.ethPrice.toString()}</div>
          <div>{prices.mkrPrice.toString()}</div>
          <div>
            Liquidation Ratio:{" "}
            {this.props.store!.mkrSettings.get()!.liquidationRatio}
          </div>
          <div>
            ETH/PETH Ratio:{" "}
            {prices.wethToPeth.toFixed(4)}
          </div>
        </div>
        <div style={{ display: "inline" }}>
          <div>DAI Balance: {balances.daiBalance.toString(4)}</div>
          <div>MKR Balance: {balances.mkrBalance.toString(4)}</div>
          <div>PETH Balance: {balances.pethBalance.toString(4)}</div>
          <div>ETH Balance: {balances.ethBalance.toString(4)}</div>
        </div>
        <br />
        <CDPList />
      </>
    );
  }
}

export default inject('store')(observer(Work))