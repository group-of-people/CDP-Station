import React from "react";
import { observer, inject } from "mobx-react";
import { Card, Button, Header2, Header3 } from "../ui";
import { Circular as Loader } from "../ui/Loader";
import { Store } from "../store";

interface Props {
  store?: Store;
}

function getPendingMessage(
  txType: "lock" | "free" | "draw" | "repay" | "approve" | "convert" | "create"
) {
  switch (txType) {
    case "create":
      return "Pending creation";
    case "lock":
      return "Pending Deposit";
    case "free":
      return "Pending Withdrawal";
    case "draw":
      return "Pending Generation";
    case "repay":
      return "Pending Repayment";
    case "approve":
      return "Pending Approve";
    case "convert":
      return "Pending Conversion";
    default:
      return "Pending";
  }
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
    const pendingTx = this.props.store!.pendingTxs.get(0);
    const hasPendingTx = !!pendingTx;

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
                  if (hasPendingTx) {
                    return;
                  }
                  this.props.store!.convertPETH(
                    0,
                    balances.pethBalance.toNumber()
                  );
                }}
              >
                {hasPendingTx && (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Loader color={"#FFFFFF"} />{" "}
                    {!!pendingTx![0] && (
                      <a
                        target="_blank"
                        rel="noopener"
                        href={`https://etherscan.io/tx/${pendingTx![0]}`}
                      >
                        {getPendingMessage(pendingTx![1])}
                      </a>
                    )}
                    &nbsp;
                  </div>
                )}
                {!hasPendingTx && <>Convert to ETH</>}
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
