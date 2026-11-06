<template>
  <div class="result-management-page pa-3 pa-md-4 bg-white" :class="{ 'is-mobile-device': isMobileDevice }">
    <!-- TIÊU ĐỀ TRANG -->
    <div class="d-flex align-center justify-between mb-3">
      <div class="text-h6 font-weight-bold black--text">
        Danh sách kết quả thi (<span class="text-red-bold">{{ totalRecords }}</span>)
      </div>
    </div>

    <!-- BỘ LỌC TÌM KIẾM CỐ ĐỊNH PHÍA TRÊN -->
    <div class="filter-container mb-3 sticky-filter">
      <div class="d-flex align-center flex-wrap justify-space-between" style="gap: 8px; padding: 6px;">
        <div class="d-flex align-center flex-wrap flex-grow-1" style="gap: 8px;">
          <v-select
            v-model="filters.examId"
            :items="examList"
            item-text="name"
            item-value="id"
            placeholder="Kỳ thi"
            outlined
            dense
            hide-details
            clearable
            class="filter-input"
            style="min-width: 170px;"
            @change="handleExamChange"
          ></v-select>

          <!-- Học phần -->
          <v-select
            v-model="filters.subjectId"
            :items="subjectList"
            :item-text="item => item.subjectName || item.name || item.subjectCode || item.code || '-'"
            :item-value="item => item.subjectId || item.id || item.code"
            placeholder="Học phần"
            outlined
            dense
            hide-details
            clearable
            class="filter-input"
            style="min-width: 170px;"
            :no-data-text="!filters.examId ? 'Vui lòng chọn kỳ thi trước' : 'Không có dữ liệu'"
            @click.native="checkExamBeforeClick"
            @change="handleSubjectChange"
          ></v-select>

          <!-- Phòng thi -->
          <v-select
            v-model="filters.roomExamId"
            :items="roomList"
            :item-text="item => item.roomName || item.name || item.roomCode || item.code || '-'"
            :item-value="item => item.roomId || item.id || item.roomExamId"
            placeholder="Phòng thi"
            outlined
            dense
            hide-details
            clearable
            class="filter-input"
            style="min-width: 160px;"
            :no-data-text="!filters.subjectId ? 'Vui lòng chọn học phần trước' : 'Không có dữ liệu'"
            @click.native="checkSubjectBeforeClick"
          ></v-select>

          <!-- Tìm kiếm theo sinh viên (Họ tên / Mã SV) -->
          <v-text-field
            v-model="filters.fullName"
            placeholder="Sinh viên"
            outlined
            dense
            hide-details
            clearable
            class="filter-input"
            style="min-width: 200px; max-width: 250px;"
            @keyup.enter="handleSearch"
          ></v-text-field>

          <!-- Nút thao tác (Làm mới, Tìm kiếm) -->
          <div class="d-flex align-center" style="gap: 5px;">
            <v-btn icon color="#A62229" @click="refreshData" title="Làm mới">
              <v-icon size="22">mdi-refresh</v-icon>
            </v-btn>

            <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="handleSearch" title="Tìm kiếm">
              <v-icon size="22">mdi-magnify</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- KHUNG BASETABLE HIỂN THỊ DỮ LIỆU -->
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
        <!-- Mã số sinh viên -->
        <template #[`item.studentCode`]="{ item }">
          <span class="font-weight-medium">{{ item.studentCode || item.code || '-' }}</span>
        </template>

        <!-- Họ và tên -->
        <template #[`item.fullName`]="{ item }">
          <span class="font-weight-medium">{{ item.fullName || item.name || '-' }}</span>
        </template>

        <!-- Lớp SV -->
        <template #[`item.studentClass`]="{ item }">
          <span>{{ item.studentClass || item.className || '-' }}</span>
        </template>

        <!-- Điểm -->
        <template #[`item.score`]="{ item }">
          <span class="font-weight-bold red--text text--darken-2">{{ item.score !== undefined ? item.score : '-' }}</span>
        </template>

        <!-- Ghi chú -->
        <template #[`item.note`]="{ item }">
          <span>{{ item.note || '-' }}</span>
        </template>

        <!-- Kỳ thi -->
        <template #[`item.examName`]="{ item }">
          <span>{{ item.examName || item.exam?.name || '-' }}</span>
        </template>

        <!-- Học phần -->
        <template #[`item.subjectName`]="{ item }">
          <span>{{ item.subjectName || item.subject?.name || '-' }}</span>
        </template>

        <!-- Phòng thi -->
        <template #[`item.roomName`]="{ item }">
          <span>{{ item.roomName || item.roomExam?.name || '-' }}</span>
        </template>

        <!-- Trạng thái -->
        <template #[`item.status`]="{ item }">
          <v-chip small :color="item.status === 'ACTIVE' ? '#a2212b' : '#9e9e9e'" dark>
            {{ item.statusName || (item.status === 'ACTIVE' ? 'Đạt' : 'Không đạt') }}
          </v-chip>
        </template>
      </BaseTable>
    </div>

    <!-- THANH PHÂN TRANG PHÍA DƯỚI -->
    <div class="pagination-bottom-container mt-4 pt-3 d-flex align-center justify-end flex-wrap gap-3 sticky-bottom-bar border-top">
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
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import resultService from '~/services/resultService'

