import React, { useState } from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';

import RectPropertiesPanel from '../../../../renderer/features/toolbar/RectPropertiesPanel';

export default {
  title: 'Rect Properties Panel',
  component: RectPropertiesPanel,
} as ComponentMeta<typeof RectPropertiesPanel>;

export const SetRectProperties: ComponentStory<
  typeof RectPropertiesPanel
> = () => {
  return <RectPropertiesPanel></RectPropertiesPanel>;
};
