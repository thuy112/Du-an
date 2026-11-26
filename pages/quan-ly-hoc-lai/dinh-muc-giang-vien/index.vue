<template>
  <div class="dinh-muc-phi-page pa-3 pa-sm-6 bg-white">
    <!-- Tiêu đề trang & Thanh công cụ -->
    <v-row align="center" justify="space-between" class="mb-4">
      <v-col cols="12" md="auto" class="py-1">
        <div class="text-subtitle-1 font-weight-bold black--text">
          Danh sách quy định mức phí
          <span class="red--text">({{ totalRecords || filteredList.length }})</span>
        </div>
      </v-col>

      <v-col cols="12" md="auto" class="py-1">
        <div class="d-flex align-center flex-wrap justify-md-end gap-2">
          <!-- Bộ lọc loại lớp -->
          <v-select
            v-model="filters.classType"
            :items="classTypeList"
            label="Loại lớp"
            outlined
            dense
            clearable
            hide-details
            class="toolbar-filter"
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
            class="toolbar-filter toolbar-filter-wide"
          ></v-select>

          <!-- Cụm nút chức năng -->
          <div class="d-flex align-center gap-2 flex-shrink-0">
            <v-btn icon small aria-label="Làm mới" @click="resetAndRefresh">
              <v-icon size="24" color="#A62229">mdi-refresh</v-icon>
            </v-btn>

            <v-btn
              color="#A62229"
              dark
              small
              class="px-3"
              elevation="0"
              aria-label="Tìm kiếm"
              @click="handleSearch"
            >
              <v-icon size="24">mdi-magnify</v-icon>
            </v-btn>

            <v-btn
              color="#A62229"
              dark
              small
              class="px-3"
              elevation="0"
              aria-label="Thêm mới"
              @click="openAddModal"
            >
              <v-icon size="24">mdi-plus</v-icon>
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Bảng dữ liệu + Phân trang chạy theo danh sách và neo ở đáy khi cần -->
    <v-card flat class="rounded-lg border">
      <v-data-table
        :headers="headers"
        :items="displayList"
        :loading="loading"
        :items-per-page="-1"
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
            aria-label="Chỉnh sửa"
            @click="editItem(item)"
          >
            <v-icon color="#f59e0b">mdi-pencil</v-icon>
          </v-btn>
        </template>
      </v-data-table>

      <!-- Phân trang chạy theo danh sách và cố định khi chạm đáy viewport -->
      <div class="sticky-pagination-bar d-flex justify-center justify-sm-end pa-3 border-t bg-white">
        <BasePagination
          :page="page"
          :page-count="totalPages"
          :page-size="pageSize"
          :total-record="totalRecords"
          @changePage="handlePageChange"
          @changePageSize="handlePageSizeChange"
        />
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
              :disabled="isEdit"
              :rules="[(v) => !!v || 'Vui lòng chọn loại lớp']"
              class="mb-3"
            ></v-select>

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

    <!-- DANH SÁCH TOAST: MỚI Ở TRÊN, CŨ TỤT XUỐNG DƯỚI, CHẠM VÀO SẼ TẮT -->
    <div class="toast-stack-container">
      <transition-group name="toast-slide" tag="div" class="d-flex flex-column" style="gap: 8px;">
        <div
          v-for="toast in toastList"
          :key="toast.id"
          class="custom-toast-card white--text elevation-4 cursor-pointer"
          :style="{ backgroundColor: toast.isError ? '#d32f2f' : '#4caf50' }"
          @click="removeToast(toast.id)"
        >
          <div class="d-flex align-center justify-space-between px-4 py-3">
            <div class="d-flex align-center pr-2">
              <v-icon dark size="20" class="mr-2 flex-shrink-0">
                {{ toast.isError ? 'mdi-alert-circle' : 'mdi-check-circle' }}
              </v-icon>
              <span class="font-weight-medium text-body-2">{{ toast.message }}</span>
            </div>
            <v-btn icon dark x-small class="flex-shrink-0" @click.stop="removeToast(toast.id)">
              <v-icon size="18">mdi-close</v-icon>
            </v-btn>
          </div>

          <div class="toast-progress-track">
            <div
              class="toast-progress-bar"
              :style="{ animationDuration: `${toast.duration}ms` }"
            ></div>
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
import feeTeacherServices from '~/services/feeTeacherServics.js'
import BasePagination from '~/components/Base/Pagination.vue'

