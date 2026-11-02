<template>
  <div class="fee-teacher-page pa-3 pa-md-4 bg-white" :class="{ 'is-mobile-device': isMobileDevice }">
    <div class="sticky-toolbar">
      <!-- TIÊU ĐỀ TRANG -->
      <div class="text-h6 font-weight-bold black--text mb-3">
        Danh sách thanh toán giảng viên theo lớp (<span class="text-red-bold">{{ totalRecords }}</span>)
      </div>

      <!-- BỘ LỌC TÌM KIẾM CỐ ĐỊNH PHÍA TRÊN -->
      <div class="filter-container mb-3">
        <div class="filter-grid">
          <v-select
            v-model="filters.teacherId"
            :items="teacherOptions"
            item-text="text"
            item-value="value"
            placeholder="Giảng viên"
            outlined
            dense
            hide-details
            clearable
            class="filter-input flex-grow-1"
            style="min-width: 0;"
          ></v-select>

          <v-select
            v-model="filters.examId"
            :items="examOptions"
            item-text="text"
            item-value="value"
            placeholder="Đợt học lại"
            outlined
            dense
            hide-details
            clearable
            class="filter-input flex-grow-1"
            style="min-width: 0;"
          ></v-select>

          <v-select
            v-model="filters.retakeSessionId"
            :items="sessionOptions"
            item-text="text"
            item-value="value"
            placeholder="Lớp học lại"
            outlined
            dense
            hide-details
            clearable
            class="filter-input flex-grow-1"
            style="min-width: 0;"
          ></v-select>

          <v-select
            v-model="filters.status"
            :items="statusList"
            item-text="text"
            item-value="value"
            placeholder="Trạng thái"
            outlined
            dense
            hide-details
            clearable
            class="filter-input flex-grow-1 status-filter"
            style="min-width: 0;"
          ></v-select>

          <div class="filter-actions d-flex align-center">
            <v-btn icon color="#A62229" class="btn-square-action" @click="refreshData" title="Làm mới">
              <v-icon size="22">mdi-refresh</v-icon>
            </v-btn>

            <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="handleSearch" title="Tìm kiếm">
              <v-icon size="22">mdi-magnify</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- KHUNG BASETABLE CÓ THANH CUỘN & CỐ ĐỊNH TIÊU ĐỀ -->
    <div class="table-scroll-container">
      <BaseTable
        :headers="tableHeaders"
        :items="itemList"
        :loading="loading"
        :is-mobile="isMobileDevice"
        :current-page="currentPage"
        :items-per-page="-1"
        :total-records="totalRecords"
        fixed-header
        height="100%"
        hide-default-footer
        @page-change="changePage"
        @per-page-change="handleItemsPerPageChange"
      >
        <!-- Cột STT -->
        <template #[`item.index`]="{ index }">
          <span>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</span>
        </template>

        <!-- Cột Loại lớp -->
        <template #[`item.classType`]="{ item }">
          <v-chip
            small
            dark
            :color="getClassTypeBadge(item).color"
            class="font-weight-medium text-caption"
          >
            {{ getClassTypeBadge(item).text }}
          </v-chip>
        </template>

        <!-- Đợt học lại -->
        <template #[`item.examName`]="{ item }">
          <span>{{ item.examName || '-' }}</span>
        </template>

        <!-- Thu học phí SV -->
        <template #[`item.tuitionCoefficient`]="{ item }">
          <span>{{ item.coefficient ?? '-' }}</span>
        </template>

        <!-- Thanh toán giảng dạy -->
        <template #[`item.teacherCoefficient`]="{ item }">
          <span>{{ item.coefficientTeacher ?? '-' }}</span>
        </template>

        <!-- Số tín chỉ học phí -->
        <template #[`item.creditTuition`]="{ item }">
          <span>{{ item.creditTuition ?? '-' }}</span>
        </template>

        <!-- Giảng viên -->
        <template #[`item.teacherName`]="{ item }">
          <span>{{ item.teacherName || '-' }}</span>
        </template>

        <!-- Tên học phần -->
        <template #[`item.courseName`]="{ item }">
          <span>{{ item.courseName || '-' }}</span>
        </template>

        <!-- Tổng phí -->
        <template #[`item.totalFee`]="{ item }">
          <span>{{ formatMoney(item.totalFee) }}</span>
        </template>

        <!-- Thuế thu nhập cá nhân -->
        <template #[`item.totalTaxFee`]="{ item }">
          <span>{{ formatMoney(item.totalTaxFee) }}</span>
        </template>

        <!-- File thông tin -->
        <template #[`item.fileInform`]="{ item }">
          <v-btn
            v-if="item.fileInform"
            icon
            small
            color="#A62229"
            :href="item.fileInform"
            target="_blank"
            title="Tải xuống file thông tin"
          >
            <v-icon size="26">mdi-file-download-outline</v-icon>
          </v-btn>
          <v-btn
            v-else
            icon
            small
            disabled
            color="grey"
            title="Chưa có file thông tin"
          >
            <v-icon size="26">mdi-file-download-outline</v-icon>
          </v-btn>
        </template>

        <!-- T.T xuất giấy xác nhận -->
        <template #[`item.isExported`]="{ item }">
          <v-chip
            small
            dark
            :color="item.isExported === 1 ? '#4caf50' : '#ffae1f'"
            class="font-weight-medium text-caption"
          >
            {{ item.isExported === 1 ? 'Đã xuất' : 'Chưa xuất' }}
          </v-chip>
        </template>

        <!-- Trạng thái thanh toán -->
        <template #[`item.status`]="{ item }">
          <ChangeableStatus
            :status="item.status"
            :statusList="statusList"
            @changeStatus="(selectedItem) => handleStatusChange(item, selectedItem)"
          >
            <template #content="{ data }">
              Bạn có chắc chắn muốn đổi trạng thái từ 
              <span class="font-weight-bold red--text">{{ getStatusText(item.status) }}</span> sang 
              <span class="font-weight-bold red--text">{{ data.text }}</span> không?
            </template>
          </ChangeableStatus>
        </template>

        <!-- Cột Chức năng -->
        <template #[`item.actions`]="{ item }">
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon v-bind="attrs" v-on="on">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list dense>
              <v-list-item @click="viewDetail(item)">
                <v-list-item-icon class="mr-2">
                  <v-icon small color="#00bcd4">mdi-eye</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Chi tiết</v-list-item-title>
              </v-list-item>

              <v-list-item @click="openUpdateFileDialog(item)">
                <v-list-item-icon class="mr-2">
                  <v-icon small color="#2196f3">mdi-file-upload</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Cập nhật file</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </BaseTable>
    </div>

    <!-- THANH BOTTOM ACTIONS & PHÂN TRANG CỐ ĐỊNH PHÍA DƯỚI -->
    <div class="pagination-bottom-container mt-4 pt-3 d-flex align-center justify-space-between flex-wrap gap-3 sticky-bottom-bar border-top">
      <div class="d-flex align-center" style="gap: 8px;">
        <v-btn disabled color="grey lighten-3" class="text-dark text-none font-weight-medium rounded-sm text-nowrap px-2" height="28" width="286" elevation="0" style="font-size: 12px; border-radius: 4px !important;">
          <v-icon left x-small color="grey darken-2">mdi-export</v-icon>
          XUẤT GIẤY XÁC NHẬN THANH TOÁN (A5)
        </v-btn>

        <v-btn color="#4caf50" dark class="text-none font-weight-medium rounded-sm text-nowrap px-2" height="28" width="286" elevation="0" style="font-size: 12px; border-radius: 4px !important;" @click="exportExcel">
          <v-icon left x-small>mdi-export</v-icon>
          XUẤT FILE DANH SÁCH THANH TOÁN
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

    <!-- MODAL CHI TIẾT -->
    <v-dialog v-model="detailDialog" max-width="700px">
      <v-card class="pa-0 detail-dialog">
        <v-card-title class="white--text font-weight-bold py-3 px-4" style="background-color: #a2212b !important;">
          Chi tiết thanh toán GV theo lớp học lại
          <v-spacer></v-spacer>
          <v-icon dark class="cursor-pointer" @click="detailDialog = false">mdi-close</v-icon>
        </v-card-title>
        <v-card-text v-if="detailData" class="pa-6">
          <div class="subtitle-1 error--text font-weight-bold mb-4">Thông tin thanh toán giảng viên</div>
          <v-row dense>
            <v-col cols="6" class="py-1"><strong>Tên giảng viên:</strong> <span class="error--text font-weight-medium">{{ detailData.teacherName || detailData.teachername || detailData.fullName || '---' }}</span></v-col>
            <v-col cols="6" class="py-1"><strong>Mã lớp học lại:</strong> <span class="error--text font-weight-medium">{{ detailData.classCode || detailData.classcode || detailData.code || '---' }}</span></v-col>
            <v-col cols="6" class="py-1"><strong>Loại lớp:</strong> <span class="error--text font-weight-medium">{{ getClassTypeText(detailData) }}</span></v-col>
            <v-col cols="6" class="py-1"><strong>Đợt học lại:</strong> <span class="error--text font-weight-medium">{{ detailData.examName || detailData.semester || detailData.dotHocLai || '---' }}</span></v-col>
            <v-col cols="12" class="py-1"><strong>Tên học phần:</strong> <span class="error--text font-weight-medium">{{ detailData.courseName || detailData.subjectName || detailData.subjectname || '---' }}</span></v-col>
            <v-col cols="6" class="py-1"><strong>Định mức:</strong> <span class="error--text font-weight-medium">{{ formatMoney(detailData.unitPrice ?? detailData.norm ?? detailData.dinhMuc) }}</span></v-col>
            <v-col cols="6" class="py-1"><strong>Số tín chỉ học phí:</strong> <span class="error--text font-weight-medium">{{ detailData.creditTuition ?? detailData.credit ?? detailData.tinChi ?? '---' }}</span></v-col>
            <v-col cols="6" class="py-1"><strong>Tổng số tiết:</strong> <span class="error--text font-weight-medium">{{ detailData.period ?? detailData.totalPeriods ?? detailData.soTiet ?? '---' }}</span></v-col>
            <v-col cols="6" class="py-1"><strong>Số lượng sinh viên:</strong> <span class="error--text font-weight-medium">{{ detailData.numberOfStudent ?? detailData.studentCount ?? detailData.soLuongSv ?? '---' }}</span></v-col>
            <v-col cols="6" class="py-1"><strong>Tổng phí:</strong> <span class="error--text font-weight-medium">{{ formatMoney(detailData.totalFee ?? detailData.tongPhi) }}</span></v-col>
            <v-col cols="6" class="py-1"><strong>Thuế thu nhập cá nhân:</strong> <span class="error--text font-weight-medium">{{ formatMoney(detailData.totalTaxFee ?? detailData.pit ?? detailData.thueThuNhap) }}</span></v-col>
            <v-col cols="12" class="py-1"><strong>Trạng thái:</strong> <span class="error--text font-weight-medium">{{ getStatusText(detailData.status || detailData.paymentFeeStatus) }}</span></v-col>
            
            <v-col cols="12" class="d-flex align-center mt-2">
              <strong class="mr-3">File thông tin:</strong>
              <template v-if="detailData.fileInform || detailData.filePath || detailData.file">
                <v-btn icon color="error" @click="downloadFile(detailData.fileInform || detailData.filePath || detailData.file)">
                  <v-icon>mdi-file-document</v-icon>
                </v-btn>
                <span class="error--text cursor-pointer ml-1" @click="downloadFile(detailData.fileInform || detailData.filePath || detailData.file)">
                  Tải xuống file
                </span>
              </template>
              <template v-else>
                <v-icon color="grey darken-1">mdi-file-document-outline</v-icon>
                <span class="grey--text ml-2">Chưa có file</span>
              </template>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="px-6 pb-4">
          <v-spacer></v-spacer>
          <v-btn color="error" depressed class="white--text px-5" @click="detailDialog = false">Đóng</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MODAL CẬP NHẬT FILE THÔNG TIN -->
    <v-dialog v-model="updateFileDialog" max-width="430px">
      <v-card class="pa-0 file-update-dialog">
        <v-card-title class="white--text font-weight-regular py-3 px-4 file-update-title">
          Cập nhật file thông tin
          <v-spacer></v-spacer>
          <v-icon dark class="cursor-pointer" @click="updateFileDialog = false">mdi-close</v-icon>
        </v-card-title>
        <v-card-text class="px-4 py-3 file-update-content">
          <div class="d-flex align-center mb-2 current-file-row">
            <span class="mr-3">File hiện tại:</span>
            <template v-if="selectedItemForFile && (selectedItemForFile.fileInform || selectedItemForFile.filePath)">
              <v-btn
                icon
                color="#a2212b"
                class="current-file-download"
                title="Tải file hiện tại"
                @click="downloadFile(selectedItemForFile.fileInform || selectedItemForFile.filePath)"
              >
                <v-icon>mdi-file-download-outline</v-icon>
              </v-btn>
            </template>
            <template v-else>
              <v-icon color="#bdbdbd">mdi-file-download-outline</v-icon>
              <span class="grey--text text--darken-1 ml-4">Chưa có file</span>
            </template>
          </div>

          <div class="d-flex align-center file-update-select-row">
            <v-file-input
              v-model="newFile"
              label="Chọn file mới"
              prepend-icon="mdi-file-download-outline"
              show-size
              color="#a2212b"
              class="file-update-input"
              @click:prepend="downloadFile(getCurrentFilePath())"
            ></v-file-input>
          </div>
        </v-card-text>
        <v-card-actions class="px-6 py-4 file-update-actions">
          <v-spacer></v-spacer>
          <v-btn text color="#333" class="text-none px-3" @click="updateFileDialog = false">
            Đóng <v-icon right class="ml-1">mdi-close</v-icon>
          </v-btn>
          <v-btn color="#a2212b" depressed class="white--text text-none px-5 file-update-save" @click="updateFile">
            Lưu <v-icon right class="ml-1">mdi-content-save</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import feeService from '~/services/feeTeacherByClassService'
