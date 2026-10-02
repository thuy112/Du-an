<template>
  <div class="grade-sheet-container pa-4">
    <!-- BREADCRUMBS TIÊU ĐỀ TRANG -->
    <div class="d-flex align-center text-subtitle-2 text-grey-darken-1 mb-2">
      <span class="cursor-pointer" @click="$router.push('/quan-ly-hoc-lai/danh-sach-lop-hoc')">
        Danh sách lớp học lại
      </span>
      <v-icon small class="mx-1">mdi-chevron-right</v-icon>
      <span class="font-weight-medium black--text">{{ classCode }}</span>
    </div>

    <!-- TIÊU ĐỀ BẢNG ĐIỂM VÀ CÁC NÚT CÔNG CỤ -->
    <div class="d-flex align-center justify-space-between mb-4">
      <div class="text-h6 font-weight-bold black--text">
        Bảng điểm lớp học lại: {{ classCode }} ({{ studentGrades.length }})
      </div>

      <!-- THANH TÌM KIẾM VÀ CÁC NÚT ICON GÓC PHẢI (ẢNH 1 & 2) -->
      <div class="d-flex align-center gap-2">
        <v-text-field
          v-model="searchQuery"
          placeholder="Sinh viên"
          outlined
          dense
          hide-details
          class="search-input-field"
          style="width: 220px;"
          @keyup.enter="handleSearch"
        ></v-text-field>

        <!-- NÚT RESET/RELOAD -->
        <v-btn icon color="#A62229" class="btn-square-action" @click="fetchGradeData">
          <v-icon size="20">mdi-refresh</v-icon>
        </v-btn>

        <!-- NÚT TÌM KIẾM RED -->
        <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" @click="handleSearch">
          <v-icon size="20">mdi-magnify</v-icon>
        </v-btn>

        <!-- NÚT THÊM SINH VIÊN RED (+) -->
        <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" @click="openAddStudentModal">
          <v-icon size="20">mdi-plus</v-icon>
        </v-btn>

        <!-- NÚT THÊM/SỬA ĐIỂM HÀNG LOẠT (ORANGE) -->
        <v-btn color="#FF9800" dark class="btn-square-action min-w-0 px-3" @click="openBatchEditModal">
          <v-icon size="20">mdi-account-edit-outline</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- BẢNG DỮ LIỆU ĐIỂM SINH VIÊN -->
    <v-card flat class="table-card">
      <v-simple-table>
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left font-weight-bold black--text" style="width: 70px;">STT</th>
              <th class="text-left font-weight-bold black--text" style="width: 160px;">Mã số sinh viên</th>
              <th class="text-left font-weight-bold black--text">Họ và tên</th>
              <th class="text-left font-weight-bold black--text" style="width: 160px;">Lớp SV</th>
              <th class="text-center font-weight-bold black--text" style="width: 120px;">Điểm</th>
              <th class="text-left font-weight-bold black--text">Ghi chú</th>
              <th class="text-center font-weight-bold black--text" style="width: 150px;">Trạng thái</th>
              <th class="text-center font-weight-bold black--text" style="width: 120px;">Chức năng</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="studentGrades && studentGrades.length > 0">
              <tr v-for="(std, idx) in studentGrades" :key="std.id || idx">
                <td>{{ idx + 1 }}</td>
                <td class="font-weight-medium">{{ std.studentCode }}</td>
                <td class="font-weight-medium">{{ std.fullName }}</td>
                <td>{{ std.className }}</td>
                <td class="text-center font-weight-bold text-red-bold">{{ std.score !== null ? std.score : '-' }}</td>
                <td>{{ std.note || '' }}</td>
                <td class="text-center">
                  <span :class="['status-badge', std.status === 'PASSED' ? 'bg-green' : 'bg-orange']">
                    {{ std.status === 'PASSED' ? 'Đã đạt' : 'Chưa nhập' }}
                  </span>
                </td>
                <td class="text-center">
                  <v-btn icon small color="#1565C0" @click="editSingleScore(std)">
                    <v-icon size="18">mdi-pencil-outline</v-icon>
                  </v-btn>
                </td>
              </tr>
            </template>

            <!-- TRƯỜNG HỢP KHÔNG CÓ DỮ LIỆU (ẢNH 1 & 2) -->
            <tr v-else>
              <td colspan="8" class="text-center py-8 text-grey-color">
                Không có dữ liệu
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>

      <!-- HÀNG BOTTOM KHU VỰC IMPORT VÀ PHÂN TRANG -->
      <div class="d-flex align-center justify-space-between pa-4">
        <!-- NÚT IMPORT BẢNG ĐIỂM (DISABLE NẾU ĐÃ CÓ ĐIỂM - ẢNH 2) -->
        <v-btn
          :color="isGradeLocked ? '#E0E0E0' : '#2E7D32'"
          :dark="!isGradeLocked"
          :disabled="isGradeLocked"
          class="px-4 text-none font-weight-medium btn-import-excel"
          elevation="0"
          @click="triggerImportExcel"
        >
          <v-icon left size="20">mdi-file-excel-outline</v-icon>
          IMPORT BẢNG ĐIỂM
        </v-btn>

        <!-- INPUT FILE NẨN ĐỂ NHẬP EXCEL -->
        <input
          ref="excelFileInput"
          type="file"
          accept=".xlsx, .xls"
          style="display: none;"
          @change="onFileImportSelected"
        />

        <!-- PHÂN TRANG CƠ BẢN -->
        <div class="d-flex align-center gap-2">
          <span class="text-caption text-grey-color">Bản ghi</span>
          <v-select
            v-model="itemsPerPage"
            :items="[10, 20, 50, 100]"
            dense
            outlined
            hide-details
            style="width: 75px;"
          ></v-select>
          <span class="text-caption text-grey-color ml-2">Trang 1</span>
          <v-btn color="#A62229" dark small class="px-3">Đi</v-btn>
          <v-btn icon small disabled><v-icon>mdi-chevron-left</v-icon></v-btn>
          <v-btn icon small disabled><v-icon>mdi-chevron-right</v-icon></v-btn>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'RetakeCourseGradeSheetPage',
  data() {
    return {
      classCode: '',
      examSessionId: null,
      termId: null,
      examId: null,

      searchQuery: '',
      itemsPerPage: 50,

      // Trạng thái khóa bảng điểm (true = Disable nút Import như Ảnh 2)
      isGradeLocked: false,

      studentGrades: [],
    }
  },
  mounted() {
    // Route dùng ID số của lớp học lại.
    this.classCode = this.$route.params.id || ''

    // 2. LẤY QUERY PARAMETERS
    this.examSessionId = this.$route.query.examSessionId
    this.termId = this.$route.query.termId
    this.examId = this.$route.query.examId

    // 3. TẢI DỮ LIỆU ĐIỂM BAN ĐẦU
    this.fetchGradeData()
  },
  methods: {
    fetchGradeData() {
      // Gọi Service retakeCourseServices.js lấy bảng điểm theo các tham số ID
      // Tạm thời khởi tạo mảng rỗng chuẩn như Ảnh 1 & Ảnh 2
      this.studentGrades = []
    },

    handleSearch() {
      // Logic lọc tìm kiếm theo sinh viên
    },

    // SỰ KIỆN NÚT IMPORT EXCEL
    triggerImportExcel() {
      if (this.isGradeLocked) return
      this.$refs.excelFileInput.click()
    },

    onFileImportSelected(event) {
      const file = event.target.files[0]
      if (file) {
        // Xu ly đọc file Excel và cập nhật danh sách điểm
        this.$toast?.success?.('Tải file bảng điểm thành công!')
      }
    },

    openAddStudentModal() {
      // Mở Modal Thêm sinh viên
    },

    openBatchEditModal() {
      // Mở Modal Sửa điểm hàng loạt
    },

    editSingleScore(std) {
      // Mở dialog sửa điểm sinh viên lẻ
    }
  }
}
</script>

<style scoped>
.text-red-bold { color: #A62229 !important; }
.text-grey-color { color: #757575 !important; }

.search-input-field >>> .v-input__slot {
  border-radius: 6px !important;
  min-height: 38px !important;
}

.btn-square-action {
  border-radius: 6px !important;
  height: 38px !important;
  min-width: 38px !important;
}

.btn-import-excel {
  border-radius: 6px !important;
  height: 38px !important;
}

.table-card {
  border: 1px solid #E0E0E0;
  border-radius: 8px !important;
  overflow: hidden;
}

.status-badge {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: white;
}
.bg-green { background-color: #4CAF50 !important; }
.bg-orange { background-color: #FF9800 !important; }

.gap-2 { gap: 8px; }
.cursor-pointer { cursor: pointer; }
</style>