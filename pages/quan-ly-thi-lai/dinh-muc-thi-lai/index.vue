<template>
  <div class="decision-fee-type-page pa-3 pa-md-4 bg-white">
    <!-- TIÊU ĐỀ TRANG -->
    <div class="d-flex align-center justify-space-between mb-3">
      <div class="text-h6 font-weight-bold black--text">
        Danh sách loại định mức (<span class="text-red-bold">{{ totalRecords }}</span>)
      </div>
    </div>

    <!-- BỘ LỌC TÌM KIẾM PHÍA TRÊN -->
    <div class="mb-3 sticky-filter">
      <div class="d-flex align-center flex-wrap justify-space-between" style="gap: 8px; padding: 6px 0;">
        <div class="d-flex align-center flex-wrap flex-grow-1" style="gap: 8px;">
          <!-- Tìm kiếm theo tên ban hành -->
          <v-text-field
            v-model="filters.name"
            placeholder="Tìm kiếm"
            outlined
            dense
            hide-details
            clearable
            class="filter-input"
            style="min-width: 220px; max-width: 280px;"
            @keyup.enter="handleSearch"
          ></v-text-field>

          <!-- Học kỳ -->
          <v-select
            v-model="filters.semesterId"
            :items="semesterList"
            item-text="name"
            item-value="id"
            placeholder="Học kỳ"
            outlined
            dense
            hide-details
            clearable
            class="filter-input"
            style="min-width: 180px;"
          ></v-select>

          <!-- Trạng thái (Kích hoạt / Chưa kích hoạt) -->
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

          <!-- Nút Làm mới & Tìm kiếm -->
          <div class="d-flex align-center" style="gap: 5px;">
            <v-btn icon color="#A62229" @click="refreshData" title="Làm mới">
              <v-icon size="24">mdi-refresh</v-icon>
            </v-btn>

            <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="handleSearch" title="Tìm kiếm">
              <v-icon size="24">mdi-magnify</v-icon>
            </v-btn>
          </div>
        </div>

        <!-- Nút Thêm mới (Góc phải) -->
        <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="openAddModal">
          <v-icon size="24">mdi-plus</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- BẢNG HIỂN THỊ DỮ LIỆU (BASETABLE) -->
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
        <!-- STT -->
        <template #[`item.stt`]="{ index }">
          <span>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</span>
        </template>

        <!-- Tên ban hành định mức -->
        <template #[`item.name`]="{ item }">
          <span class="font-weight-medium">{{ item.name || item.title || '-' }}</span>
        </template>

        <!-- Kỳ học -->
        <template #[`item.semesterName`]="{ item }">
          <span>{{ item.semesterName || item.semester?.name || '-' }}</span>
        </template>

        <!-- File ban hành -->
        <template #[`item.fileName`]="{ item }">
          <a v-if="item.fileName || item.fileUrl" href="#" @click.prevent="downloadFile(item)" class="red--text text--darken-2">
            {{ item.fileName || 'Tải xuống' }}
          </a>
          <span v-else>-</span>
        </template>

        <!-- Ngày ban hành -->
        <template #[`item.timeInform`]="{ item }">
          <span>{{ formatDate(item.timeInform || item.createdAt) }}</span>
        </template>

        <!-- Trạng thái -->
        <template #[`item.status`]="{ item }">
          <v-chip small :color="item.status === 'ACTIVE' ? '#A62229' : 'grey'" dark>
            {{ item.status === 'ACTIVE' ? 'Kích hoạt' : 'Chưa kích hoạt' }}
          </v-chip>
        </template>

        <!-- Chức năng -->
        <template #[`item.actions`]="{ item }">
          <div class="d-flex align-center" style="gap: 4px;">
            <v-btn icon small color="primary" @click="handleEdit(item)" title="Sửa">
              <v-icon small>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon small color="error" @click="handleDelete(item)" title="Xóa">
              <v-icon small>mdi-delete</v-icon>
            </v-btn>
          </div>
        </template>
      </BaseTable>
    </div>

    <!-- THANH NÚT DƯỚI BẢNG & PHÂN TRANG -->
    <div class="d-flex align-center justify-space-between mt-4 flex-wrap gap-3 sticky-bottom-bar pt-3 border-top">
      <!-- Nút Nhập file Excel -->
      <v-btn color="#4caf50" dark class="text-none px-4" height="38" elevation="0" @click="openImportModal">
        <v-icon left>mdi-microsoft-excel</v-icon> Nhập file excel
      </v-btn>

      <!-- Phân trang chuẩn -->
      <div class="d-flex align-center custom-pagination-group" style="gap: 8px;">
        <v-select
          v-model="itemsPerPage"
          :items="[10, 20, 50, 100]"
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
          <v-btn color="#A62229" dark depressed class="text-none px-3" height="36" @click="goToPage">
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
              :color="p === currentPage ? '#A62229' : 'grey lighten-2'"
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
    <DecisionFeeTypeModal
      v-model="addModalVisible"
      :semester-list="semesterList"
      @saved="handleSaved"
    />
    <DecisionFeeImportModal v-model="importModalVisible" />
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import decisionFeeTypeService from '~/services/decisionFeeTypeService'
import DecisionFeeTypeModal from '~/components/DecisionFeeTypeModal.vue'
import DecisionFeeImportModal from '~/components/DecisionFeeImportModal.vue'

