import React, { Component } from "react";
import { Container, Loader } from "semantic-ui-react";
import Work from "./Components/Work";
import Alert from "./Components/Alert";
import Helper from "./Components/Helper";
import { observer } from "mobx-react";

function getURLParameter(name) {
  // eslint-disable-next-line
  return (
    decodeURIComponent(
      (new RegExp("[?|&]" + name + "=([^&;]+?)(&|#|;|$)").exec(
        window.location.search
      ) || [null, ""])[1].replace(/\+/g, "%20")
    ) || null
  );
}

class App extends Component {
  state = {
    mode: getURLParameter("mode") || "work"
  };

  render() {
    const { store } = this.props;
    return (
      <Container>
        <header className="App-header">
          <h1 className="App-title">Settle Maker</h1>
        </header>
        {!store.loading.get() ? this.renderContent() : this.renderLoading()}
      </Container>
    );
  }

  renderLoading() {
    return <Loader active>Metamask Locked?</Loader>;
  }

  renderContent() {
    const { store } = this.props;

    return (
      <>
        <div style={{ display: "inline" }}>
          <div>Logged in as {store.account.get()}</div>
          <div>{store.ethPrice.get().toString()}</div>
          <div>{store.mkrPrice.get().toString()}</div>
          <div>Liquidation Ratio: {store.liquidationRatio.get()}</div>
          <div>ETH/PETH Ratio: {store.wethToPeth.get().toFixed(4)}</div>
        </div>
        <div style={{ display: "inline" }}>
          <div>DAI Balance: {store.daiBalance.get().toString(4)}</div>
          <div>MKR Balance: {store.mkrBalance.get().toString(4)}</div>
        </div>
        <br />
        {store.account.get() &&
          this.state.mode === "work" && (
            <Work key={this.state.account} store={store} />
          )}
        {store.account.get() && this.state.mode === "alert" && <Alert />}
        {store.account.get() && this.state.mode === "helper" && <Helper />}
      </>
    );
  }
}

export default observer(App);
