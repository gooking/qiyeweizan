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
      userBaseInfo: getApp().globalData.userBaseInfo
    })
  },
  onShareAppMessage: function() {    
    return {
      title: '"' + wx.getStorageSync('comName') + '" ' + wx.getStorageSync('share_profile'),
      path: '/pages/index/index?inviter_id=' + wx.getStorageSync('uid')
    }
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
  },
  kefu() {
    wx.openCustomerServiceChat({
        extInfo: {url: wx.getStorageSync('kefu_url')},
        corpId: wx.getStorageSync('kefu_corpId'),
        success(res) {}
    })
  },
  editNick() {
    this.setData({
      nickShow: true
    })
  },
  async _editNick() {
    if (!this.data.nick) {
      wx.showToast({
        title: '请填写昵称',
        icon: 'none'
      })
      return
    }
    const postData = {
      token: wx.getStorageSync('token'),
      nick: this.data.nick,
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
      title: '设置成功',
    })
    await getApp().updateUserInfoAndMobile()
    this.setData({
      userBaseInfo: getApp().globalData.userBaseInfo
    })
  },
  async onChooseAvatar(e) {
    console.log(e);
    const avatarUrl = e.detail.avatarUrl
    let res = await WXAPI.uploadFile(wx.getStorageSync('token'), avatarUrl)
    if (res.code != 0) {
      wx.showToast({
        title: res.msg,
        icon: 'none'
      })
      return
    }
    res = await WXAPI.modifyUserInfo({
      token: wx.getStorageSync('token'),
      avatarUrl: res.data.url,
    })
    if (res.code != 0) {
      wx.showToast({
        title: res.msg,
        icon: 'none'
      })
      return
    }
    wx.showToast({
      title: '设置成功',
    })
    await getApp().updateUserInfoAndMobile()
    this.setData({
      userBaseInfo: getApp().globalData.userBaseInfo
    })
  }
})