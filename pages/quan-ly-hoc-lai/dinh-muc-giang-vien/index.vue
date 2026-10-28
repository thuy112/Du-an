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
        ></v-select>

        <!-- Bộ lọc hình thức đào tạo -->
        <v-select
          v-model="filters.trainingType"
          :items="trainingTypeList"
          item-text="text"
          item-value="text"
          label="Hình thức đào tạo"
          outlined
          dense
          clearable
          hide-details
          style="width: 170px"
        ></v-select>

        <!-- Nút Refresh -->
        <v-btn icon small @click="resetAndRefresh">
          <v-icon size="24" color="#A62229">mdi-refresh</v-icon>
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
          <v-icon size="24">mdi-magnify</v-icon>
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
          <v-icon size="24">mdi-plus</v-icon>
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
          <!-- Nút sửa (Cây bút) mở popup cập nhật đúng bản ghi -->
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

      <!-- Phân trang -->
      <div class="d-flex align-center justify-end pa-3 border-t bg-white gap-3">
        <div class="d-flex align-center gap-1 text-caption">
          <span class="grey--text">Bản ghi</span>
          <v-select
            v-model="pageSize"
            :items="[10, 20, 50, 100]"
            dense
            outlined
            hide-details
            style="width: 83px"
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
            <!-- Loại lớp: Khóa khi sửa -->
            <v-select
              v-model="formModel.classType"
              :items="classTypeList"
              label="Loại lớp *"
              outlined
              dense
              :disabled="isEdit"
              :rules="[(v) => !!v || 'Vui lòng chọn loại lớp']"
              class="mb-3"
            ></v-select>

            <!-- Hình thức đào tạo: Khóa khi sửa -->
            <v-select
              v-model="formModel.trainingMethodId"
              :items="trainingTypeList"
              item-text="text"
              item-value="value"
              label="Hình thức đào tạo *"
              outlined
              dense
              :disabled="isEdit"
              :rules="[(v) => !!v || 'Vui lòng chọn hình thức đào tạo']"
              class="mb-3"
            ></v-select>

            <!-- Giá tiền -->
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

    <!-- Snackbar thông báo ẩn/hiện chuẩn xác, không bị lỗi nền đen -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.isError ? 'error' : 'success'"
      top
      right
      timeout="3000"
      elevation="4"
    >
      <div class="d-flex align-center justify-space-between w-100">
        <span>{{ snackbar.message }}</span>
        <v-btn text icon x-small dark @click="snackbar.show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
    </v-snackbar>
  </v-container>
</template>

