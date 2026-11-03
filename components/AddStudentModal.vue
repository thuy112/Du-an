<template>
  <v-dialog v-model="dialog" max-width="850px" width="100%" persistent scrollable>
    <v-card class="rounded-lg">
      <!-- Tiêu đề Modal -->
      <v-card-title class="pa-4 text-white" style="background-color: #A62229; color: white;">
        <span class="text-h6 font-weight-bold">Thêm sinh viên được phép thi lại</span>
        <v-spacer></v-spacer>
        <v-btn icon dark @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-4 pa-sm-5 modal-body-scroll">
        <!-- BƯỚC 1: THÔNG TIN CÁ NHÂN -->
        <div class="mb-4">
          <div class="d-flex align-center mb-3">
            <v-avatar color="#A62229" size="28" class="white--text font-weight-bold mr-2">1</v-avatar>
            <span class="text-subtitle-1 font-weight-bold black--text">Thông tin cá nhân</span>
          </div>

          <div class="pl-0 pl-sm-8">
            <!-- Ô tìm kiếm / chọn sinh viên -->
            <v-autocomplete
              v-model="selectedStudent"
              :items="studentOptions"
              :loading="loadingStudents"
              :search-input.sync="searchStudentQuery"
              item-text="fullName"
              item-value="id"
              label="Nhập Mã Số Sinh Viên hoặc Họ tên"
              placeholder="Nhập Mã Số Sinh Viên"
              outlined
              dense
              return-object
              clearable
              hide-details
              class="mb-3"
            >
              <template v-slot:item="{ item }">
                <v-list-item-content>
                  <v-list-item-title class="font-weight-bold">
                    {{ item.code }} - {{ item.fullName }}
                  </v-list-item-title>
                  <v-list-item-subtitle>Lớp: {{ item.classes?.name || item.className || '---' }}</v-list-item-subtitle>
                </v-list-item-content>
              </template>
            </v-autocomplete>

            <!-- Hiển thị chi tiết thông tin cá nhân khi đã chọn sinh viên -->
            <v-card v-if="selectedStudent" outlined class="pa-3 grey lighten-4 rounded-lg mb-3">
              <div class="text-subtitle-2 font-weight-bold mb-2 text-danger">Thông tin cá nhân</div>
              <v-row dense>
                <v-col cols="12" sm="6"><strong>Họ tên:</strong> {{ selectedStudent.fullName || '---' }}</v-col>
                <v-col cols="12" sm="6"><strong>Mã SV:</strong> {{ selectedStudent.code || '---' }}</v-col>
                <v-col cols="12" sm="6"><strong>Giới tính:</strong> {{ selectedStudent.gender || '---' }}</v-col>
                <v-col cols="12" sm="6"><strong>Email trường:</strong> {{ selectedStudent.email || '---' }}</v-col>
                <v-col cols="12" sm="6"><strong>Khóa:</strong> {{ selectedStudent.courseName || selectedStudent.classes?.courseName || '---' }}</v-col>
                <v-col cols="12" sm="6"><strong>Lớp:</strong> {{ selectedStudent.classes?.name || selectedStudent.className || '---' }}</v-col>
                <v-col cols="12" sm="6"><strong>Ngành:</strong> {{ selectedStudent.classes?.majorName || '---' }}</v-col>
                <v-col cols="12" sm="6"><strong>Loại hình đào tạo:</strong> {{ selectedStudent.classes?.trainingMethodName || '---' }}</v-col>
              </v-row>
            </v-card>

            <!-- Nút tiếp tục sang bước 2 -->
            <div class="d-flex justify-end" v-if="selectedStudent && currentStep === 1">
              <v-btn color="#A62229" dark class="text-none px-4" depressed @click="currentStep = 2">
                Tiếp tục
              </v-btn>
            </div>
          </div>
        </div>

        <v-divider class="my-4"></v-divider>

        <!-- BƯỚC 2: THÔNG TIN LỚP THI -->
        <div class="mb-2">
          <div class="d-flex align-center mb-3">
            <v-avatar :color="currentStep === 2 ? '#A62229' : 'grey'" size="28" class="white--text font-weight-bold mr-2">2</v-avatar>
            <span class="text-subtitle-1 font-weight-bold black--text">Thông tin lớp thi</span>
          </div>

          <div class="pl-0 pl-sm-8" v-if="currentStep >= 2">
            <v-row>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="filters.examId"
                  :items="examOptions"
                  item-text="text"
                  item-value="value"
                  label="Kỳ thi *"
                  outlined
                  dense
                  clearable
                  @change="loadRegisterClasses"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="filters.semesterId"
                  :items="semesterOptions"
                  item-text="text"
                  item-value="value"
                  label="Kỳ học *"
                  outlined
                  dense
                  clearable
                  @change="loadRegisterClasses"
                ></v-select>
              </v-col>
            </v-row>

            <!-- Bảng danh sách lớp đăng ký -->
            <div class="text-subtitle-2 font-weight-bold mb-2">
              Danh sách lớp đăng ký ({{ registerClasses.length }})
            </div>
            
            <div class="table-responsive-wrapper">
              <BaseTable
                :headers="classHeaders"
                :items="registerClasses"
                :loading="loadingClasses"
                show-select
                v-model="selectedClasses"
                item-key="id"
                hide-default-footer
              >
                <template #[`item.stt`]="{ index }">
                  <span>{{ index + 1 }}</span>
                </template>
              </BaseTable>
            </div>
          </div>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Footer Modal -->
      <v-card-actions class="pa-3">
        <v-spacer></v-spacer>
        <v-btn outlined color="grey darken-1" class="text-none px-4" @click="closeDialog">
          Đóng
        </v-btn>
        <v-btn color="#A62229" dark class="text-none px-5" :disabled="selectedClasses.length === 0" @click="handleSave">
          Lưu
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import authorizeService from '~/services/authorizeRegistrationService'
import BaseTable from '~/components/Base/BaseTable.vue'

