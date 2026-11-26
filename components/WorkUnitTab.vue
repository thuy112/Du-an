<template>
  <div class="work-unit-tab d-flex flex-column bg-white">
    <div class="text-h6 font-weight-bold black--text mb-2 flex-shrink-0">
      Danh sách đơn vị công tác (<span class="text-red-bold">{{ totalRecords }}</span>)
    </div>

    <!-- Bộ lọc cố định phía trên -->
    <div class="filter-container mb-2 sticky-filter flex-shrink-0">
      <div class="d-flex align-center flex-wrap" style="gap: 8px; padding: 6px;">
        <v-text-field
          v-model="filters.search"
          placeholder="Tìm kiếm"
          outlined
          dense
          hide-details
          clearable
          class="filter-input flex-grow-1"
          style="min-width: 200px;"
          @keyup.enter="handleSearch"
        ></v-text-field>

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
          style="min-width: 160px;"
        ></v-select>

        <div class="d-flex align-center" style="gap: 5px;">
          <v-btn icon color="#A62229" class="btn-square-action" @click="refreshData" title="Làm mới">
            <v-icon size="24">mdi-refresh</v-icon>
          </v-btn>
          <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="handleSearch" title="Tìm kiếm">
            <v-icon size="24">mdi-magnify</v-icon>
          </v-btn>
          <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="handleAddWorkUnit" title="Thêm mới">
            <v-icon size="24">mdi-plus</v-icon>
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Vùng Bảng dữ liệu cuộn độc lập ở giữa -->
    <div class="table-scroll-container">
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
          <span class="mobile-break-text">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</span>
        </template>
        <template #[`item.code`]="{ item }">
          <span class="font-weight-medium mobile-break-text">{{ item.code || '-' }}</span>
        </template>
        <template #[`item.name`]="{ item }">
          <span class="mobile-break-text">{{ item.name || '-' }}</span>
        </template>
        <template #[`item.facultySchool`]="{ item }">
          <span class="mobile-break-text">{{ (item.address || item.facultySchool || '').trim() || '-' }}</span>
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
        <template #[`item.actions`]="{ item }">
          <v-btn icon small color="amber darken-3" @click="handleEditWorkUnit(item)" title="Sửa"><v-icon size="24">mdi-pencil</v-icon></v-btn>
          <v-btn icon small color="error" @click="handleDeleteWorkUnit(item)" title="Xóa"><v-icon size="24">mdi-trash-can</v-icon></v-btn>
        </template>
      </BaseTable>
    </div>

    <!-- Phân trang cố định phía dưới -->
    <div class="pagination-bottom-container mt-2 pt-2 d-flex align-center justify-end flex-wrap gap-2 sticky-bottom-bar border-top flex-shrink-0">
      <Pagination
        :page="currentPage"
        :page-count="totalPages"
        :page-size="itemsPerPage"
        :total-record="totalRecords"
        @changePage="changePage"
        @changePageSize="handlePerPageChange"
      />
    </div>

    <!-- DIALOG THÊM MỚI / CẬP NHẬT ĐƠN VỊ CÔNG TÁC -->
    <v-dialog v-model="dialog" max-width="550px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <div class="px-4 py-3 d-flex align-center justify-space-between" style="background-color: #A2212B;">
          <div class="text-h6 font-weight-bold white--text">{{ isEdit ? 'Cập nhật đơn vị công tác' : 'Thêm mới đơn vị công tác' }}</div>
          <v-btn icon dark small @click="closeDialog"><v-icon>mdi-close</v-icon></v-btn>
        </div>

        <v-card-text class="pa-4">
          <v-form ref="form" v-model="formValid">
            <div class="mb-3">
              <label class="d-block mb-1 font-weight-medium">Tên đơn vị <span class="red--text">(*)</span></label>
              <v-text-field
                v-model="formData.name"
                placeholder="Nhập tên đơn vị"
                outlined
                dense
                hide-details="auto"
                :rules="[v => !!(v && v.trim()) || 'Tên đơn vị không được để trống']"
              ></v-text-field>
            </div>

            <div class="mb-3">
              <label class="d-block mb-1 font-weight-medium">Mã đơn vị <span class="red--text">(*)</span></label>
              <v-text-field
                v-model="formData.code"
                placeholder="Nhập mã đơn vị"
                outlined
                dense
                hide-details="auto"
                :rules="[v => !!(v && v.trim()) || 'Mã đơn vị không được để trống']"
              ></v-text-field>
            </div>

            <div class="mb-3">
              <label class="d-block mb-1 font-weight-medium">Trạng thái <span class="red--text">(*)</span></label>
              <v-select
                v-model="formData.status"
                :items="statusList"
                item-text="text"
                item-value="value"
                outlined
                dense
                hide-details="auto"
              ></v-select>
            </div>

            <div class="mb-3">
              <label class="d-block mb-1 font-weight-medium">Khoa/ Trường</label>
              <v-text-field
                v-model="formData.facultySchool"
                placeholder="Nhập khoa/ trường"
                outlined
                dense
                hide-details="auto"
              ></v-text-field>
            </div>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-4 pb-4 pt-0 justify-end" style="gap: 8px;">
          <v-btn depressed height="36" class="px-4 text-none" @click="closeDialog">
            Đóng <v-icon right small>mdi-close</v-icon>
          </v-btn>
          <v-btn color="#A2212B" dark depressed height="36" class="px-4 text-none" :loading="saving" @click="saveData">
            Lưu <v-icon right small>mdi-content-save</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIALOG XÁC NHẬN XÓA -->
    <v-dialog v-model="deleteDialog" max-width="500px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <div class="px-4 py-3 d-flex align-center justify-space-between" style="background-color: #A2212B;">
          <div class="text-h6 font-weight-bold white--text">Xác nhận</div>
          <v-btn icon dark small @click="deleteDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>

        <v-card-text class="pa-4 text-body-1 black--text">
          Xác nhận xóa đơn vị <span class="font-weight-bold red--text">{{ selectedItemToDelete ? selectedItemToDelete.name : '' }}</span>
        </v-card-text>

        <v-card-actions class="px-4 pb-4 pt-0 justify-end" style="gap: 8px;">
          <v-btn depressed height="36" class="px-4 text-none" @click="deleteDialog = false">
            Đóng <v-icon right small class="red--text">mdi-close</v-icon>
          </v-btn>
          <v-btn color="#A2212B" dark depressed height="36" class="px-4 text-none" :loading="deleting" @click="confirmDelete">
            Xác Nhận
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import ChangeableStatus from '~/components/Base/ChangeableStatus.vue'
import Pagination from '~/components/Base/Pagination.vue'
import unitService from '~/services/unitAndTrainingService'

