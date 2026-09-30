<template>
  <div class="quan-ly-sinh-vien-container pa-4">
    <!-- Header / Bộ lọc chính -->
    <v-row class="mb-2 align-center justify-space-between" no-gutters>
      <div class="d-flex align-center gap-2 flex-wrap" style="width: 100%;">
        <span class="text-h6 font-weight-bold">Danh sách sinh viên ({{ filteredStudents.length }})</span>
        <v-spacer></v-spacer>

        <!-- Ô Tìm kiếm -->
        <v-text-field
          v-model="filters.search"
          placeholder="Tìm kiếm"
          outlined
          dense
          hide-details
          class="bg-white rounded filter-item search-input custom-outlined-input"
          @keyup.enter="search"
        ></v-text-field>

        <!-- Lớp sinh viên -->
        <v-select
          v-model="filters.class"
          :items="['DH-BK-KTO1-K67', 'DH-BK-QTKD2.2-K66', 'DH-BK-CNTT1.1-K66']"
          placeholder="Lớp sinh viên"
          outlined
          dense
          hide-details
          clearable
          class="bg-white rounded filter-item select-md custom-outlined-input"
        ></v-select>

        <!-- Trạng thái -->
        <v-select
          v-model="filters.status"
          :items="[
            { text: 'Đang học tập', value: 'STUDYING' },
            { text: 'Bảo lưu', value: 'LEAVE_OF_ABSENCE' },
            { text: 'Đã nghỉ học', value: 'DROP_OUT_OF_SCHOOL' }
          ]"
          item-text="text"
          item-value="value"
          placeholder="Trạng thái"
          outlined
          dense
          hide-details
          clearable
          class="bg-white rounded filter-item select-md custom-outlined-input"
        ></v-select>

        <!-- Nút Filter -->
        <v-btn icon color="#a2212b" @click="openFilterDialog">
          <v-icon size="24">mdi-filter-variant-plus</v-icon>
        </v-btn>

        <!-- Nút Reset -->
        <v-btn icon color="#a2212b" @click="resetFilters">
          <v-icon size="24">mdi-refresh</v-icon>
        </v-btn>

        <!-- Nút Tìm kiếm -->
        <v-btn color="#a2212b" class="action-btn white--text elevation-0 font-weight-bold" @click="search">
          <v-icon size="24">mdi-magnify</v-icon>
        </v-btn>
      </div>
    </v-row>

    <!-- Bảng Dữ Liệu Sinh Viên (ĐÃ BỎ KHUNG, ĐƯỜNG VIỀN & ĐỘ NỔI ELEVATION) -->
    <v-card flat class="transparent overflow-hidden">
      <div class="table-responsive-wrapper">
        <v-data-table
          :headers="headers"
          :items="paginatedStudents"
          hide-default-footer
          class="custom-table"
        >
          <!-- STT -->
          <template #[`item.stt`]="{ index }">
            {{ (page - 1) * itemsPerPage + index + 1 }}
          </template>

          <!-- Thông tin chung -->
          <template #[`item.generalInfo`]="{ item }">
            <div class="py-2">
              <div class="font-weight-bold red--text text--darken-3 text-subtitle-2 mb-1">{{ item.fullName }}</div>
              <div class="text-caption text-grey-darken-1">Mã số sinh viên: <span class="font-weight-medium red--text text--darken-3">{{ item.studentCode }}</span></div>
              <div class="text-caption text-grey-darken-1">Email: <span class="red--text text--darken-3">{{ item.email || '---' }}</span></div>
              <div class="text-caption text-grey-darken-1">Giới tính: {{ item.gender }}</div>
            </div>
          </template>

          <!-- Trạng thái -->
          <template #[`item.status`]="{ item }">
            <v-menu offset-y class="d-inline-block">
              <template #activator="{ on, attrs }">
                <div
                  v-bind="attrs"
                  v-on="on"
                  class="status-badge style-pointer d-flex align-center justify-space-between px-3 py-1"
                  :class="getStatusClass(item.status)"
                  style="cursor: pointer; width: 130px; height: 32px;"
                >
                  <span class="text-caption font-weight-bold text-no-wrap">
                    {{ getStatusText(item.status) }}
                  </span>
                  <v-icon size="18" class="ml-1" :color="item.status === 'LEAVE_OF_ABSENCE' ? 'black' : 'white'">
                    mdi-menu-down
                  </v-icon>
                </div>
              </template>

              <v-list dense class="py-1">
                <v-list-item @click="openConfirmStatusDialog(item, 'STUDYING')">
                  <v-list-item-title class="text-body-2">Đang học tập</v-list-item-title>
                </v-list-item>
                <v-list-item @click="openConfirmStatusDialog(item, 'LEAVE_OF_ABSENCE')">
                  <v-list-item-title class="text-body-2">Bảo lưu</v-list-item-title>
                </v-list-item>
                <v-list-item @click="openConfirmStatusDialog(item, 'DROP_OUT_OF_SCHOOL')">
                  <v-list-item-title class="text-body-2">Đã nghỉ học</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>

          <!-- Chức năng -->
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

      <!-- Footer & Phân trang -->
      <div class="d-flex align-center justify-space-between pt-3 pb-1 flex-wrap gap-2">
        <v-btn color="#4caf50" class="white--text elevation-0 text-capitalize" @click="exportToExcel">
          <v-icon left size="18">mdi-file-excel-outline</v-icon>
          XUẤT FILE EXCEL
        </v-btn>

        <div class="d-flex align-center gap-2">
          <span class="text-caption grey--text text--darken-1">Bản ghi</span>
          <v-select
            v-model="itemsPerPage"
            :items="[10, 20, 50, 100]"
            dense
            outlined
            hide-details
            style="width: 70px;"
            class="custom-outlined-input"
            @change="onItemsPerPageChange"
          ></v-select>

          <span class="text-caption grey--text text--darken-1 ml-2">Trang</span>
          <v-text-field
            v-model="pageInput"
            dense
            outlined
            hide-details
            style="width: 50px;"
            class="text-center custom-outlined-input"
            @keyup.enter="goToPage"
          ></v-text-field>

          <v-btn color="#a2212b" class="white--text elevation-0 px-3" min-width="36" height="36" @click="goToPage">
            Đi
          </v-btn>

          <v-btn icon small :disabled="page <= 1" @click="changePage(page - 1)">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>

          <v-btn
            v-for="p in visiblePages"
            :key="p"
            small
            min-width="32"
            height="32"
            :color="p === page ? '#a2212b' : 'transparent'"
            :class="p === page ? 'white--text font-weight-bold' : 'grey--text text--darken-2'"
            class="elevation-0 px-0"
            @click="changePage(p)"
          >
            {{ p }}
          </v-btn>

          <v-btn icon small :disabled="page >= totalPages" @click="changePage(page + 1)">
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </div>
      </div>
    </v-card>

    <!-- Dialog Xác Nhận Thay Đổi Trạng Thái -->
    <v-dialog v-model="confirmStatusDialog" max-width="500px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="pa-3 text-subtitle-1 font-weight-bold white--text d-flex justify-space-between align-center" style="background-color: #a2212b;">
          Xác nhận đổi trạng thái
        </v-card-title>
        <v-card-text class="pt-4 text-body-1 black--text">
          Bạn có chắc chắn muốn đổi trạng thái
          từ <span class="font-weight-bold red--text">{{ getStatusText(pendingStatusChange.oldStatus) }}</span> 
          sang <span class="font-weight-bold red--text text--darken-2">{{ getStatusText(pendingStatusChange.newStatus) }}</span> không?
        </v-card-text>
        <v-card-actions class="justify-end pb-4 pr-4">
          <v-btn text color="grey darken-1" @click="confirmStatusDialog = false">Hủy</v-btn>
          <v-btn color="#a2212b" class="white--text elevation-0 px-4" @click="confirmStatusUpdate">Đồng ý</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Toast Notification (ĐÃ CHUYỂN LÊN GÓC TRÊN CÙNG BÊN PHẢI VÀ THÊM NÚT X TẮT) -->
    <v-snackbar
      v-model="toast.show"
      :color="toast.color"
      timeout="3000"
      top
      right
      class="custom-toast"
    >
      <div class="d-flex align-center justify-space-between w-100">
        <span>{{ toast.message }}</span>
        <v-btn icon small color="white" class="ml-2" @click="toast.show = false">
          <v-icon size="18">mdi-close</v-icon>
        </v-btn>
      </div>
    </v-snackbar>
  </div>
