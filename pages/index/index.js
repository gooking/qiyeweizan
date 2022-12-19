const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
import Dialog from '@vant/weapp/dialog/dialog'

Page({
  data: {

  },
  onLoad: function(e) {
    // 读取分享链接中的邀请人编号
    if (e && e.inviter_id) {
      wx.setStorageSync('referrer', e.inviter_id)
    }
    // 读取小程序码中的邀请人编号
    if (e && e.scene) {
      const scene = decodeURIComponent(e.scene)
      if (scene) {        
        wx.setStorageSync('referrer', scene.substring(11))
      }
    }
    this.initBanners()
    this.getNotice()
    this.siteStatistics()
    this.about()
    this.fetchShops()
    this.usersDynamic()
    // 读取系统参数
    this.readConfigVal()
    getApp().configLoadOK = () => {
      this.readConfigVal()
    }
    // 启动定时器
    setTimeout(() => {
      this.updateUserInfoAndMobile()
    }, 3000)
  },
  onShow: function(e){
  },
  readConfigVal() {
    const mallName = wx.getStorageSync('mallName')
    if (!mallName) {
      return
    }
    wx.setNavigationBarTitle({
      title: mallName,
    })
    this.setData({
      comName: wx.getStorageSync('comName'),
      website_0: wx.getStorageSync('website_0'),
      website_1: wx.getStorageSync('website_1'),
      kefu_url: wx.getStorageSync('kefu_url'),
      kefu_corpId: wx.getStorageSync('kefu_corpId'),
      url: wx.getStorageSync('url'),
      qiyeweixin_open: wx.getStorageSync('qiyeweixin_open'),
    })
  },
  async updateUserInfoAndMobile() {
    const userBaseInfo = getApp().globalData.userBaseInfo
    if (!userBaseInfo) {
      setTimeout(() => {
        this.updateUserInfoAndMobile()
      }, 1000)
      return
    }
    if (!userBaseInfo.mobile) {
      Dialog.confirm({
        message: '感谢您的莅临\n\n可以与您交换名片么～',
        theme: 'round-button',
        confirmButtonText: '赐名片',
        cancelButtonText: '残忍拒绝～',
        confirmButtonOpenType: 'getPhoneNumber'
      }).then(() => {
        console.log(222)
      }).catch(() => {})
      return
    }
  },
  async about() {
    const res = await WXAPI.cmsPage('about')
    if (res.code == 0) {
      this.setData({
        aboutData: res.data
      })
    }
  },
  async siteStatistics(){
    const res = await WXAPI.siteStatistics()
    if (res.code == 0) {
      this.setData({
        siteStatisticsData: res.data
      })
    }
  },
  async initBanners(){
    const res = await WXAPI.banners()
    if (res.code == 0) {
      this.setData({
        banners: res.data
      })
    }
  },
  async fetchShops() {
    const res = await WXAPI.fetchShops()
    if (res.code == 0) {
      this.setData({
        shops: res.data
      })
    }
  },
  onShareAppMessage: function() {    
    return {
      title: '"' + wx.getStorageSync('comName') + '" ' + wx.getStorageSync('share_profile'),
      path: '/pages/index/index?inviter_id=' + wx.getStorageSync('uid')
    }
  },
  async getNotice() {
    const res = await WXAPI.noticeList({pageSize: 5})
    if (res.code == 0) {
      this.setData({
        noticeList: res.data
      })
    }
  },
  goNotice(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/notice/show?id=' + id,
    })
  },
  copy(e) {
    const v = e.currentTarget.dataset.v
    wx.setClipboardData({
      data: v,
    })
  },
  webview(e) {
    const v = e.currentTarget.dataset.v
    wx.navigateTo({
      url: '/pages/webview/website?url=' + v,
    })
  },
  gomap(e) {
    const idx = e.currentTarget.dataset.idx
    const shop = this.data.shops[idx]
    wx.openLocation({
      name: shop.name,
      address: shop.address,
      latitude: shop.latitude,
      longitude: shop.longitude,
      scale: 18
    })
  },
  callMobile(e) {
    const idx = e.currentTarget.dataset.idx
    const shop = this.data.shops[idx]
    wx.makePhoneCall({
      phoneNumber: shop.linkPhone,
    })
  },
  async getPhoneNumber(e) {
    console.log(e);
    if (!e.detail.errMsg || e.detail.errMsg != "getPhoneNumber:ok") {
      wx.showToast({
        title: e.detail.errMsg,
        icon: 'none'
      })
      // this.updateUserInfoAndMobile()
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
      wx.showToast({
        title: '非常感谢～',
        icon: 'success'
      })
    } else {
      wx.showToast({
        title: res.msg,
        icon: 'none'
      })
    }
  },
  async usersDynamic() {
    const res = await WXAPI.usersDynamic(1)
    if (res.code == 0) {
      this.setData({
        usersDynamicList: res.data
      })
    }
  },
  kefu() {
    wx.openCustomerServiceChat({
        extInfo: {url: wx.getStorageSync('kefu_url')},
        corpId: wx.getStorageSync('kefu_corpId'),
        success(res) {}
    })
  },
})