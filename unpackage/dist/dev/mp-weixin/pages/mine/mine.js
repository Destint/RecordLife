"use strict";
var common_vendor = require("../../common/vendor.js");
var common_commonFunctions = require("../../common/commonFunctions.js");
const app = getApp();
const db = common_vendor.pn.database();
const serverDate = common_vendor.pn.importObject("serverDate", {
  customUI: true
});
const handleCloudStorage = common_vendor.pn.importObject("handleCloudStorage", {
  customUI: true
});
const _sfc_main = {
  data() {
    return {
      isShowPopup: false,
      cloudAvatarPath: common_vendor.index.getStorageSync(app.globalData.cloudAvatarPathCacheName) ? common_vendor.index.getStorageSync(app.globalData.cloudAvatarPathCacheName) : "",
      nickname: common_vendor.index.getStorageSync(app.globalData.nicknameCacheName) ? common_vendor.index.getStorageSync(app.globalData.nicknameCacheName) : "\u8BF7\u8BBE\u7F6E\u6635\u79F0",
      calendar: common_vendor.index.getStorageSync(app.globalData.calendarCacheName) ? common_vendor.index.getStorageSync(app.globalData.calendarCacheName) : {},
      role: common_vendor.index.getStorageSync(app.globalData.roleCacheName) ? common_vendor.index.getStorageSync(app.globalData.roleCacheName) : "ordinary",
      isShowSetNicknameView: false,
      setNicknameContent: "",
      isShowSetNoticeView: false,
      setNoticeContent: "",
      isShowOtherFunctionView: false,
      otherFunctionTitle: "",
      otherFunctionContent: "",
      isShowAboutApp: false,
      aboutAppContent: "\u8FD9\u662F\u4E00\u4E2A\u53EF\u4EE5\u300A\u7559\u4F4F\u56DE\u5FC6\u300B\u7684\u5C0F\u7A0B\u5E8F\u3002\n\u53EF\u9009\u7684\u9700\u8981\u5C0F\u7A0B\u5E8F\u6388\u6743\u7684\u529F\u80FD\uFF1A\n1\u3001\u5F00\u542F\u5B9A\u4F4D\u540E\uFF0C\u53EF\u5728\u8BB0\u5F55\u56DE\u5FC6\u65F6\u8BB0\u4E0B\u4F4D\u7F6E\u4E0E\u5929\u6C14\u3002\n2\u3001\u53EF\u4ECE\u76F8\u518C\u4E2D\u9009\u62E9\u60F3\u8981\u7684\u56FE\u7247\u4E00\u540C\u8BB0\u5F55\u3002\n\u5982\u679C\u60A8\u5728\u4F7F\u7528\u5C0F\u7A0B\u5E8F\u65F6\u9047\u5230\u4EFB\u4F55\u95EE\u9898\u6216\u8005\u60A8\u5BF9\u5C0F\u7A0B\u5E8F\u6709\u66F4\u597D\u7684\u5EFA\u8BAE\u6216\u60F3\u6CD5\uFF0C\u6B22\u8FCE\u901A\u8FC7\u300A\u8054\u7CFB\u5BA2\u670D\u300B\u529F\u80FD\u6765\u5411\u5F00\u53D1\u8005\u53CD\u9988\u3002",
      isPraiseApp: common_vendor.index.getStorageSync(app.globalData.isPraiseAppCacheName) ? common_vendor.index.getStorageSync(app.globalData.isPraiseAppCacheName) : false,
      praiseAppSum: common_vendor.index.getStorageSync(app.globalData.praiseAppSumCacheName) ? common_vendor.index.getStorageSync(app.globalData.praiseAppSumCacheName) : 0
    };
  },
  async onLoad() {
    let that = this;
    common_vendor.index.showLoading({
      title: "\u52A0\u8F7D\u4E2D",
      mask: true
    });
    if (!app.globalData.wx_openid)
      await common_commonFunctions.commonFunctions.wxLogin();
    await that.getUserInfoFromCloud(app.globalData.wx_openid);
    await that.getCalendarInfo();
    common_vendor.index.hideLoading();
  },
  onShareAppMessage() {
    return {
      title: "\u8BB0\u5F55\u5173\u4E8E\u4F60\u7684\u56DE\u5FC6",
      path: "/pages/memory/memory",
      imageUrl: "https://vkceyugu.cdn.bspapp.com/VKCEYUGU-bcf64df9-4d03-4023-bc85-9000afa0f691/e989c0a9-706c-4c3c-8020-3c04a0e2344d.png"
    };
  },
  methods: {
    async getUserInfoFromCloud(wx_openid) {
      let that = this;
      try {
        await db.collection("user").where("wx_openid == '" + wx_openid + "'").get().then((res) => {
          if (res.result.errCode === 0) {
            let userInfo = res.result.data[0];
            that.cloudAvatarPath = userInfo.avatar ? userInfo.avatar : "";
            that.nickname = userInfo.nickname ? userInfo.nickname : "\u8BF7\u8BBE\u7F6E\u6635\u79F0";
            that.role = userInfo.role ? userInfo.role : "ordinary";
            common_vendor.index.setStorageSync(app.globalData.cloudAvatarPathCacheName, userInfo.avatar);
            common_vendor.index.setStorageSync(app.globalData.nicknameCacheName, userInfo.nickname);
            common_vendor.index.setStorageSync(app.globalData.roleCacheName, userInfo.role);
          }
        }).catch();
      } catch (e) {
      }
    },
    async getCalendarInfo() {
      let that = this;
      try {
        let currentDateInfo = await serverDate.getCurrentDate();
        let currentDate = currentDateInfo.data.currentDate.slice(0, 10);
        let calendarCache = common_vendor.index.getStorageSync(app.globalData.calendarCacheName);
        if (calendarCache && calendarCache.date === currentDate)
          return;
        let calendarRes = await common_vendor.index.request({
          url: "https://api.djapi.cn/wannianli/get",
          data: {
            date: currentDate,
            cn_to_unicode: "1",
            token: "37555a616248cb486ca0e60c10eca164",
            datatype: "json"
          }
        });
        let calendarInfo = calendarRes.data.Result;
        let calendar = {};
        calendar.date = currentDate;
        calendar.year = calendarInfo.nianci.slice(0, 3);
        calendar.month = calendarInfo.nianci.slice(3, 6);
        calendar.day = calendarInfo.nianci.slice(6, 9);
        calendar.zodiac = calendarInfo.shengxiao;
        calendar.lunar = calendarInfo.nongli.slice(3, 7);
        calendar.solarTerm = calendarInfo.jieqi;
        calendar.suitable = calendarInfo.do;
        calendar.tapu = calendarInfo.nodo;
        that.calendar = calendar;
        common_vendor.index.setStorageSync(app.globalData.calendarCacheName, calendar);
      } catch (e) {
      }
    },
    async onClickSetAvatar() {
      let that = this;
      try {
        let imageRes = await common_vendor.index.chooseImage({
          count: 1,
          sizeType: ["compressed"],
          sourceType: ["album"]
        });
        common_vendor.index.showLoading({
          title: "\u8BBE\u7F6E\u4E2D...",
          mask: true
        });
        let chooseImageList = imageRes.tempFilePaths;
        let compressRes = await common_vendor.index.compressImage({
          src: chooseImageList[0],
          quality: 80
        });
        chooseImageList[0] = compressRes.tempFilePath;
        await common_vendor.pn.uploadFile({
          filePath: chooseImageList[0],
          cloudPath: app.globalData.wx_openid + ".avatar.jpg"
        }).then(async (res) => {
          let cloudAvatarPath = res.fileID;
          that.cloudAvatarPath = cloudAvatarPath;
          common_vendor.index.setStorageSync(app.globalData.cloudAvatarPathCacheName, cloudAvatarPath);
          await db.collection("user").where("wx_openid == '" + app.globalData.wx_openid + "'").get().then(async (res2) => {
            if (res2.result.errCode === 0) {
              let avatar = res2.result.data[0] ? res2.result.data[0].avatar : "";
              let fileList = [];
              if (avatar) {
                fileList.push(avatar);
                await handleCloudStorage.deleteCloudFiles(fileList);
              }
            }
          }).catch();
          await db.collection("user").where("wx_openid == '" + app.globalData.wx_openid + "'").update({
            "avatar": cloudAvatarPath
          }).then().catch();
        }).catch();
        common_vendor.index.hideLoading();
      } catch (e) {
        common_vendor.index.hideLoading();
      }
    },
    onClickSetNickname() {
      let that = this;
      that.isShowPopup = true;
      that.isShowSetNicknameView = true;
      that.setNicknameContent = "";
    },
    onClickSetNicknameMask() {
      let that = this;
      that.setNicknameContent = "";
      that.isShowSetNicknameView = false;
      that.isShowPopup = false;
    },
    inputNicknameContent(event) {
      let that = this;
      that.setNicknameContent = event.target.value;
    },
    async onClickUploadNickname() {
      let that = this;
      try {
        let nickname = that.setNicknameContent;
        if (!nickname) {
          common_vendor.index.showToast({
            title: "\u6635\u79F0\u4E0D\u80FD\u4E3A\u7A7A",
            icon: "none"
          });
          return;
        }
        common_vendor.index.showModal({
          title: "\u6E29\u99A8\u63D0\u793A",
          content: "\u662F\u5426\u8BBE\u7F6E\u8BE5\u6635\u79F0",
          success: async (res) => {
            if (res.confirm) {
              common_vendor.index.showLoading({
                title: "\u8BBE\u7F6E\u4E2D...",
                mask: true
              });
              await db.collection("user").where("wx_openid == '" + app.globalData.wx_openid + "'").update({
                "nickname": nickname
              }).then((res2) => {
                that.nickname = nickname;
                common_vendor.index.setStorageSync(app.globalData.nicknameCacheName, nickname);
                that.onClickSetNicknameMask();
                common_vendor.index.hideLoading();
                common_vendor.index.showToast({
                  title: "\u8BBE\u7F6E\u6210\u529F",
                  icon: "none"
                });
              }).catch((err) => {
                that.onClickSetNicknameMask();
                common_vendor.index.hideLoading();
              });
            }
          }
        });
      } catch (e) {
        that.onClickSetNicknameMask();
        common_vendor.index.hideLoading();
      }
    },
    onClickSetNotice() {
      let that = this;
      that.isShowPopup = true;
      that.isShowSetNoticeView = true;
      that.setNoticeContent = "";
    },
    onClickSetNoticeMask() {
      let that = this;
      that.setNoticeContent = "";
      that.isShowSetNoticeView = false;
      that.isShowPopup = false;
    },
    inputNoticeContent(event) {
      let that = this;
      that.setNoticeContent = event.target.value;
    },
    async onClickUploadNotice() {
      let that = this;
      try {
        let notice = that.setNoticeContent;
        if (!notice) {
          common_vendor.index.showToast({
            title: "\u516C\u544A\u4E0D\u80FD\u4E3A\u7A7A",
            icon: "none"
          });
          return;
        }
        common_vendor.index.showModal({
          title: "\u6E29\u99A8\u63D0\u793A",
          content: "\u662F\u5426\u8BBE\u7F6E\u8BE5\u516C\u544A",
          success: async (res) => {
            if (res.confirm) {
              common_vendor.index.showLoading({
                title: "\u8BBE\u7F6E\u4E2D...",
                mask: true
              });
              await db.collection("notice").where("_id == '62f49bb51ff3ac000168404b'").get().then(async (res2) => {
                if (res2.result.errCode === 0) {
                  let noticeList = res2.result.data[0] ? res2.result.data[0].noticeList : [];
                  let currentDateInfo = await serverDate.getCurrentDate();
                  let currentDate = currentDateInfo.data.currentDate;
                  let currentNotice = {};
                  currentNotice.notice = notice;
                  currentNotice.date = currentDate;
                  noticeList.unshift(currentNotice);
                  await db.collection("notice").where("_id == '62f49bb51ff3ac000168404b'").update({
                    "noticeList": noticeList
                  }).then((res3) => {
                    that.onClickSetNoticeMask();
                    common_vendor.index.hideLoading();
                    common_vendor.index.showToast({
                      title: "\u8BBE\u7F6E\u6210\u529F",
                      icon: "none"
                    });
                  }).catch((err) => {
                    that.onClickSetNoticeMask();
                    common_vendor.index.hideLoading();
                  });
                }
              }).catch((err) => {
                that.onClickSetNoticeMask();
                common_vendor.index.hideLoading();
              });
            }
          }
        });
      } catch (e) {
        that.onClickSetNoticeMask();
        common_vendor.index.hideLoading();
      }
    },
    onClickSuitAndAvoid() {
      let that = this;
      that.otherFunctionTitle = "\u4ECA\u65E5\u5B9C\u5FCC";
      that.otherFunctionContent = "\u5B9C: " + that.calendar.suitable + "\n\u5FCC: " + that.calendar.tapu;
      that.isShowPopup = true;
      that.isShowOtherFunctionView = true;
    },
    onClickOtherFunctionMask() {
      let that = this;
      that.isShowOtherFunctionView = false;
      that.isShowPopup = false;
      that.otherFunctionTitle = "";
      that.otherFunctionContent = "";
    },
    async onClickRandomJoke() {
      let that = this;
      try {
        common_vendor.index.showLoading({
          title: "\u751F\u6210\u4E2D...",
          mask: true
        });
        let randomJokeRes = await common_vendor.index.request({
          url: "https://api.vvhan.com/api/joke?type=json"
        });
        if (randomJokeRes && randomJokeRes.data && randomJokeRes.data.success) {
          let joke = randomJokeRes.data.joke;
          let title = randomJokeRes.data.title;
          that.otherFunctionTitle = title;
          that.otherFunctionContent = joke;
          that.isShowPopup = true;
          that.isShowOtherFunctionView = true;
        }
        common_vendor.index.hideLoading();
      } catch (e) {
        common_vendor.index.hideLoading();
      }
    },
    async onClickRandomSweetWorld() {
      let that = this;
      try {
        common_vendor.index.showLoading({
          title: "\u751F\u6210\u4E2D...",
          mask: true
        });
        let randomSweetWorldRes = await common_vendor.index.request({
          url: "https://api.vvhan.com/api/love?type=json"
        });
        if (randomSweetWorldRes && randomSweetWorldRes.data && randomSweetWorldRes.data.success) {
          that.otherFunctionTitle = "\u968F\u673A\u60C5\u8BDD";
          that.otherFunctionContent = randomSweetWorldRes.data.ishan;
          that.isShowPopup = true;
          that.isShowOtherFunctionView = true;
        }
        common_vendor.index.hideLoading();
      } catch (e) {
        common_vendor.index.hideLoading();
      }
    },
    async onClickAboutApp() {
      let that = this;
      try {
        that.getPraiseInfoFromCloud();
        that.isShowPopup = true;
        that.isShowAboutApp = true;
      } catch (e) {
      }
    },
    onClickAboutAppMask() {
      let that = this;
      that.isShowAboutApp = false;
      that.isShowPopup = false;
    },
    async getPraiseInfoFromCloud() {
      let that = this;
      try {
        await db.collection("praise").where("_id == '6310654ce3e39a0001adc296'").get().then((res) => {
          if (res.result.errCode === 0) {
            let praiseList = res.result.data[0] ? res.result.data[0].praiseList : [];
            that.isPraiseApp = praiseList.indexOf(app.globalData.wx_openid) === -1 ? false : true;
            that.praiseAppSum = praiseList.length;
            common_vendor.index.setStorageSync(app.globalData.isPraiseAppCacheName, that.isPraiseApp);
            common_vendor.index.setStorageSync(app.globalData.praiseAppSumCacheName, that.praiseAppSum);
          }
        }).catch();
      } catch (e) {
      }
    },
    async onClickPraiseApp() {
      let that = this;
      try {
        if (that.isPraiseApp === true)
          return;
        await db.collection("praise").where("_id == '6310654ce3e39a0001adc296'").get().then(async (res) => {
          if (res.result.errCode === 0) {
            let praiseList = res.result.data[0] ? res.result.data[0].praiseList : [];
            if (praiseList.indexOf(app.globalData.wx_openid) === -1)
              praiseList.unshift(app.globalData.wx_openid);
            that.isPraiseApp = praiseList.indexOf(app.globalData.wx_openid) === -1 ? false : true;
            that.praiseAppSum = praiseList.length;
            common_vendor.index.setStorageSync(app.globalData.isPraiseAppCacheName, that.isPraiseApp);
            common_vendor.index.setStorageSync(app.globalData.praiseAppSumCacheName, that.praiseAppSum);
            common_vendor.index.showToast({
              title: "\u8C22\u8C22\u4F60\uFF0C\u964C\u751F\u4EBA",
              icon: "none"
            });
            await db.collection("praise").where("_id == '6310654ce3e39a0001adc296'").update({
              "praiseList": praiseList
            }).then().catch();
          }
        }).catch();
      } catch (e) {
      }
    },
    async onClickFishCalendar() {
      try {
        common_vendor.index.showLoading({
          title: "\u751F\u6210\u4E2D...",
          mask: true
        });
        let fishCalendarRes = await common_vendor.index.request({
          url: "https://api.vvhan.com/api/moyu?type=json"
        });
        common_vendor.index.hideLoading();
        if (fishCalendarRes && fishCalendarRes.data && fishCalendarRes.data.url) {
          let imgList = [];
          imgList.push(fishCalendarRes.data.url);
          common_vendor.index.previewImage({
            current: fishCalendarRes.data.url,
            urls: imgList,
            indicator: "none"
          });
        }
      } catch (e) {
        common_vendor.index.hideLoading();
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: "overflow:" + ($data.isShowPopup ? "hidden" : "visible"),
    b: $data.cloudAvatarPath ? $data.cloudAvatarPath : "../../static/img_default_avatar_icon.png",
    c: common_vendor.t($data.nickname),
    d: $data.calendar.date
  }, $data.calendar.date ? {
    e: common_vendor.t($data.calendar.date),
    f: common_vendor.t($data.calendar.lunar),
    g: common_vendor.t($data.calendar.year + " " + $data.calendar.zodiac),
    h: common_vendor.t($data.calendar.month + " " + $data.calendar.day),
    i: common_vendor.t($data.calendar.solarTerm)
  } : {}, {
    j: common_vendor.o((...args) => $options.onClickSetAvatar && $options.onClickSetAvatar(...args)),
    k: common_vendor.o((...args) => $options.onClickSetNickname && $options.onClickSetNickname(...args)),
    l: $data.role === "manager"
  }, $data.role === "manager" ? {
    m: common_vendor.o((...args) => $options.onClickSetNotice && $options.onClickSetNotice(...args))
  } : {}, {
    n: common_vendor.o((...args) => $options.onClickSuitAndAvoid && $options.onClickSuitAndAvoid(...args)),
    o: common_vendor.o((...args) => $options.onClickRandomJoke && $options.onClickRandomJoke(...args)),
    p: common_vendor.o((...args) => $options.onClickRandomSweetWorld && $options.onClickRandomSweetWorld(...args)),
    q: common_vendor.o((...args) => $options.onClickFishCalendar && $options.onClickFishCalendar(...args)),
    r: common_vendor.o((...args) => $options.onClickAboutApp && $options.onClickAboutApp(...args)),
    s: $data.isShowSetNicknameView === true
  }, $data.isShowSetNicknameView === true ? {
    t: common_vendor.o((...args) => $options.onClickSetNicknameMask && $options.onClickSetNicknameMask(...args)),
    v: common_vendor.o((...args) => $options.inputNicknameContent && $options.inputNicknameContent(...args)),
    w: common_vendor.o((...args) => $options.onClickUploadNickname && $options.onClickUploadNickname(...args))
  } : {}, {
    x: $data.isShowSetNoticeView === true
  }, $data.isShowSetNoticeView === true ? {
    y: common_vendor.o((...args) => $options.onClickSetNoticeMask && $options.onClickSetNoticeMask(...args)),
    z: common_vendor.o((...args) => $options.inputNoticeContent && $options.inputNoticeContent(...args)),
    A: common_vendor.o((...args) => $options.onClickUploadNotice && $options.onClickUploadNotice(...args))
  } : {}, {
    B: $data.isShowOtherFunctionView === true
  }, $data.isShowOtherFunctionView === true ? {
    C: common_vendor.o((...args) => $options.onClickOtherFunctionMask && $options.onClickOtherFunctionMask(...args)),
    D: common_vendor.t($data.otherFunctionTitle),
    E: common_vendor.t($data.otherFunctionContent)
  } : {}, {
    F: $data.isShowAboutApp === true
  }, $data.isShowAboutApp === true ? {
    G: common_vendor.o((...args) => $options.onClickAboutAppMask && $options.onClickAboutAppMask(...args)),
    H: common_vendor.t($data.aboutAppContent),
    I: common_vendor.o((...args) => $options.onClickPraiseApp && $options.onClickPraiseApp(...args)),
    J: $data.isPraiseApp ? "../../static/img_praise_icon.png" : "../../static/img_no_praise_icon.png",
    K: common_vendor.t($data.praiseAppSum)
  } : {});
}
var MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "C:/HBuilderX/projects/RecordLife/pages/mine/mine.vue"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
