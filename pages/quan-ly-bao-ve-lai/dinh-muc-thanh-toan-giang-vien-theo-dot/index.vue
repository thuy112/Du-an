<template>
  <div class="payment-teacher-exam-page pa-3 pa-md-4 bg-white">
    <!-- TIÊU ĐỀ TRANG -->
    <div class="d-flex align-center justify-space-between mb-3 flex-wrap" style="gap: 8px;">
      <div class="text-h6 font-weight-bold black--text">
        Danh sách thanh toán giảng viên theo đợt (<span class="text-red-bold">{{ totalRecords }}</span>)
      </div>
    </div>

    <!-- THANH CÔNG CỤ -->
    <div class="d-flex align-center flex-wrap" style="gap: 8px;">
      <v-text-field
        v-model="filters.search"
        placeholder="Tìm kiếm"
        outlined
        dense
        hide-details
        clearable
        style="width: 200px;"
        @keyup.enter="handleSearch"
      ></v-text-field>

      <v-select
        v-model="filters.paymentStatus"
        :items="paymentTeacherStatusList"
        item-text="text"
        item-value="value"
        placeholder="Trạng thái"
        outlined
        dense
        hide-details
        clearable
        style="width: 170px;"
      ></v-select>

      <v-btn icon color="#A62229" @click="refreshData" title="Làm mới">
        <v-icon size="24">mdi-refresh</v-icon>
      </v-btn>

      <v-btn color="#A62229" dark class="btn-square-action px-3 min-w-0" height="40" elevation="0" @click="handleSearch" title="Tìm kiếm">
        <v-icon size="24">mdi-magnify</v-icon>
      </v-btn>

      <v-btn color="#A62229" dark class="btn-square-action px-3 min-w-0" height="40" elevation="0" @click="openAddModal" title="Thêm mới">
        <v-icon size="24">mdi-plus</v-icon>
      </v-btn>
    </div>

    <!-- BẢNG HIỂN THỊ DỮ LIỆU -->
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
        <!-- STT -->
        <template #[`item.stt`]="{ index }">
          <span>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</span>
        </template>

        <!-- Ngày thanh toán -->
        <template #[`item.paymentDate`]="{ item }">
          <span>{{ formatDate(item.paymentDate || item.createdAt) }}</span>
        </template>

        <!-- Mã đợt thanh toán -->
        <template #[`item.code`]="{ item }">
          <span class="font-weight-medium">{{ item.code || item.paymentCode || '-' }}</span>
        </template>

        <!-- Tên đợt thanh toán -->
        <template #[`item.name`]="{ item }">
          <span>{{ item.name || item.paymentName || '-' }}</span>
        </template>

        <!-- T.T giảng viên theo hội đồng -->
        <template #[`item.paymentTeachers`]="{ item }">
          <span>{{ formatExamSessions(item) }}</span>
        </template>

        <!-- File thanh toán -->
        <template #[`item.file`]="{ item }">
          <div class="text-center">
            <v-btn 
              icon 
              small 
              :color="item.fileUrl ? '#A62229' : 'grey'" 
              :disabled="!item.fileUrl"
              @click="downloadFile(item)" 
              :title="item.fileUrl ? 'Tải file thanh toán' : 'Không có file thanh toán'"
            >
              <v-icon size="26" :color="item.fileUrl ? '#A62229' : 'grey'">mdi-file-download-outline</v-icon>
            </v-btn>
          </div>
        </template>

        <!-- Trạng thái -->
        <template #[`item.paymentStatus`]="{ item }">
          <ChangeableStatus
            :status="item.paymentStatus"
            :status-list="paymentTeacherStatusList"
            @changeStatus="handleChangeStatus($event, item)"
          />
        </template>

        <!-- Chức năng (3 chấm) -->
        <template #[`item.actions`]="{ item }">
          <div class="d-flex align-center justify-center">
            <v-menu offset-y left>
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon small v-bind="attrs" v-on="on">
                  <v-icon small>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list dense class="action-dropdown-list">
                <v-list-item @click="handleExportTotal(item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="success">mdi-export</v-icon></v-list-item-icon>
                  <v-list-item-title>Xuất Excel file tổng hợp</v-list-item-title>
                </v-list-item>
                <v-list-item @click="handleExportDetail(item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="success">mdi-export</v-icon></v-list-item-icon>
                  <v-list-item-title>Xuất Excel file chi tiết</v-list-item-title>
                </v-list-item>
                <v-list-item @click="handleSendMail(item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="purple">mdi-email</v-icon></v-list-item-icon>
                  <v-list-item-title>Gửi mail thông báo</v-list-item-title>
                </v-list-item>
                <!-- Đã sửa gọi đúng hàm handleUpdate(item) -->
                <v-list-item @click="handleUpdate(item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="warning">mdi-pencil</v-icon></v-list-item-icon>
                  <v-list-item-title>Cập nhật</v-list-item-title>
                </v-list-item>
                <v-list-item @click="handleDelete(item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="error">mdi-delete</v-icon></v-list-item-icon>
                  <v-list-item-title>Xóa</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>
      </BaseTable>
    </div>

    <!-- THANH PHÂN TRANG -->
    <div class="d-flex align-center justify-end mt-4 flex-wrap gap-3 pt-3 border-top">
      <div class="d-flex align-center custom-pagination-group" style="gap: 8px;">
        <v-select
          v-model="itemsPerPage"
          :items="[10, 20, 50, 100]"
          label="Bản ghi"
          outlined
          dense
          hide-details
          style="width: 90px;"
          @change="handleItemsPerPageChange"
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
          <v-btn color="#A62229" dark depressed class="text-none px-3" height="36" @click="goToPage">
            Đi
          </v-btn>
        </div>

        <v-btn icon outlined small color="grey" :disabled="currentPage <= 1" @click="changePage(currentPage - 1)">
          <v-icon small>mdi-chevron-left</v-icon>
        </v-btn>

        <div class="d-flex align-center font-weight-bold px-2">
          {{ currentPage }}
        </div>

        <v-btn icon outlined small color="grey" :disabled="currentPage >= totalPages" @click="changePage(currentPage + 1)">
          <v-icon small>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- MODAL XÁC NHẬN XÓA -->
    <v-dialog v-model="deleteDialog" max-width="450px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="white--text py-3 px-4" style="background-color: #A62229;">
          <span class="text-h6 font-weight-bold">Xác nhận xóa</span>
        </v-card-title>
        <v-card-text class="pa-4 text-body-1 black--text">
          Bạn có chắc chắn muốn xóa đợt thanh toán <span class="font-weight-bold red--text">{{ itemToDelete ? itemToDelete.name : '' }}</span>?
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="px-4 py-3 justify-end" style="gap: 8px;">
          <v-btn text class="text-none" @click="deleteDialog = false">Đóng</v-btn>
          <v-btn color="#A62229" dark class="text-none px-4" elevation="0" @click="confirmDelete">Xác Nhận</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <base-confirm-modal
      :open="openSendMail"
      @OK="confirmSendMail"
      @toggle="openSendMail = !openSendMail"
    >
      <template #content>
        <div>Xác nhận gửi mail thông báo tới giảng viên</div>
      </template>
    </base-confirm-modal>

    <!-- MODAL THÊM MỚI -->
    <v-dialog v-model="addDialog" max-width="650px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="white--text py-3 px-4 d-flex justify-space-between align-center" style="background-color: #A62229;">
          <span class="text-h6 font-weight-bold">Thêm mới thanh toán giảng viên theo đợt</span>
          <v-btn icon dark small @click="addDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-4">
          <v-form ref="addForm" v-model="validForm">
            <div class="mb-3">
              <label class="font-weight-medium black--text mb-1 d-block">Tên đợt thanh toán <span class="red--text">(*)</span></label>
              <v-text-field
                v-model="formModel.name"
                placeholder="Nhập tên đợt thanh toán"
                outlined
                dense
                hide-details="auto"
                :rules="[v => !!v || 'Vui lòng nhập tên đợt thanh toán']"
              ></v-text-field>
            </div>

            <div class="mb-3">
              <label class="font-weight-medium black--text mb-1 d-block">Thông tin thanh toán</label>
              <v-text-field
                v-model="formModel.fileName"
                placeholder="Thông tin thanh toán"
                outlined
                dense
                hide-details
                append-icon="mdi-file-upload-outline"
              ></v-text-field>
            </div>

            <div class="mb-3">
              <label class="font-weight-medium black--text mb-1 d-block">Ngày thanh toán <span class="red--text">(*)</span></label>
              <v-menu
                v-model="menuPaymentDate"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                max-width="290px"
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="formattedPaymentDate"
                    placeholder="DD/MM/YYYY"
                    outlined
                    dense
                    readonly
                    hide-details="auto"
                    append-icon="mdi-calendar"
                    v-bind="attrs"
                    v-on="on"
                    :rules="[v => !!v || 'Vui lòng chọn ngày thanh toán']"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="formModel.paymentDate"
                  no-title
                  scrollable
                  @input="menuPaymentDate = false"
                ></v-date-picker>
              </v-menu>
            </div>

            <div class="mb-2">
              <label class="font-weight-medium black--text mb-1 d-block">Chọn thanh toán giảng viên theo hội đồng <span class="red--text">(*)</span></label>
              <v-select
                v-model="formModel.paymentTeacherIds"
                :items="examSessionListOptions"
                item-text="examSession.examClass"
                item-value="id"
                placeholder="Chọn thanh toán giảng viên theo hội đồng"
                outlined
                dense
                multiple
                chips
                small-chips
                hide-details="auto"
                :rules="[v => (v && v.length > 0) || 'Vui lòng chọn ít nhất một hội đồng']"
              ></v-select>
            </div>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="px-4 py-3 justify-end" style="gap: 8px;">
          <v-btn text class="text-none" @click="addDialog = false">Đóng</v-btn>
          <v-btn color="#A62229" dark class="text-none px-4" elevation="0" :loading="saving" @click="saveNewItem">Lưu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MODAL CẬP NHẬT -->
    <v-dialog v-model="editDialog" max-width="650px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="white--text py-3 px-4 d-flex justify-space-between align-center" style="background-color: #A62229;">
          <span class="text-h6 font-weight-bold">Cập nhật thanh toán giảng viên theo đợt</span>
          <v-btn icon dark small @click="editDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-4">
          <v-form ref="editForm" v-model="validForm">
            <div class="mb-3">
              <label class="font-weight-medium black--text mb-1 d-block">Tên đợt thanh toán <span class="red--text">(*)</span></label>
              <v-text-field
                v-model="formModel.name"
                placeholder="Nhập tên đợt thanh toán"
                outlined
                dense
                hide-details="auto"
                :rules="[v => !!v || 'Vui lòng nhập tên đợt thanh toán']"
              ></v-text-field>
            </div>

            <div class="mb-3">
              <label class="font-weight-medium black--text mb-1 d-block">Thông tin thanh toán</label>
              <v-text-field
                v-model="formModel.fileName"
                placeholder="Thông tin thanh toán"
                outlined
                dense
                hide-details
                append-icon="mdi-file-upload-outline"
              ></v-text-field>
            </div>

            <div class="mb-3">
              <label class="font-weight-medium black--text mb-1 d-block">Ngày thanh toán <span class="red--text">(*)</span></label>
              <v-menu
                v-model="menuPaymentDate"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                max-width="290px"
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="formattedPaymentDate"
                    placeholder="DD/MM/YYYY"
                    outlined
                    dense
                    readonly
                    hide-details="auto"
                    append-icon="mdi-calendar"
                    v-bind="attrs"
                    v-on="on"
                    :rules="[v => !!v || 'Vui lòng chọn ngày thanh toán']"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="formModel.paymentDate"
                  no-title
                  scrollable
                  @input="menuPaymentDate = false"
                ></v-date-picker>
              </v-menu>
            </div>

            <div class="mb-2">
              <label class="font-weight-medium black--text mb-1 d-block">Chọn thanh toán giảng viên theo hội đồng <span class="red--text">(*)</span></label>
              <v-select
                v-model="formModel.paymentTeacherIds"
                :items="examSessionListOptions"
                item-text="examSession.examClass"
                item-value="id"
                placeholder="Chọn thanh toán giảng viên theo hội đồng"
                outlined
                dense
                multiple
                chips
                small-chips
                hide-details="auto"
                :rules="[v => (v && v.length > 0) || 'Vui lòng chọn ít nhất một hội đồng']"
              ></v-select>
            </div>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="px-4 py-3 justify-end" style="gap: 8px;">
          <v-btn text class="text-none" @click="editDialog = false">Đóng</v-btn>
          <v-btn color="#A62229" dark class="text-none px-4" elevation="0" :loading="saving" @click="saveUpdateItem">Lưu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import BaseConfirmModal from '~/components/Base/ConfirmModal.vue'
