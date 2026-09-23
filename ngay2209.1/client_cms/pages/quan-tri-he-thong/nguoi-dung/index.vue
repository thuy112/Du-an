<template>
  <div class="user-page pa-3">
    <!-- Thanh công cụ (Toolbar & Filter) - Chỉ có 1 gạch dưới -->
    <div class="d-flex align-center justify-space-between pb-3 mb-3 border-bottom-only flex-wrap gap-2">
      <!-- Số lượng người dùng lấy động theo kết quả lọc -->
      <div class="text-h6 font-weight-bold">
        Danh sách người dùng ({{ filteredUsers.length }})
      </div>

      <div class="d-flex align-center gap-2">
        <v-text-field
          v-model="filters.fullName"
          placeholder="Họ tên"
          outlined
          dense
          hide-details
          style="max-width: 220px"
          class="bg-white rounded custom-input"
          @keyup.enter="searchUsers"
        ></v-text-field>

        <v-text-field
          v-model="filters.email"
          placeholder="Email"
          outlined
          dense
          hide-details
          style="max-width: 220px"
          class="bg-white rounded custom-input"
          @keyup.enter="searchUsers"
        ></v-text-field>

        <v-select
          v-model="filters.status"
          :items="statusOptions"
          placeholder="Trạng thái"
          outlined
          dense
          hide-details
          clearable
          style="max-width: 170px"
          class="bg-white rounded custom-input"
          @change="searchUsers"
        ></v-select>

        <v-btn icon color="#a2212b" class="border-btn rounded-sm" @click="resetFilters">
          <v-icon color="#a2212b">mdi-refresh</v-icon>
        </v-btn>

        <v-btn color="#a2212b" dark elevation="0" class="min-w-0 px-3 rounded-sm" @click="searchUsers">
          <v-icon small>mdi-magnify</v-icon>
        </v-btn>

        <v-btn color="#a2212b" dark elevation="0" class="min-w-0 px-3 rounded-sm" @click="openAddModal">
          <v-icon small>mdi-plus</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- Bảng dữ liệu tràn viền Full width + Chữ to rộng rãi -->
    <div class="w-100">
      <div class="table-scroll-panel">
        <v-data-table
          :headers="headers"
          :items="paginatedUsers"
          :loading="loading"
          hide-default-footer
          class="custom-table full-table"
        >
          <!-- Cột STT hiển thị theo ID tăng dần -->
          <template #[`item.stt`]="{ item }">
            <span class="font-weight-medium text-body-2">{{ item.id }}</span>
          </template>

          <!-- Cột Họ tên + Avatar -->
          <template #[`item.fullName`]="{ item }">
            <div class="d-flex align-center py-2">
              <v-avatar size="40" class="mr-3">
                <v-img v-if="item.avatar" :src="item.avatar"></v-img>
                <v-icon v-else color="#a2212b" x-large>mdi-account-circle</v-icon>
              </v-avatar>
              <span class="font-weight-bold red--text text--darken-4 text-body-1">{{ item.fullName }}</span>
            </div>
          </template>

          <!-- Cột Trạng thái (Pill Dropdown) -->
          <template #[`item.status`]="{ item }">
            <v-select
              v-model="item.status"
              :items="statusOptions"
              dense
              flat
              solo
              hide-details
              class="status-select"
              :class="item.status === 'Kích hoạt' ? 'active-status' : 'inactive-status'"
              @change="updateStatus(item)"
            ></v-select>
          </template>

          <!-- Cột Chức năng (3 chấm) -->
          <template #[`item.actions`]="{ item }">
            <v-menu offset-y left>
              <template #activator="{ on, attrs }">
                <v-btn icon v-bind="attrs" v-on="on">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list dense class="py-0">
                <v-list-item @click="editUser(item)">
                  <v-list-item-icon class="mr-2">
                    <v-icon small color="blue">mdi-pencil</v-icon>
                  </v-list-item-icon>
                  <v-list-item-title class="text-body-2">Chỉnh sửa</v-list-item-title>
                </v-list-item>
                <v-list-item @click="deleteUser(item)">
                  <v-list-item-icon class="mr-2">
                    <v-icon small color="red">mdi-delete</v-icon>
                  </v-list-item-icon>
                  <v-list-item-title class="text-body-2">Xóa</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </v-data-table>
      </div>

      <!-- Phân trang - Chỉ có 1 gạch viền trên -->
      <div class="d-flex align-center justify-end py-3 border-top-only gap-2 bg-white">
        <span class="body-2 grey--text text--darken-1">Bản ghi</span>
        <v-select
          v-model="itemsPerPage"
          :items="[10, 20, 50, 100]"
          dense
          outlined
          hide-details
          style="max-width: 80px"
          class="custom-input"
          @change="page = 1"
        ></v-select>

        <span class="body-2 grey--text text--darken-1 ml-2">Trang</span>
        <v-text-field
          v-model.number="pageInput"
          dense
          outlined
          hide-details
          style="max-width: 60px"
          class="text-center custom-input"
          @keyup.enter="goToPage"
        ></v-text-field>

        <v-btn color="#a2212b" dark small class="text-capitalize px-3 rounded-sm elevation-0 text-body-2" @click="goToPage">Đi</v-btn>

        <v-btn icon :disabled="page <= 1" @click="page--">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>

        <v-btn small color="#a2212b" dark class="min-w-0 pa-0 rounded-sm elevation-0 text-body-2" style="width: 32px; height: 32px">
          {{ page }}
        </v-btn>

        <v-btn icon :disabled="page >= totalPages" @click="page++">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- Modal Thêm / Sửa người dùng -->
    <v-dialog v-model="dialogUser" max-width="750" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="bg-red-custom white--text d-flex justify-space-between py-3 px-4">
          <span class="text-h6 font-weight-bold">
            {{ isEdit ? 'Cập nhật người dùng' : 'Thêm người dùng' }}
          </span>
          <v-btn icon dark small @click="dialogUser = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pt-6 pb-2 px-6">
          <v-form ref="userForm" v-model="validForm">
            <v-row>
              <v-col cols="12" md="4" class="d-flex flex-column align-center justify-center border-right">
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  class="d-none"
                  @change="handleFileUpload"
                />
                <v-hover v-slot="{ hover }">
                  <v-avatar
                    size="110"
                    color="grey lighten-3"
                    class="cursor-pointer mb-2 elevation-1"
                    @click="triggerSelectFile"
                  >
                    <v-img v-if="form.avatar" :src="form.avatar"></v-img>
                    <v-icon v-else large color="#a2212b">mdi-camera</v-icon>
                    <v-overlay v-if="hover" absolute color="#000" opacity="0.4">
                      <v-icon dark>mdi-camera-plus</v-icon>
                    </v-overlay>
                  </v-avatar>
                </v-hover>
                <span class="body-2 red--text text--darken-3 font-weight-bold cursor-pointer" @click="triggerSelectFile">
                  Tải ảnh lên
                </span>
              </v-col>

              <v-col cols="12" md="8">
                <v-row dense>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="form.fullName"
                      label="Họ & tên (*)"
                      outlined
                      dense
                      :rules="[rules.required]"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="form.password"
                      label="Mật khẩu (*)"
                      type="password"
                      append-icon="mdi-eye-outline"
                      outlined
                      dense
                      :disabled="isEdit"
                      :rules="isEdit ? [] : [rules.required]"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="form.email"
                      label="Email (*)"
                      outlined
                      dense
                      :rules="[rules.required, rules.email]"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="form.phone"
                      label="Số điện thoại (*)"
                      outlined
                      dense
                      :rules="[rules.required, rules.phone]"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="form.position"
                      label="Chức vụ (*)"
                      outlined
                      dense
                      :rules="[rules.required]"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="form.status"
                      :items="statusOptions"
                      label="Trạng thái (*)"
                      outlined
                      dense
                      :rules="[rules.required]"
                    ></v-select>
                  </v-col>

                  <v-col cols="12">
                    <v-select
                      v-model="form.roles"
                      :items="roleOptions"
                      label="Nhóm người dùng"
                      outlined
                      dense
                      multiple
                      chips
                      small-chips
                    ></v-select>
                  </v-col>
                </v-row> <!-- Đã sửa lại thẻ đóng chuẩn v-row -->
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-6 pb-4 pt-0 d-flex justify-end gap-2">
          <v-btn
            outlined
            class="text-capitalize rounded px-4"
            @click="dialogUser = false"
          >
            Đóng X
          </v-btn>
          <v-btn
            color="#a2212b"
            dark
            elevation="0"
            class="text-capitalize rounded px-4"
            @click="saveUser"
          >
            Lưu <v-icon right small>mdi-content-save</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'UserPage',
  data() {
    return {
      loading: false,
      dialogUser: false,
      isEdit: false,
      validForm: false,
      page: 1,
      pageInput: 1,
      itemsPerPage: 50,

      filters: {
        fullName: '',
        email: '',
        status: null
      },

      activeFilters: {
        fullName: '',
        email: '',
        status: null
      },

      headers: [
        { text: 'STT', value: 'stt', sortable: false, width: '70px' },
        { text: 'Họ tên', value: 'fullName', sortable: false },
        { text: 'Email', value: 'email', sortable: false },
        { text: 'Số điện thoại', value: 'phone', sortable: false },
        { text: 'Chức vụ', value: 'position', sortable: false },
        { text: 'Nhóm người dùng ↑', value: 'roleName', sortable: false },
        { text: 'Trạng thái', value: 'status', sortable: false, width: '160px' },
        { text: 'Chức năng', value: 'actions', sortable: false, align: 'center', width: '90px' }
      ],

      statusOptions: ['Kích hoạt', 'Chưa kích hoạt'],
      roleOptions: ['Quản trị hệ thống', 'admin', 'Học lại', 'Giảng viên'],

      users: [
        { id: 1, fullName: 'Bùi Thị Mỹ', email: 'buimy10102003@gmail.com', phone: '0976081622', position: 'Quản trị', roleName: '', status: 'Kích hoạt' },
        { id: 2, fullName: 'test', email: 'test@gmail.com', phone: '0366827983', position: 'cán bộ', roleName: 'Quản trị hệ thống', status: 'Kích hoạt' },
        { id: 3, fullName: 'Anh Tú', email: 'anhtule578@gmail.com', phone: '0987234222', position: 'a', roleName: 'Quản trị hệ thống', status: 'Kích hoạt' },
        { id: 4, fullName: 'Lê Minh Chiến', email: 'le0433348@gmail.com', phone: '0862265204', position: 'Admin', roleName: 'admin', status: 'Chưa kích hoạt' },
        { id: 5, fullName: 'OanhNP', email: 'oanh.np.03@gmail.com', phone: '0349631041', position: 'quản trị', roleName: 'Học lại', status: 'Kích hoạt' },
        { id: 6, fullName: 'Phương Oanh', email: 'oanh.np.2003@gmail.com', phone: '0349752491', position: 'quản trị', roleName: 'Học lại', status: 'Kích hoạt' },
        { id: 7, fullName: 'Lê Hồng Phong', email: 'phong2552001@gmail.com', phone: '0973725501', position: 'dev', roleName: 'Quản trị hệ thống', status: 'Kích hoạt' },
        { id: 8, fullName: 'Nguyễn Thủy Ninh', email: 'tester@mergames.io', phone: '0347682664', position: 'Quản Trị', roleName: 'Quản trị hệ thống', status: 'Kích hoạt' },
        { id: 9, fullName: 'Bùi Thị Quỳnh Giang', email: 'admin1@gmail.com', phone: '0356762828', position: 'Rang', roleName: 'Quản trị hệ thống', status: 'Kích hoạt' }
      ],

      form: {
        id: null,
        fullName: '',
        password: '',
        email: '',
        phone: '',
        position: '',
        status: 'Kích hoạt',
        roles: [],
        avatar: null
      },

      rules: {
        required: v => !!v || 'Thông tin bắt buộc',
        email: v => /.+@.+\..+/.test(v) || 'Email không hợp lệ',
        phone: v => (/^\d{10}$/.test(String(v || '').replace(/\s+/g, '')) && !/\D/.test(String(v || ''))) || 'Số điện thoại phải là 10 chữ số'
      }
    }
  },
  computed: {
    filteredUsers() {
      return this.users.filter(user => {
        const matchName = !this.activeFilters.fullName || user.fullName.toLowerCase().includes(this.activeFilters.fullName.toLowerCase().trim())
        const matchEmail = !this.activeFilters.email || user.email.toLowerCase().includes(this.activeFilters.email.toLowerCase().trim())
        const matchStatus = !this.activeFilters.status || user.status === this.activeFilters.status
        return matchName && matchEmail && matchStatus
      })
    },

    totalPages() {
      return Math.ceil(this.filteredUsers.length / this.itemsPerPage) || 1
    },

    paginatedUsers() {
      const start = (this.page - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredUsers.slice(start, end)
    }
  },
  watch: {
    page(val) {
      this.pageInput = val
    }
  },
  methods: {
    searchUsers() {
      this.activeFilters = { ...this.filters }
      this.page = 1
    },

    resetFilters() {
      this.filters = { fullName: '', email: '', status: null }
      this.activeFilters = { fullName: '', email: '', status: null }
      this.page = 1
    },

    goToPage() {
      const pageNum = parseInt(this.pageInput, 10)
      if (pageNum >= 1 && pageNum <= this.totalPages) {
        this.page = pageNum
      } else {
        this.pageInput = this.page
      }
    },

    openAddModal() {
      this.isEdit = false
      this.form = {
        id: null,
        fullName: '',
        password: '',
        email: '',
        phone: '',
        position: '',
        status: 'Kích hoạt',
        roles: [],
        avatar: null
      }
      this.dialogUser = true
    },

    editUser(item) {
      this.isEdit = true
      this.form = { ...item, password: '', roles: item.roleName ? item.roleName.split(', ') : [] }
      this.dialogUser = true
    },

    saveUser() {
      if (!this.$refs.userForm.validate()) return

      if (this.isEdit) {
        const idx = this.users.findIndex(u => u.id === this.form.id)
        if (idx !== -1) {
          this.$set(this.users, idx, {
            ...this.form,
            roleName: Array.isArray(this.form.roles) ? this.form.roles.join(', ') : ''
          })
        }
      } else {
        const maxId = this.users.reduce((max, u) => (u.id > max ? u.id : max), 0)
        const newUser = {
          ...this.form,
          id: maxId + 1,
          roleName: Array.isArray(this.form.roles) ? this.form.roles.join(', ') : ''
        }
        
        this.users.push(newUser)

        this.resetFilters()
        this.$nextTick(() => {
          this.page = this.totalPages
        })
      }

      this.dialogUser = false
    },

    updateStatus(item) {
      console.log('Trạng thái mới:', item.status)
    },

    deleteUser(item) {
      this.users = this.users
        .filter(u => u.id !== item.id)
        .map((user, index) => ({
          ...user,
          id: index + 1
        }))

      if (this.page > this.totalPages) {
        this.page = this.totalPages
      }
    },

    triggerSelectFile() {
      this.$refs.fileInput.click()
    },

    handleFileUpload(e) {
      const file = e.target.files[0]
      if (file) {
        this.form.avatar = URL.createObjectURL(file)
      }
    }
  }
}
</script>

