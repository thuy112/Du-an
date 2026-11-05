<template>
  <div class="decision-fee-management-page pa-3 pa-md-4 bg-white" :class="{ 'is-mobile-device': isMobileDevice }">
    <!-- TIÊU ĐỀ TRANG -->
    <div class="d-flex align-center justify-between mb-3">
      <div class="text-h6 font-weight-bold black--text">
        Danh sách định mức phí (<span class="text-red-bold">{{ totalRecords }}</span>)
      </div>
    </div>

    <!-- BỘ LỌC TÌM KIẾM CỐ ĐỊNH PHÍA TRÊN -->
    <div class="filter-container mb-3 sticky-filter">
      <div class="d-flex align-center flex-wrap justify-space-between" style="gap: 8px; padding: 6px;">
        <div class="d-flex align-center flex-wrap flex-grow-1" style="gap: 8px;">
          <!-- Tìm kiếm từ khóa -->
          <v-text-field
            v-model="filters.name"
            placeholder="Tìm kiếm"
            outlined
            dense
            hide-details
            clearable
            class="filter-input"
            style="min-width: 200px; max-width: 250px;"
            @keyup.enter="handleSearch"
          ></v-text-field>

          <!-- Định mức phản hệ -->
          <v-select
            v-model="filters.decisionFeeType"
            :items="feeTypeList"
            item-text="text"
            item-value="value"
            placeholder="Định mức phản hệ"
            outlined
            dense
            hide-details
            clearable
            class="filter-input"
            style="min-width: 170px;"
          ></v-select>

          <!-- Học kỳ -->
          <v-select
            v-model="filters.semesterId"
            :items="semesterList"
            item-text="name"
            item-value="id"
            placeholder="Học kỳ"
            outlined
            dense
            hide-details
            clearable
            class="filter-input"
            style="min-width: 160px;"
          ></v-select>

          <!-- Trạng thái -->
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
            class="filter-input"
            style="min-width: 150px;"
          ></v-select>

          <!-- Nút thao tác (Làm mới, Tìm kiếm) -->
          <div class="d-flex align-center" style="gap: 5px;">
            <v-btn icon color="#A62229" class="btn-square-action" @click="refreshData" title="Làm mới">
              <v-icon size="22">mdi-refresh</v-icon>
            </v-btn>

            <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="handleSearch" title="Tìm kiếm">
              <v-icon size="22">mdi-magnify</v-icon>
            </v-btn>
          </div>
        </div>

        <!-- Nút Thêm mới -->
        <div>
          <v-btn color="#A62229" dark class="btn-square-action px-4" elevation="0" @click="handleAdd" title="Thêm mới">
            <v-icon size="22">mdi-plus</v-icon>
          </v-btn>
        </div>
      </div>
    </div>

    <!-- KHUNG BASETABLE HIỂN THỊ DỮ LIỆU -->
    <div class="table-scroll-container">
      <BaseTable
        :headers="tableHeaders"
        :items="itemList"
        :loading="loading"
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

        <!-- Tên ban hành định mức -->
        <template #[`item.name`]="{ item }">
          <span class="font-weight-medium">{{ item.name || '-' }}</span>
        </template>

        <!-- Định mức phản hệ (RE_STUDY: #2196f3, RE_DEFENSE: #009688) -->
        <template #[`item.decisionFeeType`]="{ item }">
          <v-chip small :color="item.decisionFeeType === 'RE_DEFENSE' ? '#009688' : '#2196f3'" dark>
            {{ item.decisionFeeTypeName || (item.decisionFeeType === 'RE_DEFENSE' ? 'Bảo vệ lại' : 'Học lại') }}
          </v-chip>
        </template>

        <!-- Học kỳ -->
        <template #[`item.semester.name`]="{ item }">
          <span>{{ (item.semester && item.semester.name) || item.semesterName || '-' }}</span>
        </template>

        <!-- File ban hành (Có file: màu đỏ, click tải; Không file: màu xám, disable) -->
        <template #[`item.fileInform`]="{ item }">
          <v-btn
            icon
            small
            :color="hasFile(item) ? 'error' : '#a2212b lighten-1'"
            :disabled="!hasFile(item)"
            @click="downloadFile(item)"
            :title="hasFile(item) ? 'Tải file ban hành' : 'Không có file'"
          >
            <v-icon size="26">mdi-file-download-outline</v-icon>
          </v-btn>
        </template>

        <!-- Ngày ban hành (Bỏ 00:00:00) -->
        <template #[`item.timeInform`]="{ item }">
          <span>{{ formatDate(item.timeInform || item.issueDate || item.createdDate) }}</span>
        </template>

        <!-- Hình thức đào tạo -->
        <template #[`item.trainingMethod`]="{ item }">
          <span class="training-method-text">
            {{ formatTrainingMethods(item) }}
          </span>
        </template>

        <!-- Trạng thái -->
        <template #[`item.status`]="{ item }">
          <ChangeableStatus
            :status="item.status"
            :statusList="statusList"
            @changeStatus="(selectedItem) => handleStatusChange(item, selectedItem)"
          >
            <template #content="{ data }">
              Bạn có chắc chắn muốn đổi trạng thái sang 
              <span class="font-weight-bold red--text">{{ data.text }}</span> không?
            </template>
          </ChangeableStatus>
        </template>

        <!-- Cột Chức năng (Hỗ trợ cả actions và action) -->
        <template #[`item.actions`]="{ item }">
          <div class="d-flex flex-column align-center justify-center py-1" style="gap: 4px;">
            <v-btn icon x-small color="info" @click="handleView(item)" title="Xem">
              <v-icon size="24">mdi-eye</v-icon>
            </v-btn>
            <v-btn icon x-small color="success" @click="handleExportExcelItem(item)" title="Xuất Excel">
              <v-icon size="24">mdi-microsoft-excel</v-icon>
            </v-btn>
            <v-btn icon x-small color="amber darken-2" @click="handleEdit(item)" title="Sửa">
              <v-icon size="24">mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon x-small color="error" @click="confirmDelete(item)" title="Xóa">
              <v-icon size="24">mdi-trash-can</v-icon>
            </v-btn>
          </div>
        </template>
      </BaseTable>
    </div>

    <!-- THANH PHÂN TRANG & NÚT NHẬP FILE EXCEL PHÍA DƯỚI -->
    <div class="pagination-bottom-container mt-4 pt-3 d-flex align-center justify-space-between flex-wrap gap-3 sticky-bottom-bar border-top">
      <div>
        <v-btn color="#4caf50" dark depressed class="text-none px-4" height="38" @click="handleImportExcel">
          <v-icon left small>mdi-microsoft-excel</v-icon> Nhập file excel
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

    <!-- MODAL XEM CHI TIẾT ĐỊNH MỨC PHÍ -->
    <v-dialog v-model="viewModal" max-width="1000px" persistent scrollable>
      <v-card class="rounded-lg">
        <v-card-title class="pa-4 text-white" style="background-color: #A62229; color: white;">
          <span class="text-h6 font-weight-bold">Chi tiết định mức phí</span>
          <v-spacer></v-spacer>
          <v-btn icon dark @click="viewModal = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-5 modal-body-scroll">
          <!-- Thông tin tổng quan -->
          <v-row dense class="mb-4">
            <v-col cols="12" md="6" class="d-flex align-center">
              <span class="font-weight-bold mr-2">Tên ban hành định mức:</span>
              <span class="text-red-bold">{{ viewDetail.name }}</span>
            </v-col>
            <v-col cols="12" md="6" class="d-flex align-center">
              <span class="font-weight-bold mr-2">Học kỳ:</span>
              <span>{{ viewDetail.semesterName }}</span>
            </v-col>
            <v-col cols="12" md="6" class="d-flex align-center mt-2">
              <span class="font-weight-bold mr-2">Ngày ban hành:</span>
              <span>{{ formatDate(viewDetail.issueDate) }}</span>
            </v-col>
            <v-col cols="12" md="6" class="d-flex align-center mt-2">
              <span class="font-weight-bold mr-2">Định mức phân hệ:</span>
              <v-chip small :color="viewDetail.decisionFeeType === 'RE_DEFENSE' ? '#009688' : '#2196f3'" dark>
                {{ viewDetail.decisionFeeType === 'RE_DEFENSE' ? 'Bảo vệ lại' : 'Học lại' }}
              </v-chip>
            </v-col>
            <v-col cols="12" md="6" class="d-flex align-center mt-2">
              <span class="font-weight-bold mr-2">Trạng thái:</span>
              <v-chip small :color="viewDetail.status === 'ACTIVE' ? '#a2212b' : '#9e9e9e'" dark>
                {{ viewDetail.status === 'ACTIVE' ? 'Kích hoạt' : 'Chưa kích hoạt' }}
              </v-chip>
            </v-col>
          </v-row>

          <div class="text-subtitle-1 font-weight-bold mb-2">Danh sách ngành</div>

          <!-- Bảng danh sách chi tiết -->
          <div class="table-responsive-container">
            <v-data-table
              :headers="[
                { text: 'STT', value: 'stt', align: 'center', width: '60px', sortable: false },
                { text: 'Ngành', value: 'majorName', align: 'left', sortable: false },
                { text: 'Chương trình đào tạo', value: 'educationProgram', align: 'left', sortable: false },
                { text: 'Hình thức đào tạo', value: 'trainingMethods', align: 'left', width: '220px', sortable: false },
                { text: 'Định mức tín chỉ học phí', value: 'fee', align: 'right', width: '200px', sortable: false },
              ]"
              :items="viewDetail.tableList"
              :items-per-page="-1"
              :loading="viewLoading"
              fixed-header
              hide-default-footer
              dense
              class="elevation-1"
            >
              <template #[`item.stt`]="{ index }">
                {{ index + 1 }}
              </template>

              <template #[`item.majorName`]="{ item }">
                <span class="font-weight-medium">{{ item.majorName }}</span>
              </template>

              <template #[`item.educationProgram`]="{ item }">
                <span>{{ item.educationProgram }}</span>
              </template>

              <template #[`item.trainingMethods`]="{ item }">
                <div>
                  <div
                    v-for="(method, idx) in item.trainingMethods"
                    :key="idx"
                    style="height: 36px; display: flex; align-items: center; border-bottom: 1px solid #eee;"
                  >
                    {{ method.name }}
                  </div>
                </div>
              </template>

              <template #[`item.fee`]="{ item }">
                <div>
                  <div
                    v-for="(method, idx) in item.trainingMethods"
                    :key="idx"
                    style="height: 36px; display: flex; align-items: center; justify-content: flex-end; border-bottom: 1px solid #eee;"
                  >
                    <span class="font-weight-medium">{{ Number(method.fee || 0).toLocaleString('vi-VN') }} VNĐ</span>
                  </div>
                </div>
              </template>
            </v-data-table>
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-3">
          <v-spacer></v-spacer>
          <v-btn outlined color="grey darken-1" class="text-none px-4" @click="viewModal = false">
            Đóng <v-icon right small>mdi-close</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- POPUP XÁC NHẬN XÓA (Chuẩn giao diện màu đỏ) -->
    <v-dialog v-model="openDelete" max-width="450px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="pa-4 text-white" style="background-color: #A62229; color: white;">
          <span class="text-h6 font-weight-bold">Xác nhận</span>
          <v-spacer></v-spacer>
          <v-btn icon dark @click="openDelete = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-5 text-subtitle-1 black--text">
          Xác nhận xóa định mức <b class="red--text text--darken-2">{{ selectedItem ? selectedItem.name : '' }}</b>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-3">
          <v-spacer></v-spacer>
          <v-btn outlined color="#A62229" class="text-none px-4" @click="openDelete = false">
            Đóng <v-icon right small class="red--text text--darken-2">mdi-close</v-icon>
          </v-btn>
          <v-btn color="#A62229" dark class="text-none px-5" @click="handleDelete">
            Xác Nhận
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MODAL NHẬP FILE EXCEL -->
    <v-dialog v-model="importModal" max-width="500px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="pa-4 text-white" style="background-color: #A62229; color: white;">
          <span class="text-h6 font-weight-bold">Nhập file excel</span>
          <v-spacer></v-spacer>
          <v-btn icon dark @click="importModal = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-5">
          <div class="mb-4 text-body-2">
            Tải file mẫu ở đây: 
            <a href="#" @click.prevent="downloadTemplate" class="red--text text--darken-2 font-weight-medium">
              template_dinh_muc_phi_bao_ve_lai.xlsx
            </a>
          </div>

          <!-- Khu vực chọn file -->
          <v-file-input
            v-model="selectedFile"
            placeholder="Chọn tệp đính kèm"
            prepend-icon=""
            prepend-inner-icon="mdi-plus"
            outlined
            dense
            show-size
            accept=".xlsx, .xls"
            class="custom-file-input"
          >
            <template #selection="{ text }">
              <v-chip small color="#A62229" dark label class="mr-2">
                {{ text }}
              </v-chip>
            </template>
          </v-file-input>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-3">
          <v-spacer></v-spacer>
          <v-btn color="#A62229" dark class="text-none px-5" :loading="importLoading" @click="handleImportFile">
            Import
          </v-btn>
          <v-btn outlined color="grey darken-1" class="text-none px-4" @click="importModal = false">
            Đóng
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- THÔNG BÁO TOAST -->
    <v-snackbar
      v-model="snackbar.show"
      top
      right
      timeout="3000"
      color="#4caf50"
      elevation="4"
      class="custom-top-right-snackbar"
    >
      <div class="d-flex align-center justify-space-between" style="width: 100%;">
        <div class="d-flex align-center">
          <v-icon left dark class="mr-2">mdi-check-circle</v-icon>
          <span class="white--text font-weight-medium">{{ snackbar.text }}</span>
        </div>
      </div>
      <template #action="{ attrs }">
        <v-btn text dark v-bind="attrs" @click="snackbar.show = false">
          <v-icon small>mdi-close</v-icon>
        </v-btn>
      </template>
      <v-progress-linear
        v-model="snackbar.progress"
        color="white"
        height="3"
        absolute
        bottom
      ></v-progress-linear>
    </v-snackbar>
    <!-- Thẻ modal dùng chung cho cả Thêm mới và Sửa -->
    <DecisionFeeModal
      v-model="showAddModal"
      :edit-data="selectedEditItem"
      @success="loadData"
    />
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import ChangeableStatus from '~/components/Base/ChangeableStatus.vue'
import decisionFeeService from '~/services/decisionFeeService'
import DecisionFeeModal from '~/components/DecisionFeeModal.vue'

