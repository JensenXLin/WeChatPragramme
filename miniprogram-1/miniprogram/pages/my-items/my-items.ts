// pages/my-items/my-items.ts
Page({
  data: {
    myProducts: [] as any[],
    showActions: false,
    selectedProduct: {
      id: '',
      status: ''
    }
  },

  onLoad() {
    this.loadMyProducts();
  },
  
  onShow() {
    // 每次页面显示时重新加载
    this.loadMyProducts();
  },

  loadMyProducts() {
    // 模拟加载我发布的商品
    // 实际项目中应该从服务器获取
    const myProducts = [
      {
        id: '101',
        title: 'iPhone 13 Pro 256G 深空灰色 99新',
        price: 4999,
        category: '数码',
        imgList: ['https://via.placeholder.com/300x200/eef/text=iPhone'],
        createTime: '2023-05-20',
        status: '在售中'
      },
      {
        id: '102',
        title: '捷安特自行车 学生款 轻便通勤',
        price: 350,
        category: '其他',
        imgList: ['https://via.placeholder.com/300x200/eef/text=自行车'],
        createTime: '2023-05-15',
        status: '已售出'
      },
      {
        id: '103',
        title: 'Nike卫衣 L码 黑色 全新带吊牌',
        price: 199,
        category: '服装',
        imgList: ['https://via.placeholder.com/300x200/fef/text=衣服'],
        createTime: '2023-05-10',
        status: '在售中'
      }
    ];
    
    // 保存到本地存储，方便其他页面使用
    wx.setStorageSync('myItems', myProducts.map(item => item.id));
    
    this.setData({ myProducts });
  },

  onProductTap(e: any) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  onActionTap(e: any) {
    const id = e.currentTarget.dataset.id;
    const product = this.data.myProducts.find(item => item.id === id);
    
    if (product) {
      this.setData({
        showActions: true,
        selectedProduct: {
          id: product.id,
          status: product.status
        }
      });
    }
  },

  onActionsVisibleChange(e: any) {
    if (!e.detail.visible) {
      this.setData({
        showActions: false
      });
    }
  },

  closeActions() {
    this.setData({
      showActions: false
    });
  },

  onEditTap() {
    const { id } = this.data.selectedProduct;
    this.setData({ showActions: false });
    
    wx.navigateTo({
      url: `/pages/publish/publish?id=${id}&edit=true`
    });
  },

  onStatusTap() {
    const { id, status } = this.data.selectedProduct;
    const myProducts = [...this.data.myProducts];
    const index = myProducts.findIndex(item => item.id === id);
    
    if (index !== -1) {
      const newStatus = status === '已售出' ? '在售中' : '已售出';
      myProducts[index].status = newStatus;
      
      this.setData({
        myProducts,
        showActions: false
      });
      
      wx.showToast({
        title: newStatus === '已售出' ? '已标记为售出' : '已重新上架',
        icon: 'none'
      });
    }
  },

  onDeleteTap() {
    const { id } = this.data.selectedProduct;
    
    wx.showModal({
      title: '提示',
      content: '确定要删除该商品吗？',
      success: (res) => {
        if (res.confirm) {
          const myProducts = this.data.myProducts.filter(item => item.id !== id);
          
          this.setData({
            myProducts,
            showActions: false
          });
          
          // 更新本地存储
          wx.setStorageSync('myItems', myProducts.map(item => item.id));
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  navigateToPublish() {
    wx.switchTab({
      url: '/pages/publish/publish'
    });
  }
}); 