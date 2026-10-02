<template>
  <div class="grade-sheet-container pa-4">
    <!-- TIÊU ĐỀ BẢNG ĐIỂM VÀ CÁC NÚT CÔNG CỤ -->
    <div class="d-flex align-center justify-space-between mb-4">
      <div class="page-title text-h6 font-weight-medium">
        Bảng điểm lớp học lại: {{ classCode || 'TEST_999' }}
        <span class="red-count font-weight-bold ml-1">( {{ studentGrades.length }} )</span>
      </div>

      <!-- THANH TÌM KIẾM VÀ CÁC NÚT ICON GÓC PHẢI -->
      <div class="d-flex align-center gap-2">
        <v-text-field
          v-model="searchQuery"
          placeholder="Sinh viên"
          outlined
          dense
          hide-details
          class="search-input-field"
          @keyup.enter="handleSearch"
        ></v-text-field>

        <!-- NÚT RESET / RELOAD -->
        <v-btn icon color="#a2212b" class="btn-action-icon" @click="fetchGradeData">
          <v-icon size="22">mdi-refresh</v-icon>
        </v-btn>

        <!-- NÚT TÌM KIẾM (ĐỎ) -->
        <v-btn color="#a2212b" dark class="btn-action-square" elevation="0" @click="handleSearch">
          <v-icon size="20">mdi-magnify</v-icon>
        </v-btn>

        <!-- NÚT THÊM SINH VIÊN / THÊM BẢNG ĐIỂM (ĐỎ +) -->
        <v-btn color="#a2212b" dark class="btn-action-square" elevation="0" @click="openAddGradeModal">
          <v-icon size="20">mdi-plus</v-icon>
        </v-btn>

        <!-- NÚT THÊM/SỬA ĐIỂM HÀNG LOẠT (CAM) -->
        <v-btn color="#f57c00" dark class="btn-action-square" elevation="0" @click="openBatchEditModal">
          <v-icon size="20">mdi-account-edit-outline</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- BẢNG DỮ LIỆU ĐIỂM SINH VIÊN -->
    <v-card flat class="table-card">
      <v-simple-table class="custom-table">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left font-weight-bold" style="width: 70px;">STT</th>
              <th class="text-left font-weight-bold" style="width: 170px;">Mã số sinh viên</th>
              <th class="text-left font-weight-bold">Họ và tên</th>
              <th class="text-left font-weight-bold" style="width: 170px;">Lớp SV</th>
              <th class="text-center font-weight-bold" style="width: 110px;">Điểm</th>
              <th class="text-left font-weight-bold" style="width: 200px;">Ghi chú</th>
              <th class="text-center font-weight-bold" style="width: 140px;">Trạng thái</th>
              <th class="text-center font-weight-bold" style="width: 130px;">Chức năng</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="studentGrades && studentGrades.length > 0">
              <tr v-for="(std, idx) in studentGrades" :key="std.id || idx">
                <td class="text-left">{{ idx + 1 }}</td>
                <td class="text-left font-weight-medium">{{ std.studentCode }}</td>
                <td class="text-left font-weight-medium">{{ std.fullName }}</td>
                <td class="text-left">{{ std.className }}</td>
                <td class="text-center font-weight-bold text-red-bold">
                  {{ std.score !== null && std.score !== undefined ? std.score : '-' }}
                </td>
                <td class="text-left">{{ std.note || '' }}</td>
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

            <!-- TRƯỜNG HỢP KHÔNG CÓ DỮ LIỆU -->
            <tr v-else>
              <td colspan="8" class="text-center py-7 no-data-text">
                Không có dữ liệu
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>

      <!-- HÀNG BOTTOM: IMPORT BẢNG ĐIỂM VÀ PHÂN TRANG -->
      <div class="d-flex align-center justify-space-between pt-5 pb-3 px-3">
        <!-- NÚT IMPORT BẢNG ĐIỂM -->
        <v-btn
          color="#4cae51"
          dark
          class="btn-import-excel px-4 text-none font-weight-medium"
          elevation="0"
          :disabled="isGradeLocked"
          @click="triggerImportExcel"
        >
          <v-icon left size="18">mdi-file-excel</v-icon>
          IMPORT BẢNG ĐIỂM
        </v-btn>

        <!-- INPUT FILE ẨN -->
        <input
          ref="excelFileInput"
          type="file"
          accept=".xlsx, .xls"
          style="display: none;"
          @change="onFileImportSelected"
        />

        <!-- PHÂN TRANG KHỚP ẢNH MẪU -->
        <div class="d-flex align-center gap-2 pagination-wrapper">
          <v-select
            v-model="itemsPerPage"
            :items="[10, 20, 50, 100]"
            dense
            outlined
            hide-details
            label="Bản ghi"
            class="pagination-select"
          ></v-select>

          <v-text-field
            v-model="pageInput"
            dense
            outlined
            hide-details
            label="Trang"
            class="pagination-page-input"
          ></v-text-field>

          <v-btn color="#a2212b" dark elevation="0" class="btn-go font-weight-bold" @click="handleGoPage">
            Đi
          </v-btn>

          <button class="btn-page-nav" disabled>
            <v-icon size="18" color="#9e9e9e">mdi-chevron-left</v-icon>
          </button>
          <button class="btn-page-nav" disabled>
            <v-icon size="18" color="#9e9e9e">mdi-chevron-right</v-icon>
          </button>
        </div>
      </div>
    </v-card>

    <!-- ======================================================= -->
    <!-- MODAL "THÊM BẢNG ĐIỂM" VIẾT TRỰC TIẾP Ở ĐÂY                -->
    <!-- ======================================================= -->
    <v-dialog v-model="dialogAddGrade" max-width="750" persistent>
      <v-card class="rounded-lg overflow-hidden card-add-grade">
        <!-- HEADER MÀU ĐỎ BÁCH KHOA -->
        <v-card-title class="d-flex justify-space-between align-center py-3 px-4 dialog-header">
          <span class="text-subtitle-1 font-weight-bold white--text">Thêm bảng điểm</span>
          <v-btn icon dark small @click="closeAddGradeModal">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <!-- NỘI DUNG FORM NHẬP BẢNG ĐIỂM -->
        <v-card-text class="pa-4">
          <v-form ref="addScoreForm" v-model="validAddForm">
            <v-simple-table class="modal-table">
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left font-weight-bold" style="width: 80px;">STT</th>
                    <th class="text-left font-weight-bold" style="width: 220px;">Họ và tên</th>
                    <th class="text-center font-weight-bold" style="width: 130px;">Điểm</th>
                    <th class="text-left font-weight-bold">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- KHHI CÓ DANH SÁCH SINH VIÊN (ẢNH 2) -->
                  <template v-if="modalStudents && modalStudents.length > 0">
                    <tr v-for="(item, index) in modalStudents" :key="item.id || index">
                      <td class="text-left grey--text text--darken-2 py-2">{{ index + 1 }}</td>
                      <td class="text-left font-weight-medium grey--text text--darken-3 py-2">
                        {{ item.fullName }}
                      </td>
                      <td class="text-center py-2">
                        <!-- Ô NHẬP ĐIỂM: ĐIỀU KIỆN SỐ VÀ KHÔNG ĐƯỢC ÂM -->
                        <v-text-field
                          v-model="item.score"
                          outlined
                          dense
                          hide-details="auto"
                          class="score-input"
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          :rules="scoreRules"
                          @keydown="preventNegativeInput"
                        />
                      </td>
                      <td class="text-left py-2">
                        <v-text-field
                          v-model="item.note"
                          outlined
                          dense
                          hide-details
                          class="note-input"
                          placeholder=""
                        />
                      </td>
                    </tr>
                  </template>

                  <!-- KHÔNG CÓ DỮ LIỆU (ẢNH 1) -->
                  <tr v-else>
                    <td colspan="4" class="text-center py-8 no-data-text">
                      Không có dữ liệu
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-form>
        </v-card-text>

        <!-- CÁC NÚT BOTTOM ACTIONS -->
        <v-card-actions class="px-6 pb-4 pt-2 justify-end">
          <v-btn
            text
            class="text-capitalize font-weight-bold mr-2 btn-close"
            @click="closeAddGradeModal"
          >
            Đóng <v-icon small class="ml-1">mdi-close</v-icon>
          </v-btn>

          <v-btn
            color="#a2212b"
            dark
            elevation="0"
            class="text-capitalize font-weight-bold px-4 btn-save"
            :loading="loadingSaveGrade"
            @click="submitSaveGrades"
          >
            Lưu <v-icon small class="ml-1">mdi-content-save-outline</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'RetakeCourseGradeSheetPage',
  data() {
    return {
      classCode: 'TEST_999',
      examSessionId: null,
      termId: null,
      examId: null,

      searchQuery: '',
      itemsPerPage: 50,
      pageInput: 1,

      isGradeLocked: false,
      studentGrades: [], // Mặc định rỗng như ảnh 1 & 2

      // MODAL DATA
      dialogAddGrade: false,
      validAddForm: true,
      loadingSaveGrade: false,
      modalStudents: [], // Mảng chứa danh sách sinh viên hiển thị ở modal

      // RÀNG BUỘC ĐIỀU KIỆN Ô ĐIỂM (ĐIỀU KIỆN SỐ VÀ KHÔNG ĐƯỢC ÂM, TỐI ĐA 10)
      scoreRules: [
        v => v === null || v === undefined || v === '' || !isNaN(v) || 'Phải là số',
        v => v === null || v === undefined || v === '' || Number(v) >= 0 || 'Không được âm',
        v => v === null || v === undefined || v === '' || Number(v) <= 10 || 'Điểm tối đa là 10'
      ]
    }
  },
  mounted() {
    if (this.$route.params.id) {
      this.classCode = this.$route.params.id
    }
    this.fetchGradeData()
  },
  methods: {
    fetchGradeData() {
      // Khởi tạo danh sách rỗng chuẩn ảnh 1
      this.studentGrades = []
    },

    openAddGradeModal() {
      // Ví dụ: Khi có sinh viên, bạn chỉ cần gán mảng danh sách vào this.modalStudents
      // Nếu không có sinh viên (this.modalStudents = []), modal sẽ hiện "Không có dữ liệu" như Ảnh 1
      /*
      this.modalStudents = [
        { id: 1, fullName: 'Nguyễn Khánh An', score: null, note: '' },
        { id: 2, fullName: 'Nguyễn Quang Anh', score: null, note: '' },
        { id: 3, fullName: 'Nguyễn Linh Anh', score: null, note: '' },
        { id: 4, fullName: 'Lê Tuấn Anh', score: null, note: '' },
        { id: 5, fullName: 'Đỗ Tiến Tây Anh', score: null, note: '' },
        { id: 6, fullName: 'Nguyễn Hữu Cường', score: null, note: '' },
        { id: 7, fullName: 'Bùi Minh Chiến', score: null, note: '' },
        { id: 8, fullName: 'Lê Văn Chiến', score: null, note: '' }
      ]
      */
      
      this.dialogAddGrade = true
    },

    closeAddGradeModal() {
      this.dialogAddGrade = false
      if (this.$refs.addScoreForm) {
        this.$refs.addScoreForm.resetValidation()
      }
    },

    // NGẶN KHÔNG CHO NHẬP DẤU TRỪ (-) HOẶC KÝ TỰ 'e'
    preventNegativeInput(e) {
      if (e.key === '-' || e.key === 'e' || e.key === 'E') {
        e.preventDefault()
      }
    },

    submitSaveGrades() {
      if (this.$refs.addScoreForm && !this.$refs.addScoreForm.validate()) return

      this.loadingSaveGrade = true
      try {
        // Logic xử lý đồng bộ
        this.$toast?.success?.('Lưu bảng điểm thành công!')
        this.closeAddGradeModal()
      } catch (e) {
        console.error(e)
      } finally {
        this.loadingSaveGrade = false
      }
    },

    handleSearch() {},
    handleGoPage() {},
    triggerImportExcel() {
      if (!this.isGradeLocked) this.$refs.excelFileInput.click()
    },
    onFileImportSelected(event) {},
    openBatchEditModal() {},
    editSingleScore(std) {}
  }
}
</script>

