<template>
  <div class="page-layout-wrapper d-flex flex-column pa-2 pa-md-4 system-bg" :class="{ 'is-mobile-device': isMobileDevice }">
    <!-- 1. HEADER & BỘ LỌC TÌM KIẾM -->
    <div class="top-section flex-shrink-0 mb-3 bg-white pa-3 rounded-0">
      <v-row align="center" justify="space-between" no-gutters>
        <v-col cols="12" md="auto" class="mb-3 mb-md-0 pb-1 pb-md-0">
          <div class="text-h6 font-weight-bold d-flex align-center">
            Danh sách hệ số lớp&nbsp;(<span style="color: #a2212b">{{ totalItems }}</span>)
          </div>
        </v-col>

        <v-col cols="12" md="auto">
          <div class="d-flex align-center justify-start justify-md-end flex-wrap gap-2">
            <v-text-field
              v-model="filters.search"
              label="Tìm kiếm"
              dense
              outlined
              hide-details
              clearable
              class="filter-input-box flex-grow-1 flex-sm-grow-0 bg-white"
              @keyup.enter="handleExecuteSearch"
            ></v-text-field>

            <v-text-field
              v-model="filters.coefficient"
              label="Tìm theo hệ số"
              dense
              outlined
              hide-details
              clearable
              class="filter-input-box flex-grow-1 flex-sm-grow-0 bg-white"
              @keyup.enter="handleExecuteSearch"
            ></v-text-field>

            <div class="d-flex align-center gap-2 flex-nowrap mt-2 mt-sm-0">
              <v-btn
                icon
                color="#a2212b"
                class="flex-shrink-0 btn-action-icon border-action-btn bg-white"
                @click="resetFilters"
              >
                <v-icon size="20">mdi-refresh</v-icon>
              </v-btn>

              <v-btn
                color="#a2212b"
                dark
                elevation="0"
                class="btn-action-square flex-shrink-0"
                @click="handleExecuteSearch"
              >
                <v-icon size="20">mdi-magnify</v-icon>
              </v-btn>

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

    <!-- 2. BẢNG DỮ LIỆU TÍCH HỢP BaseTable -->
    <div class="main-content-block table-scroll-container flex-grow-1 bg-white pa-3 rounded-0">
      <BaseTable
        :headers="headers"
        :items="paginatedData"
        :loading="loading"
        hide-default-footer
        disable-pagination
        class="elevation-0 bg-transparent custom-table"
      >
        <template v-slot:[`item.stt`]="{ index }">
          <span class="font-weight-medium">{{ (page - 1) * itemsPerPage + index + 1 }}</span>
        </template>

        <template v-slot:[`item.loaiLop`]="{ item }">
          <span>{{ item.loaiLop }}</span>
        </template>

        <template v-slot:[`item.soLuongSv`]="{ item }">
          {{ item.minSv }} - {{ item.maxSv }}
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <div class="d-flex align-center gap-3 justify-center">
            <v-icon size="22" color="#fa8c16" class="action-icon-btn" @click="openEditModal(item)">
              mdi-pencil
            </v-icon>
            <v-icon size="22" color="#f5222d" class="action-icon-btn" @click="openDeleteModal(item)">
              mdi-trash-can
            </v-icon>
          </div>
        </template>
      </BaseTable>
    </div>

    <!-- 3. THANH PHÂN TRANG (Bản ghi: 92x32, Trang: 64x32) -->
    <div class="custom-pagination-bar flex-shrink-0 d-flex align-center justify-end flex-wrap gap-2 py-3 px-3 bg-white mt-2 rounded-0">
      <div class="d-flex align-center flex-wrap justify-end gap-2 w-100">
        <div class="d-flex align-center gap-2">
          <v-select
            v-model="itemsPerPage"
            :items="[10, 20, 50, 100]"
            label="Bản ghi"
            outlined
            dense
            hide-details
            class="outlined-pagination-control select-records bg-white"
            @change="handleExecuteSearch"
          ></v-select>

          <v-text-field
            v-model.number="pageInput"
            label="Trang"
            outlined
            dense
            hide-details
            class="outlined-pagination-control input-page bg-white"
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
          <v-btn outlined class="btn-page-nav mx-1 bg-white" :disabled="page <= 1" @click="changePage(page - 1)">
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

          <v-btn outlined class="btn-page-nav mx-1 bg-white" :disabled="page >= totalPages" @click="changePage(page + 1)">
            <v-icon small color="grey darken-1">mdi-chevron-right</v-icon>
          </v-btn>
        </div>
      </div>
    </div>

    <!-- DIALOG THÊM MỚI / CHỈNH SỬA -->
    <v-dialog v-model="formDialog" max-width="600px" persistent>
      <v-card class="rounded-0 overflow-hidden elevation-0">
        <div class="px-5 py-3 d-flex align-center justify-space-between" style="background-color: #a2212b;">
          <span class="white--text font-weight-bold text-h6">
            {{ isEdit ? 'Cập nhật hệ số lớp' : 'Thêm mới hệ số lớp' }}
          </span>
          <v-btn icon dark x-small @click="formDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>

        <v-card-text class="pa-6">
          <v-form ref="classCoeffForm" v-model="isFormValid">
            <v-row dense>
              <v-col cols="12">
                <v-select
                  v-model="formData.loaiLop"
                  :items="['Lớp mở', 'Lớp ghép (Chuyên ngành)', 'Lớp ghép (Đại cương)', 'Đồ án môn học (HPTT)', 'Đồ án môn học (HP.DAMH)']"
                  label="Loại lớp (*)"
                  dense
                  outlined
                  hide-details="auto"
                  :rules="[v => !!v || 'Vui lòng chọn loại lớp']"
                ></v-select>
              </v-col>
              <v-col cols="12" class="mt-3">
                <v-text-field v-model.number="formData.thuHocPhiSv" label="Thu học phí SV (*)" type="number" dense outlined hide-details="auto" :rules="[v => (v !== null && v !== '') || 'Vui lòng nhập giá trị']"></v-text-field>
              </v-col>
              <v-col cols="12" class="mt-3">
                <v-text-field v-model.number="formData.thanhToanGiangDay" label="Thanh toán giảng dạy" type="number" dense outlined hide-details="auto"></v-text-field>
              </v-col>
              <v-col cols="12" class="mt-3">
                <v-text-field v-model.number="formData.minSv" label="Số lượng tối thiểu (*)" type="number" dense outlined hide-details="auto" :rules="[v => (v !== null && v !== '') || 'Vui lòng nhập số lượng tối thiểu']"></v-text-field>
              </v-col>
              <v-col cols="12" class="mt-3">
                <v-text-field v-model.number="formData.maxSv" label="Số lượng tối đa (*)" type="number" dense outlined hide-details="auto" :rules="[v => (v !== null && v !== '') || 'Vui lòng nhập số lượng tối đa']"></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-5 pt-0 d-flex justify-end gap-2">
          <v-btn outlined class="text-capitalize px-4 rounded-0" @click="formDialog = false">Đóng</v-btn>
          <v-btn color="#a2212b" dark elevation="0" class="text-capitalize px-4 rounded-0" @click="saveData">Lưu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIALOG XÓA -->
    <v-dialog v-model="deleteDialog" max-width="450px" persistent>
      <v-card class="rounded-0 overflow-hidden elevation-0">
        <div class="px-4 py-3 d-flex align-center justify-space-between" style="background-color: #a2212b;">
          <span class="white--text font-weight-bold text-subtitle-1">Xác nhận</span>
          <v-btn icon dark x-small @click="deleteDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        <v-card-text class="pa-5 text-body-2 text--primary">
          Xác nhận xóa hệ số lớp này?
        </v-card-text>
        <v-card-actions class="pa-4 pt-0 d-flex justify-end gap-2">
          <v-btn outlined class="text-capitalize px-4 rounded-0" @click="deleteDialog = false">Đóng</v-btn>
          <v-btn color="#a2212b" dark elevation="0" class="text-capitalize px-4 rounded-0" @click="confirmDelete">Xác Nhận</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import BaseTable from '@/components/Base/BaseTable.vue'
