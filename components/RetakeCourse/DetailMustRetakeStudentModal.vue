<template>
  <v-dialog
    v-model="internalValue"
    width="750px"
    scrollable
    persistent
    :fullscreen="$vuetify.breakpoint.xsOnly"
  >
    <v-card
      class="rounded-lg-sm-up overflow-hidden d-flex flex-column bg-white position-relative"
    >
      <!-- ALERT THÔNG BÁO LỖI / THÀNH CÔNG NẰM Ở TRÊN CÙNG -->
      <v-slide-y-transition>
        <div v-if="alertMessage" class="px-4 pt-3">
          <v-alert
            :type="alertType"
            dense
            dismissible
            class="mb-0 text-body-2"
            @input="alertMessage = ''"
          >
            {{ alertMessage }}
          </v-alert>
        </div>
      </v-slide-y-transition>

      <!-- HEADER DIALOG -->
      <v-card-title
        class="bg-red-bk white--text pa-3 px-4 d-flex justify-space-between align-center flex-shrink-0"
        style="background-color: #A62229 !important;"
      >
        <span class="text-subtitle-1 font-weight-bold white--text"
          >Thêm sinh viên phải học lại</span
        >
        <v-btn icon dark small class="ma-0" @click="closeModal">
          <v-icon small>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- BODY DIALOG -->
      <v-card-text
        ref="dialogBody"
        class="pa-4 pa-sm-6 black--text overflow-y-auto style-scrollbar flex-grow-1"
      >
        <div class="stepper-top-container w-100">
          <!-- ================= 1. CỤM TIÊU ĐỀ SỐ 1 VÀ SỐ 2 NẰM TRÊN CÙNG ================= -->
          <div class="stepper-header-top mb-4">
            <!-- SỐ 1: THÔNG TIN CÁ NHÂN -->
            <div
              class="step-head-item d-flex align-center cursor-pointer mb-2"
              @click="step = 1"
            >
              <span class="step-icon-circle font-weight-bold" style="background-color: #A62229;">
                <v-icon v-if="step > 1" small color="white">mdi-check</v-icon>
                <span v-else>1</span>
              </span>
              <span
                class="text-body-2 font-weight-bold ml-3"
                :class="step === 1 ? 'text-black-bold' : 'text-grey-dark'"
              >
                Thông tin cá nhân
              </span>
            </div>

            <!-- ĐƯỜNG NỐI DỌC -->
            <div class="step-line-v ml-3 my-1"></div>

            <!-- SỐ 2: THÔNG TIN LỚP -->
            <div
              ref="step2Header"
              class="step-head-item d-flex align-center cursor-pointer mt-2"
              @click="switchToStep2"
            >
              <span
                class="step-icon-circle font-weight-bold"
                :class="
                  step === 2 ? 'step-circle-active' : 'step-circle-pending'
                "
                style="background-color: #A62229;"
              >
                2
              </span>
              <span
                class="text-body-2 font-weight-bold ml-3"
                :class="step === 2 ? 'text-black-bold' : 'text-grey-dark'"
              >
                Thông tin lớp
              </span>
            </div>
          </div>

          <!-- ================= 2. NỘI DUNG FORM NHẬP DỮ LIỆU NẰM Ở PHÍA DƯỚI ================= -->
          <div class="stepper-content-bottom w-100 pt-2">
            <!-- FORM BƯỚC 1: THÔNG TIN CÁ NHÂN -->
            <v-expand-transition>
              <div v-show="step === 1" class="step-1-form-wrapper w-100">
                <div class="text-caption font-weight-bold text-red-bold mb-1" style="color: #A62229;">
                  Nhập Mã Số Sinh Viên
                </div>
                <v-autocomplete
                  v-model="selectedStudent"
                  :items="studentOptions"
                  :loading="loadingStudents"
                  :search-input.sync="studentSearchQuery"
                  item-text="displayText"
                  return-object
                  placeholder="Sinh viên"
                  outlined
                  dense
                  clearable
                  hide-no-data
                  class="rounded-lg mb-2 w-100"
                  @change="onSelectStudent"
                ></v-autocomplete>

                <!-- CHI TIẾT SINH VIÊN KHI ĐÃ CHỌN -->
                <div
                  v-if="selectedStudentInfo"
                  class="student-info-preview pa-3 pa-sm-4 rounded-lg bg-grey-lighten-5 border-card mb-3 w-100"
                >
                  <h4
                    class="text-subtitle-2 font-weight-bold text-red-bold mb-2"
                    style="color: #A62229;"
                  >
                    Thông tin cá nhân
                  </h4>

                  <v-row dense class="text-caption ma-0">
                    <v-col cols="12" sm="6" class="py-1"
                      >Họ tên:
                      <span class="font-weight-bold text-red-bold" style="color: #A62229;">{{
                        selectedStudentInfo.fullName
                      }}</span></v-col
                    >
                    <v-col cols="12" sm="6" class="py-1"
                      >Mã SV:
                      <span class="font-weight-bold text-red-bold" style="color: #A62229;">{{
                        selectedStudentInfo.code
                      }}</span></v-col
                    >

                    <v-col cols="12" sm="6" class="py-1"
                      >Giới tính:
                      <span class="font-weight-bold text-red-bold" style="color: #A62229;">{{
                        selectedStudentInfo.gender || 'Khác'
                      }}</span></v-col
                    >
                    <v-col cols="12" sm="6" class="py-1"
                      >Lớp:
                      <span class="font-weight-bold text-red-bold" style="color: #A62229;">{{
                        selectedStudentInfo.classes?.name || '-'
                      }}</span></v-col
                    >

                    <v-col cols="12" class="py-1"
                      >Email trường:
                      <span class="text-red-bold text-break" style="color: #A62229;">{{
                        selectedStudentInfo.email ||
                        (selectedStudentInfo.code ? selectedStudentInfo.code.toLowerCase() + '@sis.hust.edu.vn' : '-')
                      }}</span></v-col
                    >

                    <v-col cols="12" sm="6" class="py-1"
                      >Khóa:
                      <span class="font-weight-bold text-red-bold" style="color: #A62229;">{{
                        selectedStudentInfo.course?.name || '-'
                      }}</span></v-col
                    >
                    <v-col cols="12" sm="6" class="py-1"
                      >Loại hình đào tạo:
                      <span class="text-red-bold" style="color: #A62229;">{{
                        selectedStudentInfo.trainingType?.name || 'Vừa làm vừa học'
                      }}</span></v-col
                    >

                    <v-col cols="12" class="py-1"
                      >Ngành:
                      <span class="font-weight-bold text-red-bold" style="color: #A62229;">{{
                        selectedStudentInfo.major?.name || '-'
                      }}</span></v-col
                    >
                  </v-row>
                </div>

                <!-- NÚT TIẾP TỤC DẪN SANG BƯỚC 2 -->
                <div class="d-flex justify-end mt-2">
                  <v-btn
                    color="#A62229"
                    dark
                    small
                    :disabled="!selectedStudentInfo"
                    class="text-none px-5 rounded-lg btn-next-step"
                    elevation="0"
                    @click="switchToStep2"
                    style="background-color: #A62229 !important;"
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
                      :items="sessionOptions"
                      item-text="text"
                      item-value="value"
                      label="Đợt học lại *"
                      outlined
                      dense
                      class="rounded-lg"
                      @change="onSessionChange"
                    ></v-select>
                  </v-col>

                  <v-col cols="12" sm="6" class="px-0 px-sm-1">
                    <v-select
                      v-model="form.termId"
                      :items="termOptions"
                      item-text="text"
                      item-value="value"
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
                      v-model="form.teacherId"
                      :items="teacherOptions"
                      item-text="text"
                      item-value="value"
                      label="Giảng viên"
                      outlined
                      dense
                      class="rounded-lg"
                    ></v-select>
                  </v-col>
                </v-row>

                <!-- BẢNG DANH SÁCH HỌC PHẦN DÀN FULL VÀ CUỘN ĐƯỢC -->
                <div class="mt-2 w-100">
                  <div class="text-caption font-weight-bold mb-1">
                    Danh sách học phần ({{ selectedSubjectIds.length }} / {{ subjectList.length }})
                  </div>

                  <v-card outlined class="rounded-lg mb-3">
                    <v-data-table
                      :headers="subjectHeaders"
                      :items="subjectList"
                      item-key="id"
                      dense
                      fixed-header
                      height="250px"
                      :items-per-page="-1"
                      hide-default-footer
                      class="elevation-0 style-scrollbar"
                      no-data-text="Không có dữ liệu học phần"
                    >
                      <!-- Checkbox chọn tất cả ở header -->
                      <template #[`header.data-table-select`]>
                        <v-simple-checkbox
                          :value="selectedSubjectIds.length > 0 && selectedSubjectIds.length === subjectList.length"
                          :indeterminate="selectedSubjectIds.length > 0 && selectedSubjectIds.length < subjectList.length"
                          @input="toggleSelectAll"
                        ></v-simple-checkbox>
                      </template>

                      <!-- Checkbox từng dòng -->
                      <template #[`item.data-table-select`]="{ item }">
                        <v-simple-checkbox
                          :value="selectedSubjectIds.includes(item.id)"
                          @input="toggleSelectSubject(item)"
                        ></v-simple-checkbox>
                      </template>

                      <template #[`item.creditHours`]="{ item }">
                        {{ item.creditHours || item.credits || '-' }}
                      </template>
                      <template #[`item.creditTraining`]="{ item }">
                        {{ item.creditTraining || '-' }}
                      </template>
                    </v-data-table>
                  </v-card>

                  <v-btn
                    color="#A62229"
                    dark
                    small
                    class="text-none px-4 rounded-lg"
                    elevation="0"
                    @click="step = 1"
                    style="background-color: #A62229 !important;"
                  >
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
      <v-card-actions
        class="pa-2 px-4 d-flex justify-end bg-white flex-shrink-0 gap-2"
      >
        <v-btn
          text
          small
          class="text-none btn-close-custom"
          @click="closeModal"
          style="color: #A62229;"
        >
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
          style="background-color: #A62229 !important;"
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
  name: 'DetailMustRetakeStudentModal',
  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      step: 1,
      selectedStudent: null,
      selectedStudentInfo: null,
      studentSearchQuery: '',
      studentOptions: [],
      loadingStudents: false,

      sessionOptions: [],
      termOptions: [],
      teacherOptions: [],

      subjectList: [],
      selectedSubjectIds: [], // Quản lý ID các dòng được tích chọn thủ công
      subjectHeaders: [
        { text: '', value: 'data-table-select', sortable: false, width: '40px' },
        { text: 'Mã học phần', value: 'code', sortable: false },
        { text: 'Tên học phần', value: 'name', sortable: false },
        { text: 'Số tín chỉ học phí', value: 'creditHours', sortable: false, align: 'center' },
        { text: 'Số tín chỉ đào tạo', value: 'creditTraining', sortable: false, align: 'center' },
      ],

      form: {
        sessionId: '',
        termId: '',
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
        teacherId: '',
      },

      rawSessionsData: [],
      alertMessage: '',
      alertType: 'warning',
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
  },
  watch: {
    value(val) {
      if (val) {
        this.fetchStudents('')
      } else {
        this.resetForm()
      }
    },
    studentSearchQuery(val) {
      if (val !== null && val !== undefined) {
        this.fetchStudents(val)
      }
    },
  },
  methods: {
    async fetchStudents(searchKeyword = '') {
      this.loadingStudents = true
      try {
        const res = await this.$axios.$get('/api/student', {
          params: {
            pageIndex: 1,
            pageSize: 100000,
            search: searchKeyword,
            gender: '',
            status: '',
            channel: 'CMS',
          },
        })
        const list = Array.isArray(res) ? res : res.data || res.content || []
        this.studentOptions = list.map((s) => ({
          ...s,
          displayText: `${s.code} - ${s.fullName}`,
        }))
      } catch (error) {
        console.error('Lỗi tải danh sách sinh viên:', error)
        this.studentOptions = []
      } finally {
        this.loadingStudents = false
      }
    },

    onSelectStudent(student) {
      if (student) {
        this.selectedStudentInfo = student
      } else {
        this.selectedStudentInfo = null
      }
    },

    async switchToStep2() {
      this.step = 2
      await this.fetchCatalogs()
      if (this.form.sessionId) {
        await this.fetchSubjectsForRegister(this.form.sessionId)
      }
      this.$nextTick(() => {
        if (this.$refs.step2Header) {
          this.$refs.step2Header.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
        }
      })
    },

    async fetchCatalogs() {
      try {
        const [sessionRes, semesterRes, teacherRes] = await Promise.all([
          this.$axios.$get('/api/retakeSession/list', {
            params: { status: 'ACTIVE', channel: 'CMS' },
          }).catch(() => null),
          this.$axios.$get('/api/semester/list', {
            params: { status: 'ACTIVE', channel: 'CMS' },
          }).catch(() => null),
          this.$axios.$get('/api/teacher/list', {
            params: { status: 'ACTIVE', channel: 'CMS' },
          }).catch(() => null),
        ])

        if (sessionRes) {
          const data = Array.isArray(sessionRes) ? sessionRes : sessionRes.data || sessionRes.content || []
          this.rawSessionsData = data
          this.sessionOptions = data.map((item) => ({
            text: item.code || item.name,
            value: item.id,
            semesterId: item.semesterId || item.semester?.id,
          }))
        }

        if (semesterRes) {
          const data = Array.isArray(semesterRes) ? semesterRes : semesterRes.data || semesterRes.content || []
          this.termOptions = data.map((item) => ({
            text: item.name || item.code,
            value: item.id,
          }))
        }

        if (teacherRes) {
          const data = Array.isArray(teacherRes) ? teacherRes : teacherRes.data || teacherRes.content || []
          this.teacherOptions = data.map((item) => ({
            text: item.fullName || item.name || item.code,
            value: item.id,
          }))
        }
      } catch (error) {
        console.error('Lỗi tải danh mục bước 2:', error)
      }
    },

    async onSessionChange(sessionId) {
      const found = this.rawSessionsData.find((s) => s.id === sessionId)
      if (found) {
        const semId = found.semesterId || found.semester?.id
        if (semId) {
          this.form.termId = semId
        }
      }
      if (sessionId && this.selectedStudentInfo) {
        await this.fetchSubjectsForRegister(sessionId)
      } else {
        this.subjectList = []
      }
    },

    async fetchSubjectsForRegister(sessionId) {
      try {
        const res = await this.$axios.$get('/api/retakeCourse', {
          params: {
            pageIndex: 1,
            pageSize: 1000,
            search: '',
            studentId: this.selectedStudentInfo?.id,
            retakeSessionId: sessionId,
            channel: 'CMS',
          },
        })
        const rootData = res.data !== undefined ? res.data : res
        const rawList = Array.isArray(rootData)
          ? rootData
          : rootData.data || rootData.content || rootData.items || []

        this.subjectList = rawList.map((item, index) => {
          const termObj = item.term || item.subject || item
          const uniqueId = item.id || termObj.id || `sub_${index}`
          
          const resultRecordId = item.id || item.resultId || termObj.id

          return {
            ...item,
            id: uniqueId,
            code: termObj.code || item.code || '',
            name: termObj.name || item.name || '',
            creditHours: termObj.creditHours || termObj.credits || item.credits || '-',
            creditTraining: termObj.creditTraining || '-',
            realTermId: termObj.id || item.termId,
            resultRecordId,
          }
        })
      } catch (error) {
        console.error('Lỗi tải danh sách học phần:', error)
        this.subjectList = []
      }
    },

    toggleSelectSubject(item) {
      const index = this.selectedSubjectIds.indexOf(item.id)
      if (index > -1) {
        this.selectedSubjectIds.splice(index, 1)
      } else {
        this.selectedSubjectIds.push(item.id)
      }
    },

    toggleSelectAll(value) {
      if (value) {
        this.selectedSubjectIds = this.subjectList.map((s) => s.id)
      } else {
        this.selectedSubjectIds = []
      }
    },

    async saveStudent() {
      if (!this.selectedStudentInfo) {
        this.alertType = 'warning'
        this.alertMessage = 'Vui lòng chọn thông tin sinh viên'
        return
      }

      if (!this.selectedSubjectIds || this.selectedSubjectIds.length === 0) {
        this.alertType = 'warning'
        this.alertMessage = 'Vui lòng chọn học phần'
        return
      }

      this.alertMessage = ''

      try {
        const selectedItems = this.subjectList.filter((s) =>
          this.selectedSubjectIds.includes(s.id)
        )

        for (const sub of selectedItems) {
          const studentId = this.selectedStudentInfo.id
          const retakeSessionId = this.form.sessionId
          const semesterId = this.form.termId
          const termId = sub.realTermId || sub.term?.id || sub.id
          
          // Lấy đúng ID kết quả đã bóc tách
          const targetResultId = sub.resultRecordId || sub.id

          const payload = {
            studentId,
            retakeSessionId,
            semesterId,
            termId,
            // Thử truyền result dưới dạng ID số/chuỗi trực tiếp vì backend báo "Result is required"
            result: targetResultId,
            resultId: targetResultId,
            classType: this.form.classType || '',
            classCode: this.form.classCode || '',
            note: this.form.note || '',
            type: this.form.type || 'Học lại',
            bonusScore: this.form.bonusScore !== '' && this.form.bonusScore !== null ? Number(this.form.bonusScore) : null,
            charScore: this.form.charScore || '',
            attendanceScore: this.form.attendanceScore !== '' && this.form.attendanceScore !== null ? Number(this.form.attendanceScore) : null,
            processScore: this.form.processScore !== '' && this.form.processScore !== null ? Number(this.form.processScore) : null,
            practiceScore: this.form.practiceScore !== '' && this.form.practiceScore !== null ? Number(this.form.practiceScore) : null,
            practiceScore2: this.form.practiceScore2 !== '' && this.form.practiceScore2 !== null ? Number(this.form.practiceScore2) : null,
            weight: this.form.weight !== '' && this.form.weight !== null ? Number(this.form.weight) : null,
            teacherId: this.form.teacherId || null,
          }

          console.log('Payload gửi lên:', payload)

          await this.$axios.$post('/api/retakeCourseAuthList', payload, {
            params: { channel: 'CMS' },
          })
        }

        this.$emit('success')
        this.closeModal()
      } catch (error) {
        console.error('Lỗi khi thêm sinh viên học lại:', error.response?.data || error)
        this.alertType = 'error'
        this.alertMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Lỗi hệ thống khi lưu dữ liệu'
      }
    },

    closeModal() {
      this.internalValue = false
    },

    resetForm() {
      this.step = 1
      this.selectedStudent = null
      this.selectedStudentInfo = null
      this.studentSearchQuery = ''
      this.subjectList = []
      this.selectedSubjectIds = []
      this.alertMessage = ''
      this.form = {
        sessionId: '',
        termId: '',
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
        teacherId: '',
      }
    },
  },
}
</script>

<style scoped>
.bg-red-bk {
  background-color: #a62229 !important;
}
.text-red-bold {
  color: #a62229 !important;
}
.text-black-bold {
  color: #333333 !important;
}
.text-grey-dark {
  color: #8c8c8c !important;
}
.border-card {
  border: 1px solid #e0e0e0;
}

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
  background-color: #a62229;
}

.step-circle-active {
  background-color: #a62229 !important;
}

.step-circle-pending {
  background-color: #a62229 !important;
  opacity: 0.8;
}

.step-line-v {
  width: 2px;
  height: 16px;
  background-color: #e0e0e0;
}

.btn-next-step:not([disabled]) {
  background-color: #a62229 !important;
  color: #ffffff !important;
}

.btn-close-custom {
  color: #a62229 !important;
  font-weight: 500;
  border-radius: 6px;
}

.btn-save-custom {
  background-color: #a62229 !important;
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
  background: #c1c1c1;
  border-radius: 4px;
}

@media (min-width: 600px) {
  .rounded-lg-sm-up {
    border-radius: 8px !important;
  }
}
</style>