import React, { PropTypes } from 'react';
import FilterLink from './FilterLink';

const Footer = ({incompleteCount}) => (
  <p>
    Show:
    {" "}
    <FilterLink filter="SHOW_ALL">
      All
    </FilterLink>
    {", "}
    <FilterLink filter="SHOW_ACTIVE">
      Active
    </FilterLink>
    {", "}
    <FilterLink filter="SHOW_COMPLETED">
      Completed
    </FilterLink>
    {" Incomplete:"}
    {incompleteCount}
  </p>
);

Footer.propTypes = {
  incompleteCount: PropTypes.number.isRequired,
};
export default Footer;
