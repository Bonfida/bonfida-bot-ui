import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import SliderMui from '@material-ui/core/Slider';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core/styles';

const StyledSlider = withStyles({
  root: {
    height: 8,
  },
  thumb: {
    height: 24,
    width: 24,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    marginTop: -8,
    marginLeft: -12,
    '&:focus, &:hover, &$active': {
      boxShadow: 'inherit',
    },
  },
  active: {},
  valueLabel: {
    left: 'calc(-50% + 4px)',
  },
  track: {
    height: 4,
    borderRadius: 4,
    backgroundImage: 'linear-gradient(135deg, #60C0CB 18.23%, #6868FC 100%)',
  },
  rail: {
    height: 4,
    borderRadius: 4,
    backgroundImage: 'linear-gradient(135deg, #60C0CB 18.23%, #6868FC 100%)',
  },
  mark: {
    backgroundColor: 'transparent',
  },
  markLabel: {
    color: '#C8CCD6',
    fontSize: 12,
    margin: 10,
  },
})(SliderMui);

const useStyles = makeStyles({
  toolTip: {
    backgroundColor: '#7C7CFF',
    borderRadius: 2,
  },
});

interface Props {
  children: React.ReactElement;
  open: boolean;
  value: number;
}

const ValueLabelComponent = (props: Props) => {
  const { children, open, value } = props;
  const classes = useStyles();
  return (
    <Tooltip
      open={open}
      enterTouchDelay={0}
      placement="top"
      title={value}
      classes={{
        tooltip: classes.toolTip,
      }}
    >
      {children}
    </Tooltip>
  );
};

const Slider = ({
  value,
  onChange,
  valueLabelDisplay,
  max = 100,
  min = 1,
  marks,
  disabled = false,
}) => {
  return (
    <StyledSlider
      ValueLabelComponent={ValueLabelComponent}
      value={value}
      onChange={onChange}
      valueLabelDisplay={valueLabelDisplay}
      max={max}
      min={min}
      marks={marks}
      disabled={disabled}
    />
  );
};

export default Slider;