export default {
  name: 'AddStudentModal',
  components: {
    BaseTable,
  },
  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dialog: this.value,
      currentStep: 1,
      loadingStudents: false,
      loadingClasses: false,
      searchStudentQuery: '',
      studentOptions: [],
      selectedStudent: null,
      
      examOptions: [],
      semesterOptions: [],
      
      filters: {
        examId: null,
        semesterId: null,
      },
      
      registerClasses: [],
      selectedClasses: [],

      classHeaders: [
        { text: 'STT', value: 'stt', align: 'center', width: '50px', sortable: false },
        { text: 'Tên lớp thi', value: 'examClass', sortable: false, minWidth: '130px' },
        { text: 'Tên kỳ thi', value: 'examName', sortable: false, minWidth: '150px' },
        { text: 'Tên kỳ học', value: 'semesterName', sortable: false, minWidth: '140px' },
        { text: 'Mã học phần', value: 'termCode', sortable: false, minWidth: '110px' },
        { text: 'Tên học phần', value: 'termName', sortable: false, minWidth: '150px' },
        { text: 'Số tín chỉ', value: 'credits', align: 'center', sortable: false, width: '90px' },
      ],
    }
  },
  watch: {
    value(val) {
      this.dialog = val
      if (val) {
        this.resetForm()
        this.fetchCatalogs()
      }
    },
    dialog(val) {
      this.$emit('input', val)
    },
    searchStudentQuery(val) {
      if (val !== null && val !== undefined) {
        this.fetchStudents(val)
      }
    },
  },
  methods: {
    resetForm() {
      this.currentStep = 1
      this.selectedStudent = null
      this.searchStudentQuery = ''
      this.filters.examId = null
      this.filters.semesterId = null
      this.registerClasses = []
      this.selectedClasses = []
    },
    closeDialog() {
      this.dialog = false
    },
    // Gọi API lấy danh sách sinh viên thông qua authorizeService
    async fetchStudents(searchKeyword = '') {
      this.loadingStudents = true
      try {
        const res = await authorizeService.getStudents({
          pageIndex: 1,
          pageSize: 50,
          search: searchKeyword,
          channel: 'CMS',
        })
        const rootData = res.data !== undefined ? res.data : res
        const list = Array.isArray(rootData) ? rootData : (rootData.data || rootData.content || [])
        this.studentOptions = list
      } catch (error) {
        console.error('Lỗi tải danh sách sinh viên:', error)
      } finally {
        this.loadingStudents = false
      }
    },
    // Gọi API lấy danh mục Kỳ thi & Học kỳ qua authorizeService
    async fetchCatalogs() {
      try {
        const [examRes, semesterRes] = await Promise.all([
          authorizeService.getExams({ status: 'ACTIVE', channel: 'CMS' }).catch(() => null),
          authorizeService.getSemesters({ status: 'ACTIVE', channel: 'CMS' }).catch(() => null),
        ])

        if (examRes) {
          const rootData = examRes.data !== undefined ? examRes.data : examRes
          const list = Array.isArray(rootData) ? rootData : (rootData.data || rootData.content || [])
          this.examOptions = list.map(item => ({ text: item.name || item.code, value: item.id }))
        }

        if (semesterRes) {
          const rootData = semesterRes.data !== undefined ? semesterRes.data : semesterRes
          const list = Array.isArray(rootData) ? rootData : (rootData.data || rootData.content || [])
          this.semesterOptions = list.map(item => ({ text: item.name || item.code, value: item.id }))
        }
      } catch (error) {
        console.error('Lỗi tải danh mục:', error)
      }
    },
    // Gọi API danh sách lớp đăng ký tương ứng
    async loadRegisterClasses() {
      if (!this.filters.examId || !this.filters.semesterId) return
      this.loadingClasses = true
      try {
        const res = await authorizeService.getRegisterClasses({
          examId: this.filters.examId,
          semesterId: this.filters.semesterId,
          channel: 'CMS',
        })
        const rootData = res.data !== undefined ? res.data : res
        const list = Array.isArray(rootData) ? rootData : (rootData.data || rootData.content || [])
        
        this.registerClasses = list.map(item => ({
          ...item,
          examClass: item.examClass || item.className || item.classes?.code || '---',
          examName: item.examName || item.exam?.name || '---',
          semesterName: item.semesterName || item.semester?.name || '---',
          termCode: item.termCode || item.courseCode || '---',
          termName: item.termName || item.courseName || '---',
          credits: item.credits || item.credit || 0,
        }))
      } catch (error) {
        console.error('Lỗi tải danh sách lớp đăng ký:', error)
        this.registerClasses = []
      } finally {
        this.loadingClasses = false
      }
    },
    handleSave() {
      this.$emit('success')
      this.closeDialog()
    },
  },
}
</script>

<style scoped>
.text-danger {
  color: #A62229;
}
.modal-body-scroll {
  max-height: 75vh;
  overflow-y: auto;
}
.table-responsive-wrapper {
  width: 100%;
  overflow-x: auto;
}
</style>