"use strict";
var common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {};
  },
  async onLoad() {
    await this.$onLaunched;
    console.log("3");
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {};
}
var MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "C:/HBuilderX/projects/RecordLife/pages/memory/memory.vue"]]);
wx.createPage(MiniProgramPage);