export default {
  name: 'WorkUnitTab',
  components: { BaseTable, ChangeableStatus, Pagination },
  props: {
    statusList: { type: Array, default: () => [] }
  },
  data() {
    return {
      loading: false,
      itemList: [],
      totalRecords: 0,
      totalPages: 1,
      currentPage: 1,
      pageInput: 1,
      itemsPerPage: 50,
      filters: { search: '', status: '' },
      activeFilters: { search: '', status: '' },

      // Quản lý Modal Thêm / Sửa
      dialog: false,
      isEdit: false,
      formValid: false,
      saving: false,
      currentId: null,
      formData: {
        name: '',
        code: '',
        status: 'ACTIVE',
        facultySchool: ''
      },

      // Quản lý Modal Xóa
      deleteDialog: false,
      deleting: false,
      selectedItemToDelete: null,

      headers: [
        { text: 'STT', value: 'stt', align: 'center', width: '60px', sortable: false },
        { text: 'Mã đơn vị', value: 'code', align: 'left', minWidth: '150px', sortable: false },
        { text: 'Tên đơn vị', value: 'name', align: 'left', minWidth: '220px', sortable: false },
        { text: 'Khoa/ Trường', value: 'facultySchool', align: 'left', minWidth: '180px', sortable: false },
        { text: 'Trạng thái', value: 'status', align: 'center', minWidth: '140px', sortable: false },
        { text: 'Chức năng', value: 'actions', align: 'center', width: '100px', sortable: false },
      ]
    }
  },
  async mounted() {
    await this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const params = {
          pageIndex: this.currentPage,
          pageSize: this.itemsPerPage,
          channel: 'CMS',
          ...(this.activeFilters.search && { search: this.activeFilters.search }),
          ...(this.activeFilters.status && { status: this.activeFilters.status })
        }
        const res = await unitService.getWorkUnitList(params)
        if (res) {
          const rootData = res.data !== undefined ? res.data : res
          const items = Array.isArray(rootData) ? rootData : (rootData.data || rootData.content || rootData.items || [])
          this.itemList = items
          this.totalRecords = Number(rootData.totalElements ?? rootData.totalRecords ?? items.length)
          this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage) || 1
        }
      } catch (err) {
        console.error('Lỗi tải đơn vị công tác:', err)
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      this.activeFilters = { ...this.filters }
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
    changePage(page) {
      if (page < 1 || page > this.totalPages) return
      this.currentPage = page
      this.pageInput = page
      this.loadData()
    },
    handlePerPageChange(size) {
      this.itemsPerPage = size
      this.currentPage = 1
      this.pageInput = 1
      this.loadData()
    },
    async handleStatusChange(item, selectedItem) {
      try {
        const val = selectedItem.value || selectedItem
        await unitService.changeWorkUnitStatus(item.id, val, 'CMS')
        item.status = val
        await this.loadData()
        this.$emit('success', 'Cập nhật trạng thái thành công')
      } catch (err) {
        console.error('Lỗi đổi trạng thái:', err)
      }
    },

    // Mở popup Thêm mới
    handleAddWorkUnit() {
      this.isEdit = false
      this.currentId = null
      this.formData = { name: '', code: '', status: 'ACTIVE', facultySchool: '' }
      if (this.$refs.form) this.$refs.form.resetValidation()
      this.dialog = true
    },

    // Mở popup Sửa
    handleEditWorkUnit(item) {
      this.isEdit = true
      this.currentId = item.id
      this.formData = {
        name: item.name || '',
        code: item.code || '',
        status: item.status || 'ACTIVE',
        facultySchool: (item.address || item.facultySchool || '').trim()
      }
      if (this.$refs.form) this.$refs.form.resetValidation()
      this.dialog = true
    },

    closeDialog() {
      this.dialog = false
    },

    // Lưu dữ liệu (Thêm mới hoặc Cập nhật)
    async saveData() {
      if (!this.$refs.form.validate()) return
      this.saving = true
      try {
        const payload = {
          name: this.formData.name.trim(),
          code: this.formData.code.trim(),
          status: this.formData.status,
          address: this.formData.facultySchool ? this.formData.facultySchool.trim() : ''
        }

        if (this.isEdit) {
          await unitService.updateWorkUnit(this.currentId, payload, 'CMS')
          this.$emit('success', 'Cập nhật đơn vị công tác thành công')
        } else {
          await unitService.createWorkUnit(payload, 'CMS')
          this.$emit('success', 'Thêm mới đơn vị công tác thành công')
        }

        this.dialog = false
        await this.loadData()
      } catch (err) {
        console.error('Lỗi lưu đơn vị công tác:', err)
      } finally {
        this.saving = false
      }
    },

    // Mở popup Xóa
    handleDeleteWorkUnit(item) {
      this.selectedItemToDelete = item
      this.deleteDialog = true
    },

    // Xác nhận Xóa
    async confirmDelete() {
      if (!this.selectedItemToDelete) return
      this.deleting = true
      try {
        await unitService.deleteWorkUnit(this.selectedItemToDelete.id, 'CMS')
        this.deleteDialog = false
        await this.loadData()
        this.$emit('success', 'Xóa đơn vị công tác thành công')
      } catch (err) {
        console.error('Lỗi xóa đơn vị công tác:', err)
      } finally {
        this.deleting = false
        this.selectedItemToDelete = null
      }
    }
  }
}
</script>

