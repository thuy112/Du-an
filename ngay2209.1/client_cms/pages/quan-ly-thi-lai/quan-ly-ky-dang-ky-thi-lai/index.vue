<template>
  <div class="page-container pa-2 pa-sm-4">
    <!-- ==================== HEADER & TIÊU ĐỀ ==================== -->
    <div class="filter-header-wrapper mb-3">
      <div class="text-subtitle-1 font-weight-medium black--text mb-2">
        Danh sách kỳ đăng ký thi lại ( <span class="red--text text--darken-3 font-weight-bold">{{ totalItemsCount }}</span> )
      </div>

      <div class="d-flex align-center justify-end gap-2 flex-wrap">
        <!-- Ô Tìm kiếm -->
        <v-text-field
          v-model="filters.search"
          placeholder="Tìm kiếm"
          outlined
          dense
          hide-details
          class="custom-filter-input bg-white rounded"
          @keyup.enter="handleSearch"
        ></v-text-field>

        <!-- Ô Từ ngày -->
        <v-menu
          v-model="menuFilterStartDate"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template #activator="{ on, attrs }">
            <v-text-field
              v-model="filters.startDate"
              placeholder="Từ ngày"
              outlined
              dense
              readonly
              hide-details
              class="custom-filter-input bg-white rounded"
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="filters.startDate"
            no-title
            @input="menuFilterStartDate = false"
          ></v-date-picker>
        </v-menu>

        <!-- Ô Đến ngày -->
        <v-menu
          v-model="menuFilterEndDate"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template #activator="{ on, attrs }">
            <v-text-field
              v-model="filters.endDate"
              placeholder="Đến ngày"
              outlined
              dense
              readonly
              hide-details
              class="custom-filter-input bg-white rounded"
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="filters.endDate"
            no-title
            @input="menuFilterEndDate = false"
          ></v-date-picker>
        </v-menu>

        <!-- Ô Trạng thái -->
        <v-select
          v-model="filters.status"
          :items="statusOptions"
          item-text="label"
          item-value="value"
          placeholder="Trạng thái"
          outlined
          dense
          hide-details
          clearable
          class="custom-filter-input bg-white rounded"
        ></v-select>

        <!-- Nút Refresh -->
        <v-btn icon color="#a2212b" class="action-btn rounded-sm" @click="resetFilters">
          <v-icon color="#a2212b" size="24">mdi-refresh</v-icon>
        </v-btn>

        <!-- Nút Tìm kiếm -->
        <v-btn color="#a2212b" dark elevation="0" class="action-btn min-w-0 px-3 rounded-sm" @click="handleSearch">
          <v-icon size="24">mdi-magnify</v-icon>
        </v-btn>

        <!-- Nút Thêm mới -->
        <v-btn color="#a2212b" dark elevation="0" class="action-btn min-w-0 px-3 rounded-sm" @click="openCreateModal">
          <v-icon size="24">mdi-plus</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- ==================== BẢNG DỮ LIỆU ==================== -->
    <div class="table-container-wrapper border rounded-lg mb-16">
      <BaseTable
        :loading="loading"
        :headers="headers"
        :items="paginatedItems"
        :page="page"
        :page-size="itemsPerPage"
        :hide-default-footer="true"
        class="custom-responsive-table"
      >
        <template v-slot:body="{ items }">
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="text-center py-6">
                <v-progress-circular indeterminate color="#a2212b" size="32"></v-progress-circular>
              </td>
            </tr>
            <tr v-else-if="items.length === 0">
              <td colspan="7" class="text-center py-6 grey--text">
                Không có dữ liệu.
              </td>
            </tr>
            <tr v-for="(item, index) in items" :key="item.id || index" class="responsive-row">
              <td class="text-center" data-label="STT">
                <span class="mobile-label font-weight-bold d-md-none">STT: </span>
                {{ (page - 1) * itemsPerPage + index + 1 }}
              </td>
              <td class="font-weight-medium" data-label="Tên kỳ đăng ký thi lại">
                <span class="mobile-label font-weight-bold d-md-none">Tên kỳ thi lại: </span>
                {{ item.name }}
              </td>
              <td data-label="Mã kỳ đăng ký thi lại">
                <span class="mobile-label font-weight-bold d-md-none">Mã kỳ thi lại: </span>
                {{ item.code }}
              </td>
              <td data-label="Học kỳ">
                <span class="mobile-label font-weight-bold d-md-none">Học kỳ: </span>
                {{ item.semester || '—' }}
              </td>
              <td class="text-center" data-label="Thời gian đăng ký">
                <span class="mobile-label font-weight-bold d-md-none">Thời gian đăng ký: </span>
                {{ item.fromTime }} - {{ item.toTime }}
              </td>
              <td class="text-center" data-label="Trạng thái">
                <span class="mobile-label font-weight-bold d-md-none">Trạng thái: </span>
                <v-select
                  :value="item.status"
                  :items="statusSelectItems"
                  item-text="label"
                  item-value="value"
                  dense
                  solo
                  flat
                  hide-details
                  class="status-select-btn"
                  :class="item.status === 'ACTIVE' ? 'status-active' : 'status-inactive'"
                  @change="(val) => openConfirmStatusDialog(item, val)"
                ></v-select>
              </td>
              <td class="text-center" data-label="Chức năng">
                <span class="mobile-label font-weight-bold d-md-none">Chức năng: </span>
                <div class="d-flex align-center justify-end justify-md-center gap-1">
                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn icon x-small v-bind="attrs" v-on="on" @click="viewDetail(item)">
                        <v-icon size="20" color="blue">mdi-eye</v-icon>
                      </v-btn>
                    </template>
                    <span>Xem chi tiết</span>
                  </v-tooltip>

                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn icon x-small v-bind="attrs" v-on="on" @click="openEditModal(item)">
                        <v-icon size="20" color="warning">mdi-pencil</v-icon>
                      </v-btn>
                    </template>
                    <span>Chỉnh sửa</span>
                  </v-tooltip>

                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn icon x-small v-bind="attrs" v-on="on" @click="openDeleteDialog(item)">
                        <v-icon size="20" color="red">mdi-trash-can</v-icon>
                      </v-btn>
                    </template>
                    <span>Xóa</span>
                  </v-tooltip>
                </div>
              </td>
            </tr>
          </tbody>
        </template>
      </BaseTable>
    </div>

    <!-- ==================== THANH PHÂN TRANG CỐ ĐỊNH GÓC DƯỚI BÊN PHẢI ==================== -->
    <div class="fixed-footer-pagination d-flex align-center justify-end px-4 py-2 bg-white flex-wrap gap-3">
      <!-- Cụm bên trái: Chọn bản ghi & Nhập trang & Nút Đi -->
      <div class="d-flex align-center gap-2">
        <div class="d-flex align-center text-caption gap-1">
          <span class="grey--text text--darken-1">Bản ghi</span>
          <v-select
            v-model="itemsPerPage"
            :items="[10, 20, 50, 100]"
            dense
            outlined
            hide-details
            class="size-select dense-input"
            @change="onItemsPerPageChange"
          ></v-select>
        </div>

        <div class="d-flex align-center text-caption gap-1 ml-2">
          <span class="grey--text text--darken-1">Trang</span>
          <v-text-field
            v-model.number="pageInput"
            dense
            outlined
            hide-details
            class="page-input dense-input text-center"
            @keyup.enter="goToPage"
          ></v-text-field>
          <v-btn
            color="#a2212b"
            dark
            small
            elevation="0"
            class="pagination-square-btn min-w-0 px-2"
            @click="goToPage"
          >
            Đi
          </v-btn>
        </div>
      </div>

      <!-- Cụm bên phải: Nút qua lại & Các nút số trang vuông -->
      <div class="d-flex align-center gap-1">
        <v-btn icon small :disabled="page === 1" @click="changePage(page - 1)">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>

        <v-btn
          v-for="p in visiblePages"
          :key="p"
          small
          elevation="0"
          :color="p === page ? '#a2212b' : 'transparent'"
          :class="p === page ? 'white--text font-weight-bold' : 'grey--text text--darken-2'"
          class="pagination-square-btn min-w-0"
          @click="changePage(p)"
        >
          {{ p }}
        </v-btn>

        <v-btn icon small :disabled="page === totalPages" @click="changePage(page + 1)">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- DIALOG THÊM / SỬA -->
    <v-dialog v-model="formDialog" max-width="600px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="pa-3 text-subtitle-1 font-weight-bold white--text d-flex justify-space-between align-center red-header">
          <span>{{ isEdit ? 'Chỉnh sửa kỳ thi lại' : 'Thêm mới kỳ thi lại' }}</span>
          <v-btn icon dark x-small @click="formDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-5 black--text">
          <v-form ref="form" v-model="isFormValid">
            <v-row dense>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.name"
                  placeholder="Tên kỳ thi lại (*)"
                  outlined
                  dense
                  class="custom-field"
                  :rules="[v => !!v || 'Vui lòng nhập tên kỳ thi lại']"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.code"
                  placeholder="Mã kỳ thi lại (*)"
                  outlined
                  dense
                  class="custom-field"
                  :rules="[v => !!v || 'Vui lòng nhập mã kỳ thi lại']"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-select
                  v-model="formData.semester"
                  :items="semesterList"
                  placeholder="Học kỳ (*)"
                  outlined
                  dense
                  class="custom-field"
                  :rules="[v => !!v || 'Vui lòng chọn học kỳ']"
                ></v-select>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.fromTime"
                  placeholder="Thời gian bắt đầu (*)"
                  outlined
                  dense
                  class="custom-field"
                  :rules="[v => !!v || 'Vui lòng nhập thời gian bắt đầu']"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.toTime"
                  placeholder="Thời gian kết thúc (*)"
                  outlined
                  dense
                  class="custom-field"
                  :rules="[v => !!v || 'Vui lòng nhập thời gian kết thúc']"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4 pt-0 d-flex justify-end gap-2">
          <v-btn outlined color="#a2212b" class="px-4 font-weight-bold rounded-sm text-capitalize border-btn" @click="formDialog = false">
            Đóng <v-icon small right>mdi-close</v-icon>
          </v-btn>
          <v-btn color="#a2212b" dark elevation="0" class="px-4 font-weight-bold rounded-sm text-capitalize" @click="saveForm">
            Lưu
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIALOG CHI TIẾT -->
    <v-dialog v-model="detailDialog" max-width="520px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="pa-3 text-subtitle-1 font-weight-bold white--text d-flex justify-space-between align-center red-header">
          <span>Chi tiết kỳ thi lại</span>
          <v-btn icon dark x-small @click="detailDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-5 black--text body-2">
          <v-row class="mb-2">
            <v-col cols="12" sm="6" class="py-1">
              <span class="grey--text text--darken-2">Tên kỳ thi lại: </span>
              <span class="font-weight-bold red--text text--darken-3">{{ selectedItem.name }}</span>
            </v-col>
            <v-col cols="12" sm="6" class="py-1">
              <span class="grey--text text--darken-2">Mã kỳ thi lại: </span>
              <span class="font-weight-bold red--text text--darken-3">{{ selectedItem.code }}</span>
            </v-col>
          </v-row>

          <v-row class="mb-2">
            <v-col cols="12" sm="6" class="py-1">
              <span class="grey--text text--darken-2">Học kỳ: </span>
              <span class="font-weight-bold grey--text text--darken-3">{{ selectedItem.semester || '—' }}</span>
            </v-col>
            <v-col cols="12" sm="6" class="py-1">
              <span class="grey--text text--darken-2">Loại hình: </span>
              <span class="font-weight-bold red--text text--darken-3">{{ selectedItem.type || 'RETAKE_EXAM' }}</span>
            </v-col>
          </v-row>

          <v-row class="mb-2">
            <v-col cols="12" class="py-1">
              <span class="grey--text text--darken-2">Thời gian đăng ký: </span>
              <span class="font-weight-bold red--text text--darken-3">
                {{ selectedItem.fromTime }} - {{ selectedItem.toTime }}
              </span>
            </v-col>
          </v-row>

          <v-row class="align-center">
            <v-col cols="12" class="py-1 d-flex align-center">
              <span class="grey--text text--darken-2 mr-2">Trạng thái: </span>
              <v-chip
                small
                dark
                :color="selectedItem.status === 'ACTIVE' ? '#a2212b' : '#757575'"
                class="font-weight-bold px-3"
              >
                {{ selectedItem.status === 'ACTIVE' ? 'Kích hoạt' : 'Chưa kích hoạt' }}
              </v-chip>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-4 pt-0 d-flex justify-end">
          <v-btn outlined color="#a2212b" class="px-4 font-weight-bold rounded-sm text-capitalize border-btn" @click="detailDialog = false">
            Đóng <v-icon small right>mdi-close</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIALOG ĐỔI TRẠNG THÁI -->
    <v-dialog v-model="confirmStatusDialog" max-width="450px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="pa-3 text-subtitle-1 font-weight-bold white--text d-flex justify-space-between align-center red-header">
          <span>Xác nhận</span>
          <v-btn icon dark x-small @click="confirmStatusDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-5 black--text body-2">
          Bạn có chắc chắn muốn đổi trạng thái từ 
          <span class="font-weight-bold italic-text">
            {{ pendingStatusChange.oldStatus === 'ACTIVE' ? 'Kích hoạt' : 'Chưa kích hoạt' }}
          </span> 
          sang 
          <span class="font-weight-bold italic-text">
            {{ pendingStatusChange.newStatus === 'ACTIVE' ? 'Kích hoạt' : 'Chưa kích hoạt' }}
          </span> 
          không?
        </v-card-text>

        <v-card-actions class="pa-4 pt-0 d-flex justify-end gap-2">
          <v-btn outlined color="#a2212b" class="px-4 font-weight-bold rounded-sm text-capitalize border-btn" @click="confirmStatusDialog = false">
            Đóng <v-icon small right>mdi-close</v-icon>
          </v-btn>

          <v-btn color="#a2212b" dark elevation="0" class="px-4 font-weight-bold rounded-sm text-capitalize" @click="confirmStatusUpdate">
            Xác Nhận
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIALOG XÓA -->
    <v-dialog v-model="deleteDialog" max-width="450px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="pa-3 text-subtitle-1 font-weight-bold white--text d-flex justify-space-between align-center red-header">
          <span>Xác nhận</span>
          <v-btn icon dark x-small @click="deleteDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-5 black--text body-2">
          Xác nhận xóa <span class="font-weight-bold red--text text--darken-3">{{ itemToDelete.name }}</span>
        </v-card-text>

        <v-card-actions class="pa-4 pt-0 d-flex justify-end gap-2">
          <v-btn outlined color="#a2212b" class="px-4 font-weight-bold rounded-sm text-capitalize border-btn" @click="deleteDialog = false">
            Đóng <v-icon small right>mdi-close</v-icon>
          </v-btn>

          <v-btn color="#a2212b" dark elevation="0" class="px-4 font-weight-bold rounded-sm text-capitalize" :loading="deleteLoading" @click="confirmDelete">
            Xác Nhận
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- TOAST THÔNG BÁO -->
    <v-snackbar v-model="toast.show" :color="toast.color" timeout="3000" top right elevation="3">
      <div class="d-flex align-center justify-space-between w-100">
        <div class="d-flex align-center gap-2">
          <v-icon color="white" small>mdi-check-circle-outline</v-icon>
          <span class="white--text font-weight-medium">{{ toast.message }}</span>
        </div>
        <v-btn icon dark x-small class="ml-4" @click="toast.show = false">
          <v-icon small>mdi-close</v-icon>
        </v-btn>
      </div>
    </v-snackbar>
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import { MOCK_DATA_KY_THI } from '~/consts/kydangkythilai.js'
import examServices from '~/services/examServices'

