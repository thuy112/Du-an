<template>
  <div class="fee-teacher-page pa-3 pa-md-4 bg-white" :class="{ 'is-mobile-device': isMobileDevice }">
    <!-- TIÊU ĐỀ TRANG -->
    <div class="text-h6 font-weight-bold black--text mb-3">
      Danh sách thanh toán giảng viên theo lớp (<span class="text-red-bold">{{ totalRecords }}</span>)
    </div>

    <!-- BỘ LỌC TÌM KIẾM CỐ ĐỊNH PHÍA TRÊN -->
    <div class="filter-container mb-3 sticky-filter">
      <div class="d-flex align-center flex-wrap" style="gap: 5px; padding: 6px;">
        <v-select
          v-model="filters.teacherId"
          :items="teacherOptions"
          item-text="text"
          item-value="value"
          placeholder="Giảng viên"
          outlined
          dense
          hide-details
          clearable
          class="filter-input flex-grow-1"
          style="min-width: 160px;"
        ></v-select>

        <v-select
          v-model="filters.examId"
          :items="examOptions"
          item-text="text"
          item-value="value"
          placeholder="Đợt học lại"
          outlined
          dense
          hide-details
          clearable
          class="filter-input flex-grow-1"
          style="min-width: 150px;"
        ></v-select>

        <v-select
          v-model="filters.retakeSessionId"
          :items="sessionOptions"
          item-text="text"
          item-value="value"
          placeholder="Lớp học lại"
          outlined
          dense
          hide-details
          clearable
          class="filter-input flex-grow-1"
          style="min-width: 150px;"
        ></v-select>

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
        <template #[`item.index`]="{ index }">
          <span>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</span>
        </template>

        <!-- Cột Loại lớp -->
        <template #[`item.classType`]="{ item }">
          <v-chip
            small
            dark
            :color="getClassTypeBadge(item).color"
            class="font-weight-medium text-caption"
          >
            {{ getClassTypeBadge(item).text }}
          </v-chip>
        </template>

        <!-- Đợt học lại -->
        <template #[`item.examName`]="{ item }">
          <span>{{ item.examName || '-' }}</span>
        </template>

        <!-- Thu học phí SV -->
        <template #[`item.tuitionCoefficient`]="{ item }">
          <span>{{ item.coefficient ?? '-' }}</span>
        </template>

        <!-- Thanh toán giảng dạy -->
        <template #[`item.teacherCoefficient`]="{ item }">
          <span>{{ item.coefficientTeacher ?? '-' }}</span>
        </template>

        <!-- Số tín chỉ học phí -->
        <template #[`item.creditTuition`]="{ item }">
          <span>{{ item.creditTuition ?? '-' }}</span>
        </template>

        <!-- Giảng viên -->
        <template #[`item.teacherName`]="{ item }">
          <span>{{ item.teacherName || '-' }}</span>
        </template>

        <!-- Tên học phần -->
        <template #[`item.courseName`]="{ item }">
          <span>{{ item.courseName || '-' }}</span>
        </template>

        <!-- Tổng phí -->
        <template #[`item.totalFee`]="{ item }">
          <span>{{ formatMoney(item.totalFee) }}</span>
        </template>

        <!-- Thuế thu nhập cá nhân -->
        <template #[`item.totalTaxFee`]="{ item }">
          <span>{{ formatMoney(item.totalTaxFee) }}</span>
        </template>

        <!-- File thông tin -->
        <template #[`item.fileInform`]="{ item }">
          <v-btn
            v-if="item.fileInform"
            icon
            small
            color="#A62229"
            :href="item.fileInform"
            target="_blank"
            title="Tải xuống file thông tin"
          >
            <v-icon size="26">mdi-file-download-outline</v-icon>
          </v-btn>
          <v-btn
            v-else
            icon
            small
            disabled
            color="grey"
            title="Chưa có file thông tin"
          >
            <v-icon size="26">mdi-file-download-outline</v-icon>
          </v-btn>
        </template>

        <!-- T.T xuất giấy xác nhận -->
        <template #[`item.isExported`]="{ item }">
          <v-chip
            small
            dark
            :color="item.isExported === 1 ? '#4caf50' : '#ffae1f'"
            class="font-weight-medium text-caption"
          >
            {{ item.isExported === 1 ? 'Đã xuất' : 'Chưa xuất' }}
          </v-chip>
        </template>

        <!-- Trạng thái thanh toán -->
        <template #[`item.status`]="{ item }">
        <ChangeableStatus
            :status="item.status"
            :statusList="statusList"
            @changeStatus="(selectedItem) => handleStatusChange(item, selectedItem)"
        >
            <template #content="{ data }">
            Bạn có chắc chắn muốn đổi trạng thái từ 
            <span class="font-weight-bold red--text">{{ getStatusText(item.status) }}</span> sang 
            <span class="font-weight-bold red--text">{{ data.text }}</span> không?
            </template>
        </ChangeableStatus>
        </template>

        <!-- Cột Chức năng -->
        <template #[`item.actions`]="{ item }">
        <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" v-on="on">
                <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
            </template>
            <v-list dense>
            <!-- Xem chi tiết -->
            <v-list-item @click="viewDetail(item)">
                <v-list-item-icon class="mr-2">
                <v-icon small color="primary">mdi-eye</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Chi tiết</v-list-item-title>
            </v-list-item>

            <!-- Cập nhật file -->
            <v-list-item @click="openUpdateFileDialog(item)">
                <v-list-item-icon class="mr-2">
                <v-icon small color="error">mdi-file-upload</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Cập nhật file</v-list-item-title>
            </v-list-item>
            </v-list>
        </v-menu>
        </template>
      </BaseTable>
    </div>

    <!-- THANH BOTTOM ACTIONS & PHÂN TRANG CỐ ĐỊNH PHÍA DƯỚI -->
    <div class="pagination-bottom-container mt-4 pt-3 d-flex align-center justify-space-between flex-wrap gap-3.sticky-bottom-bar border-top">
      <div class="d-flex align-center" style="gap: 8px;">
        <!-- Nút xuất giấy xác nhận màu xám, không bấm được, bo góc nhỏ -->
        <v-btn disabled color="grey lighten-3" class="text-dark text-none font-weight-medium rounded-sm text-nowrap px-2" height="28" width="286" elevation="0" style="font-size: 12px; border-radius: 4px !important;">
          <v-icon left x-small color="grey darken-2">mdi-export</v-icon>
          XUẤT GIẤY XÁC NHẬN THANH TOÁN (A5)
        </v-btn>

        <!-- Nút xuất file danh sách thanh toán, bo góc nhỏ -->
        <v-btn color="#4caf50" dark class="text-none font-weight-medium rounded-sm text-nowrap px-2" height="28" width="286" elevation="0" style="font-size: 12px; border-radius: 4px !important;" @click="exportExcel">
          <v-icon left x-small>mdi-export</v-icon>
          XUẤT FILE DANH SÁCH THANH TOÁN
        </v-btn>
      </div>

      <!-- Cụm phân trang phía bên phải -->
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

        <!-- Hiển thị danh sách trang linh hoạt 1, 2, 3... -->
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

    <!-- POPUP XÁC NHẬN ĐỔI TRẠNG THÁI -->
    <v-dialog v-model="confirmDialog" max-width="500px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="headline error-color white--text py-3 px-4" style="background-color: #A2212B; color: white;">
          Xác nhận
          <v-spacer></v-spacer>
          <v-icon dark @click="closeConfirmDialog">mdi-close</v-icon>
        </v-card-title>
        <v-card-text class="py-4 text-body-1 black--text">
          Bạn có chắc chắn muốn đổi trạng thái từ 
          <span class="font-weight-bold red--text">{{ getStatusText(pendingStatusChange.oldStatus) }}</span> sang 
          <span class="font-weight-bold red--text">{{ getStatusText(pendingStatusChange.newStatus) }}</span> không?
        </v-card-text>
        <v-card-actions class="px-4 pb-3">
          <v-spacer></v-spacer>
          <v-btn text class="text-none px-4" @click="closeConfirmDialog">
            Đóng <v-icon right small>mdi-close</v-icon>
          </v-btn>
          <v-btn color="#A2212B" dark depressed class="text-none px-4" @click="executeStatusUpdate">
            Xác Nhận
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- THÔNG BÁO THÀNH CÔNG (SNACKBAR XANH LÁ) -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" top timeout="3000">
      <v-icon left dark>mdi-check-circle</v-icon>
      {{ snackbar.text }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar.show = false">
          <v-icon dark>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Modal Chi Tiết -->
    <v-dialog v-model="detailDialog" max-width="700px">
    <v-card class="pa-0">
        <!-- Header chuẩn màu đỏ Bách Khoa #a2212b -->
        <v-card-title class="white--text font-weight-bold py-3 px-4" style="background-color: #a2212b !important;">
        Chi tiết thanh toán GV theo lớp học lại
        <v-spacer></v-spacer>
        <v-icon dark class="cursor-pointer" @click="detailDialog = false">mdi-close</v-icon>
        </v-card-title>
        <v-card-text v-if="detailData" class="pa-6">
        <div class="subtitle-1 error--text font-weight-bold mb-4">Thông tin thanh toán giảng viên</div>
        
        <v-row dense>
            <v-col cols="6" class="py-1"><strong>Tên giảng viên:</strong> <span class="error--text font-weight-medium">{{ detailData.teacherName || detailData.teachername || detailData.fullName }}</span></v-col>
            <v-col cols="6" class="py-1"><strong>Mã lớp học lại:</strong> <span class="error--text font-weight-medium">{{ detailData.classCode || detailData.classcode || detailData.code }}</span></v-col>
            <v-col cols="6" class="py-1"><strong>Loại lớp:</strong> <span class="error--text font-weight-medium">{{ detailData.classType || detailData.classtype || detailData.type }}</span></v-col>
            <v-col cols="6" class="py-1"><strong>Đợt học lại:</strong> <span class="error--text font-weight-medium">{{ detailData.semester || detailData.dotHocLai }}</span></v-col>
            <v-col cols="12" class="py-1"><strong>Tên học phần:</strong> <span class="error--text font-weight-medium">{{ detailData.subjectName || detailData.subjectname }}</span></v-col>
            <v-col cols="6" class="py-1"><strong>Định mức:</strong> <span class="error--text font-weight-medium">{{ detailData.norm || detailData.dinhMuc }} đ</span></v-col>
            <v-col cols="6" class="py-1"><strong>Số tín chỉ học phí:</strong> <span class="error--text font-weight-medium">{{ detailData.credit || detailData.tinChi }}</span></v-col>
            <v-col cols="6" class="py-1"><strong>Tổng số tiết:</strong> <span class="error--text font-weight-medium">{{ detailData.totalPeriods || detailData.soTiet }}</span></v-col>
            <v-col cols="6" class="py-1"><strong>Số lượng sinh viên:</strong> <span class="error--text font-weight-medium">{{ detailData.studentCount || detailData.soLuongSv }}</span></v-col>
            <v-col cols="6" class="py-1"><strong>Tổng phí:</strong> <span class="error--text font-weight-medium">{{ detailData.totalFee || detailData.tongPhi }} đ</span></v-col>
            <v-col cols="6" class="py-1"><strong>Thuế thu nhập cá nhân:</strong> <span class="error--text font-weight-medium">{{ detailData.pit || detailData.thueThuNhap }} đ</span></v-col>
            <v-col cols="12" class="py-1"><strong>Trạng thái:</strong> <span class="error--text font-weight-medium">{{ detailData.statusText || detailData.status }}</span></v-col>
            
            <!-- File thông tin (Chỉ hiển thị icon và tải về, không có nút cập nhật ở đây) -->
            <v-col cols="12" class="d-flex align-center mt-2">
            <strong class="mr-3">File thông tin:</strong>
            <template v-if="detailData.filePath || detailData.file">
                <v-btn icon color="error" @click="downloadFile(detailData.filePath || detailData.file)">
                <v-icon>mdi-file-document</v-icon>
                </v-btn>
                <span class="error--text cursor-pointer ml-1" @click="downloadFile(detailData.filePath || detailData.file)">
                Tải xuống file
                </span>
            </template>
            <template v-else>
                <v-icon color="grey darken-1">mdi-file-document-outline</v-icon>
                <span class="grey--text ml-2">Chưa có file</span>
            </template>
            </v-col>
        </v-row>
        </v-card-text>

        <v-card-actions class="px-6 pb-4">
        <v-spacer></v-spacer>
        <v-btn color="error" depressed class="white--text px-5" @click="detailDialog = false">Đóng</v-btn>
        </v-card-actions>
    </v-card>
    </v-dialog>

    <!-- Modal Cập Nhật File Thông Tin -->
    <v-dialog v-model="updateFileDialog" max-width="550px">
    <v-card class="pa-0">
        <!-- Header chuẩn màu đỏ Bách Khoa #a2212b -->
        <v-card-title class="white--text font-weight-bold py-3 px-4" style="background-color: #a2212b !important;">
        Cập nhật file thông tin
        <v-spacer></v-spacer>
        <v-icon dark class="cursor-pointer" @click="updateFileDialog = false">mdi-close</v-icon>
        </v-card-title>

        <v-card-text class="pa-6">
        <!-- File hiện tại -->
        <div class="d-flex align-center mb-6">
            <span class="mr-4 font-weight-bold grey--text text--darken-3">File hiện tại:</span>
            <template v-if="selectedItemForFile && selectedItemForFile.filePath">
            <v-btn icon color="error" @click="downloadFile(selectedItemForFile.filePath)">
                <v-icon>mdi-file-document</v-icon>
            </v-btn>
            <span class="error--text font-weight-medium cursor-pointer ml-1" @click="downloadFile(selectedItemForFile.filePath)">
                Đã có file
            </span>
            </template>
            <template v-else>
            <v-icon color="grey darken-1">mdi-file-document-outline</v-icon>
            <span class="grey--text ml-2">Chưa có file</span>
            </template>
        </div>

        <!-- Chọn file mới -->
        <v-file-input
            v-model="newFile"
            label="Chọn file mới"
            prepend-icon="mdi-upload"
            outlined
            dense
            show-size
            color="error"
            item-color="error"
        ></v-file-input>
        </v-card-text>

        <!-- Footer actions -->
        <v-card-actions class="px-6 pb-4">
        <v-spacer></v-spacer>
        <v-btn text color="grey darken-2" class="px-4" @click="updateFileDialog = false">
            Đóng <v-icon right small>mdi-close</v-icon>
        </v-btn>
        <v-btn color="error" depressed class="white--text px-5" @click="updateFile">
            Lưu <v-icon right small>mdi-content-save</v-icon>
        </v-btn>
        </v-card-actions>
    </v-card>
    </v-dialog>
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import feeService from '~/services/feeTeacherByClassService'
import ChangeableStatus from '~/components/Base/ChangeableStatus.vue'

export default {
  name: 'FeeTeacherByClassPage',
  components: {
    BaseTable,
    ChangeableStatus,
  },
  data() {
    return {
        detailDialog: false,
        updateFileDialog: false,
        detailData: null,
        selectedItemForFile: null,
        newFile: null,
      isMobileDevice: false,
      loading: false,
      filters: {
        teacherId: '',
        examId: '',          
        retakeSessionId: '', 
        status: '',          
      },
      activeFilters: {
        teacherId: '',
        examId: '',
        retakeSessionId: '',
        status: '',
      },
      // Quản lý popup xác nhận đổi trạng thái
      confirmDialog: false,
      pendingStatusChange: {
        item: null,
        oldStatus: '',
        newStatus: '',
      },
      // Quản lý thông báo toast xanh lá
      snackbar: {
        show: false,
        text: '',
        color: '#4caf50',
      },
      teacherOptions: [],
      sessionOptions: [],
      examOptions: [],
      
      statusList: [
        { value: 'COMPLETE_PAID', text: 'Đã thanh toán', color: '#4caf50' },
        { value: 'WAIT_PAID', text: 'Chưa thanh toán', color: '#a2212b' },
        { value: 'CANCELED_PAID', text: 'Hủy thanh toán', color: '#f44336' },
      ],

      itemList: [],
      totalRecords: 0,
      totalPages: 1,
      currentPage: 1,
      pageInput: 1,
      itemsPerPage: 50,

      tableHeaders: [
        { text: 'STT', value: 'index', align: 'center', width: '60px', sortable: false },
        { text: 'Mã lớp học lại', value: 'classCode', align: 'left', minWidth: '140px', sortable: false },
        { text: 'Loại lớp', value: 'classType', align: 'left', minWidth: '160px', sortable: false },
        { text: 'Đợt học lại', value: 'examName', align: 'left', minWidth: '110px', sortable: false },
        { text: 'Thu học phí SV', value: 'tuitionCoefficient', align: 'center', minWidth: '100px', sortable: false },
        { text: 'Thanh toán giảng dạy', value: 'teacherCoefficient', align: 'center', minWidth: '110px', sortable: false },
        { text: 'Số tín chỉ học phí', value: 'creditTuition', align: 'center', minWidth: '90px', sortable: false },
        { text: 'Giảng viên', value: 'teacherName', align: 'left', minWidth: '130px', sortable: false },
        { text: 'Tên học phần', value: 'courseName', align: 'left', minWidth: '180px', sortable: false },
        { text: 'Tổng phí', value: 'totalFee', align: 'right', minWidth: '120px', sortable: false },
        { text: 'Thuế thu nhập cá nhân', value: 'totalTaxFee', align: 'right', minWidth: '120px', sortable: false },
        { text: 'File thông tin', value: 'fileInform', align: 'center', minWidth: '90px', sortable: false },
        { text: 'T.T xuất giấy xác nhận', value: 'isExported', align: 'center', minWidth: '140px', sortable: false },
        { text: 'Trạng thái', value: 'status', align: 'center', minWidth: '140px', sortable: false },
        { text: 'Chức năng', value: 'actions', align: 'center', width: '90px', sortable: false },
      ],
    }
  },
  async mounted() {
    if (typeof navigator !== 'undefined') {
      this.isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }
    await this.fetchCatalogs()
    await this.loadData()
  },
  methods: {
    async fetchCatalogs() {
      try {
        const [teacherRes, sessionRes, examRes] = await Promise.all([
          feeService.getTeachers({ status: 'ACTIVE', channel: 'CMS' }, this.$axios).catch(() => null),
          feeService.getRetakeSessions({ channel: 'CMS' }, this.$axios).catch(() => null),
          feeService.getExamList({ channel: 'CMS' }, this.$axios).catch(() => null),
        ])

        if (teacherRes) {
          const list = Array.isArray(teacherRes) ? teacherRes : teacherRes.data || teacherRes.content || []
          this.teacherOptions = list.map(item => ({ text: item.fullName || item.name, value: item.id }))
        }
        if (sessionRes) {
          const list = Array.isArray(sessionRes) ? sessionRes : sessionRes.data || sessionRes.content || []
          this.sessionOptions = list.map(item => ({ text: item.code || item.name, value: item.id || item.code }))
        }
        if (examRes) {
          const list = Array.isArray(examRes) ? examRes : examRes.data || examRes.content || []
          this.examOptions = list.map(item => ({ text: item.code || item.name, value: item.id || item.code }))
        }
      } catch (error) {
        console.error('Lỗi tải danh mục:', error)
      }
    },

    async loadData() {
      this.loading = true
      try {
        const baseParams = {
          pageIndex: this.currentPage,
          pageSize: this.itemsPerPage,
          channel: 'CMS',
        }

        // Đưa các tham số lọc vào baseParams nếu có giá trị
        if (this.activeFilters.teacherId) {
          baseParams.teacherId = this.activeFilters.teacherId
        }
        if (this.activeFilters.examId) {
          baseParams.examId = this.activeFilters.examId
        }
        if (this.activeFilters.retakeSessionId) {
          baseParams.retakeSessionId = this.activeFilters.retakeSessionId
          baseParams.examSessionId = this.activeFilters.retakeSessionId // Dự phòng tên key khác
        }
        if (this.activeFilters.status) {
          baseParams.status = this.activeFilters.status
          baseParams.paymentFeeStatus = this.activeFilters.status // Dự phòng tên key khác
        }

        console.log('Payload params gửi lên API getList:', baseParams)

        const res = await feeService.getList(baseParams)
        if (res) {
          const rootData = res.data !== undefined ? res.data : res
          const allItems = Array.isArray(rootData) ? rootData : rootData.data || rootData.content || rootData.items || []
          
          const rawTotal = rootData.totalElements ?? rootData.totalRecords ?? rootData.total ?? (res.totalElements || res.totalRecords || res.total)
          this.totalRecords = rawTotal !== undefined ? rawTotal : allItems.length

          this.itemList = allItems
          this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage) || 1
        }
      } catch (error) {
        console.error('Lỗi tải danh sách thanh toán:', error)
        this.itemList = []
        this.totalRecords = 0
        this.totalPages = 1
      } finally {
        this.loading = false
      }
    },

    getClassTypeBadge(item) {
      const type = item.classType
      const coef = item.coefficient

      if (type === 'COMBINE_CLASS') {
        if (coef === 1.7) return { text: 'Lớp ghép (Chuyên ngành)', color: '#757575' }
        if (coef === 1.5) return { text: 'Lớp ghép (Đại cương)', color: '#757575' }
        return { text: 'Lớp ghép', color: '#757575' }
      }
      if (type === 'NEW_CLASS') {
        return { text: 'Lớp mở', color: '#4caf50' }
      }
      if (type === 'PROJECT_BASED_CLASS') {
        if (coef === 2.0) return { text: 'Đồ án môn học (HP.DAMH)', color: '#f44336' }
        if (coef === 1.0) return { text: 'Đồ án môn học (HPTT)', color: '#f44336' }
        return { text: 'Đồ án môn học', color: '#f44336' }
      }
      return { text: type || 'Khác', color: '#757575' }
    },

    getStatusText(status) {
      const found = this.statusList.find(s => s.value === status)
      return found ? found.text : 'Chưa thanh toán'
    },

    getStatusColor(status) {
      const found = this.statusList.find(s => s.value === status)
      return found ? found.color : '#a2212b'
    },

    formatMoney(val) {
      if (!val && val !== 0) return '0đ'
      return Number(val).toLocaleString('vi-VN') + 'đ'
    },

    handleSearch() {
      // Xử lý làm sạch bộ lọc trước khi tìm kiếm
      this.activeFilters = {
        teacherId: this.filters.teacherId?.value !== undefined ? this.filters.teacherId.value : this.filters.teacherId,
        examId: this.filters.examId?.value !== undefined ? this.filters.examId.value : this.filters.examId,
        retakeSessionId: this.filters.retakeSessionId?.value !== undefined ? this.filters.retakeSessionId.value : this.filters.retakeSessionId,
        status: this.filters.status?.value !== undefined ? this.filters.status.value : this.filters.status,
      }
      this.currentPage = 1
      this.pageInput = 1
      this.loadData()
    },

    refreshData() {
      this.filters = {
        teacherId: '',
        examId: '',          
        retakeSessionId: '', 
        status: '',          
      }
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
      if (item.status === newStatus) return
      this.pendingStatusChange = {
        item,
        oldStatus: item.status,
        newStatus,
      }
      this.confirmDialog = true
    },

    closeConfirmDialog() {
      this.confirmDialog = false
      this.pendingStatusChange = { item: null, oldStatus: '', newStatus: '' }
    },

    async handleStatusChange(item, selectedItem) {
      try {
        const newStatusValue = selectedItem.value || selectedItem
        await feeService.changeStatus(item.id, newStatusValue)
        item.status = newStatusValue
        item.paymentFeeStatus = newStatusValue
        await this.loadData()
      } catch (error) {
        console.error('Lỗi khi đổi trạng thái:', error)
      }
    },

    async viewDetail(item) {
      try {
        console.log("Đang lấy chi tiết cho item có ID:", item.id)
        
        // Gọi API lấy chi tiết (thử bỏ hoặc giữ transid tùy theo service của ông)
        const response = await feeService.getDetail(item.id)
        
        console.log("Dữ liệu API chi tiết trả về nguyên bản:", response)

        // Bóc tách dữ liệu linh hoạt tránh việc bịundefined
        const rawData = response.data !== undefined ? response.data : response
        this.detailData = rawData.data || rawData.result || rawData

        console.log("Dữ liệu sau khi gán cho detailData:", this.detailData)
        
        this.detailDialog = true
      } catch (error) {
        console.error('Lỗi khi lấy chi tiết:', error)
        alert('Không thể tải thông tin chi tiết!')
      }
    },

    openUpdateFileDialog(item) {
      this.selectedItemForFile = item
      this.newFile = null
      this.updateFileDialog = true
    },

    downloadFile(filePath) {
      if (!filePath) return
      const link = document.createElement('a')
      link.href = filePath
      link.setAttribute('download', '')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },

    async updateFile() {
      if (!this.newFile) {
        alert('Vui lòng chọn file mới!')
        return
      }
      try {
        const formData = new FormData()
        formData.append('file', this.newFile)
        formData.append('channel', 'CMS')

        await feeService.updateFile(this.selectedItemForFile.id, formData)
        alert('Cập nhật file thành công!')
        this.updateFileDialog = false
        this.loadData()
      } catch (error) {
        console.error('Lỗi khi cập nhật file:', error)
        alert('Cập nhật file thất bại!')
      }
    },

    async exportExcel() {
      try {
        const params = {
          teacherId: this.activeFilters.teacherId || '',
          examId: this.activeFilters.examId || '',             
          examSessionId: this.activeFilters.retakeSessionId || '', 
          status: this.activeFilters.status || '',             
          paymentFeeStatus: this.activeFilters.status || '',   
          channel: 'CMS',
        }

        const response = await feeService.exportExcel(params, this.$axios)
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '_')
        link.download = `danh-sach-thanh-toan-giang-vien_${dateStr}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (error) {
        console.error('Lỗi xuất file excel:', error)
      }
    },
  }
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

/* Cố định thanh bộ lọc phía trên */
.sticky-filter {
  position: sticky;
  top: 0;
  z-index: 5;
  background-color: #ffffff;
}

/* Cố định thanh bottom action & phân trang phía dưới */
.sticky-bottom-bar {
  background-color: #ffffff;
}

/* Chỉnh lại để trang cuộn tự nhiên */
.table-scroll-container {
  overflow-x: auto;
}

.table-scroll-container >>> th {
  position: sticky !important;
  top: 0;
  z-index: 2;
  background-color: #f5f5f5 !important;
}

/* Ẩn footer mặc định */
::v-deep .v-data-footer {
  display: none !important;
}
</style>