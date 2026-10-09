<template>
  <div class="registered-students-page pa-4 bg-white">
    <input
      ref="fileImportInput"
      type="file"
      accept=".xlsx, .xls"
      class="d-none"
      @change="handleImportExcel"
    />

    <!-- TIÊU ĐỀ BẢNG -->
    <div class="d-flex align-center mb-3">
      <span class="text-h6 font-weight-bold text-red-bold">
        Danh sách sinh viên đăng ký học lại ({{ totalItems }})
      </span>
    </div>

    <!-- KHU VỰC BỘ LỌC -->
    <div class="filter-section mb-4">
      <v-row dense class="mb-1">
        <v-col cols="12" sm="4" md="2">
          <v-text-field
            v-model="filters.keyword"
            placeholder="Thông tin sinh viên"
            outlined
            dense
            hide-details
            clearable
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="4" md="2">
          <v-select
            v-model="filters.major"
            :items="majorOptions"
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
            placeholder="Mã học phần"
            outlined
            dense
            hide-details
            clearable
          ></v-select>
        </v-col>
        <v-col cols="12" sm="4" md="2">
          <v-select
            v-model="filters.tuitionStatus"
            :items="['Đã trả học phí', 'Chưa trả học phí']"
            placeholder="Trạng thái trả học phí"
            outlined
            dense
            hide-details
            clearable
          ></v-select>
        </v-col>
        <v-col cols="12" sm="4" md="2">
          <v-select
            v-model="filters.emailStatus"
            :items="['Đã gửi', 'Chưa gửi']"
            placeholder="Trạng thái gửi email"
            outlined
            dense
            hide-details
            clearable
          ></v-select>
        </v-col>
        <v-col cols="12" sm="4" md="2">
          <v-select
            v-model="filters.approvalStatus"
            :items="['Chờ xác nhận', 'Đã xác nhận', 'Từ chối','Đã duyệt lớp']"
            placeholder="Trạng thái duyệt đơn"
            outlined
            dense
            hide-details
            clearable
          ></v-select>
        </v-col>
        <v-col cols="12" sm="4" md="2">
          <v-select
            v-model="filters.bankStatus"
            :items="['Đã lập danh sách', 'Chưa lập danh sách']"
            placeholder="TT thêm DS ngân hàng"
            outlined
            dense
            hide-details
            clearable
          ></v-select>
        </v-col>
      </v-row>

      <v-row dense align="center">
        <div class="action-toolbar d-flex align-center gap-2">
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn v-bind="attrs" icon text class="btn-reload" v-on="on" @click="onReload">
                <v-icon size="24" color="#a61c1c">mdi-refresh</v-icon>
              </v-btn>
            </template>
            <span>Reset bộ lọc</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <button v-bind="attrs" class="action-btn btn-dark-red" v-on="on" @click="onSearch">
                <v-icon size="24" color="#ffffff">mdi-magnify</v-icon>
              </button>
            </template>
            <span>Tìm kiếm</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <button v-bind="attrs" class="action-btn btn-dark-red" v-on="on" @click="onAdd">
                <v-icon size="24" color="#ffffff">mdi-plus</v-icon>
              </button>
            </template>
            <span>Thêm mới</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <button v-bind="attrs" class="action-btn btn-orange" v-on="on" @click="openConfirmApproveEmail">
                <v-icon size="24" color="#ffffff">mdi-email-plus-outline</v-icon>
              </button>
            </template>
            <span>Gửi email được phép đóng phí</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <button v-bind="attrs" class="action-btn btn-red" v-on="on" @click="openConfirmRejectEmail">
                <v-icon size="24" color="#ffffff">mdi-email-remove-outline</v-icon>
              </button>
            </template>
            <span>Gửi email từ chối đăng ký</span>
          </v-tooltip>

          <div class="action-buttons-group d-flex align-center gap-2">
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <div v-bind="attrs" class="btn-badge-wrapper" v-on="on">
                  <span v-if="isActionActive" class="badge-count">{{ selectedCount }}</span>
                  <button
                    type="button"
                    class="action-btn btn-send"
                    :class="{ active: isActionActive }"
                    :disabled="!isActionActive"
                    @click="handleSendEmail"
                  >
                    <v-icon size="22" :color="isActionActive ? '#ffffff' : '#8e8e8e'">mdi-send</v-icon>
                  </button>
                </div>
              </template>
              <span>Gửi danh sách thu phí cho các sinh viên đã chọn</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <div v-bind="attrs" class="btn-badge-wrapper" v-on="on">
                  <span v-if="isActionActive" class="badge-count">{{ selectedCount }}</span>
                  <button
                    type="button"
                    class="action-btn btn-calendar"
                    :class="{ active: isActionActive }"
                    :disabled="!isActionActive"
                    @click="handleSchedule"
                  >
                    <v-icon size="22" :color="isActionActive ? '#ffffff' : '#8e8e8e'">mdi-calendar-clock-outline</v-icon>
                  </button>
                </div>
              </template>
              <span>Gia hạn nộp học phí cho các sinh viên đã chọn</span>
            </v-tooltip>
          </div>
        </div>
      </v-row>
    </div>

    <!-- BẢNG DỮ LIỆU BASETABLE2 -->
    <BaseTable2
      :headers="tableHeaders"
      :items="paginatedItems"
      :loading="loading"
      hide-default-footer
      class="elevation-0"
    >
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
        <div class="font-weight-bold text-red-bold mb-1">Tên SV: {{ item.fullName }}</div>
        <div class="text-caption grey--text text--dark-2 mb-1">
          Mã số SV: <span class="font-weight-medium text-red-bold">{{ item.code }}</span>
        </div>
        <div class="text-caption grey--text text--dark-2">
          Tên Lớp: <span class="font-weight-medium text-red-bold">{{ item.clazz && item.clazz.name }}</span>
        </div>
      </template>

      <template #[`item.subject`]="{ item }">
        <div v-for="(termObj, idx) in (item.registerStudentTerms || [])" :key="idx" class="text-body-2">
          {{ idx + 1 }}. {{ termObj.term && termObj.term.name }} - {{ termObj.term && termObj.term.code }}
        </div>
      </template>

      <template #[`item.registerDateTime`]="{ item }">
        <div>{{ item.registerDate || '--' }}</div>
        <div class="text-caption grey--text">{{ item.registerTime || '' }}</div>
      </template>

      <template #[`item.totalFee`]="{ item }">
        <span class="font-weight-medium">{{ formatCurrency(item.totalFeeOfExam) }}</span>
      </template>

      <template #[`item.tuitionStatus`]="{ item }">
        <span class="status-badge" :style="getStatusStyle(item.tuitionStatus || 'NOT_PAID', 'feePaidStatusMap')">
          {{ getStatusLabel(item.tuitionStatus || 'NOT_PAID', 'feePaidStatusMap') }}
        </span>
      </template>

      <template #[`item.bankStatus`]="{ item }">
        <span class="status-badge" :style="getStatusStyle(item.bankStatus || 'NOT_ADDED', 'bankStatusMap')">
          {{ getStatusLabel(item.bankStatus || 'NOT_ADDED', 'bankStatusMap') }}
        </span>
      </template>

      <template #[`item.emailStatus`]="{ item }">
        <span class="status-badge" :style="getStatusStyle(item.emailStatus || 'NOT_SENT', 'sendMailStatusMap')">
          {{ getStatusLabel(item.emailStatus || 'NOT_SENT', 'sendMailStatusMap') }}
        </span>
      </template>

      <template #[`item.approvalStatus`]="{ item }">
        <span class="status-badge" :style="getStatusStyle(item.registerStudentStatus, 'registerStudentStatusMap')">
          {{ getStatusLabel(item.registerStudentStatus, 'registerStudentStatusMap') }}
        </span>
      </template>

      <template #[`item.actions`]="{ item }">
        <div class="d-flex align-center justify-center gap-1">
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn icon text small class="row-action-btn" v-bind="attrs" v-on="on" @click="openDetailModal(item)">
                <v-icon size="20" color="#00bcd4">mdi-eye</v-icon>
              </v-btn>
            </template>
            <span>Chi tiết</span>
          </v-tooltip>

          <v-tooltip v-if="canApprove(item)" bottom>
            <template #activator="{ on, attrs }">
              <v-btn icon text small class="row-action-btn" v-bind="attrs" v-on="on" @click="openApproveModal(item)">
                <v-icon size="20" color="#4caf50">mdi-check-circle</v-icon>
              </v-btn>
            </template>
            <span>Xác nhận duyệt đơn</span>
          </v-tooltip>

          <v-tooltip v-if="canReject(item)" bottom>
            <template #activator="{ on, attrs }">
              <v-btn icon text small class="row-action-btn" v-bind="attrs" v-on="on" @click="openStatusConfirm(item, 'REJECTED')">
                <v-icon size="20" color="#f44336">mdi-close-circle</v-icon>
              </v-btn>
            </template>
            <span>Từ chối duyệt đơn</span>
          </v-tooltip>

          <v-tooltip v-if="canSetPending(item)" bottom>
            <template #activator="{ on, attrs }">
              <v-btn icon text small class="row-action-btn" v-bind="attrs" v-on="on" @click="openStatusConfirm(item, 'AWAITING_CONFIRMATION')">
                <v-icon size="20" color="#ff9800">mdi-clock-outline</v-icon>
              </v-btn>
            </template>
            <span>Chờ duyệt đơn</span>
          </v-tooltip>

          <v-tooltip v-if="canEdit(item)" bottom>
            <template #activator="{ on, attrs }">
              <v-btn icon text small class="row-action-btn" v-bind="attrs" v-on="on" @click="openEditModal(item)">
                <v-icon size="20" color="#ffb300">mdi-pencil</v-icon>
              </v-btn>
            </template>
            <span>Cập nhật</span>
          </v-tooltip>
        </div>
      </template>
    </BaseTable2>

    <!-- HÀNG NÚT XUẤT / NHẬP FILE VÀ PHÂN TRANG -->
    <div class="table-footer d-flex flex-wrap align-center justify-space-between mt-4 gap-2">
      <div class="d-flex flex-wrap gap-2">
        <v-btn color="#4CAF50" dark small elevation="0" class="text-none font-weight-medium rounded-sm" @click="exportRequiredFeeResult">
          <v-icon left small>mdi-export</v-icon> XUẤT FILE KẾT QUẢ CẦN THU
        </v-btn>
        <v-btn color="#4CAF50" dark small elevation="0" class="text-none font-weight-medium rounded-sm" @click="exportUnpaidList">
          <v-icon left small>mdi-export</v-icon> XUẤT FILE DANH SÁCH CHƯA TRẢ HỌC PHÍ
        </v-btn>
        <v-btn color="#4CAF50" dark small elevation="0" class="text-none font-weight-medium rounded-sm" @click="triggerImportFile">
          <v-icon left small>mdi-microsoft-excel</v-icon> NHẬP FILE KẾT QUẢ ĐÃ THU
        </v-btn>
        <v-btn color="#4CAF50" dark small elevation="0" class="text-none font-weight-medium rounded-sm" @click="exportAuditList">
          <v-icon left small>mdi-export</v-icon> XUẤT FILE RÀ SOÁT HỌC PHÍ
        </v-btn>
      </div>

      <div class="d-flex align-center gap-2">
        <div class="d-flex align-center gap-1 text-caption">
          <span>Bản ghi</span>
          <v-select v-model="pageSize" :items="[10, 20, 50, 100]" outlined dense hide-details class="page-size-select" @change="page = 1"></v-select>
        </div>

        <div class="d-flex align-center gap-1 text-caption">
          <span>Trang</span>
          <v-text-field v-model="pageInput" outlined dense hide-details class="page-input-field text-center" @keyup.enter="goToPage"></v-text-field>
          <v-btn color="#A62229" dark x-small class="go-btn" elevation="0" @click="goToPage">Đi</v-btn>
        </div>

        <v-pagination v-model="page" :length="totalPages" :total-visible="3" color="#A62229" dense></v-pagination>
      </div>
    </div>

    <RegisterRetakeCourseModal
      v-model="showAddModal"
      :students-list="mustRetakeStudentOptions"
      :registered-classes-list="items"
      @success="handleRegisterSuccess"
    />
  </div>
