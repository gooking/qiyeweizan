const WXAPI = require('apifm-wxapi')
const TOOLS = require('../../utils/tools.js')
const AUTH = require('../../utils/auth')
import Poster from 'wxa-plugin-canvas/poster/poster'

Page({
  data: {
    createTabs: false, //绘制tabs
    goodsDetail: {},
    hasMoreSelect: false,
    selectSizePrice: 0,
    selectSizeOPrice: 0,
    totalScoreToPay: 0,
    shopNum: 0,
    hideShopPopup: true,
    buyNumber: 0,
    buyNumMin: 1,
    buyNumMax: 0,
    propertyChildIds: "",
    propertyChildNames: "",
    canSubmit: false, //  选中规格尺寸时候是否允许加入购物车
    shopType: "addShopCar", //购物类型，加入购物车或立即购买，默认为加入购物车
  },
  onLoad(e) {
    // e.id = 122843
    // 读取分享链接中的邀请人编号
    if (e && e.inviter_id) {
      wx.setStorageSync('referrer', e.inviter_id)
    }
    // 读取小程序码中的邀请人编号
    if (e && e.scene) {
      const scene = decodeURIComponent(e.scene) // 处理扫码进商品详情页面的逻辑
      if (scene && scene.split(',').length >= 2) {
        e.id = scene.split(',')[0]
        wx.setStorageSync('referrer', scene.split(',')[1])
      }
    }
    this.data.goodsId = e.id
    // 补偿写法
    getApp().configLoadOK = () => {
      this.readConfigVal()
    }
    this.readConfigVal()
    this.getGoodsDetail(this.data.goodsId)
    this.goodsAddition()
  },
  onShow() {

  },
  readConfigVal() {
    // 读取系统参数
    
  },
  async goodsAddition() {
    const res = await WXAPI.goodsAddition(this.data.goodsId)
    if (res.code == 0) {
      this.setData({
        goodsAddition: res.data,
        hasMoreSelect: true,
      })
    }
  },
  async getGoodsDetail(goodsId) {
    const token = wx.getStorageSync('token')
    const that = this;
    const goodsDetailRes = await WXAPI.goodsDetail(goodsId, token ? token : '')
    if (goodsDetailRes.code == 0) {
      if (!goodsDetailRes.data.pics || goodsDetailRes.data.pics.length == 0) {
        goodsDetailRes.data.pics = [{
          pic: goodsDetailRes.data.basicInfo.pic
        }]
      }
      if (goodsDetailRes.data.properties) {
        that.setData({
          hasMoreSelect: true,
          selectSizePrice: goodsDetailRes.data.basicInfo.minPrice,
          selectSizeOPrice: goodsDetailRes.data.basicInfo.originalPrice,
          totalScoreToPay: goodsDetailRes.data.basicInfo.minScore
        });
      }
      that.data.goodsDetail = goodsDetailRes.data
      let _data = {
        goodsDetail: goodsDetailRes.data,
        selectSizePrice: goodsDetailRes.data.basicInfo.minPrice,
        selectSizeOPrice: goodsDetailRes.data.basicInfo.originalPrice,
        totalScoreToPay: goodsDetailRes.data.basicInfo.minScore,
        buyNumMax: goodsDetailRes.data.basicInfo.stores,
        buyNumber: (goodsDetailRes.data.basicInfo.stores > 0) ? 1 : 0
      }
      that.setData(_data)
    }
  },
  tobuy: function () {
    this.setData({
      shopType: "tobuy"
    });
    this.bindGuiGeTap();
  },
  /**
   * 规格选择弹出框
   */
  bindGuiGeTap: function () {
    this.setData({
      hideShopPopup: false,
      selectSizePrice: this.data.goodsDetail.basicInfo.minPrice,
      selectSizeOPrice: this.data.goodsDetail.basicInfo.originalPrice,
      skuGoodsPic: this.data.goodsDetail.basicInfo.pic
    })
  },
  /**
   * 规格选择弹出框隐藏
   */
  closePopupTap: function () {
    this.setData({
      hideShopPopup: true
    })
  },
  stepChange(event) {
    this.setData({
      buyNumber: event.detail
    })
  },
  /**
   * 选择商品规格
   */
  async labelItemTap(e) {
    const propertyindex = e.currentTarget.dataset.propertyindex
    const propertychildindex = e.currentTarget.dataset.propertychildindex

    const property = this.data.goodsDetail.properties[propertyindex]
    const child = property.childsCurGoods[propertychildindex]
    const _childActive = child.active
    // 当前位置往下的所有sku取消选中状态
    for (let index = propertyindex; index < this.data.goodsDetail.properties.length; index++) {
      const element = this.data.goodsDetail.properties[index]
      element.optionValueId = null
      element.childsCurGoods.forEach(child => {
        child.active = false
      })
    }
    // // 取消该分类下的子栏目所有的选中状态
    // property.childsCurGoods.forEach(child => {
    //   child.active = false
    // })
    // 设置当前选中状态，或者取消选中
    property.optionValueId = child.id
    child.active = true
    // 下面代码块，支持点击后取消选中
    // if (!_childActive) {
    //   property.optionValueId = child.id
    //   child.active = true
    // } else {
    //   property.optionValueId = null
    //   child.active = false
    // }
    
    
    // 获取所有的选中规格尺寸数据
    const needSelectNum = this.data.goodsDetail.properties.length
    let curSelectNum = 0;
    let propertyChildIds = "";
    let propertyChildNames = "";
    let _skuList = this.data.goodsDetail.skuList

    this.data.goodsDetail.properties.forEach(p => {
      p.childsCurGoods.forEach(c => {
        // 处理当前选中的sku信息
        if (c.active) {
          _skuList = _skuList.filter(aaa => {
            return aaa.propertyChildIds.indexOf(p.id + ':' + c.id) != -1
          })
          curSelectNum++;
          propertyChildIds = propertyChildIds + p.id + ":" + c.id + ",";
          propertyChildNames = propertyChildNames + p.name + ":" + c.name + "  ";
        } else if(!p.optionValueId) {
          const nextO = _skuList.find(aaa => {
            return aaa.propertyChildIds.indexOf(p.id + ':' + c.id) != -1
          })
          c.hidden = nextO ? false : true
        }
      })
    })
    let canSubmit = false;
    if (needSelectNum == curSelectNum) {
      canSubmit = true;
    }
    let skuGoodsPic = this.data.skuGoodsPic
    if (this.data.goodsDetail.subPics && this.data.goodsDetail.subPics.length > 0) {
      const _subPic = this.data.goodsDetail.subPics.find(ele => {
        return ele.optionValueId == child.id
      })
      if (_subPic) {
        skuGoodsPic = _subPic.pic
      }
    }
    this.setData({
      goodsDetail: this.data.goodsDetail,
      canSubmit,
      skuGoodsPic,
      propertyChildIds,
      propertyChildNames,
    })
    this.calculateGoodsPrice()
  },
  async calculateGoodsPrice() {
    // 计算最终的商品价格
    let price = this.data.goodsDetail.basicInfo.minPrice
    let originalPrice = this.data.goodsDetail.basicInfo.originalPrice
    let totalScoreToPay = this.data.goodsDetail.basicInfo.minScore
    let buyNumMax = this.data.goodsDetail.basicInfo.stores
    let buyNumber = this.data.goodsDetail.basicInfo.minBuyNumber
    // 计算 sku 价格
    if (this.data.canSubmit) {
      const token = wx.getStorageSync('token')
      const res = await WXAPI.goodsPriceV2({
        token: token ? token : '',
        goodsId: this.data.goodsDetail.basicInfo.id,
        propertyChildIds: this.data.propertyChildIds
      })
      if (res.code == 0) {
        price = res.data.price
        if (this.data.shopType == 'toPingtuan') {
          price = res.data.pingtuanPrice
        }
        originalPrice = res.data.originalPrice
        totalScoreToPay = res.data.score
        buyNumMax = res.data.stores
      }
    }
    // 计算配件价格
    if (this.data.goodsAddition) {
      this.data.goodsAddition.forEach(big => {
        big.items.forEach(small => {
          if (small.active) {
            price = (price * 100 + small.price * 100) / 100
          }
        })
      })
    }
    this.setData({
      selectSizePrice: price,
      selectSizeOPrice: originalPrice,
      totalScoreToPay: totalScoreToPay,
      buyNumMax,
      buyNumber: (buyNumMax > buyNumber) ? buyNumber : 0
    });
  },
  /**
   * 选择可选配件
   */
  async labelItemTap2(e) {
    const propertyindex = e.currentTarget.dataset.propertyindex
    const propertychildindex = e.currentTarget.dataset.propertychildindex

    const goodsAddition = this.data.goodsAddition
    const property = goodsAddition[propertyindex]
    const child = property.items[propertychildindex]
    if (child.active) {
      // 该操作为取消选择
      child.active = false
      this.setData({
        goodsAddition
      })
      this.calculateGoodsPrice()
      return
    }
    // 单选配件取消所有子栏目选中状态
    if (property.type == 0) {
      property.items.forEach(child => {
        child.active = false
      })
    }
    // 设置当前选中状态
    child.active = true
    this.setData({
      goodsAddition
    })
    this.calculateGoodsPrice()
  },
  /**
   * 立即购买
   */
  buyNow: function (e) {
    let that = this
    let shoptype = e.currentTarget.dataset.shoptype
    if (this.data.goodsDetail.properties && !this.data.canSubmit) {
      wx.showToast({
        title: '请选择规格',
        icon: 'none'
      })
      this.bindGuiGeTap()
      return;
    }
    if (this.data.goodsAddition) {
      let canSubmit = true
      this.data.goodsAddition.forEach(ele => {
        if (ele.required) {
          const a = ele.items.find(item => {
            return item.active
          })
          if (!a) {
            canSubmit = false
          }
        }
      })
      if (!canSubmit) {
        wx.showToast({
          title: '请选择配件',
          icon: 'none'
        })
        this.bindGuiGeTap()
        return
      }
    }
    if (this.data.buyNumber < 1) {
      wx.showModal({
        title: '提示',
        content: '购买数量不能为0！',
        showCancel: false
      })
      return;
    }
    //组建立即购买信息
    var buyNowInfo = this.buliduBuyNowInfo(shoptype);
    // 写入本地存储
    wx.setStorage({
      key: "buyNowInfo",
      data: buyNowInfo
    })
    this.closePopupTap();
    if (shoptype == 'toPingtuan') {
      if (this.data.pingtuanopenid) {
        wx.navigateTo({
          url: "/pages/to-pay-order/index?orderType=buyNow&pingtuanOpenId=" + this.data.pingtuanopenid
        })
      } else {
        WXAPI.pingtuanOpen(wx.getStorageSync('token'), that.data.goodsDetail.basicInfo.id).then(function (res) {
          if (res.code == 2000) {
            return
          }
          if (res.code != 0) {
            wx.showToast({
              title: res.msg,
              icon: 'none',
              duration: 2000
            })
            return
          }
          wx.navigateTo({
            url: "/pages/to-pay-order/index?orderType=buyNow&pingtuanOpenId=" + res.data.id
          })
        })
      }
    } else {
      wx.navigateTo({
        url: "/pages/to-pay-order/index?orderType=buyNow"
      })
    }

  },
  /**
   * 组建立即购买信息
   */
  buliduBuyNowInfo: function (shoptype) {
    var shopCarMap = {};
    shopCarMap.goodsId = this.data.goodsDetail.basicInfo.id;
    shopCarMap.shopId = this.data.goodsDetail.basicInfo.shopId;
    shopCarMap.pic = this.data.goodsDetail.basicInfo.pic;
    shopCarMap.name = this.data.goodsDetail.basicInfo.name;
    // shopCarMap.label=this.data.goodsDetail.basicInfo.id; 规格尺寸 
    shopCarMap.propertyChildIds = this.data.propertyChildIds;
    shopCarMap.label = this.data.propertyChildNames;
    shopCarMap.price = this.data.selectSizePrice;
    // if (shoptype == 'toPingtuan') { // 20190714 拼团价格注释掉
    //   shopCarMap.price = this.data.goodsDetail.basicInfo.pingtuanPrice;
    // }
    shopCarMap.score = this.data.totalScoreToPay;
    shopCarMap.left = "";
    shopCarMap.active = true;
    shopCarMap.number = this.data.buyNumber;
    shopCarMap.logisticsType = this.data.goodsDetail.basicInfo.logisticsId;
    shopCarMap.logistics = this.data.goodsDetail.logistics;
    shopCarMap.weight = this.data.goodsDetail.basicInfo.weight;

    if (this.data.goodsAddition && this.data.goodsAddition.length > 0) {
      const additions = []
      this.data.goodsAddition.forEach(ele => {
        ele.items.forEach(item => {
          if (item.active) {
            additions.push({
              id: item.id,
              name: item.name,
              pid: ele.id,
              pname: ele.name
            })
          }
        })
      })
      if (additions.length > 0) {
        shopCarMap.additions = additions
      }
    }

    var buyNowInfo = {};
    buyNowInfo.shopNum = 0;
    buyNowInfo.shopList = [];

    buyNowInfo.shopList.push(shopCarMap);
    buyNowInfo.kjId = this.data.kjId;
    buyNowInfo.shopInfo = {
      id: 0,
      name: "其他",
      pic: null,
      serviceDistance: 99999999,
    }

    return buyNowInfo;
  },
  onShareAppMessage() {
    let _data = {
      title: this.data.goodsDetail.basicInfo.name,
      path: '/pages/goods-details/index?id=' + this.data.goodsDetail.basicInfo.id + '&inviter_id=' + wx.getStorageSync('uid'),
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
    return _data
  },
  closePop() {
    this.setData({
      posterShow: false
    })
  },
})

