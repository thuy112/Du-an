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
          class="filter-item"
          style="min-width: 180px; flex: 1 1 180px;"
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
          class="filter-item"
          style="min-width: 150px; flex: 1 1 150px;"
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
          class="filter-item"
          style="min-width: 170px; flex: 1 1 170px;"
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
          class="filter-item"
          style="min-width: 140px; flex: 1 1 140px;"
        ></v-select>

        <!-- Cụm nút thao tác -->
        <div class="d-flex align-center flex-shrink-0" style="gap: 6px;">
          <v-btn icon color="#A62229" class="btn-square-action" @click="refreshData" title="Làm mới">
            <v-icon size="22">mdi-refresh</v-icon>
          </v-btn>

          <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="handleSearch" title="Tìm kiếm">
            <v-icon size="22">mdi-magnify</v-icon>
          </v-btn>

          <!-- Nút Dấu Cộng mở Modal Thêm Mới -->
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
        <!-- Cột STT -->
        <template #[`item.stt`]="{ index }">
          <span>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</span>
        </template>

        <!-- Cột Thông tin sinh viên -->
        <template #[`item.student`]="{ item }">
          <div class="py-2 student-info-cell">
            <div class="font-weight-bold student-name-text" style="color:#a2212b">{{ item.studentName }}</div>
            <div class="text-caption grey--text text--darken-2 student-code-row">
              <span>Mã số sinh viên: </span><span class="font-weight-medium text-dark" style="color:#a2212b">{{ item.studentCode }}</span>
            </div>
            <div class="text-caption grey--text text--darken-2">
              <span>Lớp: </span><span style="color:#a2212b">{{ item.className }}</span>
            </div>
          </div>
        </template>

        <template #[`item.examClass`]="{ item }">
          <span>{{ item.examClass }}</span>
        </template>

        <template #[`item.exam.name`]="{ item }">
          <span>{{ item['exam.name'] }}</span>
        </template>

        <template #[`item.semesterName`]="{ item }">
          <span>{{ item.semesterName }}</span>
        </template>

        <template #[`item.termCode`]="{ item }">
          <span>{{ item.termCode }}</span>
        </template>

        <template #[`item.termName`]="{ item }">
          <span>{{ item.termName }}</span>
        </template>

        <template #[`item.status`]="{ item }">
          <v-chip
            small
            dark
            :color="item.status === 'REGISTERED' || item.status === 'ACTIVE' ? '#4caf50' : '#757575'"
            class="font-weight-medium text-caption"
          >
            {{ item.status === 'REGISTERED' || item.status === 'ACTIVE' ? 'Đã đăng ký' : 'Chưa đăng ký' }}
          </v-chip>
        </template>

        <!-- Cột Chức năng -->
        <template #[`item.actions`]="{ item }">
          <v-btn
            v-if="item.status !== 'REGISTERED' && item.status !== 'ACTIVE'"
            icon
            small
            color="error"
            @click="handleDelete(item)"
            title="Xóa"
          >
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

    <!-- MODAL XÁC NHẬN XÓA -->
    <v-dialog v-model="deleteDialog" max-width="500px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <div class="px-6 py-4 text-white font-weight-bold d-flex justify-space-between align-items-center" style="background-color: #A62229; font-size: 18px;">
          <span>Xác nhận</span>
          <v-btn icon dark @click="deleteDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        <v-card-text class="pa-6 text-body-1">
          Bạn có chắc chắn muốn xóa sinh viên được đăng ký này không?
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4 justify-end" style="gap: 8px;">
          <v-btn text class="text-none px-4" @click="deleteDialog = false">Đóng</v-btn>
          <v-btn color="#A2212B" dark depressed class="text-none px-6" :loading="deleting" @click="confirmDelete">Xác Nhận</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MODAL NHẬP FILE EXCEL -->
    <v-dialog v-model="importDialog" max-width="600px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <div class="px-6 py-4 text-white font-weight-bold d-flex justify-space-between align-items-center" style="background-color: #A62229; font-size: 18px;">
          <span>Nhập file excel</span>
          <v-btn icon dark @click="importDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>

        <v-card-text class="pa-6">
          <div class="mb-4">
            Tải file mẫu ở đây: 
            <a href="#" class="red--text font-weight-medium text-decoration-none" @click.prevent="downloadTemplate">
              template_danh_sach_thi.xlsx
            </a>
          </div>

          <v-file-input
            v-model="selectedFile"
            label="Chọn tệp đính kèm"
            outlined
            dense
            prepend-icon="mdi-plus"
            show-size
            accept=".xlsx, .xls"
            class="custom-file-input"
          ></v-file-input>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4 justify-end" style="gap: 8px;">
          <v-btn text class="text-none px-4" @click="importDialog = false">Đóng</v-btn>
          <v-btn color="#A2212B" dark depressed class="text-none px-6" :loading="importing" @click="handleImportSubmit">Import</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- SNACKBAR THÔNG BÁO -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      top
      right
      timeout="3000"
      class="custom-snackbar"
    >
      <div class="d-flex align-center">
        <v-icon left dark>{{ snackbarColor === '#4caf50' ? 'mdi-check-circle' : 'mdi-alert-circle' }}</v-icon>
        <span>{{ snackbarText }}</span>
      </div>
      <template v-slot:action="{ attrs }">
        <v-btn text dark v-bind="attrs" @click="snackbar = false">
          <v-icon small>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>

    <!-- MODAL THÊM SINH VIÊN ĐƯỢC PHÉP THI LẠI -->
    <AddStudentModal v-model="isAddModalOpen" @success="loadData" />
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import AddStudentModal from '~/components/AddStudentModal.vue' // Import component modal thêm mới
import authorizeService from '~/services/authorizeRegistrationService'

