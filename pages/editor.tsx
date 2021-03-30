import React from 'react';
import { Box } from '@material-ui/core';
import { Stage, Layer, Rect, Text } from 'react-konva';

const EditorPage = (): React.ReactElement => {
  return (
    <Box sx={{ margin: '10px', backgroundColor: 'grey', border: '1px solid' }}>
      <Stage width={1264} height={545}>
        <Layer>
          <Text text="Try click on rect" />
          <Rect
            x={20}
            y={20}
            width={50}
            height={50}
            fill="red"
            shadowBlur={5}
          />
        </Layer>
      </Stage>
    </Box>
  );
};

export default EditorPage;
