module.exports = {
  components: "src/ui/**/*.{js,jsx,ts,tsx}",
  propsParser: require("react-docgen-typescript").parse,
  webpackConfig: require("react-scripts/config/webpack.config.dev")
};
