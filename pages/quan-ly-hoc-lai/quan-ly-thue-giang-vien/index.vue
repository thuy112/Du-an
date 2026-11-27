<template>
  <div class="tax-config-page bg-white pa-3 pa-sm-6">
    <!-- Tiêu đề + Thanh tìm kiếm / bộ lọc -->
    <div class="mb-4">
      <div class="text-h6 font-weight-bold black--text mb-2">
        Danh sách cấu hình thuế giảng viên
        <span class="text-red-bold">({{ filteredList.length }})</span>
      </div>

      <div class="d-flex align-center flex-wrap gap-2">
        <!-- Ô tìm kiếm theo tên cấu hình thuế -->
        <v-text-field
          v-model="filters.name"
          label="Tên cấu hình thuế"
          outlined
          dense
          clearable
          hide-details
          class="filter-input flex-grow-1"
          style="min-width: 180px;"
          @keyup.enter="handleSearch"
        ></v-text-field>

        <!-- Dropdown lọc theo Học kỳ -->
        <v-select
          v-model="filters.semesterId"
          :items="semesterList"
          item-text="name"
          item-value="id"
          label="Học kỳ"
          outlined
          dense
          clearable
          hide-details
          class="filter-input flex-grow-1"
          style="min-width: 150px;"
        ></v-select>

        <!-- Dropdown lọc theo Trạng thái -->
        <v-select
          v-model="filters.status"
          :items="statusList"
          item-text="text"
          item-value="value"
          label="Trạng thái"
          outlined
          dense
          clearable
          hide-details
          class="filter-input flex-grow-1"
          style="min-width: 140px;"
        ></v-select>

        <!-- Nút thao tác -->
        <div class="d-flex align-center gap-1 flex-shrink-0">
          <v-btn icon small class="btn-square-action" @click="resetAndRefresh" title="Làm mới">
            <v-icon size="22" color="#A62229">mdi-refresh</v-icon>
          </v-btn>

          <v-btn
            color="#A62229"
            dark
            class="btn-square-action px-3"
            elevation="0"
            @click="handleSearch"
            title="Tìm kiếm"
          >
            <v-icon size="22">mdi-magnify</v-icon>
          </v-btn>

          <v-btn
            color="#A62229"
            dark
            class="btn-square-action px-3"
            elevation="0"
            @click="openAddModal"
            title="Thêm mới"
          >
            <v-icon size="22">mdi-plus</v-icon>
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Bảng dữ liệu + Phân trang bản ghi chạy theo danh sách và cố định khi chạm đáy -->
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
        <!-- STT -->
        <template #[`item.stt`]="{ index }">
          <span class="grey--text text--darken-2 mobile-break-text">
            {{ (page - 1) * pageSize + index + 1 }}
          </span>
        </template>

        <!-- Tên cấu hình thuế -->
        <template #[`item.name`]="{ item }">
          <span class="black--text font-weight-medium mobile-break-text">{{ item.name }}</span>
        </template>

        <!-- Thuế (%) -->
        <template #[`item.taxRate`]="{ item }">
          <span class="black--text mobile-break-text">{{ item.taxRate }}%</span>
        </template>

        <!-- Trạng thái (Chip Kích hoạt / Chưa kích hoạt) -->
        <template #[`item.status`]="{ item }">
          <v-chip
            x-small
            class="white--text font-weight-medium px-3"
            :color="item.status === 'ACTIVE' || item.status === 1 ? '#A62229' : 'grey darken-1'"
          >
            {{ (item.status === 'ACTIVE' || item.status === 1) ? 'Kích hoạt' : 'Chưa kích hoạt' }}
          </v-chip>
        </template>

        <!-- Thao tác: Xem, Sửa, Xóa -->
        <template #[`item.actions`]="{ item }">
          <div class="d-flex align-center justify-end justify-sm-center gap-1">
            <v-btn icon x-small @click="viewItem(item)" title="Xem">
              <v-icon color="#2196F3" size="22">mdi-eye</v-icon>
            </v-btn>
            <v-btn icon x-small @click="editItem(item)" title="Sửa">
              <v-icon color="#f59e0b" size="22">mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon x-small @click="deleteItem(item)" title="Xóa">
              <v-icon color="#f44336" size="22">mdi-delete</v-icon>
            </v-btn>
          </div>
        </template>
      </v-data-table>

      <!-- Thanh phân trang bản ghi -->
      <div class="sticky-pagination-bar d-flex align-center justify-center justify-sm-end flex-wrap gap-2 pa-3 border-top bg-white">
        <div class="d-flex align-center flex-wrap justify-center justify-sm-end gap-2">
          <div class="d-flex align-center gap-1 text-caption">
            <span class="grey--text text-no-wrap">Bản ghi</span>
            <v-select
              v-model="pageSize"
              :items="[10, 20, 50, 100]"
              dense
              outlined
              hide-details
              class="pagination-control"
              style="width: 82px;"
              @change="handleSearch"
            ></v-select>
          </div>

          <div class="d-flex align-center gap-1 text-caption">
            <span class="grey--text text-no-wrap">Trang</span>
            <v-text-field
              v-model="pageInput"
              dense
              outlined
              hide-details
              class="pagination-control"
              style="width: 58px; text-align: center;"
              @keyup.enter="handleGo"
            ></v-text-field>
            <v-btn
              small
              dark
              color="#A62229"
              class="text-none px-3"
              height="34"
              elevation="0"
              @click="handleGo"
            >
              Đi
            </v-btn>
          </div>

          <div class="d-flex align-center gap-1">
            <v-btn
              outlined
              small
              :disabled="page <= 1"
              class="px-2"
              style="min-width: 32px; height: 32px;"
              @click="prevPage"
            >
              <v-icon small>mdi-chevron-left</v-icon>
            </v-btn>
            <v-btn small dark color="#A62229" class="px-3" style="min-width: 32px; height: 32px;" elevation="0">
              {{ page }}
            </v-btn>
            <v-btn
              outlined
              small
              :disabled="page >= totalPages"
              class="px-2"
              style="min-width: 32px; height: 32px;"
              @click="nextPage"
            >
              <v-icon small>mdi-chevron-right</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </v-card>

    <!-- DANH SÁCH TOAST MÀU XANH LÁ: MỚI Ở TRÊN, CŨ TỤT XUỐNG DƯỚI, CHẠM VÀO SẼ TẮT -->
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

    <!-- Dialog Thêm mới cấu hình thuế giảng viên -->
    <v-dialog v-model="dialogVisible" max-width="650px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="bg-red-bk white--text pa-3 text-subtitle-1 font-weight-bold">
          Thêm mới cấu hình thuế giảng viên
        </v-card-title>

        <v-card-text class="pa-5">
          <v-form ref="form" v-model="isFormValid">
            <v-text-field
              v-model="formModel.name"
              label="Tên cấu hình thuế (*)"
              outlined
              dense
              :rules="[(v) => !!v || 'Vui lòng nhập tên cấu hình thuế']"
              class="mb-3"
            ></v-text-field>

            <v-text-field
              v-model.number="formModel.taxRate"
              label="Thuế (%) (*)"
              outlined
              dense
              type="number"
              :rules="[(v) => v !== '' && v !== null && v !== undefined || 'Vui lòng nhập số thuế']"
              class="mb-3"
            ></v-text-field>

            <v-select
              v-model="formModel.status"
              :items="[
                { text: 'Kích hoạt', value: 'ACTIVE' },
                { text: 'Chưa kích hoạt', value: 'INACTIVE' }
              ]"
              item-text="text"
              item-value="value"
              label="Trạng thái (*)"
              outlined
              dense
              class="mb-3"
            ></v-select>

            <div class="text-subtitle-2 font-weight-bold mb-1">
              Danh sách học kỳ (<span :class="formModel.semesterIds.length > 0 ? 'success--text' : 'red--text'">{{ formModel.semesterIds.length }}/2</span>)
            </div>

            <v-card flat class="border rounded overflow-hidden mb-2">
              <v-data-table
                v-model="selectedSemesters"
                :headers="semesterHeaders"
                :items="popupSemesterList"
                item-key="id"
                show-select
                hide-default-footer
                dense
                class="elevation-0"
              >
                <template #[`item.status`]="{ item }">
                  <v-chip
                    x-small
                    class="white--text font-weight-medium px-3"
                    :color="item.status === 'ACTIVE' ? '#A62229' : 'grey darken-1'"
                  >
                    {{ item.status === 'ACTIVE' ? 'Kích hoạt' : 'Chưa kích hoạt' }}
                  </v-chip>
                </template>
              </v-data-table>
            </v-card>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-3 justify-end bg-gray-50 border-t">
          <v-btn outlined small class="text-none px-4" @click="closeDialog">Đóng</v-btn>
          <v-btn
            color="#A62229"
            dark
            small
            class="text-none px-4"
            :loading="submitting"
            @click="saveData"
          >
            Lưu
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 1. Dialog Xem chi tiết -->
    <v-dialog v-model="viewDialogVisible" max-width="650px">
      <v-card class="rounded-lg">
        <v-card-title class="bg-red-bk white--text pa-3 text-subtitle-1 font-weight-bold">
          Chi tiết cấu hình thuế giảng viên
        </v-card-title>
        <v-card-text class="pa-5">
          <v-card outlined class="pa-4 mb-4 rounded-lg grey lighten-4">
            <div class="text-subtitle-1 font-weight-bold red--text.darken-2 mb-2">Thông tin cấu hình thuế</div>
            <div>Tên cấu hình thuế: <b>{{ viewItemData.name }}</b></div>
            <div>Thuế (%): <b>{{ viewItemData.tax }}%</b></div>
            <div>Trạng thái: <b class="red--text">{{ viewItemData.status }}</b></div>
          </v-card>

          <div class="text-subtitle-2 font-weight-bold mb-2">Danh sách học kỳ ({{ viewItemData.semesters.length }})</div>
          <v-data-table
            :headers="semesterHeaders"
            :items="viewItemData.semesters"
            hide-default-footer
            dense
            class="border rounded"
          >
            <template #[`item.timeRange`]="{ item }">
              <span>{{ item.fromTime ? item.fromTime.split(' ')[0] : '' }} - {{ item.toTime ? item.toTime.split(' ')[0] : '' }}</span>
            </template>
            <template #[`item.status`]="{ item }">
              <v-chip x-small class="white--text" :color="item.status === 'ACTIVE' ? '#A62229' : 'grey'">
                {{ item.status === 'ACTIVE' ? 'Kích hoạt' : 'Chưa kích hoạt' }}
              </v-chip>
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions class="pa-3 justify-end">
          <v-btn outlined small @click="viewDialogVisible = false">Đóng</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 2. Dialog Cập nhật -->
    <v-dialog v-model="editDialogVisible" max-width="650px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="bg-red-bk white--text pa-3 text-subtitle-1 font-weight-bold">
          Cập nhật cấu hình thuế giảng viên
        </v-card-title>
        <v-card-text class="pa-5">
          <v-form ref="editForm">
            <v-text-field v-model="editFormModel.name" label="Tên cấu hình thuế (*)" outlined dense :rules="[v => !!v || 'Vui lòng nhập tên']" class="mb-3"></v-text-field>
            <v-text-field
              v-model.number="editFormModel.taxRate"
              label="Thuế (%) (*)"
              outlined
              dense
              type="number"
              readonly
              class="mb-3"
            ></v-text-field>
            <v-select v-model="editFormModel.status" :items="[{ text: 'Kích hoạt', value: 'ACTIVE' }, { text: 'Chưa kích hoạt', value: 'INACTIVE' }]" item-text="text" item-value="value" label="Trạng thái (*)" outlined dense class="mb-3"></v-select>

            <div class="text-subtitle-2 font-weight-bold mb-1">
              Danh sách học kỳ (<span class="success--text">{{ selectedEditSemesters.length }}/2</span>)
            </div>
            <v-data-table
              v-model="selectedEditSemesters"
              :headers="semesterHeaders"
              :items="popupSemesterList"
              item-key="id"
              show-select
              hide-default-footer
              dense
              class="border rounded"
            >
              <template #[`item.status`]="{ item }">
                <v-chip x-small class="white--text" :color="item.status === 'ACTIVE' ? '#A62229' : 'grey'">
                  {{ item.status === 'ACTIVE' ? 'Kích hoạt' : 'Chưa kích hoạt' }}
                </v-chip>
              </template>
            </v-data-table>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-3 justify-end">
          <v-btn outlined small @click="editDialogVisible = false">Đóng</v-btn>
          <v-btn color="#A62229" dark small :loading="submitting" @click="updateData">Lưu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 3. Dialog Xác nhận xóa -->
    <v-dialog v-model="deleteDialogVisible" max-width="450px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="bg-red-bk white--text pa-3 text-subtitle-1 font-weight-bold">
          Xác nhận xóa
        </v-card-title>
        <v-card-text class="pa-5 text-body-1">
          Bạn có chắc chắn muốn xóa cấu hình thuế <b>{{ itemToDelete?.name }}</b> không?
        </v-card-text>
        <v-card-actions class="pa-3 justify-end">
          <v-btn outlined small @click="deleteDialogVisible = false">Đóng</v-btn>
          <v-btn color="#A62229" dark small :loading="submittingDelete" @click="executeDelete">Xóa</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import teacherTaxServices from '~/services/teacherTaxServices.js'
