<template>
  <div class="student-page d-flex flex-column pa-2 pa-sm-4 bg-white">
    <!-- 1. THANH TÌM KIẾM CỐ ĐỊNH PHÍA TRÊN -->
    <div class="top-filter-bar bg-white py-3 px-1" style="position: relative; z-index: 5;">
      <div class="d-flex align-center justify-space-between flex-wrap gap-2 width-100">
        <div class="text-subtitle-1 font-weight-bold mr-2 text-no-wrap">
          Danh sách thanh toán cho giảng viên (<span class="red--text text--darken-2">{{ totalRecord }}</span>)
        </div>

        <div class="d-flex align-center gap-2 flex-wrap flex-grow-1 justify-end">
          <!-- Tìm kiếm chung -->
          <v-text-field
            v-model="filters.search"
            placeholder="Tìm kiếm"
            outlined
            dense
            hide-details
            clearable
            class="bg-white filter-item search-input custom-outlined-input"
            @keyup.enter="search"
          ></v-text-field>

          <!-- Giảng viên -->
          <v-autocomplete
            v-model="filters.teacherId"
            :items="teacherOptions"
            item-text="text"
            item-value="value"
            placeholder="Giảng viên"
            outlined
            dense
            hide-details
            clearable
            :menu-props="{ offsetY: true, zIndex: 9999 }"
            class="bg-white filter-item select-md custom-outlined-input"
          ></v-autocomplete>

          <!-- Hội đồng bảo vệ -->
          <v-autocomplete
            v-model="filters.examSessionId"
            :items="examSessionOptions"
            item-text="text"
            item-value="value"
            placeholder="Hội đồng bảo vệ"
            outlined
            dense
            hide-details
            clearable
            :menu-props="{ offsetY: true, zIndex: 9999 }"
            class="bg-white filter-item select-md custom-outlined-input"
          ></v-autocomplete>

          <!-- Trạng thái -->
          <v-autocomplete
            v-model="filters.paymentSendStatus"
            :items="statusList"
            item-text="text"
            item-value="value"
            placeholder="Trạng thái"
            outlined
            dense
            hide-details
            clearable
            :menu-props="{ offsetY: true, zIndex: 9999 }"
            class="bg-white filter-item select-md custom-outlined-input"
          ></v-autocomplete>

          <div class="d-flex gap-2 align-center">
            <v-btn
              icon
              color="#a2212b"
              class="rounded-sm action-btn"
              @click="resetFilters"
            >
              <v-icon color="#a2212b" size="24">mdi-refresh</v-icon>
            </v-btn>

            <v-btn
              color="#a2212b"
              dark
              elevation="0"
              class="min-w-0 px-3 rounded-sm action-btn"
              style="height: 40px;"
              @click="search"
            >
              <v-icon size="24">mdi-magnify</v-icon>
            </v-btn>

            <!-- Nút Thêm mới (+) -->
            <v-btn
              color="#a2212b"
              dark
              elevation="0"
              class="min-w-0 px-3 rounded-sm action-btn"
              style="height: 40px;"
              @click="openAddModal"
            >
              <v-icon size="24">mdi-plus</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. BẢNG DỮ LIỆU -->
    <div class="table-scroll-container flex-grow-1">
      <BaseTable
        :headers="headers"
        :items="list"
        hide-default-footer
        disable-pagination
        :loading="isLoading"
        loading-text="Đang tải dữ liệu..."
        no-data-text="Không có dữ liệu"
      >
        <!-- STT -->
        <template #[`item.stt`]="{ index }">
          <span class="font-weight-medium">{{ (page - 1) * itemsPerPage + index + 1 }}</span>
        </template>

        <!-- File thanh toán -->
        <template #[`item.filePayment`]="{ item }">
          <v-btn icon small color="grey darken-1" @click="downloadFilePayment(item)">
            <v-icon size="26">mdi-file-download-outline</v-icon>
          </v-btn>
        </template>

        <!-- Tổng phí -->
        <template #[`item.totalFee`]="{ item }">
          <span class="font-weight-medium">{{ formatCurrency(item.totalFee) }}</span>
        </template>

        <!-- Trạng thái (Bấm vào để đổi trạng thái trực tiếp qua v-menu) -->
        <template #[`item.paymentSendStatus`]="{ item }">
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-chip
                small
                dark
                v-bind="attrs"
                v-on="on"
                :color="getStatusColor(item.paymentSendStatus)"
                class="font-weight-medium text-caption cursor-pointer"
              >
                {{ getStatusName(item.paymentSendStatus) }}
                <v-icon right x-small>mdi-menu-down</v-icon>
              </v-chip>
            </template>
            <v-list dense>
              <v-list-item
                v-for="status in statusList"
                :key="status.value"
                @click="updateItemStatus(item, status.value)"
              >
                <v-list-item-title>{{ status.text }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>

        <!-- Chức năng -->
        <template #[`item.actions`]="{ item }">
          <v-menu offset-y left>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon small v-bind="attrs" v-on="on">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list dense>
              <v-list-item @click="viewDetail(item)">
                <v-list-item-icon class="mr-2">
                  <v-icon small color="info">mdi-eye</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Chi tiết</v-list-item-title>
              </v-list-item>

              <v-list-item @click="handleExportStudent(item)">
                <v-list-item-icon class="mr-2">
                    <v-icon color="green" size="20">mdi-export</v-icon>
                  </v-list-item-icon>
                  <v-list-item-title>Xuất file DSSV</v-list-item-title>
              </v-list-item>

              <v-list-item color="teal" @click="handleClick(item)">
                <v-list-item-icon class="mr-2">
                    <v-icon color="red" size="20">mdi-trash-can</v-icon>
                  </v-list-item-icon>
                  <v-list-item-title>Xóa</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </BaseTable>
    </div>

    <!-- 3. THANH PHÂN TRANG & NÚT XUẤT DANH SÁCH -->
    <div
      class="bottom-bar d-flex align-center justify-space-between flex-nowrap py-2 px-3 mt-auto bg-white border-top"
    >
      <v-btn
        disabled
        elevation="0"
        class="text-capitalize rounded px-4 font-weight-medium grey lighten-2 grey--text text--darken-1"
        style="color: rgba(0, 0, 0, 0.38) !important; background-color: #e0e0e0 !important;"
        @click="exportList"
      >
        <v-icon left small color="grey darken-1">mdi-microsoft-excel</v-icon> XUẤT DANH SÁCH CHO GIẢNG VIÊN
      </v-btn>

      <div class="d-flex align-center gap-2 flex-nowrap">
        <v-select
          v-model="itemsPerPage"
          :items="[10, 20, 50, 100]"
          label="Bản ghi"
          dense
          outlined
          hide-details
          :menu-props="{ top: true, offsetY: true, zIndex: 9999 }"
          class="pagination-input"
          style="width: 85px"
          @change="onItemsPerPageChange"
        ></v-select>

        <v-text-field
          v-model.number="pageInput"
          label="Trang"
          dense
          outlined
          hide-details
          class="pagination-input text-center"
          style="width: 65px"
          @keyup.enter="goToPage"
        ></v-text-field>

        <v-btn
          color="#a2212b"
          dark
          small
          class="text-capitalize px-3 rounded-sm elevation-0"
          style="height: 36px"
          @click="goToPage"
          >Đi</v-btn
        >

        <div class="d-flex align-center gap-1">
          <v-btn icon small :disabled="page <= 1" @click="changePage(page - 1)"
            ><v-icon>mdi-chevron-left</v-icon></v-btn
          >
          <template v-for="p in totalPages">
            <v-btn
              v-if="p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)"
              :key="p"
              small
              :color="page === p ? '#a2212b' : ''"
              :dark="page === p"
              :outlined="page !== p"
              class="min-w-0 pa-0 rounded-sm elevation-0 mx-1"
              style="width: 28px; height: 28px"
              @click="changePage(p)"
            >
              {{ p }}
            </v-btn>
            <span v-else-if="p === page - 2 || p === page + 2" :key="'dots-' + p">...</span>
          </template>
          <v-btn icon small :disabled="page >= totalPages" @click="changePage(page + 1)"
            ><v-icon>mdi-chevron-right</v-icon></v-btn
          >
        </div>
      </div>
    </div>

    <!-- POPUP THÊM THANH TOÁN THEO CÔNG VIỆC CHO GV -->
    <v-dialog v-model="isAddModalOpen" max-width="950px" persistent>
      <v-card class="pa-0 overflow-hidden">
        <!-- Tiêu đề popup nền đỏ -->
        <v-card-title class="px-4 py-3" style="background-color: #a2212b; color: white;">
          <span class="text-h6 font-weight-bold">Thêm thanh toán theo công việc cho GV</span>
          <v-spacer></v-spacer>
          <v-btn icon dark small @click="closeAddModal"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>

        <v-card-text class="pa-4">
          <!-- Chọn Hội đồng bảo vệ -->
          <div class="mb-3">
            <v-autocomplete
              v-model="addForm.examSessionId"
              :items="examSessionOptions"
              item-text="text"
              item-value="value"
              label="Hội đồng bảo vệ (*)"
              outlined
              dense
              clearable
              :menu-props="{ offsetY: true, zIndex: 9999 }"
              @change="handleSelectExamSession"
            ></v-autocomplete>
          </div>

          <!-- Ô Thông tin thanh toán / Chọn file -->
          <div class="mb-3">
            <v-file-input
              v-model="addForm.file"
              placeholder="Thông tin thanh toán"
              outlined
              dense
              hide-details
              prepend-icon=""
              append-icon="mdi-file-document-outline"
              class="custom-file-input"
              @change="handleFileChange"
            ></v-file-input>
          </div>

          <!-- Bảng chi tiết giảng viên & công việc trong popup -->
          <v-data-table
            :headers="addModalHeaders"
            :items="teacherJobDetails"
            hide-default-footer
            class="elevation-1 border"
            no-data-text="No data available"
          >
            <!-- STT -->
            <template #[`item.stt`]="{ index }">
              <span>{{ index + 1 }}</span>
            </template>

            <!-- Giảng viên -->
            <template #[`item.teacherName`]="{ item }">
              <span>{{ item.teacherName || item.teacher?.fullName || item.teacher?.name || '---' }}</span>
            </template>

            <!-- Số tín chỉ -->
            <template #[`item.creditHours`]="{ item }">
              <v-text-field
                v-model="item.creditHours"
                dense
                solo
                flat
                readonly
                hide-details
                class="readonly-underline-input"
              ></v-text-field>
            </template>

            <!-- Hướng dẫn DATN -->
            <template #[`item.support`]="{ item }">
              <v-text-field
                v-model="item.supportQuantity"
                dense
                solo
                flat
                readonly
                hide-details
                class="readonly-underline-input"
              ></v-text-field>
            </template>

            <!-- Tham gia HĐ chấm TN -->
            <template #[`item.join`]="{ item }">
              <v-text-field
                v-model="item.joinQuantity"
                dense
                solo
                flat
                readonly
                hide-details
                class="readonly-underline-input"
              ></v-text-field>
            </template>

            <!-- Phản biện DATN -->
            <template #[`item.rebuttal`]="{ item }">
              <v-text-field
                v-model="item.rebuttalQuantity"
                dense
                solo
                flat
                readonly
                hide-details
                class="readonly-underline-input"
              ></v-text-field>
            </template>

            <!-- Lưu trú -->
            <template #[`item.residence`]="{ item }">
              <v-text-field
                v-model="item.residenceQuantity"
                dense
                solo
                flat
                readonly
                hide-details
                class="readonly-underline-input"
              ></v-text-field>
            </template>

            <!-- Sinh viên -->
            <template #[`item.students`]="{ item }">
              <span class="text-caption" style="white-space: pre-line; line-height: 1.4;">{{ item.studentNames || '---' }}</span>
            </template>
          </v-data-table>
        </v-card-text>

        <v-card-actions class="px-4 pb-3 justify-end">
          <v-btn text class="text-capitalize" @click="closeAddModal">
            Đóng <v-icon right small>mdi-close</v-icon>
          </v-btn>
          <v-btn
            color="#a2212b"
            dark
            class="text-capitalize px-4"
            :loading="isSubmitting"
            @click="savePayment"
          >
            Lưu <v-icon right small>mdi-content-save</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- POPUP XÁC NHẬN ĐỔI TRẠNG THÁI -->
    <v-dialog v-model="isConfirmStatusOpen" max-width="500px" persistent>
      <v-card class="pa-0 overflow-hidden">
        <v-card-title class="px-4 py-3" style="background-color: #a2212b; color: white;">
          <span class="text-h6 font-weight-bold">Xác nhận</span>
          <v-spacer></v-spacer>
          <v-btn icon dark small @click="isConfirmStatusOpen = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>

        <v-card-text class="pa-4 pt-5 text-body-1">
          Bạn có chắc chắn muốn đổi trạng thái từ 
          <span :style="{ color: pendingStatusColor, fontWeight: 'bold' }">{{ pendingStatusText }}</span> 
          sang 
          <span :style="{ color: targetStatusColor, fontWeight: 'bold' }">{{ targetStatusText }}</span> 
          không?
        </v-card-text>

        <v-card-actions class="px-4 pb-3 justify-end">
          <v-btn text class="text-capitalize" @click="isConfirmStatusOpen = false">
            Đóng <v-icon right small>mdi-close</v-icon>
          </v-btn>
          <v-btn
            color="#a2212b"
            dark
            class="text-capitalize px-4"
            @click="confirmUpdateStatus"
          >
            Xác Nhận <v-icon right small>mdi-check</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- POPUP CHI TIẾT QUYẾT ĐỊNH THANH TOÁN -->
    <v-dialog v-model="isDetailModalOpen" max-width="950px" persistent>
      <v-card class="pa-0 overflow-hidden">
        <!-- Tiêu đề nền đỏ -->
        <v-card-title class="px-4 py-3" style="background-color: #a2212b; color: white;">
          <span class="text-h6 font-weight-bold">Chi tiết quyết định thanh toán</span>
          <v-spacer></v-spacer>
          <v-btn icon dark small @click="isDetailModalOpen = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>

        <v-card-text class="pa-4">
          <!-- Thông tin tổng quan phía trên -->
          <div class="mb-4 text-body-1">
            <div class="mb-1">Hội đồng bảo vệ: <span class="font-weight-bold red--text text--darken-2">{{ detailData.examSessionName }}</span></div>
            <div class="mb-1">Hình thức đào tạo: <span class="font-weight-bold red--text text--darken-2">{{ detailData.trainingType || 'Ngắn hạn' }}</span></div>
            <div>Đợt: <span class="font-weight-bold red--text text--darken-2">{{ detailData.batchName || 'Đợt 20' }}</span></div>
          </div>

          <v-divider class="mb-4"></v-divider>

          <!-- Bảng danh sách chi tiết giảng viên -->
          <v-data-table
            :headers="detailModalHeaders"
            :items="detailTeacherList"
            hide-default-footer
            class="elevation-1 border"
            no-data-text="Không có dữ liệu"
          >
            <!-- STT -->
            <template #[`item.stt`]="{ index }">
              <span>{{ index + 1 }}</span>
            </template>

            <!-- Giảng viên -->
            <template #[`item.teacherName`]="{ item }">
              <span>{{ item.teacherName || item.teacher?.fullName || item.teacher?.name || '---' }}</span>
            </template>

            <!-- Số tín chỉ -->
            <template #[`item.creditHours`]="{ item }">
              <div>Tín chỉ</div>
              <div class="font-weight-bold">{{ item.creditHours || 0 }}</div>
            </template>

            <!-- Hướng dẫn DATN -->
            <template #[`item.support`]="{ item }">
              <div>Sinh viên</div>
              <div class="font-weight-bold">{{ item.supportQuantity || 0 }}</div>
            </template>

            <!-- Tham gia HĐ chấm TN -->
            <template #[`item.join`]="{ item }">
              <div>Sinh viên</div>
              <div class="font-weight-bold">{{ item.joinQuantity || 0 }}</div>
            </template>

            <!-- Phản biện DATN -->
            <template #[`item.rebuttal`]="{ item }">
              <div>Sinh viên</div>
              <div class="font-weight-bold">{{ item.rebuttalQuantity || 0 }}</div>
            </template>

            <!-- Lưu trú -->
            <template #[`item.residence`]="{ item }">
              <div>Sinh viên</div>
              <div class="font-weight-bold">{{ item.residenceQuantity || 0 }}</div>
            </template>
          </v-data-table>
        </v-card-text>

        <v-card-actions class="px-4 pb-3 justify-end">
          <v-btn text class="text-capitalize" @click="isDetailModalOpen = false">
            Đóng <v-icon right small>mdi-close</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <base-confirm-modal
            :open="openDelete"
            @OK="handleDelete"
            @toggle="openDelete = !openDelete"
        >
            <template #content>
                <div>
                    Xác nhận xóa
                    <span class="primary--text font-weight-bold">{{ selectedItem?.name }}</span>
                </div>
            </template>
        </base-confirm-modal>
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import paymentTeacherServices from '~/services/redefend/paymentTeacherServices'

export default {
  name: 'PaymentTeacherView',
  components: { BaseTable },
  middleware: 'authenticated',
  data() {
    return {
      openDelete: false,
      isDetailModalOpen: false,
      detailData: {
        examSessionName: '',
        trainingType: '',
        batchName: ''
      },
      detailTeacherList: [],
      
      detailModalHeaders: [
        { text: 'STT', value: 'stt', align: 'center', width: '60px', sortable: false },
        { text: 'Giảng viên', value: 'teacherName', sortable: false, width: '150px' },
        { text: 'Số tín chỉ', value: 'creditHours', align: 'center', width: '100px', sortable: false },
        { text: 'Hướng dẫn DATN', value: 'support', align: 'center', width: '110px', sortable: false },
        { text: 'Tham gia HĐ chấm TN', value: 'join', align: 'center', width: '110px', sortable: false },
        { text: 'Phản biện DATN', value: 'rebuttal', align: 'center', width: '110px', sortable: false },
        { text: 'Lưu trú', value: 'residence', align: 'center', width: '100px', sortable: false },
      ],

      isConfirmStatusOpen: false,
      pendingItem: null,
      targetNewStatus: '',
      isAddModalOpen: false,
      addForm: {
        examSessionId: null,
        file: null,
      },
      teacherJobDetails: [],
      isSubmitting: false,

      page: 1,
      pageInput: 1,
      itemsPerPage: 50,
      totalRecord: 0,
      isLoading: false,

      statusList: [
        { value: "COMPLETED", text: "Đã gửi", color: "green" },
        { value: "PENDING", text: "Chưa gửi", color: "primary" },
        { value: "CANCELLED", text: "Hủy", color: "warning" },
      ],

      filters: {
        search: '',
        teacherId: null,
        examSessionId: null,
        paymentSendStatus: null,
      },
      appliedFilters: {
        search: '',
        teacherId: null,
        examSessionId: null,
        paymentSendStatus: null,
      },

      headers: [
        { value: 'stt', text: 'STT', align: 'center', sortable: false, width: '60px' },
        { value: 'examSessionName', text: 'Hội đồng thanh toán', sortable: false, width: '180px' },
        { value: 'creditHours', text: 'Số tín chỉ học tập', align: 'center', sortable: false, width: '130px' },
        { value: 'teachersName', text: 'Giảng viên', sortable: false, width: '220px' },
        { value: 'subjectName', text: 'Tên học phần', sortable: false, width: '180px' },
        { value: 'filePayment', text: 'File thanh toán', align: 'center', sortable: false, width: '110px' },
        { value: 'totalFee', text: 'Tổng phí', align: 'right', sortable: false, width: '140px' },
        { value: 'paymentSendStatus', text: 'Trạng thái', align: 'center', sortable: false, width: '130px' },
        { value: 'actions', text: 'Chức năng', align: 'center', sortable: false, width: '90px' },
      ],

      addModalHeaders: [
        { text: 'STT', value: 'stt', align: 'center', width: '60px', sortable: false },
        { text: 'Giảng viên', value: 'teacherName', sortable: false, width: '150px' },
        { text: 'Số tín chỉ', value: 'creditHours', align: 'center', width: '100px', sortable: false },
        { text: 'Hướng dẫn DATN', value: 'support', align: 'center', width: '110px', sortable: false },
        { text: 'Tham gia HĐ chấm TN', value: 'join', align: 'center', width: '110px', sortable: false },
        { text: 'Phản biện DATN', value: 'rebuttal', align: 'center', width: '110px', sortable: false },
        { text: 'Lưu trú', value: 'residence', align: 'center', width: '100px', sortable: false },
        { text: 'Sinh viên', value: 'students', sortable: false, width: '150px' },
      ],

      list: [],
      teacherList: [],
      examSessionList: [],
    }
  },
  computed: {
    teacherOptions() {
      const items = Array.isArray(this.teacherList) ? this.teacherList : []
      return items.map((item) => ({
        text: item.fullName || item.name || item.code,
        value: item.id,
      }))
    },
    examSessionOptions() {
      const items = Array.isArray(this.examSessionList) ? this.examSessionList : []
      return items.map((item) => ({
        text: item.examClass || item.name || item.code,
        value: item.id,
      }))
    },
    totalPages() {
      const total = Math.ceil(this.totalRecord / this.itemsPerPage)
      return total > 0 ? total : 1
    },
    pendingStatusText() {
      if (!this.pendingItem) return ''
      return this.getStatusName(this.pendingItem.paymentSendStatus)
    },
    targetStatusText() {
      return this.getStatusName(this.targetNewStatus)
    },
    pendingStatusColor() {
      if (!this.pendingItem) return ''
      return this.getStatusColor(this.pendingItem.paymentSendStatus)
    },
    targetStatusColor() {
      return this.getStatusColor(this.targetNewStatus)
    },
  },
  async mounted() {
    await this.fetchFilterData()
    await this.fetchData()
  },
  methods: {
    getStatusName(statusKey) {
      const found = (this.statusList || []).find(s => s.value === statusKey)
      return found ? found.text : (statusKey || 'Chưa thanh toán')
    },

    getStatusColor(statusKey) {
      if (statusKey === 'COMPLETED') return 'green'
      if (statusKey === 'PENDING') return '#a62229'
      if (statusKey === 'CANCELLED') return 'grey'
      const found = (this.statusList || []).find(s => s.value === statusKey)
      return found ? found.color : 'warning'
    },

    formatCurrency(val) {
      if (val === null || val === undefined) return '0đ'
      return `${Number(val).toLocaleString('en-US')}đ`
    },

    async fetchFilterData() {
      try {
        const [teacherRes, sessionRes] = await Promise.all([
          paymentTeacherServices.getTeacherList({ 
            status: 'ACTIVE', 
            channel: 'CMS', 
            transid: 'f808f7cc-a95b-43f6-a1df-a186fe581693' 
          }),
          paymentTeacherServices.getExamSessionList({ 
            status: 'ACTIVE', 
            scoreStatus: 'SCOREBOARD_AVAILABLE', 
            examSessionStatus: 'FINALIZED', 
            channel: 'CMS', 
            transid: '5b32afbe-39a1-4068-9f95-c23e4f4acbae' 
          })
        ])

        const parseData = (res) => {
          const raw = res?.data !== undefined ? res.data : res
          return raw?.data?.items || raw?.data?.objects || raw?.data || raw?.items || raw?.objects || (Array.isArray(raw) ? raw : [])
        }

        this.teacherList = parseData(teacherRes)
        this.examSessionList = parseData(sessionRes)
      } catch (err) {
        console.error('Lỗi tải dữ liệu danh mục bộ lọc:', err)
      }
    },

    async fetchData() {
      try {
        this.isLoading = true
        const params = {
          pageIndex: this.page,
          pageSize: this.itemsPerPage,
          search: this.appliedFilters.search || undefined,
          examSessionId: this.appliedFilters.examSessionId || undefined,
          paymentSendStatus: this.appliedFilters.paymentSendStatus || undefined,
          channel: 'CMS',
          transid: 'f97ee128-4406-4342-9874-dc5527aa3a20'
        }

        const res = await paymentTeacherServices.getList(params)
        
        const responseWrapper = res?.data !== undefined ? res.data : res
        const pageData = responseWrapper?.data !== undefined ? responseWrapper.data : responseWrapper
        
        let items = []
        if (Array.isArray(pageData?.data)) {
          items = pageData.data
        } else if (Array.isArray(pageData)) {
          items = pageData
        } else if (Array.isArray(pageData?.items)) {
          items = pageData.items
        }

        // Lấy và khóa chặt tổng số bản ghi thực tế từ server
        const apiTotal = pageData?.total !== undefined ? pageData.total : 
                         (pageData?.totalElements !== undefined ? pageData.totalElements : 
                         (pageData?.totalRecords !== undefined ? pageData.totalRecords : 
                         (pageData?.totalRecord !== undefined ? pageData.totalRecord : 
                         (responseWrapper?.total !== undefined ? responseWrapper.total : null))))

        if (apiTotal !== null && apiTotal !== undefined) {
          this.totalRecord = apiTotal
        } else if (this.totalRecord === 0 || this.totalRecord < items.length) {
          this.totalRecord = items.length
        }

        const mappedList = items.map((item) => {
          let teachersStr = '---'
          let teacherIds = []
          if (Array.isArray(item.paymentTeacherDetails) && item.paymentTeacherDetails.length > 0) {
            teachersStr = item.paymentTeacherDetails
              .map(detail => detail.teacher?.fullName || detail.teacher?.name)
              .filter(Boolean)
              .join(', ')
            
            teacherIds = item.paymentTeacherDetails
              .map(detail => detail.teacher?.id)
              .filter(Boolean)
          }

          return {
            id: item.id,
            teacherIds,
            examSessionName: item.examSession?.examClass || '---',
            creditHours: item.examSession?.term?.creditHours !== undefined ? item.examSession?.term?.creditHours : '---',
            teachersName: teachersStr,
            subjectName: item.examSession?.term?.name || '---',
            filePayment: item.fileName || null,
            totalFee: item.totalAmount !== undefined ? item.totalAmount : 0,
            paymentSendStatus: item.paymentSendStatus || 'PENDING',
            examSessionId: item.examSessionId || item.examSession?.id
          }
        })

        let finalRows = mappedList
        if (this.appliedFilters.teacherId) {
          const selectedTId = Number(this.appliedFilters.teacherId)
          finalRows = finalRows.filter(row => row.teacherIds.includes(selectedTId))
        }

        this.list = finalRows
        // XÓA HOẶC COMMENT DÒNG DƯỚI ĐÂY ĐỂ KHÔNG BỊ GHI ĐÈ LẠI TỔNG SỐ BẢN GHI:
        // this.totalRecord = this.list.length 
      } catch (err) {
        console.error('Lỗi khi tải danh sách thanh toán giảng viên:', err)
        this.list = []
        this.totalRecord = 0
      } finally {
        this.isLoading = false
      }
    },

    search() {
      this.appliedFilters = { ...this.filters }
      this.page = 1
      this.pageInput = 1
      this.fetchData()
    },

    resetFilters() {
      this.filters = {
        search: '',
        teacherId: null,
        examSessionId: null,
        paymentSendStatus: null,
      }
      this.appliedFilters = { ...this.filters }
      this.page = 1
      this.pageInput = 1
      this.fetchData()
    },

    changePage(p) {
      if (p >= 1 && p <= this.totalPages) {
        this.page = p
        this.pageInput = p
        this.fetchData()
      }
    },

    goToPage() {
      let target = parseInt(this.pageInput, 10)
      if (isNaN(target) || target < 1) target = 1
      if (target > this.totalPages) target = this.totalPages
      this.page = target
      this.pageInput = target
      this.fetchData()
    },

    onItemsPerPageChange(val) {
      this.itemsPerPage = Number(val) || 50
      this.page = 1
      this.pageInput = 1
      this.fetchData()
    },

    editItem(item) {},
    deleteItem(item) {},
    downloadFilePayment(item) {},
    exportList() {},

    async handleExportStudent(item) {
      try {
        this.loadingExportStudent = true;
        const res = await paymentTeacherServices.exportStudentPaid(item.id);
        if (res.success) this.$download(res?.data?.url);
      } catch (error) {
        console.error(error);
      } finally {
        this.loadingExportStudent = false;
      }
    },

    updateItemStatus(item, newStatus) {
      this.pendingItem = item
      this.targetNewStatus = newStatus
      this.isConfirmStatusOpen = true
    },

    async confirmUpdateStatus() {
      if (!this.pendingItem) return
      const item = this.pendingItem
      const newStatus = this.targetNewStatus

      try {
        const res = await paymentTeacherServices.changeStatus({ 
          id: item.id, 
          paymentSendStatus: newStatus 
        })
        
        const responseWrapper = res?.data !== undefined ? res.data : res
        const errorCode = responseWrapper?.error?.code ?? responseWrapper?.code

        if (res?.success === true && !responseWrapper?.error &&
          (errorCode === undefined || errorCode === null || Number(errorCode) === 0) &&
          responseWrapper?.success !== false) {
          this.isConfirmStatusOpen = false

          await this.fetchData()
          const updatedItem = this.list.find(row => String(row.id) === String(item.id))
          if (updatedItem?.paymentSendStatus === newStatus && typeof this.$showSuccess === 'function') {
            this.$showSuccess('Cập nhật trạng thái thành công')
          } else if (typeof this.$showWarning === 'function') {
            this.$showWarning('Backend chưa xác nhận trạng thái mới; danh sách vẫn giữ trạng thái đã lưu.')
          }
        } else {
          const errorMessage = responseWrapper?.error?.message || responseWrapper?.message ||
            res?.error?.message || res?.message
          if (typeof this.$showError === 'function') {
            this.$showError(errorMessage || 'Backend từ chối cập nhật trạng thái. Trạng thái cũ vẫn được giữ nguyên.')
          }
        }
      } catch (err) {
        console.error('Lỗi cập nhật trạng thái:', err)
        const errorMessage = err?.response?.data?.error?.message ||
          err?.response?.data?.message || err?.message
        if (typeof this.$showError === 'function') {
          this.$showError(errorMessage || 'Không thể cập nhật trạng thái. Trạng thái cũ vẫn được giữ nguyên.')
        }
      } finally {
        this.pendingItem = null
      }
    },

    openAddModal() {
      this.addForm.examSessionId = null
      this.teacherJobDetails = []
      this.isAddModalOpen = true
    },

    closeAddModal() {
      this.isAddModalOpen = false
    },

    async handleSelectExamSession(sessionId) {
      if (!sessionId) {
        this.teacherJobDetails = []
        return
      }
      try {
        const res = await paymentTeacherServices.getTeachers({ examSessionId: sessionId })
        const raw = res?.data !== undefined ? res.data : res
        const data = raw?.data !== undefined ? raw.data : raw
        const items = Array.isArray(data)
          ? data
          : data?.items || data?.objects || data?.data || []

        this.teacherJobDetails = items.map(item => {
          const counts = item.countStudentByReAssessmentType || {}

          let studentNamesStr = '---'
          if (Array.isArray(item.studentAssignTeachers) && item.studentAssignTeachers.length > 0) {
            studentNamesStr = item.studentAssignTeachers.map(st => {
              const studentName = st.student?.fullName || ''
              let typeLabel = ''
              if (st.reAssessmentType === 'SUPPORT') typeLabel = 'Hướng dẫn DATN'
              else if (st.reAssessmentType === 'REBUTTAL') typeLabel = 'Phản biện DATN'
              else if (st.reAssessmentType === 'JOIN') typeLabel = 'Tham gia HĐ chấm TN'
              else if (st.reAssessmentType === 'RESIDENCE') typeLabel = 'Lưu trú'

              return typeLabel ? `${studentName} (${typeLabel})` : studentName
            }).filter(Boolean).join('\n')
          }

          const teacher = item.teacher && typeof item.teacher === 'object'
            ? item.teacher
            : item.studentAssignTeachers?.find(assignment => assignment.teacher)?.teacher || null
          const teacherName = teacher?.fullName || item.teacherName || item.fullName ||
            item.name || teacher?.name || (typeof item.teacher === 'string' ? item.teacher : '')
          const matchingTeachers = this.teacherList.filter(knownTeacher => {
            const knownName = knownTeacher.fullName || knownTeacher.name
            return typeof knownName === 'string' && typeof teacherName === 'string' &&
              knownName.trim().toLocaleLowerCase() === teacherName.trim().toLocaleLowerCase()
          })
          const matchedTeacher = matchingTeachers.length === 1 ? matchingTeachers[0] : null
          const teacherId = teacher?.id ?? item.teacherId ?? item.studentAssignTeachers?.find(
            assignment => assignment.teacherId !== null && assignment.teacherId !== undefined
          )?.teacherId ?? matchedTeacher?.id

          return {
            teacherId,
            teacher,
            teacherName: teacherName || matchedTeacher?.fullName || matchedTeacher?.name || '',
            creditHours: item.creditSupport !== undefined ? item.creditSupport : (item.examSession?.term?.creditHours || 0),
            supportQuantity: counts.SUPPORT !== undefined ? counts.SUPPORT : 0,
            joinQuantity: counts.JOIN !== undefined ? counts.JOIN : 0,
            rebuttalQuantity: counts.REBUTTAL !== undefined ? counts.REBUTTAL : 0,
            residenceQuantity: counts.RESIDENCE !== undefined ? counts.RESIDENCE : 0,
            studentNames: studentNamesStr
          }
        })
      } catch (err) {
        console.error('Lỗi lấy danh sách giảng viên:', err)
        this.teacherJobDetails = []
      }
    },

    async savePayment() {
      if (!this.addForm.examSessionId) {
        alert('Vui lòng chọn hội đồng bảo vệ!')
        return
      }
      const teacherWithoutId = this.teacherJobDetails.find(item => item.teacherId === null || item.teacherId === undefined)
      if (teacherWithoutId) {
        alert(`Không xác định được giảng viên "${teacherWithoutId.teacherName || 'chưa rõ tên'}". Vui lòng tải lại danh sách hoặc kiểm tra dữ liệu.`)
        return
      }
      try {
        this.isSubmitting = true
        
        const paymentTeacherJobRequests = this.teacherJobDetails.map(item => {
          const teacherId = item.teacherId
          return {
            teacherId,
            jobs: [
              {
                id: teacherId,
                credit: Number(item.creditHours) || 0,
                quantity: Number(item.supportQuantity) || 0,
                type: 'SUPPORT',
              },
              {
                id: teacherId,
                credit: 0,
                quantity: Number(item.joinQuantity) || 0,
                type: 'JOIN',
              },
              {
                id: teacherId,
                credit: 0,
                quantity: Number(item.rebuttalQuantity) || 0,
                type: 'REBUTTAL',
              },
              {
                id: teacherId,
                credit: 0,
                quantity: Number(item.residenceQuantity) || 0,
                type: 'RESIDENCE',
              },
            ],
          }
        })

        const payload = {
          examSessionId: this.addForm.examSessionId,
          paymentTeacherJobRequests,
          channel: 'CMS',
          transid: 'b5bc9574-5864-44c5-a63f-c0c5b1dd85b4'
        }

        const res = await paymentTeacherServices.add(payload)
        const responseWrapper = res?.data !== undefined ? res.data : res
        const errorCode = responseWrapper?.error?.code ?? responseWrapper?.code
        const hasBackendError = errorCode !== undefined && errorCode !== null && Number(errorCode) !== 0

        if (res?.success === true && !hasBackendError) {
          if (typeof this.$showSuccess === 'function') {
            this.$showSuccess('Lưu thanh toán giảng viên thành công')
          }
          this.isAddModalOpen = false
          await this.fetchData()
        }
      } catch (err) {
        // Keep the dialog open so the user can retry.
      } finally {
        this.isSubmitting = false
      }
    },

    async viewDetail(item) {
      try {
        const examSessionId = item.examSessionId || item.examSession?.id
        
        this.detailData = {
          examSessionName: item.examSessionName || item.examSession?.examClass || '---',
          trainingType: item.trainingType || 'Ngắn hạn',
          batchName: item.batchName || 'Đợt 20'
        }

        if (examSessionId) {
          const res = await paymentTeacherServices.getTeachers({ examSessionId })
          const raw = res?.data !== undefined ? res.data : res
          const data = raw?.data !== undefined ? raw.data : raw
          const items = Array.isArray(data) ? data : data?.items || data?.objects || data?.data || []

          this.detailTeacherList = items.map(tItem => {
            const counts = tItem.countStudentByReAssessmentType || {}

            const teacher = tItem.teacher && typeof tItem.teacher === 'object'
              ? tItem.teacher
              : tItem.studentAssignTeachers?.find(assignment => assignment.teacher)?.teacher || null
            
            const teacherName = teacher?.fullName || tItem.teacherName || tItem.fullName ||
              tItem.name || teacher?.name || (typeof tItem.teacher === 'string' ? tItem.teacher : '---')

            return {
              teacherName,
              creditHours: tItem.creditSupport !== undefined ? tItem.creditSupport : (tItem.examSession?.term?.creditHours || 0),
              supportQuantity: counts.SUPPORT !== undefined ? counts.SUPPORT : 0,
              joinQuantity: counts.JOIN !== undefined ? counts.JOIN : 0,
              rebuttalQuantity: counts.REBUTTAL !== undefined ? counts.REBUTTAL : 0,
              residenceQuantity: counts.RESIDENCE !== undefined ? counts.RESIDENCE : 0,
            }
          })
        } else {
          this.detailTeacherList = []
        }

        this.isDetailModalOpen = true
      } catch (err) {
        console.error('Lỗi lấy chi tiết giảng viên:', err)
        this.detailTeacherList = []
        this.isDetailModalOpen = true
      }
    },

    handleClick(item) {
      this.selectedItem = item;
      this.openDelete = true;
    },

    async handleDelete() {
      const res = await paymentTeacherServices.delete(this.selectedItem.id);
      if (res.success) {
        this.$showSuccess("Xoá thành công hội đồng thanh toán GV");
        await this.fetchData();
      }
      this.openDelete = false;
    },
  }
}
</script>

<style scoped>
.text-red-bold { color: #a62229 !important; }
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.top-filter-bar { flex-shrink: 0; }
.filter-item { flex-grow: 1; flex-shrink: 1; }
.search-input { min-width: 160px; max-width: 200px; }
.select-md { min-width: 150px; max-width: 180px; }
.action-btn { height: 40px !important; min-height: 40px !important; }
.custom-outlined-input >>> .v-input__control { min-height: 38px !important; }
.custom-outlined-input >>> fieldset { border-color: #ccc !important; border-radius: 4px !important; }
.border-top { border-top: 1px solid #e0e0e0; }
.bottom-bar { flex-shrink: 0; background-color: #ffffff; overflow-x: auto; }
.pagination-input >>> .v-input__control { min-height: 36px !important; }
.cursor-pointer { cursor: pointer; }

.table-scroll-container {
  overflow-x: auto;
  width: 100%;
}
.table-scroll-container >>> th {
  position: sticky !important;
  top: 0;
  z-index: 2;
  background-color: #f5f5f5 !important;
}
/* Định dạng ô hiển thị gạch chân, không cho chỉnh sửa giống mẫu */
.readonly-underline-input >>> .v-input__control {
  min-height: 28px !important;
}
.readonly-underline-input >>> .v-input__slot {
  background: transparent !important;
  box-shadow: none !important;
  border-bottom: 1px dashed #bdbdbd !important;
  border-radius: 0 !important;
  padding: 0 !important;
}
.readonly-underline-input >>> input {
  text-align: center;
  font-size: 13px;
  color: #424242;
  cursor: default;
}
@media (max-width: 599px) {
  .student-page { height: auto; min-height: 100vh; overflow: visible; }
}
@media (min-width: 600px) {
  .student-page { height: calc(100vh - 64px); overflow: hidden; display: flex; flex-direction: column; }
}
</style>