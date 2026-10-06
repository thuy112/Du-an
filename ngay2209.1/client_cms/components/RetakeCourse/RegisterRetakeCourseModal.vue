<template>
  <v-dialog v-model="internalValue" width="850px" persistent scrollable eager>
    <v-card class="modal-auto-size rounded-lg overflow-hidden d-flex flex-column">
      <!-- HEADER DIALOG -->
      <v-card-title class="bg-red-bk white--text pa-3 d-flex justify-space-between align-center flex-shrink-0">
        <span class="text-subtitle-1 font-weight-bold">Đăng ký học lại</span>
        <v-btn icon dark small class="ma-0" @click="closeModal">
          <v-icon small>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- BODY DIALOG PHÂN STEPPER -->
      <v-card-text class="pa-5 black--text overflow-y-auto style-scrollbar">
        <div class="d-flex">
          <!-- BÊN TRÁI: ĐIỀU HƯỚNG BƯỚC STEPPER -->
          <div class="stepper-left-bar flex-shrink-0" style="width: 180px;">
            <!-- BƯỚC 1 -->
            <div class="d-flex align-center gap-2 mb-8">
              <span :class="['step-icon', 'bg-red-bk', 'white--text']">
                <v-icon v-if="currentStep > 1" x-small dark>mdi-check</v-icon>
                <template v-else>1</template>
              </span>
              <span :class="['text-caption', currentStep === 1 ? 'font-weight-bold black--text' : 'text-grey-color']">
                Thông tin cá nhân
              </span>
            </div>

            <!-- BƯỚC 2 -->
            <div class="d-flex align-center gap-2">
              <span :class="['step-icon', currentStep === 2 ? 'bg-red-bk white--text' : 'bg-grey-light text-grey-dark']">
                2
              </span>
              <span :class="['text-caption', currentStep === 2 ? 'font-weight-bold black--text' : 'text-grey-color']">
                Thông tin đăng ký
              </span>
            </div>
          </div>

          <!-- BÊN PHẢI: NỘI DUNG TƯƠNG ỨNG MỖI BƯỚC -->
          <div class="flex-grow-1 pl-6 border-left-divider">
            <!-- ================= BƯỚC 1: THÔNG TIN CÁ NHÂN ================= -->
            <div v-if="currentStep === 1">
              <div class="text-center mb-4">
                <div class="text-caption font-weight-bold text-red-bold mb-2">
                  Nhập Mã Số Sinh Viên
                </div>

                <v-autocomplete
                  v-model="selectedStudent"
                  :items="studentOptions"
                  item-text="fullName"
                  item-value="studentCode"
                  placeholder="Sinh viên"
                  outlined
                  dense
                  hide-details
                  clearable
                  return-object
                  class="student-select-field mx-auto"
                  style="max-width: 380px;"
                  @change="onStudentSelect"
                >
                  <template v-slot:item="{ item }">
                    <v-list-item-content>
                      <v-list-item-title class="text-caption">
                        {{ item.studentCode }} - {{ item.fullName }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </template>
                </v-autocomplete>
              </div>

              <!-- THÔNG TIN CHI TIẾT SINH VIÊN KHI ĐÃ CHỌN -->
              <div v-if="selectedStudent" class="mt-2 animate-fade-in">
                <div class="d-flex align-center mb-3">
                  <div class="red-bar-indicator mr-2"></div>
                  <span class="text-subtitle-1 font-weight-bold black--text">Thông tin cá nhân</span>
                </div>

                <v-row dense class="text-caption">
                  <v-col cols="6" class="py-1">
                    Họ tên: <span class="font-weight-bold text-red-bold">{{ selectedStudent.fullName }}</span>
                  </v-col>
                  <v-col cols="6" class="py-1">
                    Mã SV: <span class="font-weight-bold text-red-bold">{{ selectedStudent.studentCode }}</span>
                  </v-col>

                  <v-col cols="6" class="py-1">
                    Giới tính: <span class="font-weight-bold text-red-bold">{{ selectedStudent.gender || 'Khác' }}</span>
                  </v-col>
                  <v-col cols="6" class="py-1"></v-col>

                  <v-col cols="12" class="py-1">
                    Email trường: <span class="font-weight-bold text-red-bold">{{ selectedStudent.email }}</span>
                  </v-col>

                  <v-col cols="12" class="py-1">
                    Email cá nhân: <span class="font-weight-bold text-red-bold">{{ selectedStudent.personalEmail || 'demo.baovelai.20210110p@example.com' }}</span>
                  </v-col>

                  <v-col cols="6" class="py-1">
                    Khóa: <span class="font-weight-bold text-red-bold">{{ selectedStudent.academicYear || 'Khóa 66' }}</span>
                  </v-col>
                  <v-col cols="6" class="py-1">
                    Lớp: <span class="font-weight-bold text-red-bold">{{ selectedStudent.className }}</span>
                  </v-col>

                  <v-col cols="6" class="py-1">
                    Ngành: <span class="font-weight-bold text-red-bold">{{ selectedStudent.majorName || 'Công nghệ thông tin' }}</span>
                  </v-col>
                  <v-col cols="6" class="py-1">
                    Loại hình đào tạo: <span class="font-weight-bold text-red-bold">{{ selectedStudent.trainingType || 'Vừa làm vừa học' }}</span>
                  </v-col>
                </v-row>

                <div class="d-flex justify-end mt-6">
                  <v-btn color="#A62229" dark small class="px-6 text-none font-weight-medium rounded-sm" elevation="0" @click="goToStep2">
                    Tiếp tục
                  </v-btn>
                </div>
              </div>

              <div v-else class="d-flex justify-end mt-6">
                <v-btn color="#E0E0E0" small disabled class="px-6 text-none font-weight-medium rounded-sm" elevation="0">
                  Tiếp tục
                </v-btn>
              </div>
            </div>

            <!-- ================= BƯỚC 2: THÔNG TIN ĐĂNG KÝ ================= -->
            <div v-else-if="currentStep === 2" class="animate-fade-in">
              <div class="mb-4">
                <v-select
                  v-model="form.sessionId"
                  :items="sessionOptions"
                  label="Đợt học lại"
                  outlined
                  dense
                  hide-details
                  clearable
                  style="max-width: 400px;"
                  @change="onSessionChange"
                ></v-select>
              </div>

              <div class="mt-4">
                <div class="d-flex justify-space-between align-center mb-2">
                  <div class="text-caption font-weight-bold black--text">
                    Danh sách học phần cần đóng ({{ filteredSubjectList.length }})
                  </div>
                  <v-text-field
                    v-model="searchSubject"
                    placeholder="Tìm kiếm"
                    dense
                    hide-details
                    append-icon="mdi-magnify"
                    style="max-width: 200px;"
                    class="text-caption"
                  ></v-text-field>
                </div>

                <v-simple-table dense class="border-table">
                  <template v-slot:default>
                    <thead>
                      <tr class="bg-gray-head">
                        <th style="width: 36px;" class="text-center">
                          <v-checkbox
                            v-model="selectAllSubjects"
                            hide-details
                            dense
                            class="ma-0 pa-0 d-flex justify-center"
                            @change="toggleSelectAll"
                          ></v-checkbox>
                        </th>
                        <th class="text-center font-weight-bold text-caption">STT</th>
                        <th class="text-left font-weight-bold text-caption">Mã học phần</th>
                        <th class="text-left font-weight-bold text-caption">Tên học phần</th>
                        <th class="text-left font-weight-bold text-caption">Mã giảng viên</th>
                        <th class="text-left font-weight-bold text-caption">Tên giảng viên</th>
                        <th class="text-right font-weight-bold text-caption">Định mức</th>
                        <th class="text-center font-weight-bold text-caption">Số tín chỉ</th>
                        <th class="text-right font-weight-bold text-caption">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="filteredSubjectList.length === 0">
                        <td colspan="9" class="text-center py-5 text-caption text-grey-color">
                          Không có dữ liệu
                        </td>
                      </tr>
                      <tr v-for="(item, index) in filteredSubjectList" :key="item.id || index">
                        <td class="text-center">
                          <v-checkbox
                            v-model="selectedSubjects"
                            :value="item.id"
                            hide-details
                            dense
                            class="ma-0 pa-0 d-flex justify-center"
                          ></v-checkbox>
                        </td>
                        <td class="text-center text-caption">{{ index + 1 }}</td>
                        <td class="text-caption">{{ item.code }}</td>
                        <td class="text-caption">{{ item.name }}</td>
                        <td class="text-caption">{{ item.teacherCode || '-' }}</td>
                        <td class="text-caption">{{ item.teacherName || '-' }}</td>
                        <td class="text-right text-caption">{{ formatCurrency(item.ratePrice) }}đ</td>
                        <td class="text-center text-caption">{{ item.credits }}</td>
                        <td class="text-right text-caption">{{ formatCurrency(item.totalPrice) }}</td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>

                <div class="text-right mt-3">
                  <div class="text-subtitle-2 font-weight-bold black--text">
                    Tổng tiền: <span class="text-red-bold">{{ formatCurrency(calculatedTotalPrice) }} VNĐ</span>
                  </div>
                  <div class="text-caption text-grey-color mt-1 font-italic">
                    Hệ thống chỉ hiển thị số tiền dự kiến. Học phí chính thức sẽ được thông báo cụ thể qua email của sinh viên.
                  </div>
                </div>
              </div>

              <div class="d-flex justify-start mt-4">
                <v-btn color="#A62229" dark small class="px-5 text-none font-weight-medium rounded-sm" elevation="0" @click="currentStep = 1">
                  Quay lại
                </v-btn>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <!-- FOOTER DIALOG -->
      <v-card-actions class="pa-3 d-flex justify-end gap-2 bg-white flex-shrink-0">
        <v-btn outlined small color="#333333" class="text-none px-4 border-btn-grey" @click="closeModal">
          Đóng <v-icon right x-small class="ml-1">mdi-close</v-icon>
        </v-btn>

        <v-btn
          :color="canSave ? '#A62229' : '#E0E0E0'"
          :dark="canSave"
          small
          class="text-none px-4"
          elevation="0"
          :disabled="!canSave"
          :loading="submitting"
          @click="saveData"
        >
          Lưu <v-icon right x-small class="ml-1">mdi-content-save-outline</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
// IMPORT FILE SERVICE DẠNG DEFAULT EXPORT
import retakeCourseServices from '~/services/retakeCourseServices'

export default {
  name: 'RegisterRetakeCourseModal',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    studentsList: {
      type: Array,
      default: () => []
    },
    registeredClassesList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      currentStep: 1,
      submitting: false,
      selectedStudent: null,
      searchSubject: '',
      sessionOptions: [],
      selectedSubjects: [],
      selectAllSubjects: false,
      form: {
        sessionId: null
      }
    }
  },
  computed: {
    internalValue: {
      get() { return this.value },
      set(val) { this.$emit('input', val) }
    },
    studentOptions() {
      return this.studentsList || []
    },
    canSave() {
      return this.currentStep === 2 &&
        Boolean(this.selectedStudent && this.selectedStudent.studentCode) &&
        Boolean(this.form.sessionId) &&
        this.selectedSubjects.length > 0 &&
        !this.submitting
    },
    dueSubjectList() {
      const selectedStudentCode = String(this.selectedStudent?.studentCode || '').trim().toLowerCase()
      const selectedSession = String(this.form.sessionId || '').trim()
      if (!selectedStudentCode || !selectedSession) return []

      return this.registeredClassesList
        .filter(item =>
          String(item.studentCode || '').trim().toLowerCase() === selectedStudentCode &&
          String(item.sessionCode || item.sessionId || '').trim() === selectedSession &&
          this.isFeeDue(item.tuitionStatus || item.paymentStatus)
        )
        .map((item, index) => ({
          id: item.id || item.subjectCode || `subject_${index}`,
          code: item.subjectCode || item.code || '',
          name: item.subjectName || item.name || '',
          teacherCode: item.teacherCode || item.maGV || '',
          teacherName: item.teacherName || item.tenGV || '',
          ratePrice: Number(item.ratePrice || item.feeRate || 0),
          credits: Number(item.credits || item.soTinChi || 0),
          totalPrice: Number(item.totalFee || item.totalPrice || item.fee || 0)
        }))
    },
    filteredSubjectList() {
      if (!this.searchSubject) return this.dueSubjectList
      const search = this.searchSubject.toLowerCase()
      return this.dueSubjectList.filter(item =>
        item.code?.toLowerCase().includes(search) || item.name?.toLowerCase().includes(search)
      )
    },
    calculatedTotalPrice() {
      return this.dueSubjectList
        .filter(item => this.selectedSubjects.includes(item.id))
        .reduce((sum, item) => sum + (item.totalPrice || 0), 0)
    }
  },
  watch: {
    value(val) {
      if (val) {
        this.resetModal()
      }
    }
  },
  methods: {
    formatCurrency(val) {
      if (!val && val !== 0) return '0'
      return Number(val).toLocaleString('vi-VN')
    },
    async onStudentSelect(std) {
      this.selectedStudent = std || null
      this.form.sessionId = null
      this.selectedSubjects = []
      this.selectAllSubjects = false
      this.sessionOptions = this.getStudentRecords()
        .filter(item => this.isFeeDue(item.tuitionStatus || item.paymentStatus))
        .map(item => item.sessionCode || item.sessionId)
        .filter((session, index, sessions) => session && sessions.indexOf(session) === index)

      if (std?.studentCode && retakeCourseServices.checkStudentAuth) {
        try {
          await retakeCourseServices.checkStudentAuth(std.studentCode)
        } catch (err) {
          console.error('Lỗi kiểm tra sinh viên:', err)
        }
      }
    },
    goToStep2() {
      if (!this.selectedStudent) return
      this.currentStep = 2
    },
    onSessionChange(val) {
      this.selectedSubjects = []
      this.selectAllSubjects = false
      this.searchSubject = ''
    },
    isFeeDue(status) {
      const normalizedStatus = String(status || '').trim().toLowerCase()
      return ['chưa trả học phí', 'not_paid', 'unpaid', 'cần thu'].includes(normalizedStatus)
    },
    getStudentRecords() {
      const studentCode = String(this.selectedStudent?.studentCode || '').trim().toLowerCase()
      return this.registeredClassesList.filter(item =>
        String(item.studentCode || '').trim().toLowerCase() === studentCode
      )
    },
    toggleSelectAll(val) {
      if (val) {
        this.selectedSubjects = this.filteredSubjectList.map(item => item.id)
      } else {
        this.selectedSubjects = []
      }
    },
    async saveData() {
      if (!this.canSave) return
      this.submitting = true
      try {
        const payload = {
          studentCode: this.selectedStudent?.studentCode,
          sessionId: this.form.sessionId,
          subjects: this.selectedSubjects,
          totalPrice: this.calculatedTotalPrice
        }
        
        // Gọi API lưu đăng ký qua retakeCourseServices
        if (retakeCourseServices.registerRetakeCourse) {
          await retakeCourseServices.registerRetakeCourse(payload)
        } else if (retakeCourseServices.register) {
          await retakeCourseServices.register(payload)
        }

        this.$emit('success', {
          ...payload,
          student: this.selectedStudent,
          selectedCourses: this.dueSubjectList.filter(item => this.selectedSubjects.includes(item.id))
        })
        this.closeModal()
      } catch (err) {
        console.error('Lỗi khi lưu đăng ký:', err)
      } finally {
        this.submitting = false
      }
    },
    resetModal() {
      this.currentStep = 1
      this.selectedStudent = null
      this.selectedSubjects = []
      this.selectAllSubjects = false
      this.searchSubject = ''
      this.sessionOptions = []
      this.form.sessionId = null
    },
    closeModal() {
      this.internalValue = false
      this.resetModal()
    }
  }
}
</script>

<style scoped>
.modal-auto-size {
  width: 850px !important;
  max-width: 850px !important;
  max-height: 85vh !important;
}

.bg-red-bk { background-color: #A62229 !important; }
.text-red-bold { color: #A62229 !important; }
.text-grey-color { color: #757575 !important; }

.step-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.bg-grey-light { background-color: #E0E0E0; }
.text-grey-dark { color: #616161; }

.border-left-divider {
  border-left: 1px solid #E0E0E0;
}

.red-bar-indicator {
  width: 4px;
  height: 18px;
  background-color: #A62229;
}

.border-table {
  border: 1px solid #E0E0E0;
  border-radius: 4px;
  overflow: hidden;
}

.bg-gray-head { background-color: #F5F5F5; }

.border-btn-grey {
  border: 1px solid #BDBDBD !important;
}

.style-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.style-scrollbar::-webkit-scrollbar-thumb {
  background: #C1C1C1;
  border-radius: 4px;
}

.gap-2 { gap: 8px; }

.animate-fade-in {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(3px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>