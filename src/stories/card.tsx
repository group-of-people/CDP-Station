import React from "react";
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
        ethBalance: ETH("55"),
        daiBalance: ETH("132"),
        mkrBalance: ETH("77")
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
              5 * 10 ** 18,
              850 * 10 ** 18,
              mockStore.prices as any,
              mockStore.mkrSettings as any
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
              mockStore.mkrSettings as any
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
              mockStore.mkrSettings as any
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
              mockStore.mkrSettings as any
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
              mockStore.mkrSettings as any
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
              mockStore.mkrSettings as any
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
              mockStore.mkrSettings as any
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
              mockStore.mkrSettings as any
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
              mockStore.mkrSettings as any
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
              mockStore.mkrSettings as any
            )
          }
          wide={false}
          view={"generate"}
        />
      </div>
    </Provider>
  ));
