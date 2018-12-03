import React, { Component } from "react";
import CDPList from "../cdp/List";
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
    return (
      <>
        <CDPList mode={"work"} />
      </>
    );
  }
}

export default inject("store")(observer(Work));
