import React from "react";
import { observable } from "mobx";
import { Provider } from "mobx-react";
import { storiesOf } from "@storybook/react";
import "sanitize.css";
import "../index.css";

import NewCard from "../cdp/NewCard";
import Card from "../cdp/Card";
import { ETH } from "../store";
import CDP from "../store/cdp";

const mockStore = {
  balances: {
    get() {
      return {
        ethBalance: ETH("12345.1234567890123456789"),
        daiBalance: ETH("123456.1234567890123456789"),
        mkrBalance: ETH("654321.1234567890123456789")
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
  lockETH(amountETH: number, cdp: CDP) {
    this.pendingTxs.set(cdp.id, ["hash", "lock"]);
    setTimeout(() => {
      this.pendingTxs.set(cdp.id, null);
    }, 5000);
  },
  freeETH(amountETH: number, cdp: CDP) {
    this.pendingTxs.set(cdp.id, ["hash", "free"]);
    setTimeout(() => {
      this.pendingTxs.set(cdp.id, null);
    }, 5000);
  },
  repayDAI(amountETH: number, cdp: CDP) {
    this.pendingTxs.set(cdp.id, ["hash", "repay"]);
    setTimeout(() => {
      this.pendingTxs.set(cdp.id, null);
    }, 5000);
  },
  drawDAI(amountETH: number, cdp: CDP) {
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
  .add("CDP - wide", () => (
    <Provider store={mockStore}>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        <Card
          cdp={
            new CDP(
              1543,
              50000.123456789 * 10 ** 18,
              8500000.123456789 * 10 ** 18,
              mockStore.prices as any,
              mockStore.mkrSettings as any,
              "0x0000000000000000000000000000000000000000"
            )
          }
        />
        <Card
          cdp={
            new CDP(
              1543,
              5 * 10 ** 18,
              20 * 10 ** 18,
              mockStore.prices as any,
              mockStore.mkrSettings as any,
              "0x0000000000000000000000000000000000000000"
            )
          }
          view={"deposit"}
        />
        <Card
          cdp={
            new CDP(
              1543,
              5 * 10 ** 18,
              20 * 10 ** 18,
              mockStore.prices as any,
              mockStore.mkrSettings as any,
              "0x0000000000000000000000000000000000000000"
            )
          }
          view={"withdraw"}
        />
        <Card
          cdp={
            new CDP(
              1543,
              5 * 10 ** 18,
              200 * 10 ** 18,
              mockStore.prices as any,
              mockStore.mkrSettings as any,
              "0x0000000000000000000000000000000000000000"
            )
          }
          view={"payback"}
        />
        <Card
          cdp={
            new CDP(
              1543,
              5 * 10 ** 18,
              20 * 10 ** 18,
              mockStore.prices as any,
              mockStore.mkrSettings as any,
              "0x0000000000000000000000000000000000000000"
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
              5 * 10 ** 18,
              850 * 10 ** 18,
              mockStore.prices as any,
              mockStore.mkrSettings as any,
              "0x0000000000000000000000000000000000000000"
            )
          }
          wide={false}
        />
        <Card
          cdp={
            new CDP(
              1543,
              5 * 10 ** 18,
              20 * 10 ** 18,
              mockStore.prices as any,
              mockStore.mkrSettings as any,
              "0x0000000000000000000000000000000000000000"
            )
          }
          wide={false}
          view={"deposit"}
        />
        <Card
          cdp={
            new CDP(
              1543,
              5 * 10 ** 18,
              20 * 10 ** 18,
              mockStore.prices as any,
              mockStore.mkrSettings as any,
              "0x0000000000000000000000000000000000000000"
            )
          }
          wide={false}
          view={"withdraw"}
        />
        <Card
          cdp={
            new CDP(
              1543,
              5 * 10 ** 18,
              200 * 10 ** 18,
              mockStore.prices as any,
              mockStore.mkrSettings as any,
              "0x0000000000000000000000000000000000000000"
            )
          }
          wide={false}
          view={"payback"}
        />
        <Card
          cdp={
            new CDP(
              1543,
              5 * 10 ** 18,
              20 * 10 ** 18,
              mockStore.prices as any,
              mockStore.mkrSettings as any,
              "0x0000000000000000000000000000000000000000"
            )
          }
          wide={false}
          view={"generate"}
        />
      </div>
    </Provider>
  ));
