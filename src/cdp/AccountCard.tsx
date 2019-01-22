import React from "react";
import { observer, inject } from "mobx-react";
import { Card, Button, Header2, Header3 } from "../ui";
import { Circular as Loader } from "../ui/Loader";
import { Store, PendingTx } from "../store";

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

interface LabeledValueProps {
  label: string;
  children: React.ReactNode;
}

function LabeledValue(props: LabeledValueProps) {
  return (
    <>
      <Header3>{props.label}</Header3>
      <div style={{ marginBottom: 10 }}>{props.children}</div>
    </>
  );
}

interface ControlledProps {
  address: string;

  daiBalance: string;
  mkrBalance: string;
  pethBalance: string;
  ethBalance: string;

  loading?: PendingTx;

  onClick: () => void;
}

export function AccountCardControlled(props: ControlledProps) {
  const {
    address,
    daiBalance,
    mkrBalance,
    pethBalance,
    ethBalance,
    loading,
    onClick
  } = props;
  const pendingTx = loading!;
  const hasPendingTx = !!pendingTx;

  const shortAddress = `${address.slice(0, 8)}...${address.slice(
    address.length - 6
  )}`;

  return (
    <Card>
      <div style={{ textAlign: "center" }}>
        <Header2>Account</Header2>
        <div style={{ marginBottom: 20, color: "#ededed" }} title={address}>
          {shortAddress}
        </div>
      </div>
      <LabeledValue label={"DAI"}>{daiBalance}</LabeledValue>
      <LabeledValue label={"MKR"}>{mkrBalance}</LabeledValue>
      {pethBalance !== "0.0000" && (
        <LabeledValue label={"PETH"}>
          <div>{pethBalance}</div>
          {!hasPendingTx && (
            <Button
              style={"primary"}
              onClick={() => {
                if (hasPendingTx) {
                  return;
                }
                onClick();
              }}
            >
              Convert to ETH
            </Button>
          )}
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
        </LabeledValue>
      )}
      <LabeledValue label={"ETH"}>{ethBalance}</LabeledValue>
    </Card>
  );
}

interface Props {
  store?: Store;
}

export function AccountCard(props: Props) {
  const store = props.store!;
  const balances = store.balances.get()!;
  const pendingTx = store.pendingTxs.get(0);

  return (
    <AccountCardControlled
      address={store.account.get()}
      daiBalance={balances.daiBalance.toNumber().toFixed(4)}
      mkrBalance={balances.mkrBalance.toNumber().toFixed(4)}
      pethBalance={balances.pethBalance.toNumber().toFixed(4)}
      ethBalance={balances.ethBalance.toNumber().toFixed(4)}
      loading={pendingTx}
      onClick={() => {
        store!.convertPETH(0, balances.pethBalance.toNumber());
      }}
    />
  );
}

export default inject("store")(observer(AccountCard));
