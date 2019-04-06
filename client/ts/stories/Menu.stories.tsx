import { storiesOf } from '@storybook/react';
import React from 'react';
import 'semantic-ui-css/semantic.min.css';
import { MemoryRouter } from 'react-router-dom';

import {
  Navbar,
  SettingMenu,
} from '../components/menu';

const stories = storiesOf('Menu', module);

stories
  .addDecorator((story) => {
    return (
      <MemoryRouter>
        {story()}
      </MemoryRouter>
    );
  })
  .add(
    'Navigation Bar', () => (
      <Navbar />
    ))
  .add('Setting Menu', () => (
    <SettingMenu />
  ));
