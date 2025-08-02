// app.js
App({
  onLaunch() {
    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'cloud1-3gfprocj60a4436d',
        traceUser: true,
      });
      console.log('全局云环境初始化完成');
    }
    
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);

    // 登录
    wx.login({
      success: res => {
        console.log('小程序登录成功', res.code);
      }
    });
  },
  
  globalData: {
    userInfo: null,
    favorites: [],
    myItems: []
  }
}) 