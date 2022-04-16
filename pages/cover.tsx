import React, { useEffect } from 'react';
import type { NextPage } from 'next';
import { remote } from 'electron';
import { Box } from '@mui/material';

const CoverPage: NextPage = () => {
  useEffect(() => {
    const handleUserKeyUp = (_: { ctrlKey: boolean; keyCode: number }) => {
      remote.getCurrentWindow().close();
    };
    window.addEventListener('keyup', handleUserKeyUp);
    return () => {
      window.removeEventListener('keyup', handleUserKeyUp);
    };
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'red',
        opacity: 0.5,
        cursor: 'none',
        zIndex: 1000,
      }}
    />
  );
};

export default CoverPage;
