<template>
  <div class="login-wrapper">
    <v-card class="pa-8 login-card elevation-2 rounded-lg">
      <!-- Header với logo trái, chữ phải -->
      <div class="brand-header mb-6">
        <v-img
          src="img/logo-bachkhoa.jpg"
          alt="BK Logo"
          max-width="50"
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

      <!-- Tiêu đề & mô tả -->
      <div class="text-center mb-6 header-form-block">
        <h3 class="text-h6 font-weight-bold grey--text text--darken-3">
          Lấy lại mật khẩu
        </h3>
        <p class="caption grey--text text--darken-1 mb-0 desc-text">
          Nhập Email đăng ký để chúng tôi giúp bạn lấy lại mật khẩu
        </p>
      </div>

      <v-divider class="mb-6"></v-divider>

      <!-- Form nhập Email -->
      <v-form ref="form" v-model="valid" @submit.prevent="handleForgotPassword">
        <label class="caption font-weight-bold grey--text text--darken-1 d-block mb-1">
          Email (*)
        </label>
        <v-text-field
          v-model="email"
          outlined
          dense
          hide-details="auto"
          :rules="[
            v => !!v || 'Vui lòng nhập email',
            v => /.+@.+\..+/.test(v) || 'Email không hợp lệ'
          ]"
          class="mb-6 custom-input"
        />

        <v-alert v-if="message" :type="isSuccess ? 'success' : 'error'" dense class="mb-4">
          {{ message }}
        </v-alert>

        <!-- Nút Gửi Mã -->
        <v-btn
          type="submit"
          block
          large
          elevation="0"
          :loading="loading"
          class="font-weight-bold text-capitalize mb-3 btn-send"
        >
          Gửi Mã
        </v-btn>

        <!-- Nút Quay Lại Đăng Nhập đã cập nhật sự kiện chuyển hướng -->
        <v-btn
          block
          large
          elevation="0"
          class="font-weight-bold text-capitalize btn-back white--text"
          @click="$router.push('/dang-nhap')"
        >
          Quay Lại Đăng Nhập
        </v-btn>
      </v-form>
    </v-card>
  </div>
</template>

<script>
import authServices from '~/services/authServices'

export default {
  name: 'ForgotPasswordPage',
  layout: 'blank',
  data() {
    return {
      valid: true,
      email: '',
      loading: false,
      message: '',
      isSuccess: false
    }
  },
  methods: {
    async handleForgotPassword() {
      if (!this.$refs.form.validate()) return

      this.loading = true
      this.message = ''

      try {
        const res = await authServices.forgotPassword({ email: this.email })
        this.loading = false

        if (res && res.success) {
          this.isSuccess = true
          this.message = 'Mã xác thực đã được gửi về email của bạn!'
        } else {
          this.isSuccess = false
          this.message = res.message || 'Email không tồn tại trong hệ thống!'
        }
      } catch (err) {
        this.loading = false
        this.isSuccess = true
        this.message = 'Mã xác thực đã được gửi về email của bạn!'
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
  font-size: 1.2rem;
  letter-spacing: 0.2px;
  color: #2c3e50;
  margin: 0;
  line-height: 1.2;
  width: 100%;
}

.subtitle-text {
  font-size: 0.75rem !important;
  margin: 0;
  line-height: 1.2;
  width: 100%;
}

.header-form-block {
  margin-top: -2px;
}

.header-form-block h3 {
  margin-bottom: 2px;
}

.desc-text {
  max-width: 300px;
  margin: 0 auto;
  line-height: 1.4;
}

.custom-input >>> .v-input__control {
  background-color: #ffffff;
}

.btn-send {
  background-color: #a2212b !important;
  color: #ffffff !important;
  height: 42px !important;
  border-radius: 6px;
}

.btn-back {
  background-color: #fca397 !important;
  color: #ffffff !important;
  height: 42px !important;
  border-radius: 6px;
}
</style>