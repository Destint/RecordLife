const dayjs = require('dayjs');
var utc = require('dayjs/plugin/utc');
var timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

module.exports = {
	/**
	 * 获取当前日期
	 */
	async getCurrentDate() {
		return {
			errCode: 0,
			errMsg: '获取成功',
			data: {
				currentDate: dayjs().tz("Asia/Shanghai").format('YYYY-MM-DD HH:mm:ss'),
				currentId: new Date().getTime()
			}
		}
	}
}
