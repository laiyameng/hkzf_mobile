import React from "react";
import axios from "axios";
import { Toast } from "antd-mobile";
import "./index.scss";
// 导入 utils
import { getCurrentCity } from "../../utils";
import { List, AutoSizer } from "react-virtualized";

import NavHeader from "../../components/NavHeader"

// 索引的高度
const TITLE_HEIGHT = 36;
// 每个城市名称的高度
const NAME_HEIGHT = 50;
// 有房源的城市
const HOUSE_CITY = ["北京", "上海", "广州", "深圳"];

const formatCityIndex = (letter) => {
  switch (letter) {
    case "#":
      return "当前城市";
    case "hot":
      return "热门城市";
    default:
      return letter.toUpperCase();
  }
};

export default class CityList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cityList: {},
      cityIndex: [],
      // 右侧列表高亮的索引
      activeIndex: 0,
    };
    // 创建ref对象
    this.cityListComponent = React.createRef();
  }

  // 数据格式化的方法
  formatCityData = (list) => {
    const cityList = {};
    // 遍历list数据
    list.forEach((item) => {
      // 获取城市拼音的首字母
      const first = item.short.substr(0, 1);
      // 如果cityList中有该分类，push
      if (cityList[first]) {
        cityList[first].push(item);
      } else {
        // 如果cityList中没有该分类，创建一个数组
        cityList[first] = [item];
      }
    });
    // 获取索引数据
    const cityIndex = Object.keys(cityList).sort();
    return {
      cityList,
      cityIndex,
    };
  };

  // 获取城市列表数据
  async getCityList() {
    const res = await axios.get("http://localhost:8080/area/city?level=1");
    // 将数据转换成我们需要的数据格式
    const { cityList, cityIndex } = this.formatCityData(res.data.body);

    /* 
      1. 获取热门城市数据
      2. 将数据添加到cityList中
      3. 将索引添加到cityIndex中
    */
    const hotRes = await axios.get("http://localhost:8080/area/hot");
    cityList["hot"] = hotRes.data.body;
    // 将索引添加到cityIndex的起始位置
    cityIndex.unshift("hot");

    /* 
      获取当前定位城市数据
    */
    const curCity = await getCurrentCity();
    cityList["#"] = [curCity];
    // 将索引添加到cityIndex的起始位置
    cityIndex.unshift("#");
    this.setState({
      cityList,
      cityIndex,
    });
  }

  // 查询房源信息
  changeCity({ label, value }) {
    if (HOUSE_CITY.indexOf(label) > -1) {
      localStorage.setItem("hkzf_city", JSON.stringify({ label, value }));
      this.props.history.go(-1);
    } else {
      Toast.info("该城市暂无房源信息", 2 , null , false);
    }
  }
  // 列表数据渲染函数，返回值为页面展示的内容
  rowRenderer = ({
    key, // Unique key within array of rows
    index, // 索引号
    isScrolling, // 当前项的状态是否在滚动中
    isVisible, // 当前项在list中是可见的
    style, // 注意：重点属性，每行数据都需要添加该属性！作用：指定每一行的位置
  }) => {
    // 获取每一行的字母
    const { cityIndex, cityList } = this.state;
    const letter = cityIndex[index];
    return (
      <div key={key} style={style} className="city">
        <div className="title">{formatCityIndex(letter)}</div>
        {cityList[letter].map((item) => (
          <div
            className="name"
            key={item.value}
            onClick={() => {
              this.changeCity(item);
            }}
          >
            {item.label}
          </div>
        ))}
      </div>
    );
  };

  // 动态计算每一行高度的方法
  getRowHeight = ({ index }) => {
    const { cityList, cityIndex } = this.state;
    // 行高=标题高度+城市名高度*城市数
    const rowHeight =
      TITLE_HEIGHT + NAME_HEIGHT * cityList[cityIndex[index]].length;
    return rowHeight;
  };

  // 右侧索引渲染方法
  renderCityIndex() {
    const { cityIndex, activeIndex } = this.state;
    return cityIndex.map((item, index) => (
      /*
        1. 索引列表绑定点击事件，获取索引index
        2. 调用List组件的scrollToRow方法，让List组件滚动到指定行
          2.1 在constructor中，调用React.createRef()创建ref对象
          2.2 将创建好的ref对象添加到List组件的ref属性
          2.3 通过ref的current属性获取到当前实例，调用scrollToRow方法
        3. 设置List组件的scrollToAlignment配置项值为start（保证被点击行出现在页面顶部）
        4. 对于点击索引无法正确定位的问题，调用List组件的measureAllRows方法，提前计算高度来解决
       */
      <li
        key={item}
        className="city-index-item"
        onClick={() => {
          this.cityListComponent.current.scrollToRow(index);
        }}
      >
        <span className={activeIndex === index ? "index-active" : ""}>
          {item === "hot" ? "热" : item.toUpperCase()}
        </span>
      </li>
    ));
  }
  onRowsRendered = ({ startIndex }) => {
    const { activeIndex } = this.state;
    // 判断startIndex和activeIndex的值是否相同，不同时，更新activeIndex为startIndex
    if (startIndex !== activeIndex) {
      this.setState({
        activeIndex: startIndex,
      });
    }
  };

  async componentDidMount() {
    await this.getCityList();
    // 调用measureAllRows，提前计算List中每一行的高度，实现scrollToRow的精确跳转
    // 注意：调用该方法时需保证List组件中已经有数据
    this.cityListComponent.current.measureAllRows();
  }

  render() {
    return (
      <div className="citylist">
        <NavHeader>
        城市选择
        </NavHeader>
        {/* 城市列表*/}
        <AutoSizer>
          {({ height, width }) => (
            <List
              ref={this.cityListComponent}
              width={width}
              height={height}
              rowCount={this.state.cityIndex.length}
              rowHeight={this.getRowHeight}
              rowRenderer={this.rowRenderer}
              onRowsRendered={this.onRowsRendered}
              scrollToAlignment="start"
            />
          )}
        </AutoSizer>

        <ul className="city-index">{this.renderCityIndex()}</ul>
      </div>
    );
  }
}
