<template>
  <div class="student-page d-flex flex-column pa-2 pa-sm-4 bg-white">
    <!-- THANH TÌM KIẾM CỐ ĐỊNH PHÍA TRÊN -->
    <div class="top-filter-bar bg-white py-3 px-1">
      <div
        class="d-flex align-center justify-space-between flex-wrap gap-2 width-100"
      >
        <div class="text-subtitle-1 font-weight-bold mr-2 text-no-wrap">
          Danh sách sinh viên ({{ filteredStudents.length }})
        </div>

        <div
          class="d-flex align-center gap-2 flex-wrap flex-grow-1 justify-end"
        >
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
              { text: 'Đã tốt nghiệp', value: 'Đã tốt nghiệp' },
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
            <v-btn
              icon
              color="#a2212b"
              class="rounded-sm action-btn"
              @click="resetFilters"
            >
              <v-icon color="#a2212b" size="24">mdi-refresh</v-icon>
            </v-btn>

            <v-btn
              outlined
              color="#a2212b"
              class="min-w-0 px-3 rounded-sm action-btn"
              @click="openFilterDialog"
            >
              <v-icon size="24">mdi-filter-variant-plus</v-icon>
            </v-btn>

            <v-btn
              color="#a2212b"
              dark
              elevation="0"
              class="min-w-0 px-3 rounded-sm action-btn"
              @click="search"
            >
              <v-icon size="24">mdi-magnify</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- DIALOG LỌC NÂNG CAO -->
    <v-dialog v-model="filterDialog" max-width="500px">
      <v-card class="rounded-lg">
        <v-card-title
          class="pa-4 text-subtitle-1 font-weight-bold white--text d-flex justify-space-between align-center"
          style="background-color: #a2212b"
        >
          <span>Lọc nâng cao</span>
          <v-btn icon dark x-small @click="filterDialog = false"
            ><v-icon>mdi-close</v-icon></v-btn
          >
        </v-card-title>
        <v-card-text class="pa-5">
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-select
                v-model="tempDialogFilters.trainingType"
                :items="trainingTypeOptions"
                label="Hình thức đào tạo"
                dense
                outlined
                hide-details
                clearable
              ></v-select>
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="tempDialogFilters.location"
                :items="locationOptions"
                label="Địa điểm đào tạo"
                dense
                outlined
                hide-details
                clearable
              ></v-select>
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="tempDialogFilters.major"
                :items="majorOptions"
                label="Ngành"
                dense
                outlined
                hide-details
                clearable
              ></v-select>
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="tempDialogFilters.course"
                :items="courseOptions"
                label="Khóa"
                dense
                outlined
                hide-details
                clearable
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-4 border-top">
          <v-spacer></v-spacer>
          <v-btn outlined color="grey" @click="filterDialog = false">Hủy</v-btn>
          <v-btn
            color="#a2212b"
            dark
            elevation="0"
            @click="applyAdvancedFilters"
            >Áp dụng</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- BẢNG DỮ LIỆU DÙNG BASETABLE -->
    <BaseTable
      :headers="headers"
      :items="paginatedStudents"
      hide-default-footer
      disable-pagination
    >
      <template #[`item.stt`]="{ index }">
        <span class="font-weight-medium">{{
          (page - 1) * itemsPerPage + index + 1
        }}</span>
      </template>

      <!-- THÔNG TIN CHUNG -->
      <template #[`item.generalInfo`]="{ item }">
        <div class="py-2 info-block">
          <div
            class="font-weight-bold red--text text--darken-3 mb-1"
            style="font-size: 15px"
          >
            {{ item.fullName }}
          </div>
          <div class="text-body-2 text--secondary mb-1">
            MSSV:
            <span class="red--text text--darken-2 font-weight-bold">{{
              item.code
            }}</span>
          </div>
          <div class="text-body-2 text--secondary mb-1">
            Email:
            <span class="red--text text--darken-2 font-weight-bold">{{
              item.email
            }}</span>
          </div>
          <div class="text-body-2 text--secondary">
            CCCD:
            <span class="red--text text--darken-2 font-weight-bold">{{
              item.citizen
            }}</span>
          </div>
        </div>
      </template>

      <!-- TRẠNG THÁI -->
      <template #[`item.status`]="{ item }">
        <v-menu offset-y bottom left :z-index="999">
          <template #activator="{ on, attrs }">
            <div
              v-bind="attrs"
              class="status-badge px-3 py-1 font-weight-bold d-flex justify-space-between align-center"
              :class="getStatusClass(item.status)"
              style="cursor: pointer; min-width: 130px; height: 32px"
              v-on="on"
            >
              <span class="text-caption font-weight-bold">{{
                item.status
              }}</span>
              <v-icon size="18" color="white" class="ml-1"
                >mdi-menu-down</v-icon
              >
            </div>
          </template>
          <v-list dense class="py-1">
            <v-list-item @click="promptChangeStatus(item, 'Đang học')">
              <v-list-item-title
                class="red--text text--darken-1 font-weight-bold"
                >Đang học</v-list-item-title
              >
            </v-list-item>
            <v-list-item @click="promptChangeStatus(item, 'Bảo lưu')">
              <v-list-item-title
                class="orange--text text--darken-2 font-weight-bold"
                >Bảo lưu</v-list-item-title
              >
            </v-list-item>
            <v-list-item @click="promptChangeStatus(item, 'Đã tốt nghiệp')">
              <v-list-item-title
                class="grey--text text--darken-2 font-weight-bold"
                >Đã tốt nghiệp</v-list-item-title
              >
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

    <!-- DIALOG XÁC NHẬN ĐỔI TRẠNG THÁI -->
    <v-dialog v-model="confirmStatusDialog" max-width="450px" persistent>
      <v-card class="rounded-lg">
        <v-card-title
          class="pa-4 text-subtitle-1 font-weight-bold white--text d-flex justify-space-between align-center"
          style="background-color: #a2212b"
        >
          <span>Xác nhận</span>
          <v-btn icon dark x-small @click="confirmStatusDialog = false"
            ><v-icon>mdi-close</v-icon></v-btn
          >
        </v-card-title>
        <v-card-text class="pa-5 text-body-1 black--text">
          Bạn có chắc chắn muốn đổi trạng thái từ
          <span class="red--text font-weight-bold">{{
            pendingStatusChange.oldStatus
          }}</span>
          sang
          <span class="red--text font-weight-bold">{{
            pendingStatusChange.newStatus
          }}</span>
          không?
        </v-card-text>
        <v-card-actions class="pa-3 border-top justify-end">
          <v-btn
            outlined
            color="grey darken-1"
            class="text-capitalize px-4"
            @click="confirmStatusDialog = false"
            >Đóng</v-btn
          >
          <v-btn
            color="#a2212b"
            dark
            elevation="0"
            class="text-capitalize px-4"
            @click="confirmStatusUpdate"
            >Xác Nhận</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIALOG LỊCH SỬ DỮ LIỆU SINH VIÊN -->
    <v-dialog v-model="historyDialog" max-width="900px" scrollable>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title
          class="pa-3 text-subtitle-1 font-weight-bold white--text d-flex justify-space-between align-center"
          style="background-color: #a2212b"
        >
          <span>Lịch sử dữ liệu sinh viên</span>
          <v-btn icon small color="white" @click="historyDialog = false"
            ><v-icon>mdi-close</v-icon></v-btn
          >
        </v-card-title>

        <v-card-text class="pa-4 bg-white" style="max-height: 75vh">
          <div class="d-flex align-center gap-2 mb-4 flex-wrap">
            <v-select
              v-model="historyFilter.hocPhan"
              :items="hocPhanOptions"
              item-text="text"
              item-value="value"
              placeholder="Học phần"
              outlined
              dense
              hide-details
              clearable
              class="flex-grow-1"
            ></v-select>

            <v-select
              v-model="historyFilter.quyTrinh"
              :items="['Học lại', 'Thi lại', 'Bảo vệ lại', 'Danh mục hệ thống']"
              placeholder="Quy trình học tập"
              outlined
              dense
              hide-details
              clearable
              class="flex-grow-1"
            ></v-select>

            <v-btn icon color="#a2212b" @click="resetHistoryFilter">
              <v-icon>mdi-refresh</v-icon>
            </v-btn>

            <v-btn color="#a2212b" dark elevation="0" @click="searchHistory">
              <v-icon>mdi-magnify</v-icon>
            </v-btn>
          </div>

          <v-simple-table class="border rounded-sm">
            <thead>
              <tr class="grey lighten-4">
                <th class="font-weight-bold">STT</th>
                <th class="font-weight-bold">Tên học phần</th>
                <th class="font-weight-bold">Mã học phần</th>
                <th class="font-weight-bold">Quy trình học tập</th>
                <th class="font-weight-bold">Thời gian hoàn thành</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredHistoryData.length === 0">
                <td colspan="5" class="text-center py-4 grey--text">
                  Không có dữ liệu
                </td>
              </tr>
              <tr v-for="(item, idx) in filteredHistoryData" :key="idx">
                <td>{{ idx + 1 }}</td>
                <td>{{ item.tenHocPhan }}</td>
                <td>{{ item.maHocPhan }}</td>
                <td>{{ item.quyTrinh }}</td>
                <td>{{ item.thoiGianHoanThanh }}</td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-card-text>

        <v-card-actions class="justify-end pa-3 border-top">
          <v-btn
            outlined
            color="grey darken-2"
            class="px-4 text-capitalize"
            @click="historyDialog = false"
            >Đóng X</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- THANH PHÂN TRANG & EXCEL -->
    <div
      class="bottom-bar d-flex align-center justify-space-between flex-nowrap py-2 px-3 mt-auto bg-white border-top"
    >
      <v-btn
        color="#2e7d32"
        dark
        elevation="0"
        class="text-capitalize rounded px-4 font-weight-bold"
        @click="exportToExcel"
      >
        <v-icon left small>mdi-export</v-icon> XUẤT FILE EXCEL
      </v-btn>

      <div class="d-flex align-center gap-2 flex-nowrap">
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

        <v-btn
          color="#a2212b"
          dark
          small
          class="text-capitalize px-3 rounded-sm elevation-0"
          style="height: 36px"
          @click="goToPage"
          >Đi</v-btn
        >

        <div class="d-flex align-center gap-1">
          <v-btn icon small :disabled="page <= 1" @click="changePage(page - 1)"
            ><v-icon>mdi-chevron-left</v-icon></v-btn
          >
          <template v-for="p in visiblePages">
            <v-btn
              v-if="
                p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)
              "
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
            <span
              v-else-if="p === page - 2 || p === page + 2"
              :key="'dots-' + p"
              >...</span
            >
          </template>
          <v-btn
            icon
            small
            :disabled="page >= totalPages"
            @click="changePage(page + 1)"
            ><v-icon>mdi-chevron-right</v-icon></v-btn
          >
        </div>
      </div>
    </div>

    <!-- DIALOG CHI TIẾT SINH VIÊN -->
    <v-dialog v-model="detailDialog" max-width="850px" scrollable>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title
          class="pa-3 text-subtitle-1 font-weight-bold white--text d-flex justify-space-between align-center"
          style="background-color: #a2212b"
        >
          <span>Thông tin sinh viên chi tiết</span>
          <v-btn icon small color="white" @click="detailDialog = false"
            ><v-icon>mdi-close</v-icon></v-btn
          >
        </v-card-title>

        <v-card-text class="pt-4 black--text" style="max-height: 80vh">
          <div class="d-flex align-center mb-3">
            <div class="section-title-indicator mr-2"></div>
            <h3 class="text-subtitle-1 font-weight-bold" style="color: #000">
              Thông tin cá nhân
            </h3>
          </div>

          <v-row dense class="text-body-2 mb-4">
            <v-col cols="12" md="6" class="py-1"
              ><span class="grey--text text--darken-1">Họ tên:</span>
              <span class="font-weight-medium red--text text--darken-3 ml-1">{{
                selectedStudent.fullName
              }}</span></v-col
            >
            <v-col cols="12" md="6" class="py-1"
              ><span class="grey--text text--darken-1">Mã số sinh viên:</span>
              <span class="font-weight-bold red--text text--darken-3 ml-1">{{
                selectedStudent.code
              }}</span></v-col
            >
            <v-col cols="12" md="6" class="py-1"
              ><span class="grey--text text--darken-1">CCCD:</span>
              <span class="font-weight-medium red--text text--darken-3 ml-1">{{
                selectedStudent.citizen
              }}</span></v-col
            >
            <v-col cols="12" md="6" class="py-1"
              ><span class="grey--text text--darken-1">Email trường:</span>
              <span class="red--text text--darken-3 font-weight-medium ml-1">{{
                selectedStudent.email
              }}</span></v-col
            >
          </v-row>

          <v-divider class="my-3"></v-divider>

          <div class="d-flex align-center mb-3">
            <div class="section-title-indicator mr-2"></div>
            <h3 class="text-subtitle-1 font-weight-bold" style="color: #000">
              Thông tin đào tạo
            </h3>
          </div>

          <v-row dense class="text-body-2">
            <v-col cols="12" md="6" class="py-1"
              ><b>Khóa:</b> {{ selectedStudent.courseName }}</v-col
            >
            <v-col cols="12" md="6" class="py-1"
              ><b>Lớp:</b> {{ selectedStudent.className }}</v-col
            >
            <v-col cols="12" md="6" class="py-1"
              ><b>Ngành:</b> {{ selectedStudent.majorName }}</v-col
            >
            <v-col cols="12" md="6" class="py-1"
              ><b>Hình thức đào tạo:</b>
              {{ selectedStudent.trainingMethodName }}</v-col
            >
            <v-col cols="12" md="6" class="py-1"
              ><b>Địa điểm đào tạo:</b>
              {{ selectedStudent.trainingUnitName }}</v-col
            >
          </v-row>
        </v-card-text>

        <v-card-actions class="justify-end pb-3 pr-4 border-top">
          <v-btn
            outlined
            color="grey darken-2"
            class="px-4 text-capitalize"
            @click="detailDialog = false"
            >Đóng X</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- HỆ THỐNG TOAST HÀNG ĐỢI (Xếp chồng, có nút X và thanh tiến trình thời gian chạy) -->
    <div class="toast-queue-container">
      <transition-group name="toast-list" tag="div">
        <div
          v-for="itemToast in toastList"
          :key="itemToast.id"
          class="custom-toast-item d-flex flex-column mb-2"
          :style="{ backgroundColor: itemToast.color || '#4caf50' }"
        >
          <div
            class="toast-content d-flex align-center justify-space-between px-4 py-3"
          >
            <div class="d-flex align-center mr-3">
              <v-icon left color="white" size="20">
                {{
                  itemToast.color === '#C62828'
                    ? 'mdi-alert-circle-outline'
                    : 'mdi-check-circle-outline'
                }}
              </v-icon>
              <span class="toast-text font-weight-medium white--text">{{
                itemToast.message
              }}</span>
            </div>
            <v-btn
              icon
              dark
              x-small
              class="ma-0 close-toast-btn"
              aria-label="Đóng thông báo"
              @click="removeToast(itemToast.id)"
            >
              <v-icon size="16">mdi-close</v-icon>
            </v-btn>
          </div>
          <!-- Thanh thời gian chạy đếm ngược -->
          <div class="toast-progress-bar-container">
            <div
              class="toast-progress-bar"
              :style="{ width: itemToast.progress + '%' }"
            ></div>
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
import * as XLSX from 'xlsx'
import BaseTable from '~/components/Base/BaseTable.vue'

