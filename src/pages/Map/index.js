import React from "react";
import { Link } from "react-router-dom";
import styles from "./index.module.css";

import NavHeader from "../../components/NavHeader";
import axios from "axios";
import { Toast } from "antd-mobile";

const BMapGL = window.BMapGL;
// 覆盖物样式
const labelStyle = {
  cursor: "pointer",
  border: "0px solid rgb(255,0,0)",
  padding: "0px",
  whiteSpace: "nowrap",
  fontSize: "12px",
  color: "rgb(255,255,255)",
  textAlign: "center",
};
export default class Map extends React.Component {
  state = {
    // 房源列表
    houseList: [],
    // 是否展示房源列表信息
    isShowList: false,
  };

  componentDidMount() {
    this.initMap();
  }

  // 初始化地图
  initMap() {
    /*
      1. 获取当前定位城市
      2. 使用地址解析器解析当前城市坐标
      3. 调用centerAddZoom()方法在地图中展示当前城市，并设置缩放级别为11
      4. 在地图中展示该城市，并添加比例尺和平移缩放控件
     */
    const { label, value } = JSON.parse(localStorage.getItem("hkzf_city"));

    // 初始化地图实例
    // 注意：在react脚手架中全局对象需要使用window来访问，否则会造成ESLink校验错误
    const map = new BMapGL.Map("container");
    this.map = map;

    // 创建地址解析器实例
    const myGeo = new BMapGL.Geocoder();

    // 将地址解析结果显示在地图上，并调整地图视野
    myGeo.getPoint(
      label,
      async (point) => {
        if (point) {
          // 初始化地图，同时设置展示级别
          map.centerAndZoom(point, 11);
          // map.enableScrollWheelZoom(true);
          // 添加缩放控件
          // map.addControl(new BMapGL.ZoomControl());
          // 添加比例尺控件
          map.addControl(new BMapGL.ScaleControl());
          // 调用渲染覆盖物的方法
          this.renderOverlays(value);
        }
      },
      label
    );
    // 监听地图的movestart事件，在地图移动时隐藏房源列表
    map.addEventListener("movestart", () => {
      if (this.state.isShowList) {
        this.setState({
          isShowList: false,
        });
      }
    });
  }

  // 获取房源类型以及下级地图缩放级别
  async renderOverlays(id) {
    try {
      Toast.loading("加载中...", 0, null, false);
      const res = await axios.get(`http://localhost:8080/area/map?id=${id}`);
      Toast.hide();
      const data = res.data.body;
      // 调用 getTypeAndZoom 方法获取地图缩放级别和覆盖物类别
      const { type, nextZoom } = this.getTypeAndZoom();
      data.forEach((item) => {
        // 创建覆盖物
        this.createOverlays(item, nextZoom, type);
      });
    } catch (e) {
      Toast.hide();
    }
  }

  // 创建覆盖物
  createOverlays(data, zoom, type) {
    const {
      coord: { longitude, latitude },
      label: areaName,
      count,
      value,
    } = data;
    const position = new BMapGL.Point(longitude, latitude);
    if (type === "rect") {
      // 小区
      this.createRect(position, areaName, count, value);
    } else {
      // 区或镇
      this.createCircle(position, areaName, count, value, zoom);
    }
  }
  // 创建区、镇覆盖物
  createCircle(position, name, count, id, zoom) {
    // 文本覆盖
    const label = new BMapGL.Label("", {
      position: position, // 指定文本标注所在的地理位置
      offset: new BMapGL.Size(-35, -35), // 设置文本偏移量
    });

    // 创建文本标注对象
    label.setContent(`
    <div class="${styles.bubble}">
    <p class="${styles.name}">${name}</p>
    <p>${count}套</p>
    </div>
    `);

    // 自定义文本标注样式
    label.setStyle(labelStyle);

    // 添加单击事件
    label.addEventListener("click", () => {
      // 获取当前区域下的房源信息
      this.renderOverlays(id);
      // 放大地图，以当前点击的覆盖物为中心放大地图
      this.map.centerAndZoom(position, zoom);

      // 清除当前覆盖物信息
      this.map.clearOverlays();
    });

    // 添加覆盖物到地图
    this.map.addOverlay(label);
  }

