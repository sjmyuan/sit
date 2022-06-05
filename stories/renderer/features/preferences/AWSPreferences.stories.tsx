import React, { useState } from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';

import AWSPreferences from '../../../../renderer/features/preferences/AWSPreferences';

export default {
  title: 'AWSPreferences',
  component: AWSPreferences,
  argTypes: { onUpload: { action: 'upload' }, onCancel: { action: 'cancel' } },
} as ComponentMeta<typeof AWSPreferences>;

export const SetAWS: ComponentStory<typeof AWSPreferences> = () => {
  return (
    <AWSPreferences
      key="key"
      onUpload={() => {
        console.log('upload');
      }}
      onCancel={() => {
        console.log('cancel');
      }}
    ></AWSPreferences>
  );
};
