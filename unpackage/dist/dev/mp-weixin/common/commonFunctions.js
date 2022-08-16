"use strict";
var common_vendor = require("./vendor.js");
const wxCloudFunctions = common_vendor.rn.importObject("wxCloudFunctions");
const db = common_vendor.rn.database();
const app = getApp();
const wxLogin = async () => {
  let loginState = -1;
  let loginMsg = "";
  let loginData = {};
  try {
    await common_vendor.index.login({
      provider: "weixin"
    }).then(async (loginRes) => {
      const loginInfo = await wxCloudFunctions.login(loginRes.code);
      loginState = loginInfo.errCode;
      loginMsg = loginInfo.errMsg;
      loginData = loginInfo.data;
    }).catch((loginErr) => {
      loginMsg = loginErr;
    });
    if (loginState !== 0) {
      common_vendor.index.showModal({
        title: "\u767B\u5F55\u5931\u8D25",
        content: loginMsg,
        showCancel: false
      });
    } else {
      await db.collection("user").where("wx_openid == '" + loginData.openid + "'").get().then(async (res) => {
        if (res.result.errCode === 0) {
          if (res.result.data.length === 0) {
            await db.collection("user").add({
              "wx_openid": loginData.openid
            }).then((res2) => {
              common_vendor.index.setStorageSync("wx_openid", loginData.openid);
              app.globalData.wx_openid = loginData.openid;
            }).catch();
          } else {
            common_vendor.index.setStorageSync("wx_openid", loginData.openid);
            app.globalData.wx_openid = loginData.openid;
          }
        }
      }).catch();
    }
  } catch (e) {
  }
};
var commonFunctions = {
  wxLogin
};
exports.commonFunctions = commonFunctions;
