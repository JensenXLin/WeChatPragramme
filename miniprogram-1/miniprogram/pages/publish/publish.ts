// pages/publish/publish.ts
Page({
  data: {
    title: '',
    desc: '',
    price: '',
    category: '',
    categoryIndex: [0],
    contact: '',
    showContact: true, // 默认显示联系方式
    fileList: [] as any[],
    categories: [
      { label: '求购', value: '求购' },
      { label: '数码', value: '数码' },
      { label: '书籍', value: '书籍' },
      { label: '服装', value: '服装' },
      { label: '家居', value: '家居' },
      { label: '美妆', value: '美妆' },
      { label: '其他', value: '其他' }
    ],
    showPicker: false
  },

  onLoad() {
    // 获取用户信息，自动填充联系方式
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.contact) {
      this.setData({
        contact: userInfo.contact
      });
    }
  },

  onTitleChange(e: any) {
    this.setData({
      title: e.detail.value
    });
  },

  onDescChange(e: any) {
    this.setData({
      desc: e.detail.value
    });
  },

  onPriceChange(e: any) {
    this.setData({
      price: e.detail.value
    });
  },

  onShowContactChange(e: any) {
    this.setData({
      showContact: e.detail.value
    });
  },

  showCategoryPicker() {
    this.setData({
      showPicker: true
    });
  },

  onPickerVisibleChange(e: any) {
    if (!e.detail.visible) {
      this.setData({
        showPicker: false
      });
    }
  },

  onPickerCancel() {
    this.setData({
      showPicker: false
    });
  },

  onPickerConfirm() {
    const { categories, categoryIndex } = this.data;
    this.setData({
      category: categories[categoryIndex[0]].value,
      showPicker: false
    });
  },

  onCategoryChange(e: any) {
    this.setData({
      categoryIndex: e.detail.value
    });
  },

  onUploadSuccess(e: any) {
    const { files } = e.detail;
    this.setData({
      fileList: files
    });
  },

  onUploadRemove(e: any) {
    const { index } = e.detail;
    const { fileList } = this.data;
    fileList.splice(index, 1);
    this.setData({
      fileList
    });
  },

  onCancel() {
    wx.showModal({
      title: '提示',
      content: '确定放弃发布吗？',
      success: (res) => {
        if (res.confirm) {
          wx.switchTab({
            url: '/pages/home/home'
          });
        }
      }
    });
  },

  onPublish() {
    const { title, desc, price, category, contact, showContact, fileList } = this.data;
    
    // 表单验证
    if (!title.trim()) {
      this.showToast('请输入商品标题');
      return;
    }
    
    if (!desc.trim()) {
      this.showToast('请输入商品描述');
      return;
    }
    
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      this.showToast('请输入有效的价格');
      return;
    }
    
    if (!category) {
      this.showToast('请选择商品分类');
      return;
    }
    
    if (fileList.length === 0) {
      this.showToast('请上传至少一张商品图片');
      return;
    }
    
    // 如果选择显示联系方式但未设置微信号，则提示
    if (showContact && !contact) {
      this.showToast('您选择了显示联系方式，但未设置微信号，请在个人中心设置');
      return;
    }
    
    // 显示加载中
    wx.showLoading({
      title: '发布中',
      mask: true
    });
    
    // 准备发布数据
    const publishData = {
      title,
      desc,
      price,
      category,
      images: fileList,
      // 只有当showContact为true时才包含联系方式
      ...(showContact ? { contact } : {})
    };
    
    console.log('发布数据:', publishData);
    
    // 模拟发布请求
    setTimeout(() => {
      wx.hideLoading();
      
      wx.showToast({
        title: '发布成功',
        icon: 'success',
        duration: 2000
      });
      
      // 跳转到首页
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/home/home'
        });
      }, 1500);
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