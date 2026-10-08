<template>
  <div class="teacher-page d-flex flex-column pa-2 pa-sm-4 bg-white">
    
    <!-- 1. THANH TÌM KIẾM -->
    <div class="top-filter-bar bg-white py-3 px-1">
      <div class="d-flex align-center justify-space-between flex-wrap gap-2 width-100">
        <div class="text-subtitle-1 font-weight-bold mr-2 text-no-wrap">
          Danh sách giảng viên ({{ filteredTeachers.length }})
        </div>

        <div class="d-flex align-center gap-2 flex-wrap flex-grow-1 justify-end">
          <v-text-field
            v-model="filters.search"
            placeholder="Tìm theo Tên, Mã GV"
            outlined
            dense
            hide-details
            class="bg-white filter-item search-input custom-outlined-input"
            @keyup.enter="search"
          ></v-text-field>

          <!-- ĐÃ XÓA @change="search" ĐỂ KHÔNG TỰ ĐỘNG TÌM KIẾM NỮA -->
          <v-select
            v-model="filters.gender"
            :items="genderOptions"
            label="Giới tính"
            outlined
            dense
            hide-details
            clearable
            :menu-props="{ attach: true, offsetY: true, zIndex: 999 }"
            class="bg-white filter-item select-sm custom-outlined-input"
          ></v-select>

          <v-select
            v-model="filters.teacherType"
            :items="teacherTypeOptions"
            label="Loại giảng viên"
            placeholder="Loại giảng viên"
            outlined
            dense
            hide-details
            clearable
            :menu-props="{ attach: true, offsetY: true, zIndex: 999 }"
            class="bg-white filter-item select-md custom-outlined-input"
          ></v-select>

          <v-select
            v-model="filters.status"
            :items="statusOptions"
            label="Trạng thái"
            placeholder="Trạng thái"
            outlined
            dense
            hide-details
            clearable
            :menu-props="{ attach: true, offsetY: true, zIndex: 999 }"
            class="bg-white filter-item select-md custom-outlined-input"
          ></v-select>

          <v-select
            v-model="filters.department"
            :items="departmentOptions"
            label="Khoa/ Trường"
            placeholder="Khoa/ Trường"
            outlined
            dense
            hide-details
            clearable
            :menu-props="{ attach: true, offsetY: true, zIndex: 999 }"
            class="bg-white filter-item select-lg custom-outlined-input"
          ></v-select>

          <div class="d-flex gap-2 align-center">
            <v-btn icon color="#a2212b" class="rounded-sm" @click="resetFilters">
              <v-icon color="#a2212b" size="24">mdi-refresh</v-icon>
            </v-btn>

            <!-- NÚT TÌM KIẾM CHÍNH -->
            <v-btn color="#a2212b" dark elevation="0" class="min-w-0 px-3 rounded-sm" style="height: 40px;" @click="search">
              <v-icon size="24">mdi-magnify</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. BẢNG DỮ LIỆU DÙNG BASETABLE -->
    <BaseTable
      :headers="headers"
      :items="paginatedTeachers"
      hide-default-footer
      disable-pagination
    >
      <template #[`item.stt`]="{ index }">
        <span class="font-weight-medium">{{ (page - 1) * itemsPerPage + index + 1 }}</span>
      </template>

      <!-- SLOT THÔNG TIN CHUNG -->
      <template #[`item.generalInfo`]="{ item }">
        <div class="py-2 info-block">
          <div class="font-weight-bold red--text text--darken-3 mb-1" style="font-size: 15px;">
            {{ item.fullName }}
          </div>
          <div v-if="item.phone && item.phone !== '---'" class="text-body-2 text--secondary mb-1">
            Số điện thoại: <span class="red--text text--darken-2 font-weight-bold">{{ item.phone }}</span>
          </div>
          <div v-if="item.email && item.email !== '---'" class="text-body-2 text--secondary mb-1">
            Email: <span class="red--text text--darken-2 font-weight-bold">{{ item.email }}</span>
          </div>
          <div v-if="item.gender && item.gender !== '---'" class="text-body-2 text--secondary">
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
        <v-menu offset-y bottom left :z-index="999">
          <template #activator="{ on, attrs }">
            <div
              v-bind="attrs"
              v-on="on"
              class="status-badge style-pointer d-flex align-center justify-space-between"
              :class="(item.status === 'Hoạt động' || item.status === 'ACTIVE') ? 'status-active' : 'status-inactive'"
              style="cursor: pointer; min-width: 110px;"
            >
              <span>{{ item.status }}</span>
              <v-icon size="20" color="white">mdi-menu-down</v-icon>
            </div>
          </template>
          <v-list dense class="py-1">
            <v-list-item @click="openConfirmStatusDialog(item, 'Hoạt động')">
              <v-list-item-title class="red--text text--darken-1 font-weight-bold">Hoạt động</v-list-item-title>
            </v-list-item>
            <v-list-item @click="openConfirmStatusDialog(item, 'Nghỉ hưu')">
              <v-list-item-title class="grey--text text--darken-2 font-weight-bold">Nghỉ hưu</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>

      <!-- SLOT CHỨC NĂNG -->
      <template #[`item.actions`]="{ item }">
        <div class="d-flex align-center gap-1 action-icons">
          <v-btn icon x-small color="cyan darken-1" @click="viewDetail(item)">
            <v-icon size="24" color="blue">mdi-eye</v-icon>
          </v-btn>
          <v-btn icon x-small color="teal" @click="checkHistory(item)">
            <v-icon size="24" color="green">mdi-table-account</v-icon>
          </v-btn>
        </div>
      </template>
    </BaseTable>

    <!-- 3. THANH PHÂN TRANG & EXCEL -->
    <div class="bottom-bar d-flex align-center justify-space-between flex-wrap gap-2 py-3 px-1 mt-auto bg-white">
      <v-btn color="#2e7d32" dark elevation="0" class="text-capitalize rounded px-4 font-weight-bold" @click="exportToExcel">
        <v-icon left small>mdi-export</v-icon> XUẤT FILE EXCEL
      </v-btn>

      <div class="d-flex align-center gap-2 flex-wrap justify-end">
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

        <v-btn color="#a2212b" dark small class="text-capitalize px-3 rounded-sm elevation-0" style="height: 36px;" @click="goToPage">
          Đi
        </v-btn>

        <div class="d-flex align-center">
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
            class="min-w-0 pa-0 rounded-sm elevation-0 mx-1"
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
    </div>

    <!-- CÁC DIALOGS -->
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
            <v-btn outlined class="text-capitalize border-btn font-weight-bold" color="#a2212b" @click="confirmStatusDialog = false">Đóng X</v-btn>
            <v-btn color="#a2212b" dark elevation="0" class="text-capitalize font-weight-bold" @click="confirmStatusUpdate">Xác nhận</v-btn>
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
            <v-col cols="6" class="py-2"><div class="grey--text text--darken-1 body-2">Họ tên: <span class="font-weight-bold text--primary">{{ selectedTeacher.fullName }}</span></div></v-col>
            <v-col cols="6" class="py-2"><div class="grey--text text--darken-1 body-2">Mã giảng viên: <span class="font-weight-bold red--text text--darken-3">{{ selectedTeacher.code }}</span></div></v-col>
            <v-col cols="6" class="py-2"><div class="grey--text text--darken-1 body-2">SĐT: <span class="font-weight-bold red--text text--darken-3">{{ selectedTeacher.phone }}</span></div></v-col>
            <v-col cols="6" class="py-2"><div class="grey--text text--darken-1 body-2">Ngày sinh: <span class="font-weight-bold text--primary">{{ selectedTeacher.dob }}</span></div></v-col>
            <v-col cols="6" class="py-2"><div class="grey--text text--darken-1 body-2">Mã số thuế: <span class="font-weight-bold text--primary">{{ selectedTeacher.taxCode }}</span></div></v-col>
            <v-col cols="6" class="py-2 d-flex align-center">
              <span class="grey--text text--darken-1 body-2 mr-2">Loại giảng viên:</span>
              <v-chip v-if="selectedTeacher.teacherType && selectedTeacher.teacherType !== '---'" x-small dark :color="selectedTeacher.teacherType === 'Đương chức' ? '#ffb100' : '#4caf50'" class="font-weight-bold">
                {{ selectedTeacher.teacherType }}
              </v-chip>
            </v-col>
            <v-col cols="12" class="py-2 d-flex align-center">
              <span class="grey--text text--darken-1 body-2 mr-2">Trạng thái:</span>
              <v-chip x-small dark color="#a2212b" class="font-weight-bold">{{ selectedTeacher.status }}</v-chip>
            </v-col>
          </v-row>
          <div class="d-flex justify-center mt-6">
            <v-btn outlined class="text-capitalize px-6 border-btn font-weight-bold" color="#a2212b" @click="detailDialog = false">Đóng X</v-btn>
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
            <div class="text-subtitle-1">Thời gian mới nhất: <span class="font-weight-bold">{{ selectedTeacher.lastUpdated }}</span></div>
          </v-card>
          <v-row dense class="text-body-2">
            <v-col cols="12" class="pb-2"><span class="red--text text--darken-2">Người cập nhật:</span> <span class="red--text text--darken-2 font-weight-medium">Admin</span></v-col>
            <v-col cols="6" class="py-1"><span class="red--text text--darken-2">Họ tên:</span> <span class="red--text text--darken-3 font-weight-bold">{{ selectedTeacher.fullName }}</span></v-col>
            <v-col cols="6" class="py-1"><span class="grey--text text--darken-2">Email:</span> <span class="red--text text--darken-3 font-weight-medium">{{ selectedTeacher.email }}</span></v-col>
            <v-col cols="6" class="py-1"><span class="grey--text text--darken-2">Giới tính:</span> <span class="red--text text--darken-3 font-weight-bold">{{ selectedTeacher.gender }}</span></v-col>
            <v-col cols="6" class="py-1"><span class="grey--text text--darken-2">Mã đối tượng:</span></v-col>
            <v-col cols="6" class="py-1"><span class="grey--text text--darken-2">Mã giảng viên:</span> <span class="red--text text--darken-3 font-weight-bold">{{ selectedTeacher.code }}</span></v-col>
            <v-col cols="6" class="py-1"><span class="grey--text text--darken-2">SĐT:</span> <span class="red--text text--darken-3 font-weight-bold">{{ selectedTeacher.phone }}</span></v-col>
            <v-col cols="6" class="py-1"><span class="grey--text text--darken-2">Ngày sinh:</span> <span class="font-weight-medium">{{ selectedTeacher.dob }}</span></v-col>
            <v-col cols="6" class="py-1"><span class="grey--text text--darken-2">Số tài khoản NH:</span></v-col>
            <v-col cols="6" class="py-1"><span class="grey--text text--darken-2">Mã số thuế:</span> <span class="font-weight-medium">{{ selectedTeacher.taxCode }}</span></v-col>
            <v-col cols="6" class="py-1"><span class="grey--text text--darken-2">Đơn vị:</span> <span class="font-weight-medium">{{ selectedTeacher.department }}</span></v-col>
            <v-col cols="6" class="py-1 d-flex align-center">
              <span class="grey--text text--darken-2 mr-2">Trạng thái:</span>
              <v-chip x-small dark color="#a2212b" class="font-weight-bold">{{ selectedTeacher.status }}</v-chip>
            </v-col>
            <v-col cols="6" class="py-1 d-flex align-center">
              <span class="grey--text text--darken-2 mr-2">Loại giảng viên:</span>
              <v-chip v-if="selectedTeacher.teacherType && selectedTeacher.teacherType !== '---'" x-small dark :color="selectedTeacher.teacherType === 'Đương chức' ? '#ffb100' : '#4caf50'" class="font-weight-bold">
                {{ selectedTeacher.teacherType }}
              </v-chip>
            </v-col>
          </v-row>
          <div class="d-flex justify-end mt-6">
            <v-btn outlined class="text-capitalize px-6 border-btn font-weight-bold" color="#a2212b" @click="historyDialog = false">Đóng X</v-btn>
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
import { MOCK_DATA_GIANG_VIEN } from "~/consts/mockGiangVien.js";

