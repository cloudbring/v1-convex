import type { StorybookConfig } from '@storybook/react-vite'
import { dirname, join } from 'path'

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')))
}

const config: StorybookConfig = {
  stories: [
    '../packages/ui/src/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    '../apps/*/src/**/*.stories.@(js|jsx|ts|tsx|mdx)'
  ],
  addons: [
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-interactions'), 
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-vitest'),
    getAbsolutePath('@storybook/addon-coverage')
  ],
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {}
  },
  features: {
    interactionsDebugger: true,
    buildStoriesJson: true
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true)
    }
  },
  viteFinal: async (config) => {
    // Add any custom Vite configuration here
    return config
  }
}

export default config