import React, { Component } from "react";
import CDPList from "../cdp/List";
import { Button } from "../ui";
import { Store } from "../store";
import { inject, observer } from "mobx-react";

interface Props {
  store?: Store;
}

export class Work extends Component<Props, {}> {
  state = {
    showNewCDPModal: false
  };
  render() {
    const prices = this.props.store!.prices.get()!;
    const balances = this.props.store!.balances.get()!;
    return (
      <>
        <CDPList mode={"work"} />
        <div style={{ display: "inline" }}>
          <div>Logged in as {this.props.store!.account.get()}</div>
        </div>
        <div style={{ display: "inline" }}>
          <div>DAI Balance: {balances.daiBalance.toString(4)}</div>
          <div>MKR Balance: {balances.mkrBalance.toString(4)}</div>
          {!!balances.pethBalance.toNumber() && (
            <div>
              PETH Balance: {balances.pethBalance.toString(4)} {"   "}
              <Button onClick={this.props.store!.convertPETH}>
                Convert PETH to ETH?
              </Button>
            </div>
          )}

          <div>ETH Balance: {balances.ethBalance.toString(4)}</div>
        </div>
      </>
    );
  }
}

export default inject("store")(observer(Work));
