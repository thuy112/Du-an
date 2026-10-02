<template>
  <v-container fluid class="pa-0 bg-white fill-height align-stretch flex-column overflow-hidden">
    <!-- Layout tổng thể Flexbox cố định full chiều cao viewport làm việc -->
    <div class="main-page-layout">
      
      <!-- 1. THANH BỘ LỌC TÌM KIẾM (CỐ ĐỊNH PHÍA TRÊN) -->
      <div class="sticky-filter-bar filter-bar-container px-4 py-3 bg-white">
        <div class="d-flex align-center justify-space-between flex-wrap gap-3">
          <div class="filter-title text-body-1 font-weight-medium text-gray-900">
            Danh sách lớp học lại <span class="count-number">({{ totalItems }})</span>
          </div>

          <div class="d-flex align-center filter-controls flex-wrap">
            <v-text-field
              v-model="filters.className"
              placeholder="Tên lớp học lại"
              outlined
              dense
              clearable
              hide-details
              class="custom-filter-input input-text-name"
              @keyup.enter="handleSearch"
              @click:clear="handleSearch"
            ></v-text-field>

            <v-select
              v-model="filters.retakeSession"
              :items="retakeSessionOptions"
              item-text="text"
              item-value="value"
              placeholder="Đợt học lại"
              outlined
              dense
              clearable
              hide-details
              class="custom-filter-input input-select-session"
              @change="handleSearch"
            ></v-select>

            <v-select
              v-model="filters.course"
              :items="courseOptions"
              placeholder="Học phần"
              outlined
              dense
              clearable
              hide-details
              class="custom-filter-input input-select-course"
              @change="handleSearch"
            ></v-select>

            <v-select
              v-model="filters.coefficient"
              :items="coefficientOptions"
              placeholder="Hệ số"
              outlined
              dense
              clearable
              hide-details
              class="custom-filter-input input-select-coeff"
              @change="handleSearch"
            ></v-select>

            <div class="d-flex align-center filter-action-buttons">
              <RetakeCourseRetakeSessionFilter
                ref="retakeSessionFilterModal"
                @apply-filter="handleAdvancedFilter"
              />

              <v-btn icon small class="btn-icon-red ma-0" aria-label="Làm mới" @click="resetFilters">
                <v-icon size="24" color="#9e1c24">mdi-refresh</v-icon>
              </v-btn>

              <v-btn
                color="#a2212b"
                dark
                elevation="0"
                class="btn-search-square ma-0"
                aria-label="Tìm kiếm"
                @click="handleSearch"
              >
                <v-icon size="24">mdi-magnify</v-icon>
              </v-btn>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. KHU VỰC BẢNG DỮ LIỆU (CUỘN TRỘI Ở GIỮA, FIXED HEADER CỐ ĐỊNH TRÊN CÙNG BẢNG) -->
      <div class="scrollable-table-area">
        <v-data-table
          :headers="headers"
          :items="appliedData"
          :loading="loading"
          hide-default-footer
          fixed-header
          class="custom-table border-0"
        >
          <!-- STT -->
          <template v-slot:[`item.stt`]="{ index }">
            {{ (page - 1) * itemsPerPage + index + 1 }}
          </template>

          <!-- Mã lớp -->
          <template v-slot:[`item.maLop`]="{ item }">
            <span class="font-weight-medium text-gray-700">{{ item.maLop }}</span>
          </template>

          <!-- Loại lớp -->
          <template v-slot:[`item.loaiLop`]="{ item }">
            <v-chip
              small
              dark
              :color="getLoaiLopColor(item.loaiLop)"
              class="font-weight-medium"
            >
              {{ item.loaiLop }}
            </v-chip>
          </template>

          <!-- Học phần -->
          <template v-slot:[`item.hocPhan`]="{ item }">
            <div class="py-1 text-left">
              <div class="font-weight-bold text-caption text-gray-800">{{ item.hocPhanCode }} -</div>
              <div class="text-caption text-gray-600 line-clamp-2">{{ item.hocPhanName }}</div>
            </div>
          </template>

          <!-- Số lượng sinh viên -->
          <template v-slot:[`item.soLuongSv`]="{ item }">
            {{ item.minSv }}/{{ item.maxSv }}
          </template>

          <!-- Thời gian -->
          <template v-slot:[`item.thoiGian`]="{ item }">
            <div class="text-caption whitespace-nowrap">
              <div>{{ item.tuNgay }}</div>
              <div class="text-gray-400">- {{ item.denNgay }}</div>
            </div>
          </template>

          <!-- Trạng thái duyệt danh sách -->
          <template v-slot:[`item.trangThaiDuyet`]="{ item }">
            <v-select
              :value="item.trangThaiDuyet"
              :items="approvalOptions"
              item-text="text"
              item-value="value"
              dense
              outlined
              hide-details
              :append-icon="isRowLocked(item) ? '' : 'mdi-menu-down'"
              :disabled="isRowLocked(item) || updatingClassIds.includes(item.id)"
              :class="[
                'status-pill-select',
                item.trangThaiDuyet === 'Đã duyệt danh sách' ? 'pill-green-solid' : 'pill-orange-solid',
                { 'is-disabled-select': isRowLocked(item) },
              ]"
              @change="onApprovalStatusChange(item, $event)"
            ></v-select>
          </template>

          <!-- Trạng thái bảng điểm -->
          <template v-slot:[`item.trangThaiBangDiem`]="{ item }">
            <v-select
              :value="item.examStatus"
              :items="gradeOptions"
              item-text="text"
              item-value="value"
              dense
              outlined
              hide-details
              :append-icon="isRowLocked(item) ? '' : 'mdi-menu-down'"
              :disabled="isRowLocked(item) || updatingClassIds.includes(item.id)"
              :class="[
                'status-pill-select',
                item.examStatus === 'ANNOUNCED' ? 'pill-blue-grade' : 'pill-orange-solid',
                { 'is-disabled-select': isRowLocked(item) },
              ]"
              @change="onGradeStatusChange(item, $event)"
            ></v-select>
          </template>

          <!-- Chức năng -->
          <template v-slot:[`item.chucNang`]="{ item }">
            <v-menu offset-y left transition="scale-transition">
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon small v-bind="attrs" class="action-dots-btn" v-on="on">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>

              <v-list dense class="py-1 popup-action-menu">
                <v-list-item v-if="getPermissions(item).showDetail" @click="handleViewDetail(item)">
                  <v-list-item-icon class="mr-2 my-auto">
                    <v-icon size="20" small color="#1890ff">mdi-eye</v-icon>
                  </v-list-item-icon>
                  <v-list-item-title class="text-caption">Chi tiết</v-list-item-title>
                </v-list-item>

                <v-list-item v-if="canExportApprovedClass(item)" @click="handleExportDSSV(item)">
                  <v-list-item-icon class="mr-2 my-auto">
                    <v-icon size="20" small color="#52c41a">mdi-export</v-icon>
                  </v-list-item-icon>
                  <v-list-item-title class="text-caption">Xuất danh sách SV</v-list-item-title>
                </v-list-item>

                <v-list-item v-if="canExportApprovedClass(item)" @click="navigateToGradeSheet(item)">
                  <v-list-item-icon class="mr-2 my-auto">
                    <v-icon size="20" small color="#722ed1">mdi-table</v-icon>
                  </v-list-item-icon>
                  <v-list-item-title class="text-caption">Bảng điểm</v-list-item-title>
                </v-list-item>

                <v-list-item v-if="getPermissions(item).showAssignTeacher" @click="handleAssignTeacher(item)">
                  <v-list-item-icon class="mr-2 my-auto">
                    <v-icon size="20" small color="#13c2c2">mdi-account-tie-hat-outline</v-icon>
                  </v-list-item-icon>
                  <v-list-item-title class="text-caption">Gán giảng viên</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </v-data-table>
      </div>

      <!-- 3. THANH FOOTER PHÂN TRANG (CỐ ĐỊNH DƯỚI ĐÁY, ĐÃ BỎ VIỀN ĐỎ) -->
      <div class="custom-footer-bar pa-3 bg-white d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <!-- Nút Xuất bảng điểm tổng hợp -->
          <v-btn
            color="#42b858"
            dark
            elevation="0"
            class="btn-export-green text-none font-weight-bold"
            @click="exportSummaryToExcel"
          >
            <v-icon left size="18">mdi-export</v-icon>
            XUẤT BẢNG ĐIỂM TỔNG HỢP
          </v-btn>
        </div>

        <!-- Khối Phân trang bên phải -->
        <div class="d-flex align-center gap-3">
          <!-- Ô Chọn Bản ghi -->
          <v-select
            v-model="itemsPerPage"
            :items="[10, 20, 50, 100]"
            label="Bản ghi"
            outlined
            dense
            hide-details
            class="custom-outlined-input record-select"
            @change="onChangeItemsPerPage"
          ></v-select>

          <!-- Ô Nhập Trang -->
          <v-text-field
            v-model.number="pageInput"
            label="Trang"
            outlined
            dense
            hide-details
            class="custom-outlined-input page-input"
            @keyup.enter="goToPage"
          ></v-text-field>

          <!-- Nút Đi -->
          <v-btn
            color="#a2212b"
            dark
            elevation="0"
            class="btn-go-red text-none"
            @click="goToPage"
          >
            Đi
          </v-btn>

          <!-- Nút Lùi trang (<) -->
          <v-btn
            outlined
            small
            class="btn-nav-arrow"
            :disabled="page <= 1"
            @click="changePage(page - 1)"
          >
            <v-icon small color="#666">mdi-chevron-left</v-icon>
          </v-btn>

          <!-- Các nút số Trang -->
          <v-btn
            v-for="p in totalPages"
            :key="p"
            small
            elevation="2"
            :color="page === p ? '#a2212b' : 'white'"
            :class="page === p ? 'white--text font-weight-bold btn-page-number active' : 'black--text btn-page-number'"
            @click="changePage(p)"
          >
            {{ p }}
          </v-btn>

          <!-- Nút Tiến trang (>) -->
          <v-btn
            outlined
            small
            class="btn-nav-arrow"
            :disabled="page >= totalPages"
            @click="changePage(page + 1)"
          >
            <v-icon small color="#666">mdi-chevron-right</v-icon>
          </v-btn>
        </div>
      </div>

    </div>

    <div class="toast-queue-container">
      <transition-group name="toast-list" tag="div">
        <div
          v-for="toast in toastList"
          :key="toast.id"
          class="custom-toast-item d-flex flex-column mb-2"
          :class="toast.color === '#C62828' ? 'toast-error' : 'toast-success'"
        >
          <div class="toast-content d-flex align-center justify-space-between px-4 py-3">
            <div class="d-flex align-center mr-3">
              <v-icon left color="white" size="20">
                {{ toast.color === '#C62828' ? 'mdi-alert-circle-outline' : 'mdi-check-circle-outline' }}
              </v-icon>
              <span class="toast-text font-weight-medium white--text">{{ toast.message }}</span>
            </div>
            <v-btn
              icon
              dark
              x-small
              class="ma-0 close-toast-btn"
              aria-label="Đóng thông báo"
              @click="removeToast(toast.id)"
            >
              <v-icon size="16">mdi-close</v-icon>
            </v-btn>
          </div>
          <div class="toast-progress-bar-container">
            <div class="toast-progress-bar" :style="{ width: toast.progress + '%' }"></div>
          </div>
        </div>
      </transition-group>
    </div>

    <v-dialog v-model="confirmDialog.show" max-width="540px" persistent>
      <v-card class="status-confirm-card">
        <div class="status-confirm-header d-flex align-center justify-space-between px-4 py-3">
          <span class="text-h6 font-weight-bold white--text">Xác nhận</span>
          <v-btn
            icon
            dark
            small
            class="ma-0"
            :disabled="confirmDialog.confirming"
            aria-label="Đóng hộp thoại"
            @click="cancelStatusChange"
          >
            <v-icon size="20">mdi-close</v-icon>
          </v-btn>
        </div>

        <v-card-text class="pt-5 pb-3 px-6 bg-white black--text">
          <p class="text-body-1 mb-4 status-confirm-message">
            {{ confirmDialog.messageText }}
            <span class="font-weight-bold">{{ confirmDialog.item ? confirmDialog.item.maLop : '' }}</span>
            từ <span class="font-weight-bold">{{ confirmDialog.fromLabel }}</span>
            sang <span class="font-weight-bold">{{ confirmDialog.toLabel }}</span> không?
          </p>

          <div
            v-if="confirmDialog.showWarning"
            class="status-warning-alert pa-3 d-flex align-start mb-2"
          >
            <v-icon color="#F57C00" class="mr-2 mt-1" size="20">mdi-alert</v-icon>
            <div class="text-body-2 orange--text text--darken-4">
              <span class="font-weight-bold">Cảnh báo:</span>
              Bạn sẽ không thể chỉnh sửa thông tin lớp học này sau khi chuyển sang trạng thái
              'Chưa duyệt danh sách'.
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="justify-end pb-4 px-6 pt-2 bg-white">
          <v-btn
            text
            class="text-none font-weight-medium mr-2"
            :disabled="confirmDialog.confirming"
            @click="cancelStatusChange"
          >
            Đóng <v-icon size="18" right>mdi-close</v-icon>
          </v-btn>
          <v-btn
            color="#A62229"
            dark
            elevation="0"
            class="px-5 status-confirm-button text-none font-weight-medium"
            :loading="confirmDialog.confirming"
            :disabled="confirmDialog.confirming"
            @click="confirmStatusChange"
          >
            Xác nhận
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <RetakeCourseDetailModal
      v-model="detailModal.show"
      :detail-data="detailModal.data"
      :loading="detailModal.loading"
      :error="detailModal.error"
    />
    <RetakeCourseAssignTeacherModal
      v-model="assignTeacherModal.show"
      :class-item="assignTeacherModal.item"
      :saving="assignTeacherModal.saving"
      @assigned="saveTeacherAssignment"
    />
  </v-container>
