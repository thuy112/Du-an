<template>
  <v-dialog v-model="internalValue" width="850px" persistent scrollable>
    <v-card class="modal-auto-size rounded-lg overflow-hidden d-flex flex-column">
      <!-- HEADER DIALOG -->
      <v-card-title class="bg-red-bk white--text pa-3 d-flex justify-space-between align-center flex-shrink-0">
        <span class="text-subtitle-1 font-weight-bold">Thêm sinh viên phải học lại</span>
        <v-btn icon dark small class="ma-0" @click="closeModal">
          <v-icon small>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- BODY DIALOG PHÂN STEPPER -->
      <v-card-text class="pa-5 black--text overflow-y-auto style-scrollbar">
        <div class="d-flex">
          <!-- BÊN TRÁI: ĐIỀU HƯỚNG BƯỚC STEPPER -->
          <div class="stepper-left-bar flex-shrink-0" style="width: 170px;">
            <!-- BƯỚC 1 -->
            <div class="d-flex align-center gap-2 mb-8">
              <span :class="['step-icon', currentStep === 1 ? 'bg-red-bk white--text' : 'bg-green-check white--text']">
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
                Thông tin lớp
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

                <!-- AUTOCOMPLETE HIỆN DANH SÁCH KHI BẤM MŨI TÊN/CLICK -->
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
                  <v-col cols="6" class="py-1">
                    Lớp: <span class="font-weight-bold text-red-bold">{{ selectedStudent.className }}</span>
                  </v-col>

                  <v-col cols="12" class="py-1">
                    Email trường: <span class="font-weight-bold text-red-bold">{{ selectedStudent.email }}</span>
                  </v-col>

                  <v-col cols="6" class="py-1">
                    Khóa: <span class="font-weight-bold text-red-bold">{{ selectedStudent.academicYear || 'Khóa 67' }}</span>
                  </v-col>
                  <v-col cols="6" class="py-1">
                    Loại hình đào tạo: <span class="font-weight-bold text-red-bold">{{ selectedStudent.trainingType || 'Vừa làm vừa học' }}</span>
                  </v-col>

                  <v-col cols="12" class="py-1">
                    Ngành: <span class="font-weight-bold text-red-bold">{{ selectedStudent.majorName || 'Kế toán' }}</span>
                  </v-col>
                </v-row>

                <div class="d-flex justify-end mt-4">
                  <v-btn color="#A62229" dark small class="px-6 text-none font-weight-medium rounded-sm" elevation="0" @click="goToStep2">
                    Tiếp tục
                  </v-btn>
                </div>
              </div>

              <!-- NÚT TIẾP TỤC CHƯA CHỌN SV -->
              <div v-else class="d-flex justify-end mt-4">
                <v-btn color="#E0E0E0" small disabled class="px-6 text-none font-weight-medium rounded-sm" elevation="0">
                  Tiếp tục
                </v-btn>
              </div>
            </div>

            <!-- ================= BƯỚC 2: THÔNG TIN LỚP ================= -->
            <div v-else-if="currentStep === 2" class="animate-fade-in">
              <v-row dense class="custom-form-dense">
                <v-col cols="6">
                  <v-select
                    v-model="form.sessionId"
                    :items="sessionOptions"
                    label="Đợt học lại *"
                    outlined
                    dense
                    hide-details
                    clearable
                    @change="onSessionChange"
                  ></v-select>
                </v-col>
                <v-col cols="6">
                  <v-select
                    v-model="form.termId"
                    :items="termOptions"
                    label="Học kỳ *"
                    outlined
                    dense
                    hide-details
                    @change="onTermChange"
                  ></v-select>
                </v-col>

                <v-col cols="6">
                  <v-text-field v-model="form.examClassType" placeholder="Loại lớp thi" outlined dense hide-details></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model="form.examClassCode" placeholder="Mã lớp thi" outlined dense hide-details></v-text-field>
                </v-col>

                <v-col cols="12">
                  <v-textarea v-model="form.note" placeholder="Ghi chú" outlined dense hide-details rows="2"></v-textarea>
                </v-col>

                <v-col cols="6">
                  <v-select v-model="form.type" :items="['Học lại', 'Thi lại']" placeholder="Học lại / Thi lại" outlined dense hide-details></v-select>
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model="form.bonusScore" placeholder="Điểm thưởng" outlined dense hide-details></v-text-field>
                </v-col>

                <v-col cols="6">
                  <v-text-field v-model="form.charScore" placeholder="Điểm chữ" outlined dense hide-details></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model="form.attendanceScore" placeholder="Điểm chuyên cần" outlined dense hide-details></v-text-field>
                </v-col>

                <v-col cols="6">
                  <v-text-field v-model="form.midtermScore" placeholder="Điểm giữa kỳ" outlined dense hide-details></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model="form.processScore" placeholder="Điểm quá trình" outlined dense hide-details></v-text-field>
                </v-col>

                <v-col cols="6">
                  <v-text-field v-model="form.practiceScore" placeholder="Điểm thực hành thí nghiệm" outlined dense hide-details></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model="form.weight" placeholder="Trọng số" outlined dense hide-details></v-text-field>
                </v-col>

                <v-col cols="12">
                  <v-select v-model="form.teacherId" :items="teacherOptions" placeholder="Giảng viên" outlined dense hide-details></v-select>
                </v-col>
              </v-row>

              <!-- DANH SÁCH HỌC PHẦN -->
              <div class="mt-4">
                <div class="text-caption font-weight-bold black--text mb-2">
                  Danh sách học phần (<span class="text-red-bold">{{ selectedSubjects.length }} / {{ totalSubjects }}</span>)
                </div>

                <v-simple-table dense class="border-table">
                  <template v-slot:default>
                    <thead>
                      <tr class="bg-gray-head">
                        <th style="width: 36px;">
                          <v-checkbox
                            v-model="selectAllSubjects"
                            :disabled="!isUnregistered"
                            hide-details
                            dense
                            class="ma-0 pa-0"
                            @change="toggleSelectAll"
                          ></v-checkbox>
                        </th>
                        <th class="text-left font-weight-bold text-caption">STT</th>
                        <th class="text-left font-weight-bold text-caption">Mã học phần</th>
                        <th class="text-left font-weight-bold text-caption">Tên học phần</th>
                        <th class="text-center font-weight-bold text-caption">Số tín chỉ học phí</th>
                        <th class="text-center font-weight-bold text-caption">Số tín chỉ đào tạo</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="subjectList.length === 0">
                        <td colspan="6" class="text-center py-5 text-caption text-grey-color">
                          Không có dữ liệu
                        </td>
                      </tr>
                      <tr v-for="(item, index) in subjectList" :key="item.id || index">
                        <td>
                          <v-checkbox
                            v-model="selectedSubjects"
                            :value="item.id"
                            :disabled="!isUnregistered"
                            hide-details
                            dense
                            class="ma-0 pa-0"
                          ></v-checkbox>
                        </td>
                        <td class="text-caption">{{ index + 1 }}</td>
                        <td class="text-caption">{{ item.code }}</td>
                        <td class="text-caption">{{ item.name }}</td>
                        <td class="text-center text-caption">{{ item.tuitionCredits }}</td>
                        <td class="text-center text-caption">{{ item.trainingCredits }}</td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </div>

              <!-- NÚT QUAY LẠI -->
              <div class="d-flex justify-start mt-4">
                <v-btn color="#A62229" dark small class="px-5 text-none font-weight-medium rounded-sm" elevation="0" @click="currentStep = 1">
                  Quay lại
                </v-btn>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>

      <div v-if="snackbar.show" class="toast-container">
        <div class="toast-item" :style="{ backgroundColor: snackbar.color }">
          <div class="toast-content">
            <v-icon left dark>{{ snackbar.icon }}</v-icon>
            <span class="white--text font-weight-medium flex-grow-1">{{ snackbar.text }}</span>
            <v-btn icon dark x-small aria-label="Đóng thông báo" @click="snackbar.show = false">
              <v-icon small>mdi-close</v-icon>
            </v-btn>
          </div>
        </div>
        <div class="toast-progress-bg">
          <div
            :key="snackbar.key"
            class="toast-progress-bar"
            :style="{ animationDuration: `${snackbar.duration}ms` }"
            @animationend="closeNotification(snackbar.key)"
          ></div>
        </div>
      </div>

      <v-divider></v-divider>

      <!-- FOOTER DIALOG -->
      <v-card-actions class="pa-3 d-flex justify-end gap-2 bg-white flex-shrink-0">
        <v-btn outlined small color="#333333" class="text-none px-4 border-btn-grey" @click="closeModal">
          Đóng <v-icon right x-small class="ml-1">mdi-close</v-icon>
        </v-btn>

        <v-btn
          v-if="currentStep === 2"
          color="#A62229"
          dark
          small
          class="text-none px-4"
          elevation="0"
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
import retakeCourseServices from '~/services/retakeCourseServices'