</template>

<script>
import * as XLSX from 'xlsx'
import RegisterRetakeCourseModal from '~/components/RetakeCourse/RegisterRetakeCourseModal.vue'
import BaseTable2 from '~/components/Base/BaseTable2.vue'
import { MOCK_DATA_SINH_VIEN_HOC_LAI } from '@/consts/sinhviendk.js'

export default {
  name: 'RegisteredStudentsPage',
  components: {
    RegisterRetakeCourseModal,
    BaseTable2
  },
  data() {
    return {
      loading: false,
      showAddModal: false,
      dialogDetail: false,
      dialogApprove: false,
      dialogEdit: false,
      dialogConfirm: false,
      dialogPayment: false,
      dialogExtend: false,
      paymentErrorMessage: '',
      extendErrorMessage: '',
      currentSessionName: '',
      paymentDueDate: '',
      newDueDate: '',
      menuPaymentDate: false,
      menuExtendDate: false,
      modalSelected: [],
      paymentSelectedStudents: [],
      extendSelectedStudents: [],
      isSendingPaymentList: false,
      isExtendingDueDate: false,
      detailData: {},
      approveItem: null,
      approveItems: [],
      editItem: null,
      selectedStudent: null,
      editForm: {},
      editHocPhanList: [],
      editStep: 1,
      searchKeyword: '',
      confirmItem: null,
      confirmTargetStatus: '',
      showConfirmEmailModal: false,
      emailTypeToSend: '',
      emailConfirmMessage: '',
      emailIdsToSend: [],
      isSendingEmail: false,
      emailToasts: [],
      nextEmailToastId: 0,
      importedPaymentResults: [],
      approvalClassOptions: ['G_20261_5_046'],
      selectAll: false,
      selectedIds: [],

      page: 1,
      pageSize: 50,
      pageInput: '1',

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
        bankStatus: null
      },

      registerStudentStatusMap: {
        AWAITING_CONFIRMATION: { label: 'Chờ xác nhận', color: '#FFC107' },
        CONFIRMED: { label: 'Đã xác nhận', color: '#28A745' },
        REJECTED: { label: 'Từ chối', color: '#DC3545' },
        CLASS_APPROVED: { label: 'Đã duyệt lớp', color: '#28A745' }
      },
      feePaidStatusMap: {
        NOT_PAID: { label: 'Chưa trả học phí', color: '#FFC107' },
        PAID: { label: 'Đã trả học phí', color: '#28A745' }
      },
      sendMailStatusMap: {
        NOT_SENT: { label: 'Chưa gửi', color: '#FFC107' },
        SENDING: { label: 'Đã gửi', color: '#28A745' },
        DELIVERED: { label: 'Gửi được', color: '#007BFF' }
      },
      bankStatusMap: {
        NOT_ADDED: { label: 'Chưa lập danh sách', color: '#FFC107' },
        ADDED: { label: 'Đã lập danh sách', color: '#28A745' }
      },

      majorOptions: ['Công nghệ thông tin', 'Kế toán', 'Kinh tế'],
      classOptions: ['DH-BK-CNTT1.1-K66', 'DH-BK-EE01-K66'],
      sessionOptions: ['20261-A-5', '20261-A-4'],
      retakeClassOptions: ['L01', 'L02'],
      subjectOptions: ['IT3100', 'IT3090', 'IT3080', 'EE2011', 'ME2021'],

      tableHeaders: [
        { text: '', value: 'data-table-select', sortable: false, align: 'center', width: '40px' },
        { text: 'STT', value: 'stt', sortable: false, align: 'center', width: '50px' },
        { text: 'Thông tin sinh viên', value: 'studentInfo', sortable: false, align: 'left' },
        { text: 'Kỳ đăng ký học lại', value: 'sessionCode', sortable: false, align: 'left' },
        { text: 'Học phần đăng ký', value: 'subject', sortable: false, align: 'left' },
        { text: 'Mã đơn đăng ký', value: 'registrationCode', sortable: false, align: 'left' },
        { text: 'Thời gian đăng ký', value: 'registerDateTime', sortable: false, align: 'center' },
        { text: 'Thời gian duyệt đơn', value: 'approvalDate', sortable: false, align: 'center' },
        { text: 'Tổng học phí', value: 'totalFee', sortable: false, align: 'right' },
        { text: 'Trạng thái trả học phí', value: 'tuitionStatus', sortable: false, align: 'center' },
        { text: 'Thời gian và CB gửi Thu phí', value: 'collectorInfo', sortable: false, align: 'center' },
        { text: 'TT thêm DS ngân hàng', value: 'bankStatus', sortable: false, align: 'center' },
        { text: 'Trạng thái gửi email', value: 'emailStatus', sortable: false, align: 'center' },
        { text: 'Trạng thái duyệt đơn', value: 'approvalStatus', sortable: false, align: 'center' },
        { text: 'Chức năng', value: 'actions', sortable: false, align: 'center', width: '110px' }
      ],

      // Lấy trực tiếp mảng data từ object MOCK_DATA_SINH_VIEN_HOC_LAI
      items: (MOCK_DATA_SINH_VIEN_HOC_LAI && MOCK_DATA_SINH_VIEN_HOC_LAI.data) || [],
      mustRetakeStudentOptions: []
    }
  },
  computed: {
    totalItems() { return this.items.length },
    totalPages() { return Math.ceil(this.totalItems / this.pageSize) || 1 },
    paginatedItems() {
      const start = (this.page - 1) * this.pageSize
      return this.items.slice(start, start + this.pageSize)
    },
    selectedCount() { return this.selectedIds.length },
    isActionActive() { return this.selectedCount > 0 }
  },
  methods: {
    getStatusConfig(status, mapType) {
      const statusMap = this[mapType]
      if (!statusMap) return null
      return statusMap[status] || Object.values(statusMap).find(config => config.label === status) || null
    },
    getStatusStyle(status, mapType) {
      const config = this.getStatusConfig(status, mapType)
      return config ? { backgroundColor: config.color, color: '#FFFFFF' } : { backgroundColor: '#6C757D', color: '#FFFFFF' }
    },
    getStatusLabel(status, mapType) {
      const config = this.getStatusConfig(status, mapType)
      return config ? config.label : (status || '--')
    },
    formatCurrency(val) {
      if (!val) return '0'
      return new Intl.NumberFormat('vi-VN').format(val)
    },
    goToPage() {
      const p = parseInt(this.pageInput)
      if (p && p >= 1 && p <= this.totalPages) this.page = p
      else this.pageInput = String(this.page)
    },
    exportToExcel(rows, fileName) {
      try {
        const exportData = rows.map((item, index) => ({
          STT: index + 1,
          'Mã sinh viên': item.code || '',
          'Họ và tên': item.fullName || '',
          'Lớp sinh viên': item.clazz ? item.clazz.name : '',
          'Học phần đăng ký': (item.registerStudentTerms || []).map(t => t.term ? `${t.term.name} - ${t.term.code}` : '').join(', '),
          'Tổng học phí (VNĐ)': Number(item.totalFeeOfExam) || 0,
          'Trạng thái duyệt đơn': item.registerStudentStatus || ''
        }))
        const worksheet = XLSX.utils.json_to_sheet(exportData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSach')
        const now = new Date()
        const date = [
          now.getFullYear(),
          String(now.getMonth() + 1).padStart(2, '0'),
          String(now.getDate()).padStart(2, '0')
        ].join('-')
        XLSX.writeFile(workbook, `${fileName}_${date}.xlsx`)
      } catch (error) {
        console.error(error)
      }
    },
    exportRequiredFeeResult() {
      const requiredFeeData = this.items.filter(item => Number(item.totalFeeOfExam) > 0)
      this.exportToExcel(requiredFeeData, 'Ket_Qua_Can_Thu')
    },
    exportUnpaidList() {
      this.exportToExcel(this.items, 'Danh_Sach_Chua_Tra_Hoc_Phi')
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
          reader.onload = loadEvent => resolve(loadEvent.target.result)
          reader.onerror = () => reject(new Error('Không thể đọc file Excel'))
          reader.readAsArrayBuffer(file)
        })
        const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName])
        this.importedPaymentResults = rows
      } catch (error) {
        console.error(error)
      } finally {
        event.target.value = ''
      }
    },
    onItemSelectChange() {
      this.selectAll = this.items.length > 0 && this.items.every(item => this.selectedIds.includes(item.id))
    },
    onReload() { this.$emit('reload') },
    onSearch() { this.$emit('search') },
    onAdd() { this.showAddModal = true },
    canApprove() { return true },
    canReject() { return true },
    canSetPending() { return true },
    canEdit() { return true },
    openDetailModal() {},
    openApproveModal() {},
    openStatusConfirm() {},
    openEditModal() {},
    openConfirmApproveEmail() {},
    openConfirmRejectEmail() {},
    handleSendEmail() {},
    handleSchedule() {},
    handleRegisterSuccess() {}
  }
}
</script>

