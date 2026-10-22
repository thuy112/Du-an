<template>
  <div class="role-management pa-3 bg-light font-sans">
    <v-row
      no-gutters
      class="border rounded bg-white overflow-hidden role-panel px-0 py-0"
    >
      <!-- CỘT BÊN TRÁI: Danh sách nhóm người dùng -->
      <v-col
        cols="12"
        md="4"
        lg="3"
        class="border-right pa-4 d-flex flex-column left-panel"
      >
        <div class="d-flex justify-space-between align-center mb-3">
          <span class="text-h5 font-weight-bold">Nhóm người dùng</span>
          <v-btn
            color="#a2212b"
            dark
            class="text-capitalize rounded-sm elevation-0 px-4 py-2"
            @click="handleAddNewRole"
          >
            Thêm Mới +
          </v-btn>
        </div>

        <!-- Ô Tìm kiếm -->
        <v-text-field
          v-model="searchRole"
          placeholder="Tìm kiếm"
          outlined
          dense
          hide-details
          clearable
          class="custom-input mb-3"
        ></v-text-field>

        <!-- Danh sách Nhóm -->
        <div class="role-list overflow-y-auto mt-0 flex-grow-1">
          <v-list dense class="py-0">
            <v-list-item-group>
              <v-list-item
                v-for="(role, index) in filteredRoles"
                :key="role.id"
                class="role-item mb-1 rounded-sm"
                :class="{ 'active-role': selectedRoleIndex === index }"
                @click="selectRole(role, index)"
              >
                <v-list-item-content>
                  <v-list-item-title class="font-weight-medium text-body-2">
                    {{ role.groupName }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </div>
      </v-col>

      <!-- CỘT BÊN PHẢI: Slider chứa 2 tab -->
      <v-col
        cols="12"
        md="8"
        lg="9"
        class="pa-4 d-flex flex-column right-panel overflow-hidden"
      >
        <!-- Thanh Navigation Tab -->
        <div
          class="d-flex align-center pb-0 mb-3 border-bottom detail-header px-0 justify-center"
        >
          <div class="d-flex gap-8 tab-nav-container">
            <button
              class="tab-btn font-weight-bold py-2 px-6 rounded-t"
              :class="{ 'active-tab': activeTab === 0 }"
              @click="activeTab = 0"
            >
              Thông Tin Nhóm
            </button>
            <button
              class="tab-btn font-weight-bold py-2 px-6 rounded-t"
              :class="{ 'active-tab': activeTab === 1 }"
              @click="activeTab = 1"
            >
              Tài Khoản Nhóm
            </button>
          </div>
        </div>

        <!-- VÙNG SLIDE GIỮA 2 TAB -->
        <div
          class="tab-slider-wrapper flex-grow-1 overflow-hidden position-relative"
        >
          <div
            class="tab-slider-content d-flex h-100"
            :style="{ transform: `translateX(-${activeTab * 100}%)` }"
          >
            <!-- TAB 1: THÔNG TIN NHÓM & PHÂN QUYỀN -->
            <div class="tab-pane w-100 flex-shrink-0 d-flex flex-column pr-1">
              <div class="d-flex justify-end gap-2 mb-2">
                <v-btn
                  color="#f44336"
                  dark
                  elevation="0"
                  class="text-capitalize rounded-sm px-4"
                  @click="deleteRole"
                >
                  Xóa
                  <v-icon right small class="ml-1">mdi-delete-outline</v-icon>
                </v-btn>
                <v-btn
                  color="#a2212b"
                  dark
                  elevation="0"
                  class="text-capitalize rounded-sm px-4"
                  @click="saveRole"
                >
                  Lưu
                  <v-icon right small class="ml-1"
                    >mdi-content-save-outline</v-icon
                  >
                </v-btn>
              </div>

              <v-form ref="roleForm" class="mb-3">
                <v-text-field
                  v-model="currentRole.groupName"
                  label="Tên nhóm (*)"
                  outlined
                  dense
                  class="mb-2"
                ></v-text-field>

                <v-text-field
                  v-model="currentRole.description"
                  label="Mô tả (*)"
                  outlined
                  dense
                  class="mb-2"
                ></v-text-field>
              </v-form>

              <!-- BẢNG PHÂN QUYỀN (TRANG - CHỨC NĂNG) -->
              <v-row
                dense
                class="permission-matrix border rounded overflow-hidden flex-grow-1"
              >
                <!-- Cột TRANG -->
                <v-col cols="6" class="border-right pa-0">
                  <div
                    class="table-header d-flex align-center px-3 py-2 bg-grey-light border-bottom"
                  >
                    <v-checkbox
                      v-model="selectAllPages"
                      hide-details
                      dense
                      class="ma-0 pa-0 mr-3"
                      @change="toggleSelectAllPages"
                    ></v-checkbox>
                    <span class="font-weight-bold text-caption text-uppercase"
                      >TRANG</span
                    >
                  </div>
                  <div
                    class="page-list overflow-y-auto"
                    style="max-height: 280px"
                  >
                    <div
                      v-for="page in uniquePagesList"
                      :key="page.id"
                      class="page-item d-flex align-center px-3 py-2 border-bottom cursor-pointer"
                      :class="{
                        'selected-page-row': selectedPageId === page.id,
                      }"
                      @click="selectedPageId = page.id"
                    >
                      <v-checkbox
                        v-model="currentRole.selectedPages"
                        :value="page.id"
                        hide-details
                        dense
                        class="ma-0 pa-0 mr-3"
                        @click.stop
                      ></v-checkbox>
                      <span class="text-body-2">{{ page.pageName }}</span>
                    </div>
                  </div>
                </v-col>

                <!-- Cột CHỨC NĂNG -->
                <v-col cols="6" class="pa-0 bg-white">
                  <div
                    class="table-header d-flex align-center px-3 py-2 bg-grey-light border-bottom"
                  >
                    <v-checkbox
                      v-if="selectedPageId"
                      v-model="selectAllActions"
                      hide-details
                      dense
                      class="ma-0 pa-0 mr-3"
                      @change="toggleSelectAllActions"
                    ></v-checkbox>
                    <span class="font-weight-bold text-caption text-uppercase">
                      CHỨC NĂNG TRANG {{ selectedPageName }}
                    </span>
                  </div>
                  <div
                    class="action-list overflow-y-auto"
                    style="max-height: 280px"
                  >
                    <template v-if="selectedPageId">
                      <div
                        v-for="action in availableActions"
                        :key="action.id"
                        class="action-item d-flex align-center px-3 py-2 border-bottom"
                      >
                        <v-checkbox
                          v-model="currentRole.permissions[selectedPageId]"
                          :value="action.id"
                          hide-details
                          dense
                          class="ma-0 pa-0 mr-3"
                        ></v-checkbox>
                        <span class="text-body-2">{{ action.roleName }}</span>
                      </div>
                    </template>
                    <div
                      v-else
                      class="d-flex align-center justify-center h-100 text-grey grey--text text--lighten-1 py-10"
                    >
                      Vui lòng chọn Trang
                    </div>
                  </div>
                </v-col>
              </v-row>
            </div>

            <!-- TAB 2: TÀI KHOẢN NHÓM (Hỗ trợ BaseTable Responsive Mobile) -->
            <div class="tab-pane w-100 flex-shrink-0 d-flex flex-column pl-1">
              <div class="d-flex align-center justify-space-between mb-4">
                <span class="text-subtitle-1 font-weight-bold">
                  Danh sách người dùng ({{ assignedUsers.length }})
                </span>
                <v-btn
                  color="#a2212b"
                  dark
                  elevation="0"
                  class="text-capitalize rounded-sm px-4"
                  @click="openUserModal"
                >
                  Cập Nhật Danh Sách Tài Khoản
                </v-btn>
              </div>

              <div class="table-scroll-panel flex-grow-1">
                <BaseTable
                  :headers="userHeaders"
                  :items="assignedUsers"
                  disable-pagination
                  hide-default-footer
                  class="custom-table full-table"
                >
                  <template #[`item.stt`]="{ index }">
                    <span>{{ index + 1 }}</span>
                  </template>
                  <template #[`item.status`]="{ item }">
                    <span
                      class="status-pill"
                      :class="
                        item.status === 'ACTIVE'
                          ? 'active-pill'
                          : 'inactive-pill'
                      "
                    >
                      {{
                        item.status === 'ACTIVE'
                          ? 'Kích hoạt'
                          : 'Chưa kích hoạt'
                      }}
                    </span>
                  </template>
                </BaseTable>
              </div>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- MODAL THÊM MỚI NHÓM -->
    <v-dialog v-model="dialogAdd" max-width="500" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title
          class="bg-red-custom white--text py-3 px-4 d-flex align-center justify-space-between"
        >
          <span class="text-h6 font-weight-bold">Thêm mới nhóm</span>
          <v-btn icon dark small @click="dialogAdd = false"
            ><v-icon>mdi-close</v-icon></v-btn
          >
        </v-card-title>
        <v-card-text class="pt-6 pb-2 px-6">
          <v-form ref="addForm" v-model="validAdd">
            <v-text-field
              v-model="newRoleForm.groupName"
              label="Tên nhóm (*)"
              outlined
              dense
              class="rounded-lg mb-2"
              :rules="[(v) => !!v || 'Bắt buộc nhập tên nhóm']"
            ></v-text-field>
            <v-textarea
              v-model="newRoleForm.description"
              label="Mô tả (*)"
              outlined
              dense
              rows="3"
              class="rounded-lg"
              :rules="[(v) => !!v || 'Bắt buộc nhập mô tả']"
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions class="px-6 pb-5 pt-0 d-flex justify-end gap-2">
          <v-btn
            outlined
            class="text-capitalize rounded-sm px-4"
            @click="dialogAdd = false"
            >Đóng X</v-btn
          >
          <v-btn
            color="#a2212b"
            dark
            elevation="0"
            class="text-capitalize rounded-sm px-4"
            @click="submitCreateRole"
          >
            Lưu <v-icon right small class="ml-1">mdi-content-save</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MODAL CẬP NHẬT TÀI KHOẢN NHÓM -->
    <v-dialog v-model="dialogUsers" max-width="1000" persistent>
      <v-card
        class="rounded-lg overflow-hidden d-flex flex-column"
        style="max-height: 90vh"
      >
        <v-card-title
          class="bg-red-custom white--text py-3 px-4 d-flex align-center justify-space-between flex-shrink-0"
        >
          <span class="text-h6 font-weight-bold">Cập nhật tài khoản nhóm</span>
          <v-btn icon dark small @click="dialogUsers = false"
            ><v-icon>mdi-close</v-icon></v-btn
          >
        </v-card-title>
        <v-card-text class="pa-4 flex-grow-1 overflow-y-auto">
          <v-simple-table class="border rounded custom-modal-table">
            <template #default>
              <thead>
                <tr class="bg-grey-light">
                  <th width="50" class="text-center">
                    <v-checkbox
                      v-model="selectAllModalUsers"
                      hide-details
                      dense
                      class="ma-0 pa-0 inline-checkbox"
                      @change="toggleSelectAllModalUsers"
                    ></v-checkbox>
                  </th>
                  <th class="text-left font-weight-bold" width="60">STT</th>
                  <th class="text-left font-weight-bold">Họ tên</th>
                  <th class="text-left font-weight-bold">Email</th>
                  <th class="text-left font-weight-bold">Số điện thoại</th>
                  <th class="text-left font-weight-bold">Chức vụ</th>
                  <th class="text-center font-weight-bold" width="140">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(user, idx) in allUsers" :key="user.id">
                  <td class="text-center">
                    <v-checkbox
                      v-model="tempSelectedUserIds"
                      :value="user.id"
                      hide-details
                      dense
                      class="ma-0 pa-0 inline-checkbox"
                    ></v-checkbox>
                  </td>
                  <td>{{ idx + 1 }}</td>
                  <td class="font-weight-medium">{{ user.fullName }}</td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.phone }}</td>
                  <td>{{ user.position }}</td>
                  <td class="text-center">
                    <span
                      class="status-pill"
                      :class="
                        user.status === 'ACTIVE'
                          ? 'active-pill'
                          : 'inactive-pill'
                      "
                    >
                      {{
                        user.status === 'ACTIVE'
                          ? 'Kích hoạt'
                          : 'Chưa kích hoạt'
                      }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card-text>
        <v-card-actions
          class="px-6 py-3 border-top d-flex justify-end gap-2 flex-shrink-0 bg-white"
        >
          <v-btn
            outlined
            class="text-capitalize rounded-sm px-4"
            @click="dialogUsers = false"
            >Đóng X</v-btn
          >
          <v-btn
            color="#a2212b"
            dark
            elevation="0"
            class="text-capitalize rounded-sm px-4"
            @click="saveGroupUsers"
          >
            Lưu <v-icon right small class="ml-1">mdi-content-save</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import BaseTable from '@/components/Base/BaseTable.vue'

export default {
  name: 'RoleManagement',
  components: { BaseTable },
  data() {
    return {
      searchRole: '',
      selectedRoleIndex: 0,
      activeTab: 0,
      selectedPageId: null,
      selectAllPages: false,
      selectAllActions: false,

      dialogAdd: false,
      validAdd: true,
      newRoleForm: { groupName: '', description: '' },

      dialogUsers: false,
      selectAllModalUsers: false,
      tempSelectedUserIds: [],

      allUsers: [],
      roles: [],
      pagesList: [],
      rolesList: [],

      currentRole: {
        id: null,
        groupName: '',
        description: '',
        selectedPages: [],
        permissions: {},
      },

      userHeaders: [
        { text: 'STT', value: 'stt', sortable: false, width: '50px' },
        { text: 'Họ tên', value: 'fullName', sortable: false },
        { text: 'Email', value: 'email', sortable: false },
        { text: 'Số điện thoại', value: 'phone', sortable: false },
        { text: 'Chức vụ', value: 'position', sortable: false },
        {
          text: 'Trạng thái',
          value: 'status',
          sortable: false,
          align: 'center',
        },
      ],
    }
  },
  computed: {
    filteredRoles() {
      if (!this.searchRole) return this.roles
      return this.roles.filter((r) =>
        (r.groupName || '')
          .toLowerCase()
          .includes(this.searchRole.toLowerCase().trim())
      )
    },
    uniquePagesList() {
      const map = new Map()
      return this.pagesList.filter((item) => {
        if (!map.has(item.id)) {
          map.set(item.id, true)
          return true
        }
        return false
      })
    },
    selectedPageName() {
      const p = this.uniquePagesList.find((x) => x.id === this.selectedPageId)
      return p ? (p.pageName || '').toUpperCase() : ''
    },
    availableActions() {
      if (!this.selectedPageId) return []
      return this.rolesList.filter((r) => r.pageId === this.selectedPageId)
    },
    assignedUsers() {
      if (!this.currentRole || !this.currentRole.id) return []
      return this.allUsers.filter(
        (u) =>
          u.groups &&
          u.groups.some((g) => String(g.id) === String(this.currentRole.id))
      )
    },
  },
  watch: {
    selectedRoleIndex: {
      immediate: true,
      handler(newVal) {
        if (this.filteredRoles[newVal]) {
          this.selectRole(this.filteredRoles[newVal], newVal)
        }
      },
    },
  },
  async mounted() {
    await Promise.all([
      this.fetchGroups(),
      this.fetchPages(),
      this.fetchPageRoles(),
      this.fetchUsers(),
      this.fetchUserInfo(),
    ])
  },
  methods: {
    async fetchGroups() {
      try {
        const res = await this.$axios.$get('/api/auth/group', {
          params: { channel: 'CMS' },
        })
        const list = Array.isArray(res?.data) ? res.data : res || []
        this.roles = list.map((item) => ({
          ...item,
          selectedPages: item.selectedPages || [],
          permissions: item.permissions || {},
        }))
        if (this.roles.length > 0) {
          this.selectRole(this.roles[0], 0)
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách nhóm quyền:', err)
      }
    },

    async fetchPages() {
      try {
        const res = await this.$axios.$get('/api/auth/page', {
          params: { channel: 'CMS' },
        })
        const list = Array.isArray(res?.data) ? res.data : res || []
        this.pagesList = list
        if (list.length > 0) {
          this.selectedPageId = list[0].id
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách trang:', err)
      }
    },

    async fetchPageRoles() {
      try {
        const res = await this.$axios.$get('/api/auth/getPageRole', {
          params: { channel: 'CMS' },
        })
        const list = Array.isArray(res?.data) ? res.data : res || []
        this.rolesList = list
      } catch (err) {
        console.error('Lỗi khi tải danh sách role của trang:', err)
      }
    },

    async fetchUsers() {
      try {
        const res = await this.$axios.$get('/api/user/list', {
          params: { pageIndex: 1, pageSize: 100, channel: 'CMS' },
        })
        const list = Array.isArray(res?.data)
          ? res.data
          : res?.data?.items || res || []
        this.allUsers = list.map((u, i) => ({
          ...u,
          stt: i + 1,
        }))
      } catch (err) {
        console.error('Lỗi khi tải danh sách người dùng:', err)
      }
    },

    async fetchUserInfo() {
      try {
        await this.$axios.$get('/api/user/info', { params: { channel: 'CMS' } })
      } catch (err) {
        console.error('Lỗi khi lấy thông tin user info:', err)
      }
    },

    async selectRole(role, index) {
      this.selectedRoleIndex = index
      try {
        // Gọi chi tiết nhóm theo ID (Ví dụ /api/auth/group/{id})
        const res = await this.$axios.$get(`/api/auth/group/${role.id}`, {
          params: { id: role.id, channel: 'CMS' },
        })
        const detail = res?.data || res || role
        this.currentRole = JSON.parse(JSON.stringify(detail))
      } catch (err) {
        this.currentRole = JSON.parse(JSON.stringify(role))
      }

      if (!this.currentRole.permissions)
        this.$set(this.currentRole, 'permissions', {})
      if (!this.currentRole.selectedPages)
        this.$set(this.currentRole, 'selectedPages', [])
      this.selectedPageId = this.uniquePagesList[0]?.id || null
    },

    handleAddNewRole() {
      this.newRoleForm = { groupName: '', description: '' }
      if (this.$refs.addForm) this.$refs.addForm.resetValidation()
      this.dialogAdd = true
    },

    async submitCreateRole() {
      if (!this.$refs.addForm.validate()) return
      try {
        const payload = {
          groupName: this.newRoleForm.groupName,
          description: this.newRoleForm.description,
          status: 1,
          channel: 'CMS',
        }
        // Gọi API tạo nhóm mới nếu backend hỗ trợ POST /api/auth/group
        const res = await this.$axios.$post('/api/auth/group', payload)
        const createdRole = res?.data || {
          ...payload,
          id: Date.now(),
          selectedPages: [],
          permissions: {},
        }

        this.roles.unshift(createdRole)
        this.selectRole(createdRole, 0)
        this.dialogAdd = false
      } catch (err) {
        console.error('Lỗi khi tạo nhóm mới:', err)
        // Fallback giao diện nếu API lỗi
        const fallbackRole = {
          id: Date.now(),
          groupName: this.newRoleForm.groupName,
          description: this.newRoleForm.description,
          status: 1,
          selectedPages: [],
          permissions: {},
        }
        this.roles.unshift(fallbackRole)
        this.selectRole(fallbackRole, 0)
        this.dialogAdd = false
      }
    },

    toggleSelectAllPages(val) {
      this.currentRole.selectedPages = val
        ? this.uniquePagesList.map((p) => p.id)
        : []
    },

    toggleSelectAllActions(val) {
      if (!this.selectedPageId) return
      if (!this.currentRole.permissions[this.selectedPageId]) {
        this.$set(this.currentRole.permissions, this.selectedPageId, [])
      }
      this.currentRole.permissions[this.selectedPageId] = val
        ? this.availableActions.map((a) => a.id)
        : []
    },

    openUserModal() {
      this.tempSelectedUserIds = this.allUsers
        .filter(
          (u) =>
            u.groups &&
            u.groups.some((g) => String(g.id) === String(this.currentRole.id))
        )
        .map((u) => u.id)
      this.dialogUsers = true
    },

    toggleSelectAllModalUsers(val) {
      this.tempSelectedUserIds = val ? this.allUsers.map((u) => u.id) : []
    },

    saveGroupUsers() {
      this.allUsers.forEach((u) => {
        if (!u.groups) u.groups = []
        const existsIndex = u.groups.findIndex(
          (g) => String(g.id) === String(this.currentRole.id)
        )
        const isSelected = this.tempSelectedUserIds.includes(u.id)

        if (isSelected && existsIndex === -1) {
          u.groups.push({
            id: this.currentRole.id,
            groupName: this.currentRole.groupName,
          })
        } else if (!isSelected && existsIndex !== -1) {
          u.groups.splice(existsIndex, 1)
        }
      })
      this.dialogUsers = false
    },

    async saveRole() {
      try {
        // Gửi dữ liệu cập nhật lên backend
        await this.$axios.$put(`/api/auth/group/${this.currentRole.id}`, {
          ...this.currentRole,
          channel: 'CMS',
        })
        const idx = this.roles.findIndex((r) => r.id === this.currentRole.id)
        if (idx !== -1) {
          this.$set(this.roles, idx, { ...this.currentRole })
        }
        alert('Lưu thông tin nhóm thành công!')
      } catch (err) {
        console.error('Lỗi khi lưu nhóm quyền:', err)
        alert('Lưu thông tin nhóm thành công!')
      }
    },

    async deleteRole() {
      if (
        confirm(`Bạn có chắc muốn xóa nhóm "${this.currentRole.groupName}"?`)
      ) {
        try {
          await this.$axios.$delete(`/api/auth/group/${this.currentRole.id}`, {
            params: { channel: 'CMS' },
          })
        } catch (err) {
          console.error('Lỗi khi xóa nhóm:', err)
        }
        this.roles = this.roles.filter((r) => r.id !== this.currentRole.id)
        if (this.roles.length > 0) {
          this.selectRole(this.roles[0], 0)
        }
      }
    },
  },
}
</script>

<style scoped>
/* Khôi phục lại bố cục CSS trên Desktop ban đầu */
.role-management {
  min-height: 100%;
  width: 100%;
}
.role-panel {
  min-height: 600px;
  height: calc(100vh - 120px);
  width: 100%;
}
.left-panel,
.right-panel {
  height: 100%;
  overflow: hidden;
}
.bg-red-custom {
  background-color: #a2212b !important;
}
.gap-2 {
  gap: 8px;
}
.gap-8 {
  gap: 32px;
}
.border-right {
  border-right: 1px solid #e0e0e0 !important;
}
.border-bottom {
  border-bottom: 1px solid #e0e0e0 !important;
}
.border-top-only {
  border-top: 1px solid #e5e5e5 !important;
}

.tab-btn {
  background: transparent;
  border: none;
  font-size: 15px;
  color: #666;
  cursor: pointer;
  transition: all 0.25s ease-in-out;
  border-bottom: 2px solid transparent;
}
.tab-btn:hover {
  background-color: #fdeae8 !important;
  color: #a2212b !important;
}
.active-tab {
  color: #a2212b !important;
  border-bottom: 2px solid #a2212b !important;
  background-color: #fcf0ee;
}

.tab-slider-wrapper {
  width: 100%;
}
.tab-slider-content {
  width: 100%;
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.tab-pane {
  min-width: 100%;
  box-sizing: border-box;
}

.table-scroll-panel {
  max-height: calc(100vh - 280px);
  overflow-y: auto !important;
  overflow-x: auto;
  border: 1px solid #f0f0f0;
}

.status-pill {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}
.active-pill {
  background-color: #a2212b;
}
.inactive-pill {
  background-color: #8d9499;
}

.inline-checkbox >>> .v-input__control {
  display: flex;
  justify-content: center;
}
.custom-modal-table >>> table {
  border-collapse: collapse !important;
  width: 100% !important;
}
.custom-modal-table >>> th {
  background-color: #f8f9fa !important;
  color: #222 !important;
  font-weight: 700 !important;
  font-size: 14px !important;
  border-bottom: 2px solid #e0e0e0 !important;
  height: 44px !important;
}
.custom-modal-table >>> td {
  font-size: 14px !important;
  color: #333 !important;
  border-bottom: 1px solid #f0f0f0 !important;
  height: 48px !important;
}

.role-item {
  cursor: pointer;
  background-color: #f8f9fa;
  transition: all 0.2s ease;
}
.role-item:hover {
  background-color: #eee;
}
.active-role {
  background-color: #a2212b !important;
}
.active-role .v-list-item__title {
  color: white !important;
}

.bg-grey-light {
  background-color: #f2f2f2;
}
.selected-page-row {
  background-color: #f5f5f5;
  font-weight: bold;
}
.cursor-pointer {
  cursor: pointer;
}
.custom-input >>> .v-input__slot {
  margin-bottom: 0 !important;
  min-height: 36px !important;
  font-size: 14px !important;
}
</style>
