<template>
  <div class="student-page pa-3 pa-sm-4 bg-white">
    <!-- 1. THANH TÌM KIẾM CỐ ĐỊNH PHÍA TRÊN -->
    <div class="d-flex align-center justify-space-between flex-wrap gap-2 mb-4 width-100">
      <div class="text-subtitle-1 font-weight-bold mr-2 text-no-wrap">
        Danh sách sinh viên ({{ filteredStudents.length }})
      </div>

      <div class="d-flex align-center gap-2 flex-wrap flex-grow-1 justify-end">
        <v-text-field
          v-model="filters.search"
          placeholder="Tìm kiếm"
          outlined
          dense
          hide-details
          class="bg-white rounded filter-item search-input custom-outlined-input"
          @keyup.enter="search"
        ></v-text-field>

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

        <v-select
          v-model="filters.status"
          :items="['Đang học tập', 'Đã nghỉ học', 'Bảo lưu', 'Tốt nghiệp']"
          placeholder="Trạng thái"
          outlined
          dense
          hide-details
          clearable
          class="bg-white rounded filter-item select-md custom-outlined-input"
        ></v-select>

        <!-- Nút Mở Dialog Bộ Lọc Nâng Cao -->
        <v-btn
          icon
          color="#a2212b"
          class="min-w-0"
          @click="openFilterDialog"
        >
          <v-icon color="#a2212b">mdi-filter-variant-plus</v-icon>
        </v-btn>

        <!-- Nút Làm Mới (Reset) -->
        <v-btn icon color="#a2212b" class="rounded-sm" @click="resetFilters">
          <v-icon color="#a2212b">mdi-refresh</v-icon>
        </v-btn>

        <!-- Nút TÌM KIẾM chính -->
        <v-btn color="#a2212b" dark elevation="0" class="min-w-0 px-3 rounded-sm action-btn" @click="search">
          <v-icon size="24">mdi-magnify</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- 2. BẢNG DỮ LIỆU HIỂN THỊ TOÀN BỘ + CUỘN NGANG KHI THU NHỎ -->
    <v-card flat class="border rounded-lg overflow-hidden mb-4">
      <div class="table-responsive-wrapper">
        <v-data-table
          :headers="headers"
          :items="paginatedStudents"
          hide-default-footer
          disable-pagination
          class="custom-table"
          :loading="loading"
          fixed-header
          height="600px"
        >
          <!-- STT -->
          <template #[`item.stt`]="{ index }">
            <span class="font-weight-medium">{{ (page - 1) * itemsPerPage + index + 1 }}</span>
          </template>

          <!-- Thông tin chung -->
          <template #[`item.generalInfo`]="{ item }">
            <div class="py-2">
              <div class="font-weight-bold red--text text--darken-3 mb-1">
                {{ item.fullName }}
              </div>
              <div v-if="item.studentCode" class="caption text--secondary mb-1">
                Mã số sinh viên: <span class="red--text text--darken-3 font-weight-bold">{{ item.studentCode }}</span>
              </div>
              <div v-if="item.email" class="caption text--secondary mb-1">
                Email: <span class="red--text text--darken-3 font-weight-medium">{{ item.email }}</span>
              </div>
              <div class="caption text--secondary">
                Giới tính: <span class="black--text font-weight-medium">{{ item.gender }}</span>
              </div>
            </div>
          </template>

          <!-- Đổi trạng thái sinh viên (Chuẩn giao diện Ảnh 2) -->
          <template #[`item.status`]="{ item }">
            <v-select
              :value="item.status"
              :items="['Đang học tập', 'Đã nghỉ học', 'Bảo lưu', 'Tốt nghiệp']"
              dense
              flat
              solo
              hide-details
              :menu-props="{ offsetY: true, closeOnClick: true, closeOnContentClick: true }"
              class="status-select-btn"
              @change="openConfirmStatusDialog(item, $event)"
            ></v-select>
          </template>

          <!-- Cột chức năng -->
          <template #[`item.actions`]="{ item }">
            <div class="d-flex align-center justify-center gap-1">
              <v-btn icon x-small color="cyan darken-1" @click="viewDetail(item)">
                <v-icon size="22" color="blue">mdi-eye</v-icon>
              </v-btn>

              <v-btn icon x-small color="teal" @click="checkHistory(item)">
                <v-icon size="22" color="green">mdi-table-account</v-icon>
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </div>
    </v-card>

    <!-- 3. THANH PHÂN TRANG -->
    <div class="d-flex align-center justify-end flex-wrap gap-2 my-2">
      <v-btn color="success" dark elevation="0" class="text-capitalize rounded px-4 mr-auto font-weight-bold">
        <v-icon left small>mdi-export</v-icon> XUẤT FILE EXCEL
      </v-btn>

      <div class="d-flex align-center gap-2 flex-wrap">
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

        <v-btn color="#a2212b" dark small class="text-capitalize px-3 rounded-sm elevation-0" style="height: 36px;" @click="goToPage">
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

    <!-- POPUP BỘ LỌC NÂNG CAO -->
    <v-dialog v-model="filterDialog" max-width="550px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="pa-3 text-subtitle-1 font-weight-bold white--text d-flex justify-space-between align-center" style="background-color: #a2212b;">
          <span>Bộ lọc</span>
          <v-btn icon dark x-small @click="filterDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-5 black--text">
          <v-row dense class="mt-1">
            <v-col cols="12" sm="6" class="py-2">
              <v-select
                v-model="tempDialogFilters.trainingType"
                :items="['Vừa làm vừa học', 'Chính quy', 'Từ xa']"
                placeholder="Hình thức đào tạo"
                outlined
                dense
                hide-details
                clearable
              ></v-select>
            </v-col>

            <v-col cols="12" sm="6" class="py-2">
              <v-select
                v-model="tempDialogFilters.location"
                :items="['Đại học Bách khoa Hà Nội', 'Cơ sở 2']"
                placeholder="Địa điểm đào tạo"
                outlined
                dense
                hide-details
                clearable
              ></v-select>
            </v-col>

            <v-col cols="12" sm="6" class="py-2">
              <v-select
                v-model="tempDialogFilters.major"
                :items="['Kế toán', 'Quản trị kinh doanh', 'Công nghệ thông tin']"
                placeholder="Ngành"
                outlined
                dense
                hide-details
                clearable
              ></v-select>
            </v-col>

            <v-col cols="12" sm="6" class="py-2">
              <v-select
                v-model="tempDialogFilters.course"
                :items="['Khóa 65', 'Khóa 66', 'Khóa 67']"
                placeholder="Khóa"
                outlined
                dense
                hide-details
                clearable
              ></v-select>
            </v-col>

            <v-col cols="12" sm="6" class="py-2">
              <v-select
                v-model="tempDialogFilters.gender"
                :items="['Nam', 'Nữ', 'Khác']"
                placeholder="Giới tính"
                outlined
                dense
                hide-details
                clearable
              ></v-select>
            </v-col>
          </v-row>

          <div class="d-flex justify-end gap-2 mt-6">
            <v-btn
              outlined
              class="text-capitalize border-btn font-weight-bold"
              color="#a2212b"
              @click="filterDialog = false"
            >
              Đóng X
            </v-btn>
            <v-btn
              color="#a2212b"
              dark
              elevation="0"
              class="text-capitalize font-weight-bold"
              @click="applyAdvancedFilters"
            >
              Tìm Kiếm <v-icon small class="ml-1">mdi-magnify</v-icon>
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- POPUP XÁC NHẬN ĐỔI TRẠNG THÁI -->
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

    <!-- POPUP CHI TIẾT SINH VIÊN -->
    <v-dialog v-model="detailDialog" max-width="800px" scrollable persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="pa-3 text-subtitle-1 font-weight-bold white--text d-flex justify-space-between align-center" style="background-color: #a2212b;">
          <span>Thông tin sinh viên chi tiết</span>
          <v-btn icon dark x-small @click="detailDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-5 black--text style-scroll" style="max-height: 80vh;">
          <div class="text-h6 font-weight-bold border-left-title mb-4 pl-2">Thông tin cá nhân</div>
          <v-row dense class="text-body-2 mb-6">
            <v-col cols="6" class="py-1">
              <span class="grey--text text--darken-1">Họ tên:</span> <span class="font-weight-bold red--text text--darken-3">{{ selectedStudent.fullName }}</span>
            </v-col>
            <v-col cols="6" class="py-1">
              <span class="grey--text text--darken-1">Giới tính:</span> <span class="font-weight-medium red--text text--darken-3">{{ selectedStudent.gender || 'Khác' }}</span>
            </v-col>

            <v-col cols="6" class="py-1">
              <span class="grey--text text--darken-1">Mã số sinh viên:</span> <span class="font-weight-bold red--text text--darken-3">{{ selectedStudent.studentCode }}</span>
            </v-col>
            <v-col cols="6" class="py-1">
              <span class="grey--text text--darken-1">CCCD:</span> <span class="font-weight-bold red--text text--darken-3">{{ selectedStudent.cccd || '030303010695' }}</span>
            </v-col>

            <v-col cols="6" class="py-1">
              <span class="grey--text text--darken-1">Ngày sinh:</span> <span class="font-weight-medium">{{ selectedStudent.dob || '' }}</span>
            </v-col>
            <v-col cols="6" class="py-1">
              <span class="grey--text text--darken-1">Email trường:</span> <span class="font-weight-medium red--text text--darken-3">{{ selectedStudent.email }}</span>
            </v-col>

            <v-col cols="6" class="py-1">
              <span class="grey--text text--darken-1">Nơi sinh:</span> <span class="font-weight-medium">{{ selectedStudent.pob || '' }}</span>
            </v-col>
            <v-col cols="6" class="py-1">
              <span class="grey--text text--darken-1">Email cá nhân:</span> <span class="font-weight-medium">{{ selectedStudent.personalEmail || '' }}</span>
            </v-col>

            <v-col cols="6" class="py-1">
              <span class="grey--text text--darken-1">Trú quán:</span> <span class="font-weight-medium">{{ selectedStudent.hometown || '' }}</span>
            </v-col>
            <v-col cols="6" class="py-1">
              <span class="grey--text text--darken-1">Dân tộc:</span> <span class="font-weight-medium">{{ selectedStudent.ethnicity || '' }}</span>
            </v-col>

            <v-col cols="6" class="py-1">
              <span class="grey--text text--darken-1">Địa chỉ liên hệ:</span> <span class="font-weight-medium">{{ selectedStudent.address || '' }}</span>
            </v-col>
            <v-col cols="6" class="py-1 d-flex align-center">
              <span class="grey--text text--darken-1 mr-2">Trạng thái:</span>
              <v-chip x-small dark color="#a2212b" class="font-weight-bold">
                {{ selectedStudent.status }}
              </v-chip>
            </v-col>

            <v-col cols="6" class="py-1">
              <span class="grey--text text--darken-1">SĐT:</span> <span class="font-weight-medium">{{ selectedStudent.phone || '' }}</span>
            </v-col>
          </v-row>

          <div class="text-h6 font-weight-bold border-left-title mb-4 pl-2">Thông tin đào tạo</div>
          <v-row dense class="text-body-2">
            <v-col cols="12" class="py-1">
              <span class="grey--text text--darken-1">Địa điểm đào tạo:</span> <span class="font-weight-bold red--text text--darken-3">{{ selectedStudent.location }}</span>
            </v-col>

            <v-col cols="12" class="py-1">
              <span class="grey--text text--darken-1">Tên lớp:</span> <span class="font-weight-bold red--text text--darken-3">{{ selectedStudent.className }}</span>
            </v-col>

            <v-col cols="12" class="py-1">
              <span class="grey--text text--darken-1">Tên khóa học:</span> <span class="font-weight-bold red--text text--darken-3">{{ selectedStudent.course }}</span>
            </v-col>

            <v-col cols="12" class="py-1">
              <span class="grey--text text--darken-1">Loại hình đào tạo:</span> <span class="font-weight-bold red--text text--darken-3">{{ selectedStudent.educationType || 'Dài hạn' }}</span>
            </v-col>

            <v-col cols="12" class="py-1">
              <span class="grey--text text--darken-1">Hình thức đào tạo:</span> <span class="font-weight-bold red--text text--darken-3">{{ selectedStudent.trainingType }}</span>
            </v-col>

            <v-col cols="12" class="py-1">
              <span class="grey--text text--darken-1">Ngành:</span> <span class="font-weight-bold red--text text--darken-3">{{ selectedStudent.major || 'Kế toán' }}</span>
            </v-col>

            <v-col cols="4" class="py-1">
              <span class="grey--text text--darken-1">Bằng cấp:</span> <span class="font-weight-bold red--text text--darken-3">{{ selectedStudent.degree }}</span>
            </v-col>
            <v-col cols="4" class="py-1">
              <span class="grey--text text--darken-1">Thời gian bắt đầu:</span> <span class="font-weight-medium">{{ selectedStudent.startDate || '---' }}</span>
            </v-col>
            <v-col cols="4" class="py-1">
              <span class="grey--text text--darken-1">Thời gian kết thúc:</span> <span class="font-weight-medium">{{ selectedStudent.endDate || '---' }}</span>
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

    <!-- POPUP LỊCH SỬ DỮ LIỆU SINH VIÊN -->
    <v-dialog v-model="historyDialog" max-width="850px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="pa-3 text-subtitle-1 font-weight-bold white--text d-flex justify-space-between align-center" style="background-color: #a2212b;">
          <span>Lịch sử dữ liệu sinh viên</span>
          <v-btn icon dark x-small @click="historyDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-5 black--text">
          <div class="d-flex align-center gap-2 mb-4 flex-wrap justify-end">
            <v-select
              v-model="historyFilters.subject"
              :items="['Tất cả học phần']"
              placeholder="Học phần"
              outlined
              dense
              hide-details
              style="max-width: 180px"
              class="bg-white rounded"
            ></v-select>

            <v-select
              v-model="historyFilters.process"
              :items="['Tất cả quy trình']"
              placeholder="Quy trình học tập"
              outlined
              dense
              hide-details
              style="max-width: 180px"
              class="bg-white rounded"
            ></v-select>

            <v-btn icon color="#a2212b" class="rounded-sm" @click="resetHistoryFilters">
              <v-icon color="#a2212b" size="24">mdi-refresh</v-icon>
            </v-btn>

            <v-btn color="#a2212b" dark elevation="0" class="min-w-0 px-3 rounded-sm action-btn">
              <v-icon size="24">mdi-magnify</v-icon>
            </v-btn>
          </div>

          <v-card flat class="border rounded-lg overflow-hidden mb-4">
            <div class="table-responsive-wrapper">
              <v-data-table
                :headers="historyHeaders"
                :items="historyLogs"
                hide-default-footer
                class="custom-table"
              >
                <template #no-data>
                  <div class="py-6 grey--text text-center">Không có dữ liệu.</div>
                </template>
              </v-data-table>
            </div>
          </v-card>

          <div class="d-flex align-center justify-end gap-2">
            <span class="caption grey--text text--darken-1">Bản ghi</span>
            <v-select
              v-model="historyItemsPerPage"
              :items="[10, 20, 50]"
              dense
              outlined
              hide-details
              class="history-record-select"
            ></v-select>

            <span class="caption grey--text text--darken-1 ml-1">Trang</span>
            <v-text-field
              v-model.number="historyPage"
              dense
              outlined
              hide-details
              style="max-width: 45px"
              class="history-page-field"
            ></v-text-field>

            <v-btn icon disabled class="history-pagination-arrow">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            <v-btn icon disabled class="history-pagination-arrow">
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </div>

          <div class="d-flex justify-end mt-4">
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

    <!-- SNACKBAR NOTIFICATION -->
    <v-snackbar
      v-model="toast.show"
      top
      right
      :color="toast.color"
      timeout="3000"
      class="custom-toast"
    >
      <div class="d-flex align-center font-weight-medium white--text">
        <v-icon color="white" class="mr-2">
          {{ toast.color === '#4caf50' ? 'mdi-check-circle' : 'mdi-alert-circle' }}
        </v-icon>
        <span>{{ toast.message }}</span>
      </div>
      <template #action="{ attrs }">
        <v-btn text icon color="white" v-bind="attrs" @click="toast.show = false">
          <v-icon small>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