export default {
  name: 'DinhMucPhiPage',
  components: {
    BasePagination,
  },
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
      totalRecords: 0,

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

      toastList: [],
      toastSeed: 0,
    }
  },
  computed: {
    totalPages() {
      const total = this.totalRecords || this.filteredList.length
      const pages = Math.ceil(total / this.pageSize)
      return pages > 0 ? pages : 1
    },
    displayList() {
      return this.filteredList
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
        const res = await feeTeacherServices.getTrainingMethods({
          status: 'ACTIVE',
          channel: 'CMS',
        })
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
          classType: this.filters.classType
            ? this.mapClassTypeToCode(this.filters.classType)
            : undefined,
          channel: 'CMS',
        }
        const res = await feeTeacherServices.getFeeTeachers(params)
        const responseWrapper = res?.data || res
        const rawContainer =
          responseWrapper?.data && !Array.isArray(responseWrapper.data)
            ? responseWrapper.data
            : responseWrapper

        const items = Array.isArray(rawContainer?.data)
          ? rawContainer.data
          : Array.isArray(rawContainer?.content)
          ? rawContainer.content
          : Array.isArray(rawContainer?.items)
          ? rawContainer.items
          : Array.isArray(responseWrapper?.objects)
          ? responseWrapper.objects
          : Array.isArray(responseWrapper)
          ? responseWrapper
          : []

        this.totalRecords = Number(
          rawContainer?.totalElements ??
            rawContainer?.totalRecords ??
            rawContainer?.total ??
            responseWrapper?.totalElements ??
            responseWrapper?.totalRecords ??
            items.length
        )

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
            price: Number(
              item.fee !== undefined && item.fee !== null ? item.fee : 0
            ),
            original: item,
          }
        })
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu định mức phí:', error)
        this.rawList = []
        this.totalRecords = 0
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
      const cleanNumber = String(val).replace(/\D/g, '')
      if (cleanNumber) {
        this.formModel.fee = Number(cleanNumber)
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

    extractApiMessage(res, fallbackMessage) {
      return (
        res?.error?.message ||
        res?.data?.error?.message ||
        res?.message ||
        res?.data?.message ||
        fallbackMessage
      )
    },

    async saveData() {
      if (this.$refs.form && !this.$refs.form.validate()) return

      this.submitting = true
      try {
        if (this.isEdit) {
          const updatePayload = {
            id: this.formModel.id,
            classType: this.mapClassTypeToCode(this.formModel.classType),
            trainingMethodId: this.formModel.trainingMethodId,
            fee: Number(this.formModel.fee),
            note: this.formModel.note,
            isDelete: 0,
            channel: 'CMS',
          }

          const res = await feeTeacherServices.updateFeeTeacher(
            this.formModel.id,
            updatePayload
          )
          this.showSnackbar(this.extractApiMessage(res, 'Cập nhật thành công'))
        } else {
          const createPayload = {
            classType: this.mapClassTypeToCode(this.formModel.classType),
            trainingMethodId: this.formModel.trainingMethodId,
            fee: Number(this.formModel.fee),
            channel: 'CMS',
          }

          const res = await feeTeacherServices.createFeeTeacher(createPayload)
          this.showSnackbar(this.extractApiMessage(res, 'Thêm mới định mức thành công'))
        }

        this.closeDialog()
        this.fetchData()
      } catch (error) {
        console.error('Lỗi khi lưu dữ liệu:', error)
        this.showSnackbar(
          this.extractApiMessage(error?.response?.data || error, 'Lưu định mức thất bại'),
          true
        )
      } finally {
        this.submitting = false
      }
    },

    showSnackbar(message, isError = false, duration = 3000) {
      const id = `${Date.now()}-${++this.toastSeed}`
      const toast = {
        id,
        message,
        isError,
        duration,
        timer: null,
      }

      toast.timer = setTimeout(() => {
        this.removeToast(id)
      }, duration)

      this.toastList.unshift(toast)
    },

    removeToast(id) {
      const index = this.toastList.findIndex((item) => item.id === id)
      if (index === -1) return

      const [target] = this.toastList.splice(index, 1)
      if (target && target.timer) {
        clearTimeout(target.timer)
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
      this.fetchData()
    },

    resetAndRefresh() {
      this.filters.classType = null
      this.filters.trainingType = null
      this.filters.search = ''
      this.page = 1
      this.fetchData()
    },

    formatCurrency(val) {
      if (val === null || val === undefined) return '0đ'
      return `${Number(val).toLocaleString('vi-VN')}đ`
    },

    editItem(item) {
      this.isEdit = true
      const orig = item.original || item
      const currentPrice = orig.fee !== undefined ? orig.fee : item.price

      this.formModel = {
        id: orig.id || item.id,
        classType: item.classType,
        trainingMethodId:
          orig.trainingMethod?.id || orig.trainingMethodId || null,
        fee: currentPrice,
        note: orig.note || null,
        isDelete: 0,
      }

      this.formattedPrice = currentPrice
        ? Number(currentPrice).toLocaleString('en-US')
        : ''
      this.dialogVisible = true

      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.resetValidation()
      })
    },

    handlePageChange(val) {
      this.page = val
      this.fetchData()
    },

    handlePageSizeChange(val) {
      this.page = 1
      this.pageSize = val
      this.fetchData()
    },
  },
}
</script>

