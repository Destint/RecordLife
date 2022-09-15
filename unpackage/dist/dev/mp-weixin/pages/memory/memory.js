"use strict";
var common_vendor = require("../../common/vendor.js");
var common_commonFunctions = require("../../common/commonFunctions.js");
var common_qqmapWxJssdk = require("../../common/qqmap-wx-jssdk.js");
const locationManager = new common_qqmapWxJssdk.QQMapWX({
  key: "3XKBZ-WP4CG-KQVQM-IJ2WK-7QAE7-2ZFKZ"
});
const serverDate = common_vendor.pn.importObject("serverDate", {
  customUI: true
});
const handleMemory = common_vendor.pn.importObject("handleMemory", {
  customUI: true
});
const db = common_vendor.pn.database();
const app = getApp();
var isWritingMemory = false;
const _sfc_main = {
  data() {
    return {
      notice: common_vendor.index.getStorageSync(app.globalData.noticeCacheName) ? common_vendor.index.getStorageSync(app.globalData.noticeCacheName) : "",
      memorySum: common_vendor.index.getStorageSync(app.globalData.memorySumCacheName) ? common_vendor.index.getStorageSync(app.globalData.memorySumCacheName) : 0,
      memoryList: common_vendor.index.getStorageSync(app.globalData.memoryCacheName) ? common_vendor.index.getStorageSync(app.globalData.memoryCacheName) : [],
      isShowPopup: false,
      memoryDetail: void 0,
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
    that.uploadAccessToCloud(app.globalData.wx_openid);
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
  onShareAppMessage() {
    return {
      title: "\u8BB0\u5F55\u5173\u4E8E\u4F60\u7684\u56DE\u5FC6",
      path: "/pages/memory/memory",
      imageUrl: "https://vkceyugu.cdn.bspapp.com/VKCEYUGU-bcf64df9-4d03-4023-bc85-9000afa0f691/e989c0a9-706c-4c3c-8020-3c04a0e2344d.png"
    };
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
      let that = this;
      try {
        common_vendor.index.showActionSheet({
          itemList: ["\u5220\u9664\u8BE5\u56DE\u5FC6"],
          success: (res) => {
            if (res.tapIndex === 0)
              that.deleteMemory(memory);
          },
          fail: () => {
          }
        });
      } catch (e) {
      }
    },
    onClickAddMemory() {
      let that = this;
      that.isShowPopup = true;
      that.memoryDetail = {
        id: 0,
        title: "",
        content: "",
        localPicPathList: [],
        cloudPicPathList: [],
        address: "",
        simpleAddress: "",
        date: ""
      };
      that.isShowAddMemory = true;
    },
    onClickMemoryDetailMask() {
      let that = this;
      that.isShowMemoryDetail = false;
      that.isShowPopup = false;
      that.memoryDetail = void 0;
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
    chooseImage(count) {
      return new Promise((resolve) => {
        common_vendor.index.chooseImage({
          count,
          sizeType: ["compressed"],
          sourceType: ["album"],
          success: (res) => {
            resolve(res);
          },
          fail: () => {
            resolve(void 0);
          }
        });
      });
    },
    compressImage(src) {
      return new Promise((resolve) => {
        common_vendor.index.compressImage({
          src,
          quality: 80,
          success: (res) => {
            resolve(res.tempFilePath);
          },
          fail: () => {
            resolve(src);
          }
        });
      });
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
          let imageRes = await that.chooseImage(5 - localPicPathList.length);
          if (!imageRes)
            return;
          common_vendor.index.showLoading({
            title: "\u56FE\u7247\u9009\u62E9\u4E2D...",
            mask: true
          });
          let chooseImageList = imageRes.tempFiles;
          chooseImageList = await that.compressImgList(imageRes.tempFiles);
          for (let i = 0; i < chooseImageList.length; i++) {
            let compressRes = await that.compressImage(chooseImageList[i]);
            chooseImageList[i] = compressRes;
          }
          that.memoryDetail.localPicPathList = localPicPathList.concat(chooseImageList);
          common_vendor.index.hideLoading();
        }
      } catch (e) {
      }
    },
    getImageInfo(src) {
      return new Promise((resolve) => {
        common_vendor.index.getImageInfo({
          src,
          success: (res) => {
            resolve(res);
          },
          fail: () => {
            resolve(void 0);
          }
        });
      });
    },
    async compressImgList(imgList) {
      let that = this;
      try {
        let compressImgList = [];
        for (let i = 0; i < imgList.length; i++) {
          if (imgList[i].size / 1024 < 500) {
            compressImgList.push(imgList[i].path);
            continue;
          }
          let imageInfo = await that.getImageInfo(imgList[i].path);
          if (!imageInfo)
            continue;
          let p = new Promise((resolve) => {
            const selectorQuery = common_vendor.index.createSelectorQuery();
            selectorQuery.select("#myCanvas").fields({
              node: true,
              size: true
            }).exec((res) => {
              const canvas = res[0].node;
              const ctx = canvas.getContext("2d");
              const ratio = imageInfo.height / imageInfo.width;
              canvas.width = imageInfo.width > 750 ? 750 : imageInfo.width;
              canvas.height = canvas.width * ratio;
              let img = canvas.createImage();
              img.src = imageInfo.path;
              img.onload = () => {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                wx.canvasToTempFilePath({
                  canvas,
                  fileType: "jpg",
                  success: (fileRes) => {
                    compressImgList.push(fileRes.tempFilePath);
                    resolve(true);
                  },
                  fail: () => {
                    resolve(true);
                  }
                }, this);
              };
              img.onerror = () => {
                resolve(true);
              };
            });
          });
          await p;
        }
        return compressImgList;
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
            that.memoryDetail = void 0;
            that.isShowAddMemory = false;
            that.isShowPopup = false;
          }
        }
      });
    },
    onClickAddMemoryWrite() {
      let that = this;
      try {
        let addMemory = that.memoryDetail;
        if (addMemory.title === "") {
          common_vendor.index.showToast({
            title: "\u56DE\u5FC6\u6807\u9898\u4E0D\u80FD\u4E3A\u7A7A",
            icon: "none"
          });
          return;
        }
        if (isWritingMemory === true)
          return;
        isWritingMemory = true;
        common_vendor.index.showModal({
          title: "\u6E29\u99A8\u63D0\u793A",
          content: "\u662F\u5426\u8BB0\u5F55\u5F53\u524D\u56DE\u5FC6",
          success: async (res) => {
            if (res.confirm) {
              let checkContent = addMemory.title + addMemory.content;
              common_vendor.index.showLoading({
                title: "\u8BB0\u5F55\u4E2D...",
                mask: true
              });
              let checkContentResult = await common_commonFunctions.commonFunctions.checkContentSecurity(checkContent);
              if (checkContentResult.errCode !== 0) {
                common_vendor.index.hideLoading();
                common_vendor.index.showModal({
                  title: "\u6E29\u99A8\u63D0\u793A",
                  content: checkContentResult.errMsg,
                  showCancel: false,
                  success: () => {
                    isWritingMemory = false;
                  }
                });
              } else {
                await that.startWriteMemory();
              }
            }
            if (res.cancel) {
              isWritingMemory = false;
            }
          }
        });
      } catch (e) {
        common_vendor.index.showModal({
          title: "\u6E29\u99A8\u63D0\u793A",
          content: "\u8BB0\u5F55\u56DE\u5FC6\u5931\u8D25\u8BF7\u91CD\u8BD5",
          showCancel: false,
          success: (res) => {
            if (res.confirm) {
              isWritingMemory = false;
            }
          }
        });
      }
    },
    async startWriteMemory() {
      let that = this;
      try {
        await that.getCurrentAddressInfo();
        await that.setMemoryIdAndDate();
        await that.uploadLocalFileToCloud();
        await that.uploadMemoryToCloud();
        that.memoryDetail = void 0;
        that.isShowAddMemory = false;
        that.isShowPopup = false;
        isWritingMemory = false;
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "\u8BB0\u5F55\u6210\u529F",
          icon: "none"
        });
      } catch (e) {
        common_vendor.index.hideLoading();
        common_vendor.index.showModal({
          title: "\u6E29\u99A8\u63D0\u793A",
          content: "\u8BB0\u5F55\u56DE\u5FC6\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5",
          showCancel: false,
          success: () => {
            isWritingMemory = false;
          }
        });
      }
    },
    async getCurrentAddressInfo() {
      let that = this;
      try {
        let p = new Promise((resolve) => {
          wx.startLocationUpdate({
            success: () => {
              wx.onLocationChange(async (res) => {
                wx.offLocationChange();
                wx.stopLocationUpdate();
                await that.getCurrentLocation(res.latitude, res.longitude);
                resolve(true);
              });
            },
            fail: () => {
              resolve(true);
            }
          });
        });
        await p;
      } catch (e) {
      }
    },
    async getCurrentLocation(latitude, longitude) {
      let that = this;
      try {
        let p = new Promise((resolve) => {
          locationManager.reverseGeocoder({
            location: {
              latitude,
              longitude
            },
            success: async (res) => {
              if (res && res.result) {
                let address = res.result.address ? res.result.address : "";
                let city = res.result.ad_info.city ? res.result.ad_info.city : "";
                let district = res.result.ad_info.district ? res.result.ad_info.district : "";
                let simpleAddress = district ? district : city;
                await that.getCurrentWeather(simpleAddress, address);
              }
              resolve(true);
            },
            fail: () => {
              resolve(true);
            }
          });
        });
        await p;
      } catch (e) {
      }
    },
    async getCurrentWeather(simpleAddress, address) {
      let that = this;
      try {
        let p = new Promise((resolve) => {
          common_vendor.index.request({
            url: "https://free-api.heweather.net/s6/weather/now",
            data: {
              location: simpleAddress,
              key: "2ce65b27e7784d0f85ecd7b8127f5e2d"
            },
            success: (res) => {
              let weather = res.data.HeWeather6[0].now.cond_txt;
              let temperature = res.data.HeWeather6[0].now.fl + "\u2103";
              that.memoryDetail.address = address + " " + weather + " " + temperature;
              that.memoryDetail.simpleAddress = simpleAddress + " " + weather + " " + temperature;
              resolve(true);
            },
            fail: () => {
              resolve(true);
            }
          });
        });
        await p;
      } catch (e) {
      }
    },
    async setMemoryIdAndDate() {
      let that = this;
      try {
        let currentDateInfo = await serverDate.getCurrentDate();
        if (currentDateInfo.errCode === 0) {
          that.memoryDetail.id = currentDateInfo.data.currentId;
          that.memoryDetail.date = currentDateInfo.data.currentDate;
        }
      } catch (e) {
      }
    },
    async uploadLocalFileToCloud() {
      let that = this;
      try {
        if (that.memoryDetail.localPicPathList.length === 0)
          return;
        let currentId = that.memoryDetail.id;
        let localPicPathList = that.memoryDetail.localPicPathList;
        let proArr = [];
        for (let i = 0; i < localPicPathList.length; i++) {
          proArr.push(new Promise((resolve) => {
            common_vendor.pn.uploadFile({
              filePath: localPicPathList[i],
              cloudPath: app.globalData.wx_openid + "." + currentId + i + ".jpg"
            }).then((res) => {
              that.memoryDetail.cloudPicPathList[i] = res.fileID;
              resolve(true);
            }).catch(() => {
              that.memoryDetail.cloudPicPathList[i] = "";
              resolve(true);
            });
          }));
        }
        await Promise.all(proArr).then(() => {
        }).catch(() => {
        });
      } catch (e) {
      }
    },
    async uploadMemoryToCloud() {
      let that = this;
      try {
        await db.collection("memory").where("wx_openid == '" + app.globalData.wx_openid + "'").get().then(async (res) => {
          if (res.result.errCode === 0) {
            let memoryList = res.result.data[0] ? res.result.data[0].memoryList : [];
            memoryList.unshift(that.memoryDetail);
            if (res.result.data.length === 0) {
              await db.collection("memory").add({
                "wx_openid": app.globalData.wx_openid,
                "memoryList": memoryList
              }).then(() => {
                that.memoryList = memoryList.slice(0, 15);
                that.memorySum = memoryList.length;
                common_vendor.index.setStorageSync(app.globalData.memoryCacheName, memoryList.slice(0, 15));
                common_vendor.index.setStorageSync(app.globalData.memorySumCacheName, memoryList.length);
              }).catch();
            } else {
              await db.collection("memory").where("wx_openid == '" + app.globalData.wx_openid + "'").update({
                "memoryList": memoryList
              }).then(() => {
                that.memoryList = memoryList.slice(0, 15);
                that.memorySum = memoryList.length;
                common_vendor.index.setStorageSync(app.globalData.memoryCacheName, memoryList.slice(0, 15));
                common_vendor.index.setStorageSync(app.globalData.memorySumCacheName, memoryList.length);
              }).catch();
            }
          }
        }).catch();
      } catch (e) {
      }
    },
    deleteMemory(memory) {
      if (!memory)
        return;
      try {
        let that = this;
        common_vendor.index.showModal({
          title: "\u6E29\u99A8\u63D0\u793A",
          content: "\u662F\u5426\u5220\u9664\u56DE\u5FC6\u300A" + memory.title + "\u300B",
          success: async (res) => {
            if (res.confirm) {
              common_vendor.index.showLoading({
                title: "\u5220\u9664\u4E2D...",
                mask: true
              });
              let result = await handleMemory.deleteMemory(app.globalData.wx_openid, memory.id);
              if (result.errCode === 0) {
                that.memoryList = result.data.memoryList.slice(0, 15);
                that.memorySum = result.data.memoryList.length;
                common_vendor.index.setStorageSync(app.globalData.memoryCacheName, result.data.memoryList.slice(0, 15));
                common_vendor.index.setStorageSync(app.globalData.memorySumCacheName, result.data.memoryList.length);
                common_vendor.index.hideLoading();
                common_vendor.index.showToast({
                  title: "\u5220\u9664\u6210\u529F",
                  icon: "none"
                });
              } else {
                common_vendor.index.hideLoading();
                common_vendor.index.showToast({
                  title: "\u5220\u9664\u5931\u8D25",
                  icon: "none"
                });
              }
            }
          }
        });
      } catch (e) {
      }
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
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
