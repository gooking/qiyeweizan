const WXAPI = require('apifm-wxapi')
Page({
  data: {

  },
  onLoad: function (options) {
    // options.key = 'aboutus'
    this.data.key = options.key
    // 读取小程序码中的数据
    if (options && options.scene) {
      console.log(options);
      const scene = decodeURIComponent(options.scene) // 处理扫码进商品详情页面的逻辑 123,456
      if (scene && scene.split(',').length == 2) {
        wx.setStorageSync('referrer', scene.split(',')[0])
        this.data.key = scene.split(',')[1]
      }
    }
    this.cmsPage()
  },
  onShow: function () {

  },
  onShareAppMessage: function() {    
    return {
      title: wx.getStorageSync('comName'),
      path: '/pages/about/index?key='+ this.data.key +'&inviter_id=' + wx.getStorageSync('uid')
    }
  },
  async cmsPage() {
    const res = await WXAPI.cmsPage(this.data.key)
    if (res.code == 0) {
      res.data.info.contentHtml = res.data.info.content
      if (res.data.info.type == 1) {
        this.fetchQrcode()
        res.data.info.contentHtml = res.data.info.contentHtml.replace(/\n/g, '<br>')
      }
      this.setData({
        cmsPageDetail: res.data
      })
      wx.setNavigationBarTitle({
        title: res.data.info.title,
      })
    }
  },
  copy() {
    wx.setClipboardData({
      data: this.data.cmsPageDetail.info.content,
    })
  },
  async fetchQrcode(){
    const res = await WXAPI.wxaQrcode({
      scene: wx.getStorageSync('uid') + ',' + this.data.key,
      page: 'pages/about/index',
      is_hyaline: true,
      autoColor: true,
      expireHours: 1
    })
    if (res.code ==  41030) {
      wx.showToast({
        title: '上线以后才可以获取二维码',
        icon: 'none'
      })
      return
    }
    if (res.code == 0) {
      this.setData({
        qrcode: res.data
      })
    }
  },
})