</template>

<script>
import * as XLSX from 'xlsx'

export default {
  name: 'QuanLySinhVienPage',
  middleware: 'authenticated',
  data() {
    return {
      page: 1,
      pageInput: 1,
      itemsPerPage: 50,
      
      filters: { 
        search: '', 
        class: null, 
        status: null,
      },

      tempDialogFilters: {
        trainingType: null,
        location: null,
        major: null,
        course: null,
        gender: null
      },

      appliedFilters: {
        search: '', 
        class: null, 
        status: null,
        trainingType: null,
        location: null,
        major: null,
        course: null,
        gender: null
      },

      filterDialog: false,
      detailDialog: false,
      historyDialog: false,
      confirmStatusDialog: false,

      selectedStudent: {},
      pendingStatusChange: {
        student: null,
        oldStatus: '',
        newStatus: ''
      },

      toast: {
        show: false,
        message: '',
        color: '#4caf50'
      },

      historyFilters: { subject: null, process: null },
      historyPage: 1,
      historyItemsPerPage: 50,
      historyHeaders: [
        { text: 'STT', value: 'stt', sortable: false },
        { text: 'Tên học phần', value: 'subjectName', sortable: false },
        { text: 'Mã học phần', value: 'subjectCode', sortable: false },
        { text: 'Quy trình học tập', value: 'process', sortable: false },
        { text: 'Thời gian hoàn thành', value: 'completedAt', sortable: false },
      ],
      historyLogs: [],

      headers: [
        { text: 'STT', value: 'stt', sortable: false, width: '50px' },
        { text: 'Thông tin chung', value: 'generalInfo', sortable: false, width: '280px' },
        { text: 'Khóa', value: 'course', sortable: false, width: '80px' },
        { text: 'Lớp', value: 'className', sortable: false, width: '130px'},
        { text: 'Hình thức đào tạo', value: 'trainingType', sortable: false, width: '120px' },
        { text: 'Bằng cấp', value: 'degree', sortable: false, width: '90px' },
        { text: 'Địa điểm đào tạo', value: 'location', sortable: false, width: '160px' },
        { text: 'Thời gian bắt đầu', value: 'startDate', sortable: false, width: '100px'},
        { text: 'Thời gian kết thúc', value: 'endDate', sortable: false, width: '100px' },
        { text: 'Trạng thái', value: 'status', sortable: false, width: '143px' },
        { text: 'Chức năng', value: 'actions', sortable: false, align: 'center', width: '80px' },
      ],
      students: [
        { id: 1, fullName: 'Phan Thị Phương', studentCode: '20210452P', email: 'Phuong.PT210452P@sis.hust.edu.vn', gender: 'Khác', course: 'Khóa 67', className: 'DH-BK-KTO1-K67', trainingType: 'Vừa làm vừa học', degree: 'Cử nhân', location: 'Đại học Bách khoa Hà Nội', startDate: '', endDate: '', status: 'STUDYING', major: 'Kế toán' },
        { id: 2, fullName: 'Vũ Phương Linh', studentCode: '20210344P', email: 'Linh.VP210344P@sis.hust.edu.vn', gender: 'Khác', course: 'Khóa 66', className: 'DH-BK-QTKD2.2-K66', trainingType: 'Vừa làm vừa học', degree: 'Cử nhân', location: 'Đại học Bách khoa Hà Nội', startDate: '', endDate: '', status: 'STUDYING', major: 'Quản trị kinh doanh' },
        { id: 3, fullName: 'Trịnh Thanh Tâm', studentCode: '20210377P', email: 'Tam.TT210377P@sis.hust.edu.vn', gender: 'Khác', course: 'Khóa 66', className: 'DH-BK-QTKD2.2-K66', trainingType: 'Vừa làm vừa học', degree: 'Cử nhân', location: 'Đại học Bách khoa Hà Nội', startDate: '', endDate: '', status: 'STUDYING', major: 'Quản trị kinh doanh' },
        { id: 4, fullName: 'Nguyễn Khánh An', studentCode: '20210105P', email: 'An.NK210105P@sis.hust.edu.vn', gender: 'Khác', course: 'Khóa 66', className: 'DH-BK-CNTT1.1-K66', trainingType: 'Vừa làm vừa học', degree: 'Cử nhân', location: 'Đại học Bách khoa Hà Nội', startDate: '', endDate: '', status: 'STUDYING', major: 'Công nghệ thông tin' },
        { id: 5, fullName: 'Nguyễn Linh Anh', studentCode: '20210108P', email: '', gender: 'Khác', course: 'Khóa 66', className: 'DH-BK-CNTT1.1-K66', trainingType: 'Vừa làm vừa học', degree: 'Cử nhân', location: 'Đại học Bách khoa Hà Nội', startDate: '', endDate: '', status: 'STUDYING', major: 'Công nghệ thông tin' },
        { id: 6, fullName: 'Phan Thị Phương', studentCode: '20210452P', email: 'Phuong.PT210452P@sis.hust.edu.vn', gender: 'Khác', course: 'Khóa 67', className: 'DH-BK-KTO1-K67', trainingType: 'Vừa làm vừa học', degree: 'Cử nhân', location: 'Đại học Bách khoa Hà Nội', startDate: '', endDate: '', status: 'STUDYING', major: 'Kế toán' },
      ],
    }
  },
  computed: {
    filteredStudents() {
      return this.students.filter(s => {
        const matchSearch = !this.appliedFilters.search || 
          s.fullName.toLowerCase().includes(this.appliedFilters.search.toLowerCase()) || 
          s.studentCode.toLowerCase().includes(this.appliedFilters.search.toLowerCase())
          
        const matchClass = !this.appliedFilters.class || s.className === this.appliedFilters.class
        const matchStatus = !this.appliedFilters.status || s.status === this.appliedFilters.status
        const matchTrainingType = !this.appliedFilters.trainingType || s.trainingType === this.appliedFilters.trainingType
        const matchLocation = !this.appliedFilters.location || s.location === this.appliedFilters.location
        const matchMajor = !this.appliedFilters.major || s.major === this.appliedFilters.major
        const matchCourse = !this.appliedFilters.course || s.course === this.appliedFilters.course
        const matchGender = !this.appliedFilters.gender || s.gender === this.appliedFilters.gender

        return matchSearch && matchClass && matchStatus && matchTrainingType && matchLocation && matchMajor && matchCourse && matchGender
      })
    },
    paginatedStudents() {
      const start = (this.page - 1) * this.itemsPerPage
      return this.filteredStudents.slice(start, start + this.itemsPerPage)
    },
    totalPages() {
      const total = Math.ceil(this.filteredStudents.length / this.itemsPerPage)
      return total > 0 ? total : 1
    },
    visiblePages() {
      const pages = []
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i)
      }
      return pages
    }
  },
  mounted() {
    if (this.$store) {
      this.$store.commit('SET_PAGE_TITLE', 'Quản lý sinh viên')
    }
  },
  methods: {
    // Chuyển mã Enum thành Text tiếng Việt
    getStatusText(status) {
      const statusMap = {
        STUDYING: 'Đang học tập',
        LEAVE_OF_ABSENCE: 'Bảo lưu',
        DROP_OUT_OF_SCHOOL: 'Đã nghỉ học'
      }
      return statusMap[status] || status
    },

    // Trả về class màu sắc theo từng trạng thái
    getStatusClass(status) {
      switch (status) {
        case 'STUDYING':
          return 'status-studying'
        case 'LEAVE_OF_ABSENCE':
          return 'status-leave'
        case 'DROP_OUT_OF_SCHOOL':
          return 'status-dropout'
        default:
          return 'status-unknown'
      }
    },

    search() {
      this.appliedFilters = {
        ...this.appliedFilters,
        ...this.filters,
        ...this.tempDialogFilters
      }
      this.page = 1
      this.pageInput = 1
    },

    openFilterDialog() {
      this.tempDialogFilters = {
        trainingType: this.appliedFilters.trainingType,
        location: this.appliedFilters.location,
        major: this.appliedFilters.major,
        course: this.appliedFilters.course,
        gender: this.appliedFilters.gender
      }
      this.filterDialog = true
    },

    applyAdvancedFilters() {
      this.search()
      this.filterDialog = false
    },

    resetFilters() {
      this.filters = { 
        search: '', 
        class: null, 
        status: null,
      }
      this.tempDialogFilters = {
        trainingType: null,
        location: null,
        major: null,
        course: null,
        gender: null
      }
      this.appliedFilters = {
        search: '', 
        class: null, 
        status: null,
        trainingType: null,
        location: null,
        major: null,
        course: null,
        gender: null
      }
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

    viewDetail(item) {
      this.selectedStudent = item
      this.detailDialog = true
    },

    checkHistory(item) {
      this.selectedStudent = item
      this.historyDialog = true
    },

    resetHistoryFilters() {
      this.historyFilters = { subject: null, process: null }
    },

    openConfirmStatusDialog(item, newStatus) {
      if (item.status === newStatus) return
      this.pendingStatusChange = {
        student: item,
        oldStatus: item.status,
        newStatus
      }
      this.confirmStatusDialog = true
    },

    confirmStatusUpdate() {
      if (this.pendingStatusChange.student) {
        const student = this.pendingStatusChange.student
        student.status = this.pendingStatusChange.newStatus

        this.confirmStatusDialog = false
        this.showToast('Cập nhật trạng thái thành công', '#4caf50')
      }
    },

    exportToExcel() {
      const dataToExport = this.filteredStudents.map((item, index) => ({
        'STT': index + 1,
        'Họ và Tên': item.fullName,
        'Mã Sinh Viên': item.studentCode,
        'Email': item.email || '---',
        'Giới tính': item.gender || '---',
        'Khóa': item.course || '---',
        'Lớp': item.className || '---',
        'Hình thức đào tạo': item.trainingType || '---',
        'Ngành': item.major || '---',
        'Bằng cấp': item.degree || '---',
        'Địa điểm đào tạo': item.location || '---',
        'Trạng thái': this.getStatusText(item.status),
      }))

      if (dataToExport.length === 0) {
        this.showToast('Không có dữ liệu để xuất file!', '#f44336')
        return
      }

      const worksheet = XLSX.utils.json_to_sheet(dataToExport)
      const autoFitCols = Object.keys(dataToExport[0]).map(key => ({
        wch: Math.max(key.length + 5, 15)
      }))
      worksheet['!cols'] = autoFitCols

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách sinh viên')

      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')

      const timeString = `${year}_${month}_${day}_${hours}${minutes}${seconds}`
      const randomSuffix = Math.random().toString(16).substring(2, 6)

      const fileName = `danh_sach_sinh_vien_${timeString}_${randomSuffix}.xlsx`
      XLSX.writeFile(workbook, fileName)
    },

    showToast(message, color) {
      this.toast.message = message
      this.toast.color = color
      this.toast.show = true
    }
  }
}
</script>

