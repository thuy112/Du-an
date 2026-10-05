<template>
  <div class="registered-students-page pa-4 bg-white">
    <!-- TIÊU ĐỀ BẢNG -->
    <div class="d-flex align-center mb-3">
      <span class="text-h6 font-weight-bold text-red-bold">
        Danh sách sinh viên đăng ký học lại ({{ totalItems }})
      </span>
    </div>

    <!-- KHU VỰC BỘ LỌC (SEARCH & FILTERS) -->
    <div class="filter-section mb-4">
      <!-- HÀNG LỌC 1 -->
      <v-row dense class="mb-1">
        <v-col cols="12" sm="4" md="2">
          <v-text-field
            v-model="filters.keyword"
            placeholder="Thông tin sinh viên"
            outlined
            dense
            hide-details
            clearable
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="4" md="2">
          <v-select
            v-model="filters.major"
            :items="majorOptions"
            placeholder="Ngành"
            outlined
            dense
            hide-details
            clearable
          ></v-select>
        </v-col>
        <v-col cols="12" sm="4" md="2">
          <v-select
            v-model="filters.studentClass"
            :items="classOptions"
            placeholder="Lớp sinh viên"
            outlined
            dense
            hide-details
            clearable
          ></v-select>
        </v-col>
        <v-col cols="12" sm="4" md="2">
          <v-select
            v-model="filters.session"
            :items="sessionOptions"
            placeholder="Kỳ đăng ký học lại"
            outlined
            dense
            hide-details
            clearable
          ></v-select>
        </v-col>
        <v-col cols="12" sm="4" md="2">
          <v-select
            v-model="filters.retakeClassCode"
            :items="retakeClassOptions"
            placeholder="Mã lớp học lại"
            outlined
            dense
            hide-details
            clearable
          ></v-select>
        </v-col>
        <v-col cols="12" sm="4" md="2">
          <v-select
            v-model="filters.subjectCode"
            :items="subjectOptions"
            placeholder="Mã học phần"
            outlined
            dense
            hide-details
            clearable
          ></v-select>
        </v-col>
      </v-row>

      <!-- HÀNG LỌC 2 & CỤM NÚT THAO TÁC -->
      <v-row dense align="center">
        <v-col cols="12" sm="6" md="2.4" style="flex: 0 0 20%; max-width: 20%;">
          <v-select
            v-model="filters.tuitionStatus"
            :items="['Đã trả học phí', 'Chưa trả học phí']"
            placeholder="Trạng thái trả học phí"
            outlined
            dense
            hide-details
            clearable
          ></v-select>
        </v-col>
        <v-col cols="12" sm="6" md="2.4" style="flex: 0 0 20%; max-width: 20%;">
          <v-select
            v-model="filters.emailStatus"
            :items="['Đã gửi', 'Chưa gửi']"
            placeholder="Trạng thái gửi email"
            outlined
            dense
            hide-details
            clearable
          ></v-select>
        </v-col>
        <v-col cols="12" sm="6" md="2.4" style="flex: 0 0 20%; max-width: 20%;">
          <v-select
            v-model="filters.approvalStatus"
            :items="['Chờ xác nhận', 'Đã duyệt', 'Từ chối']"
            placeholder="Trạng thái duyệt đơn"
            outlined
            dense
            hide-details
            clearable
          ></v-select>
        </v-col>
        <v-col cols="12" sm="6" md="2.4" style="flex: 0 0 20%; max-width: 20%;">
          <v-select
            v-model="filters.bankStatus"
            :items="['Đã lập danh sách', 'Chưa lập danh sách']"
            placeholder="TT thêm DS ngân hàng"
            outlined
            dense
            hide-details
            clearable
          ></v-select>
        </v-col>

        <!-- CỤM NÚT ICON THAO TÁC BÊN PHẢI -->
        <v-col cols="12" md="2.4" class="d-flex justify-end align-center gap-1">
          <v-btn icon small class="btn-action-icon" @click="fetchData">
            <v-icon color="#888" small>mdi-refresh</v-icon>
          </v-btn>
          <v-btn dark small class="bg-red-bk px-2 min-w-auto" elevation="0" @click="fetchData">
            <v-icon small>mdi-magnify</v-icon>
          </v-btn>

          <!-- NÚT THÊM MỚI SINH VIÊN -->
          <v-btn dark small class="bg-red-bk px-2 min-w-auto" elevation="0" @click="showAddModal = true">
            <v-icon small>mdi-plus</v-icon>
          </v-btn>

          <v-btn dark small class="bg-orange-btn px-2 min-w-auto" elevation="0">
            <v-icon small>mdi-email-plus-outline</v-icon>
          </v-btn>
          <v-btn dark small class="bg-red-bk px-2 min-w-auto" elevation="0">
            <v-icon small>mdi-email-remove-outline</v-icon>
          </v-btn>
          <v-btn icon small class="btn-action-icon">
            <v-icon color="#888" small>mdi-chevron-right</v-icon>
          </v-btn>
          <v-btn icon small class="btn-action-icon">
            <v-icon color="#888" small>mdi-calendar-month-outline</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </div>

    <!-- BẢNG DỮ LIỆU CHÍNH -->
    <div class="table-container style-scrollbar overflow-x-auto">
      <table class="custom-data-table">
        <thead>
          <tr>
            <th class="text-center" style="width: 40px;">
              <v-checkbox v-model="selectAll" hide-details dense class="ma-0 pa-0"></v-checkbox>
            </th>
            <th class="text-center" style="width: 50px;">STT</th>
            <th class="text-left" style="min-width: 180px;">Thông tin sinh viên</th>
            <th class="text-left" style="min-width: 110px;">Kỳ đăng ký học lại</th>
            <th class="text-left" style="min-width: 180px;">Học phần đăng ký</th>
            <th class="text-left" style="min-width: 130px;">Mã đơn đăng ký</th>
            <th class="text-center" style="min-width: 130px;">Thời gian đăng ký</th>
            <th class="text-center" style="min-width: 130px;">Thời gian duyệt đơn</th>
            <th class="text-right" style="min-width: 110px;">Tổng học phí</th>
            <th class="text-center" style="min-width: 140px;">Trạng thái trả học phí</th>
            <th class="text-center" style="min-width: 140px;">Thời gian và CB gửi Thu phí</th>
            <th class="text-center" style="min-width: 140px;">TT thêm DS ngân hàng</th>
            <th class="text-center" style="min-width: 120px;">Trạng thái gửi email</th>
            <th class="text-center" style="min-width: 130px;">Trạng thái duyệt đơn</th>
            <th class="text-center" style="min-width: 110px;">Chức năng</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="15" class="text-center py-5">Đang tải dữ liệu...</td>
          </tr>
          <tr v-else-if="items.length === 0">
            <td colspan="15" class="text-center py-5 text-grey">Không có dữ liệu sinh viên đăng ký học lại</td>
          </tr>
          <tr v-for="(item, index) in items" :key="item.id || index">
            <td class="text-center">
              <v-checkbox v-model="selectedIds" :value="item.id" hide-details dense class="ma-0 pa-0"></v-checkbox>
            </td>
            <td class="text-center">{{ (page - 1) * pageSize + index + 1 }}</td>

            <!-- THÔNG TIN SINH VIÊN (TÊN, MÃ SV, LỚP) -->
            <td>
              <div class="font-weight-bold text-red-bold mb-1">Tên SV: {{ item.studentName }}</div>
              <div class="text-caption grey--text text--dark-2 mb-1">
                Mã số SV: <span class="font-weight-medium text-red-bold">{{ item.studentCode }}</span>
              </div>
              <div class="text-caption grey--text text--dark-2">
                Tên Lớp: <span class="font-weight-medium text-red-bold">{{ item.className }}</span>
              </div>
            </td>

            <td>{{ item.sessionCode }}</td>

            <!-- HỌC PHẦN ĐĂNG KÝ -->
            <td>
              <div class="text-body-2">1. {{ item.subjectName }} - {{ item.subjectCode }}</div>
            </td>

            <td>{{ item.registrationCode }}</td>

            <!-- THỜI GIAN ĐĂNG KÝ -->
            <td class="text-center">
              <div>{{ item.registerDate }}</div>
              <div class="text-caption grey--text">{{ item.registerTime }}</div>
            </td>

            <!-- THỜI GIAN DUYỆT ĐƠN -->
            <td class="text-center">
              {{ item.approvalDate || '-' }}
            </td>

            <!-- TỔNG HỌC PHÍ -->
            <td class="text-right font-weight-medium">
              {{ formatCurrency(item.totalFee) }}
            </td>

            <!-- TRẠNG THÁI TRẢ HỌC PHÍ -->
            <td class="text-center">
              <span class="status-pill pill-orange">
                {{ item.tuitionStatus || 'Chưa trả học phí' }}
              </span>
            </td>

            <!-- THỜI GIAN VÀ CB GỬI THU PHÍ -->
            <td class="text-center">{{ item.collectorInfo || '-' }}</td>

            <!-- TT THÊM DS NGÂN HÀNG -->
            <td class="text-center">
              <span class="status-pill pill-orange">
                {{ item.bankStatus || 'Chưa lập danh sách' }}
              </span>
            </td>

            <!-- TRẠNG THÁI GỬI EMAIL -->
            <td class="text-center">
              <span class="status-pill pill-orange">
                {{ item.emailStatus || 'Chưa gửi' }}
              </span>
            </td>

            <!-- TRẠNG THÁI DUYỆT ĐƠN -->
            <td class="text-center">
              <span class="status-pill pill-orange">
                {{ item.approvalStatus || 'Chờ xác nhận' }}
              </span>
            </td>

            <!-- CỘT CHỨC NĂNG -->
            <td class="text-center">
              <div class="d-flex justify-center align-center gap-1">
                <v-icon small color="cyan" class="action-btn" title="Xem chi tiết">mdi-eye-outline</v-icon>
                <v-icon small color="green" class="action-btn" title="Duyệt">mdi-check-circle-outline</v-icon>
                <v-icon small color="red" class="action-btn" title="Hủy/Xóa">mdi-close-circle-outline</v-icon>
                <v-icon small color="orange" class="action-btn" title="Sửa">mdi-pencil-outline</v-icon>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- HÀNG NÚT XUẤT / NHẬP FILE VÀ PHÂN TRANG -->
    <div class="d-flex flex-wrap align-center justify-space-between mt-4 gap-2">
      <!-- CỤM NÚT XUẤT EXCEL BÊN TRÁI -->
      <div class="d-flex flex-wrap gap-2">
        <v-btn color="#4CAF50" dark small elevation="0" class="text-none font-weight-medium rounded-sm">
          <v-icon left small>mdi-file-excel-outline</v-icon>
          XUẤT FILE KẾT QUẢ CẦN THU
        </v-btn>
        <v-btn color="#4CAF50" dark small elevation="0" class="text-none font-weight-medium rounded-sm">
          <v-icon left small>mdi-file-excel-outline</v-icon>
          XUẤT FILE DANH SÁCH CHƯA TRẢ HỌC PHÍ
        </v-btn>
        <v-btn color="#4CAF50" dark small elevation="0" class="text-none font-weight-medium rounded-sm">
          <v-icon left small>mdi-file-excel-outline</v-icon>
          XUẤT FILE RÀ SOÁT HỌC PHÍ
        </v-btn>
        <v-btn color="#4CAF50" dark small elevation="0" class="text-none font-weight-medium rounded-sm">
          <v-icon left small>mdi-file-excel-box</v-icon>
          NHẬP FILE KẾT QUẢ ĐÃ THU
        </v-btn>
      </div>

      <!-- PHÂN TRANG BÊN PHẢI -->
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
            @change="page = 1"
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
          v-model="page"
          :length="totalPages"
          :total-visible="3"
          color="#A62229"
          dense
        ></v-pagination>
      </div>
    </div>

    <!-- MODAL THÊM SINH VIÊN PHẢI HỌC LẠI -->
    <AddMustRetakeStudentModal
      v-model="showAddModal"
      :must-retake-students="mustRetakeStudentOptions"
      @success="onAddSuccess"
    />
  </div>
