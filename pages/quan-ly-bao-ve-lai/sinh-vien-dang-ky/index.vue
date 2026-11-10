<template>
  <div class="registered-students-page bg-white">
    <div class="main-page-layout">
      <!-- 1. PHẦN TIÊU ĐỀ VÀ BỘ LỌC CỐ ĐỊNH Ở TRÊN -->
      <div class="sticky-filter-bar px-4 py-3 bg-white">
        <div class="d-flex align-center mb-2">
          <span class="text-h6 font-weight-bold text-red-bold">
            Danh sách sinh viên đăng ký ({{ totalItems }})
          </span>
        </div>

        <div class="filter-section">
          <v-row dense align="center">
            <!-- Lớp sinh viên -->
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="filters.classId"
                :items="classList"
                item-text="name"
                item-value="id"
                placeholder="Lớp sinh viên"
                outlined
                dense
                hide-details
                clearable
              ></v-select>
            </v-col>

            <!-- Đợt bảo vệ lại -->
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="filters.examId"
                :items="examList"
                item-text="name"
                item-value="id"
                placeholder="Đợt bảo vệ lại"
                outlined
                dense
                hide-details
                clearable
              ></v-select>
            </v-col>

            <!-- Trạng thái trả học phí -->
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="filters.tuitionStatus"
                :items="payStatusList"
                item-text="text"
                item-value="value"
                placeholder="Trạng thái trả học phí"
                outlined
                dense
                hide-details
                clearable
              ></v-select>
            </v-col>

            <!-- Trạng thái gửi email -->
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="filters.emailStatus"
                :items="sendMailStatusList"
                item-text="text"
                item-value="value"
                placeholder="Trạng thái gửi email"
                outlined
                dense
                hide-details
                clearable
              ></v-select>
            </v-col>
          </v-row>

          <!-- HÀNG NÚT THAO TÁC -->
          <div class="d-flex justify-end align-center mt-3" style="gap: 8px;">
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn v-bind="attrs" icon text class="btn-reload border-btn" v-on="on" @click="resetFilters">
                  <v-icon size="24" color="#a61c1c">mdi-refresh</v-icon>
                </v-btn>
              </template>
              <span>Reset bộ lọc</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <button v-bind="attrs" class="action-btn btn-dark-red" v-on="on" @click="handleSearch">
                  <v-icon size="24" color="#ffffff">mdi-magnify</v-icon>
                </button>
              </template>
              <span>Tìm kiếm</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <button v-bind="attrs" class="action-btn btn-dark-red" v-on="on" @click="isAddModalOpen = true">
                  <v-icon size="24" color="#ffffff">mdi-plus</v-icon>
                </button>
              </template>
              <span>Thêm mới</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <button v-bind="attrs" class="action-btn btn-orange" v-on="on" @click="openMailTuition">
                  <v-icon size="24" color="#ffffff"> mdi-email-plus-outline</v-icon>
                </button>
              </template>
              <span>Gửi mail học phí</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <button v-bind="attrs" class="action-btn btn-red" v-on="on" @click="openMailNotification">
                  <v-icon size="24" color="#ffffff">mdi-email-remove-outline</v-icon>
                </button>
              </template>
              <span>Gửi mail thông báo</span>
            </v-tooltip>

            <div class="action-buttons-group d-flex align-center gap-2">
              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <div v-bind="attrs" class="btn-badge-wrapper" v-on="on">
                    <span v-if="selectedCount > 0" class="badge-count">{{ selectedCount }}</span>
                    <button
                      type="button"
                      class="action-btn btn-send"
                      :class="{ active: isActionActive }"
                      :disabled="!isActionActive"
                      @click="changeStatus"
                    >
                      <v-icon size="24" :color="isActionActive ? '#ffffff' : '#8e8e8e'">mdi-send</v-icon>
                    </button>
                  </div>
                </template>
                <span>Chuyển trạng thái hàng loạt</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <div v-bind="attrs" class="btn-badge-wrapper" v-on="on">
                    <span v-if="selectedCount > 0" class="badge-count">{{ selectedCount }}</span>
                    <button
                      type="button"
                      class="action-btn btn-calendar"
                      :class="{ active: isActionActive }"
                      :disabled="!isActionActive"
                      @click="openHistory"
                    >
                      <v-icon size="24" :color="isActionActive ? '#ffffff' : '#8e8e8e'">mdi-calendar-clock</v-icon>
                    </button>
                  </div>
                </template>
                <span>Lịch sử hàng loạt</span>
              </v-tooltip>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. KHU VỰC BẢNG DỮ LIỆU -->
      <div class="scrollable-table-area">
        <BaseTable
          v-model="selectedRows"
          :headers="headers"
          :items="tableItems"
          :loading="loading"
          :items-per-page="pageSize"    
          :page="pageIndex"             
          item-key="id"
          show-select
          hide-default-footer
          class="elevation-0"
        >
          <template #[`header.data-table-select`]>
            <v-checkbox
              v-model="selectAll"
              :indeterminate="isIndeterminate"
              hide-details
              dense
              class="ma-0 pa-0"
            ></v-checkbox>
          </template>

          <template #[`item.data-table-select`]="{ isSelected, select }">
            <v-checkbox
              :input-value="isSelected"
              dense
              hide-details
              class="ma-0 pa-0"
              @change="(val) => select(val)"
            ></v-checkbox>
          </template>

          <template #[`item.studentInfo`]="{ item }">
            <div class="py-2">
              <div class="font-weight-bold red--text text--darken-3">{{ item.studentName }}</div>
              <div class="text-caption grey--text text--darken-2">Mã số sinh viên: <b>{{ item.studentCode }}</b></div>
              <div class="text-caption grey--text text--darken-2">Lớp: <b>{{ item.className }}</b></div>
            </div>
          </template>

          <template #[`item.totalFee`]="{ item }">
            <span>{{ formatMoney(item.totalFee) }}đ</span>
          </template>

          <!-- Trạng thái trả học phí -->
            <template #[`item.feePaidStatus`]="{ item }">
                <BaseStatusItem v-if="item.feePaidStatus != null" :status="item.feePaidStatus" :status-list="payStatusList" />
                <span v-else>-</span>
            </template>

            <!-- Trạng thái gửi HP (Thanh toán) -->
            <template #[`item.paymentSendStatusName`]="{ item }">
                <BaseStatusItem v-if="item.paymentSendStatusName != null" :status="item.paymentSendStatusName" :status-list="paymentSendStatusList" />
                <span v-else>-</span>
            </template>

            <!-- TT thêm DS ngân hàng -->
            <template #[`item.isListedForBank`]="{ item }">
                <BaseChangeableStatus v-if="item.isListedForBank === 'YES'" :status="item.isListedForBank"
                    :status-list="listForBankStatus" @changeStatus="handleChangeBankStatus($event, item)">
                </BaseChangeableStatus>
                <base-status-item v-else-if="item.isListedForBank != null" :status-list="listForBankStatus" :status="item.isListedForBank" />
                <span v-else>-</span>
            </template>

            <!-- Trạng thái gửi email -->
            <template #[`item.sendMailStatus`]="{ item }">
                <BaseStatusItem v-if="item.sendMailStatus != null" :status="item.sendMailStatus" :status-list="sendMailStatusList" />
                <span v-else>-</span>
            </template>

          <template #[`item.actions`]="{ item }">
            <v-menu offset-y left transition="slide-y-transition">
              <template #activator="{ on, attrs }">
                <v-btn icon small v-bind="attrs" v-on="on">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list dense class="py-1" style="min-width: 170px;">
                <!-- 1. Chi tiết -->
                <v-list-item @click="handleMenuAction('detail', item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="#00bcd4">mdi-eye</v-icon></v-list-item-icon>
                  <v-list-item-title>Chi tiết</v-list-item-title>
                </v-list-item>

                <!-- 2. Cập nhật -->
                <v-list-item v-if="!isTuitionPaid(item) && isPaymentNotSent(item)" @click="handleMenuAction('edit', item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="#2196f3">mdi-pencil</v-icon></v-list-item-icon>
                  <v-list-item-title>Cập nhật</v-list-item-title>
                </v-list-item>

                <!-- 3. Xuất file đăng ký -->
                <v-list-item @click="handleMenuAction('exportOne', item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="#a61c24">mdi-microsoft-excel</v-icon></v-list-item-icon>
                  <v-list-item-title>Xuất file đăng ký</v-list-item-title>
                </v-list-item>

                <!-- 4. Duyệt tín chỉ -->
                <v-list-item @click="handleMenuAction('approve', item)">
                  <v-list-item-icon class="mr-2">
                    <v-icon small color="#a61c24">mdi-check-circle</v-icon>
                  </v-list-item-icon>
                  <v-list-item-title>
                    {{ item.creditManagement === 'CONFIRMED' ? 'Duyệt học phí' : 'Duyệt tín chỉ' }}
                  </v-list-item-title>
                </v-list-item>

                <!-- 5. Từ chối -->
                <v-list-item v-if="isPaymentNotSent(item)" @click="handleMenuAction('reject', item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="#a2212b">mdi-cancel</v-icon></v-list-item-icon>
                  <v-list-item-title>Từ chối</v-list-item-title>
                </v-list-item>

                <!-- 6. Bảng điểm -->
                <v-list-item @click="handleMenuAction('scoreTable', item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="#9c27b0">mdi-table</v-icon></v-list-item-icon>
                  <v-list-item-title>Bảng điểm</v-list-item-title>
                </v-list-item>

                <!-- 7. Xóa -->
                <v-list-item v-if="isPaymentNotSent(item)" @click="handleMenuAction('delete', item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="#f93d32">mdi-trash-can</v-icon></v-list-item-icon>
                  <v-list-item-title class="error--text">Xóa</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </BaseTable>
      </div>

      <!-- 3. THANH FOOTER -->
      <div class="table-footer px-4 py-2 bg-white d-flex flex-wrap align-center justify-space-between">
        <div class="d-flex flex-wrap gap-2">
          <v-btn color="#4CAF50" dark small elevation="0" class="text-none font-weight-medium rounded-sm" @click="handleExport">
            <v-icon left small>mdi-file-excel</v-icon> XUẤT FILE KẾT QUẢ CẦN THU
          </v-btn>
          <v-btn color="#4CAF50" dark small elevation="0" class="text-none font-weight-medium rounded-sm" @click="handleImport">
            <v-icon left small>mdi-file-upload</v-icon> NHẬP FILE KẾT QUẢ THU
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
                @change="loadData"
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
              @keyup.enter="jumpToPage"
            ></v-text-field>
            <v-btn color="#A62229" dark x-small class="go-btn" elevation="0" @click="jumpToPage">Đi</v-btn>
          </div>

          <v-pagination
            v-model="pageIndex"
            :length="totalPages"
            :total-visible="3"
            color="#A62229"
            dense
            @input="loadData"
          ></v-pagination>
        </div>
      </div>
    </div>

    <!-- DIALOG XÁC NHẬN DUYỆT TÍN CHỈ -->
    <v-dialog v-model="confirmDialog" max-width="500px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="headline text-white px-6 py-3" style="background-color: #a62229;">
          <span>Xác nhận</span>
          <v-spacer></v-spacer>
          <v-btn icon dark @click="confirmDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="py-6 px-6 text-subtitle-1 text--primary">
          Bạn có chắc chắn muốn duyệt tín chỉ này không ?
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="px-6 py-3">
          <v-spacer></v-spacer>
          <v-btn text color="grey darken-1" @click="confirmDialog = false">
            Đóng <v-icon right small>mdi-close</v-icon>
          </v-btn>
          <v-btn color="#a62229" dark depressed @click="executeApprove">
            Xác Nhận
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Component Modal Đăng Ký Bảo Vệ Lại -->
    <register-modal
      v-model="isAddModalOpen"
      @success="loadData"
    />
    <!-- Component Modal Chi Tiết -->
    <detail-modal
      v-model="isDetailModalOpen"
      :data="selectedDetailData"
    />
  </div>
