"use strict";
var common_vendor = require("../../common/vendor.js");
var common_commonFunctions = require("../../common/commonFunctions.js");
const serverDate = common_vendor.rn.importObject("serverDate");
const db = common_vendor.rn.database();
const app = getApp();
const _sfc_main = {
  data() {
    return {};
  },
  async onLoad() {
    let that = this;
    if (!app.globalData.wx_openid) {
      console.log(111111111);
      await common_commonFunctions.commonFunctions.wxLogin();
    }
    that.uploadAccessToCloud(app.globalData.wx_openid);
  },
  methods: {
    uploadAccessToCloud(wx_openid) {
      if (!wx_openid)
        return;
      db.collection("access").where("wx_openid == '" + wx_openid + "'").get().then(async (res) => {
        if (res.result.errCode === 0) {
          let accessList = res.result.data[0] ? res.result.data[0].accessList : [];
          let currentDateInfo = await serverDate.getCurrentDate();
          accessList.slice(0, 99);
          accessList.unshift(currentDateInfo.data.currentDate);
          if (res.result.data.length === 0) {
            db.collection("access").add({
              "wx_openid": wx_openid,
              "accessList": accessList
            }).then().catch();
          } else {
            db.collection("access").where("wx_openid == '" + wx_openid + "'").update({
              "accessList": accessList
            });
          }
        }
      }).catch();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {};
}
var MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "C:/HBuilderX/projects/RecordLife/pages/memory/memory.vue"]]);
wx.createPage(MiniProgramPage);
