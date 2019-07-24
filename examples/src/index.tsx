import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import "./index.css"

// import {Minimal} from './Examples';
// ReactDOM.render(<Minimal />, document.getElementById('root'));

// import {Preload} from './Examples';
// ReactDOM.render(<Preload />, document.getElementById('root'));

// import {GapAndPadding} from './Examples';
// ReactDOM.render(<GapAndPadding />, document.getElementById('root'));

// import {SquareItems} from './Examples';
// ReactDOM.render(<SquareItems />, document.getElementById('root'));

import {Controlled} from './Examples';
ReactDOM.render(<Controlled />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
