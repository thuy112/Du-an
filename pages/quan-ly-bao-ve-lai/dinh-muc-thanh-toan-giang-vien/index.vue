<template>
  <div class="student-page d-flex flex-column pa-2 pa-sm-4 bg-white">
    <!-- 1. THANH TÌM KIẾM CỐ ĐỊNH PHÍA TRÊN -->
    <div class="top-filter-bar bg-white py-3 px-1">
      <div class="d-flex align-center justify-space-between flex-wrap gap-2 width-100">
        <div class="text-subtitle-1 font-weight-bold mr-2 text-no-wrap">
          Danh sách thanh toán cho giảng viên (<span class="red--text text--darken-2">{{ totalRecord }}</span>)
        </div>

        <div class="d-flex align-center gap-2 flex-wrap flex-grow-1 justify-end">
          <!-- Tìm kiếm chung -->
          <v-text-field
            v-model="filters.search"
            placeholder="Tìm kiếm"
            outlined
            dense
            hide-details
            clearable
            class="bg-white filter-item search-input custom-outlined-input"
            @keyup.enter="search"
          ></v-text-field>

          <!-- Giảng viên -->
          <v-autocomplete
            v-model="filters.teacherId"
            :items="teacherOptions"
            item-text="text"
            item-value="value"
            placeholder="Giảng viên"
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

          <!-- Trạng thái -->
          <v-autocomplete
            v-model="filters.paymentSendStatus"
            :items="paymentSendStatusList"
            item-text="text"
            item-value="value"
            placeholder="Trạng thái"
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

            <!-- Nút Thêm mới (+) -->
            <v-btn
              color="#a2212b"
              dark
              elevation="0"
              class="min-w-0 px-3 rounded-sm action-btn"
              style="height: 40px;"
              @click="openAddModal"
            >
              <v-icon size="24">mdi-plus</v-icon>
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
        <!-- STT -->
        <template #[`item.stt`]="{ index }">
          <span class="font-weight-medium">{{ (page - 1) * itemsPerPage + index + 1 }}</span>
        </template>

        <!-- File thanh toán -->
        <template #[`item.filePayment`]="{ item }">
          <v-btn icon small color="grey darken-1" @click="downloadFilePayment(item)">
            <v-icon size="20">mdi-file-document-outline</v-icon>
          </v-btn>
        </template>

        <!-- Tổng phí -->
        <template #[`item.totalFee`]="{ item }">
          <span class="font-weight-medium">{{ formatCurrency(item.totalFee) }}</span>
        </template>

        <!-- Trạng thái -->
        <template #[`item.paymentSendStatus`]="{ item }">
          <v-chip
            small
            dark
            :color="getStatusColor(item.paymentSendStatus)"
            class="font-weight-medium text-caption"
          >
            {{ getStatusName(item.paymentSendStatus) }}
            <v-icon right x-small>mdi-menu-down</v-icon>
          </v-chip>
        </template>

        <!-- Chức năng -->
        <template #[`item.actions`]="{ item }">
          <v-menu offset-y left>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon small v-bind="attrs" v-on="on">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list dense>
              <v-list-item @click="editItem(item)">
                <v-list-item-icon class="mr-2"><v-icon small>mdi-pencil</v-icon></v-list-item-icon>
                <v-list-item-title>Sửa</v-list-item-title>
              </v-list-item>
              <v-list-item @click="deleteItem(item)">
                <v-list-item-icon class="mr-2"><v-icon small color="error">mdi-delete</v-icon></v-list-item-icon>
                <v-list-item-title class="error--text">Xóa</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </BaseTable>
    </div>

    <!-- 3. THANH PHÂN TRANG & NÚT XUẤT DANH SÁCH -->
    <div
      class="bottom-bar d-flex align-center justify-space-between flex-nowrap py-2 px-3 mt-auto bg-white border-top"
    >
      <v-btn
        color="#e0e0e0"
        class="text-dark text-capitalize rounded px-4 font-weight-bold"
        style="color: #333 !important;"
        @click="exportList"
      >
        <v-icon left small>mdi-microsoft-excel</v-icon> XUẤT DANH SÁCH CHO GIẢNG VIÊN
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
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import paymentTeacherServices from '~/services/redefend/paymentTeacherServices'
import { paymentSendStatusList } from '~/consts/list'
import Api from '~/api/Api.js'

