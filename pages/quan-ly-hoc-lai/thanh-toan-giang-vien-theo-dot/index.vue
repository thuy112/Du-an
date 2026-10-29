<template>
  <div class="fee-teacher-exam-page pa-3 pa-md-4 bg-white" :class="{ 'is-mobile-device': isMobileDevice }">
    <!-- TIÊU ĐỀ TRANG -->
    <div class="text-h6 font-weight-bold black--text mb-3">
      Danh sách thanh toán giảng viên theo đợt (<span class="text-red-bold">{{ totalRecords }}</span>)
    </div>

    <!-- BỘ LỌC TÌM KIẾM CỐ ĐỊNH -->
    <div class="filter-container mb-3 sticky-filter">
      <div class="d-flex align-center flex-wrap" style="gap: 5px; padding: 6px;">
        <v-text-field
          v-model="filters.classCode"
          placeholder="Mã lớp học lại"
          outlined
          dense
          hide-details
          clearable
          class="filter-input flex-grow-1"
          style="min-width: 150px;"
        ></v-text-field>

        <v-select
          v-model="filters.teacherId"
          :items="teacherOptions"
          placeholder="Giảng viên"
          outlined
          dense
          hide-details
          clearable
          class="filter-input flex-grow-1"
          style="min-width: 160px;"
        ></v-select>

        <v-select
          v-model="filters.examSessionCode"
          :items="examOptions"
          placeholder="Lớp học lại"
          outlined
          dense
          hide-details
          clearable
          class="filter-input flex-grow-1"
          style="min-width: 150px;"
        ></v-select>

        <v-select
          v-model="filters.paymentFeeStatus"
          :items="paymentTeacherStatusList"
          item-text="text"
          item-value="value"
          placeholder="Trạng thái"
          outlined
          dense
          hide-details
          clearable
          class="filter-input flex-grow-1"
          style="min-width: 140px;"
        ></v-select>

        <div class="d-flex align-center" style="gap: 5px;">
          <v-btn icon color="#A62229" class="btn-square-action" @click="refreshData" title="Làm mới">
            <v-icon size="22">mdi-refresh</v-icon>
          </v-btn>

          <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="handleSearch" title="Tìm kiếm">
            <v-icon size="22">mdi-magnify</v-icon>
          </v-btn>

          <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="openAddModal" title="Thêm mới">
            <v-icon size="22">mdi-plus</v-icon>
          </v-btn>
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

        <!-- Đợt học lại -->
        <template #[`item.examName`]="{ item }">
          <span>{{ item.examName || '-' }}</span>
        </template>

        <!-- Tên đợt thanh toán -->
        <template #[`item.name`]="{ item }">
          <span>{{ item.name || '-' }}</span>
        </template>

        <!-- Mã đợt thanh toán -->
        <template #[`item.code`]="{ item }">
          <span>{{ item.code || '-' }}</span>
        </template>

        <!-- Ngày thanh toán -->
        <template #[`item.paymentDate`]="{ item }">
          <span>{{ formatDate(item.paymentDate) }}</span>
        </template>

        <!-- Mã lớp học lại -->
        <template #[`item.examSessionsCode`]="{ item }">
          <span>{{ formatExamSessions(item.examSessions) }}</span>
        </template>

        <!-- File thanh toán -->
        <template #[`item.fileName`]="{ item }">
          <v-btn
            v-if="item.fileName"
            icon
            small
            color="#A62229"
            :href="item.fileName"
            target="_blank"
            title="Tải xuống file thanh toán"
          >
            <v-icon size="26">mdi-file-download-outline</v-icon>
          </v-btn>
          <v-btn
            v-else
            icon
            small
            disabled
            color="grey"
            title="Chưa có file"
          >
            <v-icon size="26">mdi-file-download-outline</v-icon>
          </v-btn>
        </template>

        <!-- Tổng phí -->
        <template #[`item.totalFee`]="{ item }">
          <span>{{ formatMoney(item.totalFee) }}</span>
        </template>

        <!-- Thuế TNCN -->
        <template #[`item.totalTaxFee`]="{ item }">
          <span>{{ formatMoney(item.totalTaxFee) }}</span>
        </template>

        <!-- Trạng thái thanh toán -->
        <template #[`item.paymentFeeStatus`]="{ item }">
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-chip
                v-bind="attrs"
                v-on="on"
                small
                dark
                :color="getStatusColor(item.paymentFeeStatus)"
                class="font-weight-medium cursor-pointer"
              >
                {{ getStatusText(item.paymentFeeStatus) }}
                <v-icon right x-small>mdi-menu-down</v-icon>
              </v-chip>
            </template>
            <v-list dense>
              <v-list-item v-for="st in paymentTeacherStatusList" :key="st.value" @click="updateStatus(item, st.value)">
                <v-list-item-title>{{ st.text }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>

        <!-- Trạng thái gửi mail -->
        <template #[`item.isSendEmail`]="{ item }">
          <v-chip
            small
            dark
            :color="item.isSendEmail === 1 || item.isSendEmail === true ? '#4caf50' : '#ffae1f'"
            class="font-weight-medium text-caption"
          >
            {{ item.isSendEmail === 1 || item.isSendEmail === true ? 'Đã gửi' : 'Chưa gửi' }}
          </v-chip>
        </template>

        <!-- T.T xuất file tổng hợp -->
        <template #[`item.isExportedSummary`]="{ item }">
          <v-chip
            small
            dark
            :color="item.isExportedSummary === 1 || item.isExportedSummary === true ? '#4caf50' : '#ffae1f'"
            class="font-weight-medium text-caption"
          >
            {{ item.isExportedSummary === 1 || item.isExportedSummary === true ? 'Đã xuất' : 'Chưa xuất' }}
          </v-chip>
        </template>

        <!-- Cột Chức năng -->
        <template #[`item.actions`]="{ item }">
          <v-menu offset-y left>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon small v-bind="attrs" v-on="on">
                <v-icon size="20">mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list dense class="action-dropdown-list">
              <v-list-item @click="viewDetail(item)">
                <v-list-item-icon class="mr-2">
                  <v-icon small color="#00bcd4">mdi-eye-outline</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Chi tiết</v-list-item-title>
              </v-list-item>

              <v-list-item @click="exportExcelSummary(item)">
                <v-list-item-icon class="mr-2">
                  <v-icon small color="#4caf50">mdi-export</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Xuất Excel file tổng hợp</v-list-item-title>
              </v-list-item>

              <v-list-item @click="exportExcelDetail(item)">
                <v-list-item-icon class="mr-2">
                  <v-icon small color="#4caf50">mdi-export</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Xuất Excel file chi tiết</v-list-item-title>
              </v-list-item>

              <v-list-item @click="exportExcelCompact(item)">
                <v-list-item-icon class="mr-2">
                  <v-icon small color="#4caf50">mdi-export</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Xuất Excel file chi tiết (Rút gọn)</v-list-item-title>
              </v-list-item>

              <v-list-item @click="updateRecord(item)">
                <v-list-item-icon class="mr-2">
                  <v-icon small color="#ffae1f">mdi-pencil-outline</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Cập nhật</v-list-item-title>
              </v-list-item>

              <v-list-item @click="deleteRecord(item)">
                <v-list-item-icon class="mr-2">
                  <v-icon small color="#f44336">mdi-delete-outline</v-icon>
                </v-list-item-icon>
                <v-list-item-title class="red--text">Xóa</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </BaseTable>
    </div>

    <!-- THANH BOTTOM ACTIONS & PHÂN TRANG THU GỌN -->
    <div class="pagination-bottom-container mt-4 pt-3 d-flex align-center justify-space-between flex-wrap gap-3 border-top">
      <div class="d-flex align-center gap-2 flex-wrap"></div>

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

        <v-btn color="#A2212B" dark depressed class="page-current-btn" min-width="36" height="36" small>
          {{ currentPage }}
        </v-btn>

        <v-btn icon outlined small color="grey" :disabled="currentPage >= totalPages" @click="changePage(currentPage + 1)">
          <v-icon small>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- MODAL THÊM MỚI ĐỢT THANH TOÁN -->
    <v-dialog v-model="open" max-width="900px" persistent>
      <v-form ref="form" @submit.prevent="handleAdd">
        <v-card class="pa-0 rounded-lg overflow-hidden">
          <!-- Header Modal màu đỏ -->
          <div class="px-4 py-3 d-flex align-center justify-space-between" style="background-color: #A2212B; color: white;">
            <div class="text-subtitle-1 font-weight-bold">Thêm mới đợt thanh toán GV theo lớp học lại</div>
            <v-btn icon dark small @click="open = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <div class="pa-4">
            <v-row>
              <!-- Thông tin thanh toán (Tải file .xlsx) -->
              <v-col cols="12" md="7">
                <v-file-input
                  placeholder="Thông tin thanh toán"
                  accept=".xlsx, .xls, .pdf"
                  outlined
                  dense
                  hide-details
                  prepend-icon=""
                  append-icon="mdi-file-upload-outline"
                  class="custom-input"
                  @change="handleUpload"
                ></v-file-input>
              </v-col>

              <!-- Ngày thanh toán -->
              <v-col cols="12" md="5">
                <v-menu
                  v-model="menuDate"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="params.paymentDate"
                      label="Ngày thanh toán (*)"
                      outlined
                      dense
                      hide-details
                      readonly
                      clearable
                      v-bind="attrs"
                      v-on="on"
                      append-icon="mdi-close"
                      @click:append="params.paymentDate = ''"
                      class="custom-input custom-date-input"
                      :rules="[v => !!v || 'Vui lòng chọn ngày thanh toán']"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="pickerDate"
                    no-title
                    scrollable
                    color="#A2212B"
                    @input="menuDate = false; formatSelectedDate(pickerDate)"
                  ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>

            <!-- Chọn lớp học lại -->
            <v-select
              v-model="params.examSessionIds"
              :items="examSessionList"
              item-text="name"
              item-value="id"
              label="Chọn lớp học lại (*)"
              outlined
              dense
              multiple
              chips
              small-chips
              clearable
              @change="onClassesSelected"
              class="mt-3 mb-3 custom-input"
              :rules="[v => (v && v.length > 0) || 'Vui lòng chọn ít nhất một lớp học lại']"
            ></v-select>

            <!-- Tiêu đề danh sách giảng viên & Ô tìm kiếm -->
            <div class="d-flex align-center justify-space-between mb-2 flex-wrap" style="gap: 10px;">
              <div class="text-subtitle-2 font-weight-bold">
                Danh sách giảng viên (<span class="text-red-bold">{{ filteredTeacherList.length }}</span>)
              </div>
              <v-text-field
                v-model="teacherSearchKeyword"
                placeholder="Tìm kiếm"
                outlined
                dense
                hide-details
                clearable
                append-icon="mdi-magnify"
                style="max-width: 280px;"
                class="custom-input"
              ></v-text-field>
            </div>

            <!-- Bảng danh sách giảng viên -->
            <v-data-table
              :headers="teacherTableHeaders"
              :items="filteredTeacherList"
              dense
              class="elevation-1 mb-3"
              no-data-text="Vui lòng chọn lớp học lại để xem danh sách giảng viên"
              style="max-height: 280px; overflow-y: auto;"
            >
              <template #[`item.stt`]="{ index }">
                <span>{{ index + 1 }}</span>
              </template>
              <template #[`item.unitPrice`]="{ item }">
                <span>{{ formatMoney(item.unitPrice) }}</span>
              </template>
              <template #[`item.classType`]="{ item }">
                <span>{{ formatClassType(item.classType) }}</span>
              </template>
              <template #[`item.totalAmount`]="{ item }">
                <span>{{ formatMoney(item.totalAmount) }}</span>
              </template>
            </v-data-table>

            <!-- Tổng tiền -->
            <div class="text-right font-weight-bold text-subtitle-1 mb-4 text-red-bold">
              Tổng tiền: {{ formatMoney(calculateTotalAmount) }} VNĐ
            </div>

            <!-- Footer Modal: Đóng / Lưu -->
            <div class="d-flex justify-end align-center pt-2 border-top" style="gap: 8px;">
              <v-btn outlined color="grey darken-1" class="text-none px-4" height="38" @click="open = false">
                Đóng <v-icon right small>mdi-close</v-icon>
              </v-btn>
              <v-btn color="#A2212B" dark depressed class="text-none px-4" height="38" @click="handleAdd">
                Lưu <v-icon right small class="ml-1">mdi-content-save</v-icon>
              </v-btn>
            </div>
          </div>
        </v-card>
      </v-form>
    </v-dialog>
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import feeService from '~/services/feeTeacherByExamService'

export default {
  name: 'FeeTeacherByExamPage',
  components: {
    BaseTable,
  },
  data() {
    return {
      pickerDate: '',
      isMobileDevice: false,
      loading: false,
      filters: {
        classCode: '',
        teacherId: '',
        examSessionCode: '',
        paymentFeeStatus: '',
      },
      activeFilters: {
        classCode: '',
        teacherId: '',
        examSessionCode: '',
        paymentFeeStatus: '',
      },
      teacherOptions: [],
      examOptions: [],
      
      paymentTeacherStatusList: [
        { value: 'WAIT_PAID', text: 'Chờ thanh toán', color: '#a2212b' },
        { value: 'COMPLETE_PAID', text: 'Đã thanh toán', color: '#4caf50' },
        { value: 'CANCELED_PAID', text: 'Hủy thanh toán', color: '#f44336' },
      ],

      itemList: [],
      totalRecords: 0,
      totalPages: 1,
      currentPage: 1,
      pageInput: 1,
      itemsPerPage: 50,

      tableHeaders: [
        { value: 'stt', text: 'STT', align: 'center', width: '60px', sortable: false },
        { value: 'examName', text: 'Đợt học lại', align: 'left', minWidth: '110px', sortable: false },
        { value: 'name', text: 'Tên đợt thanh toán', align: 'left', minWidth: '180px', sortable: false },
        { value: 'code', text: 'Mã đợt thanh toán', align: 'left', minWidth: '150px', sortable: false },
        { value: 'paymentDate', text: 'Ngày thanh toán', align: 'center', minWidth: '120px', sortable: false },
        { value: 'examSessionsCode', text: 'Mã lớp học lại', align: 'left', minWidth: '140px', sortable: false },
        { value: 'fileName', text: 'File thanh toán', align: 'center', minWidth: '90px', sortable: false },
        { value: 'totalFee', text: 'Tổng phí', align: 'right', minWidth: '120px', sortable: false },
        { value: 'totalTaxFee', text: 'Thuế thu nhập cá nhân', align: 'right', minWidth: '140px', sortable: false },
        { value: 'paymentFeeStatus', text: 'Trạng thái', align: 'center', minWidth: '140px', sortable: false },
        { value: 'isSendEmail', text: 'Trạng thái gửi mail', align: 'center', minWidth: '130px', sortable: false },
        {
            value: 'isExportedSummary',
            text: 'T.T xuất file tổng hợp',
            align: 'center',
            minWidth: '140px',
            sortable: false,
        },
        { value: 'actions', text: 'Chức năng', align: 'center', width: '90px', sortable: false },
      ],

      // Dữ liệu Modal Thêm Mới chuẩn API mẫu
      open: false,
      menuDate: false,
      teacherSearchKeyword: '',
      examSessionList: [],
      teacherList: [],
      params: {
        fileUrl: '',
        fileName: '',
        paymentDate: '',
        examSessionIds: [],
        channel: 'CMS'
      },
      teacherTableHeaders: [
        { text: 'STT', value: 'stt', align: 'center', width: '60px', sortable: false },
        { text: 'Họ tên giảng viên', value: 'teacherName', align: 'left', sortable: false },
        { text: 'Lớp giảng dạy', value: 'classCode', align: 'left', sortable: false },
        { text: 'Số tiết', value: 'period', align: 'center', sortable: false },
        { text: 'Số lượng sinh viên', value: 'numberOfStudent', align: 'center', sortable: false },
        { text: 'Định mức', value: 'unitPrice', align: 'right', sortable: false },
        { text: 'Loại lớp', value: 'classType', align: 'left', sortable: false },
        { text: 'Số tiền', value: 'totalAmount', align: 'right', sortable: false },
      ],
    }
  },
  watch: {
    open(newVal) {
      if (!newVal) {
        Object.assign(this.$data, this.$options.data());
        if (this.$refs.form) this.$refs.form.resetValidation();
      } else {
        this.getTrainingTypes();
      }
    },
  },
  async mounted() {
    if (typeof navigator !== 'undefined') {
      this.isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }
    await this.fetchCatalogs()
    await this.loadData()
  },
  computed: {
    filteredTeacherList() {
      if (!this.teacherSearchKeyword) return this.teacherList
      const keyword = this.teacherSearchKeyword.toLowerCase().trim()
      return this.teacherList.filter(item => 
        (item.teacherName && item.teacherName.toLowerCase().includes(keyword)) ||
        (item.classCode && item.classCode.toLowerCase().includes(keyword))
      )
    },
    calculateTotalAmount() {
      return this.teacherList.reduce((sum, item) => sum + (Number(item.totalAmount) || 0), 0)
    }
  },
  methods: {
    async fetchCatalogs() {
      try {
        const [teacherRes, examRes] = await Promise.all([
          feeService.getTeachers({ status: 'ACTIVE', channel: 'CMS' }, this.$axios).catch(() => null),
          feeService.getRetakeCourses({ pageSize: 100, pageIndex: 1, channel: 'CMS' }, this.$axios).catch(() => null),
        ])

        if (teacherRes) {
          const list = Array.isArray(teacherRes) ? teacherRes : teacherRes.data || teacherRes.content || []
          this.teacherOptions = list.map(item => ({ text: item.fullName || item.name, value: item.id }))
        }
        if (examRes) {
          const list = Array.isArray(examRes) ? examRes : examRes.data || examRes.content || []
          this.examOptions = list.map(item => ({ text: item.code || item.name, value: item.code || item.id }))
        }
      } catch (error) {
        console.error('Lỗi tải danh mục:', error)
      }
    },

    async loadData() {
      this.loading = true
      try {
        const params = {
          pageIndex: this.currentPage,
          pageSize: this.itemsPerPage,
          classCode: this.activeFilters.classCode || '',
          teacherId: this.activeFilters.teacherId || '',
          examSessionCode: this.activeFilters.examSessionCode || '',
          paymentFeeStatus: this.activeFilters.paymentFeeStatus || '',
          channel: 'CMS',
        }

        const res = await feeService.getList(params, this.$axios)
        if (res) {
          const rootData = res.data !== undefined ? res.data : res
          this.itemList = Array.isArray(rootData) ? rootData : rootData.data || rootData.content || rootData.items || []
          this.totalRecords = rootData.totalElements || rootData.totalRecords || rootData.total || this.itemList.length
          this.totalPages = Math.max(1, Math.ceil(this.totalRecords / this.itemsPerPage))
          
          if (this.currentPage > this.totalPages) {
            this.currentPage = this.totalPages
            this.pageInput = this.totalPages
          }
        }
      } catch (error) {
        console.error('Lỗi tải danh sách thanh toán theo đợt:', error)
        this.itemList = []
        this.totalRecords = 0
        this.totalPages = 1
      } finally {
        this.loading = false
      }
    },

    formatExamSessions(sessions) {
      if (!sessions || !Array.isArray(sessions) || sessions.length === 0) return '-'
      return sessions.map(s => s.code).filter(Boolean).join(', ')
    },

    formatClassType(type) {
      if (type === 'NEW_CLASS') return 'Lớp mở'
      if (type === 'COMBINE_CLASS') return 'Lớp ghép'
      if (type === 'PROJECT_BASED_CLASS') return 'Đồ án môn học'
      return type || 'Khác'
    },

    formatSelectedDate(dateVal) {
      if (!dateVal) return
      // dateVal nhận từ v-date-picker có dạng YYYY-MM-DD
      const [year, month, day] = dateVal.split('-')
      // Chuyển thành DD/MM/YYYY có dấu gạch chéo
      this.params.paymentDate = `${day}/${month}/${year}`
    },

    getStatusText(status) {
      const found = this.paymentTeacherStatusList.find(s => s.value === status)
      return found ? found.text : 'Chờ thanh toán'
    },

    getStatusColor(status) {
      const found = this.paymentTeacherStatusList.find(s => s.value === status)
      return found ? found.color : '#1976D2'
    },

    formatMoney(val) {
      if (!val && val !== 0) return '0đ'
      return Number(val).toLocaleString('vi-VN') + 'đ'
    },

    handleSearch() {
      this.activeFilters = { ...this.filters }
      this.currentPage = 1
      this.pageInput = 1
      this.loadData()
    },

    refreshData() {
      this.filters = { classCode: '', teacherId: '', examSessionCode: '', paymentFeeStatus: '' }
      this.handleSearch()
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

    updateStatus(item, newStatus) {
      item.paymentFeeStatus = newStatus
    },

    viewDetail(item) {
      console.log('Xem chi tiết:', item)
    },

    exportExcelSummary(item) {
      console.log('Xuất Excel file tổng hợp:', item)
    },

    exportExcelDetail(item) {
      console.log('Xuất Excel file chi tiết:', item)
    },

    exportExcelCompact(item) {
      console.log('Xuất Excel file chi tiết rút gọn:', item)
    },

    updateRecord(item) {
      console.log('Cập nhật bản ghi:', item)
    },

    deleteRecord(item) {
      console.log('Xóa bản ghi:', item)
    },

    openAddModal() {
      this.open = true
      const today = new Date()
      const day = String(today.getDate()).padStart(2, '0')
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const year = today.getFullYear()
      
      this.params = {
        fileUrl: '',
        fileName: '',
        paymentDate: `${day}/${month}/${year}`,
        examSessionIds: [],
        channel: 'CMS'
      }
      this.pickerDate = `${year}-${month}-${day}`
    },

    formatDate(dateStr) {
      if (!dateStr) return '-'
      // Nếu chuỗi có chứa khoảng trắng (VD: "12/05/2026 00:00:00" hoặc "2026-05-12 00:00:00")
      const parts = dateStr.split(' ')[0]
      return parts
    },

    async handleUpload(data) {
      if (!data) return
      try {
        const formData = new FormData()
        formData.append("file", data)
        const res = await feeService.uploadFile ? feeService.uploadFile(formData, this.$axios) : null
        if (res && res.success) {
          this.params.fileUrl = res?.data?.url || ''
          this.params.fileName = res?.data?.name || data.name
        } else {
          this.params.fileName = data.name
        }
      } catch (error) {
        console.error("Lỗi upload file:", error)
        this.params.fileName = data.name
      }
    },

    async getTrainingTypes() {
      try {
        const res = await feeService.getTeacherClass({ channel: 'CMS' }, this.$axios)
        const rootData = res.data !== undefined ? res.data : res
        const list = Array.isArray(rootData) ? rootData : rootData.data || rootData.content || []
        this.examSessionList = list.map((item) => ({
          id: item?.id,
          name: item?.name || `${item?.code || ''}-${item?.classroom || ''}`,
        }))
      } catch (error) {
        console.error("Lỗi lấy danh mục lớp:", error)
      }
    },

    async onClassesSelected(selectedIds) {
      if (!selectedIds || selectedIds.length === 0) {
        this.teacherList = []
        return
      }

      this.teacherList = []
      for (const id of selectedIds) {
        try {
          const res = await feeService.getTeacherListByClass({ ids: id, channel: 'CMS' }, this.$axios)
          const rootData = res.data !== undefined ? res.data : res
          const data = Array.isArray(rootData) ? rootData : [rootData]
          
          const mappedData = data.filter(Boolean).map(item => ({
            id: item.id,
            teacherName: item.name,
            classCode: item.classCode,
            period: item.period,
            numberOfStudent: item.numberOfStudent,
            unitPrice: item.unitPrice,
            classType: item.classType,
            totalAmount: item.amount,
          }))

          this.teacherList.push(...mappedData)
        } catch (error) {
          console.error(`Lỗi tải giảng viên cho lớp ID ${id}:`, error)
        }
      }
    },

    async handleAdd() {
      if (this.$refs.form && !this.$refs.form.validate()) return;
      try {
        // Chuẩn hóa ngày tháng thành định dạng DD/MM/YYYY
        let formattedDate = this.params.paymentDate;
        if (formattedDate && formattedDate.includes('-')) {
          const [year, month, day] = formattedDate.split(" ")[0].split('-');
          formattedDate = `${day}/${month}/${year}`;
        }

        // Map lại danh sách chi tiết các lớp và giảng viên tương ứng vào examSessionIds
        const detailedExamSessions = this.params.examSessionIds.map(classId => {
          // Lấy thông tin giảng viên tương ứng với lớp này trong teacherList
          const teacherItem = this.teacherList.find(t => t.classId === classId || t.id === classId || true);
          return {
            classId,
            teacherId: teacherItem ? teacherItem.teacherId : null,
            fee: teacherItem ? teacherItem.totalAmount : 0
          };
        });

        const payload = {
          fileUrl: this.params.fileUrl || '',
          fileName: this.params.fileName || '',
          paymentDate: formattedDate,
          examSessionIds: detailedExamSessions,
          channel: 'CMS'
        };

        if (feeService.createDecision) {
          await feeService.createDecision(payload, this.$axios);
        }

        this.open = false;
        this.loadData();
      } catch (error) {
        console.error("Error adding payment:", error);
      }
    },
  },
}
</script>

<style scoped>
.text-red-bold {
  color: #A62229 !important;
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

.sticky-filter {
  position: sticky;
  top: 0;
  z-index: 3;
  background-color: #ffffff;
}

.table-scroll-container {
  max-height: 600px;
  overflow-y: auto;
  position: relative;
}

.table-scroll-container >>> th {
  position: sticky !important;
  top: 0;
  z-index: 2;
  background-color: #f5f5f5 !important;
}

::v-deep .v-data-footer {
  display: none !important;
}

/* Tùy chỉnh màu sắc lịch Vuetify */
::v-deep .v-date-picker-header {
  background-color: #A2212B !important;
  color: white !important;
}
::v-deep .v-date-picker-header .v-btn {
  color: white !important;
}
::v-deep .v-date-picker-table .v-btn.v-btn--active {
  background-color: #A2212B !important;
  color: white !important;
}
</style>