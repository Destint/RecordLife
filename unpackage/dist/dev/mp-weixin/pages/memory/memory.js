"use strict";
var common_vendor = require("../../common/vendor.js");
var common_commonFunctions = require("../../common/commonFunctions.js");
const serverDate = common_vendor.rn.importObject("serverDate");
const db = common_vendor.rn.database();
const app = getApp();
const _sfc_main = {
  data() {
    return {
      notice: common_vendor.index.getStorageSync(app.globalData.noticeCacheName) ? common_vendor.index.getStorageSync(app.globalData.noticeCacheName) : "",
      memorySum: common_vendor.index.getStorageSync(app.globalData.memorySumCacheName) ? common_vendor.index.getStorageSync(app.globalData.memorySumCacheName) : 0,
      memoryList: common_vendor.index.getStorageSync(app.globalData.memoryCacheName) ? common_vendor.index.getStorageSync(app.globalData.memoryCacheName) : [],
      isShowPopup: false,
      memoryDetail: {},
      isShowMemoryDetail: false,
      isShowAddMemory: false
    };
  },
  async onLoad() {
    let that = this;
    common_vendor.index.showLoading({
      title: "\u8F7D\u5165\u56DE\u5FC6\u4E2D",
      mask: true
    });
    if (!app.globalData.wx_openid)
      await common_commonFunctions.commonFunctions.wxLogin();
    that.getNoticeFromCloud();
    await that.getMemoryFromCloud(app.globalData.wx_openid, 0);
    common_vendor.index.hideLoading();
  },
  async onPullDownRefresh() {
    let that = this;
    try {
      common_vendor.index.showLoading({
        title: "\u66F4\u65B0\u56DE\u5FC6\u4E2D",
        mask: true
      });
      that.getNoticeFromCloud();
      await that.getMemoryFromCloud(app.globalData.wx_openid, 0);
      common_vendor.index.stopPullDownRefresh();
      common_vendor.index.hideLoading();
    } catch (e) {
    }
  },
  async onReachBottom() {
    let that = this;
    try {
      let currentIndex = that.memoryList.length;
      if (currentIndex === that.memorySum) {
        common_vendor.index.showToast({
          title: "\u56DE\u5FC6\u5230\u5E95\u5566",
          icon: "none"
        });
      } else {
        common_vendor.index.showLoading({
          title: "\u8F7D\u5165\u56DE\u5FC6\u4E2D",
          mask: true
        });
        await that.getMemoryFromCloud(app.globalData.wx_openid, currentIndex);
        common_vendor.index.hideLoading();
      }
    } catch (e) {
    }
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
      let that = this;
      try {
        await db.collection("notice").where("_id == '62f49bb51ff3ac000168404b'").get().then((res) => {
          if (res.result.errCode === 0) {
            let currentNotice = res.result.data[0].noticeList[0].notice;
            if (currentNotice !== common_vendor.index.getStorageSync(app.globalData.noticeCacheName)) {
              that.notice = currentNotice;
              common_vendor.index.setStorageSync(app.globalData.noticeCacheName, currentNotice);
            }
          }
        }).catch();
      } catch (e) {
      }
    },
    async getMemoryFromCloud(wx_openid, currentIndex) {
      let that = this;
      try {
        await db.collection("memory").where("wx_openid == '" + wx_openid + "'").get().then((res) => {
          if (res.result.errCode === 0) {
            let allMemory = res.result.data[0] ? res.result.data[0].memoryList : [];
            let currentMemory = allMemory.slice(currentIndex, currentIndex + 15);
            let memorySum = allMemory.length;
            if (currentIndex === 0) {
              that.memoryList = currentMemory;
              that.memorySum = memorySum;
              common_vendor.index.setStorageSync(app.globalData.memoryCacheName, currentMemory);
              common_vendor.index.setStorageSync(app.globalData.memorySumCacheName, memorySum);
            } else {
              that.memoryList = that.memoryList.concat(currentMemory);
            }
          }
        }).catch();
      } catch (e) {
      }
    },
    onClickMemoryCell(memory) {
      let that = this;
      that.isShowPopup = true;
      that.memoryDetail = memory;
      that.isShowMemoryDetail = true;
    },
    onClickEditorMemory(memory) {
      console.log("\u70B9\u7F16\u8F91\u7684\u56DE\u5FC6\u5185\u5BB9", memory);
      console.log("\u70B9\u51FB\u7F16\u8F91\u7684\u56DE\u5FC6id", memory.id);
    },
    onClickAddMemory() {
      let that = this;
      that.isShowPopup = true;
      that.memoryDetail = {
        title: "",
        localPicPathList: [],
        content: ""
      };
      that.isShowAddMemory = true;
    },
    onClickMemoryDetailMask() {
      let that = this;
      that.isShowMemoryDetail = false;
      that.isShowPopup = false;
      that.memoryDetail = {};
    },
    onPreviewMemoryCellPic(location, index) {
      let that = this;
      try {
        let picPathList = location === "cloud" ? that.memoryDetail.cloudPicPathList : that.memoryDetail.localPicPathList;
        let currentPic = picPathList ? picPathList[index] ? picPathList[index] : "" : "";
        let currentPicPathList = [];
        if (!currentPic)
          return;
        for (let i = 0; i < picPathList.length; i++) {
          if (picPathList[i])
            currentPicPathList.push(picPathList[i]);
        }
        common_vendor.index.previewImage({
          current: currentPic,
          urls: currentPicPathList
        });
      } catch (e) {
      }
    },
    inputMemoryTitle(event) {
      let that = this;
      that.memoryDetail.title = event.target.value;
    },
    onClickDeletePic(index) {
      let that = this;
      that.memoryDetail.localPicPathList.splice(index, 1);
    },
    async onClickAddPic() {
      let that = this;
      try {
        let localPicPathList = that.memoryDetail.localPicPathList;
        if (localPicPathList.length >= 5) {
          common_vendor.index.showToast({
            title: "\u56FE\u7247\u6700\u591A\u8BB0\u5F555\u5F20",
            icon: "none"
          });
        } else {
          let imageRes = await common_vendor.index.chooseImage({
            count: 5 - localPicPathList.length,
            sizeType: ["compressed"],
            sourceType: ["album"]
          });
          let chooseImageList = imageRes.tempFilePaths;
          for (let i = 0; i < chooseImageList.length; i++) {
            let compressRes = await common_vendor.index.compressImage({
              src: chooseImageList[i],
              quality: 80
            });
            chooseImageList[i] = compressRes.tempFilePath;
          }
          that.memoryDetail.localPicPathList = localPicPathList.concat(chooseImageList);
        }
      } catch (e) {
      }
    },
    inputMemoryContent(event) {
      let that = this;
      that.memoryDetail.content = event.target.value;
    },
    onClickAddMemoryBack() {
      let that = this;
      common_vendor.index.showModal({
        title: "\u6E29\u99A8\u63D0\u793A",
        content: "\u8FD4\u56DE\u4F1A\u6E05\u7A7A\u5F53\u524D\u6B63\u8BB0\u5F55\u7684\u56DE\u5FC6\u54E6",
        success: (res) => {
          if (res.confirm) {
            that.memoryDetail = {};
            that.isShowAddMemory = false;
            that.isShowPopup = false;
          }
        }
      });
    },
    onClickAddMemoryWrite() {
      let that = this;
      console.log("\u6DFB\u52A0\u7684\u56DE\u5FC6", that.memoryDetail);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: "overflow:" + ($data.isShowPopup ? "hidden" : "visible"),
    b: common_vendor.t($data.notice),
    c: common_vendor.t($data.memorySum),
    d: $data.memorySum > 0
  }, $data.memorySum > 0 ? {
    e: common_vendor.f($data.memoryList, (item, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.title),
        b: common_vendor.t(item.content),
        c: item.cloudPicPathList.length > 0
      }, item.cloudPicPathList.length > 0 ? {
        d: common_vendor.f(item.cloudPicPathList, (picItem, picIndex, i1) => {
          return {
            a: picItem ? picItem : "../../static/img_empty_icon.png",
            b: common_vendor.s("margin-left:" + (picIndex === 0 ? "0rpx" : "5rpx")),
            c: picIndex
          };
        })
      } : {}, {
        e: common_vendor.t(item.date + "    " + item.simpleAddress),
        f: common_vendor.o(($event) => $options.onClickEditorMemory(item)),
        g: common_vendor.s("margin-top:" + (index === 0 ? "-70rpx" : "20rpx")),
        h: common_vendor.o(($event) => $options.onClickMemoryCell(item)),
        i: index
      });
    })
  } : {}, {
    f: common_vendor.o((...args) => $options.onClickAddMemory && $options.onClickAddMemory(...args)),
    g: $data.isShowMemoryDetail === true
  }, $data.isShowMemoryDetail === true ? common_vendor.e({
    h: common_vendor.o((...args) => $options.onClickMemoryDetailMask && $options.onClickMemoryDetailMask(...args)),
    i: common_vendor.t($data.memoryDetail.title),
    j: $data.memoryDetail.cloudPicPathList.length > 0
  }, $data.memoryDetail.cloudPicPathList.length > 0 ? {
    k: common_vendor.f($data.memoryDetail.cloudPicPathList, (item, index, i0) => {
      return {
        a: item ? item : "../../static/img_empty_icon.png",
        b: common_vendor.o(($event) => $options.onPreviewMemoryCellPic("cloud", index)),
        c: common_vendor.s("margin-left:" + ((index + 1) % 5 === 1 ? "0rpx" : "10rpx") + ";margin-top:" + (index > 4 ? "5rpx" : "0rpx")),
        d: index
      };
    })
  } : {}, {
    l: $data.memoryDetail.content
  }, $data.memoryDetail.content ? {
    m: common_vendor.t($data.memoryDetail.content)
  } : {}, {
    n: $data.memoryDetail.date
  }, $data.memoryDetail.date ? {
    o: common_vendor.t($data.memoryDetail.date)
  } : {}, {
    p: $data.memoryDetail.address && $data.memoryDetail.address !== " "
  }, $data.memoryDetail.address && $data.memoryDetail.address !== " " ? {
    q: common_vendor.t($data.memoryDetail.address)
  } : {}) : {}, {
    r: $data.isShowAddMemory === true
  }, $data.isShowAddMemory === true ? common_vendor.e({
    s: common_vendor.o((...args) => $options.inputMemoryTitle && $options.inputMemoryTitle(...args)),
    t: $data.memoryDetail.localPicPathList.length > 0
  }, $data.memoryDetail.localPicPathList.length > 0 ? {
    v: common_vendor.f($data.memoryDetail.localPicPathList, (item, index, i0) => {
      return {
        a: item ? item : "../../static/img_empty_icon.png",
        b: common_vendor.o(($event) => $options.onPreviewMemoryCellPic("local", index)),
        c: common_vendor.o(($event) => $options.onClickDeletePic(index)),
        d: common_vendor.s("margin-left:" + ((index + 1) % 5 === 1 ? "0rpx" : "10rpx") + ";margin-top:" + (index > 4 ? "5rpx" : "0rpx")),
        e: index
      };
    })
  } : {}, {
    w: $data.memoryDetail.localPicPathList.length < 5
  }, $data.memoryDetail.localPicPathList.length < 5 ? {
    x: common_vendor.s("margin-left:" + ($data.memoryDetail.localPicPathList.length > 0 ? "10rpx" : "0rpx") + ";"),
    y: common_vendor.o((...args) => $options.onClickAddPic && $options.onClickAddPic(...args))
  } : {}, {
    z: common_vendor.o((...args) => $options.inputMemoryContent && $options.inputMemoryContent(...args)),
    A: common_vendor.o((...args) => $options.onClickAddMemoryBack && $options.onClickAddMemoryBack(...args)),
    B: common_vendor.o((...args) => $options.onClickAddMemoryWrite && $options.onClickAddMemoryWrite(...args))
  }) : {});
}
var MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "C:/HBuilderX/projects/RecordLife/pages/memory/memory.vue"]]);
wx.createPage(MiniProgramPage);
