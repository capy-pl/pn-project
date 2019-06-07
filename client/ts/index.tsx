// import css
import 'semantic-ui-css/semantic.min.css';
import 'vis/dist/vis-network.min.css';
import '../scss/main';

import React from 'react';
import { render } from 'react-dom';

import App from './pages';

document.addEventListener('DOMContentLoaded', () => {
  render(<App />, document.getElementById('root'));
});
