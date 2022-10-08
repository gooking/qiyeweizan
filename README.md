# 介绍

企业微展，借助微信小程序平台，打造企业/个人的在线展示平台。

本项目使用原生小程序开发，接口和后台部分直接对接的“api工厂”的saas，您也可以直接去注册账号后即可体验小程序

扫码体验：

<img src="https://7.s2m.cc/2021/10/05/a4cee443-cb69-441e-b440-3d436310f206.jpeg" width="200px">


如果觉得本项目对你有帮助，帮忙点下 `star` 哦～

# 微信交流群

<img src="https://dcdn.it120.cc/2021/12/13/088bbe8e-9740-4158-835c-3e2c7d941b1a.png" width="200px">

# 其他优秀开源模板推荐
- [天使童装](https://github.com/EastWorld/wechat-app-mall) [码云镜像](https://gitee.com/javazj/wechat-app-mall)
- [天使童装（uni-app版本）](https://github.com/gooking/uni-app-mall) [码云镜像](https://gitee.com/javazj/uni-app-mall)
- [舔果果小铺（升级版）](https://github.com/gooking/TianguoguoXiaopu)
- [面馆风格小程序](https://gitee.com/javazj/noodle_shop_procedures)
- [AI名片](https://github.com/gooking/visitingCard)
- [仿海底捞订座排队 (uni-app)](https://github.com/gooking/dingzuopaidui) [码云镜像](https://gitee.com/javazj/dingzuopaidui)

# 如何搭建并运行该小程序

## 开通接口和后台

点击下面的地址，注册开通后台

[注册并开通你自己的后台](https://admin.it120.cc/)，注册的时候，邀请码填写 `66` 哦～

[《接口SDK使用说明》](https://www.yuque.com/apifm/nu0f75)

## 克隆后台测试数据

左侧菜单，工厂设置，数据克隆，将对方数据克隆给我，填写商户号 `66` ，点击克隆即可

## 配置小程序信息

首先自行去注册开通小程序账号： https://mp.weixin.qq.com/
完成微信认证以后，将小程序的 appID 和 secret 的信息填到：
左侧菜单，微信设置，小程序设置

## 修改专属域名，和后台做关联

打开修改 `config.js` 文件，把 `subDomain` 文件改成你自己的专属域名

[什么是专属域名？](https://www.it120.cc/help/qr6l4m.html)

## 配置服务器合法域名

[如何配置服务器合法域名？](https://www.it120.cc/help/tvpou9.html)

## 添加插件

如果你需要使用本小程序首页的自动加微信、自动加微信群的功能，需要在你的小程序公众号后台，添加2个插件
- wx4d2deeab3aed6e5a
- wx104a1a20c3f81ec2

# 开发模式

## 服务商模式

代码默认为运行在服务商模式，通过配置根目录的 `ext.json` 文件,来调试小程序

```js
{
  "extEnable": true,
  "extAppid": "wx2bdf7b6e21c5049c",
  "ext": {
    "subDomain": "2byewu"
  }
}
```

服务商上传代码的时候，需要指定扩展参数：

```json
{"extEnable":true,"extAppid":"wx2bdf7b6e21c5049c","ext":{"subDomain":"2byewu"}}
```

## 普通小程序模式

删除掉根目录下面的 `ext.json` 文件，然后通过配置 `config.js` 文件下的 `subDomain` 来连接到后台


# 开发素材


## 底部 icon 图标

https://www.iconfont.cn/collections/detail?spm=a313x.7781069.1998910419.dc64b3430&cid=21503

https://www.iconfont.cn/collections/detail?spm=a313x.7781069.1998910419.dc64b3430&cid=34515

## 底部菜单颜色

#375282

#999999


