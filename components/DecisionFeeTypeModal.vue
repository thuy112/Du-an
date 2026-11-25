<template>
  <v-dialog v-model="open" max-width="1000px" persistent scrollable>
    <v-card class="rounded-lg">
      <v-card-title class="pa-4 text-white" style="background-color: #A62229; color: white;">
        <span class="text-h6 font-weight-bold">
          {{ body.id ? 'Cập nhật quyết định học phí' : 'Thêm quyết định học phí' }}
        </span>
        <v-spacer></v-spacer>
        <v-btn icon dark @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-5 modal-body-scroll">
        <v-form ref="form" lazy-validation @submit.prevent>
          <v-row class="mt-2" dense>
            <v-col cols="12" lg="6" md="6">
              <v-text-field
                v-model="body.name"
                label="Tên ban hành (*)"
                outlined
                dense
                :rules="[(v) => !!(v && String(v).trim()) || 'Tên ban hành không được để trống']"
              />
            </v-col>

            <v-col cols="12" lg="6" md="6">
              <base-date-picker
                v-model="body.timeInform"
                label="Ngày ban hành"
                required
              />
            </v-col>

            <v-col cols="12" lg="6" md="6">
              <v-text-field
                v-model="fileName"
                readonly
                outlined
                dense
                append-icon="mdi-file-upload-outline"
                label="Thông tin ban hành"
                @click:append="triggerUpload"
                @click="triggerUpload"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="body.semesterId"
                hide-details
                :items="semesterList"
                item-value="id"
                item-text="name"
                label="Học kỳ (*)"
                outlined
                dense
                :rules="[(v) => (v !== null && v !== undefined && v !== '') || 'Vui lòng chọn học kỳ']"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="body.status"
                :items="statusList"
                item-text="text"
                item-value="value"
                label="Trạng thái (*)"
                outlined
                dense
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="body.defaultFeeDisplay"
                label="Phí mặc định"
                outlined
                dense
                suffix="VNĐ"
                hide-details
                @input="body.defaultFeeDisplay = formatCurrency($event)"
              />

              <v-checkbox
                v-model="checkbox"
                label="Dùng cho tất cả ngành học"
                hide-details
                class="mt-1"
              />
            </v-col>

            <v-col cols="12" class="mt-4">
              <div class="table-responsive-container">
                <v-data-table
                  :headers="headers"
                  :items="list"
                  :items-per-page="-1"
                  :loading="loadingMajor"
                  checkbox-color="primary"
                  fixed-header
                  hide-default-footer
                  item-key="majorId"
                  dense
                  class="elevation-1"
                  no-data-text="Không có dữ liệu"
                >
                  <template #[`item.stt`]="{ index }">
                    {{ index + 1 }}
                  </template>

                  <template #[`item.fee`]="{ item }">
                    <div class="d-flex align-center justify-end">
                      <div class="input-with-clear">
                        <input
                          :value="item.feeDisplay"
                          type="text"
                          class="line-underline-input text-right pr-6"
                          :class="{ 'line-underline-input--error': submitted && isFeeMissing(item) }"
                          placeholder=""
                          @input="onFeeInput(item, $event.target.value)"
                        />
                        <span
                          v-if="item.feeDisplay"
                          class="clear-btn"
                          title="Xóa"
                          @click="clearSingleFee(item)"
                        >
                          &times;
                        </span>
                      </div>
                      <span class="grey--text text--darken-1 pl-1 font-weight-medium">VNĐ</span>
                    </div>
                  </template>
                </v-data-table>
              </div>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-3">
        <v-spacer></v-spacer>
        <v-btn
          outlined
          color="grey darken-1"
          class="text-none px-4"
          :disabled="loading"
          @click="closeDialog"
        >
          Đóng <v-icon right small>mdi-close</v-icon>
        </v-btn>
        <v-btn
          color="#A62229"
          dark
          class="text-none px-5"
          :loading="loading"
          :disabled="loading"
          @click="handleAdd"
        >
          Lưu <v-icon right small>mdi-content-save</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-file-input
      ref="fileInput"
      accept=".xls,.xlsx,.pdf"
      class="d-none"
      @change="handleUpload"
    />
  </v-dialog>
</template>

<script>
import { statusList } from '~/consts/list'
import BaseDatePicker from '~/components/Base/DatePicker.vue'
import decisionFeeTypeService from '~/services/decisionFeeTypeService'

