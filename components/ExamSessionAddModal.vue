<template>
  <v-dialog v-model="dialog" max-width="700px" persistent>
    <v-card class="rounded-lg overflow-hidden">
      <!-- TIÊU ĐỀ MODAL -->
      <div class="px-6 py-4 text-white font-weight-bold d-flex justify-space-between align-items-center" style="background-color: #A62229; font-size: 16px;">
        <span>Thêm mới lớp thi</span>
        <v-btn icon dark @click="closeDialog"><v-icon>mdi-close</v-icon></v-btn>
      </div>

      <!-- NỘI DUNG FORM -->
      <v-card-text class="pa-6" style="max-height: 75vh; overflow-y: auto;">
        <!-- Lớp thi (*) -->
        <div class="mb-4">
          <label class="d-block mb-1 font-weight-medium text-body-2" style="color: #333;">Lớp thi (<span style="color: #d32f2f;">*</span>)</label>
          <v-text-field
            v-model="form.className"
            placeholder="Nhập tên lớp thi"
            outlined
            dense
            hide-details
            class="custom-input"
          ></v-text-field>
        </div>

        <!-- Học kỳ (*) -->
        <div class="mb-4">
          <label class="d-block mb-1 font-weight-medium text-body-2" style="color: #333;">Học kỳ (<span style="color: #d32f2f;">*</span>)</label>
          <v-select
            v-model="form.semesterId"
            :items="semesterOptions"
            item-text="text"
            item-value="value"
            placeholder="Chọn học kỳ"
            outlined
            dense
            hide-details
            clearable
            class="custom-input"
          ></v-select>
        </div>

        <!-- Kỳ thi (*) -->
        <div class="mb-4">
          <label class="d-block mb-1 font-weight-medium text-body-2" style="color: #333;">Kỳ thi (<span style="color: #d32f2f;">*</span>)</label>
          <v-select
            v-model="form.examId"
            :items="examOptions"
            item-text="text"
            item-value="value"
            placeholder="Chọn kỳ thi"
            outlined
            dense
            hide-details
            clearable
            class="custom-input"
          ></v-select>
        </div>

        <!-- Học phần (*) -->
        <div class="mb-4">
          <label class="d-block mb-1 font-weight-medium text-body-2" style="color: #333;">Học phần (<span style="color: #d32f2f;">*</span>)</label>
          <v-select
            v-model="form.termId"
            :items="termOptions"
            item-text="text"
            item-value="value"
            placeholder="Chọn học phần"
            outlined
            dense
            hide-details
            clearable
            class="custom-input"
          ></v-select>
        </div>

        <!-- Thời gian bắt đầu -->
        <div class="mb-4">
          <label class="d-block mb-1 font-weight-medium text-body-2" style="color: #333;">Thời gian bắt đầu</label>
          <v-menu
            v-model="menuStartTime"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            top
            attach
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                :value="form.startTime"
                placeholder="DD/MM/YYYY HH:mm:ss"
                readonly
                outlined
                dense
                hide-details
                clearable
                class="custom-input"
                v-bind="attrs"
                v-on="on"
                @click:clear="clearStartTime"
              ></v-text-field>
            </template>
            <v-card class="rounded-lg">
              <v-date-picker
                v-if="pickerStartMode === 'date'"
                v-model="pickerStartDate"
                color="#A62229"
                locale="vi"
                no-title
                scrollable
                @input="handleStartDateInput"
              ></v-date-picker>
              <v-time-picker
                v-else
                v-model="rawStartTime"
                color="#A62229"
                no-title
                scrollable
                format="24hr"
                @change="handleStartTimeChange"
              ></v-time-picker>
            </v-card>
          </v-menu>
        </div>

        <!-- Thời gian kết thúc -->
        <div class="mb-2">
          <label class="d-block mb-1 font-weight-medium text-body-2" style="color: #333;">Thời gian kết thúc</label>
          <v-menu
            v-model="menuEndTime"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            top
            attach
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                :value="form.endTime"
                placeholder="DD/MM/YYYY HH:mm:ss"
                readonly
                outlined
                dense
                hide-details
                clearable
                class="custom-input"
                v-bind="attrs"
                v-on="on"
                @click:clear="clearEndTime"
              ></v-text-field>
            </template>
            <v-card class="rounded-lg">
              <v-date-picker
                v-if="pickerEndMode === 'date'"
                v-model="pickerEndDate"
                :min="minimumEndDate"
                color="#A62229"
                locale="vi"
                no-title
                scrollable
                @input="handleEndDateInput"
              ></v-date-picker>
              <v-time-picker
                v-else
                v-model="rawEndTime"
                color="#A62229"
                no-title
                scrollable
                format="24hr"
                @change="handleEndTimeChange"
              ></v-time-picker>
            </v-card>
          </v-menu>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <!-- NÚT THAO TÁC DƯỚI CÙNG -->
      <v-card-actions class="pa-4 justify-end" style="gap: 8px;">
        <v-btn text class="text-none px-4" @click="closeDialog">
          Đóng
        </v-btn>
        <v-btn 
          color="#A62229" 
          dark 
          depressed 
          class="text-none px-6" 
          :loading="submitting"
          @click="submitForm"
        >
          Lưu <v-icon right small>mdi-content-save</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import examSessionService from '~/services/examSessionService'

