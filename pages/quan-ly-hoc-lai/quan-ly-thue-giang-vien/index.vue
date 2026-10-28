<template>
  <v-container fluid class="pa-6">
    <!-- Tiêu đề trang & Thanh công cụ tìm kiếm / bộ lọc -->
    <div class="d-flex justify-space-between align-center mb-4">
      <div class="text-subtitle-1 font-weight-bold black--text">
        Danh sách cấu hình thuế giảng viên
        <span class="red--text">({{ filteredList.length }})</span>
      </div>

      <div class="d-flex align-center gap-2">
        <!-- Ô tìm kiếm theo tên cấu hình thuế -->
        <v-text-field
          v-model="filters.name"
          label="Tên cấu hình thuế"
          outlined
          dense
          clearable
          hide-details
          style="width: 200px"
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
          style="width: 170px"
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
          style="width: 150px"
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

        <!-- Nút Thêm mới (+) -->
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

    <!-- Bảng dữ liệu (Data Table) -->
    <v-card flat class="rounded-lg border overflow-hidden">
      <v-data-table
        :headers="headers"
        :items="displayList"
        :loading="loading"
        hide-default-footer
        dense
        class="elevation-0 custom-table"
      >
        <!-- STT -->
        <template #[`item.stt`]="{ index }">
          <span class="grey--text text--darken-2">
            {{ (page - 1) * pageSize + index + 1 }}
          </span>
        </template>

        <!-- Tên cấu hình thuế -->
        <template #[`item.name`]="{ item }">
          <span class="black--text font-weight-medium">{{ item.name }}</span>
        </template>

        <!-- Thuế (%) -->
        <template #[`item.taxRate`]="{ item }">
          <span class="black--text">{{ item.taxRate }}%</span>
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
          <div class="d-flex align-center justify-center gap-1">
            <!-- Nút Xem (Mắt xanh) -->
            <v-btn icon x-small @click="viewItem(item)">
              <v-icon color="#2196F3" size="18">mdi-eye</v-icon>
            </v-btn>
            <!-- Nút Sửa (Cây bút vàng) -->
            <v-btn icon x-small @click="editItem(item)">
              <v-icon color="#f59e0b" size="18">mdi-pencil</v-icon>
            </v-btn>
            <!-- Nút Xóa (Thùng rác đỏ) -->
            <v-btn icon x-small @click="deleteItem(item)">
              <v-icon color="#f44336" size="18">mdi-delete</v-icon>
            </v-btn>
          </div>
        </template>
      </v-data-table>

      <!-- Thanh phân trang (Pagination) -->
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
            @click="prevPage"
          >
            <v-icon small>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn small dark color="#A62229" class="px-3" elevation="0">
            {{ page }}
          </v-btn>
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

    <!-- Snackbar thông báo trạng thái -->
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

    <!-- Dialog Thêm mới cấu hình thuế giảng viên -->
    <v-dialog v-model="dialogVisible" max-width="650px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="bg-red-bk white--text pa-3 text-subtitle-1 font-weight-bold">
          Thêm mới cấu hình thuế giảng viên
        </v-card-title>

        <v-card-text class="pa-5">
          <v-form ref="form" v-model="isFormValid">
            <!-- Tên cấu hình thuế -->
            <v-text-field
              v-model="formModel.name"
              label="Tên cấu hình thuế (*)"
              outlined
              dense
              :rules="[(v) => !!v || 'Vui lòng nhập tên cấu hình thuế']"
              class="mb-3"
            ></v-text-field>

            <!-- Thuế (%) -->
            <v-text-field
              v-model.number="formModel.taxRate"
              label="Thuế (%) (*)"
              outlined
              dense
              type="number"
              :rules="[(v) => v !== '' && v !== null && v !== undefined || 'Vui lòng nhập số thuế']"
              class="mb-3"
            ></v-text-field>

            <!-- Trạng thái -->
            <v-select
              v-model="formModel.status"
              items.sync
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

            <!-- Danh sách học kỳ kèm checkbox (Chọn ít nhất 1) -->
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

    <!-- 1. Dialog Xem chi tiết (Ảnh 1) -->
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

    <!-- 2. Dialog Cập nhật (Ảnh 2 & 3) -->
    <v-dialog v-model="editDialogVisible" max-width="650px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="bg-red-bk white--text pa-3 text-subtitle-1 font-weight-bold">
          Cập nhật cấu hình thuế giảng viên
        </v-card-title>
        <v-card-text class="pa-5">
          <v-form ref="editForm">
            <v-text-field v-model="editFormModel.name" label="Tên cấu hình thuế (*)" outlined dense :rules="[v => !!v || 'Vui lòng nhập tên']" class="mb-3"></v-text-field>
            <!-- Thuế (%) - Vô hiệu hóa (disabled) và làm mờ -->
            <v-text-field
              v-model.number="editFormModel.taxRate"
              label="Thuế (%) (*)"
              outlined
              dense
              type="number"
              readonly
              class="mb-3"
            ></v-text-field>            
            <v-select v-model="editFormModel.status" :items="[{ text: 'Kích hoạt', value: 'ACTIVE' }, { text: 'Chưa kích hoạt', value: 'INACTIVE' }] " item-text="text" item-value="value" label="Trạng thái (*)" outlined dense class="mb-3"></v-select>

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

    <!-- 3. Dialog Xác nhận xóa (Ảnh 4 & 5) -->
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
  </v-container>
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

      snackbar: {
        show: false,
        message: '',
        isError: false,
      },
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

        await teacherTaxServices.createTeacherTax(payload)
        this.showSnackbar('Thêm mới thành công')
        this.closeDialog()
        this.fetchData()
      } catch (error) {
        console.error('Lỗi khi thêm mới cấu hình thuế:', error)
        this.showSnackbar('Thêm mới thất bại', true)
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
      // Lấy chính xác ID thật từ database (ưu tiên tuyệt đối item.original.id)
      const realId = item.original?.id || item.original?.original?.id || item.id
      const orig = item.original || item

      const taxVal = orig.tax !== undefined ? orig.tax : (item.taxRate !== undefined ? item.taxRate : 0)

      this.editFormModel = {
        id: realId, // ID thực tế từ database
        name: orig.name || item.name || '',
        taxRate: taxVal,
        status: orig.status || item.status || 'ACTIVE',
      }

      console.log('🐞 [DEBUG] Item được truyền vào editItem:', item)
      console.log('🐞 [DEBUG] ID thực tế lấy được để update:', this.editFormModel.id)

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

        // Đánh dấu check các học kỳ đã liên kết trước đó
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

      if (!this.editFormModel.id) {
        this.showSnackbar('Lỗi: Không tìm thấy ID của bản ghi!', true)
        return
      }

      const semesterIds = this.selectedEditSemesters.map(s => Number(s.id))
      if (semesterIds.length === 0) {
        this.showSnackbar('Vui lòng chọn ít nhất 1 học kỳ', true)
        return
      }

      this.submitting = true
      try {
        const payload = {
          id: Number(this.editFormModel.id),
          name: this.editFormModel.name.trim(),
          tax: Number(this.editFormModel.taxRate) || 0,
          status: this.editFormModel.status,
          semesterIds,
          channel: 'CMS',
        }

        console.log('🚀 [DEBUG] Payload gửi lên update-tax:', payload)

        // Gọi API cập nhật
        await teacherTaxServices.updateTeacherTax(payload)
        
        this.showSnackbar('Cập nhật thành công')
        this.editDialogVisible = false

        // Cập nhật lại giao diện mảng local ngay lập tức
        const targetId = Number(payload.id)
        const foundItem = this.rawList.find(item => Number(item.original?.id || item.id) === targetId)
        
        if (foundItem) {
          foundItem.name = payload.name
          foundItem.status = payload.status
          foundItem.taxRate = payload.tax
          if (foundItem.original) {
            foundItem.original.name = payload.name
            foundItem.original.status = payload.status
            foundItem.original.tax = payload.tax
            foundItem.original.semesters = this.selectedEditSemesters
          }
        }
        this.applyFilter()

      } catch (error) {
        console.error('Lỗi khi cập nhật cấu hình thuế:', error)
        this.showSnackbar('Cập nhật thất bại', true)
      } finally {
        this.submitting = false
      }
    },

    // Đồng bộ tên hàm deleteItem khớp với sự kiện trên giao diện template của bảng
    deleteItem(item) {
      this.itemToDelete = item
      this.deleteDialogVisible = true
    },

    async executeDelete() {
      if (!this.itemToDelete) return
      const id = this.itemToDelete.original?.id || this.itemToDelete.id

      this.submittingDelete = true
      try {
        await teacherTaxServices.deleteTeacherTax(id, { channel: 'CMS' })
        this.showSnackbar('Xóa thành công')
        this.deleteDialogVisible = false
        this.fetchData()
      } catch (error) {
        console.error('Lỗi khi xóa cấu hình thuế:', error)
        this.showSnackbar('Xóa thất bại', true)
      } finally {
        this.submittingDelete = false
        this.itemToDelete = null
      }
    },

    showSnackbar(message, isError = false) {
      this.snackbar = {
        show: true,
        message,
        isError,
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