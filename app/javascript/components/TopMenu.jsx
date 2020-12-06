import React from "react";
import { Link } from "react-router-dom";
import { Menu } from "antd";

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

let leftEntries = [<Link to={"/"}>Overview</Link>];
let rightEntries = [<a href={"/users/edit"}>Edit registration</a>,
                     <a href={"/users/sign_out"} data-method="delete">Logout</a>];

export { TopMenu };
