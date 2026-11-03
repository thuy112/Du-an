<template>
  <v-dialog v-model="dialog" max-width="650px" persistent scrollable>
    <v-card class="rounded-lg">
      <!-- Tiêu đề Modal thay đổi linh hoạt theo chế độ -->
      <v-card-title class="pa-4 text-white" style="background-color: #A62229; color: white;">
        <span class="text-h6 font-weight-bold">{{ isEditMode ? 'Cập nhật khóa học' : 'Thêm mới khóa học' }}</span>
        <v-spacer></v-spacer>
        <v-btn icon dark @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-5 modal-body-scroll" style="position: relative;">
        <!-- Hiển thị loading khi đang gọi API lấy chi tiết -->
        <div v-if="loadingDetail" class="d-flex justify-center align-center py-5">
          <v-progress-circular indeterminate color="#A62229"></v-progress-circular>
        </div>

        <v-form v-else ref="form" v-model="valid" lazy-validation>
          <!-- Tên khóa học -->
          <v-text-field
            v-model="form.name"
            label="Tên khóa học (*)"
            placeholder="Nhập tên khóa học"
            outlined
            dense
            :rules="[v => !!v || 'Tên khóa học không được để trống']"
            class="mb-3"
          ></v-text-field>

          <!-- Mã khóa học -->
          <v-text-field
            v-model="form.code"
            label="Mã khóa học (*)"
            placeholder="Nhập mã khóa học"
            outlined
            dense
            :rules="[v => !!v || 'Mã khóa học không được để trống']"
            class="mb-3"
          ></v-text-field>

          <div class="subtitle-2 font-weight-medium mb-2">Thời gian khóa học</div>
          <v-row class="mb-1" dense>
            <v-col cols="12" sm="6">
              <v-menu
                v-model="menuFromDate"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    :value="formatDisplayDate(form.fromTime)"
                    label="Từ ngày"
                    readonly
                    outlined
                    dense
                    clearable
                    v-bind="attrs"
                    v-on="on"
                    @click:clear="form.fromTime = ''"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="form.fromTime"
                  :max="form.toTime || undefined"
                  color="#A62229"
                  locale="vi"
                  @input="menuFromDate = false"
                ></v-date-picker>
              </v-menu>
            </v-col>

            <v-col cols="12" sm="6">
              <v-menu
                v-model="menuToDate"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    :value="formatDisplayDate(form.toTime)"
                    label="Đến ngày"
                    readonly
                    outlined
                    dense
                    clearable
                    v-bind="attrs"
                    v-on="on"
                    @click:clear="form.toTime = ''"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="form.toTime"
                  :min="form.fromTime || undefined"
                  color="#A62229"
                  locale="vi"
                  @input="menuToDate = false"
                ></v-date-picker>
              </v-menu>
            </v-col>
          </v-row>

          <!-- Năm tuyển sinh -->
          <v-text-field
            v-model="form.enrollmentYear"
            label="Năm tuyển sinh"
            placeholder="Ví dụ: 2026"
            outlined
            dense
            class="mb-3"
          ></v-text-field>

          <!-- Trạng thái -->
          <v-select
            v-model="form.status"
            :items="statusList"
            item-text="text"
            item-value="value"
            label="Trạng thái (*)"
            outlined
            dense
          ></v-select>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Footer Modal -->
      <v-card-actions class="pa-3">
        <v-spacer></v-spacer>
        <v-btn outlined color="grey darken-1" class="text-none px-4" @click="closeDialog" :disabled="loading">
          Đóng <v-icon right small>mdi-close</v-icon>
        </v-btn>
        <v-btn color="#A62229" dark class="text-none px-5" @click="handleSave" :loading="loading">
          Lưu <v-icon right small>mdi-content-save</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import courseService from '~/services/courseService'

