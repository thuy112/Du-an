<template>
  <div class="course-management-page pa-3 pa-md-4 bg-white" :class="{ 'is-mobile-device': isMobileDevice }">
    <!-- TIÊU ĐỀ TRANG -->
    <div class="text-h6 font-weight-bold black--text mb-3">
      Danh sách khóa học (<span class="text-red-bold">{{ totalRecords }}</span>)
    </div>

    <!-- BỘ LỌC TÌM KIẾM CỐ ĐỊNH PHÍA TRÊN -->
    <div class="filter-container mb-3 sticky-filter">
      <div class="d-flex align-center flex-wrap" style="gap: 8px; padding: 6px;">
        <v-text-field
          v-model="filters.search"
          label="Tên/Mã khóa học"
          outlined
          dense
          hide-details
          clearable
          class="filter-input flex-grow-1"
          style="min-width: 200px;"
          @keyup.enter="handleSearch"
        ></v-text-field>

        <!-- Thời gian khóa học: từ ngày -->
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
              style="min-width: 160px; max-width: 180px;"
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

        <!-- Thời gian khóa học: đến ngày -->
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
              style="min-width: 160px; max-width: 180px;"
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

          <!-- Nút Dấu Cộng (+) mở Modal Thêm mới -->
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

        <template #[`item.code`]="{ item }">
          <span class="font-weight-medium">{{ item.code || '-' }}</span>
        </template>

        <template #[`item.name`]="{ item }">
          <span>{{ item.name || '-' }}</span>
        </template>

        <template #[`item.admissionYear`]="{ item }">
          <span>{{ item.enrollmentYear || '-' }}</span>
        </template>

        <template #[`item.durationTime`]="{ item }">
          <span>{{ formatDateRange(item.fromTime, item.toTime, item.enrollmentYear) }}</span>
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

        <!-- Cột Chức năng: Bấm icon bút chì để cập nhật -->
        <template #[`item.actions`]="{ item }">
          <div class="d-flex align-center justify-center" style="gap: 4px;">
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
        <v-btn color="#4caf50" dark class="text-none font-weight-medium rounded-sm text-nowrap px-3" height="32" elevation="0" style="font-size: 12px; border-radius: 4px !important;" @click="openImportDialog">
          <v-icon left small>mdi-microsoft-excel</v-icon>
          NHẬP FILE EXCEL
        </v-btn>
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

    <!-- MODAL THÊM MỚI VÀ CẬP NHẬT DÙNG CHUNG -->
    <AddCourseModal v-model="isAddModalOpen" @success="onAddSuccess" />
    <CourseModal v-model="isModalOpen" :edit-id="selectedEditId" :course="selectedCourse" @success="onModalSuccess" />

    <!-- THÔNG BÁO TOAST MÀU XANH LÁ -->
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
import AddCourseModal from '~/components/AddCourseModal.vue'
import CourseModal from '~/components/CourseModal.vue'
import courseService from '~/services/courseService'

