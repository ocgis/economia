import React from "react";
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import { Menu } from "antd";

const leftEntries = [<Link to={"/"} key="overview">Overview</Link>];
const rightEntries = [<a href={"/users/edit"} key="edit">Edit registration</a>,
                      <a href={"/users/sign_out"} data-method="delete" key="logout">Logout</a>];

let TopMenu = (props) => {
  let list = leftEntries;
  if (props.extraEntries != null) {
    list = list.concat(props.extraEntries);
  }
  list = list.concat(rightEntries);

    return (
        <Menu mode="horizontal">
          {list.map((l, i) => (<Menu.Item key={i}>{l}</Menu.Item>))}
        </Menu>
    );
}
TopMenu.propTypes = {
  extraEntries: PropTypes.arrayOf(PropTypes.node).isRequired,
};

export { TopMenu };
