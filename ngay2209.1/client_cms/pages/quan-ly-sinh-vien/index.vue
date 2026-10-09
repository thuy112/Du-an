<template>
  <div class="student-page d-flex flex-column pa-2 pa-sm-4 bg-white">
    
    <!-- THANH TÌM KIẾM CỐ ĐỊNH PHÍA TRÊN -->
    <div class="top-filter-bar bg-white py-3 px-1">
      <div class="d-flex align-center justify-space-between flex-wrap gap-2 width-100">
        <div class="text-subtitle-1 font-weight-bold mr-2 text-no-wrap">
          Danh sách sinh viên ({{ filteredStudents.length }})
        </div>

        <div class="d-flex align-center gap-2 flex-wrap flex-grow-1 justify-end">
          <v-text-field
            v-model="filters.search"
            placeholder="Tìm theo tên, MSSV"
            outlined
            dense
            hide-details
            class="bg-white filter-item search-input custom-outlined-input"
            @keyup.enter="search"
          ></v-text-field>

          <v-select
            v-model="filters.class"
            :items="classOptions"
            placeholder="Lớp sinh viên"
            outlined
            dense
            hide-details
            clearable
            :menu-props="{ attach: true, offsetY: true, zIndex: 999 }"
            class="bg-white filter-item select-md custom-outlined-input"
          ></v-select>

          <v-select
            v-model="filters.status"
            :items="[
              { text: 'Đang học tập', value: 'Đang học' },
              { text: 'Bảo lưu', value: 'Bảo lưu' },
              { text: 'Đã tốt nghiệp', value: 'Đã tốt nghiệp' }
            ]"
            item-text="text"
            item-value="value"
            placeholder="Trạng thái"
            outlined
            dense
            hide-details
            clearable
            :menu-props="{ attach: true, offsetY: true, zIndex: 999 }"
            class="bg-white filter-item select-md custom-outlined-input"
          ></v-select>

          <div class="d-flex gap-2 align-center">
            <v-btn icon color="#a2212b" class="rounded-sm action-btn" @click="resetFilters">
              <v-icon color="#a2212b" size="24">mdi-refresh</v-icon>
            </v-btn>

            <v-btn outlined color="#a2212b" class="min-w-0 px-3 rounded-sm action-btn" @click="openFilterDialog">
              <v-icon size="24">mdi-filter-variant-plus</v-icon>
            </v-btn>

            <v-btn color="#a2212b" dark elevation="0" class="min-w-0 px-3 rounded-sm action-btn" @click="search">
              <v-icon size="24">mdi-magnify</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- DIALOG LỌC NÂNG CAO -->
    <v-dialog v-model="filterDialog" max-width="500px">
      <v-card class="rounded-lg">
        <v-card-title class="pa-4 text-subtitle-1 font-weight-bold white--text d-flex justify-space-between align-center" style="background-color: #a2212b;">
          <span>Lọc nâng cao</span>
          <v-btn icon dark x-small @click="filterDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text class="pa-5">
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-select v-model="tempDialogFilters.trainingType" :items="trainingTypeOptions" label="Hình thức đào tạo" dense outlined hide-details clearable></v-select>
            </v-col>
            <v-col cols="12" sm="6">
              <v-select v-model="tempDialogFilters.location" :items="locationOptions" label="Địa điểm đào tạo" dense outlined hide-details clearable></v-select>
            </v-col>
            <v-col cols="12" sm="6">
              <v-select v-model="tempDialogFilters.major" :items="majorOptions" label="Ngành" dense outlined hide-details clearable></v-select>
            </v-col>
            <v-col cols="12" sm="6">
              <v-select v-model="tempDialogFilters.course" :items="courseOptions" label="Khóa" dense outlined hide-details clearable></v-select>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-4 border-top">
          <v-spacer></v-spacer>
          <v-btn outlined color="grey" @click="filterDialog = false">Hủy</v-btn>
          <v-btn color="#a2212b" dark elevation="0" @click="applyAdvancedFilters">Áp dụng</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- BẢNG DỮ LIỆU DÙNG BASETABLE (TỰ CHUYỂN MOBILE KHI < 600PX) -->
    <BaseTable
      :headers="headers"
      :items="paginatedStudents"
      hide-default-footer
      disable-pagination
    >
      <template #[`item.stt`]="{ index }">
        <span class="font-weight-medium">{{ (page - 1) * itemsPerPage + index + 1 }}</span>
      </template>

      <!-- THÔNG TIN CHUNG (Responsive Mobile) -->
      <template #[`item.generalInfo`]="{ item }">
        <div class="py-2 info-block">
          <div class="font-weight-bold red--text text--darken-3 mb-1" style="font-size: 15px;">
            {{ item.fullName }}
          </div>
          <div class="text-body-2 text--secondary mb-1">
            MSSV: <span class="red--text text--darken-2 font-weight-bold">{{ item.code }}</span>
          </div>
          <div class="text-body-2 text--secondary mb-1">
            Email: <span class="red--text text--darken-2 font-weight-bold">{{ item.email }}</span>
          </div>
          <div class="text-body-2 text--secondary">
            CCCD: <span class="red--text text--darken-2 font-weight-bold">{{ item.citizen }}</span>
          </div>
        </div>
      </template>

      <!-- TRẠNG THÁI -->
      <template #[`item.status`]="{ item }">
        <v-menu offset-y bottom left :z-index="999">
          <template #activator="{ on, attrs }">
            <div
              v-bind="attrs"
              v-on="on"
              class="status-badge px-3 py-1 font-weight-bold d-flex justify-space-between align-center"
              :class="getStatusClass(item.status)"
              style="cursor: pointer; min-width: 130px; height: 32px;"
            >
              <span class="text-caption font-weight-bold">{{ item.status }}</span>
              <v-icon size="18" color="white" class="ml-1">mdi-menu-down</v-icon>
            </div>
          </template>
          <v-list dense class="py-1">
            <v-list-item @click="openConfirmStatusDialog(item, 'Đang học')">
              <v-list-item-title class="red--text text--darken-1 font-weight-bold">Đang học</v-list-item-title>
            </v-list-item>
            <v-list-item @click="openConfirmStatusDialog(item, 'Bảo lưu')">
              <v-list-item-title class="orange--text text--darken-2 font-weight-bold">Bảo lưu</v-list-item-title>
            </v-list-item>
            <v-list-item @click="openConfirmStatusDialog(item, 'Đã tốt nghiệp')">
              <v-list-item-title class="grey--text text--darken-2 font-weight-bold">Đã tốt nghiệp</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>

      <!-- CHỨC NĂNG -->
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

    <!-- THANH PHÂN TRANG & EXCEL (CỐ ĐỊNH PHÍA DƯỚI) -->
    <!-- THANH PHÂN TRANG & EXCEL (CỐ ĐỊNH PHÍA DƯỚI) -->
    <div class="bottom-bar d-flex align-center justify-space-between flex-nowrap py-2 px-3 mt-auto bg-white border-top">
      <v-btn color="#2e7d32" dark elevation="0" class="text-capitalize rounded px-4 font-weight-bold" @click="exportToExcel">
        <v-icon left small>mdi-export</v-icon> XUẤT FILE EXCEL
      </v-btn>

      <div class="d-flex align-center gap-2 flex-nowrap">
        <v-select
          v-model="itemsPerPage"
          :items="[10, 20, 50, 100]"
          label="Bản ghi"
          dense outlined hide-details
          :menu-props="{ attach: true, top: true, offsetY: true, zIndex: 999 }"
          class="pagination-input"
          style="width: 85px"
          @change="onItemsPerPageChange"
        ></v-select>

        <v-text-field
          v-model.number="pageInput"
          label="Trang"
          dense outlined hide-details
          class="pagination-input text-center"
          style="width: 65px"
          @keyup.enter="goToPage"
        ></v-text-field>

        <v-btn color="#a2212b" dark small class="text-capitalize px-3 rounded-sm elevation-0" style="height: 36px;" @click="goToPage">Đi</v-btn>

        <div class="d-flex align-center gap-1">
          <v-btn icon small :disabled="page <= 1" @click="changePage(page - 1)"><v-icon>mdi-chevron-left</v-icon></v-btn>
          <template v-for="p in visiblePages">
            <v-btn
              v-if="p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)"
              :key="p" small
              :color="page === p ? '#a2212b' : ''" :dark="page === p" :outlined="page !== p"
              class="min-w-0 pa-0 rounded-sm elevation-0 mx-1" style="width: 28px; height: 28px"
              @click="changePage(p)"
            >
              {{ p }}
            </v-btn>
            <span v-else-if="p === page - 2 || p === page + 2" :key="'dots-' + p">...</span>
          </template>
          <v-btn icon small :disabled="page >= totalPages" @click="changePage(page + 1)"><v-icon>mdi-chevron-right</v-icon></v-btn>
        </div>
      </div>
    </div>

    <!-- DIALOG CHI TIẾT SINH VIÊN -->
    <v-dialog v-model="detailDialog" max-width="850px" scrollable>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="pa-3 text-subtitle-1 font-weight-bold white--text d-flex justify-space-between align-center" style="background-color: #a2212b;">
          <span>Thông tin sinh viên chi tiết</span>
          <v-btn icon small color="white" @click="detailDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        
        <v-card-text class="pt-4 black--text" style="max-height: 80vh;">
          <div class="d-flex align-center mb-3">
            <div class="section-title-indicator mr-2"></div>
            <h3 class="text-subtitle-1 font-weight-bold" style="color: #000;">Thông tin cá nhân</h3>
          </div>

          <v-row dense class="text-body-2 mb-4">
            <v-col cols="12" md="6" class="py-1"><span class="grey--text text--darken-1">Họ tên:</span> <span class="font-weight-medium red--text text--darken-3 ml-1">{{ selectedStudent.fullName }}</span></v-col>
            <v-col cols="12" md="6" class="py-1"><span class="grey--text text--darken-1">Mã số sinh viên:</span> <span class="font-weight-bold red--text text--darken-3 ml-1">{{ selectedStudent.code }}</span></v-col>
            <v-col cols="12" md="6" class="py-1"><span class="grey--text text--darken-1">CCCD:</span> <span class="font-weight-medium red--text text--darken-3 ml-1">{{ selectedStudent.citizen }}</span></v-col>
            <v-col cols="12" md="6" class="py-1"><span class="grey--text text--darken-1">Email trường:</span> <span class="red--text text--darken-3 font-weight-medium ml-1">{{ selectedStudent.email }}</span></v-col>
          </v-row>

          <v-divider class="my-3"></v-divider>

          <div class="d-flex align-center mb-3">
            <div class="section-title-indicator mr-2"></div>
            <h3 class="text-subtitle-1 font-weight-bold" style="color: #000;">Thông tin đào tạo</h3>
          </div>

          <v-row dense class="text-body-2">
            <v-col cols="12" md="6" class="py-1"><b>Khóa:</b> {{ selectedStudent.courseName }}</v-col>
            <v-col cols="12" md="6" class="py-1"><b>Lớp:</b> {{ selectedStudent.className }}</v-col>
            <v-col cols="12" md="6" class="py-1"><b>Ngành:</b> {{ selectedStudent.majorName }}</v-col>
            <v-col cols="12" md="6" class="py-1"><b>Hình thức đào tạo:</b> {{ selectedStudent.trainingMethodName }}</v-col>
            <v-col cols="12" md="6" class="py-1"><b>Địa điểm đào tạo:</b> {{ selectedStudent.trainingUnitName }}</v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="justify-end pb-3 pr-4 border-top">
          <v-btn outlined color="grey darken-2" class="px-4 text-capitalize" @click="detailDialog = false">Đóng X</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- TOAST -->
    <v-snackbar v-model="toast.show" :color="toast.color" timeout="3000" top right>
      <span>{{ toast.message }}</span>
    </v-snackbar>
  </div>
