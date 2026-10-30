<template>
  <div class="student-page d-flex flex-column pa-2 pa-sm-4 bg-white">
    <!-- 1. THANH TÌM KIẾM CỐ ĐỊNH PHÍA TRÊN -->
    <div class="top-filter-bar bg-white py-3 px-1">
      <div class="d-flex align-center justify-space-between flex-wrap gap-2 width-100">
        <div class="text-subtitle-1 font-weight-bold mr-2 text-no-wrap">
          Danh sách sinh viên chưa nộp tiền (<span class="red--text text--darken-2">{{ totalRecord }}</span>) 
          <span class="ml-2 font-weight-regular text-body-2">
            Tổng tiền chưa thu: <strong class="error--text">{{ formatCurrency(totalAmount) }}</strong>
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

    <!-- 2. BẢNG DỮ LIỆU CÓ THANH CUỘN NGANG -->
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
        <template #[`item.stt`]="{ index }">
          <span class="font-weight-medium">{{ (page - 1) * itemsPerPage + index + 1 }}</span>
        </template>

        <!-- HỌC PHẦN ĐĂNG KÝ XUỐNG DÒNG -->
        <template #[`item.registerStudentTerms`]="{ item }">
          <div style="white-space: pre-line; line-height: 1.6; padding: 4px 0;">
            {{ item.registerStudentTerms }}
          </div>
        </template>

        <!-- HỌC KỲ XUỐNG DÒNG -->
        <template #[`item.registerSemesterTerms`]="{ item }">
          <div style="white-space: pre-line; line-height: 1.6; padding: 4px 0;">
            {{ item.registerSemesterTerms }}
          </div>
        </template>

        <!-- SỐ TIỀN CHƯA THU (MÀU BÌNH THƯỜNG) -->
        <template #[`item.totalFee`]="{ item }">
          <span class="font-weight-medium">
            {{ formatCurrency(item.totalFee) }}
          </span>
        </template>

        <!-- NỘI DUNG THU HIỂN THỊ CHIP -->
        <template #[`item.type`]="{ item }">
          <v-chip small dark color="#1976d2" class="font-weight-medium text-caption">
            {{ item.type }}
          </v-chip>
        </template>

        <!-- THỜI GIAN ĐĂNG KÝ -->
        <template #[`item.dateFeePaid`]="{ item }">
          <span>{{ item.dateFeePaid && item.dateFeePaid !== '---' ? formatDateTime(item.dateFeePaid) : '---' }}</span>
        </template>
      </BaseTable>
    </div>

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
        <v-icon left small>mdi-microsoft-excel</v-icon> XUẤT FILE BÁO CÁO
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
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import reportResultNotPaidServices from '~/services/re-learning/reportResultNotPaidServices'

