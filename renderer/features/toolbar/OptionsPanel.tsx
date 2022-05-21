import React, { useState } from 'react';
import { Box } from '@mui/material';
import ColorPicker from './ColorPicker';

const ToolPanel = (): React.ReactElement => {
  const [color, setColor] = useState<string>('#FF6900');
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <ColorPicker color={color} onChange={(newColor) => setColor(newColor)} />
    </Box>
  );
};

export default ToolPanel;
