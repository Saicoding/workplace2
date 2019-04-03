function setColor(category, setSelect, setTitle) {
  switch (category) {
    case "zq":
      wx.setNavigationBarColor({ //设置窗口颜色
        frontColor: "#ffffff",
        backgroundColor: "#fd6131",
        animation: {
          duration: 1000,
          timingFunc: 'easeIn',
        }
      })

      if (setTitle) {
        wx.setNavigationBarTitle({
          title: '证券从业资格',
        })
      } else {
        wx.setNavigationBarTitle({
          title: '金融类从业资格考试通',
        })
      }

      if (setSelect) {
        wx.setTabBarStyle({
          selectedColor: "#fd6131"
        })
      }
      break;
    case "jj":
      wx.setNavigationBarColor({ //设置窗口颜色
        frontColor: "#ffffff",
        backgroundColor: "#ffc722",
        animation: {
          duration: 1000,
          timingFunc: 'easeIn',
        }
      })

      if (setTitle) {
        wx.setNavigationBarTitle({
          title: '基金从业资格',
        })
      } else {
        wx.setNavigationBarTitle({
          title: '金融类从业资格考试通',
        })
      }

      if (setSelect) {
        wx.setTabBarStyle({
          selectedColor: "#ffc722"
        })
      }
      break;
    case "qh":
      wx.setNavigationBarColor({ //设置窗口颜色
        frontColor: "#ffffff",
        backgroundColor: "#C71585",
        animation: {
          duration: 1000,
          timingFunc: 'easeIn',
        }
      })

      if (setTitle) {
        wx.setNavigationBarTitle({
          title: '期货从业资格',
        })
      } else {
        wx.setNavigationBarTitle({
          title: '金融类从业资格考试通',
        })
      }

      if (setSelect) {
        wx.setTabBarStyle({
          selectedColor: "#C71585"
        })
      }
      break;
  }
}

/**
 * 判断是否超高
 */
function ifOverHeight(self, shiti, sliderShitiArray) {
  wx.getSystemInfo({ //得到窗口高度,这里必须要用到异步,而且要等到窗口bar显示后再去获取,所以要在onReady周期函数中使用获取窗口高度方法
    success: function (res) { //转换窗口高度
      let windowHeight = res.windowHeight;
      let windowWidth = res.windowWidth;
      windowHeight = (windowHeight * (750 / windowWidth));

      let str = "#h" + shiti.id;
      var query = wx.createSelectorQuery();
      //选择id
      setTimeout(function () {
        query.select(str).boundingClientRect(function (rect) {
          //当前受测组件的高度(rpx);
          if(rect){
            let height = rect.height * (750 / windowWidth);

            if (windowHeight - 220 < height) {
              // midShiti.xiaoti[0].style = "padding-left:20rpx;font-size:25rpx;line-height:40rpx;";
              if (height - windowHeight + 220 < 115) {//如果只超了120
                let sub = (height - windowHeight + 220) / 2;
                // shiti.style = "padding-top:" + (25 - sub) + "rpx;padding-bottom:" + (25 - sub) +"rpx;"
                shiti.style = "padding-top:5rpx;padding-bottom:5rpx;"
                self.setData({
                  sliderShitiArray: sliderShitiArray
                })
              } else if (height - windowHeight + 220 >= 115 && height - windowHeight + 220 < 455) {
                shiti.style = "padding-top:5rpx;padding-bottom:5rpx;font-size:25rpx;padding-left:20rpx;line-height:40rpx;"
                self.setData({
                  sliderShitiArray: sliderShitiArray
                })
              } else if (height - windowHeight + 220 >= 455) {
                shiti.style = "padding-top:3rpx;padding-bottom:3rpx;font-size:23rpx;padding-left:0rpx;line-height:37rpx;"
                self.setData({
                  sliderShitiArray: sliderShitiArray
                })
              }
            }
          }
        }).exec();
      }, 200)
    }
  });
}

function getColors(category){
  let colors = [];
  switch (category) {
    case "zq":
      colors[0] = "#fd6131";//主颜色
      colors[1] = "#eb3321";//渐变颜色1
      colors[2] = "#fe8c09";//渐变颜色2
      colors[3] = "#B3EE3A";//多选颜色
      colors[4] = "#fea386";//提交答案后上面空白处的颜色
      break;
    case "jj":
      colors[0] = "#ffc722";//主颜色
      colors[1] = "#bc8e03";//渐变颜色1
      colors[2] = "#f6db8a";//渐变颜色2
      colors[3] = "#B3EE3A";//多选颜色
      colors[4] = "#ffdd7f";//提交答案后正确文字的颜色
      break;
    case "qh":
      colors[0] = "#C71585";//主颜色
      colors[1] = "#860356";//渐变颜色1
      colors[2] = "#ef51b4";//渐变颜色2
      colors[3] = "#B3EE3A";//多选颜色
      colors[4] = "#dd77b8";//提交答案后正确文字的颜色
      colors[5] = "#f47023";//材料题颜色
      break;
  }

  return colors;
}

function getColorsRGB(category){
  let colors = [];
  switch (category) {
    case "zq":
      colors[0] = "253, 97, 49";
      break;
    case "jj":
      colors[0] = "255, 199, 34";
      break;
    case "qh":
      colors[0] = "199, 21, 133";
      break;
  }

  return colors;
}

module.exports = {
  setColor: setColor,
  getColors: getColors,
  getColorsRGB: getColorsRGB,
  ifOverHeight: ifOverHeight
}