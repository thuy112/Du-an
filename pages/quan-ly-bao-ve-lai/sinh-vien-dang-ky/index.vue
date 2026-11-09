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
                :items="tuitionStatusList"
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
                :items="emailStatusList"
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
                  <v-icon size="20" color="#a61c1c">mdi-refresh</v-icon>
                </v-btn>
              </template>
              <span>Reset bộ lọc</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <button v-bind="attrs" class="action-btn btn-dark-red" v-on="on" @click="handleSearch">
                  <v-icon size="18" color="#ffffff">mdi-magnify</v-icon>
                </button>
              </template>
              <span>Tìm kiếm</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <button v-bind="attrs" class="action-btn btn-dark-red" v-on="on" @click="openAddModal">
                  <v-icon size="18" color="#ffffff">mdi-plus</v-icon>
                </button>
              </template>
              <span>Thêm mới</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <button v-bind="attrs" class="action-btn btn-orange" v-on="on" @click="openMailTuition">
                  <v-icon size="18" color="#ffffff">mdi-email-outline</v-icon>
                </button>
              </template>
              <span>Gửi mail học phí</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <button v-bind="attrs" class="action-btn btn-red" v-on="on" @click="openMailNotification">
                  <v-icon size="18" color="#ffffff">mdi-email-send-outline</v-icon>
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
                      <v-icon size="18" :color="isActionActive ? '#ffffff' : '#8e8e8e'">mdi-send</v-icon>
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
                      <v-icon size="18" :color="isActionActive ? '#ffffff' : '#8e8e8e'">mdi-history</v-icon>
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

          <template #[`item.data-table-select`]="{ item }">
            <v-checkbox
              v-model="selectedRows"
              :value="item"
              hide-details
              dense
              class="ma-0 pa-0"
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

          <!-- 1. Trạng thái trả học phí -->
          <template #[`item.tuitionStatus`]="{ item }">
            <span class="status-badge" :style="{ backgroundColor: item.tuitionStatus === 'PAID' ? '#4caf50' : '#ffa726' }">
              {{ item.tuitionStatus === 'PAID' ? 'Đã trả học phí' : 'Chưa trả học phí' }}
            </span>
          </template>

          <!-- 2. Trạng thái gửi HP -->
          <template #[`item.paymentSendStatusName`]="{ item }">
            <span class="status-badge" :style="{ backgroundColor: item.paymentSendStatusName === 'SENT' ? '#4caf50' : '#78909c' }">
              {{ item.paymentSendStatusName === 'SENT' ? 'Đã gửi' : 'Chưa gửi' }}
            </span>
          </template>

          <!-- 3. TT thêm DS ngân hàng -->
          <template #[`item.bankStatus`]="{ item }">
            <span class="status-badge" :style="{ backgroundColor: item.bankStatus === 'ADDED' || item.bankStatus === 'YES' ? '#4caf50' : '#ffa726' }">
              {{ item.bankStatus === 'ADDED' || item.bankStatus === 'YES' ? 'Đã lập danh sách' : 'Chưa lập danh sách' }}
            </span>
          </template>

          <!-- 4. Trạng thái gửi email -->
          <template #[`item.emailStatus`]="{ item }">
            <span class="status-badge" :style="{ backgroundColor: item.emailStatus === 'SENT' ? '#4caf50' : '#78909c' }">
              {{ item.emailStatus === 'SENT' ? 'Đã gửi' : 'Chưa gửi' }}
            </span>
          </template>

          <template #[`item.actions`]="{ item }">
            <v-menu offset-y left transition="slide-y-transition">
              <template #activator="{ on, attrs }">
                <v-btn icon small v-bind="attrs" v-on="on">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list dense class="py-1" style="min-width: 170px;">
                <v-list-item @click="handleMenuAction('detail', item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="#00bcd4">mdi-eye</v-icon></v-list-item-icon>
                  <v-list-item-title>Chi tiết</v-list-item-title>
                </v-list-item>
                <v-list-item @click="handleMenuAction('edit', item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="#2196f3">mdi-pencil</v-icon></v-list-item-icon>
                  <v-list-item-title>Cập nhật</v-list-item-title>
                </v-list-item>
                <v-list-item @click="handleMenuAction('exportOne', item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="#a61c24">mdi-file-excel</v-icon></v-list-item-icon>
                  <v-list-item-title>Xuất file đăng ký</v-list-item-title>
                </v-list-item>
                <v-list-item @click="handleMenuAction('approve', item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="#4caf50">mdi-check-circle</v-icon></v-list-item-icon>
                  <v-list-item-title>Duyệt tín chỉ</v-list-item-title>
                </v-list-item>
                <v-list-item @click="handleMenuAction('reject', item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="#f93d32">mdi-cancel</v-icon></v-list-item-icon>
                  <v-list-item-title>Từ chối</v-list-item-title>
                </v-list-item>
                <v-list-item @click="handleMenuAction('scoreTable', item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="#9c27b0">mdi-table-account</v-icon></v-list-item-icon>
                  <v-list-item-title>Bảng điểm</v-list-item-title>
                </v-list-item>
                <v-list-item @click="handleMenuAction('delete', item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="#f93d32">mdi-delete</v-icon></v-list-item-icon>
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
              @keyup.enter="goToPage"
            ></v-text-field>
            <v-btn color="#A62229" dark x-small class="go-btn" elevation="0" @click="goToPage">Đi</v-btn>
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
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import registerService from '~/services/redefend/registerService'