export default {
  name: 'CourseModal',
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    editId: {
      type: [Number, String],
      default: null,
    },
    course: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      dialog: this.value,
      valid: false,
      loading: false,
      loadingDetail: false,
      menuFromDate: false,
      menuToDate: false,
      form: {
        name: '',
        code: '',
        fromTime: '',
        toTime: '',
        enrollmentYear: '',
        status: 'ACTIVE',
      },
      statusList: [
        { text: 'Kích hoạt', value: 'ACTIVE' },
        { text: 'Chưa kích hoạt', value: 'INACTIVE' },
      ],
    }
  },
  computed: {
    isEditMode() {
      return !!this.editId
    },
    dateRangeInvalid() {
      return Boolean(this.form.fromTime && this.form.toTime && this.form.fromTime > this.form.toTime)
    },
  },
  watch: {
    value(val) {
      this.dialog = val
      if (val) {
        if (this.editId) {
          this.fetchDetail(this.editId)
        } else {
          this.resetForm()
        }
      }
    },
    dialog(val) {
      this.$emit('input', val)
    },
  },
  methods: {
    resetForm() {
      this.form = {
        name: '',
        code: '',
        fromTime: '',
        toTime: '',
        enrollmentYear: '',
        status: 'ACTIVE',
      }
      if (this.$refs.form) {
        this.$refs.form.resetValidation()
      }
    },
    closeDialog() {
      this.dialog = false
    },
    formatDisplayDate(dateStr, fallbackYear) {
      if (!dateStr) return ''
      const pickerDate = this.formatPickerDate(dateStr, fallbackYear)
      if (!pickerDate) return ''
      const [year, month, day] = pickerDate.split('-')
      return `${day}/${month}/${year}`
    },
    formatPickerDate(dateStr, fallbackYear) {
      if (!dateStr) return ''
      const date = String(dateStr).trim().split(/[ T]/)[0]
      const isoMatch = date.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
      const localMatch = date.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
      const match = isoMatch || localMatch
      if (!match) return ''

      let year = Number(isoMatch ? match[1] : match[3])
      const month = Number(match[2])
      const day = Number(isoMatch ? match[3] : match[1])
      const yearFallback = Number(fallbackYear)
      if (year < 1000 && yearFallback >= 1000 && yearFallback <= 9999) {
        year = yearFallback
      }

      const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
      if (month < 1 || month > 12 || day < 1 || day > daysInMonth) return ''

      return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    },
    formatApiDateTime(dateStr, isEndOfDay = false) {
      if (!dateStr) return null
      const [year, month, day] = dateStr.split(/[ T]/)[0].split('-')
      if (!year || !month || !day) return null
      return `${year}-${month}-${day}T${isEndOfDay ? '23:59:59' : '00:00:00'}`
    },
    setFormFromCourse(primary = {}, fallback = {}) {
      const enrollmentYear = primary.enrollmentYear || fallback.enrollmentYear || ''
      const primaryFromTime = primary.fromTime || ''
      const primaryToTime = primary.toTime || ''
      const parsedPrimaryFromTime = this.formatPickerDate(primaryFromTime, enrollmentYear)
      const parsedPrimaryToTime = this.formatPickerDate(primaryToTime, enrollmentYear)
      const fallbackFromTime = this.formatPickerDate(fallback.fromTime, enrollmentYear)
      const fallbackToTime = this.formatPickerDate(fallback.toTime, enrollmentYear)
      const fromPickerValue = parsedPrimaryFromTime || fallbackFromTime
      const toPickerValue = parsedPrimaryToTime || fallbackToTime

      this.form = {
        name: primary.name || fallback.name || '',
        code: primary.code || fallback.code || '',
        fromTime: fromPickerValue,
        toTime: toPickerValue,
        enrollmentYear,
        status: primary.status || fallback.status || 'ACTIVE',
      }
    },
    async fetchDetail(id) {
      this.loadingDetail = true
      const course = this.course || {}
      this.setFormFromCourse(course)
      try {
        const res = await courseService.getDetail(id)
        let data = res.data !== undefined ? res.data : res
        if (data && data.data && typeof data.data === 'object' && !data.fromTime && !data.toTime) {
          data = data.data
        }
        if (data) {
          this.setFormFromCourse(data, course)
        }
      } catch (error) {
        console.error('Lỗi khi tải chi tiết khóa học:', error)
      } finally {
        this.loadingDetail = false
      }
    },
    async handleSave() {
      if (this.dateRangeInvalid || !this.$refs.form.validate()) return

      this.loading = true
      try {
        const payload = {
          name: this.form.name,
          code: this.form.code,
          fromTime: this.formatApiDateTime(this.form.fromTime),
          toTime: this.formatApiDateTime(this.form.toTime, true),
          enrollmentYear: this.form.enrollmentYear,
          status: this.form.status,
          channel: 'CMS',
        }

        let res
        if (this.isEditMode) {
          res = await courseService.update(this.editId, payload)
        } else {
          res = await courseService.add(payload)
        }

        const responseData = res.data !== undefined ? res.data : res
        if (responseData && responseData.code !== undefined && responseData.code !== 0) {
          this.loading = false
          return
        }

        const successMessage = this.isEditMode ? 'Cập nhật khóa học thành công' : 'Thêm mới khóa học thành công'
        this.$emit('success', successMessage)
        this.closeDialog()
      } catch (error) {
        console.error('Lỗi khi lưu khóa học:', error)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.modal-body-scroll {
  max-height: 70vh;
  overflow-y: auto;
}
</style>