<template>
  <div class="thanh-toan-giang-vien-page pa-4">
    <!-- TIÊU ĐỀ TRANG -->
    <div class="d-flex align-center mb-4">
      <span class="text-h6 font-weight-bold black--text">
        Danh sách thanh toán giảng viên theo lớp
      </span>
      <span class="text-h6 font-weight-bold primary--text ml-1">
        ({{ totalElements }})
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

    <!-- BẢNG DỮ LIỆU CHÍNH -->
    <v-card class="rounded-lg overflow-hidden border-table-wrapper" elevation="1">
      <v-simple-table dense class="custom-table">
        <template v-slot:default>
          <thead>
            <tr class="bg-gray-head">
              <th class="text-center font-weight-bold black--text">STT</th>
              <th class="text-left font-weight-bold black--text">Mã lớp học lại</th>
              <th class="text-left font-weight-bold black--text">Loại lớp</th>
              <th class="text-center font-weight-bold black--text">Đợt học lại</th>
              <th class="text-center font-weight-bold black--text">Thu học phí SV</th>
              <th class="text-center font-weight-bold black--text">Thanh toán giảng dạy</th>
              <th class="text-center font-weight-bold black--text">Số tín chỉ học phí</th>
              <th class="text-left font-weight-bold black--text">Giảng viên</th>
              <th class="text-left font-weight-bold black--text">Tên học phần</th>
              <th class="text-right font-weight-bold black--text">Tổng phí</th>
              <th class="text-right font-weight-bold black--text">Thuế TNCN</th>
              <th class="text-center font-weight-bold black--text">File thông tin</th>
              <th class="text-center font-weight-bold black--text">Trạng thái</th>
              <th class="text-center font-weight-bold black--text">T.T xuất giấy XN</th>
              <th class="text-center font-weight-bold black--text">Chức năng</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="15" class="text-center py-6">
                <v-progress-circular indeterminate color="#A62229" size="32"></v-progress-circular>
              </td>
            </tr>
            <tr v-else-if="tableData.length === 0">
              <td colspan="15" class="text-center py-6 text-grey-color">
                Không có dữ liệu
              </td>
            </tr>
            <tr v-for="(item, index) in tableData" :key="item.id || index">
              <td class="text-center">{{ (page - 1) * pageSize + index + 1 }}</td>
              <td class="font-weight-medium">{{ item.classCode }}</td>
              
              <!-- 1. CỘT LOẠI LỚP DÙNG BADGE MÀU ĐỘNG -->
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

              <td class="text-center">{{ item.examName }}</td>
              <td class="text-center">{{ item.coefficient }}</td>
              <td class="text-center">{{ item.coefficientTeacher || item.coefficient }}</td>
              <td class="text-center">{{ item.creditTuition }}</td>
              <td>{{ item.teacherName || item.teacherDto?.fullName }}</td>
              <td>{{ item.courseName }}</td>
              <td class="text-right font-weight-medium">{{ formatCurrency(item.totalFee) }}đ</td>
              <td class="text-right font-weight-medium">{{ formatCurrency(item.totalTaxFee) }}đ</td>
              
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

              <!-- 2. CỘT TRẠNG THÁI THANH TOÁN -->
              <td class="text-center">
                <v-chip
                  small
                  dark
                  :color="getStatusColor(item.status)"
                  class="font-weight-medium text-caption px-3"
                >
                  {{ getStatusText(item.status) }}
                  <v-icon right x-small class="ml-1">mdi-menu-down</v-icon>
                </v-chip>
              </td>

              <!-- 3. CỘT T.T XUẤT GIẤY XÁC NHẬN -->
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
                  <template v-slot:activator="{ on, attrs }">
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
      </v-simple-table>
    </v-card>

    <!-- FOOTER VÀ PHÂN TRANG -->
    <div class="d-flex justify-space-between align-center mt-4">
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
            @change="fetchData"
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
          @input="fetchData"
        ></v-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import feeTecherServices from '~/services/feeTecherServices'

