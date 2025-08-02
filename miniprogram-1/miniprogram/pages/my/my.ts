// pages/my/my.ts
Page({
  data: {
    userInfo: {
      nickName: '张同学',
      avatarUrl: 'https://via.placeholder.com/100x100',
      contact: 'zhang2023',
      isVerified: false
    },
    favoriteUpdates: 0,
    showVerify: false,
    verifyForm: {
      name: '',
      studentId: '',
      college: ''
    }
  },

  onLoad() {
    this.loadUserInfo();
    this.checkUpdates();
  },

  onShow() {
    // 每次页面显示时重新加载用户信息和检查更新
    this.loadUserInfo();
    this.checkUpdates();
  },

  loadUserInfo() {
    // 从本地存储获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ userInfo });
    }
  },

  checkUpdates() {
    // 获取有状态变化的收藏商品
    const updatedFavorites = wx.getStorageSync('updatedFavorites') || [];
    
    // 设置提醒数量
    this.setData({
      favoriteUpdates: updatedFavorites.length
    });

    // 如果有更新，同时添加系统消息
    if (updatedFavorites.length > 0) {
      this.addSystemMessages(updatedFavorites);
    }
  },

  addSystemMessages(updatedItems: any[]) {
    // 获取现有消息
    const messages = wx.getStorageSync('systemMessages') || [];
    
    // 为每个更新的商品添加系统消息
    const newMessages = updatedItems.map(item => ({
      id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type: 'system',
      title: '商品状态更新',
      content: `您收藏的商品"${item.title}"状态已更新为"${item.status}"`,
      time: new Date().toISOString(),
      read: false
    }));
    
    // 合并消息并保存
    const allMessages = [...newMessages, ...messages];
    wx.setStorageSync('systemMessages', allMessages);
    
    // 更新小红点
    this.updateTabBarBadge(allMessages.filter(msg => !msg.read).length);
  },

  updateTabBarBadge(count: number) {
    if (count > 0) {
      wx.setTabBarBadge({
        index: 1, // 消息标签的索引
        text: count.toString()
      });
    } else {
      wx.removeTabBarBadge({
        index: 1
      });
    }
  },

  // 测试云函数
  testCloudFunction() {
    console.log('测试云函数按钮被点击');
    wx.showLoading({
      title: '测试云函数',
    });
    
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: (result) => {
        console.log('云函数测试成功', result);
        wx.hideLoading();
        wx.showModal({
          title: '云函数测试结果',
          content: '调用成功，请查看控制台日志',
          showCancel: false
        });
      },
      fail: (err) => {
        console.error('云函数测试失败', err);
        wx.hideLoading();
        wx.showModal({
          title: '云函数测试失败',
          content: JSON.stringify(err),
          showCancel: false
        });
      }
    });
  },

  // 简化版登录，用于测试
  handleLogin() {
    console.log('登录按钮被点击');
    
    wx.showLoading({
      title: '登录中',
    });
    
    // 直接使用简化版登录，便于排查问题
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        const userInfo = {
          nickName: res.userInfo.nickName,
          avatarUrl: res.userInfo.avatarUrl,
          gender: res.userInfo.gender,
          country: res.userInfo.country || '',
          province: res.userInfo.province || '',
          city: res.userInfo.city || '',
          contact: '',
          isVerified: false
        };
        
        console.log('获取到的用户信息', userInfo);
        
        // 保存用户信息到本地存储
        wx.setStorageSync('userInfo', userInfo);
        
        this.setData({
          userInfo: userInfo
        });
        
        wx.hideLoading();
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('获取用户信息失败', err);
        wx.hideLoading();
        wx.showToast({
          title: '您已取消授权',
          icon: 'none'
        });
      }
    });
  },

  navigateToFavorites() {
    // 导航到收藏页面时，清除收藏更新提醒
    wx.setStorageSync('updatedFavorites', []);
    this.setData({
      favoriteUpdates: 0
    });
    
    wx.navigateTo({
      url: '/pages/favorites/favorites'
    });
  },

  navigateToMyItems() {
    wx.navigateTo({
      url: '/pages/my-items/my-items'
    });
  },

  navigateToSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  },

  showVerifyModal() {
    this.setData({
      showVerify: true
    });
  },

  onVerifyVisibleChange(e: any) {
    if (!e.detail.visible) {
      this.setData({
        showVerify: false
      });
    }
  },

  onVerifyNameChange(e: any) {
    this.setData({
      'verifyForm.name': e.detail.value
    });
  },

  onVerifyStudentIdChange(e: any) {
    this.setData({
      'verifyForm.studentId': e.detail.value
    });
  },

  onVerifyCollegeChange(e: any) {
    this.setData({
      'verifyForm.college': e.detail.value
    });
  },

  cancelVerify() {
    this.setData({
      showVerify: false,
      verifyForm: {
        name: '',
        studentId: '',
        college: ''
      }
    });
  },

  submitVerify() {
    const { name, studentId, college } = this.data.verifyForm;
    
    // 表单验证
    if (!name.trim()) {
      this.showToast('请输入姓名');
      return;
    }
    
    if (!studentId.trim()) {
      this.showToast('请输入学号');
      return;
    }
    
    if (!college.trim()) {
      this.showToast('请输入学院');
      return;
    }
    
    // 显示加载中
    wx.showLoading({
      title: '提交中',
      mask: true
    });
    
    // 模拟认证请求
    setTimeout(() => {
      wx.hideLoading();
      
      // 更新用户信息
      const userInfo = { ...this.data.userInfo, isVerified: true };
      this.setData({
        userInfo,
        showVerify: false,
        verifyForm: {
          name: '',
          studentId: '',
          college: ''
        }
      });
      
      wx.setStorageSync('userInfo', userInfo);
      
      wx.showToast({
        title: '认证成功',
        icon: 'success'
      });
    }, 1500);
  },
  
  showToast(title: string) {
    wx.showToast({
      title,
      icon: 'none',
      duration: 2000
    });
  }
}); 