import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";
import { Store } from "./store";

//import 'semantic-ui-css/semantic.min.css';
import "./semantic.cyborg.css";

window.addEventListener("load", function() {
  const store = new Store();

  ReactDOM.render(
    <div>
      <App store={store} />
    </div>,
    document.getElementById("root")
  );
});

registerServiceWorker();