  // 创建小区覆盖物
  createRect(position, name, count, id) {
    // 文本覆盖
    const label = new BMapGL.Label("", {
      position: position, // 指定文本标注所在的地理位置
      offset: new BMapGL.Size(-50, -28), // 设置文本偏移量
    });

    // 创建文本标注对象
    label.setContent(`
        <div class="${styles.rect}">
          <span class="${styles.housename}">${name}</span>
          <span class="${styles.housenum}">${count}套</span>
          <i class="${styles.arrow}"/>
        </div>
      `);

    // 自定义文本标注样式
    label.setStyle(labelStyle);

    // 添加单击事件
    label.addEventListener("click", (e) => {
      // 获取当前区域下的房源信息
      this.getHouseList(id);
      // 调用地图的panBy()方法，移动地图到中间位置。公式：
      // 垂直位移：(window.innerHeight - 330) / 2 - target.clientY
      // 水平位移：window.innerWidth / 2 - target.clientX
      const target = e.domEvent.changedTouches[0];
      this.map.panBy(
        window.innerWidth / 2 - target.clientX,
        (window.innerHeight - 330) / 2 - target.clientY
      );
    });

    // 添加覆盖物到地图
    this.map.addOverlay(label);
  }
  // 获取小区房源数据
  async getHouseList(id) {
    try {
      Toast.loading("加载中...", 0, null, false);
      const res = await axios.get(`http://localhost:8080/houses?cityId=${id}`);
      Toast.hide();
      this.setState({
        houseList: res.data.body.list,
        isShowList: true,
      });
    } catch (e) {
      Toast.hide();
    }
  }

  /**
   * 获取地图缩放级别、覆盖物类别（根据缩放级别来得到）
   * 区： 11，范围： >=10 <12
   * 镇： 13，范围： >=12 <14
   * 小区： 15，范围： >=14 <16
   */
  getTypeAndZoom() {
    const zoom = this.map.getZoom();
    let nextZoom, type;
    if (zoom >= 10 && zoom < 12) {
      // 区
      type = "circle";
      nextZoom = 13;
    } else if (zoom >= 12 && zoom < 14) {
      // 镇
      type = "circle";
      nextZoom = 15;
    } else if (zoom >= 14 && zoom < 16) {
      // 小区
      type = "rect";
    }
    return { type, nextZoom };
  }

  // 渲染房屋列表的方法封装
  renderHouseList() {
    return (
      <div className={styles.houseItems}>
        {/* 房屋结构 */}
        {this.state.houseList.map((item) => (
          <div className={styles.house} key={item.houseCode}>
            <div className={styles.imgWrap}>
              <img
                className={styles.img}
                src={`http://localhost:8080${item.houseImg}`}
                alt=""
              />
            </div>
            <div className={styles.content}>
              <h3 className={styles.title}>{item.title}</h3>
              <div className={styles.desc}>{item.desc}</div>
              <div className={styles.tags}>
                {item.tags.map((tag, index) => {
                  const tagClass = "tag" + (index + 1);
                  return (
                    <span
                      className={[styles.tag, styles[tagClass]].join(" ")}
                      key={tag}
                    >
                      {tag}
                    </span>
                  );
                })}
              </div>
              <div className={styles.price}>
                <span className={styles.priceNum}>{item.price}</span>元/月
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  render() {
    return (
      <div className={styles.map}>
        <NavHeader>地图找房</NavHeader>
        {/* 地图容器元素 */}
        <div id="container" className={styles.container} />

        {/* 房源列表 */}
        {/* 添加styles.show展示房屋列表 */}
        <div
          className={[
            styles.houseList,
            this.state.isShowList ? styles.show : "",
          ].join(" ")}
        >
          <div className={styles.titleWrap}>
            <h1 className={styles.listTitle}>房屋列表</h1>
            <Link className={styles.listMore} to="/home/list">
              更多房源
            </Link>
          </div>

          {/* 调用渲染房源列表的方法 */}
          {this.renderHouseList()}
        </div>
      </div>
    );
  }
}
