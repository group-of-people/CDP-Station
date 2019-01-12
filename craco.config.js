module.exports = {
  webpack: {
    configure: webpackConfig => {
      const newRules = webpackConfig.module.rules.slice();
      newRules[2].oneOf = [
        {
          test: /\.abi$/,
          loader: "json-loader"
        }
      ].concat(newRules[2].oneOf);
      return {
        ...webpackConfig,
        module: {
          rules: newRules
        }
      };
    }
  },
  jest: {
    configure: jestConf => {
      return {
        ...jestConf,
        moduleNameMapper: {
          ...jestConf.moduleNameMapper,
          underscore$: "lodash"
        },
        transform: {
          ...jestConf.transform,
          "^.+\\.(abi)$": "json-loader"
        },
        transformIgnorePatterns: [
          "node_modules/(?!(styled-icons)/)",
          "^.+\\.module\\.(css|sass|scss)$"
        ]
      };
    }
  }
};
