<template>
  <div class="semester-container">
    <!-- KHU VỰC 1: CỐ ĐỊNH PHÍA TRÊN (Tiêu đề + Bộ lọc) -->
    <div class="fixed-top-section">
      <div class="text-h6 font-weight-bold black--text mb-3">
        Danh sách học kỳ (<span class="text-red-bold">{{ totalRecords }}</span>)
      </div>

      <div class="filter-container mb-2">
        <div class="d-flex align-center flex-wrap" style="gap: 8px; padding: 6px 0;">
          <!-- Tìm kiếm -->
          <v-text-field
            v-model="filters.search"
            placeholder="Tìm kiếm"
            outlined
            dense
            hide-details
            clearable
            class="filter-input flex-grow-1"
            style="min-width: 200px;"
            @keyup.enter="handleSearch"
          ></v-text-field>

          <!-- Trạng thái -->
          <v-select
            v-model="filters.status"
            :items="statusList"
            item-text="text"
            item-value="value"
            placeholder="Trạng thái"
            outlined
            dense
            hide-details
            clearable
            class="filter-input flex-grow-1"
            style="min-width: 150px;"
          ></v-select>

          <!-- Các nút hành động bộ lọc -->
          <div class="d-flex align-center" style="gap: 5px;">
            <v-btn icon color="#A62229" class="btn-square-action" @click="refreshData" title="Làm mới">
              <v-icon size="22">mdi-refresh</v-icon>
            </v-btn>
            <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="handleSearch" title="Tìm kiếm">
              <v-icon size="22">mdi-magnify</v-icon>
            </v-btn>
            <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="openAddDialog" title="Thêm mới">
              <v-icon size="22">mdi-plus</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- KHU VỰC 2: BẢNG DỮ LIỆU Ở GIỮA -->
    <div class="scrollable-table-section">
      <BaseTable
        :headers="headers"
        :items="itemList"
        :loading="loading"
        :current-page="currentPage"
        :items-per-page="itemsPerPage"
        :total-records="totalRecords"
        hide-default-footer
        @page-change="changePage"
        @per-page-change="handlePerPageChange"
      >
        <template #[`item.stt`]="{ index }">
          <span>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</span>
        </template>
        <template #[`item.code`]="{ item }">
          <span class="font-weight-medium">{{ item.code || '-' }}</span>
        </template>
        <template #[`item.name`]="{ item }">
          <span>{{ item.name || '-' }}</span>
        </template>
        <template #[`item.timeRange`]="{ item }">
          <span>{{ formatTimeRange(item) }}</span>
        </template>
        <template #[`item.status`]="{ item }">
          <ChangeableStatus
            :status="item.status"
            :statusList="statusList"
            @changeStatus="(selectedItem) => handleStatusChange(item, selectedItem)"
          >
            <template #content="{ data }">
              Bạn có chắc chắn muốn đổi trạng thái sang <span class="font-weight-bold red--text">{{ data.text }}</span> không?
            </template>
          </ChangeableStatus>
        </template>
        <template #[`item.actions`]="{ item }">
          <div class="d-flex align-center justify-center" style="gap: 6px;">
            <v-btn icon small color="amber darken-3" @click="handleEdit(item)" title="Sửa">
              <v-icon size="24">mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon small color="error" @click="handleDelete(item)" title="Xóa">
              <v-icon size="24">mdi-trash-can</v-icon>
            </v-btn>
          </div>
        </template>
      </BaseTable>
    </div>

    <!-- KHU VỰC 3: CỐ ĐỊNH PHÍA DƯỚI (Phân trang) -->
    <div class="fixed-bottom-section d-flex align-center justify-space-between flex-wrap gap-3 border-top">
      <div></div>

      <div class="d-flex align-center" style="gap: 16px;">
        <div class="d-flex align-center" style="gap: 8px;">
          <span style="font-size: 13px; color: #666;">Bản ghi</span>
          <v-select
            v-model="itemsPerPage"
            :items="[5, 10, 20, 50, 100]"
            outlined
            dense
            hide-details
            style="width: 80px;"
            @change="handlePerPageChange(itemsPerPage)"
          ></v-select>
        </div>

        <div class="d-flex align-center" style="gap: 8px;">
          <span style="font-size: 13px; color: #666;">Trang</span>
          <v-text-field
            v-model.number="pageInput"
            outlined
            dense
            hide-details
            type="number"
            style="width: 70px;"
            @keyup.enter="goToPage"
          ></v-text-field>
          <v-btn color="#A2212B" dark depressed class="text-none px-3" height="36" @click="goToPage">Đi</v-btn>
        </div>

        <div class="d-flex align-center" style="gap: 4px;">
          <v-btn icon outlined small color="grey" :disabled="currentPage <= 1" @click="changePage(currentPage - 1)">
            <v-icon small>mdi-chevron-left</v-icon>
          </v-btn>
          
          <template v-for="page in displayedPages">
            <v-btn
              v-if="page !== '...'"
              :key="page"
              :color="currentPage === page ? '#A2212B' : 'white'"
              :dark="currentPage === page"
              depressed
              small
              class="px-2"
              style="min-width: 32px; height: 32px;"
              :style="currentPage !== page ? 'border: 1px solid #e0e0e0; color: #333;' : ''"
              @click="changePage(page)"
            >
              {{ page }}
            </v-btn>
            <span v-else :key="'dot-' + page" class="px-1 text-grey">...</span>
          </template>

          <v-btn icon outlined small color="grey" :disabled="currentPage >= totalPages" @click="changePage(currentPage + 1)">
            <v-icon small>mdi-chevron-right</v-icon>
          </v-btn>
        </div>
      </div>
    </div>

    <!-- MODAL THÊM MỚI / CẬP NHẬT HỌC KỲ -->
    <v-dialog v-model="dialog" max-width="650px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <div class="px-6 py-4 text-white font-weight-bold d-flex justify-space-between align-items-center" style="background-color: #A62229; font-size: 18px;">
          <span>{{ isEdit ? 'Cập nhật học kỳ' : 'Thêm mới học kỳ' }}</span>
          <v-btn icon dark @click="dialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>

        <v-card-text class="pa-6 pt-6">
          <v-form ref="form">
            <!-- Tên học kỳ -->
            <div class="mb-4">
              <label class="d-block mb-1 font-weight-medium">Tên học kỳ <span class="text-red-bold">*</span></label>
              <v-text-field
                v-model="formModel.name"
                placeholder="Nhập tên học kỳ"
                outlined
                dense
                hide-details
              ></v-text-field>
            </div>

            <!-- Mã học kỳ -->
            <div class="mb-4">
              <label class="d-block mb-1 font-weight-medium">Mã học kỳ <span class="text-red-bold">*</span></label>
              <v-text-field
                v-model="formModel.code"
                placeholder="Nhập mã học kỳ"
                outlined
                dense
                hide-details
              ></v-text-field>
            </div>

            <!-- Từ ngày & Đến ngày -->
            <div class="d-flex" style="gap: 16px;">
              <div class="flex-grow-1 mb-4">
                <label class="d-block mb-1 font-weight-medium">Từ ngày</label>
                <v-menu
                  v-model="fromMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="formattedFromDate"
                      placeholder="DD/MM/YYYY"
                      outlined
                      dense
                      hide-details
                      readonly
                      v-bind="attrs"
                      v-on="on"
                      clearable
                      @click:clear="formModel.fromTime = ''"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="formModel.fromTime"
                    locale="vi"
                    @input="fromMenu = false"
                  ></v-date-picker>
                </v-menu>
              </div>

              <div class="flex-grow-1 mb-4">
                <label class="d-block mb-1 font-weight-medium">Đến ngày</label>
                <v-menu
                  v-model="toMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="formattedToDate"
                      placeholder="DD/MM/YYYY"
                      outlined
                      dense
                      hide-details
                      readonly
                      v-bind="attrs"
                      v-on="on"
                      clearable
                      @click:clear="formModel.toTime = ''"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="formModel.toTime"
                    locale="vi"
                    @input="toMenu = false"
                  ></v-date-picker>
                </v-menu>
              </div>
            </div>

            <!-- Trạng thái -->
            <div class="mb-2">
              <label class="d-block mb-1 font-weight-medium">Trạng thái <span class="text-red-bold">*</span></label>
              <v-select
                v-model="formModel.status"
                :items="statusList"
                item-text="text"
                item-value="value"
                outlined
                dense
                hide-details
              ></v-select>
            </div>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4 justify-end" style="gap: 8px;">
          <v-btn text class="text-none px-4" @click="dialog = false">Đóng</v-btn>
          <v-btn color="#A2212B" dark depressed class="text-none px-6" :loading="submitting" @click="handleSave">Lưu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MODAL XÁC NHẬN XÓA -->
    <v-dialog v-model="deleteDialog" max-width="500px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <div class="px-6 py-4 text-white font-weight-bold d-flex justify-space-between align-items-center" style="background-color: #A62229; font-size: 18px;">
          <span>Xác nhận</span>
          <v-btn icon dark @click="deleteDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        <v-card-text class="pa-6 text-body-1">
          Xác nhận xóa học kỳ <span class="font-weight-bold red--text">{{ selectedItemToDelete ? selectedItemToDelete.name : '' }}</span>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4 justify-end" style="gap: 8px;">
          <v-btn text class="text-none px-4" @click="deleteDialog = false">Đóng</v-btn>
          <v-btn color="#A2212B" dark depressed class="text-none px-6" :loading="deleting" @click="confirmDelete">Xác Nhận</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- SNACKBAR THÔNG BÁO XANH (GÓC PHẢI PHÍA TRÊN) -->
    <v-snackbar
      v-model="snackbar"
      color="#4caf50"
      top
      right
      timeout="3000"
      class="custom-snackbar"
    >
      <div class="d-flex align-center">
        <v-icon left dark>mdi-check-circle</v-icon>
        <span>{{ snackbarText }}</span>
      </div>
      <template v-slot:action="{ attrs }">
        <v-btn text dark v-bind="attrs" @click="snackbar = false">
          <v-icon small>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import ChangeableStatus from '~/components/Base/ChangeableStatus.vue'
