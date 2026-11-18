<script>
import Cookies from "js-cookie"
import AuthServices from "~/services/authServices"
import UpdateInfo from "~/components/UpdateInfo.vue"

export default {
  name: "UserProfilePage",
  components: { UpdateInfo },
  data() {
    return {
      isOpenPassword: false,
      isOpenUpdate: false,
      isLoading: false,
      localUser: {
        fullName: "",
        email: "",
        phone: "",
        position: "",
        avatar: "",
        groups: []
      }
    }
  },
  computed: {
    user() {
      const storeUser = this.$store?.state?.auth?.user
      if (storeUser && Object.keys(storeUser).length > 0) {
        return storeUser
      }
      return this.localUser || {}
    },
    groups() {
      if (!this.user?.groups) return ""
      if (Array.isArray(this.user.groups)) {
        return this.user.groups.map((i) => i.groupName || i.name).join(", ")
      }
      return this.user.groups
    }
  },
  async mounted() {
    // 1. Đọc ngay từ localStorage lên để hiển thị tức thì
    try {
      const savedUser = localStorage.getItem("user_info")
      if (savedUser) {
        this.localUser = JSON.parse(savedUser)
      }
    } catch (e) {
      console.error(e)
    }

    // 2. Gọi API lấy thông tin mới nhất từ server để đảm bảo dữ liệu luôn chuẩn
    try {
      const res = await AuthServices.getInfo ? AuthServices.getInfo() : null
      if (res && res.success && res.data) {
        this.localUser = res.data
        localStorage.setItem("user_info", JSON.stringify(res.data))
      }
    } catch (e) {
      console.error("Không thể tải thông tin cá nhân từ server:", e)
    }
  },
  methods: {
    async handleLogout() {
      const currentToken = Cookies.get("token") || Cookies.get("auth_token")
      if (currentToken) {
        try {
          this.isLoading = true
          await AuthServices.logout({ token: currentToken })
        } catch (e) {
          console.error(e)
        } finally {
          this.isLoading = false
        }
      }
      Cookies.remove("token")
      Cookies.remove("auth_token")
      localStorage.removeItem("user_info")
      this.$showSuccess("Đăng xuất thành công")
      await this.$router.push("/dang-nhap")
    }
  }
}
</script>

<template>
  <v-container fluid style="max-width: 900px">
    <v-card elevation="0" style="border: 1px solid #f3f0f0">
      <v-card-title>
        <span class="headline">Thông tin người dùng</span>
      </v-card-title>

      <v-card-text>
        <div
          style="background: var(--primary)"
          class="rounded white--text px-4 py-3 d-flex align-center gap-20 my-5"
        >
          <v-avatar size="60">
            <img
              :src="user.avatar || '/images/avatar_default.png'"

              width="60"
              height="60"
              class="cover"
              onerror="this.src='/images/avatar_default.png'"
            ></img>
          </v-avatar>

          <div>
            <div class="fw-500">{{ user.fullName }}</div>
            <div>{{ user.email }}</div>
          </div>
        </div>

        <div>
          <div class="header d-flex align-center justify-space-between mb-3">
            <div class="fw-500 fs-16">
              <div>Thông tin cá nhân</div>
            </div>
            <v-btn small text color="primary" @click="isOpenUpdate = true">
              Chỉnh sửa
              <v-icon right>mdi-pencil</v-icon>
            </v-btn>
          </div>
          <div class="content ml-2 d-flex gap-4 flex-column">
            <div class="d-flex align-center gap-8">
              <div class="">Họ tên:</div>
              <div class="fw-600 primary--text">
                {{ user.fullName }}
              </div>
            </div>

            <div class="d-flex align-center gap-8">
              <div class="">Số điện thoại:</div>
              <div class="fw-600 primary--text">
                {{ user.phone }}
              </div>
            </div>

            <div class="d-flex align-center gap-8">
              <div class="">Email:</div>
              <div class="fw-600 primary--text">
                {{ user.email }}
              </div>
            </div>
            <div class="d-flex align-center gap-8">
              <div class="">Chức vụ:</div>
              <div class="fw-600 primary--text">
                {{ user.position }}
              </div>
            </div>

            <div class="d-flex align-center gap-8">
              <div class="">Nhóm người dùng:</div>
              <div class="fw-500 primary--text">
                {{ groups }}
              </div>
            </div>
          </div>
        </div>

        <div class="mt-5">
          <div class="header d-flex align-center justify-space-between mb-3">
            <div class="fw-500 fs-16">
              <div>Cài đặt</div>
            </div>
          </div>
          <div class="content ml-2 d-flex gap-4 flex-column">
            <div class="d-flex align-center gap-8 pointer">
              <div class="fw-500 black--text" @click="isOpenPassword = true">
                Đổi mật khẩu
              </div>
            </div>
            <div class="d-flex align-center gap-8 pointer">
              <div class="fw-500 black--text" @click="handleLogout">Đăng xuất</div>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
    <HeaderChangePassword
      class="ma-0"
      :open="isOpenPassword"
      @toggle="isOpenPassword = !isOpenPassword"
    />
    <UpdateInfo
      :data-detail="user"
      :open="isOpenUpdate"
      @toggle="isOpenUpdate = !isOpenUpdate"
    />
  </v-container>
</template>

<style scoped></style>
