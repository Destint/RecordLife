<script>
	export default {
		onLaunch() {
			let that = this;

			// that.checkForUpdate();
		},
		methods: {
			/**
			 * 检测小程序是否更新
			 */
			checkForUpdate() {
				const updateManager = uni.getUpdateManager();

				updateManager.onCheckForUpdate();
				updateManager.onUpdateReady(() => {
					updateManager.applyUpdate();
				})
				updateManager.onUpdateFailed();
			}
		},
		globalData: {
			wx_openid: uni.getStorageSync('wx_openid'),
			noticeCacheName: 'notice',
			memoryCacheName: 'memory',
			memorySumCacheName: 'memorySum'
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
