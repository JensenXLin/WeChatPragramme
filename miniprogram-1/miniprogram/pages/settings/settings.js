// pages/settings/settings.js
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
    // 初始化云环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'cloud1-4gsab5af50af4ed4',
        traceUser: true,
      });
      console.log('云环境初始化成功');
    }
    
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
        
        // 显示上传中提示
        wx.showLoading({
          title: '上传中...',
          mask: true
        });
        
        // 获取用户ID，如果没有则使用时间戳
        const userId = this.data.userInfo._openid || this.data.userInfo._id || Date.now().toString();
        
                 // 上传到云存储
         let fileExtension = 'png';
         try {
           const match = tempFilePath.match(/\.([^.]+)$/);
           if (match && match[1]) {
             fileExtension = match[1];
           }
         } catch (err) {
           console.log('提取文件扩展名失败，使用默认png', err);
         }
         wx.cloud.uploadFile({
           cloudPath: `user-avatars/${userId}.${fileExtension}`,  // 使用用户ID作为文件名，添加文件扩展名
          filePath: tempFilePath,
          success: res => {
            // 获取云文件ID
            const fileID = res.fileID;
            console.log('头像上传成功', fileID);
            
            // 如果用户已经在数据库中，更新数据库中的头像
            if (this.data.userInfo._id) {
              const db = wx.cloud.database();
              db.collection('users').doc(this.data.userInfo._id).update({
                data: {
                  avatarUrl: fileID
                }
              }).then(() => {
                console.log('数据库头像更新成功');
              }).catch(err => {
                console.error('数据库头像更新失败', err);
              });
            }
            
            // 更新本地用户信息
            const userInfo = { ...this.data.userInfo, avatarUrl: fileID };
            this.setData({ userInfo });
            wx.setStorageSync('userInfo', userInfo);
            
            wx.hideLoading();
            wx.showToast({
              title: '头像更新成功',
              icon: 'success'
            });
          },
          fail: err => {
            console.error('头像上传失败', err);
            wx.hideLoading();
            wx.showToast({
              title: '上传失败，请重试',
              icon: 'none'
            });
          }
        });
      },
      fail: err => {
        console.log('选择图片失败', err);
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

  onNicknameVisibleChange(e) {
    if (!e.detail.visible) {
      this.setData({
        showNickname: false
      });
    }
  },

  onNicknameChange(e) {
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

  onContactVisibleChange(e) {
    if (!e.detail.visible) {
      this.setData({
        showContact: false
      });
    }
  },

  onContactChange(e) {
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

  onVerifyVisibleChange(e) {
    if (!e.detail.visible) {
      this.setData({
        showVerify: false
      });
    }
  },

  onVerifyNameChange(e) {
    this.setData({
      'verifyForm.name': e.detail.value
    });
  },

  onVerifyStudentIdChange(e) {
    this.setData({
      'verifyForm.studentId': e.detail.value
    });
  },

  onVerifyCollegeChange(e) {
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
          // 清除本地缓存
          wx.clearStorageSync();
          
          // 更新页面状态
          this.setData({
            userInfo: {
              nickName: '',
              avatarUrl: '',
              contact: '',
              isVerified: false
            }
          });
          
          wx.showToast({
            title: '缓存已清除',
            icon: 'success'
          });
        }
      }
    });
  },
  
  // 关于我们
  showAbout() {
    wx.showModal({
      title: '关于我们',
      content: 'BNBU闲置小市场是北师香港浸会大学校内的二手交易平台，旨在为学生提供便捷、安全的校内二手物品交易服务。',
      showCancel: false
    });
  },
  
  // 用户协议
  showAgreement() {
    wx.showModal({
      title: '用户协议',
      content: '本协议内容为校内二手交易平台的用户使用条款，使用本平台即表示您已同意本协议的全部内容。',
      showCancel: false
    });
  },
  
  // 隐私政策
  showPrivacy() {
    wx.showModal({
      title: '隐私政策',
      content: '我们重视您的隐私保护，使用本平台所产生的信息将按照相关法律法规进行保护和合理使用。',
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
          // 清除用户信息
          wx.removeStorageSync('userInfo');
          
          // 更新页面状态
          this.setData({
            userInfo: {
              nickName: '',
              avatarUrl: '',
              contact: '',
              isVerified: false
            }
          });
          
          // 返回到我的页面
          wx.switchTab({
            url: '/pages/my/my'
          });
        }
      }
    });
  },
  
  // 显示提示信息
  showToast(title) {
    wx.showToast({
      title,
      icon: 'none'
    });
  }
}) 