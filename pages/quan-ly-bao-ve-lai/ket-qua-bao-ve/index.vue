<template>
  <div class="student-page d-flex flex-column pa-2 pa-sm-4 bg-white">
    <!-- 1. THANH TÌM KIẾM CỐ ĐỊNH PHÍA TRÊN -->
    <div class="top-filter-bar bg-white py-3 px-1">
      <div class="d-flex align-center justify-space-between flex-wrap gap-2 width-100">
        <div class="text-subtitle-1 font-weight-bold mr-2 text-no-wrap">
          Danh sách kết quả bảo vệ lại (<span class="red--text text--darken-2">{{ totalRecord }}</span>)
        </div>

        <div class="d-flex align-center gap-2 flex-wrap flex-grow-1 justify-end">
          <!-- Tìm kiếm theo Mã SV hoặc Họ tên -->
          <v-text-field
            v-model="filters.keyword"
            placeholder="Sinh viên (Mã SV, Họ tên...)"
            outlined
            dense
            hide-details
            clearable
            class="bg-white filter-item search-input custom-outlined-input"
            @keyup.enter="search"
          ></v-text-field>

          <!-- Lớp sinh viên -->
          <v-autocomplete
            v-model="filters.classId"
            :items="classList"
            item-text="name"
            item-value="id"
            placeholder="Lớp sinh viên"
            outlined
            dense
            hide-details
            clearable
            :menu-props="{ attach: true, offsetY: true, zIndex: 999 }"
            class="bg-white filter-item select-md custom-outlined-input"
          ></v-autocomplete>

          <!-- Đợt bảo vệ -->
          <v-autocomplete
            v-model="filters.examId"
            :items="examOptions"
            item-text="text"
            item-value="value"
            placeholder="Đợt bảo vệ"
            outlined
            dense
            hide-details
            clearable
            :menu-props="{ attach: true, offsetY: true, zIndex: 999 }"
            class="bg-white filter-item select-md custom-outlined-input"
          ></v-autocomplete>

          <!-- Hội đồng bảo vệ -->
          <v-autocomplete
            v-model="filters.examSessionId"
            :items="examSessionOptions"
            item-text="text"
            item-value="value"
            placeholder="Hội đồng bảo vệ"
            outlined
            dense
            hide-details
            clearable
            :menu-props="{ attach: true, offsetY: true, zIndex: 999 }"
            class="bg-white filter-item select-md custom-outlined-input"
          ></v-autocomplete>

          <div class="d-flex gap-2 align-center">
            <v-btn
              icon
              color="#a2212b"
              class="rounded-sm action-btn"
              @click="resetFilters"
            >
              <v-icon color="#a2212b" size="24">mdi-refresh</v-icon>
            </v-btn>

            <v-btn
              color="#a2212b"
              dark
              elevation="0"
              class="min-w-0 px-3 rounded-sm action-btn"
              style="height: 40px;"
              @click="search"
            >
              <v-icon size="24">mdi-magnify</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. BẢNG DỮ LIỆU -->
    <div class="table-scroll-container flex-grow-1">
      <BaseTable
        :headers="headers"
        :items="list"
        hide-default-footer
        disable-pagination
        :loading="isLoading"
        loading-text="Đang tải dữ liệu..."
        no-data-text="Không có dữ liệu"
      >
        <template #[`item.score`]="{ item }">
          <span class="font-weight-bold text-red-bold">{{ item.score }}</span>
        </template>

        <template #[`item.status`]="{ item }">
          <v-chip
            small
            dark
            :color="getStatusColor(item.status)"
            class="font-weight-medium text-caption"
          >
            {{ getStatusName(item.status) }}
          </v-chip>
        </template>
      </BaseTable>
    </div>

    <!-- 3. THANH PHÂN TRANG & NÚT NHẬP FILE XANH LÁ -->
    <div
      class="bottom-bar d-flex align-center justify-space-between flex-nowrap py-2 px-3 mt-auto bg-white border-top"
    >
      <v-btn
        color="#2e7d32"
        dark
        elevation="0"
        class="text-capitalize rounded px-4 font-weight-bold"
        @click="openImportModal"
      >
        <v-icon left small>mdi-microsoft-excel</v-icon> Nhập file kết quả
      </v-btn>

      <div class="d-flex align-center gap-2 flex-nowrap">
        <v-select
          v-model="itemsPerPage"
          :items="[10, 20, 50, 100]"
          label="Bản ghi"
          dense
          outlined
          hide-details
          :menu-props="{ top: true, offsetY: true, zIndex: 999 }"
          class="pagination-input"
          style="width: 85px"
          @change="onItemsPerPageChange"
        ></v-select>

        <v-text-field
          v-model.number="pageInput"
          label="Trang"
          dense
          outlined
          hide-details
          class="pagination-input text-center"
          style="width: 65px"
          @keyup.enter="goToPage"
        ></v-text-field>

        <v-btn
          color="#a2212b"
          dark
          small
          class="text-capitalize px-3 rounded-sm elevation-0"
          style="height: 36px"
          @click="goToPage"
          >Đi</v-btn
        >

        <div class="d-flex align-center gap-1">
          <v-btn icon small :disabled="page <= 1" @click="changePage(page - 1)"
            ><v-icon>mdi-chevron-left</v-icon></v-btn
          >
          <template v-for="p in totalPages">
            <v-btn
              v-if="p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)"
              :key="p"
              small
              :color="page === p ? '#a2212b' : ''"
              :dark="page === p"
              :outlined="page !== p"
              class="min-w-0 pa-0 rounded-sm elevation-0 mx-1"
              style="width: 28px; height: 28px"
              @click="changePage(p)"
            >
              {{ p }}
            </v-btn>
            <span v-else-if="p === page - 2 || p === page + 2" :key="'dots-' + p">...</span>
          </template>
          <v-btn icon small :disabled="page >= totalPages" @click="changePage(page + 1)"
            ><v-icon>mdi-chevron-right</v-icon></v-btn
          >
        </div>
      </div>
    </div>

    <!-- MODAL NHẬP FILE EXCEL (ĐÚNG MẪU ẢNH) -->
    <v-dialog v-model="showImportDialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="headline grey lighten-2 py-3 px-4 d-flex justify-space-between align-center">
          <span>Nhập file excel</span>
          <v-btn icon small @click="showImportDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-4">
          <div class="mb-3 text-body-2">
            Tải file mẫu ở đây: 
            <a href="#" class="blue--text text--darken-2 text-decoration-underline" @click.prevent="downloadTemplate">
              template_bang_kiem_bao_ve_lai.xlsx
            </a>
          </div>

          <!-- Khu vực chọn file giống ảnh mẫu -->
          <div class="upload-drop-zone pa-4 text-center mb-3">
            <v-file-input
              v-model="selectedFile"
              placeholder="Chọn tệp đính kèm"
              accept=".xlsx, .xls"
              outlined
              dense
              hide-details
              prepend-icon=""
              append-icon="mdi-file-excel"
              class="custom-file-input"
              @change="onFileChange"
            >
              <template v-slot:prepend-inner>
                <v-icon color="error" size="32">mdi-plus-circle</v-icon>
              </template>
            </v-file-input>
          </div>
        </v-card-text>

        <v-card-actions class="px-4 pb-3 justify-end">
          <!-- Khi check đúng đổi thành nút Lưu, chưa check là nút Import -->
          <v-btn
            v-if="!isCheckSuccess"
            color="#a2212b"
            dark
            elevation="0"
            :loading="isImporting"
            @click="handleCheckFile"
          >
            Import
          </v-btn>

          <v-btn
            v-else
            color="success"
            dark
            elevation="0"
            :loading="isImporting"
            @click="handleSaveFile"
          >
            Lưu
          </v-btn>

          <v-btn text @click="showImportDialog = false">Đóng</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import { closeStatusList } from '~/consts/list'
