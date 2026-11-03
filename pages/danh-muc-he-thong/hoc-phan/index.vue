<template>
  <div class="term-management-page pa-3 pa-md-4 bg-white" :class="{ 'is-mobile-device': isMobileDevice }">
    <!-- TIÊU ĐỀ TRANG -->
    <div class="text-h6 font-weight-bold black--text mb-3">
      Danh sách học phần (<span class="text-red-bold">{{ totalRecords }}</span>)
    </div>

    <!-- BỘ LỌC TÌM KIẾM CỐ ĐỊNH PHÍA TRÊN -->
    <div class="filter-container mb-3 sticky-filter">
      <div class="d-flex align-center flex-wrap" style="gap: 8px; padding: 6px;">
        <!-- Ô tìm kiếm Tên/Mã -->
        <v-text-field
          v-model="filters.search"
          placeholder="Tên/Mã"
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
          class="filter-input"
          style="min-width: 160px;"
        ></v-select>

        <!-- Nút thao tác (Làm mới, Tìm kiếm) -->
        <div class="d-flex align-center" style="gap: 5px;">
          <v-btn icon color="#A62229" class="btn-square-action" @click="refreshData" title="Làm mới">
            <v-icon size="22">mdi-refresh</v-icon>
          </v-btn>

          <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="handleSearch" title="Tìm kiếm">
            <v-icon size="22">mdi-magnify</v-icon>
          </v-btn>
        </div>
      </div>
    </div>

    <!-- KHUNG BASETABLE HIỂN THỊ DỮ LIỆU (CHỈ PHẦN NÀY LƯỚT CUỘN) -->
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
        <!-- Cột STT -->
        <template #[`item.stt`]="{ index }">
          <span>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</span>
        </template>

        <!-- Mã học phần -->
        <template #[`item.code`]="{ item }">
          <span class="font-weight-medium">{{ item.code || '-' }}</span>
        </template>

        <!-- Tên học phần -->
        <template #[`item.name`]="{ item }">
          <span>{{ item.name || '-' }}</span>
        </template>

        <!-- Số tín chỉ học phí -->
        <template #[`item.tuitionCredits`]="{ item }">
          <span class="text-center">{{ item.tuitionCredits ?? item.credit ?? '-' }}</span>
        </template>

        <!-- Số tín chỉ học tập -->
        <template #[`item.studyCredits`]="{ item }">
          <span class="text-center">{{ item.studyCredits ?? item.credits ?? '-' }}</span>
        </template>

        <!-- Thời lượng -->
        <template #[`item.duration`]="{ item }">
          <span>{{ item.duration || '-' }}</span>
        </template>

        <!-- Khoa/Trường -->
        <template #[`item.department`]="{ item }">
          <span>{{ item.department || item.faculty || '-' }}</span>
        </template>

        <!-- Tên chương trình -->
        <template #[`item.educationProgramName`]="{ item }">
          <span>{{ item.educationProgramName || '-' }}</span>
        </template>

        <!-- Mã chương trình -->
        <template #[`item.educationProgramCode`]="{ item }">
          <span>{{ item.educationProgramCode || '-' }}</span>
        </template>

        <!-- Trạng thái -->
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

        <!-- Ngày cập nhật -->
        <template #[`item.updatedAt`]="{ item }">
          <span>{{ formatDateTime(item.updatedAt || item.updatedDate) }}</span>
        </template>

        <!-- Cột Chức năng -->
        <template #[`item.actions`]="{ item }">
          <div class="d-flex align-center justify-center" style="gap: 4px;">
            <v-btn icon small color="amber darken-2" @click="handleEdit(item)" title="Sửa">
              <v-icon size="18">mdi-pencil</v-icon>
            </v-btn>
          </div>
        </template>
      </BaseTable>
    </div>

    <!-- THANH PHÂN TRANG CỐ ĐỊNH PHÍA DƯỚI -->
    <div class="pagination-bottom-container mt-4 pt-3 d-flex align-center justify-space-between flex-wrap gap-3 sticky-bottom-bar border-top">
      <div class="d-flex align-center"></div>

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

    <!-- THÔNG BÁO TOAST CÓ NÚT X VÀ PROGRESS LINEAR CHẠY Ở DƯỚI -->
    <v-snackbar
      v-model="snackbar.show"
      top
      right
      timeout="3000"
      color="#4caf50"
      elevation="4"
      class="custom-top-right-snackbar"
    >
      <div class="d-flex align-center justify-space-between" style="width: 100%;">
        <div class="d-flex align-center">
          <v-icon left dark class="mr-2">mdi-check-circle</v-icon>
          <span class="white--text font-weight-medium">{{ snackbar.text }}</span>
        </div>
      </div>
      <template #action="{ attrs }">
        <v-btn text dark v-bind="attrs" @click="snackbar.show = false">
          <v-icon small>mdi-close</v-icon>
        </v-btn>
      </template>
      <v-progress-linear
        v-model="snackbar.progress"
        color="white"
        height="3"
        absolute
        bottom
      ></v-progress-linear>
    </v-snackbar>
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import ChangeableStatus from '~/components/Base/ChangeableStatus.vue'
import termService from '~/services/termService'

