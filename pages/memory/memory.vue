<template>
	<view class="view-page-memory">

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

			};
		},
		async onLoad() {
			let that = this;

			if (!app.globalData.wx_openid) await commonFunctions.wxLogin();
			that.uploadAccessToCloud(app.globalData.wx_openid);
		},
		methods: {
			/**
			 * 上传访问记录到云端
			 * @param {string} wx_openid 微信小程序的openid
			 */
			uploadAccessToCloud(wx_openid: string): void {
				if (!wx_openid) return;

				db
					.collection('access')
					.where("wx_openid == '" + wx_openid + "'")
					.get()
					.then(async (res) => {
						if (res.result.errCode === 0) {
							let accessList: string[] = res.result.data[0] ? res.result.data[0].accessList : [];
							let currentDateInfo = await serverDate.getCurrentDate();

							accessList.slice(0, 99);
							accessList.unshift(currentDateInfo.data.currentDate);
							if (res.result.data.length === 0) {
								db
									.collection('access')
									.add({
										'wx_openid': wx_openid,
										'accessList': accessList
									})
									.then()
									.catch()
							} else {
								db
									.collection('access')
									.where("wx_openid == '" + wx_openid + "'")
									.update({
										'accessList': accessList
									})
							}
						} else {}
					})
					.catch()
			}
		}
	}
</script>

<style>
	.view-page-memory {
		position: relative;
		left: 0rpx;
		top: 0rpx;
		min-height: 100vh;
		width: 100%;
		background-color: #FBF2E3;
	}
</style>
