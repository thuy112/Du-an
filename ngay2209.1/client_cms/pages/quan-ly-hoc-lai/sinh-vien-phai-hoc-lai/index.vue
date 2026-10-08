<template>
  <div class="must-retake-page pa-3 pa-md-4 bg-white" :class="{ 'is-mobile-device': isMobileDevice }">
    <!-- TIÊU ĐỀ TRANG -->
    <div class="text-h6 font-weight-bold black--text mb-3">
      Danh sách sinh viên phải học lại (<span class="text-red-bold">{{ filteredList.length }}</span>)
    </div>

    <!-- 1. BỘ LỌC TÌM KIẾM VÀ CỤM NÚT ICON -->
    <div class="d-flex align-center justify-space-between mb-3 gap-2 flex-wrap flex-md-nowrap">
      <div class="d-flex align-center gap-2 flex-grow-1 flex-wrap flex-md-nowrap">
        <v-text-field
          v-model="filters.keyword"
          placeholder="Tìm kiếm"
          outlined
          dense
          hide-details
          clearable
          class="filter-input"
          style="min-width: 160px;"
          @keyup.enter="handleSearch"
          @click:clear="handleClearKeyword"
        ></v-text-field>

        <v-select
          v-model="filters.termId"
          :items="termOptions"
          placeholder="Học kỳ"
          outlined
          dense
          hide-details
          clearable
          class="filter-input"
          style="min-width: 130px;"
        ></v-select>

        <v-select
          v-model="filters.sessionId"
          :items="sessionOptions"
          placeholder="Đợt học lại"
          outlined
          dense
          hide-details
          clearable
          class="filter-input"
          style="min-width: 130px;"
        ></v-select>

        <v-select
          v-model="filters.subjectId"
          :items="subjectOptions"
          placeholder="Học phần"
          outlined
          dense
          hide-details
          clearable
          class="filter-input"
          style="min-width: 130px;"
        ></v-select>

        <v-select
          v-model="filters.status"
          :items="statusOptions"
          placeholder="Trạng thái"
          outlined
          dense
          hide-details
          clearable
          class="filter-input"
          style="min-width: 130px;"
        ></v-select>
      </div>

      <div class="d-flex align-center gap-2">
        <v-btn icon color="#A62229" class="btn-square-action" @click="refreshData">
          <v-icon size="22">mdi-refresh</v-icon>
        </v-btn>

        <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="handleSearch">
          <v-icon size="22">mdi-magnify</v-icon>
        </v-btn>

        <v-badge
          :content="selectedItems.length"
          :value="selectedItems.length > 0"
          color="#FF5252"
          overlap
          offset-x="12"
          offset-y="12"
        >
          <v-btn
            elevation="0"
            :disabled="selectedItems.length === 0"
            :class="selectedItems.length > 0 ? 'btn-email-active' : 'btn-email-disabled'"
            class="btn-email-custom"
            @click="sendEmailDirectly"
          >
            <v-icon :color="selectedItems.length > 0 ? '#FFFFFF' : '#8C8C8C'" small>
              mdi-email
            </v-icon>
          </v-btn>
        </v-badge>

        <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="openAddModal">
          <v-icon size="22">mdi-plus</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- 2. GIAO DIỆN DESKTOP: BẢNG DỮ LIỆU SỬ DỤNG V-SIMPLE-TABLE -->
    <div v-if="!isMobileDevice" class="table-responsive-wrapper">
      <v-simple-table class="flat-table" fixed-header height="100%">
        <template v-slot:default>
          <thead>
            <tr class="bg-gray-head">
              <th style="width: 40px;" class="text-center">
                <v-checkbox
                  v-model="selectAll"
                  hide-details
                  dense
                  class="ma-0 pa-0"
                  @change="handleSelectAll"
                ></v-checkbox>
              </th>
              <th class="text-center font-weight-bold gray-head-text" style="width: 60px;">STT</th>
              <th class="text-left font-weight-bold gray-head-text" style="min-width: 200px;">Thông tin sinh viên</th>
              <th class="text-left font-weight-bold gray-head-text" style="min-width: 100px;">Đợt học lại</th>
              <th class="text-left font-weight-bold gray-head-text" style="min-width: 80px;">Học kỳ</th>
              <th class="text-left font-weight-bold gray-head-text" style="min-width: 100px;">Mã học phần</th>
              <th class="text-left font-weight-bold gray-head-text" style="min-width: 180px;">Tên học phần</th>
              <th class="text-center font-weight-bold gray-head-text" style="min-width: 90px;">Điểm trượt</th>
              <th class="text-center font-weight-bold gray-head-text" style="min-width: 120px;">Trạng thái</th>
              <th class="text-center font-weight-bold gray-head-text" style="min-width: 100px;">Chức năng</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="paginatedList && paginatedList.length > 0">
              <tr v-for="(item, idx) in paginatedList" :key="item.id || idx">
                <td class="text-center">
                  <v-checkbox
                    v-model="selectedItems"
                    :value="item.id"
                    :disabled="item.isRegistered"
                    hide-details
                    dense
                    class="ma-0 pa-0"
                    @change="handleItemSelect"
                  ></v-checkbox>
                </td>
                <td class="text-center">{{ (currentPage - 1) * itemsPerPage + idx + 1 }}</td>
                <td class="py-2">
                  <div class="font-weight-bold text-red-bold cursor-pointer" @click="viewDetail(item)">
                    {{ item.fullName }}
                  </div>
                  <div class="text-caption font-weight-medium">
                    Mã SV: <span class="text-red-bold">{{ item.studentCode }}</span>
                  </div>
                  <div class="text-caption text-grey-darken-1">
                    Lớp: {{ item.className }}
                  </div>
                </td>
                <td>{{ item.sessionCode }}</td>
                <td>{{ item.termCode }}</td>
                <td class="font-weight-medium">{{ item.subjectCode }}</td>
                <td>{{ item.subjectName }}</td>
                <td class="text-center font-weight-bold">{{ item.failedScore || '' }}</td>
                <td class="text-center">
                  <span :class="['status-badge', item.isRegistered ? 'bg-green' : 'bg-grey']">
                    {{ item.isRegistered ? 'Đã đăng ký' : 'Chưa đăng ký' }}
                  </span>
                </td>
                <td class="text-center">
                  <div class="d-flex align-center justify-center gap-1">
                    <v-btn icon small color="blue" @click="viewDetail(item)">
                      <v-icon size="20">mdi-eye</v-icon>
                    </v-btn>
                    <v-btn
                      v-if="!item.isRegistered"
                      icon
                      small
                      color="error"
                      @click="confirmDelete(item)"
                    >
                      <v-icon size="20">mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </td>
              </tr>
            </template>
            <tr v-else>
              <td colspan="10" class="text-center py-8 text-grey-color">
                Không có dữ liệu
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </div>

    <!-- 3. GIAO DIỆN MOBILE -->
    <div v-else class="mobile-card-list">
      <div class="mobile-select-all-header mb-3 pa-3 bg-gray-head d-flex align-center justify-start">
        <v-checkbox
          v-model="selectAll"
          hide-details
          dense
          class="ma-0 pa-0"
          @change="handleSelectAll"
        ></v-checkbox>
      </div>

      <template v-if="paginatedList && paginatedList.length > 0">
        <div 
          v-for="(item, idx) in paginatedList" 
          :key="item.id || idx"
          class="mobile-card-item mb-4 pa-3 border rounded shadow-sm"
        >
          <div class="d-flex justify-end mb-2">
            <v-checkbox
              v-model="selectedItems"
              :value="item.id"
              :disabled="item.isRegistered"
              hide-details
              dense
              class="ma-0 pa-0"
              @change="handleItemSelect"
            ></v-checkbox>
          </div>

          <div class="mobile-info-row d-flex justify-space-between py-1">
            <span class="info-label text-caption font-weight-bold">STT</span>
            <span class="info-value text-caption">{{ (currentPage - 1) * itemsPerPage + idx + 1 }}</span>
          </div>

          <div class="mobile-info-row d-flex justify-space-between align-center py-1">
            <span class="info-label text-caption font-weight-bold">Thông tin sinh viên</span>
            <div class="info-value text-right">
              <div class="font-weight-bold text-red-bold cursor-pointer text-caption" @click="viewDetail(item)">
                {{ item.fullName }}
              </div>
              <div class="text-caption">
                Mã số sinh viên: <span class="text-red-bold">{{ item.studentCode }}</span>
              </div>
              <div class="text-caption text-grey-darken-1">
                Lớp: {{ item.className }}
              </div>
            </div>
          </div>

          <div class="mobile-info-row d-flex justify-space-between py-1">
            <span class="info-label text-caption font-weight-bold">Đợt học lại</span>
            <span class="info-value text-caption">{{ item.sessionCode }}</span>
          </div>

          <div class="mobile-info-row d-flex justify-space-between py-1">
            <span class="info-label text-caption font-weight-bold">Học kỳ</span>
            <span class="info-value text-caption">{{ item.termCode }}</span>
          </div>

          <div class="mobile-info-row d-flex justify-space-between py-1">
            <span class="info-label text-caption font-weight-bold">Mã học phần</span>
            <span class="info-value text-caption font-weight-medium">{{ item.subjectCode }}</span>
          </div>

          <div class="mobile-info-row d-flex justify-space-between py-1">
            <span class="info-label text-caption font-weight-bold">Tên học phần</span>
            <span class="info-value text-caption text-right pl-4">{{ item.subjectName }}</span>
          </div>

          <div class="mobile-info-row d-flex justify-space-between py-1">
            <span class="info-label text-caption font-weight-bold">Điểm trượt</span>
            <span class="info-value text-caption font-weight-bold">{{ item.failedScore || '' }}</span>
          </div>

          <div class="mobile-info-row d-flex justify-space-between align-center py-2">
            <span class="info-label text-caption font-weight-bold">Trạng thái</span>
            <span :class="['status-badge', item.isRegistered ? 'bg-green' : 'bg-grey']">
              {{ item.isRegistered ? 'Đã đăng ký' : 'Chưa đăng ký' }}
            </span>
          </div>

          <div class="mobile-info-row d-flex justify-space-between align-center py-2 border-none">
            <span class="info-label text-caption font-weight-bold">Chức năng</span>
            <div class="d-flex align-center gap-1">
              <v-btn icon small color="blue" @click="viewDetail(item)">
                <v-icon size="20">mdi-eye</v-icon>
              </v-btn>
              <v-btn
                v-if="!item.isRegistered"
                icon
                small
                color="error"
                @click="confirmDelete(item)"
              >
                <v-icon size="20">mdi-delete</v-icon>
              </v-btn>
            </div>
          </div>
        </div>
      </template>

      <div v-else class="text-center py-8 text-grey-color">
        Không có dữ liệu
      </div>
    </div>

    <!-- 4. BOTTOM BAR -->
    <div class="pagination-bottom-container mt-4 pt-2 border-top">
      <div class="d-flex align-center justify-space-between flex-wrap gap-3">
        <div class="d-flex align-center gap-2 flex-wrap">
          <input
            ref="fileInput"
            type="file"
            accept=".xlsx, .xls"
            class="d-none"
            @change="handleImportFile"
          />

          <v-btn
            color="#2E7D32"
            dark
            small
            class="text-none font-weight-medium rounded-lg text-nowrap"
            elevation="0"
            @click="exportToExcel"
          >
            <v-icon left small>mdi-export</v-icon>
            XUẤT FILE BÁO CÁO
          </v-btn>

          <v-btn
            color="#2E7D32"
            dark
            small
            class="text-none font-weight-medium rounded-lg text-nowrap"
            elevation="0"
            @click="triggerFileInput"
          >
            <v-icon left small>mdi-microsoft-excel</v-icon>
            NHẬP FILE ĐĂNG KÝ
          </v-btn>
        </div>

        <div class="pagination-scroll-wrapper flex-grow-1 d-flex justify-end">
          <div class="d-flex align-center gap-2 flex-nowrap pb-1" style="min-width: max-content;">
            <span class="text-caption text-grey-color text-nowrap">Bản ghi</span>
            <v-select
              v-model="itemsPerPage"
              :items="[10, 20, 50, 100]"
              dense
              outlined
              hide-details
              class="select-per-page"
              style="width: 75px;"
              @change="handleSearch"
            ></v-select>

            <span class="text-caption text-grey-color text-nowrap ml-1">Trang</span>
            <v-text-field
              v-model="pageInput"
              dense
              outlined
              hide-details
              class="input-page-num"
              style="width: 50px;"
              @keyup.enter="goToPage"
            ></v-text-field>

            <v-btn color="#A62229" dark small class="px-3 min-w-0 text-nowrap rounded-lg" elevation="0" @click="goToPage">Đi</v-btn>
            
            <v-btn icon small :disabled="currentPage <= 1" class="border-btn" @click="currentPage--; syncSelectAll()">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>

            <v-pagination
              v-model="currentPage"
              :length="totalPages"
              :total-visible="4"
              color="#A62229"
              dense
              class="custom-pagination"
              @input="syncSelectAll"
            ></v-pagination>

            <v-btn icon small :disabled="currentPage >= totalPages" class="border-btn" @click="currentPage++; syncSelectAll()">
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL & DIALOGS -->
    <RetakeCourseAddMustRetakeStudentModal
      v-model="showAddModal"
      :must-retake-students="studentList"
      :registered-classes-list="studentList"
      mock-mode
      @success="onAddSuccess"
    />

    <v-dialog v-model="deleteDialog" width="450px" persistent class="confirm-delete-dialog">
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="bg-red-bk white--text pa-3 px-4 d-flex justify-space-between align-center">
          <span class="text-subtitle-1 font-weight-bold">Xác nhận</span>
          <v-btn icon dark small class="ma-0" @click="deleteDialog = false">
            <v-icon small>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-5 text-subtitle-2 font-weight-normal grey--text text--dark-3">
          Bạn có chắc chắn muốn xóa sinh viên được đăng ký này không?
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-3 px-4 d-flex justify-end bg-white">
          <v-btn text small class="text-none btn-close-custom mr-2" @click="deleteDialog = false">
            Đóng
            <v-icon right small class="ml-1">mdi-close</v-icon>
          </v-btn>

          <v-btn dark small elevation="0" class="text-none btn-confirm-custom" @click="executeDelete">
            Xác Nhận
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <RetakeCourseDetailMustRetakeStudentModal
      v-model="showDetailModal"
      :student-data="selectedStudentDetail"
    />

    <!-- TOAST NOTIFICATION -->
    <div class="toast-container">
      <transition-group name="toast-list" tag="div" class="d-flex flex-column gap-2">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast-item rounded-lg elevation-2 d-flex flex-column overflow-hidden"
        >
          <div class="toast-content px-4 py-3 d-flex align-center white--text">
            <v-icon color="white" class="mr-3" small>mdi-check-circle</v-icon>
            <span class="text-body-2 flex-grow-1 font-weight-medium">{{ toast.message }}</span>
            <v-btn icon x-small dark class="ml-2 opacity-80" @click="removeToast(toast.id)">
              <v-icon x-small>mdi-close</v-icon>
            </v-btn>
          </div>
          <div class="toast-progress-bg">
            <div
              class="toast-progress-bar"
              :style="{ animationDuration: toast.duration + 'ms' }"
              @animationend="removeToast(toast.id)"
            ></div>
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
import * as XLSX from 'xlsx'
import RetakeCourseDetailMustRetakeStudentModal from '~/components/RetakeCourse/DetailMustRetakeStudentModal.vue'
import { MOCK_DATA_HOC_LAI } from '~/consts/danhsachhoclai.js'

