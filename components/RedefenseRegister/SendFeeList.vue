<template>
  <v-dialog
    :value="open"
    max-width="820px"
    persistent
    @input="(val) => { if (!val) $emit('toggle') }"
  >
    <v-card class="send-batch-modal rounded-lg">
      <v-card-title class="modal-header white--text px-6 py-3" style="background-color: #a62229;">
        <span class="text-h6 font-weight-bold">Xác nhận gửi danh sách thu phí</span>
        <v-spacer></v-spacer>
        <v-btn icon dark :disabled="loading" @click="$emit('toggle')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-5">
        <div class="mb-2">
          Danh sách sinh viên sẽ được gửi thu phí
          <strong class="red--text">({{ selectedItems.length }})</strong>:
        </div>

        <v-alert v-if="validating" type="info" dense text class="mb-3">
          Đang kiểm tra đợt bảo vệ...
        </v-alert>

        <div
          v-if="!validating && validationResult && !validationResult.success"
          class="alert-banner-custom mb-3"
        >
          <div class="font-weight-bold">
            {{ validationMessage || 'Các đơn đăng ký không cùng đợt' }}
          </div>
        </div>

        <v-alert v-if="!validating && isBatchValid" type="success" dense text class="mb-3">
          {{ validationMessage || 'Tất cả đơn đăng ký cùng đợt' }}
          <span v-if="validationResult.examCode">
            — Đợt: <strong>{{ validationResult.examCode }}</strong>
          </span>
        </v-alert>

        <div class="invoice-hint error--text mb-2">
          <v-icon small color="error" class="mr-1">mdi-information-outline</v-icon>
          Tick chọn các sinh viên cần xuất hóa đơn
        </div>

        <v-data-table
          fixed-header
          :headers="tableHeaders"
          :items="selectedItems"
          item-key="id"
          hide-default-footer
          dense
          disable-pagination
          :items-per-page="-1"
          class="elevation-0 mb-4 preview-table"
          no-data-text="Chưa có sinh viên nào được chọn"
        >
          <template #[`header.isIssueInvoice`]>
            <v-simple-checkbox
              :value="allInvoiceSelected"
              :indeterminate="someInvoiceSelected"
              color="primary"
              :ripple="false"
              :disabled="!isBatchValid || !selectedItems.length"
              class="ma-0 pa-0 invoice-check"
              @input="toggleAllInvoice"
            />
          </template>

          <template #[`item.isIssueInvoice`]="{ item }">
            <v-simple-checkbox
              :value="invoiceIds.includes(item.id)"
              color="primary"
              :ripple="false"
              :disabled="!isBatchValid"
              class="ma-0 pa-0 invoice-check"
              @input="(val) => toggleInvoice(item.id, val)"
            />
          </template>

          <template #[`item.stt`]="{ index }">
            {{ index + 1 }}
          </template>

          <template #[`item.clazz.name`]="{ item }">
            {{ (item.clazz && item.clazz.name) || item.className || '-' }}
          </template>

          <template #[`item.exam.name`]="{ item }">
            {{ (item.exam && item.exam.name) || item.examName || '-' }}
          </template>

          <template #[`item.terms`]="{ item }">
            <!-- eslint-disable vue/no-v-html -->
            <div
              v-if="item.registerStudentTermV2Dtos && item.registerStudentTermV2Dtos.length"
              v-html="
                item.registerStudentTermV2Dtos
                  .map((i, idx) => `${idx + 1}. ${(i.term && i.term.name) || i.termName || ''}`)
                  .join('<br />')
              "
            ></div>
            <span v-else>{{ item.termName || '-' }}</span>
          </template>

          <template #[`item.totalFee`]="{ item }">
            {{ formatMoney(item.totalFee) }}đ
          </template>
        </v-data-table>

        <!-- Ô chọn Hạn nộp học phí -->
        <div class="mt-2" style="max-width: 300px;">
          <v-menu
            v-model="dateMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="290px"
            :disabled="loading"
          >
            <template #activator="{ on, attrs }">
              <v-text-field
                v-model="paymentToTime"
                label="Hạn nộp học phí"
                placeholder="DD/MM/YYYY"
                readonly
                clearable
                outlined
                dense
                hide-details
                :disabled="loading"
                v-bind="attrs"
                v-on="on"
                @click="if (!loading) dateMenu = true"
                @click:clear="onClearDate"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="pickerDate"
              locale="vi-vn"
              @input="onSelectPaymentDate"
            ></v-date-picker>
          </v-menu>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="px-6 py-3">
        <v-spacer></v-spacer>
        <v-btn text color="grey darken-2" :disabled="loading" @click="$emit('toggle')">
          Đóng
        </v-btn>
        <v-btn
          color="primary"
          elevation="0"
          :loading="loading"
          :disabled="!canSubmit"
          @click="handleSubmit"
        >
          Gửi Danh Sách
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import moment from 'moment'
import registerService from '~/services/redefend/registerService'