</template>

<script>
import {
    listForBankStatus,
    payStatusList,
    paymentSendStatusList,
    sendMailStatusList,
} from "~/consts/list";
import BaseTable from '~/components/Base/BaseTable.vue'
import registerService from '~/services/redefend/registerService'
import RegisterModal from '@/components/RegisterModal.vue'
import DetailModal from "~/components/DetailModal.vue";

export default {
  name: 'RegisterStudentPage',
  components: {
    BaseTable,
    RegisterModal,
    DetailModal,
  },
  data() {
    return {
      confirmDialog: false,
      selectedItem: null,

      isDetailModalOpen: false, 
      selectedDetailData: {},
      isAddModalOpen: false,
      loading: false,
      selectedRows: [],
      tableItems: [],
      totalItems: 0,
      pageIndex: 1,
      pageSize: 50,
      pageInput: '1',
      totalPages: 1,

      classList: [],
      examList: [],

      payStatusList,
      paymentSendStatusList,
      sendMailStatusList,
      listForBankStatus,

      filters: {
        classId: null,
        examId: null,
        tuitionStatus: null,
        emailStatus: null
      },

      headers: [
        { text: '', value: 'data-table-select', sortable: false, width: '40px', align: 'center' },
        { text: 'STT', value: 'index', width: '50px', sortable: false },
        { text: 'Thông tin sinh viên', value: 'studentInfo', sortable: false },
        { text: 'Đợt bảo vệ', value: 'examName', sortable: false },
        { text: 'Học phần đăng ký', value: 'subjectName', sortable: false },
        { text: 'Mã đơn đăng ký', value: 'registerCode', sortable: false },
        { text: 'Thời gian đăng ký', value: 'createdDate', sortable: false },
        { text: 'Hạn thanh toán', value: 'paymentDeadline', sortable: false },
        { text: 'Tổng học phí', value: 'totalFee', sortable: false },
        { text: 'Trạng thái trả học phí', value: 'feePaidStatus', sortable: false },
        { text: 'Trạng thái gửi HP', value: 'paymentSendStatusName', sortable: false },
        { text: 'TT thêm DS ngân hàng', value: 'isListedForBank', sortable: false },
        { text: 'Trạng thái gửi email', value: 'sendMailStatus', sortable: false },
        { text: 'Chức năng', value: 'actions', width: '80px', sortable: false, align: 'center' }
      ]
    }
  },
  computed: {
    selectedCount() {
      return this.selectedRows.length
    },
    isActionActive() {
      return this.selectedCount > 0
    },
    isIndeterminate() {
      if (this.tableItems.length === 0) return false
      const selectedIds = this.selectedRows.map(r => r.id)
      const currentIds = this.tableItems.map(r => r.id)
      const count = currentIds.filter(id => selectedIds.includes(id)).length
      return count > 0 && count < currentIds.length
    },
    selectAll: {
      get() {
        if (this.tableItems.length === 0) return false
        const selectedIds = this.selectedRows.map(r => r.id)
        return this.tableItems.every(r => selectedIds.includes(r.id))
      },
      set(val) {
        if (val) {
          const currentIds = this.selectedRows.map(r => r.id)
          const newRows = [...this.selectedRows]
          this.tableItems.forEach(item => {
            if (!currentIds.includes(item.id)) {
              newRows.push(item)
            }
          })
          this.selectedRows = newRows
        } else {
          const currentIds = this.tableItems.map(r => r.id)
          this.selectedRows = this.selectedRows.filter(r => !currentIds.includes(r.id))
        }
      }
    }
  },
  mounted() {
    this.fetchDropdownData()
    this.loadData()
  },
  methods: {
    async fetchDropdownData() {
      try {
        const [resExams, resClasses] = await Promise.all([
          registerService.getExams({ status: 'ACTIVE', channel: 'CMS' }),
          registerService.getClasses({ channel: 'CMS' })
        ])
        this.examList = resExams.data || resExams || []
        this.classList = resClasses.data || resClasses || []
      } catch (error) {
        console.error('Lỗi tải danh mục:', error)
      }
    },

    async loadData() {
      this.loading = true
      try {
        const params = {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize,
          channel: 'CMS',
          clazzId: this.filters.classId, 
          examId: this.filters.examId,
          feePaidStatus: this.filters.tuitionStatus,
          sendMailStatus: this.filters.emailStatus,
        }
        
        const response = await registerService.getList(params)
        const payload = response.data || response

        const listData = payload.items || payload.data || []

        this.tableItems = listData.map((item, idx) => ({
          ...item,
          index: (this.pageIndex - 1) * this.pageSize + idx + 1,
          studentName: item.fullName || '',
          studentCode: item.studentCode || '',
          className: item.clazz ? item.clazz.name : '',
          examName: item.exam ? item.exam.name : '',
          subjectName: item.termName || (item.term ? item.term.name : ''),
          registerCode: item.code || '',
          createdDate: item.createTime || '',
          paymentDeadline: item.paymentDeadline || '--',
          totalFee: item.totalFee || 0,
          tuitionStatus: item.feePaidStatus,
          paymentSendStatusName: item.paymentSendStatusName,
          bankStatus: item.isListedForBank,
          emailStatus: item.sendMailStatus
        }))

        this.totalItems = payload.total || payload.totalRecords || payload.totalElements || this.tableItems.length
        this.totalPages = Math.ceil(this.totalItems / this.pageSize) || 1
        this.pageInput = String(this.pageIndex)
        
      } catch (error) {
        console.error('Lỗi tải danh sách:', error)
      } finally {
        this.loading = false
      }
    },

    handleSearch() {
      this.pageIndex = 1
      this.selectedRows = []
      this.loadData()
    },

    resetFilters() {
      this.filters = {
        classId: null,
        examId: null,
        tuitionStatus: null,
        emailStatus: null
      }
      this.selectedRows = []
      this.handleSearch()
    },

    jumpToPage() {
      const page = parseInt(this.pageInput)
      if (page >= 1 && page <= this.totalPages) {
        this.pageIndex = page
        this.loadData()
      }
    },

    formatMoney(val) {
      if (!val) return '0'
      return new Intl.NumberFormat('vi-VN').format(val)
    },

    openAddModal() {},
    openMailTuition() {},
    openMailNotification() {},
    changeStatus() {},
    openHistory() {},

    async handleExport() {
      try {
        const res = await registerService.exportFile({ channel: 'CMS', ...this.filters })
        this.downloadBlob(res.data || res, `Ket_qua_can_thu_${new Date().toISOString().slice(0,10)}.xlsx`)
      } catch (error) {
        console.error('Lỗi xuất file:', error)
      }
    },

    downloadBlob(data, filename) {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = filename
      link.click()
      window.URL.revokeObjectURL(link.href)
    },

    isTuitionPaid(item) {
      const status = item.feePaidStatus
      return status === 'PAID' || status === 'Đã trả học phí' || status === 'DA_TRA'
    },

    handleImport() {},

    canEdit(item) {
      const emailNotSent = item.sendMailStatus === 'NOT_SENT' || item.sendMailStatus === 'CHUA_GUI' || item.sendMailStatus === 'Chưa gửi'
      const hpNotSent = item.paymentSendStatusName === 'NOT_SENT' || item.paymentSendStatusName === 'CHUA_GUI' || item.paymentSendStatusName === 'Chưa gửi'
      return emailNotSent && hpNotSent
    },

    canApproveOrReject(item) {
      const isPaid = item.feePaidStatus === 'PAID' || item.feePaidStatus === 'DA_TRA' || item.feePaidStatus === 'Đã trả học phí'
      const isPending = item.feePaidStatus === 'UNPAID' || item.feePaidStatus === 'CHUA_TRA' || item.feePaidStatus === 'Chưa trả học phí'
      return isPaid || isPending
    },

    canDelete(item) {
      const emailNotSent = item.sendMailStatus === 'NOT_SENT' || item.sendMailStatus === 'CHUA_GUI' || item.sendMailStatus === 'Chưa gửi'
      return emailNotSent
    },

    async handleChangeBankStatus(newStatus, item) {
      try {
        await registerService.approve(item.id, { isListedForBank: newStatus }, 'CMS')
        this.$toast.success('Cập nhật trạng thái thành công')
        this.loadData()
      } catch (error) {
        console.error('Lỗi cập nhật trạng thái:', error)
        this.$toast.error('Cập nhật trạng thái thất bại')
      }
    },

    async handleMenuAction(action, item) {
      switch (action) {
        case 'detail':
          try {
            const recordId = item.id || item.registerId
            if (!recordId) {
              this.selectedDetailData = item
              this.isDetailModalOpen = true
              break
            }

            const res = await registerService.getDetail ? await registerService.getDetail(recordId, 'CMS') : item
            this.selectedDetailData = res.data || res || item
          } catch (error) {
            console.error('Không gọi được API chi tiết, dùng dữ liệu dòng:', error)
            this.selectedDetailData = item
          }
          this.isDetailModalOpen = true
          break
        case 'edit':
          console.log('Cập nhật đơn:', item)
          break
        case 'exportOne':
          this.exportSingleFile(item.id)
          break
        case 'approve':
          this.selectedItem = item
          this.confirmDialog = true
          break
        case 'reject':
          if (confirm(`Bạn có chắc chắn muốn từ chối đơn của sinh viên ${item.studentName}?`)) {
            try {
              await registerService.reject(item.id, {}, 'CMS')
              this.$toast.success('Từ chối thành công')
              this.loadData()
            } catch (err) {
              console.error(err)
            }
          }
          break
        case 'scoreTable':
          console.log('Xem bảng điểm:', item)
          break
        case 'delete':
          if (confirm(`Bạn có chắc muốn xóa đơn đăng ký của sinh viên ${item.studentName}?`)) {
            try {
              await registerService.delete(item.id, 'CMS')
              this.$toast.success('Xóa đơn đăng ký thành công')
              this.loadData()
            } catch (err) {
              console.error(err)
            }
          }
          break
      }
    },

    isPaymentNotSent(item) {
      const status = item.paymentSendStatusName
      if (status === 'SENT' || status === 'Đã gửi' || status === 'DA_GUI' || status === 'Gia hạn') {
        return false
      }
      return true
    },

    isEmailNotSent(item) {
      const status = item.sendMailStatus
      if (status === 'SENT' || status === 'Đã gửi' || status === 'DA_GUI') {
        return false
      }
      return true
    },

    async exportSingleFile(id) {
      try {
        const params = {
          channel: 'CMS',
          transid: 'bc977060-234e-47da-8697-f97342d66abd'
        }

        const response = await registerService.exportByCode(id, params)

        const blob = new Blob([response.data || response], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        })
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = `Don_dang_ky_hoc_phan_tot_nghiep_BVL_${id}.xlsx`
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

      } catch (error) {
        console.error('Lỗi khi xuất file:', error)
        this.$toast?.error?.('Có lỗi xảy ra khi xuất file!')
      }
    },

    async executeApprove() {
      if (!this.selectedItem) return
      try {
        const res = await registerService.approve(this.selectedItem.id, {}, 'CMS')
        
        // Kiểm tra nếu API trả về mã lỗi (tùy cấu trúc backend, ví dụ res.code !== 0)
        // Nếu backend trả về lỗi mà không văng exception, ta chủ động check ở đây
        if (res && res.code && res.code !== 0) {
          this.$toast.error(res.message || 'Có lỗi xảy ra khi duyệt tín chỉ!')
          return
        }

        this.$toast.success('Duyệt tín chỉ thành công')
        this.confirmDialog = false
        this.loadData()
      } catch (err) {
        console.error(err)
        // Bắt chính xác lỗi từ server hoặc mất kết nối mạng để hiển thị thông báo lỗi phù hợp
        const errorMsg = err.response?.data?.message || err.message || 'Lỗi kết nối tới server!'
        this.$toast.error(errorMsg)
      }
    },
  }
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
  overflow-y: auto;
  overflow-x: hidden;
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

.btn-dark-red {
  background-color: #a61c24;
}
.btn-orange {
  background-color: #fca02e;
}
.btn-red {
  background-color: #f93d32;
}

.btn-send,
.btn-calendar {
  background-color: #e0e0e0;
}
.btn-send.active {
  background-color: #4285f4 !important;
}
.btn-calendar.active {
  background-color: #4caf50 !important;
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

.action-buttons-group .action-btn:disabled {
  background-color: #e0e0e0 !important;
  cursor: not-allowed !important;
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
  width: 83px !important;
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