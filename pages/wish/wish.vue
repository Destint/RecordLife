<template>
	<page-meta :page-style="'overflow:' + (isShowPopup ? 'hidden' : 'visible')"></page-meta>
	<view class="view-page-wish">
		<view class="view-area-topInfo">
			<view class="view-box-notice">
				<image class="image-icon-basic" src="../../static/img_notice_icon.png"
					style="width: 35rpx;height: 32rpx;"></image>
				<text class="text-content-whiteThirty" style="margin-left: 20rpx;">{{notice}}</text>
			</view>
			<view class="view-box-wishSum">
				<text class="text-content-whiteThirty">全部心愿({{wishSum}})</text>
			</view>
		</view>
		<block v-if="wishSum > 0">
			<block v-for="(item, index) in wishList" :key="index">
				<view class="view-box-wishCell" :style="'margin-top:' + (index === 0 ? '-70rpx' : '20rpx')">
					<text class="text-content-wishContent"
						:style="'text-decoration:' + (item.state !== 0 ? 'line-through' : '')">{{item.content}}</text>
					<view class="view-box-wishInfo">
						<text>{{item.startDate}}</text>
						<block v-if="item.state !== 0">
							<text>{{item.endDate}}</text>
							<image class="image-icon-wishState"
								:src="item.state === 1 ? '../../static/img_wish_finish_icon.png': '../../static/img_wish_give_up_icon.png'">
							</image>
							<text class="text-content-wishDuration">{{item.duration}}</text>
						</block>
					</view>
					<image class="image-icon-editorMemory" src="../../static/img_editor_icon.png"
						@click.stop="onClickEditorWish(item)"></image>
				</view>
			</block>
		</block>
		<block v-else>
			<view class="view-box-noWishTip">
				<image class="image-icon-basic" src="../../static/img_empty_icon.png"
					style="width: 128rpx;height: 128rpx;"></image>
				<text class="text-content-GreenThirty" style="margin-top: 10rpx;">暂无心愿</text>
			</view>
		</block>
		<image class="image-icon-addWish" src="../../static/img_add_icon.png" @click="onClickAddWish"></image>
		<block v-if="isShowAddWishView === true">
			<view class="view-area-popupMask" @click="onClickAddWishMask"></view>
			<view class="view-box-setPopup">
				<view class="view-box-popupTitle">添加心愿</view>
				<view class="view-area-input">
					<input class="input-area-content" maxlength="20" placeholder="心愿内容..."
						placeholder-style="color: rgba(70,123,115,0.5);" @input="inputWishContent" />
				</view>
				<image class="image-icon-upload" src="../../static/img_upload_icon.png" @click="onClickUploadWish">
				</image>
			</view>
		</block>
	</view>
</template>

