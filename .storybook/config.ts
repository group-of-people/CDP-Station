import { configure } from "@storybook/react";

const req = require.context("../src/stories", true, /.tsx$/);
configure(() => {
  req.keys().forEach(filename => req(filename));
}, module);
