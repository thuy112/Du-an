<template>
  <div class="register-student-page pa-3 pa-md-4 bg-white" :class="{ 'is-mobile-device': isMobileDevice }">
    <!-- TIÊU ĐỀ TRANG -->
    <div class="text-h6 font-weight-bold black--text mb-3">
      Danh sách lớp thi lại (<span class="text-red-bold">{{ totalRecords }}</span>)
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
          class="filter-item"
          style="min-width: 170px; flex: 1 1 170px;"
          @keyup.enter="handleSearch"
        ></v-text-field>

        <v-select
          v-model="filters.classId"
          :items="classOptions"
          item-text="text"
          item-value="value"
          placeholder="Lớp SV"
          outlined
          dense
          hide-details
          clearable
          class="filter-item"
          style="min-width: 150px; flex: 1 1 150px;"
        ></v-select>

        <v-select
          v-model="filters.examId"
          :items="examOptions"
          item-text="text"
          item-value="value"
          placeholder="Kỳ thi"
          outlined
          dense
          hide-details
          clearable
          class="filter-item"
          style="min-width: 150px; flex: 1 1 150px;"
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
          class="filter-item"
          style="min-width: 150px; flex: 1 1 150px;"
        ></v-select>

        <!-- Cụm nút thao tác -->
        <div class="d-flex align-center flex-shrink-0" style="gap: 6px;">
          <v-btn icon color="#A62229" class="btn-square-action" @click="refreshData" title="Làm mới">
            <v-icon size="24">mdi-refresh</v-icon>
          </v-btn>

          <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="handleSearch" title="Tìm kiếm">
            <v-icon size="24">mdi-magnify</v-icon>
          </v-btn>

          <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="openAddDialog" title="Thêm mới">
            <v-icon size="24">mdi-plus</v-icon>
          </v-btn>
        </div>
      </div>

      <!-- Hàng phụ: Từ ngày & Đến ngày -->
      <div class="d-flex align-center flex-wrap px-2 pb-2" style="gap: 8px;">
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
              class="filter-item"
              style="max-width: 250px;"
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
            no-title
            scrollable
            @input="menuFromDate = false"
          ></v-date-picker>
        </v-menu>

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
              class="filter-item"
              style="max-width: 250px;"
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
            no-title
            scrollable
            @input="menuToDate = false"
          ></v-date-picker>
        </v-menu>
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
        <template #[`item.stt`]="{ index }">
          <span>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</span>
        </template>

        <template #[`item.className`]="{ item }">
          <span class="font-weight-medium" style="color: #A62229;">{{ item.className || item.name || '---' }}</span>
        </template>

        <template #[`item.examName`]="{ item }">
          <span>{{ item.examName || '---' }}</span>
        </template>

        <template #[`item.termName`]="{ item }">
          <span>{{ item.termName || '---' }}</span>
        </template>

        <template #[`item.semester`]="{ item }">
          <span>{{ item.semester || '---' }}</span>
        </template>

        <template #[`item.totalRegistered`]="{ item }">
          <span class="font-weight-bold">{{ item.totalRegistered || 0 }}</span>
        </template>

        <template #[`item.timeStr`]="{ item }">
          <span>{{ item.timeStr || item.time || '---' }}</span>
        </template>

        <template #[`item.status`]="{ item }">
          <v-chip small :color="item.status === 'ACTIVE' ? '#4caf50' : '#757575'" dark class="font-weight-medium">
            {{ item.status === 'ACTIVE' ? 'Đang mở' : 'Đóng' }}
          </v-chip>
        </template>

        <template #[`item.scoreStatus`]="{ item }">
          <span>{{ item.scoreStatus || '---' }}</span>
        </template>

        <template #[`item.actions`]="{ item }">
          <div class="d-flex justify-center" style="gap: 4px;">
            <v-btn icon small color="primary" @click="handleEdit(item)" title="Sửa">
              <v-icon size="18">mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon small color="error" @click="handleDelete(item)" title="Xóa">
              <v-icon size="18">mdi-delete</v-icon>
            </v-btn>
          </div>
        </template>
      </BaseTable>
    </div>

    <!-- PHÂN TRANG VÀ NÚT TÁC VỤ DƯỚI -->
    <div class="pagination-bottom-container mt-4 pt-3 d-flex align-center justify-space-between flex-wrap gap-3 sticky-bottom-bar border-top">
      <div class="d-flex align-center" style="gap: 8px;">
        <!-- Nút Nhập file excel -->
        <v-btn color="#4caf50" dark class="text-none font-weight-medium rounded-sm text-nowrap px-3" height="32" elevation="0" style="font-size: 12px; border-radius: 4px !important;" @click="openImportModal">
          <v-icon left small>mdi-import</v-icon>
          NHẬP FILE EXCEL
        </v-btn>

        <!-- Nút Xuất bảng điểm tổng hợp -->
        <v-btn color="#4caf50" dark class="text-none font-weight-medium rounded-sm text-nowrap px-3" height="32" elevation="0" style="font-size: 12px; border-radius: 4px !important;" @click="exportReportFile">
          <v-icon left small>mdi-export</v-icon>
          XUẤT BẢNG ĐIỂM TỔNG HỢP
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

    <!-- MODAL THÊM MỚI -->
    <ExamSessionAddModal
      v-model="addModalVisible"
      @success="handleCreateSuccess"
    />

    <!-- MODAL NHẬP FILE EXCEL -->
    <v-dialog v-model="importModalVisible" max-width="550px" persistent @click:outside="closeImportModal">
      <v-card class="rounded-lg">
        <v-card-title class="headline px-6 py-4" style="background-color: #A62229; color: white;">
          <span>Nhập file excel</span>
          <v-spacer></v-spacer>
          <v-btn icon dark @click="closeImportModal">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="px-6 py-4">
          <div class="mb-3 text-body-2">
            Tải file mẫu ở đây: 
            <a href="#" class="text-decoration-underline font-weight-medium" style="color: #A62229;" @click.prevent="downloadTemplate">
              template_danh_sach_thi_lai.xlsx
            </a>
          </div>

          <div v-if="!selectedFile" class="upload-drop-zone pa-6 text-center rounded-lg" @click="$refs.fileInput.click()">
            <v-icon size="48" color="#A62229">mdi-plus-circle-outline</v-icon>
            <div class="text-subtitle-2 font-weight-medium mt-2" style="color: #333;">Chọn tệp đính kèm</div>
            <input 
              ref="fileInput" 
              type="file" 
              accept=".xlsx, .xls" 
              style="display: none;" 
              @change="onFileSelected"
            >
          </div>

          <div v-else class="d-flex align-center justify-space-between px-4 py-3 rounded-lg" style="background-color: #e8f5e9; border: 1px solid #c8e6c9;">
            <div class="d-flex align-center text-truncate" style="gap: 8px;">
              <v-icon color="green darken-2">mdi-file-excel</v-icon>
              <span class="text-body-2 font-weight-medium text-truncate" style="color: #2e7d32;">{{ selectedFile.name }}</span>
            </div>
            <v-btn icon small color="grey darken-1" @click="removeFile">
              <v-icon size="18">mdi-close</v-icon>
            </v-btn>
          </div>
        </v-card-text>

        <v-card-actions class="px-6 pb-4">
          <v-spacer></v-spacer>
          <v-btn color="#A62229" dark depressed :disabled="!selectedFile || loading" @click="handleImport">
            Import
          </v-btn>
          <v-btn outlined color="grey darken-1" text @click="closeImportModal">Đóng</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import examSessionService from '~/services/examSessionService'