<style scoped>
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.border-btn { border: 1px solid #a2212b !important; }

/* 1. THANH BỘ LỌC */
.filter-item {
  flex-grow: 1;
  flex-shrink: 1;
}
.search-input { min-width: 150px; max-width: 200px; }
.select-md { min-width: 140px; max-width: 180px; }
.action-btn { height: 40px !important; min-height: 40px !important; }

.custom-outlined-input >>> .v-input__control { min-height: 40px !important; }
.custom-outlined-input >>> fieldset { border-color: #ccc !important; border-radius: 4px !important; }
.custom-outlined-input.v-input--is-focused >>> fieldset { border-color: #a2212b !important; border-width: 1px !important; }

/* 2. BẢNG KHÔNG CÓ BỎ KHUNG BÊN NGOÀI */
.table-responsive-wrapper {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.custom-table {
  min-width: 1100px !important;
  background-color: transparent !important;
}

.custom-table >>> .v-data-table__wrapper {
  border: none !important;
}

.custom-table >>> th {
  background-color: #f8f9fa !important;
  font-weight: bold !important;
  color: #333 !important;
  white-space: nowrap !important;
}

/* 3. MÀU TRẠNG THÁI */
.status-badge {
  transition: opacity 0.2s ease-in-out;
  user-select: none;
  border-radius: 16px !important;
}

.status-badge:hover {
  opacity: 0.9;
}

/* Đang học tập: Nền đỏ Bách Khoa, chữ trắng */
.status-studying {
  background-color: #a2212b !important;
  color: #ffffff !important;
}

/* Bảo lưu: Nền vàng, chữ đen */
.status-leave {
  background-color: #fbc02d !important;
  color: #000000 !important;
}

/* Đã nghỉ học: Nền xám, chữ trắng */
.status-dropout {
  background-color: #616161 !important;
  color: #ffffff !important;
}

.status-unknown {
  background-color: #e0e0e0 !important;
  color: #424242 !important;
}

/* 4. THÀNH PHẦN KHÁC */
.border-left-title {
  border-left: 4px solid #a2212b;
  line-height: 1.2;
}

.custom-toast >>> .v-snack__wrapper {
  border-radius: 8px !important;
  min-width: 280px !important;
}

/* Thanh cuộn */
.table-responsive-wrapper::-webkit-scrollbar {
  height: 6px;
}
.table-responsive-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}
.table-responsive-wrapper::-webkit-scrollbar-thumb {
  background: #a2212b;
  border-radius: 4px;
}
.table-responsive-wrapper::-webkit-scrollbar-thumb:hover {
  background: #83161f;
}
</style>