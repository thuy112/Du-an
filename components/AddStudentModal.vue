<template>
  <v-dialog v-model="dialog" max-width="750px" persistent>
    <v-card class="rounded-lg overflow-hidden">
      <!-- TIÊU ĐỀ MODAL -->
      <div class="px-6 py-4 text-white font-weight-bold d-flex justify-space-between align-items-center" style="background-color: #A62229; font-size: 18px;">
        <span>Thêm sinh viên được phép thi lại</span>
        <v-btn icon dark @click="closeModal"><v-icon>mdi-close</v-icon></v-btn>
      </div>

      <v-card-text class="pa-6" style="max-height: 75vh; overflow-y: auto;">
        <!-- BƯỚC 1: THÔNG TIN CÁ NHÂN -->
        <div class="d-flex align-center mb-3">
          <v-avatar :color="step2Active ? 'grey' : '#A62229'" size="24" class="white--text font-weight-bold mr-2 text-caption">1</v-avatar>
          <span class="font-weight-bold text-subtitle-1 text-dark">Thông tin cá nhân</span>
        </div>

        <div class="mb-4 pl-7">
          <!-- Khi chưa bấm tiếp tục: Cho phép chọn sinh viên -->
          <template v-if="!step2Active">
            <div class="text-caption grey--text mb-1">Nhập Mã Số Sinh Viên</div>
            <v-autocomplete
              v-model="selectedStudent"
              :items="studentOptions"
              :loading="loadingStudents"
              :search-input.sync="searchStudentText"
              item-text="fullName"
              item-value="id"
              return-object
              placeholder="Sinh viên"
              outlined
              dense
              clearable
              hide-details
              class="mb-3"
              @change="handleStudentSelect"
            >
              <template v-slot:item="{ item }">
                <span>{{ item.fullName }} - {{ item.code }} (Lớp: {{ item.className || item.classes?.name || '---' }})</span>
              </template>
            </v-autocomplete>
          </template>

          <!-- Hiển thị thông tin chi tiết sinh viên (khi đã chọn hoặc đã bấm tiếp tục) -->
          <template v-if="selectedStudent">
            <div class="pa-4 rounded bg-grey-lighten-4 border mt-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <div class="font-weight-bold" style="color: #A62229; font-size: 15px;">Thông tin cá nhân</div>
                <v-btn v-if="step2Active" text x-small color="#A62229" class="text-none font-weight-bold" @click="handleEditStudent">
                  Thay đổi
                </v-btn>
              </div>
              <div class="d-flex flex-column text-body-2" style="gap: 6px;">
                <div><strong>Họ tên:</strong> {{ selectedStudent.fullName || '---' }}</div>
                <div><strong>Mã SV:</strong> {{ selectedStudent.code || '---' }}</div>
                <div><strong>Giới tính:</strong> {{ formatGender(selectedStudent.gender) }}</div>
                <div><strong>Email trường:</strong> {{ selectedStudent.email || '---' }}</div>
                <div><strong>Khóa:</strong> {{ parseObjectValue(selectedStudent.course || selectedStudent.cohort || selectedStudent.khoa) }}</div>
                <div><strong>Lớp:</strong> {{ selectedStudent.className || selectedStudent.classes?.name || '---' }}</div>
                <div><strong>Ngành:</strong> {{ parseObjectValue(selectedStudent.major || selectedStudent.nganh) }}</div>
                <div><strong>Loại hình đào tạo:</strong> {{ parseObjectValue(selectedStudent.trainingType || selectedStudent.loaiHinhDaoTao) }}</div>
              </div>
            </div>

            <!-- Nút Tiếp tục (Ẩn đi khi đã sang bước 2) -->
            <div v-if="!step2Active" class="d-flex justify-end mt-3">
              <v-btn color="#A2212B" dark depressed class="text-none px-6" height="36" @click="handleContinue">
                Tiếp tục
              </v-btn>
            </div>
          </template>
        </div>

        <v-divider class="my-4"></v-divider>

        <!-- BƯỚC 2: THÔNG TIN LỚP THI (Chỉ hiện khi bấm Tiếp tục) -->
        <div class="d-flex align-center mb-3">
          <v-avatar :color="step2Active ? '#A62229' : 'grey'" size="24" class="white--text font-weight-bold mr-2 text-caption">2</v-avatar>
          <span class="font-weight-bold text-subtitle-1 text-dark">Thông tin lớp thi</span>
        </div>

        <div class="pl-7" v-if="step2Active">
          <div class="mb-3">
            <div class="text-caption grey--text mb-1">Kỳ thi *</div>
            <v-select
              v-model="form.examId"
              :items="examOptions"
              :loading="loadingExams"
              item-text="text"
              item-value="value"
              placeholder="Chọn kỳ thi"
              outlined
              dense
              hide-details
              class="mb-3"
              @change="fetchExamSessions"
            ></v-select>

            <div class="text-caption grey--text mb-1">Kỳ học *</div>
            <v-select
              v-model="form.semesterId"
              :items="semesterOptions"
              :loading="loadingSemesters"
              item-text="text"
              item-value="value"
              placeholder="Chọn kỳ học"
              outlined
              dense
              hide-details
              @change="fetchExamSessions"
            ></v-select>
          </div>

          <!-- Danh sách lớp đăng ký -->
          <div class="mt-4">
            <div class="font-weight-bold mb-2">Danh sách lớp đăng ký ({{ sessionList.length }})</div>
            
            <v-data-table
              :headers="sessionHeaders"
              :items="sessionList"
              :loading="loadingSessions"
              hide-default-footer
              class="elevation-1 rounded border"
              no-data-text="Không có dữ liệu"
            >
              <template #[`item.select`]="{ item }">
                <v-checkbox
                  v-model="form.selectedSessions"
                  :value="item"
                  hide-details
                  dense
                ></v-checkbox>
              </template>

              <template #[`item.stt`]="{ index }">
                <span>{{ index + 1 }}</span>
              </template>
            </v-data-table>
          </div>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <!-- FOOTER ACTIONS -->
      <v-card-actions class="pa-4 justify-end" style="gap: 8px;">
        <v-btn text class="text-none px-4" @click="closeModal">Đóng</v-btn>
        <v-btn 
          color="#A2212B" 
          dark 
          depressed 
          class="text-none px-6" 
          :loading="submitting"
          :disabled="!step2Active || form.selectedSessions.length === 0"
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
      loadingStudents: false,
      loadingExams: false,
      loadingSemesters: false,
      loadingSessions: false,
      submitting: false,
      step2Active: false,

      studentOptions: [],
      searchStudentText: '',
      selectedStudent: null,

      examOptions: [],
      semesterOptions: [],

      form: {
        examId: null,
        semesterId: null,
        selectedSessions: []
      },

      sessionList: [],
      sessionHeaders: [
        { value: 'select', text: '', width: '50px', align: 'center', sortable: false },
        { value: 'stt', text: 'STT', align: 'center', width: '60px', sortable: false },
        { value: 'className', text: 'Tên lớp thi', align: 'left', sortable: false },
        { value: 'examName', text: 'Tên kỳ đăng ký thi lại', align: 'left', sortable: false },
        { value: 'semesterName', text: 'Học kỳ', align: 'left', sortable: false },
        { value: 'termCode', text: 'Mã học phần', align: 'left', sortable: false },
        { value: 'termName', text: 'Tên học phần', align: 'left', sortable: false },
        { value: 'credit', text: 'Số tín chỉ học phí', align: 'center', sortable: false },
      ]
    }
  },
  watch: {
    value(val) {
      this.dialog = val
      if (val) {
        this.resetForm()
        this.fetchStudents()
      }
    },
    dialog(val) {
      this.$emit('input', val)
    },
    searchStudentText(val) {
      if (val !== null && !this.step2Active) {
        this.fetchStudents(val)
      }
    }
  },
  methods: {
    resetForm() {
      this.selectedStudent = null
      this.step2Active = false
      this.form = {
        examId: null,
        semesterId: null,
        selectedSessions: []
      }
      this.sessionList = []
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

    // Xử lý bóc tách khi dữ liệu trả về dạng object thay vì string
    parseObjectValue(val) {
      if (!val) return '---'
      if (typeof val === 'object') {
        return val.name || val.code || val.title || JSON.stringify(val)
      }
      return val
    },

    async fetchStudents(searchQuery = '') {
      this.loadingStudents = true
      try {
        const res = await authorizeService.getStudents({
          pageIndex: 1,
          pageSize: 50,
          search: searchQuery,
          channel: 'CMS'
        })
        const data = res?.data !== undefined ? res.data : res
        const list = Array.isArray(data) ? data : (data.data || data.content || [])
        this.studentOptions = list
      } catch (error) {
        console.error('Lỗi tải danh sách sinh viên:', error)
      } finally {
        this.loadingStudents = false
      }
    },

    handleStudentSelect() {
      this.step2Active = false
      this.form.examId = null
      this.form.semesterId = null
      this.sessionList = []
    },

    // Bấm nút "Thay đổi" sinh viên ở bước 2
    handleEditStudent() {
      this.step2Active = false
      this.form.examId = null
      this.form.semesterId = null
      this.sessionList = []
    },

    // Bấm nút "Tiếp tục" -> Gom nội dung số 1, kích hoạt gọi API danh mục và mở bước 2
    async handleContinue() {
      if (!this.selectedStudent) return
      this.step2Active = true
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

        this.examOptions = examList.map(item => ({ text: item.name || item.code, value: item.id }))
        this.semesterOptions = semesterList.map(item => ({ text: item.name || item.code, value: item.id }))
      } catch (error) {
        console.error('Lỗi tải danh mục kỳ thi/học kỳ:', error)
      } finally {
        this.loadingExams = false
        this.loadingSemesters = false
      }
    },

    async fetchExamSessions() {
      if (!this.selectedStudent || !this.selectedStudent.code || !this.form.examId || !this.form.semesterId) return

      this.loadingSessions = true
      try {
        const res = await authorizeService.getExamSessions({
          code: this.selectedStudent.code,
          examId: this.form.examId,
          semesterId: this.form.semesterId,
          channel: 'CMS'
        })
        const data = res?.data !== undefined ? res.data : res
        this.sessionList = Array.isArray(data) ? data : (data.data || data.content || [])
      } catch (error) {
        console.error('Lỗi lấy danh sách lớp đăng ký:', error)
        this.sessionList = []
      } finally {
        this.loadingSessions = false
      }
    },

    async handleSave() {
      if (!this.selectedStudent || this.form.selectedSessions.length === 0) return

      this.submitting = true
      try {
        const payload = {
          studentId: this.selectedStudent.id,
          studentCode: this.selectedStudent.code,
          examId: this.form.examId,
          semesterId: this.form.semesterId,
          sessions: this.form.selectedSessions
        }

        await authorizeService.createAuthorizeRegistration(payload, 'CMS')

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
</style>