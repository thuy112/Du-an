<template>
  <v-dialog v-model="dialog" max-width="750px" persistent>
    <v-card class="rounded-lg overflow-hidden">
      <!-- TIÊU ĐỀ MODAL -->
      <div class="px-6 py-4 text-white font-weight-bold d-flex justify-space-between align-items-center" style="background-color: #A62229; font-size: 18px;">
        <span>Đăng ký thi lại</span>
        <v-btn icon dark @click="closeModal"><v-icon>mdi-close</v-icon></v-btn>
      </div>

      <v-card-text class="pa-6" style="max-height: 75vh; overflow-y: auto;">
        <!-- BƯỚC 1: THÔNG TIN CÁ NHÂN -->
        <div class="d-flex align-center mb-3 cursor-pointer" @click="handleStep1Click">
          <v-avatar :color="'#A62229'" size="24" class="white--text font-weight-bold mr-2 text-caption">
            <v-icon v-if="step2Active" small dark>mdi-check</v-icon>
            <span v-else>1</span>
          </v-avatar>
          <span class="font-weight-bold text-subtitle-1 text-dark">Thông tin cá nhân</span>
        </div>

        <!-- Nội dung Bước 1: CHỈ HIỆN KHI CHƯA BẤM TIẾP TỤC (step2Active === false) -->
        <div v-if="!step2Active" class="mb-4 pl-7">
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
              <span>{{ item.code }} - {{ item.fullName }}</span>
            </template>

            <template v-slot:append-item>
              <div v-if="hasNextPage" v-intersect="loadMoreStudents" class="text-center py-2 grey--text text-caption">
                Đang tải thêm sinh viên...
              </div>
            </template>
          </v-autocomplete>

          <!-- Hiển thị chi tiết thông tin cá nhân khi đã chọn sinh viên -->
          <template v-if="selectedStudent">
            <div class="pa-4 rounded bg-grey-lighten-4 border mt-3">
              <div class="font-weight-bold mb-2" style="color: #A62229; font-size: 15px;">Thông tin cá nhân</div>
              <div class="d-flex flex-column text-body-2" style="gap: 6px;">
                <div><strong>Họ tên:</strong> {{ selectedStudent.fullName || '---' }}</div>
                <div><strong>Mã SV:</strong> {{ selectedStudent.code || '---' }}</div>
                <div><strong>Ngày sinh:</strong> {{ selectedStudent.birthday || '---' }}</div>
                <div><strong>Giới tính:</strong> {{ formatGender(selectedStudent.gender) }}</div>
                <div><strong>Email trường:</strong> {{ selectedStudent.email || '---' }}</div>
                <div><strong>Khóa:</strong> {{ parseObjectValue(selectedStudent.course) }}</div>
                <div><strong>Lớp:</strong> {{ selectedStudent.className || selectedStudent.classes?.name || '---' }}</div>
                <div><strong>Ngành:</strong> {{ parseObjectValue(selectedStudent.major || selectedStudent.majorName) }}</div>
                <div><strong>Loại hình đào tạo:</strong> {{ selectedStudent.trainingMethodName || parseObjectValue(selectedStudent.degreeType || selectedStudent.trainingType) }}</div>
              </div>
            </div>

            <!-- Nút Tiếp tục -->
            <div class="d-flex justify-end mt-3">
              <v-btn color="#A2212B" dark depressed class="text-none px-6" height="36" @click="handleContinue">
                Tiếp tục
              </v-btn>
            </div>
          </template>
        </div>

        <v-divider class="my-4"></v-divider>

        <!-- BƯỚC 2: THÔNG TIN ĐĂNG KÝ -->
        <div class="d-flex align-center mb-3">
          <v-avatar :color="step2Active ? '#A62229' : 'grey'" size="24" class="white--text font-weight-bold mr-2 text-caption">2</v-avatar>
          <span class="font-weight-bold text-subtitle-1" :class="step2Active ? 'text-dark' : 'grey--text'">Thông tin đăng ký</span>
        </div>

        <!-- Nội dung Bước 2: CHỈ HIỆN KHI ĐÃ BẤM TIẾP TỤC (step2Active === true) -->
        <div v-if="step2Active" class="pl-7">
          <div class="text-center font-weight-medium mb-2 grey--text text--darken-1" style="font-size: 13px;">
            Nhập kỳ thi lại
          </div>
          <div class="mb-3">
            <v-select
              v-model="form.examId"
              :items="examOptions"
              :loading="loadingExams"
              item-text="text"
              item-value="value"
              placeholder="Kỳ thi lại"
              outlined
              dense
              hide-details
              class="mb-3"
              @change="handleExamChange"
            ></v-select>
          </div>

          <!-- Danh sách học phần -->
          <div class="mt-4">
            <div class="font-weight-bold mb-2">Danh sách học phần ({{ form.selectedTerms.length }})</div>
            
            <v-data-table
              v-model="form.selectedTerms"
              :headers="termHeaders"
              :items="termList"
              :loading="loadingTerms"
              show-select
              item-key="id"
              hide-default-footer
              class="elevation-1 rounded border"
              no-data-text="Không có dữ liệu"
            >
              <template #[`item.stt`]="{ index }">
                <span>{{ index + 1 }}</span>
              </template>
              <template #[`item.totalPrice`]="{ item }">
                <span>{{ (item.totalPrice || item.price || 0).toLocaleString() }} đ</span>
              </template>
            </v-data-table>

            <div class="text-right font-weight-bold mt-3 text-subtitle-1" style="color: #A62229;">
              Tổng tiền: {{ calculateTotalAmount.toLocaleString() }} VNĐ
            </div>
          </div>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <!-- FOOTER ACTIONS (NÚT LƯU LUÔN HIỆN, MÀU XÁM KHI CHƯA CHỌN, MÀU ĐỎ KHI ĐÃ CHỌN HỌC PHẦN) -->
      <v-card-actions class="pa-4 justify-end" style="gap: 8px;">
        <v-btn text class="text-none px-4" @click="closeModal">Đóng</v-btn>
        
        <v-btn 
          :color="isSaveDisabled ? '#e0e0e0' : '#A2212B'" 
          :dark="!isSaveDisabled" 
          depressed 
          class="text-none px-6" 
          :style="{ color: isSaveDisabled ? '#9e9e9e !important' : '#ffffff !important' }"
          :disabled="isSaveDisabled || submitting"
          :loading="submitting"
          @click="handleSave"
        >
          <v-icon left small v-if="!submitting">mdi-content-save</v-icon>
          Lưu
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Api from '~/api/Api'

