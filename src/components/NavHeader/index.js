import React from "react";
import { NavBar } from "antd-mobile";

import { withRouter } from "react-router-dom";

import PropTypes from "prop-types";

// 导入样式
import styles from "./index.module.css"

function NavHeader({ children, history, onLeftClick }) {
  // 默认的点击行为
  const defaultHandler = () => history.go(-1);
  return (
    <NavBar
      className={styles.NavBar}
      mode="light"
      icon={<i className="iconfont icon-back" />}
      onLeftClick={onLeftClick || defaultHandler}
    >
      {children}
    </NavBar>
  );
}

// 添加props校验
NavHeader.propTypes = {
  children: PropTypes.string.isRequired,
  onLeftClick: PropTypes.func,
};

export default withRouter(NavHeader);
