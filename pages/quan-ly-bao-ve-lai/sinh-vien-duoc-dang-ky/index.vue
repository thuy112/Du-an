<template>
  <div class="authorize-page pa-3 pa-md-4 bg-white" :class="{ 'is-mobile-device': isMobileDevice }">
    <!-- TIÊU ĐỀ TRANG -->
    <div class="text-h6 font-weight-bold black--text mb-3">
      Danh sách sinh viên được đăng ký (<span class="text-red-bold">{{ totalRecords }}</span>)
    </div>

    <!-- BỘ LỌC TÌM KIẾM CỐ ĐỊNH PHÍA TRÊN -->
    <div class="filter-container mb-3 sticky-filter">
      <div class="d-flex align-center flex-wrap" style="gap: 8px; padding: 6px;">
        <v-text-field
          v-model="filters.search"
          label="Tìm kiếm sinh viên..."
          outlined
          dense
          hide-details
          clearable
          class="filter-input flex-grow-1"
          style="min-width: 200px;"
          @keyup.enter="handleSearch"
        ></v-text-field>

        <v-select
          v-model="filters.semesterId"
          :items="semesterList"
          item-text="name"
          item-value="id"
          label="Học kỳ"
          outlined
          dense
          hide-details
          clearable
          class="filter-input"
          style="min-width: 160px;"
        ></v-select>

        <v-select
          v-model="filters.examId"
          :items="examList"
          item-text="name"
          item-value="id"
          label="Đợt bảo vệ lại"
          outlined
          dense
          hide-details
          clearable
          class="filter-input"
          style="min-width: 180px;"
        ></v-select>

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

        <!-- Nút thao tác (Có cả nút Thêm mới dấu + màu đỏ) -->
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
    <div class="table-scroll-container mb-12">
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

        <template #[`item.studentInfo`]="{ item }">
          <div class="py-1">
            <div class="font-weight-bold" style="color: #A62229;">{{ item.student && item.student.fullName ? item.student.fullName : '-' }}</div>
            <div class="text-caption text--secondary">Mã số sinh viên: {{ item.student && item.student.code ? item.student.code : '-' }}</div>
            <div class="text-caption text--secondary">Lớp: {{ item.student && item.student.classes && item.student.classes.name ? item.student.classes.name : '-' }}</div>
          </div>
        </template>

        <template #[`item.examName`]="{ item }">
          <span>{{ item.exam && item.exam.name ? item.exam.name : '-' }}</span>
        </template>

        <template #[`item.semesterName`]="{ item }">
          <span>{{ item.semesterName || (item.exam && item.exam.semester && item.exam.semester.name) || '-' }}</span>
        </template>

        <template #[`item.status`]="{ item }">
          <v-chip
            small
            class="white--text font-weight-medium px-3"
            :color="item.status === 'REGISTERED' ? '#4caf50' : '#757575'"
          >
            {{ item.status === 'REGISTERED' ? 'Đã đăng ký' : 'Chưa đăng ký' }}
          </v-chip>
        </template>

        <template #[`item.actions`]="{ item }">
          <div class="d-flex align-center justify-center" style="gap: 4px;" v-if="item.status !== 'REGISTERED'">
            <v-btn icon small color="error" @click="handleDelete(item)" title="Xóa">
              <v-icon size="18">mdi-delete</v-icon>
            </v-btn>
          </div>
        </template>
      </BaseTable>
    </div>

    <!-- THANH PHÂN TRANG CỐ ĐỊNH DƯỚI ĐÁY -->
    <div class="pagination-bottom-container px-4 py-3 d-flex align-center justify-space-between flex-wrap gap-3 sticky-bottom-bar elevation-2">
      <!-- 2 NÚT XUẤT VÀ NHẬP FILE (GIỐNG ẢNH MẪU) -->
      <div class="d-flex align-center" style="gap: 8px;">
        <v-btn color="#4caf50" dark depressed class="text-none px-4" height="38" @click="handleExport">
          <v-icon left small>mdi-export</v-icon> Xuất file báo cáo
        </v-btn>
        <v-btn color="#4caf50" dark depressed class="text-none px-4" height="38" @click="handleImportModal">
          <v-icon left small>mdi-microsoft-excel</v-icon> Nhập file đăng ký
        </v-btn>
      </div>

      <!-- KHUNG PHÂN TRANG -->
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
    <v-dialog v-model="isDeleteModalOpen" max-width="450px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="pa-4 text-white" style="background-color: #A62229; color: white;">
          <span class="text-h6 font-weight-bold">Xác nhận</span>
          <v-spacer></v-spacer>
          <v-btn icon dark @click="isDeleteModalOpen = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-5">
          <span>Xác nhận xóa sinh viên </span>
          <span class="font-weight-bold red--text">{{ itemToDelete && itemToDelete.student ? itemToDelete.student.fullName : '' }}</span>
          <span> khỏi danh sách?</span>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-3">
          <v-spacer></v-spacer>
          <v-btn outlined color="grey darken-1" class="text-none px-4" @click="isDeleteModalOpen = false">
            Đóng <v-icon right small>mdi-close</v-icon>
          </v-btn>
          <v-btn color="#A62229" dark class="text-none px-5" :loading="deleting" @click="confirmDelete">
            Xác Nhận
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- TOAST THÔNG BÁO -->
    <v-snackbar
      v-model="snackbar.show"
      top
      right
      timeout="3000"
      :color="snackbar.color"
      elevation="4"
    >
      <div class="d-flex align-center">
        <v-icon left dark class="mr-2">mdi-check-circle</v-icon>
        <span class="white--text font-weight-medium">{{ snackbar.text }}</span>
      </div>
    </v-snackbar>

    <!-- MODAL THÊM MỚI -->
    <AddAuthorizeModal 
      v-model="isAddModalOpen" 
      @success="onAddSuccess" 
      @error="onAddError" 
    />
    <!-- MODAL NHẬP FILE EXCEL -->
    <ImportAuthorizeModal 
      v-model="isImportModalOpen" 
      @success="onSuccessAction" 
    />
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import authorizeRegistrationService from '~/services/redefend/authorizeRegistrationService'
import AddAuthorizeModal from '~/components/AddAuthorizeModal.vue'
import ImportAuthorizeModal from '~/components/ImportAuthorizeModal.vue'

