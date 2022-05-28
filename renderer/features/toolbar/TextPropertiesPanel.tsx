import React from 'react';
import { Box, Slider } from '@mui/material';
import ColorPicker from './ColorPicker';
import { TextsContainer } from '../../store/TextContainer';

const TextPropertiesPanel = (): React.ReactElement => {
  const textsState = TextsContainer.useContainer();
  const textProps = textsState.props;
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
        color={textProps.stroke}
        onChange={(newColor) =>
          textsState.setProps({ ...textProps, stroke: newColor })
        }
      />

      <Slider
        sx={{ width: 120 }}
        size={'small'}
        aria-label="font-size"
        defaultValue={1}
        getAriaValueText={(v) => v.toString()}
        value={textProps.fontSize}
        valueLabelDisplay="auto"
        onChange={(_e, v) => {
          if (typeof v === 'number') {
            textsState.setProps({
              ...textProps,
              fontSize: v,
            });
          }
        }}
        min={1}
        max={30}
      />
    </Box>
  );
};

export default TextPropertiesPanel;
