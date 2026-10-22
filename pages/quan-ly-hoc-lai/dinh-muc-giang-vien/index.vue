<template>
  <v-container fluid class="pa-6">
    <!-- Tiêu đề trang & Thanh công cụ -->
    <div class="d-flex justify-space-between align-center mb-4">
      <div class="text-subtitle-1 font-weight-bold black--text">
        Danh sách quy định định mức phí
        <span class="red--text">({{ filteredList.length }})</span>
      </div>
      <div class="d-flex align-center gap-2">
        <!-- Bộ lọc loại lớp -->
        <v-select
          v-model="filters.classType"
          :items="classTypeList"
          label="Loại lớp"
          outlined
          dense
          clearable
          hide-details
          style="width: 150px"
          @change="handleSearch"
        ></v-select>

        <!-- Bộ lọc hình thức đào tạo -->
        <v-select
          v-model="filters.trainingType"
          :items="trainingTypeList"
          label="Hình thức đào tạo"
          outlined
          dense
          clearable
          hide-details
          style="width: 170px"
          @change="handleSearch"
        ></v-select>

        <!-- Nút Refresh -->
        <v-btn icon small class="border-btn" @click="fetchData">
          <v-icon small color="#A62229">mdi-refresh</v-icon>
        </v-btn>

        <!-- Nút Tìm kiếm -->
        <v-btn
          color="#A62229"
          dark
          small
          class="px-3"
          elevation="0"
          @click="handleSearch"
        >
          <v-icon small>mdi-magnify</v-icon>
        </v-btn>

        <!-- Nút Thêm mới -->
        <v-btn
          color="#A62229"
          dark
          small
          class="px-3"
          elevation="0"
          @click="openAddModal"
        >
          <v-icon small>mdi-plus</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- Bảng dữ liệu -->
    <v-card flat class="rounded-lg border overflow-hidden">
      <v-data-table
        :headers="headers"
        :items="displayList"
        :loading="loading"
        hide-default-footer
        dense
        class="elevation-0 custom-table"
      >
        <template #[`item.stt`]="{ index }">
          <span class="grey--text text--darken-2">{{
            (page - 1) * pageSize + index + 1
          }}</span>
        </template>

        <template #[`item.classType`]="{ item }">
          <span class="black--text">{{ item.classType }}</span>
        </template>

        <template #[`item.trainingType`]="{ item }">
          <span class="black--text">{{ item.trainingType }}</span>
        </template>

        <template #[`item.price`]="{ item }">
          <span class="font-weight-medium black--text">{{
            formatCurrency(item.price)
          }}</span>
        </template>

        <template #[`item.actions`]="{ item }">
          <v-btn
            icon
            x-small
            class="amber--text text--darken-2"
            @click="editItem(item)"
          >
            <v-icon color="#f59e0b">mdi-pencil</v-icon>
          </v-btn>
        </template>
      </v-data-table>

      <!-- Phân trang chuẩn giao diện mẫu -->
      <div class="d-flex align-center justify-end pa-3 border-t bg-white gap-3">
        <div class="d-flex align-center gap-1 text-caption">
          <span class="grey--text">Bản ghi</span>
          <v-select
            v-model="pageSize"
            :items="[10, 20, 50, 100]"
            dense
            outlined
            hide-details
            style="width: 70px"
            @change="handleSearch"
          ></v-select>
        </div>

        <div class="d-flex align-center gap-1 text-caption">
          <span class="grey--text">Trang</span>
          <v-text-field
            v-model="pageInput"
            dense
            outlined
            hide-details
            style="width: 50px; text-align: center"
            @keyup.enter="handleGo"
          ></v-text-field>
          <v-btn
            small
            dark
            color="#A62229"
            class="text-none px-3"
            elevation="0"
            @click="handleGo"
            >Đi</v-btn
          >
        </div>

        <div class="d-flex align-center gap-1">
          <v-btn
            outlined
            small
            :disabled="page <= 1"
            class="px-2"
            @click="prevPage"
          >
            <v-icon small>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn small dark color="#A62229" class="px-3" elevation="0">{{
            page
          }}</v-btn>
          <v-btn
            outlined
            small
            :disabled="page >= totalPages"
            class="px-2"
            @click="nextPage"
          >
            <v-icon small>mdi-chevron-right</v-icon>
          </v-btn>
        </div>
      </div>
    </v-card>

    <!-- Dialog Thêm/Sửa Định Mức -->
    <v-dialog v-model="dialogVisible" max-width="480px" persistent>
      <v-card class="rounded-lg">
        <v-card-title
          class="bg-red-bk white--text pa-3 text-subtitle-1 font-weight-bold"
        >
          {{
            isEdit
              ? 'Cập nhật định mức giảng dạy'
              : 'Thêm mới định mức giảng dạy'
          }}
        </v-card-title>

        <v-card-text class="pa-5">
          <v-form ref="form" v-model="isFormValid">
            <v-select
              v-model="formModel.classType"
              :items="classTypeList"
              label="Loại lớp *"
              outlined
              dense
              :rules="[(v) => !!v || 'Vui lòng chọn loại lớp']"
              class="mb-3"
            ></v-select>

            <v-select
              v-model="formModel.trainingType"
              :items="trainingTypeList"
              label="Hình thức đào tạo *"
              outlined
              dense
              :rules="[(v) => !!v || 'Vui lòng chọn hình thức đào tạo']"
              class="mb-3"
            ></v-select>

            <v-text-field
              v-model="formattedPrice"
              label="Giá tiền (VNĐ) *"
              outlined
              dense
              :rules="[(v) => !!v || 'Vui lòng nhập giá tiền']"
              @input="onPriceInput"
            ></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-3 justify-end bg-gray-50 border-t">
          <v-btn outlined small class="text-none px-4" @click="closeDialog"
            >Đóng</v-btn
          >
          <v-btn
            color="#A62229"
            dark
            small
            class="text-none px-4"
            :loading="submitting"
            @click="saveData"
            >Lưu</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Toasts thông báo -->
    <div class="toast-container">
      <v-alert
        v-for="toast in saveToasts"
        :key="toast.id"
        :type="toast.isError ? 'error' : 'success'"
        dense
        text
        class="mb-2 shadow-sm"
      >
        {{ toast.message }}
      </v-alert>
    </div>
  </v-container>
