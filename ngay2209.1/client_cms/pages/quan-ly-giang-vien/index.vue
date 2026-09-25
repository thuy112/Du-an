<template>
  <div class="teacher-page pa-2 pa-sm-4">
    <!-- Thanh lọc Tìm kiếm -->
    <div class="d-flex align-center justify-space-between mb-4 flex-wrap gap-2 width-100">
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
          class="bg-white rounded filter-item search-input"
          @keyup.enter="search"
        ></v-text-field>

        <v-select
          v-model="filters.gender"
          :items="['Nam', 'Nữ', 'Khác']"
          placeholder="Giới tính"
          outlined
          dense
          hide-details
          clearable
          class="bg-white rounded filter-item select-sm"
          @change="search"
        ></v-select>

        <v-select
          v-model="filters.teacherType"
          :items="['Đương chức', 'Mời giảng']"
          placeholder="Loại giảng viên"
          outlined
          dense
          hide-details
          clearable
          class="bg-white rounded filter-item select-md"
          @change="search"
        ></v-select>

        <v-select
          v-model="filters.status"
          :items="['Hoạt động', 'Nghỉ hưu', 'Ngừng hoạt động']"
          placeholder="Trạng thái"
          outlined
          dense
          hide-details
          clearable
          class="bg-white rounded filter-item select-md"
          @change="search"
        ></v-select>

        <v-select
          v-model="filters.department"
          :items="['Đại học Bách khoa Hà Nội', 'Khoa CNTT']"
          placeholder="Khoa/ Trường"
          outlined
          dense
          hide-details
          clearable
          class="bg-white rounded filter-item select-lg"
          @change="search"
        ></v-select>

        <div class="d-flex gap-2">
          <v-btn icon color="#a2212b" class="rounded-sm" @click="resetFilters">
            <v-icon color="#a2212b">mdi-refresh</v-icon>
          </v-btn>

          <v-btn color="#a2212b" dark elevation="0" class="min-w-0 px-3 rounded-sm" @click="search">
            <v-icon size="24">mdi-magnify</v-icon>
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Bảng Dữ liệu tích hợp kéo cuộn ngang Responsive -->
    <v-card flat class="border rounded-lg overflow-hidden mb-4">
      <div class="table-responsive-wrapper">
        <v-data-table
          :headers="headers"
          :items="paginatedTeachers"
          hide-default-footer
          disable-pagination
          class="custom-table"
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
                Giới tính: <span class="black--text font-weight-medium">{{ item.gender }}</span>
              </div>
            </div>
          </template>

          <template #[`item.teacherType`]="{ item }">
            <v-chip
              small
              dark
              :color="item.teacherType === 'Đương chức' ? '#ffb100' : '#4caf50'"
              class="font-weight-bold text-caption px-3"
            >
              {{ item.teacherType }}
            </v-chip>
          </template>

          <!-- Trạng thái màu đỏ - Bấm vào mở Confirm Dialog -->
          <template #[`item.status`]="{ item }">
            <v-select
              :value="item.status"
              :items="['Hoạt động', 'Nghỉ hưu', 'Ngừng hoạt động']"
              dense
              flat
              solo
              hide-details
              class="status-select-btn"
              @change="openConfirmStatusDialog(item, $event)"
            ></v-select>
          </template>

          <template #[`item.actions`]="{ item }">
            <div class="d-flex align-center justify-center gap-1">
              <v-btn icon x-small color="cyan darken-1" @click="viewDetail(item)">
                <v-icon size="24">mdi-eye-outline</v-icon>
              </v-btn>

              <v-btn icon x-small color="teal" @click="checkHistory(item)">
                <v-icon size="24">mdi-table-account</v-icon>
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </div>
    </v-card>

    <!-- Thanh Xuất Excel & Phân trang -->
    <div class="d-flex align-center justify-space-between flex-wrap gap-2">
      <v-btn color="success" dark elevation="0" class="text-capitalize rounded px-4 font-weight-bold">
        <v-icon left small>mdi-export</v-icon> XUẤT FILE EXCEL
      </v-btn>

      <div class="d-flex align-center gap-2">
        <span class="caption grey--text text--darken-1">Bản ghi</span>
        <v-select
          v-model="itemsPerPage"
          :items="[10, 20, 50, 100]"
          dense
          outlined
          hide-details
          style="max-width: 75px"
          @change="onItemsPerPageChange"
        ></v-select>

        <span class="caption grey--text text--darken-1 ml-1">Trang</span>
        <v-text-field
          v-model.number="pageInput"
          dense
          outlined
          hide-details
          style="max-width: 50px"
          class="text-center"
          @keyup.enter="goToPage"
        ></v-text-field>

        <v-btn color="#a2212b" dark small class="text-capitalize px-3 rounded-sm elevation-0" @click="goToPage">
          Đi
        </v-btn>

        <v-btn icon :disabled="page <= 1" @click="changePage(page - 1)">
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

        <v-btn icon :disabled="page >= totalPages" @click="changePage(page + 1)">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- 1. POPUP XÁC NHẬN ĐỔI TRẠNG THÁI -->
    <v-dialog v-model="confirmStatusDialog" max-width="500px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="pa-3 text-subtitle-1 font-weight-bold white--text d-flex justify-space-between align-center" style="background-color: #a2212b;">
          <span>Xác nhận</span>
          <v-btn icon dark x-small @click="confirmStatusDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-5 black--text text-body-1">
          <div class="my-2">
            Bạn có chắc chắn muốn đổi trạng thái từ <span class="font-weight-bold red--text text--darken-2">{{ pendingStatusChange.oldStatus }}</span> sang <span class="font-weight-bold red--text text--darken-2">{{ pendingStatusChange.newStatus }}</span> không?
          </div>

          <div class="d-flex justify-end gap-2 mt-6">
            <v-btn
              outlined
              class="text-capitalize border-btn font-weight-bold"
              color="#a2212b"
              @click="confirmStatusDialog = false"
            >
              Đóng X
            </v-btn>
            <v-btn
              color="#a2212b"
              dark
              elevation="0"
              class="text-capitalize font-weight-bold"
              @click="confirmStatusUpdate"
            >
              Xác nhận
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 2. POPUP CHI TIẾT GIẢNG VIÊN -->
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
              <v-chip
                v-if="selectedTeacher.teacherType"
                x-small
                dark
                :color="selectedTeacher.teacherType === 'Đương chức' ? '#ffb100' : '#4caf50'"
                class="font-weight-bold"
              >
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
            <v-btn
              outlined
              class="text-capitalize px-6 border-btn font-weight-bold"
              color="#a2212b"
              @click="detailDialog = false"
            >
              Đóng X
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 3. POPUP LỊCH SỬ CẬP NHẬT -->
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
              <v-chip
                x-small
                dark
                :color="selectedTeacher.teacherType === 'Đương chức' ? '#ffb100' : '#4caf50'"
                class="font-weight-bold"
              >
                {{ selectedTeacher.teacherType }}
              </v-chip>
            </v-col>
          </v-row>

          <div class="d-flex justify-end mt-6">
            <v-btn
              outlined
              class="text-capitalize px-6 border-btn font-weight-bold"
              color="#a2212b"
              @click="historyDialog = false"
            >
              Đóng X
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 4. DYNAMIC SNACKBAR NOTIFICATION -->
    <v-snackbar
      v-model="toast.show"
      top
      right
      :color="toast.color"
      timeout="3000"
      class="custom-toast"
    >
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
export default {
  name: 'QuanLyGiangVienPage',
  middleware: 'authenticated',
  mounted() {
    this.$store.commit('SET_PAGE_TITLE', 'Quản lý giảng viên')
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
      pendingStatusChange: {
        teacher: null,
        oldStatus: '',
        newStatus: ''
      },

      toast: {
        show: false,
        message: '',
        color: '#ffc107'
      },

      headers: [
        { text: 'STT', value: 'stt', sortable: false, width: '60px' },
        { text: 'Thông tin chung', value: 'generalInfo', sortable: false, width: '260px' },
        { text: 'Mã giảng viên', value: 'code', sortable: false },
        { text: 'Đơn vị', value: 'unit', sortable: false },
        { text: 'Khoa/ Trường', value: 'department', sortable: false },
        { text: 'Mã số thuế', value: 'taxCode', sortable: false },
        { text: 'Loại giảng viên', value: 'teacherType', sortable: false },
        { text: 'Trạng thái', value: 'status', sortable: false, width: '130px' },
        { text: 'Chức năng', value: 'actions', sortable: false, align: 'center', width: '90px' },
      ],
      teachers: [
        { id: 1, fullName: 'Trần Bảo Yến', phone: '0856146936', email: 'baoien121124@gmail.com', gender: 'Nữ', code: 'TTBY01', unit: '', department: '', taxCode: '', teacherType: 'Đương chức', status: 'Hoạt động', dob: '', hasUpdate: false, lastUpdated: '' },
        { id: 2, fullName: 'Trần Mạnh Dũng', phone: '0327699521', dob: '29/12/2004', email: 'dungtm@gmail.com', gender: 'Nam', code: 'GV_271204', unit: '', department: '', taxCode: '', teacherType: 'Đương chức', status: 'Hoạt động', hasUpdate: false, lastUpdated: '' },
        { id: 3, fullName: 'Trần Mạnh Hải', phone: '0988096338', dob: '28/12/2004', email: 'haitm@gmail.com', gender: 'Nam', code: 'GV_260520_002', unit: '', department: '', taxCode: '8075678901', teacherType: 'Đương chức', status: 'Hoạt động', hasUpdate: false, lastUpdated: '' },
        { id: 4, fullName: 'Trần Ngọc Anh', phone: '0965336221', dob: '01/10/2000', email: 'test06@onebs.vn', gender: 'Nam', code: 'GV_260520_001', unit: '', department: '', taxCode: '4502320054', teacherType: 'Mời giảng', status: 'Hoạt động', hasUpdate: false, lastUpdated: '' },
        { id: 5, fullName: 'Lưu Thị Oanh', dob: '03/05/1961', code: '002 014 00046', unit: '', department: '', taxCode: '', teacherType: 'Đương chức', status: 'Hoạt động', hasUpdate: false, lastUpdated: '' },
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
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i)
      }
      return pages
    }
  },
  methods: {
    getCurrentDateTime() {
      const now = new Date()
      const day = String(now.getDate()).padStart(2, '0')
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const year = now.getFullYear()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')

      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
    },
    search() {
      this.page = 1
      this.pageInput = 1
    },
    resetFilters() {
      this.filters = { search: '', gender: null, teacherType: null, status: null, department: null }
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
      this.selectedTeacher = item
      this.detailDialog = true
    },
    checkHistory(item) {
      this.selectedTeacher = { ...item }

      if (item.hasUpdate) {
        this.historyDialog = true
      } else {
        this.showToast('Không có dữ liệu cập nhật mới.', '#ffc107')
      }
    },

    openConfirmStatusDialog(item, newStatus) {
      if (item.status === newStatus) return
      this.pendingStatusChange = {
        teacher: item,
        oldStatus: item.status,
        newStatus
      }
      this.confirmStatusDialog = true
    },

    confirmStatusUpdate() {
      if (this.pendingStatusChange.teacher) {
        const teacher = this.pendingStatusChange.teacher
        teacher.status = this.pendingStatusChange.newStatus
        
        teacher.hasUpdate = true
        teacher.lastUpdated = this.getCurrentDateTime()

        this.confirmStatusDialog = false
        this.showToast('Cập nhật thành công', '#4caf50')
      }
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

.filter-item { flex: 1 1 100%; }
@media (min-width: 600px) {
  .filter-item { flex: 1 1 auto; }
  .search-input { min-width: 150px; max-width: 220px; }
  .select-sm { min-width: 100px; max-width: 130px; }
  .select-md { min-width: 120px; max-width: 150px; }
  .select-lg { min-width: 140px; max-width: 180px; }
}

/* Khối bọc cho phép cuộn ngang khi màn hình bị co nhỏ */
.table-responsive-wrapper {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.custom-table {
  min-width: 950px !important;
}

.custom-table >>> th { background-color: #f8f9fa !important; font-weight: bold !important; color: #333 !important; }

.status-select-btn >>> .v-input__slot { background-color: #a2212b !important; border-radius: 20px !important; min-height: 28px !important; padding: 0 10px !important; }
.status-select-btn >>> .v-select__selection { color: white !important; font-size: 12px !important; font-weight: bold !important; }
.status-select-btn >>> .v-icon { color: white !important; }

.custom-toast >>> .v-snack__wrapper {
  border-radius: 8px !important;
}

/* Custom thanh cuộn ngang màu đỏ Bách Khoa */
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