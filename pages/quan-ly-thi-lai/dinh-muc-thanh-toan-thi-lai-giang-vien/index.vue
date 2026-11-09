<template>
  <div class="result-management-page pa-3 pa-md-4 bg-white">
    <!-- TIÊU ĐỀ TRANG -->
    <div class="d-flex align-center justify-space-between mb-3">
      <div class="text-h6 font-weight-bold black--text">
        Danh sách thanh toán cho GV (<span class="text-red-bold">{{ totalRecords }}</span>)
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

        <!-- Tên ban hành -->
        <template #[`item.name`]="{ item }">
          <span class="font-weight-medium">{{ item.name || item.title || '-' }}</span>
        </template>

        <!-- Kỳ học -->
        <template #[`item.semesterName`]="{ item }">
          <span>{{ item.semesterName || item.semester?.name || '-' }}</span>
        </template>

        <!-- File ban hành (Lấy từ fileInform) -->
        <template #[`item.fileInform`]="{ item }">
          <div class="d-flex align-center justify-center">
            <v-btn
              icon
              small
              :href="item.fileInform || undefined"
              :target="item.fileInform ? '_blank' : undefined"
              :rel="item.fileInform ? 'noopener noreferrer' : undefined"
              :disabled="!item.fileInform"
              :color="item.fileInform ? '#A62229' : 'grey'"
              :title="item.fileInform ? 'Tải file' : 'Chưa có file ban hành'"
            >
              <v-icon size="24">mdi-file-download-outline</v-icon>
            </v-btn>
          </div>
        </template>

        <!-- Ngày ban hành -->
        <template #[`item.timeInform`]="{ item }">
          <span>{{ formatDate(item.timeInform || item.createdAt) }}</span>
        </template>

        <!-- Trạng thái (Dạng v-chip có menu chọn mở Popup xác nhận) -->
        <template #[`item.status`]="{ item }">
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-chip
                small
                dark
                v-bind="attrs"
                v-on="on"
                :color="item.status === 'ACTIVE' ? '#A62229' : 'grey'"
                class="px-3 font-weight-medium cursor-pointer"
              >
                {{ item.status === 'ACTIVE' ? 'Kích hoạt' : 'Chưa kích hoạt' }}
                <v-icon right small>mdi-menu-down</v-icon>
              </v-chip>
            </template>
            <v-list dense>
              <v-list-item
                v-for="st in statusList"
                :key="st.value"
                @click="onSelectStatus(item, st.value)"
              >
                <v-list-item-title>{{ st.text }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>

        <!-- Chức năng (Menu 3 chấm) -->
        <template #[`item.actions`]="{ item }">
          <div class="d-flex align-center justify-center">
            <v-menu offset-y left>
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon small v-bind="attrs" v-on="on">
                  <v-icon small>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list dense class="action-dropdown-list">
                <v-list-item @click="handleDetail(item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="info">mdi-eye</v-icon></v-list-item-icon>
                  <v-list-item-title>Chi tiết</v-list-item-title>
                </v-list-item>
                <v-list-item @click="handleExportExcel(item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="success">mdi-export</v-icon></v-list-item-icon>
                  <v-list-item-title>Xuất Excel</v-list-item-title>
                </v-list-item>
                <v-list-item @click="handleEdit(item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="warning">mdi-pencil</v-icon></v-list-item-icon>
                  <v-list-item-title>Cập nhật</v-list-item-title>
                </v-list-item>
                <v-list-item @click="handleTeacherListBySemester(item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="primary">mdi-school</v-icon></v-list-item-icon>
                  <v-list-item-title>DSGV theo kỳ</v-list-item-title>
                </v-list-item>
                <v-list-item @click="handleDelete(item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="error">mdi-delete</v-icon></v-list-item-icon>
                  <v-list-item-title>Xóa</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>
      </BaseTable>
    </div>

    <!-- THANH NÚT DƯỚI BẢNG & PHÂN TRANG -->
    <div class="d-flex align-center justify-space-between mt-4 flex-wrap gap-3 sticky-bottom-bar pt-3 border-top">
      <v-btn color="#4caf50" dark class="text-none px-4" height="38" elevation="0" @click="openImportModal">
        <v-icon left>mdi-microsoft-excel</v-icon> Nhập file excel
      </v-btn>

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

    <!-- MODAL NHẬP FILE EXCEL -->
    <v-dialog v-model="importDialogVisible" max-width="550px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="white--text py-3 px-4 d-flex justify-space-between align-center" style="background-color: #A62229;">
          <span class="text-h6 font-weight-bold">Nhập file excel</span>
          <v-btn icon dark @click="importDialogVisible = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-5 text-center">
          <div 
            class="upload-dropzone pa-5 rounded-lg mb-2" 
            @click="triggerFileInput"
            @dragover.prevent 
            @drop.prevent="handleFileDrop"
          >
            <input 
              ref="fileInput" 
              type="file" 
              accept=".xlsx, .xls" 
              class="d-none" 
              @change="handleFileChange"
            />

            <div v-if="!selectedFile" class="py-3 d-flex flex-column align-center" style="gap: 6px;">
              <div class="upload-icon-circle">
                <v-icon color="#A62229" size="24">mdi-plus</v-icon>
              </div>
              <span class="text-subtitle-2 grey--text text--darken-2">Chọn tệp đính kèm</span>
            </div>

            <div v-else class="d-flex align-center justify-space-between pa-2 bg-file-selected rounded">
              <div class="d-flex align-center">
                <v-icon color="green" class="mr-2" small>mdi-file-excel</v-icon>
                <span class="font-weight-medium text-truncate text-body-2" style="max-width: 380px;">{{ selectedFile.name }}</span>
              </div>
              <v-btn icon x-small @click.stop="resetFile">
                <v-icon size="16">mdi-close</v-icon>
              </v-btn>
            </div>
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="px-4 py-3 justify-end" style="gap: 8px;">
          <v-btn color="#A62229" dark class="text-none px-5" elevation="0" :disabled="!selectedFile" @click="uploadExcelFile">
            Import
          </v-btn>
          <v-btn text class="text-none" @click="importDialogVisible = false">
            Đóng
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MODAL XÁC NHẬN ĐỔI TRẠNG THÁI -->
    <v-dialog v-model="confirmDialog" max-width="500px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="pa-4 text-white" style="background-color: #A62229; color: white;">
          <span class="text-h6 font-weight-bold">Xác nhận</span>
          <v-spacer></v-spacer>
          <v-btn icon dark @click="confirmDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-5 text-body-1 black--text">
          Bạn có chắc chắn muốn đổi trạng thái từ 
          <span class="font-weight-bold red--text text--darken-3">{{ pendingItemOldStatusText }}</span> 
          sang 
          <span class="font-weight-bold red--text text--darken-3">{{ pendingItemNewStatusText }}</span> 
          không?
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-3">
          <v-spacer></v-spacer>
          <v-btn text color="grey darken-1" class="text-none px-4" @click="confirmDialog = false">
            Đóng <v-icon right small>mdi-close</v-icon>
          </v-btn>
          <v-btn color="#A62229" dark class="text-none px-4" elevation="0" @click="executeChangeStatus">
            Xác Nhận
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MODAL XÁC NHẬN XÓA -->
    <v-dialog v-model="deleteDialogVisible" max-width="500px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="red-dialog-header white--text py-3 px-4 d-flex justify-space-between align-center" style="background-color: #a62229;">
          <span class="text-h6 font-weight-bold">Xác nhận</span>
          <v-btn icon dark @click="deleteDialogVisible = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-4 text-body-1 black--text">
          Xác nhận xóa <span class="font-weight-bold red--text text--darken-3">{{ itemToDelete ? itemToDelete.name : '' }}</span>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="px-4 py-3 justify-end" style="gap: 8px;">
          <v-btn text class="text-none" @click="deleteDialogVisible = false">
            Đóng <v-icon right small>mdi-close</v-icon>
          </v-btn>
          <v-btn color="#A62229" dark class="text-none px-4" elevation="0" @click="confirmDelete">
            Xác Nhận
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <DecisionTeacherJobFeeAddModal v-model="addModalVisible" />
    <DecisionTeacherJobFeeDetailModal 
      v-model="detailDialogVisible" 
      :item-data="selectedItem" 
    />  
    <DecisionTeacherJobFeeUpdateModal 
      v-model="updateDialogVisible" 
      :item-data="selectedItemForEdit" 
    />
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import decisionTeacherJobFeeService from '~/services/decisionTeacherJobFeeService'
import DecisionTeacherJobFeeAddModal from '~/components/DecisionTeacherJobFeeAddModal.vue'
import DecisionTeacherJobFeeDetailModal from '~/components/DecisionTeacherJobFeeDetailModal.vue'
import DecisionTeacherJobFeeUpdateModal from '~/components/DecisionTeacherJobFeeUpdateModal.vue'

export default {
  name: 'DecisionTeacherJobFeePage',
  components: { BaseTable, DecisionTeacherJobFeeAddModal, DecisionTeacherJobFeeDetailModal, DecisionTeacherJobFeeUpdateModal },
  data() {
    return {
      deleteDialogVisible: false,
      itemToDelete: null,

      updateDialogVisible: false, 
      selectedItemForEdit: {},

      detailDialogVisible: false, 
      selectedItemId: null,
      addModalVisible: false,
      loading: false,

      // State cho Modal Nhập file excel
      importDialogVisible: false,
      selectedFile: null,

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
        { value: 'name', text: 'Tên ban hành', align: 'left', minWidth: '220px', sortable: false },
        { value: 'semesterName', text: 'Kỳ học', align: 'left', width: '180px', sortable: false },
        { value: 'fileInform', text: 'File ban hành', align: 'center', width: '140px', sortable: false },
        { value: 'timeInform', text: 'Ngày ban hành', align: 'center', width: '150px', sortable: false },
        { value: 'status', text: 'Trạng thái', align: 'center', width: '160px', sortable: false },
        { value: 'actions', text: 'Chức năng', align: 'center', width: '110px', sortable: false },
      ],

      confirmDialog: false,
      pendingItem: null,
      pendingNewStatus: null,
    }
  },
  computed: {
    pendingItemOldStatusText() {
      if (!this.pendingItem) return ''
      return this.pendingItem.status === 'ACTIVE' ? 'Kích hoạt' : 'Chưa kích hoạt'
    },
    pendingItemNewStatusText() {
      return this.pendingNewStatus === 'ACTIVE' ? 'Kích hoạt' : 'Chưa kích hoạt'
    }
  },
  async mounted() {
    await this.initSemesters()
    await this.loadData()
  },
  methods: {
    async initSemesters() {
      try {
        const res = await decisionTeacherJobFeeService.getSemesterList({ status: 'ACTIVE', channel: 'CMS' })
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
          channel: 'CMS',
        }
        if (this.activeFilters.name) params.name = this.activeFilters.name
        if (this.activeFilters.semesterId) params.semesterId = this.activeFilters.semesterId
        if (this.activeFilters.status) params.status = this.activeFilters.status

        const res = await decisionTeacherJobFeeService.getList(params)
        if (res) {
          const rawData = res.data !== undefined ? res.data : res
          this.itemList = Array.isArray(rawData) ? rawData : (rawData.data || rawData.content || rawData.items || [])
          
          const total = rawData.totalElements ?? rawData.totalRecords ?? rawData.total ?? (res.totalElements || res.total)
          this.totalRecords = total !== undefined ? Number(total) : this.itemList.length
          this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage) || 1
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu:', error)
        this.itemList = []
        this.totalRecords = 0
      } finally {
        this.loading = false
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return '-'
      const dateOnly = String(dateStr).split(/[ T]/)[0]
      if (dateOnly.includes('-')) {
        const parts = dateOnly.split('-')
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
      }
      return dateOnly
    },

    onSelectStatus(item, newStatus) {
      if (item.status === newStatus) return
      this.pendingItem = item
      this.pendingNewStatus = newStatus
      this.confirmDialog = true
    },

    async executeChangeStatus() {
      if (!this.pendingItem) return
      const item = this.pendingItem
      const newStatus = this.pendingNewStatus
      this.confirmDialog = false

      try {
        await decisionTeacherJobFeeService.changeStatus(item.id, { status: newStatus }, 'CMS')
        item.status = newStatus
        if (typeof this.$showSuccess === 'function') {
          this.$showSuccess('Cập nhật trạng thái thành công')
        }
      } catch (error) {
        console.error('Lỗi cập nhật trạng thái:', error)
        if (typeof this.$showError === 'function') {
          this.$showError('Không thể cập nhật trạng thái')
        }
        this.loadData()
      } finally {
        this.pendingItem = null
        this.pendingNewStatus = null
      }
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
      this.addModalVisible = true;
    },

    // Mở Modal Nhập file excel và gọi API template ngầm hệt như video mẫu 1
    async openImportModal() {
      this.selectedFile = null
      this.importDialogVisible = true
      try {
        // Gọi API template ngầm để khớp đúng luồng chuẩn như video mẫu
        await decisionTeacherJobFeeService.getTemplate({ channel: 'CMS' })
      } catch (error) {
        console.error('Lỗi khi tải template chuẩn:', error)
      }
    },

    triggerFileInput() {
      this.$refs.fileInput.click()
    },

    handleFileChange(e) {
      const file = e.target.files[0]
      if (file) {
        this.selectedFile = file
      }
    },

    handleFileDrop(e) {
      const file = e.dataTransfer.files[0]
      if (file) {
        this.selectedFile = file
      }
    },

    resetFile() {
      this.selectedFile = null
    },

    async uploadExcelFile() {
      if (!this.selectedFile) return
      try {
        const formData = new FormData()
        formData.append('file', this.selectedFile)

        // Gọi API confirmImport hệt như video mẫu
        const res = await decisionTeacherJobFeeService.confirmImport(formData, 'CMS')
        const data = res.data !== undefined ? res.data : res

        if (data && data.code !== undefined && data.code !== 0) {
          if (typeof this.$showError === 'function') {
            this.$showError(data.message || 'Lỗi hệ thống khi import file')
          }
          return
        }

        this.importDialogVisible = false
      } catch (error) {
        console.error('Lỗi khi import file excel:', error)
        if (typeof this.$showError === 'function') {
          this.$showError('Nhập file thất bại, vui lòng kiểm tra lại định dạng file.')
        }
      }
    },

    handleDetail(item) {
      this.selectedItem = item;
      this.detailDialogVisible = true;
    },
    async handleExportExcel(item) {
      try {
        const id = item.id;
        const res = await decisionTeacherJobFeeService.exportExcel(id, 'CMS');
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(res.data);
        link.download = `dinh-muc-thanh-toan-${id}.xlsx`;
        link.click();
      } catch (error) {
        console.error("Lỗi xuất Excel:", error);
        if (typeof this.$showError === 'function') {
            this.$showError("Xuất file thất bại");
        }
      }
    },
    handleEdit(item) {
      this.selectedItemForEdit = item;
      this.updateDialogVisible = true;
    },
    handleTeacherListBySemester(item) {
        if (!item || !item.id) return;
        this.$router.push(`/quan-ly-thi-lai/dinh-muc-thanh-toan-thi-lai-giang-vien/${item.id}`);
    },
    
    handleDelete(item) {
      this.itemToDelete = item
      this.deleteDialogVisible = true
    },

    async confirmDelete() {
      if (!this.itemToDelete) return
      try {
        const deleteId = this.itemToDelete.id
        await decisionTeacherJobFeeService.deleteItem(deleteId, 'CMS')
        this.deleteDialogVisible = false
        this.itemToDelete = null
        await this.loadData()
      } catch (error) {
        console.error('Lỗi khi xóa bản ghi:', error)
      }
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
.upload-dropzone {
  border: 2px dashed #A62229;
  background-color: #fafafa;
  cursor: pointer;
  transition: background-color 0.2s;
}
.upload-dropzone:hover {
  background-color: #f5f5f5;
}
.bg-file-selected {
  background-color: #f1f8e9;
  border: 1px solid #c8e6c9;
}
.upload-icon-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: #ffebee;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>