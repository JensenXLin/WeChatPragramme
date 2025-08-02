// pages/detail/detail.ts
Page({
  data: {
    id: '',
    product: {
      id: '',
      title: '',
      price: 0,
      category: '',
      desc: '',
      imgList: [] as string[],
      createTime: '',
      seller: {
        nickName: '',
        avatarUrl: '',
        contact: ''
      }
    },
    isFavorite: false,
    showChat: false,
    messages: [] as any[],
    inputMessage: '',
    lastMessageId: '',
    userInfo: {
      nickName: '我',
      avatarUrl: 'https://via.placeholder.com/100x100/eef'
    }
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        id: options.id
      });
      this.loadProductDetail(options.id);
      this.checkIsFavorite(options.id);
      this.loadChatMessages(options.id);
    }
  },

  loadProductDetail(id: string) {
    // 模拟API请求
    setTimeout(() => {
      // 模拟数据，实际项目中应该从服务器获取
      const product = {
        id: id,
        title: 'iPhone 13 Pro 256G 深空灰色 99新 原装正品 无拆修',
        price: 4999,
        category: '数码',
        desc: 'iPhone 13 Pro 256G 深空灰色，购买于2022年1月，使用9个月，99新，无拆修，无进水，原装配件齐全（充电器、数据线、耳机均为原装）。电池健康度90%，系统流畅无卡顿。\n\n因换了新手机，现低价出售，价格可小刀，诚心购买的同学请联系我。校内当面交易，可验机。',
        imgList: [
          'https://via.placeholder.com/800x600/eef/text=iPhone',
          'https://via.placeholder.com/800x600/fee/text=iPhone2',
          'https://via.placeholder.com/800x600/efe/text=iPhone3'
        ] as string[],
        createTime: '2023-05-20',
        seller: {
          nickName: '张同学',
          avatarUrl: 'https://via.placeholder.com/100x100',
          contact: 'zhang2023'
        }
      };
      
      this.setData({ product });
    }, 500);
  },

  checkIsFavorite(id: string) {
    // 模拟检查是否已收藏
    const favorites = wx.getStorageSync('favorites') || [];
    const isFavorite = favorites.includes(id);
    this.setData({ isFavorite });
  },

  toggleFavorite() {
    const isFavorite = !this.data.isFavorite;
    this.setData({ isFavorite });
    
    // 模拟收藏/取消收藏操作
    let favorites = wx.getStorageSync('favorites') || [];
    
    if (isFavorite) {
      if (!favorites.includes(this.data.id)) {
        favorites.push(this.data.id);
      }
      wx.showToast({
        title: '已加入收藏',
        icon: 'success'
      });
    } else {
      favorites = favorites.filter((id: string) => id !== this.data.id);
      wx.showToast({
        title: '已取消收藏',
        icon: 'none'
      });
    }
    
    wx.setStorageSync('favorites', favorites);
  },

  openChat() {
    this.setData({ showChat: true });
  },

  closeChat() {
    this.setData({ showChat: false });
  },

  loadChatMessages(productId: string) {
    // 模拟加载聊天记录
    setTimeout(() => {
      const messages = [
        {
          id: 1,
          content: '您好，请问这个iPhone还在出售吗？',
          isSelf: true,
          time: '10:30'
        },
        {
          id: 2,
          content: '在的，有什么可以帮您的吗？',
          isSelf: false,
          time: '10:31'
        },
        {
          id: 3,
          content: '请问最低可以接受多少钱？电池健康度具体是多少？',
          isSelf: true,
          time: '10:32'
        },
        {
          id: 4,
          content: '电池健康度是90%，最低4800可以，校内当面交易。',
          isSelf: false,
          time: '10:33'
        }
      ];
      
      this.setData({ 
        messages,
        lastMessageId: `msg-${messages[messages.length - 1].id}`
      });
    }, 800);
  },

  onInputChange(e: any) {
    this.setData({
      inputMessage: e.detail.value
    });
  },

  sendMessage() {
    const { inputMessage, messages } = this.data;
    
    if (!inputMessage.trim()) {
      return;
    }
    
    // 添加新消息
    const newMessage = {
      id: messages.length + 1,
      content: inputMessage,
      isSelf: true,
      time: this.getCurrentTime()
    };
    
    const updatedMessages = [...messages, newMessage];
    
    this.setData({
      messages: updatedMessages,
      inputMessage: '',
      lastMessageId: `msg-${newMessage.id}`
    });
    
    // 模拟对方回复
    setTimeout(() => {
      const replyMessage = {
        id: updatedMessages.length + 1,
        content: '好的，我已收到您的消息，稍后回复您。',
        isSelf: false,
        time: this.getCurrentTime()
      };
      
      const finalMessages = [...updatedMessages, replyMessage];
      
      this.setData({
        messages: finalMessages,
        lastMessageId: `msg-${replyMessage.id}`
      });
    }, 1000);
  },

  getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}); 