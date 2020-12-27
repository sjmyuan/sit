import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AWSSetting from '../features/settings/AWSSetting';
import {
  selectAWSConfig,
  updateAWSConfig,
} from '../features/settings/settingsSlice';

export default function SettingPage() {
  const dispatch = useDispatch();
  const value = useSelector(selectAWSConfig);
  return (
    <AWSSetting
      config={value}
      onSubmit={(config) => {
        dispatch(updateAWSConfig(config));
      }}
    />
  );
}
