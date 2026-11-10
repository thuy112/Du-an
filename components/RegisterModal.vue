<template>
  <v-dialog v-model="dialog" max-width="800px" persistent>
    <v-card class="rounded-lg">
      <v-card-title class="headline text-white px-6 py-4" style="background-color: #a62229;">
        <span>Đăng ký bảo vệ lại</span>
        <v-spacer></v-spacer>
        <v-btn icon dark @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="py-4 px-6">
        <!-- BƯỚC 1: THÔNG TIN CÁ NHÂN -->
        <div class="mb-4">
          <div class="d-flex align-center font-weight-bold red--text text--darken-3 mb-2">
            <v-avatar color="#a62229" size="24" class="white--text mr-2">1</v-avatar>
            <span>Thông tin cá nhân</span>
          </div>

          <div class="pl-7">
            <div class="text-subtitle-2 font-weight-bold grey--text text--darken-2 mb-1">Nhập Mã Số Sinh Viên</div>
            <v-autocomplete
              v-model="selectedStudent"
              :items="studentList"
              :loading="studentLoading"
              :search-input.sync="studentSearchQuery"
              item-text="fullName"
              item-value="id"
              placeholder="Sinh viên"
              outlined
              dense
              clearable
              return-object
              hide-details
              @change="onSelectStudent"
            >
              <!-- Hiển thị đúng định dạng: Mã SV - Tên sinh viên -->
              <template #item="{ item }">
                <span>{{ item.studentCode || item.code }} - {{ item.fullName }}</span>
              </template>
            </v-autocomplete>

            <!-- Chi tiết thông tin sinh viên sau khi chọn -->
            <div v-if="studentDetail" class="mt-4 p-3 grey lighten-4 rounded">
              <div class="font-weight-bold red--text text--darken-3 mb-2">Thông tin cá nhân</div>
              <v-row dense>
                <v-col cols="6">Họ tên: <b>{{ studentDetail.fullName }}</b></v-col>
                <v-col cols="6">Mã SV: <b>{{ studentDetail.studentCode }}</b></v-col>
                <v-col cols="6">Ngày sinh: {{ studentDetail.birthday }}</v-col>
                <v-col cols="6">Giới tính: {{ studentDetail.gender }}</v-col>
                <v-col cols="6">Email trường: {{ studentDetail.email }}</v-col>
                <v-col cols="6">Email cá nhân: {{ studentDetail.personalEmail }}</v-col>
                <v-col cols="6">Số điện thoại: {{ studentDetail.phone }}</v-col>
                <v-col cols="6">Khóa: {{ studentDetail.course }}</v-col>
                <v-col cols="6">Lớp: {{ studentDetail.clazz ? studentDetail.clazz.name : '' }}</v-col>
                <v-col cols="6">Ngành: {{ studentDetail.major ? studentDetail.major.name : '' }}</v-col>
                <v-col cols="6">Loại hình đào tạo: {{ studentDetail.trainingMethod ? studentDetail.trainingMethod.name : '' }}</v-col>
              </v-row>
            </div>

            <div class="d-flex justify-end mt-3">
              <v-btn
                color="#a62229"
                dark
                small
                :disabled="!studentDetail"
                @click="step = 2"
              >
                Tiếp tục
              </v-btn>
            </div>
          </div>
        </div>

        <!-- BƯỚC 2: THÔNG TIN ĐĂNG KÝ -->
        <div v-if="step >= 2">
          <div class="d-flex align-center font-weight-bold red--text text--darken-3 mb-2">
            <v-avatar color="#a62229" size="24" class="white--text mr-2">2</v-avatar>
            <span>Thông tin đăng ký</span>
          </div>

          <div class="pl-7">
            <v-row dense>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="registrationForm.examId"
                  :items="examList"
                  item-text="name"
                  item-value="id"
                  label="Đợt bảo vệ lại"
                  outlined
                  dense
                  @change="handleExamOrTermChange"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="registrationForm.termCode"
                  :items="termList"
                  item-text="name"
                  item-value="code"
                  label="Học phần"
                  outlined
                  dense
                  @change="handleExamOrTermChange"
                ></v-select>
              </v-col>
            </v-row>

            <!-- Danh sách học phần có checkbox -->
            <div class="text-subtitle-2 font-weight-bold mt-2">Danh sách học phần ({{ registerSubjects.length }})</div>
            <v-data-table
              v-model="selectedSubjects"
              :headers="registerSubjectHeaders"
              :items="registerSubjects"
              show-select
              item-key="code"
              hide-default-footer
              dense
              class="elevation-1 mt-2"
            >
              <template #[`item.totalFee`]="{ item }">
                {{ formatMoney(item.totalFee) }}đ
              </template>
            </v-data-table>

            <div class="text-right font-weight-bold mt-2">
              Tổng tiền: <span class="red--text">{{ formatMoney(calculatedTotalFee) }} VND</span>
            </div>
            <div class="text-caption grey--text">
              Hệ thống chỉ hiển thị số tiền dự kiến. Học phí chính thức sẽ được thông báo cụ thể qua email của sinh viên.
            </div>
          </div>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="px-6 py-3">
        <v-btn text color="grey darken-1" @click="close">Đóng</v-btn>
        <v-spacer></v-spacer>
        <!-- Nút lưu chỉ sáng và bấm được khi đã chọn học phần -->
        <v-btn 
          color="#a62229" 
          dark 
          elevation="0" 
          :disabled="selectedSubjects.length === 0"
          :loading="submitting" 
          @click="save"
        >
          Lưu
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import registerService from '@/services/redefend/registerService'

