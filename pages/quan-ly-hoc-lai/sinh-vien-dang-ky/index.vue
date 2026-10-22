<template>
  <div class="registered-students-page bg-white">
    <input
      ref="fileImportInput"
      type="file"
      accept=".xlsx, .xls"
      class="d-none"
      @change="handleImportExcel"
    />

    <div class="main-page-layout">
      <!-- 1. PHẦN TIÊU ĐỀ VÀ BỘ LỌC CỐ ĐỊNH Ở TRÊN -->
      <div class="sticky-filter-bar px-4 py-3 bg-white">
        <div class="d-flex align-center mb-2">
          <span class="text-h6 font-weight-bold text-red-bold">
            Danh sách sinh viên đăng ký học lại ({{ totalItems }})
          </span>
        </div>

        <div class="filter-section">
          <!-- HÀNG BỘ LỌC 1: 6 Ô INPUT -->
          <v-row dense class="mb-2">
            <v-col cols="12" sm="4" md="2">
              <v-text-field
                v-model="filters.keyword"
                placeholder="Thông tin sinh viên"
                outlined
                dense
                hide-details
                clearable
                @keyup.enter="handleSearch"
                @click:clear="handleSearch"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="4" md="2">
              <v-select
                v-model="filters.major"
                :items="majorOptions"
                item-text="text"
                item-value="value"
                placeholder="Ngành"
                outlined
                dense
                hide-details
                clearable
              ></v-select>
            </v-col>
            <v-col cols="12" sm="4" md="2">
              <v-select
                v-model="filters.studentClass"
                :items="classOptions"
                item-text="text"
                item-value="value"
                placeholder="Lớp sinh viên"
                outlined
                dense
                hide-details
                clearable
              ></v-select>
            </v-col>
            <v-col cols="12" sm="4" md="2">
              <v-select
                v-model="filters.session"
                :items="sessionOptions"
                item-text="text"
                item-value="value"
                placeholder="Kỳ đăng ký học lại"
                outlined
                dense
                hide-details
                clearable
              ></v-select>
            </v-col>
            <v-col cols="12" sm="4" md="2">
              <v-select
                v-model="filters.retakeClassCode"
                :items="retakeClassOptions"
                placeholder="Mã lớp học lại"
                outlined
                dense
                hide-details
                clearable
              ></v-select>
            </v-col>
            <v-col cols="12" sm="4" md="2">
              <v-select
                v-model="filters.subjectCode"
                :items="subjectOptions"
                item-text="text"
                item-value="value"
                placeholder="Mã học phần"
                outlined
                dense
                hide-details
                clearable
              ></v-select>
            </v-col>
          </v-row>

          <!-- HÀNG BỘ LỌC 2: 4 Ô INPUT + CỤM NÚT BẤM -->
          <v-row dense align="center">
            <v-col cols="12" sm="3" md="2">
              <v-select
                v-model="filters.tuitionStatus"
                :items="[
                  { text: 'Đã trả học phí', value: 'PAID' },
                  { text: 'Chưa trả học phí', value: 'NOT_PAID' },
                ]"
                item-text="text"
                item-value="value"
                placeholder="Trạng thái trả học phí"
                outlined
                dense
                hide-details
                clearable
              ></v-select>
            </v-col>
            <v-col cols="12" sm="3" md="2">
              <v-select
                v-model="filters.emailStatus"
                :items="[
                  { text: 'Đã gửi', value: 'SENDING' },
                  { text: 'Chưa gửi', value: 'NOT_SENT' },
                ]"
                item-text="text"
                item-value="value"
                placeholder="Trạng thái gửi email"
                outlined
                dense
                hide-details
                clearable
              ></v-select>
            </v-col>
            <v-col cols="12" sm="3" md="2">
              <v-select
                v-model="filters.approvalStatus"
                :items="[
                  { text: 'Chờ xác nhận', value: 'AWAITING_CONFIRMATION' },
                  { text: 'Đã xác nhận', value: 'CONFIRMED' },
                  { text: 'Từ chối', value: 'REJECTED' },
                  { text: 'Đã duyệt lớp', value: 'CLASS_APPROVED' },
                ]"
                item-text="text"
                item-value="value"
                placeholder="Trạng thái duyệt đơn"
                outlined
                dense
                hide-details
                clearable
              ></v-select>
            </v-col>
            <v-col cols="12" sm="3" md="2">
              <v-select
                v-model="filters.bankStatus"
                :items="[
                  { text: 'Đã lập danh sách', value: 'ADDED' },
                  { text: 'Chưa lập danh sách', value: 'NOT_ADDED' },
                ]"
                item-text="text"
                item-value="value"
                placeholder="TT thêm DS ngân hàng"
                outlined
                dense
                hide-details
                clearable
              ></v-select>
            </v-col>

            <!-- CỤM NÚT THAO TÁC NẰM GỌN GÀNG GÓC PHẢI -->
            <v-col cols="12" md="4" class="d-flex align-center justify-end">
              <div class="action-toolbar d-flex align-center gap-2">
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      icon
                      text
                      class="btn-reload border-btn"
                      v-on="on"
                      @click="onReload"
                    >
                      <v-icon size="20" color="#a61c1c">mdi-refresh</v-icon>
                    </v-btn>
                  </template>
                  <span>Reset bộ lọc</span>
                </v-tooltip>

                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <button
                      v-bind="attrs"
                      class="action-btn btn-dark-red"
                      v-on="on"
                      @click="onSearch"
                    >
                      <v-icon size="18" color="#ffffff">mdi-magnify</v-icon>
                    </button>
                  </template>
                  <span>Tìm kiếm</span>
                </v-tooltip>

                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <button
                      v-bind="attrs"
                      class="action-btn btn-dark-red"
                      v-on="on"
                      @click="onAdd"
                    >
                      <v-icon size="18" color="#ffffff">mdi-plus</v-icon>
                    </button>
                  </template>
                  <span>Thêm mới</span>
                </v-tooltip>

                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <button
                      v-bind="attrs"
                      class="action-btn btn-orange"
                      v-on="on"
                      @click="openConfirmApproveEmail"
                    >
                      <v-icon size="18" color="#ffffff"
                        >mdi-email-plus-outline</v-icon
                      >
                    </button>
                  </template>
                  <span>Gửi email được phép đóng phí</span>
                </v-tooltip>

                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <button
                      v-bind="attrs"
                      class="action-btn btn-red"
                      v-on="on"
                      @click="openConfirmRejectEmail"
                    >
                      <v-icon size="18" color="#ffffff"
                        >mdi-email-remove-outline</v-icon
                      >
                    </button>
                  </template>
                  <span>Gửi email từ chối đăng ký</span>
                </v-tooltip>

                <div class="action-buttons-group d-flex align-center gap-2">
                  <!-- NÚT 1: GỬI DANH SÁCH THU PHÍ -->
                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <div v-bind="attrs" class="btn-badge-wrapper" v-on="on">
                        <span v-if="selectedCount > 0" class="badge-count">{{
                          selectedCount
                        }}</span>
                        <button
                          type="button"
                          class="action-btn btn-send"
                          :class="{ active: isActionActive }"
                          :disabled="!isActionActive"
                          @click="handleSendEmail"
                        >
                          <v-icon
                            size="18"
                            :color="isActionActive ? '#ffffff' : '#8e8e8e'"
                            >mdi-send</v-icon
                          >
                        </button>
                      </div>
                    </template>
                    <span>Gửi danh sách thu phí</span>
                  </v-tooltip>

                  <!-- NÚT 2: GIA HẠN NỘP HỌC PHÍ -->
                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <div v-bind="attrs" class="btn-badge-wrapper" v-on="on">
                        <span v-if="selectedCount > 0" class="badge-count">{{
                          selectedCount
                        }}</span>
                        <button
                          type="button"
                          class="action-btn btn-calendar"
                          :class="{ active: isActionActive }"
                          :disabled="!isActionActive"
                          @click="handleSchedule"
                        >
                          <v-icon
                            size="18"
                            :color="isActionActive ? '#ffffff' : '#8e8e8e'"
                            >mdi-calendar-clock-outline</v-icon
                          >
                        </button>
                      </div>
                    </template>
                    <span>Gia hạn nộp học phí</span>
                  </v-tooltip>
                </div>
              </div>
            </v-col>
          </v-row>
        </div>
      </div>

      <!-- 2. KHU VỰC BẢNG DỮ LIỆU Ở GIỮA -->
      <div class="scrollable-table-area">
        <BaseTable
          :headers="tableHeaders"
          :items="appliedItems"
          :loading="loading"
          :items-per-page="pageSize"
          hide-default-footer
          class="elevation-0"
        >
          <!-- HEADER CHECKBOX SELECT ALL -->
          <template #[`header.data-table-select`]>
            <v-checkbox
              v-model="selectAll"
              hide-details
              dense
              class="ma-0 pa-0"
              @change="toggleSelectAll"
            ></v-checkbox>
          </template>

          <!-- ITEM CHECKBOX HÀNG -->
          <template #[`item.data-table-select`]="{ item }">
            <v-checkbox
              v-model="selectedIds"
              :value="item.id"
              hide-details
              dense
              class="ma-0 pa-0"
              @change="onItemSelectChange"
            ></v-checkbox>
          </template>

          <template #[`item.stt`]="{ index }">
            {{ (page - 1) * pageSize + index + 1 }}
          </template>

          <template #[`item.studentInfo`]="{ item }">
            <div class="font-weight-bold text-red-bold mb-1">
              Tên SV: {{ item.fullName }}
            </div>
            <div class="text-caption grey--text text--dark-2 mb-1">
              Mã số SV:
              <span class="font-weight-medium text-red-bold">{{
                item.code
              }}</span>
            </div>
            <div class="text-caption grey--text text--dark-2">
              Tên Lớp:
              <span class="font-weight-medium text-red-bold">{{
                item.clazz && item.clazz.name
              }}</span>
            </div>
          </template>

          <template #[`item.subject`]="{ item }">
            <div
              v-for="(termObj, idx) in item.registerStudentTerms || []"
              :key="idx"
              class="text-body-2"
            >
              {{ idx + 1 }}. {{ termObj.term && termObj.term.name }} -
              {{ termObj.term && termObj.term.code }}
            </div>
          </template>

          <template #[`item.registerDateTime`]="{ item }">
            <div>{{ item.registerDate || '--' }}</div>
            <div class="text-caption grey--text">
              {{ item.registerTime || '' }}
            </div>
          </template>

          <template #[`item.totalFee`]="{ item }">
            <span class="font-weight-medium">{{
              formatCurrency(item.totalFeeOfExam)
            }}</span>
          </template>

          <template #[`item.tuitionStatus`]="{ item }">
            <span
              class="status-badge"
              :style="getStatusStyle(item.tuitionStatus, 'feePaidStatusMap')"
            >
              {{ getStatusLabel(item.tuitionStatus, 'feePaidStatusMap') }}
            </span>
          </template>

          <template #[`item.bankStatus`]="{ item }">
            <span
              class="status-badge"
              :style="getStatusStyle(item.bankStatus, 'bankStatusMap')"
            >
              {{ getStatusLabel(item.bankStatus, 'bankStatusMap') }}
            </span>
          </template>

          <template #[`item.emailStatus`]="{ item }">
            <span
              class="status-badge"
              :style="getStatusStyle(item.emailStatus, 'sendMailStatusMap')"
            >
              {{ getStatusLabel(item.emailStatus, 'sendMailStatusMap') }}
            </span>
          </template>

          <template #[`item.approvalStatus`]="{ item }">
            <span
              class="status-badge"
              :style="
                getStatusStyle(
                  item.registerStudentStatus,
                  'registerStudentStatusMap'
                )
              "
            >
              {{
                getStatusLabel(
                  item.registerStudentStatus,
                  'registerStudentStatusMap'
                )
              }}
            </span>
          </template>

          <template #[`item.actions`]="{ item }">
            <div class="d-flex align-center justify-center gap-1">
              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-btn
                    icon
                    text
                    small
                    class="row-action-btn"
                    v-bind="attrs"
                    v-on="on"
                    @click="openDetailModal(item)"
                  >
                    <v-icon size="20" color="#00bcd4">mdi-eye</v-icon>
                  </v-btn>
                </template>
                <span>Chi tiết</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-btn
                    icon
                    text
                    small
                    class="row-action-btn"
                    v-bind="attrs"
                    v-on="on"
                    @click="openApproveModal(item)"
                  >
                    <v-icon size="20" color="#4caf50">mdi-check-circle</v-icon>
                  </v-btn>
                </template>
                <span>Xác nhận duyệt đơn</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-btn
                    icon
                    text
                    small
                    class="row-action-btn"
                    v-bind="attrs"
                    v-on="on"
                    @click="openEditModal(item)"
                  >
                    <v-icon size="20" color="#ffb300">mdi-pencil</v-icon>
                  </v-btn>
                </template>
                <span>Cập nhật</span>
              </v-tooltip>
            </div>
          </template>
        </BaseTable>
      </div>

      <!-- 3. THANH NÚT EXCEL VÀ PHÂN TRANG -->
      <div
        class="table-footer px-4 py-2 bg-white d-flex flex-wrap align-center justify-space-between"
      >
        <div class="d-flex flex-wrap gap-2">
          <v-btn
            color="#4CAF50"
            dark
            small
            elevation="0"
            class="text-none font-weight-medium rounded-sm"
            @click="exportRequiredFeeResult"
          >
            <v-icon left small>mdi-export</v-icon> XUẤT FILE KẾT QUẢ CẦN THU
          </v-btn>
          <v-btn
            color="#4CAF50"
            dark
            small
            elevation="0"
            class="text-none font-weight-medium rounded-sm"
            @click="exportUnpaidList"
          >
            <v-icon left small>mdi-export</v-icon> XUẤT FILE DANH SÁCH CHƯA TRẢ
            HỌC PHÍ
          </v-btn>
          <v-btn
            color="#4CAF50"
            dark
            small
            elevation="0"
            class="text-none font-weight-medium rounded-sm"
            @click="triggerImportFile"
          >
            <v-icon left small>mdi-microsoft-excel</v-icon> NHẬP FILE KẾT QUẢ ĐÃ
            THU
          </v-btn>
          <v-btn
            color="#4CAF50"
            dark
            small
            elevation="0"
            class="text-none font-weight-medium rounded-sm"
            @click="exportAuditList"
          >
            <v-icon left small>mdi-export</v-icon> XUẤT FILE RÀ SOÁT HỌC PHÍ
          </v-btn>
        </div>

        <div class="d-flex align-center gap-2">
          <div class="d-flex align-center gap-1 text-caption">
            <span>Bản ghi</span>
            <v-select
              v-model="pageSize"
              :items="[10, 20, 50, 100]"
              outlined
              dense
              hide-details
              class="page-size-select"
              @change="onChangePageSize"
            ></v-select>
          </div>

          <div class="d-flex align-center gap-1 text-caption">
            <span>Trang</span>
            <v-text-field
              v-model="pageInput"
              outlined
              dense
              hide-details
              class="page-input-field text-center"
              @keyup.enter="goToPage"
            ></v-text-field>
            <v-btn
              color="#A62229"
              dark
              x-small
              class="go-btn"
              elevation="0"
              @click="goToPage"
              >Đi</v-btn
            >
          </div>

          <v-pagination
            v-model="page"
            :length="totalPages"
            :total-visible="3"
            color="#A62229"
            dense
            @input="onPageChange"
          ></v-pagination>
        </div>
      </div>
    </div>

    <RegisterRetakeCourseModal
      v-model="showAddModal"
      :students-list="mustRetakeStudentOptions"
      :registered-classes-list="items"
      :session-options-list="sessionOptions"
      :subject-options-list="subjectOptions"
      :retake-courses-full-list="retakeCoursesList"
      @success="handleRegisterSuccess"
    />
  </div>