</template>

<script>
import AddMustRetakeStudentModal from '~/components/RetakeCourse/AddMustRetakeStudentModal.vue'

export default {
  name: 'RegisteredStudentsPage',
  components: {
    AddMustRetakeStudentModal
  },
  data() {
    return {
      loading: false,
      showAddModal: false,
      selectAll: false,
      selectedIds: [],

      page: 1,
      pageSize: 50,
      totalItems: 52,
      pageInput: '1',

      filters: {
        keyword: '',
        major: null,
        studentClass: null,
        session: null,
        retakeClassCode: null,
        subjectCode: null,
        tuitionStatus: null,
        emailStatus: null,
        approvalStatus: null,
        bankStatus: null
      },

      majorOptions: ['Công nghệ thông tin', 'Kế toán', 'Kinh tế'],
      classOptions: ['ĐH-BK-CNTT1.1-K66', 'ĐH-BK-CNTT1.2-K66'],
      sessionOptions: ['20261-A-5', '20261-A-4'],
      retakeClassOptions: ['L01', 'L02'],
      subjectOptions: ['IT3100', 'IT3090', 'IT3080'],

      // DỮ LIỆU MẪU CHUẨN THEO ẢNH SỐ 1
      items: [
        {
          id: 1,
          studentName: 'Đỗ Tiến Tây Anh',
          studentCode: '20210112P',
          className: 'ĐH-BK-CNTT1.1-K66',
          sessionCode: '20261-A-5',
          subjectCode: 'IT3100',
          subjectName: 'Lập trình hướng đối tượng',
          registrationCode: 'HL_2026_1254',
          registerDate: '07/09/2026',
          registerTime: '17:45:21',
          approvalDate: null,
          totalFee: 1000000,
          tuitionStatus: 'Chưa trả học phí',
          collectorInfo: null,
          bankStatus: 'Chưa lập danh sách',
          emailStatus: 'Chưa gửi',
          approvalStatus: 'Chờ xác nhận'
        },
        {
          id: 2,
          studentName: 'Lê Tuấn Anh',
          studentCode: '20210110P',
          className: 'ĐH-BK-CNTT1.2-K66',
          sessionCode: '20261-A-5',
          subjectCode: 'IT3090',
          subjectName: 'CƠ SỞ DỮ LIỆU',
          registrationCode: 'HL_2026_1253',
          registerDate: '07/09/2026',
          registerTime: '17:45:21',
          approvalDate: null,
          totalFee: 1500000,
          tuitionStatus: 'Chưa trả học phí',
          collectorInfo: null,
          bankStatus: 'Chưa lập danh sách',
          emailStatus: 'Chưa gửi',
          approvalStatus: 'Chờ xác nhận'
        },
        {
          id: 3,
          studentName: 'Nguyễn Linh Anh',
          studentCode: '20210108P',
          className: 'ĐH-BK-CNTT1.1-K66',
          sessionCode: '20261-A-5',
          subjectCode: 'IT3080',
          subjectName: 'Mạng máy tính',
          registrationCode: 'HL_2026_1252',
          registerDate: '07/09/2026',
          registerTime: '17:45:21',
          approvalDate: null,
          totalFee: 1500000,
          tuitionStatus: 'Chưa trả học phí',
          collectorInfo: null,
          bankStatus: 'Chưa lập danh sách',
          emailStatus: 'Chưa gửi',
          approvalStatus: 'Chờ xác nhận'
        }
      ],

      mustRetakeStudentOptions: [
        {
          fullName: 'Đỗ Tiến Tây Anh',
          studentCode: '20210112P',
          className: 'ĐH-BK-CNTT1.1-K66',
          gender: 'Nam',
          email: 'Anh.DTT210112P@sis.hust.edu.vn'
        },
        {
          fullName: 'Lê Tuấn Anh',
          studentCode: '20210110P',
          className: 'ĐH-BK-CNTT1.2-K66',
          gender: 'Nam',
          email: 'Anh.LT210110P@sis.hust.edu.vn'
        }
      ]
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.totalItems / this.pageSize) || 1
    }
  },
  methods: {
    fetchData() {
      this.loading = true
      setTimeout(() => {
        this.loading = false
      }, 300)
    },

    formatCurrency(val) {
      if (!val) return '0'
      return new Intl.NumberFormat('vi-VN').format(val)
    },

    goToPage() {
      const p = parseInt(this.pageInput)
      if (p && p >= 1 && p <= this.totalPages) {
        this.page = p
      } else {
        this.pageInput = String(this.page)
      }
    },

    onAddSuccess(newItem) {
      // Khi thêm thành công sinh viên mới, đẩy thẳng vào bảng với trạng thái đã đăng ký
      this.items.unshift({
        id: newItem.id || Date.now(),
        studentName: newItem.fullName,
        studentCode: newItem.studentCode,
        className: newItem.className || 'ĐH-BK-CNTT1.1-K66',
        sessionCode: newItem.sessionId || '20261-A-5',
        subjectCode: newItem.subjectCode || 'IT3100',
        subjectName: newItem.subjectName || 'Lập trình hướng đối tượng',
        registrationCode: newItem.registrationCode || `HL_2026_${Math.floor(1000 + Math.random() * 9000)}`,
        registerDate: '07/09/2026',
        registerTime: new Date().toLocaleTimeString('vi-VN'),
        approvalDate: null,
        totalFee: 1000000,
        tuitionStatus: 'Chưa trả học phí',
        collectorInfo: null,
        bankStatus: 'Chưa lập danh sách',
        emailStatus: 'Chưa gửi',
        approvalStatus: 'Chờ xác nhận'
      })
      this.totalItems += 1
    }
  }
}
</script>

