const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
Page({
  data: {
    mobile: undefined, // 手机号码
  },
  onLoad: function (options) {
    this.queuingTypes()
  },
  onShow: function () {
    AUTH.checkHasLogined().then(isLogined => {
      if (!isLogined) {
        AUTH.authorize().then( aaa => {
          this.queuingMy()
          this.userDetail()
        })
      } else {
        this.queuingMy()
        this.userDetail()
      }
    })
  },
  onShareAppMessage: function() {    
    return {
      title: '在线取号 ' + wx.getStorageSync('comName'),
      path: '/pages/queue/index?inviter_id=' + wx.getStorageSync('uid')
    }
  },
  async queuingTypes() {
    wx.showLoading({
      title: '',
    })
    const res = await WXAPI.queuingTypes()
    wx.hideLoading({
      success: (res) => {},
    })
    if (res.code == 0) {
      this.setData({
        list: res.data
      })
    }
  },
  async queuingMy() {
    const res = await WXAPI.queuingMy(wx.getStorageSync('token'))
    if (res.code == 0) {
      const mylist = []
      res.data.forEach(ele => {
        const queuingLog  = ele.queuingLog
        const queuingUpType = ele.queuingUpType
        const waitMinitus = (queuingLog.number - queuingUpType.curNumber -1) * queuingUpType.minitus
        if (waitMinitus) {
          queuingLog.waitMinitus = waitMinitus
        }
        queuingLog.typeEntity = queuingUpType
        mylist.push(queuingLog)
      })
      this.setData({
        mylist
      })
    }
  },
  async queuingGet(e) {
    const index = e.currentTarget.dataset.index
    const queueType = this.data.list[index]
    const isLogined = await AUTH.checkHasLogined()
    if (!isLogined) {
      AUTH.login(this)
      return
    }
    wx.showLoading({
      title: '',
    })
    const res = await WXAPI.queuingGet(wx.getStorageSync('token'), queueType.id)
    wx.hideLoading({
      success: (res) => {},
    })
    if (res.code != 0) {
      wx.showToast({
        title: res.msg,
        icon: 'none'
      })
    } else {
      wx.showToast({
        title: '取号成功'
      })
      this.queuingMy()
    }
  },
  // 获取用户信息以及手机号码
  async userDetail() {
    const res = await WXAPI.userDetail(wx.getStorageSync('token'))
    if (res.code == 0) {
      this.setData({
        mobile: res.data.base.mobile
      })
    }
  },
  async login() {
    await AUTH.authorize()
    this.queuingMy()
    this.userDetail()
  },
  async getPhoneNumber(e) {
    console.log(e);
    if (!e.detail.errMsg || e.detail.errMsg != "getPhoneNumber:ok") {
      wx.showToast({
        title: e.detail.errMsg,
        icon: 'none'
      })
      return;
    }
    let res
    const extConfigSync = wx.getExtConfigSync()
    if (extConfigSync.subDomain) {
      // 服务商模式
      res = await WXAPI.wxappServiceBindMobileV2({
        token: wx.getStorageSync('token'),
        code: e.detail.code
      })
    } else {
      res = await WXAPI.bindMobileWxappV2(wx.getStorageSync('token'), e.detail.code)
    }
    if (res.code == 0) {
      this.userDetail()
    } else {
      wx.showToast({
        title: res.msg,
        icon: 'none'
      })
    }
  },
})