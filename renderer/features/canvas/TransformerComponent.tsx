import React, { useRef, useEffect } from 'react';
import { Transformer } from 'react-konva';
import Konva from 'konva';
import { KonvaEventListener } from 'konva/types/Node';
import { SitShape } from '../../types';

type TransformerComponentProps = {
  selectedShape: SitShape;
};

const TransformerComponent = (props: TransformerComponentProps) => {
  const transformerRef = useRef<Konva.Transformer>(null);
  const checkNode = () => {
    const transformer = transformerRef.current;
    const stage = transformer.getStage();
    const { selectedShape } = props;

    const selectedNode = stage.findOne(`.${selectedShape.name}`);
    if (transformer.findOne(`.${selectedShape.name}`)) {
      return;
    }

    if (selectedNode) {
      transformer.attachTo(selectedNode);
    } else {
      transformer.detach();
    }
    transformer.getLayer().batchDraw();
  };

  useEffect(() => {
    checkNode();
    const transformer = transformerRef.current;
    transformer.find('Rect').each((x) => {
      const rect = x as Konva.Rect;
      rect.fill('white');
      rect.width(9);
      rect.height(9);
      rect.cornerRadius(1);
    });
    transformer.find('Shape').each((x) => {
      const shape = x as Konva.Shape;
      shape.stroke('#f3f4f4');
      shape.strokeWidth(1);
    });
  });

  useEffect(() => {
    checkNode();
  }, [props.selectedShape]);
  return (
    <Transformer ref={transformerRef} keepRatio={false} rotateEnabled={false} />
  );
};

export default TransformerComponent;
