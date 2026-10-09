<template>
  <div class="thanh-toan-giang-vien-page pa-4 position-relative">
    <!-- TIÊU ĐỀ TRANG -->
    <div class="d-flex align-center mb-4">
      <span class="text-h6 font-weight-bold black--text">
        Danh sách thanh toán giảng viên theo lớp
      </span> 
      <span class="text-h6 font-weight-bold primary--text ml-1">
        ({{ filteredItems.length }})
      </span>
    </div>

    <!-- CỤM BỘ LỌC TÌM KIẾM -->
    <v-card flat class="mb-4 bg-transparent">
      <v-row dense class="align-center justify-end">
        <v-col cols="12" sm="3" md="2">
          <v-select
            v-model="filters.teacherId"
            :items="teacherOptions"
            item-text="fullName"
            item-value="id"
            label="Giảng viên"
            outlined
            dense
            hide-details
            clearable
            class="bg-white rounded-lg"
          ></v-select>
        </v-col>

        <v-col cols="12" sm="3" md="2">
          <v-select
            v-model="filters.examName"
            :items="examOptions"
            label="Đợt học lại"
            outlined
            dense
            hide-details
            clearable
            class="bg-white rounded-lg"
          ></v-select>
        </v-col>

        <v-col cols="12" sm="3" md="2">
          <v-select
            v-model="filters.classCode"
            :items="classOptions"
            label="Lớp học lại"
            outlined
            dense
            hide-details
            clearable
            class="bg-white rounded-lg"
          ></v-select>
        </v-col>

        <v-col cols="12" sm="3" md="2">
          <v-select
            v-model="filters.status"
            :items="statusOptions"
            item-text="text"
            item-value="value"
            label="Trạng thái"
            outlined
            dense
            hide-details
            clearable
            class="bg-white rounded-lg"
          ></v-select>
        </v-col>

        <!-- NÚT LÀM MỚI VÀ TÌM KIẾM -->
        <v-col cols="auto" class="d-flex gap-2">
          <v-btn
            outlined
            color="#A62229"
            class="px-3 rounded-lg bg-white"
            style="min-width: 40px; height: 40px;"
            @click="resetFilters"
          >
            <v-icon color="#A62229">mdi-refresh</v-icon>
          </v-btn>

          <v-btn
            color="#A62229"
            dark
            class="px-4 rounded-lg"
            style="min-width: 40px; height: 40px;"
            @click="fetchData"
          >
            <v-icon>mdi-magnify</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- BẢNG DỮ LIỆU SỬ DỤNG BASETABLE -->
    <BaseTable
      :loading="loading"
      :headers="tableHeaders"
      :items="paginatedItems"
      :page="page"
      :page-size="pageSize"
      :hide-default-footer="true"
    >
      <template v-slot:body="{ items }">
        <tbody>
          <tr v-if="loading">
            <td colspan="15" class="text-center py-6">
              <v-progress-circular indeterminate color="#A62229" size="32"></v-progress-circular>
            </td>
          </tr>
          <tr v-else-if="items.length === 0">
            <td colspan="15" class="text-center py-6 text-grey-color">
              Không có dữ liệu
            </td>
          </tr>
          <tr v-for="(item, index) in items" :key="item.id || index">
            <td class="text-center">{{ (page - 1) * pageSize + index + 1 }}</td>
            <td class="font-weight-medium">{{ item.maLop }}</td>
            
            <!-- CỘT LOẠI LỚP -->
            <td>
              <v-chip
                small
                dark
                :color="getClassTypeColor(item)"
                class="font-weight-medium text-caption px-2"
              >
                {{ getClassTypeName(item) }}
              </v-chip>
            </td>

            <td class="text-center">{{ item.dotHoc }}</td>
            <td class="text-center">{{ item.heSo }}</td>
            <td class="text-center">{{ item.heSo }}</td>
            <td class="text-center">{{ item.hocPhiThucTe }}</td>
            <td>{{ item.giangVien }}</td>
            <td>{{ item.tenHocPhan }}</td>
            <td class="text-right font-weight-medium">{{ formatCurrency(item.tongPhi) }}đ</td>
            <td class="text-right font-weight-medium">{{ formatCurrency(item.thanhToanGiangVienTheoLop) }}đ</td>
            
            <!-- FILE THÔNG TIN -->
            <td class="text-center">
              <v-btn
                v-if="item.fileInform"
                icon
                small
                color="red"
                :href="item.fileInform"
                target="_blank"
              >
                <v-icon small>mdi-file-download-outline</v-icon>
              </v-btn>
              <v-icon v-else small color="grey lighten-1">mdi-file-download-outline</v-icon>
            </td>

            <!-- CỘT TRẠNG THÁI THANH TOÁN (DẠNG V-SELECT ĐỔI MÀU TRỰC TIẾP) -->
            <td class="text-center">
              <v-select
                :value="item.trangThai"
                :items="statusOptions"
                item-text="text"
                item-value="value"
                dense
                solo
                flat
                hide-details
                class="status-select-btn"
                :class="getStatusSelectClass(item.trangThai)"
                @change="(val) => openConfirmStatusDialog(item, val)"
              ></v-select>
            </td>

            <!-- CỘT T.T XUẤT GIẤY XÁC NHẬN -->
            <td class="text-center">
              <v-chip
                small
                dark
                :color="getExportStatusColor(item.isExported)"
                class="font-weight-medium text-caption px-3"
              >
                {{ item.isExported === 1 ? 'Đã xuất' : 'Chưa xuất' }}
              </v-chip>
            </td>

            <!-- CỘT CHỨC NĂNG -->
            <td class="text-center">
              <v-menu offset-y left>
                <template v-slot:activator="{ attrs, on }">
                  <v-btn icon small v-bind="attrs" v-on="on">
                    <v-icon small>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list dense>
                  <v-list-item @click="exportSingleReport(item)">
                    <v-list-item-title class="text-caption">Xuất xác nhận</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </td>
          </tr>
        </tbody>
      </template>
    </BaseTable>

    <!-- THANH KẺ NGANG MÀU ĐỎ NGĂN CÁCH -->
    <div class="divider-red my-4"></div>

    <!-- FOOTER VÀ PHÂN TRANG -->
    <div class="d-flex justify-space-between align-center">
      <div class="d-flex gap-2">
        <v-btn
          outlined
          disabled
          class="text-none font-weight-medium rounded-lg border-btn-grey"
        >
          XUẤT GIẤY XÁC NHẬN THANH TOÁN (A5)
        </v-btn>

        <v-btn
          color="#4CAF50"
          dark
          class="text-none font-weight-medium rounded-lg"
          elevation="0"
          @click="exportExcelList"
        >
          <v-icon left small>mdi-file-excel-outline</v-icon>
          XUẤT FILE DANH SÁCH THANH TOÁN
        </v-btn>
      </div>

      <div class="d-flex align-center gap-3">
        <div class="d-flex align-center text-caption gap-1">
          <span>Bản ghi</span>
          <v-select
            v-model="pageSize"
            :items="[10, 20, 50, 100]"
            dense
            outlined
            hide-details
            class="size-select"
            @change="page = 1"
          ></v-select>
        </div>

        <div class="d-flex align-center text-caption gap-1">
          <span>Trang</span>
          <v-text-field
            v-model="pageInput"
            dense
            outlined
            hide-details
            class="page-input text-center"
            @keyup.enter="goToPage"
          ></v-text-field>
          <v-btn color="#A62229" dark x-small class="px-2 py-3" @click="goToPage">Đi</v-btn>
        </div>

        <v-pagination
          v-model="page"
          :length="totalPages"
          :total-visible="5"
          color="#A62229"
          dense
        ></v-pagination>
      </div>
    </div>

    <!-- DIALOG XÁC NHẬN ĐỔI TRẠNG THÁI -->
    <v-dialog v-model="confirmStatusDialog" max-width="420px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="pa-3 text-subtitle-1 font-weight-bold white--text red-header">
          Xác nhận đổi trạng thái
        </v-card-title>
        <v-card-text class="pa-5 black--text body-2">
          Bạn có chắc chắn muốn chuyển trạng thái thanh toán sang 
          <span class="font-weight-bold red--text text--darken-3">{{ getStatusText(pendingStatusChange.newStatus) }}</span> không?
        </v-card-text>
        <v-card-actions class="pa-4 pt-0 d-flex justify-end gap-2">
          <v-btn outlined color="#A62229" class="px-4 font-weight-bold rounded-sm border-btn" @click="confirmStatusDialog = false">
            Đóng
          </v-btn>
          <v-btn color="#A62229" dark elevation="0" class="px-4 font-weight-bold rounded-sm" @click="confirmStatusUpdate">
            Xác nhận
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- TOAST THÔNG BÁO THÀNH CÔNG GÓC TRÊN BÊN PHẢI -->
    <transition name="slide-fade">
      <div v-if="successToast" class="custom-success-toast">
        <div class="d-flex align-center px-4 py-3">
          <v-icon color="white" class="mr-2" size="20">mdi-check-circle</v-icon>
          <span class="white--text font-weight-medium text-body-2">Cập nhật trạng thái thành công</span>
          <v-btn icon x-small dark class="ml-4" @click="successToast = false">
            <v-icon size="16">mdi-close</v-icon>
          </v-btn>
        </div>
        <div class="toast-progress-bar">
          <div class="toast-progress-active" :style="{ width: progressWidth + '%' }"></div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import { MOCK_DATA_THANH_TOAN_GIANG_VIEN_LOP } from '~/consts/thanhtoangvl.js'