import semesterService from '~/services/semesterService'

export default {
  name: 'SemesterManagementPage',
  components: { BaseTable, ChangeableStatus },
  data() {
    return {
      loading: false,
      submitting: false,
      deleting: false,
      itemList: [],
      totalRecords: 0,
      totalPages: 1,
      currentPage: 1,
      pageInput: 1,
      itemsPerPage: 50,

      // Modal Trạng thái
      dialog: false,
      isEdit: false,
      editId: null,
      fromMenu: false,
      toMenu: false,

      // Modal Xóa
      deleteDialog: false,
      selectedItemToDelete: null,

      // Snackbar
      snackbar: false,
      snackbarText: '',

      formModel: {
        name: '',
        code: '',
        fromTime: '',
        toTime: '',
        status: 'ACTIVE'
      },

      statusList: [
        { value: 'ACTIVE', text: 'Kích hoạt', color: '#a2212b' },
        { value: 'INACTIVE', text: 'Chưa kích hoạt', color: '#9e9e9e' }
      ],

      filters: { search: '', status: '' },
      activeFilters: { search: '', status: '' },

      headers: [
        { text: 'STT', value: 'stt', align: 'center', width: '60px', sortable: false },
        { text: 'Mã học kỳ', value: 'code', align: 'left', minWidth: '140px', sortable: false },
        { text: 'Tên học kỳ', value: 'name', align: 'left', minWidth: '180px', sortable: false },
        { text: 'Thời gian', value: 'timeRange', align: 'left', minWidth: '200px', sortable: false },
        { text: 'Trạng thái', value: 'status', align: 'center', minWidth: '140px', sortable: false },
        { text: 'Chức năng', value: 'actions', align: 'center', minWidth: '100px', sortable: false }
      ]
    }
  },
  computed: {
    displayedPages() {
      const total = this.totalPages
      const current = this.currentPage
      const pages = []
      if (total <= 7) {
        for (let i = 1; i <= total; i++) pages.push(i)
      } else if (current <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', total)
      } else if (current >= total - 3) {
        pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total)
      } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', total)
      }
      return pages
    },
    formattedFromDate: {
      get() {
        if (!this.formModel.fromTime) return ''
        const parts = this.formModel.fromTime.split('-')
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
        return this.formModel.fromTime
      },
      set(val) { if (!val) this.formModel.fromTime = '' }
    },
    formattedToDate: {
      get() {
        if (!this.formModel.toTime) return ''
        const parts = this.formModel.toTime.split('-')
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
        return this.formModel.toTime
      },
      set(val) { if (!val) this.formModel.toTime = '' }
    }
  },
  async mounted() {
    await Promise.all([this.loadPageRole(), this.loadUserInfo()])
    await this.loadData()
  },
  methods: {
    async loadPageRole() {
      try { await semesterService.getPageRole() } catch (err) {}
    },
    async loadUserInfo() {
      try { await semesterService.getUserInfo() } catch (err) {}
    },
    async loadData() {
      this.loading = true
      try {
        const params = {
          pageIndex: this.currentPage,
          pageSize: this.itemsPerPage,
          channel: 'CMS',
          ...(this.activeFilters.search && { search: this.activeFilters.search }),
          ...(this.activeFilters.status && { status: this.activeFilters.status })
        }
        const res = await semesterService.getSemesterList(params)
        if (res) {
          const rootData = res.data !== undefined ? res.data : res
          const items = Array.isArray(rootData) ? rootData : (rootData.data || rootData.content || rootData.items || [])
          this.itemList = items
          this.totalRecords = Number(rootData.totalElements ?? rootData.totalRecords ?? items.length)
          this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage) || 1
        }
      } catch (err) {
        console.error('Lỗi tải danh sách học kỳ:', err)
      } finally {
        this.loading = false
      }
    },
    formatTimeRange(item) {
      if (item.fromTime && item.toTime) {
        const cleanFrom = item.fromTime.split(' ')[0].replace(/ 00:00:00/g, '')
        const cleanTo = item.toTime.split(' ')[0].replace(/ 00:00:00/g, '')
        return `${cleanFrom} - ${cleanTo}`
      }
      return item.timeRange || item.time || '-'
    },
    openAddDialog() {
      this.isEdit = false
      this.editId = null
      this.formModel = { name: '', code: '', fromTime: '', toTime: '', status: 'ACTIVE' }
      this.dialog = true
    },
    async handleEdit(item) {
      this.isEdit = true
      this.editId = item.id
      try {
        const res = await semesterService.getSemesterDetail(item.id, 'CMS')
        const detail = res.data !== undefined ? res.data : res
        
        // Hàm bóc tách lấy chính xác chuỗi YYYY-MM-DD cho v-date-picker
        const parseDatePickerValue = (dateStr) => {
          if (!dateStr) return ''
          // Nếu có khoảng trắng (ví dụ "2026-03-01 00:00:00"), lấy phần trước khoảng trắng
          const cleanStr = dateStr.split(' ')[0] // Sửa từ let thành const ở đây
          // Kiểm tra nếu chuỗi có dạng DD/MM/YYYY thì đảo lại thành YYYY-MM-DD cho v-date-picker hiểu
          if (cleanStr.includes('/')) {
            const parts = cleanStr.split('/')
            if (parts.length === 3) {
              return `${parts[2]}-${parts[1]}-${parts[0]}`
            }
          }
          return cleanStr
        }

        this.formModel = {
          name: detail.name || item.name || '',
          code: detail.code || item.code || '',
          fromTime: parseDatePickerValue(detail.fromTime || item.fromTime || ''),
          toTime: parseDatePickerValue(detail.toTime || item.toTime || ''),
          status: detail.status || item.status || 'ACTIVE'
        }
        this.dialog = true
      } catch (err) {
        console.error('Lỗi lấy chi tiết học kỳ:', err)
      }
    },
    async handleSave() {
      if (!this.formModel.name || !this.formModel.code) return
      this.submitting = true
      try {
        // Chuyển đổi từ YYYY-MM-DD sang DD/MM/YYYY 00:00:00 khớp với dữ liệu gốc của hệ thống
        const formatPayloadDate = (dateStr) => {
          if (!dateStr) return ''
          // Nếu đã có dạng YYYY-MM-DD từ v-date-picker
          const parts = dateStr.split('-')
          if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]} 00:00:00`
          }
          return dateStr
        }

        const payload = {
          name: this.formModel.name,
          code: this.formModel.code,
          fromTime: formatPayloadDate(this.formModel.fromTime),
          toTime: formatPayloadDate(this.formModel.toTime),
          status: this.formModel.status
        }

        if (this.isEdit) {
          await semesterService.updateSemester(this.editId, payload, 'CMS')
          this.snackbarText = 'Cập nhật học kỳ thành công'
        } else {
          await semesterService.createSemester(payload, 'CMS')
          this.snackbarText = 'Thêm mới học kỳ thành công'
        }

        this.dialog = false
        this.snackbar = true
        await this.loadData()
      } catch (err) {
        console.error('Lỗi lưu học kỳ:', err)
      } finally {
        this.submitting = false
      }
    },
    handleDelete(item) {
      this.selectedItemToDelete = item
      this.deleteDialog = true
    },
    async confirmDelete() {
      if (!this.selectedItemToDelete) return
      this.deleting = true
      try {
        await semesterService.deleteSemester(this.selectedItemToDelete.id, 'CMS')
        this.deleteDialog = false
        this.snackbarText = 'Xóa học kỳ thành công'
        this.snackbar = true
        await this.loadData()
      } catch (err) {
        console.error('Lỗi xóa học kỳ:', err)
      } finally {
        this.deleting = false
      }
    },
    handleSearch() {
      this.activeFilters = { ...this.filters }
      this.currentPage = 1
      this.loadData()
    },
    refreshData() {
      this.filters = { search: '', status: '' }
      this.activeFilters = { search: '', status: '' }
      this.currentPage = 1
      this.loadData()
    },
    changePage(page) {
      if (page < 1 || page > this.totalPages) return
      this.currentPage = page
      this.pageInput = page
      this.loadData()
    },
    goToPage() {
      const p = parseInt(this.pageInput)
      if (p >= 1 && p <= this.totalPages) this.changePage(p)
      else this.pageInput = this.currentPage
    },
    handlePerPageChange(size) {
      this.itemsPerPage = Number(size)
      this.currentPage = 1
      this.loadData()
    },
    async handleStatusChange(item, selectedItem) {
      try {
        const val = selectedItem.value || selectedItem
        await semesterService.changeSemesterStatus(item.id, { status: val }, 'CMS')
        item.status = val
        await this.loadData()
      } catch (err) {
        console.error('Lỗi đổi trạng thái học kỳ:', err)
      }
    }
  }
}
</script>

<style scoped>
.semester-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  max-height: calc(100vh - 64px);
  overflow: hidden;
  padding: 16px;
  box-sizing: border-box;
}
.fixed-top-section {
  flex-shrink: 0;
  background-color: #ffffff;
  z-index: 5;
}
.scrollable-table-section {
  flex: 1 1 auto;
  overflow-y: auto;
  min-height: 0;
  background-color: #ffffff;
}
.fixed-bottom-section {
  flex-shrink: 0;
  background-color: #ffffff;
  padding: 8px 16px;
  z-index: 5;
}
.scrollable-table-section >>> th {
  position: sticky !important;
  top: 0;
  z-index: 3;
  background-color: #f5f5f5 !important;
}
.text-red-bold { color: #A62229 !important; }
.filter-input >>> .v-input__slot { border-radius: 6px !important; min-height: 38px !important; }
.btn-square-action { border-radius: 6px !important; height: 38px !important; min-width: 38px !important; }
::v-deep .v-data-footer { display: none !important; }
.custom-snackbar >>> .v-snack__wrapper {
  top: 20px !important;
  right: 20px !important;
  position: fixed !important;
}
</style>