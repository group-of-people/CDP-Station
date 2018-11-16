import React from "react";
import { storiesOf } from "@storybook/react";
import "sanitize.css";
import "../index.css";
import { Button } from "../ui";

storiesOf("UI", module).add("Button", () => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      padding: 10,
      backgroundColor: "#455A64"
    }}
  >
    <Button style={"primary"} onClick={() => {}}>
      Primary
    </Button>
    <div style={{ width: 10 }} />
    <Button style={"primary"} disabled onClick={() => {}}>
      Primary Disabled
    </Button>
    <div style={{ width: 10 }} />
    <Button onClick={() => {}}>Secondary</Button>
    <div style={{ width: 10 }} />
    <Button color={"red"} onClick={() => {}}>
      Secondary
    </Button>
    <div style={{ width: 10 }} />
    <Button style={"muted"} color={"gray"} onClick={() => {}}>
      Muted
    </Button>
    <div style={{ width: 10 }} />
    <div style={{ width: 10 }} />
  </div>
));
