import React from 'react';

interface EmojiProps {
  emoji: string;
  className?: string;
  style?: any;
  label?: string;
}

const Emoji = (props: EmojiProps) => {
  return (
    <span
      className={props.emoji}
      style={props.style}
      role="img"
      aria-label={props.label ? props.label : ''}
      aria-hidden={props.label ? 'false' : 'true'}
    >
      {props.emoji}
    </span>
  );
};

export default Emoji;
