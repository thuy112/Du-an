<template>
  <v-dialog v-model="isOpen" max-width="650px" persistent>
    <v-card class="rounded-lg">
      <v-card-title class="pa-4 white--text" style="background-color: #A62229;">
        <span class="text-h6 font-weight-bold">Thêm sinh viên được phép bảo vệ lại</span>
        <v-spacer></v-spacer>
        <v-btn icon dark @click="closeModal"><v-icon>mdi-close</v-icon></v-btn>
      </v-card-title>

      <v-card-text class="pa-5">
        
        <!-- ================= BƯỚC 1 ================= -->
        <div class="step-box mb-3 pa-3 rounded-lg grey lighten-4">
          <!-- Tiêu đề bước 1 -->
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center font-weight-bold" style="color: #A62229;">
              <v-avatar :color="selectedStudent && isStep2Active ? '#A62229' : '#A62229'" size="24" class="white--text mr-2">
                <v-icon v-if="selectedStudent && isStep2Active" small>mdi-check</v-icon>
                <span v-else>1</span>
              </v-avatar>
              Thông tin cá nhân
            </div>
            <!-- Nút chỉnh sửa lại bước 1 nếu đã sang bước 2 -->
            <!-- <v-btn v-if="isStep2Active" text small color="#A62229" class="text-none" @click="isStep2Active = false">
               Chỉnh sửa
            </v-btn> -->
          </div>

          <!-- Hiệu ứng trượt mở/thu gọn nội dung Bước 1 -->
          <v-expand-transition>
            <div v-if="!isStep2Active" class="mt-3">
              <v-autocomplete
                v-model="selectedStudent"
                :items="studentList"
                :loading="loadingStudents"
                item-text="fullName"
                item-value="id"
                label="Nhập Mã Số Sinh Viên hoặc Tên"
                placeholder="Sinh viên"
                outlined
                dense
                clearable
                hide-details
                return-object
                class="custom-input mb-3"
                :search-input.sync="searchQuery"
              >
                <template v-slot:item="{ item }">
                  <div>
                    <div class="font-weight-bold" style="color: #A62229;">{{ item.code }} - {{ item.fullName }}</div>
                  </div>
                </template>
                <template v-slot:append-item>
                  <div v-if="hasMoreStudents" v-intersect="loadMoreStudents" class="text-center pa-2 text-caption grey--text">
                    Đang tải thêm sinh viên...
                  </div>
                </template>
              </v-autocomplete>

              <!-- Chi tiết thông tin sinh viên -->
              <div v-if="selectedStudent" class="student-detail mt-3 pt-3 border-top">
                <v-row dense>
                  <v-col cols="6"><b>Họ tên:</b> {{ selectedStudent.fullName }}</v-col>
                  <v-col cols="6"><b>Mã SV:</b> {{ selectedStudent.code }}</v-col>
                  <v-col cols="6"><b>Giới tính:</b> {{ formatGender(selectedStudent.gender) }}</v-col>
                  <v-col cols="6"><b>Email:</b> {{ selectedStudent.email }}</v-col>
                  <v-col cols="6"><b>Khóa:</b> {{ selectedStudent.course ? selectedStudent.course.name : '-' }}</v-col>
                  <v-col cols="6"><b>Lớp:</b> {{ selectedStudent.classes ? selectedStudent.classes.name : '-' }}</v-col>
                  <v-col cols="6"><b>Ngành:</b> {{ selectedStudent.major ? selectedStudent.major.name : '-' }}</v-col>
                  <v-col cols="6"><b>Đào tạo:</b> {{ selectedStudent.trainingMethod ? selectedStudent.trainingMethod.name : '-' }}</v-col>
                </v-row>
              </div>

              <!-- Nút tiếp tục -->
              <div class="d-flex justify-end mt-3" v-if="selectedStudent">
                <v-btn color="#A62229" dark class="text-none px-6" @click="isStep2Active = true">
                  Tiếp tục
                </v-btn>
              </div>
            </div>
          </v-expand-transition>

          <!-- Khi thu gọn bước 1, hiện tóm tắt ngắn gọn -->
          <div v-if="isStep2Active && selectedStudent" class="text-caption text--secondary mt-1 ml-8">
          </div>
        </div>

        <!-- ================= BƯỚC 2 ================= -->
        <div class="step-box pa-3 rounded-lg grey lighten-4">
          <div class="d-flex align-center font-weight-bold mb-3" style="color: #A62229;">
            <v-avatar :color="isStep2Active ? '#A62229' : 'grey'" size="24" class="white--text mr-2">2</v-avatar>
            Thông tin lớp bảo vệ lại
          </div>

          <!-- Hiệu ứng trượt mở/thu gọn nội dung Bước 2 -->
          <v-expand-transition>
            <div v-if="isStep2Active">
              <v-select
                v-model="form.examId"
                :items="examList"
                item-text="name"
                item-value="id"
                label="Đợt bảo vệ *"
                outlined
                dense
                clearable
                hide-details
                class="custom-input mb-3"
              ></v-select>

              <v-select
                v-model="form.semesterId"
                :items="semesterList"
                item-text="name"
                item-value="id"
                label="Học kỳ *"
                outlined
                dense
                clearable
                hide-details
                class="custom-input"
              ></v-select>
            </div>
          </v-expand-transition>
        </div>

      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-3">
        <v-spacer></v-spacer>
        <v-btn outlined color="grey darken-1" class="text-none px-4" @click="closeModal">
          Đóng <v-icon right small>mdi-close</v-icon>
        </v-btn>
        <v-btn color="#A62229" dark class="text-none px-6" :loading="saving" @click="handleSave">
          Lưu <v-icon right small>mdi-content-save</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import authorizeRegistrationService from '~/services/redefend/authorizeRegistrationService'

