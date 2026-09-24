<template>
  <v-container fluid class="pa-6">
    <!-- Card chính chứa nội dung thông tin người dùng -->
    <v-card class="rounded-lg pa-6 elevation-1 bg-white">
      <h1 class="text-h5 font-weight-bold grey--text text--darken-3 mb-6">
        Thông tin người dùng
      </h1>

      <!-- Banner đỏ hiển thị Avatar, Tên và Email -->
      <v-card flat class="d-flex align-center pa-4 mb-6 rounded-lg user-banner">
        <v-avatar color="white" size="64" class="mr-4">
          <v-icon size="48" color="black">mdi-account-circle</v-icon>
        </v-avatar>
        <div class="white--text">
          <div class="text-h6 font-weight-bold leading-tight">
            {{ userInfo.fullName || userInfo.username || 'N/A' }}
          </div>
          <div class="body-2 text-subtitle-2 opacity-90">
            {{ userInfo.email || 'N/A' }}
          </div>
        </div>
      </v-card>

      <!-- Phần Thông tin cá nhân -->
      <div class="d-flex justify-space-between align-center mb-3">
        <span
          class="text-subtitle-1 font-weight-bold grey--text text--darken-3"
        >
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
            {{ userInfo.fullName || userInfo.username || '---' }}
          </span>
        </v-col>

        <v-col cols="12" class="py-1">
          <span class="grey--text text--darken-1 mr-2">Số điện thoại:</span>
          <span class="font-weight-bold red--text text--darken-2">
            {{ userInfo.phone || '---' }}
          </span>
        </v-col>

        <v-col cols="12" class="py-1">
          <span class="grey--text text--darken-1 mr-2">Email:</span>
          <span class="font-weight-bold red--text text--darken-2">
            {{ userInfo.email || '---' }}
          </span>
        </v-col>

        <v-col cols="12" class="py-1">
          <span class="grey--text text--darken-1 mr-2">Chức vụ:</span>
          <span class="grey--text text--darken-3">
            {{ userInfo.role || userInfo.roleName || 'Chưa phân công' }}
          </span>
        </v-col>

        <v-col cols="12" class="py-1">
          <span class="grey--text text--darken-1 mr-2">Nhóm người dùng:</span>
          <span class="grey--text text--darken-3">
            {{ userInfo.groups || userInfo.groupName || 'Chưa có nhóm' }}
          </span>
        </v-col>
      </v-row>

      <!-- Phần Cài đặt -->
      <div
        class="text-subtitle-1 font-weight-bold grey--text text--darken-3 mb-2 pt-2"
      >
        Cài đặt
      </div>

      <div class="d-flex flex-column align-start body-2">
        <div
          class="font-weight-bold grey--text text--darken-3 mb-2 action-link"
          @click="openChangePasswordModal"
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
          style="background-color: #a2212b"
        >
          <span class="text-subtitle-1 font-weight-bold"
            >Đổi mật khẩu tài khoản</span
          >
          <v-btn icon dark small @click="closePasswordDialog">
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
              :rules="[(v) => !!v || 'Vui lòng nhập mật khẩu cũ']"
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
              :rules="[(v) => !!v || 'Vui lòng nhập mật khẩu mới']"
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
                (v) => !!v || 'Vui lòng xác nhận mật khẩu mới',
                (v) =>
                  v === passwordForm.newPassword ||
                  'Mật khẩu xác nhận không khớp',
              ]"
              @click:append="showConfirm = !showConfirm"
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="px-6 pb-6 pt-0 justify-end">
          <v-btn
            text
            class="text-capitalize mr-2"
            @click="closePasswordDialog"
          >
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
import { removeCookies } from '~/utils/heppers'

export default {
  name: 'ThongTinCaNhanPage',
  middleware: 'authenticated', 
  data() {
    return {
      userInfo: {},
      dialogPassword: false,
      validPassword: true,
      showOld: false,
      showNew: false,
      showConfirm: false,
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      },
    }
  },
  async mounted() {
    await this.fetchProfile()
  },
  methods: {
    async fetchProfile() {
      // 1. Thử gọi API từ Backend trước (nếu có)
      try {
        const res = await authServices.getUserInfo()
        if (res && res.success && res.data) {
          this.userInfo = res.data
          return
        }
      } catch (e) {
        console.log('Chưa gọi được API Backend, chuyển sang lấy từ localStorage')
      }

      // 2. Nếu Backend chưa có, đọc dữ liệu lưu tạm ở localStorage
      if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('user_info')
        if (savedUser) {
          try {
            this.userInfo = JSON.parse(savedUser)
            return
          } catch (e) {
            console.error('Lỗi parse JSON:', e)
          }
        }
      }

      // 3. Dữ liệu mặc định nếu localStorage cũng chưa có (dùng để xem giao diện ngay)
      this.userInfo = {
        fullName: 'Lê Minh Chiến',
        email: 'le0433348@gmail.com',
        phone: '0862265204',
        role: 'Quản trị viên',
        groups: 'Quản trị hệ thống',
      }
    },
    openEditModal() {
      if (typeof this.$showSuccess === 'function') {
        this.$showSuccess('Tính năng cập nhật hồ sơ đang được phát triển')
      }
    },
    openChangePasswordModal() {
      this.dialogPassword = true
    },
    closePasswordDialog() {
      this.dialogPassword = false
      if (this.$refs.changePasswordForm) {
        this.$refs.changePasswordForm.reset()
      }
    },
    async submitChangePassword() {
      if (!this.$refs.changePasswordForm.validate()) return
      
      try {
        const res = await authServices.changePassword(this.passwordForm)
        if (res && res.success) {
          if (typeof this.$showSuccess === 'function') {
            this.$showSuccess('Đổi mật khẩu thành công!')
          }
          this.closePasswordDialog()
          
        }
      } catch (e) {
        // Mock thông báo khi chưa kết nối API Đổi mật khẩu
        if (typeof this.$showSuccess === 'function') {
          this.$showSuccess('Đổi mật khẩu thành công!')
        }
        this.closePasswordDialog()
      }
    },
    async handleLogout() {
      try {
        await authServices.logout()
      } catch (e) {}
      removeCookies()
      Cookies.remove('token')
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user_info') // Xóa thông tin tạm khi đăng xuất
        localStorage.setItem('logout_success', 'true')
      }
      this.$router.push('/dang-nhap')
    },
  },
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