<template>
  <v-dialog v-model="dialog" max-width="650px" persistent scrollable>
    <v-card class="rounded-lg overflow-hidden">
      <v-card-title
        class="pa-4 white--text d-flex justify-space-between align-center"
        style="background-color: #A62229"
      >
        <span class="text-h6 font-weight-bold">Chi tiết đợt bảo vệ lại</span>
        <v-btn icon dark @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-5 modal-body-scroll bg-white">
        <div v-if="loadingDetail" class="d-flex justify-center align-center py-5">
          <v-progress-circular indeterminate color="#A62229"></v-progress-circular>
        </div>

        <div v-else class="detail-info-list">
          <div class="detail-row mb-3">
            <span class="detail-label">Tên đợt bảo vệ lại:</span>
            <span class="detail-value">{{ detail.name || '---' }}</span>
          </div>

          <div class="detail-row mb-3">
            <span class="detail-label">Mã đợt bảo vệ lại:</span>
            <span class="detail-value">{{ detail.code || '---' }}</span>
          </div>

          <div class="detail-row mb-3">
            <span class="detail-label">Học kỳ:</span>
            <span class="detail-value">{{ detail.semesterName || '---' }}</span>
          </div>

          <div class="detail-row mb-3">
            <span class="detail-label">Thời gian đăng ký:</span>
            <span class="detail-value">{{ formatTimeRange(detail.fromTime, detail.toTime) }}</span>
          </div>

          <div class="detail-row d-flex align-center">
            <span class="detail-label mr-2">Trạng thái:</span>
            <v-chip
              small
              class="font-weight-medium"
              :color="detail.status === 'ACTIVE' ? 'success' : 'grey lighten-1'"
              :text-color="detail.status === 'ACTIVE' ? 'white' : 'grey darken-3'"
            >
              {{ detail.status === 'ACTIVE' ? 'Kích hoạt' : 'Chưa kích hoạt' }}
            </v-chip>
          </div>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-3 justify-end bg-white">
        <v-btn
          outlined
          color="grey darken-2"
          class="text-none px-4"
          @click="closeDialog"
        >
          Đóng <v-icon right small>mdi-close</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import redefenseExamService from '~/services/redefenseExamService'

export default {
  name: 'RedefenseDetailModal',
  props: {
    value: { type: Boolean, default: false },
    detailId: { type: [Number, String], default: null },
  },
  data() {
    return {
      dialog: this.value,
      loadingDetail: false,
      detail: {
        name: '',
        code: '',
        semesterName: '',
        fromTime: '',
        toTime: '',
        status: 'INACTIVE',
      },
    }
  },
  watch: {
    value(val) {
      this.dialog = val
      if (val && this.detailId) {
        this.fetchDetail(this.detailId)
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
    formatDateTimeDisplay(val, fallbackTime = '00:00:00') {
      if (!val) return ''
      const str = String(val).trim()
      // Nếu đã có định dạng DD/MM/YYYY HH:mm:ss
      if (/^\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}$/.test(str)) {
        return str
      }
      // Nếu chỉ có ngày DD/MM/YYYY
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
        return `${str} ${fallbackTime}`
      }
      // Nếu dạng YYYY-MM-DD hoặc ISO
      const datePart = str.split(/[T ]/)[0]
      const timePart = str.split(/[T ]/)[1]
      const isoMatch = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/)
      if (isoMatch) {
        const formattedDate = `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`
        const cleanTime = timePart ? timePart.split('.')[0] : fallbackTime
        return `${formattedDate} ${cleanTime}`
      }
      return str
    },
    formatTimeRange(fromTime, toTime) {
      const start = this.formatDateTimeDisplay(fromTime, '00:00:00')
      const end = this.formatDateTimeDisplay(toTime, '23:59:59')
      if (!start && !end) return '---'
      return `${start || '---'} ~ ${end || '---'}`
    },
    async fetchDetail(id) {
      this.loadingDetail = true
      try {
        const res = await redefenseExamService.getDetail(id)
        let data = res?.data !== undefined ? res.data : res
        if (data && data.data && typeof data.data === 'object' && !data.name) {
          data = data.data
        }
        if (data) {
          const semObj = data.semester || {}
          this.detail = {
            name: data.name || '',
            code: data.code || '',
            semesterName:
              semObj.name ||
              semObj.code ||
              data.semesterName ||
              (typeof data.semester === 'string' ? data.semester : ''),
            fromTime: data.fromTime || '',
            toTime: data.toTime || '',
            status: data.status || 'INACTIVE',
          }
        }
      } catch (error) {
        console.error('Lỗi tải chi tiết đợt bảo vệ lại:', error)
      } finally {
        this.loadingDetail = false
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
.detail-row {
  font-size: 15px;
  line-height: 1.5;
}
.detail-label {
  color: #616161;
  margin-right: 4px;
}
.detail-value {
  color: #A62229;
  font-weight: 500;
}
</style>