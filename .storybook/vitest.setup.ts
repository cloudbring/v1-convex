import React from 'react';
import { setProjectAnnotations } from '@storybook/react-vite';
import * as projectAnnotations from './preview';

// Make React available globally for JSX in browser environment
(globalThis as any).React = React;

// Make process available globally for Next.js components in browser environment
(globalThis as any).process = {
  env: {
    NEXT_PUBLIC_APP_URL: 'https://app.convex-v1.run',
    NODE_ENV: 'test'
  }
};

// This is an important step to apply the right configuration when testing your stories.
// More info at: https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest#setprojectannotations
setProjectAnnotations([projectAnnotations]);