</template>

<script>
import * as XLSX from 'xlsx'
import AssignTeacherModal from '~/components/RetakeCourse/AssignTeacherModal.vue'
import RetakeCourseDetailModal from '~/components/RetakeCourse/RetakeCourseDetailModal.vue'
import RetakeSessionFilterModal from '~/components/RetakeCourse/RetakeSessionFilterModal.vue'
import retakeClassServices from '~/services/retakeCourseServices'
import retakeSessionServices from '~/services/retakeSessionServices'
import classCoefficientServices from '~/services/coefficientServices'

export default {
  name: 'DanhSachLopHocLai',
  components: {
    RetakeCourseAssignTeacherModal: AssignTeacherModal,
    RetakeCourseDetailModal,
    RetakeCourseRetakeSessionFilter: RetakeSessionFilterModal,
  },
  data() {
    return {
      loading: false,
      page: 1,
      pageInput: 1,
      itemsPerPage: 50,
      totalItems: 10,

      toastList: [],
      toastDuration: 3000,
      updatingClassIds: [],
      detailModal: {
        show: false,
        data: {},
        loading: false,
        error: '',
      },
      assignTeacherModal: {
        show: false,
        item: null,
        saving: false,
      },
      confirmDialog: {
        show: false,
        type: '',
        item: null,
        newValue: null,
        fromLabel: '',
        toLabel: '',
        messageText: '',
        showWarning: false,
        confirming: false,
      },
      approvalOptions: [
        { text: 'Chưa duyệt danh sách', value: 'Chưa duyệt danh sách' },
        { text: 'Đã duyệt danh sách', value: 'Đã duyệt danh sách' },
      ],
      gradeOptions: [
        { text: 'Chưa có điểm', value: 'NOT_ANNOUNCED' },
        { text: 'Đã có điểm', value: 'ANNOUNCED' },
      ],

      filters: {
        className: '',
        retakeSession: null,
        course: null,
        coefficient: null,
      },

      canExportApprovedClass(item) {
        return (
          item.hasBeenApproved ||
          item.approvalStatus === 'ACTIVE' ||
          item.trangThaiDuyet === 'Đã duyệt danh sách'
        )
      },

      retakeSessionOptions: ['20261-A-5', '20261-A-4', '20252-A-1', '20252-A-3'],
      courseOptions: ['CH2021', 'ET2031', 'MHPO2', 'MHPO1', 'IT4995', 'ET4235', 'JAVA', 'ME3123'],
      coefficientOptions: ['1.5', '1.3', '1.7', '2.0'],

      headers: [
        { text: 'STT', value: 'stt', width: '45px', align: 'center', sortable: false },
        { text: 'Mã lớp', value: 'maLop', width: '130px', sortable: false },
        { text: 'Loại lớp', value: 'loaiLop', width: '160px', sortable: false },
        { text: 'Thu học phí SV', value: 'thuHocPhi', width: '80px', align: 'center', sortable: false },
        { text: 'Thanh toán giảng dạy', value: 'thanhToan', width: '80px', align: 'center', sortable: false },
        { text: 'Đợt học lại', value: 'dotHocLai', width: '90px', align: 'center', sortable: false },
        { text: 'Học phần', value: 'hocPhan', width: '170px', sortable: false },
        { text: 'Số lượng sinh viên', value: 'soLuongSv', width: '80px', align: 'center', sortable: false },
        { text: 'Số lượng SV đăng ký', value: 'svDangKy', width: '80px', align: 'center', sortable: false },
        { text: 'Thời gian', value: 'thoiGian', width: '110px', align: 'center', sortable: false },
        { text: 'Trạng thái duyệt danh sách', value: 'trangThaiDuyet', width: '210px', align: 'center', sortable: false },
        { text: 'Trạng thái bảng điểm', value: 'trangThaiBangDiem', width: '190px', align: 'center', sortable: false },
        { text: 'Chức năng', value: 'chucNang', width: '70px', align: 'center', sortable: false },
      ],

      dataList: [
        {
          id: 1,
          maLop: 'G_20261_5_046',
          loaiLop: 'Lớp ghép (Đại cương)',
          thuHocPhi: 1.5,
          thanhToan: '',
          dotHocLai: '20261-A-5',
          hocPhanCode: 'CH2021',
          hocPhanName: 'Đổi mới sáng tạo và khởi nghiệp',
          minSv: 10,
          maxSv: 20,
          svDangKy: 10,
          tuNgay: '01/09/2026',
          denNgay: '31/12/2026',
          trangThaiDuyet: 'Chưa duyệt danh sách',
          registerStudentStatus: 'PENDING',
          examStatus: 'NOT_ANNOUNCED',
          teacherId: null,
          examSessionStatus: 'NOT_FINALIZED'
        },
        {
          id: 2,
          maLop: 'G_20261_5_045',
          loaiLop: 'Lớp ghép (Đại cương)',
          thuHocPhi: 1.5,
          thanhToan: '',
          dotHocLai: '20261-A-5',
          hocPhanCode: 'ET2031',
          hocPhanName: 'Kỹ thuật lập trình C/C++',
          minSv: 10,
          maxSv: 20,
          svDangKy: 10,
          tuNgay: '01/09/2026',
          denNgay: '31/12/2026',
          trangThaiDuyet: 'Chưa duyệt danh sách',
          registerStudentStatus: 'PENDING',
          examStatus: 'NOT_ANNOUNCED',
          teacherId: null,
          examSessionStatus: 'NOT_FINALIZED'
        },
        {
          id: 3,
          maLop: 'M_20261_4_044',
          loaiLop: 'Lớp mở',
          thuHocPhi: 1.3,
          thanhToan: '',
          dotHocLai: '20261-A-4',
          hocPhanCode: 'MHPO2',
          hocPhanName: 'Pháp luật đại cương Q',
          minSv: 0,
          maxSv: 20,
          svDangKy: 0,
          tuNgay: '31/08/2026',
          denNgay: '31/12/2026',
          trangThaiDuyet: 'Chưa duyệt danh sách',
          registerStudentStatus: 'PENDING',
          examStatus: 'NOT_ANNOUNCED',
          teacherId: null,
          examSessionStatus: 'NOT_FINALIZED'
        },
        {
          id: 4,
          maLop: 'G_20261_4_043',
          loaiLop: 'Lớp ghép (Đại cương)',
          thuHocPhi: 1.5,
          thanhToan: '',
          dotHocLai: '20261-A-4',
          hocPhanCode: 'MHPO1',
          hocPhanName: 'Pháp luật đại cương H',
          minSv: 0,
          maxSv: 50,
          svDangKy: 0,
          tuNgay: '01/08/2026',
          denNgay: '01/12/2026',
          trangThaiDuyet: 'Chưa duyệt danh sách',
          registerStudentStatus: 'PENDING',
          examStatus: 'NOT_ANNOUNCED',
          teacherId: null,
          examSessionStatus: 'NOT_FINALIZED'
        },
        {
          id: 5,
          maLop: 'D_20261_4_042',
          loaiLop: 'Đồ án môn học (HP.DAMH)',
          thuHocPhi: 2.0,
          thanhToan: '',
          dotHocLai: '20261-A-4',
          hocPhanCode: 'IT4995',
          hocPhanName: 'Đồ án tốt nghiệp cử nhân',
          minSv: 0,
          maxSv: 15,
          svDangKy: 0,
          tuNgay: '13/08/2026',
          denNgay: '30/12/2026',
          trangThaiDuyet: 'Chưa duyệt danh sách',
          registerStudentStatus: 'PENDING',
          examStatus: 'NOT_ANNOUNCED',
          teacherId: null,
          examSessionStatus: 'NOT_FINALIZED'
        },
        {
          id: 6,
          maLop: 'G_20252_1_041',
          loaiLop: 'Lớp ghép (Chuyên ngành)',
          thuHocPhi: 1.7,
          thanhToan: '',
          dotHocLai: '20252-A-1',
          hocPhanCode: 'ET4235',
          hocPhanName: 'IoT trong y tế',
          minSv: 1,
          maxSv: 10,
          svDangKy: 1,
          tuNgay: '01/06/2026',
          denNgay: '09/06/2026',
          trangThaiDuyet: 'Chưa duyệt danh sách',
          registerStudentStatus: 'PENDING',
          examStatus: 'NOT_ANNOUNCED',
          teacherId: 101,
          examSessionStatus: 'NOT_FINALIZED'
        },
        {
          id: 7,
          maLop: 'G_20261_4_040',
          loaiLop: 'Lớp ghép (Chuyên ngành)',
          thuHocPhi: 1.7,
          thanhToan: '',
          dotHocLai: '20261-A-4',
          hocPhanCode: 'JAVA',
          hocPhanName: 'Lập trình Java',
          minSv: 0,
          maxSv: 30,
          svDangKy: 0,
          tuNgay: '31/05/2026',
          denNgay: '01/06/2026',
          trangThaiDuyet: 'Đã duyệt danh sách',
          registerStudentStatus: 'CONFIRMED',
          examStatus: 'NOT_ANNOUNCED',
          teacherId: null,
          examSessionStatus: 'NOT_FINALIZED'
        },
        {
          id: 8,
          maLop: 'G_20261_4_039',
          loaiLop: 'Lớp ghép (Chuyên ngành)',
          thuHocPhi: 1.7,
          thanhToan: '',
          dotHocLai: '20261-A-4',
          hocPhanCode: 'ME3123',
          hocPhanName: 'Thiết kế mỹ thuật công nghiệp',
          minSv: 1,
          maxSv: 20,
          svDangKy: 1,
          tuNgay: '01/06/2026',
          denNgay: '31/07/2026',
          trangThaiDuyet: 'Đã duyệt danh sách',
          registerStudentStatus: 'CONFIRMED',
          examStatus: 'NOT_ANNOUNCED',
          teacherId: null,
          examSessionStatus: 'NOT_FINALIZED'
        },
        {
          id: 9,
          maLop: 'RC001',
          loaiLop: 'Lớp ghép (Chuyên ngành)',
          thuHocPhi: 1.7,
          thanhToan: '',
          dotHocLai: '20252-A-3',
          hocPhanCode: 'IT2001',
          hocPhanName: 'Lập trình Web',
          minSv: 0,
          maxSv: 30,
          svDangKy: 0,
          tuNgay: '42/0019',
          denNgay: '42/0022',
          trangThaiDuyet: 'Chưa duyệt danh sách',
          registerStudentStatus: 'PENDING',
          examStatus: 'NOT_ANNOUNCED',
          teacherId: null,
          examSessionStatus: 'NOT_FINALIZED'
        },
        {
          id: 10,
          maLop: 'G_20252_3_027',
          loaiLop: 'Lớp ghép (Chuyên ngành)',
          thuHocPhi: 1.7,
          thanhToan: '',
          dotHocLai: '20252-A-3',
          hocPhanCode: 'CSHARP',
          hocPhanName: 'Lập trình C#',
          minSv: 1,
          maxSv: 20,
          svDangKy: 1,
          tuNgay: '18/05/2026',
          denNgay: '19/06/2026',
          trangThaiDuyet: 'Đã duyệt danh sách',
          registerStudentStatus: 'CONFIRMED',
          examStatus: 'ANNOUNCED',
          teacherId: 102,
          examSessionStatus: 'NOT_FINALIZED'
        }
      ],
      appliedData: [],
    }
  },

  computed: {
    totalPages() {
      return Math.ceil(this.totalItems / this.itemsPerPage) || 1
    },
  },

  async mounted() {
    this.dataList = this.dataList.map((item) => ({
      ...item,
      hasBeenApproved: item.trangThaiDuyet === 'Đã duyệt danh sách',
    }))
    this.appliedData = [...this.dataList]
    await Promise.all([
      this.getRetakeSessions(),
      this.getCoefficients(),
      this.fetchData(),
    ])
  },

  beforeDestroy() {
    this.toastList.forEach((toast) => clearInterval(toast.timer))
  },

  methods: {
    isRowLocked(item) {
      return (
        item.trangThaiDuyet === 'Đã duyệt danh sách' &&
        item.examStatus === 'ANNOUNCED'
      )
    },

    onChangeItemsPerPage() {
      this.page = 1
      this.pageInput = 1
      this.fetchData()
    },

    changePage(newPage) {
      if (newPage >= 1 && newPage <= this.totalPages) {
        this.page = newPage
        this.pageInput = newPage
        this.fetchData()
      }
    },

    goToPage() {
      if (this.pageInput >= 1 && this.pageInput <= this.totalPages) {
        this.page = this.pageInput
        this.fetchData()
      } else {
        this.pageInput = this.page
      }
    },

    getPermissions(item) {
      const isApproved = item.trangThaiDuyet === 'Đã duyệt danh sách';
      const hasTeacher = item.teacherId !== null && item.teacherId !== undefined;
      const isOverCapacity = (item.svDangKy ?? 0) > (item.maxSv ?? 0);
      const isExpired = this.checkIsExpired(item.denNgay);

      if (isOverCapacity && !isApproved) {
        return {
          showDetail: true,
          showExportExcel: false,
          showGrades: false,
          showAssignTeacher: false
        };
      }

      return {
        showDetail: true,
        showExportExcel: isApproved || (isExpired && hasTeacher),
        showGrades: isApproved || hasTeacher,
        showAssignTeacher: !hasTeacher
      };
    },

    checkIsExpired(denNgayStr) {
      if (!denNgayStr) return false;
      const [day, month, year] = denNgayStr.split('/');
      if (!year) return false;
      const endDate = new Date(year, month - 1, day, 23, 59, 59);
      return new Date() > endDate;
    },

    checkIsTooOverdue(denNgayStr) {
      if (!denNgayStr) return false;
      const [day, month, year] = denNgayStr.split('/');
      if (!year) return false;
      const endDate = new Date(year, month - 1, day);
      const diffDays = Math.ceil((new Date() - endDate) / (1000 * 60 * 60 * 24));
      return diffDays > 30;
    },

    async getRetakeSessions() {
      try {
        const res = await retakeSessionServices.getList()
        const sessions = Array.isArray(res?.data) ? res.data : res?.data?.items || []
        if (sessions.length) {
          this.retakeSessionOptions = sessions.map((item) => {
            if (typeof item === 'string') return { text: item, value: item }
            return {
              text: item.maDot || item.code || item.name || String(item.id),
              value: item.id,
            }
          })
        }
      } catch (err) {
        console.error('Lỗi khi tải đợt học lại:', err)
      }
    },

    async getCoefficients() {
      try {
        const res = await classCoefficientServices.getList()
        const coefficients = Array.isArray(res?.data) ? res.data : res?.data?.items || []
        if (coefficients.length) {
          this.coefficientOptions = coefficients.map((item) => {
            const value = typeof item === 'object'
              ? item.thuHocPhiSv ?? item.coefficient ?? item.value
              : item
            return String(value)
          }).filter(Boolean)
        }
      } catch (err) {
        console.error('Lỗi khi tải hệ số:', err)
      }
    },

    async fetchData() {
      this.loading = true
      try {
        const params = {
          page: this.page,
          pageSize: this.itemsPerPage,
          className: this.filters.className,
          retakeSessionId: this.filters.retakeSession,
          courseId: this.filters.course,
          coefficient: this.filters.coefficient,
        }
        const res = await retakeClassServices.getList(params)
        const payload = res?.data || {}
        const items = Array.isArray(payload) ? payload : payload.items || []
        if (items.length) {
          const knownItems = [...this.appliedData, ...this.dataList]
          this.appliedData = items.map((item) => {
            const knownItem = knownItems.find((known) => known.id === item.id)
            const currentlyApproved =
              item.trangThaiDuyet === 'Đã duyệt danh sách' ||
              item.approvalStatus === 'ACTIVE'

            return {
              ...item,
              hasBeenApproved:
                item.hasBeenApproved === true ||
                knownItem?.hasBeenApproved === true ||
                currentlyApproved,
            }
          })
          this.totalItems = Array.isArray(payload) ? payload.length : payload.total ?? items.length
        } else {
          this.applyLocalSearch()
        }
      } catch (err) {
        this.applyLocalSearch()
      } finally {
        this.loading = false
      }
    },

    getLoaiLopColor(loaiLop) {
      if (loaiLop.includes('Lớp ghép')) return '#8c8c8c'
      if (loaiLop.includes('Lớp mở')) return '#52c41a'
      if (loaiLop.includes('Đồ án môn học')) return '#f5222d'
      return '#1890ff'
    },

    handleSearch() {
      this.page = 1
      this.pageInput = 1
      this.fetchData()
    },

    onApprovalStatusChange(item, value) {
      if (value === item.trangThaiDuyet) return

      const fromLabel = item.trangThaiDuyet
      const toLabel = value
      this.confirmDialog = {
        ...this.confirmDialog,
        show: true,
        type: 'APPROVAL',
        item,
        newValue: value,
        fromLabel,
        toLabel,
        messageText: 'Bạn có chắc chắn muốn đổi trạng thái duyệt danh sách lớp học',
        showWarning: fromLabel === 'Đã duyệt danh sách' && value !== 'Đã duyệt danh sách',
      }
    },

    onGradeStatusChange(item, value) {
      if (value === item.examStatus) return

      this.confirmDialog = {
        ...this.confirmDialog,
        show: true,
        type: 'GRADE',
        item,
        newValue: value,
        fromLabel: this.getGradeStatusLabel(item.examStatus),
        toLabel: this.getGradeStatusLabel(value),
        messageText: 'Bạn có chắc chắn muốn đổi trạng thái bảng điểm của lớp học',
        showWarning: false,
      }
    },

    getGradeStatusLabel(status) {
      return status === 'ANNOUNCED' ? 'Đã có điểm' : 'Chưa có điểm'
    },

    async confirmStatusChange() {
      const { type, item, newValue } = this.confirmDialog
      if (!item || !newValue || this.confirmDialog.confirming) return

      this.confirmDialog.confirming = true
      if (type === 'APPROVAL') {
        const isApproved = newValue === 'Đã duyệt danh sách'
        const saved = await this.updateClassStatus(item, 'trangThaiDuyet', newValue, {
          registerStudentStatus: isApproved ? 'CONFIRMED' : 'PENDING',
          successMessage: 'Cập nhật trạng thái duyệt danh sách thành công.',
        })
        if (saved && isApproved) {
          item.hasBeenApproved = true
        }
      } else if (type === 'GRADE') {
        await this.updateClassStatus(item, 'examStatus', newValue, {
          successMessage: 'Cập nhật trạng thái bảng điểm thành công.',
        })
      }

      this.confirmDialog.show = false
      this.confirmDialog.confirming = false
      this.clearConfirmDialog()
    },

    cancelStatusChange() {
      if (this.confirmDialog.confirming) return
      this.confirmDialog.show = false
      this.clearConfirmDialog()
    },

    clearConfirmDialog() {
      this.confirmDialog.type = ''
      this.confirmDialog.item = null
      this.confirmDialog.newValue = null
      this.confirmDialog.fromLabel = ''
      this.confirmDialog.toLabel = ''
      this.confirmDialog.messageText = ''
      this.confirmDialog.showWarning = false
    },

    async updateClassStatus(item, field, value, options = {}) {
      const originalValue = item[field]
      const originalRegisterStatus = item.registerStudentStatus
      item[field] = value
      if (options.registerStudentStatus) {
        item.registerStudentStatus = options.registerStudentStatus
      }

      this.updatingClassIds.push(item.id)
      try {
        await retakeClassServices.update(item.id, { [field]: value })
        this.showNotification(options.successMessage)
        return true
      } catch (err) {
        item[field] = originalValue
        if (options.registerStudentStatus) {
          item.registerStudentStatus = originalRegisterStatus
        }
        this.showNotification(`Cập nhật trạng thái lớp ${item.maLop} thất bại.`, '#C62828')
        return false
      } finally {
        this.updatingClassIds = this.updatingClassIds.filter((id) => id !== item.id)
      }
    },

    async handleViewDetail(item) {
      this.detailModal.data = { ...item }
      this.detailModal.error = ''
      this.detailModal.show = true
      this.detailModal.loading = true

      try {
        const response = await retakeClassServices.getDetail(item.id)
        const payload = response?.data || {}
        const detail = payload.item || payload.data || payload
        this.detailModal.data = {
          ...item,
          ...detail,
          students: Array.isArray(detail.students)
            ? detail.students
            : Array.isArray(detail.studentList)
              ? detail.studentList
              : item.students || [],
        }
      } catch (err) {
        this.detailModal.error = 'Không thể tải thông tin chi tiết lớp học lại.'
        this.showNotification(this.detailModal.error, '#C62828')
      } finally {
        this.detailModal.loading = false
      }
    },
    handleExportDSSV(item) {
      const students = Array.isArray(item.students) ? item.students : []
      if (!students.length) {
        this.showNotification('Lớp học này chưa có sinh viên đăng ký!', '#C62828')
        return
      }

      try {
        const excelData = students.map((student, index) => ({
          STT: index + 1,
          'Mã sinh viên': student.studentId || student.mssv || '',
          'Họ và tên': student.fullName || student.hoTen || '',
          'Lớp sinh viên': student.className || student.lopSinhVien || '',
          'Ngày đăng ký': student.registeredAt || student.ngayDangKy || '',
          'Trạng thái': student.status || 'Đã đăng ký',
        }))
        const worksheet = XLSX.utils.json_to_sheet(excelData)
        worksheet['!cols'] = [
          { wch: 6 },
          { wch: 16 },
          { wch: 26 },
          { wch: 18 },
          { wch: 16 },
          { wch: 16 },
        ]
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'DSSV')

        const classCode = item.classCode || item.maLop || 'lop'
        const safeClassCode = classCode.replace(/[\\/:*?"<>|]/g, '_')
        XLSX.writeFile(workbook, `Danh_sach_sinh_vien_${safeClassCode}.xlsx`)
      } catch (err) {
        this.showNotification(`Lỗi khi xuất DSSV lớp ${item.maLop || item.classCode}.`, '#C62828')
      }
    },
    navigateToGradeSheet(item) {
      const classCode = item && (item.maLop || item.classCode)
      if (!classCode) {
        this.showNotification('Không tìm thấy mã lớp học lại!', '#C62828')
        return
      }

      return this.$router.push({
        path: `/quan-ly-hoc-lai/danh-sach-lop-hoc/${encodeURIComponent(classCode)}/bang-diem`,
      })
    },
    handleAssignTeacher(item) {
      this.assignTeacherModal.item = item
      this.assignTeacherModal.show = true
    },
    async saveTeacherAssignment(assignment) {
      const item = this.assignTeacherModal.item
      if (!item || !assignment.primaryTeacher || this.assignTeacherModal.saving) return

      this.assignTeacherModal.saving = true
      try {
        await retakeClassServices.update(item.id, {
          teacherId: assignment.primaryTeacher.id,
          assistantTeacherId: assignment.assistantTeacher ? assignment.assistantTeacher.id : null,
        })
        item.teacherId = assignment.primaryTeacher.id
        item.assistantTeacherId = assignment.assistantTeacher ? assignment.assistantTeacher.id : null
        item.primaryTeacher = assignment.primaryTeacher
        item.assistantTeacher = assignment.assistantTeacher
        this.assignTeacherModal.show = false
        this.showNotification(`Gán giảng viên cho lớp ${item.maLop} thành công.`)
      } catch (err) {
        this.showNotification(`Gán giảng viên cho lớp ${item.maLop} thất bại.`, '#C62828')
      } finally {
        this.assignTeacherModal.saving = false
      }
    },

    exportSummaryToExcel() {
      const classes = this.appliedData
      if (!classes.length) {
        this.showNotification('Không có dữ liệu lớp học để xuất!', '#C62828')
        return
      }

      try {
        const excelData = classes.map((item, index) => {
          const classCode = item.classCode || item.maLop || ''
          const approvalStatus = item.approvalStatus || item.trangThaiDuyet
          const gradeStatus = item.gradeStatus || item.examStatus
          let classTypeName = 'Lớp thường'

          if (classCode.startsWith('G_')) classTypeName = 'Lớp ghép'
          else if (classCode.startsWith('M_')) classTypeName = 'Lớp mở'
          else if (classCode.startsWith('D_')) classTypeName = 'Đồ án môn học'

          return {
            STT: index + 1,
            'Mã lớp': classCode,
            'Loại lớp': classTypeName,
            'Trạng thái duyệt danh sách':
              approvalStatus === 'ACTIVE' || approvalStatus === 'Đã duyệt danh sách'
                ? 'Đã duyệt danh sách'
                : 'Chưa duyệt danh sách',
            'Trạng thái bảng điểm':
              gradeStatus === 'ACTIVE' || gradeStatus === 'ANNOUNCED'
                ? 'Đã có điểm'
                : 'Chưa có điểm',
          }
        })
        const worksheet = XLSX.utils.json_to_sheet(excelData)
        worksheet['!cols'] = [
          { wch: 6 },
          { wch: 16 },
          { wch: 20 },
          { wch: 28 },
          { wch: 22 },
        ]
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách lớp')

        const dateStr = new Date().toISOString().slice(0, 10)
        XLSX.writeFile(workbook, `Bang_diem_tong_hop_${dateStr}.xlsx`)
      } catch (err) {
        this.showNotification('Lỗi khi xuất bảng điểm tổng hợp', '#C62828')
      }
    },

    showNotification(message, color = '#2E7D32') {
      const id = Date.now() + Math.random()
      const startTime = Date.now()
      const toast = {
        id,
        message,
        color,
        progress: 100,
        timer: null,
      }

      toast.timer = setInterval(() => {
        const elapsedTime = Date.now() - startTime
        const remaining = Math.max(0, this.toastDuration - elapsedTime)
        toast.progress = (remaining / this.toastDuration) * 100

        if (remaining <= 0) {
          this.removeToast(id)
        }
      }, 30)

      this.toastList.push(toast)
    },

    removeToast(id) {
      const index = this.toastList.findIndex((toast) => toast.id === id)
      if (index === -1) return

      clearInterval(this.toastList[index].timer)
      this.toastList.splice(index, 1)
    },

    applyLocalSearch() {
      const filtered = this.dataList.filter((item) => {
        const matchName =
          !this.filters.className ||
          item.maLop.toLowerCase().includes(this.filters.className.toLowerCase()) ||
          item.hocPhanName.toLowerCase().includes(this.filters.className.toLowerCase())

        const matchSession =
          !this.filters.retakeSession || item.dotHocLai === this.filters.retakeSession

        const matchCourse =
          !this.filters.course || item.hocPhanCode.includes(this.filters.course) || item.hocPhanName.includes(this.filters.course)

        const matchCoeff =
          !this.filters.coefficient || String(item.thuHocPhi) === this.filters.coefficient

        return matchName && matchSession && matchCourse && matchCoeff
      })
      this.appliedData = filtered
      this.totalItems = filtered.length
    },

    resetFilters() {
      this.filters = {
        className: '',
        retakeSession: null,
        course: null,
        coefficient: null,
      }
      this.page = 1
      this.pageInput = 1
      this.applyLocalSearch()
    },
  },
}
</script>

<style scoped>
/* Khóa layout vừa vặn 100% viewport làm việc */
.main-page-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100vh - 80px);
  overflow: hidden;
}