export default {
  name: 'AuthorizeRegistrationPage',
  components: {
    BaseTable,
    AddStudentModal, // Đăng ký component modal
  },
  data() {
    return {
      isMobileDevice: false,
      loading: false,
      isAddModalOpen: false, // Biến điều khiển trạng thái ẩn/hiện modal thêm mới
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

      importDialog: false,
      selectedFile: null,
      importing: false,
      
      statusList: [
        { value: 'REGISTERED', text: 'Đã đăng ký' },
        { value: 'UNREGISTERED', text: 'Chưa đăng ký' },
      ],

      deleteDialog: false,
      selectedItemToDelete: null,
      deleting: false,
      snackbar: false,
      snackbarText: '',
      snackbarColor: '#4caf50',

      itemList: [],
      totalRecords: 0,
      totalPages: 1,
      currentPage: 1,
      pageInput: 1,
      itemsPerPage: 50,

      tableHeaders: [
        { value: "stt", text: "STT", align: "center", width: "60px", sortable: false },
        { value: "student", text: "Thông tin sinh viên", width: "250px", align: "left", sortable: false },
        { value: "examClass", text: "Lớp thi", align: "left", sortable: false },
        { value: "exam.name", text: "Tên kỳ đăng ký thi lại", align: "left", sortable: false },
        { value: "semesterName", text: "Học kỳ", align: "left", sortable: false },
        { value: "termCode", text: "Mã học phần", align: "left", sortable: false },
        { value: "termName", text: "Tên học phần", align: "left", sortable: false },
        { value: "status", text: "Trạng thái", align: "center", sortable: false },
        { value: "actions", text: "Chức năng", align: "center", width: "90px", sortable: false },
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

          const rawList = Array.isArray(allItems) ? allItems : []
          this.itemList = rawList.map(item => {
            return {
              ...item,
              studentName: item.studentName || item.fullName || item.name || item.student?.fullName || item.student?.name || '---',
              studentCode: item.studentCode || item.code || item.maSv || item.student?.code || item.student?.studentCode || '---',
              className: 
                item.className || 
                item.clazzName || 
                item.classes?.name || 
                item.classes?.code || 
                item.class?.name || 
                item.class?.code || 
                item.student?.classes?.name || 
                item.student?.clazz?.name || 
                item.student?.className || 
                '---',
              examClass: item.examClass || item.classExam || item.examClassName || item.classes?.code || '---',
              'exam.name': item.exam?.name || item.examName || item.examTitle || '---',
              semesterName: item.semesterName || item.semester?.name || item.semesterTitle || '---',
              termCode: item.termCode || item.courseCode || item.term?.code || item.subjectCode || '---',
              termName: item.termName || item.courseName || item.term?.name || item.subjectName || '---',
              status: item.status || 'UNREGISTERED',
            }
          })

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
      this.selectedItemToDelete = item
      this.deleteDialog = true
    },

    async confirmDelete() {
      if (!this.selectedItemToDelete) return
      this.deleting = true
      try {
        // Lấy chính xác id của item cần xóa (hỗ trợ cả id hoặc code nếu backend dùng khóa chính khác)
        const recordId = this.selectedItemToDelete.id || this.selectedItemToDelete.code
        
        await authorizeService.delete(recordId, 'CMS')
        
        this.deleteDialog = false
        this.snackbarText = 'Xóa thành công'
        this.snackbarColor = '#4caf50'
        this.snackbar = true
        
        // Tải lại danh sách sau khi xóa thành công
        await this.loadData()
      } catch (error) {
        console.error('Lỗi khi xóa:', error)
        const errorMsg = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi xóa'
        this.snackbarText = errorMsg
        this.snackbarColor = '#e53935'
        this.snackbar = true
      } finally {
        this.deleting = false
      }
    },

    // Mở Modal Thêm mới khi bấm vào nút dấu cộng (+)
    openAddDialog() {
      this.isAddModalOpen = true
    },
    // 1. Sửa hàm xuất file báo cáo để mở đúng link hoặc tải file
    async exportReportFile() {
      try {
        const params = {
          channel: 'CMS',
          search: this.activeFilters.search || '',
          semesterId: this.activeFilters.semesterId || ''
        }
        const res = await authorizeService.exportReport(params)
        
        // Trích xuất chính xác chuỗi URL từ response của API
        const responseData = res?.data !== undefined ? res.data : res
        const downloadUrl = typeof responseData === 'string' ? responseData : (responseData?.url || responseData?.fileUrl || '')

        if (downloadUrl) {
          window.open(downloadUrl, '_blank')
        } else {
          this.snackbarText = 'Xuất file báo cáo thành công'
          this.snackbarColor = '#4caf50'
          this.snackbar = true
        }
      } catch (error) {
        console.error('Lỗi xuất file:', error)
        const errorMsg = error.response?.data?.message || error.message || 'Chưa chọn kỳ học hoặc lỗi xuất file'
        this.snackbarText = errorMsg
        this.snackbarColor = '#e53935'
        this.snackbar = true
      }
    },

    // Mở modal nhập file
    openImportDialog() {
      this.selectedFile = null
      this.importDialog = true
    },

    // Tải file template mẫu
    async downloadTemplate() {
      try {
        const res = await authorizeService.getTemplate({ channel: 'CMS' })
        const templateUri = res?.data?.url || res?.url || res
        if (templateUri) {
          window.open(templateUri, '_blank')
        }
      } catch (error) {
        console.error('Lỗi tải template:', error)
      }
    },

    // 2. Sửa hàm xử lý Import: Chỉ Import khi API check trả về hợp lệ
    async handleImportSubmit() {
      if (!this.selectedFile) {
        this.snackbarText = 'Vui lòng chọn tệp đính kèm'
        this.snackbarColor = '#e53935'
        this.snackbar = true
        return
      }

      this.importing = true
      try {
        const formData = new FormData()
        formData.append('file', this.selectedFile)

        // 1. Gọi API check trước
        const checkRes = await authorizeService.checkImportFile(formData, 'CMS')
        const checkData = checkRes?.data !== undefined ? checkRes.data : checkRes

        // Kiểm tra kỹ các trường hợp báo lỗi từ API check
        // (Ví dụ: code khác 0/200, hoặc có thuộc tính error/message lỗi)
        if (checkData) {
          if (checkData.code && checkData.code !== 0 && checkData.code !== 200) {
            throw new Error(checkData.message || 'File không hợp lệ')
          }
          if (checkData.error || checkData.success === false) {
            throw new Error(checkData.message || checkData.error || 'Lỗi kiểm tra file')
          }
        }

        // 2. CHỈ KHI check thành công không có lỗi thì mới gọi API import chính thức
        await authorizeService.importFile(formData, 'CMS')

        this.importDialog = false
        this.snackbarText = 'Import file thành công'
        this.snackbarColor = '#4caf50'
        this.snackbar = true
        
        await this.loadData()
      } catch (error) {
        console.error('Lỗi import file:', error)
        // Lấy chính xác thông báo lỗi từ backend trả về khi check file thất bại
        const errorMsg = error.response?.data?.message || error.message || 'Lỗi import file'
        this.snackbarText = errorMsg
        this.snackbarColor = '#e53935'
        this.snackbar = true
      } finally {
        this.importing = false
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
.filter-item >>> .v-input__slot {
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

.filter-container > div {
  width: 100%;
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

.table-scroll-container >>> .v-data-table__wrapper {
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

.table-scroll-container >>> th {
  position: sticky !important;
  top: 0;
  z-index: 4;
  background-color: #f5f5f5 !important;
  box-shadow: inset 0 -1px 0 #e0e0e0;
}

.student-name-text {
  color: #A62229 !important;
  font-size: 14px;
}

.student-info-cell {
  line-height: 1.4;
}

.text-dark {
  color: #333333 !important;
}

::v-deep .v-data-footer {
  display: none !important;
}
</style>