<style scoped>
.grade-sheet-container {
  background-color: #ffffff;
  min-height: 100vh;
}

.page-title {
  color: #212121;
  font-size: 1.15rem !important;
}

.red-count {
  color: #a2212b !important;
}

.gap-2 {
  gap: 8px;
}

.search-input-field {
  width: 220px;
}
.search-input-field >>> .v-input__slot {
  min-height: 36px !important;
  border-radius: 4px !important;
  box-shadow: none !important;
}

.btn-action-icon {
  width: 36px !important;
  height: 36px !important;
}

.btn-action-square {
  min-width: 44px !important;
  width: 44px !important;
  height: 36px !important;
  border-radius: 4px !important;
  padding: 0 !important;
}

.table-card {
  box-shadow: none !important;
  background: transparent;
}

.custom-table {
  background: transparent !important;
}

.custom-table >>> thead tr {
  background-color: #eaeaea !important;
  height: 42px !important;
}

.custom-table >>> thead th {
  color: #111111 !important;
  font-size: 13px !important;
  border-bottom: none !important;
  padding: 0 12px !important;
}

.custom-table >>> tbody tr td {
  border-bottom: 1px solid #f0f0f0 !important;
  font-size: 13px !important;
  padding: 0 12px !important;
}

.no-data-text {
  color: #9e9e9e !important;
  font-size: 13.5px !important;
  border-bottom: 1px solid #eeeeee !important;
}

