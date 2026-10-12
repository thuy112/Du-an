<template>
  <v-container fluid class="pa-0 bg-white fill-height align-stretch flex-column overflow-hidden" :class="{ 'is-mobile-device': isMobileDevice }">
    <!-- Layout tổng thể Flexbox cố định full chiều cao viewport làm việc -->
    <div class="main-page-layout">
      <!-- 1. THANH BỘ LỌC TÌM KIẾM (CỐ ĐỊNH PHÍA TRÊN) -->
      <div class="sticky-filter-bar filter-bar-container px-4 py-3 bg-white shrink-0">
        <div class="d-flex align-md-center justify-space-between flex-wrap gap-3 flex-column flex-md-row">
          <div class="filter-title text-body-1 font-weight-medium text-gray-900 pb-1 pb-md-0">
            Danh sách lớp học lại <span class="count-number">({{ totalItems }})</span>
          </div>

          <div class="d-flex align-center filter-controls flex-wrap">
            <v-text-field
              v-model="filters.className"
              placeholder="Tên lớp học lại"
              outlined
              dense
              clearable
              hide-details
              class="custom-filter-input input-text-name flex-grow-1 flex-md-grow-0"
              @keyup.enter="handleSearch"
              @click:clear="handleSearch"
            ></v-text-field>

            <v-select
              v-model="filters.retakeSession"
              :items="retakeSessionOptions"
              item-text="text"
              item-value="value"
              placeholder="Đợt học lại"
              outlined
              dense
              clearable
              hide-details
              class="custom-filter-input input-select-session flex-grow-1 flex-md-grow-0"
              @change="handleSearch"
            ></v-select>

            <v-select
              v-model="filters.course"
              :items="courseOptions"
              placeholder="Học phần"
              outlined
              dense
              clearable
              hide-details
              class="custom-filter-input input-select-course flex-grow-1 flex-md-grow-0"
              @change="handleSearch"
            ></v-select>

            <v-select
              v-model="filters.coefficient"
              :items="coefficientOptions"
              placeholder="Hệ số"
              outlined
              dense
              clearable
              hide-details
              class="custom-filter-input input-select-coeff flex-grow-1 flex-md-grow-0"
              @change="handleSearch"
            ></v-select>

            <div class="d-flex align-center filter-action-buttons gap-2 mt-2 mt-md-0 w-100 w-md-auto">
              <RetakeCourseRetakeSessionFilter
                ref="retakeSessionFilterModal"
                @apply-filter="handleAdvancedFilter"
              />

              <v-btn icon small class="btn-icon-red ma-0 border-btn" aria-label="Làm mới" @click="resetFilters">
                <v-icon size="20" color="#9e1c24">mdi-refresh</v-icon>
              </v-btn>

              <v-btn
                color="#a2212b"
                dark
                elevation="0"
                class="btn-search-square ma-0"
                aria-label="Tìm kiếm"
                @click="handleSearch"
              >
                <v-icon size="20">mdi-magnify</v-icon>
              </v-btn>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. KHU VỰC BẢNG DỮ LIỆU (CÓ THANH CUỘN LƯỚT XEM DANH SÁCH) -->
      <div class="scrollable-table-area flex-grow-1 overflow-y-auto">
        <BaseTable
          :headers="headers"
          :items="appliedData"
          :loading="loading"
          hide-default-footer
          fixed-header
          :mobile-breakpoint="isMobileDevice ? 960 : 0"
          class="custom-table border-0"
        >
          <!-- GIAO DIỆN NO DATA -->
          <template v-slot:no-data>
            <div class="py-10 text-center grey--text">Không có dữ liệu</div>
          </template>

          <!-- STT -->
          <template v-slot:[`item.stt`]="{ index }">
            {{ (page - 1) * itemsPerPage + index + 1 }}
          </template>

          <!-- Mã lớp -->
          <template v-slot:[`item.maLop`]="{ item }">
            <span class="font-weight-medium" :class="isMobileDevice ? 'text-red-bk' : 'text-gray-700'">{{ item.maLop }}</span>
          </template>

          <!-- Loại lớp -->
          <template v-slot:[`item.loaiLop`]="{ item }">
            <v-chip
              small
              dark
              :color="getLoaiLopColor(item.loaiLop)"
              class="font-weight-medium"
            >
              {{ item.loaiLop }}
            </v-chip>
          </template>

          <!-- Thanh toán giảng dạy: Để trống không ghi -->
          <template v-slot:[`item.thanhToan`]>
            <span></span>
          </template>

          <!-- Học phần -->
          <template v-slot:[`item.hocPhan`]="{ item }">
            <div class="py-1" :class="isMobileDevice ? 'text-right' : 'text-left'">
              <div class="font-weight-bold text-caption text-gray-800">{{ item.hocPhanCode }}</div>
              <div class="text-caption text-gray-600 line-clamp-2">{{ item.hocPhanName }}</div>
            </div>
          </template>

          <!-- Số lượng sinh viên -->
          <template v-slot:[`item.soLuongSv`]="{ item }">
            {{ item.minSv }}/{{ item.maxSv }}
          </template>

          <!-- Thời gian -->
          <template v-slot:[`item.thoiGian`]="{ item }">
            <div class="text-caption whitespace-nowrap">
              <div>{{ item.tuNgay }}</div>
              <div class="text-gray-400">{{ item.denNgay }}</div>
            </div>
          </template>

          <!-- Trạng thái duyệt danh sách -->
          <template v-slot:[`item.trangThaiDuyet`]="{ item }">
            <div :class="isMobileDevice ? 'd-flex justify-end' : ''">
              <v-select
                v-model="item.trangThaiDuyet"
                :items="approvalOptions"
                item-text="text"
                item-value="value"
                dense
                outlined
                hide-details
                menu-props="auto"
                append-icon="mdi-menu-down"
                :disabled="updatingClassIds.includes(item.id)"
                :class="[
                  'status-pill-select',
                  item.trangThaiDuyet === 'Đã duyệt danh sách' ? 'pill-green-solid' : 'pill-orange-solid'
                ]"
                @change="onApprovalStatusChange(item, $event)"
              ></v-select>
            </div>
          </template>

          <!-- Trạng thái bảng điểm -->
          <template v-slot:[`item.trangThaiBangDiem`]="{ item }">
            <div :class="isMobileDevice ? 'd-flex justify-end' : ''">
              <v-select
                v-model="item.examStatus"
                :items="gradeOptions"
                item-text="text"
                item-value="value"
                dense
                outlined
                hide-details
                menu-props="auto"
                append-icon="mdi-menu-down"
                :disabled="updatingClassIds.includes(item.id)"
                :class="[
                  'status-pill-select',
                  getGradePillClass(item.examStatus)
                ]"
                @change="onGradeStatusChange(item, $event)"
              ></v-select>
            </div>
          </template>

          <!-- Chức năng -->
          <template v-slot:[`item.chucNang`]="{ item }">
            <div :class="isMobileDevice ? 'd-flex justify-end border-none' : ''">
              <v-menu offset-y left transition="scale-transition">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn icon small v-bind="attrs" class="action-dots-btn" v-on="on">
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>

                <v-list dense class="py-1 popup-action-menu">
                  <v-list-item v-if="getPermissions(item).showDetail" @click="handleViewDetail(item)">
                    <v-list-item-icon class="mr-2 my-auto">
                      <v-icon size="20" small color="#1890ff">mdi-eye</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title class="text-caption">Chi tiết</v-list-item-title>
                  </v-list-item>

                  <v-list-item v-if="canExportApprovedClass(item)" @click="handleExportDSSV(item)">
                    <v-list-item-icon class="mr-2 my-auto">
                      <v-icon size="20" small color="#52c41a">mdi-export</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title class="text-caption">Xuất danh sách SV</v-list-item-title>
                  </v-list-item>

                  <v-list-item v-if="canExportApprovedClass(item)" @click="navigateToGradeSheet(item)">
                    <v-list-item-icon class="mr-2 my-auto">
                      <v-icon size="20" small color="#722ed1">mdi-table</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title class="text-caption">Bảng điểm</v-list-item-title>
                  </v-list-item>

                  <v-list-item v-if="getPermissions(item).showAssignTeacher" @click="handleAssignTeacher(item)">
                    <v-list-item-icon class="mr-2 my-auto">
                      <v-icon size="20" small color="#13c2c2">mdi-account-tie-hat-outline</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title class="text-caption">Gán giảng viên</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </template>
        </BaseTable>
      </div>

      <!-- 3. THANH FOOTER PHÂN TRANG (CỐ ĐỊNH PHÍA DƯỚI) -->
      <div class="custom-footer-bar pa-3 bg-white d-flex align-center justify-space-between flex-wrap gap-3 shrink-0">
        <div class="d-flex align-center w-mobile-100">
          <v-btn
            color="#42b858"
            dark
            elevation="0"
            class="btn-export-green text-none font-weight-bold w-mobile-100"
            @click="exportSummaryToExcel"
          >
            <v-icon left size="18">mdi-export</v-icon>
            XUẤT BẢNG ĐIỂM TỔNG HỢP
          </v-btn>
        </div>

        <div class="d-flex align-center flex-wrap justify-end gap-2 w-mobile-100">
          <div class="d-flex align-center gap-2">
            <v-select
              v-model="itemsPerPage"
              :items="[10, 20, 50, 100]"
              label="Bản ghi"
              outlined
              dense
              hide-details
              class="custom-outlined-input record-select"
              @change="onChangeItemsPerPage"
            ></v-select>

            <v-text-field
              v-model.number="pageInput"
              label="Trang"
              outlined
              dense
              hide-details
              class="custom-outlined-input page-input"
              @keyup.enter="goToPage"
            ></v-text-field>

            <v-btn
              color="#a2212b"
              dark
              elevation="0"
              class="btn-go-red text-none"
              @click="goToPage"
            >
              Đi
            </v-btn>
          </div>

          <div class="d-flex align-center gap-1 mt-2 mt-sm-0">
            <v-btn
              outlined
              small
              class="btn-nav-arrow"
              :disabled="page <= 1"
              @click="changePage(page - 1)"
            >
              <v-icon small color="#666">mdi-chevron-left</v-icon>
            </v-btn>

            <v-btn
              v-for="p in totalPages"
              :key="p"
              small
              elevation="2"
              :color="page === p ? '#a2212b' : 'white'"
              :class="page === p ? 'white--text font-weight-bold btn-page-number active' : 'black--text btn-page-number'"
              @click="changePage(p)"
            >
              {{ p }}
            </v-btn>

            <v-btn
              outlined
              small
              class="btn-nav-arrow"
              :disabled="page >= totalPages"
              @click="changePage(page + 1)"
            >
              <v-icon small color="#666">mdi-chevron-right</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- DIALOGS VÀ TOAST -->
    <div class="toast-queue-container">
      <transition-group name="toast-list" tag="div">
        <div
          v-for="toast in toastList"
          :key="toast.id"
          class="custom-toast-item d-flex flex-column mb-2"
          :class="toast.color === '#C62828' ? 'toast-error' : 'toast-success'"
        >
          <div class="toast-content d-flex align-center justify-space-between px-4 py-3">
            <div class="d-flex align-center mr-3">
              <v-icon left color="white" size="20">
                {{ toast.color === '#C62828' ? 'mdi-alert-circle-outline' : 'mdi-check-circle-outline' }}
              </v-icon>
              <span class="toast-text font-weight-medium white--text">{{ toast.message }}</span>
            </div>
            <v-btn
              icon
              dark
              x-small
              class="ma-0 close-toast-btn"
              aria-label="Đóng thông báo"
              @click="removeToast(toast.id)"
            >
              <v-icon size="16">mdi-close</v-icon>
            </v-btn>
          </div>
          <div class="toast-progress-bar-container">
            <div class="toast-progress-bar" :style="{ width: toast.progress + '%' }"></div>
          </div>
        </div>
      </transition-group>
    </div>

    <RetakeCourseDetailModal
      v-model="detailModal.show"
      :detail-data="detailModal.data"
      :loading="detailModal.loading"
      :error="detailModal.error"
    />
    <RetakeCourseAssignTeacherModal
      v-model="assignTeacherModal.show"
      :class-item="assignTeacherModal.item"
      :saving="assignTeacherModal.saving"
      @assigned="saveTeacherAssignment"
    />
  </v-container>
