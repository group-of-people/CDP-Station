import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import store from './store'

//import 'semantic-ui-css/semantic.min.css';
import './semantic.cyborg.css'

ReactDOM.render(
<div>
    <div>
        <App store={store} />
    </div>
</div>, document.getElementById('root'));

registerServiceWorker();