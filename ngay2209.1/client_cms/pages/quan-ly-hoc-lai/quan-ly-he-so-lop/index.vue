<template>
  <div class="page-layout-wrapper d-flex flex-column pa-2 pa-md-4 bg-white" :class="{ 'is-mobile-device': isMobileDevice }">
    <!-- 1. HEADER & BỘ LỌC TÌM KIẾM -->
    <div class="top-section flex-shrink-0 mb-4">
      <v-row align="center" justify="space-between" no-gutters>
        <!-- Tiêu đề (Chiếm full dòng trên mobile, co lại trên desktop) -->
        <v-col cols="12" md="auto" class="mb-3 mb-md-0 pb-1 pb-md-0">
          <div class="text-h6 font-weight-bold d-flex align-center">
            Danh sách hệ số lớp&nbsp;(<span style="color: #a2212b">{{ totalItems }}</span>)
          </div>
        </v-col>

        <!-- Cụm bộ lọc (Tự động xuống hàng, tràn viền nếu không đủ chỗ) -->
        <v-col cols="12" md="auto">
          <div class="d-flex align-center justify-start justify-md-end flex-wrap gap-2">
            <!-- Ô 1: Tìm kiếm -->
            <v-text-field
              v-model="filters.search"
              label="Tìm kiếm"
              dense
              outlined
              hide-details
              clearable
              class="filter-input-box flex-grow-1 flex-sm-grow-0"
              @keyup.enter="handleExecuteSearch"
            ></v-text-field>

            <!-- Ô 2: Tìm theo hệ số -->
            <v-text-field
              v-model="filters.coefficient"
              label="Tìm theo hệ số"
              dense
              outlined
              hide-details
              clearable
              class="filter-input-box flex-grow-1 flex-sm-grow-0"
              @keyup.enter="handleExecuteSearch"
            ></v-text-field>

            <!-- CỤM NÚT THAO TÁC -->
            <div class="d-flex align-center gap-2 flex-nowrap mt-2 mt-sm-0">
              <!-- Nút Refresh -->
              <v-btn
                icon
                color="#a2212b"
                class="flex-shrink-0 btn-action-icon border-action-btn"
                @click="resetFilters"
              >
                <v-icon size="20">mdi-refresh</v-icon>
              </v-btn>

              <!-- Nút Kính Lúp -->
              <v-btn
                color="#a2212b"
                dark
                elevation="0"
                class="btn-action-square flex-shrink-0"
                @click="handleExecuteSearch"
              >
                <v-icon size="20">mdi-magnify</v-icon>
              </v-btn>

              <!-- Nút Thêm Mới (+) -->
              <v-btn
                color="#a2212b"
                dark
                elevation="0"
                class="btn-action-square flex-shrink-0"
                @click="openCreateModal"
              >
                <v-icon size="20">mdi-plus</v-icon>
              </v-btn>
            </div>
          </div>
        </v-col>
      </v-row>
    </div>

    <!-- 2. BẢNG DỮ LIỆU CÓ SCROLLBAR BÊN TRONG -->
    <div class="main-content-block table-scroll-container flex-grow-1">
      <v-data-table
        :headers="headers"
        :items="paginatedData"
        :loading="loading"
        hide-default-footer
        disable-pagination
        fixed-header
        height="100%"
        :mobile-breakpoint="isMobileDevice ? 960 : 0"
        class="elevation-0 bg-transparent custom-table"
      >
        <!-- GIAO DIỆN NO DATA -->
        <template v-slot:no-data>
          <div class="py-10 text-center grey--text">Không có dữ liệu</div>
        </template>

        <!-- STT -->
        <template v-slot:[`item.stt`]="{ index }">
          <span class="font-weight-medium">{{ (page - 1) * itemsPerPage + index + 1 }}</span>
        </template>

        <!-- Số lượng sinh viên -->
        <template v-slot:[`item.soLuongSv`]="{ item }">
          {{ item.minSv }} - {{ item.maxSv }}
        </template>

        <!-- Chức năng (2 Icon: Bút chì & Thùng rác) -->
        <template v-slot:[`item.actions`]="{ item }">
          <div class="d-flex align-center gap-3" :class="isMobileDevice ? 'justify-end' : 'justify-center'">
            <v-icon
              size="22"
              color="#fa8c16"
              class="action-icon-btn"
              @click="openEditModal(item)"
            >
              mdi-pencil
            </v-icon>
            <v-icon
              size="22"
              color="#f5222d"
              class="action-icon-btn"
              @click="openDeleteModal(item)"
            >
              mdi-trash-can
            </v-icon>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- 3. THANH PHÂN TRANG -->
    <div class="custom-pagination-bar flex-shrink-0 d-flex align-center justify-end flex-wrap gap-2 py-3 px-2 bg-white mt-auto border-top">
      <div class="d-flex align-center flex-wrap justify-end gap-2 w-100">
        <div class="d-flex align-center gap-2">
          <v-select
            v-model="itemsPerPage"
            :items="[10, 20, 50, 100]"
            label="Bản ghi"
            outlined
            dense
            hide-details
            class="outlined-pagination-control select-records"
            @change="handleExecuteSearch"
          ></v-select>

          <v-text-field
            v-model.number="pageInput"
            label="Trang"
            outlined
            dense
            hide-details
            class="outlined-pagination-control input-page"
            @keyup.enter="handleGoBtnClick"
          ></v-text-field>

          <v-btn
            color="#a2212b"
            dark
            class="btn-go elevation-0 text-capitalize font-weight-regular px-3"
            @click="handleGoBtnClick"
          >
            Đi
          </v-btn>
        </div>

        <div class="d-flex align-center gap-1 mt-2 mt-sm-0">
          <v-btn
            outlined
            class="btn-page-nav mx-1"
            :disabled="page <= 1"
            @click="changePage(page - 1)"
          >
            <v-icon small color="grey darken-1">mdi-chevron-left</v-icon>
          </v-btn>

          <v-btn
            v-for="p in visiblePages"
            :key="p"
            :color="page === p ? '#a2212b' : ''"
            :dark="page === p"
            :outlined="page !== p"
            class="btn-page-nav font-weight-medium mx-1"
            @click="changePage(p)"
          >
            {{ p }}
          </v-btn>

          <v-btn
            outlined
            class="btn-page-nav mx-1"
            :disabled="page >= totalPages"
            @click="changePage(page + 1)"
          >
            <v-icon small color="grey darken-1">mdi-chevron-right</v-icon>
          </v-btn>
        </div>
      </div>
    </div>

    <!-- DIALOG THÊM MỚI / CHỈNH SỬA HỆ SỐ LỚP -->
    <v-dialog v-model="formDialog" max-width="600px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <!-- Header đỏ BK -->
        <div class="px-5 py-3 d-flex align-center justify-space-between" style="background-color: #a2212b;">
          <span class="white--text font-weight-bold text-h6">
            {{ isEdit ? 'Cập nhật hệ số lớp' : 'Thêm mới hệ số lớp' }}
          </span>
          <v-btn icon dark x-small @click="formDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <v-card-text class="pa-6">
          <v-form ref="classCoeffForm" v-model="isFormValid">
            <v-row dense>
              <!-- 1. Loại lớp (*) -->
              <v-col cols="12">
                <v-select
                  v-model="formData.loaiLopBase"
                  :items="['Lớp ghép', 'Lớp mở', 'Đồ án môn học']"
                  label="Loại lớp (*)"
                  placeholder="Loại lớp (*)"
                  dense
                  outlined
                  clearable
                  hide-details="auto"
                  :rules="[v => !!v || 'Vui lòng chọn loại lớp']"
                  class="modal-input-box"
                ></v-select>
              </v-col>

              <!-- 1.1 Loại học phần (*) - CHỈ HIỆN KHI CHỌN "Lớp ghép" -->
              <v-col v-if="formData.loaiLopBase === 'Lớp ghép'" cols="12" class="mt-3">
                <v-select
                  v-model="formData.loaiHocPhan"
                  :items="['Đại cương', 'Chuyên ngành']"
                  label="Loại học phần (*)"
                  placeholder="Loại học phần (*)"
                  dense
                  outlined
                  hide-details="auto"
                  :rules="[v => !!v || 'Vui lòng chọn loại học phần']"
                  class="modal-input-box"
                ></v-select>
              </v-col>

              <!-- 2. Thu học phí SV (*) -->
              <v-col cols="12" class="mt-3">
                <v-text-field
                  v-model="formData.thuHocPhiSv"
                  label="Thu học phí SV (*)"
                  placeholder="Thu học phí SV (*)"
                  dense
                  outlined
                  hide-details="auto"
                  :rules="[
                    v => (v !== null && v !== '') || 'Vui lòng nhập thu học phí SV',
                    v => /^-?\d*([.,]\d+)?$/.test(v) || 'Thu học phí phải là số'
                  ]"
                  class="modal-input-box"
                  @input="formData.thuHocPhiSv = normalizeNumberInput(formData.thuHocPhiSv)"
                ></v-text-field>
              </v-col>

              <!-- 3. Thanh toán giảng dạy (*) -->
              <v-col cols="12" class="mt-3">
                <v-text-field
                  v-model="formData.thanhToanGiangDay"
                  label="Thanh toán giảng dạy (*)"
                  placeholder="Thanh toán giảng dạy (*)"
                  dense
                  outlined
                  hide-details="auto"
                  :rules="[
                    v => !v || /^-?\d*([.,]\d+)?$/.test(v) || 'Thanh toán giảng dạy phải là số'
                  ]"
                  class="modal-input-box"
                  @input="formData.thanhToanGiangDay = normalizeNumberInput(formData.thanhToanGiangDay)"
                ></v-text-field>
              </v-col>

              <!-- 4. Mô tả -->
              <v-col cols="12" class="mt-3">
                <v-text-field
                  v-model="formData.moTa"
                  label="Mô tả"
                  placeholder="Mô tả"
                  dense
                  outlined
                  hide-details="auto"
                  class="modal-input-box"
                ></v-text-field>
              </v-col>

              <!-- 5. Số lượng tối thiểu (*) -->
              <v-col cols="12" class="mt-3">
                <v-text-field
                  v-model.number="formData.minSv"
                  label="Số lượng tối thiểu (*)"
                  placeholder="Số lượng tối thiểu (*)"
                  type="number"
                  dense
                  outlined
                  hide-details="auto"
                  :rules="[
                    v => (v !== null && v !== '' && v >= 0) || 'Số lượng tối thiểu phải >= 0',
                    validateMinMax
                  ]"
                  class="modal-input-box"
                ></v-text-field>
              </v-col>

              <!-- 6. Số lượng tối đa (*) -->
              <v-col cols="12" class="mt-3">
                <v-text-field
                  v-model.number="formData.maxSv"
                  label="Số lượng tối đa (*)"
                  placeholder="Số lượng tối đa (*)"
                  type="number"
                  dense
                  outlined
                  hide-details="auto"
                  :rules="[
                    v => (v !== null && v !== '' && v > 0) || 'Số lượng tối đa phải > 0',
                    validateMinMax
                  ]"
                  class="modal-input-box"
                ></v-text-field>
              </v-col>

              <!-- 7. Học phần thường (Switch Toggle) - CHỈ HIỆN KHI CHỌN "Đồ án môn học" -->
              <v-col v-if="formData.loaiLopBase === 'Đồ án môn học'" cols="12" class="mt-2">
                <v-switch
                  v-model="formData.isHocPhanThuong"
                  label="Học phần thường"
                  color="#a2212b"
                  hide-details
                  class="mt-1"
                ></v-switch>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <!-- Nút Thao Tác -->
        <v-card-actions class="pa-5 pt-0 d-flex justify-end gap-2">
          <v-btn outlined class="text-capitalize px-4" style="border-color: #d9d9d9;" @click="formDialog = false">
            Đóng <v-icon right small>mdi-close</v-icon>
          </v-btn>
          <v-btn color="#a2212b" dark elevation="0" class="text-capitalize px-4" @click="saveData">
            Lưu <v-icon right small>mdi-content-save</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIALOG XÁC NHẬN XÓA -->
    <v-dialog v-model="deleteDialog" max-width="450px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <div class="px-4 py-3 d-flex align-center justify-space-between" style="background-color: #a2212b;">
          <span class="white--text font-weight-bold text-subtitle-1">Xác nhận</span>
          <v-btn icon dark x-small @click="deleteDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <v-card-text class="pa-5 text-body-2 text--primary">
          Xác nhận xóa hệ số lớp <strong>{{ selectedItem.loaiLop }}</strong>?
        </v-card-text>

        <v-card-actions class="pa-4 pt-0 d-flex justify-end gap-2">
          <v-btn outlined class="text-capitalize px-4" style="border-color: #d9d9d9;" @click="deleteDialog = false">
            Đóng <v-icon right small>mdi-close</v-icon>
          </v-btn>
          <v-btn color="#a2212b" dark elevation="0" class="text-capitalize px-4" @click="confirmDelete">
            Xác Nhận
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- SNACKBAR THÔNG BÁO -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" top right timeout="3000" class="mt-2 custom-toast">
      <div class="d-flex align-center">
        <v-icon left color="white">{{ snackbar.icon }}</v-icon>
        <span class="white--text font-weight-medium">{{ snackbar.text }}</span>
      </div>
      <template v-slot:action="{ attrs }">
        <v-btn icon dark v-bind="attrs" @click="snackbar.show = false">
          <v-icon small>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
