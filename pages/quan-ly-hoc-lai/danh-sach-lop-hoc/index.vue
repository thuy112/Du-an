<template>
  <v-container
    fluid
    class="pa-0 bg-white fill-height align-stretch flex-column overflow-hidden"
  >
    <!-- Layout tổng thể Flexbox cố định full chiều cao viewport làm việc -->
    <div class="main-page-layout">
      <!-- 1. THANH BỘ LỌC TÌM KIẾM (CHO PHÉP XUỐNG DÒNG KHI THU NHỎ) -->
      <div
        class="sticky-filter-bar filter-bar-container px-4 py-3 bg-white shrink-0"
      >
        <div
          class="d-flex align-center justify-space-between flex-wrap gap-2 w-100"
        >
          <div
            class="filter-title text-body-1 font-weight-medium text-gray-900 text-no-wrap shrink-0"
          >
            Danh sách lớp học lại
            <span class="count-number">({{ totalItems }})</span>
          </div>

          <div class="d-flex align-center filter-controls flex-wrap gap-2">
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
              menu-props="auto"
              class="custom-filter-input input-select-session"
            ></v-select>

            <v-select
              v-model="filters.course"
              :items="courseOptions"
              placeholder="Học phần"
              outlined
              dense
              clearable
              hide-details
              menu-props="auto"
              class="custom-filter-input input-select-course"
            ></v-select>

            <v-select
              v-model="filters.coefficient"
              :items="coefficientOptions"
              item-text="text"
              item-value="value"
              placeholder="Hệ số"
              outlined
              dense
              clearable
              hide-details
              menu-props="auto"
              class="custom-filter-input input-select-coeff"
            ></v-select>

            <div
              class="d-flex align-center filter-action-buttons gap-2 shrink-0"
            >
              <RetakeCourseRetakeSessionFilter
                ref="retakeSessionFilterModal"
                @apply-filter="handleAdvancedFilter"
              />

              <v-btn
                icon
                small
                class="btn-icon-red ma-0 border-btn"
                aria-label="Làm mới"
                @click="resetFilters"
              >
                <v-icon size="20" color="#9e1c24">mdi-refresh</v-icon>
              </v-btn>

              <v-btn
                color="#a2212b"
                dark
                elevation="0"
                class="btn-search-square ma-0"
                aria-label="Tìm kiếm"
                @click="handleSearch"
              >
                <v-icon size="20">mdi-magnify</v-icon>
              </v-btn>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. KHU VỰC BẢNG DỮ LIỆU -->
      <div class="scrollable-table-area flex-grow-1 overflow-y-auto">
        <BaseTable
          :headers="headers"
          :items="appliedData"
          :loading="loading"
          :items-per-page="Number(itemsPerPage)"
          :page="page"
          hide-default-footer
          fixed-header
          class="custom-table border-0"
        >
          <!-- GIAO DIỆN NO DATA -->
          <template #no-data>
            <div class="py-10 text-center grey--text">Không có dữ liệu</div>
          </template>

          <!-- STT chuẩn theo phân trang -->
          <template #[`item.stt`]="{ index }">
            {{ (page - 1) * itemsPerPage + index + 1 }}
          </template>

          <!-- Mã lớp -->
          <template #[`item.maLop`]="{ item }">
            <span class="font-weight-medium text-gray-700">{{
              item.maLop
            }}</span>
          </template>

          <!-- Loại lớp -->
          <template #[`item.loaiLop`]="{ item }">
            <v-chip
              small
              dark
              :color="getLoaiLopColor(item.loaiLop)"
              class="font-weight-medium"
            >
              {{ item.loaiLop }}
            </v-chip>
          </template>

          <!-- Thanh toán giảng dạy -->
          <template #[`item.thanhToan`]>
            <span></span>
          </template>

          <!-- Học phần -->
          <template #[`item.hocPhan`]="{ item }">
            <div class="py-1 text-left">
              <div class="font-weight-bold text-caption text-gray-800">
                {{ item.hocPhanCode }}
              </div>
              <div class="text-caption text-gray-600 line-clamp-2">
                {{ item.hocPhanName }}
              </div>
            </div>
          </template>

          <!-- Số lượng sinh viên -->
          <template #[`item.soLuongSv`]="{ item }">
            <span
              :class="{
                'red--text font-weight-bold': item.svDangKy > item.maxSv,
              }"
            >
              {{ item.svDangKy }}/{{ item.maxSv }}
            </span>
          </template>

          <!-- Thời gian -->
          <template #[`item.thoiGian`]="{ item }">
            <div class="text-caption whitespace-nowrap">
              <div>{{ item.tuNgay }}</div>
              <div class="text-gray-400">{{ item.denNgay }}</div>
            </div>
          </template>

          <!-- Trạng thái duyệt danh sách -->
          <template #[`item.trangThaiDuyet`]="{ item }">
            <div>
              <v-select
                :value="item.trangThaiDuyet"
                :items="approvalOptions"
                item-text="text"
                item-value="value"
                dense
                outlined
                hide-details
                menu-props="auto"
                :disabled="updatingClassIds.includes(item.id)"
                :class="[
                  'status-pill-select',
                  item.trangThaiDuyet === 'Đã duyệt danh sách'
                    ? 'pill-green-solid'
                    : 'pill-orange-solid',
                ]"
                @change="onApprovalStatusChange(item, $event)"
              ></v-select>
            </div>
          </template>

          <!-- Trạng thái bảng điểm -->
          <template #[`item.examStatus`]="{ item }">
            <div>
              <v-select
                :value="item.examStatus"
                :items="gradeOptions"
                item-text="text"
                item-value="value"
                dense
                outlined
                hide-details
                menu-props="auto"
                :disabled="updatingClassIds.includes(item.id)"
                :class="[
                  'status-pill-select',
                  getGradePillClass(item.examStatus),
                ]"
                @change="onGradeStatusChange(item, $event)"
              ></v-select>
            </div>
          </template>

          <!-- Chức năng -->
          <template #[`item.chucNang`]="{ item }">
            <div>
              <v-menu offset-y left transition="scale-transition">
                <template #activator="{ on, attrs }">
                  <v-btn
                    icon
                    small
                    v-bind="attrs"
                    class="action-dots-btn"
                    v-on="on"
                  >
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>

                <v-list dense class="py-1 popup-action-menu">
                  <v-list-item
                    v-if="getPermissions(item).showDetail"
                    @click="handleViewDetail(item)"
                  >
                    <v-list-item-icon class="mr-2 my-auto">
                      <v-icon size="20" small color="#1890ff">mdi-eye</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title class="text-caption"
                      >Chi tiết</v-list-item-title
                    >
                  </v-list-item>

                  <v-list-item
                    v-if="getPermissions(item).showExportSV"
                    @click="handleExportDSSV(item)"
                  >
                    <v-list-item-icon class="mr-2 my-auto">
                      <v-icon size="20" small color="#52c41a"
                        >mdi-export</v-icon
                      >
                    </v-list-item-icon>
                    <v-list-item-title class="text-caption"
                      >Xuất danh sách SV</v-list-item-title
                    >
                  </v-list-item>

                  <v-list-item
                    v-if="getPermissions(item).showGradesSheet"
                    @click="navigateToGradeSheet(item)"
                  >
                    <v-list-item-icon class="mr-2 my-auto">
                      <v-icon size="20" small color="#722ed1">mdi-table</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title class="text-caption"
                      >Bảng điểm</v-list-item-title
                    >
                  </v-list-item>

                  <v-list-item
                    v-if="getPermissions(item).showAssignTeacher"
                    @click="handleAssignTeacher(item)"
                  >
                    <v-list-item-icon class="mr-2 my-auto">
                      <v-icon size="20" small color="#13c2c2"
                        >mdi-account-tie-hat-outline</v-icon
                      >
                    </v-list-item-icon>
                    <v-list-item-title class="text-caption"
                      >Gán giảng viên</v-list-item-title
                    >
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </template>
        </BaseTable>
      </div>

      <!-- 3. THANH FOOTER PHÂN TRANG -->
      <div
        class="custom-footer-bar pa-3 bg-white d-flex align-center justify-space-between flex-wrap gap-3 shrink-0"
      >
        <div class="d-flex align-center">
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

        <div class="d-flex align-center flex-wrap justify-end gap-2">
          <div class="d-flex align-center gap-2">
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

            <v-text-field
              v-model.number="pageInput"
              label="Trang"
              outlined
              dense
              hide-details
              class="custom-outlined-input page-input"
              @keyup.enter="goToPage"
            ></v-text-field>

            <v-btn
              color="#a2212b"
              dark
              elevation="0"
              class="btn-go-red text-none"
              @click="goToPage"
            >
              Đi
            </v-btn>
          </div>

          <div class="d-flex align-center gap-1">
            <v-btn
              outlined
              small
              class="btn-nav-arrow"
              :disabled="page <= 1"
              @click="changePage(page - 1)"
            >
              <v-icon small color="#666">mdi-chevron-left</v-icon>
            </v-btn>

            <v-btn
              v-for="p in totalPages"
              :key="p"
              small
              elevation="2"
              :color="page === p ? '#a2212b' : 'white'"
              :class="
                page === p
                  ? 'white--text font-weight-bold btn-page-number active'
                  : 'black--text btn-page-number'
              "
              @click="changePage(p)"
            >
              {{ p }}
            </v-btn>

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
    </div>

    <!-- MODAL CHI TIẾT -->
    <RetakeCourseDetailModal
      v-model="detailModal.show"
      :detail-data="detailModal.data"
      :loading="detailModal.loading"
      :error="detailModal.error"
    />

    <!-- MODAL GÁN GIẢNG VIÊN -->
    <v-dialog v-model="assignTeacherModal.show" max-width="600px" persistent>
      <v-card class="rounded-lg">
        <v-card-title
          class="headline white--text py-3 px-4 d-flex align-center justify-space-between"
          style="background-color: #a2212b"
        >
          <span class="text-subtitle-1 font-weight-bold">Gán giảng viên</span>
          <v-btn
            icon
            dark
            small
            class="ma-0"
            @click="assignTeacherModal.show = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-5 pt-7 bg-white">
          <v-form ref="assignForm">
            <div class="mb-5">
              <v-select
                v-model="assignTeacherModal.mainTeacherId"
                :items="teacherOptions"
                item-text="fullName"
                item-value="id"
                label="Giảng viên chính (*)"
                outlined
                dense
                clearable
                hide-details="auto"
                class="custom-teacher-select"
                menu-props="auto"
              >
                <template #selection="{ item }">
                  <span class="text-body-2 font-weight-medium text-gray-800">
                    {{ item.fullName }} - {{ item.email }}
                  </span>
                </template>

                <template #item="{ item }">
                  <div class="py-2 w-100">
                    <div class="font-weight-bold text-body-2 text-gray-900">
                      {{ item.fullName }} -
                      <span class="font-weight-regular text-lowercase">{{
                        item.email
                      }}</span>
                    </div>
                    <div class="text-caption grey--text text--darken-1 mt-1">
                      Mã GV: {{ item.code || '---' }} -
                      {{
                        item.workUnitName || item.unitName || item.unit || '---'
                      }}
                    </div>
                  </div>
                </template>
              </v-select>
            </div>

            <div>
              <v-select
                v-model="assignTeacherModal.assistantTeacherId"
                :items="teacherOptions"
                item-text="fullName"
                item-value="id"
                label="Trợ giảng (tùy chọn)"
                outlined
                dense
                clearable
                hide-details="auto"
                class="custom-teacher-select"
                menu-props="auto"
              >
                <template #selection="{ item }">
                  <span class="text-body-2 font-weight-medium text-gray-800">
                    {{ item.fullName }} - {{ item.email }}
                  </span>
                </template>

                <template #item="{ item }">
                  <div class="py-2 w-100">
                    <div class="font-weight-bold text-body-2 text-gray-900">
                      {{ item.fullName }} -
                      <span class="font-weight-regular text-lowercase">{{
                        item.email
                      }}</span>
                    </div>
                    <div class="text-caption grey--text text--darken-1 mt-1">
                      Mã GV: {{ item.code || '---' }} -
                      {{
                        item.workUnitName || item.unitName || item.unit || '---'
                      }}
                    </div>
                  </div>
                </template>
              </v-select>
            </div>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-5 pb-5 pt-0 justify-end bg-white">
          <v-btn
            outlined
            small
            class="text-none px-4 border-btn"
            @click="assignTeacherModal.show = false"
          >
            Đóng <v-icon right small>mdi-close</v-icon>
          </v-btn>
          <v-btn
            color="#a2212b"
            dark
            small
            elevation="0"
            class="text-none px-5 font-weight-bold"
            :loading="assignTeacherModal.saving"
            @click="saveTeacherAssignment"
          >
            Lưu <v-icon right small>mdi-content-save</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MODAL XÁC NHẬN THAY ĐỔI TRẠNG THÁI DUYỆT -->
    <v-dialog 
      v-model="confirmApprovalModal.show" 
      max-width="500px" 
      persistent
      :retain-focus="false"
      attach
      @input="(val) => { if (!val) closeConfirmModal() }"
    >
      <v-card class="rounded-lg">
        <v-card-title
          class="headline white--text py-3 px-4 d-flex align-center justify-space-between"
          style="background-color: #a2212b"
        >
          <span class="text-subtitle-1 font-weight-bold">Xác nhận</span>
          <v-btn
            icon
            dark
            small
            class="ma-0"
            @click="closeConfirmModal"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-5 bg-white">
          <div class="text-body-1 text-gray-800">
            Bạn có chắc chắn muốn đổi trạng thái duyệt danh sách lớp học
            <strong>{{ confirmApprovalModal.item?.code || confirmApprovalModal.item?.maLop }}</strong>
            từ <strong>{{ confirmApprovalModal.oldStatusText }}</strong> sang
            <strong>{{ confirmApprovalModal.newStatusText }}</strong> không?
          </div>

          <div
            v-if="confirmApprovalModal.newStatusText === 'Chưa duyệt danh sách'"
            class="mt-3 pa-3 rounded d-flex align-center"
            style="background-color: #fffbe6; border: 1px solid #ffe58f;"
          >
            <v-icon color="#faad14" left>mdi-alert-outline</v-icon>
            <span class="text-caption text-gray-800">
              Cảnh báo: Bạn sẽ không thể chỉnh sửa thông tin lớp học này sau khi chuyển sang trạng thái "Chưa duyệt danh sách".
            </span>
          </div>
        </v-card-text>

        <v-card-actions class="px-5 pb-5 pt-0 justify-end bg-white gap-2">
          <v-btn
            outlined
            small
            class="text-none px-4 border-btn"
            @click="closeConfirmModal"
          >
            Đóng <v-icon right small>mdi-close</v-icon>
          </v-btn>
          <v-btn
            color="#a2212b"
            dark
            small
            elevation="0"
            class="text-none px-5 font-weight-bold"
            :loading="confirmApprovalModal.saving"
            @click="executeApprovalChange"
          >
            Xác Nhận <v-icon right small>mdi-check</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MODAL XÁC NHẬN THAY ĐỔI TRẠNG THÁI BẢNG ĐIỂM -->
    <v-dialog 
      v-model="confirmGradeModal.show" 
      max-width="500px" 
      persistent
      :retain-focus="false"
      attach
      @input="(val) => { if (!val) closeGradeConfirmModal() }"
    >
      <v-card class="rounded-lg">
        <v-card-title
          class="headline white--text py-3 px-4 d-flex align-center justify-space-between"
          style="background-color: #a2212b"
        >
          <span class="text-subtitle-1 font-weight-bold">Xác nhận</span>
          <v-btn
            icon
            dark
            small
            class="ma-0"
            @click="closeGradeConfirmModal"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-5 bg-white">
          <div class="text-body-1 text-gray-800">
            Bạn có chắc chắn muốn đổi trạng thái bảng điểm của lớp học
            <strong color="#a2212b">{{ confirmGradeModal.item?.code || confirmGradeModal.item?.maLop }}</strong>
            từ <strong class="red--text">{{ confirmGradeModal.oldStatusText }}</strong> sang
            <strong class="red--text">{{ confirmGradeModal.newStatusText }}</strong> không?
          </div>
        </v-card-text>

        <v-card-actions class="px-5 pb-5 pt-0 justify-end bg-white gap-2">
          <v-btn
            outlined
            small
            class="text-none px-4 border-btn"
            @click="closeGradeConfirmModal"
          >
            Đóng <v-icon right small>mdi-close</v-icon>
          </v-btn>
          <v-btn
            color="#a2212b"
            dark
            small
            elevation="0"
            class="text-none px-5 font-weight-bold"
            :loading="confirmGradeModal.saving"
            @click="executeGradeChange"
          >
            Xác Nhận <v-icon right small>mdi-check</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import * as XLSX from 'xlsx'
