//app.js
App({
  /** 
   * 自定义post函数，返回Promise
   * +-------------------
   * author: 武当山道士<912900700@qq.com>
   * +-------------------
   * @param {String}      url 接口网址
   * @param {arrayObject} data 要传的数组对象 例如: {name: '武当山道士', age: 32}
   * +-------------------
   * @return {Promise}    promise 返回promise供后续操作
   */
  post: function(url, data, ifShow,ifCanCancel,title,pageUrl,ifGoPage,self) {
    if (ifShow) {
      wx.showLoading({
        title: title,
        mask: !ifCanCancel
      })
    }
    var promise = new Promise((resolve, reject) => {
      //init
      var that = this;
      var postData = data;
      /*
      //自动添加签名字段到postData，makeSign(obj)是一个自定义的生成签名字符串的函数
      postData.signature = that.makeSign(postData);
      */
      //网络请求

      wx.request({
        url: url,
        data: postData,
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function(res) { //服务器返回数据
          let status = res.data.status;
          if (status == 1) {//请求成功
            resolve(res);
          } else if(status == -2){//没有权限
            console.log('没有权限')
            wx.navigateTo({
              url: '/pages/pay/pay',
            })
          } else if(status == -5){//重复登录
            console.log('重复登录')
            wx.navigateTo({
              url: '/pages/login1/login1?url=' + pageUrl+'&ifGoPage='+ifGoPage
            })
          } else if (status == -101){//没有试题
            console.log('没有试题')
            self.setData({
              isHasShiti:false,
              isLoaded:true
            })
          }else if(status == -201){
            console.log('余额不足')
            wx.showToast({
              title: '余额不足',
              icon:'none',
              duration:3000
            })
          }


          wx.hideLoading();
        },
        error: function(e) {
          reject('网络出错');
        }
      })
    });
    return promise;
  },

  onLaunch: function() {
    // wx.clearStorage();
    // wx.clearStorage("user")  
  },

  //第一种状态的底部  
  editTabBar1: function () {
    var _curPageArr = getCurrentPages();
    var _curPage = _curPageArr[_curPageArr.length - 1];
    var _pagePath = _curPage.__route__;
    if (_pagePath.indexOf('/') != 0) {
      _pagePath = '/' + _pagePath;
    }
    var tabBar = this.globalData.tabBar1;
    for (var i = 0; i < tabBar.list.length; i++) {
      tabBar.list[i].active = false;
      if (tabBar.list[i].pagePath == _pagePath + "?type=zq") {
        tabBar.list[i].active = true;//根据页面地址设置当前页面状态    
      }
    }
    console.log(tabBar)
    _curPage.setData({
      tabBar: tabBar
    });
  },
  //第二种状态的底部  
  editTabBar2: function () {
    var _curPageArr = getCurrentPages();
    var _curPage = _curPageArr[_curPageArr.length - 1];
    var _pagePath = _curPage.__route__;
    if (_pagePath.indexOf('/') != 0) {
      _pagePath = '/' + _pagePath;
    }
    var tabBar = this.globalData.tabBar2;
    for (var i = 0; i < tabBar.list.length; i++) {
      tabBar.list[i].active = false;
      if (tabBar.list[i].pagePath == _pagePath+"?type=jj") {
        tabBar.list[i].active = true;//根据页面地址设置当前页面状态    
      }
    }
    _curPage.setData({
      tabBar: tabBar
    });
  },

  //第二种状态的底部  
  editTabBar3: function () {
    var _curPageArr = getCurrentPages();
    var _curPage = _curPageArr[_curPageArr.length - 1];
    var _pagePath = _curPage.__route__;
    if (_pagePath.indexOf('/') != 0) {
      _pagePath = '/' + _pagePath;
    }
    var tabBar = this.globalData.tabBar3;
    for (var i = 0; i < tabBar.list.length; i++) {
      tabBar.list[i].active = false;
      if (tabBar.list[i].pagePath == _pagePath + "?type=qh") {
        tabBar.list[i].active = true;//根据页面地址设置当前页面状态    
      }
    }
    _curPage.setData({
      tabBar: tabBar
    });
  },

  globalData: {
    userInfo: null,
    isLogin: false,
    pop: 2,
    num: 0,
    tabBar1: {
      "color": "#333",
      "selectedColor": "#f00",
      "backgroundColor": "#fff",
      "borderStyle": "#c2c2c4",
      "list": [
        {
          "pagePath": "/pages/index/myIndex/myIndex?type=zq",
          "text": "证券",
          "iconPath": "/imgs/menu_ico1.png",
          "selectedIconPath": "/imgs/menu_ico1_sel.png",
          "clas": "menu-item2",
          "selectedColor": "#fd6131",
          "active": true
        },
        {
          "pagePath": "/pages/index/myIndex/myIndex?type=jj",
          "text": "基金",
          "iconPath": "/imgs/menu_ico2.png",
          "selectedIconPath": "/imgs/menu_ico2_sel.png",
          "selectedColor": "#ffdd22",
          "clas": "menu-item2",
          "active": false
        },
        {
          "pagePath": "/pages/index/myIndex/myIndex?type=qh",
          "text": "期货",
          "iconPath": "/imgs/menu_ico3.png",
          "selectedIconPath": "/imgs/menu_ico3_sel.png",
          "selectedColor": "#ea3e1a",
          "clas": "menu-item2",
          "active": false
        },
        {
          "pagePath": "/pages/mine/mineIndex/mineIndex",
          "text": "我的",
          "iconPath": "/imgs/menu_ico4.png",
          "selectedIconPath": "/imgs/menu_ico4_sel.png",
          "selectedColor": "#f7711d",
          "clas": "menu-item2",
          "active": false
        }
      ],
      "position": "bottom"
    },
    tabBar2: {
      "color": "#333",
      "selectedColor": "#f00",
      "backgroundColor": "#fff",
      "borderStyle": "#c2c2c4",
      "list": [
        {
          "pagePath": "/pages/index/myIndex/myIndex?type=zq",
          "text": "证券",
          "iconPath": "/imgs/menu_ico1.png",
          "selectedIconPath": "/imgs/menu_ico1_sel.png",
          "clas": "menu-item2",
          "selectedColor": "#fd6131",
          "active": false
        },
        {
          "pagePath": "/pages/index/myIndex/myIndex?type=jj",
          "text": "基金",
          "iconPath": "/imgs/menu_ico2.png",
          "selectedIconPath": "/imgs/menu_ico2_sel.png",
          "selectedColor": "#ffdd22",
          "clas": "menu-item2",
          "active": true
        },
        {
          "pagePath": "/pages/index/myIndex/myIndex?type=qh",
          "text": "期货",
          "iconPath": "/imgs/menu_ico3.png",
          "selectedIconPath": "/imgs/menu_ico3_sel.png",
          "selectedColor": "#ea3e1a",
          "clas": "menu-item2",
          "active": false
        },
        {
          "pagePath": "/pages/mine/mineIndex/mineIndex",
          "text": "我的",
          "iconPath": "/imgs/menu_ico4.png",
          "selectedIconPath": "/imgs/menu_ico4_sel.png",
          "selectedColor": "#f7711d",
          "clas": "menu-item2",
          "active": false
        }
      ],
      "position": "bottom"
    },
    tabBar3: {
      "color": "#333",
      "selectedColor": "#f00",
      "backgroundColor": "#fff",
      "borderStyle": "#c2c2c4",
      "list": [
        {
          "pagePath": "/pages/index/myIndex/myIndex?type=zq",
          "text": "证券",
          "iconPath": "/imgs/menu_ico1.png",
          "selectedIconPath": "/imgs/menu_ico1_sel.png",
          "clas": "menu-item2",
          "selectedColor": "#fd6131",
          "active": false
        },
        {
          "pagePath": "/pages/index/myIndex/myIndex?type=jj",
          "text": "基金",
          "iconPath": "/imgs/menu_ico2.png",
          "selectedIconPath": "/imgs/menu_ico2_sel.png",
          "selectedColor": "#ffdd22",
          "clas": "menu-item2",
          "active": false
        },
        {
          "pagePath": "/pages/index/myIndex/myIndex?type=qh",
          "text": "期货",
          "iconPath": "/imgs/menu_ico3.png",
          "selectedIconPath": "/imgs/menu_ico3_sel.png",
          "selectedColor": "#ea3e1a",
          "clas": "menu-item2",
          "active": true
        },
        {
          "pagePath": "/pages/mine/mineIndex/mineIndex",
          "text": "我的",
          "iconPath": "/imgs/menu_ico4.png",
          "selectedIconPath": "/imgs/menu_ico4_sel.png",
          "selectedColor": "#f7711d",
          "clas": "menu-item2",
          "active": false
        }
      ],
      "position": "bottom"
    }
  }
})