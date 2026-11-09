<template>
  <v-dialog v-model="dialog" max-width="650px" persistent scrollable>
    <v-card class="rounded-lg">
      <v-card-title class="pa-4 text-white" style="background-color: #A62229; color: white;">
        <span class="text-h6 font-weight-bold">
          {{ isViewOnly ? 'Chi tiết đợt bảo vệ lại' : 'Cập nhật đợt bảo vệ lại' }}
        </span>
        <v-spacer></v-spacer>
        <v-btn icon dark @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-5 modal-body-scroll" style="position: relative;">
        <div v-if="loadingDetail" class="d-flex justify-center align-center py-5">
          <v-progress-circular indeterminate color="#A62229"></v-progress-circular>
        </div>

        <v-form v-else ref="form" v-model="valid" lazy-validation>
          <!-- Tên đợt -->
          <v-text-field
            v-model="form.name"
            label="Tên đợt đăng ký bảo vệ lại (*)"
            outlined
            dense
            :readonly="isViewOnly"
            :rules="[v => !!v || 'Tên đợt không được để trống']"
            class="mb-3"
          ></v-text-field>

          <!-- Mã đợt -->
          <v-text-field
            v-model="form.code"
            label="Mã đợt đăng ký bảo vệ lại (*)"
            outlined
            dense
            :readonly="isViewOnly"
            :rules="[v => !!v || 'Mã đợt không được để trống']"
            class="mb-3"
          ></v-text-field>

          <!-- Học kỳ -->
          <v-select
            v-if="!isViewOnly"
            v-model="form.semesterId"
            :items="semesterList"
            item-text="name"
            item-value="id"
            label="Học kỳ (*)"
            outlined
            dense
            :rules="[v => v !== null && v !== undefined && v !== '' || 'Học kỳ không được để trống']"
            class="mb-3"
          ></v-select>
          <v-text-field
            v-else
            :value="form.semesterName"
            label="Học kỳ"
            outlined
            dense
            readonly
            class="mb-3"
          ></v-text-field>

          <div class="subtitle-2 font-weight-medium mb-2">Thời gian đăng ký</div>
          <v-row class="mb-1" dense>
            <v-col cols="12" sm="6">
              <v-menu
                v-if="!isViewOnly"
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
              <v-text-field
                v-else
                :value="formatDisplayDate(form.fromTime)"
                label="Từ ngày"
                readonly
                outlined
                dense
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <v-menu
                v-if="!isViewOnly"
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
              <v-text-field
                v-else
                :value="formatDisplayDate(form.toTime)"
                label="Đến ngày"
                readonly
                outlined
                dense
              ></v-text-field>
            </v-col>
          </v-row>

          <!-- Trạng thái -->
          <v-select
            v-model="form.status"
            :items="statusList"
            item-text="text"
            item-value="value"
            label="Trạng thái (*)"
            outlined
            dense
            :readonly="isViewOnly"
            :disabled="isViewOnly"
          ></v-select>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-3">
        <v-spacer></v-spacer>
        <v-btn outlined color="grey darken-1" class="text-none px-4" @click="closeDialog">
          {{ isViewOnly ? 'Đóng' : 'Hủy' }} <v-icon right small>mdi-close</v-icon>
        </v-btn>
        <v-btn v-if="!isViewOnly" color="#A62229" dark class="text-none px-5" @click="handleSave" :loading="loading">
          Lưu <v-icon right small>mdi-content-save</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import redefenseExamService from '~/services/redefenseExamService'

