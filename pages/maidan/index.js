const WXAPI = require('apifm-wxapi')
const wxpay = require('../../utils/pay.js')
const AUTH = require('../../utils/auth')

Page({
  data: {
    payType: 'wxpay'
  },
  onLoad: function (options) {

  },
  onShow () {

  },
  onShareAppMessage() {
    
  },
  async bindSave() {
    const amount = this.data.amount;
    const remark = this.data.remark;
    if (!amount) {
      wx.showToast({
        title: '请填写金额',
        icon: 'none'
      })
      return
    }
    wxpay.wxpay('paybill', amount, 0, "/pages/my/index", remark ? remark : '')
  },
})