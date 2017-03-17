import { connect } from 'react-redux';
import Footer from './Footer';

const getIncompleteCount = (todos) => {
  return todos.reduce((a, t) => {
    return (t.completed) ? a : a + 1;
  }, 0);
}

const mapStateToProps = (state) => {
  return {
      incompleteCount: getIncompleteCount(state.todos),
    };
};

const SmartFooter = connect(
  mapStateToProps
)(Footer);

export default SmartFooter;