/* 1. Thanh bộ lọc trên đỉnh cố định */
.sticky-filter-bar {
  flex-shrink: 0;
  z-index: 10;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.filter-bar-container {
  border-bottom: 1px solid #e5e7eb;
}

.filter-title {
  font-size: 15px !important;
  color: #1f2937;
}

.count-number {
  color: #9e1c24;
  font-weight: 600;
}

.custom-filter-input >>> .v-input__slot {
  min-height: 38px !important;
  max-height: 38px !important;
  border-color: #a3a3a3 !important;
  border-radius: 4px !important;
  background-color: #ffffff !important;
  padding: 0 12px !important;
  box-shadow: none !important;
}

.custom-filter-input >>> fieldset {
  border-color: #a3a3a3 !important;
  border-width: 1px !important;
}

.custom-filter-input >>> .v-text-field__slot input,
.custom-filter-input >>> .v-select__selection {
  font-size: 14px !important;
  color: #333333 !important;
}

.custom-filter-input >>> .v-text-field__slot input::placeholder {
  color: #6b7280 !important;
  opacity: 1;
}

.custom-filter-input >>> .v-input__append-inner {
  margin-top: 7px !important;
}

.custom-filter-input >>> .v-icon {
  color: #6b7280 !important;
  font-size: 20px !important;
}

.input-text-name {
  width: 200px;
}

.input-select-session {
  width: 160px;
}

.input-select-course {
  width: 180px;
}

.input-select-coeff {
  width: 130px;
}

.filter-controls {
  gap: 8px;
}


/* 2. Khu vực chứa Bảng & Fixed Header */
.scrollable-table-area {
  flex: 1 1 0%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.custom-table {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Bật cuộn tại chính wrapper của Vuetify để fixed-header hoạt động cố định đúng chuẩn */
.custom-table >>> .v-data-table__wrapper {
  flex: 1 1 0%;
  overflow-y: auto !important;
  max-height: 100% !important;
}

/* Định dạng Cố định Tiêu đề Cột (Header) màu xám nhạt như trong hình ảnh */
.custom-table >>> th {
  position: sticky !important;
  top: 0 !important;
  z-index: 5 !important;
  background-color: #f0f0f0 !important;
  color: #000000 !important;
  font-weight: 700 !important;
  font-size: 13px !important;
  border-bottom: 1px solid #d9d9d9 !important;
  box-shadow: inset 0 -1px 0 #d9d9d9;
}

/* 3. Thanh Footer cố định dưới đáy (Đã bỏ kẻ đường màu đỏ) */
.custom-footer-bar {
  flex-shrink: 0;
  z-index: 10;
  background-color: #ffffff;
  border-top: 1px solid #e5e7eb !important; /* Thay viền đỏ 4px bằng đường kẻ xám nhẹ chuẩn UI */
}

/* Stylings chi tiết khác */
.btn-export-green {
  background-color: #42b858 !important;
  color: #ffffff !important;
  border-radius: 4px !important;
  height: 36px !important;
  font-size: 13px !important;
  letter-spacing: 0.2px;
}

.custom-outlined-input >>> .v-input__slot {
  min-height: 36px !important;
  border-color: #757575 !important;
  border-radius: 4px !important;
}

.custom-outlined-input >>> .v-label {
  top: 10px !important;
  font-size: 12px !important;
  color: #555555 !important;
  background-color: #ffffff;
  padding: 0 4px;
}

.record-select {
  width: 90px;
}

.page-input {
  width: 70px;
}

.page-input >>> input {
  text-align: center;
  font-size: 13px;
}

.btn-go-red {
  background-color: #a2212b !important;
  color: #ffffff !important;
  border-radius: 4px !important;
  height: 36px !important;
  min-width: 48px !important;
  font-size: 13px !important;
  font-weight: 500;
}

.btn-nav-arrow {
  border: 1px solid #e0e0e0 !important;
  border-radius: 4px !important;
  min-width: 32px !important;
  width: 32px !important;
  height: 36px !important;
  padding: 0 !important;
  background-color: #ffffff !important;
}

.btn-page-number {
  min-width: 32px !important;
  width: 32px !important;
  height: 36px !important;
  padding: 0 !important;
  border-radius: 4px !important;
  font-size: 13px !important;
}

.btn-page-number.active {
  background-color: #a2212b !important;
  box-shadow: 0 2px 6px rgba(162, 33, 43, 0.4) !important;
}

.btn-icon-red {
  width: 38px !important;
  height: 38px !important;
  border-radius: 4px;
}

.btn-icon-red:hover {
  background-color: rgba(158, 28, 36, 0.08) !important;
}

.btn-search-square {
  min-width: 44px !important;
  width: 44px !important;
  height: 38px !important;
  padding: 0 !important;
  border-radius: 4px !important;
  background-color: #9e1c24 !important;
}

.btn-search-square:hover {
  background-color: #82141b !important;
}

.status-pill-select {
  min-width: 0;
}

.status-pill-select >>> .v-input__control,
.status-pill-select >>> .v-input__slot {
  min-height: 34px !important;
}

.status-pill-select >>> .v-input__slot {
  border-radius: 18px !important;
  padding: 0 10px 0 14px !important;
  border-width: 1px !important;
}

.status-pill-select >>> .v-select__selections {
  flex-wrap: nowrap;
  overflow: hidden;
  padding: 0 !important;
  white-space: nowrap;
}

.status-pill-select >>> .v-select__selection {
  overflow: hidden;
  font-size: 12px !important;
  font-weight: 500 !important;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-pill-select >>> fieldset {
  border: none !important;
}

.status-pill-select.is-disabled-select >>> .v-input__inner,
.status-pill-select.is-disabled-select >>> .v-select__selection,
.status-pill-select.is-disabled-select >>> .v-icon {
  opacity: 1 !important;
}

.status-pill-select.is-disabled-select >>> .v-input__slot,
.status-pill-select.is-disabled-select >>> .v-select__selection {
  cursor: not-allowed !important;
}

.pill-orange-solid >>> .v-input__slot {
  background-color: #ff8f00 !important;
}

.pill-orange-solid >>> .v-select__selection,
.pill-orange-solid >>> .v-icon,
.pill-green-solid >>> .v-select__selection,
.pill-green-solid >>> .v-icon {
  color: #ffffff !important;
}

.pill-green-solid >>> .v-input__slot {
  background-color: #4caf50 !important;
}

.pill-orange-grade >>> .v-input__slot {
  background-color: #ffa91c !important;
  border: 1px solid #ffa91c !important;
}

.pill-orange-grade >>> .v-select__selection,
.pill-orange-grade >>> .v-icon {
  color: #ffffff !important;
}

.pill-blue-grade >>> .v-input__slot {
  background-color: #2196f3 !important;
  border: 1px solid #2196f3 !important;
}

.pill-blue-grade >>> .v-select__selection,
.pill-blue-grade >>> .v-icon {
  color: #ffffff !important;
}

.action-dots-btn {
  color: #555;}

.popup-action-menu {
  min-width: 150px;
}

.custom-table >>> td {
  font-size: 12px !important;
}

.gap-3 {
  gap: 12px;
}

.toast-queue-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 999999 !important;
  display: flex;
  flex-direction: column;
  pointer-events: none;
}

.custom-toast-item {
  width: 380px;
  max-width: calc(100vw - 40px);
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  pointer-events: auto;
}

.toast-success {
  background-color: #2e7d32 !important;
}

.toast-error {
  background-color: #c62828 !important;
}

.toast-content {
  min-height: 48px;
}

.toast-text {
  font-size: 14px;
  line-height: 1.4;
}

.close-toast-btn {
  flex: 0 0 auto;
  opacity: 0.85;
}

.close-toast-btn:hover {
  opacity: 1;
}

.toast-progress-bar-container {
  width: 100%;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.3);
}

.toast-progress-bar {
  height: 100%;
  background-color: #a5d6a7;
  transition: width 0.03s linear;
}

.toast-list-enter-active,
.toast-list-leave-active,
.toast-list-move {
  transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.toast-list-enter {
  opacity: 0;
  transform: translateX(60px);
}

.toast-list-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.toast-list-leave-active {
  position: absolute;
  width: 100%;
}

.status-confirm-card {
  border-radius: 12px !important;
  overflow: hidden;
}

.status-confirm-header {
  background-color: #a62229;
}

.status-confirm-message {
  color: #1f2937;
  line-height: 1.5;
}

.status-warning-alert {
  background-color: #fff8e1 !important;
  border: 1px solid #ffe082 !important;
  border-radius: 8px;
}

.status-confirm-button {
  background-color: #a62229 !important;
  border-radius: 8px !important;
  height: 40px !important;
}
</style>

<style>
.v-menu__content {
  z-index: 9999 !important;
  max-height: 300px !important;
}
</style>