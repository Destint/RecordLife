<template>
	<page-meta :page-style="'overflow:' + (isShowPopup ? 'hidden' : 'visible')"></page-meta>
	<view class="view-page-memory">
		<canvas type="2d" id="myCanvas" style="position: fixed;left: -10000rpx; top: -10000rpx;"></canvas>
		<view class="view-area-topInfo">
			<view class="view-box-notice">
				<image class="image-icon-basic" src="../../static/img_notice_icon.png"
					style="width: 35rpx;height: 32rpx;"></image>
				<text class="text-content-whiteThirty" style="margin-left: 20rpx;">{{notice}}</text>
			</view>
			<view class="view-box-memorySum">
				<text class="text-content-whiteThirty">全部回忆({{memorySum}})</text>
				<view class="view-box-search">
					<input class="input-area-searchMemory" maxlength="6" placeholder="搜索" :value="searchMemory"
						placeholder-style="color: rgba(254, 255, 2255, 0.5);" @input="inputSearchMemory" />
					<image class="image-icon-search" src="../../static/img_search_icon.png"
						@click="onClickSearchMemory"></image>
				</view>
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
						cursor-spacing="30" @blur="inputMemoryContent"></textarea>
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
	import locationSDK from "../../common/qqmap-wx-jssdk.js";
	/** 单个回忆数据详情 */
	interface memoryDetail {
		/** 回忆id */
		id: number;
		/** 回忆标题 */
		title: string;
		/** 回忆内容 */
		content: string;
		/** 云图片路径列表 */
		cloudPicPathList: string[];
		/** 本地图片路径列表 */
		localPicPathList: string[];
		/** 回忆记录日期 */
		date: string;
		/** 回忆简易地址 */
		simpleAddress: string;
		/** 回忆详细地址 */
		address: string;
	}
	const locationManager = new locationSDK({
		key: '3XKBZ-WP4CG-KQVQM-IJ2WK-7QAE7-2ZFKZ'
	}); // 位置管理器
	const serverDate = uniCloud.importObject('serverDate', {
		customUI: true
	}); // 服务器时间云对象
	const handleMemory = uniCloud.importObject('handleMemory', {
		customUI: true
	}); // 处理回忆云对象
	const db = uniCloud.database(); // 云数据库
	const app = getApp(); // APP全局变量
	var isWritingMemory = false; // 是否正在记录回忆
	export default {
		data() {
			return {
				notice: uni.getStorageSync(app.globalData.noticeCacheName) ? uni.getStorageSync(app.globalData
					.noticeCacheName) as string : '',
				memorySum: uni.getStorageSync(app.globalData.memorySumCacheName) ? uni.getStorageSync(app.globalData
					.memorySumCacheName) as number : 0,
				memoryList: uni.getStorageSync(app.globalData.memoryCacheName) ? uni.getStorageSync(app.globalData
					.memoryCacheName) as memoryDetail[] : [],
				isShowPopup: false,
				memoryDetail: undefined as memoryDetail,
				isShowMemoryDetail: false,
				isShowAddMemory: false,
				searchMemory: ''
			};
		},
		async onLoad() {
			let that = this;

			uni.showLoading({
				title: '载入回忆中',
				mask: true
			})
			if (!app.globalData.wx_openid) await commonFunctions.wxLogin();
			that.uploadAccessToCloud(app.globalData.wx_openid);
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

				if (that.searchMemory) return;
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
		onShareAppMessage() {
			return {
				title: '记录关于你的回忆',
				path: '/pages/memory/memory',
				imageUrl: 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-bcf64df9-4d03-4023-bc85-9000afa0f691/e989c0a9-706c-4c3c-8020-3c04a0e2344d.png'
			}
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
								let allMemory: memoryDetail[] = res.result.data[0] ? res.result.data[0]
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
								that.searchMemory = '';
							}
						})
						.catch()
				} catch (e) {}
			},
			/**
			 * 点击回忆单元
			 * @param {object} memory 回忆
			 */
			onClickMemoryCell(memory: memoryDetail): void {
				let that = this;

				that.isShowPopup = true;
				that.memoryDetail = memory;
				that.isShowMemoryDetail = true;
			},
			/**
			 * 点击编辑回忆
			 * @param {memoryDetail} memory 回忆
			 */
			onClickEditorMemory(memory: memoryDetail): void {
				let that = this;

				try {
					uni.showActionSheet({
						itemList: ['删除该回忆'],
						success: (res) => {
							if (res.tapIndex === 0) that.deleteMemory(memory);
						},
						fail: () => {}
					})
				} catch (e) {}
			},
			/**
			 * 点击添加回忆
			 */
			onClickAddMemory(): void {
				let that = this;

				that.isShowPopup = true;
				that.memoryDetail = {
					id: 0,
					title: '',
					content: '',
					localPicPathList: [],
					cloudPicPathList: [],
					address: '',
					simpleAddress: '',
					date: ''
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
				that.memoryDetail = undefined;
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
			inputMemoryTitle(event: any): void {
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
			 * 封装自带的选择图片API
			 * @@param {number} count 选择的图片个数
			 */
			chooseImage(count: number) {
				return new Promise((resolve) => {
					uni.chooseImage({
						count: count,
						sizeType: ['compressed'],
						sourceType: ['album'],
						success: (res) => {
							resolve(res);
						},
						fail: () => {
							resolve(undefined);
						}
					});
				});
			},
			/**
			 * 封装自带的压缩图片的API
			 * @@param {string} src 图片地址
			 */
			compressImage(src: string): Promise < string > {
				return new Promise((resolve) => {
					uni.compressImage({
						src: src,
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
						let imageRes: AnyObject = await that.chooseImage(5 - localPicPathList.length);

						if (!imageRes) return;
						uni.showLoading({
							title: '图片选择中...',
							mask: true
						})
						let chooseImageList: string[] = imageRes.tempFiles;

						chooseImageList = await that.compressImgList(imageRes.tempFiles);
						for (let i = 0; i < chooseImageList.length; i++) {
							let compressRes = await that.compressImage(chooseImageList[i]);

							chooseImageList[i] = compressRes;
						}
						that.memoryDetail.localPicPathList = localPicPathList.concat(chooseImageList);
						uni.hideLoading();
					}
				} catch (e) {}
			},
			/**
			 * 封装自带的获取图片信息的API
			 * @@param {string} src 图片地址
			 */
			getImageInfo(src: string) {
				return new Promise((resolve) => {
					uni.getImageInfo({
						src: src,
						success: (res) => {
							resolve(res);
						},
						fail: () => {
							resolve(undefined);
						}
					});
				});
			},
			/**
			 * 压缩图片列表
			 * @param {Array} imgList 图片列表
			 */
			async compressImgList(imgList: any): Promise < string[] > {
				let that = this;

				try {
					let compressImgList: string[] = [];

					for (let i = 0; i < imgList.length; i++) {
						if (imgList[i].size / 1024 < 500) {
							compressImgList.push(imgList[i].path);
							continue;
						}
						let imageInfo: AnyObject = await that.getImageInfo(imgList[i].path);

						if (!imageInfo) continue;
						let p: Promise < boolean > = new Promise((resolve) => {
							const selectorQuery: any = uni.createSelectorQuery();

							selectorQuery
								.select('#myCanvas')
								.fields({
									node: true,
									size: true
								})
								.exec((res: any) => {
									const canvas: any = res[0].node;
									const ctx = canvas.getContext('2d');
									const ratio = imageInfo.height / imageInfo.width;

									canvas.width = imageInfo.width > 750 ? 750 : imageInfo.width;
									canvas.height = canvas.width * ratio;
									let img = canvas.createImage();

									img.src = imageInfo.path;
									img.onload = () => {
										ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
										wx.canvasToTempFilePath({
											canvas: canvas,
											fileType: 'jpg',
											success: (fileRes) => {
												compressImgList.push(fileRes.tempFilePath);
												resolve(true);
											},
											fail: () => {
												resolve(true);
											}
										}, this);
									}
									img.onerror = () => {
										resolve(true);
									}
								})
						})

						await p;
					}

					return compressImgList;
				} catch (e) {}
			},
			/**
			 * 监听输入的回忆内容
			 * @param {object} event 输入对象
			 */
			inputMemoryContent(event: any): void {
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
							that.memoryDetail = undefined;
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

				try {
					let addMemory = that.memoryDetail;
					if (addMemory.title === '') {
						uni.showToast({
							title: '回忆标题不能为空',
							icon: "none"
						})

						return;
					}
					if (isWritingMemory === true) return;
					isWritingMemory = true;
					uni.showModal({
						title: '温馨提示',
						content: '是否记录当前回忆',
						success: async (res) => {
							if (res.confirm) {
								let checkContent: string = addMemory.title + addMemory.content;

								uni.showLoading({
									title: '记录中...',
									mask: true
								})
								let checkContentResult = await commonFunctions.checkContentSecurity(
									checkContent);

								if (checkContentResult.errCode !== 0) {
									uni.hideLoading();
									uni.showModal({
										title: '温馨提示',
										content: checkContentResult.errMsg,
										showCancel: false,
										success: () => {
											isWritingMemory = false;
										}
									})
								} else {
									await that.startWriteMemory();
								}
							}
							if (res.cancel) {
								isWritingMemory = false;
							}
						}
					})
				} catch (e) {
					uni.showModal({
						title: '温馨提示',
						content: '记录回忆失败请重试',
						showCancel: false,
						success: (res) => {
							if (res.confirm) {
								isWritingMemory = false;
							}
						}
					})
				}
			},
			/**
			 * 开始记录回忆
			 */
			async startWriteMemory(): Promise < void > {
				let that = this;

				try {
					await that.getCurrentAddressInfo();
					await that.setMemoryIdAndDate();
					await that.uploadLocalFileToCloud();
					await that.uploadMemoryToCloud();
					that.memoryDetail = undefined;
					that.isShowAddMemory = false;
					that.isShowPopup = false;
					isWritingMemory = false;
					uni.hideLoading();
					uni.showToast({
						title: '记录成功',
						icon: "none"
					})
				} catch (e) {
					uni.hideLoading();
					uni.showModal({
						title: '温馨提示',
						content: '记录回忆失败，请重试',
						showCancel: false,
						success: () => {
							isWritingMemory = false;
						}
					})
				}
			},
			/**
			 * 获取当前位置信息
			 */
			async getCurrentAddressInfo(): Promise < void > {
				let that = this;

				try {
					let p: Promise < boolean > = new Promise((resolve) => {
						wx.startLocationUpdate({
							success: () => {
								wx.onLocationChange(async (res) => {
									wx.offLocationChange();
									wx.stopLocationUpdate();
									await that.getCurrentLocation(res.latitude, res
										.longitude);
									resolve(true);
								})
							},
							fail: () => {
								resolve(true)
							}
						})
					})

					await p;
				} catch (e) {}
			},
			/**
			 * 根据经纬度获取当前位置信息
			 * @param latitude 纬度
			 * @param longitude 经度
			 */
			async getCurrentLocation(latitude: number, longitude: number): Promise < void > {
				let that = this;

				try {
					let p: Promise < boolean > = new Promise((resolve) => {
						locationManager.reverseGeocoder({
							location: {
								latitude: latitude,
								longitude: longitude
							},
							success: async (res: any) => {
								if (res && res.result) {
									let address: string = res.result.address ? res.result.address :
										''; // 详细地址
									let city: string = res.result.ad_info.city ? res.result.ad_info
										.city : ''; // 城市
									let district: string = res.result.ad_info.district ? res.result
										.ad_info.district : ''; // 区
									let simpleAddress: string = district ? district : city; // 简易地址

									await that.getCurrentWeather(simpleAddress, address);
								}
								resolve(true);
							},
							fail: () => {
								resolve(true);
							}
						})
					});

					await p;
				} catch (e) {}
			},
			/**
			 * 根据地址获取天气信息
			 * @param simpleAddress 简易地址
			 * @param address 详细地址
			 */
			async getCurrentWeather(simpleAddress: string, address: string): Promise < void > {
				let that = this;

				try {
					let p: Promise < boolean > = new Promise((resolve) => {
						uni.request({
							url: 'https://free-api.heweather.net/s6/weather/now',
							data: {
								location: simpleAddress,
								key: "2ce65b27e7784d0f85ecd7b8127f5e2d"
							},
							success: (res: any) => {
								let weather: string = res.data.HeWeather6[0].now.cond_txt;
								let temperature: string = res.data.HeWeather6[0].now.fl + '℃';

								that.memoryDetail.address = address + ' ' + weather + ' ' +
									temperature;
								that.memoryDetail.simpleAddress = simpleAddress + ' ' + weather +
									' ' + temperature;
								resolve(true);
							},
							fail: () => {
								resolve(true);
							}
						})
					});

					await p;
				} catch (e) {}
			},
			/**
			 * 设置本次回忆的日期和ID
			 */
			async setMemoryIdAndDate(): Promise < void > {
				let that = this;

				try {
					let currentDateInfo = await serverDate.getCurrentDate();

					if (currentDateInfo.errCode === 0) {
						that.memoryDetail.id = currentDateInfo.data.currentId;
						that.memoryDetail.date = currentDateInfo.data.currentDate;
					}
				} catch (e) {}
			},
			/**
			 * 上传本地文件到云端
			 */
			async uploadLocalFileToCloud(): Promise < void > {
				let that = this;

				try {
					if (that.memoryDetail.localPicPathList.length === 0) return;

					let currentId: number = that.memoryDetail.id;
					let localPicPathList: string[] = that.memoryDetail.localPicPathList;
					let proArr: Promise < boolean > [] = [];

					for (let i = 0; i < localPicPathList.length; i++) {
						proArr.push(new Promise((resolve) => {
							uniCloud.uploadFile({
								filePath: localPicPathList[i],
								cloudPath: app.globalData.wx_openid + '.' + currentId + i + '.jpg'
							}).then((res) => {
								that.memoryDetail.cloudPicPathList[i] = res.fileID;
								resolve(true);
							}).catch(() => {
								that.memoryDetail.cloudPicPathList[i] = '';
								resolve(true);
							})
						}))
					}

					await Promise.all(proArr).then(() => {}).catch(() => {})
				} catch (e) {}
			},
			/**
			 * 上传回忆到云端
			 */
			async uploadMemoryToCloud(): Promise < void > {
				let that = this;

				try {
					await db
						.collection('memory')
						.where("wx_openid == '" + app.globalData.wx_openid + "'")
						.get()
						.then(async (res) => {
							if (res.result.errCode === 0) {
								let memoryList: memoryDetail[] = res.result.data[0] ? res.result.data[0]
									.memoryList : [];

								memoryList.unshift(that.memoryDetail);
								if (res.result.data.length === 0) {
									await db
										.collection('memory')
										.add({
											'wx_openid': app.globalData.wx_openid,
											'memoryList': memoryList
										})
										.then(() => {
											that.memoryList = memoryList.slice(0, 15);
											that.memorySum = memoryList.length;
											that.searchMemory = '';
											uni.setStorageSync(app.globalData.memoryCacheName,
												memoryList.slice(0, 15));
											uni.setStorageSync(app.globalData.memorySumCacheName,
												memoryList.length);
										})
										.catch()
								} else {
									await db
										.collection('memory')
										.where("wx_openid == '" + app.globalData.wx_openid + "'")
										.update({
											'memoryList': memoryList
										})
										.then(() => {
											that.memoryList = memoryList.slice(0, 15);
											that.memorySum = memoryList.length;
											that.searchMemory = '';
											uni.setStorageSync(app.globalData.memoryCacheName,
												memoryList.slice(0, 15));
											uni.setStorageSync(app.globalData.memorySumCacheName,
												memoryList.length);
										})
										.catch()
								}
							}
						})
						.catch()
				} catch (e) {}
			},
			/**
			 * 删除回忆
			 * @param memory {memoryDetail} 删除的回忆
			 */
			deleteMemory(memory: memoryDetail): void {
				if (!memory) return;

				try {
					let that = this;

					uni.showModal({
						title: '温馨提示',
						content: '是否删除回忆《' + memory.title + '》',
						success: async (res) => {
							if (res.confirm) {
								uni.showLoading({
									title: '删除中...',
									mask: true
								})
								let result: AnyObject = await handleMemory.deleteMemory(app.globalData
									.wx_openid,
									memory.id);

								if (result.errCode === 0) {
									that.memoryList = result.data.memoryList.slice(0, 15);
									that.searchMemory = '';
									that.memorySum = result.data.memoryList.length;
									uni.setStorageSync(app.globalData.memoryCacheName,
										result.data.memoryList.slice(0, 15));
									uni.setStorageSync(app.globalData.memorySumCacheName,
										result.data.memoryList.length);
									uni.hideLoading();
									uni.showToast({
										title: '删除成功',
										icon: "none"
									})
								} else {
									uni.hideLoading();
									uni.showToast({
										title: '删除失败',
										icon: "none"
									})
								}
							}
						}
					})
				} catch (e) {}
			},

			/**
			 * 监听输入的回忆搜索内容
			 * @param {object} event 输入对象
			 */
			inputSearchMemory(event: any): void {
				let that = this;

				that.searchMemory = event.target.value;
			},

			/**
			 * 点击搜索回忆事件
			 */
			async onClickSearchMemory(): Promise < void > {
				let that = this;

				try {
					let searchMemoryList: memoryDetail[] = [];

					if (!that.searchMemory) {
						that.memoryList = uni.getStorageSync(app.globalData.memoryCacheName) ? uni.getStorageSync(app
							.globalData.memoryCacheName) : [];
						return;
					}
					uni.showLoading({
						title: '搜索回忆中',
						mask: true
					})
					await db
						.collection('memory')
						.where("wx_openid == '" + app.globalData.wx_openid + "'")
						.get()
						.then(async (res) => {
							if (res.result.errCode === 0) {
								let memoryList: memoryDetail[] = res.result.data[0] ? res.result.data[0]
									.memoryList : [];

								for (let i = 0; i < memoryList.length; i++) {
									if (memoryList[i].title.indexOf(that.searchMemory) !== -1 || memoryList[i]
										.content.indexOf(that.searchMemory) !== -1) searchMemoryList.push(
										memoryList[i]);
								}
								that.memoryList = searchMemoryList;
							}
						})
						.catch()
					uni.hideLoading();
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

	.view-box-search {
		position: absolute;
		display: flex;
		align-items: center;
		width: 250rpx;
		height: 50rpx;
		right: 0rpx;
		border: 1rpx solid #FEFFFF;
		border-radius: 50rpx;
	}

	.input-area-searchMemory {
		position: relative;
		margin: 0rpx 60rpx 0rpx 10rpx;
		font-size: 30rpx;
		width: 100%;
		color: #FEFFFF;
	}

	.image-icon-search {
		position: absolute;
		right: 10rpx;
		width: 40rpx;
		height: 40rpx;
		flex-shrink: 0;
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