<script>
import feeTeacherServices from '~/services/feeTeacherServics.js'

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
      trainingTypeList: [],

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
      formattedPrice: '',
      
      formModel: {
        id: null,
        classType: null,
        trainingMethodId: null,
        fee: null,
      },

      snackbar: {
        show: false,
        message: '',
        isError: false,
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
  mounted() {
    this.initPage()
  },
  methods: {
    async initPage() {
      await Promise.all([
        this.fetchTrainingMethods(),
        this.fetchData(),
      ])
    },

    async fetchTrainingMethods() {
      try {
        const res = await feeTeacherServices.getTrainingMethods({ status: 'ACTIVE', channel: 'CMS' })
        const list = res?.data?.objects || res?.data || []
        this.trainingTypeList = list.map((item) => ({
          text: item.name,
          value: item.id,
        }))
      } catch (error) {
        console.error('Lỗi khi tải hình thức đào tạo:', error)
      }
    },

    async fetchData() {
      this.loading = true
      try {
        const params = {
          pageIndex: this.page,
          pageSize: this.pageSize,
          search: this.filters.search || '',
          classType: this.filters.classType ? this.mapClassTypeToCode(this.filters.classType) : undefined,
          channel: 'CMS',
        }
        const res = await feeTeacherServices.getFeeTeachers(params)
        const responseWrapper = res?.data || res
        const items = Array.isArray(responseWrapper.data)
          ? responseWrapper.data
          : Array.isArray(responseWrapper?.objects)
          ? responseWrapper.objects
          : Array.isArray(responseWrapper)
          ? responseWrapper
          : []

        this.rawList = items.map((item, index) => {
          const rawClass = (item.classType || '').trim()
          let mappedClassType = rawClass
          if (rawClass === 'PROJECT_BASED_CLASS') {
            mappedClassType = 'Đồ án môn học'
          } else if (rawClass === 'COMBINE_CLASS') {
            mappedClassType = 'Lớp ghép'
          } else if (rawClass === 'NEW_CLASS' || rawClass === 'OPEN_CLASS') {
            mappedClassType = 'Lớp mở'
          }

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
            // Đảm bảo lấy chuẩn xác trường fee từ API gán vào price để hiển thị lên bảng
            price: Number(
              item.fee !== undefined && item.fee !== null ? item.fee : 0
            ),
            original: item, // Lưu lại object gốc để dùng cho hàm editItem
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

    mapClassTypeToCode(typeName) {
      if (typeName === 'Đồ án môn học') return 'PROJECT_BASED_CLASS'
      if (typeName === 'Lớp ghép') return 'COMBINE_CLASS'
      if (typeName === 'Lớp mở') return 'OPEN_CLASS'
      return typeName
    },

    onPriceInput(val) {
      if (!val) {
        this.formModel.fee = null
        this.formattedPrice = ''
        return
      }
      // Lọc bỏ mọi ký tự không phải số
      const cleanNumber = String(val).replace(/\D/g, '')
      if (cleanNumber) {
        this.formModel.fee = Number(cleanNumber) // Gán trực tiếp giá trị số nguyên vào fee
        this.formattedPrice = this.formModel.fee.toLocaleString('en-US')
      } else {
        this.formModel.fee = null
        this.formattedPrice = ''
      }
    },

    openAddModal() {
      this.isEdit = false
      this.formModel = {
        id: null,
        classType: null,
        trainingMethodId: null,
        fee: null,
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
        if (this.isEdit) {
          // Payload cập nhật theo đúng chuẩn dự án
          const updatePayload = {
            id: this.formModel.id,
            classType: this.mapClassTypeToCode(this.formModel.classType),
            trainingMethodId: this.formModel.trainingMethodId,
            fee: Number(this.formModel.fee), // Đảm bảo ép kiểu số nguyên
            note: this.formModel.note,
            isDelete: 0,
            channel: 'CMS',
          }

          await feeTeacherServices.updateFeeTeacher(this.formModel.id, updatePayload)
          this.showSnackbar('Cập nhật thành công')
        } else {
          // Payload thêm mới giữ nguyên
          const createPayload = {
            classType: this.mapClassTypeToCode(this.formModel.classType),
            trainingMethodId: this.formModel.trainingMethodId,
            fee: Number(this.formModel.fee),
            channel: 'CMS',
          }

          await feeTeacherServices.createFeeTeacher(createPayload)
          this.showSnackbar('Thêm mới định mức thành công')
        }

        this.closeDialog()
        this.fetchData()
      } catch (error) {
        console.error('Lỗi khi lưu dữ liệu:', error)
        this.showSnackbar('Lưu định mức thất bại', true)
      } finally {
        this.submitting = false
      }
    },

    showSnackbar(message, isError = false) {
      this.snackbar = {
        show: true,
        message,
        isError,
      }
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
      this.fetchData()
    },

    resetAndRefresh() {
      this.filters.classType = null
      this.filters.trainingType = null
      this.filters.search = ''
      this.page = 1
      this.pageInput = '1'
      this.fetchData()
    },

    handleGo() {
      const p = parseInt(this.pageInput, 10)
      if (p >= 1 && p <= this.totalPages) {
        this.page = p
        this.fetchData()
      } else {
        this.page = 1
        this.pageInput = '1'
        this.fetchData()
      }
    },

    formatCurrency(val) {
      if (val === null || val === undefined) return '0đ'
      return `${Number(val).toLocaleString('vi-VN')}đ`
    },

    editItem(item) {
      this.isEdit = true
      const orig = item.original || item
      
      // Lấy trực tiếp giá từ thuộc tính price trên hàng hoặc fee trong dữ liệu gốc
      const currentPrice = orig.fee !== undefined ? orig.fee : item.price

      this.formModel = {
        id: orig.id || item.id,
        classType: item.classType,
        trainingMethodId: orig.trainingMethod?.id || orig.trainingMethodId || null,
        fee: currentPrice,
        note: orig.note || null,
        isDelete: 0,
      }
      
      // Đổ giá trị cũ vào ô input để người dùng thấy và sửa
      this.formattedPrice = currentPrice ? Number(currentPrice).toLocaleString('en-US') : ''
      this.dialogVisible = true
      
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.resetValidation()
      })
    },

    prevPage() {
      if (this.page > 1) {
        this.page--
        this.pageInput = String(this.page)
        this.fetchData()
      }
    },

    nextPage() {
      if (this.page < this.totalPages) {
        this.page++
        this.pageInput = String(this.page)
        this.fetchData()
      }
    },
  },
}
</script>

<style scoped>
.bg-red-bk {
  background-color: #a62229 !important;
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