export default {
  name: 'QuanLyHeSoLop',
  data() {
    return {
      isMobileDevice: false, // Cờ nhận diện mobile
      loading: false,
      formDialog: false,
      deleteDialog: false,
      isEdit: false,
      isFormValid: true,

      page: 1,
      pageInput: 1,
      itemsPerPage: 50,

      filters: {
        search: '',
        coefficient: '',
      },

      selectedItem: {},
      formData: {
        id: null,
        loaiLopBase: null,
        loaiHocPhan: 'Đại cương',
        thuHocPhiSv: '',
        thanhToanGiangDay: '',
        moTa: '',
        minSv: null,
        maxSv: null,
        isHocPhanThuong: false,
      },

      headers: [
        { text: 'STT', value: 'stt', sortable: false, width: '70px', align: 'left' },
        { text: 'Loại lớp', value: 'loaiLop', sortable: false, align: 'left' },
        { text: 'Thu học phí SV', value: 'thuHocPhiSv', sortable: false, align: 'center' },
        { text: 'Thanh toán giảng dạy', value: 'thanhToanGiangDay', sortable: false, align: 'center' },
        { text: 'Số lượng sinh viên', value: 'soLuongSv', sortable: false, align: 'center' },
        { text: 'Chức năng', value: 'actions', sortable: false, align: 'center', width: '130px' },
      ],

      dataList: [
        { id: 1, loaiLop: 'Lớp ghép (Chuyên ngành)', thuHocPhiSv: -2.3, thanhToanGiangDay: -2.3, minSv: 3, maxSv: 6 },
        { id: 2, loaiLop: 'Lớp ghép (Chuyên ngành)', thuHocPhiSv: 1.7, thanhToanGiangDay: '', minSv: 21, maxSv: 70 },
        { id: 3, loaiLop: 'Lớp ghép (Đại cương)', thuHocPhiSv: 1.5, thanhToanGiangDay: '', minSv: 1, maxSv: 20 },
        { id: 4, loaiLop: 'Lớp mở', thuHocPhiSv: 1.3, thanhToanGiangDay: '', minSv: 8, maxSv: 11 },
        { id: 5, loaiLop: 'Đồ án môn học (HPTT)', thuHocPhiSv: 1, thanhToanGiangDay: '', minSv: 4, maxSv: 7 },
        { id: 6, loaiLop: 'Đồ án môn học (HP.DAMH)', thuHocPhiSv: 2, thanhToanGiangDay: '', minSv: 1, maxSv: 3 },
      ],
      appliedData: [],

      snackbar: {
        show: false,
        text: '',
        color: '#52c41a',
        icon: 'mdi-check-circle',
      },
    }
  },

  computed: {
    totalItems() {
      return this.appliedData.length
    },

    totalPages() {
      return Math.ceil(this.totalItems / this.itemsPerPage) || 1
    },

    paginatedData() {
      const start = (this.page - 1) * this.itemsPerPage
      return this.appliedData.slice(start, start + this.itemsPerPage)
    },

    visiblePages() {
      const pages = []
      const maxVisible = 5
      let start = Math.max(1, this.page - Math.floor(maxVisible / 2))
      const end = Math.min(this.totalPages, start + maxVisible - 1)
      if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      return pages
    },
  },

  created() {
    this.appliedData = [...this.dataList]
  },

  mounted() {
    // Nhận diện thiết bị di động
    if (typeof navigator !== 'undefined') {
      this.isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }
  },

  methods: {
    handleExecuteSearch(resetPage = true) {
      const keyword = (this.filters.search || '').toLowerCase().trim()
      const coeff = (this.filters.coefficient || '').trim()

      this.appliedData = this.dataList.filter((item) => {
        const matchSearch = !keyword || item.loaiLop.toLowerCase().includes(keyword)
        const matchCoeff =
          !coeff ||
          String(item.thuHocPhiSv).includes(coeff) ||
          String(item.thanhToanGiangDay).includes(coeff)

        return matchSearch && matchCoeff
      })

      if (resetPage) {
        this.page = 1
        this.pageInput = 1
      }
    },

    handleGoBtnClick() {
      this.handleExecuteSearch(false)

      const targetPage = parseInt(this.pageInput, 10)
      if (targetPage && targetPage >= 1 && targetPage <= this.totalPages) {
        this.page = targetPage
      } else {
        this.page = 1
        this.pageInput = 1
      }
    },

    resetFilters() {
      this.filters = { search: '', coefficient: '' }
      this.appliedData = [...this.dataList]
      this.page = 1
      this.pageInput = 1
    },

    changePage(p) {
      if (p >= 1 && p <= this.totalPages) {
        this.page = p
        this.pageInput = p
      }
    },

    // MỞ MODAL THÊM MỚI
    openCreateModal() {
      this.isEdit = false
      this.formData = {
        id: null,
        loaiLopBase: null,
        loaiHocPhan: 'Đại cương',
        thuHocPhiSv: '',
        thanhToanGiangDay: '',
        moTa: '',
        minSv: null,
        maxSv: null,
        isHocPhanThuong: false,
      }
      if (this.$refs.classCoeffForm) this.$refs.classCoeffForm.resetValidation()
      this.formDialog = true
    },

    // MỞ MODAL CHỈNH SỬA
    openEditModal(item) {
      this.isEdit = true
      this.selectedItem = item

      // Tách loại lớp để gán lại dropdown
      let base = 'Lớp mở'
      let subHP = 'Đại cương'
      let isHPTT = false

      if (item.loaiLop.includes('Lớp ghép')) {
        base = 'Lớp ghép'
        if (item.loaiLop.includes('Chuyên ngành')) subHP = 'Chuyên ngành'
      } else if (item.loaiLop.includes('Đồ án môn học')) {
        base = 'Đồ án môn học'
        if (item.loaiLop.includes('HPTT')) isHPTT = true
      }

      this.formData = {
        ...item,
        loaiLopBase: base,
        loaiHocPhan: subHP,
        isHocPhanThuong: isHPTT,
      }

      if (this.$refs.classCoeffForm) this.$refs.classCoeffForm.resetValidation()
      this.formDialog = true
    },

    normalizeNumberInput(value) {
      if (!value) return ''

      let normalized = String(value).replace(/,/g, '.')
      const parts = normalized.split('.')
      if (parts.length > 2) normalized = `${parts[0]}.${parts.slice(1).join('')}`
      return normalized
    },

    validateMinMax() {
      const min = Number(this.formData.minSv)
      const max = Number(this.formData.maxSv)

      if (this.formData.minSv === null || this.formData.maxSv === null) return true
      if (max <= min) return 'Số lượng tối đa phải lớn hơn số lượng tối thiểu!'
      return true
    },

    isSameClassGroup(item) {
      const currentBase = this.formData.loaiLopBase

      if (currentBase === 'Lớp ghép') {
        return item.loaiLop === `Lớp ghép (${this.formData.loaiHocPhan})`
      }

      if (currentBase === 'Lớp mở') {
        return item.loaiLop === 'Lớp mở'
      }

      if (currentBase === 'Đồ án môn học') {
        const targetLoaiLop = this.formData.isHocPhanThuong
          ? 'Đồ án môn học (HPTT)'
          : 'Đồ án môn học (HP.DAMH)'
        return item.loaiLop === targetLoaiLop
      }

      return false
    },

    checkRangeOverlap(newMin, newMax) {
      for (const item of this.dataList) {
        if (this.isEdit && item.id === this.formData.id) continue
        if (!this.isSameClassGroup(item)) continue

        const existingMin = Number(item.minSv)
        const existingMax = Number(item.maxSv)
        if (newMin <= existingMax && newMax >= existingMin) {
          return `Cấu hình sinh viên cho "${item.loaiLop}" đã tồn tại!`
        }
      }
      return null
    },

    checkDuplicateItem(newItem) {
      const duplicate = this.dataList.find((item) => {
        if (this.isEdit && item.id === this.formData.id) return false

        return (
          item.loaiLop === newItem.loaiLop &&
          Number(item.thuHocPhiSv) === Number(newItem.thuHocPhiSv) &&
          (item.thanhToanGiangDay || '') === (newItem.thanhToanGiangDay || '') &&
          Number(item.minSv) === Number(newItem.minSv) &&
          Number(item.maxSv) === Number(newItem.maxSv) &&
          Boolean(item.isHocPhanThuong) === Boolean(newItem.isHocPhanThuong)
        )
      })

      return duplicate
        ? 'Bản ghi có thông tin trùng với một hệ số lớp đã tồn tại!'
        : null
    },

    // XỬ LÝ LƯU
    saveData() {
      this.formData.thuHocPhiSv = this.normalizeNumberInput(this.formData.thuHocPhiSv)
      this.formData.thanhToanGiangDay = this.normalizeNumberInput(this.formData.thanhToanGiangDay)

      if (this.$refs.classCoeffForm && !this.$refs.classCoeffForm.validate()) return

      const min = Number(this.formData.minSv)
      const max = Number(this.formData.maxSv)
      const overlapError = this.checkRangeOverlap(min, max)
      if (overlapError) {
        this.showNotification(overlapError, 'warning')
        return
      }

      // TÍNH TOÁN CỘT 'LOẠI LỚP' DỰA TRÊN LỰA CHỌN
      let computedLoaiLop = this.formData.loaiLopBase

      if (this.formData.loaiLopBase === 'Lớp ghép') {
        computedLoaiLop = `Lớp ghép (${this.formData.loaiHocPhan})`
      } else if (this.formData.loaiLopBase === 'Đồ án môn học') {
        computedLoaiLop = this.formData.isHocPhanThuong
          ? 'Đồ án môn học (HPTT)'
          : 'Đồ án môn học (HP.DAMH)'
      }

      const newItem = {
        id: this.isEdit ? this.formData.id : Date.now(),
        loaiLop: computedLoaiLop,
        thuHocPhiSv: Number(this.formData.thuHocPhiSv),
        thanhToanGiangDay: this.formData.thanhToanGiangDay
          ? Number(this.formData.thanhToanGiangDay)
          : '',
        moTa: this.formData.moTa || '',
        minSv: min,
        maxSv: max,
        isHocPhanThuong: Boolean(this.formData.isHocPhanThuong),
      }

      const duplicateError = this.checkDuplicateItem(newItem)
      if (duplicateError) {
        this.showNotification(duplicateError, 'warning')
        return
      }

      if (this.isEdit) {
        Object.assign(this.selectedItem, newItem)
        this.showNotification('Cập nhật hệ số lớp thành công')
      } else {
        // Thêm bản ghi mới trực tiếp vào đầu danh sách
        this.dataList.unshift(newItem)
        this.appliedData = [...this.dataList]
        this.page = 1
        this.pageInput = 1
        this.showNotification('Thêm mới thành công')
      }

      this.formDialog = false
    },

    // XÓA
    openDeleteModal(item) {
      this.selectedItem = item
      this.deleteDialog = true
    },

    confirmDelete() {
      const index = this.dataList.findIndex(x => x.id === this.selectedItem.id)
      if (index !== -1) {
        this.dataList.splice(index, 1)
        this.appliedData = [...this.dataList]
      }
      this.deleteDialog = false
      this.showNotification('Xóa hệ số lớp thành công')
    },

    showNotification(msg, type = 'success') {
      this.snackbar.text = msg
      this.snackbar.color = type === 'warning' ? '#ffc107' : '#4CAF50'
      this.snackbar.icon = type === 'warning' ? 'mdi-alert-circle' : 'mdi-check-circle'
      this.snackbar.show = true
    },
  },
}
</script>

