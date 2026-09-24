<template>
  <div
    class="page-shell fill-height d-flex flex-column align-center justify-center text-center py-12"
  >
    <!-- Toast Thông báo "Đăng nhập thành công" màu xanh ở góc trên bên phải -->
    <v-snackbar
      v-model="snackbar.show"
      color="#4caf50"
      top
      right
      timeout="3000"
      elevation="4"
    >
      <div class="d-flex align-center white--text">
        <v-icon left color="white">mdi-check-circle</v-icon>
        <span class="font-weight-medium">{{ snackbar.text }}</span>
      </div>

      <template #action="{ attrs }">
        <v-btn
          icon
          small
          color="white"
          v-bind="attrs"
          @click="snackbar.show = false"
        >
          <v-icon small>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Hình ảnh Banner WELCOME -->
    <div class="welcome-banner mb-6">
      <img src="img/banner.jpg" alt="Welcome Banner" height="200" />
    </div>

    <!-- Dòng tiêu đề giới thiệu hệ thống -->
    <h2 class="text-h5 font-weight-bold system-title">
      Hệ thống quản trị học lại, thi lại, bảo vệ lại
    </h2>
  </div>
</template>

<script>
export default {
  name: 'IndexPage',
  data() {
    return {
      snackbar: {
        show: false,
        text: 'Đăng nhập thành công',
      },
    }
  },
  mounted() {
    // Nếu vừa đăng nhập thành công từ trang đăng nhập
    if (localStorage.getItem('login_success') === 'true') {
      this.snackbar.show = true
      localStorage.removeItem('login_success') // Xóa cờ sau khi hiển thị
    }
  },
}
</script>

<style scoped>
.page-shell {
  width: 100%;
  min-height: calc(100vh - 60px);
  background: #fff;
  border-radius: 0;
  border: none;
  box-shadow: none;
  padding: 0;
}

.welcome-banner {
  position: relative;
  display: inline-block;
  margin-top: 20px;
  background: transparent;
  padding: 0;
  border-radius: 0;
  box-shadow: none;
}

.welcome-banner img {
  display: block;
  max-width: 100%;
  height: auto;
  max-height: 220px;
  object-fit: contain;
  mix-blend-mode: multiply;
  opacity: 0.98;
}

.system-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 26px !important;
  font-weight: 700;
  color: #a2212b !important;
  letter-spacing: 0.2px;
  text-shadow: 0 2px 0 rgba(255, 255, 255, 0.9);
}
</style>
