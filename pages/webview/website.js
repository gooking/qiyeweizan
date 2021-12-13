Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  onLoad: function (options) {
    // 读取分享链接中的邀请人编号
    if (options && options.inviter_id) {
      wx.setStorageSync('referrer', options.inviter_id)
    }
    this.setData({
      url: options.url
    })
  },
  onShow: function () {

  },
  onShareAppMessage(options) {
    return {
      title: '"' + wx.getStorageSync('comName') + '" ' + wx.getStorageSync('share_profile'),
      path: '/pages/webview/website?&inviter_id='+ wx.getStorageSync('uid') +'&url='+ options.webViewUrl
    }
  }
})