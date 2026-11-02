<template>
  <div class="authorize-registration-page pa-3 pa-md-4 bg-white" :class="{ 'is-mobile-device': isMobileDevice }">
    <!-- TIÊU ĐỀ TRANG -->
    <div class="text-h6 font-weight-bold black--text mb-3">
      Danh sách sinh viên được đăng ký (<span class="text-red-bold">{{ totalRecords }}</span>)
    </div>

    <!-- BỘ LỌC TÌM KIẾM CỐ ĐỊNH PHÍA TRÊN -->
    <div class="filter-container mb-3 sticky-filter">
      <div class="d-flex align-center flex-wrap" style="gap: 8px; padding: 6px;">
        <v-text-field
          v-model="filters.search"
          placeholder="Tìm kiếm"
          outlined
          dense
          hide-details
          clearable
          class="filter-input flex-grow-1"
          style="min-width: 180px;"
          @keyup.enter="handleSearch"
        ></v-text-field>

        <v-select
          v-model="filters.semesterId"
          :items="semesterOptions"
          item-text="text"
          item-value="value"
          placeholder="Kỳ học"
          outlined
          dense
          hide-details
          clearable
          class="filter-input flex-grow-1"
          style="min-width: 150px;"
        ></v-select>

        <v-select
          v-model="filters.examId"
          :items="examOptions"
          item-text="text"
          item-value="value"
          placeholder="Kỳ đăng ký thi lại"
          outlined
          dense
          hide-details
          clearable
          class="filter-input flex-grow-1"
          style="min-width: 170px;"
        ></v-select>

        <v-select
          v-model="filters.termId"
          :items="termOptions"
          item-text="text"
          item-value="value"
          placeholder="Học phần"
          outlined
          dense
          hide-details
          clearable
          class="filter-input flex-grow-1"
          style="min-width: 150px;"
        ></v-select>

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
          style="min-width: 140px;"
        ></v-select>

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
        :is-mobile="isMobileDevice"
        :current-page="currentPage"
        :items-per-page="itemsPerPage"
        :total-records="totalRecords"
        hide-default-footer
        @page-change="changePage"
        @per-page-change="handleItemsPerPageChange"
      >
        <template #[`item.index`]="{ index }">
          <span>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</span>
        </template>

        <template #[`item.studentInfo`]="{ item }">
          <div class="py-1">
            <div class="font-weight-bold black--text">{{ item.studentName || item.fullName || '-' }}</div>
            <div class="text-caption grey--text text--darken-2">Mã số sinh viên: <span class="error--text font-weight-medium">{{ item.studentCode || item.code || '-' }}</span></div>
            <div class="text-caption grey--text text--darken-2">Lớp: {{ item.className || item.class_name || '-' }}</div>
          </div>
        </template>

        <template #[`item.classExam`]="{ item }">
          <span>{{ item.classExam || item.examClass || '-' }}</span>
        </template>

        <template #[`item.examName`]="{ item }">
          <span>{{ item.examName || item.examTitle || '-' }}</span>
        </template>

        <template #[`item.semesterName`]="{ item }">
          <span>{{ item.semesterName || item.semester || '-' }}</span>
        </template>

        <template #[`item.courseCode`]="{ item }">
          <span>{{ item.courseCode || item.subjectCode || '-' }}</span>
        </template>

        <template #[`item.courseName`]="{ item }">
          <span>{{ item.courseName || item.subjectName || '-' }}</span>
        </template>

        <template #[`item.status`]="{ item }">
          <v-chip
            small
            dark
            :color="item.status === 'REGISTERED' || item.status === 'ACTIVE' || item.isRegistered ? '#4caf50' : '#757575'"
            class="font-weight-medium text-caption"
          >
            {{ item.statusText || (item.status === 'REGISTERED' || item.isRegistered ? 'Đã đăng ký' : 'Chưa đăng ký') }}
          </v-chip>
        </template>

        <template #[`item.actions`]="{ item }">
          <v-btn icon small color="error" @click="handleDelete(item)" title="Xóa">
            <v-icon size="20">mdi-delete</v-icon>
          </v-btn>
        </template>
      </BaseTable>
    </div>

    <!-- PHÂN TRANG -->
    <div class="pagination-bottom-container mt-4 pt-3 d-flex align-center justify-space-between flex-wrap gap-3 sticky-bottom-bar border-top">
      <div class="d-flex align-center" style="gap: 8px;">
        <v-btn color="#4caf50" dark class="text-none font-weight-medium rounded-sm text-nowrap px-3" height="32" elevation="0" style="font-size: 12px; border-radius: 4px !important;" @click="exportReportFile">
          <v-icon left small>mdi-export</v-icon>
          XUẤT FILE BÁO CÁO
        </v-btn>

        <v-btn color="#4caf50" dark class="text-none font-weight-medium rounded-sm text-nowrap px-3" height="32" elevation="0" style="font-size: 12px; border-radius: 4px !important;" @click="openImportDialog">
          <v-icon left small>mdi-import</v-icon>
          NHẬP FILE ĐĂNG KÍ
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
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import authorizeService from '~/services/authorizeRegistrationService' // Import service

