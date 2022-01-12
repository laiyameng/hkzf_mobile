import React from "react";

// 导入路由组件：Router / Route / Link
import {
  BrowserRouter as Router,
  Route,
  // Link,
  Redirect,
} from "react-router-dom";

// 导入首页和城市选择两个组件（页面）
import Home from "./pages/Home";
import CityList from "./pages/CityList";
import Map from "./pages/Map";

// import News from "./pages/News";

// 导入要使用的组件
// import { Button } from "antd-mobile";

function App() {
  return (
    <Router>
      <div className="App">
        {/* 默认路由匹配时，跳转到/home实现路由重定向到首页 */}
        <Route exact path="/" render={() => <Redirect to="/home" />}></Route>
        {/* 配置路由 */}
        {/* Home 组件是父路由的内容 */}
        <Route path="/home" component={Home}></Route>
        <Route path="/citylist" component={CityList}></Route>
        <Route path="/map" component={Map}></Route>
        
      </div>
    </Router>
  );
}

export default App;