const parseStudentData = (apiData) => {
  return apiData.map((item) => {
    let statusVN = 'Đang học'
    if (
      item.status === 'ACTIVE' ||
      item.status === 'STUDYING' ||
      item.status === 'Đang học'
    )
      statusVN = 'Đang học'
    else if (item.status === 'Bảo lưu') statusVN = 'Bảo lưu'
    else if (item.status === 'Đã tốt nghiệp') statusVN = 'Đã tốt nghiệp'
    else if (item.status === 'INACTIVE') statusVN = 'Không hoạt động'

    return {
      id: item.id,
      code: item.code || '---',
      fullName: item.fullName || '---',
      email: item.email || '---',
      citizen: item.citizen || '---',
      status: statusVN,
      className: item.className || (item.class && item.class.name) || '---',
      courseName: item.courseName || (item.course && item.course.name) || '---',
      majorName: item.majorName || (item.major && item.major.name) || '---',
      trainingMethodName: item.trainingMethodName
        ? item.trainingMethodName.trim()
        : (item.trainingMethod && item.trainingMethod.name) || '---',
      trainingUnitName:
        item.trainingUnitName ||
        (item.trainingUnit && item.trainingUnit.name) ||
        '---',
    }
  })
}

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
      tempDialogFilters: {
        trainingType: null,
        location: null,
        major: null,
        course: null,
      },
      appliedFilters: {
        search: '',
        class: null,
        status: null,
        trainingType: null,
        location: null,
        major: null,
        course: null,
      },

      filterDialog: false,
      detailDialog: false,
      confirmStatusDialog: false,
      historyDialog: false,
      selectedStudent: {},
      pendingStatusChange: { student: null, oldStatus: '', newStatus: '' },

      // Quản lý hàng đợi Toast thay cho snackbar đơn
      toastList: [],
      toastDuration: 3000, // Thời gian hiển thị 3 giây

      historyFilter: { hocPhan: null, quyTrinh: null },
      historyDataList: [],
      filteredHistoryData: [],

      headers: [
        { text: 'STT', value: 'stt', sortable: false, width: '50px' },
        {
          text: 'Thông tin chung',
          value: 'generalInfo',
          sortable: false,
          width: '280px',
        },
        { text: 'Khóa', value: 'courseName', sortable: false, width: '90px' },
        { text: 'Lớp', value: 'className', sortable: false, width: '130px' },
        {
          text: 'Hình thức đào tạo',
          value: 'trainingMethodName',
          sortable: false,
          width: '150px',
        },
        {
          text: 'Địa điểm đào tạo',
          value: 'trainingUnitName',
          sortable: false,
          width: '180px',
        },
        {
          text: 'Trạng thái',
          value: 'status',
          sortable: false,
          width: '143px',
        },
        {
          text: 'Chức năng',
          value: 'actions',
          sortable: false,
          align: 'center',
          width: '80px',
        },
      ],

      students: [],
      classList: [],
      trainingMethodList: [],
      courseList: [],
      termList: [],
      userInfo: null,
    }
  },
  computed: {
    classOptions() {
      const fromApi = (this.classList || []).map((c) => c.name || c.code)
      const fromStudents = this.students.map((s) => s.className)
      return [
        ...new Set(
          [...fromApi, ...fromStudents].filter((v) => v && v !== '---')
        ),
      ].sort()
    },
    trainingTypeOptions() {
      const fromApi = (this.trainingMethodList || []).map((t) => t.name)
      const fromStudents = this.students.map((s) => s.trainingMethodName)
      return [
        ...new Set(
          [...fromApi, ...fromStudents].filter((v) => v && v !== '---')
        ),
      ].sort()
    },
    courseOptions() {
      const fromApi = (this.courseList || []).map((c) => c.name || c.code)
      const fromStudents = this.students.map((s) => s.courseName)
      return [
        ...new Set(
          [...fromApi, ...fromStudents].filter((v) => v && v !== '---')
        ),
      ].sort()
    },
    majorOptions() {
      return [
        ...new Set(
          this.students.map((s) => s.majorName).filter((v) => v !== '---')
        ),
      ].sort()
    },
    locationOptions() {
      return [
        ...new Set(
          this.students
            .map((s) => s.trainingUnitName)
            .filter((v) => v !== '---')
        ),
      ].sort()
    },

    hocPhanOptions() {
      return (this.termList || []).map((item) => ({
        text: `${item.code} - ${item.name}`,
        value: item.id || item.code,
      }))
    },

    filteredStudents() {
      return this.students.filter((s) => {
        const keyword = this.appliedFilters.search
          ? this.appliedFilters.search.toLowerCase()
          : ''
        const matchSearch =
          !keyword ||
          s.fullName.toLowerCase().includes(keyword) ||
          s.code.toLowerCase().includes(keyword)

        const matchClass =
          !this.appliedFilters.class ||
          s.className === this.appliedFilters.class
        const matchStatus =
          !this.appliedFilters.status || s.status === this.appliedFilters.status
        const matchType =
          !this.appliedFilters.trainingType ||
          s.trainingMethodName === this.appliedFilters.trainingType
        const matchLocation =
          !this.appliedFilters.location ||
          s.trainingUnitName === this.appliedFilters.location
        const matchMajor =
          !this.appliedFilters.major ||
          s.majorName === this.appliedFilters.major
        const matchCourse =
          !this.appliedFilters.course ||
          s.courseName === this.appliedFilters.course

        return (
          matchSearch &&
          matchClass &&
          matchStatus &&
          matchType &&
          matchLocation &&
          matchMajor &&
          matchCourse
        )
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
      for (let i = 1; i <= this.totalPages; i++) pages.push(i)
      return pages
    },
  },
  async mounted() {
    if (this.$store) {
      this.$store.commit('SET_PAGE_TITLE', 'Quản lý sinh viên')
    }
    await Promise.all([
      this.fetchUserInfo(),
      this.fetchPageRole(),
      this.fetchStudents(),
      this.fetchClasses(),
      this.fetchTrainingMethods(),
      this.fetchCourses(),
      this.fetchTerms(),
    ])
  },
  beforeDestroy() {
    // Dọn dẹp bộ đếm thời gian khi component bị hủy để tránh rò rỉ bộ nhớ
    this.toastList.forEach((toast) => clearInterval(toast.timer))
  },
  methods: {
    async fetchUserInfo() {
      try {
        const res = await this.$axios.$get('/api/user/info', {
          params: { channel: 'CMS' },
        })
        this.userInfo = res?.data || res
      } catch (err) {
        console.error('Lỗi tải thông tin user:', err)
      }
    },

    async fetchPageRole() {
      try {
        await this.$axios.$get('/api/auth/getPageRole', {
          params: { channel: 'CMS' },
        })
      } catch (err) {
        console.error('Lỗi kiểm tra quyền trang:', err)
      }
    },

    async fetchStudents() {
      try {
        const res = await this.$axios.$get('/api/student', {
          params: {
            pageIndex: 1,
            pageSize: 10000, // Lấy toàn bộ số lượng sinh viên về phía client
            search: this.appliedFilters.search || '',
            status: this.appliedFilters.status || '',
            channel: 'CMS',
          },
        })
        const rawData = res?.data?.data || res?.data?.items || res?.data || []
        this.students = parseStudentData(rawData)
      } catch (err) {
        console.error('Lỗi tải danh sách sinh viên:', err)
        this.students = []
        this.showToast(
          'Không thể tải danh sách sinh viên từ hệ thống!',
          '#C62828'
        )
      }
    },

    async fetchClasses() {
      try {
        const res = await this.$axios.$get('/api/classes/list', {
          params: {
            pageIndex: 1,
            pageSize: 100,
            status: 'ACTIVE',
            channel: 'CMS',
          },
        })
        this.classList = res?.data || res?.items || res || []
      } catch (err) {
        console.error('Lỗi tải danh sách lớp:', err)
      }
    },

    async fetchTrainingMethods() {
      try {
        const res = await this.$axios.$get('/api/trainingMethod/list', {
          params: { status: 'ACTIVE', channel: 'CMS' },
        })
        this.trainingMethodList = res?.data || res?.items || res || []
      } catch (err) {
        console.error('Lỗi tải hình thức đào tạo:', err)
      }
    },

    async fetchCourses() {
      try {
        const res = await this.$axios.$get('/api/course/all', {
          params: { status: 'ACTIVE', channel: 'CMS' },
        })
        this.courseList = res?.data || res?.items || res || []
      } catch (err) {
        console.error('Lỗi tải danh sách khóa học:', err)
      }
    },

    async fetchTerms() {
      try {
        const res = await this.$axios.$get('/api/term/list', {
          params: { status: 'ACTIVE', channel: 'CMS' },
        })
        this.termList = res?.data || res?.items || res || []
      } catch (err) {
        console.error('Lỗi tải danh sách học phần:', err)
      }
    },

    getStatusClass(status) {
      switch (status) {
        case 'Đang học':
          return 'status-studying'
        case 'Bảo lưu':
          return 'status-warning'
        case 'Đã tốt nghiệp':
          return 'status-dropout'
        default:
          return 'status-unknown'
      }
    },
    promptChangeStatus(item, newStatus) {
      if (item.status === newStatus) return
      this.pendingStatusChange = {
        student: item,
        oldStatus: item.status,
        newStatus,
      }
      this.confirmStatusDialog = true
    },
    confirmStatusUpdate() {
      const { student, newStatus } = this.pendingStatusChange
      if (student) {
        student.status = newStatus
        this.confirmStatusDialog = false
        this.showToast('Cập nhật trạng thái thành công', '#4caf50')
      }
    },
    search() {
      this.appliedFilters = {
        ...this.appliedFilters,
        ...this.filters,
        ...this.tempDialogFilters,
      }
      this.page = 1
      this.pageInput = 1
      this.fetchStudents()
    },
    openFilterDialog() {
      this.tempDialogFilters = {
        trainingType: this.appliedFilters.trainingType,
        location: this.appliedFilters.location,
        major: this.appliedFilters.major,
        course: this.appliedFilters.course,
      }
      this.filterDialog = true
    },
    applyAdvancedFilters() {
      this.search()
      this.filterDialog = false
    },
    resetFilters() {
      this.filters = { search: '', class: null, status: null }
      this.tempDialogFilters = {
        trainingType: null,
        location: null,
        major: null,
        course: null,
      }
      this.appliedFilters = {
        search: '',
        class: null,
        status: null,
        trainingType: null,
        location: null,
        major: null,
        course: null,
      }
      this.page = 1
      this.pageInput = 1
      this.fetchStudents()
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
      this.selectedStudent = { ...item }
      this.detailDialog = true
    },
    checkHistory(item) {
      this.selectedStudent = { ...item }
      this.historyDataList = (this.termList || []).map((m, idx) => ({
        tenHocPhan: m.name || `Học phần ${idx + 1}`,
        maHocPhan: m.code || `HP0${idx + 1}`,
        quyTrinh: idx % 2 === 0 ? 'Học lại' : 'Thi lại',
        thoiGianHoanThanh: `15/0${(idx % 9) + 1}/2026`,
      }))
      this.filteredHistoryData = []
      this.historyFilter = { hocPhan: null, quyTrinh: null }
      this.historyDialog = true
    },
    searchHistory() {
      this.filteredHistoryData = this.historyDataList.filter((item) => {
        const matchHP =
          !this.historyFilter.hocPhan ||
          item.maHocPhan === this.historyFilter.hocPhan ||
          item.tenHocPhan === this.historyFilter.hocPhan
        const matchQT =
          !this.historyFilter.quyTrinh ||
          item.quyTrinh === this.historyFilter.quyTrinh
        return matchHP && matchQT
      })
    },
    resetHistoryFilter() {
      this.historyFilter = { hocPhan: null, quyTrinh: null }
      this.filteredHistoryData = []
    },
    exportToExcel() {
      const dataToExport = this.filteredStudents.map((item, index) => ({
        STT: index + 1,
        Mã: item.code,
        Tên: item.fullName,
        Khóa: item.courseName,
        Lớp: item.className,
        Ngành: item.majorName,
        'Hình thức đào tạo': item.trainingMethodName,
        'Đơn vị': item.trainingUnitName,
        'Trạng thái': item.status,
      }))

      if (dataToExport.length === 0) {
        this.showToast('Không có dữ liệu để xuất file!', '#C62828')
        return
      }

      const worksheet = XLSX.utils.json_to_sheet(dataToExport)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách')
      XLSX.writeFile(workbook, 'danh_sach.xlsx')
      this.showToast('Xuất file Excel thành công!', '#4caf50')
    },

    // Hàm gọi hiển thị Toast xếp chồng kèm progress bar chạy thời gian
    showToast(message, color = '#4caf50') {
      const id = Date.now() + Math.random()
      const newToast = {
        id,
        message,
        color,
        progress: 100,
        timer: null,
      }

      // Đẩy thông báo mới vào (thông báo mới nằm trên, đẩy thông báo cũ xuống dưới)
      this.toastList.push(newToast)

      const stepTime = 30
      const decrement = (stepTime / this.toastDuration) * 100

      newToast.timer = setInterval(() => {
        const target = this.toastList.find((t) => t.id === id)
        if (target) {
          target.progress -= decrement
          if (target.progress <= 0) {
            clearInterval(target.timer)
            this.removeToast(id)
          }
        }
      }, stepTime)
    },

    removeToast(id) {
      const index = this.toastList.findIndex((t) => t.id === id)
      if (index !== -1) {
        clearInterval(this.toastList[index].timer)
        this.toastList.splice(index, 1)
      }
    },
  },
}
</script>

<style scoped>
.gap-1 {
  gap: 4px;
}
.gap-2 {
  gap: 8px;
}

.top-filter-bar {
  flex-shrink: 0;
}
.filter-item {
  flex-grow: 1;
  flex-shrink: 1;
}
.search-input {
  min-width: 150px;
  max-width: 200px;
}
.select-md {
  min-width: 140px;
  max-width: 180px;
}
.action-btn {
  height: 40px !important;
  min-height: 40px !important;
}

.custom-outlined-input >>> .v-input__control {
  min-height: 38px !important;
}
.custom-outlined-input >>> fieldset {
  border-color: #ccc !important;
  border-radius: 4px !important;
}

.section-title-indicator {
  width: 4px;
  height: 18px;
  background-color: #a2212b;
  border-radius: 2px;
}

.status-badge {
  border-radius: 16px !important;
  display: inline-flex;
  align-items: center;
}
.status-studying {
  background-color: #a2212b !important;
  color: #ffffff !important;
}
.status-warning {
  background-color: #ff9800 !important;
  color: #ffffff !important;
}
.status-dropout {
  background-color: #616161 !important;
  color: #ffffff !important;
}
.status-unknown {
  background-color: #9e9e9e !important;
  color: #ffffff !important;
}

.border-top {
  border-top: 1px solid #e0e0e0;
}
.bottom-bar {
  flex-shrink: 0;
  background-color: #ffffff;
  overflow-x: auto;
}
.pagination-input >>> .v-input__control {
  min-height: 36px !important;
}

/* Styles cho hệ thống Toast hàng đợi (xếp chồng, có progress bar và nút X) */
.toast-queue-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 380px;
  width: 100%;
  pointer-events: none;
}

.custom-toast-item {
  pointer-events: auto;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: toastSlideIn 0.3s ease-out forwards;
}

.toast-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toast-text {
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
}

.close-toast-btn {
  opacity: 0.8;
  transition: opacity 0.2s;
}

.close-toast-btn:hover {
  opacity: 1;
}

.toast-progress-bar-container {
  width: 100%;
  height: 3px;
  background-color: rgba(255, 255, 255, 0.2);
}

.toast-progress-bar {
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  transition: width 0.03s linear;
}

.toast-list-enter-active,
.toast-list-leave-active {
  transition: all 0.3s ease;
}

.toast-list-enter {
  opacity: 0;
  transform: translateY(-20px);
}

.toast-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

@keyframes toastSlideIn {
  from {
    opacity: 0;
    transform: translateY(-15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 599px) {
  .student-page {
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }
}
@media (min-width: 600px) {
  .student-page {
    height: calc(100vh - 64px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}
</style>
