"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports[Symbol.toStringTag] = "Module";
var common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/memory/memory.js";
}
const _sfc_main = {
  onLaunch() {
    let that = this;
    this.checkForUpdate();
    console.log("1");
    setTimeout(() => {
      that.$isResolve();
    }, 2e3);
    console.log("2");
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
  globalData: {}
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