</template>

<script>
export default {
  name: 'DinhMucPhiPage',
  layout: 'default',
  ssr: false,
  data() {
    return {
      loading: false,
      submitting: false,

      filters: {
        classType: null,
        trainingType: null,
        search: '',
      },
      classTypeList: ['Đồ án môn học', 'Lớp ghép', 'Lớp mở'],
      trainingTypeList: ['Chính quy', 'Vừa làm vừa học', 'Ngắn hạn'],

      rawList: [],
      filteredList: [],

      headers: [
        {
          text: 'STT',
          value: 'stt',
          width: '70px',
          align: 'center',
          sortable: false,
        },
        { text: 'Loại lớp', value: 'classType', sortable: false },
        { text: 'Hình thức đào tạo', value: 'trainingType', sortable: false },
        { text: 'Giá tiền', value: 'price', sortable: false },
        {
          text: 'Chức năng',
          value: 'actions',
          width: '90px',
          align: 'center',
          sortable: false,
        },
      ],

      page: 1,
      pageSize: 50,
      pageInput: '1',

      dialogVisible: false,
      isEdit: false,
      isFormValid: true,
      saveToasts: [],
      saveToastCounter: 0,
      formattedPrice: '',
      formModel: {
        id: null,
        classType: null,
        trainingType: null,
        price: null,
      },
    }
  },
  computed: {
    totalPages() {
      const pages = Math.ceil(this.filteredList.length / this.pageSize)
      return pages > 0 ? pages : 1
    },
    displayList() {
      const start = (this.page - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredList.slice(start, end)
    },
  },
  beforeDestroy() {
    this.saveToasts.forEach((toast) => clearTimeout(toast.timer))
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.loading = true
      try {
        const params = {
          pageIndex: this.page,
          pageSize: this.pageSize,
          search: this.filters.search || '',
          channel: 'CMS',
        }
        const res = await this.$axios.$get('/api/feeTeacher', { params })
        const responseWrapper = res?.data || {}
        const items = Array.isArray(responseWrapper.data)
          ? responseWrapper.data
          : Array.isArray(responseWrapper)
          ? responseWrapper
          : Array.isArray(res)
          ? res
          : []

        this.rawList = items.map((item, index) => {
          // 1. Ánh xạ loại lớp từ code sang tiếng Việt
          const rawClass = (item.classType || '').trim()
          let mappedClassType = rawClass
          if (rawClass === 'PROJECT_BASED_CLASS') {
            mappedClassType = 'Đồ án môn học'
          } else if (rawClass === 'COMBINE_CLASS') {
            mappedClassType = 'Lớp ghép'
          } else if (rawClass === 'NEW_CLASS' || rawClass === 'OPEN_CLASS') {
            mappedClassType = 'Lớp mở'
          }

          // 2. Lấy tên hình thức đào tạo trực tiếp từ object trainingMethod.name và .trim() để sạch ký tự \t
          const trainingMethodObj = item.trainingMethod || {}
          const mappedTrainingType = (
            trainingMethodObj.name ||
            item.trainingType ||
            'Chính quy'
          ).trim()

          return {
            id: item.id || index + 1,
            classType: mappedClassType,
            trainingType: mappedTrainingType,
            // Lấy chuẩn giá tiền từ trường "fee"
            price: Number(
              item.fee !== undefined && item.fee !== null ? item.fee : 0
            ),
            original: item,
          }
        })
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu định mức phí:', error)
        this.rawList = []
      } finally {
        this.loading = false
        this.applyFilter()
      }
    },

    onPriceInput(val) {
      if (!val) {
        this.formModel.price = null
        this.formattedPrice = ''
        return
      }
      const cleanNumber = String(val).replace(/\D/g, '')
      if (cleanNumber) {
        this.formModel.price = parseInt(cleanNumber, 10)
        this.formattedPrice = this.formModel.price.toLocaleString('en-US')
      } else {
        this.formModel.price = null
        this.formattedPrice = ''
      }
    },

    openAddModal() {
      this.isEdit = false
      this.formModel = {
        id: null,
        classType: null,
        trainingType: null,
        price: null,
      }
      this.formattedPrice = ''
      this.dialogVisible = true
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.resetValidation()
      })
    },

    closeDialog() {
      this.dialogVisible = false
    },

    async saveData() {
      if (this.$refs.form && !this.$refs.form.validate()) return

      this.submitting = true
      try {
        const payload = {
          classType: this.formModel.classType,
          trainingType: this.formModel.trainingType,
          fee: this.formModel.price,
          channel: 'CMS',
        }

        if (this.isEdit) {
          await this.$axios.$put(
            `/api/feeTeacher/${this.formModel.id}`,
            payload
          )
        } else {
          await this.$axios.$post('/api/feeTeacher', payload)
        }

        this.showSaveToast(
          this.isEdit ? 'Cập nhật thành công' : 'Thêm mới định mức thành công'
        )
        this.closeDialog()
        this.fetchData()
      } catch (error) {
        console.error('Lỗi khi lưu dữ liệu:', error)
        this.showSaveToast('Lưu định mức thất bại', true)
      } finally {
        this.submitting = false
      }
    },

    showSaveToast(message, isError = false) {
      const toast = {
        id: ++this.saveToastCounter,
        message,
        isError,
        duration: 4000,
        timer: null,
      }
      this.saveToasts.unshift(toast)
      toast.timer = setTimeout(() => {
        this.removeSaveToast(toast.id)
      }, toast.duration)
    },

    removeSaveToast(id) {
      const toast = this.saveToasts.find((item) => item.id === id)
      if (toast) clearTimeout(toast.timer)
      this.saveToasts = this.saveToasts.filter((item) => item.id !== id)
    },

    applyFilter() {
      this.filteredList = this.rawList.filter((item) => {
        const matchClass =
          !this.filters.classType || item.classType === this.filters.classType
        const matchTraining =
          !this.filters.trainingType ||
          item.trainingType === this.filters.trainingType
        return matchClass && matchTraining
      })
    },

    handleSearch() {
      this.page = 1
      this.pageInput = '1'
      this.applyFilter()
    },

    handleGo() {
      const p = parseInt(this.pageInput, 10)
      if (p >= 1 && p <= this.totalPages) {
        this.page = p
      } else {
        this.page = 1
        this.pageInput = '1'
      }
    },

    formatCurrency(val) {
      if (val === null || val === undefined) return '0đ'
      return `${Number(val).toLocaleString('vi-VN')}đ`
    },

    editItem(item) {
      this.isEdit = true
      this.formModel = { ...item }
      this.formattedPrice = item.price ? item.price.toLocaleString('en-US') : ''
      this.dialogVisible = true
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.resetValidation()
      })
    },

    prevPage() {
      if (this.page > 1) {
        this.page--
        this.pageInput = String(this.page)
      }
    },

    nextPage() {
      if (this.page < this.totalPages) {
        this.page++
        this.pageInput = String(this.page)
      }
    },
  },
}
</script>

<style scoped>
.bg-red-bk {
  background-color: #a62229 !important;
}
.border {
  border: 1px solid #e0e0e0 !important;
}
.border-btn {
  border: 1px solid #bdbdbd !important;
}
.toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 300px;
}
.gap-1 {
  gap: 4px;
}
.gap-2 {
  gap: 8px;
}
.gap-3 {
  gap: 12px;
}
</style>
