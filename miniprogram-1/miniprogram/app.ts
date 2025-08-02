// app.ts
interface GlobalData {
  userInfo: WechatMiniprogram.UserInfo | null;
  favorites: string[];
  myItems: string[];
}

interface IAppOption {
  globalData: GlobalData;
  initSystemMessages: () => void;
}

App<IAppOption>({
  globalData: {
    userInfo: null,
    favorites: [],
    myItems: []
  },
  onLaunch() {
    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'cloud1-3gfprocj60a4436d',
        traceUser: true,
      });
    }

    // 初始化系统消息
    this.initSystemMessages();

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        console.log(res.code)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      },
    })
    
    // 初始化收藏和发布数据
    const favorites = wx.getStorageSync('favorites') || [];
    const myItems = wx.getStorageSync('myItems') || [];
    this.globalData.favorites = favorites;
    this.globalData.myItems = myItems;
    
    // 加载用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
    }
  },
  
  initSystemMessages() {
    // 检查是否已有系统消息
    const systemMessages = wx.getStorageSync('systemMessages') || [];
    
    // 如果没有系统消息，添加欢迎消息
    if (systemMessages.length === 0) {
      const welcomeMessage = {
        id: `msg_${Date.now()}`,
        type: 'system',
        title: '欢迎使用BNBU闲置小市场',
        content: '欢迎来到北师香港浸会大学闲置小市场！在这里，您可以轻松发布闲置物品，找到心仪的二手宝贝。校园内交易更安全、更便捷，为您的大学生活增添更多可能。如有任何问题，请随时联系我们。祝您使用愉快！',
        time: new Date().toISOString(),
        read: false
      };
      
      systemMessages.push(welcomeMessage);
      wx.setStorageSync('systemMessages', systemMessages);
    }
  }
})