export default {
  name: 'AddMustRetakeStudentModal',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    // Truyền dữ liệu sinh viên ban đầu khi nhấn nút +
    initialStudent: {
      type: Object,
      default: null
    },
    // DANH SÁCH SINH VIÊN LẤY TỪ TRANG "Danh sách sinh viên phải học lại"
    mustRetakeStudents: {
      type: Array,
      default: () => [
        {
          fullName: 'Nguyễn Bá Quảng',
          studentCode: '20249015P',
          gender: 'Nam',
          email: 'Quang.NB249015P@sis.hust.edu.vn',
          academicYear: 'Khóa 68',
          majorName: 'Tin học kinh tế',
          className: 'Tin học kinh tế',
          trainingType: 'Chính quy'
        },
        {
          fullName: 'Lê Tuấn Anh',
          studentCode: '20210110P',
          gender: 'Nam',
          email: 'Anh.LT210110P@sis.hust.edu.vn',
          academicYear: 'Khóa 66',
          majorName: 'Công nghệ thông tin',
          className: 'ĐH-BK-CNTT1.2-K66',
          trainingType: 'Chính quy'
        },
        {
          fullName: 'Đỗ Tiến Tây Anh',
          studentCode: '20210112P',
          gender: 'Nam',
          email: 'Anh.DTT210112P@sis.hust.edu.vn',
          academicYear: 'Khóa 66',
          majorName: 'Công nghệ thông tin',
          className: 'ĐH-BK-CNTT1.1-K66',
          trainingType: 'Chính quy'
        },
        {
          fullName: 'Nguyễn Linh Anh',
          studentCode: '20210108P',
          gender: 'Nữ',
          email: 'Anh.NL210108P@sis.hust.edu.vn',
          academicYear: 'Khóa 66',
          majorName: 'Công nghệ thông tin',
          className: 'ĐH-BK-CNTT1.1-K66',
          trainingType: 'Chính quy'
        },
        {
          fullName: 'Nguyễn Quang Anh',
          studentCode: '20210107P',
          gender: 'Nam',
          email: 'Anh.NQ210107P@sis.hust.edu.vn',
          academicYear: 'Khóa 66',
          majorName: 'Công nghệ thông tin',
          className: 'ĐH-BK-CNTT1.2-K66',
          trainingType: 'Chính quy'
        }
      ]
    },
    // DANH SÁCH LỚP HỌC LẠI ĐÃ ĐĂNG KÝ TỪ quan-ly-hoc-lai/danh-sach-lop-hoc
    registeredClassesList: {
      type: Array,
      default: () => []
    },
    mockMode: {
      type: Boolean,
      default: false
    },
    isUnregistered: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      currentStep: 1,
      submitting: false,

      selectedStudent: null,
      sessionOptions: [],
      termOptions: [],
      teacherOptions: [],

      subjectList: [],
      selectedSubjects: [],
      selectAllSubjects: false,

      form: {
        sessionId: null,
        termId: null,
        examClassType: '',
        examClassCode: '',
        note: '',
        type: 'Học lại',
        bonusScore: '',
        charScore: '',
        attendanceScore: '',
        midtermScore: '',
        processScore: '',
        practiceScore: '',
        weight: '',
        teacherId: null
      },
      snackbar: {
        show: false,
        text: '',
        color: '#2E7D32',
        icon: 'mdi-check-circle',
        duration: 3000,
        key: 0
      }
    }
  },
  computed: {
    internalValue: {
      get() { return this.value },
      set(val) { this.$emit('input', val) }
    },
    // DANH SÁCH LẤY TRỰC TIẾP TỪ TRANG SỬ DỤNG
    studentOptions() {
      return this.mustRetakeStudents || []
    },
    totalSubjects() {
      return this.subjectList.length
    }
  },
  watch: {
    value(val) {
      if (val) {
        this.resetModal()
        if (this.initialStudent) {
          this.selectedStudent = { ...this.initialStudent }
        }
      }
    }
  },
  methods: {
    showNotification(message, color = '#2E7D32', icon = 'mdi-check-circle') {
      this.snackbar.text = message
      this.snackbar.color = color
      this.snackbar.icon = icon
      this.snackbar.key += 1
      this.snackbar.show = true
    },

    closeNotification(key) {
      if (key === this.snackbar.key) {
        this.snackbar.show = false
      }
    },

    validateRequiredFields() {
      const missingFields = []

      if (!this.selectedStudent || !this.selectedStudent.studentCode) {
        missingFields.push('sinh viên')
      }

      if (!this.form.sessionId) {
        missingFields.push('đợt học lại')
      }

      if (!this.form.termId) {
        missingFields.push('học kỳ')
      }

      if (!this.selectedSubjects || this.selectedSubjects.length === 0) {
        missingFields.push('học phần')
      }

      return missingFields
    },

    goToStep2() {
      this.currentStep = 2
      this.filterSubjects()
    },

    // KHI BẤM CHỌN ĐỢT HỌC LẠI: TỰ ĐỘNG GÁN HỌC KỲ VÀ LỌC LẠI BẢNG
    onSessionChange(val) {
      if (!val) {
        this.form.termId = null
        this.termOptions = []
        this.subjectList = []
        this.selectedSubjects = []
        this.selectAllSubjects = false
        return
      }

      const sessionRecords = this.getStudentRecords().filter(item =>
        String(item.sessionId || item.sessionCode || '').trim() === String(val).trim()
      )
      this.termOptions = sessionRecords
        .map(item => item.termId || item.termCode)
        .filter((term, index, terms) => term && terms.indexOf(term) === index)
      this.form.termId = this.termOptions[0] || null
      this.filterSubjects()
    },

    // KHI BẤM CHỌN HỌC KỲ: LỌC LẠI BẢNG
    onTermChange() {
      this.filterSubjects()
    },

    // HÀM LỌC DANH SÁCH HỌC PHẦN
    filterSubjects() {
      if (!this.selectedStudent || !this.selectedStudent.studentCode || !this.form.sessionId) {
        this.subjectList = []
        this.selectedSubjects = []
        this.selectAllSubjects = false
        return
      }

      const studentCode = String(this.selectedStudent.studentCode).trim().toLowerCase()
      const selectedSession = this.form.sessionId
      const selectedTerm = this.form.termId

      const filtered = (this.registeredClassesList || []).filter(item => {
        const matchStudent = String(item.studentCode || '').trim().toLowerCase() === studentCode
        const matchSession = String(item.sessionId || item.sessionCode || '').trim() === String(selectedSession).trim()
        const matchTerm = !selectedTerm ||
          String(item.termId || item.termCode || '').trim() === String(selectedTerm).trim()
        return matchStudent && matchSession && matchTerm
      })

      this.subjectList = filtered.map((item, idx) => ({
        id: item.id || item.subjectCode || `sub_${idx}`,
        code: item.subjectCode,
        name: item.subjectName,
        tuitionCredits: item.tuitionCredits,
        trainingCredits: item.trainingCredits
      }))

      this.selectedSubjects = []
      this.selectAllSubjects = false
    },

    getStudentRecords() {
      const studentCode = String(this.selectedStudent?.studentCode || '').trim().toLowerCase()
      return (this.registeredClassesList || []).filter(item =>
        String(item.studentCode || '').trim().toLowerCase() === studentCode
      )
    },

    toggleSelectAll(val) {
      if (!this.isUnregistered) return
      if (val) {
        this.selectedSubjects = this.subjectList.map(item => item.id)
      } else {
        this.selectedSubjects = []
      }
    },

    onStudentSelect(std) {
      this.selectedStudent = std || null
      this.form.sessionId = null
      this.form.termId = null
      this.sessionOptions = this.getStudentRecords()
        .map(item => item.sessionId || item.sessionCode)
        .filter((session, index, sessions) => session && sessions.indexOf(session) === index)
      this.termOptions = []
      this.filterSubjects()
    },

    async saveData() {
      const missingFields = this.validateRequiredFields()

      if (missingFields.length > 0) {
        const message = missingFields.length === 1
          ? `Bạn chưa chọn ${missingFields[0]}.`
          : `Bạn chưa chọn: ${missingFields.join(', ')}.`
        this.showNotification(message, '#F9A825', 'mdi-alert-circle')
        return
      }

      const selectedSubjects = this.subjectList.filter(subject =>
        this.selectedSubjects.includes(subject.id)
      )
      if (selectedSubjects.length === 0) {
        this.showNotification('Bạn chưa chọn học phần.', '#F9A825', 'mdi-alert-circle')
        return
      }

      this.submitting = true
      try {
        const newStudentData = selectedSubjects.map((subject, index) => ({
          id: Date.now() + index,
          studentCode: this.selectedStudent.studentCode,
          fullName: this.selectedStudent.fullName,
          className: this.selectedStudent.className || '',
          gender: this.selectedStudent.gender || '',
          email: this.selectedStudent.email || '',
          academicYear: this.selectedStudent.academicYear || '',
          majorName: this.selectedStudent.majorName || '',
          trainingType: this.selectedStudent.trainingType || '',
          sessionCode: this.form.sessionId,
          termCode: this.form.termId,
          subjectCode: subject.code,
          subjectName: subject.name,
          failingScore: '',
          failedScore: '',
          status: 'Chưa đăng ký',
          isRegistered: false
        }))

        if (this.mockMode) {
          this.$emit('success', newStudentData)
          this.showNotification('Đã thêm vào danh sách thử nghiệm (chưa lưu lên máy chủ).', '#2E7D32', 'mdi-check-circle')
          this.closeModal()
          return
        }

        const payload = {
          studentCode: this.selectedStudent?.studentCode,
          selectedSubjects: this.selectedSubjects,
          ...this.form
        }
        const res = await retakeCourseServices.addMustRetakeStudent(payload)
        if (res && res.success) {
          const savedStudents = newStudentData.map(item => ({
            ...(res.data || {}),
            ...item
          }))
          this.showNotification('Thêm sinh viên phải học lại thành công!', '#2E7D32', 'mdi-check-circle')
          this.$emit('success', savedStudents)
          this.closeModal()
        } else {
          this.showNotification('Không thể thêm sinh viên phải học lại!', '#F44336', 'mdi-alert-circle')
        }
      } catch (err) {
        this.showNotification('Lỗi khi lưu dữ liệu!', '#F44336', 'mdi-alert-circle')
      } finally {
        this.submitting = false
      }
    },

    resetModal() {
      this.currentStep = 1
      this.selectedStudent = null
      this.selectedSubjects = []
      this.subjectList = []
      this.selectAllSubjects = false
      this.sessionOptions = []
      this.termOptions = []
      this.form = { type: 'Học lại', sessionId: null, termId: null }
      this.snackbar.show = false
    },

    closeModal() {
      this.internalValue = false
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
.bg-green-check { background-color: #A62229 !important; }

.step-icon {
  width: 26px;
  height: 26px;
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

.custom-form-dense >>> .v-input__slot {
  min-height: 36px !important;
  font-size: 13px !important;
  margin-bottom: 8px;
}

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

.toast-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 99999;
  width: 320px;
}

.toast-item {
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.toast-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.toast-progress-bg {
  height: 3px;
  width: 100%;
  border-radius: 0 0 2px 2px;
  background-color: rgba(255, 255, 255, 0.25);
  overflow: hidden;
}

.toast-progress-bar {
  height: 100%;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.65);
  animation-name: toastCountdown;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes toastCountdown {
  from { width: 100%; }
  to { width: 0; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(3px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>