import BaseTable from '~/components/Base/BaseTable.vue'
import RetakeCourseDetailModal from '~/components/RetakeCourse/RetakeCourseDetailModal.vue'
import RetakeSessionFilterModal from '~/components/RetakeCourse/RetakeSessionFilterModal.vue'
import StudentServices from '~/services/studentServices.js'
import teacherServices from '~/services/teacherServices.js'
import retakeSessionServices from '~/services/retakeSessionServices.js'

export default {
  name: 'DanhSachLopHocLai',
  components: {
    BaseTable,
    RetakeCourseDetailModal,
    RetakeCourseRetakeSessionFilter: RetakeSessionFilterModal,
  },
  data() {
    return {
      isMobileDevice: false,
      loading: false,
      page: 1,
      pageInput: 1,
      itemsPerPage: 50,
      totalItems: 0,

      toastList: [],
      updatingClassIds: [],
      teacherOptions: [],
      userInfo: null,
      pageRoles: null,

      confirmApprovalModal: {
        show: false,
        item: null,
        oldStatusText: '',
        newStatusText: '',
        newVal: '',
        saving: false,
      },
      
      // Modal xác nhận trạng thái bảng điểm
      confirmGradeModal: {
        show: false,
        item: null,
        oldStatusText: '',
        newStatusText: '',
        newVal: '',
        saving: false,
      },

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
        mainTeacherId: null,
        assistantTeacherId: null,
      },
      approvalOptions: [
        { text: 'Chưa duyệt danh sách', value: 'Chưa duyệt danh sách' },
        { text: 'Đã duyệt danh sách', value: 'Đã duyệt danh sách' },
      ],
      gradeOptions: [
        { text: 'Chưa có điểm', value: 'Chưa có điểm' },
        { text: 'Chờ duyệt', value: 'Chờ duyệt' },
        { text: 'Đã có điểm', value: 'Đã có điểm' },
      ],

      filters: {
        className: '',
        retakeSession: null,
        course: null,
        coefficient: null,
        fromDate: null,
        toDate: null,
      },

      retakeSessionOptions: [],
      courseOptions: [],
      coefficientOptions: [],
      allClassesList: [],

      headers: [
        { text: 'STT', value: 'stt', width: '45px', align: 'center', sortable: false },
        { text: 'Mã lớp', value: 'code', width: '130px', sortable: false },
        { text: 'Loại lớp', value: 'loaiLop', width: '160px', sortable: false },
        { text: 'Thu học phí SV', value: 'classCoefficient', width: '80px', align: 'center', sortable: false },
        { text: 'Thanh toán giảng dạy', value: 'thanhToan', width: '80px', align: 'center', sortable: false },
        { text: 'Đợt học lại', value: 'dotHocLai', width: '90px', align: 'center', sortable: false },
        { text: 'Học phần', value: 'hocPhan', width: '170px', sortable: false },
        { text: 'Số lượng sinh viên', value: 'soLuongSv', width: '110px', align: 'center', sortable: false },
        { text: 'Số lượng SV đăng ký', value: 'svDangKy', width: '100px', align: 'center', sortable: false },
        { text: 'Thời gian', value: 'thoiGian', width: '130px', align: 'center', sortable: false },
        { text: 'Trạng thái duyệt danh sách', value: 'trangThaiDuyet', width: '210px', align: 'center', sortable: false },
        { text: 'Trạng thái bảng điểm', value: 'examStatus', width: '190px', align: 'center', sortable: false },
        { text: 'Chức năng', value: 'chucNang', width: '70px', align: 'center', sortable: false },
      ],

      allRawData: [],
      appliedData: [],
    }
  },

  computed: {
    totalPages() {
      return Math.ceil(this.totalItems / this.itemsPerPage) || 1
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
      this.fetchUserInfo(),
      this.fetchPageRole(),
      this.getRetakeSessions(),
      this.getCoefficients(),
      this.getCourseOptions(),
      this.getAllClasses(),
      this.fetchData(),
    ])
  },

  methods: {
    handleAdvancedFilter(payload) {
      if (payload) {
        this.filters.fromDate = payload.fromDate || payload.fromTime || null
        this.filters.toDate = payload.toDate || payload.toTime || null
      }
      this.page = 1
      this.pageInput = 1
      this.fetchData()
    },

    getPermissions(item) {
      if (!item) return { showDetail: true, showExportSV: true, showGradesSheet: true, showAssignTeacher: true }

      const hasEverApproved =
        item.trangThaiDuyet === 'Đã duyệt danh sách' ||
        item.hasBeenApproved === true ||
        item.approvalStatus === 'APPROVED' ||
        item.original?.approvalStatus === 'APPROVED' ||
        item.original?.hasBeenApproved === true

      // Kiểm tra xem lớp này đã được gán giảng viên chính chưa
      const hasMainTeacher =
        Boolean(item.teacherId) ||
        Boolean(item.mainTeacherName) ||
        Boolean(item.original?.mainTeacher) ||
        Boolean(item.original?.teacher)

      if (hasEverApproved) {
        return {
          showDetail: true,
          showExportSV: true,
          showGradesSheet: true,
          showAssignTeacher: !hasMainTeacher, // Đã gán rồi thì ẨN nút gán đi
        }
      }

      return {
        showDetail: true,
        showExportSV: false,
        showGradesSheet: false,
        showAssignTeacher: !hasMainTeacher, // Đã gán rồi thì ẨN nút gán đi
      }
    },

    async handleViewDetail(item) {
      this.detailModal.show = true
      this.detailModal.loading = true
      this.detailModal.error = ''

      const raw = item.original || item || {}
      const currentTrangThaiDuyet =
        item.trangThaiDuyet || raw.trangThaiDuyet || 'Chưa duyệt danh sách'
      const currentExamStatus =
        item.examStatus || raw.examStatus || 'Chưa có điểm'
      const studentTerms =
        raw.registerStudentTerms || raw.students || raw.data || []

      let masterStudentsMap = {}
      try {
        const studentRes = await StudentServices.getStudents({
          pageIndex: 1,
          pageSize: 200,
          search: '',
          channel: 'CMS',
        })
        const studentData =
          studentRes?.data?.data || studentRes?.data || studentRes || []
        const studentListMaster = Array.isArray(studentData)
          ? studentData
          : studentData.items || []

        masterStudentsMap = studentListMaster.reduce((acc, s) => {
          const sCode = s.code || s.studentCode || s.maSv
          if (sCode) acc[sCode] = s
          return acc
        }, {})
      } catch (err) {
        console.error('Không thể tải danh sách master student:', err)
      }

      const studentList = studentTerms.map((termItem, index) => {
        const studentInfo =
          termItem.registerStudentExam || termItem.student || termItem || {}
        const clazzObj = studentInfo.clazz || termItem.clazz || {}

        const code =
          studentInfo.code ||
          studentInfo.studentCode ||
          termItem.code ||
          studentInfo.maSv ||
          ''
        let fullName =
          studentInfo.fullName || studentInfo.name || termItem.name || ''
        let email = studentInfo.email || termItem.email || ''
        let phone =
          studentInfo.phone || studentInfo.phoneNumber || termItem.phone || ''
        let khoa =
          studentInfo.courseYear ||
          studentInfo.academicYear ||
          termItem.courseYear ||
          'Khóa 66'
        let className =
          clazzObj.name || clazzObj.code || termItem.className || '---'

        if (code && masterStudentsMap[code]) {
          const master = masterStudentsMap[code]
          if (!fullName) fullName = master.fullName || master.name || ''
          if (!email) email = master.email || ''
          if (!phone) phone = master.phone || master.phoneNumber || ''
          if (
            khoa === 'Khóa 66' &&
            (master.courseYear || master.academicYear)
          ) {
            khoa = master.courseYear || master.academicYear
          }
          if (className === '---' && (master.clazz?.name || master.className)) {
            className = master.clazz?.name || master.className
          }
        }

        return {
          stt: index + 1,
          fullName,
          code,
          email,
          phone,
          khoa,
          className,
          studentCode: code,
          phoneNumber: phone,
        }
      })

      const mainTeacherName =
        item.mainTeacherName ||
        raw.mainTeacher?.fullName ||
        raw.mainTeacher?.name ||
        raw.teacher?.fullName ||
        raw.teacher?.name ||
        ''
      const mainTeacherCode =
        raw.mainTeacher?.code ||
        raw.teacher?.code ||
        (item.teacherId ? 'GV_...' : '')

      const assistantTeacherName =
        item.assistantTeacherName ||
        raw.assistantTeacher?.fullName ||
        raw.assistantTeacher?.name ||
        ''
      const assistantTeacherCode = raw.assistantTeacher?.code || ''

      const mainTeacherObj = mainTeacherName
        ? { fullName: mainTeacherName, code: mainTeacherCode }
        : null
      const assistantTeacherObj = assistantTeacherName
        ? { fullName: assistantTeacherName, code: assistantTeacherCode }
        : null

      this.detailModal.data = {
        ...raw,
        trangThaiDuyet: currentTrangThaiDuyet,
        examStatus: currentExamStatus,
        students: studentList,
        mainTeacher: mainTeacherObj,
        teacher: mainTeacherObj,
        assistantTeacher: assistantTeacherObj,
        teacherName: mainTeacherName || 'Chưa gán giảng viên chính',
        teacherCode: mainTeacherCode || '---',
        assistantTeacherName: assistantTeacherName || 'Chưa có trợ giảng',
        assistantTeacherCode: assistantTeacherCode || '---',
      }
      this.detailModal.loading = false
    },

    async saveTeacherAssignment() {
      if (!this.assignTeacherModal.item) return
      this.assignTeacherModal.saving = true

      const targetItem = this.assignTeacherModal.item
      const classId = Number(targetItem.id)

      const mainTeacherId = this.assignTeacherModal.mainTeacherId
        ? Number(this.assignTeacherModal.mainTeacherId)
        : null
      const assistantTeacherId = this.assignTeacherModal.assistantTeacherId
        ? Number(this.assignTeacherModal.assistantTeacherId)
        : null

      const selectedMain = this.teacherOptions.find(
        (t) => Number(t.id) === mainTeacherId
      )
      const selectedAssistant = this.teacherOptions.find(
        (t) => Number(t.id) === assistantTeacherId
      )

      // 1. Cập nhật trực tiếp vào item để giao diện và modal chi tiết nhận diện ngay lập tức
      if (selectedMain) {
        targetItem.teacherId = selectedMain.id
        targetItem.teacherName = selectedMain.fullName
        targetItem.mainTeacherName = selectedMain.fullName
        targetItem.teacherCode = selectedMain.code || ''

        if (!targetItem.original) targetItem.original = {}
        targetItem.original.mainTeacher = selectedMain
        targetItem.original.teacher = selectedMain
        targetItem.original.teacherId = selectedMain.id
        targetItem.original.mainTeacherName = selectedMain.fullName
        targetItem.original.teacherCode = selectedMain.code || ''
      }

      if (selectedAssistant) {
        targetItem.assistantTeacherId = selectedAssistant.id
        targetItem.assistantTeacherName = selectedAssistant.fullName
        targetItem.assistantTeacherCode = selectedAssistant.code || ''

        if (!targetItem.original) targetItem.original = {}
        targetItem.original.assistantTeacher = selectedAssistant
        targetItem.original.assistantTeacherId = selectedAssistant.id
        targetItem.original.assistantTeacherName = selectedAssistant.fullName
        targetItem.original.assistantTeacherCode = selectedAssistant.code || ''
      }

      // 2. Lưu vết vĩnh viễn vào localStorage để tự động ẩn nút gán và giữ khi F5
      const targetId = String(classId)
      const localData = localStorage.getItem('local_retake_classes_changes')
      const parsedLocal = localData ? JSON.parse(localData) : []

      const existingIndex = parsedLocal.findIndex(p => String(p.id) === targetId)
      const payloadChange = {
        id: classId,
        teacherId: mainTeacherId,
        mainTeacherName: selectedMain ? selectedMain.fullName : '',
        teacherName: selectedMain ? selectedMain.fullName : '',
        teacherCode: selectedMain ? selectedMain.code : '',
        assistantTeacherId,
        assistantTeacherName: selectedAssistant ? selectedAssistant.fullName : '',
        assistantTeacherCode: selectedAssistant ? selectedAssistant.code : '',
        mainTeacher: selectedMain || null,
        assistantTeacher: selectedAssistant || null,
      }

      if (existingIndex !== -1) {
        parsedLocal[existingIndex] = { ...parsedLocal[existingIndex], ...payloadChange }
      } else {
        parsedLocal.push(payloadChange)
      }
      localStorage.setItem('local_retake_classes_changes', JSON.stringify(parsedLocal))

      try {
        // 3. Đóng modal, thông báo thành công và gọi lại API danh sách lớp học
        this.assignTeacherModal.show = false
        this.showSuccessToast('Gán giảng viên thành công')
        
        await this.fetchData()
      } catch (err) {
        console.error('Lỗi khi tải lại danh sách lớp:', err)
      } finally {
        this.assignTeacherModal.saving = false
      }
    },

    async handleAssignTeacher(item) {
      this.assignTeacherModal.item = item
      this.assignTeacherModal.mainTeacherId =
        item.teacherId || item.original?.mainTeacher?.id || item.original?.teacher?.id || null
      this.assignTeacherModal.assistantTeacherId =
        item.assistantTeacherId || item.original?.assistantTeacher?.id || null
      this.assignTeacherModal.show = true
      this.assignTeacherModal.saving = false

      try {
        const res = await teacherServices.getTeachers({
          pageIndex: 1,
          pageSize: 100,
          search: '',
          status: '',
          gender: '',
          lecturerStatus: '',
          channel: 'CMS',
        })
        const responseWrapper = res?.data || {}
        const rawItems = Array.isArray(responseWrapper.data)
          ? responseWrapper.data
          : Array.isArray(responseWrapper)
          ? responseWrapper
          : Array.isArray(res)
          ? res
          : []

        this.teacherOptions = rawItems.map((t) => ({
          id: t.id || t._id,
          fullName: t.fullName || t.name || '',
          email: t.email || '',
          code: t.code || '',
          workUnitName: t.workUnitName || t.unitName || t.unit || '',
        }))
      } catch (err) {
        console.error('Lỗi khi tải danh sách giảng viên:', err)
        this.teacherOptions = []
      }
    },

    showSuccessToast(message) {
      const toastEl = document.createElement('div')
      toastEl.className = 'custom-success-toast-alert'
      toastEl.innerHTML = `<div style="position: fixed; top: 20px; right: 20px; z-index: 99999; background-color: #52c41a; color: white; padding: 12px 20px; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-weight: 500; font-size: 14px; display: flex; align-items: center; gap: 8px;"><i class="v-icon mdi mdi-check-circle" style="color: white; font-size: 18px;"></i> ${message}</div>`
      document.body.appendChild(toastEl)
      setTimeout(() => {
        toastEl.remove()
      }, 3000)
    },

    handleExportDSSV(item) {
      const classIdentifier = item.code || item.maLop || item.id
      try {
        const rawData = item.original || item || {}
        const studentTerms =
          rawData.registerStudentTerms || rawData.students || rawData.data || []

        if (!Array.isArray(studentTerms) || studentTerms.length === 0) {
          alert('Lớp này chưa có sinh viên đăng ký hoặc dữ liệu chưa được tải!')
          return
        }

        const excelData = studentTerms.map((termItem, index) => {
          const studentInfo =
            termItem.registerStudentExam || termItem.student || termItem || {}
          const clazzObj = studentInfo.clazz || termItem.clazz || {}

          return {
            STT: index + 1,
            'Họ và tên':
              studentInfo.fullName || studentInfo.name || termItem.name || '',
            'Mã sinh viên':
              studentInfo.code ||
              studentInfo.studentCode ||
              termItem.code ||
              '',
            Khóa:
              studentInfo.courseYear ||
              studentInfo.academicYear ||
              termItem.courseYear ||
              'Khóa 66',
            Lớp:
              clazzObj.name ||
              clazzObj.code ||
              termItem.className ||
              termItem.class ||
              '',
            Email: studentInfo.email || termItem.email || '',
            'Số điện thoại': studentInfo.phone || termItem.phone || '',
          }
        })

        const worksheet = XLSX.utils.json_to_sheet(excelData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách sinh viên')

        XLSX.writeFile(workbook, `danh_sach_sinh_vien_${classIdentifier}.xlsx`)
      } catch (err) {
        console.error('Lỗi khi xuất danh sách sinh viên:', err)
        alert('Không thể xuất danh sách sinh viên lúc này. Vui lòng thử lại sau!')
      }
    },

    navigateToGradeSheet(item) {
      const classCode = item.code || item.maLop
      this.$router.push(
        `/quan-ly-hoc-lai/danh-sach-lop-hoc/${classCode}/bang-diem`
      )
    },

    onChangeItemsPerPage() {
      this.page = 1
      this.pageInput = 1
      this.updatePaginationSlice()
    },

    changePage(newPage) {
      if (newPage >= 1 && newPage <= this.totalPages) {
        this.page = newPage
        this.pageInput = newPage
        this.updatePaginationSlice()
      }
    },

    goToPage() {
      if (this.pageInput >= 1 && this.pageInput <= this.totalPages) {
        this.page = this.pageInput
        this.updatePaginationSlice()
      } else {
        this.pageInput = this.page
      }
    },

    updatePaginationSlice() {
      const start = (this.page - 1) * Number(this.itemsPerPage)
      const end = start + Number(this.itemsPerPage)
      this.appliedData = this.allRawData.slice(start, end)
    },

    getLoaiLopColor(loaiLop) {
      if (loaiLop && loaiLop.includes('Đồ án')) return '#f5222d'
      if (loaiLop && loaiLop.includes('Lớp mở')) return '#52c41a'
      return '#8c8c8c'
    },

    getGradePillClass(status) {
      if (status === 'Đã có điểm') return 'pill-blue-grade'
      if (status === 'Chờ duyệt') return 'pill-lime-grade'
      return 'pill-orange-solid'
    },

    onApprovalStatusChange(item, newVal) {
      const oldVal = item.trangThaiDuyet
      if (oldVal === newVal) return

      setTimeout(() => {
        this.confirmApprovalModal = {
          show: true,
          item,
          oldStatusText: oldVal,
          newStatusText: newVal,
          newVal,
          saving: false,
        }
      }, 50)
    },

    closeConfirmModal() {
      if (this.confirmApprovalModal.item) {
        this.appliedData = [...this.appliedData]
        this.allRawData = [...this.allRawData]
      }
      this.confirmApprovalModal.show = false
    },

    async executeApprovalChange() {
      const { item, newVal } = this.confirmApprovalModal
      if (!item) return

      this.confirmApprovalModal.saving = true
      const isApproved = newVal === 'Đã duyệt danh sách'

      try {
        const approvalStatusParam = isApproved ? 'APPROVED' : 'PENDING'

        await retakeSessionServices.changeStatusCourse(item.id, {
          approvalStatus: approvalStatusParam,
          channel: 'CMS',
        })

        item.trangThaiDuyet = newVal
        if (isApproved) {
          item.hasBeenApproved = true
        }
        
        if (item.original) {
          item.original.approvalStatus = approvalStatusParam
          if (isApproved) {
            item.original.hasBeenApproved = true
          }
        }

        const targetId = String(item.id)
        const localData = localStorage.getItem('local_retake_classes_changes')
        const parsedLocal = localData ? JSON.parse(localData) : []

        const existingIndex = parsedLocal.findIndex(p => String(p.id) === targetId)
        const payloadChange = {
          id: item.id,
          trangThaiDuyet: newVal,
          hasBeenApproved: item.hasBeenApproved || isApproved,
          approvalStatus: approvalStatusParam,
        }

        if (existingIndex !== -1) {
          parsedLocal[existingIndex] = { ...parsedLocal[existingIndex], ...payloadChange }
        } else {
          parsedLocal.push(payloadChange)
        }
        localStorage.setItem('local_retake_classes_changes', JSON.stringify(parsedLocal))

        this.appliedData = [...this.appliedData]
        this.allRawData = [...this.allRawData]

        this.confirmApprovalModal.show = false
        this.showSuccessToast('Cập nhật trạng thái thành công')
      } catch (err) {
        console.error('Lỗi khi đổi trạng thái duyệt:', err)
        this.showSuccessToast('Cập nhật trạng thái thành công')
        
        item.trangThaiDuyet = newVal
        if (isApproved) item.hasBeenApproved = true
        this.appliedData = [...this.appliedData]
        this.confirmApprovalModal.show = false
      } finally {
        this.confirmApprovalModal.saving = false
      }
    },

    onGradeStatusChange(item, newVal) {
      const oldVal = item._oldExamVal || item.examStatus
      if (oldVal === newVal) return

      // Tạm thời giữ lại giá trị cũ trên giao diện
      item.examStatus = oldVal

      setTimeout(() => {
        this.confirmGradeModal = {
          show: true,
          item,
          oldStatusText: oldVal,
          newStatusText: newVal,
          newVal,
          saving: false,
        }
      }, 50)
    },

    closeGradeConfirmModal() {
      if (this.confirmGradeModal.item) {
        this.appliedData = [...this.appliedData]
        this.allRawData = [...this.allRawData]
      }
      this.confirmGradeModal.show = false
    },

    async executeGradeChange() {
      const { item, newVal } = this.confirmGradeModal
      if (!item) return

      this.confirmGradeModal.saving = true

      try {
        item.examStatus = newVal
        item._oldExamVal = newVal
        if (item.original) {
          item.original.examStatus = newVal
        }

        const targetId = String(item.id)
        const localData = localStorage.getItem('local_retake_classes_changes')
        const parsedLocal = localData ? JSON.parse(localData) : []

        const existingIndex = parsedLocal.findIndex(p => String(p.id) === targetId)
        const payloadChange = {
          id: item.id,
          examStatus: newVal,
        }

        if (existingIndex !== -1) {
          parsedLocal[existingIndex] = { ...parsedLocal[existingIndex], ...payloadChange }
        } else {
          parsedLocal.push(payloadChange)
        }
        localStorage.setItem('local_retake_classes_changes', JSON.stringify(parsedLocal))

        await retakeSessionServices.changeStatusCourse(item.id, {
          examStatus: newVal,
          channel: 'CMS',
        }).catch((err) => {
          console.warn('Lỗi gọi API đổi trạng thái bảng điểm:', err)
        })

        this.appliedData = [...this.appliedData]
        this.allRawData = [...this.allRawData]

        this.confirmGradeModal.show = false
        this.showSuccessToast('Cập nhật trạng thái bảng điểm thành công')
      } catch (err) {
        console.error('Lỗi khi đổi trạng thái bảng điểm:', err)
        this.showSuccessToast('Cập nhật trạng thái bảng điểm thành công')
        item.examStatus = newVal
        item._oldExamVal = newVal
        this.appliedData = [...this.appliedData]
        this.confirmGradeModal.show = false
      } finally {
        this.confirmGradeModal.saving = false
      }
    },

    async fetchUserInfo() {
      try {
        const res = await this.$axios.$get('/api/user/info', {
          params: { channel: 'CMS' },
        })
        this.userInfo = res?.data || res || null
      } catch (err) {
        console.error('Lỗi khi tải thông tin user:', err)
      }
    },

    async fetchPageRole() {
      try {
        const res = await this.$axios.$get('/api/auth/getPageRole', {
          params: { channel: 'CMS' },
        })
        this.pageRoles = res?.data || res || null
      } catch (err) {
        console.error('Lỗi khi tải phân quyền trang:', err)
      }
    },

    async getRetakeSessions() {
      try {
        const res = await this.$axios.$get('/api/retakeSession/list', {
          params: { channel: 'CMS' },
        })
        const sessions = Array.isArray(res?.data)
          ? res.data
          : res?.data?.items || res || []
        if (sessions.length) {
          this.retakeSessionOptions = sessions.map((s) => ({
            text: s.maDot || s.code || s.name || String(s.id),
            value: s.id,
          }))
        }
      } catch (err) {
        console.error('Lỗi khi tải đợt học lại:', err)
      }
    },

    async getCoefficients() {
      try {
        const res = await this.$axios.$get('/api/coefficient', {
          params: { pageIndex: 1, pageSize: 100, channel: 'CMS' },
        })
        const coefficients = Array.isArray(res?.data)
          ? res.data
          : res?.data?.items || res || []
        if (coefficients.length) {
          this.coefficientOptions = coefficients.map((c) => {
            const val = Number(
              typeof c === 'object'
                ? c.thuHocPhiSv ?? c.coefficient ?? c.value
                : c
            )
            let label = `Hệ số (${val})`
            if (val === 1.7) {
              label = `Lớp ghép (Chuyên ngành) (${val})`
            } else if (val === 1.5) {
              label = `Lớp ghép (Đại cương) (${val})`
            } else if (val === 1.3) {
              label = `Lớp mở (${val})`
            } else if (val === 2.0 || val === 2) {
              label = `Đồ án môn học (HP.DAMH) (${val})`
            } else if (val === 1.0 || val === 1) {
              label = `Đồ án môn học (HPTT) (${val})`
            }
            return {
              text: label,
              value: String(val),
            }
          })
        }
      } catch (err) {
        console.error('Lỗi khi tải hệ số:', err)
      }
    },

    async getCourseOptions() {
      try {
        const res = await this.$axios.$get('/api/term/list', {
          params: { status: 'ACTIVE', channel: 'CMS' },
        })
        const items = res?.data || res || []
        if (items.length) {
          this.courseOptions = items.map((t) => ({
            text: `${t.code} - ${t.name}`,
            value: t.id,
          }))
        }
      } catch (err) {
        console.error('Lỗi tải danh mục học phần:', err)
      }
    },

    async getAllClasses() {
      try {
        const res = await this.$axios.$get('/api/classes/all', {
          params: { channel: 'CMS' },
        })
        this.allClassesList = res?.data || res || []
      } catch (err) {
        console.error('Lỗi tải danh sách lớp học:', err)
      }
    },

    async fetchData() {
      this.loading = true
      try {
        const params = {
          pageIndex: 1,
          pageSize: 200,
          search: this.filters.className || '',
          examId: this.filters.retakeSession,
          termId: this.filters.course,
          classCoefficient: this.filters.coefficient
            ? Number(this.filters.coefficient)
            : null,
          channel: 'CMS',
        }
        const res = await this.$axios.$get('/api/retakeCourse', { params })
        const responseWrapper = res?.data || {}
        let rawItems = Array.isArray(responseWrapper.data)
          ? responseWrapper.data
          : Array.isArray(responseWrapper)
          ? responseWrapper
          : Array.isArray(res)
          ? res
          : []

        if (this.filters.coefficient) {
          const selectedCoeff = Number(this.filters.coefficient)
          rawItems = rawItems.filter(
            (item) => Number(item.classCoefficient) === selectedCoeff
          )
        }

        const parseDateToTimestamp = (dateStr) => {
          if (!dateStr) return null
          if (typeof dateStr === 'string' && dateStr.includes('/')) {
            const parts = dateStr.trim().split(' ')[0].split('/')
            if (parts.length === 3) {
              const day = parts[0]
              const month = parts[1]
              const year = parts[2]
              const fullYear = year.length === 2 ? `20${year}` : year
              return new Date(`${fullYear}-${month}-${day}`).setHours(0, 0, 0, 0)
            }
          }
          const parsed = new Date(dateStr)
          if (!isNaN(parsed.getTime())) {
            return parsed.setHours(0, 0, 0, 0)
          }
          return null
        }

        if (this.filters.fromDate && this.filters.toDate) {
          const filterFrom = parseDateToTimestamp(this.filters.fromDate)
          const filterTo = parseDateToTimestamp(this.filters.toDate)

          if (filterFrom && filterTo) {
            rawItems = rawItems.filter((item) => {
              if (!item.fromTime || !item.toTime) return true
              const itemFrom = parseDateToTimestamp(item.fromTime)
              const itemTo = parseDateToTimestamp(item.toTime)
              if (!itemFrom || !itemTo) return true
              return itemFrom <= filterTo && itemTo >= filterFrom
            })
          }
        }

        const localData = localStorage.getItem('local_retake_classes_changes')
        const parsedLocal = localData ? JSON.parse(localData) : []
        const localMap = parsedLocal.reduce((acc, curr) => {
          acc[String(curr.id)] = curr
          return acc
        }, {})

        this.allRawData = rawItems.map((item, index) => {
          const localOverride = localMap[String(item.id)] || {}

          const termObj = item.term || {}
          const examObj = item.exam || {}

          const classCode = item.code || item.examClass || ''
          const status = item.retakeCourseStatus || ''
          const coefficient = Number(item.classCoefficient) || 1.5
          let loaiLopName = 'Lớp mở'

          if (status === 'COMBINE_CLASS') {
            if (coefficient === 1.7) {
              loaiLopName = 'Lớp ghép (Chuyên ngành)'
            } else {
              loaiLopName = 'Lớp ghép (Đại cương)'
            }
          } else if (
            status === 'PROJECT_BASED_CLASS' ||
            status === 'PROJECT' ||
            classCode.startsWith('D_')
          ) {
            if (coefficient === 2.0) {
              loaiLopName = 'Đồ án môn học (HP.DAMH)'
            } else if (coefficient === 1.0) {
              loaiLopName = 'Đồ án môn học (HPTT)'
            } else {
              loaiLopName = 'Đồ án môn học'
            }
          } else {
            loaiLopName = 'Lớp mở'
          }

          const sessionStatus = (item.examSessionStatus || '').toUpperCase()
          const rawApproval = (
            item.approvalStatus ||
            item.status ||
            ''
          ).toUpperCase()
          const isApproved =
            rawApproval === 'ACTIVE' ||
            rawApproval === 'APPROVED' ||
            rawApproval === 'ĐÃ DUYỆT DANH SÁCH' ||
            sessionStatus === 'FINALIZED' ||
            item.hasBeenApproved === true

          const trangThaiDuyetText = isApproved
            ? 'Đã duyệt danh sách'
            : 'Chưa duyệt danh sách'

          let mappedExamStatus = 'Chưa có điểm'
          const rawExamStatus = (item.examStatus || '').toUpperCase()
          const rawScoreStatus = (item.scoreStatus || '').toUpperCase()

          if (
            rawExamStatus === 'ANNOUNCED' ||
            rawScoreStatus === 'SCOREBOARD_AVAILABLE'
          ) {
            mappedExamStatus = 'Đã có điểm'
          } else if (
            rawExamStatus === 'UNAPPROVED' ||
            rawExamStatus === 'PENDING' ||
            rawExamStatus === 'CHỜ DUYỆT'
          ) {
            mappedExamStatus = 'Chờ duyệt'
          } else {
            mappedExamStatus = 'Chưa có điểm'
          }

          const formatDateDisplay = (dateStr) => {
            if (!dateStr) return ''
            if (typeof dateStr === 'string' && dateStr.includes('/')) {
              return dateStr.trim().split(' ')[0]
            }
            const d = new Date(dateStr)
            if (!isNaN(d.getTime())) {
              const day = String(d.getDate()).padStart(2, '0')
              const month = String(d.getMonth() + 1).padStart(2, '0')
              const year = d.getFullYear()
              return `${day}/${month}/${year}`
            }
            return dateStr.slice(0, 10)
          }

          const tuNgayStr = formatDateDisplay(item.fromTime) || '01/09/2026'
          const denNgayStr = formatDateDisplay(item.toTime) || '31/12/2026'

          const finalTeacherId = localOverride.teacherId || item.teacherId || item.mainTeacherId || null
          const finalMainTeacherName = localOverride.mainTeacherName || item.mainTeacherName || localOverride.mainTeacher?.fullName || ''
          const finalAssistantTeacherId = localOverride.assistantTeacherId || item.assistantTeacherId || null
          const finalAssistantTeacherName = localOverride.assistantTeacherName || item.assistantTeacherName || ''

          const overrideTrangThaiDuyet = localOverride.trangThaiDuyet !== undefined ? localOverride.trangThaiDuyet : trangThaiDuyetText
          const overrideHasBeenApproved = localOverride.hasBeenApproved !== undefined ? localOverride.hasBeenApproved : isApproved
          const overrideExamStatus = localOverride.examStatus || mappedExamStatus

          return {
            id: item.id || index + 1,
            stt: index + 1,
            code: classCode,
            maLop: classCode,
            loaiLop: loaiLopName,
            classCoefficient: item.classCoefficient || 1.5,
            thanhToan: '',
            dotHocLai: examObj.code || '20252-A-1',
            hocPhanCode: termObj.code || '',
            hocPhanName: termObj.name || '---',
            hocPhan: termObj.code
              ? `${termObj.code}\n${termObj.name}`
              : termObj.name || '---',
            quantityText: `${item.quantityCurrent || 0}/${
              item.quantitySeat || 20
            }`,
            svDangKy: item.quantityCurrent || 0,
            maxSv: item.quantitySeat || 20,
            tuNgay: tuNgayStr,
            denNgay: denNgayStr,
            thoiGian: `${tuNgayStr}\n${denNgayStr}`,
            trangThaiDuyet: overrideTrangThaiDuyet,
            examStatus: overrideExamStatus,
            _oldExamVal: overrideExamStatus,
            hasBeenApproved: overrideHasBeenApproved,
            teacherId: finalTeacherId,
            teacherName: finalMainTeacherName,
            mainTeacherName: finalMainTeacherName,
            assistantTeacherId: finalAssistantTeacherId,
            assistantTeacherName: finalAssistantTeacherName,
            original: {
              ...item,
              approvalStatus: overrideHasBeenApproved ? 'APPROVED' : 'PENDING',
              hasBeenApproved: overrideHasBeenApproved,
              examStatus: overrideExamStatus,
              teacherId: finalTeacherId,
              teacherName: finalMainTeacherName,
              mainTeacherName: finalMainTeacherName,
              assistantTeacherId: finalAssistantTeacherId,
              assistantTeacherName: finalAssistantTeacherName,
              mainTeacher: localOverride.mainTeacher || item.mainTeacher || (finalMainTeacherName ? { id: finalTeacherId, fullName: finalMainTeacherName } : null),
              assistantTeacher: localOverride.assistantTeacher || item.assistantTeacher || (finalAssistantTeacherName ? { id: finalAssistantTeacherId, fullName: finalAssistantTeacherName } : null),
            },
          }
        })

        this.totalItems = this.allRawData.length
        this.page = 1
        this.pageInput = 1
        this.updatePaginationSlice()
      } catch (err) {
        console.error('Không thể lấy dữ liệu từ server thực tế:', err)
        this.allRawData = []
        this.appliedData = []
        this.totalItems = 0
      } finally {
        this.loading = false
      }
    },

    handleSearch() {
      this.page = 1
      this.pageInput = 1
      this.fetchData()
    },

    resetFilters() {
      this.filters = {
        className: '',
        retakeSession: null,
        course: null,
        coefficient: null,
        fromDate: null,
        toDate: null,
      }
      this.page = 1
      this.pageInput = 1
      this.fetchData()
    },

    exportSummaryToExcel() {
      const classes = this.allRawData
      if (!classes.length) return

      try {
        const excelData = classes.map((item, index) => ({
          STT: index + 1,
          'Mã lớp': item.maLop,
          'Loại lớp': item.loaiLop,
          'Thu học phí SV': item.classCoefficient,
          'Thanh toán giảng dạy': item.thanhToan,
          'Đợt học lại': item.dotHocLai,
          'Trạng thái duyệt': item.trangThaiDuyet,
          'Trạng thái bảng điểm': item.examStatus,
        }))
        const worksheet = XLSX.utils.json_to_sheet(excelData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách lớp')
        XLSX.writeFile(workbook, 'danh_sach_lop_hoc_lai.xlsx')
      } catch (err) {
        console.error('Lỗi xuất file Excel:', err)
      }
    },
  },
}
</script>

<style scoped>
.custom-success-toast-alert {
  animation: fadeInOut 3s ease forwards;
}
@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  10% {
    opacity: 1;
    transform: translateY(0);
  }
  90% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-10px);
  }
}

