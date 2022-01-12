// 导入axios
import axios from "axios";

export const getCurrentCity = () => {
  // 判断localStorage中是否有定位城市
  const localCity = JSON.parse(localStorage.getItem("hkzf_city"));
  // 如果没有，就获取到当前城市名称，并存储到本地缓存中，然后返回该城市数据
  if (!localCity) {
    return new Promise((resolve, reject) => {
      // 通过IP定位获取到当前城市名称
      const curCity = new window.BMapGL.LocalCity();
      curCity.get(async (res) => {
        try {
          const result = await axios.get(
            `http://localhost:8080/area/info?name=${res.name}`
          );
          // 存储到本地缓存
          localStorage.setItem("hkzf_city", JSON.stringify(result.data.body));
          resolve(result.data.body);
        } catch (e) {
          // 获取城市定位失败
          reject(e);
        }
      });
    });
  }
  // 如果有直接返回本地存储中的城市数据
  // 注意为了保持统一，此处也使用Promise
  else {
    return new Promise((resolve, reject) => {
      resolve(localCity);
    });
  }
};
