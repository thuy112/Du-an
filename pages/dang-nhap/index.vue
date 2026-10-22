<template>
  <div class="login-wrapper">
    <!-- Snackbar thông báo Toast ở góc trên bên phải -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      top
      right
      timeout="3000"
      elevation="4"
    >
      <div class="d-flex align-center white--text">
        <v-icon left color="white">
          {{
            snackbar.color === '#ffb100'
              ? 'mdi-alert-circle'
              : 'mdi-check-circle'
          }}
        </v-icon>
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

    <v-card class="pa-6 login-card elevation-2 rounded-lg">
      <!-- Header Logo & Tiêu đề -->
      <div class="brand-header mb-6">
        <v-img
          src="/img/logo-bachkhoa.jpg"
          alt="BK Logo"
          max-width="52"
          contain
          class="brand-logo"
        />
        <div class="brand-text">
          <h2 class="font-weight-bold text-uppercase title-text">
            ĐẠI HỌC BÁCH KHOA HÀ NỘI
          </h2>
          <p class="caption mb-0 subtitle-text grey--text text--darken-2">
            HANOI UNIVERSITY OF SCIENCE AND TECHNOLOGY
          </p>
        </div>
      </div>

      <v-divider class="mb-6"></v-divider>

      <!-- Form Đăng Nhập -->
      <v-form ref="form" v-model="valid" @submit.prevent="handleLogin">
        <label
          class="caption font-weight-bold grey--text text--darken-1 d-block mb-1"
        >
          Tài khoản <span class="red--text">(*)</span>
        </label>
        <v-text-field
          v-model="form.username"
          outlined
          dense
          hide-details="auto"
          :disabled="loading"
          :rules="[(v) => !!v || 'Vui lòng nhập tài khoản']"
          class="mb-3"
        />

        <label
          class="caption font-weight-bold grey--text text--darken-1 d-block mb-1"
        >
          Mật khẩu <span class="red--text">(*)</span>
        </label>
        <v-text-field
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          outlined
          dense
          hide-details="auto"
          :disabled="loading"
          :rules="[(v) => !!v || 'Vui lòng nhập mật khẩu']"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          class="mb-2"
          @click:append="showPassword = !showPassword"
        />

        <div class="text-right mb-6">
          <nuxt-link
            to="/quen-mat-khau"
            class="caption text-decoration-none primary--text font-weight-bold"
          >
            Quên mật khẩu?
          </nuxt-link>
        </div>

        <v-btn
          type="submit"
          block
          large
          elevation="0"
          :loading="loading"
          :disabled="loading"
          class="font-weight-bold text-capitalize btn-login white--text"
        >
          Đăng Nhập
        </v-btn>
      </v-form>
    </v-card>
  </div>
</template>

<script>
import Cookies from 'js-cookie'
import authServices from '~/services/authServices'

export default {
  name: 'LoginPage',
  layout: 'blank',
  data() {
    return {
      valid: true,
      showPassword: false,
      loading: false,
      form: {
        username: '',
        password: '',
      },
      snackbar: {
        show: false,
        text: '',
        color: '#ffb100',
      },
    }
  },
  mounted() {
    if (localStorage.getItem('logout_success') === 'true') {
      this.showNotification('Đăng xuất thành công', '#4caf50')
      localStorage.removeItem('logout_success')
    }
  },
  methods: {
    async handleLogin() {
      if (!this.form.username || !this.form.password) {
        this.showNotification('Vui lòng nhập đầy đủ tài khoản và mật khẩu', '#ffb100')
        return
      }

      this.loading = true

      try {
        const response = await authServices.login(this.form)
        
        // In ra console toàn bộ object trả về để kiểm tra
        console.log('API Login Response:', response)

        // Hứng dữ liệu an toàn dù response nằm ở cấp độ nào (res hoặc res.data)
        const result = response?.data || response

        // Lấy token từ các trường hợp có thể xảy ra
        const token =
          result?.token ||
          result?.accessToken ||
          result?.access_token ||
          result?.data?.token ||
          result?.data?.accessToken

        if (token) {
          const userData = result?.user || result?.data?.user || result
          this.saveAuthAndRedirect(token, userData)
          return
        }

        // Nếu không tìm thấy token, hiển thị thông báo lỗi từ server trả về
        this.showNotification(
          result?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.',
          '#ffb100'
        )
      } catch (err) {
        console.error('Lỗi kết nối khi đăng nhập:', err)
        this.showNotification('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.', '#ff5252')
      } finally {
        this.loading = false
      }
    },

    saveAuthAndRedirect(token, user) {
      // Gán Cookie lưu token chuẩn
      const cookieOptions = { expires: 7, path: '/', sameSite: 'Lax' }
      Cookies.set('token', token, cookieOptions)
      Cookies.set('auth_token', token, cookieOptions)

      const userInfo = user || {
        fullName: this.form.username,
        username: this.form.username,
        email: `${this.form.username}@hust.edu.vn`,
      }

      localStorage.setItem('user_info', JSON.stringify(userInfo))
      localStorage.setItem('login_success', 'true')
      sessionStorage.setItem('is_logged_in', 'true')

      // Chuyển hướng về trang chủ
      window.location.href = '/'
    },

    showNotification(text, color) {
      this.snackbar.text = text
      this.snackbar.color = color
      this.snackbar.show = true
    },
  },
}
</script>

<style scoped>
.login-wrapper {
  background-color: #dce7f7;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 100%;
  max-width: 440px;
  background: #ffffff;
}

.brand-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: left;
}

.brand-logo {
  flex-shrink: 0;
}

.brand-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.title-text {
  font-size: 0.95rem;
  letter-spacing: 0.2px;
  color: #2c3e50;
  margin: 0;
}

.subtitle-text {
  font-size: 0.68rem !important;
  margin: 0;
}

.btn-login {
  background-color: #a2212b !important;
  height: 42px !important;
  border-radius: 6px;
}
</style>