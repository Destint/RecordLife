"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports[Symbol.toStringTag] = "Module";
var common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/memory/memory.js";
  "./pages/wish/wish.js";
  "./pages/mine/mine.js";
}
const _sfc_main = {
  onLaunch() {
    let that = this;
    that.checkForUpdate();
  },
  methods: {
    checkForUpdate() {
      const updateManager = common_vendor.index.getUpdateManager();
      updateManager.onCheckForUpdate();
      updateManager.onUpdateReady(() => {
        updateManager.applyUpdate();
      });
      updateManager.onUpdateFailed();
    }
  },
  globalData: {
    wx_openid: common_vendor.index.getStorageSync("wx_openid"),
    noticeCacheName: "notice",
    memoryCacheName: "memory",
    memorySumCacheName: "memorySum",
    cloudAvatarPathCacheName: "cloudAvatarPath",
    nicknameCacheName: "nickname",
    calendarCacheName: "calendar",
    roleCacheName: "role",
    isPraiseAppCacheName: "isPraiseApp",
    praiseAppSumCacheName: "praiseAppSum",
    wishSumCacheName: "wishSum",
    wishCacheName: "wish"
  }
};
var App = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "C:/HBuilderX/projects/RecordLife/App.vue"]]);
function createApp() {
  const app = common_vendor.createSSRApp(App);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