const parseTeacherData = (apiData) => {
  return apiData.map(item => {
    let genderVN = 'Khác';
    if (item.gender === 'MALE') genderVN = 'Nam';
    else if (item.gender === 'FEMALE') genderVN = 'Nữ';

    const statusVN = item.status === 'ACTIVE' ? 'Hoạt động' : 'Nghỉ hưu';
    const typeVN = item.lecturerStatus === 'FULL_TIME' ? 'Đương chức' : 'Mời giảng';
    const dobStr = item.birthday ? item.birthday.split(' ')[0] : '---';

    return {
      id: item.id,
      fullName: item.fullName || '---',
      phone: item.phone || '---',
      email: item.email || '---',
      gender: genderVN,
      code: item.code || '---',
      unit: item.officerCode || '---', 
      department: item.workUnit && item.workUnit.name ? item.workUnit.name.trim() : '---',
      taxCode: item.taxCode || '---',
      teacherType: typeVN,
      status: statusVN,
      dob: dobStr,
      hasUpdate: false,
      lastUpdated: ''
    };
  });
};

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
      
      // Biến lưu trữ giá trị đang chọn trên UI
      filters: { search: '', gender: null, teacherType: null, status: null, department: null },
      
      // Biến thực sự dùng để lọc dữ liệu (Chỉ cập nhật khi bấm Kính lúp/Enter)
      appliedFilters: { search: '', gender: null, teacherType: null, status: null, department: null },

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
      
      teachers: parseTeacherData(MOCK_DATA_GIANG_VIEN),
    }
  },
  computed: {
    genderOptions() {
      return [...new Set(this.teachers.map(t => t.gender).filter(v => v && v !== '---'))].sort();
    },
    teacherTypeOptions() {
      return [...new Set(this.teachers.map(t => t.teacherType).filter(v => v && v !== '---'))].sort();
    },
    statusOptions() {
      return [...new Set(this.teachers.map(t => t.status).filter(v => v && v !== '---'))].sort();
    },
    departmentOptions() {
      return [...new Set(this.teachers.map(t => t.department).filter(v => v && v !== '---'))].sort();
    },

    // Bảng chỉ lọc dựa trên `appliedFilters` thay vì `filters`
    filteredTeachers() {
      return this.teachers.filter(t => {
        const searchKeyword = this.appliedFilters.search ? this.appliedFilters.search.toLowerCase() : '';
        const matchSearch = !searchKeyword || 
                            t.fullName.toLowerCase().includes(searchKeyword) || 
                            t.code.toLowerCase().includes(searchKeyword);
                            
        const matchGender = !this.appliedFilters.gender || t.gender === this.appliedFilters.gender;
        const matchType = !this.appliedFilters.teacherType || t.teacherType === this.appliedFilters.teacherType;
        const matchStatus = !this.appliedFilters.status || t.status === this.appliedFilters.status;
        const matchDepartment = !this.appliedFilters.department || t.department === this.appliedFilters.department;

        return matchSearch && matchGender && matchType && matchStatus && matchDepartment;
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
    getCurrentDateTime() {
      const now = new Date()
      return `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    },
    // Hàm này chạy khi bấm Kính lúp hoặc bấm Enter/Đi
    search() { 
      this.appliedFilters = { ...this.filters }; // Lưu cấu hình lọc hiện tại
      this.page = 1; 
      this.pageInput = 1;
    },
    resetFilters() {
      this.filters = { search: '', gender: null, teacherType: null, status: null, department: null };
      this.appliedFilters = { ...this.filters }; // Reset bảng về mặc định
      this.page = 1; 
      this.pageInput = 1;
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
        'Số điện thoại': item.phone,
        'Email': item.email,
        'Giới tính': item.gender,
        'Ngày sinh': item.dob,
        'Đơn vị': item.unit,
        'Khoa/ Trường': item.department,
        'Mã số thuế': item.taxCode,
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
.status-badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; text-align: center; white-space: nowrap; }
.status-active { background-color: #a2212b!important; color: #ffff !important; }
.status-inactive { background-color: #9e9e9e !important; color: #ffff !important; }
.type-fulltime { background-color: #ffae1f !important; color: #ffff !important; }
.type-visiting { background-color: #4caf50 !important; color: #ffff !important; }

.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.border-btn { border: 1px solid #a2212b !important; }

/* 1. THANH TÌM KIẾM TRÊN CÙNG */
.top-filter-bar { flex-shrink: 0; position: relative; z-index: 10; }
.filter-item { flex: 1 1 100%; }
@media (min-width: 600px) {
  .filter-item { flex: 1 1 auto; }
  .search-input { min-width: 150px; max-width: 220px; }
  .select-sm { min-width: 100px; max-width: 130px; }
  .select-md { min-width: 120px; max-width: 150px; }
  .select-lg { min-width: 140px; max-width: 180px; }
}
.custom-outlined-input >>> .v-input__control { min-height: 40px !important; }
.custom-outlined-input >>> fieldset { border-color: #ccc !important; border-radius: 4px !important; }
.custom-outlined-input.v-input--is-focused >>> fieldset { border-color: #a2212b !important; border-width: 1px !important; }
.custom-outlined-input >>> .v-label { top: 10px !important; font-size: 13px !important; color: #757575 !important; }
.custom-outlined-input.v-input--is-label-active >>> .v-label { top: -10px !important; transform: translateY(0) scale(0.85) !important; background-color: white !important; padding: 0 4px !important; }
.custom-outlined-input >>> .v-input__append-inner { margin-top: 8px !important; }

/* 3. THANH PHÂN TRANG DƯỚI */
.bottom-bar { flex-shrink: 0; }
.pagination-input >>> .v-input__control { min-height: 36px !important; }
.pagination-input >>> .v-input__slot { min-height: 36px !important; padding: 0 8px !important; }
.pagination-input >>> fieldset { border-color: #cccccc !important; border-radius: 4px !important; }
.pagination-input >>> .v-label { top: 8px !important; font-size: 12px !important; color: #757575 !important; transform-origin: top left !important; }
.pagination-input.v-input--is-label-active >>> .v-label { top: -10px !important; transform: translateY(0) scale(0.85) !important; background-color: #ffffff !important; padding: 0 4px !important; z-index: 2 !important; }
.pagination-input.text-center >>> input { text-align: center !important; padding: 0 !important; }
.pagination-input >>> .v-select__selection--comma { margin-top: 4px !important; font-size: 13px !important; }
.pagination-input >>> .v-input__append-inner { margin-top: 6px !important; }

/* ĐIỀU CHỈNH LAYOUT TỔNG & NỘI DUNG SLOT (Mobile vs Desktop) */
@media (max-width: 599px) {
  .teacher-page { height: auto; min-height: 100vh; overflow: visible; }
  .info-block { text-align: right !important; }
  .action-icons { justify-content: flex-end; }
}
@media (min-width: 600px) {
  .teacher-page { height: calc(100vh - 64px); overflow: hidden; display: flex; flex-direction: column; }
  .info-block { text-align: left !important; }
  .action-icons { justify-content: center; }
}
.custom-toast >>> .v-snack__wrapper { border-radius: 8px !important; }
.v-menu__content { position: absolute !important; }
</style>