<style scoped>
/* ==============================================
   MÀU SẮC & TEXT CƠ BẢN
============================================== */
.border-top { border-top: 1px solid #e0e0e0; }
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }

/* ==============================================
   1. BỘ LỌC TÌM KIẾM Ở TOP
============================================== */
.filter-input-box {
  min-width: 140px;
  flex: 1 1 140px; 
}

@media (min-width: 960px) {
  .filter-input-box {
    max-width: 160px; 
  }
}

::v-deep .filter-input-box.v-text-field--outlined .v-input__control {
  min-height: 40px !important;
  height: 40px !important;
}

::v-deep .filter-input-box.v-text-field--outlined .v-input__slot {
  min-height: 40px !important;
  height: 40px !important;
  padding: 0 10px !important;
}

::v-deep .filter-input-box input,
::v-deep .filter-input-box .v-select__selections {
  font-size: 13px !important;
  padding: 0 !important;
  height: 40px !important;
  display: flex;
  align-items: center;
}

::v-deep .filter-input-box input::placeholder {
  color: #777777 !important;
  opacity: 1 !important;
}

::v-deep .filter-input-box fieldset {
  border-color: #a0a0a0 !important;
  border-width: 1px !important;
  border-radius: 4px !important;
}

::v-deep .filter-input-box.v-input--is-focused fieldset {
  border-color: #a2212b !important;
  border-width: 1.5px !important;
}

