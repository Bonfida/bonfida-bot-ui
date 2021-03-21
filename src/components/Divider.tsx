import React from 'react';

const Divider = ({
  width,
  height,
  background,
  opacity = 1,
  marginTop = 0,
  marginBottom = 0,
  marginLeft = 0,
  marginRight = 0,
}: {
  width: string;
  height: string;
  background: string;
  opacity?: number;
  marginTop?: number | string;
  marginBottom?: number | string;
  marginLeft?: number | string;
  marginRight?: number | string;
}) => {
  return (
    <div
      style={{
        width: width,
        height: height,
        background: background,
        opacity: opacity,
        marginTop: marginTop,
        marginBottom: marginBottom,
        marginLeft: marginLeft,
        marginRight: marginRight,
      }}
    />
  );
};

export default Divider;
