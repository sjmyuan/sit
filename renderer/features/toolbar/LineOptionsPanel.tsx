import React, { useState } from 'react';
import { Box, TextField } from '@mui/material';
import ColorPicker from './ColorPicker';
import { LinesContainer } from '../../store/LineContainer';

const LineOptionsPanel = (): React.ReactElement => {
  const linesState = LinesContainer.useContainer();
  const lineProps = linesState.props;
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: 100,
        height: 30,
      }}
    >
      <ColorPicker
        color={lineProps.stroke}
        onChange={(newColor) =>
          linesState.setProps({ ...lineProps, stroke: newColor })
        }
      />

      <Box sx={{ marginLeft: 10 }}>
        <p>width:</p>
        <TextField
          size="small"
          required
          id="height"
          type="number"
          value={lineProps.strokeWidth}
          inputProps={{
            style: { paddingTop: '0px', paddingBottom: '0px', width: '40px' },
            inputMode: 'numeric',
            pattern: '[0-9]*',
          }}
          onChange={(e) =>
            linesState.setProps({
              ...lineProps,
              strokeWidth: +e.target.value,
            })
          }
        />
      </Box>
    </Box>
  );
};

export default LineOptionsPanel;
