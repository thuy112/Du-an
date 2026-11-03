<template>
  <div class="major-container">
    <!-- KHU VỰC 1: CỐ ĐỊNH PHÍA TRÊN (Tiêu đề + Bộ lọc) -->
    <div class="fixed-top-section">
      <div class="text-h6 font-weight-bold black--text mb-3">
        Danh sách ngành (<span class="text-red-bold">{{ totalRecords }}</span>)
      </div>

      <div class="filter-container mb-2">
        <div class="d-flex align-center flex-wrap" style="gap: 8px; padding: 6px 0;">
          <v-text-field
            v-model="filters.search"
            placeholder="Tìm kiếm"
            outlined
            dense
            hide-details
            clearable
            class="filter-input flex-grow-1"
            style="min-width: 220px;"
            @keyup.enter="handleSearch"
          ></v-text-field>

          <v-select
            v-model="filters.educationProgramId"
            :items="educationProgramOptions"
            item-text="name"
            item-value="id"
            placeholder="Chương trình đào tạo"
            outlined
            dense
            hide-details
            clearable
            class="filter-input flex-grow-1"
            style="min-width: 240px;"
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
          </div>
        </div>
      </div>
    </div>

    <!-- KHU VỰC 2: BẢNG DỮ LIỆU Ở GIỮA (Tự động cuộn dọc, ghim cố định header cột) -->
    <div class="scrollable-table-section">
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
        <template #[`item.educationProgramName`]="{ item }">
          <span>{{ (item.educationProgram && item.educationProgram.name) ? item.educationProgram.name : '-' }}</span>
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
          <v-btn icon small color="blue" @click="handleConfig(item)" title="Cấu hình tín chỉ học phần">
            <v-icon size="24">mdi-cogs</v-icon>
          </v-btn>
        </template>
      </BaseTable>
    </div>

    <!-- KHU VỰC 3: CỐ ĐỊNH PHÍA DƯỚI (Nút Xuất File Excel bên trái + Phân trang bên phải) -->
    <div class="fixed-bottom-section d-flex align-center justify-space-between flex-wrap gap-3 border-top">
      <div>
        <v-btn color="#4caf50" dark depressed class="text-none px-4" height="36" @click="exportExcel">
          <v-icon left small>mdi-export</v-icon> XUẤT FILE EXCEL
        </v-btn>
      </div>

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

    <!-- DIALOG CẬP NHẬT TÍN CHỈ HỌC PHẦN (CÓ PHÂN TRANG) -->
    <v-dialog v-model="termDialog" max-width="950px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <div class="px-4 py-3 d-flex align-center justify-space-between" style="background-color: #A2212B;">
          <div class="text-h6 font-weight-bold white--text">Cập nhật tín chỉ học phần</div>
          <v-btn icon dark small @click="termDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>

        <v-card-text class="pa-4">
          <!-- Ô tìm kiếm -->
          <div class="mb-4">
            <v-text-field
              v-model="termSearch"
              placeholder="Tên/Mã học phần"
              outlined
              dense
              hide-details
              clearable
              prepend-inner-icon="mdi-magnify"
              class="filter-input"
              @keyup.enter="loadTermData"
            ></v-text-field>
          </div>

          <!-- Bảng danh sách học phần hiển thị đầy đủ số lượng bản ghi mỗi trang -->
          <v-data-table
            :headers="termHeaders"
            :items="filteredTerms"
            :loading="termLoading"
            hide-default-footer
            class="elevation-0 border"
            style="max-height: 50vh; overflow-y: auto;"
            :items-per-page="termPerPage"
          >
            <template #[`item.stt`]="{ index }">
              <span>{{ (termPage - 1) * termPerPage + index + 1 }}</span>
            </template>
            <template #[`item.termName`]="{ item }">
              <span>{{ item.termName }}</span>
            </template>
            <template #[`item.termCode`]="{ item }">
              <span>{{ item.termCode }}</span>
            </template>
            <template #[`item.credit`]="{ item }">
              <v-text-field
                v-model.number="item.credit"
                type="number"
                outlined
                dense
                hide-details
                style="width: 90px; margin: 4px auto;"
              ></v-text-field>
            </template>
          </v-data-table>

          <!-- Thanh phân trang bên trong popup chuẩn 50 bản ghi/trang -->
          <div class="d-flex align-center justify-space-between mt-3 pt-2 border-top">
            <div class="d-flex align-center" style="gap: 8px;">
              <span style="font-size: 13px; color: #666;">Bản ghi</span>
              <v-select
                v-model="termPerPage"
                :items="[10, 20, 50, 100]"
                outlined
                dense
                hide-details
                style="width: 80px;"
                @change="handleTermPerPageChange"
              ></v-select>
            </div>

            <div class="d-flex align-center" style="gap: 4px;">
              <v-btn icon outlined small color="grey" :disabled="termPage <= 1" @click="handleTermPageChange(termPage - 1)">
                <v-icon small>mdi-chevron-left</v-icon>
              </v-btn>

              <template v-for="p in termTotalPages">
                <v-btn
                  v-if="p === 1 || p === termTotalPages || (p >= termPage - 1 && p <= termPage + 1)"
                  :key="p"
                  :color="termPage === p ? '#A2212B' : 'white'"
                  :dark="termPage === p"
                  depressed
                  small
                  class="px-2"
                  style="min-width: 32px; height: 32px;"
                  :style="termPage !== p ? 'border: 1px solid #e0e0e0; color: #333;' : ''"
                  @click="handleTermPageChange(p)"
                >
                  {{ p }}
                </v-btn>
                <span v-else-if="p === termPage - 2 || p === termPage + 2" :key="'dot-' + p" class="px-1 text-grey">...</span>
              </template>

              <v-btn icon outlined small color="grey" :disabled="termPage >= termTotalPages" @click="handleTermPageChange(termPage + 1)">
                <v-icon small>mdi-chevron-right</v-icon>
              </v-btn>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="px-4 pb-4 pt-0 justify-end" style="gap: 8px;">
          <v-btn depressed height="36" class="px-4 text-none" @click="termDialog = false">
            Đóng <v-icon right small>mdi-close</v-icon>
          </v-btn>
          <v-btn color="#A2212B" dark depressed height="36" class="px-4 text-none" :loading="savingTerms" @click="saveTermCredits">
            Lưu <v-icon right small>mdi-content-save</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- THÔNG BÁO DÙNG V-SNACKBAR KHÔNG CẦN CSS RIÊNG -->
    <v-snackbar v-model="alert.show" top right color="#4caf50" timeout="3000" class="success-snackbar">
      <div class="toast-content">
        <div class="d-flex align-center justify-space-between" style="width: 100%;">
          <div class="d-flex align-center" style="gap: 8px;">
            <v-icon color="white" size="20">mdi-check</v-icon>
            <span class="white--text font-weight-medium">{{ alert.text }}</span>
          </div>
          <v-btn icon dark small @click="alert.show = false">
            <v-icon size="18">mdi-close</v-icon>
          </v-btn>
        </div>
        <div class="toast-time-track">
          <div :key="alert.progressKey" class="toast-time-progress"></div>
        </div>
      </div>
    </v-snackbar>
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import ChangeableStatus from '~/components/Base/ChangeableStatus.vue'
import unitService from '~/services/unitAndTrainingService'