.btn-action-icon {
  width: 40px !important;
  height: 40px !important;
}

.border-action-btn {
  border: 1px solid #a2212b !important;
  border-radius: 6px !important;
}

.btn-action-square {
  width: 48px !important;
  min-width: 48px !important;
  height: 40px !important;
  border-radius: 4px !important;
  padding: 0 !important;
}

/* ==============================================
   2. BẢNG DỮ LIỆU CHUNG
============================================== */
.custom-table {
  background-color: transparent !important;
}

::v-deep .custom-table table {
  border-collapse: collapse !important;
}

/* Các Icon Chức Năng */
.action-icon-btn {
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.15s ease;
}
.action-icon-btn:hover {
  opacity: 0.8;
  transform: scale(1.15);
}

/* Style Modal Input */
.modal-input-box.v-text-field--outlined .v-input__control {
  min-height: 40px !important;
}

::v-deep .modal-input-box input[type='number']::-webkit-inner-spin-button,
::v-deep .modal-input-box input[type='number']::-webkit-outer-spin-button {
  margin: 0;
  -webkit-appearance: none;
}
::v-deep .modal-input-box input[type='number'] {
  appearance: textfield;
  -moz-appearance: textfield;
}

::v-deep .modal-input-box fieldset {
  border-color: #a0a0a0 !important;
  border-radius: 4px !important;
}
::v-deep .modal-input-box.v-input--is-focused fieldset {
  border-color: #a2212b !important;
  border-width: 1.5px !important;
}
::v-deep .modal-input-box.v-input--is-focused .v-label,
::v-deep .modal-input-box.v-input--is-label-active .v-label {
  color: #a2212b !important;
}

