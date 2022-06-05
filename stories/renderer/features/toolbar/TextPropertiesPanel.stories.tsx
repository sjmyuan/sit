import React, { useState } from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';

import TextPropertiesPanel from '../../../../renderer/features/toolbar/TextPropertiesPanel';

export default {
  title: 'Text Properties Panel',
  component: TextPropertiesPanel,
} as ComponentMeta<typeof TextPropertiesPanel>;

export const SetTextProperties: ComponentStory<
  typeof TextPropertiesPanel
> = () => {
  return <TextPropertiesPanel></TextPropertiesPanel>;
};
