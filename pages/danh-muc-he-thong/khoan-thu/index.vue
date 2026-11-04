<template>
  <div class="revenue-container">
    <!-- KHU VỰC 1: CỐ ĐỊNH PHÍA TRÊN (Tiêu đề + Bộ lọc) -->
    <div class="fixed-top-section">
      <div class="text-h6 font-weight-bold black--text mb-3">
        Danh sách khoản thu (<span class="text-red-bold">{{ totalRecords }}</span>)
      </div>

      <div class="filter-container mb-2">
        <div class="d-flex align-center flex-wrap" style="gap: 8px; padding: 6px 0;">
          <!-- Tìm kiếm Tên/Mã khoản thu -->
          <v-text-field
            v-model="filters.search"
            placeholder="Tên/Mã khoản thu"
            outlined
            dense
            hide-details
            clearable
            class="filter-input flex-grow-1"
            style="min-width: 220px;"
            @keyup.enter="handleSearch"
          ></v-text-field>

          <!-- Hình thức đào tạo -->
          <v-select
            v-model="filters.trainingMethod"
            :items="trainingMethodList"
            item-text="name"
            item-value="id"
            placeholder="Hình thức đào tạo"
            outlined
            dense
            hide-details
            clearable
            class="filter-input flex-grow-1"
            style="min-width: 180px;"
          ></v-select>

          <!-- Phân hệ -->
          <v-select
            v-model="filters.examType"
            :items="examTypeList"
            item-text="text"
            item-value="value"
            placeholder="Phân hệ"
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
        <template #[`item.trainingMethod`]="{ item }">
          <span>{{ item.trainingMethod ? item.trainingMethod.name : '-' }}</span>
        </template>
        <template #[`item.trainingType`]="{ item }">
          <span>{{ item.trainingType ? item.trainingType.name : '-' }}</span>
        </template>
        <template #[`item.examType`]="{ item }">
          <v-chip
            small
            dark
            :color="getExamTypeColor(item.examType)"
            class="px-3 font-weight-medium"
          >
            {{ formatExamTypeText(item.examType) }}
          </v-chip>
        </template>
      </BaseTable>
    </div>

    <!-- KHU VỰC 3: CỐ ĐỊNH PHÍA DƯỚI (Phân trang) -->
    <div class="fixed-bottom-section d-flex align-center justify-end flex-wrap gap-3 border-top">

      <div class="d-flex align-center pagination-custom" style="gap: 16px;">
        <div class="d-flex align-center">
          <v-select
            v-model="itemsPerPage"
            :items="[5, 10, 20, 50, 100]"
            label="Bản ghi"
            outlined
            dense
            hide-details
            style="width: 90px;"
            @change="handlePerPageChange(itemsPerPage)"
          ></v-select>
        </div>

        <div class="d-flex align-center" style="gap: 8px;">
          <v-text-field
            v-model.number="pageInput"
            label="Trang"
            outlined
            dense
            hide-details
            type="number"
            style="width: 80px;"
            @keyup.enter="goToPage"
          ></v-text-field>
          <v-btn color="#A2212B" dark depressed class="text-none px-4" height="40" @click="goToPage">Đi</v-btn>
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
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import revenueService from '~/services/revenueService'

