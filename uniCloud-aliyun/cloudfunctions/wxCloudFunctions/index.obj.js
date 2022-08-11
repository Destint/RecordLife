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
		})

		return {
			errCode: 0,
			errMsg: '登录成功',
			data: res.data
		}
	}
}
