<template>
  <div class="teacher-fee-page d-flex flex-column pa-2 pa-sm-4 bg-white pb-12">
    <!-- 1. THANH TÌM KIẾM & BỘ LỌC PHÍA TRÊN -->
    <div class="top-filter-bar bg-white py-3 px-1">
      <div class="d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center gap-2 width-100 mb-2">
        <div class="text-subtitle-1 font-weight-bold">
          Danh sách giảng viên tổng hợp (<span class="red--text text--darken-2">{{ totalRecord }}</span>)
        </div>
        <div class="text-subtitle-2 font-weight-medium">
          Tổng tiền: <strong class="error--text">{{ formatCurrency(totalAmount) }}</strong>
        </div>
      </div>

      <div class="d-flex align-center gap-2 flex-wrap justify-end">
        <!-- GIẢNG VIÊN -->
        <v-select
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
        ></v-select>

        <!-- ĐỢT HỌC LẠI -->
        <v-select
          v-model="filters.examId"
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

        <!-- LỚP HỌC LẠI -->
        <v-select
          v-model="filters.retakeCourseId"
          :items="retakeCourseOptions"
          item-text="text"
          item-value="value"
          placeholder="Lớp học lại"
          outlined
          dense
          hide-details
          clearable
          :menu-props="{ attach: true, offsetY: true, zIndex: 999 }"
          class="bg-white filter-item select-md custom-outlined-input"
        ></v-select>

        <!-- TRẠNG THÁI -->
        <v-select
          v-model="filters.status"
          :items="statusOptions"
          item-text="text"
          item-value="value"
          placeholder="Trạng thái"
          outlined
          dense
          hide-details
          clearable
          :menu-props="{ attach: true, offsetY: true, zIndex: 999 }"
          class="bg-white filter-item select-sm custom-outlined-input"
        ></v-select>

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

        <!-- LOẠI LỚP -->
        <template #[`item.classType`]="{ item }">
          <v-chip 
            small 
            dark 
            :color="getClassTypeColor(item.classTypeCode)" 
            class="font-weight-medium text-caption rounded-pill px-3"
          >
            {{ getClassTypeName(item.classTypeCode) }}
          </v-chip>
        </template>

        <!-- TỔNG PHÍ & THUẾ THU NHẬP CÁ NHÂN -->
        <template #[`item.totalFee`]="{ item }">
          <span>{{ formatCurrency(item.totalFee) }}</span>
        </template>
        <template #[`item.tax`]="{ item }">
          <span>{{ formatCurrency(item.tax) }}</span>
        </template>

        <!-- FILE THÔNG TIN -->
        <template #[`item.fileInfo`]="{ item }">
          <v-btn 
            icon 
            small 
            :color="item.fileUrl ? '#a2212b' : 'grey lighten-1'" 
            :disabled="!item.fileUrl"
            @click="downloadFile(item)"
          >
            <v-icon size="26" :class="item.fileUrl ? '' : 'grey--text text--lighten-1'">
              mdi-file-download-outline
            </v-icon>
          </v-btn>
        </template>

        <!-- TRẠNG THÁI -->
        <template #[`item.status`]="{ item }">
          <v-chip 
            small 
            dark 
            :color="getStatusColor(item.statusCode)" 
            class="font-weight-medium text-caption"
          >
            {{ getStatusName(item.statusCode) }}
          </v-chip>
        </template>
      </BaseTable>
    </div>

    <!-- 3. THANH PHÂN TRANG & XUẤT DANH SÁCH -->
    <div
      class="bottom-bar d-flex align-center justify-space-between flex-nowrap py-2 px-3 mt-auto bg-white border-top"
    >
      <v-btn
        color="grey lighten-1"
        depressed
        disabled
        class="text-capitalize rounded px-4 font-weight-bold grey--text text--darken-2"
        style="background-color: #e0e0e0 !important; color: #9e9e9e !important;"
      >
        <v-icon left small color="#9e9e9e">mdi-export</v-icon> XUẤT DANH SÁCH CHO GIẢNG VIÊN
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
import decisionTeacherJobFeeServices from '~/services/re-learning/decisionTeacherJobFeeServices'