export default {
  name: 'ExamSessionAddModal',
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialog: this.value,
      submitting: false,

      menuStartTime: false,
      menuEndTime: false,
      pickerStartMode: 'date',
      pickerStartDate: '',
      rawStartDate: '',
      rawStartTime: '00:00',
      startDateSelected: false,
      startTimeSelected: false,

      pickerEndMode: 'date',
      pickerEndDate: '',
      rawEndDate: '',
      rawEndTime: '00:00',

      form: {
        className: '',
        semesterId: null,
        examId: null,
        termId: null,
        startTime: '',
        endTime: '',
      },

      semesterOptions: [],
      examOptions: [],
      termOptions: [],
    }
  },
  computed: {
    minimumEndDate() {
      if (!this.startDateSelected || !this.rawStartDate) return undefined
      return this.addOneDay(this.rawStartDate)
    },
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
    }
  },
  methods: {
    async fetchCatalogs() {
      try {
        const [semesterRes, examRes, termRes] = await Promise.all([
          examSessionService.getSemesters ? examSessionService.getSemesters().catch(() => []) : [],
          examSessionService.getExams().catch(() => []),
          examSessionService.getTerms().catch(() => []),
        ])

        const formatList = (res) => {
          const list = Array.isArray(res) ? res : (res?.data || res?.content || [])
          return list.map(item => ({ text: item.name || item.code, value: item.id }))
        }

        this.semesterOptions = formatList(semesterRes)
        this.examOptions = formatList(examRes)
        this.termOptions = formatList(termRes)
      } catch (error) {
        console.error('Lỗi tải danh mục:', error)
      }
    },

    resetForm() {
      this.form = {
        className: '',
        semesterId: null,
        examId: null,
        termId: null,
        startTime: '',
        endTime: '',
      }
      const now = new Date()
      const yyyy = now.getFullYear()
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      const todayStr = `${yyyy}-${mm}-${dd}`

      this.rawStartDate = todayStr
      this.pickerStartDate = todayStr
      this.rawStartTime = '00:00'
      this.startDateSelected = false
      this.startTimeSelected = false
      this.rawEndDate = todayStr
      this.pickerEndDate = todayStr
      this.rawEndTime = '00:00'
      this.tabStart = 0
      this.tabEnd = 0
    },

    handleStartDateInput(val) {
      if (!val) return
      this.rawStartDate = val
      this.startDateSelected = true
      this.pickerStartMode = 'time'
      this.clearEndIfNotAfterStart()
    },

    handleStartTimeChange(val) {
      if (!val || !this.rawStartDate) return
      this.rawStartTime = val
      this.startTimeSelected = true
      const [yyyy, mm, dd] = this.rawStartDate.split('-')
      this.form.startTime = `${dd}/${mm}/${yyyy} ${val.length === 5 ? `${val}:00` : val}`
      this.menuStartTime = false
      this.pickerStartMode = 'date'
      this.clearEndIfNotAfterStart()
    },

    handleEndDateInput(val) {
      if (!val) return
      if (this.startDateSelected && val < this.minimumEndDate) return
      this.rawEndDate = val
      this.rawEndTime = '00:00'
      this.pickerEndMode = 'time'
    },

    handleEndTimeChange(val) {
      if (!val || !this.rawEndDate) return
      this.rawEndTime = val
      const [yyyy, mm, dd] = this.rawEndDate.split('-')
      this.form.endTime = `${dd}/${mm}/${yyyy} ${val.length === 5 ? `${val}:00` : val}`
      this.menuEndTime = false
      this.pickerEndMode = 'date'
    },

    addOneDay(date) {
      const [year, month, day] = date.split('-').map(Number)
      const nextDay = new Date(year, month - 1, day + 1)
      return `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`
    },

    isAfterStartDate(endDate) {
      return endDate > this.rawStartDate
    },

    clearEndIfNotAfterStart() {
      if (!this.startDateSelected) return
      if (!this.form.endTime || !this.rawEndDate) {
        if (this.rawEndDate < this.minimumEndDate) {
          this.rawEndDate = this.minimumEndDate
          this.pickerEndDate = this.minimumEndDate
        }
        return
      }
      if (this.isAfterStartDate(this.rawEndDate)) return

      this.form.endTime = ''
      this.rawEndDate = this.minimumEndDate
      this.rawEndTime = '00:00'
      this.pickerEndDate = this.rawEndDate
      this.pickerEndMode = 'date'
      if (typeof this.$showError === 'function') {
        this.$showError('Thời gian kết thúc cũ không còn hợp lệ. Vui lòng chọn lại!')
      }
    },

    clearStartTime() {
      this.form.startTime = ''
      this.startDateSelected = false
      this.startTimeSelected = false
    },

    clearEndTime() {
      this.form.endTime = ''
      this.rawEndDate = ''
      this.rawEndTime = '00:00'
    },

    closeDialog() {
      this.dialog = false
    },

    async submitForm() {
      if (this.startDateSelected && this.form.endTime && !this.isAfterStartDate(this.rawEndDate)) {
        if (typeof this.$showError === 'function') {
          this.$showError('Ngày kết thúc phải sau ngày bắt đầu!')
        }
        return
      }

      this.submitting = true
      try {
        await examSessionService.createExamSession(this.form)
        this.$emit('success', 'Thêm mới lớp thi thành công')
        this.closeDialog()
      } catch (error) {
        console.error('Lỗi khi thêm mới lớp thi:', error)
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.custom-input >>> .v-input__slot {
  border-radius: 6px !important;
  min-height: 40px !important;
}

</style>