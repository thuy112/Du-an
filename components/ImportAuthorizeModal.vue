<template>
  <v-dialog v-model="isOpen" max-width="750px" persistent>
    <v-card class="rounded-lg">
      <v-card-title class="pa-4 white--text" style="background-color: #A62229;">
        <span class="text-h6 font-weight-bold">Nhập file excel</span>
        <v-spacer></v-spacer>
        <v-btn icon dark @click="closeModal"><v-icon>mdi-close</v-icon></v-btn>
      </v-card-title>

      <v-card-text class="pa-5">
        <!-- Link tải file mẫu -->
        <div class="mb-3 text-body-2">
          Tải file mẫu ở đây: 
          <a href="#" @click.prevent="downloadTemplate" class="red--text font-weight-bold" style="text-decoration: underline;">
            template_danh_sach_bao_ve.xlsx
          </a>
        </div>

        <!-- Khung chọn tệp đính kèm -->
        <div 
          class="upload-dropzone pa-3 text-center rounded-lg mb-3" 
          @click="triggerFileInput"
          @dragover.prevent 
          @drop.prevent="handleFileDrop"
        >
          <input 
            ref="fileInput" 
            type="file" 
            accept=".xlsx, .xls" 
            class="d-none" 
            @change="handleFileChange"
          />

          <div v-if="!selectedFile" class="py-2">
            <v-btn fab small color="#A62229" dark class="mb-1 elevation-0" width="32" height="32">
              <v-icon size="18">mdi-plus</v-icon>
            </v-btn>
            <div class="text-caption grey--text text--darken-2">Chọn tệp đính kèm</div>
          </div>

          <div v-else class="d-flex align-center justify-space-between pa-2 bg-file-selected rounded">
            <div class="d-flex align-center">
              <v-icon color="green" class="mr-2" small>mdi-file-excel</v-icon>
              <span class="font-weight-medium text-truncate text-body-2" style="max-width: 450px;">{{ selectedFile.name }}</span>
            </div>
            <v-btn icon x-small @click.stop="resetFile">
              <v-icon size="16">mdi-close</v-icon>
            </v-btn>
          </div>
        </div>

        <!-- HIỂN THỊ KHI CÓ LỖI CHECK FILE -->
        <div v-if="hasError" class="mb-4">
          <div class="text-center red--text font-weight-bold mb-1">Có lỗi xảy ra khi import excel</div>
          <div v-if="errorFileUrl" class="text-center text-caption mb-3">
            Link file lỗi chi tiết: 
            <a :href="errorFileUrl" target="_blank" class="red--text" style="text-decoration: underline;">
              {{ errorFileName }}
            </a>
          </div>

          <!-- Bảng hiển thị chi tiết các dòng lỗi -->
          <v-data-table
            :headers="errorHeaders"
            :items="errorItems"
            hide-default-footer
            class="elevation-1 border-error-table"
            dense
          >
            <!-- Cột Thông tin lỗi hiển thị chữ đỏ -->
            <template v-slot:[`item.errorMessages`]="{ item }">
              <span class="red--text text-caption font-weight-medium">
                {{ Array.isArray(item.messErrors) ? item.messErrors.join(', ') : item.messErrors }}
              </span>
            </template>
          </v-data-table>
        </div>

        <!-- HIỂN THỊ KHI CHECK THÀNH CÔNG KHÔNG LỖI -->
        <div v-if="isCheckSuccess" class="pa-3 rounded mb-2 green lighten-5 green--text text--darken-4 text-center">
          Kiểm tra file thành công! Dữ liệu hợp lệ, bạn có thể bấm Lưu để hoàn tất.
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Hành động đáy -->
      <v-card-actions class="pa-3">
        <v-spacer></v-spacer>
        <v-btn outlined color="grey darken-1" class="text-none px-4" @click="closeModal">
          Đóng
        </v-btn>

        <!-- Nút Import luôn hiện khi chưa check thành công hoặc khi có lỗi -->
        <v-btn v-if="!isCheckSuccess" color="#A62229" dark class="text-none px-5" :loading="checking" :disabled="!selectedFile" @click="handleCheckFile">
          Import
        </v-btn>

        <!-- Chỉ hiển thị nút Lưu KHI VÀ CHỈ KHI check thành công và KHÔNG có lỗi -->
        <v-btn v-else color="#A62229" dark class="text-none px-5" :loading="saving" @click="handleSaveImport">
          Lưu
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import authorizeRegistrationService from '~/services/redefend/authorizeRegistrationService'

