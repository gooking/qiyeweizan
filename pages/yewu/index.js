const WXAPI = require('apifm-wxapi')
Page({

  data: {
    listType: 1, // 1为1个商品一行，2为2个商品一行    
    name: '', // 搜索关键词
    page: 1 // 读取第几页
  },
  onLoad: function (options) {
    this.search()
    this.readConfigVal()
    // 补偿写法
    getApp().configLoadOK = () => {
      this.readConfigVal()
    }
  },
  onShow: function () {
    
  },
  readConfigVal() {
    
  },
  onPullDownRefresh: function() {
    this.setData({
      page: 1
    });
    this.search()
    wx.stopPullDownRefresh()
  },
  onShareAppMessage: function() {    
    return {
      title: '业务 ' + wx.getStorageSync('comName'),
      path: '/pages/yewu/index?inviter_id=' + wx.getStorageSync('uid')
    }
  },
  async search(){
    wx.showLoading({
      title: '',
    })
    const res = await WXAPI.goods({
      page: this.data.page,
      pageSize: 20,
    })
    wx.hideLoading()
    if (res.code == 0) {
      if (this.data.page == 1) {
        this.setData({
          goods: res.data,
        })
      } else {
        this.setData({
          goods: this.data.goods.concat(res.data),
        })
      }
    } else {
      if (this.data.page == 1) {
        this.setData({
          goods: null,
        })
      }
    }
  },
  onReachBottom() {
    this.setData({
      page: this.data.page + 1
    });
    this.search()
  },
})