export default {
  name: 'ReportResultNotPaidView',
  components: { BaseTable },
  middleware: 'authenticated',
  data() {
    return {
      page: 1,
      pageInput: 1,
      itemsPerPage: 50,
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

      headers: [
        { value: "stt", text: "STT", align: "center", sortable: false, width: "60px" },
        { value: "code", text: "Mã số SV", align: "center", sortable: false, width: "130px" },
        { value: "fullName", text: "Họ tên SV", sortable: false, width: "160px" },
        { value: "registerStudentTerms", text: "Học phần đăng ký", sortable: false, width: "380px", align: "left" },
        { value: "registerSemesterTerms", text: "Học kỳ", sortable: false, width: "110px", align: "center" },
        { value: "phone", text: "Số điện thoại", sortable: false, width: "130px" },
        { value: "clazz.name", text: "Lớp", align: "center", sortable: false, width: "150px" },
        { value: "course.name", text: "Khóa", align: "center", sortable: false, width: "100px" },
        { value: "major.name", text: "Ngành", align: "center", sortable: false, width: "150px" },
        { value: "clazz.trainingMethodName", text: "Hình thức đào tạo", align: "center", sortable: false, width: "140px" },
        { value: "clazz.trainingUnitName", text: "Địa điểm đào tạo", align: "center", sortable: false, width: "150px" },
        { value: "type", text: "Nội dung thu", align: "center", sortable: false, width: "120px" },
        { value: "dateFeePaid", text: "Thời gian đăng ký", align: "center", sortable: false, width: "160px" },
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
        value: item.id || item.code,
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
      this.$store.commit('SET_PAGE_TITLE', 'Danh sách sinh viên chưa nộp tiền')
    }
    await Promise.all([
      this.fetchExamList(),
      this.fetchData(),
      this.fetchUserInfoAndRole(),
    ])
  },
  methods: {
    async fetchExamList() {
      try {
        const res = await reportResultNotPaidServices.getRetakeSession({ status: 'ACTIVE', channel: 'CMS' })
        const data = res?.data !== undefined ? res.data : res
        this.examList = data?.data || data?.items || (Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Lỗi tải đợt học lại:', err)
      }
    },

    async fetchUserInfoAndRole() {
      try {
        // Tích hợp gọi các API phụ như bạn đã cung cấp
        await Promise.all([
          reportResultNotPaidServices.getUserInfo({ channel: 'CMS' }),
          reportResultNotPaidServices.getPageRole({ channel: 'CMS' }),
        ])
      } catch (err) {
        console.error('Lỗi tải thông tin phụ:', err)
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
          fromTime: this.appliedFilters.fromTime ? `${this.appliedFilters.fromTime}` : undefined,
          toTime: this.appliedFilters.toTime ? `${this.appliedFilters.toTime}` : undefined,
          channel: 'CMS',
        }

        const res = await reportResultNotPaidServices.getResultNotPaid(params)
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
          let formattedSemesters = '---'
          const termsArray = item.registerStudentTerms || []
          
          if (Array.isArray(termsArray) && termsArray.length > 0) {
            formattedTerms = termsArray
              .map((itemTerm) => {
                const target = itemTerm.term || itemTerm
                const code = target.code || ''
                const name = target.name || ''
                
                // Lấy chính xác trường totalFee để hiển thị tiền phía sau học phần
                const totalFeeVal = itemTerm.totalFee !== undefined ? Number(itemTerm.totalFee) : (target.totalFee !== undefined ? Number(target.totalFee) : 0)
                const feeStr = totalFeeVal.toLocaleString('en-US') + 'đ'
                
                return [code, name, `(${feeStr})`].filter(Boolean).join(' - ')
              })
              .join('\n')

            formattedSemesters = termsArray
              .map((itemTerm) => {
                return itemTerm.semester?.code || itemTerm.semester?.name || item.exam?.semester?.name || '20261'
              })
              .join('\n')
          } else {
            formattedSemesters = item.exam?.semester?.name || item.semester?.name || '---'
          }

          // Lấy trực tiếp totalFee từ bản ghi sinh viên để cộng dồn vào tổng tiền chưa thu của toàn trang
          const rowTotalFee = item.totalFee !== undefined ? Number(item.totalFee) : 0
          calculatedTotalAmount += rowTotalFee

          return {
            code: item.code || item.studentCode || item.maSv || '---',
            fullName: item.fullName || item.studentName || item.name || '---',
            registerStudentTerms: formattedTerms,
            registerSemesterTerms: formattedSemesters,
            phone: item.phone || item.phoneNumber || '---',
            'clazz.name': item.clazz?.name || item.className || '---',
            'course.name': item.course?.name || item.course || '---',
            'major.name': item.major?.name || item.major || '---',
            'clazz.trainingMethodName': item.clazz?.trainingMethodName || item.trainingType || '---',
            'clazz.trainingUnitName': item.clazz?.trainingUnitName || item.trainingLocation || '---',
            type: item.type === 'RETAKE_COURSES' ? 'Học lại' : (item.type || item.content || 'Học lại'),
            dateFeePaid: item.createTime || item.dateFeePaid || '---',
          }
        })

        this.totalRecord = 
          raw?.totalRecords || 
          raw?.data?.totalRecords || 
          raw?.total || 
          this.list.length

        // Lấy trực tiếp từ API nếu backend có trả về tổng tiền toàn cục
        this.totalAmount = 
          raw?.totalAmount || 
          raw?.data?.totalAmount || 
          raw?.result?.totalAmount || 
          calculatedTotalAmount

        this.totalPage = Math.ceil(this.totalRecord / this.itemsPerPage) || 1
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu sinh viên chưa nộp tiền:', err)
        this.list = []
        this.totalRecord = 0
        this.totalAmount = 0
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

    formatDisplayDate(dateStr) {
      if (!dateStr) return ''
      if (dateStr.includes('/')) return dateStr
      const parts = dateStr.split('-')
      if (parts.length !== 3) return dateStr
      const [year, month, day] = parts
      return `${day}/${month}/${year}`
    },

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

    async exportExcel() {
      try {
        this.isLoading = true
        const params = {
          search: this.appliedFilters.search || undefined,
          examIds: this.appliedFilters.examIds || undefined,
          fromTime: this.appliedFilters.fromTime ? `${this.appliedFilters.fromTime}` : undefined,
          toTime: this.appliedFilters.toTime ? `${this.appliedFilters.toTime}` : undefined,
          channel: 'CMS',
        }

        const response = await reportResultNotPaidServices.exportResultNotPaid(params)
        
        // Tạo đường dẫn ẩn để tải file về trình duyệt
        const blob = new Blob([response.data || response], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        })
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        
        // Đặt tên file tải về (có thể tùy chỉnh thêm đuôi .xlsx)
        link.download = `Danh_Sach_Sinh_Vien_Chua_Nop_Tien_${new Date().toISOString().slice(0, 10)}.xlsx`
        link.click()
        
        window.URL.revokeObjectURL(link.href)
      } catch (err) {
        console.error('Lỗi khi xuất file báo cáo:', err)
        // Hiển thị thông báo lỗi nếu cần
      } finally {
        this.isLoading = false
      }
    },
  },
}
</script>

<style scoped>
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.top-filter-bar { flex-shrink: 0; }
.filter-item { flex-grow: 1; flex-shrink: 1; }
.search-input { min-width: 180px; max-width: 240px; }
.select-md { min-width: 150px; max-width: 190px; }
.date-input { min-width: 140px; max-width: 170px; }
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