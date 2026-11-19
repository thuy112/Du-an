<script>
import Cookies from "js-cookie"
import AuthServices from "~/services/authServices"
import userServices from "~/services/userServices"
import UpdateInfo from "~/components/UpdateInfo.vue"

export default {
  name: "UserProfilePage",
  components: { UpdateInfo },
  data() {
    return {
      isOpenPassword: false,
      isOpenUpdate: false,
      isLoading: false,
      user: {
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
    groups() {
      if (!this.user?.groups) return ""
      if (Array.isArray(this.user.groups)) {
        return this.user.groups
          .map((i) => (typeof i === "string" ? i : i.groupName || i.name || ""))
          .filter(Boolean)
          .join(", ")
      }
      return this.user.groups
    }
  },
  async mounted() {
    try {
      const savedUser = localStorage.getItem("user_info")
      if (savedUser) {
        this.user = { ...this.user, ...this.normalizeUser(JSON.parse(savedUser)) }
      }
    } catch (e) {}

    await this.fetchProfile()
  },
  methods: {
    normalizeUser(raw) {
      if (!raw || typeof raw !== "object") return {}
      const base = raw.user || raw.userInfo || raw
      return {
        ...raw,
        ...base,
        fullName:
          base.fullName ||
          base.name ||
          base.userName ||
          base.username ||
          raw.fullName ||
          raw.name ||
          "",
        email: base.email || raw.email || "",
        phone:
          base.phone ||
          base.phoneNumber ||
          base.mobile ||
          raw.phone ||
          raw.phoneNumber ||
          "",
        position: base.position || base.role || raw.position || "",
        avatar: base.avatar || raw.avatar || "",
        groups: Array.isArray(base.groups)
          ? base.groups
          : Array.isArray(raw.groups)
          ? raw.groups
          : []
      }
    },
    async fetchProfile() {
      try {
        this.isLoading = true
        const res = await userServices.getInfo()
        const payload = res?.data?.data || res?.data || res
        if (res?.success && payload && typeof payload === "object") {
          this.user = { ...this.user, ...this.normalizeUser(payload) }
          localStorage.setItem("user_info", JSON.stringify(this.user))
          this.$nuxt.$emit("user-info-updated", this.user)
        }
      } catch (e) {
        console.error("Lỗi khi tải thông tin cá nhân:", e)
      } finally {
        this.isLoading = false
      }
    },
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
  <v-container fluid style="max-width: 900px" class="pa-4">
    <v-card elevation="0" style="border: 1px solid #f3f0f0">
      <v-card-title>
        <span class="headline">Thông tin người dùng</span>
      </v-card-title>

      <v-card-text>
        <div
          style="background: var(--primary, #a2212b)"
          class="rounded white--text px-4 py-3 d-flex align-center gap-20 my-5"
        >
          <v-avatar size="60">
            <img
              :src="user.avatar || '/images/avatar_default.png'"
              width="60"
              height="60"
              class="cover"
              onerror="this.src='/images/avatar_default.png'"
            />
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
      @success="fetchProfile"
    />
  </v-container>
</template>

<style scoped>
.gap-20 {
  gap: 20px;
}
.gap-8 {
  gap: 8px;
}
.gap-4 {
  gap: 4px;
}
.pointer {
  cursor: pointer;
}
.cover {
  object-fit: cover;
}
</style>