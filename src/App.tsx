import React, { Component } from "react";
import { Container, Loader, Dimmer, Icon } from "semantic-ui-react";
import { inject, observer } from "mobx-react";
import Work from "./Components/Work";
import Alert from "./Components/Alert";
import FreePETH from "./cdp/Modals/Free";
import LockETH from "./cdp/Modals/Lock";
import NewCdpModal from "./cdp/Modals/Creator";
import CDPDetails from "./cdp/Modals/Details";
import CDPDraw from "./cdp/Modals/Draw";
import CDPRepay from "./cdp/Modals/Repay";
import { Store } from "./store";

function getURLParameter(name: string) {
  const match = new RegExp("[?|&]" + name + "=([^&;]+?)(&|#|;|$)").exec(
    window.location.search
  );
  if (!match) {
    return null;
  }
  // eslint-disable-next-line
  return decodeURIComponent((match[1] || "").replace(/\+/g, "%20")) || null;
}

interface Props {
  store?: Store;
}

class App extends Component<Props> {
  state = {
    mode: getURLParameter("mode") || "work"
  };

  render() {
    const store = this.props.store!;
    return (
      <Container>
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
    const store = this.props.store!;

    return (
      <>
        {!!store.showLockModal.get() && (
          <LockETH
            cdp={store.lockModalTargetCDP.get()!}
            onRequestClose={store.hideLock}
          />
        )}
        {!!store.showFreeModal.get() && (
          <FreePETH
            cdp={store.freeModalTargetCDP.get()!}
            onRequestClose={store.hideFree}
          />
        )}
        {!!store.showNewCDPModal.get() && (
          <NewCdpModal onRequestClose={store.hideNew} />
        )}
        {!!store.showDetailsModal.get() && (
          <CDPDetails
            cdp={store.detailsModalTargetCDP.get()!}
            onRequestClose={store.hideDetails}
          />
        )}
        {!!store.showDrawModal.get() && (
          <CDPDraw
            cdp={store.drawModalTargetCDP.get()!}
            onRequestClose={store.hideDraw}
          />
        )}
        {!!store.showRepayModal.get() && (
          <CDPRepay
            cdp={store.repayModalTargetCDP.get()!}
            onRequestClose={store.hideRepay}
          />
        )}
        {store.account.get() &&
          this.state.mode === "work" && (
            <Work key={store.account.get()} store={store} />
          )}
        {store.account.get() &&
          this.state.mode === "alerts" && <Alert store={store} />}
        {/* {store.account.get() && this.state.mode === "helper" && <Helper />} */}
      </>
    );
  }
}

export default inject("store")(observer(App));
