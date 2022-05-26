import React, { useState } from 'react';
import { Box, Slider, TextField } from '@mui/material';
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
        width: 200,
        height: 30,
      }}
    >
      <ColorPicker
        color={lineProps.stroke}
        onChange={(newColor) =>
          linesState.setProps({ ...lineProps, stroke: newColor })
        }
      />

      <Box sx={{ margin: 2, flexGrow: 1 }}>
        <Slider
          size={'small'}
          aria-label="Temperature"
          defaultValue={1}
          getAriaValueText={(v) => v.toString()}
          value={lineProps.strokeWidth}
          valueLabelDisplay="auto"
          onChangeCommitted={(_e, v) => {
            if (typeof v === 'number') {
              linesState.setProps({
                ...lineProps,
                strokeWidth: v,
              });
            }
          }}
          marks
          min={1}
          max={30}
        />
      </Box>
    </Box>
  );
};

export default LineOptionsPanel;
