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
                    {{ role.name }}
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
        <!-- Thanh Navigation Tab: Di chuột vào hiện màu đỏ nhạt -->
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

        <!-- VÙNG HIỂN THỊ CHUYỂN SLIDE MƯỢT GIỮA 2 TAB -->
        <div
          class="tab-slider-wrapper flex-grow-1 overflow-hidden position-relative"
        >
          <div
            class="tab-slider-content d-flex h-100"
            :style="{ transform: `translateX(-${activeTab * 100}%)` }"
          >
            <!-- TAB 1: THÔNG TIN NHÓM & PHÂN QUYỀN -->
            <div class="tab-pane w-100 flex-shrink-0 d-flex flex-column pr-1">
              <!-- HÀNG NÚT XÓA VÀ LƯU Ở TRÊN CÙNG (GÓC PHẢI) NẰM TRÊN TÊN NHÓM -->
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
                      v-for="page in pagesList"
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
                      <span class="text-body-2">{{ page.name }}</span>
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
                    <span class="font-weight-bold text-caption text-uppercase"
                      >CHỨC NĂNG trang QUẢN LÝ ĐỢT ĐĂNG KÝ HỌC LẠI</span
                    >
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
                        <span class="text-body-2">{{ action.name }}</span>
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

            <!-- TAB 2: TÀI KHOẢN NHÓM -->
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

              <!-- Bảng danh sách tài khoản thuộc nhóm -->
              <v-simple-table class="border rounded">
                <template #default>
                  <thead>
                    <tr class="bg-grey-light">
                      <th class="text-left font-weight-bold">STT</th>
                      <th class="text-left font-weight-bold">Họ tên</th>
                      <th class="text-left font-weight-bold">Email</th>
                      <th class="text-left font-weight-bold">Số điện thoại</th>
                      <th class="text-left font-weight-bold">Chức vụ</th>
                      <th class="text-center font-weight-bold">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(user, idx) in assignedUsers" :key="user.id">
                      <td>{{ idx + 1 }}</td>
                      <td class="font-weight-medium">{{ user.fullName }}</td>
                      <td>{{ user.email }}</td>
                      <td>{{ user.phone }}</td>
                      <td>{{ user.roleTitle }}</td>
                      <td class="text-center">
                        <span
                          class="status-pill"
                          :class="
                            user.status === 'Kích hoạt'
                              ? 'active-pill'
                              : 'inactive-pill'
                          "
                        >
                          {{ user.status }}
                        </span>
                      </td>
                    </tr>
                    <tr v-if="assignedUsers.length === 0">
                      <td colspan="6" class="text-center py-6 grey--text">
                        Chưa có tài khoản nào thuộc nhóm này
                      </td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- MODAL THÊM MỚI NHÓM NGƯỜI DÙNG -->
    <v-dialog v-model="dialogAdd" max-width="500" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title
          class="bg-red-custom white--text py-3 px-4 d-flex align-center justify-space-between"
        >
          <span class="text-h6 font-weight-bold">Thêm mới</span>
          <v-btn icon dark small @click="dialogAdd = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pt-6 pb-2 px-6">
          <v-form ref="addForm" v-model="validAdd">
            <v-text-field
              v-model="newRoleForm.name"
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
          <v-btn icon dark small @click="dialogUsers = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
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
                <tr v-for="(user, idx) in paginatedModalUsers" :key="user.id">
                  <td class="text-center">
                    <v-checkbox
                      v-model="tempSelectedUserIds"
                      :value="user.id"
                      hide-details
                      dense
                      class="ma-0 pa-0 inline-checkbox"
                    ></v-checkbox>
                  </td>
                  <td>{{ (currentPage - 1) * itemsPerPage + idx + 1 }}</td>
                  <td class="font-weight-medium">{{ user.fullName }}</td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.phone }}</td>
                  <td>{{ user.roleTitle }}</td>
                  <td class="text-center">
                    <span
                      class="status-pill"
                      :class="
                        user.status === 'Kích hoạt'
                          ? 'active-pill'
                          : 'inactive-pill'
                      "
                    >
                      {{ user.status }}
                    </span>
                  </td>
                </tr>
                <tr v-if="paginatedModalUsers.length === 0">
                  <td colspan="7" class="text-center py-6 grey--text">
                    Không tìm thấy dữ liệu phù hợp
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>

          <div
            class="d-flex align-center justify-end py-3 border-top-only gap-2 bg-white mt-4"
          >
            <span class="body-2 grey--text text--darken-1">Bản ghi</span>
            <v-select
              v-model="itemsPerPage"
              :items="[10, 20, 50, 100]"
              dense
              outlined
              hide-details
              style="max-width: 80px"
              class="custom-input"
              @change="currentPage = 1"
            ></v-select>

            <span class="body-2 grey--text text--darken-1 ml-2">Trang</span>
            <v-text-field
              v-model.number="inputPage"
              dense
              outlined
              hide-details
              style="max-width: 60px"
              class="text-center custom-input"
              @keyup.enter="goToPage"
            ></v-text-field>

            <v-btn
              color="#a2212b"
              dark
              small
              class="text-capitalize px-3 rounded-sm elevation-0 text-body-2"
              @click="goToPage"
            >
              Đi
            </v-btn>

            <v-btn icon :disabled="currentPage <= 1" @click="currentPage--">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>

            <v-btn
              v-for="p in totalPages"
              :key="p"
              small
              :color="currentPage === p ? '#a2212b' : ''"
              :dark="currentPage === p"
              :outlined="currentPage !== p"
              class="min-w-0 pa-0 rounded-sm elevation-0 text-body-2"
              style="width: 32px; height: 32px"
              @click="currentPage = p"
            >
              {{ p }}
            </v-btn>

            <v-btn
              icon
              :disabled="currentPage >= totalPages"
              @click="currentPage++"
            >
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </div>
        </v-card-text>

        <v-card-actions
          class="px-6 py-3 border-top d-flex justify-end gap-2 flex-shrink-0 bg-white"
        >
          <v-btn
            outlined
            class="text-capitalize rounded-sm px-4"
            @click="dialogUsers = false"
          >
            Đóng X
          </v-btn>
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
export default {
  name: 'RoleManagement',
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
      newRoleForm: { name: '', description: '' },

      dialogUsers: false,
      selectAllModalUsers: false,
      tempSelectedUserIds: [],

      itemsPerPage: 50,
      currentPage: 1,
      inputPage: 1,

      allUsers: [
        {
          id: 1,
          fullName: 'test',
          email: 'test@gmail.com',
          phone: '0366827983',
          roleTitle: 'cán bộ',
          status: 'Kích hoạt',
        },
        {
          id: 2,
          fullName: 'user',
          email: 'user@gmail.com',
          phone: '0394199632',
          roleTitle: 'newbie',
          status: 'Kích hoạt',
        },
        {
          id: 3,
          fullName: 'Anh Tú',
          email: 'anhtule578@gmail.com',
          phone: '0987234222',
          roleTitle: 'a',
          status: 'Kích hoạt',
        },
        {
          id: 4,
          fullName: 'Lê Minh Chiến',
          email: 'le0433348@gmail.com',
          phone: '0862265204',
          roleTitle: 'Admin',
          status: 'Chưa kích hoạt',
        },
        {
          id: 5,
          fullName: 'Bùi Thị Mỹ',
          email: 'buimy10102003@gmail.com',
          phone: '0976081622',
          roleTitle: 'Quản trị',
          status: 'Kích hoạt',
        },
        {
          id: 6,
          fullName: 'OanhNP',
          email: 'oanh.np.03@gmail.com',
          phone: '0349631041',
          roleTitle: 'quản trị',
          status: 'Kích hoạt',
        },
        {
          id: 7,
          fullName: 'Phương Oanh',
          email: 'oanh.np.2003@gmail.com',
          phone: '0349752491',
          roleTitle: 'quản trị',
          status: 'Kích hoạt',
        },
        {
          id: 8,
          fullName: 'Đỗ Hồng Kiên',
          email: 'dohongkien2003@gmail.com',
          phone: '0987654321',
          roleTitle: 'Developer',
          status: 'Kích hoạt',
        },
        {
          id: 9,
          fullName: 'Lê Hồng Phong',
          email: 'phong2552001@gmail.com',
          phone: '0973725501',
          roleTitle: 'dev',
          status: 'Kích hoạt',
        },
        {
          id: 10,
          fullName: 'Nguyễn Thùy Ninh',
          email: 'tester@mergames.io',
          phone: '0347682664',
          roleTitle: 'Quản Trị',
          status: 'Kích hoạt',
        },
        {
          id: 11,
          fullName: 'Nguyễn Trọng Minh',
          email: 'lkcminh@gmail.com',
          phone: '0972894012',
          roleTitle: 'Can bo',
          status: 'Kích hoạt',
        },
        {
          id: 12,
          fullName: 'Bùi Thị Quỳnh Giang',
          email: 'admin1@gmail.com',
          phone: '0356762828',
          roleTitle: 'Rang',
          status: 'Kích hoạt',
        },
        {
          id: 13,
          fullName: 'Chu Hữu Nam',
          email: 'namch@gmail.com',
          phone: '0845999669',
          roleTitle: 'nam_true',
          status: 'Kích hoạt',
        },
        {
          id: 14,
          fullName: 'Admin',
          email: 'admin@gmail.com',
          phone: '0999999999',
          roleTitle: 'Quản trị hệ thống',
          status: 'Kích hoạt',
        },
      ],

      roles: [
        {
          id: 1,
          name: 'Học lại',
          description: 'test',
          selectedPages: [1, 2, 3, 4, 5, 6, 7],
          permissions: { 1: ['view', 'add', 'edit', 'delete'] },
          userIds: [6, 7, 8, 11],
        },
        {
          id: 2,
          name: 'haha hihi',
          description: 'mô tả 2',
          selectedPages: [],
          permissions: {},
          userIds: [],
        },
        {
          id: 3,
          name: 'Quản trị hệ thống',
          description: 'Quản trị viên',
          selectedPages: [1, 2],
          permissions: {},
          userIds: [1, 5],
        },
        {
          id: 4,
          name: 'admin',
          description: 'Admin hệ thống',
          selectedPages: [],
          permissions: {},
          userIds: [],
        },
        {
          id: 5,
          name: 'Tach nua',
          description: 'Mô tả khác',
          selectedPages: [],
          permissions: {},
          userIds: [],
        },
      ],

      currentRole: {
        id: null,
        name: '',
        description: '',
        selectedPages: [],
        permissions: {},
        userIds: [],
      },

      pagesList: [
        { id: 1, name: 'Quản lý học lại' },
        { id: 2, name: 'Quản lý đợt đăng ký học lại' },
        { id: 3, name: 'Danh sách sinh viên phải học lại' },
        { id: 4, name: 'Danh sách sinh viên đã đăng ký học lại' },
        { id: 5, name: 'Danh sách lớp học lại' },
        { id: 6, name: 'Kết quả học lại' },
        { id: 7, name: 'Quản lý bảo vệ lại' },
        { id: 8, name: 'BC SV chưa đóng tiền' },
      ],

      availableActions: [
        { id: 'view', name: 'Danh sách kỳ học lại' },
        { id: 'detail', name: 'Chi tiết kỳ học lại' },
        { id: 'add', name: 'Thêm kỳ học lại' },
        { id: 'edit', name: 'Sửa kỳ học lại' },
        { id: 'delete', name: 'Xóa kỳ học lại' },
      ],
    }
  },
  computed: {
    filteredRoles() {
      if (!this.searchRole) return this.roles
      return this.roles.filter((r) =>
        r.name.toLowerCase().includes(this.searchRole.toLowerCase())
      )
    },

    assignedUsers() {
      if (!this.currentRole || !this.currentRole.userIds) return []
      return this.allUsers.filter((u) =>
        this.currentRole.userIds.includes(u.id)
      )
    },

    totalPages() {
      return Math.ceil(this.allUsers.length / this.itemsPerPage) || 1
    },

    paginatedModalUsers() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.allUsers.slice(start, end)
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
    currentPage(val) {
      this.inputPage = val
    },
  },
  methods: {
    selectRole(role, index) {
      this.selectedRoleIndex = index
      this.currentRole = JSON.parse(JSON.stringify(role))
      if (!this.currentRole.permissions) {
        this.$set(this.currentRole, 'permissions', {})
      }
      if (!this.currentRole.userIds) {
        this.$set(this.currentRole, 'userIds', [])
      }
      this.selectedPageId = this.pagesList[0]?.id || null
    },

    handleAddNewRole() {
      this.newRoleForm = { name: '', description: '' }
      if (this.$refs.addForm) this.$refs.addForm.resetValidation()
      this.dialogAdd = true
    },

    submitCreateRole() {
      if (!this.$refs.addForm.validate()) return

      const createdRole = {
        id: Date.now(),
        name: this.newRoleForm.name,
        description: this.newRoleForm.description,
        selectedPages: [],
        permissions: {},
        userIds: [],
      }

      this.roles.unshift(createdRole)
      this.selectRole(createdRole, 0)
      this.dialogAdd = false
    },

    toggleSelectAllPages(val) {
      if (val) {
        this.currentRole.selectedPages = this.pagesList.map((p) => p.id)
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
        this.currentRole.permissions[this.selectedPageId] =
          this.availableActions.map((a) => a.id)
      } else {
        this.currentRole.permissions[this.selectedPageId] = []
      }
    },

    openUserModal() {
      this.tempSelectedUserIds = [...(this.currentRole.userIds || [])]
      this.currentPage = 1
      this.inputPage = 1
      this.dialogUsers = true
    },

    goToPage() {
      const pageNum = parseInt(this.inputPage, 10)
      if (pageNum >= 1 && pageNum <= this.totalPages) {
        this.currentPage = pageNum
      } else {
        this.inputPage = this.currentPage
      }
    },

    toggleSelectAllModalUsers(val) {
      if (val) {
        this.tempSelectedUserIds = this.allUsers.map((u) => u.id)
      } else {
        this.tempSelectedUserIds = []
      }
    },

    saveGroupUsers() {
      this.currentRole.userIds = [...this.tempSelectedUserIds]

      const idx = this.roles.findIndex((r) => r.id === this.currentRole.id)
      if (idx !== -1) {
        this.$set(this.roles, idx, { ...this.currentRole })
      }

      this.dialogUsers = false
    },

    saveRole() {
      const idx = this.roles.findIndex((r) => r.id === this.currentRole.id)
      if (idx !== -1) {
        this.$set(this.roles, idx, { ...this.currentRole })
        alert('Lưu thông tin thành công!')
      }
    },

    deleteRole() {
      if (confirm(`Bạn có chắc muốn xóa nhóm "${this.currentRole.name}"?`)) {
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
.role-management >>> .flex-grow-1 {
  flex-grow: 21 !important;
}

.role-management {
  min-height: calc(100vh - 100px);
  width: 100%;
}

.role-panel {
  min-height: 640px;
  height: calc(100vh - 150px);
  width: 100%;
}

.left-panel,
.right-panel {
  min-height: 100%;
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

/* HIỆU ỨNG TABS VA HOVER MÀU ĐỎ NHẠT */
.tab-btn {
  background: transparent;
  border: none;
  font-size: 15px;
  color: #666;
  cursor: pointer;
  transition: all 0.25s ease-in-out;
  border-bottom: 2px solid transparent;
}

/* Hover hiện màu đỏ nhạt */
.tab-btn:hover {
  background-color: #fdeae8 !important;
  color: #a2212b !important;
}

/* Active tab có gạch dưới đỏ đậm */
.active-tab {
  color: #a2212b !important;
  border-bottom: 2px solid #a2212b !important;
  background-color: #fcf0ee;
}

/* HIỆU ỨNG SLIDE TRỢT SANG TRÁI/PHẢI */
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

/* Status Pill Style */
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

/* Checkbox căn giữa */
.inline-checkbox >>> .v-input__control {
  display: flex;
  justify-content: center;
}

/* Bảng Modal Custom */
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