<style scoped>
.text-red-bold { color: #A62229 !important; }
.bg-white { background-color: #ffffff !important; }
.filter-input >>> .v-input__slot { border-radius: 6px !important; min-height: 38px !important; }
.btn-square-action { border-radius: 6px !important; height: 38px !important; min-width: 38px !important; }
.border-top { border-top: 1px solid #e0e0e0; }
.sticky-filter, .sticky-bottom-bar { background-color: #ffffff; flex-shrink: 0; }

.table-scroll-container {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: auto;
}

.table-scroll-container >>> th {
  position: sticky !important;
  top: 0;
  z-index: 2;
  background-color: #f5f5f5 !important;
}

.pagination-bottom-container {
  padding: 6px 12px 10px !important;
  position: relative;
  z-index: 4;
}

::v-deep .v-data-footer { display: none !important; }

@media (min-width: 600px) {
  .work-unit-tab {
    height: calc(100dvh - 175px);
    min-height: 0;
    overflow: visible;
    display: flex;
    flex-direction: column;
  }
}

@media (max-width: 599px) {
  .work-unit-tab {
    height: calc(100dvh - 84px);
    min-height: 0;
    max-width: 100vw;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .filter-container {
    margin-bottom: 4px !important;
  }

  .table-scroll-container {
    overflow-x: hidden;
  }

  .pagination-bottom-container {
    margin-top: 4px !important;
    padding: 4px 8px 6px !important;
  }

  .mobile-break-text,
  .table-scroll-container >>> .v-data-table__mobile-row__cell {
    max-width: 62%;
    overflow-wrap: anywhere;
    word-break: break-word;
  }
}
</style>