export default {
  name: 'CourseManagementPage',
  components: {
    BaseTable,
    ChangeableStatus,
    AddCourseModal,
    CourseModal,
  },
  data() {
    return {
      isMobileDevice: false,
      loading: false,
      isAddModalOpen: false,
      isModalOpen: false,
      selectedEditId: null, // ID của khóa học cần cập nhật
      selectedCourse: null,
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
        { text: 'Mã khóa học', value: 'code', align: 'left', minWidth: '150px', sortable: false },
        { text: 'Tên khóa học', value: 'name', align: 'left', minWidth: '220px', sortable: true },
        { text: 'Năm tuyển sinh', value: 'admissionYear', align: 'center', minWidth: '140px', sortable: false },
        { text: 'Thời gian khóa học', value: 'durationTime', align: 'center', minWidth: '180px', sortable: false },
        { text: 'Trạng thái', value: 'status', align: 'center', minWidth: '140px', sortable: false },
        { text: 'Chức năng', value: 'actions', align: 'center', width: '100px', sortable: false },
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
          courseService.getPageRole ? courseService.getPageRole({ channel: 'CMS' }).catch(() => null) : null,
          courseService.getUserInfo ? courseService.getUserInfo({ channel: 'CMS' }).catch(() => null) : null,
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

    formatDateRange(from, to, fallbackYear) {
      if (!from && !to) return '-'
      const f = this.formatDisplayDate(from, fallbackYear)
      const t = this.formatDisplayDate(to, fallbackYear)
      if (f && t) return `${f} - ${t}`
      return f || t || '-'
    },

    handleSearch() {
      this.activeFilters = {
        search: this.extractValue(this.filters.search),
        fromTime: this.extractValue(this.filters.fromTime),
        toTime: this.extractValue(this.filters.toTime),
        status: this.extractValue(this.filters.status),
      }
      this.currentPage = 1
      this.pageInput = 1
      this.loadData()
    },

    refreshData() {
      this.filters = {
        search: '',
        fromTime: '',
        toTime: '',
        status: '',
      }
      this.activeFilters = {
        search: '',
        fromTime: '',
        toTime: '',
        status: '',
      }
      this.currentPage = 1
      this.pageInput = 1
      this.loadData()
    },

    formatDisplayDate(dateStr, fallbackYear) {
      if (!dateStr) return ''
      const date = dateStr.split(/[ T]/)[0]
      const slashDate = date.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
      const isoDate = date.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
      if (!slashDate && !isoDate) return dateStr

      let year = Number(slashDate ? slashDate[3] : isoDate[1])
      const month = slashDate ? slashDate[2] : isoDate[2]
      const day = slashDate ? slashDate[1] : isoDate[3]
      const yearFallback = Number(fallbackYear)
      if (year < 1000 && yearFallback >= 1000 && yearFallback <= 9999) {
        year = yearFallback
      }
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${String(year).padStart(4, '0')}`
    },

    formatApiDateTime(date, isEndOfDay = false) {
      if (!date) return ''
      const dateOnly = date.split(/[ T]/)[0]
      const [year, month, day] = dateOnly.split('-')
      if (!year || !month || !day) return ''
      return `${day}/${month}/${year} ${isEndOfDay ? '23:59:59' : '00:00:00'}`
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
        if (this.activeFilters.fromTime !== '') {
          baseParams.fromTime = this.formatApiDateTime(this.activeFilters.fromTime)
        }
        if (this.activeFilters.toTime !== '') {
          baseParams.toTime = this.formatApiDateTime(this.activeFilters.toTime, true)
        }
        if (this.activeFilters.status !== '') {
          baseParams.status = this.activeFilters.status
        }

        const res = await courseService.getList(baseParams)
        if (res) {
          const rootData = res.data !== undefined ? res.data : res
          const allItems = Array.isArray(rootData) ? rootData : (rootData.data || rootData.content || rootData.items || [])
          
          const rawTotal = rootData.totalElements ?? rootData.totalRecords ?? rootData.total ?? (res.totalElements || res.totalRecords || res.total)
          this.totalRecords = rawTotal !== undefined ? Number(rawTotal) : allItems.length

          this.itemList = allItems
          this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage) || 1
        }
      } catch (error) {
        console.error('Lỗi tải danh sách khóa học:', error)
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
    },

    async handleStatusChange(item, selectedItem) {
      try {
        const newStatusValue = selectedItem.value || selectedItem
        if (courseService.changeStatus) {
          await courseService.changeStatus(item.id, newStatusValue, 'CMS')
        }
        item.status = newStatusValue
        await this.loadData()
        this.showSuccessToast('Cập nhật trạng thái thành công')
      } catch (error) {
        console.error('Lỗi khi đổi trạng thái khóa học:', error)
      }
    },

    openAddDialog() {
      this.isAddModalOpen = true
    },

    onAddSuccess(message) {
      this.showSuccessToast(message)
      this.loadData()
    },

    // Xử lý khi bấm vào icon bút chì (Cập nhật)
    handleEdit(item) {
      this.selectedEditId = item.id // Truyền ID để CourseModal gọi API chi tiết
      this.selectedCourse = item
      this.isModalOpen = true
    },

    async onModalSuccess(message) {
      this.showSuccessToast(message)
      await this.loadData()
    },

    handleDelete(item) {},
    openImportDialog() {}
  }
}
</script>

<style scoped>
.text-red-bold {
  color: #A62229 !important;
}
.bg-white {
  background-color: #ffffff !important;
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
.sticky-filter {
  position: sticky;
  top: 0;
  z-index: 5;
  background-color: #ffffff;
}
.sticky-bottom-bar {
  background-color: #ffffff;
}
.table-scroll-container {
  overflow-x: auto;
}
.table-scroll-container >>> th {
  position: sticky !important;
  top: 0;
  z-index: 2;
  background-color: #f5f5f5 !important;
}
::v-deep .v-data-footer {
  display: none !important;
}
</style>