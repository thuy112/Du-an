<template>
  <v-dialog v-model="internalShow" max-width="850px" scrollable persistent>
    <v-card class="detail-modal-card">
      <!-- HEADER MÀU ĐỎ ĐÔ -->
      <div class="modal-header d-flex align-center justify-space-between px-5 py-3">
        <span class="text-h6 font-weight-bold white--text">Chi tiết lớp học lại</span>
        <v-btn icon dark small class="ma-0" @click="closeModal">
          <v-icon size="22">mdi-close</v-icon>
        </v-btn>
      </div>

      <!-- BODY MODAL -->
      <v-card-text class="modal-body-scroll px-6 py-4 black--text" style="max-height: 70vh;">
        <template v-if="detailData">
          <!-- PHẦN 1: THÔNG TIN LỚP HỌC LẠI -->
          <div class="section-title font-weight-bold text-subtitle-1 mb-3">
            Thông tin lớp học lại
          </div>

          <v-row dense class="info-grid text-body-2 mb-4">
            <v-col cols="6">
              <span class="text-grey-color">Mã lớp học lại:</span>
              <span class="font-weight-medium ml-1 text-red-bold">{{ detailData.classCode || 'G_20252_1_041' }}</span>
            </v-col>
            <v-col cols="6">
              <span class="text-grey-color">Loại lớp:</span>
              <span class="font-weight-medium ml-1 text-red-bold">{{ detailData.classType || 'Lớp ghép (Chuyên ngành)' }}</span>
            </v-col>

            <v-col cols="6">
              <span class="text-grey-color">Hệ số lớp:</span>
              <span class="font-weight-medium ml-1">{{ detailData.coefficient || '1.7' }}</span>
            </v-col>
            <v-col cols="6">
              <span class="text-grey-color">Tổng sinh viên:</span>
              <span class="font-weight-medium ml-1">{{ detailData.totalStudents || 10 }}</span>
            </v-col>

            <v-col cols="6">
              <span class="text-grey-color">Thời gian học lại:</span>
              <span class="font-weight-medium ml-1 text-red-bold">{{ detailData.duration || '01/06/2026 - 09/06/2026' }}</span>
            </v-col>
            <v-col cols="6">
              <span class="text-grey-color">Học kỳ:</span>
              <span class="font-weight-medium ml-1 text-red-bold">{{ detailData.semester || 'Học Kỳ II (2025)' }}</span>
            </v-col>

            <v-col cols="6">
              <span class="text-grey-color">Mã lớp:</span>
              <span class="font-weight-medium ml-1">{{ detailData.classCode }}</span>
            </v-col>
            <v-col cols="6">
              <span class="text-grey-color">Mã học phần:</span>
              <span class="font-weight-medium ml-1 text-red-bold">{{ detailData.subjectCode || 'ET4235' }}</span>
            </v-col>

            <v-col cols="6">
              <span class="text-grey-color">Tên học phần:</span>
              <span class="font-weight-medium ml-1 text-red-bold">{{ detailData.subjectName || 'IoT trong y tế' }}</span>
            </v-col>
            <v-col cols="6">
              <span class="text-grey-color">Tín chỉ:</span>
              <span class="font-weight-medium ml-1 text-red-bold">{{ detailData.credits || 3 }}</span>
            </v-col>

            <v-col cols="6">
              <span class="text-grey-color">Thời lượng:</span>
              <span class="font-weight-medium ml-1 text-red-bold">{{ detailData.timeAllocation || '0.6' }}</span>
            </v-col>
            
            <v-col cols="6" class="d-flex align-center">
              <span class="text-grey-color mr-1">Trạng thái duyệt danh sách:</span>
              <span :class="['status-pill', detailData.approvalStatus === 'ACTIVE' ? 'bg-green' : 'bg-orange']">
                {{ detailData.approvalStatus === 'ACTIVE' ? 'Đã duyệt danh sách' : 'Chưa duyệt danh sách' }}
              </span>
            </v-col>

            <v-col cols="6" class="d-flex align-center">
              <span class="text-grey-color mr-1">Trạng thái bảng điểm:</span>
              <span :class="['status-pill', detailData.gradeStatus === 'ACTIVE' ? 'bg-blue' : 'bg-orange']">
                {{ detailData.gradeStatus === 'ACTIVE' ? 'Đã có điểm' : 'Chưa có điểm' }}
              </span>
            </v-col>

            <!-- HÌNH THỨC GIẢNG DẠY: CHỈ HIỆN KHI ĐÃ GÁN GIẢNG VIÊN HOẶC ĐÃ DUYỆT DANH SÁCH -->
            <v-col
              v-if="isTeachingModeVisible"
              cols="6"
              class="d-flex align-center"
            >
              <span class="text-grey-color mr-2">Hình thức giảng dạy:</span>
              <span class="teaching-mode-pill">
                {{ detailData.teachingMode || 'Trực tiếp' }}
              </span>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <!-- PHẦN 2: THÔNG TIN GIẢNG VIÊN -->
          <div class="section-title font-weight-bold text-subtitle-1 mb-3">
            Thông tin giảng viên
          </div>

          <v-row dense class="text-body-2 mb-4">
            <template v-if="detailData.primaryTeacher">
              <v-col cols="12" class="font-weight-bold mb-2">Giảng viên chính:</v-col>
              <v-col cols="6">
                <span class="text-grey-color">Mã giảng viên:</span>
                <span class="font-weight-medium ml-1 text-red-bold">{{ detailData.primaryTeacher.code }}</span>
              </v-col>
              <v-col cols="6">
                <span class="text-grey-color">Tên giảng viên:</span>
                <span class="font-weight-medium ml-1 text-red-bold">{{ detailData.primaryTeacher.fullName }}</span>
              </v-col>
            </template>
            <template v-else>
              <v-col cols="12" class="text-grey-color italic">
                Chưa gán giảng viên chính
              </v-col>
            </template>

            <!-- TRỢ GIẢNG (NẾU CÓ) -->
            <template v-if="detailData.assistantTeacher">
              <v-col cols="12" class="font-weight-bold mt-2 mb-1">Trợ giảng:</v-col>
              <v-col cols="6">
                <span class="text-grey-color">Mã trợ giảng:</span>
                <span class="font-weight-medium ml-1 text-red-bold">{{ detailData.assistantTeacher.code }}</span>
              </v-col>
              <v-col cols="6">
                <span class="text-grey-color">Tên trợ giảng:</span>
                <span class="font-weight-medium ml-1 text-red-bold">{{ detailData.assistantTeacher.fullName }}</span>
              </v-col>
            </template>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <!-- PHẦN 3: DANH SÁCH SINH VIÊN -->
          <div class="section-title font-weight-bold text-subtitle-1 mb-3">
            Danh sách sinh viên ({{ studentList.length }})
          </div>

          <div class="student-table-wrapper">
            <v-simple-table dense>
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left font-weight-bold gray-head-text" style="width: 80px;">STT</th>
                    <th class="text-left font-weight-bold gray-head-text">Thông tin sinh viên</th>
                    <th class="text-left font-weight-bold gray-head-text" style="width: 150px;">Khóa</th>
                    <th class="text-left font-weight-bold gray-head-text" style="width: 200px;">Lớp</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="studentList && studentList.length > 0">
                    <tr v-for="(std, idx) in studentList" :key="std.id || idx" class="student-row">
                      <td class="align-top py-3">{{ idx + 1 }}</td>
                      <td class="py-3">
                        <div class="font-weight-bold text-red-bold mb-1">{{ std.fullName }}</div>
                        <div class="text-caption text-grey-color">Mã số sinh viên: <strong class="black--text">{{ std.studentCode }}</strong></div>
                        <div class="text-caption text-grey-color">Số điện thoại: <span class="text-red-bold">{{ std.phone }}</span></div>
                      </td>
                      <td class="align-top py-3 text-body-2">{{ std.cohort || 'Khóa 66' }}</td>
                      <td class="align-top py-3 text-body-2">{{ std.className || 'Tin học kinh tế' }}</td>
                    </tr>
                  </template>
                  <tr v-else>
                    <td colspan="4" class="text-center py-6 text-grey-color">
                      Chưa có sinh viên đăng ký lớp học này
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </div>
        </template>
      </v-card-text>

      <!-- FOOTER -->
      <v-divider></v-divider>
      <v-card-actions class="justify-end px-6 py-3 bg-white">
        <v-btn text class="btn-close-action text-none font-weight-medium" @click="closeModal">
          Đóng <v-icon size="18" right>mdi-close</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'RetakeCourseDetailModal',
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    detailData: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    internalShow: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      },
    },
    studentList() {
      return this.detailData?.students || []
    },
    // COMPUTED ĐIỀU KIỆN HIỂN THỊ HÌNH THỨC GIẢNG DẠY
    isTeachingModeVisible() {
      if (!this.detailData) return false

      const hasTeacherAssigned = !!this.detailData.primaryTeacher
      const isApproved =
        this.detailData.approvalStatus === 'ACTIVE' || !!this.detailData.hasBeenApproved

      return hasTeacherAssigned || isApproved
    },
  },
  methods: {
    closeModal() {
      this.internalShow = false
    },
  },
}
</script>

<style scoped>
.detail-modal-card {
  border-radius: 12px !important;
  overflow: hidden;
}

.modal-header {
  background-color: #A62229 !important;
  position: sticky;
  top: 0;
  z-index: 10;
}

.modal-body-scroll {
  overflow-y: auto !important;
}

.text-red-bold {
  color: #A62229 !important;
}

.text-grey-color {
  color: #666666 !important;
}

.gray-head-text {
  color: #555555 !important;
}

.status-pill {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.teaching-mode-pill {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background-color: #2196F3 !important;
  color: white;
}

.bg-orange { background-color: #FF8F00 !important; }
.bg-green { background-color: #4CAF50 !important; }
.bg-blue { background-color: #2196F3 !important; }

.student-table-wrapper {
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  overflow: hidden;
}

.btn-close-action {
  color: #333333 !important;
  font-size: 15px;
}
</style>