<style scoped>
.bg-red-bk {
  background-color: #a62229 !important;
}
.bg-white {
  background-color: #ffffff !important;
}
.border-t {
  border-top: 1px solid #e0e0e0;
}
.cursor-pointer {
  cursor: pointer;
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

.dinh-muc-phi-page {
  min-height: 100dvh;
  background-color: #ffffff;
}

.sticky-pagination-bar {
  position: sticky;
  bottom: 0;
  z-index: 4;
  background-color: #ffffff;
  border-bottom-left-radius: inherit;
  border-bottom-right-radius: inherit;
}

.toolbar-filter {
  width: 150px;
  min-width: 140px;
  flex: 1 1 150px;
}

.toolbar-filter-wide {
  width: 180px;
  min-width: 160px;
  flex: 1 1 180px;
}

.toast-stack-container {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 2500;
  width: 340px;
  max-width: calc(100vw - 32px);
  pointer-events: none;
}

.custom-toast-card {
  position: relative;
  border-radius: 6px;
  overflow: hidden;
  pointer-events: auto;
}

.toast-progress-track {
  position: relative;
  left: 0;
  right: 0;
  bottom: 0;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.25);
  overflow: hidden;
}

.toast-progress-bar {
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.85);
  transform-origin: left center;
  animation-name: toast-countdown;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

@keyframes toast-countdown {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

.toast-slide-enter-active,
.toast-slide-leave-active,
.toast-slide-move {
  transition: all 0.25s ease;
}

.toast-slide-enter {
  opacity: 0;
  transform: translateY(-10px);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(24px);
}

@media (min-width: 960px) {
  .toolbar-filter {
    flex: 0 0 150px;
  }

  .toolbar-filter-wide {
    flex: 0 0 180px;
  }
}

@media (max-width: 599px) {
  .dinh-muc-phi-page {
    max-width: 100vw;
    overflow-x: hidden;
  }
}
</style>