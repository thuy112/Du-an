<template>
  <div class="register-student-page pa-3 pa-md-4 bg-white" :class="{ 'is-mobile-device': isMobileDevice }">
    <!-- TIÊU ĐỀ TRANG -->
    <div class="text-h6 font-weight-bold black--text mb-3">
      Danh sách sinh viên đăng ký (<span class="text-red-bold">{{ totalRecords }}</span>)
    </div>

    <!-- BỘ LỌC TÌM KIẾM CỐ ĐỊNH PHÍA TRÊN -->
    <div class="filter-container mb-3 sticky-filter">
      <div class="d-flex align-center flex-wrap" style="gap: 8px; padding: 6px;">
        <v-select
          v-model="filters.classId"
          :items="classOptions"
          item-text="text"
          item-value="value"
          placeholder="Lớp sinh viên"
          outlined
          dense
          hide-details
          clearable
          class="filter-item"
          style="min-width: 170px; flex: 1 1 170px;"
        ></v-select>

        <v-select
          v-model="filters.examId"
          :items="examOptions"
          item-text="text"
          item-value="value"
          placeholder="Kỳ đăng ký thi lại"
          outlined
          dense
          hide-details
          clearable
          class="filter-item"
          style="min-width: 180px; flex: 1 1 180px;"
        ></v-select>

        <v-select
          v-model="filters.tuitionStatus"
          :items="tuitionStatusList"
          item-text="text"
          item-value="value"
          placeholder="Trạng thái trả học phí"
          outlined
          dense
          hide-details
          clearable
          class="filter-item"
          style="min-width: 180px; flex: 1 1 180px;"
        ></v-select>

        <v-select
          v-model="filters.emailStatus"
          :items="emailStatusList"
          item-text="text"
          item-value="value"
          placeholder="Trạng thái gửi email"
          outlined
          dense
          hide-details
          clearable
          class="filter-item"
          style="min-width: 170px; flex: 1 1 170px;"
        ></v-select>

        <!-- Cụm nút thao tác -->
        <div class="d-flex align-center flex-shrink-0" style="gap: 6px;">
          <v-btn icon color="#A62229" class="btn-square-action" @click="refreshData" title="Làm mới">
            <v-icon size="24">mdi-refresh</v-icon>
          </v-btn>

          <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="handleSearch" title="Tìm kiếm">
            <v-icon size="24">mdi-magnify</v-icon>
          </v-btn>

          <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="openAddDialog" title="Thêm mới">
            <v-icon size="24">mdi-plus</v-icon>
          </v-btn>

          <v-btn color="#ffa726" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="openSendMailDialog" title="Gửi email">
            <v-icon size="24">mdi-email-plus-outline</v-icon>
          </v-btn>
        </div>
      </div>
    </div>

    <!-- KHUNG BASETABLE -->
    <div class="table-scroll-container">
      <BaseTable
        :headers="tableHeaders"
        :items="itemList"
        :loading="loading"
        :is-mobile="isMobileDevice"
        :current-page="currentPage"
        :items-per-page="itemsPerPage"
        :total-records="totalRecords"
        hide-default-footer
        @page-change="changePage"
        @per-page-change="handleItemsPerPageChange"
      >
        <!-- Cột STT -->
        <template #[`item.stt`]="{ index }">
          <span>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</span>
        </template>

        <!-- Cột Thông tin sinh viên -->
        <template #[`item.student`]="{ item }">
          <div class="py-2 student-info-cell">
            <div class="font-weight-bold student-name-text" style="color:#a2212b">{{ item.studentName }}</div>
            <div class="text-caption grey--text text--darken-2">
              <span>Mã số sinh viên: </span><span class="font-weight-medium text-dark" style="color:#a2212b">{{ item.studentCode }}</span>
            </div>
            <div class="text-caption grey--text text--darken-2">
              <span>Lớp: </span><span style="color:#a2212b">{{ item.className }}</span>
            </div>
          </div>
        </template>

        <!-- Các cột dữ liệu khác -->
        <template #[`item.examName`]="{ item }">
          <span>{{ item.examName || '---' }}</span>
        </template>

        <template #[`item.termName`]="{ item }">
          <span>{{ item.termName || '---' }}</span>
        </template>

        <template #[`item.orderCode`]="{ item }">
          <span>{{ item.orderCode || '---' }}</span>
        </template>

        <template #[`item.registerTime`]="{ item }">
          <span>{{ item.registerTime || '---' }}</span>
        </template>

        <template #[`item.totalTuition`]="{ item }">
          <span>{{ item.totalTuition ? item.totalTuition.toLocaleString() + ' đ' : '0 đ' }}</span>
        </template>

        <template #[`item.tuitionStatus`]="{ item }">
          <v-chip small :color="item.tuitionStatus === 'PAID' ? '#4caf50' : '#ff9800'" dark class="font-weight-medium">
            {{ item.tuitionStatus === 'PAID' ? 'Đã đóng' : 'Chưa đóng' }}
          </v-chip>
        </template>

        <template #[`item.bankStatus`]="{ item }">
          <span>{{ item.bankStatus || '---' }}</span>
        </template>

        <template #[`item.emailStatus`]="{ item }">
          <v-chip small :color="item.emailStatus === 'SENT' ? '#2196f3' : '#757575'" dark class="font-weight-medium">
            {{ item.emailStatus === 'SENT' ? 'Đã gửi' : 'Chưa gửi' }}
          </v-chip>
        </template>

        <!-- Cột Chức năng -->
        <template #[`item.actions`]="{ item }">
          <v-btn icon small color="error" @click="handleDelete(item)" title="Xóa">
            <v-icon size="20">mdi-delete</v-icon>
          </v-btn>
        </template>
      </BaseTable>
    </div>

    <!-- PHÂN TRANG VÀ NÚT TÁC VỤ DƯỚI -->
    <div class="pagination-bottom-container mt-4 pt-3 d-flex align-center justify-space-between flex-wrap gap-3 sticky-bottom-bar border-top">
      <div class="d-flex align-center" style="gap: 8px;">
        <!-- Nút Xuất file báo cáo (Active khi có dữ liệu) -->
        <v-btn 
          :color="totalRecords > 0 ? '#4caf50' : '#e0e0e0'" 
          :dark="totalRecords > 0" 
          :disabled="totalRecords === 0"
          class="text-none font-weight-medium rounded-sm text-nowrap px-3" 
          height="32" 
          elevation="0" 
          style="font-size: 12px; border-radius: 4px !important;" 
          @click="exportReportFile"
        >
          <v-icon left small>mdi-export</v-icon>
          XUẤT FILE BÁO CÁO
        </v-btn>

        <!-- Nút Nhập file thanh toán -->
        <v-btn color="#4caf50" dark class="text-none font-weight-medium rounded-sm text-nowrap px-3" height="32" elevation="0" style="font-size: 12px; border-radius: 4px !important;" @click="openImportPaymentDialog">
          <v-icon left small>mdi-import</v-icon>
          NHẬP FILE THANH TOÁN
        </v-btn>
      </div>

      <div class="d-flex align-center custom-pagination-group" style="gap: 8px;">
        <v-select
          v-model="itemsPerPage"
          :items="[5, 10, 20, 50, 100]"
          label="Bản ghi"
          outlined
          dense
          hide-details
          class="per-page-select"
          style="width: 90px;"
          @change="handleItemsPerPageChange(itemsPerPage)"
        ></v-select>

        <div class="d-flex align-center" style="gap: 4px;">
          <v-text-field
            v-model.number="pageInput"
            label="Trang"
            outlined
            dense
            hide-details
            type="number"
            style="width: 70px;"
            @keyup.enter="goToPage"
          ></v-text-field>
          <v-btn color="#A2212B" dark depressed class="text-none px-3" height="36" @click="goToPage">
            Đi
          </v-btn>
        </div>

        <v-btn icon outlined small color="grey" :disabled="currentPage <= 1" @click="changePage(currentPage - 1)">
          <v-icon small>mdi-chevron-left</v-icon>
        </v-btn>

        <div class="d-flex align-center" style="gap: 4px;">
          <template v-for="p in totalPages">
            <v-btn
              v-if="p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)"
              :key="p"
              :color="p === currentPage ? '#A2212B' : 'grey lighten-2'"
              :dark="p === currentPage"
              depressed
              min-width="32"
              height="32"
              small
              @click="changePage(p)"
            >
              {{ p }}
            </v-btn>
            <span v-else-if="p === currentPage - 2 || p === currentPage + 2" :key="'dot-' + p">...</span>
          </template>
        </div>

        <v-btn icon outlined small color="grey" :disabled="currentPage >= totalPages" @click="changePage(currentPage + 1)">
          <v-icon small>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- MODAL XÁC NHẬN GỬI EMAIL -->
    <v-dialog v-model="confirmMailDialog" max-width="450px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <div class="px-6 py-4 text-white font-weight-bold d-flex justify-space-between align-items-center" style="background-color: #A62229; font-size: 16px;">
          <span>Xác nhận</span>
          <v-btn icon dark @click="confirmMailDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        
        <v-card-text class="pa-6 text-body-1 text-dark">
          Gửi email thông báo được phép đóng phí thi lại
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4 justify-end" style="gap: 8px;">
          <v-btn text class="text-none px-4" @click="confirmMailDialog = false">Đóng</v-btn>
          <v-btn 
            color="#A2212B" 
            dark 
            depressed 
            class="text-none px-6" 
            :loading="sendingMail"
            @click="confirmSendMailFee"
          >
            Đồng Ý
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MODAL NHẬP FILE THANH TOÁN / EXCEL -->
    <v-dialog v-model="importDialog" max-width="900px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <div class="px-6 py-4 text-white font-weight-bold d-flex justify-space-between align-items-center" style="background-color: #A62229; font-size: 16px;">
          <span>Nhập file excel</span>
          <v-btn icon dark @click="importDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>

        <v-card-text class="pa-6" style="max-height: 75vh; overflow-y: auto;">
          <!-- Link file lỗi chi tiết -->
          <div v-if="errorFileLink" class="mb-3 text-body-2">
            <span class="grey--text">Link file lỗi chi tiết: </span>
            <a :href="errorFileLink" target="_blank" class="text-decoration-underline" style="color: #1976d2;">
              {{ errorFileName || 'Tải file lỗi chi tiết' }}
            </a>
          </div>

          <!-- Khung chọn file -->
          <div v-if="!selectedFile" class="upload-drop-zone pa-5 text-center border-dashed rounded mb-4" style="border: 2px dashed #b0bec5; background-color: #fafafa;">
            <input type="file" ref="fileInput" class="d-none" accept=".xlsx, .xls, .csv" @change="handleFileChange" />
            <v-btn color="#A62229" dark fab small elevation="0" class="mb-2" @click="$refs.fileInput.click()">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
            <div class="text-body-2 grey--text text--darken-2">Chọn tệp đính kèm</div>
          </div>

          <div v-else class="d-flex justify-space-between align-items-center pa-3 rounded mb-3 bg-grey-lighten-4 border">
            <div class="d-flex align-center" style="gap: 8px;">
              <v-icon color="success">mdi-file-excel</v-icon>
              <span class="font-weight-medium">{{ selectedFileName }}</span>
            </div>
            <v-btn icon small color="error" @click="resetImportFile"><v-icon>mdi-close</v-icon></v-btn>
          </div>

          <!-- Bảng dữ liệu xem trước / lỗi -->
          <v-data-table
            v-if="importPreviewItems.length > 0"
            :headers="importTableHeaders"
            :items="importPreviewItems"
            :loading="checkingFile"
            hide-default-footer
            fixed-header
            height="120px"
            class="elevation-1 rounded border mt-3 text-no-wrap"
            no-data-text="Không có dữ liệu"
          >
            <template #[`item.stt`]="{ index }">
              <span>{{ index + 1 }}</span>
            </template>
            <template #[`item.errorInfo`]="{ item }">
              <span class="font-weight-medium" style="color: #d32f2f;">{{ item.errorInfo || '' }}</span>
            </template>
          </v-data-table>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4 justify-end" style="gap: 8px;">
          <v-btn text class="text-none px-4" @click="importDialog = false">Đóng</v-btn>
          <v-btn 
            color="#A2212B" 
            dark 
            depressed 
            class="text-none px-6" 
            :loading="submittingImport"
            :disabled="!selectedFile"
            @click="submitImportFile"
          >
            Import
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MODAL THÊM MỚI ĐĂNG KÝ -->
    <RegisterAddModal
      v-model="addModalVisible"
      @success="loadData"
    />
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import registerService from '~/services/registerService'
import RegisterAddModal from '~/components/RegisterAddModal.vue' // Import modal thêm mới

