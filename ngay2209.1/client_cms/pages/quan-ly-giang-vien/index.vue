<template>
  <div class="teacher-page d-flex flex-column pa-2 pa-sm-4 bg-white">
    
    <!-- 1. THANH TÌM KIẾM CỐ ĐỊNH PHÍA TRÊN -->
    <div class="top-filter-bar bg-white py-3 px-1">
      <div class="d-flex align-center justify-space-between flex-wrap gap-2 width-100">
        <div class="text-subtitle-1 font-weight-bold mr-2 text-no-wrap">
          Danh sách giảng viên ({{ filteredTeachers.length }})
        </div>

        <div class="d-flex align-center gap-2 flex-wrap flex-grow-1 justify-end">
          <v-text-field
            v-model="filters.search"
            placeholder="Tìm kiếm"
            outlined
            dense
            hide-details
            class="bg-white filter-item search-input custom-outlined-input"
            @keyup.enter="search"
          ></v-text-field>

          <v-select
            v-model="filters.gender"
            :items="['Nam', 'Nữ', 'Khác']"
            label="Giới tính"
            outlined
            dense
            hide-details
            clearable
            :menu-props="{ attach: true, offsetY: true, zIndex: 999 }"
            class="bg-white filter-item select-sm custom-outlined-input"
            @change="search"
          ></v-select>

          <v-select
            v-model="filters.teacherType"
            :items="['Đương chức', 'Mời giảng']"
            label="Loại giảng viên"
            placeholder="Loại giảng viên"
            outlined
            dense
            hide-details
            clearable
            :menu-props="{ attach: true, offsetY: true, zIndex: 999 }"
            class="bg-white filter-item select-md custom-outlined-input"
            @change="search"
          ></v-select>

          <v-select
            v-model="filters.status"
            :items="['Hoạt động', 'Nghỉ hưu']"
            label="Trạng thái"
            placeholder="Trạng thái"
            outlined
            dense
            hide-details
            clearable
            :menu-props="{ attach: true, offsetY: true, zIndex: 999 }"
            class="bg-white filter-item select-md custom-outlined-input"
            @change="search"
          ></v-select>

          <v-select
            v-model="filters.department"
            :items="['Đại học Bách khoa Hà Nội', 'Khoa CNTT']"
            label="Khoa/ Trường"
            placeholder="Khoa/ Trường"
            outlined
            dense
            hide-details
            clearable
            :menu-props="{ attach: true, offsetY: true, zIndex: 999 }"
            class="bg-white filter-item select-lg custom-outlined-input"
            @change="search"
          ></v-select>

          <div class="d-flex gap-2 align-center">
            <v-btn icon color="#a2212b" class="rounded-sm" @click="resetFilters">
              <v-icon color="#a2212b" size="24">mdi-refresh</v-icon>
            </v-btn>

            <v-btn color="#a2212b" dark elevation="0" class="min-w-0 px-3 rounded-sm" style="height: 40px;" @click="search">
              <v-icon size="24">mdi-magnify</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. BẢNG DỮ LIỆU KHÔNG VIỀN KHUNG -->
    <div class="table-container bg-white">
      <v-data-table
        :headers="headers"
        :items="paginatedTeachers"
        hide-default-footer
        disable-pagination
        fixed-header
        class="custom-table height-100"
      >
      
        <template #[`item.stt`]="{ index }">
          <span class="font-weight-medium">{{ (page - 1) * itemsPerPage + index + 1 }}</span>
        </template>

        <template #[`item.generalInfo`]="{ item }">
          <div class="py-2">
            <div class="font-weight-bold red--text text--darken-3 mb-1">
              {{ item.fullName }}
            </div>
            <div v-if="item.phone" class="caption text--secondary">
              Số điện thoại: <span class="red--text text--darken-2 font-weight-medium">{{ item.phone }}</span>
            </div>
            <div v-if="item.dob" class="caption text--secondary">
              Ngày sinh: <span class="red--text text--darken-2 font-weight-medium">{{ item.dob }}</span>
            </div>
            <div v-if="item.email" class="caption text--secondary">
              Email: <span class="red--text text--darken-2 font-weight-medium">{{ item.email }}</span>
            </div>
            <div v-if="item.gender" class="caption text--secondary">
              Giới tính: <span class="red--text text--darken-2 font-weight-bold">{{ item.gender }}</span>
            </div>
          </div>
        </template>

        <!-- SLOT HIỂN THỊ LOẠI GIẢNG VIÊN -->
        <template #[`item.teacherType`]="{ item }">
          <span
            class="status-badge"
            :class="(item.teacherType === 'Đương chức' || item.teacherType === 'FULL_TIME') ? 'type-fulltime' : 'type-visiting'"
          >
            {{ item.teacherType }}
          </span>
        </template>

        <!-- SLOT HIỂN THỊ & CHUYỂN ĐỔI TRẠNG THÁI -->
        <template #[`item.status`]="{ item }">
          <v-menu 
            offset-y 
            bottom 
            left 
            :z-index="999"
          >
            <template #activator="{ on, attrs }">
              <div
                v-bind="attrs"
                v-on="on"
                class="status-badge style-pointer d-flex align-center justify-space-between"
                :class="(item.status === 'Hoạt động' || item.status === 'ACTIVE') ? 'status-active' : 'status-inactive'"
                style="cursor: pointer; min-width: 110px;"
              >
                <span>{{ item.status }}</span>
                <v-icon size="20" color="white">
                  mdi-menu-down
                </v-icon>
              </div>
            </template>

            <v-list dense class="py-1">
              <v-list-item @click="openConfirmStatusDialog(item, 'Hoạt động')">
                <v-list-item-title class="red--text text--darken-1 font-weight-bold">
                  Hoạt động
                </v-list-item-title>
              </v-list-item>
              <v-list-item @click="openConfirmStatusDialog(item, 'Nghỉ hưu')">
                <v-list-item-title class="grey--text text--darken-2 font-weight-bold">
                  Nghỉ hưu
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>

        <template #[`item.actions`]="{ item }">
          <div class="d-flex align-center justify-center gap-1">
            <v-btn icon x-small color="cyan darken-1" @click="viewDetail(item)">
              <v-icon size="24" color="blue">mdi-eye</v-icon>
            </v-btn>

            <v-btn icon x-small color="teal" @click="checkHistory(item)">
              <v-icon size="24" color="green">mdi-table-account</v-icon>
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- 3. THANH PHÂN TRANG DƯỚI -->
    <div class="bottom-fixed-bar d-flex align-center justify-space-between flex-wrap gap-2 py-3 px-1 bg-white">
      <v-btn
        color="#2e7d32"
        dark
        elevation="0"
        class="text-capitalize rounded px-4 font-weight-bold"
        @click="exportToExcel"
      >
        <v-icon left small>mdi-export</v-icon> XUẤT FILE EXCEL
      </v-btn>

      <div class="d-flex align-center gap-2">
        <!-- Ô Chọn Bản ghi -->
        <v-select
          v-model="itemsPerPage"
          :items="[10, 20, 50, 100]"
          label="Bản ghi"
          dense
          outlined
          hide-details
          :menu-props="{ attach: true, top: true, offsetY: true, zIndex: 999 }"
          class="pagination-input"
          style="width: 85px"
          @change="onItemsPerPageChange"
        ></v-select>

        <!-- Ô Nhập Trang -->
        <v-text-field
          v-model.number="pageInput"
          label="Trang"
          dense
          outlined
          hide-details
          class="pagination-input text-center"
          style="width: 65px"
          @keyup.enter="goToPage"
        ></v-text-field>

        <v-btn 
          color="#a2212b" 
          dark 
          small 
          class="text-capitalize px-3 rounded-sm elevation-0" 
          style="height: 36px;" 
          @click="goToPage"
        >
          Đi
        </v-btn>

        <v-btn icon small :disabled="page <= 1" @click="changePage(page - 1)">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        
        <v-btn
          v-for="p in visiblePages"
          :key="p"
          small
          :color="page === p ? '#a2212b' : ''"
          :dark="page === p"
          :outlined="page !== p"
          class="min-w-0 pa-0 rounded-sm elevation-0"
          style="width: 28px; height: 28px"
          @click="changePage(p)"
        >
          {{ p }}
        </v-btn>

        <v-btn icon small :disabled="page >= totalPages" @click="changePage(page + 1)">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- DIALOGS & TOAST -->
    <v-dialog v-model="confirmStatusDialog" max-width="500px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="pa-3 text-subtitle-1 font-weight-bold white--text d-flex justify-space-between align-center" style="background-color: #a2212b;">
          <span>Xác nhận đổi trạng thái</span>
          <v-btn icon dark x-small @click="confirmStatusDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-5 black--text text-body-1">
          <div class="my-2">
            Bạn có chắc chắn muốn đổi trạng thái từ <span class="font-weight-bold red--text text--darken-2">{{ pendingStatusChange.oldStatus }}</span> sang <span class="font-weight-bold red--text text--darken-2">{{ pendingStatusChange.newStatus }}</span> không?
          </div>
          <div class="d-flex justify-end gap-2 mt-6">
            <v-btn outlined class="text-capitalize border-btn font-weight-bold" color="#a2212b" @click="confirmStatusDialog = false">
              Đóng X
            </v-btn>
            <v-btn color="#a2212b" dark elevation="0" class="text-capitalize font-weight-bold" @click="confirmStatusUpdate">
              Xác nhận
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="detailDialog" max-width="560px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="pa-3 text-subtitle-1 font-weight-bold white--text d-flex justify-space-between align-center" style="background-color: #a2212b;">
          <span>Thông tin giảng viên</span>
          <v-btn icon dark x-small @click="detailDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-5 black--text">
          <v-row dense>
            <v-col cols="6" class="py-2">
              <div class="grey--text text--darken-1 body-2">Họ tên: <span class="font-weight-bold text--primary">{{ selectedTeacher.fullName }}</span></div>
            </v-col>
            <v-col cols="6" class="py-2">
              <div class="grey--text text--darken-1 body-2">Mã giảng viên: <span class="font-weight-bold red--text text--darken-3">{{ selectedTeacher.code || '---' }}</span></div>
            </v-col>
            <v-col cols="6" class="py-2">
              <div class="grey--text text--darken-1 body-2">SĐT: <span class="font-weight-bold red--text text--darken-3">{{ selectedTeacher.phone || '---' }}</span></div>
            </v-col>
            <v-col cols="6" class="py-2">
              <div class="grey--text text--darken-1 body-2">Ngày sinh: <span class="font-weight-bold text--primary">{{ selectedTeacher.dob || '---' }}</span></div>
            </v-col>
            <v-col cols="6" class="py-2">
              <div class="grey--text text--darken-1 body-2">Mã số thuế: <span class="font-weight-bold text--primary">{{ selectedTeacher.taxCode || '---' }}</span></div>
            </v-col>
            <v-col cols="6" class="py-2 d-flex align-center">
              <span class="grey--text text--darken-1 body-2 mr-2">Loại giảng viên:</span>
              <v-chip v-if="selectedTeacher.teacherType" x-small dark :color="selectedTeacher.teacherType === 'Đương chức' ? '#ffb100' : '#4caf50'" class="font-weight-bold">
                {{ selectedTeacher.teacherType }}
              </v-chip>
            </v-col>
            <v-col cols="12" class="py-2 d-flex align-center">
              <span class="grey--text text--darken-1 body-2 mr-2">Trạng thái:</span>
              <v-chip x-small dark color="#a2212b" class="font-weight-bold">
                {{ selectedTeacher.status }}
              </v-chip>
            </v-col>
          </v-row>
          <div class="d-flex justify-center mt-6">
            <v-btn outlined class="text-capitalize px-6 border-btn font-weight-bold" color="#a2212b" @click="detailDialog = false">
              Đóng X
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="historyDialog" max-width="680px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="pa-3 text-subtitle-1 font-weight-bold white--text d-flex justify-space-between align-center" style="background-color: #a2212b;">
          <span>Lịch sử cập nhật dữ liệu giảng viên</span>
          <v-btn icon dark x-small @click="historyDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-5 black--text">
          <v-card flat class="pa-3 mb-4 rounded-lg" style="background-color: #fff0f1; border: 1px solid #ffe0e3;">
            <div class="text-subtitle-1">
              Thời gian mới nhất: <span class="font-weight-bold">{{ selectedTeacher.lastUpdated }}</span>
            </div>
          </v-card>
          <v-row dense class="text-body-2">
            <v-col cols="12" class="pb-2">
              <span class="red--text text--darken-2">Người cập nhật:</span> <span class="red--text text--darken-2 font-weight-medium">Admin</span>
            </v-col>
            <v-col cols="6" class="py-1">
              <span class="red--text text--darken-2">Họ tên:</span> <span class="red--text text--darken-3 font-weight-bold">{{ selectedTeacher.fullName }}</span>
            </v-col>
            <v-col cols="6" class="py-1">
              <span class="grey--text text--darken-2">Email:</span> <span class="red--text text--darken-3 font-weight-medium">{{ selectedTeacher.email || 'baoien121124@gmail.com' }}</span>
            </v-col>
            <v-col cols="6" class="py-1">
              <span class="grey--text text--darken-2">Giới tính:</span> <span class="red--text text--darken-3 font-weight-bold">{{ selectedTeacher.gender || 'Nữ' }}</span>
            </v-col>
            <v-col cols="6" class="py-1">
              <span class="grey--text text--darken-2">Mã đối tượng:</span>
            </v-col>
            <v-col cols="6" class="py-1">
              <span class="grey--text text--darken-2">Mã giảng viên:</span> <span class="red--text text--darken-3 font-weight-bold">{{ selectedTeacher.code }}</span>
            </v-col>
            <v-col cols="6" class="py-1">
              <span class="grey--text text--darken-2">SĐT:</span> <span class="red--text text--darken-3 font-weight-bold">{{ selectedTeacher.phone || '0856146936' }}</span>
            </v-col>
            <v-col cols="6" class="py-1">
              <span class="grey--text text--darken-2">Ngày sinh:</span> <span class="font-weight-medium">{{ selectedTeacher.dob || '' }}</span>
            </v-col>
            <v-col cols="6" class="py-1">
              <span class="grey--text text--darken-2">Số tài khoản NH:</span>
            </v-col>
            <v-col cols="6" class="py-1">
              <span class="grey--text text--darken-2">Mã số thuế:</span> <span class="font-weight-medium">{{ selectedTeacher.taxCode || '' }}</span>
            </v-col>
            <v-col cols="6" class="py-1">
              <span class="grey--text text--darken-2">Đơn vị:</span>
            </v-col>
            <v-col cols="6" class="py-1 d-flex align-center">
              <span class="grey--text text--darken-2 mr-2">Trạng thái:</span>
              <v-chip x-small dark color="#a2212b" class="font-weight-bold">
                {{ selectedTeacher.status }}
              </v-chip>
            </v-col>
            <v-col cols="6" class="py-1 d-flex align-center">
              <span class="grey--text text--darken-2 mr-2">Loại giảng viên:</span>
              <v-chip x-small dark :color="selectedTeacher.teacherType === 'Đương chức' ? '#ffb100' : '#4caf50'" class="font-weight-bold">
                {{ selectedTeacher.teacherType }}
              </v-chip>
            </v-col>
          </v-row>
          <div class="d-flex justify-end mt-6">
            <v-btn outlined class="text-capitalize px-6 border-btn font-weight-bold" color="#a2212b" @click="historyDialog = false">
              Đóng X
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="toast.show" top right :color="toast.color" timeout="3000" class="custom-toast">
      <div class="d-flex align-center font-weight-medium" :class="toast.color === '#4caf50' ? 'white--text' : 'black--text'">
        <v-icon :color="toast.color === '#4caf50' ? 'white' : 'black'" class="mr-2">
          {{ toast.color === '#4caf50' ? 'mdi-check-circle' : 'mdi-alert-circle' }}
        </v-icon>
        <span>{{ toast.message }}</span>
      </div>
      <template #action="{ attrs }">
        <v-btn text icon :color="toast.color === '#4caf50' ? 'white' : 'black'" v-bind="attrs" @click="toast.show = false">
          <v-icon small>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>

  </div>
