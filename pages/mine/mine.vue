<template>
	<page-meta :page-style="'overflow:' + (isShowPopup ? 'hidden' : 'visible')"></page-meta>
	<view class="view-page-mine">
		<canvas type="2d" id="myCanvas" style="position: fixed;left: -10000rpx; top: -10000rpx;"></canvas>
		<view class="view-area-topInfo">
			<image class="image-icon-avatar" mode="aspectFill"
				:src="cloudAvatarPath ? cloudAvatarPath : '../../static/img_default_avatar_icon.png'"></image>
			<text class="text-content-nickname">{{nickname}}</text>
			<block v-if="calendar.date">
				<view class="view-box-calendar">
					<text>{{calendar.date}}</text>
					<text>{{calendar.lunar}}</text>
					<text>{{calendar.year + ' ' + calendar.zodiac}}</text>
					<text>{{calendar.month + ' ' + calendar.day}}</text>
					<text>{{calendar.solarTerm}}</text>
				</view>
			</block>
		</view>
		<view class="view-area-function">
			<view class="view-box-functionCell" @click="onClickSetAvatar">
				<image class="image-icon-functionCell" src="../../static/img_set_avatar_icon.png"></image>
				<text class="text-content-functionCell">设置头像</text>
			</view>
			<view class="view-box-functionCell" @click="onClickSetNickname" style="border-top: 1rpx solid #E4E4E4;">
				<image class="image-icon-functionCell" src="../../static/img_set_nickname_icon.png"></image>
				<text class="text-content-functionCell">设置昵称</text>
			</view>
			<block v-if="role === 'manager'">
				<view class="view-box-functionCell" @click="onClickSetNotice" style="border-top: 1rpx solid #E4E4E4;">
					<image class="image-icon-functionCell" src="../../static/img_set_notice_icon.png"></image>
					<text class="text-content-functionCell">设置公告</text>
				</view>
			</block>
		</view>
		<view class="view-area-function">
			<view class="view-box-functionCell" @click="onClickSuitAndAvoid">
				<image class="image-icon-functionCell" src="../../static/img_suit_and_avoid_icon.png"></image>
				<text class="text-content-functionCell">今日宜忌</text>
			</view>
			<view class="view-box-functionCell" @click="onClickRandomJoke" style="border-top: 1rpx solid #E4E4E4;">
				<image class="image-icon-functionCell" src="../../static/img_random_joke_icon.png"></image>
				<text class="text-content-functionCell">随机笑话</text>
			</view>
			<view class="view-box-functionCell" @click="onClickRandomSweetWorld"
				style="border-top: 1rpx solid #E4E4E4;">
				<image class="image-icon-functionCell" src="../../static/img_random_sweet_world_icon.png"></image>
				<text class="text-content-functionCell">随机情话</text>
			</view>
			<view class="view-box-functionCell" @click="onClickFishCalendar" style="border-top: 1rpx solid #E4E4E4;">
				<image class="image-icon-functionCell" src="../../static/img_fish_calendar_icon.png"></image>
				<text class="text-content-functionCell">摸鱼日历</text>
			</view>
		</view>
		<view class="view-area-function">
			<view class="view-box-functionCell">
				<image class="image-icon-functionCell" src="../../static/img_contact_icon.png"></image>
				<text class="text-content-functionCell">联系客服</text>
				<button class="button-own-functionCell" open-type="contact"></button>
			</view>
			<view class="view-box-functionCell" style="border-top: 1rpx solid #E4E4E4;">
				<image class="image-icon-functionCell" src="../../static/img_share_app_icon.png"></image>
				<text class="text-content-functionCell">分享小程序</text>
				<button class="button-own-functionCell" open-type="share"></button>
			</view>
			<view class="view-box-functionCell" @click="onClickAboutApp" style="border-top: 1rpx solid #E4E4E4;">
				<image class="image-icon-functionCell" src="../../static/img_about_app_icon.png"></image>
				<text class="text-content-functionCell">关于小程序</text>
			</view>
		</view>
		<block v-if="isShowSetNicknameView === true">
			<view class="view-area-popupMask" @click="onClickSetNicknameMask"></view>
			<view class="view-box-setPopup">
				<view class="view-box-popupTitle">设置昵称</view>
				<view class="view-area-input">
					<input class="input-area-content" maxlength="6" placeholder="请输入昵称..."
						placeholder-style="color: rgba(70,123,115,0.5);" @input="inputNicknameContent" />
				</view>
				<image class="image-icon-upload" src="../../static/img_upload_icon.png" @click="onClickUploadNickname">
				</image>
			</view>
		</block>
		<block v-if="isShowSetNoticeView === true">
			<view class="view-area-popupMask" @click="onClickSetNoticeMask"></view>
			<view class="view-box-setPopup">
				<view class="view-box-popupTitle">设置公告</view>
				<view class="view-area-input">
					<input class="input-area-content" maxlength="40" placeholder="公告内容..."
						placeholder-style="color: rgba(70,123,115,0.5);" @input="inputNoticeContent" />
				</view>
				<image class="image-icon-upload" src="../../static/img_upload_icon.png" @click="onClickUploadNotice">
				</image>
			</view>
		</block>
		<block v-if="isShowOtherFunctionView === true">
			<view class="view-area-popupMask" @click="onClickOtherFunctionMask"></view>
			<view class="view-box-otherFunction">
				<text class="text-content-otherFunctionTitle">{{otherFunctionTitle}}</text>
				<text class="text-content-otherFunctionContent" user-select>{{otherFunctionContent}}</text>
			</view>
		</block>
		<block v-if="isShowAboutApp === true">
			<view class="view-area-popupMask" @click="onClickAboutAppMask"></view>
			<view class="view-box-aboutAppPopup">
				<view class="view-box-popupTitle">关于小程序</view>
				<text class="text-content-aboutApp" user-select>{{aboutAppContent}}</text>
				<image class="image-icon-praise" @click="onClickPraiseApp"
					:src="isPraiseApp ? '../../static/img_praise_icon.png' : '../../static/img_no_praise_icon.png'">
				</image>
				<text class="text-content-praiseNum">{{praiseAppSum}}</text>
			</view>
		</block>
	</view>
