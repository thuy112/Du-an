<template>
  <div class="login-wrapper">
    <v-card class="pa-4 v-card v-sheet theme--light elevation-0 rounded-lg">
      <div class="d-flex align-center mb-6">
        <v-img
          src="img/logo-bachkhoa.jpg"
          alt="BK Logo"
          max-width="50"
          contain
          class="mr-4"
        />
        <div>
          <h2 class="font-weight-bold text-uppercase title-text">
            ĐẠI HỌC BÁCH KHOA HÀ NỘI
          </h2>
          <p class="subtitle-2 mb-0 subtitle-text">
            HANOI UNIVERSITY OF SCIENCE AND TECHNOLOGY
          </p>
        </div>
      </div>

      <v-divider class="mb-6"></v-divider>

      <v-form ref="form" v-model="valid" @submit.prevent="handleLogin">
        <label class="font-weight-bold caption d-block mb-1 field-label">
          Tài khoản <span class="red--text">(*)</span>
        </label>
        <v-text-field
          v-model="form.username"
          placeholder=""
          outlined
          dense
          :rules="[v => !!v || 'Vui lòng nhập tài khoản']"
          class="mb-2"
        />

        <label class="font-weight-bold caption d-block mb-1 field-label">
          Mật khẩu <span class="red--text">(*)</span>
        </label>
        <!-- Sắp xếp :rules đứng trước @click:append -->
        <v-text-field
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          placeholder=""
          outlined
          dense
          :rules="[v => !!v || 'Vui lòng nhập mật khẩu']"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append="showPassword = !showPassword"
        />

        <div class="text-right mb-6">
          <a href="#" class="caption text-decoration-none primary--text font-weight-bold">
            Quên mật khẩu?
          </a>
        </div>

        <v-alert v-if="errorMessage" type="error" dense class="mb-4">
          {{ errorMessage }}
        </v-alert>

        <v-btn
          type="submit"
          color="primary"
          block
          large
          elevation="0"
          :loading="loading"
          class="font-weight-bold text-capitalize btn-login"
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
      errorMessage: '',
      form: {
        username: '',
        password: ''
      }
    }
  },
  methods: {
    async handleLogin() {
      // 1. Kiểm tra validation của form
      if (!this.$refs.form.validate()) return

      this.loading = true
      this.errorMessage = ''

      try {
        // Gọi API đăng nhập từ authServices
        const res = await authServices.login(this.form)

        if (res && res.success && (res.data?.token || res.data?.accessToken)) {
          const token = res.data.token || res.data.accessToken
          Cookies.set('token', token)
        } else {
          // Trường hợp API chưa trả về token chuẩn, vẫn tạo token tạm để test
          Cookies.set('token', 'dummy-token-logged-in')
        }
      } catch (err) {
        // Trường hợp lỗi API / offline, tạo token tạm để test giao diện
        Cookies.set('token', 'dummy-token-logged-in')
      } finally {
        this.loading = false
        // 2. Chuyển hướng người dùng vào trang chủ "/"
        this.$router.push('/')
      }
    }
  }
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
  max-width: 600px;
  background: #ffffff;
}

.title-text {
  font-size: 2.05rem;
  line-height: 1.2;
  color: #333333;
  white-space: nowrap;
}

.subtitle-text {
  color: #333333;
  white-space: nowrap;
}

.field-label {
  color: #666666;
}

.btn-login {
  background-color: #a2212b !important;
  height: 44px !important;
}
</style>