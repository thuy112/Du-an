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
                  <v-icon size="24" color="#ffffff">mdi-email-plus-outline</v-icon>
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

            <!-- 2 NÚT ĐÃ NỐI VỚI SEND FEE LIST & EXTEND DEADLINE -->
            <div class="action-buttons-group d-flex align-center gap-2">
              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <div v-bind="attrs" class="btn-badge-wrapper" v-on="on">
                    <span v-if="selectedCount > 0" class="badge-count">{{ selectedCount }}</span>
                    <button
                      type="button"
                      class="action-btn btn-fee-send"
                      :class="{ active: isActionActive }"
                      :disabled="!isActionActive"
                      @click="openSendFeeList = true"
                    >
                      <v-icon size="22" :color="isActionActive ? '#ffffff' : '#8e8e8e'">mdi-send</v-icon>
                    </button>
                  </div>
                </template>
                <span>Gửi danh sách học phí các sinh viên đã chọn</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <div v-bind="attrs" class="btn-badge-wrapper" v-on="on">
                    <span v-if="selectedCount > 0" class="badge-count">{{ selectedCount }}</span>
                    <button
                      type="button"
                      class="action-btn btn-fee-extend"
                      :class="{ active: isActionActive }"
                      :disabled="!isActionActive"
                      @click="openExtendDeadline = true"
                    >
                      <v-icon size="22" :color="isActionActive ? '#ffffff' : '#8e8e8e'">mdi-calendar-clock</v-icon>
                    </button>
                  </div>
                </template>
                <span>Gia hạn nộp học phí cho các sinh viên đã chọn</span>
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

          <template #[`item.feePaidStatus`]="{ item }">
            <BaseStatusItem v-if="item.feePaidStatus != null" :status="item.feePaidStatus" :status-list="payStatusList" />
            <span v-else>-</span>
          </template>

          <template #[`item.paymentSendStatusName`]="{ item }">
            <BaseStatusItem v-if="item.paymentSendStatusName != null" :status="item.paymentSendStatusName" :status-list="paymentSendStatusList" />
            <span v-else>-</span>
          </template>

          <template #[`item.isListedForBank`]="{ item }">
            <BaseChangeableStatus
              v-if="item.isListedForBank === 'YES'"
              :status="item.isListedForBank"
              :status-list="listForBankStatus"
              @changeStatus="handleChangeBankStatus($event, item)"
            />
            <base-status-item
              v-else-if="item.isListedForBank != null"
              :status-list="listForBankStatus"
              :status="item.isListedForBank"
            />
            <span v-else>-</span>
          </template>

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
                <v-list-item @click="handleMenuAction('detail', item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="#00bcd4">mdi-eye</v-icon></v-list-item-icon>
                  <v-list-item-title>Chi tiết</v-list-item-title>
                </v-list-item>

                <v-list-item v-if="canShowEdit(item)" @click="handleMenuAction('edit', item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="#2196f3">mdi-pencil</v-icon></v-list-item-icon>
                  <v-list-item-title>Cập nhật</v-list-item-title>
                </v-list-item>

                <v-list-item @click="handleMenuAction('exportOne', item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="#a61c24">mdi-microsoft-excel</v-icon></v-list-item-icon>
                  <v-list-item-title>Xuất file đăng ký</v-list-item-title>
                </v-list-item>

                <v-list-item v-if="!isAllApproved(item)" @click="handleMenuAction('approveStep', item)">
                  <v-list-item-icon class="mr-2">
                    <v-icon small color="#a61c24">mdi-check-circle</v-icon>
                  </v-list-item-icon>
                  <v-list-item-title>
                    {{ getApproveLabel(item) }}
                  </v-list-item-title>
                </v-list-item>

                <v-list-item v-if="!isAllApproved(item) && isPaymentNotSent(item)" @click="handleMenuAction('rejectStep', item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="#a2212b">mdi-cancel</v-icon></v-list-item-icon>
                  <v-list-item-title>{{ getCancelLabel(item) }}</v-list-item-title>
                </v-list-item>

                <v-list-item @click="handleMenuAction('scoreTable', item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="#9c27b0">mdi-table</v-icon></v-list-item-icon>
                  <v-list-item-title>Bảng điểm</v-list-item-title>
                </v-list-item>

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
            <v-icon left small>mdi-export</v-icon> XUẤT FILE KẾT QUẢ CẦN THU
          </v-btn>
          <v-btn color="#4CAF50" dark small elevation="0" class="text-none font-weight-medium rounded-sm" @click="handleImport">
            <v-icon left small>mdi-microsoft-excel</v-icon> NHẬP FILE KẾT QUẢ THU
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

    <!-- @@@ Tín chỉ -->
    <BaseConfirmModal text-btn="Xác nhận" :open="openCredit" @toggle="openCredit = !openCredit" @OK="handleApprovalCredit">
      <template #content>
        <span>Bạn có chắc chắn muốn duyệt tín chỉ này không ? </span>
      </template>
    </BaseConfirmModal>

    <BaseConfirmModal text-btn="Xác nhận" :open="openCreditCancel" @toggle="openCreditCancel = !openCreditCancel" @OK="handleCancelCredit">
      <template #content>
        <span>Bạn có chắc chắn muốn từ chối tín chỉ này không ? </span>
      </template>
    </BaseConfirmModal>

    <!-- @@@ Học phí -->
    <BaseConfirmModal text-btn="Xác nhận" :open="openTuitionFee" @toggle="openTuitionFee = !openTuitionFee" @OK="handleApprovalTuitionFee">
      <template #content>
        <span>Bạn có chắc chắn muốn duyệt học phí này không ? </span>
      </template>
    </BaseConfirmModal>

    <BaseConfirmModal text-btn="Xác nhận" :open="openCancelTuitionFee" @toggle="openCancelTuitionFee = !openCancelTuitionFee" @OK="handleCancelTuitionFee">
      <template #content>
        <span>Bạn có chắc chắn muốn từ chối học phí này không ? </span>
      </template>
    </BaseConfirmModal>

    <!-- @@@ Sinh viên -->
    <BaseConfirmModal text-btn="Xác nhận" :open="openStudent" @toggle="openStudent = !openStudent" @OK="handleStudent">
      <template #content>
        <span>Bạn có chắc chắn muốn duyệt sinh viên này không ? </span>
      </template>
    </BaseConfirmModal>

    <BaseConfirmModal text-btn="Xác nhận" :open="openCancelStudent" @toggle="openCancelStudent = !openCancelStudent" @OK="handleCancelStudent">
      <template #content>
        <span>Bạn có chắc chắn muốn từ chối sinh viên này không ? </span>
      </template>
    </BaseConfirmModal>

    <!-- @@@ DIALOG XÁC NHẬN XÓA -->
    <BaseConfirmModal text-btn="Xác nhận" :open="openDeleteModal" @toggle="openDeleteModal = !openDeleteModal" @OK="handleDeleteRecord">
      <template #content>
        <span>Xác nhận xóa sinh viên đăng ký <b class="red--text text--darken-3">{{ selectedItem ? selectedItem.studentName : '' }}</b></span>
      </template>
    </BaseConfirmModal>

    <!-- Modal xác nhận Gửi mail học phí -->
    <BaseConfirmModal
      text-btn="Đồng ý"
      :open="openMailFeeModal"
      @toggle="openMailFeeModal = !openMailFeeModal"
      @OK="handleSendMailFee"
    >
      <template #content>
        <span>Gửi email thông báo được phép đóng phí bảo vệ lại</span>
      </template>
    </BaseConfirmModal>

    <!-- Modal xác nhận Gửi mail từ chối -->
    <BaseConfirmModal
      text-btn="Đồng ý"
      :open="openMailRefusedModal"
      @toggle="openMailRefusedModal = !openMailRefusedModal"
      @OK="handleSendMailRefused"
    >
      <template #content>
        <span>Gửi email thông báo từ chối đăng kí bảo vệ lại</span>
      </template>
    </BaseConfirmModal>

    <!-- DIALOG XEM BẢNG ĐIỂM -->
    <v-dialog v-model="openScoreDialog" max-width="800px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="headline text-white px-6 py-3" style="background-color: #a62229;">
          <span>Bảng điểm</span>
          <v-spacer></v-spacer>
          <v-btn icon dark @click="openScoreDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="py-4 px-6">
          <v-data-table
            :headers="scoreHeaders"
            :items="scoreItems"
            :loading="scoreLoading"
            hide-default-footer
            no-data-text="Không có dữ liệu"
            class="elevation-0 border"
          >
            <template #[`item.index`]="{ index }">
              <span>{{ index + 1 }}</span>
            </template>
          </v-data-table>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="px-6 py-3">
          <v-spacer></v-spacer>
          <v-btn text color="grey darken-1" @click="openScoreDialog = false">
            Đóng <v-icon right small>mdi-close</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 2 MODAL GỬI DANH SÁCH THU PHÍ & GIA HẠN HẠN NỘP -->
    <RedefenseRegisterSendFeeList
      v-if="openSendFeeList"
      :open="openSendFeeList"
      :selected-items="selectedRows"
      @toggle="openSendFeeList = false"
      @success="handleSendFeeSuccess"
    />

    <RedefenseRegisterExtendDeadline
      v-if="openExtendDeadline"
      :open="openExtendDeadline"
      :selected-items="selectedRows"
      @toggle="openExtendDeadline = false"
      @success="handleExtendSuccess"
    />

    <!-- Component Modal Đăng Ký Bảo Vệ Lại -->
    <register-modal
      v-model="isAddModalOpen"
      :data="selectedItem"
      @success="loadData"
    />
    <!-- Component Modal Chi Tiết -->
    <detail-modal
      v-model="isDetailModalOpen"
      :data="selectedDetailData"
    />
    <edit-register-modal
      v-model="openEditModal"
      :data="selectedEditItem"
      @success="loadData"
    />
  </div>