export default {
  name: 'DecisionFeeTypePage',
  components: { BaseTable, DecisionFeeTypeModal, DecisionFeeImportModal },
  data() {
    return {
      importModalVisible: false,
      addModalVisible: false,

      loading: false,
      filters: {
        name: '',
        semesterId: '',
        status: '',
      },
      activeFilters: {
        name: '',
        semesterId: '',
        status: '',
      },
      semesterList: [],
      statusList: [
        { text: 'Kích hoạt', value: 'ACTIVE' },
        { text: 'Chưa kích hoạt', value: 'INACTIVE' },
      ],

      itemList: [],
      totalRecords: 0,
      totalPages: 1,
      currentPage: 1,
      pageInput: 1,
      itemsPerPage: 50,

      tableHeaders: [
        { value: 'stt', text: 'STT', align: 'center', width: '70px', sortable: false },
        { value: 'name', text: 'Tên ban hành định mức', align: 'left', minWidth: '220px', sortable: false },
        { value: 'semesterName', text: 'Kỳ học', align: 'left', width: '150px', sortable: false },
        { value: 'fileName', text: 'File ban hành', align: 'left', width: '160px', sortable: false },
        { value: 'timeInform', text: 'Ngày ban hành', align: 'center', width: '140px', sortable: false },
        { value: 'status', text: 'Trạng thái', align: 'center', width: '130px', sortable: false },
        { value: 'actions', text: 'Chức năng', align: 'center', width: '110px', sortable: false },
      ],
    }
  },
  async mounted() {
    await this.initSemesters()
    await this.loadData()
  },
  methods: {
    async initSemesters() {
      try {
        const res = await decisionFeeTypeService.getSemesterList({ status: 'ACTIVE', channel: 'CMS' })
        if (res) {
          const raw = res.data !== undefined ? res.data : res
          this.semesterList = Array.isArray(raw) ? raw : (raw.data || raw.content || [])
        }
      } catch (error) {
        console.error('Lỗi tải danh sách học kỳ:', error)
      }
    },

    handleSearch() {
      this.activeFilters = { ...this.filters }
      this.currentPage = 1
      this.pageInput = 1
      this.loadData()
    },

    refreshData() {
      this.filters = { name: '', semesterId: '', status: '' }
      this.activeFilters = { name: '', semesterId: '', status: '' }
      this.currentPage = 1
      this.pageInput = 1
      this.loadData()
    },

    async loadData() {
      this.loading = true
      try {
        const params = {
          pageIndex: this.currentPage,
          pageSize: this.itemsPerPage,
          name: this.activeFilters.name || '',
          year: new Date().getFullYear(),
          status: this.activeFilters.status || '',
          semesterId: this.activeFilters.semesterId || '',
          channel: 'CMS',
        }

        const res = await decisionFeeTypeService.getList(params)
        if (res) {
          const rawData = res.data !== undefined ? res.data : res
          this.itemList = Array.isArray(rawData) ? rawData : (rawData.data || rawData.content || rawData.items || [])
          
          const total = rawData.totalElements ?? rawData.totalRecords ?? rawData.total ?? (res.totalElements || res.total)
          this.totalRecords = total !== undefined ? Number(total) : this.itemList.length
          this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage) || 1
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu danh sách loại định mức:', error)
        this.itemList = []
        this.totalRecords = 0
      } finally {
        this.loading = false
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return '-'
      if (dateStr.includes('-')) {
        const p = dateStr.split('T')[0].split('-')
        if (p.length === 3) return `${p[2]}/${p[1]}/${p[0]}`
      }
      return dateStr
    },

    changePage(page) {
      if (page < 1 || page > this.totalPages) return
      this.currentPage = page
      this.pageInput = page
      this.loadData()
    },

    goToPage() {
      const p = parseInt(this.pageInput)
      if (p >= 1 && p <= this.totalPages) {
        this.changePage(p)
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

    openAddModal() {
      this.addModalVisible = true
    },
    handleSaved() {
      this.currentPage = 1
      this.pageInput = 1
      this.loadData()
    },
    handleRefreshAfterAdd() {
      this.loadData()
    },
    openImportModal() {
      this.importModalVisible = true
    },
    handleEdit(item) {
      // Sửa bản ghi
    },
    handleDelete(item) {
      // Xóa bản ghi
    },
    downloadFile(item) {
      // Tải file ban hành
    }
  }
}
</script>

<style scoped>
.sticky-filter {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #fff;
}
.sticky-bottom-bar {
  position: sticky;
  bottom: 0;
  z-index: 2;
  background: #fff;
}
.text-red-bold {
  color: #A62229;
  font-weight: bold;
}
.btn-square-action {
  height: 38px !important;
  min-width: 38px !important;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}
.filter-input >>> .v-input__control >>> .v-input__slot {
  min-height: 38px !important;
  display: flex;
  align-items: center;
}
</style>