module.exports = {
	/**
	 * 删除云存储文件
	 * @param {Array} fileList 文件id列表
	 */
	async deleteCloudFiles(fileList) {
		try {
			if (!fileList || fileList.length === 0) {
				return {
					errCode: -1,
					errMsg: '参数不能为空',
					data: {}
				}
			}
			await uniCloud.deleteFile({
				fileList: fileList
			});

			return {
				errCode: 0,
				errMsg: '文件删除成功',
				data: {}
			}
		} catch (e) {
			return {
				errCode: -1,
				errMsg: '删除文件失败',
				data: e
			}
		}
	}
}
