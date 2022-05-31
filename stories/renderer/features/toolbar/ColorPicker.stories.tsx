import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';

import ColorPicker from '../../../../renderer/features/toolbar/ColorPicker';

export default {
  title: 'ColorPicker',
  component: ColorPicker,
} as ComponentMeta<typeof ColorPicker>;

export const Primary: ComponentStory<typeof ColorPicker> = () => (
  <ColorPicker color={'red'} onChange={(color) => {}}></ColorPicker>
);
