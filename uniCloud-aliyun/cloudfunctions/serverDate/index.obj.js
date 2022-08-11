const formatNumber = n => {
	n = n.toString();

	return n[1] ? n : `0${n}`;
}

function formatTime(date) {
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	const hour = date.getHours();
	const minute = date.getMinutes();
	const second = date.getSeconds();

	return `${[year, month, day].map(formatNumber).join('-')} ${[hour, minute, second].map(formatNumber).join(':')}`;
}

module.exports = {
	/**
	 * 获取当前日期
	 */
	getCurrentDate() {
		return {
			errCode: 0,
			errMsg: '获取成功',
			data: {
				currentDate: formatTime(new Date()),
				currentId: new Date().getTime()
			}
		}
	}
}