export default {
  name: 'AddAuthorizeModal',
  props: {
    value: { type: Boolean, default: false }
  },
  data() {
    return {
      isOpen: this.value,
      loadingStudents: false,
      saving: false,
      isStep2Active: false,

      studentList: [],
      selectedStudent: null,
      examList: [],
      semesterList: [],

      pageIndex: 1,
      pageSize: 10,
      totalPages: 1,
      searchQuery: '',
      searchTimeout: null,

      form: {
        examId: null,
        semesterId: null
      }
    }
  },
  computed: {
    hasMoreStudents() {
      return this.pageIndex < this.totalPages
    }
  },
  watch: {
    value(val) {
      this.isOpen = val
      if (val) {
        this.resetForm()
        this.fetchStudents(true)
        this.fetchExamsAndSemesters()
      }
    },
    isOpen(val) {
      this.$emit('input', val)
    },
    searchQuery(val) {
      if (this.searchTimeout) clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.pageIndex = 1
        this.fetchStudents(true)
      }, 400)
    }
  },
  methods: {
    resetForm() {
      this.selectedStudent = null
      this.isStep2Active = false
      this.searchQuery = ''
      this.form = { examId: null, semesterId: null }
    },
    closeModal() {
      this.isOpen = false
    },
    formatGender(gender) {
      if (gender === 'MALE') return 'Nam'
      if (gender === 'FEMALE') return 'Nữ'
      return 'Khác'
    },
    async fetchStudents(isReset = false) {
      if (this.loadingStudents) return
      this.loadingStudents = true
      try {
        if (isReset) {
          this.pageIndex = 1
          this.studentList = []
        }

        const params = {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize,
          status: 'STUDYING',
          channel: 'CMS'
        }
        if (this.searchQuery) params.search = this.searchQuery

        const res = await authorizeRegistrationService.getStudents(params)
        const root = res.data !== undefined ? res.data : res
        const items = Array.isArray(root) ? root : (root.data || root.content || [])
        
        if (isReset) {
          this.studentList = items
        } else {
          this.studentList = [...this.studentList, ...items]
        }

        const totalPages = root.totalPages || root.totalPage || Math.ceil((root.totalRecords || root.total || items.length) / this.pageSize)
        this.totalPages = Number(totalPages) || 1
      } catch (error) {
        console.error('Lỗi tải danh sách sinh viên:', error)
      } finally {
        this.loadingStudents = false
      }
    },
    loadMoreStudents() {
      if (this.hasMoreStudents && !this.loadingStudents) {
        this.pageIndex++
        this.fetchStudents(false)
      }
    },
    onStudentChange(item) {
      if (!item) {
        this.isStep2Active = false
      }
    },
    async fetchExamsAndSemesters() {
      try {
        const [examRes, semRes] = await Promise.all([
          authorizeRegistrationService.getExams({ status: 'ACTIVE', channel: 'CMS' }),
          authorizeRegistrationService.getSemesters({ status: 'ACTIVE', channel: 'CMS' })
        ])
        
        const examData = examRes.data !== undefined ? examRes.data : examRes
        this.examList = Array.isArray(examData) ? examData : (examData.data || examData.content || [])

        const semData = semRes.data !== undefined ? semRes.data : semRes
        this.semesterList = Array.isArray(semData) ? semData : (semData.data || semData.content || [])
      } catch (error) {
        console.error('Lỗi lấy danh mục đợt bảo vệ / học kỳ:', error)
      }
    },
    async handleSave() {
      if (!this.selectedStudent) {
        alert('Vui lòng chọn sinh viên!')
        return
      }
      if (!this.form.examId || !this.form.semesterId) {
        alert('Vui lòng chọn đầy đủ đợt bảo vệ và học kỳ!')
        return
      }

      this.saving = true
      try {
        const payload = {
          studentId: this.selectedStudent.id,
          examId: this.form.examId,
          semesterId: this.form.semesterId
        }
        await authorizeRegistrationService.createAuthorizeRegistration(payload, 'CMS')
        this.$emit('success', 'Thêm sinh viên bảo vệ lại thành công')
        this.closeModal()
      } catch (error) {
        console.error('Lỗi khi lưu:', error)
        this.$emit('error', 'Thêm mới thất bại')
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style scoped>
.custom-input >>> .v-input__slot {
  border-radius: 6px !important;
}
.border-top {
  border-top: 1px dashed #e0e0e0;
}
</style>