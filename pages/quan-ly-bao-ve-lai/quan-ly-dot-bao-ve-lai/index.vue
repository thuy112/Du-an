<template>
  <div class="redefense-exam-page pa-3 pa-md-4 bg-white" :class="{ 'is-mobile-device': isMobileDevice }">
    <!-- TIÊU ĐỀ TRANG -->
    <div class="text-h6 font-weight-bold black--text mb-3">
      Danh sách đợt bảo vệ lại (<span class="text-red-bold">{{ totalRecords }}</span>)
    </div>

    <!-- BỘ LỌC TÌM KIẾM CỐ ĐỊNH PHÍA TRÊN -->
    <div class="filter-container mb-3 sticky-filter">
      <div class="d-flex align-center flex-wrap" style="gap: 8px; padding: 6px;">
        <v-text-field
          v-model="filters.search"
          label="Tìm kiếm"
          outlined
          dense
          hide-details
          clearable
          class="filter-input flex-grow-1"
          style="min-width: 200px;"
          @keyup.enter="handleSearch"
        ></v-text-field>

        <!-- Từ ngày -->
        <v-menu
          v-model="menuFromDate"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              :value="formatDisplayDate(filters.fromTime)"
              label="Từ ngày"
              readonly
              outlined
              dense
              hide-details
              clearable
              class="filter-input"
              style="min-width: 150px; max-width: 170px;"
              v-bind="attrs"
              v-on="on"
              @click:clear="filters.fromTime = ''"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="filters.fromTime"
            :max="filters.toTime || undefined"
            color="#A62229"
            locale="vi"
            @input="menuFromDate = false"
          ></v-date-picker>
        </v-menu>

        <!-- Đến ngày -->
        <v-menu
          v-model="menuToDate"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              :value="formatDisplayDate(filters.toTime)"
              label="Đến ngày"
              readonly
              outlined
              dense
              hide-details
              clearable
              class="filter-input"
              style="min-width: 150px; max-width: 170px;"
              v-bind="attrs"
              v-on="on"
              @click:clear="filters.toTime = ''"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="filters.toTime"
            :min="filters.fromTime || undefined"
            color="#A62229"
            locale="vi"
            @input="menuToDate = false"
          ></v-date-picker>
        </v-menu>

        <!-- Trạng thái -->
        <v-select
          v-model="filters.status"
          :items="statusList"
          item-text="text"
          item-value="value"
          label="Trạng thái"
          outlined
          dense
          hide-details
          clearable
          class="filter-input"
          style="min-width: 150px;"
        ></v-select>

        <!-- Nút thao tác -->
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

    <!-- KHUNG BASETABLE -->
    <div class="table-scroll-container">
      <BaseTable
        :headers="tableHeaders"
        :items="itemList"
        :loading="loading"
        :current-page="currentPage"
        :items-per-page="itemsPerPage"
        :total-records="totalRecords"
        hide-default-footer
        @page-change="changePage"
        @per-page-change="handleItemsPerPageChange"
      >
        <template #[`item.stt`]="{ index }">
          <span>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</span>
        </template>

        <template #[`item.name`]="{ item }">
          <span class="font-weight-medium">{{ item.name || '-' }}</span>
        </template>

        <template #[`item.code`]="{ item }">
          <span>{{ item.code || '-' }}</span>
        </template>

        <template #[`item.semester`]="{ item }">
          <span>{{ item.semester ? (item.semester.name || item.semester.code) : '-' }}</span>
        </template>

        <template #[`item.durationTime`]="{ item }">
          <span>{{ formatDateRange(item.fromTime, item.toTime) }}</span>
        </template>

        <template #[`item.status`]="{ item }">
          <ChangeableStatus
            :status="item.status"
            :statusList="statusList"
            @changeStatus="(selectedItem) => handleStatusChange(item, selectedItem)"
          >
            <template #content="{ data }">
              Bạn có chắc chắn muốn đổi trạng thái sang 
              <span class="font-weight-bold red--text">{{ data.text }}</span> không?
            </template>
          </ChangeableStatus>
        </template>

        <!-- Cột Chức năng -->
        <template #[`item.actions`]="{ item }">
          <div class="d-flex align-center justify-center" style="gap: 4px;">
            <v-btn icon small color="info" @click="handleView(item)" title="Xem chi tiết">
              <v-icon size="18">mdi-eye</v-icon>
            </v-btn>
            <v-btn icon small color="amber darken-2" @click="handleEdit(item)" title="Sửa">
              <v-icon size="18">mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon small color="error" @click="handleDelete(item)" title="Xóa">
              <v-icon size="18">mdi-delete</v-icon>
            </v-btn>
          </div>
        </template>
      </BaseTable>
    </div>

    <!-- THANH PHÂN TRANG -->
    <div class="pagination-bottom-container mt-4 pt-3 d-flex align-center justify-space-between flex-wrap gap-3 sticky-bottom-bar border-top">
      <div class="d-flex align-center">
        <!-- Khu vực nút phụ nếu cần -->
      </div>

      <div class="d-flex align-center custom-pagination-group" style="gap: 8px;">
        <v-select
          v-model="itemsPerPage"
          :items="[5, 10, 20, 50, 100]"
          label="Bản ghi"
          outlined
          dense
          hide-details
          class="per-page-select"
          style="width: 90px;"
          @change="handleItemsPerPageChange(itemsPerPage)"
        ></v-select>

        <div class="d-flex align-center" style="gap: 4px;">
          <v-text-field
            v-model.number="pageInput"
            label="Trang"
            outlined
            dense
            hide-details
            type="number"
            style="width: 70px;"
            @keyup.enter="goToPage"
          ></v-text-field>
          <v-btn color="#A2212B" dark depressed class="text-none px-3" height="36" @click="goToPage">
            Đi
          </v-btn>
        </div>

        <v-btn icon outlined small color="grey" :disabled="currentPage <= 1" @click="changePage(currentPage - 1)">
          <v-icon small>mdi-chevron-left</v-icon>
        </v-btn>

        <div class="d-flex align-center" style="gap: 4px;">
          <template v-for="p in totalPages">
            <v-btn
              v-if="p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)"
              :key="p"
              :color="p === currentPage ? '#A2212B' : 'grey lighten-2'"
              :dark="p === currentPage"
              depressed
              min-width="32"
              height="32"
              small
              @click="changePage(p)"
            >
              {{ p }}
            </v-btn>
            <span v-else-if="p === currentPage - 2 || p === currentPage + 2" :key="'dot-' + p">...</span>
          </template>
        </div>

        <v-btn icon outlined small color="grey" :disabled="currentPage >= totalPages" @click="changePage(currentPage + 1)">
          <v-icon small>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- MODAL THÊM MỚI -->
    <AddRedefenseModal v-model="isAddModalOpen" @success="onAddSuccess" />
    
    <!-- MODAL CẬP NHẬT / XEM CHI TIẾT -->
    <RedefenseModal 
      v-model="isModalOpen" 
      :edit-id="selectedEditId" 
      :is-view-only="isViewOnlyMode"
      @success="onModalSuccess" 
    />

    <!-- TOAST THÔNG BÁO -->
    <v-snackbar
      v-model="snackbar.show"
      top
      right
      timeout="3000"
      color="#4caf50"
      elevation="4"
    >
      <div class="d-flex align-center">
        <v-icon left dark class="mr-2">mdi-check-circle</v-icon>
        <span class="white--text font-weight-medium">{{ snackbar.text }}</span>
      </div>
    </v-snackbar>
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import ChangeableStatus from '~/components/Base/ChangeableStatus.vue'
import AddRedefenseModal from '~/components/AddRedefenseModal.vue'
import RedefenseModal from '~/components/RedefenseModal.vue'
import redefenseExamService from '~/services/redefenseExamService'