<script lang="ts">
	import commonFunctions from "../../common/commonFunctions.js";
	const db = uniCloud.database(); // 云数据库
	const serverDate = uniCloud.importObject('serverDate', {
		customUI: true
	}); // 服务器时间云对象
	const app = getApp(); // APP全局变量
	export default {
		data() {
			return {
				isShowPopup: false,
				notice: uni.getStorageSync(app.globalData.noticeCacheName) ? uni.getStorageSync(app.globalData
					.noticeCacheName) : '',
				wishSum: uni.getStorageSync(app.globalData.wishSumCacheName) ? uni.getStorageSync(app.globalData
					.wishSumCacheName) : 0,
				wishList: uni.getStorageSync(app.globalData.wishCacheName) ? uni.getStorageSync(app.globalData
					.wishCacheName) : [],
				isShowAddWishView: false,
				addWishContent: ''
			};
		},
		async onLoad() {
			let that = this;

			uni.showLoading({
				title: '载入心愿中',
				mask: true
			})
			if (!app.globalData.wx_openid) await commonFunctions.wxLogin();
			await that.getWishFromCloud(app.globalData.wx_openid, 0);
			uni.hideLoading();
		},
		async onPullDownRefresh() {
			let that = this;

			try {
				uni.showLoading({
					title: '更新心愿中',
					mask: true
				})
				that.getNoticeFromCloud();
				await that.getWishFromCloud(app.globalData.wx_openid, 0);
				uni.stopPullDownRefresh();
				uni.hideLoading();
			} catch (e) {}
		},
		async onReachBottom() {
			let that = this;

			try {
				let currentIndex: number = that.wishList.length;

				if (currentIndex === that.wishSum) {
					uni.showToast({
						title: '心愿到底啦',
						icon: "none"
					})
				} else {
					uni.showLoading({
						title: '载入心愿中',
						mask: true
					})
					await that.getWishFromCloud(app.globalData.wx_openid, currentIndex);
					uni.hideLoading();
				}
			} catch (e) {}
		},
		onShareAppMessage() {
			return {
				title: '记录关于你的回忆',
				path: '/pages/memory/memory',
				imageUrl: 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-bcf64df9-4d03-4023-bc85-9000afa0f691/e989c0a9-706c-4c3c-8020-3c04a0e2344d.png'
			}
		},
		methods: {
			/**
			 * 从云端获取公告
			 */
			async getNoticeFromCloud(): Promise < void > {
				let that = this;

				try {
					await db
						.collection('notice')
						.where("_id == '62f49bb51ff3ac000168404b'")
						.get()
						.then((res) => {
							if (res.result.errCode === 0) {
								let currentNotice: string = res.result.data[0].noticeList[0].notice;

								if (currentNotice !== uni.getStorageSync(app.globalData.noticeCacheName)) {
									that.notice = currentNotice;
									uni.setStorageSync(app.globalData.noticeCacheName, currentNotice);
								}
							}
						})
						.catch()
				} catch (e) {}
			},
			/**
			 * 从云端获取心愿
			 * @param {string} wx_openid 微信小程序的openid
			 * @param {number} currentIndex 当前回忆的索引值(每次获取索引值后最多30条心愿)
			 */
			async getWishFromCloud(wx_openid: string, currentIndex: number): Promise < void > {
				let that = this;

				try {
					await db
						.collection('wish')
						.where("wx_openid == '" + wx_openid + "'")
						.get()
						.then((res) => {
							if (res.result.errCode === 0) {
								let allWish: AnyObject[] = res.result.data[0] ? res.result.data[0].wishList : [];
								let currentWish = allWish.slice(currentIndex, currentIndex + 30);
								let wishSum = allWish.length;

								if (currentIndex === 0) {
									that.wishList = that.handleWishDuration(currentWish);
									that.wishSum = wishSum;
									uni.setStorageSync(app.globalData.wishCacheName, currentWish);
									uni.setStorageSync(app.globalData.wishSumCacheName, wishSum);
								} else {
									that.wishList = that.handleWishDuration(that.wishList.concat(currentWish));
								}
							}
						})
						.catch()
				} catch (e) {}
			},
			/**
			 * 点击添加心愿事件
			 */
			onClickAddWish() {
				let that = this;

				that.isShowPopup = true;
				that.isShowAddWishView = true;
				that.addWishContent = '';
			},
			/**
			 * 点击添加心愿页蒙版
			 */
			onClickAddWishMask() {
				let that = this;

				that.addWishContent = '';
				that.isShowAddWishView = false;
				that.isShowPopup = false;
			},
			/**
			 * 监听输入的心愿
			 * @param {object} event 输入对象
			 */
			inputWishContent(event): void {
				let that = this;

				that.addWishContent = event.target.value;
			},
			/**
			 * 点击上传心愿事件
			 */
			async onClickUploadWish(): Promise < void > {
				let that = this;

				try {
					let wish: string = that.addWishContent;

					if (!wish) {
						uni.showToast({
							title: '心愿不能为空',
							icon: "none"
						})

						return;
					}
					uni.showModal({
						title: '温馨提示',
						content: '是否添加该心愿',
						success: async (res) => {
							if (res.confirm) {
								uni.showLoading({
									title: '添加中...',
									mask: true
								})
								let checkContentResult = await commonFunctions.checkContentSecurity(wish);

								if (checkContentResult.errCode !== 0) {
									uni.hideLoading();
									uni.showModal({
										title: '温馨提示',
										content: checkContentResult.errMsg,
										showCancel: false
									})
								} else {
									let wishObj: AnyObject = {};
									let currentDateInfo = await serverDate.getCurrentDate();

									wishObj.id = currentDateInfo.data.currentId;
									wishObj.content = wish;
									wishObj.startDate = currentDateInfo.data.currentDate;
									wishObj.endDate = '';
									wishObj.state = 0;
									await db
										.collection('wish')
										.where("wx_openid == '" + app.globalData.wx_openid + "'")
										.get()
										.then(async (res) => {
											if (res.result.errCode === 0) {
												let wishList: AnyObject[] = res.result.data[0] ?
													res.result.data[0].wishList : [];

												wishList.unshift(wishObj);
												if (res.result.data.length === 0) {
													await db
														.collection('wish')
														.add({
															'wx_openid': app.globalData
																.wx_openid,
															'wishList': wishList
														})
														.then(() => {
															that.wishList = that
																.handleWishDuration(wishList
																	.slice(0, 30));
															that.wishSum = wishList.length;
															uni.setStorageSync(app.globalData
																.wishCacheName, wishList
																.slice(0, 30));
															uni.setStorageSync(app.globalData
																.wishSumCacheName, wishList
																.length);
														})
														.catch()
												} else {
													await db
														.collection('wish')
														.where("wx_openid == '" + app.globalData
															.wx_openid + "'")
														.update({
															'wishList': wishList
														})
														.then(() => {
															that.wishList = that
																.handleWishDuration(wishList
																	.slice(0, 30));
															that.wishSum = wishList.length;
															uni.setStorageSync(app.globalData
																.wishCacheName, wishList
																.slice(0, 30));
															uni.setStorageSync(app.globalData
																.wishSumCacheName, wishList
																.length);
														})
														.catch()
												}
											}
										})
										.catch()
									that.onClickAddWishMask();
									uni.hideLoading();
									uni.showToast({
										title: '添加成功',
										icon: "none"
									})
								}
							}
						}
					})
				} catch (e) {
					that.onClickAddWishMask();
					uni.hideLoading();
				}
			},
			/**
			 * 点击编辑心愿事件
			 * @param {AnyObject} wish 编辑的心愿
			 */
			onClickEditorWish(wish: AnyObject): void {
				let that = this;

				try {
					if (wish.state === 0) {
						uni.showActionSheet({
							itemList: ['完成心愿', '放弃心愿', '删除心愿'],
							success: (res) => {
								if (res.tapIndex === 0) that.editorWish(wish, 1);
								else if (res.tapIndex === 1) that.editorWish(wish, -1);
								else if (res.tapIndex === 2) that.editorWish(wish, 0);
							},
							fail: () => {}
						})
					} else {
						uni.showActionSheet({
							itemList: ['删除心愿'],
							success: (res) => {
								if (res.tapIndex === 0) that.editorWish(wish, 0);
							},
							fail: () => {}
						})
					}
				} catch (e) {}
			},
			/**
			 * 编辑心愿
			 * @param {AnyObject} wish 编辑的心愿
			 * @param {number} type 编辑类型(0: 删除 1: 完成 -1: 放弃)
			 */
			editorWish(wish: AnyObject, type: number): void {
				let that = this;

				try {
					let tip: string = type === 0 ? '删除' : type === 1 ? '完成' : '放弃';

					uni.showModal({
						title: '温馨提示',
						content: '确定' + tip + '该心愿吗',
						success: async (res) => {
							if (res.confirm) {
								uni.showLoading({
									title: tip + '中...',
									mask: true
								})
								await db
									.collection('wish')
									.where("wx_openid == '" + app.globalData.wx_openid + "'")
									.get()
									.then(async (res) => {
										if (res.result.errCode === 0) {
											let wishList: AnyObject[] = res.result.data[0] ?
												res.result.data[0].wishList : [];
											let wishIndex: number = wishList.findIndex(function(
												object) {
												return object.id === wish.id;
											});
											let currentDateInfo = await serverDate
												.getCurrentDate();

											if (type === 0) {
												wishList.splice(wishIndex, 1);
											} else {
												wishList[wishIndex].endDate = currentDateInfo.data
													.currentDate;
												wishList[wishIndex].state = type;
											}
											if (wishList.length !== 0) {
												await db
													.collection('wish')
													.where("wx_openid == '" + app.globalData
														.wx_openid +
														"'")
													.update({
														'wishList': wishList
													})
													.then()
													.catch()
											} else {
												await db
													.collection('wish')
													.where("wx_openid == '" + app.globalData
														.wx_openid + "'")
													.remove()
											}
											that.wishList = that.handleWishDuration(wishList.slice(
												0, 30));
											that.wishSum = wishList.length;
											uni.setStorageSync(app.globalData.wishCacheName,
												wishList
												.slice(0, 30));
											uni.setStorageSync(app.globalData.wishSumCacheName,
												wishList.length);
										}
									})
									.catch()
								uni.hideLoading();
								uni.showToast({
									title: '已' + tip + '心愿',
									icon: "none"
								})
							}
						}
					})
				} catch (e) {
					uni.hideLoading();
				}
			},
			/**
			 * 处理心愿结束的持续时间
			 * @param {Array} wishList 心愿列表
			 */
			handleWishDuration(wishList: AnyObject[]) {
				let that = this;

				try {
					for (let i = 0; i < wishList.length; i++) {
						let startDate = wishList[i].startDate;
						let endDate = wishList[i].endDate;
						let state = wishList[i].state;

						if (state !== 0 && startDate && endDate) {
							let duration: string = '';
							let time: number = (new Date(endDate.replace(/-/g, '/')).getTime() - new Date(startDate
								.replace(/-/g, '/')).getTime()) / 1000;
							if (time < 60) duration = time.toFixed(1) + "秒";
							else {
								time = time / 60;
								if (time < 60) duration = time.toFixed(1) + "分钟";
								else {
									time = time / 60;
									if (time < 24) duration = time.toFixed(1) + "小时";
									else duration = (time / 24).toFixed(1) + "天";
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
	}
</script>

<style>
	.view-page-wish {
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

	.view-box-wishSum {
		position: relative;
		margin: 30rpx 35rpx 100rpx 35rpx;
		display: flex;
		align-items: center;
	}

	.view-box-wishCell {
		position: relative;
		background-color: #FEFFFF;
		border-radius: 30rpx;
		margin: 0rpx 35rpx 0rpx 35rpx;
		display: flex;
		flex-direction: column;
	}

	.text-content-wishContent {
		position: relative;
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
		color: #434646;
		font-size: 25rpx;
		font-weight: bold;
		margin: 20rpx 130rpx 0rpx 30rpx;
	}

	.view-box-wishInfo {
		position: relative;
		margin: 5rpx 130rpx 20rpx 30rpx;
		color: #CACED1;
		font-size: 24rpx;
		flex-direction: column;
		display: flex;
		justify-content: center;
	}

	.image-icon-wishState {
		position: absolute;
		width: 48rpx;
		height: 48rpx;
		flex-shrink: 0;
		left: 300rpx;
	}

	.text-content-wishDuration {
		position: absolute;
		font-size: 20rpx;
		left: 355rpx;
		color: #467B73;
	}

	.image-icon-addWish {
		position: fixed;
		width: 100rpx;
		height: 100rpx;
		right: 42rpx;
		bottom: 70rpx;
		flex-shrink: 0;
	}

	.image-icon-editorMemory {
		position: absolute;
		width: 48rpx;
		height: 48rpx;
		right: 35rpx;
		top: 50%;
		transform: translateY(-50%);
		flex-shrink: 0;
	}

	.view-box-noWishTip {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translateX(-50%)translateY(-50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.text-content-GreenThirty {
		position: relative;
		color: #467B73;
		font-size: 30rpx;
	}

	.view-area-popupMask {
		position: fixed;
		width: 100%;
		height: 100%;
		top: 0rpx;
		background-color: rgba(51, 51, 51, 0.5);
		overflow: hidden;
	}

	.view-box-setPopup {
		position: fixed;
		left: 45rpx;
		right: 45rpx;
		top: 50%;
		transform: translateY(-50%);
		background-color: #FBF2E3;
		border-radius: 30rpx;
	}

	.view-box-popupTitle {
		position: relative;
		font-size: 30rpx;
		color: #467B73;
		margin: 10rpx 35rpx 0rpx 35rpx;
		display: flex;
		justify-content: center;
	}

	.view-area-input {
		position: relative;
		margin: 10rpx 35rpx 0rpx 35rpx;
		border-bottom: 1rpx solid #467B73;
		display: flex;
		align-items: center;
	}

	.input-area-content {
		position: relative;
		font-size: 30rpx;
		width: 100%;
		height: 60rpx;
		color: #467B73;
	}

	.image-icon-upload {
		position: relative;
		width: 100rpx;
		height: 100rpx;
		flex-shrink: 0;
		float: right;
		margin: 25rpx 40rpx 30rpx auto;
	}
</style>
