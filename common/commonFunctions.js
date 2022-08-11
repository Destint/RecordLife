const wxCloudFunctions = uniCloud.importObject('wxCloudFunctions'); // 微信云函数对象
const db = uniCloud.database(); // 云数据库
const app = getApp();
/**
 * 微信登录(获取用户标识 openid)
 */
const wxLogin = async () => {
	let loginState = -1;
	let loginMsg = '';
	let loginData = {};

	await uni
		.login({
			provider: "weixin"
		})
		.then(async (loginRes) => {
			const loginInfo = await wxCloudFunctions.login(loginRes.code);

			loginState = loginInfo.errCode;
			loginMsg = loginInfo.errMsg;
			loginData = loginInfo.data;
		})
		.catch((loginErr) => {
			loginMsg = loginErr;
		})
	if (loginState !== 0) {
		uni.showModal({
			title: '登录失败',
			content: loginMsg,
			showCancel: false
		})
	} else {
		await db
			.collection('user')
			.where("wx_openid == '" + loginData.openid + "'")
			.get()
			.then(async (res) => {
				if (res.result.errCode === 0) {
					if (res.result.data.length === 0) {
						await db
							.collection('user')
							.add({
								'wx_openid': loginData.openid
							})
							.then((res) => {
								uni.setStorageSync('wx_openid', loginData.openid);
								app.globalData.wx_openid = loginData.openid;
							})
							.catch()
					} else {
						uni.setStorageSync('wx_openid', loginData.openid);
						app.globalData.wx_openid = loginData.openid;
					}
				} else {}
			})
			.catch()
	}
}

export default {
	wxLogin
}
