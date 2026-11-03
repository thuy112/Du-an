<template>
  <div class="d-flex flex-column h-100" style="min-height: 0; overflow: hidden;">
    <div class="text-h6 font-weight-bold black--text mb-3 flex-shrink-0">
      Danh sách địa điểm đào tạo (<span class="text-red-bold">{{ totalRecords }}</span>)
    </div>

    <!-- Bộ lọc -->
    <div class="filter-container mb-3 sticky-filter flex-shrink-0">
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
          v-model="filters.trainingMethodId"
          :items="trainingMethodOptions"
          item-text="name"
          item-value="id"
          placeholder="Hình thức đào tạo"
          outlined
          dense
          hide-details
          clearable
          class="filter-input flex-grow-1"
          style="min-width: 180px;"
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
          style="min-width: 160px;"
        ></v-select>

        <div class="d-flex align-center" style="gap: 5px;">
          <v-btn icon color="#A62229" class="btn-square-action" @click="refreshData" title="Làm mới">
            <v-icon size="22">mdi-refresh</v-icon>
          </v-btn>
          <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="handleSearch" title="Tìm kiếm">
            <v-icon size="22">mdi-magnify</v-icon>
          </v-btn>
          <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="handleAddTrainingUnit" title="Thêm mới">
            <v-icon size="22">mdi-plus</v-icon>
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Vùng Bảng dữ liệu -->
    <div class="table-scroll-container flex-grow-1" style="overflow: auto; min-height: 0;">
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
        <template #[`item.address`]="{ item }">
          <span>{{ (item.address || '').trim() || '-' }}</span>
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
          <v-btn icon small color="amber darken-3" @click="handleEditTrainingUnit(item)" title="Sửa"><v-icon size="20">mdi-pencil</v-icon></v-btn>
          <v-btn icon small color="error" @click="handleDeleteTrainingUnit(item)" title="Xóa"><v-icon size="20">mdi-delete</v-icon></v-btn>
        </template>
      </BaseTable>
    </div>

    <!-- Phân trang -->
    <div class="pagination-bottom-container mt-2 pt-2 d-flex align-center justify-end flex-wrap gap-3 sticky-bottom-bar border-top flex-shrink-0" style="padding: 8px 16px;">
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

    <!-- DIALOG THÊM MỚI / CẬP NHẬT ĐỊA ĐIỂM ĐÀO TẠO -->
    <v-dialog v-model="dialog" max-width="600px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <div class="px-4 py-3 d-flex align-center justify-space-between" style="background-color: #A2212B;">
          <div class="text-h6 font-weight-bold white--text">{{ isEdit ? 'Cập nhật địa điểm đào tạo' : 'Thêm mới địa điểm đào tạo' }}</div>
          <v-btn icon dark small @click="closeDialog"><v-icon>mdi-close</v-icon></v-btn>
        </div>

        <v-card-text class="pa-4">
          <v-form ref="form" v-model="formValid">
            <div class="mb-3">
              <label class="d-block mb-1 font-weight-medium">Tên địa điểm <span class="red--text">(*)</span></label>
              <v-text-field
                v-model="formData.name"
                placeholder="Nhập tên địa điểm"
                outlined
                dense
                hide-details="auto"
                :rules="[v => !!(v && v.trim()) || 'Tên địa điểm không được để trống']"
              ></v-text-field>
            </div>

            <div class="mb-3">
              <label class="d-block mb-1 font-weight-medium">Mã địa điểm <span class="red--text">(*)</span></label>
              <v-text-field
                v-model="formData.code"
                placeholder="Nhập mã địa điểm"
                outlined
                dense
                hide-details="auto"
                :rules="[v => !!(v && v.trim()) || 'Mã địa điểm không được để trống']"
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
              <label class="d-block mb-1 font-weight-medium">Địa chỉ</label>
              <v-textarea
                v-model="formData.address"
                placeholder="Nhập địa chỉ"
                outlined
                dense
                rows="4"
                hide-details="auto"
              ></v-textarea>
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
          Xác nhận xóa trạm <span class="font-weight-bold red--text">{{ selectedItemToDelete ? selectedItemToDelete.name : '' }}</span>
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
import unitService from '~/services/unitAndTrainingService'