export default {
  name: 'MajorManagementPage',
  components: { BaseTable, ChangeableStatus },
  data() {
    return {
      loading: false,
      itemList: [],
      totalRecords: 0,
      totalPages: 1,
      currentPage: 1,
      pageInput: 1,
      itemsPerPage: 50,
      
      educationProgramOptions: [],
      statusList: [
        { value: 'ACTIVE', text: 'Kích hoạt', color: '#a2212b' },
        { value: 'INACTIVE', text: 'Chưa kích hoạt', color: '#9e9e9e' }
      ],

      filters: { search: '', educationProgramId: '', status: '' },
      activeFilters: { search: '', educationProgramId: '', status: '' },
      alert: { show: false, text: '', progressKey: 0 },

      // Quản lý popup Cập nhật tín chỉ học phần
      // Quản lý popup Cập nhật tín chỉ học phần
      termDialog: false,
      termLoading: false,
      savingTerms: false,
      currentMajorId: null,
      termSearch: '',
      termList: [],
      filteredTerms: [],
      
      // Thêm các biến phân trang cho popup
      termPage: 1,
      termPerPage: 50,
      termTotalRecords: 0,
      termTotalPages: 1,

      termHeaders: [
        { text: 'STT', value: 'stt', align: 'center', width: '60px', sortable: false },
        { text: 'Học phần', value: 'termName', align: 'left', sortable: false },
        { text: 'Mã học phần', value: 'termCode', align: 'left', width: '180px', sortable: false },
        { text: 'Tín chỉ', value: 'credit', align: 'center', width: '120px', sortable: false },
      ],

      headers: [
        { text: 'STT', value: 'stt', align: 'center', width: '60px', sortable: false },
        { text: 'Mã ngành', value: 'code', align: 'left', minWidth: '140px', sortable: false },
        { text: 'Tên ngành', value: 'name', align: 'left', minWidth: '220px', sortable: false },
        { text: 'Chương trình đào tạo', value: 'educationProgramName', align: 'left', minWidth: '250px', sortable: false },
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
        for (let i = 1; i <= total; i++) pages.push(i)
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
    await this.loadEducationProgramOptions()
    await this.loadData()
  },
  methods: {
    async loadEducationProgramOptions() {
      try {
        const res = await unitService.getEducationProgramList({ status: 'ACTIVE', channel: 'CMS' })
        if (res) {
          const data = res.data !== undefined ? res.data : res
          this.educationProgramOptions = Array.isArray(data) ? data : (data.data || data.content || [])
        }
      } catch (err) {
        console.error('Lỗi tải chương trình đào tạo:', err)
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
          ...(this.activeFilters.educationProgramId && { educationProgramId: this.activeFilters.educationProgramId }),
          ...(this.activeFilters.status && { status: this.activeFilters.status })
        }
        const res = await unitService.getMajorList(params)
        if (res) {
          const rootData = res.data !== undefined ? res.data : res
          const items = Array.isArray(rootData) ? rootData : (rootData.data || rootData.content || rootData.items || [])
          this.itemList = items
          this.totalRecords = Number(rootData.totalElements ?? rootData.totalRecords ?? items.length)
          this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage) || 1
        }
      } catch (err) {
        console.error('Lỗi tải danh sách ngành:', err)
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
      this.filters = { search: '', educationProgramId: '', status: '' }
      this.activeFilters = { search: '', educationProgramId: '', status: '' }
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
        await unitService.changeMajorStatus(item.id, { status: val }, 'CMS')
        item.status = val
        await this.loadData()
        this.showToast('Cập nhật trạng thái thành công')
      } catch (err) {
        console.error('Lỗi đổi trạng thái:', err)
      }
    },
    
    async handleConfig(item) {
      this.currentMajorId = item.id
      this.termSearch = ''
      this.termPage = 1
      this.termDialog = true
      await this.loadTermData()
    },

    async loadTermData() {
      this.termLoading = true
      try {
        const res = await unitService.getMajorTermList({
          majorId: this.currentMajorId,
          pageIndex: this.termPage,
          pageSize: this.termPerPage, // Đảm bảo lấy đúng biến termPerPage (50) thay vì bị cố định là 10
          channel: 'CMS',
          ...(this.termSearch && { search: this.termSearch })
        })
        if (res) {
          const rootData = res.data !== undefined ? res.data : res
          const rawTerms = Array.isArray(rootData) ? rootData : (rootData.data || rootData.content || rootData.items || [])
          
          this.termList = rawTerms.map(t => ({
            ...t,
            termName: t.term ? t.term.name : (t.name || '-'),
            termCode: t.term ? t.term.code : (t.code || '-'),
            credit: t.credit ?? 0
          }))
          this.filteredTerms = [...this.termList]
          this.termTotalRecords = Number(rootData.totalElements ?? rootData.totalRecords ?? rawTerms.length)
          this.termTotalPages = Math.ceil(this.termTotalRecords / this.termPerPage) || 1
        }
      } catch (err) {
        console.error('Lỗi tải học phần:', err)
      } finally {
        this.termLoading = false
      }
    },

    // Xử lý đổi trang trong popup
    handleTermPageChange(newPage) {
      this.termPage = newPage
      this.loadTermData()
    },

    // Xử lý đổi số bản ghi mỗi trang trong popup
    handleTermPerPageChange(newSize) {
      this.termPerPage = Number(newSize)
      this.termPage = 1
      this.loadTermData()
    },

    // Lưu tín chỉ học phần -> Gọi API PUT /api/majorTerm/{id} và hiển thị "Cập nhật thông tin thành công"
    async saveTermCredits() {
      this.savingTerms = true
      try {
        // Đảm bảo payload gửi lên có chứa đầy đủ majorId và danh sách các học phần kèm tín chỉ đã sửa
        const payload = {
          majorId: this.currentMajorId,
          terms: this.termList.map(t => ({
            id: t.id, // ID của dòng majorTerm nếu có
            termId: t.term ? t.term.id : t.termId,
            credit: t.credit
          }))
        }

        await unitService.updateMajorTerm(this.currentMajorId, payload, 'CMS')
        this.termDialog = false
        this.showToast('Cập nhật thông tin thành công')
        await this.loadData()
      } catch (err) {
        console.error('Lỗi cập nhật tín chỉ học phần:', err)
        this.showToast('Có lỗi xảy ra khi cập nhật')
      } finally {
        this.savingTerms = false
      }
    },

    async exportExcel() {
      try {
        const params = {
          channel: 'CMS',
          ...(this.activeFilters.search && { search: this.activeFilters.search }),
          ...(this.activeFilters.educationProgramId && { educationProgramId: this.activeFilters.educationProgramId }),
          ...(this.activeFilters.status && { status: this.activeFilters.status })
        }
        
        // Gọi API xuất file
        const res = await unitService.exportMajorExcel(params)
        
        // Lấy chính xác dữ liệu nhị phân trả về từ res.data hoặc res
        const fileData = res.data ? res.data : res
        const blob = new Blob([fileData], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        })
        
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `DANH_SACH_NGANH_${new Date().getTime()}.xlsx`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (err) {
        console.error('Lỗi xuất file Excel:', err)
      }
    },
    showToast(message) {
      this.alert.text = message
      this.alert.progressKey += 1
      this.alert.show = true
    }
  }
}
</script>

