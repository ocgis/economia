import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Menu } from 'antd';

const leftEntries = [<Link to="/" key="overview">Overview</Link>];
const rightEntries = [
  <a href="/users/edit" key="edit">Edit registration</a>,
  <a href="/users/sign_out" data-method="delete" key="logout">Logout</a>];

function TopMenu(props) {
  let list = leftEntries;
  const { extraEntries } = props;
  if (extraEntries != null) {
    list = list.concat(extraEntries);
  }
  list = list.concat(rightEntries);

  return (
    <Menu mode="horizontal">
      {list.map((l) => (<Menu.Item key={l.key}>{l}</Menu.Item>))}
    </Menu>
  );
}
TopMenu.propTypes = {
  extraEntries: PropTypes.arrayOf(PropTypes.node),
};
TopMenu.defaultProps = {
  extraEntries: null,
};

export default TopMenu;
