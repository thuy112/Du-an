<template>
  <div class="education-program-page pa-3 pa-md-4 bg-white" :class="{ 'is-mobile-device': isMobileDevice }">
    <!-- TIÊU ĐỀ TRANG -->
    <div class="text-h6 font-weight-bold black--text mb-3">
      Danh sách chương trình đào tạo (<span class="text-red-bold">{{ totalRecords }}</span>)
    </div>

    <!-- BỘ LỌC TÌM KIẾM CỐ ĐỊNH PHÍA TRÊN -->
    <div class="filter-container mb-3 sticky-filter">
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
          style="min-width: 250px;"
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
          class="filter-input"
          style="min-width: 160px;"
        ></v-select>

        <!-- Nút thao tác (Làm mới, Tìm kiếm, Thêm mới) -->
        <div class="d-flex align-center" style="gap: 5px;">
          <v-btn icon color="#A62229" class="btn-square-action" title="Làm mới" @click="refreshData">
            <v-icon size="22">mdi-refresh</v-icon>
          </v-btn>

          <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" title="Tìm kiếm" @click="handleSearch">
            <v-icon size="22">mdi-magnify</v-icon>
          </v-btn>

          <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" title="Thêm mới" @click="openAdd">
            <v-icon size="22">mdi-plus</v-icon>
          </v-btn>
        </div>
      </div>
    </div>

    <!-- KHUNG BASETABLE HIỂN THỊ DỮ LIỆU (CHỈ PHẦN NÀY LƯỚT CUỘN) -->
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
        <!-- Cột STT -->
        <template #[`item.stt`]="{ index }">
          <span>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</span>
        </template>

        <!-- Mã chương trình -->
        <template #[`item.code`]="{ item }">
          <span class="font-weight-medium">{{ item.code || '-' }}</span>
        </template>

        <!-- Tên chương trình -->
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

        <!-- Cột Chức năng -->
        <template #[`item.actions`]="{ item }">
          <div class="d-flex align-center justify-center" style="gap: 6px;">
            <v-btn icon small color="green" title="Xuất file Excel" @click="handleCustomAction(item)">
              <v-icon size="22">mdi-microsoft-excel</v-icon>
            </v-btn>

            <v-btn icon small color="warning" title="Sửa" @click="openUpdate(item)">
              <v-icon size="22">mdi-pencil</v-icon>
            </v-btn>

            <v-btn icon small color="red" title="Xóa" @click="openDelete(item)">
              <v-icon size="22">mdi-trash-can</v-icon>
            </v-btn>
          </div>
        </template>
      </BaseTable>
    </div>

    <!-- MODAL THÊM / SỬA CHƯƠNG TRÌNH ĐÀO TẠO -->
    <EduProgramAction
      :data-item="selectedItem"
      :is-update="isUpdate"
      :open="isOpenAction"
      @success="onActionSuccess"
      @toggle="isOpenAction = false"
      @update:open="isOpenAction = $event"
    />

    <!-- DIALOG XÁC NHẬN XÓA -->
    <v-dialog v-model="isOpenDelete" max-width="450px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title
          class="pa-3 text-subtitle-1 font-weight-bold white--text d-flex justify-space-between align-center"
          style="background-color: #a2212b"
        >
          <span>Xác nhận xóa</span>
          <v-btn icon small dark @click="isOpenDelete = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-4 text-body-1 black--text">
          Bạn có chắc chắn muốn xóa chương trình đào tạo
          <span class="font-weight-bold red--text">{{ selectedItem && selectedItem.name }}</span> không?
        </v-card-text>

        <v-card-actions class="justify-end pa-3 border-top">
          <v-btn outlined color="grey darken-1" class="text-capitalize mr-2" @click="isOpenDelete = false">
            Hủy
          </v-btn>
          <v-btn
            color="#a2212b"
            dark
            elevation="0"
            class="text-capitalize px-4"
            :loading="isLoadingDelete"
            @click="handleDelete"
          >
            Xác nhận
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- THANH PHÂN TRANG CỐ ĐỊNH PHÍA DƯỚI -->
    <div class="pagination-bottom-container mt-4 pt-3 d-flex align-center justify-space-between flex-wrap gap-3 sticky-bottom-bar border-top">
      <div class="d-flex align-center"></div>

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

    <!-- THÔNG BÁO TOAST CÓ NÚT X VÀ PROGRESS LINEAR CHẠY Ở DƯỚI -->
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
import EduProgramAction from '~/components/EduProgram/Action.vue'
import educationProgramService from '~/services/educationProgramService'