export default {
  name: 'QuanLyKyDangKyThiLaiPage',
  middleware: 'authenticated',
  components: {
    BaseTable
  },

  data() {
    return {
      loading: false,
      page: 1,
      pageInput: 1,
      itemsPerPage: 50, // Cố định bản ghi mặc định là 50

      // Bộ lọc
      filters: { search: '', startDate: null, endDate: null, status: null },
      appliedFilters: { search: '', startDate: null, endDate: null, status: null },
      menuFilterStartDate: false,
      menuFilterEndDate: false,

      // Dialog Thêm / Sửa
      formDialog: false,
      isEdit: false,
      isFormValid: false,
      formData: {
        id: null,
        name: '',
        code: '',
        semester: '',
        fromTime: '',
        toTime: '',
        status: 'INACTIVE',
        type: 'RETAKE_EXAM'
      },

      semesterList: ['20241', '20242', '20251', '20252'],

      // Dialog Chi Tiết
      detailDialog: false,
      selectedItem: {},

      // Dialog Đổi trạng thái
      confirmStatusDialog: false,
      pendingStatusChange: { item: null, oldStatus: '', newStatus: '' },

      // Dialog Xóa
      deleteDialog: false,
      deleteLoading: false,
      itemToDelete: {},

      // Toast
      toast: { show: false, message: '', color: '#4caf50' },

      statusOptions: [
        { label: 'Kích hoạt', value: 'ACTIVE' },
        { label: 'Chưa kích hoạt', value: 'INACTIVE' },
      ],

      statusSelectItems: [
        { label: 'Kích hoạt', value: 'ACTIVE' },
        { label: 'Chưa kích hoạt', value: 'INACTIVE' },
      ],

      headers: [
        { text: 'STT', value: 'stt', width: '60px', align: 'center', sortable: false },
        { text: 'Tên kỳ đăng ký thi lại', value: 'name', width: '220px' },
        { text: 'Mã kỳ đăng ký thi lại', value: 'code', width: '150px' },
        { text: 'Học kỳ', value: 'semester', width: '100px' },
        { text: 'Thời gian đăng ký', value: 'registrationTime', width: '220px', align: 'center' },
        { text: 'Trạng thái', value: 'status', width: '150px', align: 'center', sortable: false },
        { text: 'Chức năng', value: 'actions', width: '110px', align: 'center', sortable: false },
      ],

      items: MOCK_DATA_KY_THI || []
    }
  },

  computed: {
    totalItemsCount() {
      return this.filteredItems.length
    },
    filteredItems() {
      const list = this.items || []
      return list.filter((item) => {
        const name = item.name || ''
        const code = item.code || ''
        const matchSearch =
          !this.appliedFilters.search ||
          name.toLowerCase().includes(this.appliedFilters.search.toLowerCase()) ||
          code.toLowerCase().includes(this.appliedFilters.search.toLowerCase())

        const matchStatus = !this.appliedFilters.status || item.status === this.appliedFilters.status

        return matchSearch && matchStatus
      })
    },
    paginatedItems() {
      const start = (this.page - 1) * this.itemsPerPage
      return this.filteredItems.slice(start, start + this.itemsPerPage)
    },
    totalPages() {
      const total = Math.ceil(this.filteredItems.length / this.itemsPerPage)
      return total > 0 ? total : 1
    },
    visiblePages() {
      const pages = []
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i)
      }
      return pages
    },
  },

  mounted() {
    this.fetchData()
  },

  methods: {
    async fetchData() {
      this.loading = true
      try {
        const res = await examServices.getExamList(this.appliedFilters)
        if (res && res.success && res.data && res.data.length > 0) {
          this.items = res.data
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách kỳ thi lại từ API:', error)
      } finally {
        this.loading = false
      }
    },

    handleSearch() {
      this.appliedFilters = { ...this.filters }
      this.page = 1
      this.pageInput = 1
    },

    resetFilters() {
      this.filters = { search: '', startDate: null, endDate: null, status: null }
      this.appliedFilters = { search: '', startDate: null, endDate: null, status: null }
      this.page = 1
      this.pageInput = 1
    },

    changePage(p) {
      if (p >= 1 && p <= this.totalPages) {
        this.page = p
        this.pageInput = p
      }
    },

    goToPage() {
      let target = parseInt(this.pageInput)
      if (isNaN(target) || target < 1) target = 1
      if (target > this.totalPages) target = this.totalPages
      this.page = target
      this.pageInput = target
    },

    onItemsPerPageChange() {
      this.page = 1
      this.pageInput = 1
    },

    openCreateModal() {
      this.isEdit = false
      this.formData = { id: null, name: '', code: '', semester: '', fromTime: '', toTime: '', status: 'INACTIVE', type: 'RETAKE_EXAM' }
      this.formDialog = true
    },

    openEditModal(item) {
      this.isEdit = true
      this.formData = { ...item }
      this.formDialog = true
    },

    async saveForm() {
      if (this.$refs.form.validate()) {
        try {
          if (this.isEdit) {
            await examServices.updateExam(this.formData.id, this.formData)
            const idx = this.items.findIndex((i) => i.id === this.formData.id)
            if (idx !== -1) this.items.splice(idx, 1, { ...this.formData })
            this.showToast('Cập nhật kỳ đăng ký thành công', '#4caf50')
          } else {
            const res = await examServices.createExam(this.formData)
            if (res && res.data) {
              this.items.unshift(res.data)
            } else {
              this.items.unshift({ ...this.formData, id: Date.now() })
            }
            this.showToast('Thêm mới kỳ đăng ký thành công', '#4caf50')
          }
          this.formDialog = false
        } catch (error) {
          this.showToast('Lưu thông tin thất bại', '#f44336')
        }
      }
    },

    openConfirmStatusDialog(item, newStatus) {
      if (item.status === newStatus) return
      this.pendingStatusChange = { item, oldStatus: item.status, newStatus }
      this.confirmStatusDialog = true
    },

    async confirmStatusUpdate() {
      if (this.pendingStatusChange.item) {
        try {
          await examServices.updateExamStatus(
            this.pendingStatusChange.item.id,
            this.pendingStatusChange.newStatus
          )
          this.pendingStatusChange.item.status = this.pendingStatusChange.newStatus
          this.showToast('Cập nhật trạng thái thành công', '#4caf50')
        } catch (error) {
          this.showToast('Cập nhật trạng thái thất bại', '#f44336')
        } finally {
          this.confirmStatusDialog = false
        }
      }
    },

    openDeleteDialog(item) {
      this.itemToDelete = { ...item }
      this.deleteDialog = true
    },

    async confirmDelete() {
      if (!this.itemToDelete || !this.itemToDelete.id) return

      this.deleteLoading = true
      try {
        await examServices.deleteExam(this.itemToDelete.id)
        this.items = this.items.filter((i) => i.id !== this.itemToDelete.id)
        this.showToast('Xóa thông tin thành công', '#4caf50')
      } catch (error) {
        console.error('Lỗi khi xóa:', error)
        this.showToast('Xóa thông tin thất bại', '#f44336')
      } finally {
        this.deleteLoading = false
        this.deleteDialog = false
      }
    },

    viewDetail(item) {
      this.selectedItem = { ...item }
      this.detailDialog = true
    },

    showToast(message, color) {
      this.toast.message = message
      this.toast.color = color
      this.toast.show = true
    },
  },
}
</script>