export default {
  name: 'TermManagementPage',
  components: {
    BaseTable,
    ChangeableStatus,
  },
  data() {
    return {
      isMobileDevice: false,
      loading: false,
      filters: {
        search: '',
        status: '',
      },
      activeFilters: {
        search: '',
        status: '',
      },
      snackbar: {
        show: false,
        text: '',
        progress: 100,
        timer: null
      },
      statusList: [
        { text: 'Kích hoạt', value: 'ACTIVE', color: '#a2212b' },
        { text: 'Chưa kích hoạt', value: 'INACTIVE', color: '#9e9e9e' },
      ],

      itemList: [],
      totalRecords: 0,
      totalPages: 1,
      currentPage: 1,
      pageInput: 1,
      itemsPerPage: 50,

      tableHeaders: [
        { text: 'STT', value: 'stt', align: 'center', width: '60px', sortable: false },
        { text: 'Mã học phần', value: 'code', align: 'left', minWidth: '130px', sortable: false },
        { text: 'Tên học phần', value: 'name', align: 'left', minWidth: '180px', sortable: true },
        { text: 'Số tín chỉ học phí', value: 'tuitionCredits', align: 'center', width: '100px', sortable: false },
        { text: 'Số tín chỉ học tập', value: 'studyCredits', align: 'center', width: '100px', sortable: false },
        { text: 'Thời lượng', value: 'duration', align: 'center', width: '90px', sortable: false },
        { text: 'Khoa/Trường', value: 'department', align: 'left', minWidth: '140px', sortable: false },
        { text: 'Tên chương trình', value: 'educationProgramName', align: 'left', minWidth: '160px', sortable: false },
        { text: 'Mã chương trình', value: 'educationProgramCode', align: 'left', minWidth: '130px', sortable: false },
        { text: 'Trạng thái', value: 'status', align: 'center', width: '130px', sortable: false },
        { text: 'Ngày cập nhật', value: 'updatedAt', align: 'center', width: '140px', sortable: false },
        { text: 'Chức năng', value: 'actions', align: 'center', width: '90px', sortable: false },
      ],
    }
  },
  async mounted() {
    if (typeof navigator !== 'undefined') {
      this.isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }
    await this.initPagePermissions()
    await this.loadData()
  },
  methods: {
    async initPagePermissions() {
      try {
        await Promise.all([
          termService.getMajorList ? termService.getMajorList({ status: 'ACTIVE', channel: 'CMS' }).catch(() => null) : null,
          termService.getPageRole ? termService.getPageRole({ channel: 'CMS' }).catch(() => null) : null,
          termService.getUserInfo ? termService.getUserInfo({ channel: 'CMS' }).catch(() => null) : null,
        ])
      } catch (error) {
        console.error('Lỗi khởi tạo quyền trang:', error)
      }
    },

    extractValue(val) {
      if (val === null || val === undefined || val === '') return ''
      if (typeof val === 'object') {
        return val.value !== undefined ? val.value : (val.id !== undefined ? val.id : (val.code !== undefined ? val.code : ''))
      }
      return val
    },

    formatDateTime(dateStr) {
      if (!dateStr) return '-'
      // Định dạng lại hiển thị ngày giờ thành DD/MM/YYYY HH:mm:ss nếu cần
      return dateStr
    },

    handleSearch() {
      this.activeFilters = {
        search: this.extractValue(this.filters.search),
        status: this.extractValue(this.filters.status),
      }
      this.currentPage = 1
      this.pageInput = 1
      this.loadData()
    },

    refreshData() {
      this.filters = { search: '', status: '' }
      this.activeFilters = { search: '', status: '' }
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

        if (this.activeFilters.search !== '') {
          baseParams.search = this.activeFilters.search
          baseParams.name = this.activeFilters.search
          baseParams.code = this.activeFilters.search
        }
        if (this.activeFilters.status !== '') {
          baseParams.status = this.activeFilters.status
        }

        const res = await termService.getList(baseParams)
        if (res) {
          const rootData = res.data !== undefined ? res.data : res
          const allItems = Array.isArray(rootData) ? rootData : (rootData.data || rootData.content || rootData.items || [])
          
          const rawTotal = rootData.totalElements ?? rootData.totalRecords ?? rootData.total ?? (res.totalElements || res.totalRecords || res.total)
          this.totalRecords = rawTotal !== undefined ? Number(rawTotal) : allItems.length

          this.itemList = allItems
          this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage) || 1
        }
      } catch (error) {
        console.error('Lỗi tải danh sách học phần:', error)
        this.itemList = []
        this.totalRecords = 0
        this.totalPages = 1
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
      if (page >= 1 && page <= this.totalPages) {
        this.changePage(page)
      } else {
        this.pageInput = this.currentPage
      }
    },

    handleItemsPerPageChange(size) {
      this.itemsPerPage = size
      this.currentPage = 1
      this.pageInput = 1
      this.loadData()
    },

    showSuccessToast(message) {
      this.snackbar.show = false
      
      this.$nextTick(() => {
        this.snackbar.text = message
        this.snackbar.show = true
        this.snackbar.progress = 100

        clearInterval(this.snackbar.timer)
        const step = 100 / (3000 / 50)
        this.snackbar.timer = setInterval(() => {
          this.snackbar.progress -= step
          if (this.snackbar.progress <= 0) {
            clearInterval(this.snackbar.timer)
          }
        }, 50)
      })
    },

    async handleStatusChange(item, selectedItem) {
      try {
        const newStatusValue = selectedItem.value || selectedItem
        if (termService.changeStatus) {
          await termService.changeStatus(item.id, newStatusValue, 'CMS')
        }
        item.status = newStatusValue
        await this.loadData()
        this.showSuccessToast('Cập nhật trạng thái thành công')
      } catch (error) {
        console.error('Lỗi khi đổi trạng thái học phần:', error)
      }
    },

    handleEdit(item) {
      // Xử lý khi bấm nút sửa (icon bút chì)
    }
  }
}
</script>

<style scoped>
.term-management-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: #ffffff !important;
}

.text-red-bold {
  color: #A62229 !important;
}

.bg-white {
  background-color: #ffffff !important;
}

/* Cố định bộ lọc phía trên */
.sticky-filter {
  position: sticky;
  top: 0;
  z-index: 5;
  background-color: #ffffff;
  flex-shrink: 0;
}

/* Khung chứa bảng cuộn lướt ở giữa */
.table-scroll-container {
  flex-grow: 1;
  overflow-y: auto;
  overflow-x: auto;
  max-height: calc(100vh - 220px);
}

.table-scroll-container >>> th {
  position: sticky !important;
  top: 0;
  z-index: 2;
  background-color: #f5f5f5 !important;
}

/* Cố định thanh phân trang phía dưới */
.sticky-bottom-bar {
  position: sticky;
  bottom: 0;
  z-index: 5;
  background-color: #ffffff;
  flex-shrink: 0;
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

::v-deep .v-data-footer {
  display: none !important;
}
</style>