</template>

<script>
import * as XLSX from 'xlsx'
import RegisterRetakeCourseModal from '~/components/RetakeCourse/RegisterRetakeCourseModal.vue'
import BaseTable from '~/components/Base/BaseTable.vue'

export default {
  name: 'RegisteredStudentsPage',
  components: {
    RegisterRetakeCourseModal,
    BaseTable,
  },
  data() {
    return {
      isMobileDevice: false,
      loading: false,
      showAddModal: false,
      selectedIds: [],
      selectAll: false,

      page: 1,
      pageSize: 50,
      pageInput: '1',
      totalItems: 0,

      filters: {
        keyword: '',
        major: null,
        studentClass: null,
        session: null,
        retakeClassCode: null,
        subjectCode: null,
        tuitionStatus: null,
        emailStatus: null,
        approvalStatus: null,
        bankStatus: null,
      },

      registerStudentStatusMap: {
        AWAITING_CONFIRMATION: { label: 'Chờ xác nhận', color: '#FFC107' },
        CONFIRMED: { label: 'Đã xác nhận', color: '#28A745' },
        REJECTED: { label: 'Từ chối', color: '#DC3545' },
        CLASS_APPROVED: { label: 'Đã duyệt lớp', color: '#28A745' },
        FINALIZED: { label: 'Đã duyệt lớp', color: '#28A745' },
      },
      feePaidStatusMap: {
        NOT_PAID: { label: 'Chưa trả học phí', color: '#FFC107' },
        PAID: { label: 'Đã trả học phí', color: '#28A745' },
        CHUA_TRA: { label: 'Chưa trả học phí', color: '#FFC107' },
        DA_TRA: { label: 'Đã trả học phí', color: '#28A745' },
      },
      sendMailStatusMap: {
        NOT_SENT: { label: 'Chưa gửi', color: '#FFC107' },
        SENDING: { label: 'Đã gửi', color: '#28A745' },
        SENT: { label: 'Đã gửi', color: '#28A745' },
        DA_GUI: { label: 'Đã gửi', color: '#28A745' },
        COMPLETED: { label: 'Đã gửi', color: '#28A745' },
      },
      bankStatusMap: {
        NOT_ADDED: { label: 'Chưa lập danh sách', color: '#FFC107' },
        ADDED: { label: 'Đã lập danh sách', color: '#28A745' },
        CHUA_LAP: { label: 'Chưa lập danh sách', color: '#FFC107' },
        DA_LAP: { label: 'Đã lập danh sách', color: '#28A745' },
        NO: { label: 'Chưa lập danh sách', color: '#FFC107' },
        YES: { label: 'Đã lập danh sách', color: '#28A745' },
        LISTED: { label: 'Đã lập danh sách', color: '#28A745' },
        NOT_LISTED: { label: 'Chưa lập danh sách', color: '#FFC107' },
      },

      majorOptions: [],
      classOptions: [],
      sessionOptions: [],
      retakeClassOptions: [],
      subjectOptions: [],

      tableHeaders: [
        {
          text: '',
          value: 'data-table-select',
          sortable: false,
          align: 'center',
          width: '40px',
        },
        {
          text: 'STT',
          value: 'stt',
          sortable: false,
          align: 'center',
          width: '50px',
        },
        {
          text: 'Thông tin sinh viên',
          value: 'studentInfo',
          sortable: false,
          align: 'left',
        },
        {
          text: 'Kỳ đăng ký học lại',
          value: 'sessionCode',
          sortable: false,
          align: 'left',
        },
        {
          text: 'Học phần đăng ký',
          value: 'subject',
          sortable: false,
          align: 'left',
        },
        {
          text: 'Mã đơn đăng ký',
          value: 'registrationCode',
          sortable: false,
          align: 'left',
        },
        {
          text: 'Thời gian đăng ký',
          value: 'registerDateTime',
          sortable: false,
          align: 'center',
        },
        {
          text: 'Thời gian duyệt đơn',
          value: 'approvalDate',
          sortable: false,
          align: 'center',
        },
        {
          text: 'Tổng học phí',
          value: 'totalFee',
          sortable: false,
          align: 'right',
        },
        {
          text: 'Trạng thái trả học phí',
          value: 'tuitionStatus',
          sortable: false,
          align: 'center',
        },
        {
          text: 'Thời gian và CB gửi Thu phí',
          value: 'collectorInfo',
          sortable: false,
          align: 'center',
        },
        {
          text: 'TT thêm DS ngân hàng',
          value: 'bankStatus',
          sortable: false,
          align: 'center',
        },
        {
          text: 'Trạng thái gửi email',
          value: 'emailStatus',
          sortable: false,
          align: 'center',
        },
        {
          text: 'Trạng thái duyệt đơn',
          value: 'approvalStatus',
          sortable: false,
          align: 'center',
        },
        {
          text: 'Chức năng',
          value: 'actions',
          sortable: false,
          align: 'center',
          width: '110px',
        },
      ],

      items: [],
      appliedItems: [],
      mustRetakeStudentOptions: [],
      retakeCoursesList: [],
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.totalItems / this.pageSize) || 1
    },
    selectedCount() {
      return this.selectedIds.length
    },
    isActionActive() {
      return this.selectedCount > 0
    },
  },
  async mounted() {
    if (typeof navigator !== 'undefined') {
      this.isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
    }

    await Promise.all([
      this.fetchRetakeSessions(),
      this.fetchCourseOptions(),
      this.fetchMajors(),
      this.fetchClasses(),
      this.fetchRetakeCourses(),
      this.fetchRegisteredStudents(),
    ])
  },
  methods: {
    toggleSelectAll(val) {
      if (val) {
        this.selectedIds = this.items.map((item) => item.id)
      } else {
        this.selectedIds = []
      }
    },
    onItemSelectChange() {
      this.selectAll =
        this.items.length > 0 &&
        this.items.every((item) => this.selectedIds.includes(item.id))
    },
    getStatusConfig(status, mapType) {
      const statusMap = this[mapType]
      if (!statusMap) return null
      return (
        statusMap[status] ||
        Object.values(statusMap).find((config) => config.label === status) ||
        Object.values(statusMap)[0]
      )
    },
    getStatusStyle(status, mapType) {
      const config = this.getStatusConfig(status, mapType)
      return config
        ? { backgroundColor: config.color, color: '#FFFFFF' }
        : { backgroundColor: '#FFC107', color: '#FFFFFF' }
    },
    getStatusLabel(status, mapType) {
      const config = this.getStatusConfig(status, mapType)
      return config ? config.label : status || '--'
    },
    formatCurrency(val) {
      if (!val) return '0'
      return new Intl.NumberFormat('vi-VN').format(val)
    },
    onChangePageSize() {
      this.page = 1
      this.pageInput = '1'
      this.updatePaginationSlice()
    },
    onPageChange(val) {
      this.pageInput = String(val)
      this.updatePaginationSlice()
    },
    goToPage() {
      const p = parseInt(this.pageInput)
      if (p && p >= 1 && p <= this.totalPages) {
        this.page = p
        this.updatePaginationSlice()
      } else {
        this.pageInput = String(this.page)
      }
    },
    updatePaginationSlice() {
      const start = (this.page - 1) * this.pageSize
      const end = start + this.pageSize
      this.appliedItems = this.items.slice(start, end)
    },

    async fetchRetakeSessions() {
      try {
        const res = await this.$axios.$get('/api/retakeSession/list', {
          params: { channel: 'CMS' },
        })
        const sessions = Array.isArray(res?.data)
          ? res.data
          : res?.data?.items || res || []
        if (sessions.length) {
          this.sessionOptions = sessions.map((item) => ({
            text: item.maDot || item.code || item.name || String(item.id),
            value: item.id,
          }))
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách kỳ học lại:', err)
      }
    },

    async fetchCourseOptions() {
      try {
        const res = await this.$axios.$get('/api/term/list', {
          params: { status: 'ACTIVE', channel: 'CMS' },
        })
        const terms = res?.data || res || []
        if (terms.length) {
          this.subjectOptions = terms.map((item) => ({
            text: `${item.code} - ${item.name}`,
            value: item.code,
          }))
        }
      } catch (err) {
        console.error('Lỗi khi tải danh mục học phần:', err)
      }
    },

    async fetchMajors() {
      try {
        const res = await this.$axios.$get('/api/major/list', {
          params: { status: 'ACTIVE', channel: 'CMS' },
        })
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : []
        if (list.length) {
          this.majorOptions = list.map((item) => ({
            text: item.name || item.code,
            value: item.id || item.code,
          }))
        }
      } catch (err) {
        console.error('Lỗi khi lấy danh sách ngành:', err)
      }
    },

    async fetchClasses() {
      try {
        const res = await this.$axios.$get('/api/classes/all', {
          params: { channel: 'CMS' },
        })
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : []
        if (list.length) {
          this.classOptions = list.map((item) => ({
            text: item.name || item.code,
            value: item.id || item.code,
          }))
        }
      } catch (err) {
        console.error('Lỗi khi lấy danh sách lớp sinh viên:', err)
      }
    },

    async fetchRetakeCourses() {
      try {
        const res = await this.$axios.$get('/api/retakeCourse', {
          params: { pageIndex: 1, pageSize: 100, channel: 'CMS' },
        })
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : []
        this.retakeCoursesList = list
        if (list.length) {
          this.retakeClassOptions = list
            .map((item) => item.code)
            .filter(Boolean)
        }
      } catch (err) {
        console.error('Lỗi khi lấy danh sách mã lớp học lại:', err)
      }
    },

    async fetchRegisteredStudents() {
      this.loading = true
      try {
        const selectedClassCode = this.filters.retakeClassCode || ''
        const params = {
          pageIndex: 1,
          pageSize: 100,
          search: this.filters.keyword || '',
          registerStudentStatus: this.filters.approvalStatus || '',
          retakeCourseStatus: selectedClassCode,
          retakeCourseCode: selectedClassCode,
          feePaidStatus: this.filters.tuitionStatus || '',
          sendMailStatus: this.filters.emailStatus || '',
          listFinalStatus: this.filters.bankStatus || '',
          retakeSessionId: this.filters.session || '',
          subjectCode: this.filters.subjectCode || '',
          majorId: this.filters.major || '',
          classId: this.filters.studentClass || '',
          channel: 'CMS',
        }

        const res = await this.$axios.$get('/api/registerRetakeCourse', {
          params,
        })
        const rawList = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : []

        this.items = rawList.map((item, index) => {
          const feePaid = item.feePaidStatus || item.tuitionStatus || 'NOT_PAID'
          const mailStatus =
            item.sendMailStatus || item.emailStatus || 'NOT_SENT'

          let bankState = 'NOT_ADDED'
          const rawListStatus = item.listFinalStatus || ''
          const rawIsListed = item.isListedForBank || ''

          if (rawListStatus === 'LISTED' || rawIsListed === 'YES') {
            bankState = 'ADDED'
          } else {
            bankState = 'NOT_ADDED'
          }

          return {
            ...item,
            id: item.id || index + 1,
            fullName:
              item.fullName || (item.student && item.student.fullName) || '---',
            code: item.code || (item.student && item.student.code) || '',
            registerDate: item.createdAt
              ? item.createdAt.slice(0, 10)
              : '2026-09-01',
            registerTime: item.createdAt
              ? item.createdAt.slice(11, 19)
              : '08:00:00',
            totalFeeOfExam: item.totalFeeOfExam || item.totalFee || 0,
            registerStudentStatus:
              item.registerStudentStatus ||
              item.status ||
              'AWAITING_CONFIRMATION',
            tuitionStatus: feePaid,
            bankStatus: bankState,
            emailStatus: mailStatus,
          }
        })

        this.totalItems = this.items.length
        this.page = 1
        this.pageInput = '1'
        this.selectedIds = []
        this.selectAll = false
        this.updatePaginationSlice()
      } catch (error) {
        console.error(
          'Không thể lấy danh sách sinh viên đăng ký học lại từ backend:',
          error
        )
        this.items = []
        this.appliedItems = []
        this.totalItems = 0
        this.selectedIds = []
        this.selectAll = false
      } finally {
        this.loading = false
      }
    },

    handleSearch() {
      this.page = 1
      this.pageInput = '1'
      this.fetchRegisteredStudents()
    },

    onReload() {
      this.filters = {
        keyword: '',
        major: null,
        studentClass: null,
        session: null,
        retakeClassCode: null,
        subjectCode: null,
        tuitionStatus: null,
        emailStatus: null,
        approvalStatus: null,
        bankStatus: null,
      }
      this.page = 1
      this.pageInput = '1'
      this.fetchRegisteredStudents()
    },

    onSearch() {
      this.handleSearch()
    },

    onAdd() {
      this.showAddModal = true
    },

    exportToExcel(rows, fileName) {
      try {
        const exportData = rows.map((item, index) => ({
          STT: index + 1,
          'Mã sinh viên': item.code || '',
          'Họ và tên': item.fullName || '',
          'Lớp sinh viên': item.clazz ? item.clazz.name : '',
          'Tổng học phí (VNĐ)': Number(item.totalFeeOfExam) || 0,
          'Trạng thái duyệt đơn': item.registerStudentStatus || '',
        }))
        const worksheet = XLSX.utils.json_to_sheet(exportData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSach')
        const now = new Date()
        const dateString = [
          now.getFullYear(),
          String(now.getMonth() + 1).padStart(2, '0'),
          String(now.getDate()).padStart(2, '0'),
        ].join('-')
        XLSX.writeFile(workbook, `${fileName}_${dateString}.xlsx`)
      } catch (error) {
        console.error('Lỗi khi xuất file Excel:', error)
      }
    },

    exportRequiredFeeResult() {
      const data = this.items.filter((item) => Number(item.totalFeeOfExam) > 0)
      this.exportToExcel(data, 'Ket_Qua_Can_Thu')
    },

    exportUnpaidList() {
      const data = this.items.filter(
        (item) =>
          this.getStatusLabel(item.tuitionStatus, 'feePaidStatusMap') ===
          'Chưa trả học phí'
      )
      this.exportToExcel(data, 'Danh_Sach_Chua_Tra_Hoc_Phi')
    },

    exportAuditList() {
      this.exportToExcel(this.items, 'Danh_Sach_Ra_Soat_Hoc_Phi')
    },

    triggerImportFile() {
      this.$refs.fileImportInput.click()
    },

    async handleImportExcel(event) {
      const file = event.target.files && event.target.files[0]
      if (!file) return
      try {
        const arrayBuffer = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (loadEvent) => resolve(loadEvent.target.result)
          reader.onerror = () => reject(new Error('Không thể đọc file Excel'))
          reader.readAsArrayBuffer(file)
        })
        const workbook = XLSX.read(new Uint8Array(arrayBuffer), {
          type: 'array',
        })
        const firstSheetName = workbook.SheetNames[0]
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName])
        console.log('Dữ liệu nhập từ Excel đã chọn:', rows)
      } catch (error) {
        console.error('Lỗi đọc file Excel:', error)
      } finally {
        event.target.value = ''
      }
    },

    openConfirmApproveEmail() {},
    openConfirmRejectEmail() {},
    handleSendEmail() {},
    handleSchedule() {},
    openDetailModal(item) {},
    openApproveModal(item) {},
    openEditModal(item) {},
    handleRegisterSuccess() {
      this.fetchRegisteredStudents()
    },
  },
}
</script>