<style scoped>
/* Khung tổng thể ép chiều cao cố định bằng màn hình, chặn cuộn toàn trang */
.major-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px); /* Trừ đi chiều cao header chung nếu có */
  max-height: calc(100vh - 64px);
  overflow: hidden;
  padding: 16px;
  box-sizing: border-box;
}

/* Cố định phần trên */
.fixed-top-section {
  flex-shrink: 0;
  background-color: #ffffff;
  z-index: 5;
}

/* Phần bảng ở giữa tự động co giãn và xuất hiện thanh cuộn riêng biệt */
.scrollable-table-section {
  flex: 1 1 auto;
  overflow-y: auto;
  min-height: 0;
  background-color: #ffffff;
}

/* Cố định phần dưới đáy */
.fixed-bottom-section {
  flex-shrink: 0;
  background-color: #ffffff;
  padding: 8px 16px;
  z-index: 5;
}

/* Ghim cố định dòng tiêu đề (th) của bảng khi cuộn dọc */
.scrollable-table-section >>> th {
  position: sticky !important;
  top: 0;
  z-index: 3;
  background-color: #f5f5f5 !important;
}

.text-red-bold { color: #A62229 !important; }
.filter-input >>> .v-input__slot { border-radius: 6px !important; min-height: 38px !important; }
.btn-square-action { border-radius: 6px !important; height: 38px !important; min-width: 38px !important; }
.success-snackbar >>> .v-snack__wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 6px !important;
}
.toast-content { width: 100%; }
.toast-time-track {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 5px;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.2);
}
.toast-time-progress {
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.55);
  transform-origin: left;
  animation: toast-time-countdown 3s linear forwards;
}
@keyframes toast-time-countdown {
  to { transform: scaleX(0); }
}
::v-deep .v-data-footer { display: none !important; }
</style>