export default {
  name: 'RegisterAddModal',
  props: {
    value: { type: Boolean, default: false }
  },
  data() {
    return {
      dialog: this.value,
      loadingStudents: false,
      loadingExams: false,
      loadingTerms: false,
      submitting: false,
      step2Active: false,

      studentOptions: [],
      searchStudentText: '',
      selectedStudent: null,
      pageIndex: 1,
      pageSize: 10,
      totalPages: 1,
      hasNextPage: true,

      examOptions: [],
      majorId: null,

      form: {
        examId: null,
        selectedTerms: []
      },

      termList: [],
      termHeaders: [
        { value: 'stt', text: 'STT', align: 'center', width: '60px', sortable: false },
        { value: 'code', text: 'Mã học phần', align: 'left', sortable: false },
        { value: 'name', text: 'Tên học phần', align: 'left', sortable: false },
        { value: 'credit', text: 'Số tín chỉ học phí', align: 'center', sortable: false },
        { value: 'totalPrice', text: 'Thành tiền', align: 'right', sortable: false },
      ]
    }
  },
  computed: {
    calculateTotalAmount() {
      return this.form.selectedTerms.reduce((sum, item) => sum + (item.totalPrice || item.price || 0), 0)
    },
    // Điều kiện active nút Lưu: Phải ở Bước 2 và có ít nhất 1 học phần được chọn
    isSaveDisabled() {
      return !this.step2Active || this.form.selectedTerms.length === 0
    }
  },
  watch: {
    value(val) {
      this.dialog = val
      if (val) {
        this.resetForm()
        this.fetchCanRegisterStudents('', true)
      }
    },
    dialog(val) {
      this.$emit('input', val)
    },
    searchStudentText(val) {
      if (val !== null && !this.step2Active) {
        this.pageIndex = 1
        this.fetchCanRegisterStudents(val, true)
      }
    }
  },
  methods: {
    resetForm() {
      this.selectedStudent = null
      this.step2Active = false
      this.pageIndex = 1
      this.form = {
        examId: null,
        selectedTerms: []
      }
      this.termList = []
      this.examOptions = []
      this.majorId = null
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
        return val.name || val.code || val.title || JSON.stringify(val)
      }
      return val
    },

    async fetchCanRegisterStudents(searchQuery = '', isReset = false) {
      if (this.loadingStudents) return
      this.loadingStudents = true
      try {
        const res = await Api.get('/api/student/canRegister', {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize,
          search: searchQuery,
          channel: 'CMS'
        })
        const data = res?.data !== undefined ? res.data : res
        const list = Array.isArray(data) ? data : (data.data || data.content || [])
        
        const totalRecords = data.totalRecords || data.totalElements || list.length
        this.totalPages = Math.ceil(totalRecords / this.pageSize) || 1

        if (isReset) {
          this.studentOptions = list
        } else {
          this.studentOptions = [...this.studentOptions, ...list]
        }

        this.hasNextPage = this.pageIndex < this.totalPages
      } catch (error) {
        console.error('Lỗi tải danh sách sinh viên:', error)
      } finally {
        this.loadingStudents = false
      }
    },

    loadMoreStudents() {
      if (this.hasNextPage && !this.loadingStudents) {
        this.pageIndex++
        this.fetchCanRegisterStudents(this.searchStudentText || '', false)
      }
    },

    handleStudentSelect() {
      if (this.selectedStudent) {
        this.majorId = typeof this.selectedStudent.major === 'object' ? this.selectedStudent.major.id : (this.selectedStudent.majorId || this.selectedStudent.major)
      }
    },

    // Cho phép bấm lại Bước 1 để quay lại chọn sinh viên khác
    handleStep1Click() {
      if (this.step2Active) {
        this.step2Active = false
        this.form.examId = null
        this.form.selectedTerms = []
        this.termList = []
      }
    },

    // Bấm nút "Tiếp tục" -> ẨN hoàn toàn Bước 1, HIỆN Bước 2 và tải Kỳ thi
    async handleContinue() {
      if (!this.selectedStudent) return
      this.step2Active = true
      await this.fetchActiveExams()
    },

    async fetchActiveExams() {
      this.loadingExams = true
      try {
        const res = await Api.get('/api/exam/list1', { status: 'ACTIVE', channel: 'CMS' })
        const data = res?.data !== undefined ? res.data : res
        const list = Array.isArray(data) ? data : (data.data || data.content || [])
        this.examOptions = list.map(item => ({ text: item.name || item.code, value: item.id }))
      } catch (error) {
        console.error('Lỗi tải kỳ thi:', error)
      } finally {
        this.loadingExams = false
      }
    },

    async handleExamChange() {
      if (!this.form.examId || !this.selectedStudent) return

      this.loadingTerms = true
      try {
        const termRes = await Api.get('/api/term/listForRegister', {
          code: this.selectedStudent.code,
          examId: this.form.examId,
          channel: 'CMS'
        })

        if (termRes) {
          const termData = termRes?.data !== undefined ? termRes.data : termRes
          this.termList = Array.isArray(termData) ? termData : (termData.data || termData.content || [])
        } else {
          this.termList = []
        }
      } catch (error) {
        console.error('Lỗi lấy danh sách học phần:', error)
        this.termList = []
      } finally {
        this.loadingTerms = false
      }
    },

    async handleSave() {
      if (this.isSaveDisabled) return

      this.submitting = true
      try {
        const payload = {
          studentId: this.selectedStudent.id,
          studentCode: this.selectedStudent.code,
          examId: this.form.examId,
          terms: this.form.selectedTerms
        }

        await Api.post('/api/register', payload, { params: { channel: 'CMS' } })

        this.$emit('success')
        this.closeModal()
      } catch (error) {
        console.error('Lỗi lưu đăng ký:', error)
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
.cursor-pointer {
  cursor: pointer;
}
</style>