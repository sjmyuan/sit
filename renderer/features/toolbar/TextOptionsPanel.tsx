import React, { useState } from 'react';
import { Box, TextField } from '@mui/material';
import ColorPicker from './ColorPicker';
import { TextsContainer } from '../../store/TextContainer';

const TextOptionsPanel = (): React.ReactElement => {
  const textsState = TextsContainer.useContainer();
  const textProps = textsState.props;
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
        color={textProps.stroke}
        onChange={(newColor) =>
          textsState.setProps({ ...textProps, stroke: newColor })
        }
      />
      <TextField
        size="small"
        required
        id="height"
        type="number"
        value={textProps.fontSize}
        inputProps={{
          style: { paddingTop: '0px', paddingBottom: '0px', width: '40px' },
          inputMode: 'numeric',
          pattern: '[0-9]*',
        }}
        onChange={(e) =>
          textsState.setProps({
            ...textProps,
            fontSize: +e.target.value,
          })
        }
      />
    </Box>
  );
};

export default TextOptionsPanel;