<style scoped>
.registered-students-page {
  display: flex;
  height: calc(100vh - 60px);
  min-height: 0;
  flex-direction: column;
  overflow: hidden !important;
  box-sizing: border-box;
}

.main-page-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.sticky-filter-bar {
  flex-shrink: 0;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  z-index: 3;
}

.scrollable-table-area {
  flex-grow: 1;
  min-height: 0;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-footer {
  flex-shrink: 0;
  background-color: #ffffff;
  border-top: 1px solid #e0e0e0;
  z-index: 3;
}

.text-red-bold {
  color: #a62229 !important;
}

.action-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-reload {
  width: 36px !important;
  height: 36px !important;
  min-width: 36px !important;
}

.action-btn {
  width: 44px;
  height: 36px;
  min-width: 44px;
  border-radius: 6px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.row-action-btn {
  width: 32px;
  height: 32px;
  min-width: 32px;
}

.btn-dark-red {
  background-color: #a61c24;
}
.btn-orange {
  background-color: #fca02e;
}
.btn-red {
  background-color: #f93d32;
}

.btn-badge-wrapper {
  position: relative;
  display: inline-block;
}

.badge-count {
  position: absolute;
  top: -8px;
  right: -8px;
  z-index: 2;
  display: flex;
  min-width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border-radius: 10px;
  background-color: #f44336;
  color: #ffffff;
  font-size: 11px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.action-buttons-group .action-btn {
  width: 44px !important;
  min-width: 44px !important;
  height: 36px !important;
}

.action-buttons-group .action-btn:disabled {
  background-color: #e0e0e0 !important;
  cursor: not-allowed !important;
}

.btn-send.active {
  background-color: #10ce99 !important;
}
.btn-calendar.active {
  background-color: #4285f4 !important;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  color: #ffffff !important;
}

.page-size-select {
  width: 65px !important;
}
.page-input-field {
  width: 45px !important;
}
.go-btn {
  min-width: 28px !important;
  height: 28px !important;
}
.gap-1 {
  gap: 4px;
}
.gap-2 {
  gap: 8px;
}
</style>