export default {
  name: 'DecisionTeacherJobFeeView',
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

      filters: {
        teacherId: null,
        examId: null,
        retakeCourseId: null,
        status: null,
      },
      appliedFilters: {
        teacherId: null,
        examId: null,
        retakeCourseId: null,
        status: null,
      },

      teacherList: [],
      examList: [],
      retakeCourseList: [],
      statusOptions: [
        { text: 'Chưa thanh toán', value: 'WAIT_PAID' },
        { text: 'Đã thanh toán', value: 'COMPLETE_PAID' },
      ],

      headers: [
        { value: "stt", text: "STT", align: "center", sortable: false, width: "60px" },
        { value: "teacherCode", text: "Mã giảng viên", align: "center", sortable: false, width: "130px" },
        { value: "teacherName", text: "Tên giảng viên", sortable: false, width: "160px" },
        { value: "retakeClassCode", text: "Mã lớp học lại", sortable: false, width: "150px" },
        { value: "classType", text: "Loại lớp", align: "center", sortable: false, width: "130px" },
        { value: "examCode", text: "Đợt học lại", sortable: false, width: "130px" },
        { value: "courseName", text: "Tên học phần", sortable: false, width: "220px" },
        { value: "totalFee", text: "Tổng phí", align: "right", sortable: false, width: "130px" },
        { value: "tax", text: "Thuế thu nhập cá nhân", align: "right", sortable: false, width: "150px" },
        { value: "fileInfo", text: "File thông tin", align: "center", sortable: false, width: "110px" },
        { value: "status", text: "Trạng thái", align: "center", sortable: false, width: "140px" },
      ],

      list: [],
    }
  },
  computed: {
    teacherOptions() {
      return (Array.isArray(this.teacherList) ? this.teacherList : []).map(t => ({
        text: `${t.code || ''} - ${t.fullName || t.name || ''}`,
        value: t.id || t.code,
      }))
    },
    examOptions() {
      return (Array.isArray(this.examList) ? this.examList : []).map(e => ({
        text: e.name || e.code,
        value: e.id || e.code,
      }))
    },
    retakeCourseOptions() {
      return (Array.isArray(this.retakeCourseList) ? this.retakeCourseList : []).map(r => ({
        text: r.name || r.code,
        value: r.id || r.code,
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
      this.$store.commit('SET_PAGE_TITLE', 'Danh sách giảng viên tổng hợp')
    }
    await Promise.all([
      this.fetchSupportingData(),
      this.fetchData(),
    ])
  },
  methods: {
    async fetchSupportingData() {
      try {
        const [teachersRes, examsRes, coursesRes] = await Promise.all([
          decisionTeacherJobFeeServices.getTeacherList({ status: 'ACTIVE', channel: 'CMS' }),
          decisionTeacherJobFeeServices.getAllExam({ channel: 'CMS' }),
          decisionTeacherJobFeeServices.getRetakeCourse({ pageSize: 100, pageIndex: 1, channel: 'CMS' }),
        ])

        const getArr = (res) => {
          const d = res?.data !== undefined ? res.data : res
          return d?.data || d?.items || (Array.isArray(d) ? d : [])
        }

        this.teacherList = getArr(teachersRes)
        this.examList = getArr(examsRes)
        this.retakeCourseList = getArr(coursesRes)
      } catch (err) {
        console.error('Lỗi tải dữ liệu danh mục phụ:', err)
      }
    },

    async fetchData() {
      try {
        this.isLoading = true
        this.errorAlert = null

        const selectedTeacher = this.appliedFilters.teacherId
        const selectedExam = this.appliedFilters.examId
        const selectedRetakeClass = this.appliedFilters.retakeCourseId
        const selectedStatus = this.appliedFilters.status

        const params = {
          pageIndex: this.page,
          pageSize: this.itemsPerPage,
          teacherId: selectedTeacher || undefined,
          examId: selectedExam || undefined,
          examSessionId: selectedRetakeClass || undefined,
          classId: selectedRetakeClass || undefined,
          status: selectedStatus || undefined,
          paymentFeeStatus: selectedStatus || undefined,
          paymentStatus: selectedStatus || undefined,
          channel: 'CMS',
        }

        const res = await decisionTeacherJobFeeServices.getByClass(params)
        const raw = res?.data !== undefined ? res.data : res

        let items = []
        if (Array.isArray(raw)) {
          items = raw
        } else if (Array.isArray(raw?.data)) {
          items = raw.data
        } else if (Array.isArray(raw?.items)) {
          items = raw.items
        } else if (raw?.data?.items && Array.isArray(raw.data.items)) {
          items = raw.data.items
        }

        let calculatedTotalAmount = 0

        this.list = items.map((item) => {
          const teacherObj = item.teacher || item.teacherDto || {}
          const courseObj = item.course || {}

          const teacherCode = item.code || teacherObj.code || item.teacherCode || '---'
          const teacherName = item.name || teacherObj.fullName || teacherObj.name || item.teacherName || '---'
          const classCode = item.classCode || item.retakeClassCode || item.code || '---'
          const examName = item.examName || item.exam?.code || '---'
          const courseName = courseObj.name || item.courseName || item.className || '---'

          const fee = item.amount !== undefined ? Number(item.amount) : (item.totalFee !== undefined ? Number(item.totalFee) : 0)
          calculatedTotalAmount += fee

          return {
            teacherCode,
            teacherName,
            retakeClassCode: classCode,
            classTypeCode: item.classType || 'COMBINE_CLASS',
            examCode: examName,
            courseName,
            totalFee: fee,
            tax: item.amountTax !== undefined ? Number(item.amountTax) : (item.tax !== undefined ? Number(item.tax) : 0),
            statusCode: item.paymentFeeStatus || item.status || 'WAIT_PAID',
            fileUrl: item.fileUrl || item.fileInform || null,
          }
        })

        this.totalRecord = raw?.totalRecords || raw?.data?.totalRecords || this.list.length
        this.totalAmount = raw?.totalAmount || raw?.data?.totalAmount || calculatedTotalAmount
      } catch (err) {
        console.error('Lỗi API:', err)
        const errorMessage = err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi tải dữ liệu'
        this.errorAlert = errorMessage
        this.list = []
        this.totalRecord = 0
        this.totalAmount = 0
      } finally {
        this.isLoading = false
      }
    },

    getClassTypeName(typeCode) {
      switch (typeCode) {
        case 'COMBINE_CLASS': return 'Lớp ghép'
        case 'NEW_CLASS': return 'Lớp mở'
        case 'PROJECT_BASED_CLASS': return 'Đồ án môn học'
        default: return typeCode || 'Lớp ghép'
      }
    },

    getClassTypeColor(typeCode) {
      switch (typeCode) {
        case 'COMBINE_CLASS': return '#616161'
        case 'NEW_CLASS': return '#2e7d32'
        case 'PROJECT_BASED_CLASS': return '#b71c1c'
        default: return '#616161'
      }
    },

    getStatusName(statusCode) {
      switch (statusCode) {
        case 'COMPLETE_PAID':
        case 'PAID': 
          return 'Đã thanh toán'
        case 'WAIT_PAID':
        case 'UNPAID': 
        default: 
          return 'Chưa thanh toán'
      }
    },

    getStatusColor(statusCode) {
      switch (statusCode) {
        case 'COMPLETE_PAID':
        case 'PAID': 
          return '#2e7d32'
        case 'WAIT_PAID':
        case 'UNPAID': 
        default: 
          return '#b71c1c'
      }
    },

    downloadFile(item) {
      if (item.fileUrl) {
        window.open(item.fileUrl, '_blank')
      }
    },

    search() {
      this.appliedFilters = { ...this.filters }
      this.page = 1
      this.pageInput = 1
      this.fetchData()
    },

    resetFilters() {
      this.filters = { teacherId: null, examId: null, retakeCourseId: null, status: null }
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

    exportExcel() {},
  },
}
</script>

<style scoped>
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.top-filter-bar { flex-shrink: 0; }
.filter-item { flex-grow: 1; flex-shrink: 1; }
.select-md { min-width: 160px; max-width: 200px; }
.select-sm { min-width: 140px; max-width: 180px; }
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
  .teacher-fee-page { height: auto; min-height: 100vh; overflow: visible; padding-bottom: 80px !important; }
}
@media (min-width: 600px) {
  .teacher-fee-page { height: calc(100vh - 64px); overflow: hidden; display: flex; flex-direction: column; }
}
</style>