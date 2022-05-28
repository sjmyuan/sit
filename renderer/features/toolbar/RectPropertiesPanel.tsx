import React from 'react';
import { Box, Slider } from '@mui/material';
import ColorPicker from './ColorPicker';
import { RectsContainer } from '../../store/RectsContainer';

const RectPropertiesPanel = (): React.ReactElement => {
  const rectsState = RectsContainer.useContainer();
  const rectProps = rectsState.props;
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
        color={rectProps.stroke}
        onChange={(newColor) =>
          rectsState.setProps({ ...rectProps, stroke: newColor })
        }
      />

      <Slider
        sx={{ width: 120 }}
        size={'small'}
        aria-label="line-width"
        defaultValue={1}
        getAriaValueText={(v) => v.toString()}
        value={rectProps.strokeWidth}
        valueLabelDisplay="auto"
        onChange={(_e, v) => {
          if (typeof v === 'number') {
            rectsState.setProps({
              ...rectProps,
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

export default RectPropertiesPanel;