import ExamSessionAddModal from '~/components/ExamSessionAddModal.vue'

export default {
  name: 'ExamSessionPage',
  components: {
    BaseTable,
    ExamSessionAddModal,
  },
  data() {
    return {
      addModalVisible: false,
      importModalVisible: false,
      selectedFile: null,
      isMobileDevice: false,
      loading: false,
      filters: {
        search: '',
        classId: '',
        examId: '',
        termId: '',
        fromTime: '',
        toTime: '',
      },
      activeFilters: {
        search: '',
        classId: '',
        examId: '',
        termId: '',
        fromTime: '',
        toTime: '',
      },
      classOptions: [],
      examOptions: [],
      termOptions: [],
      menuFromDate: false,
      menuToDate: false,

      itemList: [],
      totalRecords: 0,
      totalPages: 1,
      currentPage: 1,
      pageInput: 1,
      itemsPerPage: 50,

      tableHeaders: [
        { value: "stt", text: "STT", align: "center", width: "60px", sortable: false },
        { value: "className", text: "Lớp thi", align: "left", sortable: false },
        { value: "examName", text: "Kỳ thi", align: "left", sortable: false },
        { value: "termName", text: "Học phần", align: "left", sortable: false },
        { value: "semester", text: "Kỳ học", align: "left", sortable: false },
        { value: "totalRegistered", text: "Số lượng đăng ký", align: "center", sortable: false },
        { value: "timeStr", text: "Thời gian", align: "center", sortable: false },
        { value: "status", text: "Trạng thái", align: "center", sortable: false },
        { value: "scoreStatus", text: "Trạng thái bảng điểm", align: "center", sortable: false },
        { value: "actions", text: "Chức năng", align: "center", width: "100px", sortable: false },
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
        const [classRes, examRes, termRes] = await Promise.all([
          examSessionService.getClasses().catch(() => null),
          examSessionService.getExams().catch(() => null),
          examSessionService.getTerms().catch(() => null),
        ])

        if (classRes) {
          const list = Array.isArray(classRes) ? classRes : classRes.data || classRes.content || []
          this.classOptions = list.map(item => ({ text: item.name || item.code, value: item.id }))
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
        search: this.filters.search,
        classId: this.extractValue(this.filters.classId),
        examId: this.extractValue(this.filters.examId),
        termId: this.extractValue(this.filters.termId),
        fromTime: this.filters.fromTime ? this.formatApiDateTime(this.filters.fromTime) : '',
        toTime: this.filters.toTime ? this.formatApiDateTime(this.filters.toTime, true) : '',
      }
      this.currentPage = 1
      this.pageInput = 1
      this.loadData()
    },

    refreshData() {
      this.filters = {
        search: '',
        classId: '',
        examId: '',
        termId: '',
        fromTime: '',
        toTime: '',
      }
      this.activeFilters = {
        search: '',
        classId: '',
        examId: '',
        termId: '',
        fromTime: '',
        toTime: '',
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
          ...this.activeFilters
        }

        const res = await examSessionService.getList(baseParams)

        if (!res || res.success === false || res.response) {
          console.error('API tải danh sách lớp thi không thành công:', res)
          return
        }

        const rootData = res.data !== undefined ? res.data : res
        const allItems = Array.isArray(rootData) ? rootData : (rootData?.data || rootData?.content || rootData?.items || [])

        const rawTotal = rootData?.totalElements ?? rootData?.totalRecords ?? rootData?.total ?? (res.totalElements || res.totalRecords || res.total)
        this.totalRecords = rawTotal !== undefined ? Number(rawTotal) : allItems.length

        this.itemList = (Array.isArray(allItems) ? allItems : []).map(item => ({
          ...item,
          className: item.className || item.classes?.name || '---',
          examName: item.examName || item.exam?.name || '---',
          termName: item.termName || item.courseName || '---',
          semester: item.semester || item.term?.semester || '---',
          totalRegistered: item.totalRegistered || item.total || 0,
          timeStr: item.timeStr || item.time || '---',
          status: item.status || 'ACTIVE',
          scoreStatus: item.scoreStatus || '---',
        }))

        this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage) || 1
      } catch (error) {
        console.error('Lỗi tải danh sách lớp thi lại:', error)
      } finally {
        this.loading = false
      }
    },

    formatDisplayDate(dateStr) {
      if (!dateStr) return ''
      const date = dateStr.split(/[ T]/)[0]
      const parts = date.split('-')
      if (parts.length !== 3) return dateStr
      const [year, month, day] = parts
      return `${day}/${month}/${year}`
    },

    formatApiDateTime(date, isEndOfDay = false) {
      if (!date) return ''
      const dateOnly = date.split(/[ T]/)[0]
      const [year, month, day] = dateOnly.split('-')
      if (!year || !month || !day) return ''
      return `${day}/${month}/${year} ${isEndOfDay ? '23:59:59' : '00:00:00'}`
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

    openAddDialog() {
      this.addModalVisible = true
    },
    async handleCreateSuccess() {
      this.currentPage = 1
      this.pageInput = 1
      await this.loadData()
    },
    handleEdit(item) {
      console.log('Sửa bản ghi:', item)
    },
    handleDelete(item) {
      console.log('Xóa bản ghi:', item)
    },

    // --- XUẤT BẢNG ĐIỂM TỔNG HỢP ---
    async exportReportFile() {
      try {
        this.loading = true
        const params = {
          name: this.activeFilters.search || '',
          ...this.activeFilters
        }
        const response = await examSessionService.exportAllNoScore(params)
        const blob = new Blob([response.data || response], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        })
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = `Bang-dien-tong-hop-${new Date().toISOString().slice(0, 10)}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(link.href)
      } catch (error) {
        console.error('Lỗi khi xuất bảng điểm tổng hợp:', error)
      } finally {
        this.loading = false
      }
    },

    // --- NHẬP FILE EXCEL ---
    openImportModal() {
      this.selectedFile = null
      this.importModalVisible = true
    },
    closeImportModal() {
      this.selectedFile = null
      this.importModalVisible = false
    },
    onFileSelected(event) {
      const files = event.target.files
      if (files && files[0]) {
        this.selectedFile = files[0]
      }
    },
    removeFile() {
      this.selectedFile = null
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    },
    async downloadTemplate() {
      try {
        const res = await examSessionService.downloadImportTemplate()
        const blob = new Blob([res.data || res], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        })
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = 'template_danh_sach_thi_lai.xlsx'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(link.href)
      } catch (error) {
        console.error('Lỗi tải file mẫu:', error)
      }
    },
    async handleImport() {
      if (!this.selectedFile) return
      this.loading = true
      const formData = new FormData()
      formData.append('file', this.selectedFile)

      try {
        // Bước kiểm tra file trước khi import
        const checkRes = await examSessionService.checkImportExamSession(formData)
        if (checkRes && (checkRes.success !== false || checkRes.code === 0)) {
          // Gọi API import chính thức
          await examSessionService.importExamSession(formData)
          this.closeImportModal()
          await this.loadData()
        }
      } catch (error) {
        console.error('Lỗi khi import file:', error)
      } finally {
        this.loading = false
      }
    }
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
.filter-item >>> .v-input__slot {
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
  position: sticky;
  bottom: 0;
  z-index: 5;
  background-color: #ffffff;
  padding-bottom: 12px;
}
.table-scroll-container {
  overflow-x: auto;
  overflow-y: auto;
  position: relative;
}
.upload-drop-zone {
  border: 2px dashed #A62229;
  background-color: #fafafa;
  cursor: pointer;
  transition: background-color 0.2s;
}
.upload-drop-zone:hover {
  background-color: #fce4e4;
}
::v-deep .v-data-footer {
  display: none !important;
}
</style>