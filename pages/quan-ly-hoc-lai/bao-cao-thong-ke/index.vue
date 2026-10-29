<template>
  <div class="student-page d-flex flex-column pa-2 pa-sm-4 bg-white">
    <!-- 1. THANH TÌM KIẾM CỐ ĐỊNH PHÍA TRÊN -->
    <div class="top-filter-bar bg-white py-3 px-1">
      <div class="d-flex align-center justify-space-between flex-wrap gap-2 width-100">
        <div class="text-subtitle-1 font-weight-bold mr-2 text-no-wrap">
          Danh sách kết quả thu (<span class="red--text text--darken-2">{{ totalRecord }}</span>) 
          <span class="ml-2 font-weight-regular text-body-2">
            Tổng tiền đã thu: <strong class="success--text">{{ formatCurrency(totalAmount) }}</strong>
          </span>
        </div>

        <div class="d-flex align-center gap-2 flex-wrap flex-grow-1 justify-end">
          <v-text-field
            v-model="filters.search"
            placeholder="Sinh viên (Mã SV, Họ tên, SĐT...)"
            outlined
            dense
            hide-details
            clearable
            class="bg-white filter-item search-input custom-outlined-input"
            @keyup.enter="search"
          ></v-text-field>

          <v-select
            v-model="filters.examIds"
            :items="examOptions"
            item-text="text"
            item-value="value"
            placeholder="Đợt học lại"
            outlined
            dense
            hide-details
            clearable
            :menu-props="{ attach: true, offsetY: true, zIndex: 999 }"
            class="bg-white filter-item select-md custom-outlined-input"
          ></v-select>

          <v-text-field
            v-model="filters.fromTime"
            type="date"
            placeholder="Từ ngày"
            outlined
            dense
            hide-details
            clearable
            class="bg-white filter-item date-input custom-outlined-input"
          ></v-text-field>

          <v-text-field
            v-model="filters.toTime"
            type="date"
            placeholder="Đến ngày"
            outlined
            dense
            hide-details
            clearable
            class="bg-white filter-item date-input custom-outlined-input"
          ></v-text-field>

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

    <!-- 2. BẢNG DỮ LIỆU DÙNG BASETABLE -->
    <BaseTable
      :headers="headers"
      :items="list"
      hide-default-footer
      disable-pagination
      :loading="isLoading"
      loading-text="Đang tải dữ liệu..."
      no-data-text="Không có dữ liệu"
    >
      <template #[`item.stt`]="{ index }">
        <span class="font-weight-medium">{{
          (page - 1) * itemsPerPage + index + 1
        }}</span>
      </template>

      <!-- SỐ TIỀN ĐÃ THU -->
      <template #[`item.totalPaid`]="{ item }">
        <span class="font-weight-bold success--text">
          {{ formatCurrency(item.totalPaid) }}
        </span>
      </template>

      <!-- THỜI GIAN THU -->
      <template #[`item.createdTime`]="{ item }">
        <span>{{ item.createdTime ? formatDate(item.createdTime) : '---' }}</span>
      </template>
    </BaseTable>

    <!-- 3. THANH PHÂN TRANG & XUẤT FILE BÁO CÁO -->
    <div
      class="bottom-bar d-flex align-center justify-space-between flex-nowrap py-2 px-3 mt-auto bg-white border-top"
    >
      <v-btn
        color="#2e7d32"
        dark
        elevation="0"
        class="text-capitalize rounded px-4 font-weight-bold"
        @click="exportExcel"
      >
        <v-icon left small>mdi-export</v-icon> XUẤT FILE BÁO CÁO
      </v-btn>

      <div class="d-flex align-center gap-2 flex-nowrap">
        <v-select
          v-model="itemsPerPage"
          :items="[10, 20, 50, 100]"
          label="Bản ghi"
          dense
          outlined
          hide-details
          :menu-props="{ attach: true, top: true, offsetY: true, zIndex: 999 }"
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
          <template v-for="p in visiblePages">
            <v-btn
              v-if="
                p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)
              "
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
            <span
              v-else-if="p === page - 2 || p === page + 2"
              :key="'dots-' + p"
              >...</span
            >
          </template>
          <v-btn
            icon
            small
            :disabled="page >= totalPages"
            @click="changePage(page + 1)"
            ><v-icon>mdi-chevron-right</v-icon></v-btn
          >
        </div>
      </div>
    </div>

    <!-- HỆ THỐNG TOAST HÀNG ĐỢI -->
    <div class="toast-queue-container">
      <transition-group name="toast-list" tag="div">
        <div
          v-for="itemToast in toastList"
          :key="itemToast.id"
          class="custom-toast-item d-flex flex-column mb-2"
          :style="{ backgroundColor: itemToast.color || '#4caf50' }"
        >
          <div class="toast-content d-flex align-center justify-space-between px-4 py-3">
            <div class="d-flex align-center mr-3">
              <v-icon left color="white" size="20">
                {{ itemToast.color === '#C62828' ? 'mdi-alert-circle-outline' : 'mdi-check-circle-outline' }}
              </v-icon>
              <span class="toast-text font-weight-medium white--text">{{ itemToast.message }}</span>
            </div>
            <v-btn icon dark x-small class="ma-0 close-toast-btn" @click="removeToast(itemToast.id)">
              <v-icon size="16">mdi-close</v-icon>
            </v-btn>
          </div>
          <div class="toast-progress-bar-container">
            <div class="toast-progress-bar" :style="{ width: itemToast.progress + '%' }"></div>
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import reportResultServices from '~/services/re-learning/reportResultServices'