<style scoped>
.text-red-bold { color: #A62229 !important; }
.bg-red-bk { background-color: #A62229 !important; color: white !important; }
.bg-orange-btn { background-color: #F57C00 !important; color: white !important; }

.btn-action-icon {
  border: 1px solid #E0E0E0;
  border-radius: 4px;
}

/* PILL CÁC TRẠNG THÁI MÀU CAM KHỦNG */
.status-pill {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}
.pill-orange {
  background-color: #FFA726;
  color: white;
}

/* BẢNG CUSTOM GIỐNG ẢNH MẪU */
.custom-data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.custom-data-table th {
  background-color: #EEEEEE;
  color: #333;
  font-weight: 600;
  padding: 10px 8px;
  border-bottom: 2px solid #E0E0E0;
  white-space: nowrap;
}
.custom-data-table td {
  padding: 12px 8px;
  border-bottom: 1px solid #EEEEEE;
  vertical-align: middle;
}
.custom-data-table tbody tr:hover {
  background-color: #F9F9F9;
}

.action-btn {
  cursor: pointer;
  padding: 2px;
}

.page-size-select {
  width: 65px !important;
}
.page-size-select >>> .v-input__slot {
  min-height: 28px !important;
  padding: 0 6px !important;
}

.page-input-field {
  width: 45px !important;
}
.page-input-field >>> .v-input__slot {
  min-height: 28px !important;
  padding: 0 4px !important;
}
.page-input-field >>> input {
  text-align: center;
}

.go-btn {
  min-width: 28px !important;
  height: 28px !important;
}

.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }

.style-scrollbar::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}
.style-scrollbar::-webkit-scrollbar-thumb {
  background: #CCCCCC;
  border-radius: 4px;
}
</style>