export default {
  name: 'DecisionFeeTypeModal',

  components: {
    BaseDatePicker,
  },

  props: {
    value: {
      type: Boolean,
      default: false,
    },
    editData: {
      type: Object,
      default: null,
    },
    semesterList: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      open: this.value,
      loading: false,
      loadingMajor: false,
      submitted: false,
      list: [],
      checkbox: false,
      body: {
        id: null,
        estimationRequests: [],
        fileInform: '',
        semesterId: null,
        name: '',
        status: 'ACTIVE',
        timeInform: '',
        defaultFee: null,
        defaultFeeDisplay: '',
      },
      headers: [
        { value: 'stt', text: 'STT', sortable: false, width: '60px', align: 'center' },
        { value: 'name', text: 'Ngành', sortable: false },
        { value: 'educationProgram', text: 'Chương trình đào tạo', sortable: false },
        { value: 'fee', text: 'Phí thi lại', sortable: false, width: 220, align: 'right' },
      ],
      fileName: '',
      statusList,
    }
  },

  watch: {
    value(val) {
      this.open = val
      if (val) {
        this.submitted = false
        if (this.editData && this.editData.id) {
          this.initDataForEdit(this.editData.id)
        } else {
          this.getMajors()
        }
      }
    },
    open(val) {
      this.$emit('input', val)
      if (!val) {
        Object.assign(this.$data, this.$options.data.call(this))
        if (this.$refs.form) {
          this.$refs.form.resetValidation()
        }
      }
    },
    fileName(newVal) {
      if (!newVal) {
        this.body.fileInform = ''
      }
    },
    checkbox(val) {
      if (val) {
        this.list.forEach((i) => {
          i.fee = this.body.defaultFee
          i.feeDisplay = this.formatCurrency(this.body.defaultFee)
        })
        this.list = JSON.parse(JSON.stringify(this.list))
      }
    },
    'body.defaultFeeDisplay'(val) {
      const num = this.parseCurrency(val)
      this.body.defaultFee = num
      if (num !== null && this.checkbox) {
        this.list.forEach((i) => {
          i.fee = this.body.defaultFee
          i.feeDisplay = this.formatCurrency(this.body.defaultFee)
        })
        this.list = JSON.parse(JSON.stringify(this.list))
      }
    },
  },

  methods: {
    isFeeMissing(item) {
      return item.fee === null || item.fee === undefined || item.fee === ''
    },
    formatCurrency(val) {
      if (val === null || val === undefined || val === '') return ''
      const cleaned = String(val).replace(/\D/g, '')
      if (!cleaned) return ''
      return Number(cleaned).toLocaleString('vi-VN')
    },
    parseCurrency(val) {
      if (val === null || val === undefined || val === '') return null
      const cleaned = String(val).replace(/\D/g, '')
      return cleaned ? Number(cleaned) : null
    },
    extractApiMessage(errOrRes) {
      const rawMsg =
        errOrRes?.response?.data?.message ||
        errOrRes?.response?.data?.error?.message ||
        errOrRes?.response?.data?.data ||
        errOrRes?.message ||
        errOrRes?.error?.message ||
        errOrRes?.data?.message ||
        ''
      const text = typeof rawMsg === 'string' ? rawMsg.trim() : ''
      if (!text) return 'Tên ban hành phí thi lại đã tồn tại'
      if (text.toLowerCase().includes('exist') || text.toLowerCase().includes('tồn tại')) {
        return 'Tên ban hành phí thi lại đã tồn tại'
      }
      return text
    },
    onFeeInput(item, val) {
      const formatted = this.formatCurrency(val)
      item.feeDisplay = formatted
      item.fee = this.parseCurrency(formatted)
    },
    clearSingleFee(item) {
      item.feeDisplay = ''
      item.fee = null
    },
    closeDialog() {
      this.open = false
    },
    showWarningBanner(msg) {
      if (typeof this.$showWarning === 'function') {
        this.$showWarning(msg)
      }
    },
    async getMajors(savedFees = []) {
      this.loadingMajor = true
      try {
        const res = await decisionFeeTypeService.getMajorList({ status: 'ACTIVE', channel: 'CMS' })
        const raw = res?.data !== undefined ? res.data : res
        const majors = Array.isArray(raw) ? raw : raw?.data || raw?.content || []

        this.list = majors.map((item) => {
          const matched = savedFees.find((r) => r.majorId === item.id || r.id === item.id)
          const feeVal =
            matched && matched.fee !== undefined && matched.fee !== null ? matched.fee : null
          return {
            name: item.name,
            majorId: item.id,
            educationProgram: item?.educationProgram?.name || item.educationProgramName || '',
            fee: feeVal,
            feeDisplay: this.formatCurrency(feeVal),
          }
        })
      } catch (e) {
        console.error(e)
      } finally {
        this.loadingMajor = false
      }
    },
    async initDataForEdit(id) {
      this.loading = true
      try {
        const res = await decisionFeeTypeService.getDetail(id, 'CMS')
        const raw = res?.data !== undefined ? res.data : res
        const detail = raw?.data !== undefined ? raw.data : raw
        if (detail) {
          this.body.id = detail.id
          this.body.name = detail.name || ''
          this.body.timeInform = detail.timeInform || ''
          this.body.fileInform = detail.fileInform || ''
          this.fileName = detail.fileInform || ''
          this.body.semesterId = detail.semester?.id || detail.semesterId || null
          this.body.status = detail.status || 'ACTIVE'
          this.body.defaultFee = detail.defaultFee ?? null
          this.body.defaultFeeDisplay = this.formatCurrency(detail.defaultFee)
          const savedFees =
            detail.estimationRequests || detail.details || detail.estimationFees || []
          await this.getMajors(savedFees)
        }
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },
    triggerUpload() {
      if (this.$refs.fileInput?.$refs?.input) {
        this.$refs.fileInput.$refs.input.click()
      }
    },
    async handleUpload(data) {
      if (!data) return
      this.fileName = data.name
      const file = new FormData()
      file.append('file', data)
      try {
        const res = await decisionFeeTypeService.uploadFile(file, 'CMS')
        const raw = res?.data !== undefined ? res.data : res
        if (raw?.url || raw?.data?.url) {
          this.body.fileInform = raw?.url || raw?.data?.url
        }
      } catch (er) {
        console.error(er)
      }
    },
    async handleAdd() {
        this.submitted = true
        const isFormValid = this.$refs.form ? this.$refs.form.validate() : true
        const missingFees = this.list.some((item) => this.isFeeMissing(item))

        if (!isFormValid || missingFees) {
            return
        }

        this.loading = true
        try {
            this.body.estimationRequests = this.list.map((item) => ({
            name: item.name,
            majorId: item.majorId,
            educationProgram: item.educationProgram,
            fee: Number(item.fee),
            }))

            const payload = {
            estimationRequests: this.body.estimationRequests,
            fileInform: this.body.fileInform || '',
            semesterId: this.body.semesterId,
            name: this.body.name,
            status: this.body.status,
            timeInform: this.body.timeInform || '',
            defaultFee: this.body.defaultFee !== null ? Number(this.body.defaultFee) : null,
            }

            const res = this.body.id
            ? await decisionFeeTypeService.updateItem(this.body.id, payload)
            : await decisionFeeTypeService.createItem(payload)

            const isSuccess =
            res?.success === true ||
            res?.error?.code === 0 ||
            res?.code === 0 ||
            (res?.status >= 200 && res?.status < 300 && !res?.error)

            if (isSuccess) {
            this.open = false
            if (typeof this.$showSuccess === 'function') {
                this.$showSuccess(this.body.id ? 'Cập nhật thành công' : 'Thêm mới thành công')
            }
            this.$emit('saved')
            }
        } catch (er) {
            console.error(er)
        } finally {
            this.loading = false
        }
    }
  },
}
</script>

<style scoped>
.modal-body-scroll {
  max-height: 75vh;
  overflow-y: auto;
}
.table-responsive-container {
  max-height: 380px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}
.table-responsive-container >>> th {
  position: sticky !important;
  top: 0;
  z-index: 2;
  background-color: #f5f5f5 !important;
}
.input-with-clear {
  position: relative;
  display: inline-block;
}
.line-underline-input {
  width: 140px;
  border: none;
  border-bottom: 1px solid #c0c0c0;
  outline: none;
  padding: 4px 18px 4px 2px;
  background: transparent;
}
.line-underline-input:focus {
  border-bottom: 1.5px solid #A62229;
}
.line-underline-input--error {
  border-bottom: 1.5px solid #e53935 !important;
}
.clear-btn {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #999;
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
}
.clear-btn:hover {
  color: #A62229;
}
</style>