export default {
  name: 'RedefenseExamPage',
  components: {
    BaseTable,
    ChangeableStatus,
    AddRedefenseModal,
    RedefenseModal,
  },
  data() {
    return {
      isMobileDevice: false,
      loading: false,
      isAddModalOpen: false,
      isModalOpen: false,
      isViewOnlyMode: false,
      selectedEditId: null,
      menuFromDate: false,
      menuToDate: false,
      filters: {
        search: '',
        fromTime: '',
        toTime: '',
        status: '',
      },
      activeFilters: {
        search: '',
        fromTime: '',
        toTime: '',
        status: '',
      },
      snackbar: {
        show: false,
        text: '',
      },
      statusList: [
        { text: 'Kích hoạt', value: 'ACTIVE', color: '#A62229' },
        { text: 'Chưa kích hoạt', value: 'INACTIVE', color: '#757575' },
      ],

      itemList: [],
      totalRecords: 0,
      totalPages: 1,
      currentPage: 1,
      pageInput: 1,
      itemsPerPage: 50,

      tableHeaders: [
        { text: 'STT', value: 'stt', align: 'center', width: '60px', sortable: false },
        { text: 'Tên đợt đăng ký bảo vệ lại', value: 'name', align: 'left', minWidth: '220px', sortable: false },
        { text: 'Mã đợt đăng ký bảo vệ lại', value: 'code', align: 'left', minWidth: '180px', sortable: false },
        { text: 'Học kỳ', value: 'semester', align: 'center', minWidth: '120px', sortable: false },
        { text: 'Thời gian đăng ký', value: 'durationTime', align: 'center', minWidth: '180px', sortable: false },
        { text: 'Trạng thái', value: 'status', align: 'center', minWidth: '140px', sortable: false },
        { text: 'Chức năng', value: 'actions', align: 'center', width: '120px', sortable: false },
      ],
    }
  },
  async mounted() {
    if (typeof navigator !== 'undefined') {
      this.isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }
    await this.loadData()
  },
  methods: {
    formatDisplayDate(dateStr) {
      if (!dateStr) return ''
      const date = dateStr.split(/[ T]/)[0]
      if (date.includes('/')) return date
      const [year, month, day] = date.split('-')
      return year && month && day ? `${day}/${month}/${year}` : dateStr
    },
    formatDateRange(from, to) {
      if (!from && !to) return '-'
      const f = this.formatDisplayDate(from)
      const t = this.formatDisplayDate(to)
      if (f && t) return `${f} - ${t}`
      return f || t || '-'
    },
    formatApiDateTime(dateStr, isEndOfDay = false) {
      if (!dateStr) return null
      const datePart = dateStr.split(/[ T]/)[0]
      const [year, month, day] = datePart.includes('/')
        ? datePart.split('/').reverse()
        : datePart.split('-')
      if (!year || !month || !day) return null
      return `${year}-${month}-${day} ${isEndOfDay ? '23:59:59' : '00:00:00'}`
    },
    handleSearch() {
      this.activeFilters = {
        search: this.filters.search,
        fromTime: this.filters.fromTime,
        toTime: this.filters.toTime,
        status: this.filters.status,
      }
      this.currentPage = 1
      this.pageInput = 1
      this.loadData()
    },
    refreshData() {
      this.filters = { search: '', fromTime: '', toTime: '', status: '' }
      this.activeFilters = { search: '', fromTime: '', toTime: '', status: '' }
      this.currentPage = 1
      this.pageInput = 1
      this.loadData()
    },
    async loadData() {
      this.loading = true
      try {
        const baseParams = {
          pageIndex: this.currentPage,
          pageSize: this.itemsPerPage,
          channel: 'CMS',
        }
        if (this.activeFilters.search) baseParams.search = this.activeFilters.search
        if (this.activeFilters.fromTime) baseParams.fromTime = this.formatApiDateTime(this.activeFilters.fromTime)
        if (this.activeFilters.toTime) baseParams.toTime = this.formatApiDateTime(this.activeFilters.toTime, true)
        if (this.activeFilters.status) baseParams.status = this.activeFilters.status

        const res = await redefenseExamService.getList(baseParams)
        if (res) {
          const rootData = res.data !== undefined ? res.data : res
          const allItems = Array.isArray(rootData) ? rootData : (rootData.data || rootData.content || rootData.items || [])
          const rawTotal = rootData.totalElements ?? rootData.totalRecords ?? rootData.total ?? (res.totalElements || res.totalRecords || res.total)
          
          this.totalRecords = rawTotal !== undefined ? Number(rawTotal) : allItems.length
          this.itemList = allItems
          this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage) || 1
        }
      } catch (error) {
        console.error('Lỗi tải danh sách đợt bảo vệ lại:', error)
        this.itemList = []
        this.totalRecords = 0
      } finally {
        this.loading = false
      }
    },
    changePage(page) {
      if (page < 1 || page > this.totalPages) return
      this.currentPage = page
      this.pageInput = page
      this.loadData()
    },
    goToPage() {
      const page = parseInt(this.pageInput)
      if (page >= 1 && page <= this.totalPages) this.changePage(page)
      else this.pageInput = this.currentPage
    },
    handleItemsPerPageChange(size) {
      this.itemsPerPage = size
      this.currentPage = 1
      this.pageInput = 1
      this.loadData()
    },
    showToast(text) {
      this.snackbar.text = text
      this.snackbar.show = true
    },
    async handleStatusChange(item, selectedItem) {
      try {
        const newStatus = selectedItem.value || selectedItem
        await redefenseExamService.changeStatus(item.id, newStatus, 'CMS')
        item.status = newStatus
        this.showToast('Cập nhật trạng thái thành công')
      } catch (error) {
        console.error('Lỗi đổi trạng thái:', error)
      }
    },
    openAddDialog() {
      this.isAddModalOpen = true
    },
    onAddSuccess(msg) {
      this.showToast(msg)
      this.loadData()
    },
    async handleView(item) {
      try {
        const res = await redefenseExamService.getDetail(item.id);
        if (res) {
          this.selectedEditId = item.id;
          this.isViewOnlyMode = true;
          this.isModalOpen = true;
        }
      } catch (error) {
        console.error('Lỗi lấy chi tiết:', error);
      }
    },

    async handleEdit(item) {
      try {
        const res = await redefenseExamService.getDetail(item.id);
        if (res) {
          this.selectedEditId = item.id;
          this.isViewOnlyMode = false;
          this.isModalOpen = true;
        }
      } catch (error) {
        console.error('Lỗi lấy thông tin sửa:', error);
      }
    },

    async handleDelete(item) {
      if (confirm(`Bạn có chắc chắn muốn xóa đợt bảo vệ lại "${item.name}" không?`)) {
        try {
          const res = await redefenseExamService.delete(item.id);
          if (res) {
            this.showToast('Xóa thành công');
            await this.loadData();
          }
        } catch (error) {
          console.error('Lỗi khi xóa:', error);
        }
      }
    },
    async onModalSuccess(msg) {
      this.showToast(msg)
      await this.loadData()
    },
  }
}
</script>

<style scoped>
.text-red-bold { color: #A62229 !important; }
.bg-white { background-color: #ffffff !important; }
.filter-input >>> .v-input__slot { border-radius: 6px !important; min-height: 38px !important; }
.btn-square-action { border-radius: 6px !important; height: 38px !important; min-width: 38px !important; }
.sticky-filter { position: sticky; top: 0; z-index: 5; background-color: #ffffff; }
.sticky-bottom-bar { background-color: #ffffff; }
.table-scroll-container { overflow-x: auto; }
::v-deep .v-data-footer { display: none !important; }
</style>