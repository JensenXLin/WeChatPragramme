// pages/home/home.ts
Page({
  data: {
    searchValue: '',
    activeTab: 0,
    categories: ['全部', '求购', '数码', '书籍', '服装', '家居', '美妆', '其他'],
    productList: [] as any[],
    refreshing: false,
    loading: false,
    hasMore: true,
    pageNum: 1,
    pageSize: 10,
    banners: [
      {
        image: '/assets/icons/system.png',
        url: '/pages/events/campus-exchange'
      },
      {
        image: '/assets/icons/AD.png',
        url: '/pages/events/discount-season'
      }
    ],
    isLoggedIn: false,
    userInfo: null
  },

  onLoad() {
    // 初始化云环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'cloud1-3gfprocj60a4436d',
        traceUser: true,
      });
      
      // 检查用户是否已登录
      this.checkUserLogin();
    }
    
    this.loadProducts();
  },
  
  // 检查用户是否已登录
  checkUserLogin() {
    // 从本地存储获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    
    if (userInfo) {
      this.setData({
        isLoggedIn: true,
        userInfo: userInfo
      });
    } else {
      this.setData({
        isLoggedIn: false,
        userInfo: null
      });
    }
  },
  
  // 用户登录
  login() {
    wx.showLoading({
      title: '登录中',
    });

    // 直接使用微信登录，然后获取用户信息
    wx.login({
      success: () => {
        wx.getUserProfile({
          desc: '用于完善会员资料',
          success: (res) => {
            const userInfo = res.userInfo;
            console.log('获取到的用户信息：', userInfo);
            
            // 调用云函数获取openid并处理登录
            wx.cloud.callFunction({
              name: 'login',
              data: {},
              success: (result: any) => {
                console.log('云函数调用成功', result);
                const openid = result.result?.openid;
                
                if (openid) {
                  // 将用户信息和openid存入数据库
                  this.registerUser(openid, userInfo);
                } else {
                  console.error('获取openid失败');
                  wx.hideLoading();
                  wx.showToast({
                    title: '登录失败，请重试',
                    icon: 'none'
                  });
                }
              },
              fail: (err) => {
                console.error('云函数调用失败', err);
                wx.hideLoading();
                wx.showToast({
                  title: '登录失败，请重试',
                  icon: 'none'
                });
              }
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
      fail: (err) => {
        console.error('微信登录失败', err);
        wx.hideLoading();
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        });
      }
    });
  },
  
  // 注册用户
  registerUser(openid: string, userInfo: any) {
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
            country: userInfo.country,
            province: userInfo.province,
            city: userInfo.city,
            lastLoginTime: db.serverDate()
          }
        }).then(() => {
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
            country: userInfo.country,
            province: userInfo.province,
            city: userInfo.city,
            createTime: db.serverDate(),
            lastLoginTime: db.serverDate(),
            favorites: [],
            contact: ''
          }
        }).then(res => {
          this.loginSuccess({
            _id: res._id as string,
            _openid: openid,
            ...userInfo
          });
        }).catch(err => {
          console.error('添加用户失败', err);
          wx.hideLoading();
          wx.showToast({
            title: '注册失败，请重试',
            icon: 'none'
          });
        });
      }
    }).catch(err => {
      console.error('查询用户失败', err);
      wx.hideLoading();
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      });
    });
  },
  
  // 登录成功处理
  loginSuccess(userInfo: any) {
    // 保存用户信息到本地存储
    wx.setStorageSync('userInfo', userInfo);
    
    this.setData({
      isLoggedIn: true,
      userInfo: userInfo
    });
    
    wx.hideLoading();
    wx.showToast({
      title: '登录成功',
      icon: 'success'
    });
  },
  
  // 导航到个人中心
  navigateToMy() {
    wx.switchTab({
      url: '/pages/my/my'
    });
  },
  
  // 测试云函数
  testCloudFunction() {
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
  
  // 退出登录
  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储的用户信息
          wx.removeStorageSync('userInfo');
          
          this.setData({
            isLoggedIn: false,
            userInfo: null
          });
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  },

  onPullDownRefresh() {
    this.setData({ refreshing: true });
    this.refreshProducts();
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    this.loadMoreProducts();
  },

  onSearchChange(e: any) {
    this.setData({
      searchValue: e.detail.value
    });
  },

  onSearchSubmit() {
    this.refreshProducts();
  },

  onTabChange(e: any) {
    this.setData({
      activeTab: e.detail.value,
      productList: [],
      pageNum: 1,
      hasMore: true
    }, () => {
      this.loadProducts();
    });
  },

  onPulling() {
    // 下拉刷新控件被下拉
  },

  onRefresh() {
    this.refreshProducts();
  },

  onLoadMore() {
    if (!this.data.loading && this.data.hasMore) {
      this.loadMoreProducts();
    }
  },

  onProductTap(e: any) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  onFavoriteTap(e: any) {
    const id = e.currentTarget.dataset.id;
    const productList = this.data.productList;
    const index = productList.findIndex(item => item.id === id);
    
    if (index !== -1) {
      const isFavorite = !productList[index].isFavorite;
      productList[index].isFavorite = isFavorite;
      this.setData({ productList });
      
      // TODO: 调用收藏/取消收藏接口
      wx.showToast({
        title: isFavorite ? '已加入收藏' : '已取消收藏',
        icon: 'none'
      });
    }
  },
  
  onBannerTap(e: any) {
    const index = e.currentTarget.dataset.index;
    const banner = this.data.banners[index];
    
    if (banner && banner.url) {
      wx.navigateTo({
        url: banner.url,
        fail: () => {
          // 如果页面不存在，显示提示
          wx.showToast({
            title: '功能开发中，敬请期待',
            icon: 'none'
          });
        }
      });
    }
  },

  refreshProducts() {
    this.setData({
      pageNum: 1,
      hasMore: true,
      refreshing: true
    }, () => {
      this.loadProducts();
    });
  },

  loadMoreProducts() {
    if (this.data.loading || !this.data.hasMore) return;
    
    this.setData({
      pageNum: this.data.pageNum + 1
    }, () => {
      this.loadProducts(true);
    });
  },

  loadProducts(isLoadMore = false) {
    if (this.data.loading) return;
    
    this.setData({ loading: true });

    // 模拟API请求
    setTimeout(() => {
      const category = this.data.categories[this.data.activeTab];
      const newProducts = this.getMockProducts(category, this.data.pageNum, this.data.pageSize);
      
      this.setData({
        productList: isLoadMore ? [...this.data.productList, ...newProducts] : newProducts,
        loading: false,
        refreshing: false,
        hasMore: newProducts.length === this.data.pageSize
      });
    }, 1000);
  },

  getMockProducts(category: string, pageNum: number, pageSize: number) {
    // 模拟数据，实际项目中应该从服务器获取
    const allProducts = [
      {
        id: '1',
        title: 'iPhone 13 Pro 256G 深空灰色 99新',
        price: 4999,
        category: '数码',
        imgList: ['https://via.placeholder.com/300x200/eef/text=iPhone'],
        isFavorite: false
      },
      {
        id: '2',
        title: '高等数学 第七版 同济大学 带笔记',
        price: 20,
        category: '书籍',
        imgList: ['https://via.placeholder.com/300x200/fee/text=书籍'],
        isFavorite: true
      },
      {
        id: '3',
        title: 'Beats Solo3 无线耳机 红色 9成新',
        price: 799,
        category: '数码',
        imgList: ['https://via.placeholder.com/300x200/efe/text=耳机'],
        isFavorite: false
      },
      {
        id: '4',
        title: '捷安特自行车 学生款 轻便通勤',
        price: 350,
        category: '其他',
        imgList: ['https://via.placeholder.com/300x200/eef/text=自行车'],
        isFavorite: false
      },
      {
        id: '5',
        title: 'LED护眼台灯 可调光 USB充电',
        price: 45,
        category: '家居',
        imgList: ['https://via.placeholder.com/300x200/ffe/text=台灯'],
        isFavorite: false
      },
      {
        id: '6',
        title: 'Nike卫衣 L码 黑色 全新带吊牌',
        price: 199,
        category: '服装',
        imgList: ['https://via.placeholder.com/300x200/fef/text=衣服'],
        isFavorite: false
      },
      {
        id: '7',
        title: '求购：iPad Pro 2021款 11寸 256G',
        price: 3000,
        category: '求购',
        imgList: ['https://via.placeholder.com/300x200/ffd/text=求购'],
        isFavorite: false
      }
    ];

    // 根据分类筛选
    let filteredProducts = category === '全部' 
      ? allProducts 
      : allProducts.filter(p => p.category === category);
    
    // 根据搜索关键词筛选
    if (this.data.searchValue) {
      const keyword = this.data.searchValue.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.title.toLowerCase().includes(keyword) || 
        p.category.toLowerCase().includes(keyword)
      );
    }
    
    // 分页
    const start = (pageNum - 1) * pageSize;
    const end = start + pageSize;
    
    return filteredProducts.slice(start, end);
  }
});