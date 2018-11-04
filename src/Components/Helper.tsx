import React, { Component } from "react";
import CDPList from "../cdp/List";
import { Button } from "semantic-ui-react";
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
        <CDPList mode={"helper"} />
      </>
    );
  }
}

export default inject("store")(observer(Work));