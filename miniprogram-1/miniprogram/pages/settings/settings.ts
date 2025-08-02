Page({
  data: {
    userInfo: {
      nickName: '',
      avatarUrl: '',
      contact: '',
      isVerified: false
    },
    showNickname: false,
    showContact: false,
    showVerify: false,
    inputNickname: '',
    inputContact: '',
    verifyForm: {
      name: '',
      studentId: '',
      college: ''
    }
  },

  onLoad() {
    this.loadUserInfo();
  },

  onShow() {
    // 每次页面显示时重新加载用户信息
    this.loadUserInfo();
  },

  loadUserInfo() {
    // 从本地存储获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ userInfo });
    }
  },

  // 选择头像
  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      camera: 'back',
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        
        // 更新头像
        const userInfo = { ...this.data.userInfo, avatarUrl: tempFilePath };
        this.setData({ userInfo });
        wx.setStorageSync('userInfo', userInfo);
        
        wx.showToast({
          title: '头像更新成功',
          icon: 'success'
        });
      }
    });
  },

  // 修改昵称
  showNicknameModal() {
    this.setData({
      showNickname: true,
      inputNickname: this.data.userInfo.nickName || ''
    });
  },

  onNicknameVisibleChange(e: any) {
    if (!e.detail.visible) {
      this.setData({
        showNickname: false
      });
    }
  },

  onNicknameChange(e: any) {
    this.setData({
      inputNickname: e.detail.value
    });
  },

  cancelNickname() {
    this.setData({
      showNickname: false
    });
  },

  confirmNickname() {
    const { inputNickname } = this.data;
    
    if (!inputNickname.trim()) {
      this.showToast('昵称不能为空');
      return;
    }
    
    // 更新昵称
    const userInfo = { ...this.data.userInfo, nickName: inputNickname };
    this.setData({
      userInfo,
      showNickname: false
    });
    wx.setStorageSync('userInfo', userInfo);
    
    this.showToast('昵称更新成功');
  },

  // 修改微信号
  showContactModal() {
    this.setData({
      showContact: true,
      inputContact: this.data.userInfo.contact || ''
    });
  },

  onContactVisibleChange(e: any) {
    if (!e.detail.visible) {
      this.setData({
        showContact: false
      });
    }
  },

  onContactChange(e: any) {
    this.setData({
      inputContact: e.detail.value
    });
  },

  cancelContact() {
    this.setData({
      showContact: false
    });
  },

  confirmContact() {
    const { inputContact } = this.data;
    
    if (!inputContact.trim()) {
      this.showToast('微信号不能为空');
      return;
    }
    
    // 更新微信号
    const userInfo = { ...this.data.userInfo, contact: inputContact };
    this.setData({
      userInfo,
      showContact: false
    });
    wx.setStorageSync('userInfo', userInfo);
    
    this.showToast('微信号更新成功');
  },

  // 学号认证
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

  confirmVerify() {
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

  // 清除缓存
  clearCache() {
    wx.showModal({
      title: '提示',
      content: '确定要清除缓存吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除缓存但保留用户信息
          const userInfo = wx.getStorageSync('userInfo');
          wx.clearStorageSync();
          if (userInfo) {
            wx.setStorageSync('userInfo', userInfo);
          }
          
          this.showToast('缓存已清除');
        }
      }
    });
  },

  // 关于我们
  showAbout() {
    wx.showModal({
      title: '关于我们',
      content: 'BNBU闲置小市场是北师香港浸会大学的二手交易平台，旨在为校园师生提供便捷的闲置物品交易交流服务平台。联系开发者：jinxin023@yeah.net',
      showCancel: false
    });
  },

  // 用户协议
  showAgreement() {
    wx.showModal({
      title: '用户协议',
      content: '用户协议内容...待更新',
      showCancel: false
    });
  },

  // 隐私政策
  showPrivacy() {
    wx.showModal({
      title: '隐私政策',
      content: '隐私政策内容...待更新',
      showCancel: false
    });
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo');
          
          this.setData({
            userInfo: {
              nickName: '',
              avatarUrl: '',
              contact: '',
              isVerified: false
            }
          });
          
          this.showToast('已退出登录');
          
          // 返回到我的页面
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/my/my'
            });
          }, 1000);
        }
      }
    });
  },

  showToast(title: string) {
    wx.showToast({
      title,
      icon: 'none',
      duration: 2000
    });
  }
}); 