<style scoped>
/* Biến toàn bộ trang thành vùng cuộn độc lập, bỏ qua việc bị khóa khung ngoài của layout */
.page-container {
  position: absolute !important;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  box-sizing: border-box;
  font-size: 14px;
  background-color: #f8f9fa;
  padding-bottom: 90px !important; /* Chừa khoảng trống cho thanh phân trang cố định */
  z-index: 10;
}

.table-container-wrapper {
  background-color: #fff;
}

.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }

/* Ô FILTER INPUT RESPONSIVE */
.custom-filter-input {
  width: 100% !important;
  max-width: 180px !important;
}

@media (max-width: 600px) {
  .custom-filter-input {
    max-width: 100% !important;
    flex: 1 1 100% !important;
  }
}

.custom-filter-input >>> .v-input__slot {
  min-height: 38px !important;
  height: 38px !important;
  padding: 0 10px !important;
}

.custom-filter-input >>> input,
.custom-filter-input >>> .v-select__selection {
  font-size: 0.85rem !important;
}

.action-btn {
  height: 38px !important;
  min-height: 38px !important;
}

/* NÚT TRẠNG THÁI */
.status-select-btn {
  min-width: 125px !important;
  width: 125px !important;
  border-radius: 14px !important;
  margin: 0 auto !important;
}

