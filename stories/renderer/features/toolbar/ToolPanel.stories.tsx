import React, { useState } from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';

import ToolPanel from '../../../../renderer/features/toolbar/ToolPanel';

export default {
  title: 'Tool Panel',
  component: ToolPanel,
} as ComponentMeta<typeof ToolPanel>;

export const SelectTool: ComponentStory<typeof ToolPanel> = () => {
  return <ToolPanel onClip={() => console.log('do clip')}></ToolPanel>;
};