export default {
  name: 'RedefenseRegisterSendFeeList',
  props: {
    open: {
      type: Boolean,
      required: true,
    },
    selectedItems: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      invoiceIds: [],
      loading: false,
      validating: false,
      validationResult: null,
      paymentToTime: '',
      pickerDate: null,
      dateMenu: false,
      tableHeaders: [
        { text: '', value: 'isIssueInvoice', sortable: false, align: 'center', width: 56 },
        { text: 'STT', value: 'stt', sortable: false, align: 'center', width: 60 },
        { text: 'Mã SV', value: 'studentCode', sortable: false, width: 115 },
        { text: 'Họ tên', value: 'fullName', sortable: false, width: 180 },
        { text: 'Lớp', value: 'clazz.name', sortable: false, width: 150 },
        { text: 'Đợt bảo vệ', value: 'exam.name', sortable: false, width: 160 },
        { text: 'Học phần đăng ký', value: 'terms', sortable: false, width: 240 },
        { text: 'Mã đơn', value: 'code', sortable: false, width: 120 },
        { text: 'Tổng học phí', value: 'totalFee', sortable: false, align: 'right', width: 130 },
      ],
    }
  },
  computed: {
    isBatchValid() {
      return !!(this.validationResult && this.validationResult.success)
    },
    canSubmit() {
      return this.isBatchValid && !this.validating && !!this.paymentToTime && !this.loading
    },
    allInvoiceSelected() {
      return (
        this.selectedItems.length > 0 &&
        this.selectedItems.every((it) => this.invoiceIds.includes(it.id))
      )
    },
    someInvoiceSelected() {
      return this.invoiceIds.length > 0 && !this.allInvoiceSelected
    },
    validationMessage() {
      const raw = this.validationResult?.message
      if (!raw) return ''
      const lookup = {}
      for (const it of this.selectedItems || []) {
        if (it?.id != null) lookup[String(it.id)] = this.formatRegisterCode(it)
      }
      for (const it of this.validationResult?.items || []) {
        if (it?.id != null && !lookup[String(it.id)]) {
          lookup[String(it.id)] = this.formatRegisterCode(it)
        }
      }
      return raw.replace(/\[([^\]]+)\]/g, (_, inner) =>
        inner
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .map((s) => lookup[s] || s)
          .join(', ')
      )
    },
  },
  watch: {
    open: {
      immediate: true,
      handler(val) {
        if (val) this.init()
      },
    },
  },
  methods: {
    async init() {
      this.invoiceIds = []
      this.validationResult = null
      this.paymentToTime = ''
      this.pickerDate = null
      this.dateMenu = false
      await this.validateBatch()
    },
    formatRegisterCode(item) {
      if (!item) return ''
      return item.code || `BVL_${item.id}`
    },
    formatMoney(val) {
      if (val === null || val === undefined || val === '') return 0
      const num = Number(val)
      if (isNaN(num)) return val
      return new Intl.NumberFormat('vi-VN').format(num)
    },
    onSelectPaymentDate(val) {
      if (!val) return
      const m = moment(val, 'YYYY-MM-DD')
      this.paymentToTime = m.isValid() ? m.format('DD/MM/YYYY') : val
      this.dateMenu = false
    },
    onClearDate() {
      this.paymentToTime = ''
      this.pickerDate = null
    },
    toIsoDeadline(dateStr) {
      const m = moment(String(dateStr || '').trim(), ['DD/MM/YYYY HH:mm:ss', 'DD/MM/YYYY'], true)
      if (m.isValid()) {
        return `${m.format('YYYY-MM-DD')}T23:59:59`
      }
      return String(dateStr || '').trim()
    },
    toggleAllInvoice(val) {
      this.invoiceIds = val ? this.selectedItems.map((it) => it.id) : []
    },
    toggleInvoice(id, val) {
      if (val) {
        if (!this.invoiceIds.includes(id)) this.invoiceIds.push(id)
      } else {
        this.invoiceIds = this.invoiceIds.filter((x) => x !== id)
      }
    },
    async validateBatch() {
      if (!this.selectedItems.length) return
      try {
        this.validating = true
        const res = await registerService.validateSameBatch({
          ids: this.selectedItems.map((item) => item.id),
        })
        const payload = res?.data || res
        if (res?.success !== false && payload) {
          this.validationResult = payload
          if (payload.success && payload.paymentToTime) {
            const m = moment(payload.paymentToTime)
            if (m.isValid()) {
              this.pickerDate = m.format('YYYY-MM-DD')
              this.paymentToTime = m.format('DD/MM/YYYY')
            }
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        this.validating = false
      }
    },
    async handleSubmit() {
      if (!this.canSubmit) return
      try {
        this.loading = true
        const invoiceSet = new Set(this.invoiceIds)
        const res = await registerService.generateBatchQr({
          items: this.selectedItems.map((item) => ({
            id: item.id,
            isIssueInvoice: invoiceSet.has(item.id) ? 1 : 0,
          })),
          deadline: this.toIsoDeadline(this.paymentToTime),
        })
        if (res?.success !== false) {
          this.$toast?.success?.('Gửi danh sách thu phí thành công')
          this.$emit('success')
          this.$emit('toggle')
        }
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.alert-banner-custom {
  background-color: #fdecea;
  color: #c62828;
  border-radius: 6px;
  padding: 12px 14px;
  font-size: 13px;
  line-height: 1.5;
  word-break: break-word;
}
.invoice-hint {
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  font-weight: 500;
}
.invoice-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
.invoice-check ::v-deep .v-icon {
  font-size: 20px;
}
.preview-table {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 6px;
}
.preview-table ::v-deep .v-data-table__wrapper {
  max-height: 320px;
  overflow: auto;
}
.preview-table ::v-deep table {
  min-width: 1180px;
  table-layout: fixed;
}
.preview-table ::v-deep th,
.preview-table ::v-deep td {
  white-space: nowrap;
  vertical-align: middle !important;
}
.preview-table ::v-deep th {
  background-color: #fafafa !important;
  font-weight: 600;
}
.preview-table ::v-deep td {
  padding: 6px 12px !important;
}
.preview-table ::v-deep td:nth-child(7) {
  white-space: normal;
  line-height: 1.4;
}
</style>