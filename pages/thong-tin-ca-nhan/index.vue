<script>
import Cookies from "js-cookie"
import AuthServices from "~/services/authServices"
import UpdateInfo from "~/components/UpdateInfo.vue"

export default {
  name: "Index",
  components: { UpdateInfo },
  data() {
    return {
      isOpenPassword: false,
      isOpenUpdate: false,
      isLoading: false,
      userInfo: {} // Dữ liệu user lưu cục bộ để hiển thị ổn định kể cả khi F5
    }
  },
  computed: {
    groups() {
      return this.userInfo?.groups?.map((i) => i.groupName).join(", ") || ""
    }
  },
  created() {
    this.fetchUserInfo()
    // Lắng nghe sự kiện cập nhật thành công từ component con (nếu có dùng mitt)
    if (this.$mitt) {
      this.$mitt.on("getInfo", () => {
        this.fetchUserInfo()
      })
    }
  },
  methods: {
    async fetchUserInfo() {
      try {
        this.isLoading = true
        const res = await AuthServices.getInfo()
        const data = res?.data !== undefined ? res.data : res
        if (data) {
          this.userInfo = data?.data || data
        }
      } catch (e) {
        console.error("Lỗi lấy thông tin người dùng:", e)
        // Fallback lấy từ store nếu API lỗi
        this.userInfo = this.$store.state.auth.user || {}
      } finally {
        this.isLoading = false
      }
    },

    async handleLogout() {
      try {
        this.isLoading = true
        const res = await AuthServices.logout({
          token: Cookies.get("token")
        })
        if (res.success) {
          this.$removeCookies()
          this.$showSuccess("Đăng xuất thành công")
          await this.$router.push("/dang-nhap")
        }
      } catch (e) {
        console.error(e)
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>

<template>
  <v-container fluid style="max-width: 900px">
    <v-card elevation="0" style="border: 1px solid #f3f0f0" :loading="isLoading">
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
              :src="userInfo.avatar || '/images/avatar_default.png'"
              width="60"
              height="60"
              class="cover"
              onerror="this.src='/images/avatar_default.png'"
            />
          </v-avatar>

          <div>
            <div class="fw-500">{{ userInfo.fullName || '---' }}</div>
            <div>{{ userInfo.email || '---' }}</div>
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
              <div>Họ tên:</div>
              <div class="fw-600 primary--text">
                {{ userInfo.fullName || '---' }}
              </div>
            </div>

            <div class="d-flex align-center gap-8">
              <div>Số điện thoại:</div>
              <div class="fw-600 primary--text">
                {{ userInfo.phone || '---' }}
              </div>
            </div>

            <div class="d-flex align-center gap-8">
              <div>Email:</div>
              <div class="fw-600 primary--text">
                {{ userInfo.email || '---' }}
              </div>
            </div>
            <div class="d-flex align-center gap-8">
              <div>Chức vụ:</div>
              <div class="fw-600 primary--text">
                {{ userInfo.position || '---' }}
              </div>
            </div>

            <div class="d-flex align-center gap-8">
              <div>Nhóm người dùng:</div>
              <div class="fw-500 primary--text">
                {{ groups || '---' }}
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
      v-if="userInfo && userInfo.id"
      :data-detail="userInfo"
      :open="isOpenUpdate"
      @toggle="isOpenUpdate = !isOpenUpdate"
    />
  </v-container>
</template>

<style scoped></style>