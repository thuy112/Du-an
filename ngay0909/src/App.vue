<template>
  <div id="app">
    <h1>Ứng Dụng Quản Lý Sản Phẩm</h1>
    <p class="app-version">Phiên bản ứng dụng: {{ appVersion }}</p>

    <!-- 1. CustomInput (v-model & $refs) -->
    <div class="control-panel">
      <CustomInput ref="shopInput" v-model="shopName" />
      
      <div class="button-group">
        <button @click="focusShopInput">Focus tên cửa hàng ($refs)</button>
        <button @click="sendNotification">Thông báo sản phẩm (EventBus)</button>
      </div>
    </div>

    <hr />

    <!-- 2. ProductList + ProductCard (Scoped Slot & Named Slots) -->
    <ProductList :products="products">
      <template v-slot:default="slotProps">
        <ProductCard>
          <!-- Header Slot -->
          <template v-slot:header>
            <h2>{{ slotProps.product.name }}</h2>
          </template>

          <!-- Default Slot -->
          <div>
            <p><strong>Giá:</strong> {{ formatPrice(slotProps.product.price) }} VNĐ</p>
            <p><strong>Số lượng tồn kho:</strong> {{ slotProps.product.stock }} sản phẩm</p>
          </div>

          <!-- Footer Slot -->
          <template v-slot:footer>
            <button class="btn-buy" @click="buyProduct(slotProps.product)">
              Mua ngay
            </button>
          </template>
        </ProductCard>
      </template>
    </ProductList>
  </div>
</template>

<script>
import CustomInput from './components/CustomInput.vue'
import ProductList from './components/ProductList.vue'
import ProductCard from './components/ProductCard.vue'
import EventBus from './eventBus'

export default {
  name: 'App',
  components: {
    CustomInput,
    ProductList,
    ProductCard
  },
  data() {
    return {
      shopName: 'TechStore Việt Nam',
      // [MỚI] Dữ liệu $root
      appVersion: '2.0.0',
      products: [
        { id: 1, name: 'iPhone 15', price: 20000000, stock: 10 },
        { id: 2, name: 'Samsung S24', price: 18000000, stock: 8 },
        { id: 3, name: 'MacBook Air M2', price: 25000000, stock: 5 },
        { id: 4, name: 'AirPods Pro 2', price: 6000000, stock: 15 },
        { id: 5, name: 'iPad Air', price: 16000000, stock: 7 }
      ]
    }
  },
  provide() {
    return {
      shopName: this.shopName
    }
  },
  methods: {
    focusShopInput() {
      this.$refs.shopInput.focusInput()
    },
    sendNotification() {
      EventBus.$emit('notify-product', 'Sản phẩm đang được cập nhật!')
    },
    // [MỚI] Phương thức được gọi trực tiếp bởi ProductCard qua $root.logSystemInfo()
    logSystemInfo() {
      alert(`[ROOT LOG]: Hệ thống đang chạy phiên bản ${this.appVersion}`)
    },
    formatPrice(price) {
      return price.toLocaleString('vi-VN')
    },
    buyProduct(product) {
      if (product.stock > 0) {
        product.stock--
        alert(`Bạn đã mua ${product.name}!`)
      } else {
        alert('Sản phẩm đã hết hàng!')
      }
    }
  }
}
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
}
.app-version {
  font-size: 0.9rem;
  color: #888;
}
.control-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}
.button-group {
  display: flex;
  gap: 10px;
}
button {
  cursor: pointer;
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
}
button:hover {
  background-color: #45a049;
}
.btn-buy {
  background-color: #2196f3;
}
.btn-buy:hover {
  background-color: #1e88e5;
}
</style>