<style scoped>
/* Màu chủ đạo */
.bg-red-custom {
  background-color: #a2212b !important;
}

.border-btn {
  border: 1px solid #a2212b !important;
}

.custom-input >>> .v-input__control {
  font-size: 14px !important;
}

.border-bottom-only {
  border-bottom: 1px solid #e5e7eb !important;
}

.border-top-only {
  border-top: 1px solid #e5e5e5 !important;
}

.gap-2 {
  gap: 10px;
}

.w-100 {
  width: 100% !important;
}

.table-scroll-panel {
  max-height: 540px;
  overflow-y: auto;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.35) transparent;
}

.table-scroll-panel::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  background: transparent;
}

.table-scroll-panel::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.35);
  border-radius: 999px;
}

.full-table {
  background: transparent !important;
  box-shadow: none !important;
}

.full-table >>> table {
  border-collapse: collapse !important;
  width: 100% !important;
}

.full-table >>> th {
  background-color: #f8f9fa !important;
  color: #222 !important;
  font-weight: 700 !important;
  font-size: 14px !important;
  border-bottom: 2px solid #e0e0e0 !important;
  height: 48px !important;
}

.full-table >>> td {
  font-size: 14px !important;
  color: #333 !important;
  border-bottom: 1px solid #f0f0f0 !important;
  height: 52px !important;
}

.status-select >>> .v-input__slot {
  min-height: 30px !important;
  padding: 0 12px !important;
  border-radius: 14px !important;
  box-shadow: none !important;
}

.status-select >>> .v-select__selection {
  color: white !important;
  font-size: 12px !important;
  font-weight: 600 !important;
}

.status-select >>> .v-icon {
  color: white !important;
  font-size: 18px !important;
}

.active-status >>> .v-input__slot {
  background-color: #a2212b !important;
}

.inactive-status >>> .v-input__slot {
  background-color: #8d9499 !important;
}
</style>