const WXAPI = require('apifm-wxapi')

Page({
  data: {
    autosize: {
      minHeight: 100
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    
  },
  onShow: function() {
    
  },
  onShareAppMessage: function() {    
    return {
      title: '提交受理材料 ' + wx.getStorageSync('comName'),
      path: '/pages/2b/submit?inviter_id=' + wx.getStorageSync('uid')
    }
  },
  uploadEnterprise() {
    wx.chooseImage({
      count: 1,
      success: res => {
        console.log(res);
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        this._uploadEnterprise(tempFilePaths[0])
      },
      fail: error => {
        console.error(error);
      }
    })
  },
  async _uploadEnterprise(tempFilePath) {
    // 上传照片
    const res = await WXAPI.uploadFile(wx.getStorageSync('token'), tempFilePath)
    if (res.code != 0) {
      wx.showToast({
        title: res.msg,
        icon: 'none'
      })
      return
    }
    this.data.yyzzPic = res.data.url
    // 识别
    const res2 = await WXAPI.ocrBusinessLicense(res.data.url)
    if (res2.code == 0) {
      this.setData({
        enterprise_name: res2.data.enterprise_name,
        reg_num: res2.data.reg_num,
        legal_representative: res2.data.legal_representative,
      })
    }
  },
  uploadLogo() {
    wx.chooseImage({
      count: 1,
      success: res => {
        console.log(res);
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        this._uploadLogo(tempFilePaths[0])
      },
      fail: error => {
        console.error(error);
      }
    })
  },
  async _uploadLogo(tempFilePath) {
    // 上传照片
    const res = await WXAPI.uploadFile(wx.getStorageSync('token'), tempFilePath)
    if (res.code != 0) {
      wx.showToast({
        title: res.msg,
        icon: 'none'
      })
      return
    }
    this.data.logo = res.data.url
  },
  uploadIdcard1() {
    wx.chooseImage({
      count: 1,
      success: res => {
        console.log(res);
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        this._uploadIdcard1(tempFilePaths[0])
      },
      fail: error => {
        console.error(error);
      }
    })
  },
  async _uploadIdcard1(tempFilePath) {
    // 上传照片
    const res = await WXAPI.uploadFile(wx.getStorageSync('token'), tempFilePath)
    if (res.code != 0) {
      wx.showToast({
        title: res.msg,
        icon: 'none'
      })
      return
    }
    this.data.idcard1 = res.data.url
  },
  uploadIdcard2() {
    wx.chooseImage({
      count: 1,
      success: res => {
        console.log(res);
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        this._uploadIdcard2(tempFilePaths[0])
      },
      fail: error => {
        console.error(error);
      }
    })
  },
  async _uploadIdcard2(tempFilePath) {
    // 上传照片
    const res = await WXAPI.uploadFile(wx.getStorageSync('token'), tempFilePath)
    if (res.code != 0) {
      wx.showToast({
        title: res.msg,
        icon: 'none'
      })
      return
    }
    this.data.idcard2 = res.data.url
  },
  async bindSave() {    
    if (!this.data.yyzzPic) {
      wx.showToast({
        title: '请上传营业执照',
        icon: 'none',
      })
      return
    }
    if (!this.data.logo) {
      wx.showToast({
        title: '请上传小程序头像',
        icon: 'none',
      })
      return
    }
    if (!this.data.idcard1 || !this.data.idcard2) {
      wx.showToast({
        title: '请上传法人身份证',
        icon: 'none',
      })
      return
    }
    if (!this.data.enterprise_name) {
      wx.showToast({
        title: '请填写企业名称',
        icon: 'none',
      })
      return
    }
    if (!this.data.reg_num) {
      wx.showToast({
        title: '请填写企业代码',
        icon: 'none',
      })
      return
    }
    if (!this.data.legal_representative) {
      wx.showToast({
        title: '请填写法人姓名',
        icon: 'none',
      })
      return
    }
    if (!this.data.mobile) {
      wx.showToast({
        title: '请填写联系电话',
        icon: 'none',
      })
      return
    }
    if (!this.data.wx) {
      wx.showToast({
        title: '请填写法人微信',
        icon: 'none',
      })
      return
    }
    if (!this.data.wxappName) {
      wx.showToast({
        title: '请填写小程序名称',
        icon: 'none',
      })
      return
    }
    if (!this.data.bankInfo) {
      wx.showToast({
        title: '请填写开户银行信息',
        icon: 'none',
      })
      return
    }
    const extJsonStr = {}
    extJsonStr['营业执照'] = this.data.yyzzPic
    extJsonStr['小程序头像'] = this.data.logo
    extJsonStr['身份证正面'] = this.data.idcard1
    extJsonStr['身份证背面'] = this.data.idcard2
    extJsonStr['企业名称'] = this.data.enterprise_name
    extJsonStr['企业代码'] = this.data.reg_num
    extJsonStr['法人姓名'] = this.data.legal_representative
    extJsonStr['联系电话'] = this.data.mobile
    extJsonStr['法人微信'] = this.data.wx
    extJsonStr['小程序名称'] = this.data.wxappName
    extJsonStr['开户银行信息'] = this.data.bankInfo

    const res = await WXAPI.addComment({
      token: wx.getStorageSync('token'),
      type: 1,
      extJsonStr: JSON.stringify(extJsonStr),
      content: '提交受理材料'
    })
    if (res.code == 0) {
      wx.showToast({
        title: '提交成功，感谢您的支持',
      })
      setTimeout(() => {
        wx.navigateBack({
          delta: 0,
        })
      }, 1000);
    } else {
      wx.showToast({
        title: res.msg,
        icon: 'none'
      })
    }
  },
})