export default {
  name: 'AuthorizeRegistrationPage',
  components: {
    BaseTable,
  },
  data() {
    return {
      isMobileDevice: false,
      loading: false,
      filters: {
        search: '',
        semesterId: '',
        examId: '',
        termId: '',
        status: '',
      },
      activeFilters: {
        search: '',
        semesterId: '',
        examId: '',
        termId: '',
        status: '',
      },
      semesterOptions: [],
      examOptions: [],
      termOptions: [],
      
      statusList: [
        { value: 'REGISTERED', text: 'Đã đăng ký' },
        { value: 'UNREGISTERED', text: 'Chưa đăng ký' },
      ],

      itemList: [],
      totalRecords: 0,
      totalPages: 1,
      currentPage: 1,
      pageInput: 1,
      itemsPerPage: 50,

      tableHeaders: [
        { text: 'STT', value: 'index', align: 'center', width: '60px', sortable: false },
        { text: 'Thông tin sinh viên', value: 'studentInfo', align: 'left', minWidth: '220px', sortable: false },
        { text: 'Lớp thi', value: 'classExam', align: 'left', minWidth: '110px', sortable: false },
        { text: 'Tên kỳ đăng ký thi lại', value: 'examName', align: 'left', minWidth: '160px', sortable: false },
        { text: 'Kỳ học', value: 'semesterName', align: 'left', minWidth: '150px', sortable: false },
        { text: 'Mã học phần', value: 'courseCode', align: 'left', minWidth: '110px', sortable: false },
        { text: 'Tên học phần', value: 'courseName', align: 'left', minWidth: '160px', sortable: false },
        { text: 'Trạng thái', value: 'status', align: 'center', minWidth: '130px', sortable: false },
        { text: 'Chức năng', value: 'actions', align: 'center', width: '90px', sortable: false },
      ],
    }
  },
  async mounted() {
    if (typeof navigator !== 'undefined') {
      this.isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }
    await this.fetchCatalogs()
    await this.loadData()
  },
  methods: {
    async fetchCatalogs() {
      try {
        const [semesterRes, examRes, termRes] = await Promise.all([
          authorizeService.getSemesters({ status: 'ACTIVE', channel: 'CMS' }).catch(() => null),
          authorizeService.getExams({ status: 'ACTIVE', channel: 'CMS' }).catch(() => null),
          authorizeService.getTerms({ status: 'ACTIVE', channel: 'CMS' }).catch(() => null),
        ])

        if (semesterRes) {
          const list = Array.isArray(semesterRes) ? semesterRes : semesterRes.data || semesterRes.content || []
          this.semesterOptions = list.map(item => ({ text: item.name || item.code, value: item.id }))
        }
        if (examRes) {
          const list = Array.isArray(examRes) ? examRes : examRes.data || examRes.content || []
          this.examOptions = list.map(item => ({ text: item.name || item.code, value: item.id }))
        }
        if (termRes) {
          const list = Array.isArray(termRes) ? termRes : termRes.data || termRes.content || []
          this.termOptions = list.map(item => ({ text: item.name || item.code, value: item.id }))
        }
      } catch (error) {
        console.error('Lỗi tải danh mục phụ:', error)
      }
    },

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
        semesterId: this.extractValue(this.filters.semesterId),
        examId: this.extractValue(this.filters.examId),
        termId: this.extractValue(this.filters.termId),
        status: this.extractValue(this.filters.status),
      }
      this.currentPage = 1
      this.pageInput = 1
      this.loadData()
    },

    refreshData() {
      this.filters = {
        search: '',
        semesterId: '',
        examId: '',
        termId: '',
        status: '',
      }
      this.activeFilters = {
        search: '',
        semesterId: '',
        examId: '',
        termId: '',
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
        if (this.activeFilters.semesterId !== '') {
          baseParams.semesterId = this.activeFilters.semesterId
        }
        if (this.activeFilters.examId !== '') {
          baseParams.examId = this.activeFilters.examId
        }
        if (this.activeFilters.termId !== '') {
          baseParams.termId = this.activeFilters.termId
        }
        if (this.activeFilters.status !== '') {
          baseParams.status = this.activeFilters.status
        }

        const res = await authorizeService.getList(baseParams)
        if (res) {
          const rootData = res.data !== undefined ? res.data : res
          const allItems = Array.isArray(rootData) ? rootData : (rootData.data || rootData.content || rootData.items || [])
          
          const rawTotal = rootData.totalElements ?? rootData.totalRecords ?? rootData.total ?? (res.totalElements || res.totalRecords || res.total)
          this.totalRecords = rawTotal !== undefined ? Number(rawTotal) : allItems.length

          this.itemList = allItems
          this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage) || 1
        }
      } catch (error) {
        console.error('Lỗi tải danh sách sinh viên đăng ký:', error)
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

    handleDelete(item) {
      console.log('Xóa bản ghi:', item)
    },

    openAddDialog() {},
    exportReportFile() {},
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
.cursor-pointer {
  cursor: pointer;
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