import ChangeableStatus from '~/components/Base/ChangeableStatus.vue'
import paymentTeacherExamServices from '~/services/redefend/paymentTeacherExamServices'
import { paymentTeacherStatusList } from '~/consts/list'

export default {
  name: 'PaymentTeacherExamPage',
  components: { 
    BaseTable, 
    BaseConfirmModal, 
    ChangeableStatus 
  },
  data() {
    return {
      editDialog: false,
      editingId: null,
      openSendMail: false,
      addDialog: false,
      validForm: false,
      saving: false,
      examSessionListOptions: [],
      formModel: {
        name: '',
        fileName: '',
        paymentDate: new Date().toISOString().substr(0, 10),
        paymentTeacherIds: [],
      },
      menuPaymentDate: false,

      loading: false,
      itemList: [],
      paymentTeacherStatusList,
      
      filters: {
        search: '',
        paymentStatus: '',
      },
      
      activeFilters: {
        search: '',
        paymentStatus: '',
      },
      
      totalRecords: 0,
      totalPages: 1,
      currentPage: 1,
      pageInput: 1,
      itemsPerPage: 50,

      tableHeaders: [
        { value: 'stt', text: 'STT', align: 'center', width: '60px', sortable: false },
        { value: 'paymentDate', text: 'Ngày thanh toán', align: 'left', width: '130px', sortable: false },
        { value: 'code', text: 'Mã đợt thanh toán', align: 'left', width: '140px', sortable: false },
        { value: 'name', text: 'Tên đợt thanh toán', align: 'left', minWidth: '180px', sortable: false },
        { value: 'paymentTeachers', text: 'T.T giảng viên theo hội đồng', align: 'left', minWidth: '200px', sortable: false },
        { value: 'file', text: 'File thanh toán', align: 'center', width: '120px', sortable: false },
        { value: 'paymentStatus', text: 'Trạng thái', align: 'center', width: '150px', sortable: false },
        { value: 'actions', text: 'Chức năng', align: 'center', width: '100px', sortable: false },
      ],

      deleteDialog: false,
      itemToDelete: null,
    }
  },
  async mounted() {
    await this.loadData()
  },
  computed: {
    formattedPaymentDate: {
      get() {
        if (!this.formModel.paymentDate) return ''
        const parts = this.formModel.paymentDate.split('-')
        if (parts.length === 3 && parts[0].length === 4) {
          return `${parts[2]}/${parts[1]}/${parts[0]}`
        }
        return this.formModel.paymentDate
      },
      set(val) {
        this.formModel.paymentDate = val
      }
    }
  },
  methods: {
    formatDate(dateStr) {
      if (!dateStr) return '-'
      const cleanDate = dateStr.split('T')[0]
      const parts = cleanDate.split('-')
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`
      }
      return cleanDate
    },

    formatExamSessions(item) {
      if (item.paymentTeachers && Array.isArray(item.paymentTeachers) && item.paymentTeachers.length > 0) {
        const classNames = item.paymentTeachers
          .map(pt => pt.paymentTeacher?.examSession?.examClass)
          .filter(Boolean)
        return [...new Set(classNames)].join(', ') || '-'
      }
      return '-'
    },

    getStatusText(status) {
      const found = paymentTeacherStatusList.find(s => s.value === status)
      return found ? found.text : (status || 'Chờ thanh toán')
    },

    getStatusColor(status) {
      const found = paymentTeacherStatusList.find(s => s.value === status)
      return found ? found.color : 'warning'
    },

    handleSearch() {
      this.activeFilters = { ...this.filters }
      this.currentPage = 1
      this.pageInput = 1
      this.loadData()
    },

    refreshData() {
      this.filters = { search: '', paymentStatus: '' }
      this.activeFilters = { ...this.filters }
      this.currentPage = 1
      this.pageInput = 1
      this.loadData()
    },

    async loadData() {
      this.loading = true
      try {
        const params = {
          pageIndex: this.currentPage,
          pageSize: this.itemsPerPage,
          search: this.activeFilters.search || '',
          paymentStatus: this.activeFilters.paymentStatus || '',
          channel: 'CMS'
        }
        const res = await paymentTeacherExamServices.getList(params)
        const raw = res.data !== undefined ? res.data : res
        
        this.itemList = Array.isArray(raw) ? raw : (raw.data || raw.content || raw.items || [])
        const total = raw.totalElements ?? raw.totalRecords ?? raw.total ?? (res.totalElements || res.total)
        this.totalRecords = total !== undefined ? Number(total) : this.itemList.length
        this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage) || 1
      } catch (error) {
        console.error('Lỗi tải danh sách thanh toán:', error)
        this.itemList = []
        this.totalRecords = 0
      } finally {
        this.loading = false
      }
    },

    async handleChangeStatus(statusObj, item) {
      try {
        const recordId = item.paymentTeacherExamId || item.paymentExamId || item.id;
        
        if (!recordId) {
          if (typeof this.$showError === 'function') {
            this.$showError('Không tìm thấy mã định danh đợt thanh toán');
          }
          return;
        }

        const res = await paymentTeacherExamServices.changeStatus({
          id: recordId,
          paymentTeacherExamId: recordId,
          paymentStatus: statusObj.value,
          channel: 'CMS'
        })
        const responseData = res?.data
        const errorCode = responseData?.error?.code ?? responseData?.code ?? res?.error?.code ?? res?.code
        const hasBackendError = errorCode !== undefined && errorCode !== null && Number(errorCode) !== 0

        if (res?.success === true && responseData?.success !== false && !responseData?.error && !hasBackendError) {
          await this.loadData();
          const refreshedItem = this.itemList.find(row => String(row.id) === String(recordId))
          if (refreshedItem?.paymentStatus === statusObj.value && typeof this.$showSuccess === 'function') {
            this.$showSuccess('Cập nhật trạng thái thành công')
          }
        } else {
          const errorMessage = responseData?.error?.message || responseData?.message ||
            res?.error?.message || res?.message
          if (errorMessage && typeof this.$showError === 'function') {
            this.$showError(errorMessage)
          }
        }
      } catch (error) {
        console.error('Lỗi đổi trạng thái:', error);
        if (typeof this.$showError === 'function') {
          this.$showError('Cập nhật trạng thái thất bại');
        }
      }
    },

    async openAddModal() {
      this.formModel = {
        name: '',
        fileName: '',
        paymentDate: new Date().toISOString().substr(0, 10),
        paymentTeacherIds: [],
      }
      await this.loadExamSessionOptions()
      this.addDialog = true
    },

    async loadExamSessionOptions() {
      try {
        const res = await paymentTeacherExamServices.getListNotInPaymentExam({ channel: 'CMS' })
        const raw = res.data !== undefined ? res.data : res
        this.examSessionListOptions = Array.isArray(raw) ? raw : (raw.data || raw.content || raw.items || [])
      } catch (error) {
        console.error('Lỗi tải danh sách hội đồng:', error)
        this.examSessionListOptions = []
      }
    },

    async saveNewItem() {
      if (!this.$refs.addForm.validate()) return
      this.saving = true
      try {
        let formattedDate = this.formModel.paymentDate
        if (formattedDate && formattedDate.includes('-')) {
          const parts = formattedDate.split('-')
          if (parts.length === 3 && parts[0].length === 4) {
            formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`
          }
        }

        const payload = {
          name: this.formModel.name,
          fileName: this.formModel.fileName,
          paymentDate: formattedDate,
          paymentTeacherIds: this.formModel.paymentTeacherIds,
          channel: 'CMS'
        }
        
        await paymentTeacherExamServices.addNew(payload)
        this.addDialog = false
        if (typeof this.$showSuccess === 'function') {
          this.$showSuccess('Thêm mới thanh toán giảng viên theo đợt thành công')
        }
        await this.loadData()
      } catch (error) {
        console.error('Lỗi khi thêm mới:', error)
        if (typeof this.$showError === 'function') {
          this.$showError('Có lỗi xảy ra khi thêm mới thanh toán')
        }
      } finally {
        this.saving = false
      }
    },

    async downloadFile(item) {
      try {
        if (item.fileUrl) {
          const link = document.createElement('a')
          link.href = item.fileUrl
          link.target = '_blank'
          link.download = item.fileName || `file_thanh_toan_${item.code || item.id}.xlsx`
          link.click()
          return
        }

        const res = await paymentTeacherExamServices.export(item.id)
        const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = `file_thanh_toan_${item.code || item.id}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        if (typeof this.$showSuccess === 'function') {
          this.$showSuccess('Tải file thanh toán thành công')
        }
      } catch (error) {
        console.error('Lỗi tải file:', error)
        if (typeof this.$showError === 'function') {
          this.$showError('Không thể tải file thanh toán')
        }
      }
    },

    handleDelete(item) {
      this.itemToDelete = item
      this.deleteDialog = true
    },

    async confirmDelete() {
      if (!this.itemToDelete) return
      try {
        await paymentTeacherExamServices.delete(this.itemToDelete.id)
        this.deleteDialog = false
        this.itemToDelete = null
        if (typeof this.$showSuccess === 'function') {
          this.$showSuccess('Xóa đợt thanh toán thành công')
        }
        await this.loadData()
      } catch (error) {
        console.error('Lỗi khi xóa:', error)
      }
    },

    changePage(page) {
      if (page < 1 || page > this.totalPages) return
      this.currentPage = page
      this.pageInput = page
      this.loadData()
    },

    goToPage() {
      const p = parseInt(this.pageInput)
      if (p >= 1 && p <= this.totalPages) {
        this.changePage(p)
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

    async handleExportTotal(item) {
      const res = await paymentTeacherExamServices.exportTotal({
          paymentExamId: item.id,
      });
      if (res.success) this.$download(res?.data?.url);
    },

    async handleExportDetail(item) {
      const res = await paymentTeacherExamServices.exportDetail({
          paymentExamId: item.id,
      });
      if (res.success) this.$download(res?.data?.url);
    },

    handleSendMail(item) {
      this.selectedItem = item;
      this.openSendMail = true;
    },

    async confirmSendMail() {
      try {
        const res = await paymentTeacherExamServices.sendMail({
          paymentExamId: this.selectedItem?.id,
        })

        if (!res?.success) return

        if (typeof this.$showSuccess === 'function') {
          this.$showSuccess('Gửi mail thông báo thanh toán tới giảng viên thành công')
        }
        this.openSendMail = false
        await this.loadData()
      } catch (error) {
        console.error('Lỗi gửi mail thông báo thanh toán:', error)
        if (typeof this.$showError === 'function') {
          this.$showError('Gửi mail thông báo thanh toán thất bại')
        }
      }
    },

    // Hàm mở modal cập nhật khi bấm vào menu 3 chấm
    async handleUpdate(item) {
      // Quét các trường ID có thể có để không bị undefined
      this.editingId = item.id || item.paymentExamId || item.paymentTeacherExamId;
      
      if (!this.editingId) {
        if (typeof this.$showError === 'function') {
          this.$showError('Không tìm thấy mã định danh để cập nhật');
        }
        return;
      }
      
      this.formModel = {
        name: item.name || item.paymentName || '',
        fileName: item.fileName || '',
        paymentDate: item.paymentDate ? item.paymentDate.split('T')[0] : new Date().toISOString().substr(0, 10),
        paymentTeacherIds: item.paymentTeachers ? item.paymentTeachers.map(pt => pt.paymentTeacherId || pt.paymentTeacher?.id || pt.id) : [],
      };

      await this.loadExamSessionOptionsForUpdate(this.editingId);
      this.editDialog = true;
    },

    async loadExamSessionOptionsForUpdate(examId) {
      try {
        const res = await paymentTeacherExamServices.getListNotInPaymentExam({ 
          paymentExamId: examId,
          channel: 'CMS' 
        });
        const raw = res.data !== undefined ? res.data : res;
        
        // Gộp danh sách trả về từ API (đảm bảo hiển thị cả hội đồng hiện tại và hội đồng chưa gán)
        this.examSessionListOptions = Array.isArray(raw) ? raw : (raw.data || raw.content || raw.items || []);
      } catch (error) {
        console.error('Lỗi tải danh sách hội đồng khi sửa:', error);
        this.examSessionListOptions = [];
      }
    },

    async saveUpdateItem() {
      if (!this.$refs.editForm.validate()) return;
      if (!this.editingId) {
        if (typeof this.$showError === 'function') {
          this.$showError('ID cập nhật không hợp lệ');
        }
        return;
      }

      this.saving = true;
      try {
        let formattedDate = this.formModel.paymentDate;
        if (formattedDate && formattedDate.includes('-')) {
          const parts = formattedDate.split('-');
          if (parts.length === 3 && parts[0].length === 4) {
            formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
          }
        }

        const payload = {
          name: this.formModel.name,
          fileName: this.formModel.fileName,
          paymentDate: formattedDate,
          paymentTeacherIds: this.formModel.paymentTeacherIds,
          channel: 'CMS'
        };

        // Gọi API cập nhật với ID chính xác
        await paymentTeacherExamServices.update(this.editingId, payload);
        
        this.editDialog = false;
        if (typeof this.$showSuccess === 'function') {
          this.$showSuccess('Cập nhật đợt thanh toán thành công');
        }
        await this.loadData();
      } catch (error) {
        console.error('Lỗi khi cập nhật:', error);
        if (typeof this.$showError === 'function') {
          this.$showError('Có lỗi xảy ra khi cập nhật');
        }
      } finally {
        this.saving = false;
      }
    },
  }
}
</script>

<style scoped>
:deep .v-data-table__wrapper {
    max-height: calc(100vh - 250px);
}
</style>

<style scoped>
:deep .v-data-table__wrapper {
    max-height: calc(100vh - 250px);
}
</style>