import { MOCK_DINH_MUC_GIANG_VIEN } from '~/consts/mockDinhMucGiangVien.js'

export default {
  name: 'QuanLyHeSoLop',
  components: { BaseTable },
  data() {
    return {
      isMobileDevice: false,
      loading: false,
      formDialog: false,
      deleteDialog: false,
      isEdit: false,
      isFormValid: true,

      page: 1,
      pageInput: 1,
      itemsPerPage: 50,

      filters: { search: '', coefficient: '' },
      selectedItem: {},
      formData: { id: null, loaiLop: 'Lớp mở', thuHocPhiSv: 1.0, thanhToanGiangDay: '', minSv: 1, maxSv: 10 },

      headers: [
        { text: 'STT', value: 'stt', sortable: false, width: '70px', align: 'left' },
        { text: 'Loại lớp', value: 'loaiLop', sortable: false, align: 'left' },
        { text: 'Thu học phí SV', value: 'thuHocPhiSv', sortable: false, align: 'center' },
        { text: 'Thanh toán giảng dạy', value: 'thanhToanGiangDay', sortable: false, align: 'center' },
        { text: 'Số lượng sinh viên', value: 'soLuongSv', sortable: false, align: 'center' },
        { text: 'Chức năng', value: 'actions', sortable: false, align: 'center', width: '130px' },
      ],

      dataList: [...MOCK_DINH_MUC_GIANG_VIEN],
      appliedData: [],
    }
  },
  computed: {
    totalItems() { return this.appliedData.length },
    totalPages() { return Math.ceil(this.totalItems / this.itemsPerPage) || 1 },
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
  created() { this.appliedData = [...this.dataList] },
  mounted() {
    if (typeof navigator !== 'undefined') {
      this.isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }
  },
  methods: {
    handleExecuteSearch(resetPage = true) {
      const keyword = (this.filters.search || '').toLowerCase().trim()
      const coeff = (this.filters.coefficient || '').trim()

      this.appliedData = this.dataList.filter((item) => {
        const matchSearch = !keyword || (item.loaiLop || '').toLowerCase().includes(keyword)
        const matchCoeff = !coeff || String(item.thuHocPhiSv).includes(coeff) || String(item.thanhToanGiangDay).includes(coeff)
        return matchSearch && matchCoeff
      })

      if (resetPage) { this.page = 1; this.pageInput = 1 }
    },
    handleGoBtnClick() {
      this.handleExecuteSearch(false)
      const targetPage = parseInt(this.pageInput, 10)
      if (targetPage && targetPage >= 1 && targetPage <= this.totalPages) this.page = targetPage
      else { this.page = 1; this.pageInput = 1 }
    },
    resetFilters() {
      this.filters = { search: '', coefficient: '' }
      this.appliedData = [...this.dataList]
      this.page = 1; this.pageInput = 1
    },
    changePage(p) { if (p >= 1 && p <= this.totalPages) { this.page = p; this.pageInput = p } },
    openCreateModal() {
      this.isEdit = false
      this.formData = { id: null, loaiLop: 'Lớp mở', thuHocPhiSv: 1.0, thanhToanGiangDay: '', minSv: 1, maxSv: 10 }
      if (this.$refs.classCoeffForm) this.$refs.classCoeffForm.resetValidation()
      this.formDialog = true
    },
    openEditModal(item) {
      this.isEdit = true
      this.selectedItem = item
      this.formData = { ...item }
      if (this.$refs.classCoeffForm) this.$refs.classCoeffForm.resetValidation()
      this.formDialog = true
    },
    saveData() {
      if (this.$refs.classCoeffForm && !this.$refs.classCoeffForm.validate()) return
      const newItem = {
        id: this.isEdit ? this.formData.id : Date.now(),
        loaiLop: this.formData.loaiLop,
        thuHocPhiSv: Number(this.formData.thuHocPhiSv),
        thanhToanGiangDay: this.formData.thanhToanGiangDay !== '' ? Number(this.formData.thanhToanGiangDay) : '',
        minSv: Number(this.formData.minSv),
        maxSv: Number(this.formData.maxSv),
      }
      if (this.isEdit) Object.assign(this.selectedItem, newItem)
      else { this.dataList.unshift(newItem); this.appliedData = [...this.dataList]; this.page = 1; this.pageInput = 1 }
      this.formDialog = false
    },
    openDeleteModal(item) { this.selectedItem = item; this.deleteDialog = true },
    confirmDelete() {
      const index = this.dataList.findIndex(x => x.id === this.selectedItem.id)
      if (index !== -1) { this.dataList.splice(index, 1); this.appliedData = [...this.dataList] }
      this.deleteDialog = false
    },
  },
}
</script>

<style scoped>
.system-bg {
  background-color: #f4f6f8 !important;
  min-height: calc(100vh - 64px);
}

.rounded-0 { border-radius: 0px !important; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }

.filter-input-box { min-width: 180px; flex: 1 1 140px; }
@media (min-width: 960px) { .filter-input-box { max-width: 160px; } }

::v-deep .filter-input-box.v-text-field--outlined .v-input__control,
::v-deep .filter-input-box.v-text-field--outlined .v-input__slot {
  min-height: 40px !important; height: 40px !important; padding: 0 10px !important;
}

.btn-action-icon { width: 40px !important; height: 40px !important; }
.btn-action-square { width: 48px !important; min-width: 48px !important; height: 40px !important; border-radius: 4px !important; padding: 0 !important; }

/* Tùy chỉnh kích thước ô Bản ghi (92x32px) và Trang (64x32px) */
.select-records.v-text-field--outlined,
.select-records.v-text-field--outlined .v-input__control,
.select-records.v-text-field--outlined .v-input__slot {
  width: 92px !important;
  min-width: 92px !important;
  max-width: 92px !important;
  height: 32px !important;
  min-height: 32px !important;
}

.input-page.v-text-field--outlined,
.input-page.v-text-field--outlined .v-input__control,
.input-page.v-text-field--outlined .v-input__slot {
  width: 64px !important;
  min-width: 64px !important;
  max-width: 64px !important;
  height: 32px !important;
  min-height: 32px !important;
}

::v-deep .outlined-pagination-control .v-input__slot {
  padding: 0 6px !important;
}

::v-deep .outlined-pagination-control input,
::v-deep .outlined-pagination-control .v-select__selection {
  font-size: 13px !important;
  padding: 0 !important;
}

.btn-go {
  height: 32px !important;
  min-height: 32px !important;
  border-radius: 4px !important;
}

.btn-page-nav {
  height: 32px !important;
  min-height: 32px !important;
  min-width: 32px !important;
  padding: 0 8px !important;
  border-radius: 4px !important;
}

.action-icon-btn { cursor: pointer; transition: transform 0.15s ease, opacity 0.15s ease; }
.action-icon-btn:hover { opacity: 0.8; transform: scale(1.15); }

.page-layout-wrapper:not(.is-mobile-device) { height: calc(100vh - 64px); }
.page-layout-wrapper:not(.is-mobile-device) .main-content-block { display: flex; flex-direction: column; overflow: auto; }
</style>