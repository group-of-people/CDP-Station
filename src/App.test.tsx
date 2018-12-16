import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "mobx-react";
import { Store } from "./store";
import App from "./App";

const store = new Store();

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