export default {
  name: 'ResultManagementPage',
  components: {
    BaseTable,
  },
  data() {
    return {
      isMobileDevice: false,
      loading: false,
      filters: {
        fullName: '',
        examId: '',
        subjectId: '',
        roomExamId: '',
      },
      activeFilters: {
        fullName: '',
        examId: '',
        subjectId: '',
        roomExamId: '',
      },
      examList: [],
      subjectList: [],
      roomList: [],

      itemList: [],
      totalRecords: 0,
      totalPages: 1,
      currentPage: 1,
      pageInput: 1,
      itemsPerPage: 50,

      tableHeaders: [
        { value: 'studentCode', text: 'Mã số sinh viên', align: 'left', width: '140px', sortable: false },
        { value: 'fullName', text: 'Họ và tên', align: 'left', minWidth: '160px', sortable: false },
        { value: 'studentClass', text: 'Lớp SV', align: 'left', width: '120px', sortable: false },
        { value: 'score', text: 'Điểm', align: 'center', width: '90px', sortable: false },
        { value: 'note', text: 'Ghi chú', align: 'left', minWidth: '150px', sortable: false },
        { value: 'examName', text: 'Kỳ thi', align: 'left', width: '150px', sortable: false },
        { value: 'subjectName', text: 'Học phần', align: 'left', width: '150px', sortable: false },
        { value: 'roomName', text: 'Phòng thi', align: 'left', width: '130px', sortable: false },
        { value: 'status', text: 'Trạng thái', align: 'center', width: '120px', sortable: false },
      ],
    }
  },
  async mounted() {
    if (typeof navigator !== 'undefined') {
      this.isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }
    await this.initPageData()
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
        fullName: this.extractValue(this.filters.fullName),
        examId: this.extractValue(this.filters.examId),
        subjectId: this.extractValue(this.filters.subjectId),
        roomExamId: this.extractValue(this.filters.roomExamId),
      }
      this.currentPage = 1
      this.pageInput = 1
      this.loadData()
    },

    refreshData() {
      this.filters = { fullName: '', examId: '', subjectId: '', roomExamId: '' }
      this.activeFilters = { fullName: '', examId: '', subjectId: '', roomExamId: '' }
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

        if (this.activeFilters.fullName !== '') baseParams.fullName = this.activeFilters.fullName
        if (this.activeFilters.examId !== '') baseParams.examId = this.activeFilters.examId
        if (this.activeFilters.subjectId !== '') baseParams.subjectId = this.activeFilters.subjectId
        if (this.activeFilters.roomExamId !== '') baseParams.roomExamId = this.activeFilters.roomExamId

        const res = await resultService.getList(baseParams)
        if (res) {
          const rootData = res.data !== undefined ? res.data : res
          const allItems = Array.isArray(rootData) ? rootData : (rootData.data || rootData.content || rootData.items || [])
          
          const rawTotal = rootData.totalElements ?? rootData.totalRecords ?? rootData.total ?? (res.totalElements || res.totalRecords || res.total)
          this.totalRecords = rawTotal !== undefined ? Number(rawTotal) : allItems.length

          this.itemList = allItems
          this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage) || 1
        }
      } catch (error) {
        console.error('Lỗi tải danh sách kết quả thi:', error)
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
    // 1. Tải danh sách Kỳ thi ban đầu
    async initPageData() {
      try {
        const res = await resultService.getExamList({ status: 'ACTIVE', channel: 'CMS' })
        if (res) {
          const rawData = res.data !== undefined ? res.data : res
          this.examList = Array.isArray(rawData) 
            ? rawData 
            : (rawData.data || rawData.content || rawData.items || [])
        }
      } catch (error) {
        console.error('Lỗi khởi tạo kỳ thi:', error)
        this.examList = []
      }
    },

    // 2. Khi chọn Kỳ thi -> Gọi API Học phần tương ứng
    async handleExamChange(examId) {
      this.filters.subjectId = ''
      this.filters.roomExamId = ''
      this.subjectList = []
      this.roomList = []

      if (!examId) return

      try {
        const res = await resultService.getTermList(examId, 'CMS')
        if (res) {
          const rawData = res.data !== undefined ? res.data : res
          this.subjectList = Array.isArray(rawData) ? rawData : (rawData.data || rawData.content || rawData.items || [])
        }
      } catch (error) {
        console.error('Lỗi tải danh sách học phần:', error)
        this.subjectList = []
      }
    },

    // Khi thay đổi Học phần -> Reset phòng thi và tải danh sách phòng thi tương ứng
    async handleSubjectChange(subjectId) {
      this.filters.roomExamId = ''
      this.roomList = []

      if (!subjectId) return

      try {
        const res = await resultService.getRoomList(subjectId, 'CMS')
        if (res) {
          const rawData = res.data !== undefined ? res.data : res
          this.roomList = Array.isArray(rawData) ? rawData : (rawData.data || rawData.content || rawData.items || [])
        }
      } catch (error) {
        console.error('Lỗi tải danh sách phòng thi:', error)
        this.roomList = []
      }
    },
    // Khi bấm vào học phần mà chưa chọn kỳ thi
    checkExamBeforeClick() {
      if (!this.filters.examId) {
        this.subjectList = [] // Đảm bảo danh sách rỗng để v-select hiển thị no-data-text
      }
    },

    // Khi bấm vào phòng thi mà chưa chọn học phần
    checkSubjectBeforeClick() {
      if (!this.filters.subjectId) {
        this.roomList = [] // Đảm bảo danh sách rỗng để v-select hiển thị no-data-text
      }
    },
  },
}
</script>
<style scoped>
.filter-container {
  background-color: #fff;
}

.sticky-filter {
  position: sticky;
  top: 0;
  z-index: 2;
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