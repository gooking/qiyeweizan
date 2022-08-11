const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
const CONFIG = require('../../config.js')

Page({
	data: {

  },
	onLoad() {
    this.readConfigVal()
    // 补偿写法
    getApp().configLoadOK = () => {
      this.readConfigVal()
    }
	},
  onShow() {
    AUTH.wxaCode().then(code => {
      this.data.code = code
    })
  },
  readConfigVal() {
    const mallName = wx.getStorageSync('mallName')
    if (!mallName) {
      return
    }
    let subDomain = wx.getExtConfigSync().subDomain
    if (!subDomain) {
      subDomain = CONFIG.subDomain
    }

    this.setData({
      subDomain,
      version: CONFIG.version,
      uid: wx.getStorageSync('uid'),
      wifi: wx.getStorageSync('wifi'),
      online_pay: wx.getStorageSync('online_pay'),
      quhao: wx.getStorageSync('quhao'),
      show_copyright: wx.getStorageSync('show_copyright'),
    })
  },
  onShareAppMessage: function() {    
    return {
      title: '"' + wx.getStorageSync('comName') + '" ' + wx.getStorageSync('share_profile'),
      path: '/pages/index/index?inviter_id=' + wx.getStorageSync('uid')
    }
  },
  updateUserInfo(e) {
    wx.getUserProfile({
      lang: 'zh_CN',
      desc: '用于完善会员资料',
      success: res => {
        console.log(res);
        this._updateUserInfo(res.userInfo)
      },
      fail: err => {
        console.log(err);
        wx.showToast({
          title: err.errMsg,
          icon: 'none'
        })
      }
    })
  },
  async _updateUserInfo(userInfo) {
    const postData = {
      token: wx.getStorageSync('token'),
      nick: userInfo.nickName,
      avatarUrl: userInfo.avatarUrl,
      city: userInfo.city,
      province: userInfo.province,
      gender: userInfo.gender,
    }
    const res = await WXAPI.modifyUserInfo(postData)
    if (res.code != 0) {
      wx.showToast({
        title: res.msg,
        icon: 'none'
      })
      return
    }
    wx.showToast({
      title: '登陆成功',
    })
  },
  clearStorage(){
    wx.clearStorageSync()
    wx.showToast({
      title: '已清除',
      icon: 'success'
    })
    AUTH.login()
  },
  yuxinkeji() {
    wx.navigateToMiniProgram({
      appId: 'wx2bdf7b6e21c5049c',
      path: 'pages/index/index?iv_subDomain=' + this.data.subDomain
    })
  }
})