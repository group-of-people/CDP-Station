import React, { Component } from "react";
import CDPList from "../cdp/List";
import NewCdpModal from "./CDPCreator";

export default class Work extends Component {
  state = {
    showNewCDPModal: false
  };
  render() {
    return (
      <>
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