export default {
  name: 'RegisterStudentPage',
  components: {
    BaseTable
  },
  data() {
    return {
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
      tuitionStatusList: [
        { text: 'Đã trả học phí', value: 'PAID' },
        { text: 'Chưa trả học phí', value: 'NOT_PAID' }, // hoặc 'UNPAID' tùy theo API của bạn
      ],
      emailStatusList: [
        { text: 'Đã gửi', value: 'SENT' },
        { text: 'Chưa gửi', value: 'NOT_SENT' },
        { text: 'Gửi được', value: 'SENDABLE' }
      ],

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
        { text: 'Trạng thái trả học phí', value: 'tuitionStatus', sortable: false },
        { text: 'Trạng thái gửi HP', value: 'paymentSendStatusName', sortable: false },
        { text: 'TT thêm DS ngân hàng', value: 'bankStatus', sortable: false },
        { text: 'Trạng thái gửi email', value: 'emailStatus', sortable: false },
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
          ...this.filters
        }
        const response = await registerService.getList(params)
        const payload = response.data || response

        const listData = payload.items || payload.data || []

        // IN RA CONSOLE ĐỂ XEM CHÍNH XÁC CÁC TRƯỜNG VÀ GIÁ TRỊ THỰC TẾ
        console.log('Dữ liệu API trả về:', listData)

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
        this.selectedRows = []
      } catch (error) {
        console.error('Lỗi tải danh sách:', error)
      } finally {
        this.loading = false
      }
    },

    handleSearch() {
      this.pageIndex = 1
      this.selectedRows = [] // Xóa sạch các dòng đã tích khi bấm tìm kiếm
      this.loadData()
    },

    resetFilters() {
      this.filters = {
        classId: null,
        examId: null,
        tuitionStatus: null,
        emailStatus: null
      }
      this.selectedRows = [] // Xóa sạch các dòng đã tích khi reset
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

    handleMenuAction(action, item) {
      switch (action) {
        case 'detail':
          console.log('Chi tiết:', item)
          break
        case 'edit':
          console.log('Cập nhật:', item)
          break
        case 'exportOne':
          this.exportSingleFile(item.id)
          break
        case 'approve':
          console.log('Duyệt tín chỉ:', item)
          break
        case 'reject':
          console.log('Từ chối:', item)
          break
        case 'scoreTable':
          console.log('Bảng điểm:', item)
          break
        case 'delete':
          console.log('Xóa:', item)
          break
      }
    },

    async exportSingleFile(id) {
      try {
        const res = await registerService.exportOne(id, { channel: 'CMS' })
        this.downloadBlob(res.data || res, `Don_dang_ky_${id}.xlsx`)
      } catch (error) {
        console.error('Lỗi xuất file đơn:', error)
      }
    },

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

    handleImport() {}
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