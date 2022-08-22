<template>
	<page-meta :page-style="'overflow:' + (isShowPopup ? 'hidden' : 'visible')"></page-meta>
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
		<block v-if="memorySum > 0">
			<block v-for="(item, index) in memoryList" :key="index">
				<view class="view-box-memoryCell" :style="'margin-top:' + (index === 0 ? '-70rpx' : '20rpx')"
					@click="onClickMemoryCell(item)">
					<text class="text-content-memoryTitle">{{item.title}}</text>
					<text class="text-content-memoryContent">{{item.content}}</text>
					<block v-if="item.cloudPicPathList.length > 0">
						<view class="view-box-memoryPicList">
							<block v-for="(picItem, picIndex) in item.cloudPicPathList" :key="picIndex">
								<image class="image-icon-basic" lazy-load="true"
									:src="picItem ? picItem : '../../static/img_empty_icon.png'"
									:style="'margin-left:' + (picIndex === 0 ? '0rpx' : '5rpx')"
									style="width: 90rpx;height: 90rpx;" mode="aspectFill"></image>
							</block>
						</view>
					</block>
					<text class="text-content-memoryInfo"
						space="nbsp">{{item.date + '    ' + item.simpleAddress}}</text>
					<image class="image-icon-editorMemory" src="../../static/img_editor_icon.png"
						@click.stop="onClickEditorMemory(item)"></image>
				</view>
			</block>
		</block>
		<block v-else>
			<view class="view-box-noMemoryTip">
				<image class="image-icon-basic" src="../../static/img_empty_icon.png"
					style="width: 128rpx;height: 128rpx;"></image>
				<text class="text-content-GreenThirty" style="margin-top: 10rpx;">暂无回忆</text>
			</view>
		</block>
		<image class="image-icon-addMemory" src="../../static/img_add_icon.png" @click="onClickAddMemory"></image>
		<block v-if="isShowMemoryDetail === true">
			<view class="view-area-popupMask" @click="onClickMemoryDetailMask"></view>
			<view class="view-box-memoryDetail" style="padding-bottom: 10rpx;">
				<view class="view-box-memoryItem" style="margin-top: 20rpx;">
					<image class="image-icon-basic" src="../../static/img_memory_detail_title_icon.png"
						style="width: 32rpx;height: 32rpx;"></image>
					<text class="text-content-GreenThirty"
						style="margin-left: 10rpx;font-weight: bold;">{{memoryDetail.title}}</text>
				</view>
				<view class="view-line-divider"></view>
				<block v-if="memoryDetail.cloudPicPathList.length > 0">
					<view class="view-box-memoryItem" style="flex-wrap: wrap;">
						<block v-for="(item, index) in memoryDetail.cloudPicPathList" :key="index">
							<image class="image-icon-basic" :src="item ? item : '../../static/img_empty_icon.png'"
								style="width: 100rpx;height: 100rpx;" mode="aspectFill"
								@click.stop="onPreviewMemoryCellPic('cloud',index)"
								:style="'margin-left:' + ((index + 1) % 5 === 1 ? '0rpx' : '10rpx') + ';margin-top:' + (index > 4 ? '5rpx' : '0rpx')">
							</image>
						</block>
					</view>
					<view class="view-line-divider"></view>
				</block>
				<block v-if="memoryDetail.content">
					<view class="view-box-memoryItem">
						<image class="image-icon-basic" src="../../static/img_memory_detail_content_icon.png"
							style="width: 32rpx;height: 32rpx;"></image>
						<scroll-view class="scrollView-area-memoryContent" scroll-y="true">
							<text user-select>{{memoryDetail.content}}</text>
						</scroll-view>
					</view>
					<view class="view-line-divider"></view>
				</block>
				<block v-if="memoryDetail.date">
					<view class="view-box-memoryItem">
						<image class="image-icon-basic" src="../../static/img_memory_detail_date_icon.png"
							style="width: 32rpx;height: 32rpx;"></image>
						<text class="text-content-GreenThirty" style="margin-left: 10rpx;">{{memoryDetail.date}}</text>
					</view>
					<view class="view-line-divider"></view>
				</block>
				<block v-if="memoryDetail.address && memoryDetail.address !== ' '">
					<view class="view-box-memoryItem">
						<image class="image-icon-basic" src="../../static/img_memory_detail_address_icon.png"
							style="width: 32rpx;height: 32rpx;"></image>
						<text class="text-content-GreenThirty"
							style="margin-left: 10rpx;">{{memoryDetail.address}}</text>
					</view>
					<view class="view-line-divider"></view>
				</block>
			</view>
		</block>
		<block v-if="isShowAddMemory === true">
			<view class="view-area-popupMask"></view>
			<view class="view-box-memoryDetail">
				<view class="view-box-memoryBoxTitle">记录回忆</view>
				<view class="view-box-addMemoryTitle">
					<input class="input-area-addMemoryTitle" maxlength="15" placeholder="回忆的标题..."
						placeholder-style="color: rgba(70,123,115,0.5);" @input="inputMemoryTitle" />
				</view>
				<view class="view-box-localMemoryPicList">
					<block v-if="memoryDetail.localPicPathList.length > 0">
						<block v-for="(item, index) in memoryDetail.localPicPathList" :key="index">
							<view class="view-box-localMemoryPic"
								:style="'margin-left:' + ((index + 1) % 5 === 1 ? '0rpx' : '10rpx') + ';margin-top:' + (index > 4 ? '5rpx' : '0rpx')">
								<image class="image-icon-basic" style="width: 100rpx;height: 100rpx;"
									:src="item ? item : '../../static/img_empty_icon.png'"
									@click="onPreviewMemoryCellPic('local',index)" mode="aspectFill"></image>
								<image class="image-icon-deleteMemoryPic" src="../../static/img_delete_pic_icon.png"
									@click.stop="onClickDeletePic(index)"></image>
							</view>
						</block>
					</block>
					<block v-if="memoryDetail.localPicPathList.length < 5">
						<view class="view-box-addMemoryPic"
							:style="'margin-left:' + (memoryDetail.localPicPathList.length > 0 ? '10rpx' : '0rpx') + ';'"
							@click="onClickAddPic">
							<image class="image-icon-basic" src="../../static/img_dotted_box_icon.png"
								style="width: 100rpx;height: 100rpx;position: absolute;"></image>
							<image class="image-icon-basic" src="../../static/img_add_picture_icon.png"
								style="width: 40rpx;height: 40rpx;"></image>
							<text>添加图片</text>
						</view>
					</block>
				</view>
				<view class="view-box-addMemoryContent">
					<textarea class="textarea-area-inputMemoryContent" maxlength="2000" placeholder="回忆的内容..."
						placeholder-style="color: rgba(70,123,115,0.5);" disable-default-padding="true"
						cursor-spacing="30" @input="inputMemoryContent"></textarea>
				</view>
				<view class="view-box-addMemoryFunction">
					<image class="image-icon-basic" style="width: 100rpx;height: 100rpx;"
						src="../../static/img_add_memory_back_icon.png" @click="onClickAddMemoryBack"></image>
					<image class="image-icon-basic" style="width: 100rpx;height: 100rpx;"
						src="../../static/img_add_memory_write_icon.png" @click="onClickAddMemoryWrite"></image>
				</view>
			</view>
		</block>
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
				memorySum: uni.getStorageSync(app.globalData.memorySumCacheName) ? uni.getStorageSync(app.globalData
					.memorySumCacheName) : 0,
				memoryList: uni.getStorageSync(app.globalData.memoryCacheName) ? uni.getStorageSync(app.globalData
					.memoryCacheName) : [],
				isShowPopup: false,
				memoryDetail: {},
				isShowMemoryDetail: false,
				isShowAddMemory: false
			};
		},
		async onLoad() {
			let that = this;

			uni.showLoading({
				title: '载入回忆中',
				mask: true
			})
			if (!app.globalData.wx_openid) await commonFunctions.wxLogin();
			// that.uploadAccessToCloud(app.globalData.wx_openid);
			that.getNoticeFromCloud();
			await that.getMemoryFromCloud(app.globalData.wx_openid, 0);
			uni.hideLoading();
		},
		async onPullDownRefresh() {
			let that = this;

			try {
				uni.showLoading({
					title: '更新回忆中',
					mask: true
				})
				that.getNoticeFromCloud();
				await that.getMemoryFromCloud(app.globalData.wx_openid, 0);
				uni.stopPullDownRefresh();
				uni.hideLoading();
			} catch (e) {}
		},
		async onReachBottom() {
			let that = this;

			try {
				let currentIndex: number = that.memoryList.length;

				if (currentIndex === that.memorySum) {
					uni.showToast({
						title: '回忆到底啦',
						icon: "none"
					})
				} else {
					uni.showLoading({
						title: '载入回忆中',
						mask: true
					})
					await that.getMemoryFromCloud(app.globalData.wx_openid, currentIndex);
					uni.hideLoading();
				}
			} catch (e) {}
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
			 * 从云端获取回忆
			 * @param {string} wx_openid 微信小程序的openid
			 * @param {number} currentIndex 当前回忆的索引值(每次获取索引值后最多15条回忆)
			 */
			async getMemoryFromCloud(wx_openid: string, currentIndex: number): Promise < void > {
				let that = this;

				try {
					await db
						.collection('memory')
						.where("wx_openid == '" + wx_openid + "'")
						.get()
						.then((res) => {
							if (res.result.errCode === 0) {
								let allMemory: AnyObject[] = res.result.data[0] ? res.result.data[0]
									.memoryList : [];
								let currentMemory = allMemory.slice(currentIndex, currentIndex + 15);
								let memorySum = allMemory.length;

								if (currentIndex === 0) {
									that.memoryList = currentMemory;
									that.memorySum = memorySum;
									uni.setStorageSync(app.globalData.memoryCacheName, currentMemory);
									uni.setStorageSync(app.globalData.memorySumCacheName, memorySum);
								} else {
									that.memoryList = that.memoryList.concat(currentMemory);
								}
							}
						})
						.catch()
				} catch (e) {}
			},
			/**
			 * 点击回忆单元
			 * @param {object} memory 回忆
			 */
			onClickMemoryCell(memory: AnyObject): void {
				let that = this;

				that.isShowPopup = true;
				that.memoryDetail = memory;
				that.isShowMemoryDetail = true;
			},
			/**
			 * 点击编辑回忆
			 * @param {object} memory 回忆
			 */
			onClickEditorMemory(memory: AnyObject): void {
				console.log('点编辑的回忆内容', memory);
				console.log('点击编辑的回忆id', memory.id);
			},
			/**
			 * 点击添加回忆
			 */
			onClickAddMemory(): void {
				let that = this;

				that.isShowPopup = true;
				that.memoryDetail = {
					title: '',
					localPicPathList: [],
					content: ''
				};
				that.isShowAddMemory = true;
			},
			/**
			 * 点击回忆详情蒙版
			 */
			onClickMemoryDetailMask(): void {
				let that = this;

				that.isShowMemoryDetail = false;
				that.isShowPopup = false;
				that.memoryDetail = {};
			},
			/**
			 * 预览回忆单元的图片
			 * @param {string} location 图片位置
			 */
			onPreviewMemoryCellPic(location: string, index: number): void {
				let that = this;

				try {
					let picPathList: string[] = location === 'cloud' ? that.memoryDetail.cloudPicPathList : that
						.memoryDetail.localPicPathList;
					let currentPic: string = picPathList ? picPathList[index] ? picPathList[index] : '' : '';
					let currentPicPathList: string[] = [];

					if (!currentPic) return;

					for (let i = 0; i < picPathList.length; i++) {
						if (picPathList[i]) currentPicPathList.push(picPathList[i]);
					}
					uni.previewImage({
						current: currentPic,
						urls: currentPicPathList
					})
				} catch (e) {}
			},
			/**
			 * 监听输入的回忆标题
			 * @param {object} event 输入对象
			 */
			inputMemoryTitle(event): void {
				let that = this;

				that.memoryDetail.title = event.target.value;
			},
			/**
			 * 点击删除图片
			 */
			onClickDeletePic(index: number): void {
				let that = this;

				that.memoryDetail.localPicPathList.splice(index, 1);
			},
			/**
			 * 点击添加图片
			 */
			async onClickAddPic(): Promise < void > {
				let that = this;

				try {
					let localPicPathList = that.memoryDetail.localPicPathList;

					if (localPicPathList.length >= 5) {
						uni.showToast({
							title: '图片最多记录5张',
							icon: "none"
						})
					} else {
						let imageRes: any = await uni.chooseImage({
							count: 5 - localPicPathList.length,
							sizeType: ['compressed'],
							sourceType: ['album']
						})

						let chooseImageList: string[] = imageRes.tempFilePaths;
						for (let i = 0; i < chooseImageList.length; i++) {
							let compressRes: any = await uni.compressImage({
								src: chooseImageList[i],
								quality: 80
							});

							chooseImageList[i] = compressRes.tempFilePath;
						}
						that.memoryDetail.localPicPathList = localPicPathList.concat(chooseImageList);
					}
				} catch (e) {}
			},
			/**
			 * 监听输入的回忆内容
			 * @param {object} event 输入对象
			 */
			inputMemoryContent(event): void {
				let that = this;

				that.memoryDetail.content = event.target.value;
			},
			/**
			 * 点击添加回忆的返回事件
			 */
			onClickAddMemoryBack(): void {
				let that = this;

				uni.showModal({
					title: '温馨提示',
					content: '返回会清空当前正记录的回忆哦',
					success: (res) => {
						if (res.confirm) {
							that.memoryDetail = {};
							that.isShowAddMemory = false;
							that.isShowPopup = false;
						}
					}
				})
			},
			/**
			 * 点击添加回忆的记录事件
			 */
			onClickAddMemoryWrite(): void {
				let that = this;

				console.log('添加的回忆', that.memoryDetail);
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

	.view-box-noMemoryTip {
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

	.view-box-memoryCell {
		position: relative;
		background-color: #FEFFFF;
		border-radius: 30rpx;
		margin: 0rpx 35rpx 0rpx 35rpx;
		display: flex;
		flex-direction: column;
	}

	.text-content-memoryTitle {
		position: relative;
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
		color: #000000;
		font-size: 30rpx;
		font-weight: bold;
		margin: 20rpx 130rpx 0rpx 30rpx;
	}

	.text-content-memoryContent {
		position: relative;
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
		color: #434646;
		font-size: 24rpx;
		margin: 5rpx 130rpx 0rpx 30rpx;
	}

	.view-box-memoryPicList {
		position: relative;
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
		margin: 5rpx 130rpx 0rpx 30rpx;
	}

	.text-content-memoryInfo {
		position: relative;
		color: #CACED1;
		font-size: 24rpx;
		margin: 5rpx 130rpx 20rpx 30rpx;
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

	.image-icon-addMemory {
		position: fixed;
		width: 100rpx;
		height: 100rpx;
		right: 42rpx;
		bottom: 70rpx;
		flex-shrink: 0;
	}

	.view-area-popupMask {
		position: fixed;
		width: 100%;
		height: 100%;
		top: 0rpx;
		background-color: rgba(51, 51, 51, 0.5);
		overflow: hidden;
	}

	.view-box-memoryDetail {
		position: fixed;
		left: 45rpx;
		right: 45rpx;
		top: 50%;
		transform: translateY(-50%);
		background-color: #FBF2E3;
		border-radius: 30rpx;
	}

	.view-box-memoryItem {
		position: relative;
		margin: 0rpx 35rpx 0rpx 35rpx;
		display: flex;
		align-items: center;
	}

	.view-line-divider {
		position: relative;
		margin: 10rpx 35rpx 10rpx 35rpx;
		background-color: #467B73;
		height: 1rpx;
	}

	.scrollView-area-memoryContent {
		position: relative;
		color: #467B73;
		font-size: 30rpx;
		margin-left: 10rpx;
		max-height: 300rpx;
	}

	.view-box-memoryBoxTitle {
		position: relative;
		margin: 10rpx 35rpx 0rpx 35rpx;
		display: flex;
		justify-content: center;
		font-size: 30rpx;
		color: #467B73;
	}

	.view-box-addMemoryTitle {
		position: relative;
		margin: 5rpx 35rpx 0rpx 35rpx;
		border-bottom: 1rpx solid #467B73;
		display: flex;
		align-items: center;
		padding-bottom: 10rpx;
	}

	.input-area-addMemoryTitle {
		position: relative;
		font-size: 30rpx;
		width: 100%;
		color: #467B73;
	}

	.view-box-localMemoryPicList {
		position: relative;
		margin: 10rpx 35rpx 0rpx 35rpx;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		padding-bottom: 10rpx;
		border-bottom: 1rpx solid #467B73;
		overflow-wrap: break-word;
	}

	.view-box-localMemoryPic {
		position: relative;
		width: 100rpx;
		height: 100rpx;
	}

	.image-icon-deleteMemoryPic {
		position: absolute;
		width: 32rpx;
		height: 32rpx;
		right: 0rpx;
		top: 0rpx;
		flex-shrink: 0;
	}

	.view-box-addMemoryPic {
		position: relative;
		width: 100rpx;
		height: 100rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		font-size: 20rpx;
		color: #467B73;
	}

	.view-box-addMemoryContent {
		position: relative;
		margin: 10rpx 35rpx 0rpx 35rpx;
		border-bottom: 1rpx solid #467B73;
	}

	.textarea-area-inputMemoryContent {
		position: relative;
		font-size: 30rpx;
		width: 100%;
		height: 250rpx;
		color: #467B73;
		padding-bottom: 10rpx;
	}

	.view-box-addMemoryFunction {
		position: relative;
		margin: 20rpx 55rpx 20rpx 55rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
</style>