export default {
  name: 'EducationProgramPage',
  components: {
    BaseTable,
    ChangeableStatus,
    EduProgramAction,
  },
  data() {
    return {
      isMobileDevice: false,
      loading: false,
      isOpenAction: false,
      isUpdate: false,
      isOpenDelete: false,
      isLoadingDelete: false,
      selectedItem: {},
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
        timer: null,
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
        { text: 'Mã chương trình', value: 'code', align: 'left', minWidth: '200px', sortable: false },
        { text: 'Tên chương trình', value: 'name', align: 'left', minWidth: '300px', sortable: true },
        { text: 'Trạng thái', value: 'status', align: 'center', minWidth: '150px', sortable: false },
        { text: 'Chức năng', value: 'actions', align: 'center', width: '130px', sortable: false },
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
          educationProgramService.getPageRole ? educationProgramService.getPageRole({ channel: 'CMS' }).catch(() => null) : null,
          educationProgramService.getUserInfo ? educationProgramService.getUserInfo({ channel: 'CMS' }).catch(() => null) : null,
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
      this.filters = { search: '', status: '' }
      this.activeFilters = { search: '', status: '' }
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
          baseParams.name = this.activeFilters.search
          baseParams.code = this.activeFilters.search
        }
        if (this.activeFilters.status !== '') {
          baseParams.status = this.activeFilters.status
        }

        const res = await educationProgramService.getList(baseParams)
        if (res) {
          const rootData = res.data !== undefined ? res.data : res
          const allItems = Array.isArray(rootData) ? rootData : (rootData.data || rootData.content || rootData.items || [])

          const rawTotal = rootData.totalElements ?? rootData.totalRecords ?? rootData.total ?? (res.totalElements || res.totalRecords || res.total)
          this.totalRecords = rawTotal !== undefined ? Number(rawTotal) : allItems.length

          this.itemList = allItems
          this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage) || 1
        }
      } catch (error) {
        console.error('Lỗi tải danh sách chương trình đào tạo:', error)
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
      const page = parseInt(this.pageInput, 10)
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
      this.snackbar.show = false

      this.$nextTick(() => {
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
      })
    },

    async handleStatusChange(item, selectedItem) {
      try {
        const newStatusValue = selectedItem.value || selectedItem
        if (educationProgramService.changeStatus) {
          await educationProgramService.changeStatus({
            id: item.id,
            status: newStatusValue,
            channel: 'CMS',
          })
        }
        item.status = newStatusValue
        await this.loadData()
        this.showSuccessToast('Cập nhật trạng thái thành công')
      } catch (error) {
        console.error('Lỗi khi đổi trạng thái:', error)
      }
    },

    openAdd() {
      this.isUpdate = false
      this.selectedItem = {}
      this.isOpenAction = true
    },

    openUpdate(item) {
      this.isUpdate = true
      this.selectedItem = { ...item }
      this.isOpenAction = true
    },

    async onActionSuccess(msg) {
      await this.loadData()
      this.showSuccessToast(msg || (this.isUpdate ? 'Cập nhật chương trình đào tạo thành công' : 'Thêm chương trình đào tạo thành công'))
    },

    openDelete(item) {
      this.selectedItem = item
      this.isOpenDelete = true
    },

    async handleDelete() {
      if (!this.selectedItem || !this.selectedItem.id) return
      this.isLoadingDelete = true
      try {
        if (educationProgramService.delete) {
          await educationProgramService.delete(this.selectedItem.id)
        }
        this.isOpenDelete = false
        await this.loadData()
        this.showSuccessToast('Xóa chương trình thành công')
      } catch (error) {
        console.error('Lỗi khi xóa chương trình đào tạo:', error)
      } finally {
        this.isLoadingDelete = false
      }
    },

    async handleCustomAction(item) {
      try {
        const id = item.id
        const res = educationProgramService.exportTerm
          ? await educationProgramService.exportTerm(id, 'CMS')
          : await educationProgramService.exportEducationProgram(id)

        const responseData = res && res.data !== undefined ? res.data : res

        if (responseData && (responseData.url || responseData.data)) {
          const fileUrl = responseData.url || responseData.data
          window.open(fileUrl, '_blank')
        } else {
          this.showSuccessToast('Xuất file Excel thành công')
        }
      } catch (error) {
        console.error('Lỗi khi xuất file:', error)
      }
    },
  },
}
</script>

<style scoped>
.education-program-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: #ffffff !important;
}

.text-red-bold {
  color: #A62229 !important;
}

.bg-white {
  background-color: #ffffff !important;
}

/* Cố định bộ lọc phía trên */
.sticky-filter {
  position: sticky;
  top: 0;
  z-index: 5;
  background-color: #ffffff;
  flex-shrink: 0;
}

/* Khung chứa bảng cuộn lướt ở giữa */
.table-scroll-container {
  flex-grow: 1;
  overflow-y: auto;
  overflow-x: auto;
  max-height: calc(100vh - 220px);
}

.table-scroll-container >>> th {
  position: sticky !important;
  top: 0;
  z-index: 2;
  background-color: #f5f5f5 !important;
}

/* Cố định thanh phân trang phía dưới */
.sticky-bottom-bar {
  position: sticky;
  bottom: 0;
  z-index: 5;
  background-color: #ffffff;
  flex-shrink: 0;
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

::v-deep .v-data-footer {
  display: none !important;
}
</style>