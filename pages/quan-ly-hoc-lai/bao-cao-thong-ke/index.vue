<template>
  <div class="student-page d-flex flex-column pa-2 pa-sm-4 bg-white">
    <!-- 1. THANH TÌM KIẾM CỐ ĐỊNH PHÍA TRÊN -->
    <div class="top-filter-bar bg-white py-3 px-1">
      <div class="d-flex align-center justify-space-between flex-wrap gap-2 width-100">
        <div class="text-subtitle-1 font-weight-bold mr-2 text-no-wrap">
          Danh sách kết quả thu (<span class="red--text text--darken-2">{{ totalRecord }}</span>) 
          <span class="ml-2 font-weight-regular text-body-2">
            Tổng tiền đã thu: <strong class="error--text">{{ formatCurrency(totalAmount) }}</strong>
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

          <!-- TỪ NGÀY -->
          <v-menu
            v-model="menuFrom"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="290px"
            app
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                :value="formatDisplayDate(filters.fromTime)"
                @input="onInputFromDate"
                placeholder="dd/mm/yyyy"
                outlined
                dense
                hide-details
                clearable
                class="bg-white filter-item date-input custom-outlined-input"
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="filters.fromTime"
              locale="vi-VN"
              no-title
              scrollable
              color="#a2212b"
              @input="menuFrom = false"
            ></v-date-picker>
          </v-menu>

          <!-- ĐẾN NGÀY -->
          <v-menu
            v-model="menuTo"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="290px"
            app
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                :value="formatDisplayDate(filters.toTime)"
                @input="onInputToDate"
                placeholder="dd/mm/yyyy"
                outlined
                dense
                hide-details
                clearable
                class="bg-white filter-item date-input custom-outlined-input"
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="filters.toTime"
              locale="vi-VN"
              no-title
              scrollable
              color="#a2212b"
              @input="menuTo = false"
            ></v-date-picker>
          </v-menu>

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

      <!-- THÊM SLOT NÀY ĐỂ HIỂN THỊ HỌC PHẦN ĐĂNG KÝ XUỐNG DÒNG -->
      <template #[`item.registerStudentTerms`]="{ item }">
        <div style="white-space: pre-line; line-height: 1.6; padding: 4px 0;">
          {{ item.registerStudentTerms }}
        </div>
      </template>

      <!-- SỐ TIỀN ĐÃ THU -->
      <template #[`item.totalPaid`]="{ item }">
        <span class="font-weight-bold error--text">
          {{ formatCurrency(item.totalPaid) }}
        </span>
      </template>

      <!-- THỜI GIAN THU -->
      <template #[`item.dateFeePaid`]="{ item }">
        <span>{{ item.dateFeePaid ? formatDateTime(item.dateFeePaid) : '---' }}</span>
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
import feeTeacherByExamService from '~/services/feeTeacherByExamService';
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
      menuFrom: false,
      menuTo: false,

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
            // { value: "orderCode", text: "Số hóa đơn", sortable: false },
            { value: "code", text: "Mã số SV", class: "text-center", sortable: false },
            { value: "fullName", text: "Họ tên SV", sortable: false, width: 150 },
            {
                value: "registerStudentTerms",
                text: "Học phần đăng ký",
                sortable: false,
                width: 350,
                align: "center",
            },
            { value: "exam.code", text: "Đợt học lại", sortable: false, width: 150 },
            {
                value: "registerSemesterTerms",
                text: "Học kỳ",
                sortable: false,
                width: 150,
                align: "center",
            },
            { value: "totalFee", text: "Số tiền đã thu", sortable: false },
            // { value: "dateImport", text: "Ngày Import DL", sortable: false },
            // { value: "dateFeePaid", text: "Ngày nộp tiền", sortable: false },
            { value: "phone", text: "Số điện thoại", sortable: false, width: 120 },
            { value: "clazz.name", text: "Lớp", align: "center", sortable: false, width: 150 },
            { value: "course.name", text: "Khóa", align: "center", sortable: false, width: 90 },
            { value: "major.name", text: "Ngành", align: "center", sortable: false },
            {
                value: "clazz.trainingMethodName",
                text: "Hình thức đào tạo",
                align: "center",
                sortable: false,
                width: 120,
            },
            {
                value: "clazz.trainingUnitName",
                text: "Địa điểm đào tạo",
                align: "center",
                sortable: false,
                width: 150,
            },
            { value: "type", text: "Nội dung thu", align: "center", sortable: false },
            { value: "dateFeePaid", text: "Thời gian thu", align: "center", sortable: false },
            // { value: "actions", text: "Chức năng", align: "center", sortable: false },
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
      this.fetchExamList(),
      this.fetchData(),
    ])
  },
  beforeDestroy() {
    this.toastList.forEach((toast) => clearInterval(toast.timer))
  },
  methods: {
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
          
          // Gắn thêm giờ phút giây để backend nhận diện đúng khoảng thời gian thu
          fromTime: this.appliedFilters.fromTime ? `${this.appliedFilters.fromTime} 00:00:00` : undefined,
          toTime: this.appliedFilters.toTime ? `${this.appliedFilters.toTime} 23:59:59` : undefined,
          
          channel: 'CMS',
        }

        const res = await reportResultServices.getReportResult(params)
        console.log('Dữ liệu thô từ API report/result:', res)

        const raw = res?.data !== undefined ? res.data : res
        
        let items = []
        if (Array.isArray(raw)) {
          items = raw
        } else if (Array.isArray(raw?.data)) {
          items = raw.data
        } else if (Array.isArray(raw?.items)) {
          items = raw.items
        } else if (Array.isArray(raw?.data?.items)) {
          items = raw.data.items
        } else if (Array.isArray(raw?.result)) {
          items = raw.result
        } else if (Array.isArray(raw?.result?.items)) {
          items = raw.result.items
        }

        let calculatedTotalAmount = 0

        this.list = items.map((item) => {
          let formattedTerms = '---'
          const termsArray = item.registerStudentTerms || []
          
          if (Array.isArray(termsArray) && termsArray.length > 0) {
            formattedTerms = termsArray
              .map((itemTerm) => {
                const target = itemTerm.term || itemTerm
                const code = target.code || ''
                const name = target.name || ''
                const feeVal = target.fee !== undefined ? Number(target.fee) : (itemTerm.fee !== undefined ? Number(itemTerm.fee) : 0)
                
                // Định dạng tiền học phần: dấu phẩy phân cách, thêm đ
                const fee = feeVal.toLocaleString('en-US') + 'đ'
                
                return [code, name, fee].filter(Boolean).join(' - ')
              })
              .join('\n')
          }

          // Khai báo rõ ràng biến lấy tên học kỳ từ exam.semester.name
          const semesterName = item.exam?.semester?.name || item.semester?.name || '---'

          const rowTotalFee = item.totalFee !== undefined ? Number(item.totalFee) : (item.totalPaid !== undefined ? Number(item.totalPaid) : 0)
          calculatedTotalAmount += rowTotalFee

          return {
            code: item.code || item.studentCode || item.maSv || '---',
            fullName: item.fullName || item.studentName || item.name || '---',
            
            registerStudentTerms: formattedTerms,
            
            'exam.code': item.exam?.code || item.examName || item.dotHocLai || '---',
            
            // Gán giá trị vào cột học kỳ
            registerSemesterTerms: semesterName,
            
            totalFee: rowTotalFee,
            phone: item.phone || item.phoneNumber || '---',
            
            'clazz.name': item.clazz?.name || item.className || '---',
            'course.name': item.course?.name || item.course || '---',
            'major.name': item.major?.name || item.major || '---',
            'clazz.trainingMethodName': item.clazz?.trainingMethodName || item.trainingType || '---',
            'clazz.trainingUnitName': item.clazz?.trainingUnitName || item.trainingLocation || '---',
            
            type: item.type || item.content || '---',
            dateFeePaid: item.dateFeePaid || item.createdTime || '---',
          }
        })

        this.totalRecord = 
          raw?.totalRecords || 
          raw?.data?.totalRecords || 
          raw?.total || 
          this.list.length

        this.totalAmount = 
          raw?.totalAmount || 
          raw?.data?.totalAmount || 
          calculatedTotalAmount

        this.totalPage = Math.ceil(this.totalRecord / this.itemsPerPage) || 1
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err)
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
      return `${Number(val).toLocaleString('en-US')}đ`
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

    async exportExcel() {
            try {
                this.loadingExport = true;
                
                // Nếu chưa chọn đợt học lại nào, tự động lấy tất cả ID nối bằng dấu phẩy
                if (!this.search.examIds || !this.search.examIds.length) {
                    const examIds = this.examList.map((item) => item.id).join(",");
                    const res = await feeTeacherByExamService.exportResult({
                        search: this.search.search || "",
                        fromTime: "",
                        toTime: "",
                        examIds,
                        channel: "CMS",
                    });
                    if (res.success || res?.data?.url) {
                        return this.$download(res?.data?.url || res?.url);
                    }
                }
                
                // Trường hợp có chọn đợt học lại cụ thể
                const examIds = Array.isArray(this.search.examIds) 
                    ? this.search.examIds.join(",") 
                    : this.search.examIds;
                    
                const res = await feeTeacherByExamService.exportResult({ 
                    search: this.search.search || "",
                    fromTime: "",
                    toTime: "",
                    examIds,
                    channel: "CMS",
                });
                
                if (res.success || res?.data?.url) {
                    this.$download(res?.data?.url || res?.url);
                }
            } catch (error) {
                console.error(error);
            } finally {
                this.loadingExport = false;
            }
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
    // Chuyển từ YYYY-MM-DD sang DD/MM/YYYY để hiển thị lên ô input
    formatDisplayDate(dateStr) {
      if (!dateStr) return ''
      if (dateStr.includes('/')) return dateStr
      const parts = dateStr.split('-')
      if (parts.length !== 3) return dateStr
      const [year, month, day] = parts
      return `${day}/${month}/${year}`
    },

    // Xử lý khi người dùng gõ hoặc thay đổi trực tiếp trên input
    onInputFromDate(val) {
      if (!val) {
        this.filters.fromTime = ''
        return
      }
      if (val.includes('/')) {
        const parts = val.split('/')
        if (parts.length === 3) {
          const [day, month, year] = parts
          this.filters.fromTime = `${year}-${month}-${day}`
        }
      } else {
        this.filters.fromTime = val
      }
    },

    onInputToDate(val) {
      if (!val) {
        this.filters.toTime = ''
        return
      }
      if (val.includes('/')) {
        const parts = val.split('/')
        if (parts.length === 3) {
          const [day, month, year] = parts
          this.filters.toTime = `${year}-${month}-${day}`
        }
      } else {
        this.filters.toTime = val
      }
    },

    formatDateTime(dateStr) {
      if (!dateStr) return '---'
      if (dateStr.includes('-')) {
        const [datePart, timePart] = dateStr.split(' ')
        const [year, month, day] = datePart.split('-')
        return timePart ? `${day}/${month}/${year} ${timePart}` : `${day}/${month}/${year}`
      }
      return dateStr
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