</template>

<script>
import * as XLSX from 'xlsx'
import BaseTable from '~/components/Base/BaseTable.vue'
import { MOCK_DATA_SINH_VIEN } from '~/consts/mockSinhVien.js'

const parseStudentData = (apiData) => {
  return apiData.map(item => {
    let statusVN = 'Đang học';
    if (item.status === 'ACTIVE' || item.status === 'STUDYING') statusVN = 'Đang học';
    else if (item.status === 'INACTIVE') statusVN = 'Không hoạt động';

    return {
      id: item.id,
      code: item.code || '---',
      fullName: item.fullName || '---',
      email: item.email || '---',
      citizen: item.citizen || '---',
      status: statusVN,
      className: item.className || '---',
      courseName: item.courseName || '---',
      majorName: item.majorName || '---',
      trainingMethodName: item.trainingMethodName ? item.trainingMethodName.trim() : '---',
      trainingUnitName: item.trainingUnitName || '---'
    };
  });
};

export default {
  name: 'QuanLySinhVienPage',
  components: { BaseTable },
  middleware: 'authenticated',
  data() {
    return {
      page: 1,
      pageInput: 1,
      itemsPerPage: 50,
      
      filters: { search: '', class: null, status: null },
      tempDialogFilters: { trainingType: null, location: null, major: null, course: null },
      appliedFilters: { search: '', class: null, status: null, trainingType: null, location: null, major: null, course: null },

      filterDialog: false,
      detailDialog: false,
      confirmStatusDialog: false,
      selectedStudent: {},
      pendingStatusChange: { student: null, newStatus: '' },
      toast: { show: false, message: '', color: '#4caf50' },

      headers: [
        { text: 'STT', value: 'stt', sortable: false, width: '50px' },
        { text: 'Thông tin chung', value: 'generalInfo', sortable: false, width: '280px' },
        { text: 'Khóa', value: 'courseName', sortable: false, width: '90px' },
        { text: 'Lớp', value: 'className', sortable: false, width: '130px'},
        { text: 'Hình thức đào tạo', value: 'trainingMethodName', sortable: false, width: '150px' },
        { text: 'Địa điểm đào tạo', value: 'trainingUnitName', sortable: false, width: '180px' },
        { text: 'Trạng thái', value: 'status', sortable: false, width: '143px' },
        { text: 'Chức năng', value: 'actions', sortable: false, align: 'center', width: '80px' },
      ],
      
      students: parseStudentData(MOCK_DATA_SINH_VIEN),
    }
  },
  computed: {
    classOptions() { return [...new Set(this.students.map(s => s.className).filter(v => v !== '---'))].sort() },
    trainingTypeOptions() { return [...new Set(this.students.map(s => s.trainingMethodName).filter(v => v !== '---'))].sort() },
    locationOptions() { return [...new Set(this.students.map(s => s.trainingUnitName).filter(v => v !== '---'))].sort() },
    majorOptions() { return [...new Set(this.students.map(s => s.majorName).filter(v => v !== '---'))].sort() },
    courseOptions() { return [...new Set(this.students.map(s => s.courseName).filter(v => v !== '---'))].sort() },

    filteredStudents() {
      return this.students.filter(s => {
        const keyword = this.appliedFilters.search ? this.appliedFilters.search.toLowerCase() : '';
        const matchSearch = !keyword || s.fullName.toLowerCase().includes(keyword) || s.code.toLowerCase().includes(keyword);
          
        const matchClass = !this.appliedFilters.class || s.className === this.appliedFilters.class;
        const matchStatus = !this.appliedFilters.status || s.status === this.appliedFilters.status;
        const matchType = !this.appliedFilters.trainingType || s.trainingMethodName === this.appliedFilters.trainingType;
        const matchLocation = !this.appliedFilters.location || s.trainingUnitName === this.appliedFilters.location;
        const matchMajor = !this.appliedFilters.major || s.majorName === this.appliedFilters.major;
        const matchCourse = !this.appliedFilters.course || s.courseName === this.appliedFilters.course;

        return matchSearch && matchClass && matchStatus && matchType && matchLocation && matchMajor && matchCourse;
      })
    },
    paginatedStudents() {
      const start = (this.page - 1) * this.itemsPerPage;
      return this.filteredStudents.slice(start, start + this.itemsPerPage);
    },
    totalPages() {
      const total = Math.ceil(this.filteredStudents.length / this.itemsPerPage);
      return total > 0 ? total : 1;
    },
    visiblePages() {
      const pages = [];
      for (let i = 1; i <= this.totalPages; i++) pages.push(i);
      return pages;
    }
  },
  mounted() {
    if (this.$store) {
      this.$store.commit('SET_PAGE_TITLE', 'Quản lý sinh viên');
    }
  },
  methods: {
    getStatusClass(status) {
      switch (status) {
        case 'Đang học': return 'status-studying';
        case 'Không hoạt động': return 'status-dropout';
        default: return 'status-unknown';
      }
    },
    search() {
      this.appliedFilters = { ...this.appliedFilters, ...this.filters, ...this.tempDialogFilters };
      this.page = 1;
      this.pageInput = 1;
    },
    openFilterDialog() {
      this.tempDialogFilters = {
        trainingType: this.appliedFilters.trainingType,
        location: this.appliedFilters.location,
        major: this.appliedFilters.major,
        course: this.appliedFilters.course
      };
      this.filterDialog = true;
    },
    applyAdvancedFilters() {
      this.search();
      this.filterDialog = false;
    },
    resetFilters() {
      this.filters = { search: '', class: null, status: null };
      this.tempDialogFilters = { trainingType: null, location: null, major: null, course: null };
      this.appliedFilters = { search: '', class: null, status: null, trainingType: null, location: null, major: null, course: null };
      this.page = 1;
      this.pageInput = 1;
    },
    changePage(p) { if (p >= 1 && p <= this.totalPages) { this.page = p; this.pageInput = p; } },
    goToPage() {
      let target = parseInt(this.pageInput);
      if (isNaN(target) || target < 1) target = 1;
      if (target > this.totalPages) target = this.totalPages;
      this.page = target;
      this.pageInput = target;
    },
    onItemsPerPageChange() { this.page = 1; this.pageInput = 1; },
    viewDetail(item) {
      this.selectedStudent = { ...item };
      this.detailDialog = true;
    },
    checkHistory(item) {
      this.showToast('Tính năng lịch sử đang phát triển', '#fbc02d');
    },
    openConfirmStatusDialog(item, newStatusVN) {
      if (item.status === newStatusVN) return;
      this.pendingStatusChange = { student: item, newStatus: newStatusVN };
      this.confirmStatusDialog = true;
    },
    confirmStatusUpdate() {
      if (this.pendingStatusChange.student) {
        this.pendingStatusChange.student.status = this.pendingStatusChange.newStatus;
        this.confirmStatusDialog = false;
        this.showToast('Cập nhật trạng thái thành công', '#4caf50');
      }
    },
    exportToExcel() {
      const dataToExport = this.filteredStudents.map((item, index) => ({
        'STT': index + 1,
        'Mã': item.code,
        'Tên': item.fullName,
        'Khóa': item.courseName,
        'Lớp': item.className,
        'Ngành': item.majorName,
        'Hình thức đào tạo': item.trainingMethodName,
        'Đơn vị': item.trainingUnitName,
        'Trạng thái': item.status
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách');
      XLSX.writeFile(workbook, 'danh_sach.xlsx');
    },
    showToast(message, color) {
      this.toast.message = message;
      this.toast.color = color;
      this.toast.show = true;
    }
  }
}
</script>

<style scoped>
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }

.top-filter-bar { flex-shrink: 0; }
.filter-item { flex-grow: 1; flex-shrink: 1; }
.search-input { min-width: 150px; max-width: 200px; }
.select-md { min-width: 140px; max-width: 180px; }
.action-btn { height: 40px !important; min-height: 40px !important; }

.custom-outlined-input >>> .v-input__control { min-height: 38px !important; }
.custom-outlined-input >>> fieldset { border-color: #ccc !important; border-radius: 4px !important; }

.section-title-indicator { width: 4px; height: 18px; background-color: #a2212b; border-radius: 2px; }

.status-badge { border-radius: 16px !important; display: inline-flex; align-items: center; }
.status-studying { background-color: #a2212b !important; color: #ffffff !important; }
.status-dropout { background-color: #616161 !important; color: #ffffff !important; }
.status-unknown { background-color: #9e9e9e !important; color: #ffffff !important; }

.border-top { border-top: 1px solid #e0e0e0; }
.bottom-bar { 
  flex-shrink: 0; 
  background-color: #ffffff;
  overflow-x: auto;
}
.pagination-input >>> .v-input__control { min-height: 36px !important; }

@media (max-width: 599px) {
  .student-page { height: auto; min-height: 100vh; overflow: visible; }
}
@media (min-width: 600px) {
  .student-page { height: calc(100vh - 64px); overflow: hidden; display: flex; flex-direction: column; }
}
</style>