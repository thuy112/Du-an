<template>
  <v-dialog v-model="internalShow" max-width="850px" scrollable persistent>
    <v-card class="detail-modal-card">
      <!-- HEADER MÀU ĐỎ ĐÔ -->
      <div
        class="modal-header d-flex align-center justify-space-between px-5 py-3"
      >
        <span class="text-h6 font-weight-bold white--text"
          >Chi tiết lớp học lại</span
        >
        <v-btn icon dark small class="ma-0" @click="closeModal">
          <v-icon size="22">mdi-close</v-icon>
        </v-btn>
      </div>

      <!-- BODY MODAL -->
      <v-card-text
        class="modal-body-scroll px-6 py-4 black--text"
        style="max-height: 70vh"
      >
        <template v-if="detailData">
          <!-- PHẦN 1: THÔNG TIN LỚP HỌC LẠI -->
          <div class="section-title font-weight-bold text-subtitle-1 mb-3">
            Thông tin lớp học lại
          </div>

          <v-row dense class="info-grid text-body-2 mb-4">
            <v-col cols="6">
              <span class="text-grey-color">Mã lớp học lại:</span>
              <span class="font-weight-medium ml-1 text-red-bold">{{
                displayClassCode
              }}</span>
            </v-col>
            <v-col cols="6">
              <span class="text-grey-color">Loại lớp:</span>
              <span class="font-weight-medium ml-1 text-red-bold">{{
                displayClassType
              }}</span>
            </v-col>

            <v-col cols="6">
              <span class="text-grey-color">Hệ số lớp:</span>
              <span class="font-weight-medium ml-1">{{
                displayCoefficient
              }}</span>
            </v-col>
            <v-col cols="6">
              <span class="text-grey-color">Tổng sinh viên:</span>
              <span class="font-weight-medium ml-1">{{
                studentList.length
              }}</span>
            </v-col>

            <v-col cols="6">
              <span class="text-grey-color">Thời gian học lại:</span>
              <span class="font-weight-medium ml-1 text-red-bold">{{
                displayDuration
              }}</span>
            </v-col>
            <v-col cols="6">
              <span class="text-grey-color">Đợt học lại / Học kỳ:</span>
              <span class="font-weight-medium ml-1 text-red-bold">{{
                displaySemester
              }}</span>
            </v-col>

            <v-col cols="6">
              <span class="text-grey-color">Mã học phần:</span>
              <span class="font-weight-medium ml-1 text-red-bold">{{
                displaySubjectCode
              }}</span>
            </v-col>
            <v-col cols="6">
              <span class="text-grey-color">Tên học phần:</span>
              <span class="font-weight-medium ml-1 text-red-bold">{{
                displaySubjectName
              }}</span>
            </v-col>

            <v-col cols="6">
              <span class="text-grey-color">Tín chỉ:</span>
              <span class="font-weight-medium ml-1 text-red-bold">{{
                displayCredits
              }}</span>
            </v-col>
            <v-col cols="6">
              <span class="text-grey-color">Thời lượng:</span>
              <span class="font-weight-medium ml-1 text-red-bold">{{
                displayTimeAllocation
              }}</span>
            </v-col>

            <!-- TRẠNG THÁI DUYỆT DANH SÁCH -->
            <v-col cols="6" class="d-flex align-center mt-2">
              <span class="text-grey-color mr-1"
                >Trạng thái duyệt danh sách:</span
              >
              <span
                :class="[
                  'status-pill',
                  isApprovedModal ? 'bg-green' : 'bg-orange',
                ]"
              >
                {{ displayTrangThaiDuyet }}
              </span>
            </v-col>

            <!-- TRẠNG THÁI BẢNG ĐIỂM -->
            <v-col cols="6" class="d-flex align-center mt-2">
              <span class="text-grey-color mr-1">Trạng thái bảng điểm:</span>
              <span
                :class="['status-pill', getExamStatusBg(displayExamStatus)]"
              >
                {{ displayExamStatus }}
              </span>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <!-- PHẦN 2: THÔNG TIN GIẢNG VIÊN -->
          <div class="section-title font-weight-bold text-subtitle-1 mb-3">
            Thông tin giảng viên
          </div>

          <v-row dense class="text-body-2 mb-4">
            <template v-if="hasPrimaryTeacher">
              <v-col cols="12" class="font-weight-bold mb-2"
                >Giảng viên chính:</v-col
              >
              <v-col cols="6">
                <span class="text-grey-color">Mã giảng viên:</span>
                <span class="font-weight-medium ml-1 text-red-bold">{{
                  primaryTeacherCode
                }}</span>
              </v-col>
              <v-col cols="6">
                <span class="text-grey-color">Tên giảng viên:</span>
                <span class="font-weight-medium ml-1 text-red-bold">{{
                  primaryTeacherName
                }}</span>
              </v-col>
            </template>
            <template v-else>
              <v-col cols="12" class="text-grey-color font-italic">
                Chưa gán giảng viên chính
              </v-col>
            </template>

            <!-- TRỢ GIẢNG -->
            <template v-if="hasAssistantTeacher">
              <v-col cols="12" class="font-weight-bold mt-2 mb-1"
                >Trợ giảng:</v-col
              >
              <v-col cols="6">
                <span class="text-grey-color">Mã trợ giảng:</span>
                <span class="font-weight-medium ml-1 text-red-bold">{{
                  assistantTeacherCode
                }}</span>
              </v-col>
              <v-col cols="6">
                <span class="text-grey-color">Tên trợ giảng:</span>
                <span class="font-weight-medium ml-1 text-red-bold">{{
                  assistantTeacherName
                }}</span>
              </v-col>
            </template>
            <template v-else>
              <v-col cols="12" class="text-grey-color font-italic mt-2">
                Chưa có trợ giảng
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
              <template #default>
                <thead>
                  <tr>
                    <th
                      class="text-left font-weight-bold gray-head-text"
                      style="width: 60px"
                    >
                      STT
                    </th>
                    <th class="text-left font-weight-bold gray-head-text">
                      Thông tin sinh viên
                    </th>
                    <th
                      class="text-left font-weight-bold gray-head-text"
                      style="width: 140px"
                    >
                      Khóa
                    </th>
                    <th
                      class="text-left font-weight-bold gray-head-text"
                      style="width: 180px"
                    >
                      Lớp
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="studentList && studentList.length > 0">
                    <tr
                      v-for="(std, idx) in studentList"
                      :key="std.id || idx"
                      class="student-row"
                    >
                      <td class="align-top py-3">{{ idx + 1 }}</td>
                      <td class="py-3">
                        <div class="font-weight-bold text-red-bold mb-1">
                          {{ std.fullName || '---' }}
                        </div>
                        <div class="text-caption text-grey-color">
                          Mã số sinh viên:
                          <strong class="black--text">{{
                            std.code || std.studentCode || '---'
                          }}</strong>
                        </div>
                        <div class="text-caption text-grey-color">
                          Số điện thoại:
                          <span class="text-red-bold">{{
                            std.phone || std.phoneNumber || '---'
                          }}</span>
                        </div>
                      </td>
                      <td class="align-top py-3 text-body-2">
                        {{ std.khoa || 'Khóa 66' }}
                      </td>
                      <td class="align-top py-3 text-body-2">
                        {{ std.className || '---' }}
                      </td>
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
        <v-btn
          text
          class="btn-close-action text-none font-weight-medium"
          @click="closeModal"
        >
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

    // HỨNG ĐA DẠNG KEY ĐỂ KHÔNG BỊ TRỐNG (---)
    displayClassCode() {
      return (
        this.detailData?.classCode ||
        this.detailData?.code ||
        this.detailData?.maLop ||
        this.detailData?.original?.code ||
        '---'
      )
    },
    displayClassType() {
      return (
        this.detailData?.classType ||
        this.detailData?.loaiLop ||
        this.detailData?.original?.classType ||
        'Lớp ghép (Chuyên ngành)'
      )
    },
    displayCoefficient() {
      return (
        this.detailData?.coefficient ||
        this.detailData?.classCoefficient ||
        this.detailData?.original?.coefficient ||
        '1.7'
      )
    },
    displayDuration() {
      return (
        this.detailData?.duration ||
        this.detailData?.thoiGian ||
        this.detailData?.time ||
        this.detailData?.original?.thoiGian ||
        '01/06/2026 - 09/06/2026'
      )
    },
    displaySemester() {
      return (
        this.detailData?.semester ||
        this.detailData?.dotHocLai ||
        this.detailData?.hocKy ||
        this.detailData?.original?.dotHocLai ||
        'Học Kỳ II (2025)'
      )
    },
    displaySubjectCode() {
      return (
        this.detailData?.subjectCode ||
        this.detailData?.hocPhanCode ||
        this.detailData?.maHocPhan ||
        this.detailData?.original?.subjectCode ||
        'ET4235'
      )
    },
    displaySubjectName() {
      return (
        this.detailData?.subjectName ||
        this.detailData?.hocPhanName ||
        this.detailData?.tenHocPhan ||
        this.detailData?.original?.subjectName ||
        'IoT trong y tế'
      )
    },
    displayCredits() {
      return (
        this.detailData?.credits ||
        this.detailData?.tinChi ||
        this.detailData?.original?.credits ||
        3
      )
    },
    displayTimeAllocation() {
      return (
        this.detailData?.timeAllocation ||
        this.detailData?.thoiLuong ||
        this.detailData?.original?.timeAllocation ||
        '0.6'
      )
    },

    // ĐỒNG BỘ TRẠNG THÁI DUYỆT
    displayTrangThaiDuyet() {
      return (
        this.detailData?.trangThaiDuyet ||
        this.detailData?.approvalStatusText ||
        'Chưa duyệt danh sách'
      )
    },
    isApprovedModal() {
      const status = this.displayTrangThaiDuyet
      return (
        status === 'Đã duyệt danh sách' ||
        status === 'APPROVED' ||
        status === 'ACTIVE'
      )
    },

    // ĐỒNG BỘ TRẠNG THÁI BẢNG ĐIỂM
    displayExamStatus() {
      return (
        this.detailData?.examStatus ||
        this.detailData?.gradeStatusText ||
        'Chưa có điểm'
      )
    },

    // XỬ LÝ THÔNG TIN GIẢNG VIÊN CHÍNH
    hasPrimaryTeacher() {
      const name = this.primaryTeacherName
      return name && name !== 'Chưa gán giảng viên chính' && name !== '---'
    },
    primaryTeacherName() {
      return (
        this.detailData?.mainTeacherName ||
        this.detailData?.teacherName ||
        this.detailData?.mainTeacher?.fullName ||
        this.detailData?.mainTeacher?.name ||
        this.detailData?.teacher?.fullName ||
        this.detailData?.original?.mainTeacherName ||
        this.detailData?.original?.teacherName ||
        this.detailData?.original?.mainTeacher?.fullName ||
        ''
      )
    },
    primaryTeacherCode() {
      return (
        this.detailData?.teacherCode ||
        this.detailData?.mainTeacher?.code ||
        this.detailData?.teacher?.code ||
        this.detailData?.original?.mainTeacher?.code ||
        this.detailData?.original?.teacherCode ||
        '---'
      )
    },

    // XỬ LÝ THÔNG TIN TRỢ GIẢNG
    hasAssistantTeacher() {
      const name = this.assistantTeacherName
      return name && name !== 'Chưa có trợ giảng' && name !== '---'
    },
    assistantTeacherName() {
      return (
        this.detailData?.assistantTeacherName ||
        this.detailData?.assistantTeacher?.fullName ||
        this.detailData?.assistantTeacher?.name ||
        this.detailData?.original?.assistantTeacherName ||
        this.detailData?.original?.assistantTeacher?.fullName ||
        ''
      )
    },
    assistantTeacherCode() {
      return (
        this.detailData?.assistantTeacherCode ||
        this.detailData?.assistantTeacher?.code ||
        this.detailData?.original?.assistantTeacher?.code ||
        '---'
      )
    },
  },
  methods: {
    closeModal() {
      this.internalShow = false
    },
    getExamStatusBg(status) {
      if (status === 'Đã có điểm') return 'bg-blue'
      if (status === 'Chờ duyệt') return 'bg-lime'
      return 'bg-orange'
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
  background-color: #a62229 !important;
  position: sticky;
  top: 0;
  z-index: 10;
}

.modal-body-scroll {
  overflow-y: auto !important;
}

.text-red-bold {
  color: #a62229 !important;
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

.bg-orange {
  background-color: #f59e0b !important;
}
.bg-green {
  background-color: #42b858 !important;
}
.bg-blue {
  background-color: #3b82f6 !important;
}
.bg-lime {
  background-color: #a3e635 !important;
}

.student-table-wrapper {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.btn-close-action {
  color: #333333 !important;
  font-size: 15px;
}
</style>
