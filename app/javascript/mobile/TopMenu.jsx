import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { List } from 'antd-mobile/2x';
import 'antd-mobile/2x/es/global';
import { MinusOutline, MoreOutline } from 'antd-mobile-icons';

const leftEntries = [<Link to="/m" key="overview">Overview</Link>];
const rightEntries = [
  <a href="/users/edit" key="edit">Edit registration</a>,
  <a href="/users/sign_out" data-method="delete" key="logout">Logout</a>];

function TopMenu(props) {
  let list = leftEntries;
  const { extraEntries } = props;
  const [menuVisible, setMenuVisible] = useState(false);
  if (extraEntries != null) {
    list = list.concat(extraEntries);
  }
  list = list.concat(rightEntries);

  if (!menuVisible) {
    return (
      <MoreOutline
        fontSize={72}
        onClick={() => {
          setMenuVisible(true);
        }}
      />
    );
  }

  return (
    <>
      <MinusOutline
        fontSize={72}
        onClick={() => {
          setMenuVisible(false);
        }}
      />
      <List>
        {list.map((l) => (<List.Item key={l.key}>{l}</List.Item>))}
      </List>
    </>
  );
}
TopMenu.propTypes = {
  extraEntries: PropTypes.arrayOf(PropTypes.node),
};
TopMenu.defaultProps = {
  extraEntries: null,
};

export default TopMenu;