export default {
  name: 'RevenueManagementPage',
  components: { BaseTable },
  data() {
    return {
      loading: false,
      itemList: [],
      totalRecords: 0,
      totalPages: 1,
      currentPage: 1,
      pageInput: 1,
      itemsPerPage: 50,

      trainingMethodList: [],
      examTypeList: [
        { value: 'REASSESSMENT', text: 'Bảo vệ lại' },
        { value: 'RETAKE_COURSES', text: 'Học lại' }
      ],

      filters: {
        search: '',
        trainingMethod: '',
        examType: ''
      },
      activeFilters: {
        search: '',
        trainingMethod: '',
        examType: ''
      },

      headers: [
        { text: 'STT', value: 'stt', align: 'center', width: '60px', sortable: false },
        { text: 'Mã khoản thu', value: 'code', align: 'left', minWidth: '160px', sortable: false },
        { text: 'Tên khoản thu', value: 'name', align: 'left', minWidth: '180px', sortable: false },
        { text: 'Hình thức đào tạo', value: 'trainingMethod', align: 'left', minWidth: '160px', sortable: false },
        { text: 'Loại hình đào tạo', value: 'trainingType', align: 'left', minWidth: '180px', sortable: false },
        { text: 'Phân hệ', value: 'examType', align: 'center', minWidth: '130px', sortable: false }
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
    }
  },
  async mounted() {
    await Promise.all([
      this.loadPageRole(),
      this.loadUserInfo(),
      this.loadTrainingMethods()
    ])
    await this.loadData()
  },
  methods: {
    async loadPageRole() {
      try { await revenueService.getPageRole() } catch (err) {}
    },
    async loadUserInfo() {
      try { await revenueService.getUserInfo() } catch (err) {}
    },
    async loadTrainingMethods() {
      try {
        const res = await revenueService.getTrainingMethodList()
        const root = res.data !== undefined ? res.data : res
        this.trainingMethodList = Array.isArray(root) ? root : (root.data || root.content || [])
      } catch (err) {
        console.error('Lỗi tải danh sách hình thức đào tạo:', err)
      }
    },
    async loadData() {
      this.loading = true
      try {
        const params = {
          pageIndex: this.currentPage,
          pageSize: this.itemsPerPage,
          channel: 'CMS',
          ...(this.activeFilters.search && { search: this.activeFilters.search }),
          ...(this.activeFilters.trainingMethod && { trainingMethod: this.activeFilters.trainingMethod }),
          ...(this.activeFilters.examType && { examType: this.activeFilters.examType })
        }

        const res = await revenueService.getRevenueList(params)
        if (res) {
          const rootData = res.data !== undefined ? res.data : res
          const items = Array.isArray(rootData) ? rootData : (rootData.data || rootData.content || rootData.items || [])
          this.itemList = items
          this.totalRecords = Number(rootData.totalElements ?? rootData.totalRecords ?? items.length)
          this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage) || 1
        }
      } catch (err) {
        console.error('Lỗi tải danh sách khoản thu:', err)
      } finally {
        this.loading = false
      }
    },
    // Trả về màu nền badge chính xác theo yêu cầu
    getExamTypeColor(type) {
      if (!type) return '#2196f3'
      const val = type.toString().trim().toUpperCase()
      if (val === 'REASSESSMENT') return '#2196f3' // Màu xanh dương (#2196f3) cho Bảo vệ lại
      if (val === 'RETAKE_COURSES') return '#4caf50' // Màu xanh lá (#4caf50) cho Học lại
      return '#2196f3'
    },
    // Chuyển đổi mã API thành tên hiển thị tiếng Việt tương ứng
    formatExamTypeText(type) {
      if (!type) return '-'
      const val = type.toString().trim().toUpperCase()
      if (val === 'REASSESSMENT') return 'Bảo vệ lại'
      if (val === 'RETAKE_COURSES') return 'Học lại'
      return type
    },
    handleSearch() {
      this.activeFilters = { ...this.filters }
      this.currentPage = 1
      this.loadData()
    },
    refreshData() {
      this.filters = { search: '', trainingMethod: '', examType: '' }
      this.activeFilters = { search: '', trainingMethod: '', examType: '' }
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
    }
  }
}
</script>

<style scoped>
.revenue-container {
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
  justify-content: flex-end !important;
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

/* Ẩn viền nét đứt khi focus vào v-select bản ghi */
.pagination-custom >>> .v-select:focus-within >>> fieldset,
.pagination-custom >>> .v-select >>> .v-input__slot:focus-within {
  border-color: #9e9e9e !important;
}

.pagination-custom >>> .v-select >>> input:focus {
  outline: none !important;
}

/* Tắt viền nét đứt mặc định của trình duyệt (outline) */
.pagination-custom >>> *:focus {
  outline: none !important;
}

@media (max-width: 768px) {
  .fixed-bottom-section {
    justify-content: center !important;
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px 4px;
  }
}
</style>