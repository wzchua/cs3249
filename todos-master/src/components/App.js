import React from 'react';
import SmartFooter from './SmartFooter';
import AddTodo from './AddTodo';
import VisibleTodoList from './VisibleTodoList';

const App = () => (
  <div>
    <AddTodo />
    <VisibleTodoList />
    <SmartFooter />
  </div>
);

export default App;