.status-select-btn >>> .v-input__slot {
  min-height: 28px !important;
  height: 28px !important;
  padding: 0 10px !important;
  border-radius: 14px !important;
}

.status-select-btn >>> .v-select__selection {
  color: #ffffff !important;
  font-size: 0.76rem !important;
  font-weight: 600 !important;
  margin: 0 !important;
  white-space: nowrap !important;
}

.status-select-btn >>> .v-icon {
  color: #ffffff !important;
  font-size: 16px !important;
}

.status-active >>> .v-input__slot {
  background-color: #a2212b !important;
}

.status-inactive >>> .v-input__slot {
  background-color: #757575 !important;
}

/* CỐ ĐỊNH FOOTER PHÂN TRANG GÓC DƯỚI BÊN PHẢI */
.fixed-footer-pagination {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99;
  background-color: #ffffff;
  border-top: none !important;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05) !important;
  justify-content: flex-end !important;
}

.size-select {
  width: 70px !important;
}

.page-input {
  width: 45px !important;
}

.dense-input >>> .v-input__slot {
  min-height: 28px !important;
  height: 28px !important;
  padding: 0 6px !important;
}

.dense-input >>> input,
.dense-input >>> .v-select__selection {
  font-size: 0.82rem !important;
  text-align: center;
}

.pagination-square-btn {
  min-width: 28px !important;
  width: 28px !important;
  height: 28px !important;
  min-height: 28px !important;
  padding: 0 !important;
  border-radius: 6px !important;
}

.border-btn {
  border: 1px solid #d0d0d0 !important;
}

.red-header {
  background-color: #a2212b !important;
}

.custom-field >>> .v-input__slot {
  min-height: 38px !important;
}

.italic-text {
  font-style: italic;
}
</style>