import resultService from '~/services/redefenseResultService'

export default {
  name: 'KetQuaBaoVeLaiView',
  components: { BaseTable },
  middleware: 'authenticated',
  data() {
    return {
      page: 1,
      pageInput: 1,
      itemsPerPage: 50,
      totalRecord: 0,
      isLoading: false,

      showImportDialog: false,
      selectedFile: null,
      isImporting: false,
      isCheckSuccess: false, // Trạng thái kiểm tra file thành công để đổi nút Import thành Lưu

      statusList: closeStatusList,

      filters: {
        keyword: '',
        classId: null,
        examId: null,
        examSessionId: null,
      },
      appliedFilters: {
        keyword: '',
        classId: null,
        examId: null,
        examSessionId: null,
      },

      headers: [
        { value: "studentCode", text: "Mã số sinh viên", align: "center", sortable: false, width: "130px" },
        { value: "fullName", text: "Họ và tên", sortable: false, width: "160px" },
        { value: "className", text: "Lớp SV", align: "center", sortable: false, width: "130px" },
        { value: "score", text: "Điểm", align: "center", sortable: false, width: "90px" },
        { value: "note", text: "Ghi chú", sortable: false, width: "150px" },
        { value: "examName", text: "Đợt bảo vệ", sortable: false, width: "150px" },
        { value: "subjectName", text: "Học phần", sortable: false, width: "180px" },
        { value: "examSessionName", text: "Hội đồng", sortable: false, width: "150px" },
        { value: "status", text: "Trạng thái", align: "center", sortable: false, width: "120px" },
      ],

      list: [],
      classList: [],
      examList: [],
      examSessionList: [],
    }
  },
  computed: {
    examOptions() {
      const items = Array.isArray(this.examList) ? this.examList : []
      return items.map((item) => ({
        text: item.name || item.code,
        value: item.id || item.code,
      }))
    },
    examSessionOptions() {
      const items = Array.isArray(this.examSessionList) ? this.examSessionList : []
      return items.map((item) => ({
        text: item.examClass || item.name || item.code,
        value: item.id,
      }))
    },
    totalPages() {
      const total = Math.ceil(this.totalRecord / this.itemsPerPage)
      return total > 0 ? total : 1
    },
  },
  async mounted() {
    await Promise.all([
      this.fetchFilterData(),
      this.fetchData(),
    ])
  },
  methods: {
    getStatusName(statusKey) {
      const found = (this.statusList || []).find(s => s.value === statusKey)
      return found ? found.text : (statusKey || 'Chưa duyệt')
    },

    getStatusColor(statusKey) {
      const found = (this.statusList || []).find(s => s.value === statusKey)
      return found ? found.color : 'warning'
    },

    async fetchFilterData() {
      try {
        const [classRes, examRes, sessionRes] = await Promise.all([
          resultService.getClasses({ channel: 'CMS', transid: '3bbd27f8-f1c0-466d-9136-cf9a07e3ae3a' }),
          resultService.getExamList({ status: 'ACTIVE', channel: 'CMS', transid: '4ae22849-83ef-41e1-91ec-2a82b3b7f2c6' }),
          resultService.getExamSessionList({ status: 'ACTIVE', channel: 'CMS', transid: 'be00a92c-3f76-43a6-af69-5fb4a64a053e' })
        ])

        const parseData = (res) => {
          const raw = res?.data !== undefined ? res.data : res
          return raw?.data?.items || raw?.data?.objects || raw?.data || raw?.items || raw?.objects || (Array.isArray(raw) ? raw : [])
        }

        const rawClasses = parseData(classRes)
        this.classList = rawClasses.map(c => ({
          id: c.id,
          name: c.name || c.code || c
        }))

        this.examList = parseData(examRes)
        this.examSessionList = parseData(sessionRes)
      } catch (err) {
        console.error('Lỗi tải dữ liệu danh mục bộ lọc:', err)
      }
    },

    async fetchData() {
      try {
        this.isLoading = true
        const keyword = this.appliedFilters.keyword || ''
        
        const params = {
          pageIndex: this.page,
          pageSize: this.itemsPerPage,
          search: keyword || undefined,
          fullName: keyword || undefined,
          code: keyword || undefined,
          classId: this.appliedFilters.classId || undefined,
          examId: this.appliedFilters.examId || undefined,
          examSessionId: this.appliedFilters.examSessionId || undefined,
          channel: 'CMS',
          transid: '03031980-db26-4a1a-bd49-839a737c32c8'
        }

        const res = await resultService.getList(params)
        
        const responseWrapper = res?.data !== undefined ? res.data : res
        const pageData = responseWrapper?.data !== undefined ? responseWrapper.data : responseWrapper
        
        let items = []
        if (Array.isArray(pageData?.data)) {
          items = pageData.data
        } else if (Array.isArray(pageData)) {
          items = pageData
        } else if (Array.isArray(pageData?.items)) {
          items = pageData.items
        }

        this.list = items.map((item) => ({
          studentCode: item.code || '---',
          fullName: item.name || '---',
          className: item.classesCode || '---',
          score: item.score !== undefined && item.score !== null ? item.score : '---',
          note: item.notes || '---',
          examName: item.examSession?.exam?.name || '---',
          subjectName: item.term?.name || '---',
          examSessionName: item.examSession?.examClass || '---',
          status: item.scoreStatus || 'NOT_CLOSED',
        }))

        this.totalRecord = 
          pageData?.totalRecords || 
          responseWrapper?.totalRecords || 
          pageData?.total || 
          this.list.length
      } catch (err) {
        console.error('Lỗi khi tải danh sách kết quả:', err)
        this.list = []
        this.totalRecord = 0
      } finally {
        this.isLoading = false
      }
    },

    search() {
      this.appliedFilters = { ...this.filters }
      this.page = 1
      this.pageInput = 1
      this.fetchData()
    },

    resetFilters() {
      this.filters = {
        keyword: '',
        classId: null,
        examId: null,
        examSessionId: null,
      }
      this.appliedFilters = { ...this.filters }
      this.page = 1
      this.pageInput = 1
      this.fetchData()
    },

    changePage(p) {
      if (p >= 1 && p <= this.totalPages) {
        this.page = p
        this.pageInput = p
        this.fetchData()
      }
    },

    goToPage() {
      let target = parseInt(this.pageInput, 10)
      if (isNaN(target) || target < 1) target = 1
      if (target > this.totalPages) target = this.totalPages
      this.page = target
      this.pageInput = target
      this.fetchData()
    },

    onItemsPerPageChange(val) {
      this.itemsPerPage = Number(val) || 50
      this.page = 1
      this.pageInput = 1
      this.fetchData()
    },

    openImportModal() {
      this.selectedFile = null
      this.isCheckSuccess = false
      this.showImportDialog = true
    },

    onFileChange() {
      // Khi chọn file mới thì reset trạng thái check
      this.isCheckSuccess = false
    },

    async downloadTemplate() {
      try {
        const res = await resultService.getTemplate({ channel: 'CMS' })
        const blob = new Blob([res.data || res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = 'template_bang_kiem_bao_ve_lai.xlsx'
        link.click()
        window.URL.revokeObjectURL(link.href)
      } catch (err) {
        console.error('Lỗi tải file mẫu:', err)
      }
    },

    // Bấm nút Import -> Gọi API Check
    async handleCheckFile() {
      if (!this.selectedFile) {
        alert('Vui lòng chọn file đính kèm!')
        return
      }
      try {
        this.isImporting = true
        const formData = new FormData()
        formData.append('file', this.selectedFile)
        formData.append('channel', 'CMS')

        const res = await resultService.checkImportFile(formData)
        // Nếu check thành công, chuyển trạng thái để đổi nút thành "Lưu"
        if (res) {
          this.isCheckSuccess = true
        }
      } catch (err) {
        console.error('Lỗi kiểm tra file:', err)
      } finally {
        this.isImporting = false
      }
    },

    // Bấm nút Lưu sau khi Check đúng -> Gọi API Import chính thức
    async handleSaveFile() {
      if (!this.selectedFile) return
      try {
        this.isImporting = true
        const formData = new FormData()
        formData.append('file', this.selectedFile)
        formData.append('channel', 'CMS')

        await resultService.importFile(formData)

        this.showImportDialog = false
        this.fetchData()
      } catch (err) {
        console.error('Lỗi khi lưu file import:', err)
      } finally {
        this.isImporting = false
      }
    }
  },
}
</script>

<style scoped>
.text-red-bold { color: #a62229 !important; }
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.top-filter-bar { flex-shrink: 0; }
.filter-item { flex-grow: 1; flex-shrink: 1; }
.search-input { min-width: 180px; max-width: 220px; }
.select-md { min-width: 150px; max-width: 180px; }
.action-btn { height: 40px !important; min-height: 40px !important; }
.custom-outlined-input >>> .v-input__control { min-height: 38px !important; }
.custom-outlined-input >>> fieldset { border-color: #ccc !important; border-radius: 4px !important; }
.border-top { border-top: 1px solid #e0e0e0; }
.bottom-bar { flex-shrink: 0; background-color: #ffffff; overflow-x: auto; }
.pagination-input >>> .v-input__control { min-height: 36px !important; }

.table-scroll-container {
  overflow-x: auto;
  width: 100%;
}
.table-scroll-container >>> th {
  position: sticky !important;
  top: 0;
  z-index: 2;
  background-color: #f5f5f5 !important;
}

.upload-drop-zone {
  border: 2px dashed #e0e0e0;
  border-radius: 6px;
  background-color: #fafafa;
}

@media (max-width: 599px) {
  .student-page { height: auto; min-height: 100vh; overflow: visible; }
}
@media (min-width: 600px) {
  .student-page { height: calc(100vh - 64px); overflow: hidden; display: flex; flex-direction: column; }
}
</style>