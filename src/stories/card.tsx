import React from "react";
import { observable } from "mobx";
import { Provider } from "mobx-react";
import { storiesOf } from "@storybook/react";
import { withState } from "@dump247/storybook-state";
import "sanitize.css";
import "../index.css";

import NewCard from "../cdp/NewCard";
import { AccountCardControlled } from "../cdp/AccountCard";
import Card from "../cdp/Card";
import { ETH } from "../store";
import CDP from "../store/cdp";

const A = "0x123456789012345678901234567890abcdefabcd";

const mockStore = {
  account: {
    get() {
      return A;
    }
  },
  balances: {
    get() {
      return {
        ethBalance: ETH("12345.1234567890123456789"),
        daiBalance: ETH("123456.1234567890123456789"),
        mkrBalance: ETH("654321.1234567890123456789"),
        pethBalance: ETH("10.1234567890123456789")
      };
    }
  },
  mkrSettings: {
    get() {
      return {
        liquidationRatio: 1.5
      };
    }
  },
  prices: {
    get() {
      return {
        wethToPeth: 1.1,
        ethPrice: ETH("200")
      };
    }
  },
  pendingTxs: observable.map({}),
  lockETH(_amountETH: number, cdp: CDP) {
    this.pendingTxs.set(cdp.id, ["hash", "lock"]);
    setTimeout(() => {
      this.pendingTxs.set(cdp.id, null);
    }, 5000);
  },
  freeETH(_amountETH: number, cdp: CDP) {
    this.pendingTxs.set(cdp.id, ["hash", "free"]);
    setTimeout(() => {
      this.pendingTxs.set(cdp.id, null);
    }, 5000);
  },
  repayDAI(_amountETH: number, cdp: CDP) {
    this.pendingTxs.set(cdp.id, ["hash", "repay"]);
    setTimeout(() => {
      this.pendingTxs.set(cdp.id, null);
    }, 5000);
  },
  drawDAI(_amountETH: number, cdp: CDP) {
    this.pendingTxs.set(cdp.id, ["hash", "draw"]);
    setTimeout(() => {
      this.pendingTxs.set(cdp.id, null);
    }, 5000);
  }
};

storiesOf("Cards", module)
  .add("New", () => (
    <Provider store={mockStore}>
      <div style={{ display: "flex" }}>
        <NewCard /> <NewCard flipped />
      </div>
    </Provider>
  ))
  .add(
    "Account",
    withState({})(({ store }) => (
      <div style={{ display: "flex" }}>
        <AccountCardControlled
          address={A}
          daiBalance={"10000000.001"}
          mkrBalance={"1.0001"}
          ethBalance={"101.0001"}
          pethBalance={"0.0000"}
          onClick={() => {}}
        />
        <AccountCardControlled
          address={A}
          daiBalance={"10000000.001"}
          mkrBalance={"1.0001"}
          ethBalance={"101.0001"}
          pethBalance={"1000.9786"}
          loading={(store as any).state.loading}
          onClick={() => {
            store.set({ loading: ["0xtx", "convert"] });
          }}
        />
        <AccountCardControlled
          address={A}
          daiBalance={"10000000.001"}
          mkrBalance={"1.0001"}
          ethBalance={"101.0001"}
          pethBalance={"1000.9786"}
          loading={["0xtx", "convert"]}
          onClick={() => {}}
        />
      </div>
    ))
  )
  .add("CDP - wide", () => (
    <Provider store={mockStore}>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        <Card
          cdp={
            new CDP(
              1543,
              50000.123456789,
              8500000.123456789,
              mockStore.prices as any,
              mockStore.mkrSettings as any,
              A
            )
          }
        />
        <Card
          cdp={
            new CDP(
              1543,
              5 * 10,
              20 * 10,
              mockStore.prices as any,
              mockStore.mkrSettings as any,
              A
            )
          }
          view={"deposit"}
        />
        <Card
          cdp={
            new CDP(
              1543,
              5 * 10,
              20 * 10,
              mockStore.prices as any,
              mockStore.mkrSettings as any,
              A
            )
          }
          view={"withdraw"}
        />
        <Card
          cdp={
            new CDP(
              1543,
              5 * 10,
              200 * 10,
              mockStore.prices as any,
              mockStore.mkrSettings as any,
              A
            )
          }
          view={"payback"}
        />
        <Card
          cdp={
            new CDP(
              1543,
              5 * 10,
              20 * 10,
              mockStore.prices as any,
              mockStore.mkrSettings as any,
              A
            )
          }
          view={"generate"}
        />
      </div>
    </Provider>
  ))
  .add("CDP - short", () => (
    <Provider store={mockStore}>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        <Card
          cdp={
            new CDP(
              1543,
              5 * 10,
              850 * 10,
              mockStore.prices as any,
              mockStore.mkrSettings as any,
              A
            )
          }
          wide={false}
        />
        <Card
          cdp={
            new CDP(
              1543,
              5,
              20,
              mockStore.prices as any,
              mockStore.mkrSettings as any,
              A
            )
          }
          wide={false}
          view={"deposit"}
        />
        <Card
          cdp={
            new CDP(
              1543,
              5,
              20,
              mockStore.prices as any,
              mockStore.mkrSettings as any,
              A
            )
          }
          wide={false}
          view={"withdraw"}
        />
        <Card
          cdp={
            new CDP(
              1543,
              5,
              200,
              mockStore.prices as any,
              mockStore.mkrSettings as any,
              A
            )
          }
          wide={false}
          view={"payback"}
        />
        <Card
          cdp={
            new CDP(
              1543,
              5,
              20,
              mockStore.prices as any,
              mockStore.mkrSettings as any,
              A
            )
          }
          wide={false}
          view={"generate"}
        />
      </div>
    </Provider>
  ));
