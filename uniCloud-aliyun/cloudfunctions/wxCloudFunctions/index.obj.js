module.exports = {
	/**
	 * 微信登录
	 * @param {string} code 微信登录时获取的code
	 * @returns {object} 微信登录信息
	 */
	async login(code) {
		if (!code) {
			return {
				errCode: 'PARAM_IS_NULL',
				errMsg: '参数不能为空'
			}
		}
		try {
			const url = 'https://api.weixin.qq.com/sns/jscode2session';
			const res = await uniCloud.httpclient.request(url, {
				method: "GET",
				data: {
					appid: 'wxd6b3ccc3b5ce077c',
					secret: '1d4ead407bf61c1fe576e34392e08e6c',
					js_code: code,
					grant_type: 'authorization_code'
				},
				contentType: "json",
				dataType: "json"
			});

			if (res.data && res.data.errcode && res.data.errcode !== 0) {
				return {
					errCode: res.data.errcode,
					errMsg: res.data.errmsg
				}
			}

			return {
				errCode: 0,
				errMsg: '登录成功',
				data: res.data
			}
		} catch (e) {
			return {
				errCode: -1,
				errMsg: '登录失败'
			}
		}

	},
	/**
	 * 获取小程序全局唯一后台接口调用凭据
	 * @returns {object} 后台接口调用凭据
	 */
	async getAccessToken() {
		try {
			const url = 'https://api.weixin.qq.com/cgi-bin/token';
			const res = await uniCloud.httpclient.request(url, {
				method: "GET",
				data: {
					grant_type: 'client_credential',
					appid: 'wxd6b3ccc3b5ce077c',
					secret: '1d4ead407bf61c1fe576e34392e08e6c'
				},
				contentType: "json",
				dataType: "json"
			});

			if (res.data && res.data.errcode && res.data.errcode !== 0) {
				return {
					errCode: res.data.errcode,
					errMsg: res.data.errmsg
				}
			}

			return {
				errCode: 0,
				errMsg: '获取成功',
				data: res.data
			}
		} catch (e) {
			return {
				errCode: -1,
				errMsg: '获取失败'
			}
		}
	},
	/**
	 * 检查一段文本是否含有违法违规内容
	 * @param {string} accessToken 接口调用凭证
	 * @param {string} openid 用户的openid
	 * @param {string} content 需检测的文本内容,上限为2500字,需使用UTF-8编码
	 * @returns {object} 检测结果
	 */
	async msgSecCheck(accessToken, openid, content) {
		if (!accessToken || !openid || !content) {
			return {
				errCode: 'PARAM_IS_NULL',
				errMsg: '参数不能为空'
			}
		}
		try {
			const url = 'https://api.weixin.qq.com/wxa/msg_sec_check?access_token=' + accessToken;
			const res = await uniCloud.httpclient.request(url, {
				method: "POST",
				data: {
					version: 2,
					openid: openid,
					scene: 1,
					content: content
				},
				contentType: "json",
				dataType: "json"
			});

			if (res.data && res.data.errcode && res.data.errcode !== 0) {
				return {
					errCode: res.data.errcode,
					errMsg: res.data.errmsg
				}
			}

			return {
				errCode: 0,
				errMsg: '检测成功',
				data: res.data
			}
		} catch (e) {
			return {
				errCode: -1,
				errMsg: '检测失败'
			}
		}
	}
}
