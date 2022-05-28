import React from 'react';
import { Box, Slider } from '@mui/material';
import ColorPicker from './ColorPicker';
import { LinesContainer } from '../../store/LineContainer';

const LinePropertiesPanel = (): React.ReactElement => {
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

      <Slider
        sx={{ width: 120 }}
        size={'small'}
        aria-label="line-width"
        defaultValue={1}
        getAriaValueText={(v) => v.toString()}
        value={lineProps.strokeWidth}
        valueLabelDisplay="auto"
        onChange={(_e, v) => {
          if (typeof v === 'number') {
            linesState.setProps({
              ...lineProps,
              strokeWidth: v,
            });
          }
        }}
        min={1}
        max={30}
      />
    </Box>
  );
};

export default LinePropertiesPanel;