export default {
  name: 'TrainingUnitTab',
  components: { BaseTable, ChangeableStatus },
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
      trainingMethodOptions: [],
      filters: { search: '', trainingMethodId: '', status: '' },
      activeFilters: { search: '', trainingMethodId: '', status: '' },
      
      // Quản lý Dialog Thêm / Sửa
      dialog: false,
      isEdit: false,
      formValid: false,
      saving: false,
      currentId: null,
      formData: {
        name: '',
        code: '',
        status: 'ACTIVE',
        address: ''
      },

      // Quản lý Dialog Xóa
      deleteDialog: false,
      deleting: false,
      selectedItemToDelete: null,

      headers: [
        { text: 'STT', value: 'stt', align: 'center', width: '60px', sortable: false },
        { text: 'Mã địa điểm', value: 'code', align: 'left', minWidth: '150px', sortable: false },
        { text: 'Tên địa điểm', value: 'name', align: 'left', minWidth: '220px', sortable: false },
        { text: 'Địa chỉ', value: 'address', align: 'left', minWidth: '200px', sortable: false },
        { text: 'Trạng thái', value: 'status', align: 'center', minWidth: '140px', sortable: false },
        { text: 'Chức năng', value: 'actions', align: 'center', width: '100px', sortable: false },
      ]
    }
  },
  computed: {
    displayedPages() {
      const total = this.totalPages
      const current = this.currentPage
      const pages = []

      if (total <= 7) {
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
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
    await this.loadTrainingMethodOptions()
    await this.loadData()
  },
  methods: {
    async loadTrainingMethodOptions() {
      try {
        const res = await unitService.getTrainingMethodList({ status: 'ACTIVE', channel: 'CMS' })
        if (res) {
          const data = res.data !== undefined ? res.data : res
          this.trainingMethodOptions = Array.isArray(data) ? data : (data.data || data.content || [])
        }
      } catch (err) {
        console.error('Lỗi tải danh sách hình thức đào tạo:', err)
      }
    },
    async loadData() {
      this.loading = true
      try {
        const params = {
          pageIndex: this.currentPage,
          pageSize: this.itemsPerPage,
          channel: 'CMS',
          ...(this.activeFilters.search && { search: this.activeFilters.search }),
          ...(this.activeFilters.status && { status: this.activeFilters.status }),
          ...(this.activeFilters.trainingMethodId && { trainingMethodId: this.activeFilters.trainingMethodId })
        }
        const res = await unitService.getTrainingUnitList(params)
        if (res) {
          const rootData = res.data !== undefined ? res.data : res
          const items = Array.isArray(rootData) ? rootData : (rootData.data || rootData.content || rootData.items || [])
          this.itemList = items
          this.totalRecords = Number(rootData.totalElements ?? rootData.totalRecords ?? items.length)
          this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage) || 1
        }
      } catch (err) {
        console.error('Lỗi tải địa điểm đào tạo:', err)
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
      this.filters = { search: '', trainingMethodId: '', status: '' }
      this.activeFilters = { search: '', trainingMethodId: '', status: '' }
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
        await unitService.changeTrainingUnitStatus(item.id, val, 'CMS')
        item.status = val
        await this.loadData()
        this.$emit('success', 'Cập nhật trạng thái thành công')
      } catch (err) {
        console.error('Lỗi đổi trạng thái:', err)
      }
    },

    // Mở popup Thêm mới
    handleAddTrainingUnit() {
      this.isEdit = false
      this.currentId = null
      this.formData = { name: '', code: '', status: 'ACTIVE', address: '' }
      if (this.$refs.form) this.$refs.form.resetValidation()
      this.dialog = true
    },

    // Mở popup Sửa
    handleEditTrainingUnit(item) {
      this.isEdit = true
      this.currentId = item.id
      this.formData = {
        name: item.name || '',
        code: item.code || '',
        status: item.status || 'ACTIVE',
        address: (item.address || '').trim()
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
          address: this.formData.address ? this.formData.address.trim() : ''
        }

        if (this.isEdit) {
          await unitService.updateTrainingUnit(this.currentId, payload, 'CMS')
          this.$emit('success', 'Cập nhật địa điểm đào tạo thành công')
        } else {
          await unitService.createTrainingUnit(payload, 'CMS')
          this.$emit('success', 'Thêm mới địa điểm đào tạo thành công')
        }

        this.dialog = false
        await this.loadData()
      } catch (err) {
        console.error('Lỗi lưu địa điểm đào tạo:', err)
      } finally {
        this.saving = false
      }
    },

    // Mở popup Xóa
    handleDeleteTrainingUnit(item) {
      this.selectedItemToDelete = item
      this.deleteDialog = true
    },

    // Xác nhận Xóa
    async confirmDelete() {
      if (!this.selectedItemToDelete) return
      this.deleting = true
      try {
        await unitService.deleteTrainingUnit(this.selectedItemToDelete.id, 'CMS')
        this.deleteDialog = false
        await this.loadData()
        this.$emit('success', 'Xóa địa điểm đào tạo thành công')
      } catch (err) {
        console.error('Lỗi xóa địa điểm đào tạo:', err)
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
.filter-input >>> .v-input__slot { border-radius: 6px !important; min-height: 38px !important; }
.btn-square-action { border-radius: 6px !important; height: 38px !important; min-width: 38px !important; }
.sticky-filter, .sticky-bottom-bar { background-color: #ffffff; }
.table-scroll-container >>> th { position: sticky !important; top: 0; z-index: 2; background-color: #f5f5f5 !important; }
::v-deep .v-data-footer { display: none !important; }
</style>