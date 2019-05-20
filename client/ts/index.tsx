// import css
import 'semantic-ui-css/semantic.min.css';
import '../scss/main';
import 'vis/dist/vis-network.min.css';

import React from 'react';
import { render } from 'react-dom';

import App from './App';

document.addEventListener('DOMContentLoaded', () => {
  render(<App />, document.getElementById('root'));
});