import uploadServices from '~/services/uploadServices'
import ChangeableStatus from '~/components/Base/ChangeableStatus.vue'

export default {
  name: 'FeeTeacherByClassPage',
  components: {
    BaseTable,
    ChangeableStatus,
  },
  data() {
    return {
      detailDialog: false,
      updateFileDialog: false,
      detailData: null,
      selectedItemForFile: null,
      newFile: null,
      isMobileDevice: false,
      loading: false,
      filters: {
        teacherId: '',
        examId: '',          
        retakeSessionId: '', 
        status: '',          
      },
      activeFilters: {
        teacherId: '',
        examId: '',
        retakeSessionId: '',
        status: '',
      },
      teacherOptions: [],
      sessionOptions: [],
      examOptions: [],
      
      statusList: [
        { value: 'COMPLETE_PAID', text: 'Đã thanh toán', color: '#4caf50' },
        { value: 'WAIT_PAID', text: 'Chưa thanh toán', color: '#a2212b' },
        { value: 'CANCELED_PAID', text: 'Hủy thanh toán', color: '#f44336' },
      ],

      itemList: [],
      totalRecords: 0,
      totalPages: 1,
      currentPage: 1,
      pageInput: 1,
      itemsPerPage: 50,

      tableHeaders: [
        { text: 'STT', value: 'index', align: 'center', width: '60px', sortable: false },
        { text: 'Mã lớp học lại', value: 'classCode', align: 'left', minWidth: '140px', sortable: false },
        { text: 'Loại lớp', value: 'classType', align: 'left', minWidth: '160px', sortable: false },
        { text: 'Đợt học lại', value: 'examName', align: 'left', minWidth: '110px', sortable: false },
        { text: 'Thu học phí SV', value: 'tuitionCoefficient', align: 'center', minWidth: '100px', sortable: false },
        { text: 'Thanh toán giảng dạy', value: 'teacherCoefficient', align: 'center', minWidth: '110px', sortable: false },
        { text: 'Số tín chỉ học phí', value: 'creditTuition', align: 'center', minWidth: '90px', sortable: false },
        { text: 'Giảng viên', value: 'teacherName', align: 'left', minWidth: '130px', sortable: false },
        { text: 'Tên học phần', value: 'courseName', align: 'left', minWidth: '180px', sortable: false },
        { text: 'Tổng phí', value: 'totalFee', align: 'right', minWidth: '120px', sortable: false },
        { text: 'Thuế thu nhập cá nhân', value: 'totalTaxFee', align: 'right', minWidth: '120px', sortable: false },
        { text: 'File thông tin', value: 'fileInform', align: 'center', minWidth: '90px', sortable: false },
        { text: 'T.T xuất giấy xác nhận', value: 'isExported', align: 'center', minWidth: '140px', sortable: false },
        { text: 'Trạng thái', value: 'status', align: 'center', minWidth: '140px', sortable: false },
        { text: 'Chức năng', value: 'actions', align: 'center', width: '90px', sortable: false },
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
        const [teacherRes, sessionRes, examRes] = await Promise.all([
          feeService.getTeachers({ status: 'ACTIVE', channel: 'CMS' }).catch(() => null),
          feeService.getRetakeSessions({ channel: 'CMS' }).catch(() => null),
          feeService.getExamList({ channel: 'CMS' }).catch(() => null),
        ])

        if (teacherRes) {
          const list = Array.isArray(teacherRes) ? teacherRes : teacherRes.data || teacherRes.content || []
          this.teacherOptions = list.map(item => ({ text: item.fullName || item.name, value: item.id }))
        }
        if (sessionRes) {
          const list = Array.isArray(sessionRes) ? sessionRes : sessionRes.data || sessionRes.content || []
          this.sessionOptions = list.map(item => ({ text: item.code || item.name, value: item.id || item.code }))
        }
        if (examRes) {
          const list = Array.isArray(examRes) ? examRes : examRes.data || examRes.content || []
          this.examOptions = list.map(item => ({ text: item.code || item.name, value: item.id || item.code }))
        }
      } catch (error) {
        console.error('Lỗi tải danh mục:', error)
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
        teacherId: this.extractValue(this.filters.teacherId),
        examId: this.extractValue(this.filters.examId),
        retakeSessionId: this.extractValue(this.filters.retakeSessionId),
        status: this.extractValue(this.filters.status),
      }
      this.currentPage = 1
      this.pageInput = 1
      this.loadData()
    },

    refreshData() {
      this.filters = {
        teacherId: '',
        examId: '',          
        retakeSessionId: '', 
        status: '',          
      }
      this.activeFilters = {
        teacherId: '',
        examId: '',
        retakeSessionId: '',
        status: '',
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

        // Đưa các tham số lọc vào nếu có
        if (this.activeFilters.teacherId !== '') {
          baseParams.teacherId = this.activeFilters.teacherId
        }
        if (this.activeFilters.examId !== '') {
          baseParams.examId = this.activeFilters.examId
        }
        if (this.activeFilters.retakeSessionId !== '') {
          baseParams.retakeSessionId = this.activeFilters.retakeSessionId
          baseParams.examSessionId = this.activeFilters.retakeSessionId
        }
        if (this.activeFilters.status !== '') {
          baseParams.status = this.activeFilters.status
          baseParams.paymentFeeStatus = this.activeFilters.status
        }

        const res = await feeService.getList(baseParams)
        if (res) {
          // Bóc tách linh hoạt mọi cấu trúc response của API (data, content, items...)
          const rootData = res.data !== undefined ? res.data : res
          const allItems = Array.isArray(rootData) ? rootData : (rootData.data || rootData.content || rootData.items || [])
          
          // Lấy tổng số bản ghi chuẩn xác từ các trường trả về của backend
          const rawTotal = rootData.totalElements ?? rootData.totalRecords ?? rootData.total ?? (res.totalElements || res.totalRecords || res.total)
          this.totalRecords = rawTotal !== undefined ? Number(rawTotal) : allItems.length

          this.itemList = allItems
          this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage) || 1
        }
      } catch (error) {
        console.error('Lỗi tải danh sách thanh toán:', error)
        this.itemList = []
        this.totalRecords = 0
        this.totalPages = 1
      } finally {
        this.loading = false
      }
    },

    getClassTypeBadge(item) {
      const type = item.classType || item.classCoefficientDto?.classType || item.classtype || item.type
      const coef = Number(item.coefficient ?? item.classCoefficientDto?.coefficient ?? item.classCoefficientDto?.classCoefficient)

      if (type === 'COMBINE_CLASS') {
        if (coef === 1.7) return { text: 'Lớp ghép (Chuyên ngành)', color: '#757575' }
        if (coef === 1.5) return { text: 'Lớp ghép (Đại cương)', color: '#757575' }
        return { text: 'Lớp ghép', color: '#757575' }
      }
      if (type === 'NEW_CLASS') {
        return { text: 'Lớp mở', color: '#4caf50' }
      }
      if (type === 'PROJECT_BASED_CLASS') {
        if (coef === 2.0) return { text: 'Đồ án môn học (HP.DAMH)', color: '#f44336' }
        if (coef === 1.0) return { text: 'Đồ án môn học (HPTT)', color: '#f44336' }
        return { text: 'Đồ án môn học', color: '#f44336' }
      }
      return { text: type || 'Khác', color: '#757575' }
    },

    getClassTypeText(item) {
      const type = item.classType || item.classCoefficientDto?.classType || item.classtype || item.type
      const coefficient =
        item.coefficient ??
        item.classCoefficientDto?.coefficient ??
        item.classCoefficientDto?.classCoefficient
      const coef = Number(coefficient)

      if (type === 'COMBINE_CLASS') {
        if (coef === 1.7) return 'Lớp ghép (Chuyên ngành)'
        if (coef === 1.5) return 'Lớp ghép (Đại cương)'
        return 'Lớp ghép'
      }
      if (type === 'NEW_CLASS') return 'Lớp mở'
      if (type === 'PROJECT_BASED_CLASS') {
        if (coef === 2.0) return 'Đồ án môn học (HP.DAMH)'
        if (coef === 1.0) return 'Đồ án môn học (HPTT)'
        return 'Đồ án môn học'
      }
      return type || '---'
    },

    getStatusText(status) {
      const found = this.statusList.find(s => s.value === status)
      return found ? found.text : 'Chưa thanh toán'
    },

    formatMoney(val) {
      if (!val && val !== 0) return '0đ'
      return Number(val).toLocaleString('vi-VN') + 'đ'
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

    async handleStatusChange(item, selectedItem) {
      try {
        const newStatusValue = selectedItem?.value ?? selectedItem
        const response = await feeService.changeStatus(item.id, newStatusValue)

        if (
          response?.success === false ||
          response?.error ||
          (response?.code && Number(response.code) >= 400)
        ) {
          const message =
            response?.message ||
            response?.error?.message ||
            'Không thể cập nhật trạng thái thanh toán.'
          if (this.$toast) {
            this.$toast.error(message)
          } else {
            alert(message)
          }
          return
        }

        item.status = newStatusValue
        item.paymentFeeStatus = newStatusValue
        await this.loadData()
        if (this.$toast) {
          this.$toast.success('Cập nhật trạng thái thành công!')
        }
      } catch (error) {
        console.error('Lỗi khi đổi trạng thái:', error)
        const message =
          error?.response?.data?.message ||
          error?.message ||
          'Có lỗi xảy ra khi cập nhật trạng thái.'
        if (this.$toast) {
          this.$toast.error(message)
        } else {
          alert(message)
        }
      }
    },

    async viewDetail(item) {
      try {
        const response = await feeService.getDetail(item.id)
        if (response?.success === false || response?.error) {
          throw new Error(
            response?.error?.message ||
            response?.message ||
            'Không thể tải thông tin chi tiết thanh toán.'
          )
        }

        const rawData = response?.data !== undefined ? response.data : response
        const detail = rawData?.data || rawData?.result || rawData
        if (!detail || typeof detail !== 'object') {
          throw new Error('API không trả về thông tin chi tiết thanh toán.')
        }

        this.detailData = detail
        this.detailDialog = true
      } catch (error) {
        console.error('Lỗi khi lấy chi tiết:', error)
        const message = error?.message || 'Không thể tải thông tin chi tiết!'
        if (this.$toast) {
          this.$toast.error(message)
        } else {
          alert(message)
        }
      }
    },

    openUpdateFileDialog(item) {
      this.selectedItemForFile = item
      this.newFile = null
      this.updateFileDialog = true
    },

    getCurrentFilePath() {
      return this.selectedItemForFile?.fileInform || this.selectedItemForFile?.filePath || ''
    },

    downloadFile(filePath) {
      if (!filePath) return
      if (filePath instanceof File) {
        const objectUrl = window.URL.createObjectURL(filePath)
        const link = document.createElement('a')
        link.href = objectUrl
        link.download = filePath.name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(objectUrl)
        return
      }

      const link = document.createElement('a')
      link.href = filePath
      link.setAttribute('download', '')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },

    async updateFile() {
      if (!this.newFile) {
        if (this.$showWarning) {
          this.$showWarning('Vui lòng chọn file mới!')
        } else {
          alert('Vui lòng chọn file mới!')
        }
        return
      }

      if (!this.selectedItemForFile?.id) {
        const message = 'Không xác định được bản ghi cần cập nhật file.'
        if (this.$showError) {
          this.$showError(message)
        } else {
          alert(message)
        }
        return
      }

      try {
        this.loading = true
        const formData = new FormData()
        formData.append('file', this.newFile)

        const uploadResponse = await uploadServices.upload(formData)
        if (!uploadResponse?.success || !uploadResponse?.data?.url) {
          throw new Error(
            uploadResponse?.message ||
            uploadResponse?.error?.message ||
            'Tải file lên máy chủ thất bại.'
          )
        }

        const updateResponse = await feeService.updateFile(
          this.selectedItemForFile.id,
          { fileInform: uploadResponse.data.url }
        )
        if (!updateResponse?.success) {
          throw new Error(
            updateResponse?.message ||
            updateResponse?.error?.message ||
            'Không thể cập nhật file cho bản ghi.'
          )
        }

        if (this.$showSuccess) {
          this.$showSuccess('Cập nhật file thành công!')
        }
        this.selectedItemForFile.fileInform = uploadResponse.data.url
        this.updateFileDialog = false
        await this.loadData()
      } catch (error) {
        console.error('Lỗi khi cập nhật file:', error)
        const message = error?.message || 'Cập nhật file thất bại!'
        if (this.$showError) {
          this.$showError(message)
        } else {
          alert(message)
        }
      } finally {
        this.loading = false
      }
    },

    async exportExcel() {
      try {
        const params = {
          teacherId: this.activeFilters.teacherId || undefined,
          examId: this.activeFilters.examId || undefined,
          retakeSessionId: this.activeFilters.retakeSessionId || undefined,
          examSessionId: this.activeFilters.retakeSessionId || undefined,
          status: this.activeFilters.status || undefined,
          paymentFeeStatus: this.activeFilters.status || undefined,
          channel: 'CMS',
        }

        const response = await feeService.exportExcel(params)
        if (!response?.success || !(response.data instanceof Blob) || !response.data.size) {
          throw new Error(
            response?.message ||
            response?.error?.message ||
            'API không trả về file Excel hợp lệ.'
          )
        }

        const blob = response.data
        const signature = new Uint8Array(await blob.slice(0, 4).arrayBuffer())
        const isXlsx = signature[0] === 0x50 && signature[1] === 0x4b

        if (!isXlsx) {
          const responseText = await blob.text()
          let errorMessage = 'Máy chủ không trả về workbook Excel hợp lệ.'

          try {
            const payload = JSON.parse(responseText)
            const result = payload?.data || payload?.result || payload
            const downloadUrl = result?.url || result?.fileUrl

            if (downloadUrl) {
              this.$download(downloadUrl)
              return
            }

            errorMessage =
              payload?.error?.message ||
              payload?.message ||
              errorMessage
          } catch (error) {
            if (response.headers?.['content-type']?.includes('text/html')) {
              errorMessage = 'API xuất file trả về trang HTML thay vì file Excel.'
            }
          }

          throw new Error(errorMessage)
        }

        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        const contentDisposition = response.headers?.['content-disposition'] || ''
        const fileNameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i)
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '_')
        link.download = fileNameMatch
          ? decodeURIComponent(fileNameMatch[1] || fileNameMatch[2])
          : `danh-sach-thanh-toan-giang-vien_${dateStr}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.setTimeout(() => window.URL.revokeObjectURL(link.href), 1000)
      } catch (error) {
        console.error('Lỗi xuất file excel:', error)
        const message = error?.message || 'Không thể xuất file thanh toán giảng viên.'
        if (this.$showError) {
          this.$showError(message)
        } else {
          alert(message)
        }
      }
    },
  }
}
</script>

<style scoped>
.text-red-bold {
  color: #A62229 !important;
}
.file-update-title {
  min-height: 50px;
  background-color: #a2212b !important;
  border-bottom: 1px solid #e0e0e0;
  font-size: 22px;
}
.file-update-content {
  min-height: 128px;
}
.current-file-row {
  min-height: 38px;
  font-size: 14px;
  color: #666;
}
.file-update-accent {
  color: #a2212b;
}
.file-update-input {
  flex: 1 1 auto;
  min-width: 0;
  margin-top: 6px;
  font-size: 14px;
}
.current-file-download {
  flex: 0 0 auto;
}
.file-update-select-row {
  gap: 8px;
}
.file-update-actions {
  min-height: 60px;
  border-top: 1px solid #e0e0e0;
}
.file-update-save {
  min-width: 90px;
  min-height: 42px;
  border-radius: 10px;
  font-size: 16px;
}
.detail-dialog >>> .error--text {
  color: #a2212b !important;
}
.bg-white {
  background-color: #ffffff !important;
}
.filter-input >>> .v-input__slot {
  border-radius: 6px !important;
  min-height: 38px !important;
}
.btn-square-action {
  border-radius: 6px !important;
  height: 38px !important;
  min-width: 38px !important;
}
.cursor-pointer {
  cursor: pointer;
}

.sticky-toolbar {
  position: sticky;
  top: 0;
  z-index: 5;
  flex: 0 0 auto;
  background-color: #ffffff;
}

.fee-teacher-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  overflow: hidden;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr)) auto;
  align-items: center;
  gap: 5px;
  padding: 6px;
}

.status-filter {
  grid-column: 1 / span 3;
}

.filter-actions {
  grid-column: 4;
  grid-row: 2;
  gap: 5px;
}

.sticky-bottom-bar {
  background-color: #ffffff;
  flex: 0 0 auto;
}

.table-scroll-container {
  overflow-x: auto;
  flex: 1 1 auto;
  min-height: 0;
}

.table-scroll-container >>> th {
  position: sticky !important;
  top: 0;
  z-index: 2;
  background-color: #f5f5f5 !important;
}

.pagination-bottom-container {
  overflow-x: auto;
}

::v-deep .v-data-footer {
  display: none !important;
}

@media (max-width: 800px) {
  .filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) auto;
  }

  .status-filter {
    grid-column: 1 / span 2;
  }

  .filter-actions {
    grid-column: 3;
  }
}

@media (max-width: 599px) {
  .fee-teacher-page {
    height: auto;
    min-height: calc(100vh - 56px);
    overflow: visible;
  }

  .sticky-toolbar {
    top: 0;
  }

  .filter-grid {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .filter-grid > .filter-input,
  .status-filter {
    grid-column: 1 / -1;
  }

  .filter-actions {
    grid-column: 2;
    grid-row: auto;
  }

  .table-scroll-container {
    flex: 0 0 auto;
    min-height: 0;
  }
}
</style>