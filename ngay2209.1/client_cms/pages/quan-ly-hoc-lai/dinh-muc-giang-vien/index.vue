<template>
  <v-container fluid class="pa-6">
    <!-- Tiêu đề trang -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold black--text">Quản lý định mức giảng dạy</h1>
        <p class="text-subtitle-2 text-grey-darken-1 mb-0">Quản lý và thiết lập định mức chi phí giảng dạy cho các loại lớp</p>
      </div>
      <v-btn color="#A62229" dark class="text-none font-weight-medium rounded-sm" elevation="0" @click="openAddModal">
        <v-icon left small>mdi-plus</v-icon> Thêm định mức mới
      </v-btn>
    </div>

    <!-- Khung tìm kiếm và lọc -->
    <v-card flat class="pa-4 mb-4 rounded-lg border">
      <v-row dense align="center">
        <v-col cols="12" sm="3">
          <v-select
            v-model="filters.classType"
            :items="classTypeList"
            label="Loại lớp"
            outlined
            dense
            clearable
            hide-details
          ></v-select>
        </v-col>
        <v-col cols="12" sm="3">
          <v-select
            v-model="filters.trainingType"
            :items="trainingTypeList"
            label="Hình thức đào tạo"
            outlined
            dense
            clearable
            hide-details
          ></v-select>
        </v-col>
        <v-col cols="12" sm="4">
          <v-text-field
            v-model="filters.search"
            label="Tìm kiếm..."
            outlined
            dense
            clearable
            hide-details
            append-icon="mdi-magnify"
            @keyup.enter="handleSearch"
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="2" class="d-flex gap-2">
          <v-btn color="#A62229" dark small class="text-none flex-grow-1" elevation="0" @click="handleSearch">
            Lọc
          </v-btn>
          <v-btn outlined small class="text-none flex-grow-1" @click="resetFilters">
            Đặt lại
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- Bảng dữ liệu -->
    <v-card flat class="rounded-lg border overflow-hidden">
      <v-data-table
        :headers="headers"
        :items="displayList"
        :loading="loading"
        hide-default-footer
        dense
        class="elevation-0"
      >
        <template v-slot:[`item.stt`]="{ index }">
          <span>{{ (page - 1) * pageSize + index + 1 }}</span>
        </template>

        <template v-slot:[`item.price`]="{ item }">
          <span class="font-weight-bold text-red-bold">{{ formatCurrency(item.price) }}</span>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-btn icon small color="primary" @click="editItem(item)">
            <v-icon small>mdi-pencil</v-icon>
          </v-btn>
        </template>
      </v-data-table>

      <!-- Phân trang -->
      <div class="d-flex align-center justify-space-between pa-4 border-t bg-white">
        <div class="text-caption grey--text">
          Hiển thị từ {{ displayList.length ? (page - 1) * pageSize + 1 : 0 }} đến {{ (page - 1) * pageSize + displayList.length }} trong tổng số {{ filteredList.length }} kết quả
        </div>
        <div class="d-flex align-center gap-2">
          <v-btn outlined small :disabled="page <= 1" @click="prevPage">Trước</v-btn>
          <span class="text-caption mx-2">Trang {{ page }} / {{ totalPages }}</span>
          <v-btn outlined small :disabled="page >= totalPages" @click="nextPage">Sau</v-btn>
        </div>
      </div>
    </v-card>

    <!-- Dialog Thêm/Sửa Định Mức -->
    <v-dialog v-model="dialogVisible" max-width="500px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="bg-red-bk white--text pa-3 text-subtitle-1 font-weight-bold">
          {{ isEdit ? 'Cập nhật định mức giảng dạy' : 'Thêm mới định mức giảng dạy' }}
        </v-card-title>

        <v-card-text class="pa-5">
          <v-form ref="form" v-model="isFormValid">
            <v-select
              v-model="formModel.classType"
              :items="classTypeList"
              label="Loại lớp *"
              outlined
              dense
              :rules="[v => !!v.trim() || 'Vui lòng chọn loại lớp']"
              class="mb-3"
            ></v-select>

            <v-select
              v-model="formModel.trainingType"
              :items="trainingTypeList"
              label="Hình thức đào tạo *"
              outlined
              dense
              :rules="[v => !!v.trim() || 'Vui lòng chọn hình thức đào tạo']"
              class="mb-3"
            ></v-select>

            <v-text-field
              v-model="formattedPrice"
              label="Định mức phí (VNĐ) *"
              outlined
              dense
              :rules="[v => !!v || 'Vui lòng nhập định mức phí']"
              @input="onPriceInput"
            ></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-3 justify-end bg-gray-50 border-t">
          <v-btn outlined small class="text-none px-4" @click="closeDialog">Đóng</v-btn>
          <v-btn color="#A62229" dark small class="text-none px-4" :loading="submitting" @click="saveData">Lưu</v-btn>
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

            // Filter data
            filters: {
                classType: null,
                trainingType: null,
                search: ''
            },
            classTypeList: ['Đồ án môn học', 'Lớp ghép', 'Lớp mở'],
            trainingTypeList: ['Chính quy', 'Vừa làm vừa học', 'Ngắn hạn'],

            rawList: [],
            filteredList: [],

            // Phân trang
            page: 1,
            pageSize: 50,
            pageInput: '1',

            // Dialog Modal State
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
                price: null
            }
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
        }
    },
    beforeDestroy() {
        this.saveToasts.forEach(toast => clearTimeout(toast.timer))
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
                    channel: 'CMS'
                }
                const res = await this.$axios.$get('/api/feeTeacher', { params })
                const responseWrapper = res?.data || {}
                const items = Array.isArray(responseWrapper.data)
                    ? responseWrapper.data
                    : (Array.isArray(responseWrapper) ? responseWrapper : (Array.isArray(res) ? res : []))

                this.rawList = items.map((item, index) => {
                    // Map lại mã loại lớp từ API sang tên hiển thị tiếng Việt nếu cần
                    let mappedClassType = item.classType || item.loaiLop || 'Lớp mở'
                    if (mappedClassType === 'PROJECT_BASED_CLASS') mappedClassType = 'Đồ án môn học'
                    else if (mappedClassType === 'COMBINE_CLASS') mappedClassType = 'Lớp ghép'
                    else if (mappedClassType === 'NEW_CLASS') mappedClassType = 'Lớp mở'

                    return {
                        id: item.id || (index + 1),
                        classType: mappedClassType,
                        trainingType: item.trainingType || item.hinhThucDaoTao || 'Chính quy',
                        // Lấy chuẩn xác giá tiền từ trường "fee" của API
                        price: Number(item.fee !== undefined && item.fee !== null ? item.fee : (item.price || 0)),
                        original: item
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
                price: null
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
                    fee: this.formModel.price, // Gửi lên đúng tên trường fee theo API
                    channel: 'CMS'
                }

                if (this.isEdit) {
                    await this.$axios.$put(`/api/feeTeacher/${this.formModel.id}`, payload)
                } else {
                    await this.$axios.$post('/api/feeTeacher', payload)
                }

                this.showSaveToast(this.isEdit ? 'Cập nhật thành công' : 'Thêm mới định mức thành công')
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
                timer: null
            }
            this.saveToasts.unshift(toast)
            toast.timer = setTimeout(() => {
                this.removeSaveToast(toast.id)
            }, toast.duration)
        },

        removeSaveToast(id) {
            const toast = this.saveToasts.find(item => item.id === id)
            if (toast) clearTimeout(toast.timer)
            this.saveToasts = this.saveToasts.filter(item => item.id !== id)
        },

        applyFilter() {
            this.filteredList = this.rawList.filter((item) => {
                const matchClass = !this.filters.classType || item.classType === this.filters.classType
                const matchTraining = !this.filters.trainingType || item.trainingType === this.filters.trainingType
                return matchClass && matchTraining
            })
        },

        handleSearch() {
            this.page = 1
            this.pageInput = '1'
            this.fetchData()
        },

        resetFilters() {
            this.filters.classType = null
            this.filters.trainingType = null
            this.filters.search = ''
            this.page = 1
            this.pageInput = '1'
            this.fetchData()
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
        }
    }
}
</script>

<style scoped>
.bg-red-bk { background-color: #A62229 !important; }
.text-red-bold { color: #A62229 !important; }
.border { border: 1px solid #E0E0E0 !important; }
.toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 300px;
}
.gap-2 { gap: 8px; }
</style>