export default {
  name: 'AuthorizeRegistrationPage',
  components: {
    BaseTable,
    AddAuthorizeModal,
    ImportAuthorizeModal
  },
  data() {
    return {
        isAddModalOpen: false,     // Biến mở modal Thêm mới
      isImportModalOpen: false,

      isDeleteModalOpen: false,
      itemToDelete: null,
      deleting: false,

      isMobileDevice: false,
      loading: false,

      filters: {
        search: '',
        semesterId: '',
        examId: '',
        status: '',
      },
      activeFilters: {
        search: '',
        semesterId: '',
        examId: '',
        status: '',
      },
      snackbar: {
        show: false,
        text: '',
        color: '#4caf50',
      },
      semesterList: [],
      examList: [],
      statusList: [
        { text: 'Đã đăng ký', value: 'REGISTERED' },
        { text: 'Chưa đăng ký', value: 'NOT_REGISTERED' },
      ],

      itemList: [],
      totalRecords: 0,
      totalPages: 1,
      currentPage: 1,
      pageInput: 1,
      itemsPerPage: 50,

      tableHeaders: [
        { text: 'STT', value: 'stt', align: 'center', width: '60px', sortable: false },
        { text: 'Thông tin sinh viên', value: 'studentInfo', align: 'left', minWidth: '220px', sortable: false },
        { text: 'Đợt bảo vệ lại', value: 'examName', align: 'left', minWidth: '180px', sortable: false },
        { text: 'Học kỳ', value: 'semesterName', align: 'center', minWidth: '140px', sortable: false },
        { text: 'Trạng thái', value: 'status', align: 'center', minWidth: '140px', sortable: false },
        { text: 'Chức năng', value: 'actions', align: 'center', width: '100px', sortable: false },
      ],
    }
  },
  async mounted() {
    if (typeof navigator !== 'undefined') {
      this.isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }
    await Promise.all([
      this.fetchSemesters(),
      this.fetchExams(),
      this.loadData()
    ])
  },
  methods: {
    async fetchSemesters() {
      try {
        const res = await authorizeRegistrationService.getSemesters({ status: 'ACTIVE', channel: 'CMS' })
        const data = res.data !== undefined ? res.data : res
        this.semesterList = Array.isArray(data) ? data : (data.data || data.content || [])
      } catch (error) {
        console.error('Lỗi tải danh mục học kỳ:', error)
      }
    },
    async fetchExams() {
      try {
        const res = await authorizeRegistrationService.getExams({ status: 'ACTIVE', channel: 'CMS' })
        const data = res.data !== undefined ? res.data : res
        this.examList = Array.isArray(data) ? data : (data.data || data.content || [])
      } catch (error) {
        console.error('Lỗi tải danh mục đợt bảo vệ:', error)
      }
    },
    handleSearch() {
      this.activeFilters = {
        search: this.filters.search,
        semesterId: this.filters.semesterId,
        examId: this.filters.examId,
        status: this.filters.status,
      }
      this.currentPage = 1
      this.pageInput = 1
      this.loadData()
    },
    refreshData() {
      this.filters = { search: '', semesterId: '', examId: '', status: '' }
      this.activeFilters = { search: '', semesterId: '', examId: '', status: '' }
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
        if (this.activeFilters.search) baseParams.search = this.activeFilters.search
        if (this.activeFilters.semesterId) baseParams.semesterId = this.activeFilters.semesterId
        if (this.activeFilters.examId) baseParams.examId = this.activeFilters.examId
        if (this.activeFilters.status) baseParams.status = this.activeFilters.status

        const res = await authorizeRegistrationService.getList(baseParams)
        if (res) {
          const rootData = res.data !== undefined ? res.data : res
          const allItems = Array.isArray(rootData) ? rootData : (rootData.data || rootData.content || rootData.items || [])
          const rawTotal = rootData.totalElements ?? rootData.totalRecords ?? rootData.total ?? (res.totalElements || res.totalRecords || res.total)
          
          this.totalRecords = rawTotal !== undefined ? Number(rawTotal) : allItems.length
          this.itemList = allItems
          this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage) || 1
        }
      } catch (error) {
        console.error('Lỗi tải danh sách sinh viên được đăng ký:', error)
        this.itemList = []
        this.totalRecords = 0
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
      if (page >= 1 && page <= this.totalPages) this.changePage(page)
      else this.pageInput = this.currentPage
    },
    handleItemsPerPageChange(size) {
      this.itemsPerPage = size
      this.currentPage = 1
      this.pageInput = 1
      this.loadData()
    },
    showToast(text, color = '#4caf50') {
      this.snackbar.text = text
      this.snackbar.color = color
      this.snackbar.show = true
    },
    handleDelete(item) {
      this.itemToDelete = item
      this.isDeleteModalOpen = true
    },
    async confirmDelete() {
      if (!this.itemToDelete) return
      this.deleting = true
      try {
        await authorizeRegistrationService.delete(this.itemToDelete.id, 'CMS')
        this.showToast('Xóa thông tin thành công')
        this.isDeleteModalOpen = false
        await this.loadData()
      } catch (error) {
        console.error('Lỗi khi xóa:', error)
      } finally {
        this.deleting = false
        this.itemToDelete = null
      }
    },
    async handleExport() {
            try {
                this.loadingExport = true;
                const res = await authorizeRegistrationService.export({
                    ...this.search,
                });
                if (res.success) {
                    this.$download(res.data.url);
                }
            } catch (e) {
                console.error(e);
            }
            this.loadingExport = false;
        },
    handleImportModal() {
        this.isImportModalOpen = true
    },
    openAddDialog() {
      this.isAddModalOpen = true // <-- Bấm dấu cộng sẽ bật modal lên
    },
    onSuccessAction(msg) {
      this.showToast(msg)
      this.loadData()
    },
    onAddError(message) {
      this.showToast(message, '#d32f2f')
    },
  }
}
</script>

<style scoped>
.text-red-bold { color: #A62229 !important; }
.bg-white { background-color: #ffffff !important; }
.filter-input >>> .v-input__slot { border-radius: 6px !important; min-height: 38px !important; }
.btn-square-action { border-radius: 6px !important; height: 38px !important; min-width: 38px !important; }
.sticky-filter { position: sticky; top: 0; z-index: 5; background-color: #ffffff; }
/* Cố định thanh phân trang ở đáy màn hình */
.sticky-bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  border-top: 1px solid #e0e0e0;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
}
.table-scroll-container { overflow-x: auto; }
::v-deep .v-data-footer { display: none !important; }
</style>