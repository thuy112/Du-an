<template>
  <v-container fluid class="pa-6">
    <!-- Card chính chứa nội dung thông tin người dùng -->
    <v-card class="rounded-lg pa-6 elevation-1 bg-white">
      <h1 class="text-h5 font-weight-bold grey--text text--darken-3 mb-6">
        Thông tin người dùng
      </h1>

      <!-- Banner đỏ hiển thị Avatar, Tên và Email -->
      <v-card
        flat
        class="d-flex align-center pa-4 mb-6 rounded-lg user-banner"
      >
        <v-avatar color="white" size="64" class="mr-4">
          <v-icon size="48" color="black">mdi-account-circle</v-icon>
        </v-avatar>
        <div class="white--text">
          <div class="text-h6 font-weight-bold leading-tight">
            {{ userInfo.fullName || 'Admin' }}
          </div>
          <div class="body-2 text-subtitle-2 opacity-90">
            {{ userInfo.email || 'admin@gmail.com' }}
          </div>
        </div>
      </v-card>

      <!-- Phần Thông tin cá nhân -->
      <div class="d-flex justify-space-between align-center mb-3">
        <span class="text-subtitle-1 font-weight-bold grey--text text--darken-3">
          Thông tin cá nhân
        </span>
        <v-btn
          text
          small
          color="#a2212b"
          class="text-capitalize font-weight-bold px-0"
          @click="openEditModal"
        >
          Chỉnh Sửa
          <v-icon x-small class="ml-1">mdi-pencil</v-icon>
        </v-btn>
      </div>

      <v-row dense class="mb-4 body-2">
        <v-col cols="12" class="py-1">
          <span class="grey--text text--darken-1 mr-2">Họ tên:</span>
          <span class="font-weight-bold grey--text text--darken-3">
            {{ userInfo.fullName || 'Admin' }}
          </span>
        </v-col>

        <v-col cols="12" class="py-1">
          <span class="grey--text text--darken-1 mr-2">Số điện thoại:</span>
          <span class="font-weight-bold red--text text--darken-2">
            {{ userInfo.phone || '0999999999' }}
          </span>
        </v-col>

        <v-col cols="12" class="py-1">
          <span class="grey--text text--darken-1 mr-2">Email:</span>
          <span class="font-weight-bold red--text text--darken-2">
            {{ userInfo.email || 'admin@gmail.com' }}
          </span>
        </v-col>

        <v-col cols="12" class="py-1">
          <span class="grey--text text--darken-1 mr-2">Chức vụ:</span>
          <span class="grey--text text--darken-3">
            {{ userInfo.role || 'Quản trị hệ thống' }}
          </span>
        </v-col>

        <v-col cols="12" class="py-1">
          <span class="grey--text text--darken-1 mr-2">Nhóm người dùng:</span>
          <span class="grey--text text--darken-3">
            {{ userInfo.groups || 'admin,Quản trị hệ thống' }}
          </span>
        </v-col>
      </v-row>

      <!-- Phần Cài đặt -->
      <div class="text-subtitle-1 font-weight-bold grey--text text--darken-3 mb-2 pt-2">
        Cài đặt
      </div>

      <div class="d-flex flex-column align-start body-2">
        <div
          class="font-weight-bold grey--text text--darken-3 mb-2 action-link"
          @click="dialogPassword = true"
        >
          Đổi mật khẩu
        </div>
        <div
          class="font-weight-bold grey--text text--darken-3 action-link"
          @click="handleLogout"
        >
          Đăng xuất
        </div>
      </div>
    </v-card>

    <!-- Modal Đổi Mật Khẩu -->
    <v-dialog v-model="dialogPassword" max-width="500" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title
          class="d-flex justify-space-between align-center py-3 px-4 white--text"
          style="background-color: #a2212b;"
        >
          <span class="text-subtitle-1 font-weight-bold">Đổi mật khẩu tài khoản</span>
          <v-btn icon dark small @click="dialogPassword = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form ref="changePasswordForm" v-model="validPassword">
            <v-text-field
              v-model="passwordForm.oldPassword"
              label="Mật khẩu cũ (*)"
              outlined
              dense
              :type="showOld ? 'text' : 'password'"
              :append-icon="showOld ? 'mdi-eye' : 'mdi-eye-off'"
              :rules="[v => !!v || 'Vui lòng nhập mật khẩu cũ']"
              class="mb-3"
              @click:append="showOld = !showOld"
            />
            <v-text-field
              v-model="passwordForm.newPassword"
              label="Mật khẩu mới (*)"
              outlined
              dense
              :type="showNew ? 'text' : 'password'"
              :append-icon="showNew ? 'mdi-eye' : 'mdi-eye-off'"
              :rules="[v => !!v || 'Vui lòng nhập mật khẩu mới']"
              class="mb-3"
              @click:append="showNew = !showNew"
            />
            <v-text-field
              v-model="passwordForm.confirmPassword"
              label="Nhập lại mật khẩu mới (*)"
              outlined
              dense
              :type="showConfirm ? 'text' : 'password'"
              :append-icon="showConfirm ? 'mdi-eye' : 'mdi-eye-off'"
              :rules="[
                v => !!v || 'Vui lòng xác nhận mật khẩu mới',
                v => v === passwordForm.newPassword || 'Mật khẩu xác nhận không khớp'
              ]"
              @click:append="showConfirm = !showConfirm"
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="px-6 pb-6 pt-0 justify-end">
          <v-btn text class="text-capitalize mr-2" @click="dialogPassword = false">
            Đóng <v-icon small class="ml-1">mdi-close</v-icon>
          </v-btn>
          <v-btn
            color="#a2212b"
            dark
            elevation="0"
            class="text-capitalize font-weight-bold px-4"
            @click="submitChangePassword"
          >
            Lưu <v-icon small class="ml-1">mdi-content-save-outline</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import Cookies from 'js-cookie'
import authServices from '~/services/authServices'

export default {
  name: 'ThongTinCaNhanPage',
  data() {
    return {
      userInfo: {
        fullName: 'Admin',
        email: 'admin@gmail.com',
        phone: '0999999999',
        role: 'Quản trị hệ thống',
        groups: 'admin,Quản trị hệ thống'
      },
      dialogPassword: false,
      validPassword: true,
      showOld: false,
      showNew: false,
      showConfirm: false,
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    }
  },
  async mounted() {
    await this.fetchProfile()
  },
  methods: {
    async fetchProfile() {
      try {
        const res = await authServices.getUserInfo()
        if (res && res.success && res.data) {
          this.userInfo = { ...this.userInfo, ...res.data }
        }
      } catch (e) {
        console.error('Lỗi lấy thông tin cá nhân:', e)
      }
    },
    openEditModal() {},
    async submitChangePassword() {
      if (!this.$refs.changePasswordForm.validate()) return
      try {
        await authServices.changePassword(this.passwordForm)
        alert('Đổi mật khẩu thành công!')
        this.dialogPassword = false
      } catch (e) {
        alert('Đổi mật khẩu thất bại!')
      }
    },
    async handleLogout() {
      try {
        await authServices.logout()
      } catch (e) {}
      Cookies.remove('token')
      localStorage.setItem('logout_success', 'true')
      this.$router.push('/dang-nhap')
    }
  }
}
</script>

<style scoped>
.user-banner {
  background-color: #a2212b !important;
}

.leading-tight {
  line-height: 1.2;
}

.action-link {
  cursor: pointer;
  transition: color 0.2s;
}

.action-link:hover {
  color: #a2212b !important;
}
</style>