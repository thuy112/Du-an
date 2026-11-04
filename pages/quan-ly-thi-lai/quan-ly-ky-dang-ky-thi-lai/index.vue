<template>
  <div class="exam-container">
    <!-- KHU VỰC 1: CỐ ĐỊNH PHÍA TRÊN (Tiêu đề + Bộ lọc) -->
    <div class="fixed-top-section">
      <div class="text-h6 font-weight-bold black--text mb-3">
        Danh sách kỳ đăng ký thi lại (<span class="text-red-bold">{{ totalRecords }}</span>)
      </div>

      <div class="filter-container mb-2">
        <div class="d-flex align-center flex-wrap" style="gap: 8px; padding: 6px 0;">
          <v-text-field
            v-model="filters.search"
            label="Tìm kiếm"
            outlined
            dense
            hide-details
            clearable
            class="filter-input flex-grow-1"
            style="min-width: 180px;"
            @keyup.enter="handleSearch"
          ></v-text-field>

          <v-menu
            v-model="fromFilterMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="formattedFromFilterDate"
                label="Từ ngày"
                outlined
                dense
                hide-details
                readonly
                clearable
                v-bind="attrs"
                v-on="on"
                class="filter-input flex-grow-1"
                style="min-width: 150px;"
                @click:clear="filters.fromTime = ''"
              ></v-text-field>
            </template>
            <v-date-picker v-model="filters.fromTime" locale="vi" @input="fromFilterMenu = false"></v-date-picker>
          </v-menu>

          <v-menu
            v-model="toFilterMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="formattedToFilterDate"
                label="Đến ngày"
                outlined
                dense
                hide-details
                readonly
                clearable
                v-bind="attrs"
                v-on="on"
                class="filter-input flex-grow-1"
                style="min-width: 150px;"
                @click:clear="filters.toTime = ''"
              ></v-text-field>
            </template>
            <v-date-picker v-model="filters.toTime" locale="vi" @input="toFilterMenu = false"></v-date-picker>
          </v-menu>

          <v-select
            v-model="filters.status"
            :items="statusList"
            item-text="text"
            item-value="value"
            label="Trạng thái"
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
            <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="openAddDialog" title="Thêm mới">
              <v-icon size="22">mdi-plus</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- KHU VỰC 2: BẢNG DỮ LIỆU Ở GIỮA -->
    <div class="scrollable-table-section">
      <BaseTable
        :headers="headers"
        :items="itemList"
        :loading="loading"
        :current-page="currentPage"
        :items-per-page="itemsPerPage"
        :total-records="totalRecords"
        hide-default-footer
        @page-change="changePage"
        @per-page-change="handlePerPageChange"
      >
        <template #[`item.stt`]="{ index }">
          <span>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</span>
        </template>
        <template #[`item.name`]="{ item }">
          <span class="font-weight-medium">{{ item.name || '-' }}</span>
        </template>
        <template #[`item.code`]="{ item }">
          <span>{{ item.code || '-' }}</span>
        </template>
        <template #[`item.semesterName`]="{ item }">
          <span>{{ item.semesterName || item.semester?.name || '-' }}</span>
        </template>
        <template #[`item.timeRange`]="{ item }">
          <span>{{ formatTimeRange(item) }}</span>
        </template>
        <template #[`item.status`]="{ item }">
          <ChangeableStatus
            :status="item.status"
            :statusList="statusList"
            @changeStatus="(selectedItem) => handleStatusChange(item, selectedItem)"
          >
            <template #content="{ data }">
              Bạn có chắc chắn muốn đổi trạng thái sang <span class="font-weight-bold red--text">{{ data.text }}</span> không?
            </template>
          </ChangeableStatus>
        </template>
        <template #[`item.actions`]="{ item }">
          <div class="d-flex align-center justify-center" style="gap: 4px;">
            <!-- Xem chi tiết (Icon mắt) -->
            <v-btn icon small color="info" @click="handleView(item)" title="Xem chi tiết">
              <v-icon size="24">mdi-eye</v-icon>
            </v-btn>

            <!-- Cập nhật / Sửa (Icon bút) -->
            <v-btn icon small color="amber darken-3" @click="handleEdit(item)" title="Cập nhật">
              <v-icon size="24">mdi-pencil</v-icon>
            </v-btn>

            <!-- Xóa (Icon thùng rác) -->
            <v-btn icon small color="error" @click="handleDelete(item)" title="Xóa">
              <v-icon size="24">mdi-trash-can</v-icon>
            </v-btn>
          </div>
        </template>
      </BaseTable>
    </div>

    <!-- KHU VỰC 3: CỐ ĐỊNH PHÍA DƯỚI (Phân trang) -->
    <div class="fixed-bottom-section d-flex align-center justify-end flex-wrap gap-3 border-top">
      <div></div>
      <div class="d-flex align-center pagination-custom" style="gap: 16px;">
        <div class="d-flex align-center">
          <v-select
            v-model="itemsPerPage"
            :items="[5, 10, 20, 50, 100]"
            label="Bản ghi"
            outlined
            dense
            hide-details
            style="width: 90px;"
            @change="handlePerPageChange(itemsPerPage)"
          ></v-select>
        </div>

        <div class="d-flex align-center" style="gap: 8px;">
          <v-text-field
            v-model.number="pageInput"
            label="Trang"
            outlined
            dense
            hide-details
            type="number"
            style="width: 80px;"
            @keyup.enter="goToPage"
          ></v-text-field>
          <v-btn color="#A2212B" dark depressed class="text-none px-4" height="40" @click="goToPage">Đi</v-btn>
        </div>

        <div class="d-flex align-center" style="gap: 4px;">
          <v-btn icon outlined small color="grey" :disabled="currentPage <= 1" @click="changePage(currentPage - 1)">
            <v-icon small>mdi-chevron-left</v-icon>
          </v-btn>
          
          <template v-for="page in displayedPages">
            <v-btn
              v-if="page !== '...'"
              :key="page"
              :color="currentPage === page ? '#A2212B' : 'white'"
              :dark="currentPage === page"
              depressed
              small
              class="px-2"
              style="min-width: 32px; height: 32px;"
              :style="currentPage !== page ? 'border: 1px solid #e0e0e0; color: #333;' : ''"
              @click="changePage(page)"
            >
              {{ page }}
            </v-btn>
            <span v-else :key="'dot-' + page" class="px-1 text-grey">...</span>
          </template>

          <v-btn icon outlined small color="grey" :disabled="currentPage >= totalPages" @click="changePage(currentPage + 1)">
            <v-icon small>mdi-chevron-right</v-icon>
          </v-btn>
        </div>
      </div>
    </div>

    <!-- MODAL THÊM MỚI / CẬP NHẬT -->
    <v-dialog v-model="dialog" max-width="650px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <div class="px-6 py-4 text-white font-weight-bold d-flex justify-space-between align-items-center" style="background-color: #A62229; font-size: 18px;">
          <span>{{ isEdit ? 'Cập nhật kỳ thi lại' : 'Thêm mới kỳ thi lại' }}</span>
          <v-btn icon dark @click="dialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>

        <v-card-text class="pa-6 pt-6">
          <v-form ref="form">
            <div class="mb-4">
              <label class="d-block mb-1 font-weight-medium">Tên kỳ thi lại <span class="text-red-bold">*</span></label>
              <v-text-field
                v-model="formModel.name"
                label="Nhập tên kỳ thi lại"
                outlined
                dense
                hide-details
              ></v-text-field>
            </div>

            <div class="mb-4">
              <label class="d-block mb-1 font-weight-medium">Mã kỳ thi lại <span class="text-red-bold">*</span></label>
              <v-text-field
                v-model="formModel.code"
                label="Nhập mã kỳ thi lại"
                outlined
                dense
                hide-details
              ></v-text-field>
            </div>

            <div class="mb-4">
              <label class="d-block mb-1 font-weight-medium">Học kỳ <span class="text-red-bold">*</span></label>
              <v-select
                v-model="formModel.semesterId"
                :items="semesterList"
                item-text="name"
                item-value="id"
                label="Chọn học kỳ"
                outlined
                dense
                hide-details
                clearable
              ></v-select>
            </div>

            <!-- THỜI GIAN BẮT ĐẦU -->
            <div class="mb-4">
              <v-menu
                v-model="fromMenu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="formModel.fromTime"
                    label="Thời gian bắt đầu đăng ký (*)"
                    outlined
                    dense
                    hide-details
                    readonly
                    clearable
                    v-bind="attrs"
                    v-on="on"
                    @click:clear="formModel.fromTime = ''"
                  ></v-text-field>
                </template>
                <v-card>
                  <v-date-picker
                    v-if="fromMode === 'DATE'"
                    v-model="tempFromDate"
                    locale="vi"
                    @input="onFromDatePicked"
                  ></v-date-picker>
                  <v-time-picker
                    v-else
                    v-model="tempFromTime"
                    format="24hr"
                    @input="onFromTimePicked"
                  ></v-time-picker>
                </v-card>
              </v-menu>
            </div>

            <!-- THỜI GIAN KẾT THÚC -->
            <div class="mb-4">
              <v-menu
                v-model="toMenu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="formModel.toTime"
                    label="Thời gian kết thúc đăng ký (*)"
                    outlined
                    dense
                    hide-details
                    readonly
                    clearable
                    v-bind="attrs"
                    v-on="on"
                    @click:clear="formModel.toTime = ''"
                  ></v-text-field>
                </template>
                <v-card>
                  <v-date-picker
                    v-if="toMode === 'DATE'"
                    v-model="tempToDate"
                    locale="vi"
                    @input="onToDatePicked"
                  ></v-date-picker>
                  <v-time-picker
                    v-else
                    v-model="tempToTime"
                    format="24hr"
                    @input="onToTimePicked"
                  ></v-time-picker>
                </v-card>
              </v-menu>
            </div>

            <div class="mb-2">
              <label class="d-block mb-1 font-weight-medium">Trạng thái <span class="text-red-bold">*</span></label>
              <v-select
                v-model="formModel.status"
                :items="statusList"
                item-text="text"
                item-value="value"
                outlined
                dense
                hide-details
              ></v-select>
            </div>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4 justify-end" style="gap: 8px;">
          <v-btn text class="text-none px-4" @click="dialog = false">Đóng</v-btn>
          <v-btn color="#A2212B" dark depressed class="text-none px-6" :loading="submitting" @click="handleSave">Lưu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MODAL XEM CHI TIẾT -->
    <v-dialog v-model="viewDialog" max-width="650px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <div class="px-6 py-4 text-white font-weight-bold d-flex justify-space-between align-items-center" style="background-color: #A62229; font-size: 18px;">
          <span>Chi tiết kỳ thi lại</span>
          <v-btn icon dark @click="viewDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>

        <v-card-text class="pa-6 pt-6 text-body-1">
          <div class="mb-3"><strong>Tên kỳ thi lại:</strong> <span class="red--text font-weight-medium">{{ viewItem.name || '-' }}</span></div>
          <div class="mb-3"><strong>Mã kỳ thi lại:</strong> <span class="red--text font-weight-medium">{{ viewItem.code || '-' }}</span></div>
          <div class="mb-3"><strong>Học kỳ:</strong> {{ viewItem.semesterName || viewItem.semester?.name || '-' }}</div>
          <div class="mb-3"><strong>Loại hình:</strong> {{ viewItem.typeName || 'Thi lại' }}</div>
          <div class="mb-3"><strong>Thời gian đăng ký:</strong> <span class="red--text font-weight-medium">{{ viewItem.fromTime }} ~ {{ viewItem.toTime }}</span></div>
          <div class="mb-2 d-flex align-center" style="gap: 8px;">
            <strong>Trạng thái:</strong>
            <v-chip small :color="viewItem.status === 'ACTIVE' ? '#a2212b' : '#9e9e9e'" dark>
              {{ viewItem.status === 'ACTIVE' ? 'Kích hoạt' : 'Chưa kích hoạt' }}
            </v-chip>
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4 justify-end">
          <v-btn text class="text-none px-4" @click="viewDialog = false">Đóng <v-icon small right>mdi-close</v-icon></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MODAL XÁC NHẬN XÓA -->
    <v-dialog v-model="deleteDialog" max-width="500px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <div class="px-6 py-4 text-white font-weight-bold d-flex justify-space-between align-items-center" style="background-color: #A62229; font-size: 18px;">
          <span>Xác nhận</span>
          <v-btn icon dark @click="deleteDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        <v-card-text class="pa-6 text-body-1">
          Xác nhận xóa <span class="font-weight-bold red--text">{{ selectedItemToDelete ? selectedItemToDelete.name : '' }}</span>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4 justify-end" style="gap: 8px;">
          <v-btn text class="text-none px-4" @click="deleteDialog = false">Đóng</v-btn>
          <v-btn color="#A2212B" dark depressed class="text-none px-6" :loading="deleting" @click="confirmDelete">Xác Nhận</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- SNACKBAR THÔNG BÁO -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      top
      right
      timeout="3000"
      class="custom-snackbar"
    >
      <div class="d-flex align-center">
        <v-icon left dark>{{ snackbarColor === '#4caf50' ? 'mdi-check-circle' : 'mdi-alert-circle' }}</v-icon>
        <span>{{ snackbarText }}</span>
      </div>
      <template v-slot:action="{ attrs }">
        <v-btn text dark v-bind="attrs" @click="snackbar = false">
          <v-icon small>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import ChangeableStatus from '~/components/Base/ChangeableStatus.vue'
