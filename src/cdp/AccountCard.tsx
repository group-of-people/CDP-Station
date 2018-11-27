import React from "react";
import { observer, inject } from "mobx-react";
import { Card, Button, Header2, Header3 } from "../ui";
import { Store } from "../store";

interface Props {
  store?: Store;
}

export class AccountCard extends React.Component<Props> {
  state = {};
  render() {
    const balances = this.props.store!.balances.get()!;
    const address = this.props.store!.account.get();
    const shortAddress = `${address.slice(0, 8)}...${address.slice(
      address.length - 6
    )}`;
    const hasDanglingPeth =
      balances.pethBalance.toNumber().toFixed(4) !== "0.0000";

    return (
      <Card>
        <div style={{ textAlign: "center" }}>
          <Header2>Account</Header2>
          <div style={{ marginBottom: 20, color: "#ededed" }} title={address}>
            {shortAddress}
          </div>
        </div>
        <Header3>DAI</Header3>
        <div style={{ marginBottom: 10 }}>
          {balances.daiBalance.toNumber().toFixed(4)}
        </div>
        <Header3>MKR</Header3>
        <div style={{ marginBottom: 10 }}>
          {balances.mkrBalance.toNumber().toFixed(4)}
        </div>
        {hasDanglingPeth && (
          <>
            <Header3>PETH</Header3>
            <div style={{ marginBottom: 10 }}>
              <div>{balances.pethBalance.toNumber().toFixed(4)}</div>
              <Button
                style={"primary"}
                onClick={() => {
                  this.props.store!.convertPETH(
                    0,
                    balances.pethBalance.toNumber()
                  );
                }}
              >
                Convert to ETH
              </Button>
            </div>
          </>
        )}
        <Header3>ETH</Header3>
        <div style={{ marginBottom: 10 }}>
          {balances.ethBalance.toNumber().toFixed(4)}
        </div>
      </Card>
    );
  }

  onClick = () => {
    this.setState({ showForm: true });
  };
}

export default inject("store")(observer(AccountCard));
