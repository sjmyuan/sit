import React, { useState } from 'react';
import { Box, TextField } from '@mui/material';
import ColorPicker from './ColorPicker';
import { RectsContainer } from '../../store/RectsContainer';

const RectangleOptionsPanel = (): React.ReactElement => {
  const rectsState = RectsContainer.useContainer();
  const rectProps = rectsState.props;
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
        color={rectProps.stroke}
        onChange={(newColor) =>
          rectsState.setProps({ ...rectProps, stroke: newColor })
        }
      />
      <TextField
        size="small"
        required
        id="height"
        type="number"
        value={rectProps.strokeWidth}
        inputProps={{
          style: { paddingTop: '0px', paddingBottom: '0px', width: '40px' },
          inputMode: 'numeric',
          pattern: '[0-9]*',
        }}
        onChange={(e) =>
          rectsState.setProps({
            ...rectProps,
            strokeWidth: +e.target.value,
          })
        }
      />
    </Box>
  );
};

export default RectangleOptionsPanel;