export default {
  name: 'ReportResultView',
  components: { BaseTable },
  middleware: 'authenticated',
  data() {
    return {
      page: 1,
      pageInput: 1,
      itemsPerPage: 50,
      totalPage: 1,
      totalRecord: 0,
      totalAmount: 0,
      isLoading: false,

      filters: {
        search: '',
        examIds: null,
        fromTime: '',
        toTime: '',
      },
      appliedFilters: {
        search: '',
        examIds: null,
        fromTime: '',
        toTime: '',
      },

      toastList: [],
      toastDuration: 3000,

      headers: [
        { text: 'STT', value: 'stt', sortable: false, width: '50px' },
        { text: 'Mã số SV', value: 'studentCode', sortable: false },
        { text: 'Họ tên SV', value: 'studentName', sortable: false },
        { text: 'Học phần đăng ký', value: 'registeredSubjects', sortable: false },
        { text: 'Đợt học lại', value: 'examName', sortable: false },
        { text: 'Học kỳ', value: 'semester', sortable: false },
        { text: 'Số tiền đã thu', value: 'totalPaid', sortable: false },
        { text: 'Số điện thoại', value: 'phone', sortable: false },
        { text: 'Lớp', value: 'className', sortable: false },
        { text: 'Khóa', value: 'course', sortable: false },
        { text: 'Ngành', value: 'major', sortable: false },
        { text: 'Hình thức đào tạo', value: 'trainingType', sortable: false },
        { text: 'Địa điểm đào tạo', value: 'trainingLocation', sortable: false },
        { text: 'Nội dung thu', value: 'content', sortable: false },
        { text: 'Thời gian thu', value: 'createdTime', sortable: false },
      ],

      list: [],
      examList: [],
    }
  },
  computed: {
    examOptions() {
      const items = Array.isArray(this.examList) ? this.examList : []
      return items.map((item) => ({
        text: item.name || item.code,
        value: item.id,
      }))
    },
    totalPages() {
      const total = Math.ceil(this.totalRecord / this.itemsPerPage)
      return total > 0 ? total : 1
    },
    visiblePages() {
      const pages = []
      for (let i = 1; i <= this.totalPages; i++) pages.push(i)
      return pages
    },
  },
  async mounted() {
    if (this.$store) {
      this.$store.commit('SET_PAGE_TITLE', 'Báo cáo kết quả thu')
    }
    await Promise.all([
      this.fetchUserInfo(),
      this.fetchPageRole(),
      this.fetchExamList(),
      this.fetchData(),
    ])
  },
  beforeDestroy() {
    this.toastList.forEach((toast) => clearInterval(toast.timer))
  },
  methods: {
    async fetchUserInfo() {
      try {
        await reportResultServices.getUserInfo({ channel: 'CMS' })
      } catch (err) {
        console.error('Lỗi tải thông tin user:', err)
      }
    },

    async fetchPageRole() {
      try {
        await reportResultServices.getPageRole({ channel: 'CMS' })
      } catch (err) {
        console.error('Lỗi kiểm tra quyền:', err)
      }
    },

    async fetchExamList() {
      try {
        const res = await reportResultServices.getExamList({ status: 'ACTIVE', channel: 'CMS' })
        const data = res?.data !== undefined ? res.data : res
        this.examList = data?.data || data?.items || (Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Lỗi tải đợt học lại:', err)
      }
    },

    async fetchData() {
      try {
        this.isLoading = true
        const params = {
          pageIndex: this.page,
          pageSize: this.itemsPerPage,
          search: this.appliedFilters.search || undefined,
          examIds: this.appliedFilters.examIds || undefined,
          fromTime: this.appliedFilters.fromTime || undefined,
          toTime: this.appliedFilters.toTime || undefined,
          channel: 'CMS',
        }

        console.log('Đang gọi API report/result với params:', params)
        const res = await reportResultServices.getReportResult(params)
        console.log('Kết quả API trả về:', res)

        // Hỗ trợ mọi dạng bóc tách dữ liệu của backend
        const raw = res?.data !== undefined ? res.data : res
        
        if (Array.isArray(raw)) {
          this.list = raw
        } else if (raw?.data && Array.isArray(raw.data)) {
          this.list = raw.data
        } else if (raw?.items && Array.isArray(raw.items)) {
          this.list = raw.items
        } else if (raw?.data?.items && Array.isArray(raw.data.items)) {
          this.list = raw.data.items
        } else if (raw?.result && Array.isArray(raw.result)) {
          this.list = raw.result
        } else {
          this.list = []
        }

        this.totalRecord = raw?.totalRecords || raw?.data?.totalRecords || raw?.total || this.list.length
        this.totalAmount = raw?.totalAmount || raw?.data?.totalAmount || 0
        this.totalPage = Math.ceil(this.totalRecord / this.itemsPerPage) || 1
      } catch (err) {
        console.error('LỖI GỌI API BÁO CÁO:', err.response || err)
        this.list = []
        this.totalRecord = 0
        this.totalAmount = 0
        this.showToast('Không thể tải dữ liệu báo cáo!', '#C62828')
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
        examIds: null,
        fromTime: '',
        toTime: '',
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

    formatCurrency(val) {
      if (val === null || val === undefined) return '0đ'
      return `${Number(val).toLocaleString('vi-VN')}đ`
    },

    formatDate(dateStr) {
      try {
        const d = new Date(dateStr)
        if (isNaN(d.getTime())) return dateStr
        const day = String(d.getDate()).padStart(2, '0')
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const year = d.getFullYear()
        const hours = String(d.getHours()).padStart(2, '0')
        const minutes = String(d.getMinutes()).padStart(2, '0')
        const seconds = String(d.getSeconds()).padStart(2, '0')
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
      } catch (e) {
        return dateStr
      }
    },

    exportExcel() {
      this.showToast('Chức năng xuất file đang được phát triển', '#2e7d32')
    },

    showToast(message, color = '#4caf50') {
      const id = Date.now() + Math.random()
      const newToast = { id, message, color, progress: 100, timer: null }
      this.toastList.push(newToast)

      const stepTime = 30
      const decrement = (stepTime / this.toastDuration) * 100

      newToast.timer = setInterval(() => {
        const target = this.toastList.find((t) => t.id === id)
        if (target) {
          target.progress -= decrement
          if (target.progress <= 0) {
            clearInterval(target.timer)
            this.removeToast(id)
          }
        }
      }, stepTime)
    },

    removeToast(id) {
      const index = this.toastList.findIndex((t) => t.id === id)
      if (index !== -1) {
        clearInterval(this.toastList[index].timer)
        this.toastList.splice(index, 1)
      }
    },
  },
}
</script>

<style scoped>
.gap-1 {
  gap: 4px;
}
.gap-2 {
  gap: 8px;
}
.top-filter-bar {
  flex-shrink: 0;
}
.filter-item {
  flex-grow: 1;
  flex-shrink: 1;
}
.search-input {
  min-width: 180px;
  max-width: 240px;
}
.select-md {
  min-width: 150px;
  max-width: 190px;
}
.date-input {
  min-width: 140px;
  max-width: 170px;
}
.action-btn {
  height: 40px !important;
  min-height: 40px !important;
}
.custom-outlined-input >>> .v-input__control {
  min-height: 38px !important;
}
.custom-outlined-input >>> fieldset {
  border-color: #ccc !important;
  border-radius: 4px !important;
}
.border-top {
  border-top: 1px solid #e0e0e0;
}
.bottom-bar {
  flex-shrink: 0;
  background-color: #ffffff;
  overflow-x: auto;
}
.pagination-input >>> .v-input__control {
  min-height: 36px !important;
}

/* Toast styling */
.toast-queue-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 380px;
  width: 100%;
  pointer-events: none;
}
.custom-toast-item {
  pointer-events: auto;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: toastSlideIn 0.3s ease-out forwards;
}
.toast-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.toast-text {
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
}
.close-toast-btn {
  opacity: 0.8;
  transition: opacity 0.2s;
}
.close-toast-btn:hover {
  opacity: 1;
}
.toast-progress-bar-container {
  width: 100%;
  height: 3px;
  background-color: rgba(255, 255, 255, 0.2);
}
.toast-progress-bar {
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  transition: width 0.03s linear;
}
@keyframes toastSlideIn {
  from {
    opacity: 0;
    transform: translateY(-15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@media (max-width: 599px) {
  .student-page {
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }
}
@media (min-width: 600px) {
  .student-page {
    height: calc(100vh - 64px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}
</style>