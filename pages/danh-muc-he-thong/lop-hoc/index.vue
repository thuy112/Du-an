<template>
  <div class="class-container">
    <!-- KHU VỰC 1: CỐ ĐỊNH PHÍA TRÊN (Tiêu đề + Bộ lọc) -->
    <div class="fixed-top-section">
      <div class="text-h6 font-weight-bold black--text mb-3">
        Danh sách lớp sinh viên (<span class="text-red-bold">{{ totalRecords }}</span>)
      </div>

      <div class="filter-container mb-2">
        <div class="d-flex align-center flex-wrap" style="gap: 8px; padding: 6px 0;">
          <!-- Tìm kiếm mã/tên lớp -->
          <v-text-field
            v-model="filters.code"
            placeholder="Mã lớp sinh viên"
            outlined
            dense
            hide-details
            clearable
            class="filter-input flex-grow-1"
            style="min-width: 180px;"
            @keyup.enter="handleSearch"
          ></v-text-field>

          <!-- Địa điểm đào tạo (trainingUnit) -->
          <v-select
            v-model="filters.trainingUnitId"
            :items="trainingUnitOptions"
            item-text="name"
            item-value="id"
            placeholder="Địa điểm đào tạo"
            outlined
            dense
            hide-details
            clearable
            class="filter-input flex-grow-1"
            style="min-width: 180px;"
          ></v-select>

          <!-- Ngành học (major) -->
          <v-select
            v-model="filters.majorId"
            :items="majorOptions"
            item-text="name"
            item-value="id"
            placeholder="Ngành học"
            outlined
            dense
            hide-details
            clearable
            class="filter-input flex-grow-1"
            style="min-width: 160px;"
          ></v-select>

          <!-- Khóa học (course) -->
          <v-select
            v-model="filters.courseId"
            :items="courseOptions"
            item-text="name"
            item-value="id"
            placeholder="Khóa học"
            outlined
            dense
            hide-details
            clearable
            class="filter-input flex-grow-1"
            style="min-width: 140px;"
          ></v-select>

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
            style="min-width: 130px;"
          ></v-select>

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
        <template #[`item.courseName`]="{ item }">
          <span>{{ item.courseName || '-' }}</span>
        </template>
        <template #[`item.majorName`]="{ item }">
          <span>{{ item.majorName || '-' }}</span>
        </template>
        <template #[`item.trainingMethodName`]="{ item }">
          <span>{{ item.trainingMethodName || '-' }}</span>
        </template>
        <template #[`item.typeTrainingNames`]="{ item }">
          <span>{{ item.typeTrainingNames || '-' }}</span>
        </template>
        <template #[`item.trainingUnitName`]="{ item }">
          <span>{{ item.trainingUnitName || '-' }}</span>
        </template>
        <template #[`item.admissionTime`]="{ item }">
          <span>{{ item.admissionTime || '-' }}</span>
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
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import ChangeableStatus from '~/components/Base/ChangeableStatus.vue'
import classService from '~/services/classService'

