<template>
  <v-dialog
    v-model="internalValue"
    width="750px"
    scrollable
    persistent
    :fullscreen="$vuetify.breakpoint.xsOnly"
  >
    <v-card class="rounded-lg-sm-up overflow-hidden d-flex flex-column bg-white">
      <!-- HEADER DIALOG -->
      <v-card-title class="bg-red-bk white--text pa-3 px-4 d-flex justify-space-between align-center flex-shrink-0">
        <span class="text-subtitle-1 font-weight-bold">Thêm sinh viên phải học lại</span>
        <v-btn icon dark small class="ma-0" @click="closeModal">
          <v-icon small>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- BODY DIALOG -->
      <v-card-text ref="dialogBody" class="pa-4 pa-sm-6 black--text overflow-y-auto style-scrollbar flex-grow-1">
        <div class="stepper-top-container w-100">
          
          <!-- ================= 1. CỤM TIÊU ĐỀ SỐ 1 VÀ SỐ 2 NẰM TRÊN CÙNG ================= -->
          <div class="stepper-header-top mb-4">
            <!-- SỐ 1: THÔNG TIN CÁ NHÂN -->
            <div class="step-head-item d-flex align-center cursor-pointer mb-2" @click="step = 1">
              <span class="step-icon-circle font-weight-bold">
                <v-icon v-if="step > 1" small color="white">mdi-check</v-icon>
                <span v-else>1</span>
              </span>
              <span class="text-body-2 font-weight-bold ml-3" :class="step === 1 ? 'text-black-bold' : 'text-grey-dark'">
                Thông tin cá nhân
              </span>
            </div>

            <!-- ĐƯỜNG NỐI DỌC -->
            <div class="step-line-v ml-3 my-1"></div>

            <!-- SỐ 2: THÔNG TIN LỚP -->
            <div ref="step2Header" class="step-head-item d-flex align-center cursor-pointer mt-2" @click="switchToStep2">
              <span class="step-icon-circle font-weight-bold" :class="step === 2 ? 'step-circle-active' : 'step-circle-pending'">
                2
              </span>
              <span class="text-body-2 font-weight-bold ml-3" :class="step === 2 ? 'text-black-bold' : 'text-grey-dark'">
                Thông tin lớp
              </span>
            </div>
          </div>

          <!-- ================= 2. NỘI DUNG FORM NHẬP DỮ LIỆU NẰM Ở PHÍA DƯỚI ================= -->
          <div class="stepper-content-bottom w-100 pt-2">
            
            <!-- FORM BƯỚC 1: THÔNG TIN CÁ NHÂN -->
            <v-expand-transition>
              <div v-show="step === 1" class="step-1-form-wrapper w-100">
                <div class="text-caption font-weight-bold text-red-bold mb-1">Nhập Mã Số Sinh Viên</div>
                <v-autocomplete
                  v-model="selectedStudent"
                  :items="studentOptions"
                  item-text="displayText"
                  return-object
                  placeholder="Sinh viên"
                  outlined
                  dense
                  clearable
                  class="rounded-lg mb-2 w-100"
                  @change="onSelectStudent"
                ></v-autocomplete>

                <!-- CHI TIẾT SINH VIÊN KHI ĐÃ CHỌN -->
                <div v-if="selectedStudentInfo" class="student-info-preview pa-3 pa-sm-4 rounded-lg bg-grey-lighten-5 border-card mb-3 w-100">
                  <h4 class="text-subtitle-2 font-weight-bold text-red-bold mb-2">Thông tin cá nhân</h4>
                  
                  <v-row dense class="text-caption ma-0">
                    <v-col cols="12" sm="6" class="py-1">Họ tên: <span class="font-weight-bold text-red-bold">{{ selectedStudentInfo.fullName }}</span></v-col>
                    <v-col cols="12" sm="6" class="py-1">Mã SV: <span class="font-weight-bold text-red-bold">{{ selectedStudentInfo.studentCode }}</span></v-col>
                    
                    <v-col cols="12" sm="6" class="py-1">Giới tính: <span class="font-weight-bold text-red-bold">{{ selectedStudentInfo.gender || 'Khác' }}</span></v-col>
                    <v-col cols="12" sm="6" class="py-1">Lớp: <span class="font-weight-bold text-red-bold">{{ selectedStudentInfo.className }}</span></v-col>
                    
                    <v-col cols="12" class="py-1">Email trường: <span class="text-red-bold text-break">{{ selectedStudentInfo.email || (selectedStudentInfo.studentCode.toLowerCase() + '@sis.hust.edu.vn') }}</span></v-col>
                    
                    <v-col cols="12" sm="6" class="py-1">Khóa: <span class="font-weight-bold text-red-bold">{{ selectedStudentInfo.academicYear || 'Khóa 66' }}</span></v-col>
                    <v-col cols="12" sm="6" class="py-1">Loại hình đào tạo: <span class="text-red-bold">{{ selectedStudentInfo.trainingType || 'Vừa làm vừa học' }}</span></v-col>
                    
                    <v-col cols="12" class="py-1">Ngành: <span class="font-weight-bold text-red-bold">{{ selectedStudentInfo.majorName || 'Quản trị kinh doanh' }}</span></v-col>
                  </v-row>
                </div>

                <!-- NÚT TIẾP TỤC DẪN SANG BƯỚC 2 -->
                <div class="d-flex justify-end mt-2">
                  <v-btn
                    color="#E0E0E0"
                    light
                    small
                    :disabled="!selectedStudentInfo"
                    class="text-none px-5 rounded-lg btn-next-step"
                    elevation="0"
                    @click="switchToStep2"
                  >
                    Tiếp tục
                  </v-btn>
                </div>
              </div>
            </v-expand-transition>

            <!-- FORM BƯỚC 2: THÔNG TIN LỚP -->
            <v-expand-transition>
              <div v-show="step === 2" class="step-2-form-wrapper w-100">
                <v-row dense class="ma-0">
                  <v-col cols="12" sm="6" class="px-0 px-sm-1">
                    <v-select
                      v-model="form.sessionId"
                      :items="['20261-A-4', '20261-A-5']"
                      label="Đợt học lại *"
                      outlined
                      dense
                      class="rounded-lg"
                    ></v-select>
                  </v-col>

                  <v-col cols="12" sm="6" class="px-0 px-sm-1">
                    <v-select
                      v-model="form.termId"
                      :items="['20261', '20252']"
                      label="Học kỳ *"
                      outlined
                      dense
                      class="rounded-lg"
                    ></v-select>
                  </v-col>

                  <v-col cols="12" sm="6" class="px-0 px-sm-1">
                    <v-text-field
                      v-model="form.classType"
                      label="Loại lớp thi"
                      outlined
                      dense
                      class="rounded-lg"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="6" class="px-0 px-sm-1">
                    <v-text-field
                      v-model="form.classCode"
                      label="Mã lớp thi"
                      outlined
                      dense
                      class="rounded-lg"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" class="px-0 px-sm-1">
                    <v-textarea
                      v-model="form.note"
                      label="Ghi chú"
                      outlined
                      dense
                      rows="2"
                      class="rounded-lg"
                    ></v-textarea>
                  </v-col>

                  <v-col cols="12" sm="6" class="px-0 px-sm-1">
                    <v-select
                      v-model="form.type"
                      :items="['Học lại', 'Thi lại']"
                      label="Học lại / Thi lại"
                      outlined
                      dense
                      class="rounded-lg"
                    ></v-select>
                  </v-col>

                  <v-col cols="12" sm="6" class="px-0 px-sm-1">
                    <v-text-field
                      v-model="form.bonusScore"
                      label="Điểm thưởng"
                      outlined
                      dense
                      class="rounded-lg"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="6" class="px-0 px-sm-1">
                    <v-text-field
                      v-model="form.charScore"
                      label="Điểm chữ"
                      outlined
                      dense
                      class="rounded-lg"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="6" class="px-0 px-sm-1">
                    <v-text-field
                      v-model="form.attendanceScore"
                      label="Điểm chuyên cần"
                      outlined
                      dense
                      class="rounded-lg"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="6" class="px-0 px-sm-1">
                    <v-text-field
                      v-model="form.processScore"
                      label="Điểm giữa kỳ"
                      outlined
                      dense
                      class="rounded-lg"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="6" class="px-0 px-sm-1">
                    <v-text-field
                      v-model="form.practiceScore"
                      label="Điểm quá trình"
                      outlined
                      dense
                      class="rounded-lg"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="6" class="px-0 px-sm-1">
                    <v-text-field
                      v-model="form.practiceScore2"
                      label="Điểm thực hành thí nghiệm"
                      outlined
                      dense
                      class="rounded-lg"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="6" class="px-0 px-sm-1">
                    <v-text-field
                      v-model="form.weight"
                      label="Trọng số"
                      outlined
                      dense
                      class="rounded-lg"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="6" class="px-0 px-sm-1">
                    <v-select
                      v-model="form.teacherName"
                      :items="['Phương Oanh', 'Nguyễn Văn A']"
                      label="Giảng viên"
                      outlined
                      dense
                      class="rounded-lg"
                    ></v-select>
                  </v-col>
                </v-row>

                <!-- BẢNG DANH SÁCH HỌC PHẦN DÀN FULL -->
                <div class="mt-2 w-100">
                  <div class="text-caption font-weight-bold mb-1">Danh sách học phần (0 / 0)</div>
                  <div class="border-card rounded-lg pa-4 text-center text-caption text-grey-color mb-3 bg-grey-lighten-5 w-100">
                    <v-checkbox hide-details dense class="ma-0 pa-0 mb-1 justify-center"></v-checkbox>
                    Không có dữ liệu
                  </div>

                  <v-btn color="#A62229" dark small class="text-none px-4 rounded-lg" elevation="0" @click="step = 1">
                    Quay lại
                  </v-btn>
                </div>
              </div>
            </v-expand-transition>

          </div>

        </div>
      </v-card-text>

      <v-divider></v-divider>

      <!-- FOOTER DIALOG -->
      <v-card-actions class="pa-2 px-4 d-flex justify-end bg-white flex-shrink-0 gap-2">
        <v-btn text small class="text-none btn-close-custom" @click="closeModal">
          Đóng
          <v-icon right small class="ml-1">mdi-close</v-icon>
        </v-btn>

        <v-btn
          dark
          small
          elevation="0"
          :disabled="!selectedStudentInfo"
          class="text-none btn-save-custom"
          @click="saveStudent"
        >
          Lưu
          <v-icon right small class="ml-1">mdi-content-save-outline</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'RetakeCourseAddMustRetakeStudentModal',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    mustRetakeStudents: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      step: 1,
      selectedStudent: null,
      selectedStudentInfo: null,

      mockStudents: [
        { id: 101, studentCode: '20210452P', fullName: 'Phan Thị Phương', className: 'ĐH-BK-QTKD2.2-K66', gender: 'Nữ' },
        { id: 102, studentCode: '20210344P', fullName: 'Vũ Phương Linh', className: 'ĐH-BK-QTKD2.2-K66', gender: 'Nữ' },
        { id: 103, studentCode: '20210377P', fullName: 'Trịnh Thanh Tâm', className: 'ĐH-BK-CNTT1.1-K66', gender: 'Nam' },
        { id: 104, studentCode: '20210105P', fullName: 'Nguyễn Khánh An', className: 'ĐH-BK-CNTT1.1-K66', gender: 'Nam' },
        { id: 105, studentCode: '20210108P', fullName: 'Nguyễn Linh Anh', className: 'ĐH-BK-CNTT1.1-K66', gender: 'Nữ' },
        { id: 106, studentCode: '20210110P', fullName: 'Lê Tuấn Anh', className: 'ĐH-BK-CNTT1.2-K66', gender: 'Nam' },
        { id: 107, studentCode: '20210112P', fullName: 'Đỗ Tiến Tây Anh', className: 'ĐH-BK-CNTT1.1-K66', gender: 'Nam' }
      ],

      form: {
        sessionId: '20261-A-4',
        termId: '20261',
        classType: '',
        classCode: '',
        note: '',
        type: 'Học lại',
        bonusScore: '',
        charScore: '',
        attendanceScore: '',
        processScore: '',
        practiceScore: '',
        practiceScore2: '',
        weight: '',
        teacherName: ''
      }
    }
  },
  computed: {
    internalValue: {
      get() { return this.value },
      set(val) { this.$emit('input', val) }
    },
    studentOptions() {
      return this.mockStudents.map(s => ({
        ...s,
        displayText: `${s.studentCode} - ${s.fullName}`
      }))
    }
  },
  methods: {
    onSelectStudent(student) {
      if (student) {
        this.selectedStudentInfo = student
      } else {
        this.selectedStudentInfo = null
      }
    },

    switchToStep2() {
      this.step = 2
      this.$nextTick(() => {
        if (this.$refs.step2Header) {
          this.$refs.step2Header.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
    },

    saveStudent() {
      if (!this.selectedStudentInfo) return

      const newStudent = {
        id: Date.now(),
        fullName: this.selectedStudentInfo.fullName,
        studentCode: this.selectedStudentInfo.studentCode,
        className: this.selectedStudentInfo.className,
        sessionCode: this.form.sessionId,
        termCode: this.form.termId,
        subjectCode: 'IT3100',
        subjectName: 'Lập trình hướng đối tượng',
        failedScore: '',
        isRegistered: false
      }

      this.$emit('success', newStudent)
      this.closeModal()
    },

    closeModal() {
      this.step = 1
      this.selectedStudent = null
      this.selectedStudentInfo = null
      this.internalValue = false
    }
  }
}
</script>

<style scoped>
.bg-red-bk { background-color: #A62229 !important; }
.text-red-bold { color: #A62229 !important; }
.text-black-bold { color: #333333 !important; }
.text-grey-dark { color: #8C8C8C !important; }
.border-card { border: 1px solid #E0E0E0; }

.text-break {
  word-break: break-word !important;
  overflow-wrap: break-word !important;
}

.step-icon-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: white;
  flex-shrink: 0;
  background-color: #A62229;
}

.step-circle-active {
  background-color: #A62229 !important;
}

.step-circle-pending {
  background-color: #A62229 !important;
  opacity: 0.8;
}

.step-line-v {
  width: 2px;
  height: 16px;
  background-color: #E0E0E0;
}

.btn-next-step:not([disabled]) {
  background-color: #E0E0E0 !important;
  color: #333333 !important;
}

.btn-close-custom {
  color: #A62229 !important;
  font-weight: 500;
  border-radius: 6px;
}

.btn-save-custom {
  background-color: #A62229 !important;
  color: #ffffff !important;
  font-weight: 500;
  border-radius: 8px !important;
  padding: 0 16px !important;
  height: 36px !important;
}

.style-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.style-scrollbar::-webkit-scrollbar-thumb {
  background: #C1C1C1;
  border-radius: 4px;
}

@media (min-width: 600px) {
  .rounded-lg-sm-up {
    border-radius: 8px !important;
  }
}
</style>