</template>

<script>
import * as XLSX from 'xlsx'
import BaseTable from '~/components/Base/BaseTable.vue'
import AssignTeacherModal from '~/components/RetakeCourse/AssignTeacherModal.vue'
import RetakeCourseDetailModal from '~/components/RetakeCourse/RetakeCourseDetailModal.vue'
import RetakeSessionFilterModal from '~/components/RetakeCourse/RetakeSessionFilterModal.vue'

export default {
  name: 'DanhSachLopHocLai',
  components: {
    BaseTable,
    RetakeCourseAssignTeacherModal: AssignTeacherModal,
    RetakeCourseDetailModal,
    RetakeCourseRetakeSessionFilter: RetakeSessionFilterModal,
  },
  data() {
    return {
      isMobileDevice: false,
      loading: false,
      page: 1,
      pageInput: 1,
      itemsPerPage: 50,
      totalItems: 0,

      toastList: [],
      toastDuration: 3000,
      updatingClassIds: [],
      userInfo: null,
      pageRoles: null,

      detailModal: {
        show: false,
        data: {},
        loading: false,
        error: '',
      },
      assignTeacherModal: {
        show: false,
        item: null,
        saving: false,
      },
      approvalOptions: [
        { text: 'Chưa duyệt danh sách', value: 'Chưa duyệt danh sách' },
        { text: 'Đã duyệt danh sách', value: 'Đã duyệt danh sách' },
      ],
      gradeOptions: [
        { text: 'Chưa có điểm', value: 'Chưa có điểm' },
        { text: 'Chờ duyệt', value: 'Chờ duyệt' },
        { text: 'Đã có điểm', value: 'Đã có điểm' },
      ],

      filters: {
        className: '',
        retakeSession: null,
        course: null,
        coefficient: null,
      },

      retakeSessionOptions: [],
      courseOptions: [],
      coefficientOptions: [],
      allClassesList: [],

      headers: [
        { text: 'STT', value: 'stt', width: '45px', align: 'center', sortable: false },
        { text: 'Mã lớp', value: 'code', width: '130px', sortable: false },
        { text: 'Loại lớp', value: 'loaiLop', width: '160px', sortable: false },
        { text: 'Thu học phí SV', value: 'classCoefficient', width: '80px', align: 'center', sortable: false },
        { text: 'Thanh toán giảng dạy', value: 'thanhToan', width: '80px', align: 'center', sortable: false },
        { text: 'Đợt học lại', value: 'dotHocLai', width: '90px', align: 'center', sortable: false },
        { text: 'Học phần', value: 'hocPhan', width: '170px', sortable: false },
        { text: 'Số lượng sinh viên', value: 'quantityText', width: '110px', align: 'center', sortable: false },
        { text: 'Số lượng SV đăng ký', value: 'svDangKy', width: '100px', align: 'center', sortable: false },
        { text: 'Thời gian', value: 'thoiGian', width: '130px', align: 'center', sortable: false },
        { text: 'Trạng thái duyệt danh sách', value: 'trangThaiDuyet', width: '210px', align: 'center', sortable: false },
        { text: 'Trạng thái bảng điểm', value: 'examStatus', width: '190px', align: 'center', sortable: false },
        { text: 'Chức năng', value: 'chucNang', width: '70px', align: 'center', sortable: false },
      ],

      allRawData: [],
      appliedData: [],
    }
  },

  computed: {
    totalPages() {
      return Math.ceil(this.totalItems / this.itemsPerPage) || 1
    },
  },

  async mounted() {
    if (typeof navigator !== 'undefined') {
      this.isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }

    // Gọi đúng toàn bộ các endpoint không bị trùng lặp
    await Promise.all([
      this.fetchUserInfo(),
      this.fetchPageRole(),
      this.getRetakeSessions(),
      this.getCoefficients(),
      this.getCourseOptions(),
      this.getAllClasses(),
      this.fetchData(),
    ])
  },

  beforeDestroy() {
    this.toastList.forEach((toast) => clearInterval(toast.timer))
  },

  methods: {
    canExportApprovedClass(item) {
      return (
        item.hasBeenApproved ||
        item.approvalStatus === 'ACTIVE' ||
        item.trangThaiDuyet === 'Đã duyệt danh sách'
      )
    },

    onChangeItemsPerPage() {
      this.page = 1
      this.pageInput = 1
      this.updatePaginationSlice()
    },

    changePage(newPage) {
      if (newPage >= 1 && newPage <= this.totalPages) {
        this.page = newPage
        this.pageInput = newPage
        this.updatePaginationSlice()
      }
    },

    goToPage() {
      if (this.pageInput >= 1 && this.pageInput <= this.totalPages) {
        this.page = this.pageInput
        this.updatePaginationSlice()
      } else {
        this.pageInput = this.page
      }
    },

    updatePaginationSlice() {
      const start = (this.page - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      this.appliedData = this.allRawData.slice(start, end)
    },

    getPermissions(item) {
      const isApproved = item.trangThaiDuyet === 'Đã duyệt danh sách'
      const hasTeacher = item.teacherId !== null && item.teacherId !== undefined
      return {
        showDetail: true,
        showExportExcel: isApproved,
        showGrades: isApproved || hasTeacher,
        showAssignTeacher: !hasTeacher,
      }
    },

    getLoaiLopColor(loaiLop) {
      if (!loaiLop || typeof loaiLop !== 'string') return '#1890ff'
      if (loaiLop.includes('Lớp ghép')) return '#8c8c8c'
      if (loaiLop.includes('Lớp mở')) return '#52c41a'
      if (loaiLop.includes('Đồ án môn học')) return '#f5222d'
      return '#1890ff'
    },

    getGradePillClass(status) {
      if (status === 'Chờ duyệt') return 'pill-lime-grade'
      if (status === 'Đã có điểm') return 'pill-blue-grade'
      return 'pill-orange-solid'
    },

    onApprovalStatusChange(item, newVal) {
      item.trangThaiDuyet = newVal
      item.approvalStatus = newVal
    },

    onGradeStatusChange(item, newVal) {
      item.examStatus = newVal
    },

    async fetchUserInfo() {
      try {
        const res = await this.$axios.$get('/api/user/info', { params: { channel: 'CMS' } })
        this.userInfo = res?.data || res || null
      } catch (err) {
        console.error('Lỗi khi tải thông tin user:', err)
      }
    },

    async fetchPageRole() {
      try {
        const res = await this.$axios.$get('/api/auth/getPageRole', { params: { channel: 'CMS' } })
        this.pageRoles = res?.data || res || null
      } catch (err) {
        console.error('Lỗi khi tải phân quyền trang:', err)
      }
    },

    async getRetakeSessions() {
      try {
        const res = await this.$axios.$get('/api/retakeSession/list', { params: { channel: 'CMS' } })
        const sessions = Array.isArray(res?.data) ? res.data : res?.data?.items || res || []
        if (sessions.length) {
          this.retakeSessionOptions = sessions.map((s) => ({
            text: s.maDot || s.code || s.name || String(s.id),
            value: s.id,
          }))
        }
      } catch (err) {
        console.error('Lỗi khi tải đợt học lại:', err)
      }
    },

    async getCoefficients() {
      try {
        const res = await this.$axios.$get('/api/coefficient', {
          params: { pageIndex: 1, pageSize: 100, channel: 'CMS' }
        })
        const coefficients = Array.isArray(res?.data) ? res.data : res?.data?.items || res || []
        if (coefficients.length) {
          this.coefficientOptions = coefficients.map((c) => {
            const value = typeof c === 'object'
              ? c.thuHocPhiSv ?? c.coefficient ?? c.value
              : c
            return String(value)
          }).filter(Boolean)
        }
      } catch (err) {
        console.error('Lỗi khi tải hệ số:', err)
      }
    },

    async getCourseOptions() {
      try {
        const res = await this.$axios.$get('/api/term/list', {
          params: { status: 'ACTIVE', channel: 'CMS' }
        })
        const items = res?.data || res || []
        if (items.length) {
          this.courseOptions = items.map((t) => ({
            text: `${t.code} - ${t.name}`,
            value: t.id,
          }))
        }
      } catch (err) {
        console.error('Lỗi tải danh mục học phần:', err)
      }
    },

    async getAllClasses() {
      try {
        const res = await this.$axios.$get('/api/classes/all', { params: { channel: 'CMS' } })
        this.allClassesList = res?.data || res || []
      } catch (err) {
        console.error('Lỗi tải danh sách lớp học:', err)
      }
    },

    async fetchData() {
      this.loading = true
      try {
        const params = {
          pageIndex: 1,
          pageSize: 50,
          search: this.filters.className || '',
          examId: this.filters.retakeSession,
          termId: this.filters.course,
          classCoefficient: this.filters.coefficient,
          channel: 'CMS',
        }
        const res = await this.$axios.$get('/api/retakeCourse', { params })
        const responseWrapper = res?.data || {}
        const rawItems = Array.isArray(responseWrapper.data)
          ? responseWrapper.data
          : (Array.isArray(responseWrapper) ? responseWrapper : (Array.isArray(res) ? res : []))

        this.allRawData = rawItems.map((item, index) => {
          const termObj = item.term || {}
          const examObj = item.exam || {}
          
          const classCode = item.examClass || item.code || ''

          let loaiLopName = 'Lớp mở'
          if (item.retakeCourseStatus === 'COMBINE_CLASS') {
            loaiLopName = 'Lớp ghép (Đại cương)'
          } else if (item.retakeCourseStatus === 'PROJECT_BASED_CLASS' || item.retakeCourseStatus === 'PROJECT' || classCode.startsWith('D_') || classCode.startsWith('M_')) {
            loaiLopName = 'Đồ án môn học'
          }

          const sessionStatus = (item.examSessionStatus || '').toUpperCase()
          const rawApproval = (item.approvalStatus || item.status || '').toUpperCase()
          const isApproved = 
            rawApproval === 'ACTIVE' || 
            rawApproval === 'APPROVED' || 
            rawApproval === 'ĐÃ DUYỆT DANH SÁCH' || 
            sessionStatus === 'FINALIZED' ||
            item.hasBeenApproved === true

          const trangThaiDuyetText = isApproved ? 'Đã duyệt danh sách' : 'Chưa duyệt danh sách'

          let mappedExamStatus = 'Chưa có điểm'
          const rawExamStatus = (item.examStatus || '').toUpperCase()
          const rawScoreStatus = (item.scoreStatus || '').toUpperCase()

          if (rawExamStatus === 'ANNOUNCED' || rawScoreStatus === 'SCOREBOARD_AVAILABLE') {
            mappedExamStatus = 'Đã có điểm'
          } else if (rawExamStatus === 'UNAPPROVED' || rawExamStatus === 'PENDING' || rawExamStatus === 'CHỜ DUYỆT') {
            mappedExamStatus = 'Chờ duyệt'
          } else {
            mappedExamStatus = 'Chưa có điểm'
          }

          return {
            id: item.id || (index + 1),
            stt: index + 1,
            code: classCode,
            maLop: classCode,
            loaiLop: loaiLopName,
            classCoefficient: item.classCoefficient || 1.5,
            thanhToan: '',
            dotHocLai: examObj.code || '20252-A-1',
            hocPhanCode: termObj.code || '',
            hocPhanName: termObj.name || '---',
            hocPhan: termObj.code ? `${termObj.code} - ${termObj.name}` : (termObj.name || '---'),
            quantityText: `${item.quantityCurrent || 0}/${item.quantitySeat || 20}`,
            svDangKy: item.quantityCurrent || 0,
            maxSv: item.quantitySeat || 20,
            tuNgay: item.fromTime ? item.fromTime.slice(0, 10) : '01/09/2026',
            denNgay: item.toTime ? item.toTime.slice(0, 10) : '31/12/2026',
            thoiGian: item.fromTime && item.toTime ? `${item.fromTime.slice(0, 10)} đến ${item.toTime.slice(0, 10)}` : '01/09/2026 - 31/12/2026',
            trangThaiDuyet: trangThaiDuyetText,
            examStatus: mappedExamStatus,
            original: item
          }
        })

        this.totalItems = this.allRawData.length
        this.page = 1
        this.pageInput = 1
        this.updatePaginationSlice()
      } catch (err) {
        console.error('Không thể lấy dữ liệu từ server thực tế:', err)
        this.allRawData = []
        this.appliedData = []
        this.totalItems = 0
      } finally {
        this.loading = false
      }
    },

    handleSearch() {
      this.page = 1
      this.pageInput = 1
      this.fetchData()
    },

    resetFilters() {
      this.filters = {
        className: '',
        retakeSession: null,
        course: null,
        coefficient: null,
      }
      this.page = 1
      this.pageInput = 1
      this.fetchData()
    },

    exportSummaryToExcel() {
      const classes = this.allRawData
      if (!classes.length) return

      try {
        const excelData = classes.map((item, index) => ({
          STT: index + 1,
          'Mã lớp': item.maLop,
          'Loại lớp': item.loaiLop,
          'Thu học phí SV': item.classCoefficient,
          'Thanh toán giảng dạy': item.thanhToan,
          'Đợt học lại': item.dotHocLai,
          'Trạng thái duyệt': item.trangThaiDuyet,
        }))
        const worksheet = XLSX.utils.json_to_sheet(excelData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách lớp')
        XLSX.writeFile(workbook, 'danh_sach_lop_hoc_lai.xlsx')
      } catch (err) {
        console.error('Lỗi xuất file Excel:', err)
      }
    }
  },
}
</script>

<style scoped>
.main-page-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
}

.scrollable-table-area {
  flex: 1 1 auto;
  overflow-y: auto;
  min-height: 0;
}

.filter-bar-container {
  border-bottom: 1px solid #e5e7eb;
}

.filter-title {
  font-size: 15px !important;
  color: #1f2937;
}

.count-number {
  color: #9e1c24;
  font-weight: 600;
}

.custom-filter-input >>> .v-input__slot {
  min-height: 38px !important;
  max-height: 38px !important;
  border-color: #a3a3a3 !important;
  border-radius: 4px !important;
  background-color: #ffffff !important;
  padding: 0 12px !important;
  box-shadow: none !important;
}

.custom-filter-input >>> fieldset {
  border-color: #a3a3a3 !important;
  border-width: 1px !important;
}

.custom-filter-input >>> .v-text-field__slot input,
.custom-filter-input >>> .v-select__selection {
  font-size: 14px !important;
  color: #333333 !important;
}

.custom-filter-input >>> .v-text-field__slot input::placeholder {
  color: #6b7280 !important;
  opacity: 1;
}

.custom-filter-input >>> .v-input__append-inner {
  margin-top: 7px !important;
}

.custom-filter-input >>> .v-icon {
  color: #6b7280 !important;
  font-size: 20px !important;
}

.filter-controls {
  gap: 8px;
}

.custom-table {
  display: flex;
  flex-direction: column;
}

.custom-table >>> th {
  position: sticky !important;
  top: 0 !important;
  z-index: 5 !important;
  background-color: #f0f0f0 !important;
  color: #000000 !important;
  font-weight: 700 !important;
  font-size: 13px !important;
  border-bottom: 1px solid #d9d9d9 !important;
  box-shadow: inset 0 -1px 0 #d9d9d9;
}

.custom-footer-bar {
  background-color: #ffffff;
  border-top: 1px solid #e5e7eb;
}

.btn-export-green {
  background-color: #42b858 !important;
  color: #ffffff !important;
  border-radius: 4px !important;
  height: 36px !important;
  font-size: 13px !important;
  letter-spacing: 0.2px;
}

.custom-outlined-input >>> .v-input__slot {
  min-height: 36px !important;
  border-color: #757575 !important;
  border-radius: 4px !important;
}

.custom-outlined-input >>> .v-label {
  top: 10px !important;
  font-size: 12px !important;
  color: #555555 !important;
  background-color: #ffffff;
  padding: 0 4px;
}

.page-input >>> input {
  text-align: center;
  font-size: 13px;
}

.btn-go-red {
  background-color: #a2212b !important;
  color: #ffffff !important;
  border-radius: 4px !important;
  height: 36px !important;
  min-width: 48px !important;
  font-size: 13px !important;
  font-weight: 500;
}

.btn-nav-arrow {
  border: 1px solid #e0e0e0 !important;
  border-radius: 4px !important;
  min-width: 32px !important;
  width: 32px !important;
  height: 36px !important;
  padding: 0 !important;
  background-color: #ffffff !important;
}

.btn-page-number {
  min-width: 32px !important;
  width: 32px !important;
  height: 36px !important;
  padding: 0 !important;
  border-radius: 4px !important;
  font-size: 13px !important;
}

.btn-page-number.active {
  background-color: #a2212b !important;
  box-shadow: 0 2px 6px rgba(162, 33, 43, 0.4) !important;
}

.btn-icon-red {
  width: 38px !important;
  height: 38px !important;
  border-radius: 4px;
}

.btn-icon-red:hover {
  background-color: rgba(158, 28, 36, 0.08) !important;
}

.btn-search-square {
  min-width: 44px !important;
  width: 44px !important;
  height: 38px !important;
  padding: 0 !important;
  border-radius: 4px !important;
  background-color: #9e1c24 !important;
}

.btn-search-square:hover {
  background-color: #82141b !important;
}

.status-pill-select {
  min-width: 0;
  max-width: 170px;
}

.status-pill-select >>> .v-input__control,
.status-pill-select >>> .v-input__slot {
  min-height: 34px !important;
}

.status-pill-select >>> .v-input__slot {
  border-radius: 18px !important;
  padding: 0 10px 0 14px !important;
  box-shadow: none !important;
}

.status-pill-select >>> fieldset {
  border: none !important;
}

.status-pill-select >>> .v-select__selections {
  flex-wrap: nowrap;
  overflow: hidden;
  padding: 0 !important;
  white-space: nowrap;
}

.status-pill-select >>> .v-select__selection {
  overflow: hidden;
  text-overflow: ellipsis;
  color: #ffffff !important;
  font-weight: 500;
  font-size: 13px;
}

.status-pill-select >>> .v-icon {
  color: #ffffff !important;
}

.pill-green-solid >>> .v-input__slot {
  background-color: #42b858 !important;
}

.pill-orange-solid >>> .v-input__slot {
  background-color: #f59e0b !important;
}

.pill-lime-grade >>> .v-input__slot {
  background-color: #a3e635 !important;
}

.pill-blue-grade >>> .v-input__slot {
  background-color: #3b82f6 !important;
}
</style>