export default {
  name: 'RegisterStudentPage',
  components: {
    BaseTable,
    RegisterAddModal,
  },
  data() {
    return {
      addModalVisible: false,
      confirmMailDialog: false,
      sendingMail: false,

      isMobileDevice: false,
      loading: false,
      filters: {
        classId: '',
        examId: '',
        tuitionStatus: '',
        emailStatus: '',
      },
      activeFilters: {
        classId: '',
        examId: '',
        tuitionStatus: '',
        emailStatus: '',
      },
      classOptions: [],
      examOptions: [],
      
      tuitionStatusList: [
        { value: 'PAID', text: 'Đã đóng' },
        { value: 'UNPAID', text: 'Chưa đóng' },
      ],
      emailStatusList: [
        { value: 'SENT', text: 'Đã gửi' },
        { value: 'UNSENT', text: 'Chưa gửi' },
      ],

      importDialog: false,
      selectedFile: null,
      selectedFileName: '',
      importResult: false,
      checkingFile: false,
      submittingImport: false,
      importErrorMsg: '',
      errorFileLink: '',
      importPreviewItems: [],
      importTableHeaders: [
        { value: 'stt', text: 'STT', align: 'center', width: '50px', sortable: false },
        { value: 'errorInfo', text: 'Thông tin lỗi', align: 'left', width: '160px', sortable: false },
        { value: 'orderCode', text: 'Số hóa đơn', align: 'left', width: '100px', sortable: false },
        { value: 'studentCode', text: 'Mã số sinh viên', align: 'left', width: '110px', sortable: false },
        { value: 'studentName', text: 'Họ tên sinh viên', align: 'left', width: '120px', sortable: false },
        { value: 'totalFeeStr', text: 'Số tiền đã thu', align: 'right', width: '110px', sortable: false },
        { value: 'dateImportStr', text: 'Ngày import', align: 'center', width: '100px', sortable: false },
        { value: 'datePaidStr', text: 'Ngày thanh toán', align: 'center', width: '110px', sortable: false },
        { value: 'examCode', text: 'Kỳ thanh toán', align: 'left', width: '110px', sortable: false },
        { value: 'phone', text: 'SĐT', align: 'left', width: '90px', sortable: false },
        { value: 'address', text: 'Địa chỉ', align: 'left', width: '100px', sortable: false },
        { value: 'nameClazz', text: 'Tên khoản thu', align: 'left', width: '140px', sortable: false },
      ],

      itemList: [],
      totalRecords: 0,
      totalPages: 1,
      currentPage: 1,
      pageInput: 1,
      itemsPerPage: 50,

      tableHeaders: [
        { value: "stt", text: "STT", align: "center", width: "60px", sortable: false },
        { value: "student", text: "Thông tin sinh viên", width: "240px", align: "left", sortable: false },
        { value: "examName", text: "Kỳ đăng ký thi lại", align: "left", sortable: false },
        { value: "termName", text: "Học phần đăng ký", align: "left", sortable: false },
        { value: "orderCode", text: "Mã đơn đăng ký", align: "left", sortable: false },
        { value: "registerTime", text: "Thời gian đăng ký", align: "left", sortable: false },
        { value: "totalTuition", text: "Tổng học phí", align: "left", sortable: false },
        { value: "tuitionStatus", text: "Trạng thái trả học phí", align: "center", sortable: false },
        { value: "bankStatus", text: "TT thêm DS ngân hàng", align: "center", sortable: false },
        { value: "emailStatus", text: "Trạng thái gửi email", align: "center", sortable: false },
        { value: "actions", text: "Chức năng", align: "center", width: "90px", sortable: false },
      ],
    }
  },
  async mounted() {
    if (typeof navigator !== 'undefined') {
      this.isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }
    await this.fetchCatalogs()
    await this.loadData()
  },
  methods: {
    async fetchCatalogs() {
      try {
        const [classRes, examRes] = await Promise.all([
          registerService.getClasses({ channel: 'CMS' }).catch(() => null),
          registerService.getExams({ status: 'ACTIVE', channel: 'CMS' }).catch(() => null),
        ])

        if (classRes) {
          const list = Array.isArray(classRes) ? classRes : classRes.data || classRes.content || []
          this.classOptions = list.map(item => ({ text: item.name || item.code, value: item.id }))
        }
        if (examRes) {
          const list = Array.isArray(examRes) ? examRes : examRes.data || examRes.content || []
          this.examOptions = list.map(item => ({ text: item.name || item.code, value: item.id }))
        }
      } catch (error) {
        console.error('Lỗi tải danh mục phụ:', error)
      }
    },

    extractValue(val) {
      if (val === null || val === undefined || val === '') return ''
      if (typeof val === 'object') {
        return val.value !== undefined ? val.value : (val.id !== undefined ? val.id : (val.code !== undefined ? val.code : ''))
      }
      return val
    },

    handleSearch() {
      this.activeFilters = {
        classId: this.extractValue(this.filters.classId),
        examId: this.extractValue(this.filters.examId),
        tuitionStatus: this.extractValue(this.filters.tuitionStatus),
        emailStatus: this.extractValue(this.filters.emailStatus),
      }
      this.currentPage = 1
      this.pageInput = 1
      this.loadData()
    },

    refreshData() {
      this.filters = {
        classId: '',
        examId: '',
        tuitionStatus: '',
        emailStatus: '',
      }
      this.activeFilters = {
        classId: '',
        examId: '',
        tuitionStatus: '',
        emailStatus: '',
      }
      this.currentPage = 1
      this.pageInput = 1
      this.loadData()
    },

    async loadData() {
      this.loading = true
      try {
        const baseParams = {
          pageIndex: this.currentPage,
          pageSize: this.itemsPerPage,
          channel: 'CMS',
        }

        if (this.activeFilters.classId !== '') baseParams.classId = this.activeFilters.classId
        if (this.activeFilters.examId !== '') baseParams.examId = this.activeFilters.examId
        if (this.activeFilters.tuitionStatus !== '') baseParams.tuitionStatus = this.activeFilters.tuitionStatus
        if (this.activeFilters.emailStatus !== '') baseParams.emailStatus = this.activeFilters.emailStatus

        const res = await registerService.getList(baseParams)
        
        if (res) {
          const rootData = res.data !== undefined ? res.data : res
          const allItems = Array.isArray(rootData) ? rootData : (rootData.data || rootData.content || rootData.items || [])
          
          const rawTotal = rootData.totalElements ?? rootData.totalRecords ?? rootData.total ?? (res.totalElements || res.totalRecords || res.total)
          this.totalRecords = rawTotal !== undefined ? Number(rawTotal) : allItems.length

          this.itemList = (Array.isArray(allItems) ? allItems : []).map(item => ({
            ...item,
            studentName: item.studentName || item.fullName || item.student?.fullName || '---',
            studentCode: item.studentCode || item.code || item.student?.code || '---',
            className: item.className || item.classes?.name || item.student?.className || '---',
            examName: item.examName || item.exam?.name || '---',
            termName: item.termName || item.courseName || '---',
            orderCode: item.orderCode || item.code || '---',
            registerTime: item.registerTime || item.createdAt || '---',
            totalTuition: item.totalTuition || item.amount || 0,
            tuitionStatus: item.tuitionStatus || 'UNPAID',
            bankStatus: item.bankStatus || '---',
            emailStatus: item.emailStatus || 'UNSENT',
          }))

          this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage) || 1
        }
      } catch (error) {
        console.error('Lỗi tải danh sách sinh viên đăng ký:', error)
        this.itemList = []
        this.totalRecords = 0
        this.totalPages = 1
      } finally {
        this.loading = false
      }
    },

    changePage(page) {
      if (page < 1 || page > this.totalPages) return
      this.currentPage = page
      this.pageInput = page
      this.loadData()
    },

    goToPage() {
      const page = parseInt(this.pageInput)
      if (page >= 1 && page <= this.totalPages) {
        this.changePage(page)
      } else {
        this.pageInput = this.currentPage
      }
    },

    handleItemsPerPageChange(size) {
      this.itemsPerPage = size
      this.currentPage = 1
      this.pageInput = 1
      this.loadData()
    },

    handleDelete(item) {
      console.log('Xóa bản ghi:', item)
    },
    openAddDialog() {
      this.addModalVisible = true
    },
    openSendMailDialog() {
      this.confirmMailDialog = true
    },

    async confirmSendMailFee() {
      this.sendingMail = true
      try {
        await registerService.sendMailFee()
        // Thông báo thành công (nếu có dùng snackbar/toast của hệ thống)
        this.confirmMailDialog = false
      } catch (error) {
        console.error('Lỗi gửi email:', error)
      } finally {
        this.sendingMail = false
      }
    },
    exportReportFile() {
      if (this.totalRecords === 0) return
      // Xử lý gọi API xuất file báo cáo
      console.log('Đang xuất file báo cáo...')
    },

    openImportPaymentDialog() {
      this.resetImportFile()
      this.importDialog = true
    },

    resetImportFile() {
      this.selectedFile = null
      this.selectedFileName = ''
      this.importResult = false
      this.importErrorMsg = ''
      this.errorFileLink = ''
      this.importPreviewItems = []
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    },

    handleFileChange(e) {
      const files = e.target.files
      if (!files || files.length === 0) return

      this.selectedFile = files[0]
      this.selectedFileName = this.selectedFile.name
      this.importResult = false // Reset trạng thái hiển thị kết quả check
      this.importErrorMsg = ''
      this.importPreviewItems = []
    },

    async checkImportFile(file) {
      this.checkingFile = true
      const formData = new FormData()
      formData.append('file', file)

      try {
        const res = await registerService.importCheckFile(formData)
        const data = res?.data !== undefined ? res.data : res
        
        // Nếu có lỗi, hiển thị thông báo và danh sách lỗi lên bảng
        if (data?.hasError || data?.error || data?.items || data?.content) {
          this.importErrorMsg = data.message || 'Có lỗi xảy ra khi import excel'
          this.errorFileLink = data.errorFileUrl || data.fileUrl || ''
          this.importPreviewItems = data.items || data.content || data.data || []
        } else {
          this.importErrorMsg = ''
          this.importPreviewItems = data.items || []
        }
      } catch (error) {
        console.error('Lỗi kiểm tra file:', error)
        this.importErrorMsg = 'Có lỗi xảy ra khi import excel'
      } finally {
        this.checkingFile = false
      }
    },

    async submitImportFile() {
      if (!this.selectedFile) return

      this.submittingImport = true
      const formData = new FormData()
      formData.append('file', this.selectedFile)

      try {
        const checkRes = await registerService.importCheckFile(formData)
        const checkData = checkRes?.data !== undefined ? checkRes.data : checkRes
        const innerData = checkData?.data || checkData

        const objects = innerData?.objects || innerData?.items || []
        const hasAnyError = objects.some(item => item.isError === 'YES' || (item.messErrors && Object.keys(item.messErrors).length > 0))

        this.importResult = true

        if (hasAnyError || innerData?.status !== 0) {
          this.importErrorMsg = innerData?.message || 'Có lỗi xảy ra khi import excel'
          
          // Lấy chính xác đường dẫn file lỗi từ cấu trúc trả về của backend
          const fileObj = innerData?.object || innerData?.file || {}
          this.errorFileLink = fileObj.url || innerData?.url || ''
          
          // Tách tên file từ đường dẫn để hiển thị
          if (this.errorFileLink) {
            const parts = this.errorFileLink.split('/')
            this.errorFileName = parts[parts.length - 1]
          }

          this.importPreviewItems = objects.map(item => {
            let errorText = ''
            if (item.messErrors) {
              if (typeof item.messErrors === 'object') {
                errorText = Object.values(item.messErrors).join(', ')
              } else {
                errorText = String(item.messErrors)
              }
            }
            return {
              ...item,
              errorInfo: errorText,
              totalFeeStr: item.totalFeeStr || item.totalFee || '---',
              examCode: item.examCode || item.datePaidStr || '---'
            }
          })
        } else {
          // Trường hợp file hoàn toàn hợp lệ, tiến hành import chính thức
          await registerService.importFile(formData)
          this.importDialog = false
          this.loadData()
        }
      } catch (error) {
        console.error('Lỗi khi import file:', error)
      } finally {
        this.submittingImport = false
      }
    },
  }
}
</script>

<style scoped>
.text-red-bold {
  color: #A62229 !important;
}
.bg-white {
  background-color: #ffffff !important;
}
.filter-item >>> .v-input__slot {
  border-radius: 6px !important;
  min-height: 38px !important;
}
.btn-square-action {
  border-radius: 6px !important;
  height: 38px !important;
  min-width: 38px !important;
}
.sticky-filter {
  position: sticky;
  top: 0;
  z-index: 5;
  background-color: #ffffff;
}
.sticky-bottom-bar {
  position: sticky;
  bottom: 0;
  z-index: 5;
  background-color: #ffffff;
  padding-bottom: 12px;
}
.table-scroll-container {
  overflow-x: auto;
  overflow-y: auto;
  position: relative;
}
.student-name-text {
  color: #A62229 !important;
  font-size: 14px;
}
.student-info-cell {
  line-height: 1.4;
}
.text-dark {
  color: #333333 !important;
}
::v-deep .v-data-footer {
  display: none !important;
}
</style>