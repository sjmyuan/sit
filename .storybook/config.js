import { configure } from '@storybook/react';

const req = require.context('../app/stories', true);

function loadStories() {
  req.keys().forEach(req)
}

configure(loadStories, module);
    