<style scoped>
.registered-students-page {
  display: flex;
  height: calc(100vh - 60px);
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}
.text-red-bold { color: #A62229 !important; }
.action-toolbar { display: flex; align-items: center; gap: 8px; margin-left: auto; }
.btn-reload { width: 36px !important; height: 36px !important; min-width: 36px !important; }
.action-btn {
  width: 64px; height: 36px; min-width: 64px; border-radius: 6px; border: none;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.row-action-btn { width: 32px; height: 32px; min-width: 32px; }
.btn-dark-red { background-color: #a61c24; }
.btn-orange { background-color: #fca02e; }
.btn-red { background-color: #f93d32; }
.btn-badge-wrapper { position: relative; display: inline-block; }
.badge-count {
  position: absolute; top: -8px; right: -8px; z-index: 2;
  display: flex; min-width: 20px; height: 20px; align-items: center; justify-content: center;
  padding: 0 5px; border-radius: 10px; background-color: #f44336; color: #ffffff;
  font-size: 12px; font-weight: bold;
}
.action-buttons-group .action-btn { width: 60px !important; min-width: 60px !important; height: 36px !important; }
.action-buttons-group .action-btn:disabled { background-color: #e0e0e0 !important; cursor: not-allowed !important; }
.btn-send.active { background-color: #10ce99 !important; }
.btn-calendar.active { background-color: #4285f4 !important; }
.status-badge { display: inline-block; padding: 4px 12px; border-radius: 16px; font-size: 13px; font-weight: 600; text-align: center; color: #ffffff !important; }
.page-size-select { width: 65px !important; }
.page-input-field { width: 45px !important; }
.go-btn { min-width: 28px !important; height: 28px !important; }
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
</style>