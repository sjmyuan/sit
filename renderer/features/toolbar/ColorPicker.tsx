import { Box } from '@mui/material';
import React, { useState } from 'react';
import { SketchPicker } from 'react-color';

type ColorPicker = {
  color: string;
  onChange: (newColor: string) => void;
};
const ColorPicker = (props: ColorPicker): React.ReactElement => {
  const [displayColorPicker, setDisplayColorPicker] = useState<boolean>(false);
  const handleClick = () => {
    setDisplayColorPicker(!displayColorPicker);
  };
  const handleClose = () => {
    setDisplayColorPicker(false);
  };
  return (
    <Box>
      <Box
        sx={{
          padding: '2px',
          background: '#fff',
          borderRadius: '1px',
          boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
          display: 'inline-block',
          cursor: 'pointer',
        }}
        onClick={handleClick}
      >
        <Box
          sx={{
            width: '14px',
            height: '14px',
            borderRadius: '2px',
            background: props.color,
          }}
        />
      </Box>
      {displayColorPicker ? (
        <Box
          sx={{
            position: 'absolute',
            zIndex: '2',
          }}
        >
          <Box
            sx={{
              position: 'fixed',
              top: '0px',
              right: '0px',
              bottom: '0px',
              left: '0px',
            }}
            onClick={handleClose}
          />
          <SketchPicker
            color={props.color}
            onChange={(color) => props.onChange(color.hex)}
          />
        </Box>
      ) : null}
    </Box>
  );
};

export default ColorPicker;