export default {
  name: 'MustRetakeStudentPage',
  components: {
    RetakeCourseDetailMustRetakeStudentModal
  },
  data() {
    return {
      isMobileDevice: false,
      
      filters: {
        keyword: '',
        termId: null,
        sessionId: null,
        subjectId: null,
        status: null,
      },

      activeFilters: {
        keyword: '',
        termId: null,
        sessionId: null,
        subjectId: null,
        status: null,
      },

      statusOptions: [
        { text: 'Chưa đăng ký', value: false },
        { text: 'Đã đăng ký', value: true }
      ],

      selectAll: false,
      selectedItems: [],

      showAddModal: false,
      toasts: [],
      deleteDialog: false,
      showDetailModal: false,
      itemToDelete: null,
      selectedStudentDetail: null,
      
      currentPage: 1,
      pageInput: 1,
      itemsPerPage: 50,
      studentList: [],
    }
  },
  computed: {
    termOptions() {
      const terms = [...new Set(this.studentList.map(item => item.termCode).filter(Boolean))]
      return terms.map(term => ({ text: term, value: term }))
    },
    sessionOptions() {
      const sessions = [...new Set(this.studentList.map(item => item.sessionCode).filter(Boolean))]
      return sessions.map(sess => ({ text: sess, value: sess }))
    },
    subjectOptions() {
      const subjects = [...new Set(this.studentList.map(item => item.subjectName).filter(Boolean))]
      return subjects.map(sub => ({ text: sub, value: sub }))
    },

    filteredList() {
      return this.studentList.filter(item => {
        const kw = this.activeFilters.keyword ? this.activeFilters.keyword.trim().toLowerCase() : ''
        const matchKw = !kw || 
          (item.fullName && item.fullName.toLowerCase().includes(kw)) ||
          (item.studentCode && item.studentCode.toLowerCase().includes(kw)) ||
          (item.className && item.className.toLowerCase().includes(kw)) ||
          (item.subjectCode && item.subjectCode.toLowerCase().includes(kw)) ||
          (item.subjectName && item.subjectName.toLowerCase().includes(kw))

        const matchTerm = !this.activeFilters.termId || item.termCode === this.activeFilters.termId
        const matchSession = !this.activeFilters.sessionId || item.sessionCode === this.activeFilters.sessionId
        const matchSubject = !this.activeFilters.subjectId || item.subjectName === this.activeFilters.subjectId
        const matchStatus = this.activeFilters.status === null || this.activeFilters.status === undefined || item.isRegistered === this.activeFilters.status

        return matchKw && matchTerm && matchSession && matchSubject && matchStatus
      })
    },

    totalPages() {
      return Math.ceil(this.filteredList.length / this.itemsPerPage) || 1
    },
    paginatedList() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      return this.filteredList.slice(start, start + this.itemsPerPage)
    }
  },
  mounted() {
    this.mockData()
    if (typeof navigator !== 'undefined') {
      this.isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }
  },
  methods: {
    mockData() {
      const savedStudents = this.getSavedTestStudents()
      this.studentList = [...savedStudents, ...MOCK_DATA_HOC_LAI]
      this.selectedItems = []
      this.selectAll = false
    },

    getSavedTestStudents() {
      try {
        const saved = localStorage.getItem('mustRetakeStudentTestData')
        return saved ? JSON.parse(saved) : []
      } catch (error) {
        return []
      }
    },

    handleSelectAll(isChecked) {
      if (isChecked) {
        const unregisteredIds = this.filteredList
          .filter(item => !item.isRegistered)
          .map(item => item.id)
        this.selectedItems = unregisteredIds
      } else {
        this.selectedItems = []
      }
    },

    handleItemSelect() {
      this.syncSelectAll()
    },

    syncSelectAll() {
      const unregisteredItems = this.filteredList.filter(item => !item.isRegistered)
      this.selectAll =
        unregisteredItems.length > 0 &&
        unregisteredItems.every(item => this.selectedItems.includes(item.id))
    },

    handleSearch() {
      this.activeFilters = { ...this.filters }
      this.currentPage = 1
      this.pageInput = 1
      this.syncSelectAll()
    },

    goToPage() {
      this.activeFilters = { ...this.filters }
      const pageNum = Number(this.pageInput)
      if (pageNum >= 1 && pageNum <= this.totalPages) {
        this.currentPage = pageNum
      } else {
        this.currentPage = 1
        this.pageInput = 1
      }
      this.syncSelectAll()
    },

    handleClearKeyword() {
      this.filters.keyword = ''
    },

    refreshData() {
      this.filters = {
        keyword: '',
        termId: null,
        sessionId: null,
        subjectId: null,
        status: null,
      }
      this.handleSearch()
      this.addToast('Làm mới dữ liệu thành công')
    },

    openAddModal() {
      this.showAddModal = true
    },

    onAddSuccess(newStudents) {
      this.currentPage = 1
      const addedStudents = Array.isArray(newStudents) ? newStudents : [newStudents]
      if (!addedStudents.length || !addedStudents[0]) return

      this.studentList.unshift(...addedStudents)
      this.selectedItems = []
      this.selectAll = false
      try {
        localStorage.setItem(
          'mustRetakeStudentTestData',
          JSON.stringify([...addedStudents, ...this.getSavedTestStudents()])
        )
      } catch (error) {
        console.error(error)
      }

      this.addToast('Thêm danh sách sinh viên học lại thành công')
    },

    confirmDelete(item) {
      if (item.isRegistered) return
      this.itemToDelete = item
      this.deleteDialog = true
    },

    executeDelete() {
      if (this.itemToDelete && !this.itemToDelete.isRegistered) {
        this.studentList = this.studentList.filter(student => student.id !== this.itemToDelete.id)
        this.selectedItems = this.selectedItems.filter(id => id !== this.itemToDelete.id)
        this.syncSelectAll()
        this.addToast('Xóa thông tin thành công')
      }
      this.deleteDialog = false
      this.itemToDelete = null
    },

    openDetailModal(item) {
      this.selectedStudentDetail = item
      this.showDetailModal = true
    },

    addToast(message = 'Thao tác thành công', duration = 3000) {
      const id = Date.now() + Math.random()
      this.toasts.unshift({ id, message, duration })
    },

    removeToast(id) {
      this.toasts = this.toasts.filter(toast => toast.id !== id)
    },

    sendEmailDirectly() {
      if (this.selectedItems.length === 0) return
      const count = this.selectedItems.length
      this.addToast(`Gửi email thành công (${count} email)`, 3000)
      this.selectedItems = []
      this.selectAll = false
    },

    exportToExcel() {
      try {
        if (!this.filteredList.length) return

        const itemsToExport = this.selectedItems.length
          ? this.filteredList.filter(item => this.selectedItems.includes(item.id))
          : this.filteredList

        const dataForExcel = itemsToExport.map((item, index) => ({
          STT: index + 1,
          'Họ và tên': item.fullName || '',
          'Mã sinh viên': item.studentCode || '',
          'Lớp': item.className || '',
          'Đợt học lại': item.sessionCode || '',
          'Học kỳ': item.termCode || '',
          'Mã học phần': item.subjectCode || '',
          'Tên học phần': item.subjectName || '',
          'Điểm trượt': item.failedScore || '',
          'Trạng thái': item.isRegistered ? 'Đã đăng ký' : 'Chưa đăng ký'
        }))

        const worksheet = XLSX.utils.json_to_sheet(dataForExcel)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Bao_Cao_Sinh_Vien')
        XLSX.writeFile(workbook, `Bao_Cao_Sinh_Vien_Phai_Hoc_Lai_${Date.now()}.xlsx`)
      } catch (error) {
        console.error('Lỗi xuất file báo cáo:', error)
      }
    },

    triggerFileInput() {
      this.$refs.fileInput.click()
    },

    async handleImportFile(event) {
      const file = event.target.files && event.target.files[0]
      if (!file) return

      try {
        const arrayBuffer = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = loadEvent => resolve(loadEvent.target.result)
          reader.onerror = () => reject(new Error('Không thể đọc file Excel'))
          reader.readAsArrayBuffer(file)
        })
        const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(worksheet)

        const importedStudents = rows.map((row, index) => {
          const isRegistered = row['Trạng thái'] === 'Đã đăng ký'
          return {
            id: Date.now() + index,
            fullName: row['Họ và tên'] || '—',
            studentCode: row['Mã sinh viên'] || '—',
            className: row['Lớp'] || '—',
            sessionCode: row['Đợt học lại'] || '—',
            termCode: row['Học kỳ'] || '—',
            subjectCode: row['Mã học phần'] || '—',
            subjectName: row['Tên học phần'] || '—',
            failedScore: row['Điểm trượt'] || '',
            isRegistered
          }
        })

        this.studentList = [...importedStudents, ...this.studentList]
        this.handleSearch()
        this.addToast(`Đã nhập thành công ${importedStudents.length} bản ghi`, 3000)
      } catch (error) {
        this.addToast('File Excel không hợp lệ', 3000)
      } finally {
        event.target.value = ''
      }
    },

    viewDetail(item) {
      this.openDetailModal(item)
    }
  }
}
</script>