.btn-import-excel {
  height: 36px !important;
  border-radius: 4px !important;
  font-size: 13px !important;
  letter-spacing: 0.3px;
  background-color: #4cae51 !important;
}

.pagination-wrapper {
  display: flex;
  align-items: center;
}

.pagination-select {
  width: 76px !important;
}
.pagination-select >>> .v-input__slot {
  min-height: 34px !important;
  border-radius: 4px !important;
  padding: 0 6px 0 10px !important;
}

.pagination-page-input {
  width: 54px !important;
}
.pagination-page-input >>> .v-input__slot {
  min-height: 34px !important;
  border-radius: 4px !important;
  padding: 0 8px !important;
}
.pagination-page-input >>> input {
  text-align: center;
}

.btn-go {
  height: 34px !important;
  min-width: 48px !important;
  border-radius: 4px !important;
  font-size: 13px !important;
  padding: 0 12px !important;
}

.btn-page-nav {
  width: 32px;
  height: 32px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.btn-page-nav:disabled {
  cursor: default;
  background-color: #fafafa;
  border-color: #eeeeee;
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
.text-red-bold { color: #a2212b !important; }

/* CSS STYLES DÀNH CHO MODAL */
.card-add-grade {
  background: #ffffff;
}

.dialog-header {
  background-color: #a2212b !important;
}

.modal-table {
  background: transparent !important;
}

.modal-table >>> thead tr {
  background-color: #f5f5f5 !important;
  height: 40px !important;
}

.modal-table >>> thead th {
  color: #212121 !important;
  font-size: 13px !important;
  border-bottom: 1px solid #e0e0e0 !important;
}

.modal-table >>> tbody tr td {
  border-bottom: 1px solid #f0f0f0 !important;
  font-size: 13px !important;
}

/* Ô NHẬP ĐIỂM TRONG MODAL */
.score-input {
  width: 52px !important;
  margin: 0 auto;
}

.score-input >>> .v-input__slot {
  min-height: 36px !important;
  padding: 0 4px !important;
  border-radius: 4px !important;
  border: 1px solid #d0d0d0 !important;
}

.score-input >>> input {
  text-align: center;
  font-size: 13px;
  padding: 0 !important;
}

/* ẨN MŨI TÊN TĂNG GIẢM CỦA INPUT NUMBER */
.score-input >>> input::-webkit-outer-spin-button,
.score-input >>> input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.score-input >>> input[type='number'] {
  -moz-appearance: textfield;
}

.note-input >>> .v-input__slot {
  min-height: 36px !important;
  border-radius: 4px !important;
  border: 1px solid #e0e0e0 !important;
}

.btn-close {
  color: #333333 !important;
}

.btn-save {
  background-color: #a2212b !important;
  border-radius: 4px !important;
}
</style>