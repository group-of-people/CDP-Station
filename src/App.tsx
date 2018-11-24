import React, { Component } from "react";
import { Dimmer } from "./ui";
import { Block as Loader } from "./ui/Loader";
import { inject, observer } from "mobx-react";
import Work from "./Components/Work";
import Alert from "./Components/Alert";
import Helper from "./Components/Helper";
import { Store } from "./store";
import { Lock as LockIcon } from "styled-icons/fa-solid";

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
      <div>
        {store.noWeb3.get()
          ? this.renderNoWeb3()
          : store.locked.get()
            ? this.renderLocked()
            : !store.loading.get()
              ? this.renderContent()
              : this.renderLoading()}
      </div>
    );
  }

  renderNoWeb3() {
    return (
      <Dimmer>
        No web3 found. Please use MetaMask or compatible dApp browser.
      </Dimmer>
    );
  }

  renderLocked() {
    return (
      <Dimmer>
        <LockIcon size={36} />
        <div style={{ marginTop: 10 }}> MetaMask is locked.</div>
      </Dimmer>
    );
  }
  renderLoading() {
    return <Loader />;
  }

  renderContent() {
    const store = this.props.store!;

    return (
      <>
        {store.account.get() &&
          this.state.mode === "work" && <Work key={store.account.get()} />}
        {store.account.get() &&
          this.state.mode === "alerts" && <Alert key={store.account.get()} />}
        {store.account.get() &&
          this.state.mode === "helper" && <Helper key={store.account.get()} />}
      </>
    );
  }
}

export default inject("store")(observer(App));
