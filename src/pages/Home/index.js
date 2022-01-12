import React from "react";
import { Route } from "react-router-dom";
import { TabBar } from "antd-mobile";

import Index from "../Index";
import News from "../News";
import HouseList from "../HouseList";
import Profile from "../Profile";

import "./index.css";

// TabBar数据
const tabItems = [
  {
    title: "首页",
    icon: "icon-ind",
    path: "/home",
  },
  {
    title: "找房",
    icon: "icon-findHouse",
    path: "/home/list",
  },
  {
    title: "资讯",
    icon: "icon-infom",
    path: "/home/news",
  },
  {
    title: "我的",
    icon: "icon-my",
    path: "/home/profile",
  },
];

/**
 * 问题：点击首页导航菜单，导航到对应页面时，菜单没有高亮
 *
 * 原因：原来我们实现功能时，只考虑了 点击以及第一次加载Home组件 的情况。但是我们没有
 * 考虑不重新加载Home组件的路由切换
 *
 * 解决：
 *    思路：在路由切换时，也执行菜单高亮的逻辑代码
 *    1. 添加componentDidUpdate钩子函数
 *    2. 在钩子函数中判断路由地址是否切换(因为路由信息是通过props传递给组件的，
 *        所以，通过比较更新前后的两个props判断)
 *    3. 在路由地址切换时，让菜单高亮
 */
export default class Home extends React.Component {
  state = {
    // 默认选中的TabBar菜单项
    selectedTab: this.props.location.pathname,
  };

  componentDidUpdate(prevProps) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.setState({
        selectedTab: this.props.location.pathname,
      });
    }
  }

  // 渲染TabBar.item
  rendertabBarItem() {
    return tabItems.map((item) => (
      <TabBar.Item
        title={item.title}
        key={item.title}
        icon={<i className={`iconfont ${item.icon}`} />}
        selectedIcon={<i className={`iconfont ${item.icon}`} />}
        selected={this.state.selectedTab === item.path}
        onPress={() => {
          this.setState({
            selectedTab: item.path,
          });
          // 路由切换
          this.props.history.push(item.path);
        }}
      />
    ));
  }

  render() {
    return (
      <div className="home">
        <Route exact path="/home" component={Index}></Route>
        <Route path="/home/news" component={News}></Route>
        <Route path="/home/list" component={HouseList}></Route>
        <Route path="/home/profile" component={Profile}></Route>

        <TabBar tintColor="#21b97a" noRenderContent={true} barTintColor="white">
          {this.rendertabBarItem()}
        </TabBar>
      </div>
    );
  }
}
