import React, { useState } from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';

import ColorPicker from '../../../../renderer/features/toolbar/ColorPicker';

export default {
  title: 'ColorPicker',
  component: ColorPicker,
} as ComponentMeta<typeof ColorPicker>;

export const PickColor: ComponentStory<typeof ColorPicker> = () => {
  const [color, setColor] = useState<string>('red');
  return <ColorPicker color={color} onChange={setColor}></ColorPicker>;
};