export default {
  name: 'PaymentTeacherView',
  components: { BaseTable },
  middleware: 'authenticated',
  data() {
    return {
      page: 1,
      pageInput: 1,
      itemsPerPage: 50,
      totalRecord: 0,
      isLoading: false,

      paymentSendStatusList,

      filters: {
        search: '',
        teacherId: null,
        examSessionId: null,
        paymentSendStatus: null,
      },
      appliedFilters: {
        search: '',
        teacherId: null,
        examSessionId: null,
        paymentSendStatus: null,
      },

      headers: [
        { value: 'stt', text: 'STT', align: 'center', sortable: false, width: '60px' },
        { value: 'examSessionName', text: 'Hội đồng thanh toán', sortable: false, width: '180px' },
        { value: 'creditHours', text: 'Số tín chỉ học tập', align: 'center', sortable: false, width: '130px' },
        { value: 'teachersName', text: 'Giảng viên', sortable: false, width: '220px' },
        { value: 'subjectName', text: 'Tên học phần', sortable: false, width: '180px' },
        { value: 'filePayment', text: 'File thanh toán', align: 'center', sortable: false, width: '110px' },
        { value: 'totalFee', text: 'Tổng phí', align: 'right', sortable: false, width: '140px' },
        { value: 'paymentSendStatus', text: 'Trạng thái', align: 'center', sortable: false, width: '130px' },
        { value: 'actions', text: 'Chức năng', align: 'center', sortable: false, width: '90px' },
      ],

      list: [],
      teacherList: [],
      examSessionList: [],
    }
  },
  computed: {
    teacherOptions() {
      const items = Array.isArray(this.teacherList) ? this.teacherList : []
      return items.map((item) => ({
        text: item.fullName || item.name || item.code,
        value: item.id,
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
      const found = (this.paymentSendStatusList || []).find(s => s.value === statusKey)
      return found ? found.text : (statusKey || 'Chưa gửi')
    },

    getStatusColor(statusKey) {
      const found = (this.paymentSendStatusList || []).find(s => s.value === statusKey)
      return found ? found.color : 'warning'
    },

    formatCurrency(val) {
      if (val === null || val === undefined) return '0đ'
      return `${Number(val).toLocaleString('en-US')}đ`
    },

    async fetchFilterData() {
      try {
        const [teacherRes, sessionRes] = await Promise.all([
          Api.get('/teacher/list', { status: 'ACTIVE', channel: 'CMS', transid: 'f808f7cc-a95b-43f6-a1df-a186fe581693' }),
          Api.get('/redefense/examSession/list', { status: 'ACTIVE', scoreStatus: 'SCOREBOARD_AVAILABLE', examSessionStatus: 'FINALIZED', channel: 'CMS', transid: '5b32afbe-39a1-4068-9f95-c23e4f4acbae' })
        ])

        const parseData = (res) => {
          const raw = res?.data !== undefined ? res.data : res
          return raw?.data?.items || raw?.data?.objects || raw?.data || raw?.items || raw?.objects || (Array.isArray(raw) ? raw : [])
        }

        this.teacherList = parseData(teacherRes)
        this.examSessionList = parseData(sessionRes)
      } catch (err) {
        console.error('Lỗi tải dữ liệu danh mục bộ lọc:', err)
      }
    },

    async fetchData() {
      try {
        this.isLoading = true
        const params = {
          pageIndex: this.page,
          pageSize: this.itemsPerPage,
          search: this.appliedFilters.search || undefined,
          teacherId: this.appliedFilters.teacherId || undefined,
          examSessionId: this.appliedFilters.examSessionId || undefined,
          paymentSendStatus: this.appliedFilters.paymentSendStatus || undefined,
          channel: 'CMS',
          transid: 'f97ee128-4406-4342-9874-dc5527aa3a20'
        }

        const res = await paymentTeacherServices.getList(params)
        
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
          id: item.id,
          examSessionName: item.examSession?.examClass || item.examSessionName || '---',
          creditHours: item.examSession?.term?.creditHours || item.creditHours || '---',
          teachersName: item.teachersName || (Array.isArray(item.teachers) ? item.teachers.map(t => t.name || t.fullName).join(', ') : '---'),
          subjectName: item.examSession?.term?.name || item.subjectName || '---',
          totalFee: item.totalFee !== undefined ? item.totalFee : 0,
          paymentSendStatus: item.paymentSendStatus || 'NOT_SENT',
        }))

        this.totalRecord = 
          pageData?.totalRecords || 
          responseWrapper?.totalRecords || 
          pageData?.total || 
          this.list.length
      } catch (err) {
        console.error('Lỗi khi tải danh sách thanh toán giảng viên:', err)
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
        search: '',
        teacherId: null,
        examSessionId: null,
        paymentSendStatus: null,
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

    openAddModal() {},
    editItem(item) {},
    deleteItem(item) {},
    downloadFilePayment(item) {},
    exportList() {}
  },
}
</script>

<style scoped>
.text-red-bold { color: #a62229 !important; }
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.top-filter-bar { flex-shrink: 0; }
.filter-item { flex-grow: 1; flex-shrink: 1; }
.search-input { min-width: 160px; max-width: 200px; }
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

@media (max-width: 599px) {
  .student-page { height: auto; min-height: 100vh; overflow: visible; }
}
@media (min-width: 600px) {
  .student-page { height: calc(100vh - 64px); overflow: hidden; display: flex; flex-direction: column; }
}
</style>