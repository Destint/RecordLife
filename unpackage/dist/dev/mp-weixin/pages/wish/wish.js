"use strict";
var common_vendor = require("../../common/vendor.js");
var common_commonFunctions = require("../../common/commonFunctions.js");
const db = common_vendor.rn.database();
const serverDate = common_vendor.rn.importObject("serverDate", {
  customUI: true
});
const app = getApp();
const _sfc_main = {
  data() {
    return {
      isShowPopup: false,
      notice: common_vendor.index.getStorageSync(app.globalData.noticeCacheName) ? common_vendor.index.getStorageSync(app.globalData.noticeCacheName) : "",
      wishSum: common_vendor.index.getStorageSync(app.globalData.wishSumCacheName) ? common_vendor.index.getStorageSync(app.globalData.wishSumCacheName) : 0,
      wishList: common_vendor.index.getStorageSync(app.globalData.wishCacheName) ? common_vendor.index.getStorageSync(app.globalData.wishCacheName) : [],
      isShowAddWishView: false,
      addWishContent: ""
    };
  },
  async onLoad() {
    let that = this;
    common_vendor.index.showLoading({
      title: "\u8F7D\u5165\u5FC3\u613F\u4E2D",
      mask: true
    });
    if (!app.globalData.wx_openid)
      await common_commonFunctions.commonFunctions.wxLogin();
    await that.getWishFromCloud(app.globalData.wx_openid, 0);
    common_vendor.index.hideLoading();
  },
  async onPullDownRefresh() {
    let that = this;
    try {
      common_vendor.index.showLoading({
        title: "\u66F4\u65B0\u5FC3\u613F\u4E2D",
        mask: true
      });
      that.getNoticeFromCloud();
      await that.getWishFromCloud(app.globalData.wx_openid, 0);
      common_vendor.index.stopPullDownRefresh();
      common_vendor.index.hideLoading();
    } catch (e) {
    }
  },
  async onReachBottom() {
    let that = this;
    try {
      let currentIndex = that.wishList.length;
      if (currentIndex === that.wishSum) {
        common_vendor.index.showToast({
          title: "\u5FC3\u613F\u5230\u5E95\u5566",
          icon: "none"
        });
      } else {
        common_vendor.index.showLoading({
          title: "\u8F7D\u5165\u5FC3\u613F\u4E2D",
          mask: true
        });
        await that.getWishFromCloud(app.globalData.wx_openid, currentIndex);
        common_vendor.index.hideLoading();
      }
    } catch (e) {
    }
  },
  onShareAppMessage() {
    return {
      title: "\u8BB0\u5F55\u5173\u4E8E\u4F60\u7684\u56DE\u5FC6",
      path: "/pages/memory/memory",
      imageUrl: "https://vkceyugu.cdn.bspapp.com/VKCEYUGU-bcf64df9-4d03-4023-bc85-9000afa0f691/e989c0a9-706c-4c3c-8020-3c04a0e2344d.png"
    };
  },
  methods: {
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
    async getWishFromCloud(wx_openid, currentIndex) {
      let that = this;
      try {
        await db.collection("wish").where("wx_openid == '" + wx_openid + "'").get().then((res) => {
          if (res.result.errCode === 0) {
            let allWish = res.result.data[0] ? res.result.data[0].wishList : [];
            let currentWish = allWish.slice(currentIndex, currentIndex + 30);
            let wishSum = allWish.length;
            if (currentIndex === 0) {
              that.wishList = that.handleWishDuration(currentWish);
              that.wishSum = wishSum;
              common_vendor.index.setStorageSync(app.globalData.wishCacheName, currentWish);
              common_vendor.index.setStorageSync(app.globalData.wishSumCacheName, wishSum);
            } else {
              that.wishList = that.handleWishDuration(that.wishList.concat(currentWish));
            }
          }
        }).catch();
      } catch (e) {
      }
    },
    onClickAddWish() {
      let that = this;
      that.isShowPopup = true;
      that.isShowAddWishView = true;
      that.addWishContent = "";
    },
    onClickAddWishMask() {
      let that = this;
      that.addWishContent = "";
      that.isShowAddWishView = false;
      that.isShowPopup = false;
    },
    inputWishContent(event) {
      let that = this;
      that.addWishContent = event.target.value;
    },
    async onClickUploadWish() {
      let that = this;
      try {
        let wish = that.addWishContent;
        if (!wish) {
          common_vendor.index.showToast({
            title: "\u5FC3\u613F\u4E0D\u80FD\u4E3A\u7A7A",
            icon: "none"
          });
          return;
        }
        common_vendor.index.showModal({
          title: "\u6E29\u99A8\u63D0\u793A",
          content: "\u662F\u5426\u6DFB\u52A0\u8BE5\u5FC3\u613F",
          success: async (res) => {
            if (res.confirm) {
              common_vendor.index.showLoading({
                title: "\u6DFB\u52A0\u4E2D...",
                mask: true
              });
              let checkContentResult = await common_commonFunctions.commonFunctions.checkContentSecurity(wish);
              if (checkContentResult.errCode !== 0) {
                common_vendor.index.hideLoading();
                common_vendor.index.showModal({
                  title: "\u6E29\u99A8\u63D0\u793A",
                  content: checkContentResult.errMsg,
                  showCancel: false
                });
              } else {
                let wishObj = {};
                let currentDateInfo = await serverDate.getCurrentDate();
                wishObj.id = currentDateInfo.data.currentId;
                wishObj.content = wish;
                wishObj.startDate = currentDateInfo.data.currentDate;
                wishObj.endDate = "";
                wishObj.state = 0;
                await db.collection("wish").where("wx_openid == '" + app.globalData.wx_openid + "'").get().then(async (res2) => {
                  if (res2.result.errCode === 0) {
                    let wishList = res2.result.data[0] ? res2.result.data[0].wishList : [];
                    wishList.unshift(wishObj);
                    if (res2.result.data.length === 0) {
                      await db.collection("wish").add({
                        "wx_openid": app.globalData.wx_openid,
                        "wishList": wishList
                      }).then(() => {
                        that.wishList = that.handleWishDuration(wishList.slice(0, 30));
                        that.wishSum = wishList.length;
                        common_vendor.index.setStorageSync(app.globalData.wishCacheName, wishList.slice(0, 30));
                        common_vendor.index.setStorageSync(app.globalData.wishSumCacheName, wishList.length);
                      }).catch();
                    } else {
                      await db.collection("wish").where("wx_openid == '" + app.globalData.wx_openid + "'").update({
                        "wishList": wishList
                      }).then(() => {
                        that.wishList = that.handleWishDuration(wishList.slice(0, 30));
                        that.wishSum = wishList.length;
                        common_vendor.index.setStorageSync(app.globalData.wishCacheName, wishList.slice(0, 30));
                        common_vendor.index.setStorageSync(app.globalData.wishSumCacheName, wishList.length);
                      }).catch();
                    }
                  }
                }).catch();
                that.onClickAddWishMask();
                common_vendor.index.hideLoading();
                common_vendor.index.showToast({
                  title: "\u6DFB\u52A0\u6210\u529F",
                  icon: "none"
                });
              }
            }
          }
        });
      } catch (e) {
        that.onClickAddWishMask();
        common_vendor.index.hideLoading();
      }
    },
    onClickEditorWish(wish) {
      let that = this;
      try {
        if (wish.state === 0) {
          common_vendor.index.showActionSheet({
            itemList: ["\u5B8C\u6210\u5FC3\u613F", "\u653E\u5F03\u5FC3\u613F", "\u5220\u9664\u5FC3\u613F"],
            success: (res) => {
              if (res.tapIndex === 0)
                that.editorWish(wish, 1);
              else if (res.tapIndex === 1)
                that.editorWish(wish, -1);
              else if (res.tapIndex === 2)
                that.editorWish(wish, 0);
            },
            fail: () => {
            }
          });
        } else {
          common_vendor.index.showActionSheet({
            itemList: ["\u5220\u9664\u5FC3\u613F"],
            success: (res) => {
              if (res.tapIndex === 0)
                that.editorWish(wish, 0);
            },
            fail: () => {
            }
          });
        }
      } catch (e) {
      }
    },
    editorWish(wish, type) {
      let that = this;
      try {
        let tip = type === 0 ? "\u5220\u9664" : type === 1 ? "\u5B8C\u6210" : "\u653E\u5F03";
        common_vendor.index.showModal({
          title: "\u6E29\u99A8\u63D0\u793A",
          content: "\u786E\u5B9A" + tip + "\u8BE5\u5FC3\u613F\u5417",
          success: async (res) => {
            if (res.confirm) {
              common_vendor.index.showLoading({
                title: tip + "\u4E2D...",
                mask: true
              });
              await db.collection("wish").where("wx_openid == '" + app.globalData.wx_openid + "'").get().then(async (res2) => {
                if (res2.result.errCode === 0) {
                  let wishList = res2.result.data[0] ? res2.result.data[0].wishList : [];
                  let wishIndex = wishList.findIndex(function(object) {
                    return object.id === wish.id;
                  });
                  let currentDateInfo = await serverDate.getCurrentDate();
                  if (type === 0) {
                    wishList.splice(wishIndex, 1);
                  } else {
                    wishList[wishIndex].endDate = currentDateInfo.data.currentDate;
                    wishList[wishIndex].state = type;
                  }
                  if (wishList.length !== 0) {
                    await db.collection("wish").where("wx_openid == '" + app.globalData.wx_openid + "'").update({
                      "wishList": wishList
                    }).then().catch();
                  } else {
                    await db.collection("wish").where("wx_openid == '" + app.globalData.wx_openid + "'").remove();
                  }
                  that.wishList = that.handleWishDuration(wishList.slice(0, 30));
                  that.wishSum = wishList.length;
                  common_vendor.index.setStorageSync(app.globalData.wishCacheName, wishList.slice(0, 30));
                  common_vendor.index.setStorageSync(app.globalData.wishSumCacheName, wishList.length);
                }
              }).catch();
              common_vendor.index.hideLoading();
              common_vendor.index.showToast({
                title: "\u5DF2" + tip + "\u5FC3\u613F",
                icon: "none"
              });
            }
          }
        });
      } catch (e) {
        common_vendor.index.hideLoading();
      }
    },
    handleWishDuration(wishList) {
      try {
        for (let i = 0; i < wishList.length; i++) {
          let startDate = wishList[i].startDate;
          let endDate = wishList[i].endDate;
          let state = wishList[i].state;
          if (state !== 0 && startDate && endDate) {
            let duration = "";
            let time = (new Date(endDate.replace(/-/g, "/")).getTime() - new Date(startDate.replace(/-/g, "/")).getTime()) / 1e3;
            if (time < 60)
              duration = time.toFixed(1) + "\u79D2";
            else {
              time = time / 60;
              if (time < 60)
                duration = time.toFixed(1) + "\u5206\u949F";
              else {
                time = time / 60;
                if (time < 24)
                  duration = time.toFixed(1) + "\u5C0F\u65F6";
                else
                  duration = (time / 24).toFixed(1) + "\u5929";
              }
            }
            wishList[i].duration = duration;
          }
        }
        return wishList;
      } catch (e) {
        return wishList;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: "overflow:" + ($data.isShowPopup ? "hidden" : "visible"),
    b: common_vendor.t($data.notice),
    c: common_vendor.t($data.wishSum),
    d: $data.wishSum > 0
  }, $data.wishSum > 0 ? {
    e: common_vendor.f($data.wishList, (item, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.content),
        b: common_vendor.s("text-decoration:" + (item.state !== 0 ? "line-through" : "")),
        c: common_vendor.t(item.startDate),
        d: item.state !== 0
      }, item.state !== 0 ? {
        e: common_vendor.t(item.endDate),
        f: item.state === 1 ? "../../static/img_wish_finish_icon.png" : "../../static/img_wish_give_up_icon.png",
        g: common_vendor.t(item.duration)
      } : {}, {
        h: common_vendor.o(($event) => $options.onClickEditorWish(item)),
        i: common_vendor.s("margin-top:" + (index === 0 ? "-70rpx" : "20rpx")),
        j: index
      });
    })
  } : {}, {
    f: common_vendor.o((...args) => $options.onClickAddWish && $options.onClickAddWish(...args)),
    g: $data.isShowAddWishView === true
  }, $data.isShowAddWishView === true ? {
    h: common_vendor.o((...args) => $options.onClickAddWishMask && $options.onClickAddWishMask(...args)),
    i: common_vendor.o((...args) => $options.inputWishContent && $options.inputWishContent(...args)),
    j: common_vendor.o((...args) => $options.onClickUploadWish && $options.onClickUploadWish(...args))
  } : {});
}
var MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "C:/HBuilderX/projects/RecordLife/pages/wish/wish.vue"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
