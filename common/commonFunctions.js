const wxCloudFunctions = uniCloud.importObject('wxCloudFunctions', {
	customUI: true
}); // 微信云函数对象
const db = uniCloud.database(); // 云数据库
const app = getApp();
/**
 * 微信登录(获取用户标识 openid)
 */
const wxLogin = async () => {
	let loginState = -1;
	let loginMsg = '';
	let loginData = {};

	try {
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
									'wx_openid': loginData.openid,
									'role': 'ordinary',
									'avatar': '',
									'nickname': ''
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
					}
				})
				.catch()
		}
	} catch (e) {}
};
/**
 * 检测文本内容安全性
 * @param {string} content 需要检测的文本内容
 */
const checkContentSecurity = async (content) => {
	try {
		const getTokenRes = await wxCloudFunctions.getAccessToken();

		if (getTokenRes.errCode !== 0) {
			return {
				errCode: -1,
				errMsg: 'Token获取失败'
			}
		}
		const contentSecurityRes = await wxCloudFunctions.msgSecCheck(getTokenRes.data.access_token, app
			.globalData
			.wx_openid, content);

		if (contentSecurityRes.errCode !== 0) {
			return {
				errCode: -1,
				errMsg: '内容合规检测失败'
			}
		}
		if (contentSecurityRes.data.result.suggest !== 'pass') {
			return {
				errCode: -1,
				errMsg: '内容存在违规信息'
			}
		}

		return {
			errCode: 0,
			errMsg: '检测完成'
		}

	} catch (e) {
		return {
			errCode: -1,
			errMsg: '内容合规检测失败'
		}
	}
}

export default {
	wxLogin,
	checkContentSecurity
}
