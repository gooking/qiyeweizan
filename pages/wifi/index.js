const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
Page({
  data: {
    userBaseInfoStatus: 0, // 初始0，1 为未登陆，2 为未授权，3 为未绑定手机号, 4 OK
    wifiOK: false,
  },
  onLoad: function (options) {
    this.getWifiList()
  },
  onShow: function () {
    AUTH.wxaCode().then(code => {
      this.data.code = code
    })
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
      const userBaseInfo = res.data.base
      let userBaseInfoStatus = 4
      if (!userBaseInfo.mobile) {
        userBaseInfoStatus = 3
      }
      if (!userBaseInfo.nick && !userBaseInfo.avatarUrl) {
        userBaseInfoStatus = 2
      }
      this.setData({
        userBaseInfo,
        userBaseInfoStatus
      })
    } else {
      this.setData({
        userBaseInfoStatus: 1
      })
    }
  },
  async login() {
    await AUTH.authorize()
    this.queuingMy()
    this.userDetail()
  },
  updateUserInfo() {
    this.setData({
      showpoplogin: false
    })
    wx.getUserProfile({
      lang: 'zh_CN',
      desc: '用于完善会员资料',
      success: res => {
        console.log(res);
        this._updateUserInfo(res.userInfo)
      },
      fail: err => {
        console.error(err)
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
      res = await WXAPI.wxappServiceBindMobile({
        token: wx.getStorageSync('token'),
        code: this.data.code,
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv,
      })
    } else {
      res = await WXAPI.bindMobileWxapp(wx.getStorageSync('token'), this.data.code, e.detail.encryptedData, e.detail.iv)
    }
    AUTH.wxaCode().then(code => {
      this.data.code = code
    })
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