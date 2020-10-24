import React from "react";
import { Link } from "react-router-dom";
import { Menu } from "antd";

class TopMenu extends React.Component {
    render() {
        return (
            <Menu mode="horizontal">
              <Menu.Item>
                <Link to={"/"}>
                  Overview
                </Link>
              </Menu.Item>
              <Menu.Item>
                <Link to={"/etransactions/new"}>
                  New transaction
                </Link>
              </Menu.Item>
              <Menu.Item>
                <Link to={"/accounts"}>
                  Accounts
                </Link>
              </Menu.Item>
              <Menu.Item>
                <Link to={"/summary"}>
                  Summary
                </Link>
              </Menu.Item>
              <Menu.Item>
                <Link to={"/etransactions"}>
                  Transactions
                </Link>
              </Menu.Item>
              <Menu.Item>
                <a href={"/users/edit"}>
                  Edit registration
                </a>
              </Menu.Item>
              <Menu.Item>
                <a href={"/users/sign_out"} data-method="delete">
                  Logout
                </a>
              </Menu.Item>
            </Menu>
        );
    }
}

export default TopMenu;
