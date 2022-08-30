module.exports = {
	/**
	 * 删除回忆
	 * @param {string} openid 用户唯一标识
	 * @param {number} memoryId 回忆id
	 */
	async deleteMemory(openid, memoryId) {
		try {
			if (!openid || !memoryId) {
				return {
					errCode: -1,
					errMsg: '参数不能为空',
					data: {}
				}
			}

			const dbJQL = uniCloud.databaseForJQL({
				clientInfo: this.getClientInfo()
			});
			const memoryRes = await dbJQL.collection('memory').where("wx_openid == '" + openid + "'").get();
			let memoryList = memoryRes.data[0] ? memoryRes.data[0].memoryList : [];
			let deleteIndex = memoryList.findIndex(function(object) {
				return object.id == memoryId;
			});

			if (deleteIndex === undefined) {
				return {
					errCode: -3,
					errMsg: '没有该回忆',
					data: {}
				}
			}
			let cloudPicPathList = memoryList[deleteIndex].cloudPicPathList;

			await uniCloud.deleteFile({
				fileList: cloudPicPathList
			});
			memoryList.splice(deleteIndex, 1);
			if (memoryList.length !== 0) {
				await dbJQL
					.collection('memory')
					.where("wx_openid == '" + openid + "'")
					.update({
						'memoryList': memoryList
					})
			} else {
				await dbJQL
					.collection('memory')
					.where("wx_openid == '" + openid + "'")
					.remove()
			}

			return {
				errCode: 0,
				errMsg: '回忆删除成功',
				data: {
					memoryList: memoryList
				}
			}
		} catch (e) {
			return {
				errCode: -2,
				errMsg: '回忆处理失败',
				data: e
			}
		}
	}
}
