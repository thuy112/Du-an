<template>
  <div class="login-wrapper">
    <v-card class="pa-6 login-card elevation-2 rounded-lg">
      <div class="d-flex align-center mb-6">
        <v-img
          src="/img/Logo-DH-Bach-Khoa-HN-HUST-anh-bia-01.jpg"
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

      <h3 class="text-h6 font-weight-bold mb-2">Quên mật khẩu</h3>
      <p class="caption grey--text text--darken-1 mb-4">
        Nhập email đã đăng ký tài khoản để nhận liên kết đặt lại mật khẩu.
      </p>

      <v-form ref="form" v-model="valid" @submit.prevent="handleForgotPassword">
        <label class="font-weight-bold caption d-block mb-1 field-label">
          Email / Tài khoản <span class="red--text">(*)</span>
        </label>
        <v-text-field
          v-model="email"
          placeholder="Nhập email tài khoản"
          outlined
          dense
          :rules="[
            v => !!v || 'Vui lòng nhập email',
            v => /.+@.+\..+/.test(v) || 'Email không hợp lệ'
          ]"
          class="mb-2"
        />

        <v-alert v-if="message" :type="isSuccess ? 'success' : 'error'" dense class="mb-4">
          {{ message }}
        </v-alert>

        <v-btn
          type="submit"
          color="#a2212b"
          dark
          block
          large
          elevation="0"
          :loading="loading"
          class="font-weight-bold text-capitalize mb-3"
        >
          Gửi yêu cầu
        </v-btn>

        <div class="text-center">
          <nuxt-link to="/dang-nhap" class="caption text-decoration-none primary--text font-weight-bold">
            <v-icon x-small color="#a2212b">mdi-arrow-left</v-icon> Quay lại đăng nhập
          </nuxt-link>
        </div>
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
          this.message = 'Yêu cầu đã được gửi! Vui lòng kiểm tra email của bạn.'
        } else {
          this.isSuccess = false
          this.message = res.message || 'Email không tồn tại trong hệ thống!'
        }
      } catch (err) {
        this.loading = false
        this.isSuccess = true
        this.message = 'Đã gửi yêu cầu đặt lại mật khẩu tới email!'
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
  max-width: 480px;
  background: #ffffff;
}
.title-text {
  font-size: 1.05rem;
  line-height: 1.2;
}
</style>