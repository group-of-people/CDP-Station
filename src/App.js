import React, { Component } from "react";
import { Container, Loader, Dimmer, Icon } from "semantic-ui-react";
import Work from "./Components/Work";
import Alert from "./Components/Alert";
import Helper from "./Components/Helper";
import FreePETH from "./cdp/Modals/Free.js";
import LockETH from "./cdp/Modals/Lock.js";
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
          <h1 className="App-title">SettleCDP</h1>
        </header>
        {store.noWeb3.get()
          ? this.renderNoWeb3()
          : store.locked.get()
            ? this.renderLocked()
            : !store.loading.get()
              ? this.renderContent()
              : this.renderLoading()}
      </Container>
    );
  }

  renderNoWeb3() {
    return (
      <Dimmer active>
        No web3 found. Please use MetaMask or compatible dApp browser.
      </Dimmer>
    );
  }

  renderLocked() {
    return (
      <Dimmer active>
        <Icon name="lock" size={"big"} />
        <div style={{ marginTop: 10 }}> MetaMask is locked.</div>
      </Dimmer>
    );
  }
  renderLoading() {
    return <Loader active />;
  }

  renderContent() {
    const { store } = this.props;

    return (
      <>
        {!!store.showLockModal.get() && (
          <LockETH
            cdp={store.lockModalTargetCDP.get()}
            store={this.props.store}
            onRequestClose={store.hideLock}
          />
        )}
        {!!store.showFreeModal.get() && (
          <FreePETH
            cdp={store.freeModalTargetCDP.get()}
            store={this.props.store}
            onRequestClose={store.hideFree}
          />
        )}
        {store.account.get() &&
          this.state.mode === "work" && (
            <Work key={this.state.account} store={store} />
          )}
        {store.account.get() &&
          this.state.mode === "alerts" && <Alert store={store} />}
        {store.account.get() && this.state.mode === "helper" && <Helper />}
      </>
    );
  }
}

export default observer(App);
