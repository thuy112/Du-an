<template>
  <v-app>
    <!-- ==================== 1. SIDEBAR CHO MÀN HÌNH LỚN (DESKTOP >= 960px) ==================== -->
    <template v-if="isDesktop">
      <!-- Cột 1: Navigation Sidebar 88px cố định bên trái -->
      <div class="sidebar-primary">
        <div class="pa-3 text-center logo-box">
          <v-img
            src="/img/logo-bachkhoa.jpg"
            alt="BK Logo"
            max-width="45"
            contain
            class="mx-auto"
          />
        </div>

        <div class="sidebar-menu-list pa-0">
          <div v-for="item in fullMenuList" :key="item.id || item.path">
            <div
              class="sidebar-item py-2 px-1 text-center"
              :class="{
                'item-active': isParentActive(item) || $route.path === item.path,
              }"
              @click="handleMainItemClick(item)"
            >
              <div class="sidebar-icon-box mb-1">
                <v-icon size="24" color="white">{{
                  item.icon || 'mdi-cog-outline'
                }}</v-icon>
              </div>
              <div class="sidebar-title">
                {{ item.title }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cột 2: Submenu Drawer ĐÈ LÊN NỘI DUNG khi bấm vào menu có con -->
      <transition name="slide-fade">
        <div v-if="activeSubMenu" class="sidebar-secondary">
          <div class="red-flyout-box">
            <div
              v-for="child in activeSubMenu.children"
              :key="child.path"
              class="flyout-item"
              :class="{ 'flyout-active': $route.path === child.path }"
              @click="navigateTo(child.path)"
            >
              {{ child.title }}
            </div>
          </div>
        </div>
      </transition>

      <div
        v-if="activeSubMenu"
        class="sidebar-backdrop"
        @click="activeSubMenu = null"
      ></div>
    </template>

    <!-- ==================== 2. NAVIGATION DRAWER KHI THU NHỎ (MOBILE/TABLET < 960px) ==================== -->
    <v-navigation-drawer
      v-else
      v-model="mobileDrawer"
      app
      temporary
      fixed
      width="260"
      color="#a2212b"
      dark
      class="mobile-drawer"
    >
      <v-list class="pa-0 mt-2">
        <template v-for="(item, i) in fullMenuList">
          <!-- Menu có con (xổ xuống) -->
          <v-list-group
            v-if="item.children && item.children.length"
            :key="`group-${i}`"
            v-model="item.active"
            no-action
            color="white"
          >
            <template #activator>
              <v-list-item-action class="mr-3">
                <v-icon size="24">{{ item.icon || 'mdi-cog-outline' }}</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title class="body-2 font-weight-medium">
                  {{ item.title }}
                </v-list-item-title>
              </v-list-item-content>
            </template>

            <v-list-item
              v-for="(child, cIdx) in item.children"
              :key="`child-${cIdx}`"
              :class="{ 'sub-menu-active': $route.path === child.path }"
              class="pl-12 sub-menu-item"
              @click="navigateTo(child.path)"
            >
              <v-list-item-content>
                <v-list-item-title class="caption">
                  {{ child.title }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-group>

          <!-- Menu đơn không có con -->
          <v-list-item
            v-else
            :key="`item-${i}`"
            :class="{ 'menu-item-active': $route.path === item.path }"
            @click="navigateTo(item.path)"
          >
            <v-list-item-action class="mr-3">
              <v-icon size="24">{{ item.icon || 'mdi-cog-outline' }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title class="body-2 font-weight-medium">
                {{ item.title }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <!-- ==================== 3. HEADER TOPBAR ==================== -->
    <v-app-bar
      app
      elevation="0"
      color="#f8f9fa"
      height="60"
      :class="isDesktop ? 'topbar-custom' : 'topbar-mobile'"
    >
      <v-btn
        v-if="!isDesktop"
        icon
        color="black"
        class="mr-2"
        @click="mobileDrawer = !mobileDrawer"
      >
        <v-icon>mdi-menu</v-icon>
      </v-btn>

      <v-breadcrumbs
        v-else
        :items="breadcrumbs"
        class="pa-0 pl-2 custom-breadcrumbs"
      >
        <template #divider>
          <v-icon x-small color="grey lighten-1">mdi-chevron-right</v-icon>
        </template>

        <template #item="{ item }">
          <v-breadcrumbs-item
            :to="item.to"
            :exact="item.exact"
            :disabled="item.disabled"
            :class="item.text === 'Trang chủ' ? 'text-home-red' : 'text-breadcrumb-gray'"
          >
            {{ item.text }}
          </v-breadcrumbs-item>
        </template>
      </v-breadcrumbs>

      <v-spacer></v-spacer>

      <!-- Popup User Admin -->
      <v-menu
        v-model="menuUser"
        offset-y
        left
        :close-on-content-click="false"
        :open-on-hover="false"
      >
        <template #activator="{ on, attrs }">
          <div
            v-if="isDesktop"
            class="d-flex align-center user-profile-btn py-1 px-2"
            v-bind="attrs"
            v-on="on"
          >
            <v-img
              src="/img/download.jpg"
              alt="User avatar"
              width="36"
              height="36"
              class="mr-2 avatar-user"
            ></v-img>

            <div class="text-left user-profile-text mr-1">
              <div class="user-name-text">
                {{ user.name || user.fullName || 'Admin' }}
              </div>
              <div class="user-email-text">
                {{ user.email || 'admin@gmail.com' }}
              </div>
            </div>

            <v-icon x-small color="grey darken-1" class="ml-1 chevron-user">
              mdi-chevron-down
            </v-icon>
          </div>

          <v-avatar
            v-else
            size="36"
            color="black"
            class="cursor-pointer"
            v-bind="attrs"
            v-on="on"
          >
            <v-img src="/img/download.jpg" alt="User avatar"></v-img>
          </v-avatar>
        </template>

        <v-card width="290" class="pa-4 rounded-lg elevation-4">
          <div class="text-subtitle-2 font-weight-bold grey--text text--darken-3 mb-3">
            Thông tin người dùng
          </div>

          <div
            class="d-flex align-start mb-2 user-info-clickable rounded pa-1"
            style="cursor: pointer"
            @click="goToUserProfile"
          >
            <v-avatar size="44" class="mr-3 mt-1">
              <v-img src="/img/download.jpg" alt="User avatar"></v-img>
            </v-avatar>
            <div>
              <div class="font-weight-bold body-2 grey--text text--darken-3">
                {{ user.name || user.fullName || 'Admin' }}
              </div>
              <div class="caption grey--text text--darken-1 d-flex align-center mt-1">
                <v-icon x-small class="mr-1">mdi-badge-account-horizontal-outline</v-icon>
                {{ user.role || 'Quản trị hệ thống' }}
              </div>
              <div class="caption grey--text text--darken-1 d-flex align-center mt-1">
                <v-icon x-small class="mr-1">mdi-phone-outline</v-icon>
                {{ user.phone || '0999999999' }}
              </div>
              <div class="caption grey--text text--darken-1 d-flex align-center mt-1">
                <v-icon x-small class="mr-1">mdi-email-outline</v-icon>
                {{ user.email || 'admin@gmail.com' }}
              </div>
            </div>
          </div>

          <v-divider class="my-3"></v-divider>

          <div
            class="d-flex align-center py-2 px-1 user-option-item rounded"
            style="cursor: pointer"
            @click.stop="openChangePasswordModal"
          >
            <v-icon small color="grey darken-2" class="mr-2">mdi-lock-outline</v-icon>
            <span class="body-2 grey--text text--darken-3">Đổi mật khẩu</span>
          </div>

          <v-btn
            outlined
            color="#a2212b"
            block
            class="mt-3 text-capitalize font-weight-bold rounded-lg btn-logout"
            @click="handleLogout"
          >
            Đăng Xuất
          </v-btn>
        </v-card>
      </v-menu>
    </v-app-bar>

    <!-- ==================== 4. MAIN CONTENT ==================== -->
    <v-main :class="isDesktop ? 'main-content' : 'main-content-mobile'">
      <v-container
        fluid
        class="main-container pa-0"
      >
        <Nuxt />
      </v-container>
    </v-main>

    <UserChangePasswordModal v-model="dialogPassword" />
  </v-app>
</template>

<script>
import Cookies from 'js-cookie'
import authServices from '~/services/authServices'
import { removeCookies } from '~/utils/heppers'

export default {
  name: 'DefaultLayout',
  data() {
    return {
      menuUser: false,
      dialogPassword: false,
      activeSubMenu: null,
      mobileDrawer: false,

      user: {
        name: 'Admin',
        email: 'admin@gmail.com',
        role: 'Quản trị hệ thống',
        phone: '0999999999',
      },

      menuList: [],
    }
  },
  computed: {
    isDesktop() {
      return this.$vuetify.breakpoint.mdAndUp
    },

    fullMenuList() {
      const defaultMenus = [
        {
          id: 'quan-ly-giang-vien',
          title: 'Quản lý giảng viên',
          path: '/quan-ly-giang-vien',
          icon: 'mdi-account-tie-hat',
        },
        {
          id: 'quan-ly-sinh-vien',
          title: 'Quản lý sinh viên',
          path: '/quan-ly-sinh-vien',
          icon: 'mdi-account-school',
        },
        {
          id: 'danh-muc-he-thong',
          title: 'Danh mục hệ thống',
          path: '/danh-muc-he-thong',
          icon: 'mdi-database',
        },
        {
          id: 'quan-ly-thi-lai',
          title: 'Quản lý thi lại',
          path: '/quan-ly-thi-lai',
          icon: 'mdi-youtube-studio',
        },
        {
          id: 'quan-ly-hoc-lai',
          title: 'Quản lý học lại',
          path: '/quan-ly-hoc-lai',
          icon: 'mdi-youtube-studio',
        },
        {
          id: 'quan-ly-bao-ve-lai',
          title: 'Quản lý bảo vệ lại',
          path: '/quan-ly-bao-ve-lai',
          icon: 'mdi-youtube-studio',
        },
        {
          id: 'quan-tri-he-thong',
          title: 'Quản trị hệ thống',
          icon: 'mdi-compass',
          active: false,
          children: [
            { title: 'Người dùng', path: '/quan-tri-he-thong/nguoi-dung' },
            {
              title: 'Nhóm người dùng',
              path: '/quan-tri-he-thong/nhom-nguoi-dung',
            },
            {
              title: 'Thao tác người dùng',
              path: '/quan-tri-he-thong/thao-tac-nguoi-dung',
            },
            {
              title: 'File đã import',
              path: '/quan-tri-he-thong/file-da-import',
            },
          ],
        },
        {
          id: 'cau-hinh-email',
          title: 'Cấu hình email',
          icon: 'mdi-email-edit',
          active: false,
          children: [
            {
              title: 'Cấu hình email',
              path: '/cau-hinh/cau-hinh-email',
            },
            {
              title: 'Cấu hình nhận email',
              path: '/cau-hinh/cau-hinh-nhan-email',
            },
          ],
        },
      ]

      if (!this.menuList || !this.menuList.length) {
        return defaultMenus
      }

      const hasAdminMenu = this.menuList.some(
        (m) =>
          m.path?.includes('quan-tri-he-thong') || m.title?.includes('Quản trị')
      )

      if (!hasAdminMenu) {
        return [...defaultMenus, ...this.menuList]
      }

      return this.menuList
    },

    breadcrumbs() {
      const currentPath = this.$route.path

      if (currentPath === '/') {
        return [{ text: 'Trang chủ', disabled: true }]
      }

      const items = [{ text: 'Trang chủ', to: '/', exact: true }]

      if (currentPath === '/thong-tin-ca-nhan') {
        items.push({ text: 'Thông tin người dùng', disabled: true })
        return items
      }

      let parentMenu = null
      let childMenu = null

      for (const menu of this.fullMenuList) {
        if (menu.children && menu.children.length) {
          const foundChild = menu.children.find((c) => c.path === currentPath)
          if (foundChild) {
            parentMenu = menu
            childMenu = foundChild
            break
          }
        } else if (menu.path === currentPath) {
          parentMenu = menu
          break
        }
      }

      if (parentMenu) {
        if (childMenu) {
          items.push({ text: parentMenu.title, disabled: false })
          items.push({ text: childMenu.title, disabled: true })
        } else {
          items.push({ text: parentMenu.title, disabled: true })
        }
        return items
      }

      const storeTitle = this.$store ? this.$store.state.pageTitle : ''
      if (storeTitle && storeTitle !== 'Trang chủ') {
        items.push({ text: storeTitle, disabled: true })
      }

      return items
    },
  },
  watch: {
    $route() {
      this.activeSubMenu = null
      this.mobileDrawer = false
    },
  },
  async mounted() {
    // Ưu tiên đọc thông tin user lưu từ localStorage khi đăng nhập
    const localUser = localStorage.getItem('user_info')
    if (localUser) {
      try {
        this.user = { ...this.user, ...JSON.parse(localUser) }
      } catch (e) {}
    }

    await this.fetchUserInfo()
    await this.fetchPageRole()
  },
  methods: {
    isParentActive(item) {
      if (!item.children) return false
      return item.children.some((child) => child.path === this.$route.path)
    },
    handleMainItemClick(item) {
      if (item.children && item.children.length) {
        if (this.activeSubMenu && this.activeSubMenu.id === item.id) {
          this.activeSubMenu = null
        } else {
          this.activeSubMenu = item
        }
      } else {
        this.activeSubMenu = null
        this.navigateTo(item.path)
      }
    },
    navigateTo(path) {
      this.activeSubMenu = null
      this.mobileDrawer = false
      if (path && this.$route.path !== path) {
        this.$router.push(path)
      }
    },
    async fetchUserInfo() {
      try {
        const res = await authServices.getUserInfo()
        if (res && res.success && res.data) {
          this.user = { ...this.user, ...res.data }
        }
      } catch (e) {}
    },
    async fetchPageRole() {
      try {
        const res = await authServices.getPageRole()
        if (
          res &&
          res.success &&
          res.data &&
          Array.isArray(res.data.pageRoles)
        ) {
          const topLevelMenus = res.data.pageRoles.filter(
            (item) => item.level === 1 || item.parentId === 0
          )
          topLevelMenus.sort((a, b) => a.menuIndex - b.menuIndex)

          this.menuList = topLevelMenus.map((item) => ({
            id: item.id,
            title: item.pageName,
            path: item.pageUrl,
            icon: item.pageIcon || 'mdi-cog-outline',
          }))
        }
      } catch (e) {}
    },

    goToUserProfile() {
      this.menuUser = false
      this.$router.push('/thong-tin-ca-nhan')
    },

    openChangePasswordModal() {
      this.menuUser = true
      this.dialogPassword = true
    },

    async handleLogout() {
      try {
        await authServices.logout()
      } catch (e) {}

      // Xóa đồng thời cả 2 tên key cookie để tránh bị lỗi middleware
      Cookies.remove('token')
      Cookies.remove('auth_token')
      if (typeof removeCookies === 'function') {
        removeCookies('auth_token')
        removeCookies('token')
      }

      localStorage.removeItem('user_info')
      localStorage.setItem('logout_success', 'true')
      this.$router.push('/dang-nhap')
    },
  },
}
</script>

<style scoped>
/* Cột Sidebar 1 chính màu đỏ 88px */
.sidebar-primary {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 88px;
  background-color: #a2212b;
  z-index: 200;
  display: flex;
  flex-direction: column;
}

.logo-box {
  background-color: #a2212b;
  padding-top: 16px !important;
  padding-bottom: 16px !important;
}

.sidebar-menu-list {
  flex: 1;
  overflow-y: auto;
}

.sidebar-item {
  min-height: 33px !important;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  transition: background-color 0.2s ease;
  margin: 8px 4px;
  border-radius: 4px;
}

.sidebar-item:hover {
  background-color: rgba(0, 0, 0, 0.15);
}

.item-active {
  background-color: #83161f !important;
}

.sidebar-title {
  font-size: 0.68rem;
  line-height: 1.15;
  color: #ffffff;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

/* Cột Sidebar 2 */
.sidebar-secondary {
  position: fixed;
  top: 0;
  left: 87px;
  bottom: 0;
  width: 240px;
  background-color: #a2212b;
  z-index: 250;
  box-shadow: 6px 0 16px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  padding-top: 8px;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.red-flyout-box {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
}

.flyout-item {
  font-size: 0.9rem;
  line-height: 1.4;
  color: #ffffff;
  cursor: pointer;
  padding: 12px 20px;
  font-weight: 400;
  transition: background-color 0.2s ease;
}

.flyout-item:hover {
  background-color: rgba(0, 0, 0, 0.15);
}

.flyout-active {
  background-color: #83161f !important;
  font-weight: 600;
}

.sidebar-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 210;
  background-color: rgba(0, 0, 0, 0.1);
}

/* Style Sidebar Thu Nhỏ (Mobile/Tablet) */
.mobile-drawer >>> .v-navigation-drawer__content {
  overflow-y: auto;
}
.sub-menu-item {
  min-height: 38px !important;
  background-color: rgba(0, 0, 0, 0.15) !important;
}
.sub-menu-item:hover, .menu-item-active {
  background-color: #83161f !important;
}
.sub-menu-active {
  background-color: #83161f !important;
  font-weight: 600;
}

/* Header & Content */
.topbar-custom {
  background: #f8f9fa !important;
  border-bottom: 1px solid #eaeaea;
  padding-left: 110px !important;
}

.topbar-mobile {
  background: #f8f9fa !important;
  border-bottom: 1px solid #eaeaea;
  padding-left: 12px !important;
}

.main-content {
  background: #ffffff;
  padding-left: 110px !important;
}

.main-content-mobile {
  background: #ffffff;
  padding-left: 0px !important;
}

.main-container {
  background: #ffffff;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.2s ease-out;
}

.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(-15px);
  opacity: 0;
}

.user-profile-btn {
  cursor: pointer;
  border-radius: 20px;
}

.avatar-user {
  border-radius: 50% !important;
  overflow: hidden;
  object-fit: cover;
}

.user-profile-text {
  line-height: 1.15;
}

.user-name-text {
  font-size: 0.85rem;
  font-weight: 600;
  color: #a2212b;
}

.user-email-text {
  font-size: 0.78rem;
  color: #111111;
}

.cursor-pointer {
  cursor: pointer;
}

/* Màu chữ Trang chủ đỏ nổi bật */
.custom-breadcrumbs >>> .text-home-red .v-breadcrumbs__item {
  color: #a2212b !important;
  font-weight: 600;
  font-size: 0.95rem !important;
}

.custom-breadcrumbs >>> .text-breadcrumb-gray .v-breadcrumbs__item {
  color: #888888 !important;
  font-weight: 400;
  font-size: 0.88rem !important;
}

/* Các breadcrumb con xám nhẹ */
.custom-breadcrumbs >>> .v-breadcrumbs__item--disabled {
  color: #888888 !important;
  font-weight: 400;
  font-size: 0.88rem !important;
}
</style> 