import React from "react";
import ReactDOM from "react-dom";


// 导入样式
import "antd-mobile/dist/antd-mobile.css";

// 导入样式
import "antd-mobile/dist/antd-mobile.css";

// 导入react-virtualized组件的样式
import 'react-virtualized/styles.css';

// 导入字体图标库的样式文件
import "./assets/fonts/iconfont.css";
import "./index.css";

// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById('root')
// );
// 注意: 应该将 组件 的导入放在样式导入后面，从而避免样式覆盖的问题
import App from "./App";

ReactDOM.render(<App />, document.getElementById("root"));