import examService from '~/services/examService'

export default {
  name: 'ExamManagementPage',
  components: { BaseTable, ChangeableStatus },
  data() {
    return {
      loading: false,
      submitting: false,
      deleting: false,
      itemList: [],
      semesterList: [],
      totalRecords: 0,
      totalPages: 1,
      currentPage: 1,
      pageInput: 1,
      itemsPerPage: 50,

      viewDialog: false,
      viewItem: {},

      fromMenu: false,
      toMenu: false,
      fromMode: 'DATE',
      toMode: 'DATE',
      tempFromDate: '',
      tempFromTime: '00:00',
      tempToDate: '',
      tempToTime: '00:00',

      dialog: false,
      isEdit: false,
      editId: null,
      fromFilterMenu: false,
      toFilterMenu: false,

      deleteDialog: false,
      selectedItemToDelete: null,

      snackbar: false,
      snackbarText: '',
      snackbarColor: '#4caf50',

      formModel: {
        name: '',
        code: '',
        semesterId: null,
        fromTime: '',
        toTime: '',
        status: 'ACTIVE'
      },

      statusList: [
        { value: 'ACTIVE', text: 'Kích hoạt', color: '#a2212b' },
        { value: 'INACTIVE', text: 'Chưa kích hoạt', color: '#9e9e9e' }
      ],

      filters: {
        search: '',
        fromTime: '',
        toTime: '',
        status: ''
      },
      activeFilters: {
        search: '',
        fromTime: '',
        toTime: '',
        status: ''
      },

      headers: [
        { text: 'STT', value: 'stt', align: 'center', width: '60px', sortable: false },
        { text: 'Tên kỳ đăng ký thi lại', value: 'name', align: 'left', minWidth: '180px', sortable: false },
        { text: 'Mã kỳ đăng ký thi lại', value: 'code', align: 'left', minWidth: '150px', sortable: false },
        { text: 'Học kỳ', value: 'semesterName', align: 'left', minWidth: '140px', sortable: false },
        { text: 'Thời gian đăng ký', value: 'timeRange', align: 'left', minWidth: '200px', sortable: false },
        { text: 'Trạng thái', value: 'status', align: 'center', minWidth: '150px', sortable: false },
        { text: 'Chức năng', value: 'actions', align: 'center', minWidth: '120px', sortable: false }
      ]
    }
  },
  watch: {
    fromMenu(val) {
      if (val) this.fromMode = 'DATE'
    },
    toMenu(val) {
      if (val) this.toMode = 'DATE'
    }
  },
  computed: {
    displayedPages() {
      const total = this.totalPages
      const current = this.currentPage
      const pages = []
      if (total <= 7) {
        for (let i = 1; i <= total; i++) pages.push(i)
      } else if (current <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', total)
      } else if (current >= total - 3) {
        pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total)
      } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', total)
      }
      return pages
    },
    formattedFromFilterDate: {
      get() {
        if (!this.filters.fromTime) return ''
        const parts = this.filters.fromTime.split('-')
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
        return this.filters.fromTime
      },
      set(val) { if (!val) this.filters.fromTime = '' }
    },
    formattedToFilterDate: {
      get() {
        if (!this.filters.toTime) return ''
        const parts = this.filters.toTime.split('-')
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
        return this.filters.toTime
      },
      set(val) { if (!val) this.filters.toTime = '' }
    }
  },
  async mounted() {
    await Promise.all([this.loadPageRole(), this.loadUserInfo(), this.loadSemesters()])
    await this.loadData()
  },
  methods: {
    async loadPageRole() {
      try { await examService.getPageRole() } catch (err) {}
    },
    async loadUserInfo() {
      try { await examService.getUserInfo() } catch (err) {}
    },
    async loadSemesters() {
      try {
        const res = await examService.getSemesterList()
        const root = res.data !== undefined ? res.data : res
        this.semesterList = Array.isArray(root) ? root : (root.data || root.content || [])
      } catch (err) {
        console.error('Lỗi tải danh sách học kỳ:', err)
      }
    },
    async loadData() {
      this.loading = true
      try {
        const formatParamDate = (dateStr, isEnd = false) => {
          if (!dateStr) return ''
          const parts = dateStr.split('-')
          if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]} ${isEnd ? '23:59:59' : '00:00:00'}`
          }
          return dateStr
        }

        const params = {
          pageIndex: this.currentPage,
          pageSize: this.itemsPerPage,
          channel: 'CMS',
          sort: 'id,desc',
          ...(this.activeFilters.search && { search: this.activeFilters.search }),
          ...(this.activeFilters.status && { status: this.activeFilters.status }),
          ...(this.activeFilters.fromTime && { fromTime: formatParamDate(this.activeFilters.fromTime, false) }),
          ...(this.activeFilters.toTime && { toTime: formatParamDate(this.activeFilters.toTime, true) })
        }

        const res = await examService.getExamList(params)
        if (res) {
          const rootData = res.data !== undefined ? res.data : res
          const items = Array.isArray(rootData) ? rootData : (rootData.data || rootData.content || rootData.items || [])
          this.itemList = items
          this.totalRecords = Number(rootData.totalElements ?? rootData.totalRecords ?? items.length)
          this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage) || 1
        }
      } catch (err) {
        console.error('Lỗi tải danh sách kỳ thi:', err)
      } finally {
        this.loading = false
      }
    },
    formatTimeRange(item) {
      if (item.fromTime && item.toTime) {
        const cleanFrom = item.fromTime.split(' ')[0]
        const cleanTo = item.toTime.split(' ')[0]
        return `${cleanFrom} - ${cleanTo}`
      }
      return item.timeRange || item.time || '-'
    },
    openAddDialog() {
      this.isEdit = false
      this.editId = null
      this.formModel = { name: '', code: '', semesterId: null, fromTime: '', toTime: '', status: 'ACTIVE' }
      this.tempFromDate = ''
      this.tempFromTime = '00:00'
      this.tempToDate = ''
      this.tempToTime = '00:00'
      this.fromMode = 'DATE'
      this.toMode = 'DATE'
      this.dialog = true
    },
    onFromDatePicked(dateStr) {
      if (dateStr) {
        this.tempFromDate = dateStr
        this.fromMode = 'TIME'
      }
    },
    onFromTimePicked(timeStr) {
      if (this.tempFromDate && timeStr) {
        const parts = this.tempFromDate.split('-')
        const cleanTime = timeStr.split(':').length === 2 ? `${timeStr}:00` : timeStr
        this.formModel.fromTime = `${parts[2]}/${parts[1]}/${parts[0]} ${cleanTime}`
      }
      this.fromMenu = false
      this.fromMode = 'DATE'
    },
    onToDatePicked(dateStr) {
      if (dateStr) {
        this.tempToDate = dateStr
        this.toMode = 'TIME'
      }
    },
    onToTimePicked(timeStr) {
      if (this.tempToDate && timeStr) {
        const parts = this.tempToDate.split('-')
        const cleanTime = timeStr.split(':').length === 2 ? `${timeStr}:00` : timeStr
        this.formModel.toTime = `${parts[2]}/${parts[1]}/${parts[0]} ${cleanTime}`
      }
      this.toMenu = false
      this.toMode = 'DATE'
    },
    async handleSave() {
      if (!this.formModel.name || !this.formModel.code) return

      if (this.tempFromDate && (!this.formModel.fromTime || !this.formModel.fromTime.includes(':'))) {
        const parts = this.tempFromDate.split('-')
        this.formModel.fromTime = `${parts[2]}/${parts[1]}/${parts[0]} ${this.tempFromTime.length === 5 ? this.tempFromTime + ':00' : '00:00:00'}`
      }
      if (this.tempToDate && (!this.formModel.toTime || !this.formModel.toTime.includes(':'))) {
        const parts = this.tempToDate.split('-')
        this.formModel.toTime = `${parts[2]}/${parts[1]}/${parts[0]} ${this.tempToTime.length === 5 ? this.tempToTime + ':00' : '23:59:59'}`
      }

      this.submitting = true
      try {
        const payload = {
          name: this.formModel.name,
          code: this.formModel.code,
          semesterId: this.formModel.semesterId || null,
          fromTime: this.formModel.fromTime,
          toTime: this.formModel.toTime,
          status: this.formModel.status
        }

        if (this.isEdit) {
          await examService.updateExam(this.editId, payload, 'CMS')
          this.snackbarText = 'Cập nhật thành công'
        } else {
          await examService.createExam(payload, 'CMS')
          this.snackbarText = 'Thêm mới thành công'
        }

        this.dialog = false
        this.snackbarColor = '#4caf50'
        this.snackbar = true
        
        this.currentPage = 1
        this.pageInput = 1
        await this.loadData()
      } catch (err) {
        console.error('Lỗi lưu kỳ thi:', err)
        const errorMsg = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi lưu'
        this.snackbarText = errorMsg
        this.snackbarColor = '#e53935'
        this.snackbar = true
      } finally {
        this.submitting = false
      }
    },
    handleDelete(item) {
      this.selectedItemToDelete = item
      this.deleteDialog = true
    },
    async confirmDelete() {
      if (!this.selectedItemToDelete) return
      this.deleting = true
      try {
        await examService.deleteExam(this.selectedItemToDelete.id, 'CMS')
        this.deleteDialog = false
        this.snackbarText = 'Xóa thành công'
        this.snackbarColor = '#4caf50'
        this.snackbar = true
        await this.loadData()
      } catch (err) {
        console.error('Lỗi xóa kỳ thi:', err)
        const errorMsg = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi xóa'
        this.snackbarText = errorMsg
        this.snackbarColor = '#e53935'
        this.snackbar = true
      } finally {
        this.deleting = false
      }
    },
    handleSearch() {
      this.activeFilters = { ...this.filters }
      this.currentPage = 1
      this.loadData()
    },
    refreshData() {
      this.filters = { search: '', fromTime: '', toTime: '', status: '' }
      this.activeFilters = { search: '', fromTime: '', toTime: '', status: '' }
      this.currentPage = 1
      this.loadData()
    },
    changePage(page) {
      if (page < 1 || page > this.totalPages) return
      this.currentPage = page
      this.pageInput = page
      this.loadData()
    },
    goToPage() {
      const p = parseInt(this.pageInput)
      if (p >= 1 && p <= this.totalPages) this.changePage(p)
      else this.pageInput = this.currentPage
    },
    handlePerPageChange(size) {
      this.itemsPerPage = Number(size)
      this.currentPage = 1
      this.loadData()
    },
    async handleStatusChange(item, selectedItem) {
      try {
        const val = selectedItem.value || selectedItem
        await examService.changeExamStatus(item.id, { status: val }, 'CMS')
        item.status = val
        await this.loadData()
      } catch (err) {
        console.error('Lỗi đổi trạng thái:', err)
      }
    },
    async handleView(item) {
      try {
        // Gọi API chi tiết chuẩn qua /api/exam/detail/{id}
        const res = await examService.getExamDetail(item.id, 'CMS')
        const detail = res.data !== undefined ? res.data : res
        this.viewItem = detail || item
        this.viewDialog = true
      } catch (err) {
        console.error('Lỗi lấy chi tiết kỳ thi:', err)
        const errorMsg = err.response?.data?.message || err.message || 'Lỗi hệ thống'
        this.snackbarText = errorMsg
        this.snackbarColor = '#e53935'
        this.snackbar = true
      }
    },

    async handleEdit(item) {
      this.isEdit = true
      this.editId = item.id
      try {
        const res = await examService.getExamDetail(item.id, 'CMS')
        const detail = res.data !== undefined ? res.data : res

        this.formModel = {
          name: detail.name || item.name || '',
          code: detail.code || item.code || '',
          semesterId: detail.semesterId || (detail.semester ? detail.semester.id : null) || item.semesterId || null,
          fromTime: detail.fromTime || item.fromTime || '',
          toTime: detail.toTime || item.toTime || '',
          status: detail.status || item.status || 'ACTIVE'
        }

        // Tách ngày giờ đổ lại vào Date & Time Picker
        if (this.formModel.fromTime) {
          const [d, t] = this.formModel.fromTime.split(' ')
          if (d) {
            const p = d.split('/')
            this.tempFromDate = `${p[2]}-${p[1]}-${p[0]}`
          }
          if (t) this.tempFromTime = t.substring(0, 5)
        }
        if (this.formModel.toTime) {
          const [d, t] = this.formModel.toTime.split(' ')
          if (d) {
            const p = d.split('/')
            this.tempToDate = `${p[2]}-${p[1]}-${p[0]}`
          }
          if (t) this.tempToTime = t.substring(0, 5)
        }

        this.fromMode = 'DATE'
        this.toMode = 'DATE'
        this.dialog = true
      } catch (err) {
        console.error('Lỗi lấy thông tin khi sửa:', err)
        const errorMsg = err.response?.data?.message || err.message || 'Lỗi hệ thống'
        this.snackbarText = errorMsg
        this.snackbarColor = '#e53935'
        this.snackbar = true
      }
    },
  }
}
</script>

<style scoped>
.exam-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  max-height: calc(100vh - 64px);
  overflow: hidden;
  padding: 16px;
  box-sizing: border-box;
}
.fixed-top-section {
  flex-shrink: 0;
  background-color: #ffffff;
  z-index: 5;
}
.scrollable-table-section {
  flex: 1 1 auto;
  overflow-y: auto;
  min-height: 0;
  background-color: #ffffff;
}
.fixed-bottom-section {
  flex-shrink: 0;
  background-color: #ffffff;
  padding: 8px 16px;
  z-index: 5;
  justify-content: flex-end !important;
}
.scrollable-table-section >>> th {
  position: sticky !important;
  top: 0;
  z-index: 3;
  background-color: #f5f5f5 !important;
}
.text-red-bold { color: #A62229 !important; }
.filter-input >>> .v-input__slot { border-radius: 6px !important; min-height: 38px !important; }
.btn-square-action { border-radius: 6px !important; height: 38px !important; min-width: 38px !important; }
::v-deep .v-data-footer { display: none !important; }

.pagination-custom >>> .v-text-field--outlined.v-input--dense >>> .v-label,
.pagination-custom >>> .v-select--outlined.v-input--dense >>> .v-label {
  top: -2px !important;
  background-color: #ffffff;
  padding: 0 4px;
  font-size: 13px;
  color: #666666 !important;
}

.pagination-custom >>> .v-select .v-input__slot,
.pagination-custom >>> .v-select.v-input--is-focused .v-input__slot,
.pagination-custom >>> .v-select.v-select--is-menu-active .v-input__slot {
  box-shadow: none !important;
}

.pagination-custom >>> fieldset {
  border-color: #9e9e9e !important;
}

.pagination-custom >>> .v-select.v-input--is-focused fieldset,
.pagination-custom >>> .v-select.v-select--is-menu-active fieldset {
  border-color: #9e9e9e !important;
  border-width: 1px !important;
}

.pagination-custom >>> *:focus,
.pagination-custom >>> *:focus-visible {
  outline: none !important;
}

.custom-snackbar >>> .v-snack__wrapper {
  top: 20px !important;
  right: 20px !important;
  position: fixed !important;
}

@media (max-width: 768px) {
  .fixed-bottom-section {
    justify-content: center !important;
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px 4px;
  }
}
</style>