</template>

<script>
import * as XLSX from 'xlsx'

export default {
  name: 'QuanLyGiangVienPage',
  middleware: 'authenticated',
  mounted() {
    if (this.$store) {
      this.$store.commit('SET_PAGE_TITLE', 'Quản lý giảng viên')
    }
  },
  data() {
    return {
      page: 1,
      pageInput: 1,
      itemsPerPage: 50,
      filters: { search: '', gender: null, teacherType: null, status: null, department: null },

      detailDialog: false,
      historyDialog: false,
      confirmStatusDialog: false,

      selectedTeacher: {},
      pendingStatusChange: { teacher: null, oldStatus: '', newStatus: '' },

      toast: { show: false, message: '', color: '#ffc107' },

      headers: [
        { text: 'STT', value: 'stt', sortable: false, width: '60px' },
        { text: 'Thông tin chung', value: 'generalInfo', sortable: false, width: '260px' },
        { text: 'Mã giảng viên', value: 'code', sortable: false },
        { text: 'Đơn vị', value: 'unit', sortable: false },
        { text: 'Khoa/ Trường', value: 'department', sortable: false },
        { text: 'Mã số thuế', value: 'taxCode', sortable: false },
        { text: 'Loại giảng viên', value: 'teacherType', sortable: false },
        { text: 'Trạng thái', value: 'status', sortable: false, width: '143px' },
        { text: 'Chức năng', value: 'actions', sortable: false, align: 'center', width: '90px' },
      ],
      teachers: [
        { id: 1, fullName: 'Trần Bảo Yến', phone: '0856146936', email: 'baoien121124@gmail.com', gender: 'Nữ', code: 'TTBY01', unit: '', department: '', taxCode: '', teacherType: 'Đương chức', status: 'Hoạt động', dob: '', hasUpdate: false, lastUpdated: '' },
        { id: 2, fullName: 'Trần Mạnh Dũng', phone: '0327699521', dob: '29/12/2004', email: 'dungtm@gmail.com', gender: 'Nam', code: 'GV_271204', unit: '', department: '', taxCode: '', teacherType: 'Đương chức', status: 'Hoạt động', hasUpdate: false, lastUpdated: '' },
        { id: 3, fullName: 'Trần Mạnh Hải', phone: '0988096338', dob: '28/12/2004', email: 'haitm@gmail.com', gender: 'Nam', code: 'GV_260520_002', unit: '', department: '', taxCode: '8075678901', teacherType: 'Đương chức', status: 'Hoạt động', hasUpdate: false, lastUpdated: '' },
        { id: 4, fullName: 'Trần Ngọc Anh', phone: '0965336221', dob: '01/10/2000', email: 'test06@onebs.vn', gender: 'Nam', code: 'GV_260520_001', unit: '', department: '', taxCode: '4502320054', teacherType: 'Mời giảng', status: 'Hoạt động', hasUpdate: false, lastUpdated: '' },
        { id: 5, fullName: 'Lưu Thị Oanh', dob: '03/05/1961', code: '002 014 00046', unit: '', department: '', taxCode: '', teacherType: 'Đương chức', status: 'Hoạt động', hasUpdate: false, lastUpdated: '' },
        { id: 6, fullName: 'Trần Bảo Yến', phone: '0856146936', email: 'baoien121124@gmail.com', gender: 'Nữ', code: 'TTBY01', unit: '', department: '', taxCode: '', teacherType: 'Đương chức', status: 'Hoạt động', dob: '', hasUpdate: false, lastUpdated: '' },
        { id: 7, fullName: 'Trần Mạnh Dũng', phone: '0327699521', dob: '29/12/2004', email: 'dungtm@gmail.com', gender: 'Nam', code: 'GV_271204', unit: '', department: '', taxCode: '', teacherType: 'Đương chức', status: 'Hoạt động', hasUpdate: false, lastUpdated: '' },
        { id: 8, fullName: 'Trần Mạnh Hải', phone: '0988096338', dob: '28/12/2004', email: 'haitm@gmail.com', gender: 'Nam', code: 'GV_260520_002', unit: '', department: '', taxCode: '8075678901', teacherType: 'Đương chức', status: 'Hoạt động', hasUpdate: false, lastUpdated: '' },
        { id: 9, fullName: 'Trần Ngọc Anh', phone: '0965336221', dob: '01/10/2000', email: 'test06@onebs.vn', gender: 'Nam', code: 'GV_260520_001', unit: '', department: '', taxCode: '4502320054', teacherType: 'Mời giảng', status: 'Hoạt động', hasUpdate: false, lastUpdated: '' },
        { id: 10, fullName: 'Lưu Thị Oanh', dob: '03/05/1961', code: '002 014 00046', unit: '', department: '', taxCode: '', teacherType: 'Đương chức', status: 'Hoạt động', hasUpdate: false, lastUpdated: '' },
      ],
    }
  },
  computed: {
    filteredTeachers() {
      return this.teachers.filter(t => {
        const matchSearch = !this.filters.search || t.fullName.toLowerCase().includes(this.filters.search.toLowerCase()) || t.code.toLowerCase().includes(this.filters.search.toLowerCase())
        const matchGender = !this.filters.gender || t.gender === this.filters.gender
        const matchType = !this.filters.teacherType || t.teacherType === this.filters.teacherType
        const matchStatus = !this.filters.status || t.status === this.filters.status
        return matchSearch && matchGender && matchType && matchStatus
      })
    },
    paginatedTeachers() {
      const start = (this.page - 1) * this.itemsPerPage
      return this.filteredTeachers.slice(start, start + this.itemsPerPage)
    },
    totalPages() {
      const total = Math.ceil(this.filteredTeachers.length / this.itemsPerPage)
      return total > 0 ? total : 1
    },
    visiblePages() {
      const pages = []
      for (let i = 1; i <= this.totalPages; i++) pages.push(i)
      return pages
    }
  },
  methods: {
    getStatusClass(status) {
      if (!status) return 'status-inactive'
      const val = status.toString().toUpperCase()
      if (val === 'ACTIVE' || val === 'HOẠT ĐỘNG' || val === 'HOAT DONG') {
        return 'status-active'
      }
      return 'status-inactive'
    },

    getStatusIconColor(status) {
      if (!status) return '#5f6368'
      const val = status.toString().toUpperCase()
      if (val === 'ACTIVE' || val === 'HOẠT ĐỘNG' || val === 'HOAT DONG') {
        return '#d93025'
      }
      return '#5f6368'
    },

    getTeacherTypeClass(type) {
      if (!type) return 'type-visiting'
      const val = type.toString().toUpperCase()
      if (val === 'FULL_TIME' || val === 'ĐƯƠNG CHỨC' || val === 'DUONG CHUC') {
        return 'type-fulltime'
      }
      return 'type-visiting'
    },

    getCurrentDateTime() {
      const now = new Date()
      return `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    },
    search() { this.page = 1; this.pageInput = 1 },
    resetFilters() {
      this.filters = { search: '', gender: null, teacherType: null, status: null, department: null }
      this.page = 1; this.pageInput = 1
    },
    changePage(p) { if (p >= 1 && p <= this.totalPages) { this.page = p; this.pageInput = p } },
    goToPage() {
      let target = parseInt(this.pageInput)
      if (isNaN(target) || target < 1) target = 1
      if (target > this.totalPages) target = this.totalPages
      this.page = target; this.pageInput = target
    },
    onItemsPerPageChange() { this.page = 1; this.pageInput = 1 },
    viewDetail(item) { this.selectedTeacher = item; this.detailDialog = true },
    checkHistory(item) {
      this.selectedTeacher = { ...item }
      if (item.hasUpdate) this.historyDialog = true
      else this.showToast('Không có dữ liệu cập nhật mới.', '#ffc107')
    },

    openConfirmStatusDialog(item, newStatus) {
      if (item.status === newStatus) return
      this.pendingStatusChange = { teacher: item, oldStatus: item.status, newStatus }
      this.confirmStatusDialog = true
    },

    confirmStatusUpdate() {
      if (this.pendingStatusChange.teacher) {
        const teacher = this.pendingStatusChange.teacher
        teacher.status = this.pendingStatusChange.newStatus
        teacher.hasUpdate = true
        teacher.lastUpdated = this.getCurrentDateTime()
        
        this.confirmStatusDialog = false
        this.showToast(`Đã chuyển trạng thái sang thành công`, '#4caf50')
      }
    },

    exportToExcel() {
      const dataToExport = this.filteredTeachers.map((item, index) => ({
        'STT': index + 1,
        'Họ và Tên': item.fullName,
        'Mã Giảng Viên': item.code,
        'Số điện thoại': item.phone || '---',
        'Email': item.email || '---',
        'Giới tính': item.gender || '---',
        'Ngày sinh': item.dob || '---',
        'Đơn vị': item.unit || '---',
        'Khoa/ Trường': item.department || '---',
        'Mã số thuế': item.taxCode || '---',
        'Loại giảng viên': item.teacherType,
        'Trạng thái': item.status,
      }))

      if (dataToExport.length === 0) {
        this.showToast('Không có dữ liệu để xuất file!', '#ffc107')
        return
      }

      const worksheet = XLSX.utils.json_to_sheet(dataToExport)
      const autoFitCols = Object.keys(dataToExport[0]).map(key => ({
        wch: Math.max(key.length + 5, 15)
      }))
      worksheet['!cols'] = autoFitCols

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách giảng viên')

      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')

      const timeString = `${year}_${month}_${day}_${hours}${minutes}${seconds}`
      const randomSuffix = Math.random().toString(16).substring(2, 6)

      const fileName = `danh_sach_giang_vien_${timeString}_${randomSuffix}.xlsx`
      XLSX.writeFile(workbook, fileName)
      
    },
    showToast(message, color) {
      this.toast.message = message; this.toast.color = color; this.toast.show = true
    }
  }
}
</script>

<style scoped>
/* --- BASE BADGE --- */
.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
}

/* --- TRẠNG THÁI (STATUS) --- */
/* Hoạt động / ACTIVE: Màu đỏ */
.status-active {
  background-color: #a2212b!important;
  color: #ffff !important;
}

/* Nghỉ hưu / INACTIVE: Màu xám */
.status-inactive {
  background-color: #9e9e9e !important;
  color: #ffff !important;
}

/* --- LOẠI GIẢNG VIÊN (TEACHER TYPE) --- */
/* Đương chức / FULL_TIME: Màu vàng */
.type-fulltime {
  background-color: #ffae1f !important;
  color: #ffff !important;
}

/* Mời giảng / VISITING: Màu xanh lá */
.type-visiting {
  background-color: #4caf50 !important;
  color: #ffff !important;
}

.teacher-page {
  height: calc(100vh - 64px); 
  overflow: hidden;
}

.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.border-btn { border: 1px solid #a2212b !important; }


/* 1. THANH TÌM KIẾM CỐ ĐỊNH PHÍA TRÊN */
.top-filter-bar { flex-shrink: 0; }

.filter-item { flex: 1 1 100%; }
@media (min-width: 600px) {
  .filter-item { flex: 1 1 auto; }
  .search-input { min-width: 150px; max-width: 220px; }
  .select-sm { min-width: 100px; max-width: 130px; }
  .select-md { min-width: 120px; max-width: 150px; }
  .select-lg { min-width: 140px; max-width: 180px; }
}

.custom-outlined-input >>> .v-input__control {
  min-height: 40px !important;
}

.custom-outlined-input >>> fieldset {
  border-color: #ccc !important;
  border-radius: 4px !important;
}

.custom-outlined-input.v-input--is-focused >>> fieldset {
  border-color: #a2212b !important;
  border-width: 1px !important;
}

.custom-outlined-input >>> .v-label {
  top: 10px !important;
  font-size: 13px !important;
  color: #757575 !important;
}

.custom-outlined-input.v-input--is-label-active >>> .v-label {
  top: -10px !important;
  transform: translateY(0) scale(0.85) !important;
  background-color: white !important;
  padding: 0 4px !important;
}

.custom-outlined-input >>> .v-input__append-inner {
  margin-top: 8px !important;
}

/* 2. KHUNG CHỨA BẢNG VÀ HEADER CỐ ĐỊNH */
.table-container {
  flex: 1 1 auto;
  min-height: 0;
  position: relative;
  overflow: hidden;
}

.custom-table {
  height: 100%;
  min-width: 950px !important;
  background-color: transparent !important;
}

.custom-table >>> .v-data-table__wrapper {
  height: 100% !important;
  max-height: 100% !important;
  overflow-y: auto !important;
  border: none !important;
}

/* CỬA SỔ CHỈNH SỬA TẠI ĐÂY:
   Thay z-index từ 10 xuống 1 để header chỉ nằm trên các hàng dữ liệu (row) 
   nhưng vẫn nằm bên dưới menu/dropdown/dialog/popup. */
.custom-table >>> th {
  position: sticky !important;
  top: 0 !important;
  z-index: 1 !important;
  background-color: #f5f5f5 !important;
  font-weight: bold !important;
  color: #333 !important;
  box-shadow: 0 1px 0 #e0e0e0 !important;
}

/* 3. ĐỌAN CSS SỬA DÀNH RIÊNG CHO CHỮ "BẢN GHI" VÀ "TRANG" Ở THANH PHÂN TRANG */
.bottom-fixed-bar { flex-shrink: 0; }

.pagination-input >>> .v-input__control {
  min-height: 36px !important;
}

.pagination-input >>> .v-input__slot {
  min-height: 36px !important;
  padding: 0 8px !important;
}

.pagination-input >>> fieldset {
  border-color: #cccccc !important;
  border-radius: 4px !important;
}

/* Vị trí Label khi ô trống */
.pagination-input >>> .v-label {
  top: 8px !important;
  font-size: 12px !important;
  color: #757575 !important;
  transform-origin: top left !important;
}

/* KHẮC PHỤC CHÍNH: Ép Label nằm đè chính giữa viền khung trên khi đã chọn giá trị */
.pagination-input.v-input--is-label-active >>> .v-label {
  top: -10px !important;
  transform: translateY(0) scale(0.85) !important;
  background-color: #ffffff !important;
  padding: 0 4px !important;
  z-index: 2 !important;
}

.pagination-input.text-center >>> input {
  text-align: center !important;
  padding: 0 !important;
}

.pagination-input >>> .v-select__selection--comma {
  margin-top: 4px !important;
  font-size: 13px !important;
}

.pagination-input >>> .v-input__append-inner {
  margin-top: 6px !important;
}

/* SELECT TRẠNG THÁI TRONG BẢNG */
.status-select-btn >>> .v-input__slot {
  background-color: #a2212b !important;
  border-radius: 20px !important;
  min-height: 28px !important;
  padding: 0 10px !important;
}
.status-select-btn >>> .v-select__selection {
  color: white !important;
  font-size: 12px !important;
  font-weight: bold !important;
}
.status-select-btn >>> .v-icon { color: white !important; }

.custom-toast >>> .v-snack__wrapper { border-radius: 8px !important; }

/* Khối bọc cho phép kéo cuộn ngang khi thu nhỏ màn hình */
.table-container {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.custom-table {
  min-width: 1000px !important;
}

.custom-table >>> th { background-color: #f8f9fa !important; font-weight: bold !important; color: #333 !important; }

.status-select-btn >>> .v-input__slot { background-color: #a2212b !important; border-radius: 20px !important; min-height: 28px !important; padding: 0 10px !important; }
.status-select-btn >>> .v-select__selection { color: white !important; font-size: 12px !important; font-weight: bold !important; }
.status-select-btn >>> .v-icon { color: white !important; }

.history-record-select {
  width: 75px;
  max-width: 75px;
}
.history-record-select >>> .v-input__slot {
  min-height: 36px !important;
  border-radius: 4px !important;
}
.history-page-field >>> input {
  text-align: center !important;
}
.history-pagination-arrow {
  border: none !important;
  border-radius: 4px !important;
  background-color: #ffffff !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18) !important;
  opacity: 1 !important;
}
.history-pagination-arrow >>> .v-icon {
  color: #a2212b !important;
}

.border-left-title {
  border-left: 4px solid #a2212b;
  line-height: 1.2;
}

.custom-toast >>> .v-snack__wrapper {
  border-radius: 8px !important;
}

.style-scroll::-webkit-scrollbar {
  width: 6px;
}
.style-scroll::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 4px;
}

/* Thanh cuộn ngang màu đỏ Bách Khoa cho bảng */
.table-container::-webkit-scrollbar {
  height: 6px;
}
.table-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}
.table-container::-webkit-scrollbar-thumb {
  background: #a2212b;
  border-radius: 4px;
}
.table-container::-webkit-scrollbar-thumb:hover {
  background: #83161f;
}

/* Ép tất cả các Menu/Dropdown không bị trôi/văng lên đỉnh màn hình khi Zoom */
.v-menu__content {
  position: absolute !important;
}
</style>