<style scoped>
.bg-red-bk { background-color: #A62229 !important; }
.text-red-bold { color: #A62229 !important; }
.text-grey-color { color: #757575 !important; }
.gray-head-text { color: #333333 !important; }

.bg-gray-head { background-color: #EEEEEE !important; }

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: white;
}
.bg-green { background-color: #4CAF50 !important; }
.bg-grey { background-color: #9E9E9E !important; }

.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.cursor-pointer { cursor: pointer; }
.text-nowrap { white-space: nowrap !important; }

.border-btn {
  border: 1px solid #E0E0E0 !important;
  border-radius: 4px !important;
}

.filter-input >>> .v-input__slot {
  border-radius: 6px !important;
  min-height: 38px !important;
}

.select-per-page >>> .v-input__slot,
.input-page-num >>> .v-input__slot {
  min-height: 32px !important;
  padding: 0 8px !important;
}

.btn-square-action {
  border-radius: 6px !important;
  height: 38px !important;
  min-width: 38px !important;
}

.btn-email-custom {
  min-width: 44px !important;
  width: 44px !important;
  height: 38px !important;
  border-radius: 8px !important;
  padding: 0 !important;
}

.btn-email-disabled {
  background-color: #E0E0E0 !important;
  cursor: not-allowed !important;
}

.btn-email-active {
  background-color: #A62229 !important;
  cursor: pointer !important;
}

::v-deep .v-badge__badge {
  font-size: 11px !important;
  font-weight: bold !important;
  height: 18px !important;
  min-width: 18px !important;
  padding: 0 5px !important;
  border-radius: 10px !important;
}

.custom-pagination >>> .v-pagination__navigation {
  display: none !important;
}

.toast-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 99999;
  width: 320px;
  max-width: 90vw;
  pointer-events: none;
}

.toast-item {
  pointer-events: auto;
  background-color: #4CB050 !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.opacity-80 { opacity: 0.8; }

.toast-progress-bg {
  height: 3px;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.25);
}

.toast-progress-bar {
  width: 100%;
  height: 100%;
  background-color: #35feb1;
  animation: shrinkProgress linear forwards;
}

@keyframes shrinkProgress {
  from { width: 100%; }
  to { width: 0%; }
}

.btn-close-custom { color: #A62229 !important; font-weight: 500; border-radius: 6px; }
.btn-confirm-custom { background-color: #A62229 !important; color: #ffffff !important; font-weight: 500; border-radius: 8px !important; padding: 0 16px !important; height: 36px !important; }
</style>