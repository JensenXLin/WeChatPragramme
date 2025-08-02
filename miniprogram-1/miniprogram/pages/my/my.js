// pages/my/my.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {
      nickName: '',
      avatarUrl: '',
      contact: '',
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 确保云环境初始化
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      if (!wx.cloud.inited) {
        wx.cloud.init({
          env: 'cloud1-3gfprocj60a4436d',
          traceUser: true,
        });
        console.log('my页面云环境初始化完成');
      }
    }
    
    this.loadUserInfo();
    this.checkUpdates();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.loadUserInfo();
    this.checkUpdates();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

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
  },

  // 简化版登录
  handleLogin() {
    console.log('handleLogin 方法被调用');
    wx.showLoading({
      title: '登录中',
    });
    
    // 先初始化云环境，确保可以调用云API
    try {
      if (!wx.cloud) {
        throw new Error('当前环境不支持云能力');
      }
      
      if (!wx.cloud.inited) {
        wx.cloud.init({
          env: 'cloud1-3gfprocj60a4436d',
          traceUser: true,
        });
        console.log('登录前云环境初始化完成');
      }
    } catch (err) {
      console.error('云环境初始化失败', err);
      // 初始化失败时，直接使用本地登录方式
      this.getUserProfileOnly();
      return;
    }

    // 获取用户信息
    this.getUserProfileOnly();
  },
  
  // 仅获取用户信息
  getUserProfileOnly() {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        const userInfo = res.userInfo;
        console.log('获取到的用户信息', userInfo);
        
        // 尝试调用云函数
        this.tryCallCloudFunction(userInfo);
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
  
  // 尝试调用云函数
  tryCallCloudFunction(userInfo) {
    try {
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: (result) => {
          console.log('云函数调用成功', result);
          if (result && result.result && result.result.openid) {
            const openid = result.result.openid;
            // 将用户信息保存到云数据库
            this.saveUserToDatabase(openid, userInfo);
          } else {
            console.error('获取openid失败', result);
            this.localLoginFallback(userInfo);
          }
        },
        fail: (err) => {
          console.error('云函数调用失败', err);
          // 云函数失败时使用本地登录作为备选方案
          this.localLoginFallback(userInfo);
        }
      });
    } catch (err) {
      console.error('云函数调用异常', err);
      this.localLoginFallback(userInfo);
    }
  },
  
  // 保存用户到数据库
  saveUserToDatabase(openid, userInfo) {
    const db = wx.cloud.database();
    
    // 查询用户是否已存在
    db.collection('users').where({
      _openid: openid
    }).get().then(res => {
      if (res.data.length > 0) {
        // 用户已存在，更新用户信息
        const userData = res.data[0];
        
        db.collection('users').doc(userData._id).update({
          data: {
            nickName: userInfo.nickName,
            avatarUrl: userInfo.avatarUrl,
            gender: userInfo.gender,
            country: userInfo.country || '',
            province: userInfo.province || '',
            city: userInfo.city || '',
            lastLoginTime: db.serverDate()
          }
        }).then(() => {
          console.log('用户信息更新成功');
          this.loginSuccess({...userData, ...userInfo});
        }).catch(err => {
          console.error('更新用户信息失败', err);
          this.loginSuccess({...userData, ...userInfo});
        });
      } else {
        // 用户不存在，创建新用户
        db.collection('users').add({
          data: {
            nickName: userInfo.nickName,
            avatarUrl: userInfo.avatarUrl,
            gender: userInfo.gender,
            country: userInfo.country || '',
            province: userInfo.province || '',
            city: userInfo.city || '',
            createTime: db.serverDate(),
            lastLoginTime: db.serverDate(),
            favorites: [],
            contact: '',
            isVerified: false
          }
        }).then(res => {
          console.log('新用户创建成功', res);
          this.loginSuccess({
            _id: res._id,
            _openid: openid,
            ...userInfo,
            isVerified: false
          });
        }).catch(err => {
          console.error('添加用户失败', err);
          this.localLoginFallback(userInfo);
        });
      }
    }).catch(err => {
      console.error('查询用户失败', err);
      this.localLoginFallback(userInfo);
    });
  },
  
  // 本地登录备选方案
  localLoginFallback(userInfo) {
    console.log('使用本地登录备选方案');
    const userData = {
      nickName: userInfo.nickName,
      avatarUrl: userInfo.avatarUrl,
      gender: userInfo.gender,
      country: userInfo.country || '',
      province: userInfo.province || '',
      city: userInfo.city || '',
      contact: '',
      isVerified: false
    };
    
    this.loginSuccess(userData);
  },
  
  // 登录成功处理
  loginSuccess(userData) {
    // 保存用户信息到本地存储
    wx.setStorageSync('userInfo', userData);
    
    this.setData({
      userInfo: userData
    });
    
    wx.hideLoading();
    wx.showToast({
      title: '登录成功',
      icon: 'success'
    });
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

  navigateToFavorites() {
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
  }
})