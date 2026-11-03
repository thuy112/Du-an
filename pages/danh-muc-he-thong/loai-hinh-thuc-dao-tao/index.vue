<template>
  <div class="training-type-page pa-3 pa-md-4 bg-white d-flex flex-column" :class="{ 'is-mobile-device': isMobileDevice }" style="height: calc(100vh - 70px); overflow: hidden;">
    
    <!-- TIÊU ĐỀ TRANG (Cố định phía trên) -->
    <div class="text-h6 font-weight-bold black--text mb-3 flex-shrink-0">
      Danh sách loại hình đào tạo (<span class="text-red-bold">{{ totalRecords }}</span>)
    </div>

    <!-- BỘ LỌC TÌM KIẾM (Cố định phía trên) -->
    <div class="filter-container mb-3 sticky-filter flex-shrink-0">
      <div class="d-flex align-center flex-wrap" style="gap: 8px; padding: 6px;">
        <!-- Ô tìm kiếm -->
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
          style="min-width: 160px;"
        ></v-select>

        <!-- Nút thao tác -->
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

    <!-- KHUNG BASETABLE (Có thanh cuộn riêng ở giữa) -->
    <div class="table-scroll-container flex-grow-1" style="overflow-y: auto;">
      <BaseTable
        :headers="tableHeaders"
        :items="itemList"
        :loading="loading"
        :is-mobile="isMobileDevice"
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

        <!-- Mã loại hình đào tạo -->
        <template #[`item.code`]="{ item }">
          <span class="font-weight-medium">{{ item.code || '-' }}</span>
        </template>

        <!-- Tên loại hình đào tạo -->
        <template #[`item.name`]="{ item }">
          <span>{{ item.name || '-' }}</span>
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
      </BaseTable>
    </div>

    <!-- THANH PHÂN TRANG (Cố định phía dưới) -->
    <div class="pagination-bottom-container mt-2 pt-2 d-flex align-center justify-space-between flex-wrap gap-3 sticky-bottom-bar border-top flex-shrink-0">
      <div></div> <!-- Khoảng trống bên trái -->

      <!-- Cụm phân trang phía bên phải -->
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
    <!-- THÔNG BÁO TOAST GÓC TRÊN BÊN PHẢI -->
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
      <!-- Thanh chạy thời gian (Progress bar) ở bên dưới -->
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
import trainingTypeService from '~/services/trainingTypeService'

export default {
  name: 'TrainingTypePage',
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
        { text: 'Mã loại hình đào tạo', value: 'code', align: 'left', minWidth: '200px', sortable: false },
        { text: 'Tên loại hình đào tạo', value: 'name', align: 'left', minWidth: '250px', sortable: false },
        { text: 'Trạng thái', value: 'status', align: 'center', minWidth: '150px', sortable: false },
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
    extractValue(val) {
      if (val === null || val === undefined || val === '') return ''
      if (typeof val === 'object') {
        return val.value !== undefined ? val.value : (val.id !== undefined ? val.id : (val.code !== undefined ? val.code : ''))
      }
      return val
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
      this.filters = {
        search: '',
        status: '',
      }
      this.activeFilters = {
        search: '',
        status: '',
      }
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
        }
        if (this.activeFilters.status !== '') {
          baseParams.status = this.activeFilters.status
        }

        const res = await trainingTypeService.getList(baseParams)
        if (res) {
          const rootData = res.data !== undefined ? res.data : res
          const allItems = Array.isArray(rootData) ? rootData : (rootData.data || rootData.content || rootData.items || [])
          
          const rawTotal = rootData.totalElements ?? rootData.totalRecords ?? rootData.total ?? (res.totalElements || res.totalRecords || res.total)
          this.totalRecords = rawTotal !== undefined ? Number(rawTotal) : allItems.length

          this.itemList = allItems
          this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage) || 1
        }
      } catch (error) {
        console.error('Lỗi tải danh sách loại hình đào tạo:', error)
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

        // Hiệu ứng thanh thời gian chạy giảm dần trong 3 giây (3000ms)
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
        
        // 1. Gọi API đổi trạng thái
        await trainingTypeService.changeStatus(item.id, newStatusValue, 'CMS')
        
        // 2. Cập nhật trực tiếp trạng thái trên item
        item.status = newStatusValue
        
        // 3. Gọi lại API lấy danh sách để đồng bộ
        await this.loadData()

        // 4. Bật thông báo góc trên bên phải có thanh chạy
        this.showSuccessToast('Cập nhật trạng thái thành công')
        } catch (error) {
        console.error('Lỗi khi đổi trạng thái:', error)
        }
    },
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