export default {
  name: 'RedefenseModal',
  props: {
    value: { type: Boolean, default: false },
    editId: { type: [Number, String], default: null },
    isViewOnly: { type: Boolean, default: false },
  },
  data() {
    return {
      dialog: this.value,
      valid: false,
      loading: false,
      loadingDetail: false,
      menuFromDate: false,
      menuToDate: false,
      semesterList: [],
      form: {
        name: '',
        code: '',
        semesterId: null,
        semesterName: '',
        fromTime: '',
        toTime: '',
        status: 'ACTIVE',
      },
      statusList: [
        { text: 'Kích hoạt', value: 'ACTIVE' },
        { text: 'Chưa kích hoạt', value: 'INACTIVE' },
      ],
    }
  },
  watch: {
    value(val) {
      this.dialog = val
      if (val) {
        this.fetchSemesters()
        if (this.editId) {
          this.fetchDetail(this.editId)
        }
      }
    },
    dialog(val) {
      this.$emit('input', val)
    },
  },
  methods: {
    closeDialog() {
      this.dialog = false
    },
    async fetchSemesters() {
      try {
        const res = await redefenseExamService.getSemesters({ status: 'ACTIVE', channel: 'CMS' })
        if (res) {
          const rootData = res.data !== undefined ? res.data : res
          const list = Array.isArray(rootData) ? rootData : (rootData.data || rootData.content || rootData.items || [])
          this.semesterList = list.map(item => ({
            ...item,
            id: item.id ?? item.semesterId ?? item.semester?.id ?? null,
            name: item.name || item.code,
          }))
        }
      } catch (error) {
        console.error('Lỗi tải danh sách học kỳ:', error)
      }
    },
    formatPickerDate(dateStr) {
      if (!dateStr) return ''
      const date = String(dateStr).trim().split(/[ T]/)[0]
      const isoMatch = date.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
      const localMatch = date.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
      const match = isoMatch || localMatch
      if (!match) return ''
      const year = isoMatch ? match[1] : match[3]
      const month = match[2]
      const day = isoMatch ? match[3] : match[1]
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    },
    formatDisplayDate(dateStr) {
      if (!dateStr) return ''
      const pickerDate = this.formatPickerDate(dateStr)
      if (!pickerDate) return ''
      const [year, month, day] = pickerDate.split('-')
      return `${day}/${month}/${year}`
    },
    formatApiDateTime(dateStr, isEndOfDay = false) {
      if (!dateStr) return null
      const dateOnly = String(dateStr).split(/[ T]/)[0]
      const [year, month, day] = dateOnly.includes('/')
        ? dateOnly.split('/').reverse()
        : dateOnly.split('-')
      if (!year || !month || !day) return null
      return `${day}/${month}/${year} ${isEndOfDay ? '23:59:59' : '00:00:00'}`
    },
    async fetchDetail(id) {
      this.loadingDetail = true
      try {
        const res = await redefenseExamService.getDetail(id)
        let data = res.data !== undefined ? res.data : res
        if (data && data.data && typeof data.data === 'object' && !data.name) {
          data = data.data
        }
        if (data) {
          const semObj = data.semester || {}
          this.form = {
            name: data.name || '',
            code: data.code || '',
            semesterId: semObj.id ?? semObj.semesterId ?? data.semesterId ?? data.semester?.id ?? null,
            semesterName: semObj.name || semObj.code || (typeof data.semester === 'string' ? data.semester : ''),
            fromTime: this.formatPickerDate(data.fromTime),
            toTime: this.formatPickerDate(data.toTime),
            status: data.status || 'ACTIVE',
          }
        }
      } catch (error) {
        console.error('Lỗi tải chi tiết đợt bảo vệ lại:', error)
      } finally {
        this.loadingDetail = false
      }
    },
    async handleSave() {
      if (this.loading || !this.$refs.form.validate()) return
      this.loading = true
      try {
        const payload = {
          name: this.form.name,
          code: this.form.code,
          semesterId: this.form.semesterId,
          semester: {
            id: this.form.semesterId,
          },
          fromTime: this.formatApiDateTime(this.form.fromTime),
          toTime: this.formatApiDateTime(this.form.toTime, true),
          status: this.form.status,
          channel: 'CMS',
        }
        const res = await redefenseExamService.update(this.editId, payload)
        const responseData = res?.data !== undefined ? res.data : res
        if (responseData?.code !== undefined && Number(responseData.code) !== 0) {
          const message = responseData.message || 'Cập nhật thất bại. Vui lòng thử lại.'
          this.$emit('error', message)
          return
        }
        this.$emit('success', 'Cập nhật đợt bảo vệ lại thành công')
        this.closeDialog()
      } catch (error) {
        console.error('Lỗi khi cập nhật:', error)
        const message = error.response?.data?.message || error.response?.data?.error || 'Cập nhật thất bại. Vui lòng thử lại.'
        this.$emit('error', message)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.modal-body-scroll { max-height: 70vh; overflow-y: auto; }
</style>