export default {
  name: 'ThanhToanGiangVienTheoLopPage',
  data() {
    return {
      loading: false,
      tableData: [],
      totalElements: 11,
      totalPages: 1,
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
      examOptions: ['20252-A-1', '20252-A-2'],
      classOptions: ['D_20252_1_002', 'M_20252_1_005', 'M_20252_1_001'],
      statusOptions: [
        { text: 'Đã thanh toán', value: 'COMPLETE_PAID' },
        { text: 'Chưa thanh toán', value: 'WAIT_PAID' }
      ]
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

    // KHAI BÁO HÀM LOADINITIALMOCKDATA ĐỂ SỬA LỖI
    loadInitialMockData() {
      this.tableData = [
        {
          id: 661,
          teacherName: 'Phương Oanh',
          examName: '20252-A-1',
          classCode: 'D_20252_1_002',
          classType: 'PROJECT_BASED_CLASS',
          classCoefficientDto: { isCourseNormal: false },
          unitPrice: 300000.0,
          coefficient: 2.0,
          creditTuition: 20.0,
          courseName: 'Đồ án tốt nghiệp cử nhân',
          status: 'COMPLETE_PAID',
          totalFee: 5400000.0,
          totalTaxFee: 0.0,
          isExported: 0
        },
        {
          id: 701,
          teacherName: 'Phương Oanh',
          examName: '20252-A-1',
          classCode: 'M_20252_1_005',
          classType: 'NEW_CLASS',
          classCoefficientDto: { isCourseNormal: false },
          unitPrice: 50000.0,
          coefficient: 1.3,
          creditTuition: 6.0,
          courseName: 'Project I',
          status: 'WAIT_PAID',
          totalFee: 6750000.0,
          totalTaxFee: 0.0,
          isExported: 1
        },
        {
          id: 641,
          teacherName: 'Phương Oanh',
          examName: '20252-A-1',
          classCode: 'M_20252_1_001',
          classType: 'PROJECT_BASED_CLASS',
          classCoefficientDto: { isCourseNormal: true },
          unitPrice: 300000.0,
          coefficient: 1.5,
          creditTuition: 3.0,
          courseName: 'PP xử lý số liệu thực nghiệm (BTL)',
          status: 'COMPLETE_PAID',
          totalFee: 0.0,
          totalTaxFee: 0.0,
          isExported: 1
        },
        {
          id: 801,
          teacherName: 'Phương Oanh',
          examName: '20252-A-1',
          classCode: 'G_20252_1_016',
          classType: 'COMBINE_CLASS',
          classCoefficientDto: { courseType: 'OUTLINE' },
          coefficient: 1.5,
          creditTuition: 2.0,
          courseName: 'Cloud & Computing',
          status: 'WAIT_PAID',
          totalFee: 0.0,
          totalTaxFee: 0.0,
          isExported: 0
        },
        {
          id: 681,
          teacherName: 'Phương Oanh',
          fileInform:
            'http://103.147.34.20:19800/api/file/content?o=649fbc6f0-bao_cao_ket_qua_thu_2025_10_06_102356.xlsx',
          examName: '20252-A-1',
          classCode: 'G_20252_1_010',
          classType: 'COMBINE_CLASS',
          classCoefficientDto: { courseType: 'SPECIALIZED' },
          coefficient: 1.7,
          creditTuition: 10.0,
          courseName: 'Lập trình Java',
          status: 'COMPLETE_PAID',
          totalFee: 0.0,
          totalTaxFee: 0.0,
          isExported: 1
        }
      ]
      this.totalElements = 11
    },

    getClassTypeColor(item) {
      const type = item.classType || item.classCoefficientDto?.classType

      if (type === 'NEW_CLASS') {
        return '#4CAF50'
      }
      if (type === 'COMBINE_CLASS') {
        return '#7E7E7E'
      }
      if (type === 'PROJECT_BASED_CLASS') {
        return '#E53935'
      }
      return '#757575'
    },

    getClassTypeName(item) {
      const type = item.classType || item.classCoefficientDto?.classType
      const courseType = item.classCoefficientDto?.courseType
      const isNormal = item.classCoefficientDto?.isCourseNormal

      if (type === 'NEW_CLASS') return 'Lớp mở'
      if (type === 'COMBINE_CLASS') {
        return courseType === 'SPECIALIZED'
          ? 'Lớp ghép (Chuyên ngành)'
          : 'Lớp ghép (Đại cương)'
      }
      if (type === 'PROJECT_BASED_CLASS') {
        return isNormal ? 'Đồ án môn học (HPTT)' : 'Đồ án môn học (HP.ĐAMH)'
      }
      return 'Lớp thông thường'
    },

    getStatusColor(status) {
      if (status === 'COMPLETE_PAID') return '#4CAF50'
      return '#A62229'
    },

    getStatusText(status) {
      if (status === 'COMPLETE_PAID') return 'Đã thanh toán'
      return 'Chưa thanh toán'
    },

    getExportStatusColor(isExported) {
      if (isExported === 1 || isExported === true) return '#4CAF50'
      return '#FFA726'
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
            this.tableData = res.data.content || res.data
            this.totalElements = res.data.totalElements || this.tableData.length
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
      this.fetchData()
    },

    goToPage() {
      if (this.pageInput >= 1 && this.pageInput <= this.totalPages) {
        this.page = Number(this.pageInput)
        this.fetchData()
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

.border-table-wrapper {
  border: 1px solid #E0E0E0;
}

.custom-table table thead tr th {
  font-size: 12px !important;
  white-space: nowrap;
  background-color: #F2F2F2 !important;
  height: 44px !important;
  border-bottom: 1px solid #E0E0E0 !important;
}

.custom-table table tbody tr td {
  font-size: 13px !important;
  height: 48px !important;
  border-bottom: 1px solid #EEEEEE !important;
}

.bg-gray-head {
  background-color: #F2F2F2 !important;
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
</style>