export default {
  name: 'ImportAuthorizeModal',
  props: {
    value: { type: Boolean, default: false }
  },
  data() {
    return {
      isOpen: this.value,
      selectedFile: null,
      checking: false,
      saving: false,
      isCheckSuccess: false,
      hasError: false,
      errorFileUrl: '',
      errorFileName: '',
      errorItems: [],
      errorHeaders: [
        { text: 'STT', value: 'index', width: '60px', sortable: false },
        { text: 'Thông tin lỗi', value: 'errorMessages', sortable: false },
        { text: 'Mã đợt bảo vệ', value: 'examCode', sortable: false },
        { text: 'Mã học kỳ', value: 'semesterCode', sortable: false },
        { text: 'Mã lớp', value: 'classCode', sortable: false },
        { text: 'MSSV', value: 'studentCode', sortable: false }
      ]
    }
  },
  watch: {
    value(val) {
      this.isOpen = val
      if (val) {
        this.resetFile()
      }
    },
    isOpen(val) {
      this.$emit('input', val)
    }
  },
  methods: {
    closeModal() {
      this.isOpen = false
    },
    resetFile() {
      this.selectedFile = null
      this.isCheckSuccess = false
      this.hasError = false
      this.errorItems = []
      this.errorFileUrl = ''
      this.errorFileName = ''
    },
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    handleFileChange(e) {
      const file = e.target.files[0]
      if (file) {
        this.selectedFile = file
        this.resetCheckState()
      }
    },
    handleFileDrop(e) {
      const file = e.dataTransfer.files[0]
      if (file) {
        this.selectedFile = file
        this.resetCheckState()
      }
    },
    resetCheckState() {
      this.isCheckSuccess = false
      this.hasError = false
      this.errorItems = []
    },
    async downloadTemplate() {
      try {
        const res = await authorizeRegistrationService.getTemplateFile({ channel: 'CMS' })
        const blob = new Blob([res.data || res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.setAttribute('download', 'template_danh_sach_bao_ve.xlsx')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (error) {
        console.error('Lỗi tải file mẫu:', error)
      }
    },
    async handleCheckFile() {
      if (!this.selectedFile) return
      this.checking = true
      try {
        const formData = new FormData()
        formData.append('file', this.selectedFile)

        const response = await authorizeRegistrationService.checkImportFile(formData, 'CMS')
        const data = response.data !== undefined ? response.data : response

        // Kiểm tra nếu server trả về danh sách lỗi
        if (data && (data.isError === 'YES' || (Array.isArray(data) && data.length > 0) || data.error)) {
          this.hasError = true
          this.isCheckSuccess = false // Bắt buộc false để ẩn nút Lưu, hiện nút Import
          this.errorItems = Array.isArray(data) ? data : (data.errors || data.data || [])
          if (data.fileUrl) {
            this.errorFileUrl = data.fileUrl
            this.errorFileName = data.fileUrl.split('/').pop()
          }
        } else {
          this.hasError = false
          this.isCheckSuccess = true // Chỉ true khi hợp lệ hoàn toàn để hiện nút Lưu
        }
      } catch (error) {
        console.error('Lỗi check file:', error)
        this.hasError = true
        // Nếu API trả về file lỗi dạng blob hoặc message
        if (error.response?.data) {
          const errData = error.response.data
          this.errorItems = errData.errors || errData.data || [{ messErrors: [error.message || 'Lỗi dữ liệu file'] }]
        }
      } finally {
        this.checking = false
      }
    },
    async handleSaveImport() {
      if (!this.selectedFile) return
      this.saving = true
      try {
        const formData = new FormData()
        formData.append('file', this.selectedFile)

        await authorizeRegistrationService.confirmImportFile(formData, 'CMS')
        this.$emit('success', 'Nhập file đăng ký thành công!')
        this.closeModal()
      } catch (error) {
        console.error('Lỗi khi lưu import:', error)
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style scoped>
.upload-dropzone {
  border: 2px dashed #A62229;
  background-color: #fafafa;
  cursor: pointer;
  transition: background-color 0.2s;
}
.upload-dropzone:hover {
  background-color: #f5f5f5;
}
.bg-file-selected {
  background-color: #f1f8e9;
  border: 1px solid #c8e6c9;
}
.border-error-table {
  border: 1px solid #ffcdd2;
}
</style>