import feeTecherServices from '~/services/feeTecherServices'

// HÀM HELPER CHUYỂN ĐỔI DỮ LIỆU
export const formatTableData = (item, index) => {
  return {
    stt: index + 1,
    id: item.id,
    maLop: item.code,
    loaiLop: item.classCoefficientDto?.classType || item.retakeCourseStatus,
    tenHocPhan: item.term?.name || "",
    maHocPhan: item.term?.code || "",
    tietHoc: item.period || 0,
    hocPhiThucTe: item.term?.creditHours || 0,
    thanhToanGiangVienTheoLop: 0,
    heSo: item.classCoefficient || 1.0,
    giangVien: item.faculty || "Chưa phân công",
    tongPhi: item.term?.weight || 0,
    trangThai: item.examSessionStatus || 'WAIT_PAID',
    scoreStatus: item.scoreStatus,
    dotHoc: item.exam?.code || "",
    isExported: item.isExported || 0,
    fileInform: item.fileInform || null
  };
};

export const getMappedTableData = (rawData) => {
  return rawData.map((item, index) => formatTableData(item, index));
};

export default {
  name: 'ThanhToanGiangVienTheoLopPage',
  components: {
    BaseTable
  },
  data() {
    return {
      loading: false,
      tableData: [],
      page: 1,
      pageSize: 50,
      pageInput: 1,

      filters: {
        teacherId: null,
        examName: null,
        classCode: null,
        status: null
      },

      teacherOptions: [],
      examOptions: [],
      classOptions: [],
      
      statusOptions: [
        { text: 'Đã thanh toán', value: 'COMPLETE_PAID' },
        { text: 'Chưa thanh toán', value: 'WAIT_PAID' },
        { text: 'Hủy thanh toán', value: 'CANCEL_PAID' },
        { text: 'Đã duyệt', value: 'FINALIZED' },
        { text: 'Chưa duyệt', value: 'NON_FINALIZED' }
      ],

      confirmStatusDialog: false,
      pendingStatusChange: { item: null, newStatus: '' },

      successToast: false,
      progressWidth: 100,
      toastTimer: null,
      progressInterval: null,

      tableHeaders: [
        { text: 'STT', value: 'stt', align: 'center' },
        { text: 'Mã lớp học lại', value: 'classCode' },
        { text: 'Loại lớp', value: 'classType' },
        { text: 'Đợt học lại', value: 'examName', align: 'center' },
        { text: 'Thu học phí SV', value: 'coefficient', align: 'center' },
        { text: 'Thanh toán giảng dạy', value: 'coefficientTeacher', align: 'center' },
        { text: 'Số tín chỉ học phí', value: 'creditTuition', align: 'center' },
        { text: 'Giảng viên', value: 'teacherName' },
        { text: 'Tên học phần', value: 'courseName' },
        { text: 'Tổng phí', value: 'totalFee', align: 'right' },
        { text: 'Thuế thu nhập cá nhân', value: 'totalTaxFee', align: 'right' },
        { text: 'File thông tin', value: 'fileInform', align: 'center' },
        { text: 'Trạng thái', value: 'status', align: 'center' },
        { text: 'T.T xuất giấy xác nhận', value: 'isExported', align: 'center' },
        { text: 'Chức năng', value: 'actions', align: 'center' }
      ]
    }
  },
  computed: {
    filteredItems() {
      let list = this.tableData || []

      if (this.filters.teacherId) {
        list = list.filter(item => item.giangVien === this.filters.teacherId)
      }

      if (this.filters.examName) {
        list = list.filter(item => item.dotHoc === this.filters.examName)
      }

      if (this.filters.classCode) {
        list = list.filter(item => item.maLop === this.filters.classCode)
      }

      if (this.filters.status) {
        list = list.filter(item => item.trangThai === this.filters.status)
      }

      return list
    },

    totalPages() {
      const total = Math.ceil(this.filteredItems.length / this.pageSize)
      return total > 0 ? total : 1
    },

    paginatedItems() {
      const start = (this.page - 1) * this.pageSize
      return this.filteredItems.slice(start, start + this.pageSize)
    }
  },
  mounted() {
    this.loadInitialMockData()
  },
  methods: {
    formatCurrency(val) {
      if (!val && val !== 0) return '0'
      return Number(val).toLocaleString('vi-VN')
    },

    loadInitialMockData() {
      // Áp dụng hàm getMappedTableData để map dữ liệu từ file mock
      const raw = MOCK_DATA_THANH_TOAN_GIANG_VIEN_LOP || []
      this.tableData = getMappedTableData(raw)
      
      const teachersMap = new Map()
      const examsSet = new Set()
      const classesSet = new Set()

      this.tableData.forEach(item => {
        if (item.dotHoc) examsSet.add(item.dotHoc)
        if (item.maLop) classesSet.add(item.maLop)
        if (item.giangVien && !teachersMap.has(item.giangVien)) {
          teachersMap.set(item.giangVien, { id: item.giangVien, fullName: item.giangVien })
        }
      })

      this.teacherOptions = Array.from(teachersMap.values())
      this.examOptions = Array.from(examsSet)
      this.classOptions = Array.from(classesSet)
    },

    getClassTypeColor(item) {
      const type = item.loaiLop
      if (type === 'NEW_CLASS') return '#4CAF50'
      if (type === 'COMBINE_CLASS') return '#7E7E7E'
      if (type === 'PROJECT_BASED_CLASS') return '#E53935'
      return '#757575'
    },

    getClassTypeName(item) {
      const type = item.loaiLop
      if (type === 'NEW_CLASS') return 'Lớp mở'
      if (type === 'COMBINE_CLASS') return 'Lớp ghép'
      if (type === 'PROJECT_BASED_CLASS') return 'Lớp đồ án'
      return 'Lớp thông thường'
    },

    getStatusSelectClass(status) {
      if (status === 'COMPLETE_PAID' || status === 'FINALIZED') return 'status-complete'
      if (status === 'CANCEL_PAID') return 'status-cancel'
      return 'status-wait'
    },

    getStatusText(status) {
      if (status === 'COMPLETE_PAID') return 'Đã thanh toán'
      if (status === 'CANCEL_PAID') return 'Hủy thanh toán'
      if (status === 'FINALIZED') return 'Đã duyệt'
      return 'Chưa thanh toán / Chưa duyệt'
    },

    getExportStatusColor(isExported) {
      if (isExported === 1 || isExported === true) return '#4CAF50'
      return '#FFA726'
    },

    openConfirmStatusDialog(item, newStatus) {
      if (item.trangThai === newStatus) return
      this.pendingStatusChange = { item, newStatus }
      this.confirmStatusDialog = true
    },

    confirmStatusUpdate() {
      if (this.pendingStatusChange.item) {
        this.pendingStatusChange.item.trangThai = this.pendingStatusChange.newStatus
      }
      this.confirmStatusDialog = false
      this.triggerSuccessToast()
    },

    triggerSuccessToast() {
      this.successToast = true
      this.progressWidth = 100

      if (this.toastTimer) clearTimeout(this.toastTimer)
      if (this.progressInterval) clearInterval(this.progressInterval)

      const duration = 3000
      const stepTime = 30
      const decrement = (stepTime / duration) * 100

      this.progressInterval = setInterval(() => {
        this.progressWidth -= decrement
        if (this.progressWidth <= 0) {
          this.progressWidth = 0
          clearInterval(this.progressInterval)
        }
      }, stepTime)

      this.toastTimer = setTimeout(() => {
        this.successToast = false
        clearInterval(this.progressInterval)
      }, duration)
    },

    async fetchData() {
      this.loading = true
      try {
        if (feeTecherServices && feeTecherServices.getList) {
          const res = await feeTecherServices.getList({
            page: this.page,
            size: this.pageSize,
            ...this.filters
          })
          if (res?.data) {
            const raw = res.data.content || res.data
            this.tableData = getMappedTableData(raw)
          }
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách thanh toán:', err)
      } finally {
        this.loading = false
      }
    },

    resetFilters() {
      this.filters = { teacherId: null, examName: null, classCode: null, status: null }
      this.page = 1
      this.pageInput = 1
    },

    goToPage() {
      const target = Number(this.pageInput)
      if (!isNaN(target) && target >= 1 && target <= this.totalPages) {
        this.page = target
      }
    },

    exportExcelList() {
      console.log('Xuất file danh sách excel')
    },

    exportSingleReport(item) {
      console.log('Xuất xác nhận cho:', item)
    }
  }
}
</script>

<style scoped>
.thanh-toan-giang-vien-page {
  background-color: #fff;
  min-height: 100vh;
}

.divider-red {
  width: 100%;
  height: 2px;
  background-color: #A62229;
}

.red-header {
  background-color: #A62229 !important;
}

.text-grey-color {
  color: #757575 !important;
}

.border-btn-grey {
  border: 1px solid #BDBDBD !important;
  color: #9E9E9E !important;
}

.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }

.size-select {
  width: 75px !important;
}

.page-input {
  width: 50px !important;
}

.status-select-btn {
  min-width: 140px !important;
  width: 140px !important;
  border-radius: 14px !important;
  margin: 0 auto !important;
}

.status-select-btn >>> .v-input__slot {
  min-height: 28px !important;
  height: 28px !important;
  padding: 0 10px !important;
  border-radius: 14px !important;
}

.status-select-btn >>> .v-select__selection {
  color: #ffffff !important;
  font-size: 0.76rem !important;
  font-weight: 600 !important;
  margin: 0 !important;
  white-space: nowrap !important;
}

.status-select-btn >>> .v-icon {
  color: #ffffff !important;
  font-size: 16px !important;
}

.status-wait >>> .v-input__slot {
  background-color: #A62229 !important;
}

.status-cancel >>> .v-input__slot {
  background-color: #E53935 !important;
}

.status-complete >>> .v-input__slot {
  background-color: #4CAF50 !important;
}

.custom-success-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  background-color: #4CAF50;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 300px;
  overflow: hidden;
}

.toast-progress-bar {
  width: 100%;
  height: 3px;
  background-color: rgba(255, 255, 255, 0.3);
}

.toast-progress-active {
  height: 100%;
  background-color: rgba(255, 255, 255, 0.85);
  transition: width 0.03s linear;
}

.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter, .slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>