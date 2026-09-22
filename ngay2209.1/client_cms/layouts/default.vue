<template>
  <v-app>
    <!-- Sidebar bên trái -->
    <v-navigation-drawer
      v-model="drawer"
      app
      permanent
      width="90"
      color="#a2212b"
      dark
      class="sidebar-custom"
    >
      <div class="pa-3 text-center">
        <v-img
          src="img/logo-bachkhoa.jpg"
          alt="BK Logo"
          max-width="45"
          contain
          class="mx-auto"
        />
      </div>
      <v-divider class="mb-2" style="border-color: rgba(255,255,255,0.2)"></v-divider>

      <v-list dense nav class="pa-0">
        <v-list-item
          v-for="(item, index) in menuList"
          :key="index"
          :to="item.path || '#'"
          link
          class="flex-column justify-center py-2 px-1 text-center sidebar-item"
        >
          <v-list-item-icon class="ma-0 mb-1">
            <v-icon small>{{ item.icon || 'mdi-cog-outline' }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content class="pa-0">
            <v-list-item-title class="caption text-wrap sidebar-title">
              {{ item.title || item.name }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Header -->
    <v-app-bar app elevation="0" color="grey lighten-4" height="60">
      <span class="text-subtitle-1 grey--text text--darken-1 font-weight-medium pl-2">
        Trang chủ
      </span>

      <v-spacer></v-spacer>

      <!-- Menu Thông tin Admin góc phải (Đã dùng cú pháp #activator và sắp xếp attribute) -->
      <v-menu offset-y left>
        <template #activator="{ on, attrs }">
          <div
            class="d-flex align-center user-profile-btn"
            v-bind="attrs"
            v-on="on"
          >
            <v-avatar color="grey lighten-2" size="40" class="mr-2">
              <v-img src="img/download.jpg" alt="Ảnh đại diện" />
            </v-avatar>
            <div class="text-left mr-1">
              <div class="body-2 font-weight-bold admin-name leading-tight">
                {{ user.name || 'Admin' }}
              </div>
              <div class="caption grey--text text--darken-1 leading-tight">
                {{ user.email || 'admin@gmail.com' }}
              </div>
            </div>
            <v-icon small color="grey darken-1">mdi-chevron-down</v-icon>
          </div>
        </template>

        <v-list dense width="220">
          <v-list-item to="/thong-tin-ca-nhan" link>
            <v-list-item-icon class="mr-2"><v-icon small>mdi-account-cog</v-icon></v-list-item-icon>
            <v-list-item-title>Thông tin cá nhân</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item link @click="handleLogout">
            <v-list-item-icon class="mr-2"><v-icon small color="red">mdi-logout</v-icon></v-list-item-icon>
            <v-list-item-title class="red--text font-weight-medium">Đăng xuất</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main class="white">
      <v-container fluid class="fill-height justify-center align-center">
        <Nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import Cookies from 'js-cookie'
import authServices from '~/services/authServices'

export default {
  name: 'DefaultLayout',
  data() {
    return {
      drawer: true,
      user: {
        name: 'Admin',
        email: 'admin@gmail.com'
      },
      menuList: [
        { title: 'Quản lý giảng viên', icon: 'mdi-account-tie', path: '/quan-ly-giang-vien' },
        { title: 'Quản lý sinh viên', icon: 'mdi-school', path: '/quan-ly-sinh-vien' },
        { title: 'Danh mục hệ thống', icon: 'mdi-database', path: '/danh-muc' },
        { title: 'Quản lý thi lại', icon: 'mdi-file-document-edit', path: '/quan-ly-thi-lai' },
        { title: 'Quản lý học lại', icon: 'mdi-book-open-page-variant', path: '/quan-ly-hoc-lai' },
        { title: 'Quản lý bảo vệ lại', icon: 'mdi-shield-check', path: '/quan-ly-bao-ve-lai' },
        { title: 'Quản trị hệ thống', icon: 'mdi-shield-account', path: '/quan-tri-he-thong' },
        { title: 'Cấu hình email', icon: 'mdi-email-cog', path: '/cau-hinh-email' }
      ]
    }
  },
  async mounted() {
    await this.fetchUserInfo()
    await this.fetchPageRole()
  },
  methods: {
    async fetchUserInfo() {
      try {
        const res = await authServices.getUserInfo()
        if (res.success && res.data) {
          this.user = res.data
        }
      } catch (e) {}
    },
    async fetchPageRole() {
      try {
        const res = await authServices.getPageRole()
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          this.menuList = res.data
        }
      } catch (e) {}
    },
    async handleLogout() {
      try {
        await authServices.logout()
      } catch (e) {}
      Cookies.remove('token')
      this.$router.push('/dang-nhap')
    }
  }
}
</script>

<style scoped>
.sidebar-custom >>> .v-navigation-drawer__content {
  overflow-x: hidden;
}

.sidebar-item {
  min-height: 64px !important;
  margin-bottom: 4px !important;
}

.sidebar-title {
  font-size: 0.68rem !important;
  line-height: 1.2 !important;
  white-space: normal !important;
}

.user-profile-btn {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.user-profile-btn:hover {
  background: #f5f5f5;
}

.leading-tight {
  line-height: 1.2;
}

.admin-name {
  color: #555555;
}
</style>