export default {
  name: 'ClassManagementPage',
  components: { BaseTable, ChangeableStatus },
  data() {
    return {
      loading: false,
      itemList: [],
      totalRecords: 0,
      totalPages: 1,
      currentPage: 1,
      pageInput: 1,
      itemsPerPage: 50,
      
      // Danh sách option cho các dropdown phụ
      trainingUnitOptions: [],
      majorOptions: [],
      courseOptions: [],
      statusList: [
        { value: 'ACTIVE', text: 'Kích hoạt', color: '#a2212b' },
        { value: 'INACTIVE', text: 'Chưa kích hoạt', color: '#9e9e9e' }
      ],

      filters: { code: '', trainingUnitId: '', majorId: '', courseId: '', status: '' },
      activeFilters: { code: '', trainingUnitId: '', majorId: '', courseId: '', status: '' },

      headers: [
        { text: 'STT', value: 'stt', align: 'center', width: '60px', sortable: false },
        { text: 'Mã lớp', value: 'code', align: 'left', minWidth: '160px', sortable: false },
        { text: 'Tên lớp', value: 'name', align: 'left', minWidth: '180px', sortable: false },
        { text: 'Tên khóa học', value: 'courseName', align: 'left', minWidth: '130px', sortable: false },
        { text: 'Ngành', value: 'majorName', align: 'left', minWidth: '150px', sortable: false },
        { text: 'Hình thức đào tạo', value: 'trainingMethodName', align: 'left', minWidth: '140px', sortable: false },
        { text: 'Loại hình đào tạo', value: 'typeTrainingNames', align: 'left', minWidth: '150px', sortable: false },
        { text: 'Địa điểm đào tạo', value: 'trainingUnitName', align: 'left', minWidth: '160px', sortable: false },
        { text: 'Đợt tuyển sinh', value: 'admissionTime', align: 'left', minWidth: '110px', sortable: false },
        { text: 'Trạng thái', value: 'status', align: 'center', minWidth: '140px', sortable: false },
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
      this.loadTrainingUnitOptions(),
      this.loadMajorOptions(),
      this.loadCourseOptions()
    ])
    await this.loadData()
  },
  methods: {
    async loadTrainingUnitOptions() {
      try {
        const res = await classService.getTrainingUnitList()
        if (res) {
          const data = res.data !== undefined ? res.data : res
          this.trainingUnitOptions = Array.isArray(data) ? data : (data.data || data.content || [])
        }
      } catch (err) {
        console.error('Lỗi tải địa điểm đào tạo:', err)
      }
    },
    async loadMajorOptions() {
      try {
        const res = await classService.getMajorList()
        if (res) {
          const data = res.data !== undefined ? res.data : res
          this.majorOptions = Array.isArray(data) ? data : (data.data || data.content || [])
        }
      } catch (err) {
        console.error('Lỗi tải ngành học:', err)
      }
    },
    async loadCourseOptions() {
      try {
        const res = await classService.getCourseAllList()
        if (res) {
          const data = res.data !== undefined ? res.data : res
          this.courseOptions = Array.isArray(data) ? data : (data.data || data.content || [])
        }
      } catch (err) {
        console.error('Lỗi tải khóa học:', err)
      }
    },
    async loadData() {
      this.loading = true
      try {
        const params = {
          pageIndex: this.currentPage,
          pageSize: this.itemsPerPage,
          channel: 'CMS',
          ...(this.activeFilters.code && { code: this.activeFilters.code }),
          ...(this.activeFilters.trainingUnitId && { trainingUnitId: this.activeFilters.trainingUnitId }),
          ...(this.activeFilters.majorId && { majorId: this.activeFilters.majorId }),
          ...(this.activeFilters.courseId && { courseId: this.activeFilters.courseId }),
          ...(this.activeFilters.status && { status: this.activeFilters.status })
        }
        const res = await classService.getClassList(params)
        if (res) {
          const rootData = res.data !== undefined ? res.data : res
          const items = Array.isArray(rootData) ? rootData : (rootData.data || rootData.content || rootData.items || [])
          this.itemList = items
          this.totalRecords = Number(rootData.totalElements ?? rootData.totalRecords ?? items.length)
          this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage) || 1
        }
      } catch (err) {
        console.error('Lỗi tải danh sách lớp sinh viên:', err)
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      this.activeFilters = { ...this.filters }
      this.currentPage = 1
      this.loadData()
    },
    refreshData() {
      this.filters = { code: '', trainingUnitId: '', majorId: '', courseId: '', status: '' }
      this.activeFilters = { code: '', trainingUnitId: '', majorId: '', courseId: '', status: '' }
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
      this.itemsPerPage = size
      this.currentPage = 1
      this.loadData()
    },
    async handleStatusChange(item, selectedItem) {
      try {
        const val = selectedItem.value || selectedItem
        await classService.changeClassStatus(item.id, { status: val })
        item.status = val
        await this.loadData()
      } catch (err) {
        console.error('Lỗi đổi trạng thái lớp:', err)
      }
    }
  }
}
</script>

<style scoped>
.class-container {
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
</style>