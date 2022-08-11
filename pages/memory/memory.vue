<template>
	<view class="view-page-memory">
		<view class="view-area-topInfo">
			<view class="view-box-notice">
				<image class="image-icon-basic" src="../../static/img_notice_icon.png"
					style="width: 35rpx;height: 32rpx;"></image>
				<text class="text-content-whiteThirty" style="margin-left: 20rpx;">{{notice}}</text>
			</view>
			<view class="view-box-memorySum">
				<text class="text-content-whiteThirty">全部回忆({{memorySum}})</text>
			</view>
		</view>
	</view>
</template>

<script lang="ts">
	import commonFunctions from "../../common/commonFunctions.js";
	const serverDate = uniCloud.importObject('serverDate');
	const db = uniCloud.database();
	const app = getApp();
	export default {
		data() {
			return {
				notice: uni.getStorageSync(app.globalData.noticeCacheName) ? uni.getStorageSync(app.globalData
					.noticeCacheName) : '',
				memorySum: 0
			};
		},
		async onLoad() {
			let that = this;

			// if (!app.globalData.wx_openid) await commonFunctions.wxLogin();
			// that.uploadAccessToCloud(app.globalData.wx_openid);
			// that.getNoticeFromCloud();
		},
		methods: {
			/**
			 * 上传访问记录到云端
			 * @param {string} wx_openid 微信小程序的openid
			 */
			async uploadAccessToCloud(wx_openid: string): Promise < void > {
				if (!wx_openid) return;

				try {
					await db
						.collection('access')
						.where("wx_openid == '" + wx_openid + "'")
						.get()
						.then(async (res) => {
							if (res.result.errCode === 0) {
								let accessList: string[] = res.result.data[0] ? res.result.data[0].accessList :
									[];
								let currentDateInfo = await serverDate.getCurrentDate();

								accessList.slice(0, 99);
								accessList.unshift(currentDateInfo.data.currentDate);
								if (res.result.data.length === 0) {
									await db
										.collection('access')
										.add({
											'wx_openid': wx_openid,
											'accessList': accessList
										})
										.then()
										.catch()
								} else {
									await db
										.collection('access')
										.where("wx_openid == '" + wx_openid + "'")
										.update({
											'accessList': accessList
										})
								}
							}
						})
						.catch()
				} catch (e) {}
			},
			/**
			 * 从云端获取公告
			 */
			async getNoticeFromCloud(): Promise < void > {
				try {
					await db
						.collection('notice')
						.where("_id == '62f49bb51ff3ac000168404b'")
						.get()
						.then((res) => {
							if (res.result.errCode === 0) {
								let currentNotice: string = res.result.data[0].noticeList[0].notice;

								if (currentNotice !== uni.getStorageSync(app.globalData.noticeCacheName)) {
									this.notice = currentNotice;
									uni.setStorageSync(app.globalData.noticeCacheName, currentNotice);
								}
							}
						})
						.catch()
				} catch (e) {}
			}
		}
	}
</script>

<style>
	.view-page-memory {
		position: relative;
		margin-left: 0rpx;
		margin-top: 0rpx;
		min-height: 100vh;
		width: 100%;
		background-color: #FBF2E3;
	}

	.view-area-topInfo {
		position: relative;
		margin-top: 0rpx;
		width: 100%;
		background-color: #467B73;
		border-bottom-left-radius: 50rpx;
		border-bottom-right-radius: 50rpx;
		overflow: hidden;
	}

	.view-box-notice {
		position: relative;
		margin: 10rpx 35rpx 0rpx 35rpx;
		display: flex;
		align-items: center;
	}

	.image-icon-basic {
		position: relative;
		flex-shrink: 0;
	}

	.text-content-whiteThirty {
		position: relative;
		color: #FEFFFF;
		font-size: 30rpx;
	}

	.view-box-memorySum {
		position: relative;
		margin: 30rpx 35rpx 100rpx 35rpx;
		display: flex;
		align-items: center;
	}
</style>
