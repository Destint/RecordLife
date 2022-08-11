"use strict";
var common_vendor = require("../../common/vendor.js");
const serverDate = common_vendor.rn.importObject("serverDate");
const db = common_vendor.rn.database();
const app = getApp();
const _sfc_main = {
  data() {
    return {
      notice: common_vendor.index.getStorageSync(app.globalData.noticeCacheName) ? common_vendor.index.getStorageSync(app.globalData.noticeCacheName) : "",
      memorySum: 0
    };
  },
  async onLoad() {
  },
  methods: {
    async uploadAccessToCloud(wx_openid) {
      if (!wx_openid)
        return;
      try {
        await db.collection("access").where("wx_openid == '" + wx_openid + "'").get().then(async (res) => {
          if (res.result.errCode === 0) {
            let accessList = res.result.data[0] ? res.result.data[0].accessList : [];
            let currentDateInfo = await serverDate.getCurrentDate();
            accessList.slice(0, 99);
            accessList.unshift(currentDateInfo.data.currentDate);
            if (res.result.data.length === 0) {
              await db.collection("access").add({
                "wx_openid": wx_openid,
                "accessList": accessList
              }).then().catch();
            } else {
              await db.collection("access").where("wx_openid == '" + wx_openid + "'").update({
                "accessList": accessList
              });
            }
          }
        }).catch();
      } catch (e) {
      }
    },
    async getNoticeFromCloud() {
      try {
        await db.collection("notice").where("_id == '62f49bb51ff3ac000168404b'").get().then((res) => {
          if (res.result.errCode === 0) {
            let currentNotice = res.result.data[0].noticeList[0].notice;
            if (currentNotice !== common_vendor.index.getStorageSync(app.globalData.noticeCacheName)) {
              this.notice = currentNotice;
              common_vendor.index.setStorageSync(app.globalData.noticeCacheName, currentNotice);
            }
          }
        }).catch();
      } catch (e) {
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($data.notice),
    b: common_vendor.t($data.memorySum)
  };
}
var MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "C:/HBuilderX/projects/RecordLife/pages/memory/memory.vue"]]);
wx.createPage(MiniProgramPage);