/* ==============================================
   3. THANH PHÂN TRANG
============================================== */
::v-deep .outlined-pagination-control.v-text-field--outlined .v-input__control {
  min-height: 32px !important;
  height: 32px !important;
}

::v-deep .outlined-pagination-control.v-text-field--outlined .v-input__slot {
  min-height: 32px !important;
  height: 32px !important;
  padding: 0 12px !important;
}

::v-deep .outlined-pagination-control.v-text-field--outlined fieldset {
  border-color: #8c8c8c !important;
  border-width: 1px !important;
}

::v-deep .outlined-pagination-control .v-label {
  top: 10px !important;
  font-size: 12px !important;
  color: #555 !important;
}

.select-records {
  width: 92px !important;
  min-width: 92px !important;
  max-width: 92px !important;
}

::v-deep .select-records .v-select__selections {
  padding: 0 !important;
  font-size: 13px !important;
}

::v-deep .select-records .v-input__append-inner {
  margin-top: 4px !important;
}

.input-page {
  width: 64px !important;
  min-width: 64px !important;
  max-width: 64px !important;
}

::v-deep .input-page input {
  text-align: center !important;
  padding: 0 !important;
  font-size: 13px !important;
  height: 32px !important;
}

.btn-go {
  height: 32px !important;
  min-width: 50px !important;
  border-radius: 4px !important;
  font-size: 13px;
}

