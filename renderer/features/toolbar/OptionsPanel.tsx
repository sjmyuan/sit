import React, { useState } from 'react';
import { Box, TextField } from '@mui/material';
import ColorPicker from './ColorPicker';

const ToolPanel = (): React.ReactElement => {
  const [color, setColor] = useState<string>('#FF6900');
  const [width, setWidth] = useState<number>(1);
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <ColorPicker color={color} onChange={(newColor) => setColor(newColor)} />
      <TextField
        size="small"
        required
        id="height"
        type="number"
        value={width}
        inputProps={{ padding: 0, inputMode: 'numeric', pattern: '[0-9]*' }}
        onChange={(e) => setWidth(+e.target.value)}
      />
    </Box>
  );
};

export default ToolPanel;
