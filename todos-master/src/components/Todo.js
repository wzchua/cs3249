import React, { PropTypes } from 'react';

const Todo = ({ onClick, onClickRemove, completed, text }) => (
  <li>
    <div style={{
      display:'inline-flex',
    }}>
    <div
    onClick={onClick}
    style={{
      textDecoration: completed ? 'line-through' : 'none',
    }}>{text}</div>

    <div style={{
      marginLeft: '10px',
    borderColor: 'black',
    borderWidth: '1px',
    borderStyle: 'solid',
    height: '16px',
    }} 
    onClick={onClickRemove}>X</div>
    </div>
  </li>
);

Todo.propTypes = {
  onClick: PropTypes.func.isRequired,
  onClickRemove: PropTypes.func.isRequired,
  completed: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired,
};

export default Todo;
