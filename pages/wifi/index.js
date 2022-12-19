const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
Page({
  data: {
    mobile: undefined, // 手机号码
    wifiOK: false,
  },
  onLoad: function (options) {
    this.getWifiList()
  },
  onShow: function () {
    AUTH.checkHasLogined().then(isLogined => {
      if (!isLogined) {
        AUTH.authorize().then( aaa => {
          this.userDetail()
        })
      } else {
        this.userDetail()
      }
    })
  },
  onShareAppMessage: function() {    
    return {
      title: '连接Wi-Fi ' + wx.getStorageSync('comName'),
      path: '/pages/wifi/index?inviter_id=' + wx.getStorageSync('uid')
    }
  },
  async getWifiList() {
    const res = await AUTH.checkAndAuthorize('scope.userLocation')
    wx.startWifi({
      success: res => {
        this.getWifiList2()
      },
      fail: res => {
        wx.showModal({
          title: '错误',
          content: res.errMsg,
          showCancel: false
        })
        console.error('startWifi', res)
      }
    })
  },
  async getWifiList2() {
    wx.getWifiList({
      success: res => {
        wx.onGetWifiList(wifiList => {
          console.log('2222', wifiList);
          const wifi = wx.getStorageSync('wifi')
          if (wifi) {
            const wifis = JSON.parse(wifi)
            const _wifis = []
            wifis.forEach(ele => {
              const a = wifiList.wifiList.find(b => { return b.SSID == ele.ssid })
              if (a) {
                _wifis.push(ele)
              }
            })
            this.setData({
              wifis: _wifis
            })
          }
        })
      },
      fail: error => {
        wx.showModal({
          title: '错误',
          content: error.errMsg,
          showCancel: false
        })
        console.error(error);
      },
    })
  },
  connectWifi(e) {
    const idx = e.currentTarget.dataset.idx
    const item = this.data.wifis[idx]
    wx.startWifi({
      success: res => {
        this._connectWifi(item)
      },
      fail: res => {
        wx.showModal({
          title: '错误',
          content: res.errMsg,
          showCancel: false
        })
        console.error('startWifi', res)
      }
    })
  },
  _connectWifi(item) {
    wx.connectWifi({
      forceNewApi: true,
      SSID: item.ssid,
      password: item.pwd,
      success: res => {
        wx.showToast({
          title: '连接成功'
        })
        console.log(res)
      },
      fail: res => {
        if (res.errCode == 12005) {
          wx.showToast({
            title: '请先打开手机Wi-Fi',
            icon: 'none'
          })
        } else {
          wx.showToast({
            title: res.errMsg,
            icon: 'none'
          })
        }
        console.error('connectWifi', res)
      }
    })    
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
  onPullDownRefresh: function() {
    this.getWifiList()
    this.onShow()
    wx.stopPullDownRefresh()
  },
})