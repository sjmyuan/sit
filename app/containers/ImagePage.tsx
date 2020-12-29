import React from 'react';
import * as O from 'fp-ts/Option';
import { useSelector } from 'react-redux';
import ImageBrowser from '../features/images/ImageBrowser';
import { selectAWSConfig } from '../features/settings/settingsSlice';

export default function ImagePage() {
  const value = useSelector(selectAWSConfig);
  if (O.isNone(value)) {
    return <div>There is no AWS credentials</div>;
  }
  return <ImageBrowser config={value.value} />;
}
