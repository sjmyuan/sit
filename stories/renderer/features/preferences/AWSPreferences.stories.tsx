import React from 'react';
import { action } from '@storybook/addon-actions';
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
      imgKey="key"
      onUpload={() => {
        action('upload');
      }}
      onCancel={() => {
        action('cancel');
      }}
    ></AWSPreferences>
  );
};