export default {
  name: 'RegisterModal',
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialog: this.value,
      step: 1,
      studentList: [],
      studentLoading: false,
      studentSearchQuery: '',
      selectedStudent: null,
      studentDetail: null,
      examList: [],
      termList: [],
      registerSubjects: [],
      selectedSubjects: [],
      submitting: false,
      registrationForm: {
        examId: null,
        termCode: null
      },
      registerSubjectHeaders: [
        { text: 'STT', value: 'index' },
        { text: 'Mã học phần', value: 'code' },
        { text: 'Tên học phần', value: 'name' },
        { text: 'Định mức', value: 'norm' },
        { text: 'Số tín chỉ học phí', value: 'credits' },
        { text: 'Thành tiền', value: 'totalFee' }
      ]
    }
  },
  computed: {
    calculatedTotalFee() {
      return this.selectedSubjects.reduce((sum, item) => sum + (item.totalFee || 0), 0)
    }
  },
  watch: {
    value(val) {
      this.dialog = val
      if (val) {
        this.initData()
      }
    },
    dialog(val) {
      this.$emit('input', val)
    },
    studentSearchQuery(val) {
      if (val) {
        this.fetchCanRegisterStudents(val)
      }
    }
  },
  methods: {
    initData() {
      this.step = 1
      this.selectedStudent = null
      this.studentDetail = null
      this.registrationForm = { examId: null, termCode: null }
      this.registerSubjects = []
      this.selectedSubjects = []
      this.fetchCanRegisterStudents()
      this.fetchExamsForModal()
    },
    close() {
      this.dialog = false
    },
    formatMoney(val) {
      if (!val) return 0
      return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    },
    async fetchCanRegisterStudents(search = '') {
      this.studentLoading = true
      try {
        const res = await registerService.getCanRegisterStudents({
          pageIndex: 1,
          pageSize: 20,
          search,
          channel: 'CMS'
        })
        const payload = res.data || res
        this.studentList = payload.items || payload.data || []
      } catch (error) {
        console.error('Lỗi tải danh sách sinh viên:', error)
      } finally {
        this.studentLoading = false
      }
    },
    async onSelectStudent(student) {
      if (!student) {
        this.studentDetail = null
        return
      }
      // Hứng chính xác mọi trường hợp tên biến chứa ID từ backend trả về
      const studentId = student.id || student.studentId || student.sId
      if (!studentId) {
        console.error('Không tìm thấy ID của sinh viên được chọn:', student)
        return
      }

      try {
        const [detailRes, termRes] = await Promise.all([
          registerService.getStudentDetail(studentId, 'CMS'),
          registerService.getTermList({ status: 'ACTIVE', channel: 'CMS' })
        ])
        this.studentDetail = detailRes.data || detailRes
        this.termList = termRes.data || termRes || []
      } catch (error) {
        console.error('Lỗi lấy chi tiết sinh viên:', error)
      }
    },
    async fetchExamsForModal() {
      try {
        const res = await registerService.getExams({ status: 'ACTIVE', channel: 'CMS' })
        this.examList = res.data || res || []
      } catch (error) {
        console.error('Lỗi tải đợt bảo vệ:', error)
      }
    },
    async handleExamOrTermChange() {
      if (!this.registrationForm.examId || !this.studentDetail || !this.registrationForm.termCode) return
      try {
        // 1. Gọi API lấy danh sách học phần đăng ký
        const res = await registerService.listForRegister({
          code: this.studentDetail.studentCode,
          examId: this.registrationForm.examId,
          termCode: this.registrationForm.termCode,
          channel: 'CMS'
        })
        const items = res.data || res || []
        this.registerSubjects = items.map((i, idx) => ({ ...i, index: idx + 1 }))

        // 2. Gọi API ước tính học phí đúng chuẩn tham số
        if (this.studentDetail.major && this.studentDetail.trainingMethod) {
          await registerService.estimateFee({
            majorId: this.studentDetail.major.id,
            semesterId: this.studentDetail.semesterId || this.registrationForm.examId,
            trainingMethodId: this.studentDetail.trainingMethod.id,
            channel: 'CMS'
          })
        }
      } catch (error) {
        console.error('Lỗi tải danh sách hoặc ước tính phí:', error)
      }
    },
    async save() {
      if (this.selectedSubjects.length === 0) return
      this.submitting = true
      try {
        const data = {
          studentId: this.studentDetail.id,
          examId: this.registrationForm.examId,
          termCodes: this.selectedSubjects.map(i => i.code || i.termCode),
          channel: 'CMS'
        }
        await registerService.createRegistration(data, 'CMS')
        this.$emit('success')
        this.close()
      } catch (error) {
        console.error('Lỗi lưu đăng ký:', error)
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>