</template>

<script lang="ts">
	import commonFunctions from "../../common/commonFunctions.js";
	const app = getApp(); // APP全局变量
	const db = uniCloud.database(); // 云数据库
	const serverDate = uniCloud.importObject('serverDate', {
		customUI: true
	}); // 服务器时间云对象
	const handleCloudStorage = uniCloud.importObject('handleCloudStorage', {
		customUI: true
	}); // 处理云存储的云对象
	export default {
		data() {
			return {
				isShowPopup: false,
				cloudAvatarPath: uni.getStorageSync(app.globalData.cloudAvatarPathCacheName) ? uni.getStorageSync(app
					.globalData.cloudAvatarPathCacheName) as string : '',
				nickname: uni.getStorageSync(app.globalData.nicknameCacheName) ? uni.getStorageSync(app
					.globalData.nicknameCacheName) as string : '请设置昵称',
				calendar: uni.getStorageSync(app.globalData.calendarCacheName) ? uni.getStorageSync(app
					.globalData.calendarCacheName) : {},
				role: uni.getStorageSync(app.globalData.roleCacheName) ? uni.getStorageSync(app
					.globalData.roleCacheName) as string : 'ordinary',
				isShowSetNicknameView: false,
				setNicknameContent: '',
				isShowSetNoticeView: false,
				setNoticeContent: '',
				isShowOtherFunctionView: false,
				otherFunctionTitle: '',
				otherFunctionContent: '',
				isShowAboutApp: false,
				aboutAppContent: '因为你 所以有了我。\n可选的需要小程序授权的功能：\n1、开启定位后，可在记录回忆时记下位置与天气。\n2、可从相册中选择想要的图片一同记录。\n如果您在使用小程序时遇到任何问题或者您对小程序有更好的建议或想法，欢迎通过《联系客服》功能来向开发者反馈。',
				isPraiseApp: uni.getStorageSync(app.globalData.isPraiseAppCacheName) ? uni.getStorageSync(app.globalData
					.isPraiseAppCacheName) as boolean : false,
				praiseAppSum: uni.getStorageSync(app.globalData.praiseAppSumCacheName) ? uni.getStorageSync(app.globalData
					.praiseAppSumCacheName) as number : 0
			};
		},
		async onLoad() {
			let that = this;

			uni.showLoading({
				title: '加载中',
				mask: true
			})
			if (!app.globalData.wx_openid) await commonFunctions.wxLogin();
			await that.getUserInfoFromCloud(app.globalData.wx_openid);
			await that.getCalendarInfo();
			uni.hideLoading();
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
			 * 从云端获取用户信息
			 * @param {string} wx_openid 微信小程序的用户唯一标识
			 */
			async getUserInfoFromCloud(wx_openid: string): Promise < void > {
				let that = this;

				try {
					await db
						.collection('user')
						.where("wx_openid == '" + wx_openid + "'")
						.get()
						.then((res) => {
							if (res.result.errCode === 0) {
								let userInfo: AnyObject = res.result.data[0];

								that.cloudAvatarPath = userInfo.avatar ? userInfo.avatar : '';
								that.nickname = userInfo.nickname ? userInfo.nickname : '请设置昵称';
								that.role = userInfo.role ? userInfo.role : 'ordinary';
								uni.setStorageSync(app.globalData.cloudAvatarPathCacheName, userInfo.avatar);
								uni.setStorageSync(app.globalData.nicknameCacheName, userInfo.nickname);
								uni.setStorageSync(app.globalData.roleCacheName, userInfo.role);
							}
						})
						.catch()
				} catch (e) {}
			},
			/**
			 * 封装自带的http请求API
			 * @@param {string} url 请求地址
			 * @@param {AnyObject} data 请求参数
			 */
			httpRequest(url: string, data ? : AnyObject) {
				return new Promise((resolve) => {
					uni.request({
						url: url,
						data: data,
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
			 * 获取万年历信息
			 */
			async getCalendarInfo(): Promise < void > {
				let that = this;

				try {
					let currentDateInfo = await serverDate.getCurrentDate();
					let currentDate: string = currentDateInfo.data.currentDate.slice(0, 10);
					let calendarCache: AnyObject = uni.getStorageSync(app.globalData.calendarCacheName);

					if (calendarCache && calendarCache.date === currentDate) return;
					let httpUrl = 'https://api.djapi.cn/wannianli/get';
					let httpData = {
						date: currentDate,
						cn_to_unicode: '1',
						token: '37555a616248cb486ca0e60c10eca164',
						datatype: 'json'
					};
					let calendarRes: AnyObject = await that.httpRequest(httpUrl, httpData);
					let calendarInfo: AnyObject = calendarRes.data.Result;
					let calendar: AnyObject = {};

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
					uni.setStorageSync(app.globalData.calendarCacheName, calendar);
				} catch (e) {}
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
			 * 点击设置头像
			 */
			async onClickSetAvatar(): Promise < void > {
				let that = this;

				try {
					let imageRes: any = await that.chooseImage(1);

					if (!imageRes) return;
					uni.showLoading({
						title: '设置中...',
						mask: true
					})
					let chooseImageList: string[] = imageRes.tempFiles;

					chooseImageList = await that.compressImgList(imageRes.tempFiles);
					for (let i = 0; i < chooseImageList.length; i++) {
						let compressRes = await that.compressImage(chooseImageList[i]);

						chooseImageList[i] = compressRes;
					}
					await uniCloud.uploadFile({
						filePath: chooseImageList[0],
						cloudPath: app.globalData.wx_openid + '.avatar.jpg'
					}).then(async (res) => {
						let cloudAvatarPath: string = res.fileID;

						that.cloudAvatarPath = cloudAvatarPath;
						uni.setStorageSync(app.globalData.cloudAvatarPathCacheName, cloudAvatarPath);
						await db
							.collection('user')
							.where("wx_openid == '" + app.globalData.wx_openid + "'")
							.get()
							.then(async (res) => {
								if (res.result.errCode === 0) {
									let avatar: string = res.result.data[0] ? res.result.data[0]
										.avatar : '';
									let fileList: string[] = [];

									if (avatar) {
										fileList.push(avatar);
										await handleCloudStorage.deleteCloudFiles(fileList);
									}
								}
							})
							.catch()
						await db
							.collection('user')
							.where("wx_openid == '" + app.globalData.wx_openid + "'")
							.update({
								'avatar': cloudAvatarPath
							})
							.then()
							.catch()
					}).catch()
					uni.hideLoading();
				} catch (e) {
					uni.hideLoading();
				}
			},
			/**
			 * 点击设置昵称
			 */
			onClickSetNickname(): void {
				let that = this;

				that.isShowPopup = true;
				that.isShowSetNicknameView = true;
				that.setNicknameContent = '';
			},
			/**
			 * 点击设置昵称页蒙版
			 */
			onClickSetNicknameMask() {
				let that = this;

				that.setNicknameContent = '';
				that.isShowSetNicknameView = false;
				that.isShowPopup = false;
			},
			/**
			 * 监听输入的昵称
			 * @param {object} event 输入对象
			 */
			inputNicknameContent(event: any): void {
				let that = this;

				that.setNicknameContent = event.target.value;
			},
			/**
			 * 点击上传昵称事件
			 */
			async onClickUploadNickname(): Promise < void > {
				let that = this;

				try {
					let nickname: string = that.setNicknameContent;

					if (!nickname) {
						uni.showToast({
							title: '昵称不能为空',
							icon: "none"
						})

						return;
					}
					uni.showModal({
						title: '温馨提示',
						content: '是否设置该昵称',
						success: async (res) => {
							if (res.confirm) {
								uni.showLoading({
									title: '设置中...',
									mask: true
								})
								await db
									.collection('user')
									.where("wx_openid == '" + app.globalData.wx_openid + "'")
									.update({
										'nickname': nickname
									})
									.then(() => {
										that.nickname = nickname;
										uni.setStorageSync(app.globalData.nicknameCacheName, nickname);
										that.onClickSetNicknameMask();
										uni.hideLoading();
										uni.showToast({
											title: '设置成功',
											icon: "none"
										})
									})
									.catch(() => {
										that.onClickSetNicknameMask();
										uni.hideLoading();
									})
							}
						}
					})
				} catch (e) {
					that.onClickSetNicknameMask();
					uni.hideLoading();
				}
			},
			/**
			 * 点击设置公告事件
			 */
			onClickSetNotice(): void {
				let that = this;

				that.isShowPopup = true;
				that.isShowSetNoticeView = true;
				that.setNoticeContent = '';
			},
			/**
			 * 点击设置公告页蒙版
			 */
			onClickSetNoticeMask() {
				let that = this;

				that.setNoticeContent = '';
				that.isShowSetNoticeView = false;
				that.isShowPopup = false;
			},
			/**
			 * 监听输入的公告
			 * @param {object} event 输入对象
			 */
			inputNoticeContent(event: any): void {
				let that = this;

				that.setNoticeContent = event.target.value;
			},
			/**
			 * 点击上传公告事件
			 */
			async onClickUploadNotice(): Promise < void > {
				let that = this;

				try {
					let notice: string = that.setNoticeContent;

					if (!notice) {
						uni.showToast({
							title: '公告不能为空',
							icon: "none"
						})

						return;
					}
					uni.showModal({
						title: '温馨提示',
						content: '是否设置该公告',
						success: async (res) => {
							if (res.confirm) {
								uni.showLoading({
									title: '设置中...',
									mask: true
								})
								await db
									.collection('notice')
									.where("_id == '62f49bb51ff3ac000168404b'")
									.get()
									.then(async (res) => {
										if (res.result.errCode === 0) {
											let noticeList: AnyObject[] = res.result.data[0] ? res
												.result.data[0].noticeList : [];
											let currentDateInfo = await serverDate
												.getCurrentDate();
											let currentDate: string = currentDateInfo.data
												.currentDate;
											let currentNotice: AnyObject = {};

											currentNotice.notice = notice;
											currentNotice.date = currentDate;
											noticeList.unshift(currentNotice);

											await db
												.collection('notice')
												.where("_id == '62f49bb51ff3ac000168404b'")
												.update({
													'noticeList': noticeList
												})
												.then(() => {
													that.onClickSetNoticeMask();
													uni.hideLoading();
													uni.showToast({
														title: '设置成功',
														icon: "none"
													})
												})
												.catch(() => {
													that.onClickSetNoticeMask();
													uni.hideLoading();
												})
										}
									})
									.catch(() => {
										that.onClickSetNoticeMask();
										uni.hideLoading();
									})
							}
						}
					})
				} catch (e) {
					that.onClickSetNoticeMask();
					uni.hideLoading();
				}
			},
			/**
			 * 点击今日宜忌事件
			 */
			onClickSuitAndAvoid(): void {
				let that = this;

				that.otherFunctionTitle = '今日宜忌';
				that.otherFunctionContent = "宜: " + that.calendar.suitable + "\n忌: " + that.calendar.tapu;
				that.isShowPopup = true;
				that.isShowOtherFunctionView = true;
			},
			/**
			 * 点击其他功能页蒙版
			 */
			onClickOtherFunctionMask(): void {
				let that = this;

				that.isShowOtherFunctionView = false;
				that.isShowPopup = false;
				that.otherFunctionTitle = '';
				that.otherFunctionContent = '';
			},
			/**
			 * 点击随机笑话事件
			 */
			async onClickRandomJoke(): Promise < void > {
				let that = this;

				try {
					uni.showLoading({
						title: '生成中...',
						mask: true
					})
					let httpUrl = 'https://api.vvhan.com/api/joke?type=json';
					let randomJokeRes: AnyObject = await that.httpRequest(httpUrl);

					if (randomJokeRes && randomJokeRes.data && randomJokeRes.data.success) {
						let joke: string = randomJokeRes.data.joke;
						let title: string = randomJokeRes.data.title;

						that.otherFunctionTitle = title;
						that.otherFunctionContent = joke;
						that.isShowPopup = true;
						that.isShowOtherFunctionView = true;
					}
					uni.hideLoading();
				} catch (e) {
					uni.hideLoading();
				}
			},
			/**
			 * 点击随机情话事件
			 */
			async onClickRandomSweetWorld(): Promise < void > {
				let that = this;

				try {
					uni.showLoading({
						title: '生成中...',
						mask: true
					})
					let httpUrl = 'https://api.vvhan.com/api/love?type=json';
					let randomSweetWorldRes: AnyObject = await that.httpRequest(httpUrl);

					if (randomSweetWorldRes && randomSweetWorldRes.data && randomSweetWorldRes.data.success) {
						that.otherFunctionTitle = "随机情话";
						that.otherFunctionContent = randomSweetWorldRes.data.ishan;
						that.isShowPopup = true;
						that.isShowOtherFunctionView = true;
					}
					uni.hideLoading();
				} catch (e) {
					uni.hideLoading();
				}
			},
			/**
			 * 点击关于小程序事件
			 */
			async onClickAboutApp(): Promise < void > {
				let that = this;

				try {
					that.getPraiseInfoFromCloud();
					that.isShowPopup = true;
					that.isShowAboutApp = true;
				} catch (e) {}
			},
			/**
			 * 点击关于小程序页蒙版
			 */
			onClickAboutAppMask(): void {
				let that = this;

				that.isShowAboutApp = false;
				that.isShowPopup = false;
			},
			/**
			 * 从云端获取点赞信息
			 */
			async getPraiseInfoFromCloud(): Promise < void > {
				let that = this;

				try {
					await db
						.collection('praise')
						.where("_id == '6310654ce3e39a0001adc296'")
						.get()
						.then((res) => {
							if (res.result.errCode === 0) {
								let praiseList: string[] = res.result.data[0] ? res.result.data[0].praiseList : [];

								that.isPraiseApp = praiseList.indexOf(app.globalData.wx_openid) === -1 ? false :
									true;
								that.praiseAppSum = praiseList.length;
								uni.setStorageSync(app.globalData.isPraiseAppCacheName, that.isPraiseApp);
								uni.setStorageSync(app.globalData.praiseAppSumCacheName, that.praiseAppSum);
							}
						})
						.catch()
				} catch (e) {}
			},
			/**
			 * 点击点赞APP事件
			 */
			async onClickPraiseApp(): Promise < void > {
				let that = this;

				try {
					if (that.isPraiseApp === true) return;
					await db
						.collection('praise')
						.where("_id == '6310654ce3e39a0001adc296'")
						.get()
						.then(async (res) => {
							if (res.result.errCode === 0) {
								let praiseList: string[] = res.result.data[0] ? res.result.data[0].praiseList :
									[];

								if (praiseList.indexOf(app.globalData.wx_openid) === -1) praiseList.unshift(app
									.globalData.wx_openid);

								that.isPraiseApp = praiseList.indexOf(app.globalData.wx_openid) === -1 ?
									false :
									true;
								that.praiseAppSum = praiseList.length;
								uni.setStorageSync(app.globalData.isPraiseAppCacheName, that.isPraiseApp);
								uni.setStorageSync(app.globalData.praiseAppSumCacheName, that.praiseAppSum);
								uni.showToast({
									title: '谢谢你，陌生人',
									icon: "none"
								})
								await db
									.collection('praise')
									.where("_id == '6310654ce3e39a0001adc296'")
									.update({
										'praiseList': praiseList
									})
									.then()
									.catch()
							}
						})
						.catch()
				} catch (e) {}
			},
			/**
			 * 点击摸鱼日历事件
			 */
			async onClickFishCalendar(): Promise < void > {
				let that = this;

				try {
					uni.showLoading({
						title: '生成中...',
						mask: true
					})
					let httpUrl = 'https://api.vvhan.com/api/moyu?type=json';
					let fishCalendarRes: AnyObject = await that.httpRequest(httpUrl);


					uni.hideLoading();
					if (fishCalendarRes && fishCalendarRes.data && fishCalendarRes.data.url) {
						let imgList: string[] = [];

						imgList.push(fishCalendarRes.data.url);
						uni.previewImage({
							current: fishCalendarRes.data.url,
							urls: imgList,
							indicator: "none"
						})
					}
				} catch (e) {
					uni.hideLoading();
				}
			}
		}
	}
</script>

<style>
	.view-page-mine {
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
		display: flex;
		align-items: center;
		padding: 10rpx 0 30rpx 0rpx;
	}

	.image-icon-avatar {
		position: relative;
		width: 128rpx;
		height: 128rpx;
		border-radius: 50%;
		overflow: hidden;
		margin-left: 35rpx;
		flex-shrink: 0;
	}

	.text-content-nickname {
		position: relative;
		color: #FEFFFF;
		font-size: 30rpx;
		margin-left: 35rpx;
	}

	.view-box-calendar {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		font-size: 25rpx;
		color: #FEFFFF;
		margin: 0rpx 45rpx 0rpx auto;
	}

	.view-area-function {
		position: relative;
		margin: 20rpx 35rpx 0rpx 35rpx;
		background-color: #FEFFFF;
		border-radius: 30rpx;
	}

	.view-box-functionCell {
		position: relative;
		display: flex;
		align-items: center;
	}

	.image-icon-functionCell {
		position: relative;
		width: 40rpx;
		height: 40rpx;
		margin-left: 30rpx;
		flex-shrink: 0;
	}

	.text-content-functionCell {
		position: relative;
		color: #467B73;
		font-size: 30rpx;
		margin: 20rpx 30rpx 20rpx 30rpx;
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

	.view-box-otherFunction {
		position: fixed;
		left: 45rpx;
		right: 45rpx;
		top: 50%;
		transform: translateY(-50%);
		background-color: #FBF2E3;
		border-radius: 30rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.text-content-otherFunctionTitle {
		position: relative;
		font-size: 30rpx;
		color: #467B73;
		margin-top: 10rpx;
	}

	.text-content-otherFunctionContent {
		position: relative;
		font-size: 30rpx;
		color: #467B73;
		margin: 10rpx 30rpx 30rpx 30rpx;
		max-height: 400rpx;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}

	.button-own-functionCell {
		position: absolute;
		height: 100% !important;
		width: 100% !important;
		background-color: transparent;
		opacity: 0;
	}

	.view-box-aboutAppPopup {
		position: fixed;
		left: 45rpx;
		right: 45rpx;
		top: 50%;
		transform: translateY(-50%);
		background-color: #FBF2E3;
		border-radius: 30rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.text-content-aboutApp {
		position: relative;
		font-size: 30rpx;
		color: #467B73;
		margin: 10rpx 35rpx 0rpx 35rpx;
		line-height: 45rpx;
	}

	.image-icon-praise {
		position: relative;
		width: 100rpx;
		height: 100rpx;
		margin-top: 10rpx;
		flex-shrink: 0;
	}

	.text-content-praiseNum {
		position: relative;
		font-size: 30rpx;
		color: #467B73;
		margin-bottom: 30rpx;
	}
</style>
