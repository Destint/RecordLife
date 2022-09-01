"use strict";
var common_vendor = require("./vendor.js");
const wxCloudFunctions = common_vendor.rn.importObject("wxCloudFunctions", {
  customUI: true
});
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
              "wx_openid": loginData.openid,
              "role": "ordinary",
              "avatar": "",
              "nickname": ""
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
const checkContentSecurity = async (content) => {
  try {
    const getTokenRes = await wxCloudFunctions.getAccessToken();
    if (getTokenRes.errCode !== 0) {
      return {
        errCode: -1,
        errMsg: "Token\u83B7\u53D6\u5931\u8D25"
      };
    }
    const contentSecurityRes = await wxCloudFunctions.msgSecCheck(getTokenRes.data.access_token, app.globalData.wx_openid, content);
    if (contentSecurityRes.errCode !== 0) {
      return {
        errCode: -1,
        errMsg: "\u5185\u5BB9\u5408\u89C4\u68C0\u6D4B\u5931\u8D25"
      };
    }
    if (contentSecurityRes.data.result.suggest !== "pass") {
      return {
        errCode: -1,
        errMsg: "\u5185\u5BB9\u5B58\u5728\u8FDD\u89C4\u4FE1\u606F"
      };
    }
    return {
      errCode: 0,
      errMsg: "\u68C0\u6D4B\u5B8C\u6210"
    };
  } catch (e) {
    return {
      errCode: -1,
      errMsg: "\u5185\u5BB9\u5408\u89C4\u68C0\u6D4B\u5931\u8D25"
    };
  }
};
var commonFunctions = {
  wxLogin,
  checkContentSecurity
};
exports.commonFunctions = commonFunctions;
