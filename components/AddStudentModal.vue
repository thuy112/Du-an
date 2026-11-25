<template>
  <v-dialog v-model="dialog" max-width="1200px" persistent>
    <v-card class="rounded-lg overflow-hidden">
      <!-- TIÊU ĐỀ MODAL -->
      <div
        class="px-6 py-4 text-white font-weight-bold d-flex justify-space-between align-items-center"
        style="background-color: #A62229; font-size: 18px;"
      >
        <span>Thêm sinh viên được phép thi lại</span>
        <v-btn icon dark @click="closeModal"><v-icon>mdi-close</v-icon></v-btn>
      </div>

      <v-card-text class="pa-4" style="max-height: 75vh; overflow-y: auto;">
        <v-stepper v-model="step" elevation="0" vertical class="pa-0">
          <!-- BƯỚC 1: THÔNG TIN CÁ NHÂN -->
          <v-stepper-step :complete="step > 1" step="1" color="#A62229">
            <div class="d-flex align-center justify-space-between w-100">
              <span>Thông tin cá nhân</span>
              <v-btn
                v-if="step > 1"
                text
                x-small
                color="#A62229"
                class="text-none font-weight-bold"
                @click.stop="handleEditStudent"
              >
                Thay đổi
              </v-btn>
            </div>
          </v-stepper-step>

          <v-stepper-content step="1">
            <div class="text-caption grey--text mb-1 text-center">Nhập Mã Số Sinh Viên</div>
            <v-autocomplete
              v-model="selectedStudent"
              :items="studentOptions"
              :loading="loadingStudents"
              :search-input.sync="searchStudentText"
              item-text="fullName"
              item-value="id"
              return-object
              placeholder="Sinh viên"
              no-data-text="Không có dữ liệu"
              no-filter
              outlined
              dense
              clearable
              hide-details
              class="mb-3"
              @change="handleStudentSelect"
              @update:search-input="handleSearchStudent"
            >
              <template v-slot:item="{ item }">
                <span>{{ item.code }} - {{ item.fullName }}</span>
              </template>
              <template v-slot:append-item>
                <div v-intersect="endIntersect" class="pa-2 text-center caption grey--text">
                  <span v-if="loadingMoreStudents">Đang tải thêm sinh viên...</span>
                </div>
              </template>
            </v-autocomplete>

            <template v-if="selectedStudent">
              <div class="pa-4 rounded bg-grey-lighten-4 border mt-3">
                <div class="font-weight-bold mb-2" style="color: #A62229; font-size: 15px;">
                  Thông tin cá nhân
                </div>
                <div class="d-flex flex-column text-body-2" style="gap: 6px;">
                  <div><strong>Họ tên:</strong> {{ selectedStudent.fullName || '---' }}</div>
                  <div><strong>Mã SV:</strong> {{ selectedStudent.code || '---' }}</div>
                  <div><strong>Giới tính:</strong> {{ formatGender(selectedStudent.gender) }}</div>
                  <div><strong>Email trường:</strong> {{ selectedStudent.email || '---' }}</div>
                  <div>
                    <strong>Khóa:</strong>
                    {{ parseObjectValue(selectedStudent.course || selectedStudent.cohort || selectedStudent.khoa) }}
                  </div>
                  <div>
                    <strong>Lớp:</strong>
                    {{ selectedStudent.className || selectedStudent.classes?.name || '---' }}
                  </div>
                  <div>
                    <strong>Ngành:</strong>
                    {{ parseObjectValue(selectedStudent.major || selectedStudent.nganh) }}
                  </div>
                  <div>
                    <strong>Loại hình đào tạo:</strong>
                    {{ parseObjectValue(selectedStudent.trainingType || selectedStudent.loaiHinhDaoTao) }}
                  </div>
                </div>
              </div>

              <div class="d-flex justify-end mt-3">
                <v-btn
                  color="#A2212B"
                  dark
                  depressed
                  class="text-none px-6"
                  height="36"
                  :disabled="!selectedStudent"
                  @click="handleContinue"
                >
                  Tiếp tục
                </v-btn>
              </div>
            </template>
          </v-stepper-content>

          <!-- BƯỚC 2: THÔNG TIN LỚP THI -->
          <v-stepper-step :complete="step > 2" step="2" color="#A62229">
            Thông tin lớp thi
          </v-stepper-step>

          <v-stepper-content step="2">
            <v-row dense class="mb-2">
              <v-col cols="12" md="6">
                <div class="text-caption grey--text mb-1">
                  Kỳ thi <span class="red--text">*</span>
                </div>
                <v-autocomplete
                  v-model="form.examId"
                  :items="examOptions"
                  :loading="loadingExams"
                  item-text="text"
                  item-value="value"
                  placeholder="Kỳ thi"
                  no-data-text="Không có dữ liệu"
                  clearable
                  outlined
                  dense
                  hide-details
                ></v-autocomplete>
              </v-col>

              <v-col cols="12" md="6">
                <div class="text-caption grey--text mb-1">
                  Kỳ học <span class="red--text">*</span>
                </div>
                <v-autocomplete
                  v-model="form.semesterId"
                  :items="semesterOptions"
                  :loading="loadingSemesters"
                  item-text="text"
                  item-value="value"
                  placeholder="Kỳ học"
                  no-data-text="Không có dữ liệu"
                  clearable
                  outlined
                  dense
                  hide-details
                ></v-autocomplete>
              </v-col>
            </v-row>

            <div class="mt-4">
              <div class="d-flex justify-space-between align-center mb-2 flex-wrap" style="gap: 8px;">
                <div class="font-weight-bold">
                  Danh sách lớp đăng ký (<span class="red--text">{{ sessionList.length }}</span>)
                </div>
                <v-text-field
                  v-if="sessionList.length > 0"
                  v-model="sessionFilter"
                  append-icon="mdi-magnify"
                  placeholder="Tìm kiếm"
                  single-line
                  hide-details
                  dense
                  style="max-width: 280px;"
                ></v-text-field>
              </div>

              <v-data-table
                v-model="form.selectedSessions"
                :headers="sessionHeaders"
                :items="sessionList"
                :search="sessionFilter"
                :loading="loadingSessions"
                item-key="id"
                show-select
                hide-default-footer
                disable-pagination
                class="elevation-1 rounded border"
                no-data-text="Không có dữ liệu"
              >
                <template #[`item.data-table-select`]="{ item, isSelected, select }">
                  <v-simple-checkbox
                    color="#A2212B"
                    :value="isSelected"
                    :disabled="selectedOriginalIds.includes(item.id)"
                    @input="select($event)"
                  ></v-simple-checkbox>
                </template>

                <template #[`item.stt`]="{ index }">
                  <span>{{ index + 1 }}</span>
                </template>
              </v-data-table>
            </div>
          </v-stepper-content>
        </v-stepper>
      </v-card-text>

      <v-divider></v-divider>

      <!-- FOOTER ACTIONS -->
      <v-card-actions class="pa-4 justify-end" style="gap: 8px;">
        <v-btn text class="text-none px-4" @click="closeModal">Đóng</v-btn>
        <v-btn
          :color="canSave ? '#A2212B' : '#e0e0e0'"
          :dark="canSave"
          depressed
          class="text-none px-6 save-btn"
          :class="{ 'save-btn--disabled': !canSave }"
          :loading="submitting"
          :disabled="!canSave"
          @click="handleSave"
        >
          Lưu
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import authorizeService from '~/services/authorizeRegistrationService'

