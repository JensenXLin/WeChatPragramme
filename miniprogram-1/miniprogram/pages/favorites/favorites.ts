// pages/favorites/favorites.ts
Page({
  data: {
    favoriteProducts: [] as any[]
  },

  onLoad() {
    this.loadFavoriteProducts();
  },
  
  onShow() {
    // 每次页面显示时重新加载
    this.loadFavoriteProducts();
  },

  loadFavoriteProducts() {
    // 模拟加载收藏商品
    const favorites = wx.getStorageSync('favorites') || [];
    
    // 模拟数据，实际项目中应该从服务器获取
    const allProducts = [
      {
        id: '1',
        title: 'iPhone 13 Pro 256G 深空灰色 99新',
        price: 4999,
        category: '数码',
        imgList: ['https://via.placeholder.com/300x200/eef/text=iPhone'],
        createTime: '2023-05-20'
      },
      {
        id: '2',
        title: '高等数学 第七版 同济大学 带笔记',
        price: 20,
        category: '书籍',
        imgList: ['https://via.placeholder.com/300x200/fee/text=书籍'],
        createTime: '2023-05-18'
      },
      {
        id: '3',
        title: 'Beats Solo3 无线耳机 红色 9成新',
        price: 799,
        category: '数码',
        imgList: ['https://via.placeholder.com/300x200/efe/text=耳机'],
        createTime: '2023-05-15'
      }
    ];
    
    // 筛选出收藏的商品
    const favoriteProducts = allProducts.filter(product => favorites.includes(product.id));
    
    this.setData({ favoriteProducts });
  },

  onProductTap(e: any) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  onFavoriteTap(e: any) {
    const id = e.currentTarget.dataset.id;
    let favorites = wx.getStorageSync('favorites') || [];
    
    // 从收藏中移除
    favorites = favorites.filter((item: string) => item !== id);
    wx.setStorageSync('favorites', favorites);
    
    // 从列表中移除
    const favoriteProducts = this.data.favoriteProducts.filter(item => item.id !== id);
    this.setData({ favoriteProducts });
    
    wx.showToast({
      title: '已取消收藏',
      icon: 'none'
    });
  },

  navigateToHome() {
    wx.switchTab({
      url: '/pages/home/home'
    });
  }
}); 