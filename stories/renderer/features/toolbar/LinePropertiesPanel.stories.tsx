import React, { useState } from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';

import LinePropertiesPanel from '../../../../renderer/features/toolbar/LinePropertiesPanel';

export default {
  title: 'Line Properties Panel',
  component: LinePropertiesPanel,
} as ComponentMeta<typeof LinePropertiesPanel>;

export const SetLineProperties: ComponentStory<
  typeof LinePropertiesPanel
> = () => {
  return <LinePropertiesPanel></LinePropertiesPanel>;
};