export default {
  name: 'AddStudentModal',
  props: {
    value: { type: Boolean, default: false }
  },
  data() {
    return {
      dialog: this.value,
      step: 1,
      loadingStudents: false,
      loadingMoreStudents: false,
      loadingExams: false,
      loadingSemesters: false,
      loadingSessions: false,
      submitting: false,

      studentOptions: [],
      studentPage: 1,
      studentPageSize: 20,
      studentTotalPages: 1,
      searchStudentText: '',
      selectedStudent: null,
      searchTimeout: null,

      examOptions: [],
      semesterOptions: [],

      form: {
        examId: null,
        semesterId: null,
        selectedSessions: []
      },

      sessionFilter: '',
      sessionList: [],
      selectedOriginalIds: [],
      sessionHeaders: [
        { value: 'stt', text: 'STT', align: 'start', width: '60px', sortable: false },
        { value: 'examClass', text: 'Tên lớp thi', align: 'start', sortable: false },
        { value: 'exam.name', text: 'Tên kỳ thi', align: 'start', sortable: false },
        { value: 'semester.name', text: 'Tên kỳ học', align: 'start', sortable: false },
        { value: 'term.code', text: 'Mã học phần', align: 'start', sortable: false },
        { value: 'term.name', text: 'Tên học phần', align: 'start', sortable: false },
        { value: 'term.creditHours', text: 'Số tín chỉ học phí', align: 'end', sortable: false }
      ]
    }
  },
  computed: {
    newSelectedSessionIds() {
      return (this.form.selectedSessions || [])
        .filter((item) => !this.selectedOriginalIds.includes(item.id))
        .map((item) => item.id)
    },
    canSave() {
      return Boolean(
        this.step === 2 &&
          this.selectedStudent &&
          this.form.examId &&
          this.form.semesterId &&
          this.newSelectedSessionIds.length > 0
      )
    }
  },
  watch: {
    value(val) {
      this.dialog = val
      if (val) {
        this.resetForm()
        this.fetchStudents('', false)
      }
    },
    dialog(val) {
      this.$emit('input', val)
    },
    'form.examId'(val) {
      if (val && this.form.semesterId) {
        this.fetchExamSessions()
      } else {
        this.sessionList = []
        this.form.selectedSessions = []
      }
    },
    'form.semesterId'(val) {
      if (val && this.form.examId) {
        this.fetchExamSessions()
      } else {
        this.sessionList = []
        this.form.selectedSessions = []
      }
    }
  },
  methods: {
    resetForm() {
      this.step = 1
      this.selectedStudent = null
      this.searchStudentText = ''
      this.studentOptions = []
      this.studentPage = 1
      this.studentTotalPages = 1
      this.loadingMoreStudents = false
      this.sessionFilter = ''
      this.form = {
        examId: null,
        semesterId: null,
        selectedSessions: []
      }
      this.sessionList = []
      this.selectedOriginalIds = []
      this.examOptions = []
      this.semesterOptions = []
    },

    closeModal() {
      this.dialog = false
    },

    formatGender(gender) {
      if (gender === 'MALE' || gender === 'NAM') return 'Nam'
      if (gender === 'FEMALE' || gender === 'NỮ') return 'Nữ'
      return 'Khác'
    },

    parseObjectValue(val) {
      if (!val) return '---'
      if (typeof val === 'object') {
        return val.name || val.code || val.title || '---'
      }
      return val
    },

    handleSearchStudent(val) {
      if (this.step > 1) return
      if (this.searchTimeout) clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.fetchStudents(val || '', false)
      }, 400)
    },

    async fetchStudents(searchQuery = '', isLoadMore = false) {
      if (isLoadMore) {
        if (this.loadingMoreStudents || this.studentPage >= this.studentTotalPages) return
        this.loadingMoreStudents = true
      } else {
        this.studentPage = 1
        this.loadingStudents = true
      }

      try {
        const res = await authorizeService.getStudents({
          pageIndex: this.studentPage,
          pageSize: this.studentPageSize,
          search: searchQuery,
          channel: 'CMS'
        })
        const data = res?.data !== undefined ? res.data : res
        const list = Array.isArray(data) ? data : (data.data || data.content || [])
        this.studentTotalPages = Number(data?.totalPages || 1)

        if (isLoadMore) {
          const existingIds = new Set(this.studentOptions.map((s) => s.id))
          const uniqueNew = list.filter((s) => !existingIds.has(s.id))
          this.studentOptions = [...this.studentOptions, ...uniqueNew]
        } else {
          this.studentOptions = list
        }
      } catch (error) {
        console.error('Lỗi tải danh sách sinh viên:', error)
      } finally {
        this.loadingStudents = false
        this.loadingMoreStudents = false
      }
    },

    endIntersect(entries) {
      const entry = Array.isArray(entries) ? entries[0] : entries
      if (entry && entry.isIntersecting && !this.loadingStudents && !this.loadingMoreStudents) {
        if (this.studentPage < this.studentTotalPages) {
          this.studentPage += 1
          this.fetchStudents(this.searchStudentText || '', true)
        }
      }
    },

    handleStudentSelect() {
      this.step = 1
      this.form.examId = null
      this.form.semesterId = null
      this.sessionList = []
      this.selectedOriginalIds = []
      this.form.selectedSessions = []
    },

    handleEditStudent() {
      this.step = 1
      this.form.examId = null
      this.form.semesterId = null
      this.sessionList = []
      this.selectedOriginalIds = []
      this.form.selectedSessions = []
    },

    async handleContinue() {
      if (!this.selectedStudent) return
      this.step = 2
      await this.fetchCatalogs()
    },

    async fetchCatalogs() {
      this.loadingExams = true
      this.loadingSemesters = true
      try {
        const [examRes, semesterRes] = await Promise.all([
          authorizeService.getExams({ status: 'ACTIVE', channel: 'CMS' }),
          authorizeService.getSemesters({ status: 'ACTIVE', channel: 'CMS' })
        ])

        const exams = examRes?.data !== undefined ? examRes.data : examRes
        const semesters = semesterRes?.data !== undefined ? semesterRes.data : semesterRes

        const examList = Array.isArray(exams) ? exams : (exams.data || exams.content || [])
        const semesterList = Array.isArray(semesters) ? semesters : (semesters.data || semesters.content || [])

        this.examOptions = examList.map((item) => ({ text: item.name || item.code, value: item.id }))
        this.semesterOptions = semesterList.map((item) => ({ text: item.name || item.code, value: item.id }))
      } catch (error) {
        console.error('Lỗi tải danh mục kỳ thi/học kỳ:', error)
      } finally {
        this.loadingExams = false
        this.loadingSemesters = false
      }
    },

    async fetchExamSessions() {
      const studentCode = this.selectedStudent?.code || this.selectedStudent?.studentCode
      if (!studentCode || !this.form.examId || !this.form.semesterId) return

      this.loadingSessions = true
      try {
        const [sessionRes, registeredRes] = await Promise.all([
          authorizeService.getExamSessionList({
            examId: this.form.examId,
            semesterId: this.form.semesterId,
            channel: 'CMS'
          }),
          authorizeService.getRegisterExam(studentCode, 'CMS').catch(() => null)
        ])

        const sessionData = sessionRes?.data !== undefined ? sessionRes.data : sessionRes
        const rawSessions = Array.isArray(sessionData)
          ? sessionData
          : (sessionData?.data || sessionData?.content || [])

        const regData = registeredRes?.data !== undefined ? registeredRes.data : registeredRes
        const registeredList = Array.isArray(regData) ? regData : (regData?.data || regData?.content || [])

        const registeredIds = registeredList.map((i) => i.id)
        this.selectedOriginalIds = registeredIds
        this.form.selectedSessions = []
        this.sessionList = rawSessions.filter((item) => !registeredIds.includes(item.id))
      } catch (error) {
        console.error('Lỗi lấy danh sách lớp đăng ký:', error)
        this.sessionList = []
      } finally {
        this.loadingSessions = false
      }
    },

    async handleSave() {
      if (!this.canSave) return

      this.submitting = true
      try {
        const payload = {
          examSessionIds: this.newSelectedSessionIds,
          studentId: this.selectedStudent.id,
          examId: this.form.examId,
          semesterId: this.form.semesterId
        }

        await authorizeService.add(payload, 'CMS')
        this.$emit('success')
        this.closeModal()
      } catch (error) {
        console.error('Lỗi lưu:', error)
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.border {
  border: 1px solid #e0e0e0 !important;
}

.save-btn--disabled {
  background-color: #e0e0e0 !important;
  color: #9e9e9e !important;
}
</style>