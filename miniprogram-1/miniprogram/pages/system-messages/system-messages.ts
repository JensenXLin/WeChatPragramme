Page({
  data: {
    systemMessages: [] as any[]
  },

  onLoad() {
    this.loadSystemMessages();
  },
  
  onShow() {
    // 每次页面显示时重新加载
    this.loadSystemMessages();
  },

  loadSystemMessages() {
    // 从本地存储获取系统消息
    let systemMessages = wx.getStorageSync('systemMessages') || [];
    
    // 格式化时间显示
    systemMessages = systemMessages.map((msg: any) => {
      const date = new Date(msg.time);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (24 * 60 * 60 * 1000));
      
      let formattedTime;
      if (diffDays === 0) {
        // 今天
        formattedTime = `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      } else if (diffDays === 1) {
        // 昨天
        formattedTime = `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      } else if (diffDays < 7) {
        // 一周内
        const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        formattedTime = `${days[date.getDay()]} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      } else {
        // 更早
        formattedTime = `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      }
      
      return {
        ...msg,
        formattedTime
      };
    });
    
    this.setData({ systemMessages });
    
    // 标记所有消息为已读
    this.markAllAsRead(systemMessages);
  },
  
  markAllAsRead(messages: any[]) {
    // 检查是否有未读消息
    const hasUnread = messages.some(msg => !msg.read);
    
    if (hasUnread) {
      // 标记所有消息为已读
      const updatedMessages = messages.map(msg => ({
        ...msg,
        read: true
      }));
      
      // 更新本地存储
      wx.setStorageSync('systemMessages', updatedMessages);
      
      // 移除标签栏角标
      this.updateTabBarBadge();
    }
  },
  
  updateTabBarBadge() {
    // 获取聊天消息的未读数
    const conversations = wx.getStorageSync('conversations') || [];
    const unreadChats = conversations.reduce((sum: number, conv: any) => sum + (conv.unread || 0), 0);
    
    if (unreadChats > 0) {
      wx.setTabBarBadge({
        index: 1, // 消息标签的索引
        text: unreadChats.toString()
      });
    } else {
      wx.removeTabBarBadge({
        index: 1
      }).catch(() => {
        // 忽略可能的错误（如果没有设置过角标）
      });
    }
  },

  onMessageTap(e: any) {
    const id = e.currentTarget.dataset.id;
    const message = this.data.systemMessages.find(item => item.id === id);
    
    if (message && message.productId) {
      // 如果消息与特定商品相关，跳转到商品详情
      wx.navigateTo({
        url: `/pages/detail/detail?id=${message.productId}`
      });
    }
  },

  navigateToHome() {
    wx.switchTab({
      url: '/pages/home/home'
    });
  }
}); 