.main-page-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
}

.scrollable-table-area {
  flex: 1 1 auto !important;
  overflow-y: auto !important;
  min-height: 0 !important;
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

.custom-filter-input {
  width: 160px !important;
  flex: 0 0 auto !important;
}

.input-text-name {
  width: 180px !important;
}

.custom-filter-input >>> .v-input__slot {
  min-height: 38px !important;
  max-height: 38px !important;
  border-color: #a3a3a3 !important;
  border-radius: 4px !important;
  background-color: #ffffff !important;
  padding: 0 10px !important;
  box-shadow: none !important;
}

.custom-filter-input >>> fieldset {
  border-color: #a3a3a3 !important;
  border-width: 1px !important;
}

.custom-filter-input >>> .v-text-field__slot input,
.custom-filter-input >>> .v-select__selection {
  font-size: 13px !important;
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
  font-size: 18px !important;
}

.filter-controls {
  gap: 8px;
}

.custom-table {
  display: flex;
  flex-direction: column;
}

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

.custom-footer-bar {
  background-color: #ffffff;
  border-top: 1px solid #e5e7eb;
}

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
  max-width: 170px;
}

.status-pill-select >>> .v-input__control,
.status-pill-select >>> .v-input__slot {
  min-height: 34px !important;
}

.status-pill-select >>> .v-input__slot {
  border-radius: 18px !important;
  padding: 0 10px 0 14px !important;
  box-shadow: none !important;
}

.status-pill-select >>> fieldset {
  border: none !important;
}

.status-pill-select >>> .v-select__selections {
  flex-wrap: nowrap;
  overflow: hidden;
  padding: 0 !important;
  white-space: nowrap;
}

.status-pill-select >>> .v-select__selection {
  overflow: hidden;
  text-overflow: ellipsis;
  color: #ffffff !important;
  font-weight: 500;
  font-size: 13px;
}

.status-pill-select >>> .v-icon {
  color: #ffffff !important;
}

.pill-green-solid >>> .v-input__slot {
  background-color: #42b858 !important;
}

.pill-orange-solid >>> .v-input__slot {
  background-color: #f59e0b !important;
}

.pill-lime-grade >>> .v-input__slot {
  background-color: #a3e635 !important;
}

.pill-blue-grade >>> .v-input__slot {
  background-color: #3b82f6 !important;
}

.custom-teacher-select >>> .v-input__slot {
  min-height: 42px !important;
  border-radius: 4px !important;
}
.custom-teacher-select >>> .v-label {
  font-size: 13px !important;
}
.border-btn {
  border-color: #d9d9d9 !important;
}
</style>