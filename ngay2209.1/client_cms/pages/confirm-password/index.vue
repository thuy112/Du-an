<template>
  <div class="login-wrapper">
    <v-card class="pa-6 login-card elevation-2 rounded-lg">
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

      <h3 class="text-h6 font-weight-bold mb-4">Xác nhận mật khẩu mới</h3>

      <v-form
        ref="form"
        v-model="valid"
        @submit.prevent="handleConfirmPassword"
      >
        <label class="font-weight-bold caption d-block mb-1">
          Mật khẩu mới <span class="red--text">(*)</span>
        </label>
        <v-text-field
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Nhập mật khẩu mới"
          outlined
          dense
          :rules="[(v) => !!v || 'Vui lòng nhập mật khẩu mới']"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          class="mb-2"
          @click:append="showPassword = !showPassword"
        />

        <label class="font-weight-bold caption d-block mb-1">
          Xác nhận mật khẩu mới <span class="red--text">(*)</span>
        </label>
        <v-text-field
          v-model="confirmPassword"
          :type="showConfirm ? 'text' : 'password'"
          placeholder="Nhập lại mật khẩu mới"
          outlined
          dense
          :rules="[
            (v) => !!v || 'Vui lòng xác nhận mật khẩu',
            (v) => v === password || 'Mật khẩu xác nhận không khớp',
          ]"
          :append-icon="showConfirm ? 'mdi-eye' : 'mdi-eye-off'"
          class="mb-4"
          @click:append="showConfirm = !showConfirm"
        />

        <v-alert v-if="message" type="error" dense class="mb-4">
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
          class="font-weight-bold text-capitalize"
        >
          Xác nhận
        </v-btn>
      </v-form>
    </v-card>
  </div>
</template>

<script>
import authServices from '~/services/authServices'

export default {
  name: 'ConfirmPasswordPage',
  layout: 'blank',
  data() {
    return {
      valid: true,
      password: '',
      confirmPassword: '',
      showPassword: false,
      showConfirm: false,
      loading: false,
      message: '',
    }
  },
  methods: {
    async handleConfirmPassword() {
      if (!this.$refs.form.validate()) return

      this.loading = true
      this.message = ''

      try {
        const token = this.$route.query.token || ''
        const res = await authServices.confirmPassword({
          token,
          password: this.password,
        })

        this.loading = false

        if (res && res.success) {
          alert('Đặt lại mật khẩu thành công!')
          this.$router.push('/dang-nhap')
        } else {
          this.message =
            res.message ||
            'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn!'
        }
      } catch (err) {
        this.loading = false
        alert('Đặt lại mật khẩu thành công!')
        this.$router.push('/dang-nhap')
      }
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
  max-width: 480px;
  background: #ffffff;
}
.title-text {
  font-size: 1.05rem;
  line-height: 1.2;
}
</style>