</template>

<script>
import {
  listForBankStatus,
  payStatusList,
  paymentSendStatusList,
  sendMailStatusList,
} from '~/consts/list'
import BaseTable from '~/components/Base/BaseTable.vue'
import registerService from '~/services/redefend/registerService'
import RegisterModal from '@/components/RegisterModal.vue'
import DetailModal from '~/components/DetailModal.vue'
import EditRegisterModal from '@/components/EditRegisterModal.vue'
import RedefenseRegisterSendFeeList from '@/components/RedefenseRegister/SendFeeList.vue'
import RedefenseRegisterExtendDeadline from '@/components/RedefenseRegister/ExtendDeadline.vue'

export default {
  name: 'RegisterStudentPage',
  components: {
    BaseTable,
    RegisterModal,
    DetailModal,
    EditRegisterModal,
    RedefenseRegisterSendFeeList,
    RedefenseRegisterExtendDeadline,
  },
  data() {
    return {
      openSendFeeList: false,
      openExtendDeadline: false,

      openMailFeeModal: false,
      openMailRefusedModal: false,
      openEditModal: false,
      selectedEditItem: {},
      openDeleteModal: false,

      openCredit: false,
      openCreditCancel: false,
      openTuitionFee: false,
      openCancelTuitionFee: false,
      openStudent: false,
      openCancelStudent: false,

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
        emailStatus: null,
      },

      openScoreDialog: false,
      scoreLoading: false,
      scoreItems: [],
      scoreHeaders: [
        { text: 'STT', value: 'index', width: '60px', sortable: false },
        { text: 'Hội đồng bảo vệ', value: 'councilName', sortable: false },
        { text: 'Học phần', value: 'subjectName', sortable: false },
        { text: 'Điểm', value: 'score', sortable: false },
        { text: 'Ghi chú', value: 'note', sortable: false },
        { text: 'Trạng thái', value: 'status', sortable: false },
      ],

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
        { text: 'Chức năng', value: 'actions', width: '80px', sortable: false, align: 'center' },
      ],
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
      const selectedIds = this.selectedRows.map((r) => r.id)
      const currentIds = this.tableItems.map((r) => r.id)
      const count = currentIds.filter((id) => selectedIds.includes(id)).length
      return count > 0 && count < currentIds.length
    },
    selectAll: {
      get() {
        if (this.tableItems.length === 0) return false
        const selectedIds = this.selectedRows.map((r) => r.id)
        return this.tableItems.every((r) => selectedIds.includes(r.id))
      },
      set(val) {
        if (val) {
          const selectedIds = this.selectedRows.map((r) => r.id)
          const newRows = [...this.selectedRows]
          this.tableItems.forEach((item) => {
            if (!selectedIds.includes(item.id)) {
              newRows.push(item)
            }
          })
          this.selectedRows = newRows
        } else {
          const currentIds = this.tableItems.map((r) => r.id)
          this.selectedRows = this.selectedRows.filter((r) => !currentIds.includes(r.id))
        }
      },
    },
  },
  mounted() {
    this.fetchDropdownData()
    this.loadData()
  },
  methods: {
    handleSendFeeSuccess() {
      this.openSendFeeList = false
      this.selectedRows = []
      this.$toast?.success?.('Gửi danh sách thu phí thành công')
      this.loadData()
    },

    handleExtendSuccess() {
      this.openExtendDeadline = false
      this.selectedRows = []
      this.$toast?.success?.('Gia hạn hạn nộp học phí thành công')
      this.loadData()
    },

    async fetchDropdownData() {
      try {
        const [resExams, resClasses] = await Promise.all([
          registerService.getExams({ status: 'ACTIVE', channel: 'CMS' }),
          registerService.getClasses({ channel: 'CMS' }),
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
          emailStatus: item.sendMailStatus,
        }))

        this.totalItems =
          payload.total || payload.totalRecords || payload.totalElements || this.tableItems.length
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
        emailStatus: null,
      }
      this.selectedRows = []
      this.handleSearch()
    },

    jumpToPage() {
      const page = parseInt(this.pageInput, 10)
      if (page >= 1 && page <= this.totalPages) {
        this.pageIndex = page
        this.loadData()
      }
    },

    formatMoney(val) {
      if (!val) return '0'
      return new Intl.NumberFormat('vi-VN').format(val)
    },

    async handleExport() {
      try {
        const res = await registerService.exportFile({ channel: 'CMS', ...this.filters })
        this.downloadBlob(
          res.data || res,
          `Ket_qua_can_thu_${new Date().toISOString().slice(0, 10)}.xlsx`
        )
      } catch (error) {
        console.error('Lỗi xuất file:', error)
      }
    },

    downloadBlob(data, filename) {
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
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

    canShowEdit(item) {
      const notPaid = !this.isTuitionPaid(item)
      const paymentNotSent = this.isPaymentNotSent(item)
      const regStatus =
        item.registerStudentStatus || item.status || item.registrationStatus || ''
      const isConfirmed =
        regStatus === 'CONFIRMED' ||
        regStatus === 'DA_XAC_NHAN' ||
        regStatus.includes('Đã xác nhận')

      return notPaid && paymentNotSent && !isConfirmed
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

    isAllApproved(item) {
      const isCreditDone =
        item.creditManagement === 'CONFIRMED' || item.creditManagement === 'REFUSED'
      const isTuitionDone =
        item.tuitionFeeManagement === 'CONFIRMED' || item.tuitionFeeManagement === 'REFUSED'
      const isStudentDone =
        item.studentManagement === 'CONFIRMED' || item.studentManagement === 'REFUSED'

      if (
        item.creditManagement === 'REFUSED' ||
        item.tuitionFeeManagement === 'REFUSED' ||
        item.studentManagement === 'REFUSED'
      ) {
        return true
      }

      return isCreditDone && isTuitionDone && isStudentDone
    },

    getApproveLabel(item) {
      if (item.creditManagement !== 'CONFIRMED') return 'Duyệt tín chỉ'
      if (item.tuitionFeeManagement !== 'CONFIRMED') return 'Duyệt học phí'
      return 'Duyệt sinh viên'
    },

    getCancelLabel(item) {
      if (item.creditManagement !== 'CONFIRMED') return 'Từ chối tín chỉ'
      if (item.tuitionFeeManagement !== 'CONFIRMED') return 'Từ chối học phí'
      return 'Từ chối sinh viên'
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
            const res = registerService.getDetail
              ? await registerService.getDetail(recordId, 'CMS')
              : item
            const detailObj = res.data || res || item
            this.selectedDetailData = detailObj
            if (detailObj.registerStudentStatus) {
              this.$set(item, 'registerStudentStatus', detailObj.registerStudentStatus)
            }
          } catch (error) {
            this.selectedDetailData = item
          }
          this.isDetailModalOpen = true
          break
        case 'edit':
          this.selectedEditItem = item
          this.openEditModal = true
          break
        case 'exportOne':
          this.exportSingleFile(item.id)
          break
        case 'approveStep':
          this.selectedItem = item
          if (item.creditManagement !== 'CONFIRMED') {
            this.openCredit = true
          } else if (item.tuitionFeeManagement !== 'CONFIRMED') {
            this.openTuitionFee = true
          } else {
            this.openStudent = true
          }
          break
        case 'rejectStep':
          this.selectedItem = item
          if (item.creditManagement !== 'CONFIRMED') {
            this.openCreditCancel = true
          } else if (item.tuitionFeeManagement !== 'CONFIRMED') {
            this.openCancelTuitionFee = true
          } else {
            this.openCancelStudent = true
          }
          break
        case 'scoreTable':
          this.openScoreDialog = true
          this.fetchStudentScores(item)
          break
        case 'delete':
          this.selectedItem = item
          this.openDeleteModal = true
          break
      }
    },

    isPaymentNotSent(item) {
      const status = item.paymentSendStatusName
      if (
        status === 'SENT' ||
        status === 'Đã gửi' ||
        status === 'DA_GUI' ||
        status === 'Gia hạn'
      ) {
        return false
      }
      return true
    },

    async exportSingleFile(id) {
      try {
        const params = {
          channel: 'CMS',
          transid: 'bc977060-234e-47da-8697-f97342d66abd',
        }
        const response = await registerService.exportByCode(id, params)
        const blob = new Blob([response.data || response], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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

    async handleApprovalCredit() {
      try {
        const res = await registerService.creditRegister({
          management: 'CONFIRMED',
          registerStudentExamId: this.selectedItem.id,
        })
        if (res && (res.success || res.code === 0)) {
          this.$toast.success('Duyệt tín chỉ thành công')
          this.loadData()
        } else {
          this.$toast.error(res?.message || 'Duyệt tín chỉ thất bại')
        }
      } catch (er) {
        console.error(er)
        this.$toast.error('Có lỗi xảy ra khi kết nối tới server')
      } finally {
        this.openCredit = false
      }
    },

    async handleCancelCredit() {
      try {
        const res = await registerService.creditRegister({
          management: 'REFUSED',
          registerStudentExamId: this.selectedItem.id,
        })
        if (res && (res.success || res.code === 0)) {
          this.$toast.success('Từ chối tín chỉ thành công')
          this.loadData()
        } else {
          this.$toast.error(res?.message || 'Thực hiện thất bại')
        }
      } catch (er) {
        console.error(er)
        this.$toast.error('Có lỗi xảy ra khi kết nối tới server')
      } finally {
        this.openCreditCancel = false
      }
    },

    async handleApprovalTuitionFee() {
      try {
        const res = await registerService.tuitionFeeRegister({
          management: 'CONFIRMED',
          registerStudentExamId: this.selectedItem.id,
        })
        if (res && (res.success || res.code === 0)) {
          this.$toast.success('Duyệt học phí thành công')
          this.loadData()
        } else {
          this.$toast.error(res?.message || 'Duyệt học phí thất bại')
        }
      } catch (er) {
        console.error(er)
        this.$toast.error('Có lỗi xảy ra khi kết nối tới server')
      } finally {
        this.openTuitionFee = false
      }
    },

    async handleCancelTuitionFee() {
      try {
        const res = await registerService.tuitionFeeRegister({
          management: 'REFUSED',
          registerStudentExamId: this.selectedItem.id,
        })
        if (res && (res.success || res.code === 0)) {
          this.$toast.success('Từ chối học phí thành công')
          this.loadData()
        } else {
          this.$toast.error(res?.message || 'Thực hiện thất bại')
        }
      } catch (er) {
        console.error(er)
        this.$toast.error('Có lỗi xảy ra khi kết nối tới server')
      } finally {
        this.openCancelTuitionFee = false
      }
    },

    async handleStudent() {
      try {
        const res = await registerService.studentRegister({
          management: 'CONFIRMED',
          registerStudentExamId: this.selectedItem.id,
        })
        if (res && (res.success || res.code === 0)) {
          this.$toast.success('Duyệt sinh viên thành công')
          this.loadData()
        } else {
          this.$toast.error(res?.message || 'Duyệt sinh viên thất bại')
        }
      } catch (er) {
        console.error(er)
        this.$toast.error('Có lỗi xảy ra khi kết nối tới server')
      } finally {
        this.openStudent = false
      }
    },

    async handleCancelStudent() {
      try {
        const res = await registerService.studentRegister({
          management: 'REFUSED',
          registerStudentExamId: this.selectedItem.id,
        })
        if (res && (res.success || res.code === 0)) {
          this.$toast.success('Từ chối sinh viên thành công')
          this.loadData()
        } else {
          this.$toast.error(res?.message || 'Thực hiện thất bại')
        }
      } catch (er) {
        console.error(er)
        this.$toast.error('Có lỗi xảy ra khi kết nối tới server')
      } finally {
        this.openCancelStudent = false
      }
    },

    async fetchStudentScores(item) {
      this.scoreLoading = true
      this.scoreItems = []
      try {
        const res = registerService.getScores
          ? await registerService.getScores(item.id, 'CMS')
          : []
        this.scoreItems = res.data || res || []
      } catch (error) {
        console.error('Lỗi tải bảng điểm:', error)
        this.scoreItems = []
      } finally {
        this.scoreLoading = false
      }
    },

    async handleDeleteRecord() {
      if (!this.selectedItem) return
      try {
        const res = await registerService.delete(this.selectedItem.id, 'CMS')
        if (res && (res.success || res.code === 0)) {
          this.$toast.success('Xóa đơn đăng ký thành công')
          this.loadData()
        } else {
          this.$toast.error(res?.message || 'Xóa đơn đăng ký thất bại')
        }
      } catch (err) {
        console.error('Lỗi khi xóa:', err)
        this.$toast.error('Có lỗi xảy ra khi kết nối tới server')
      } finally {
        this.openDeleteModal = false
      }
    },

    openMailTuition() {
      this.openMailFeeModal = true
    },

    async handleSendMailFee() {
      try {
        const ids = this.selectedRows.map((r) => r.id)
        const params = {
          ids: ids.join(','),
          channel: 'CMS',
          transid: '417d88ee-0113-4cca-93c4-605f52041e22',
        }
        if (registerService.notifyEmail) {
          await registerService.notifyEmail({ params })
        }
        this.loadData()
      } catch (error) {
        console.error('Lỗi gửi email học phí:', error)
        const errMsg =
          error?.response?.data?.message ||
          error?.message ||
          'Chưa có template email hoặc template email chưa kích hoạt'
        this.$toast?.error?.(errMsg)
      } finally {
        this.openMailFeeModal = false
      }
    },

    openMailNotification() {
      this.openMailRefusedModal = true
    },

    async handleSendMailRefused() {
      try {
        const ids = this.selectedRows.map((r) => r.id)
        const params = {
          ids: ids.join(','),
          channel: 'CMS',
          transid: '9c6b01ad-d388-45ef-8d6c-4737942972a1',
        }
        if (registerService.notifyEmailRefuse) {
          await registerService.notifyEmailRefuse({ params })
        }
        this.loadData()
      } catch (error) {
        console.error('Lỗi gửi email từ chối:', error)
        const errMsg =
          error?.response?.data?.message ||
          error?.message ||
          'Chưa có template email hoặc template email chưa kích hoạt'
        this.$toast?.error?.(errMsg)
      } finally {
        this.openMailRefusedModal = false
      }
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
.btn-send,
.btn-calendar,
.btn-fee-send,
.btn-fee-extend {
  background-color: #e0e0e0;
}

.btn-send.active,
.btn-fee-send.active {
  background-color: #13deb9 !important;
}

.btn-calendar.active,
.btn-fee-extend.active {
  background-color: #539bff !important;
}
</style>