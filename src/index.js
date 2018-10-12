import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import 'semantic-ui-css/semantic.min.css';

ReactDOM.render(
<div>
    <div>
        <App />
    </div>
</div>, document.getElementById('root'));

registerServiceWorker();