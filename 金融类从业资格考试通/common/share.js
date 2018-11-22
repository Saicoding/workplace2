function setColor(category, setSelect, setTitle) {
  switch (category) {
    case "zq":
      wx.setNavigationBarColor({ //设置窗口颜色
        frontColor: "#ffffff",
        backgroundColor: "#fd6131",
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

function getColors(category){
  let colors = [];
  switch (category) {
    case "zq":
      colors[0] = "#fd6131";
      break;
    case "jj":
      colors[0] = "#ffc722";
      break;
    case "qh":
      colors[0] = "#C71585";
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
  getColorsRGB: getColorsRGB
}