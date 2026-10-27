<template>
  <div class="register-retake-modal-wrapper">
    <!-- KHUNG THÔNG BÁO LỖI NỔI Ở GÓC PHẢI PHÍA TRÊN (GIỐNG ẢNH 2) -->
    <div v-if="errorMessage" class="floating-error-alert">
      <v-alert
        type="error"
        dense
        dismissible
        elevation="4"
        class="mb-0 text-caption"
        @input="errorMessage = ''"
      >
        {{ errorMessage }}
      </v-alert>
    </div>

    <v-dialog v-model="internalValue" width="950px" persistent scrollable eager>
      <v-card
        class="modal-auto-size rounded-lg overflow-hidden d-flex flex-column"
      >
        <!-- HEADER DIALOG -->
        <v-card-title
          class="bg-red-bk white--text pa-3 d-flex justify-space-between align-center flex-shrink-0"
        >
          <span class="text-subtitle-1 font-weight-bold">Đăng ký học lại</span>
          <v-btn icon dark small class="ma-0" @click="closeModal">
            <v-icon small>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <!-- BODY DIALOG PHÂN STEPPER -->
        <v-card-text class="pa-5 black--text overflow-y-auto style-scrollbar">
          <div class="d-flex">
            <!-- BÊN TRÁI: ĐIỀU HƯỚNG BƯỚC STEPPER -->
            <div class="stepper-left-bar flex-shrink-0" style="width: 180px">
              <!-- BƯỚC 1 -->
              <div class="d-flex align-center gap-2 mb-8">
                <span :class="['step-icon', 'bg-red-bk', 'white--text']">
                  <v-icon v-if="currentStep > 1" x-small dark>mdi-check</v-icon>
                  <template v-else>1</template>
                </span>
                <span
                  :class="[
                    'text-caption',
                    currentStep === 1
                      ? 'font-weight-bold black--text'
                      : 'text-grey-color',
                  ]"
                >
                  Thông tin cá nhân
                </span>
              </div>

              <!-- BƯỚC 2 -->
              <div class="d-flex align-center gap-2">
                <span
                  :class="[
                    'step-icon',
                    currentStep === 2
                      ? 'bg-red-bk white--text'
                      : 'bg-grey-light text-grey-dark',
                  ]"
                >
                  2
                </span>
                <span
                  :class="[
                    'text-caption',
                    currentStep === 2
                      ? 'font-weight-bold black--text'
                      : 'text-grey-color',
                  ]"
                >
                  Thông tin đăng ký
                </span>
              </div>
            </div>

            <!-- BÊN PHẢI: NỘI DUNG TƯƠNG TỨNG MỖI BƯỚC -->
            <div class="flex-grow-1 pl-6 border-left-divider">
              <!-- ================= BƯỚC 1: THÔNG TIN CÁ NHÂN ================= -->
              <div v-if="currentStep === 1">
                <div class="text-center mb-4">
                  <div class="text-caption font-weight-bold text-red-bold mb-2">
                    Nhập Mã Số Sinh Viên hoặc Họ tên để tìm kiếm
                  </div>

                  <v-autocomplete
                    v-model="selectedStudent"
                    :items="studentOptions"
                    :loading="loadingStudents"
                    item-text="displayText"
                    item-value="studentCode"
                    placeholder="Chọn hoặc tìm kiếm sinh viên"
                    outlined
                    dense
                    hide-details
                    clearable
                    return-object
                    class="student-select-field mx-auto"
                    style="max-width: 380px"
                    :search-input.sync="searchStudentKeyword"
                    @change="onStudentSelect"
                  >
                    <template #item="{ item }">
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
                    <span class="text-subtitle-1 font-weight-bold black--text"
                      >Thông tin cá nhân</span
                    >
                  </div>

                  <v-row dense class="text-caption">
                    <v-col cols="6" class="py-1">
                      Họ tên:
                      <span class="font-weight-bold text-red-bold">{{
                        selectedStudent.fullName
                      }}</span>
                    </v-col>
                    <v-col cols="6" class="py-1">
                      Mã SV:
                      <span class="font-weight-bold text-red-bold">{{
                        selectedStudent.studentCode
                      }}</span>
                    </v-col>

                    <v-col cols="6" class="py-1">
                      Giới tính:
                      <span class="font-weight-bold text-red-bold">{{
                        selectedStudent.gender || 'Khác'
                      }}</span>
                    </v-col>
                    <v-col cols="6" class="py-1"></v-col>

                    <v-col cols="12" class="py-1">
                      Email trường:
                      <span class="font-weight-bold text-red-bold">{{
                        selectedStudent.email || '--'
                      }}</span>
                    </v-col>

                    <v-col cols="12" class="py-1">
                      Email cá nhân:
                      <span class="font-weight-bold text-red-bold">{{
                        selectedStudent.personalEmail || '--'
                      }}</span>
                    </v-col>

                    <v-col cols="6" class="py-1">
                      Khóa:
                      <span class="font-weight-bold text-red-bold">{{
                        selectedStudent.academicYear || 'Khóa 66'
                      }}</span>
                    </v-col>
                    <v-col cols="6" class="py-1">
                      Lớp:
                      <span class="font-weight-bold text-red-bold">{{
                        selectedStudent.className
                      }}</span>
                    </v-col>

                    <v-col cols="6" class="py-1">
                      Ngành:
                      <span class="font-weight-bold text-red-bold">{{
                        selectedStudent.majorName || 'Công nghệ thông tin'
                      }}</span>
                    </v-col>
                    <v-col cols="6" class="py-1">
                      Loại hình đào tạo:
                      <span class="font-weight-bold text-red-bold">{{
                        selectedStudent.trainingType || 'Chính quy'
                      }}</span>
                    </v-col>
                  </v-row>

                  <div class="d-flex justify-end mt-6">
                    <v-btn
                      color="#A62229"
                      dark
                      small
                      class="px-6 text-none font-weight-medium rounded-sm"
                      elevation="0"
                      @click="goToStep2"
                    >
                      Tiếp tục
                    </v-btn>
                  </div>
                </div>

                <div v-else class="d-flex justify-end mt-6">
                  <v-btn
                    color="#E0E0E0"
                    small
                    disabled
                    class="px-6 text-none font-weight-medium rounded-sm"
                    elevation="0"
                  >
                    Tiếp tục
                  </v-btn>
                </div>
              </div>

              <!-- ================= BƯỚC 2: THÔNG TIN ĐĂNG KÝ ================= -->
              <div v-else-if="currentStep === 2" class="animate-fade-in">
                <div class="mb-4">
                  <v-select
                    v-model="form.sessionId"
                    :items="dynamicSessionOptions"
                    :loading="loadingSessions"
                    item-text="text"
                    item-value="value"
                    label="Chọn đợt học lại mở lớp"
                    outlined
                    dense
                    hide-details
                    clearable
                    style="max-width: 400px"
                    @change="onSessionChange"
                  ></v-select>
                </div>

                <div class="mt-4">
                  <div class="d-flex justify-space-between align-center mb-2">
                    <div class="text-caption font-weight-bold black--text">
                      Danh sách học phần nợ của sinh viên trong đợt ({{
                        filteredSubjectList.length
                      }})
                    </div>
                    <v-text-field
                      v-model="searchSubject"
                      placeholder="Tìm kiếm học phần"
                      dense
                      hide-details
                      append-icon="mdi-magnify"
                      style="max-width: 200px"
                      class="text-caption"
                    ></v-text-field>
                  </div>

                  <v-simple-table dense class="border-table">
                    <template #default>
                      <thead>
                        <tr class="bg-gray-head">
                          <th style="width: 36px" class="text-center">
                            <v-checkbox
                              v-model="selectAllSubjects"
                              hide-details
                              dense
                              class="ma-0 pa-0 d-flex justify-center"
                            ></v-checkbox>
                          </th>
                          <th class="text-center font-weight-bold text-caption">
                            STT
                          </th>
                          <th class="text-left font-weight-bold text-caption">
                            Mã học phần
                          </th>
                          <th class="text-left font-weight-bold text-caption">
                            Tên học phần
                          </th>
                          <th class="text-left font-weight-bold text-caption">
                            Mã giảng viên
                          </th>
                          <th class="text-left font-weight-bold text-caption">
                            Tên giảng viên
                          </th>
                          <th class="text-right font-weight-bold text-caption">
                            Định mức
                          </th>
                          <th class="text-center font-weight-bold text-caption">
                            Số tín chỉ
                          </th>
                          <th class="text-right font-weight-bold text-caption">
                            Thành tiền
                          </th>
                          <th
                            class="text-left font-weight-bold text-caption"
                            style="min-width: 170px;"
                          >
                            Lớp học
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-if="loadingSubjects">
                          <td
                            colspan="10"
                            class="text-center py-5 text-caption grey--text"
                          >
                            Đang tải danh sách học phần...
                          </td>
                        </tr>
                        <tr v-else-if="!form.sessionId">
                          <td
                            colspan="10"
                            class="text-center py-5 text-caption grey--text"
                          >
                            Vui lòng chọn đợt học lại để kiểm tra học phần của
                            sinh viên
                          </td>
                        </tr>
                        <tr v-else-if="filteredSubjectList.length === 0">
                          <td
                            colspan="10"
                            class="text-center py-5 text-caption grey--text font-italic"
                          >
                            Sinh viên này không có học phần nợ nào trong đợt học
                            lại này (Không thể đăng ký)
                          </td>
                        </tr>
                        <tr
                          v-for="(item, index) in filteredSubjectList"
                          :key="item.id || index"
                        >
                          <td class="text-center">
                            <v-checkbox
                              v-model="selectedSubjects"
                              :value="item.id"
                              hide-details
                              dense
                              class="ma-0 pa-0 d-flex justify-center"
                            ></v-checkbox>
                          </td>
                          <td class="text-center text-caption">
                            {{ index + 1 }}
                          </td>
                          <td class="text-caption">{{ item.code }}</td>
                          <td class="text-caption">{{ item.name }}</td>
                          <td class="text-caption">
                            {{ item.teacherCode || '-' }}
                          </td>
                          <td class="text-caption">
                            {{ item.teacherName || '-' }}
                          </td>
                          <td class="text-right text-caption">
                            {{ formatCurrency(item.ratePrice) }}đ
                          </td>
                          <td class="text-center text-caption">
                            {{ item.credits }}
                          </td>
                          <td class="text-right text-caption">
                            {{ formatCurrency(item.totalPrice) }}
                          </td>
                          <td>
                            <v-select
                              v-model="item.selectedClassId"
                              :items="item.classes"
                              item-text="name"
                              item-value="id"
                              placeholder="Không có lớp học"
                              outlined
                              dense
                              hide-details
                              clearable
                              class="text-caption my-1"
                              @change="errorMessage = ''"
                            ></v-select>
                          </td>
                        </tr>
                      </tbody>
                    </template>
                  </v-simple-table>

                  <div class="text-right mt-3">
                    <div class="text-subtitle-2 font-weight-bold black--text">
                      Tổng tiền:
                      <span class="text-red-bold"
                        >{{ formatCurrency(calculatedTotalPrice) }} VNĐ</span
                      >
                    </div>
                    <div class="text-caption text-grey-color mt-1 font-italic">
                      Hệ thống chỉ hiển thị số tiền dự kiến. Học phí chính thức sẽ
                      được thông báo cụ thể qua email của sinh viên.
                    </div>
                  </div>
                </div>

                <div class="d-flex justify-start mt-4">
                  <v-btn
                    color="#A62229"
                    dark
                    small
                    class="px-5 text-none font-weight-medium rounded-sm"
                    elevation="0"
                    @click="currentStep = 1"
                  >
                    Quay lại
                  </v-btn>
                </div>
              </div>
            </div>
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <!-- FOOTER DIALOG -->
        <v-card-actions
          class="pa-3 d-flex justify-end gap-2 bg-white flex-shrink-0"
        >
          <v-btn
            outlined
            small
            color="#333333"
            class="text-none px-4 border-btn-grey"
            @click="closeModal"
          >
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
            Lưu
            <v-icon right x-small class="ml-1">mdi-content-save-outline</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'RegisterRetakeCourseModal',
  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      currentStep: 1,
      submitting: false,
      loadingStudents: false,
      loadingSessions: false,
      loadingSubjects: false,
      studentsListAPI: [],
      searchStudentKeyword: '',
      selectedStudent: null,
      dynamicSessionOptions: [],
      dueSubjectList: [],
      searchSubject: '',
      selectedSubjects: [],
      errorMessage: '',
      form: {
        sessionId: null,
      },
    }
  },
  computed: {
    internalValue: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      },
    },
    selectAllSubjects: {
      get() {
        const validItems = this.filteredSubjectList
        if (validItems.length === 0) return false
        return validItems.every((item) =>
          this.selectedSubjects.includes(item.id)
        )
      },
      set(val) {
        if (val) {
          this.selectedSubjects = this.filteredSubjectList.map((item) => item.id)
        } else {
          this.selectedSubjects = []
        }
      },
    },
    studentOptions() {
      return (this.studentsListAPI || []).map((item) => ({
        id: item.student?.id || item.id,
        studentCode: item.code || (item.student && item.student.code) || '',
        fullName:
          item.fullName || (item.student && item.student.fullName) || '',
        email: item.email || (item.student && item.student.email) || '',
        gender: item.gender || 'Khác',
        personalEmail: item.personalEmail || '',
        academicYear: item.course?.name || 'Khóa 66',
        className: item.clazz?.name || '',
        majorName: item.clazz?.majorName || 'Công nghệ thông tin',
        trainingType: item.clazz?.trainingUnitName || 'Chính quy',
        displayText: `${
          item.code || (item.student && item.student.code) || ''
        } - ${item.fullName || (item.student && item.student.fullName) || ''}`,
      }))
    },
    canSave() {
      return (
        this.currentStep === 2 &&
        Boolean(this.selectedStudent && this.selectedStudent.studentCode) &&
        Boolean(this.form.sessionId) &&
        this.dueSubjectList.length > 0 &&
        this.selectedSubjects.length > 0 &&
        !this.submitting
      )
    },
    filteredSubjectList() {
      if (!this.searchSubject) return this.dueSubjectList
      const search = this.searchSubject.toLowerCase()
      return this.dueSubjectList.filter(
        (item) =>
          item.code?.toLowerCase().includes(search) ||
          item.name?.toLowerCase().includes(search)
      )
    },
    calculatedTotalPrice() {
      return this.dueSubjectList
        .filter((item) => this.selectedSubjects.includes(item.id))
        .reduce((sum, item) => sum + (item.totalPrice || 0), 0)
    },
  },
  watch: {
    value(val) {
      if (val) {
        this.resetModal()
        this.fetchStudents()
      }
    },
    searchStudentKeyword(newVal) {
      if (newVal !== null && newVal !== undefined) {
        this.fetchStudents(newVal)
      }
    },
  },
  methods: {
    formatCurrency(val) {
      if (!val && val !== 0) return '0'
      return Number(val).toLocaleString('vi-VN')
    },

    async fetchStudents(searchKeyword = '') {
      try {
        this.loadingStudents = true
        const params = {
          pageIndex: 1,
          pageSize: 50,
          channel: 'CMS',
        }
        if (searchKeyword && searchKeyword.trim() !== '') {
          params.search = searchKeyword.trim()
        }

        const res = await this.$axios.$get(
          '/api/retakeCourseAuthList/authStudent',
          { params }
        )
        const list = res?.data?.items || res?.items || res || []
        this.studentsListAPI = Array.isArray(list) ? list : []
      } catch (err) {
        console.error('Lỗi gọi API danh sách sinh viên:', err)
        this.studentsListAPI = []
      } finally {
        this.loadingStudents = false
      }
    },

    onStudentSelect(std) {
      this.selectedStudent = std || null
      this.form.sessionId = null
      this.dynamicSessionOptions = []
      this.dueSubjectList = []
      this.selectedSubjects = []
      this.errorMessage = ''
    },

    async goToStep2() {
      if (!this.selectedStudent) return
      this.currentStep = 2
      this.errorMessage = ''
      await this.fetchExamListForStudent()
    },

    async fetchExamListForStudent() {
      if (!this.selectedStudent) return
      try {
        this.loadingSessions = true
        const studentId = this.selectedStudent.id
        const res = await this.$axios.$get(
          `/api/retakeSession/exam-list`,
          {
            params: {
              studentId,
              status: 'ACTIVE',
              channel: 'CMS',
            },
          }
        )

        const exams = res?.data || res || []
        this.dynamicSessionOptions = Array.isArray(exams)
          ? exams.map((ex) => ({
              text: ex.code ? `${ex.code} - ${ex.name || ''}` : ex.name,
              value: ex.id,
              ...ex,
            }))
          : []
      } catch (err) {
        console.error('Lỗi gọi API exam-list:', err)
        this.dynamicSessionOptions = []
      } finally {
        this.loadingSessions = false
      }
    },

    async onSessionChange(sessionId) {
      this.form.sessionId = sessionId
      this.selectedSubjects = []
      this.searchSubject = ''
      this.dueSubjectList = []
      this.errorMessage = ''

      if (!sessionId || !this.selectedStudent) return

      try {
        this.loadingSubjects = true
        const selectedExam = this.dynamicSessionOptions.find(
          (item) => String(item.value) === String(sessionId)
        )
        const examId = selectedExam ? selectedExam.id : sessionId

        const res = await this.$axios.$get(
          '/api/retakeCourseClient/listForRegister',
          {
            params: {
              code: this.selectedStudent.studentCode,
              examId,
              channel: 'CMS',
            },
          }
        )

        const rawTerms = res?.data || res || []
        this.dueSubjectList = Array.isArray(rawTerms)
          ? rawTerms.map((termObj, index) => {
              const t = termObj.term || termObj || {}
              const classOptions = Array.isArray(termObj.availableExamSessions)
                ? termObj.availableExamSessions.map((cls) => ({
                    id: cls.id || cls.code,
                    name: cls.name || cls.code || `Lớp ${cls.id}`,
                  }))
                : []

              return {
                id: t.id || t.code || `term_${index}`,
                code: t.code || '',
                name: t.name || '',
                teacherCode: t.teacherCode || '-',
                teacherName: t.teacherName || '-',
                ratePrice: Number(termObj.feeRate || t.ratePrice || 350000),
                credits: Number(termObj.credits || t.credits || 2),
                totalPrice: Number(termObj.fee || t.totalPrice || 700000),
                classes: classOptions,
                selectedClassId: null,
              }
            })
          : []

        this.selectedSubjects = this.dueSubjectList.map((item) => item.id)
      } catch (err) {
        console.error('Lỗi gọi API listForRegister:', err)
        this.dueSubjectList = []
      } finally {
        this.loadingSubjects = false
      }
    },

    saveData() {
      this.errorMessage = ''
      if (!this.canSave) return

      const selectedItems = this.dueSubjectList.filter((item) =>
        this.selectedSubjects.includes(item.id)
      )

      const unassigned = selectedItems.find((item) => !item.selectedClassId)
      if (unassigned) {
        this.errorMessage = `Vui lòng chọn lớp học cho học phần "${unassigned.code} - ${unassigned.name}"`
        return
      }

      this.submitting = true
      try {
        const payload = {
          studentCode: this.selectedStudent?.studentCode,
          sessionId: this.form.sessionId,
          subjects: selectedItems.map((sub) => ({
            subjectId: sub.id,
            classId: sub.selectedClassId,
          })),
          totalPrice: this.calculatedTotalPrice,
          channel: 'CMS',
        }

        this.$emit('success', {
          ...payload,
          student: this.selectedStudent,
          selectedCourses: selectedItems,
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
      this.studentsListAPI = []
      this.dynamicSessionOptions = []
      this.dueSubjectList = []
      this.selectedSubjects = []
      this.searchSubject = ''
      this.form.sessionId = null
      this.searchStudentKeyword = ''
      this.errorMessage = ''
    },

    closeModal() {
      this.internalValue = false
      this.resetModal()
    },
  },
}
</script>

<style scoped>
/* CSS ĐỂ ĐƯA THÔNG BÁO LÊN GÓC PHẢI PHÍA TRÊN MÀN HÌNH */
.floating-error-alert {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 99999;
  max-width: 450px;
  animation: slideInDown 0.3s ease-in-out;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-auto-size {
  width: 950px !important;
  max-width: 950px !important;
  max-height: 85vh !important;
}

.bg-red-bk {
  background-color: #a62229 !important;
}
.text-red-bold {
  color: #a62229 !important;
}
.text-grey-color {
  color: #757575 !important;
}

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

.bg-grey-light {
  background-color: #e0e0e0;
}
.text-grey-dark {
  color: #616161;
}

.border-left-divider {
  border-left: 1px solid #e0e0e0;
}

.red-bar-indicator {
  width: 4px;
  height: 18px;
  background-color: #a62229;
}

.border-table {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.bg-gray-head {
  background-color: #f5f5f5;
}

.border-btn-grey {
  border: 1px solid #bdbdbd !important;
}

.style-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.style-scrollbar::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.gap-2 {
  gap: 8px;
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(3px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>