export default {
  name: 'DecisionFeeManagementPage',
  components: {
    BaseTable,
    ChangeableStatus,
    DecisionFeeModal,
  },
  data() {
    return {
      importModal: false,
      importLoading: false,
      selectedFile: null,

      openDelete: false, // Trạng thái đóng/mở popup xác nhận xóa
      selectedItem: null,
      selectedEditItem: null,
      showAddModal: false,

      viewModal: false,
      viewLoading: false,
      viewDetail: {
        name: '',
        issueDate: '',
        semesterName: '',
        decisionFeeType: '',
        status: '',
        tableList: []
      },

      isMobileDevice: false,
      loading: false,
      filters: {
        name: '',
        decisionFeeType: '',
        semesterId: '',
        status: '',
      },
      activeFilters: {
        name: '',
        decisionFeeType: '',
        semesterId: '',
        status: '',
      },
      snackbar: {
        show: false,
        text: '',
        progress: 100,
        timer: null
      },
      statusList: [
        { text: 'Kích hoạt', value: 'ACTIVE', color: '#a2212b' },
        { text: 'Chưa kích hoạt', value: 'INACTIVE', color: '#9e9e9e' },
      ],
      feeTypeList: [
        { text: 'Học lại', value: 'RE_STUDY' },
        { text: 'Bảo vệ lại', value: 'RE_DEFENSE' },
      ],
      semesterList: [],

      itemList: [],
      totalRecords: 0,
      totalPages: 1,
      currentPage: 1,
      pageInput: 1,
      itemsPerPage: 50,

      tableHeaders: [
        { value: "stt", text: "STT", align: "center", width: "60px", sortable: false },
        { value: "name", text: "Tên ban hành định mức", align: "left", minWidth: "160px", sortable: false },
        { value: "decisionFeeType", text: "Định mức phân hệ", align: "center", width: "140px", sortable: false },
        { value: "semester.name", text: "Học kỳ", align: "center", width: "130px", sortable: false },
        { value: "fileInform", text: "File ban hành", align: "center", width: "100px", sortable: false },
        { value: "timeInform", text: "Ngày ban hành", align: "center", width: "130px", sortable: false },
        { value: "trainingMethod", text: "Hình thức đào tạo", align: "left", minWidth: "280px", sortable: false },
        { value: "status", text: "Trạng thái", align: "center", width: "140px", sortable: false },
        { value: "actions", text: "Chức năng", align: "center", width: "80px", sortable: false },
      ],
    }
  },
  async mounted() {
    if (typeof navigator !== 'undefined') {
      this.isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }
    await this.initPageData()
    await this.loadData()
  },
  methods: {
    async initPageData() {
      try {
        const [semRes] = await Promise.all([
          decisionFeeService.getSemesterList({ status: 'ACTIVE', channel: 'CMS' }).catch(() => null),
          decisionFeeService.getPageRole({ channel: 'CMS' }).catch(() => null),
          decisionFeeService.getUserInfo({ channel: 'CMS' }).catch(() => null),
        ])
        if (semRes) {
          const semData = semRes.data !== undefined ? semRes.data : semRes
          this.semesterList = Array.isArray(semData) ? semData : (semData.data || semData.content || [])
        }
      } catch (error) {
        console.error('Lỗi khởi tạo dữ liệu trang:', error)
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
        name: this.extractValue(this.filters.name),
        decisionFeeType: this.extractValue(this.filters.decisionFeeType),
        semesterId: this.extractValue(this.filters.semesterId),
        status: this.extractValue(this.filters.status),
      }
      this.currentPage = 1
      this.pageInput = 1
      this.loadData()
    },

    refreshData() {
      this.filters = { name: '', decisionFeeType: '', semesterId: '', status: '' }
      this.activeFilters = { name: '', decisionFeeType: '', semesterId: '', status: '' }
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

        if (this.activeFilters.name !== '') baseParams.name = this.activeFilters.name
        if (this.activeFilters.decisionFeeType !== '') baseParams.decisionFeeType = this.activeFilters.decisionFeeType
        if (this.activeFilters.semesterId !== '') baseParams.semesterId = this.activeFilters.semesterId
        if (this.activeFilters.status !== '') baseParams.status = this.activeFilters.status

        const res = await decisionFeeService.getList(baseParams)
        if (res) {
          const rootData = res.data !== undefined ? res.data : res
          const allItems = Array.isArray(rootData) ? rootData : (rootData.data || rootData.content || rootData.items || [])
          
          const rawTotal = rootData.totalElements ?? rootData.totalRecords ?? rootData.total ?? (res.totalElements || res.totalRecords || res.total)
          this.totalRecords = rawTotal !== undefined ? Number(rawTotal) : allItems.length

          this.itemList = allItems
          this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage) || 1
        }
      } catch (error) {
        console.error('Lỗi tải danh sách định mức phí:', error)
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

    showSuccessToast(message) {
      this.snackbar.show = false
      this.$nextTick(() => {
        this.snackbar.text = message
        this.snackbar.show = true
        this.snackbar.progress = 100

        clearInterval(this.snackbar.timer)
        const step = 100 / (3000 / 50)
        this.snackbar.timer = setInterval(() => {
          this.snackbar.progress -= step
          if (this.snackbar.progress <= 0) {
            clearInterval(this.snackbar.timer)
          }
        }, 50)
      })
    },

    async handleStatusChange(item, selectedItem) {
      try {
        const newStatusValue = selectedItem.value || selectedItem
        await decisionFeeService.changeStatus(item.id, newStatusValue, 'CMS')
        item.status = newStatusValue
        await this.loadData()
        this.showSuccessToast('Cập nhật trạng thái thành công')
      } catch (error) {
        console.error('Lỗi đổi trạng thái:', error)
      }
    },

    hasFile(item) {
      return !!(item.fileInform || item.filePath || item.fileUrl)
    },

    downloadFile(item) {
      const file = item.fileInform || item.filePath || item.fileUrl
      if (file) {
        window.open(file, '_blank')
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return '-'
      if (dateStr.includes('00:00:00')) {
        return dateStr.replace('00:00:00', '').trim()
      }
      if (dateStr.includes('T')) {
        return dateStr.split('T')[0].split('-').reverse().join('/')
      }
      return dateStr
    },

    formatTrainingMethods(item) {
      if (item.feeTrainingmethodsDtos && Array.isArray(item.feeTrainingmethodsDtos)) {
        return item.feeTrainingmethodsDtos.map((i) => i.trainingMethod?.name).filter(Boolean).join(', ')
      }
      return item.trainingMethod || item.trainingType || '-'
    },

    handleAdd() {
      this.selectedEditItem = null
      this.showAddModal = true
    },

    // BÁM ICON MẮT (XEM CHI TIẾT) - ĐÃ CẬP NHẬT THEO CẤU TRÚC CHUẨN CỦA DỰ ÁN
    async handleView(item) {
      this.viewLoading = true
      this.viewModal = true
      try {
        const [detailRes, majorRes, methodRes] = await Promise.all([
          decisionFeeService.getDetail(item.id, 'CMS').catch(() => null),
          decisionFeeService.getMajorList({ status: 'ACTIVE', channel: 'CMS' }).catch(() => []),
          decisionFeeService.getTrainingMethodList({ status: 'ACTIVE', channel: 'CMS' }).catch(() => [])
        ])

        if (detailRes) {
          const detail = detailRes.data !== undefined ? detailRes.data : detailRes
          
          this.viewDetail.name = detail.name || item.name || '-'
          this.viewDetail.issueDate = detail.issueDate || detail.timeInform || item.timeInform || '-'
          this.viewDetail.semesterName = detail.semester?.name || detail.semesterName || item.semester?.name || '-'
          this.viewDetail.decisionFeeType = detail.decisionFeeType || item.decisionFeeType || '-'
          this.viewDetail.status = detail.status || item.status || '-'

          const majorData = majorRes?.data !== undefined ? majorRes.data : majorRes
          const majors = Array.isArray(majorData) ? majorData : (majorData?.data || majorData?.content || majorData?.items || [])

          const methodData = methodRes?.data !== undefined ? methodRes.data : methodRes
          const trainingMethodsList = Array.isArray(methodData) ? methodData : (methodData?.data || methodData?.content || methodData?.items || [])

          // Lấy mảng lưu phí từ API chi tiết (hỗ trợ cả feeTrainingmethodsDtos và trainingmethodCreates)
          const savedFeesData = detail.feeTrainingmethodsDtos || detail.trainingmethodCreates || []

          const formattedList = []

          majors.forEach((major) => {
            const majorId = major.id
            const majorName = major.name || major.code || '-'
            const educationProgram = major?.educationProgram?.name || major.educationProgramName || '-'

            const trainingMethods = trainingMethodsList.map((tm) => {
              // Tìm nhóm theo hình thức đào tạo
              const matchedGroup = savedFeesData.find(
                (_i) =>
                  (_i?.trainingMethod?.id === tm.id) ||
                  (_i?.trainingMethodId === tm.id) ||
                  (_i?.id === tm.id)
              )

              // Tìm phí theo ngành học
              const reqList = matchedGroup?.estimationFees || matchedGroup?.estimationRequests || []
              const findFee = reqList.find((estima) => estima.majorId === majorId || estima.majorCode === major.code)

              return {
                name: tm.name || tm.code || '-',
                fee: findFee ? (findFee.fee || 0) : 0
              }
            })

            formattedList.push({
              majorId,
              majorName,
              educationProgram,
              trainingMethods
            })
          })

          this.viewDetail.tableList = formattedList
        }
      } catch (error) {
        console.error('Lỗi khi tải chi tiết định mức phí:', error)
        this.viewDetail.tableList = []
      } finally {
        this.viewLoading = false
      }
    },

    // BÁM ICON BÚT (SỬA)
    handleEdit(item) {
      this.selectedEditItem = item
      this.showAddModal = true
    },

    async handleExportExcelItem(item) {
      try {
        const res = await decisionFeeService.exportExcel(item.id, 'CMS')
        
        const blobData = res.data || res
        const blob = new Blob([blobData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = `DINH_MUC_HOC_PHI_${item.id}.xlsx`
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
      } catch (error) {
        console.error('Lỗi khi xuất file Excel:', error)
      }
    },
    handleUpdate(item) {
      this.$refs.ProtectionNormsUpdate.open = true;
      this.$refs.ProtectionNormsUpdate.semesterList = [...this.semesterList];
      // Truyền trực tiếp item chứa feeTrainingmethodsDtos sang modal update để bind lại giá tiền cũ
      this.$refs.ProtectionNormsUpdate.getUpdate({ ...item });
    },

    openDetail(item) {
      this.selectedItem = item;
      this.$refs.ProtectionNormsDetail.isOpen = true;
      
      // Nếu component chi tiết của bạn cần load hoặc bind lại dữ liệu chuẩn từ API detail, 
      // đảm bảo nó đọc đúng mảng feeTrainingmethodsDtos giống như bên update.
    },
    confirmDelete(item) {
      this.selectedItem = { ...item };
      this.openDelete = true;
    },

    // Hàm thực hiện gọi API xóa
    async handleDelete() {
        if (!this.selectedItem || !this.selectedItem.id) return;
        
        try {
            const res = decisionFeeService.deleteItem 
                ? await decisionFeeService.deleteItem(this.selectedItem.id, 'CMS') 
                : await decisionFeeService.delete(this.selectedItem.id, { channel: 'CMS' });

            if (res && (res.success || res.code === 0 || res)) {
                if (typeof this.$showSuccess === 'function') {
                    this.$showSuccess('Xóa định mức phí thành công');
                }
                this.openDelete = false;
                this.loadData(); // Hàm tải lại danh sách của bạn
            }
        } catch (error) {
            console.error('Lỗi khi xóa:', error);
            if (typeof this.$showError === 'function') {
                this.$showError('Có lỗi xảy ra khi xóa!');
            }
        }
    },
    // 1. Mở modal nhập file Excel
    handleImportExcel() {
      this.selectedFile = null
      this.importModal = true
    },

    // 2. Tải file mẫu template (Gọi API /template?channel=CMS)
    async downloadTemplate() {
      try {
        const res = await decisionFeeService.downloadTemplate ? await decisionFeeService.downloadTemplate('CMS') : await decisionFeeService.getTemplate({ channel: 'CMS' })
        const blob = new Blob([res.data || res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = 'template_dinh_muc_phi_bao_ve_lai.xlsx'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (error) {
        console.error('Lỗi tải file mẫu:', error)
        if (typeof this.$showError === 'function') this.$showError('Không thể tải file mẫu!')
      }
    },

    // 3. Xử lý khi bấm nút Import (Gọi /import/check trước, nếu đúng gọi /import)
    async handleImportFile() {
      if (!this.selectedFile) {
        if (typeof this.$showError === 'function') {
          this.$showError('Vui lòng chọn tệp đính kèm!')
        }
        return
      }

      this.importLoading = true
      try {
        const formData = new FormData()
        formData.append('file', this.selectedFile)
        formData.append('channel', 'CMS')

        // Gọi API kiểm tra trước
        try {
          await decisionFeeService.importCheck(formData)
        } catch (err) {
          const errorMsg = err.response?.data?.message || err.message || 'Vui lòng nhập đầy đủ các trường thông tin bắt buộc'
          if (typeof this.$showError === 'function') {
            this.$showError(errorMsg)
          }
          return
        }

        // Nếu check hợp lệ, tiến hành gọi API import chính thức
        const importRes = await decisionFeeService.importFile(formData)
        
        if (importRes && (importRes.success || importRes.code === 0 || importRes)) {
          this.importModal = false
          this.showSuccessToast('Nhập file Excel thành công')
          this.loadData()
        }
      } catch (error) {
        console.error('Lỗi khi import file:', error)
        if (typeof this.$showError === 'function') {
          this.$showError('Có lỗi xảy ra khi nhập file!')
        }
      } finally {
        this.importLoading = false
      }
    },
  }
}
</script>

<style scoped>
.decision-fee-management-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: #ffffff !important;
}

.text-red-bold {
  color: #A62229 !important;
}

.bg-white {
  background-color: #ffffff !important;
}

.sticky-filter {
  position: sticky;
  top: 0;
  z-index: 5;
  background-color: #ffffff;
  flex-shrink: 0;
}

.table-scroll-container {
  flex-grow: 1;
  overflow-y: auto;
  overflow-x: auto;
  max-height: calc(100vh - 220px);
}

.table-scroll-container >>> th {
  position: sticky !important;
  top: 0;
  z-index: 2;
  background-color: #f5f5f5 !important;
}

.sticky-bottom-bar {
  position: sticky;
  bottom: 0;
  z-index: 5;
  background-color: #ffffff;
  flex-shrink: 0;
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

/* Đảm bảo hiển thị đầy đủ chữ hình thức đào tạo và xuống dòng tự nhiên */
.training-method-text {
  display: block;
  white-space: normal;
  word-break: break-word;
  line-height: 1.4;
  padding: 4px 0;
}

::v-deep .v-data-footer {
  display: none !important;
}
</style>