<template>
  <div class="role-management pa-3 bg-light font-sans">
    <v-row no-gutters class="border rounded bg-white overflow-hidden role-panel px-0 py-0">
      <!-- CỘT BÊN TRÁI: Danh sách nhóm người dùng -->
      <v-col cols="12" md="4" lg="3" class="border-right pa-4 d-flex flex-column left-panel">
        <div class="d-flex justify-space-between align-center mb-3">
          <span class="text-h5 font-weight-bold">Nhóm người dùng</span>
          <v-btn color="#a2212b" dark class="text-capitalize rounded-sm elevation-0 px-4 py-2" @click="handleAddNewRole">
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
          class="custom-input"
        ></v-text-field>

        <!-- Danh sách Nhóm -->
        <div class="role-list overflow-y-auto mt-0">
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
                    {{ role.name }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </div>
      </v-col>

      <!-- CỘT BÊN PHẢI: Thông tin chi tiết & Phân quyền -->
      <v-col cols="12" md="8" lg="9" class="pa-4 d-flex flex-column right-panel">
        <!-- Header & Action Buttons -->
        <div class="d-flex align-center justify-space-between pb-2 mb-3 border-bottom detail-header px-0">
          <!-- Tabs Navigation -->
          <div class="d-flex gap-4 tab-nav">
            <button
              class="tab-btn font-weight-bold pb-2"
              :class="{ 'active-tab': activeTab === 'info' }"
              @click="activeTab = 'info'"
            >
              Thông Tin Nhóm
            </button>
            <button
              class="tab-btn font-weight-bold pb-2 grey--text text--darken-1"
              :class="{ 'active-tab': activeTab === 'users' }"
              @click="activeTab = 'users'"
            >
              Tài Khoản Nhóm
            </button>
          </div>

          <!-- Action Buttons -->
          <div class="d-flex gap-2">
            <v-btn color="#f44336" dark elevation="0" class="text-capitalize rounded-sm px-3" @click="deleteRole">
              Xóa <v-icon right small class="ml-1">mdi-delete-outline</v-icon>
            </v-btn>
            <v-btn color="#a2212b" dark elevation="0" class="text-capitalize rounded-sm px-3" @click="saveRole">
              Lưu <v-icon right small class="ml-1">mdi-content-save-outline</v-icon>
            </v-btn>
          </div>
        </div>

        <!-- TAB 1: THÔNG TIN NHÓM & PHÂN QUYỀN -->
        <div v-if="activeTab === 'info'" class="flex-grow-1">
          <v-form ref="roleForm" class="mb-4">
            <v-text-field
              v-model="currentRole.name"
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
            ></v-text-field>
          </v-form>

          <!-- BẢNG PHÂN QUYỀN (TRANG - CHỨC NĂNG) -->
          <v-row dense class="permission-matrix border rounded overflow-hidden">
            <!-- Cột TRANG -->
            <v-col cols="6" class="border-right pa-0">
              <div class="table-header d-flex align-center px-3 py-2 bg-grey-light border-bottom">
                <v-checkbox
                  v-model="selectAllPages"
                  hide-details
                  dense
                  class="ma-0 pa-0 mr-3"
                  @change="toggleSelectAllPages"
                ></v-checkbox>
                <span class="font-weight-bold text-caption text-uppercase">TRANG</span>
              </div>
              <div class="page-list overflow-y-auto" style="max-height: 320px;">
                <div
                  v-for="page in pagesList"
                  :key="page.id"
                  class="page-item d-flex align-center px-3 py-2 border-bottom cursor-pointer"
                  :class="{ 'selected-page-row': selectedPageId === page.id }"
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
                  <span class="text-body-2">{{ page.name }}</span>
                </div>
              </div>
            </v-col>

            <!-- Cột CHỨC NĂNG -->
            <v-col cols="6" class="pa-0 bg-white">
              <div class="table-header d-flex align-center px-3 py-2 bg-grey-light border-bottom">
                <v-checkbox
                  v-if="selectedPageId"
                  v-model="selectAllActions"
                  hide-details
                  dense
                  class="ma-0 pa-0 mr-3"
                  @change="toggleSelectAllActions"
                ></v-checkbox>
                <span class="font-weight-bold text-caption text-uppercase">CHỨC NĂNG</span>
              </div>
              <div class="action-list overflow-y-auto" style="max-height: 320px;">
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
                    <span class="text-body-2">{{ action.name }}</span>
                  </div>
                </template>
                <div v-else class="d-flex align-center justify-center h-100 text-grey grey--text text--lighten-1 py-10">
                  Vui lòng chọn Trang
                </div>
              </div>
            </v-col>
          </v-row>
        </div>

        <!-- TAB 2: TÀI KHOẢN NHÓM -->
        <div v-else-if="activeTab === 'users'" class="py-4 text-center text-grey">
          <span>Danh sách tài khoản thuộc nhóm này (Đang cập nhật...)</span>
        </div>
      </v-col>
    </v-row>

    <!-- MODAL THÊM MỚI -->
    <v-dialog v-model="dialogAdd" max-width="500" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <!-- Header màu đỏ chuẩn UI -->
        <v-card-title class="bg-red-custom white--text py-3 px-4 d-flex align-center justify-space-between">
          <span class="text-h6 font-weight-bold">Thêm mới</span>
          <v-btn icon dark small @click="dialogAdd = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <!-- Form nhập liệu -->
        <v-card-text class="pt-6 pb-2 px-6">
          <v-form ref="addForm" v-model="validAdd">
            <v-text-field
              v-model="newRoleForm.name"
              label="Tên nhóm (*)"
              outlined
              dense
              class="rounded-lg mb-2"
              :rules="[v => !!v || 'Bắt buộc nhập tên nhóm']"
            ></v-text-field>

            <v-textarea
              v-model="newRoleForm.description"
              label="Mô tả (*)"
              outlined
              dense
              rows="3"
              class="rounded-lg"
              :rules="[v => !!v || 'Bắt buộc nhập mô tả']"
            ></v-textarea>
          </v-form>
        </v-card-text>

        <!-- Footer hành động -->
        <v-card-actions class="px-6 pb-5 pt-0 d-flex justify-end gap-2">
          <v-btn
            outlined
            class="text-capitalize rounded-sm px-4"
            @click="dialogAdd = false"
          >
            Đóng X
          </v-btn>
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
  </div>
</template>

<script>
export default {
  name: 'RoleManagement',
  data() {
    return {
      searchRole: '',
      selectedRoleIndex: 0,
      activeTab: 'info',
      selectedPageId: null,
      selectAllPages: false,
      selectAllActions: false,

      // Modal state & Form Thêm Mới
      dialogAdd: false,
      validAdd: true,
      newRoleForm: {
        name: '',
        description: ''
      },

      // Danh sách các Nhóm người dùng
      roles: [
        { id: 1, name: 'Học lại', description: 'test', selectedPages: [1, 2, 3, 4, 5, 6, 7], permissions: { 1: ['view', 'add', 'edit', 'delete'] } },
        { id: 2, name: 'haha hihi', description: 'mô tả 2', selectedPages: [], permissions: {} },
        { id: 3, name: 'Quản trị hệ thống', description: 'Quản trị viên', selectedPages: [1, 2], permissions: {} },
        { id: 4, name: 'admin', description: 'Admin hệ thống', selectedPages: [], permissions: {} },
        { id: 5, name: 'Tach nua', description: 'Mô tả khác', selectedPages: [], permissions: {} }
      ],

      // Form hiện tại
      currentRole: {
        id: null,
        name: '',
        description: '',
        selectedPages: [],
        permissions: {}
      },

      // Danh sách trang
      pagesList: [
        { id: 1, name: 'Quản lý học lại' },
        { id: 2, name: 'Quản lý đợt đăng ký học lại' },
        { id: 3, name: 'Danh sách sinh viên phải học lại' },
        { id: 4, name: 'Danh sách sinh viên đã đăng ký học lại' },
        { id: 5, name: 'Danh sách lớp học lại' },
        { id: 6, name: 'Kết quả học lại' },
        { id: 7, name: 'Quản lý báo về lại' }
      ],

      // Danh sách chức năng
      availableActions: [
        { id: 'view', name: 'Xem' },
        { id: 'add', name: 'Thêm mới' },
        { id: 'edit', name: 'Chỉnh sửa' },
        { id: 'delete', name: 'Xóa' },
        { id: 'export', name: 'Xuất Excel' }
      ]
    }
  },
  computed: {
    filteredRoles() {
      if (!this.searchRole) return this.roles
      return this.roles.filter(r => r.name.toLowerCase().includes(this.searchRole.toLowerCase()))
    }
  },
  watch: {
    selectedRoleIndex: {
      immediate: true,
      handler(newVal) {
        if (this.filteredRoles[newVal]) {
          this.selectRole(this.filteredRoles[newVal], newVal)
        }
      }
    }
  },
  methods: {
    selectRole(role, index) {
      this.selectedRoleIndex = index
      this.currentRole = JSON.parse(JSON.stringify(role))
      if (!this.currentRole.permissions) {
        this.$set(this.currentRole, 'permissions', {})
      }
      this.selectedPageId = this.pagesList[0]?.id || null
    },

    // Mở popup Thêm Mới
    handleAddNewRole() {
      this.newRoleForm = { name: '', description: '' }
      if (this.$refs.addForm) this.$refs.addForm.resetValidation()
      this.dialogAdd = true
    },

    // Lưu thông tin từ Modal Thêm Mới
    submitCreateRole() {
      if (!this.$refs.addForm.validate()) return

      const createdRole = {
        id: Date.now(),
        name: this.newRoleForm.name,
        description: this.newRoleForm.description,
        selectedPages: [],
        permissions: {}
      }

      this.roles.unshift(createdRole)
      this.selectRole(createdRole, 0)
      this.dialogAdd = false
    },

    toggleSelectAllPages(val) {
      if (val) {
        this.currentRole.selectedPages = this.pagesList.map(p => p.id)
      } else {
        this.currentRole.selectedPages = []
      }
    },

    toggleSelectAllActions(val) {
      if (!this.selectedPageId) return
      if (!this.currentRole.permissions[this.selectedPageId]) {
        this.$set(this.currentRole.permissions, this.selectedPageId, [])
      }
      if (val) {
        this.currentRole.permissions[this.selectedPageId] = this.availableActions.map(a => a.id)
      } else {
        this.currentRole.permissions[this.selectedPageId] = []
      }
    },

    saveRole() {
      const idx = this.roles.findIndex(r => r.id === this.currentRole.id)
      if (idx !== -1) {
        this.$set(this.roles, idx, { ...this.currentRole })
        alert('Lưu thông tin thành công!')
      }
    },

    deleteRole() {
      if (confirm(`Bạn có chắc muốn xóa nhóm "${this.currentRole.name}"?`)) {
        this.roles = this.roles.filter(r => r.id !== this.currentRole.id)
        if (this.roles.length > 0) {
          this.selectRole(this.roles[0], 0)
        }
      }
    }
  }
}
</script>

<style scoped>
.role-management {
  min-height: calc(100vh - 100px);
  width: 100%;
  max-width: 100%;
}

.role-panel {
  min-height: 640px;
  height: calc(100vh - 150px);
  width: 100%;
  max-width: 100%;
}

.left-panel,
.right-panel {
  min-height: 100%;
}

.tab-nav {
  font-size: 1.05rem;
}

.bg-red-custom {
  background-color: #a2212b !important;
}

.gap-2 { gap: 8px; }
.gap-4 { gap: 16px; }

.border-right {
  border-right: 1px solid #e0e0e0 !important;
}

.border-bottom {
  border-bottom: 1px solid #e0e0e0 !important;
}

/* Custom Role Active Item */
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

.role-item,
.role-item .v-list-item__title {
  color: #212121 !important;
}

/* Tab active style */
.tab-btn {
  background: none;
  border: none;
  font-size: 15px;
  cursor: pointer;
  position: relative;
}

.active-tab {
  color: #a2212b;
  border-bottom: 2px solid #a2212b;
}

/* Custom Table Header & Items */
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

.role-list {
  flex: 50 0 auto !important;
  margin-top: 0 !important;
}

.role-list ::v-deep .v-list {
  padding-top: 0 !important;
}

.custom-input ::v-deep .v-input__slot {
  margin-bottom: 0 !important;
  min-height: 40px !important;
  height: 40px;
}
</style>