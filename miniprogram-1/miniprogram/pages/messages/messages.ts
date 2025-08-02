// pages/messages/messages.ts
Page({
  data: {
    conversations: [] as any[]
  },

  onLoad() {
    this.loadConversations();
  },
  
  onShow() {
    // 每次页面显示时重新加载
    this.loadConversations();
  },

  loadConversations() {
    // 获取系统消息
    const systemMessages = wx.getStorageSync('systemMessages') || [];
    const unreadSystemMessages = systemMessages.filter((msg: any) => !msg.read).length;
    
    // 获取最新的系统消息
    let lastSystemMessage = '暂无系统消息';
    let lastSystemTime = '';
    
    if (systemMessages.length > 0) {
      // 获取最新的系统消息内容
      lastSystemMessage = systemMessages[0].content;
      
      // 格式化时间
      const date = new Date(systemMessages[0].time);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (24 * 60 * 60 * 1000));
      
      if (diffDays === 0) {
        // 今天
        lastSystemTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      } else if (diffDays === 1) {
        // 昨天
        lastSystemTime = '昨天';
      } else if (diffDays < 7) {
        // 一周内
        const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        lastSystemTime = days[date.getDay()];
      } else {
        // 更早
        lastSystemTime = `${date.getMonth() + 1}月${date.getDate()}日`;
      }
    }
    
    // 模拟加载聊天会话
    // 实际项目中应该从服务器获取
    const conversations = [
      {
        id: 'system', // 系统消息的特殊ID
        name: '系统消息',
        avatar: '/assets/icons/system.png', // 系统消息的图标
        lastMessage: lastSystemMessage,
        lastTime: lastSystemTime || '无',
        unread: unreadSystemMessages,
        isSystem: true
      },
      {
        id: '1',
        name: '张同学',
        avatar: 'https://via.placeholder.com/100x100',
        lastMessage: '电池健康度是90%，最低4800可以，校内当面交易。',
        lastTime: '10:33',
        unread: 0,
        productId: '1'
      },
      {
        id: '2',
        name: '李同学',
        avatar: 'https://via.placeholder.com/100x100/fee',
        lastMessage: '请问这个书还有吗？',
        lastTime: '昨天',
        unread: 2,
        productId: '2'
      },
      {
        id: '3',
        name: '王同学',
        avatar: 'https://via.placeholder.com/100x100/efe',
        lastMessage: '好的，明天下午方便吗？',
        lastTime: '前天',
        unread: 0,
        productId: '3'
      }
    ];
    
    // 更新未读消息角标
    this.updateTabBarBadge(conversations);
    
    this.setData({ conversations });
  },
  
  updateTabBarBadge(conversations: any[]) {
    // 计算所有未读消息数量
    const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread, 0);
    
    if (totalUnread > 0) {
      wx.setTabBarBadge({
        index: 1, // 消息标签的索引
        text: totalUnread.toString()
      });
    } else {
      wx.removeTabBarBadge({
        index: 1
      }).catch(() => {
        // 忽略可能的错误（如果没有设置过角标）
      });
    }
  },

  onConversationTap(e: any) {
    const id = e.currentTarget.dataset.id;
    const conversation = this.data.conversations.find(item => item.id === id);
    
    if (!conversation) return;
    
    if (conversation.isSystem) {
      // 处理系统消息
      this.handleSystemMessages();
    } else {
      // 处理普通聊天消息
      wx.navigateTo({
        url: `/pages/detail/detail?id=${conversation.productId}&openChat=true`
      });
      
      // 标记为已读
      if (conversation.unread > 0) {
        const conversations = [...this.data.conversations];
        const index = conversations.findIndex(item => item.id === id);
        
        if (index !== -1) {
          conversations[index].unread = 0;
          this.setData({ conversations });
          
          // 更新标签栏角标
          this.updateTabBarBadge(conversations);
        }
      }
    }
  },
  
  handleSystemMessages() {
    // 导航到系统消息详情页
    wx.navigateTo({
      url: '/pages/system-messages/system-messages'
    });
    
    // 标记所有系统消息为已读
    const conversations = [...this.data.conversations];
    const systemIndex = conversations.findIndex(item => item.id === 'system');
    
    if (systemIndex !== -1 && conversations[systemIndex].unread > 0) {
      conversations[systemIndex].unread = 0;
      this.setData({ conversations });
      
      // 更新本地存储中的系统消息
      const systemMessages = wx.getStorageSync('systemMessages') || [];
      const updatedSystemMessages = systemMessages.map((msg: any) => ({
        ...msg,
        read: true
      }));
      
      wx.setStorageSync('systemMessages', updatedSystemMessages);
      
      // 更新标签栏角标
      this.updateTabBarBadge(conversations);
    }
  },

  navigateToHome() {
    wx.switchTab({
      url: '/pages/home/home'
    });
  }
}); 