export default {
  name: 'QuanLySinhVienPage',
  middleware: 'authenticated',
  mounted() {
    if (this.$store) {
      this.$store.commit('SET_PAGE_TITLE', 'Quản lý sinh viên')
    }
  },
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
        { id: 1, fullName: 'Phan Thị Phương', studentCode: '20210452P', email: 'Phuong.PT210452P@sis.hust.edu.vn', gender: 'Khác', course: 'Khóa 67', className: 'DH-BK-KTO1-K67', trainingType: 'Vừa làm vừa học', degree: 'Cử nhân', location: 'Đại học Bách khoa Hà Nội', startDate: '', endDate: '', status: 'Đang học tập', major: 'Kế toán' },
        { id: 2, fullName: 'Vũ Phương Linh', studentCode: '20210344P', email: 'Linh.VP210344P@sis.hust.edu.vn', gender: 'Khác', course: 'Khóa 66', className: 'DH-BK-QTKD2.2-K66', trainingType: 'Vừa làm vừa học', degree: 'Cử nhân', location: 'Đại học Bách khoa Hà Nội', startDate: '', endDate: '', status: 'Đang học tập', major: 'Quản trị kinh doanh' },
        { id: 3, fullName: 'Trịnh Thanh Tâm', studentCode: '20210377P', email: 'Tam.TT210377P@sis.hust.edu.vn', gender: 'Khác', course: 'Khóa 66', className: 'DH-BK-QTKD2.2-K66', trainingType: 'Vừa làm vừa học', degree: 'Cử nhân', location: 'Đại học Bách khoa Hà Nội', startDate: '', endDate: '', status: 'Đang học tập', major: 'Quản trị kinh doanh' },
        { id: 4, fullName: 'Nguyễn Khánh An', studentCode: '20210105P', email: 'An.NK210105P@sis.hust.edu.vn', gender: 'Khác', course: 'Khóa 66', className: 'DH-BK-CNTT1.1-K66', trainingType: 'Vừa làm vừa học', degree: 'Cử nhân', location: 'Đại học Bách khoa Hà Nội', startDate: '', endDate: '', status: 'Đang học tập', major: 'Công nghệ thông tin' },
        { id: 5, fullName: 'Nguyễn Linh Anh', studentCode: '20210108P', email: '', gender: 'Khác', course: 'Khóa 66', className: 'DH-BK-CNTT1.1-K66', trainingType: 'Vừa làm vừa học', degree: 'Cử nhân', location: 'Đại học Bách khoa Hà Nội', startDate: '', endDate: '', status: 'Đang học tập', major: 'Công nghệ thông tin' },
        { id: 6, fullName: 'Phan Thị Phương', studentCode: '20210452P', email: 'Phuong.PT210452P@sis.hust.edu.vn', gender: 'Khác', course: 'Khóa 67', className: 'DH-BK-KTO1-K67', trainingType: 'Vừa làm vừa học', degree: 'Cử nhân', location: 'Đại học Bách khoa Hà Nội', startDate: '', endDate: '', status: 'Đang học tập', major: 'Kế toán' },
        { id: 7, fullName: 'Vũ Phương Linh', studentCode: '20210344P', email: 'Linh.VP210344P@sis.hust.edu.vn', gender: 'Khác', course: 'Khóa 66', className: 'DH-BK-QTKD2.2-K66', trainingType: 'Vừa làm vừa học', degree: 'Cử nhân', location: 'Đại học Bách khoa Hà Nội', startDate: '', endDate: '', status: 'Đang học tập', major: 'Quản trị kinh doanh' },
        { id: 8, fullName: 'Trịnh Thanh Tâm', studentCode: '20210377P', email: 'Tam.TT210377P@sis.hust.edu.vn', gender: 'Khác', course: 'Khóa 66', className: 'DH-BK-QTKD2.2-K66', trainingType: 'Vừa làm vừa học', degree: 'Cử nhân', location: 'Đại học Bách khoa Hà Nội', startDate: '', endDate: '', status: 'Đang học tập', major: 'Quản trị kinh doanh' },
        { id: 9, fullName: 'Nguyễn Khánh An', studentCode: '20210105P', email: 'An.NK210105P@sis.hust.edu.vn', gender: 'Khác', course: 'Khóa 66', className: 'DH-BK-CNTT1.1-K66', trainingType: 'Vừa làm vừa học', degree: 'Cử nhân', location: 'Đại học Bách khoa Hà Nội', startDate: '', endDate: '', status: 'Đang học tập', major: 'Công nghệ thông tin' },
        { id: 10, fullName: 'Nguyễn Linh Anh', studentCode: '20210108P', email: '', gender: 'Khác', course: 'Khóa 66', className: 'DH-BK-CNTT1.1-K66', trainingType: 'Vừa làm vừa học', degree: 'Cử nhân', location: 'Đại học Bách khoa Hà Nội', startDate: '', endDate: '', status: 'Đang học tập', major: 'Công nghệ thông tin' },
        { id: 11, fullName: 'Phan Thị Phương', studentCode: '20210452P', email: 'Phuong.PT210452P@sis.hust.edu.vn', gender: 'Khác', course: 'Khóa 67', className: 'DH-BK-KTO1-K67', trainingType: 'Vừa làm vừa học', degree: 'Cử nhân', location: 'Đại học Bách khoa Hà Nội', startDate: '', endDate: '', status: 'Đang học tập', major: 'Kế toán' },
        { id: 12, fullName: 'Vũ Phương Linh', studentCode: '20210344P', email: 'Linh.VP210344P@sis.hust.edu.vn', gender: 'Khác', course: 'Khóa 66', className: 'DH-BK-QTKD2.2-K66', trainingType: 'Vừa làm vừa học', degree: 'Cử nhân', location: 'Đại học Bách khoa Hà Nội', startDate: '', endDate: '', status: 'Đang học tập', major: 'Quản trị kinh doanh' },
        { id: 13, fullName: 'Trịnh Thanh Tâm', studentCode: '20210377P', email: 'Tam.TT210377P@sis.hust.edu.vn', gender: 'Khác', course: 'Khóa 66', className: 'DH-BK-QTKD2.2-K66', trainingType: 'Vừa làm vừa học', degree: 'Cử nhân', location: 'Đại học Bách khoa Hà Nội', startDate: '', endDate: '', status: 'Đang học tập', major: 'Quản trị kinh doanh' },
        { id: 14, fullName: 'Nguyễn Khánh An', studentCode: '20210105P', email: 'An.NK210105P@sis.hust.edu.vn', gender: 'Khác', course: 'Khóa 66', className: 'DH-BK-CNTT1.1-K66', trainingType: 'Vừa làm vừa học', degree: 'Cử nhân', location: 'Đại học Bách khoa Hà Nội', startDate: '', endDate: '', status: 'Đang học tập', major: 'Công nghệ thông tin' },
        { id: 15, fullName: 'Nguyễn Linh Anh', studentCode: '20210108P', email: '', gender: 'Khác', course: 'Khóa 66', className: 'DH-BK-CNTT1.1-K66', trainingType: 'Vừa làm vừa học', degree: 'Cử nhân', location: 'Đại học Bách khoa Hà Nội', startDate: '', endDate: '', status: 'Đang học tập', major: 'Công nghệ thông tin' },
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
  methods: {
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

/* 1. THANH PHẦN ĐẦU CỐ ĐỊNH PHÂN BỔ ĐỀU */
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

/* 2. CHẾ ĐỘ CUỘN NGANG RESPONSIVE KHI MÀN HÌNH NHỎ */
.table-responsive-wrapper {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.custom-table {
  min-width: 1100px !important;
}

.custom-table >>> th {
  background-color: #f8f9fa !important;
  font-weight: bold !important;
  color: #333 !important;
  white-space: nowrap !important;
}

/* CHỈNH SELECT TRẠNG THÁI HIỂN THỊ CHUẨN MẪU ĐỎ BÁCH KHOA */
.status-select-btn {
  width: 135px !important;
  max-width: 135px !important;
  margin: 0 auto !important;
}

.status-select-btn >>> .v-input__slot {
  background-color: #a2212b !important;
  border-radius: 16px !important;
  min-height: 28px !important;
  height: 28px !important;
  padding: 0 10px !important;
}

.status-select-btn >>> .v-select__selection {
  color: white !important;
  font-size: 12px !important;
  font-weight: bold !important;
}

.status-select-btn >>> .v-icon {
  color: white !important;
  font-size: 16px !important;
}

/* PHÂN TRANG POPUP LỊCH SỬ */
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

/* Thanh cuộn ngang Bách Khoa */
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