.btn-page-nav {
  min-width: 32px !important;
  width: 32px !important;
  height: 32px !important;
  padding: 0 !important;
  border-radius: 4px !important;
  border: 1px solid #d9d9d9 !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
}

/* ==========================================================
   CSS MÁY TÍNH (DESKTOP)
========================================================== */
.page-layout-wrapper:not(.is-mobile-device) {
  height: calc(100vh - 64px); 
}

.page-layout-wrapper:not(.is-mobile-device) .main-content-block {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Cho phép bao bảng kéo thanh cuộn tự do ngang/dọc */
.page-layout-wrapper:not(.is-mobile-device) .table-responsive-wrapper {
  flex: 1 1 auto;
  min-height: 0; 
  overflow: auto; 
}

/* Ép width bảng bằng 1000px để không bao giờ bị bóp nhăn nhúm các cột */
.page-layout-wrapper:not(.is-mobile-device) .custom-table >>> table {
  min-width: 1000px !important;
}

/* Đóng đinh Header Bảng (Tiêu đề cột) không bị trượt mất khi kéo dọc */
.page-layout-wrapper:not(.is-mobile-device) .custom-table >>> thead th {
  position: sticky;
  top: 0;
  z-index: 3;
  background-color: #f2f2f2 !important;
  color: #262626 !important;
  font-size: 14px !important;
  font-weight: 700 !important;
  height: 48px !important;
  border-bottom: 1px solid #e8e8e8 !important;
  box-shadow: 0 1px 0 rgba(0,0,0,0.05) !important;
  white-space: nowrap !important;
}

.page-layout-wrapper:not(.is-mobile-device) .custom-table >>> tbody td {
  font-size: 14px !important;
  color: #262626 !important;
  height: 52px !important;
  border-bottom: 1px solid #f0f0f0 !important;
  white-space: nowrap !important; /* KHÔNG CHO XUỐNG DÒNG */
}

.page-layout-wrapper:not(.is-mobile-device) .custom-table >>> tbody tr:hover {
  background-color: #fafafa !important;
}

/* Custom lại thanh cuộn máy tính cho mượt và đẹp */
.page-layout-wrapper:not(.is-mobile-device) .table-responsive-wrapper::-webkit-scrollbar { 
  height: 8px; width: 8px; 
}
.page-layout-wrapper:not(.is-mobile-device) .table-responsive-wrapper::-webkit-scrollbar-track { 
  background: #f1f1f1; border-radius: 4px; 
}
.page-layout-wrapper:not(.is-mobile-device) .table-responsive-wrapper::-webkit-scrollbar-thumb { 
  background: #c1c1c1; border-radius: 4px; 
}
.page-layout-wrapper:not(.is-mobile-device) .table-responsive-wrapper::-webkit-scrollbar-thumb:hover { 
  background: #a2212b; 
}

/* ==========================================================
   CSS ĐIỆN THOẠI THẬT SỰ (MOBILE)
========================================================== */
.is-mobile-device {
  height: auto;
  min-height: 100vh;
}

.is-mobile-device .top-section {
  position: relative;
  z-index: 4; 
  background: #fff;
}

.is-mobile-device .main-content-block,
.is-mobile-device .table-responsive-wrapper {
  overflow: visible !important;
}

.is-mobile-device .custom-table {
  min-width: 100% !important;
  height: auto !important;
}

.is-mobile-device .custom-table >>> .v-data-table__wrapper {
  height: auto !important;
  overflow: visible !important;
}

/* Chỉnh lại giao diện hiển thị cho Card Mode trên Mobile thật */
.is-mobile-device .custom-table >>> .v-data-table__mobile-row {
  align-items: flex-start !important;
  padding: 12px 16px !important;
  min-height: auto !important;
}
.is-mobile-device .custom-table >>> .v-data-table__mobile-row__header {
  font-weight: 600 !important;
  color: #333 !important;
  min-width: 120px;
  margin-right: 16px;
}
.is-mobile-device .custom-table >>> .v-data-table__mobile-row__cell {
  text-align: right !important;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-start;
}
.is-mobile-device .custom-table >>> .v-data-table__wrapper > table > tbody > tr {
  border-bottom: 8px solid #f0f2f5 !important;
  background-color: #ffffff;
  margin-bottom: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}

.custom-toast >>> .v-snack__wrapper {
  border-radius: 8px !important;
}
</style>