import BaseTable from '@/components/Base/BaseTable.vue'

export default {
  name: 'TeacherTaxPage',
  layout: 'default',
  ssr: false,
  data() {
    return {
      loading: false,
      submitting: false,
      isFormValid: true,

      filters: {
        name: '',
        semesterId: null,
        status: null,
      },
      semesterList: [],
      statusList: [
        { text: 'Kích hoạt', value: 'ACTIVE' },
        { text: 'Chưa kích hoạt', value: 'INACTIVE' },
      ],

      // Dialog Xem chi tiết
      viewDialogVisible: false,
      viewItemData: { name: '', tax: 0, status: '', semesters: [] },

      // Dialog Cập nhật
      editDialogVisible: false,
      editFormModel: { id: null, name: '', taxRate: null, status: 'ACTIVE', semesterIds: [] },
      selectedEditSemesters: [],

      // Dialog Xác nhận xóa
      deleteDialogVisible: false,
      itemToDelete: null,
      submittingDelete: false,

      rawList: [],
      filteredList: [],

      headers: [
        { text: 'STT', value: 'stt', width: '70px', align: 'center', sortable: false },
        { text: 'Tên cấu hình thuế', value: 'name', sortable: false },
        { text: 'Thuế (%)', value: 'taxRate', sortable: false },
        { text: 'Trạng thái', value: 'status', sortable: false },
        { text: 'Thao tác', value: 'actions', width: '130px', align: 'center', sortable: false },
      ],

      page: 1,
      pageSize: 50,
      pageInput: '1',

      // Quản lý Modal Thêm mới
      dialogVisible: false,
      popupSemesterList: [],
      selectedSemesters: [],
      semesterHeaders: [
        { text: 'Mã học kỳ', value: 'code', sortable: false },
        { text: 'Tên học kỳ', value: 'name', sortable: false },
        { text: 'Thời gian', value: 'timeRange', sortable: false },
        { text: 'Trạng thái', value: 'status', sortable: false },
      ],
      formModel: {
        name: '',
        taxRate: null,
        status: 'ACTIVE',
        semesterIds: [],
      },

      toastList: [],
      toastSeed: 0,
    }
  },
  computed: {
    BaseTable,

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
        this.fetchSemesters(),
        this.fetchData(),
      ])
    },

    // Lấy danh sách học kỳ qua Service
    async fetchSemesters() {
      try {
        const res = await teacherTaxServices.getSemesters({ status: 'ACTIVE', channel: 'CMS' })
        const list = res?.data?.objects || res?.data || []
        this.semesterList = list.map((item) => ({
          id: item.id,
          name: item.name || item.semesterName,
        }))
      } catch (error) {
        console.error('Lỗi khi tải danh sách học kỳ:', error)
      }
    },

    // Lấy danh sách cấu hình thuế qua Service
    async fetchData() {
      this.loading = true
      try {
        const params = {
          pageIndex: this.page,
          pageSize: this.pageSize,
          name: this.filters.name || '',
          semesterId: this.filters.semesterId || undefined,
          status: this.filters.status || undefined,
          channel: 'CMS',
        }
        const res = await teacherTaxServices.getTeacherTax(params)
        const responseWrapper = res?.data || res

        // Bóc tách mảng dữ liệu cấu hình thuế từ res.data.data
        const items = Array.isArray(responseWrapper?.data?.data)
          ? responseWrapper.data.data
          : Array.isArray(responseWrapper?.data)
          ? responseWrapper.data
          : Array.isArray(responseWrapper)
          ? responseWrapper
          : []

        this.rawList = items.map((item, index) => {
          const rawStatus = String(item.status || '').trim().toUpperCase()
          const isActive = rawStatus === 'ACTIVE'

          return {
            id: item.id || index + 1,
            name: item.name || 'Chưa đặt tên',
            taxRate: item.tax !== undefined ? item.tax : 0,
            status: isActive ? 'ACTIVE' : 'INACTIVE',
            semesters: item.semesters || [],
            original: item,
          }
        })
      } catch (error) {
        console.error('Lỗi khi tải danh sách cấu hình thuế:', error)
        this.rawList = []
      } finally {
        this.loading = false
        this.applyFilter()
      }
    },

    applyFilter() {
      this.filteredList = this.rawList.filter((item) => {
        const matchName = !this.filters.name || item.name.toLowerCase().includes(this.filters.name.toLowerCase())
        const matchStatus = !this.filters.status || item.status === this.filters.status
        return matchName && matchStatus
      })
    },

    handleSearch() {
      this.page = 1
      this.pageInput = '1'
      this.fetchData()
    },

    handlePageChange(newPage) {
      this.page = newPage
      this.fetchData()
    },

    handlePageSizeChange(newSize) {
      this.pageSize = newSize
      this.page = 1
      this.fetchData()
    },

    resetAndRefresh() {
      this.filters.name = ''
      this.filters.semesterId = null
      this.filters.status = null
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

    async openAddModal() {
      this.formModel = {
        name: '',
        taxRate: null,
        status: 'ACTIVE',
        semesterIds: [],
      }
      this.selectedSemesters = []

      try {
        const res = await teacherTaxServices.getSemesters({ status: 'ACTIVE', channel: 'CMS' })
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.data || [])

        this.popupSemesterList = list.map((item) => {
          const rawFrom = item.fromTime || ''
          const rawTo = item.toTime || ''
          const fromDate = rawFrom ? rawFrom.split(' ')[0] : ''
          const toDate = rawTo ? rawTo.split(' ')[0] : ''
          const timeRange = fromDate && toDate ? `${fromDate} - ${toDate}` : (fromDate || toDate || '-')

          return {
            id: item.id,
            code: item.code || item.id,
            name: item.name || item.semesterName,
            timeRange,
            status: item.status || 'ACTIVE',
          }
        })
      } catch (error) {
        console.error('Lỗi tải học kỳ:', error)
        this.popupSemesterList = []
      }

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

    // Lưu dữ liệu thêm mới (có chặn trùng tên)
    async saveData() {
      if (this.$refs.form && !this.$refs.form.validate()) return

      const trimmedName = (this.formModel.name || '').trim().toLowerCase()
      const isDuplicate = this.rawList.some(
        (item) => (item.name || '').trim().toLowerCase() === trimmedName
      )

      if (isDuplicate) {
        this.showSnackbar('Tên cấu hình thuế không được trùng nhau!', true)
        return
      }

      const semesterIds = this.selectedSemesters.map((s) => s.id)
      if (semesterIds.length === 0) {
        this.showSnackbar('Vui lòng chọn ít nhất 1 học kỳ', true)
        return
      }

      this.submitting = true
      try {
        const payload = {
          name: this.formModel.name.trim(),
          tax: Number(this.formModel.taxRate),
          status: this.formModel.status,
          semesterIds,
          channel: 'CMS',
        }

        const res = await teacherTaxServices.createTeacherTax(payload)
        this.showSnackbar(this.extractApiMessage(res, 'Thêm mới thành công'))
        this.closeDialog()
        this.fetchData()
      } catch (error) {
        console.error('Lỗi khi thêm mới cấu hình thuế:', error)
        this.showSnackbar(
          this.extractApiMessage(error?.response?.data || error, 'Thêm mới thất bại'),
          true
        )
      } finally {
        this.submitting = false
      }
    },

    viewItem(item) {
      this.viewItemData = {
        name: item.name || '',
        tax: item.taxRate !== undefined ? item.taxRate : (item.original?.tax || 0),
        status: item.status === 'ACTIVE' ? 'Kích hoạt' : 'Chưa kích hoạt',
        semesters: item.original?.semesters || [],
      }
      this.viewDialogVisible = true
    },

    async editItem(item) {
      const realId = item.original?.id || item.original?.original?.id || item.id
      const orig = item.original || item
      const taxVal = orig.tax !== undefined ? orig.tax : (item.taxRate !== undefined ? item.taxRate : 0)

      this.editFormModel = {
        id: realId,
        name: orig.name || item.name || '',
        taxRate: taxVal,
        status: orig.status || item.status || 'ACTIVE',
      }

      this.selectedEditSemesters = []
      this.popupSemesterList = []

      try {
        const res = await teacherTaxServices.getSemesters({ status: 'ACTIVE', channel: 'CMS' })
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.data || [])

        this.popupSemesterList = list.map((sem) => {
          const rawFrom = sem.fromTime || ''
          const rawTo = sem.toTime || ''
          const fromDate = rawFrom ? rawFrom.split(' ')[0] : ''
          const toDate = rawTo ? rawTo.split(' ')[0] : ''
          const timeRange = fromDate && toDate ? `${fromDate} - ${toDate}` : (fromDate || toDate || '-')

          return {
            id: sem.id,
            code: sem.code || sem.id,
            name: sem.name || sem.semesterName,
            timeRange,
            status: sem.status || 'ACTIVE',
          }
        })

        const assignedSemesterIds = (orig.semesters || []).map(s => s.id)
        this.selectedEditSemesters = this.popupSemesterList.filter(s => assignedSemesterIds.includes(s.id))
      } catch (error) {
        console.error('Lỗi tải danh sách học kỳ khi sửa:', error)
      }

      this.editDialogVisible = true
      this.$nextTick(() => {
        if (this.$refs.editForm) this.$refs.editForm.resetValidation()
      })
    },

    async updateData() {
      if (this.$refs.editForm && !this.$refs.editForm.validate()) return

      const semesterIds = this.selectedEditSemesters.map(s => Number(s.id))
      if (semesterIds.length === 0) {
        this.showSnackbar('Vui lòng chọn ít nhất 1 học kỳ', true)
        return
      }

      const recordId = this.editFormModel.id || this.editFormModel.original?.id
      if (!recordId) {
        this.showSnackbar('Lỗi: Không tìm thấy ID bản ghi!', true)
        return
      }

      this.submitting = true
      try {
        const params = {
          id: Number(recordId),
          teacherTaxId: Number(recordId),
          name: this.editFormModel.name.trim(),
          tax: Number(this.editFormModel.taxRate) || 0,
          status: this.editFormModel.status,
          semesterIds,
          channel: 'CMS',
        }

        const res = await teacherTaxServices.updateTeacherTax(params)

        if (res && (res.success || res.status === 200 || !res.error)) {
          this.showSnackbar(this.extractApiMessage(res, 'Cập nhật thành công'))
          this.editDialogVisible = false

          this.$emit('success')
          if (typeof this.fetchData === 'function') {
            await this.fetchData()
          }
        } else {
          this.showSnackbar(this.extractApiMessage(res, 'Có lỗi xảy ra khi cập nhật'), true)
        }
      } catch (error) {
        console.error('Error updating teacher tax:', error)
        this.showSnackbar(
          this.extractApiMessage(error?.response?.data || error, 'Có lỗi xảy ra'),
          true
        )
      } finally {
        this.submitting = false
      }
    },

    deleteItem(item) {
      this.itemToDelete = item
      this.deleteDialogVisible = true
    },

    async executeDelete() {
      if (!this.itemToDelete) return
      const id = this.itemToDelete.original?.id || this.itemToDelete.id

      this.submittingDelete = true
      try {
        const res = await teacherTaxServices.deleteTeacherTax(id, { channel: 'CMS' })
        this.showSnackbar(this.extractApiMessage(res, 'Xóa thành công'))
        this.deleteDialogVisible = false
        this.fetchData()
      } catch (error) {
        console.error('Lỗi khi xóa cấu hình thuế:', error)
        this.showSnackbar(
          this.extractApiMessage(error?.response?.data || error, 'Xóa thất bại'),
          true
        )
      } finally {
        this.submittingDelete = false
        this.itemToDelete = null
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
.text-red-bold {
  color: #a62229 !important;
}
.bg-white {
  background-color: #ffffff !important;
}
.border-top {
  border-top: 1px solid #e0e0e0;
}
.cursor-pointer {
  cursor: pointer;
}
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }

.tax-config-page {
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

.filter-input >>> .v-input__slot {
  border-radius: 6px !important;
  min-height: 38px !important;
}
.btn-square-action {
  border-radius: 6px !important;
  height: 38px !important;
  min-width: 38px !important;
}
.pagination-control >>> .v-input__control {
  min-height: 34px !important;
}
.pagination-control >>> .v-input__slot {
  min-height: 34px !important;
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

::v-deep .v-data-footer {
  display: none !important;
}

@media (max-width: 599px) {
  .tax-config-page {
    max-width: 100vw;
    overflow-x: hidden;
  }

  .mobile-break-text,
  .v-data-table__mobile-row__cell {
    max-width: 62%;
    overflow-wrap: anywhere;
    word-break: break-word;
  }
}
</style>