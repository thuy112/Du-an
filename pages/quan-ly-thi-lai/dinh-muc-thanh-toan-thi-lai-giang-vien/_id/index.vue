<template>
  <div class="result-management-page pa-3 pa-md-4 bg-white" :class="{ 'is-mobile-device': isMobileDevice }">
    <!-- TIÊU ĐỀ TRANG -->
    <div class="d-flex align-center justify-between mb-3">
      <div class="text-h6 font-weight-bold black--text">
        Danh sách thống kê lượt thanh toán cho GV (<span class="text-red-bold">{{ totalRecords }}</span>)
      </div>
    </div>

    <!-- BỘ LỌC TÌM KIẾM CỐ ĐỊNH PHÍA TRÊN -->
    <div class="filter-container mb-3 sticky-filter">
      <div class="d-flex align-center flex-wrap justify-space-between" style="gap: 8px; padding: 6px;">
        <div class="d-flex align-center flex-wrap flex-grow-1" style="gap: 8px;">
          <!-- Kỳ thi -->
          <v-select
            v-model="filters.examId"
            :items="examList"
            item-text="displayName"
            item-value="id"
            label="Kỳ thi"
            outlined
            dense
            hide-details
            clearable
            class="filter-input"
            style="min-width: 170px;"
            @change="handleExamChange"
          ></v-select>

          <!-- Lớp thi lại -->
          <v-select
            v-model="filters.classRoomId"
            :items="classRoomList"
            item-text="displayName"
            item-value="id"
            label="Lớp thi lại"
            outlined
            dense
            hide-details
            clearable
            class="filter-input"
            style="min-width: 170px;"
            :no-data-text="!filters.examId ? 'Vui lòng chọn kỳ thi trước' : 'Vui lòng chọn kỳ thi trước'"
            @click.native="checkExamBeforeClick"
          ></v-select>

          <!-- Giảng viên -->
          <v-select
            v-model="filters.teacherId"
            :items="teacherList"
            item-text="displayName"
            item-value="id"
            label="Giảng viên"
            outlined
            dense
            hide-details
            clearable
            class="filter-input"
            style="min-width: 180px;"
          ></v-select>

          <!-- Nút thao tác (Làm mới, Tìm kiếm, Thêm mới) -->
          <div class="d-flex align-center" style="gap: 5px;">
            <v-btn icon color="#A62229" @click="refreshData" title="Làm mới">
              <v-icon size="24">mdi-refresh</v-icon>
            </v-btn>

            <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="handleSearch" title="Tìm kiếm">
              <v-icon size="24">mdi-magnify</v-icon>
            </v-btn>

            <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="handleAddNew" title="Thêm mới">
              <v-icon size="24">mdi-plus</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- KHUNG BASETABLE HIỂN THỊ DỮ LIỆU -->
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
          <div class="text-center">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</div>
        </template>

        <!-- Tên giảng viên -->
        <template #[`item.teacherName`]="{ item }">
          <span class="font-weight-medium">{{ item.teacherName || item.name || '-' }}</span>
        </template>

        <!-- Lớp thi - môn học -->
        <template #[`item.className`]="{ item }">
          <span>{{ item.className || item.subjectName || '-' }}</span>
        </template>

        <!-- Ra đề -->
        <template #[`item.examPreparationFee`]="{ item }">
          <div class="text-center">{{ item.examPreparationFee || item.raDe || 0 }}</div>
        </template>

        <!-- Chấm bài -->
        <template #[`item.gradingFee`]="{ item }">
          <div class="text-center">{{ item.gradingFee || item.chamBai || 0 }}</div>
        </template>

        <!-- Trông thi -->
        <template #[`item.proctoringFee`]="{ item }">
          <div class="text-center">{{ item.proctoringFee || item.trongThi || 0 }}</div>
        </template>

        <!-- Đi lại -->
        <template #[`item.travelExpenses`]="{ item }">
          <div class="text-center">{{ item.travelExpenses || item.diLai || 0 }}</div>
        </template>

        <!-- TTTN -->
        <template #[`item.graduationInternFee`]="{ item }">
          <div class="text-center">{{ item.graduationInternFee || item.tttn || 0 }}</div>
        </template>

        <!-- Tổng phí -->
        <template #[`item.totalFee`]="{ item }">
          <div class="text-center font-weight-bold">{{ item.totalFee || 0 }}</div>
        </template>

        <!-- Thành tiền -->
        <template #[`item.amount`]="{ item }">
          <div class="text-center font-weight-bold red--text text--darken-3">{{ item.amount || 0 }}</div>
        </template>

        <!-- Chức năng -->
        <template #[`item.actions`]>
          <div class="text-center"></div>
        </template>
      </BaseTable>
    </div>

    <!-- THANH PHÂN TRANG PHÍA DƯỚI -->
    <div class="pagination-bottom-container mt-4 pt-3 d-flex align-center justify-end flex-wrap gap-3 sticky-bottom-bar border-top">
      <div class="d-flex align-center custom-pagination-group" style="gap: 8px;">
        <v-select
          v-model="itemsPerPage"
          :items="[5, 10, 20, 50, 100]"
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
          <v-btn color="#A2212B" dark depressed class="text-none px-3" height="36" @click="goToPage">
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
              :color="p === currentPage ? '#A2212B' : 'grey lighten-2'"
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

    <!-- DIALOG THÊM MỚI (CHỌN CÔNG TÁC PHÍ CHO GV) -->
    <v-dialog v-model="addDialogVisible" max-width="750px" persistent>
      <v-card class="rounded-lg">
        <!-- Header đỏ chuẩn -->
        <v-card-title class="red-dialog-header white--text py-3 px-4 d-flex justify-space-between align-center">
          <span class="text-h6 font-weight-bold">Chọn công tác phí cho GV</span>
          <v-btn icon dark @click="addDialogVisible = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-4">
          <v-row>
            <!-- Giảng viên -->
            <v-col cols="12">
              <v-select
                v-model="formAdd.teacherId"
                :items="teacherList"
                item-text="displayName"
                item-value="id"
                label="Giảng viên (*)"
                outlined
                dense
                clearable
              ></v-select>
            </v-col>

            <!-- Kỳ thi -->
            <v-col cols="12">
              <v-select
                v-model="formAdd.examId"
                :items="examList"
                item-text="displayName"
                item-value="id"
                label="Kỳ thi (*)"
                outlined
                dense
                clearable
                @change="handleDialogExamChange"
              ></v-select>
            </v-col>

            <!-- Lớp thi -->
            <v-col cols="12">
              <v-select
                v-model="formAdd.classRoomId"
                :items="dialogClassList"
                item-text="displayName"
                item-value="id"
                label="Lớp thi"
                outlined
                dense
                clearable
                :no-data-text="!formAdd.examId ? 'Không có lớp thi' : 'Không có lớp thi'"
                @change="handleDialogClassChange"
              ></v-select>
            </v-col>
          </v-row>

          <!-- Bảng danh sách chọn công tác phí (Đã tinh chỉnh đúng 4 cột theo yêu cầu) -->
          <v-card outlined class="mt-2">
            <v-simple-table dense>
              <template v-slot:default>
                <thead>
                  <tr class="grey lighten-4">
                    <th class="text-center font-weight-bold" style="width: 60px;">STT</th>
                    <th class="text-left font-weight-bold">Lớp thi – môn học</th>
                    <th class="text-left font-weight-bold">Công tác phí</th>
                    <th class="text-center font-weight-bold" style="width: 100px;">Chức năng</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="dialogItemList.length > 0">
                    <tr v-for="(item, idx) in dialogItemList" :key="item.id || idx">
                      <td class="text-center">{{ idx + 1 }}</td>
                      <td>{{ item.displayName || item.name || '-' }}</td>
                      <td></td>
                      <td class="text-center"></td>
                    </tr>
                  </template>
                  <template v-else>
                    <tr>
                      <td colspan="4" class="text-center py-6 grey--text">Không có lớp thi</td>
                    </tr>
                  </template>
                </tbody>
              </template>
            </v-simple-table>
          </v-card>
        </v-card-text>

        <v-divider></v-divider>

        <!-- Footer Dialog -->
        <v-card-actions class="px-4 py-3 justify-end" style="gap: 8px;">
          <v-btn text class="text-none" @click="addDialogVisible = false">
            Đóng <v-icon right small>mdi-close</v-icon>
          </v-btn>
          <v-btn color="#A62229" dark class="text-none px-4" elevation="0" @click="saveNewData">
            Lưu <v-icon right small>mdi-content-save</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import detailService from '~/services/decisionTeacherJobFeeDetailService'

export default {
  name: 'DecisionTeacherJobFeeDetailByExamPage',
  components: {
    BaseTable,
  },
  data() {
    return {
      isMobileDevice: false,
      loading: false,
      filters: {
        examId: null,
        classRoomId: null,
        teacherId: null,
      },
      activeFilters: {
        examId: null,
        classRoomId: null,
        teacherId: null,
      },
      examList: [],
      classRoomList: [],
      teacherList: [],

      itemList: [],
      totalRecords: 0,
      totalPages: 1,
      currentPage: 1,
      pageInput: 1,
      itemsPerPage: 50,
      decisionInfo: null,

      // State cho Dialog Thêm mới
      addDialogVisible: false,
      formAdd: {
        teacherId: null,
        examId: null,
        classRoomId: null,
      },
      dialogClassList: [],
      dialogItemList: [],

      tableHeaders: [
        { value: 'stt', text: 'STT', align: 'center', width: '60px', sortable: false },
        { value: 'teacherName', text: 'Tên giảng viên', align: 'left', minWidth: '160px', sortable: false },
        { value: 'className', text: 'Lớp thi - môn học', align: 'left', minWidth: '160px', sortable: false },
        { value: 'examPreparationFee', text: 'Ra đề', align: 'center', width: '90px', sortable: false },
        { value: 'gradingFee', text: 'Chấm bài', align: 'center', width: '90px', sortable: false },
        { value: 'proctoringFee', text: 'Trông thi', align: 'center', width: '90px', sortable: false },
        { value: 'travelExpenses', text: 'Đi lại', align: 'center', width: '90px', sortable: false },
        { value: 'graduationInternFee', text: 'TTTN', align: 'center', width: '90px', sortable: false },
        { value: 'totalFee', text: 'Tổng phí', align: 'center', width: '110px', sortable: false },
        { value: 'amount', text: 'Thành tiền', align: 'center', width: '120px', sortable: false },
        { value: 'actions', text: 'Chức năng', align: 'center', width: '100px', sortable: false },
      ],
    }
  },
  computed: {
    recordId() {
      return this.$route.params.id
    },
  },
  async mounted() {
    if (typeof navigator !== 'undefined') {
      this.isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }
    await this.initPageData()
    await this.loadData()
  },
  methods: {
    extractValue(val) {
      if (val === null || val === undefined || val === '') return ''
      if (typeof val === 'object') {
        return val.value !== undefined ? val.value : (val.id !== undefined ? val.id : (val.code !== undefined ? val.code : ''))
      }
      return val
    },

    handleSearch() {
      this.activeFilters = {
        examId: this.extractValue(this.filters.examId),
        classRoomId: this.extractValue(this.filters.classRoomId),
        teacherId: this.extractValue(this.filters.teacherId),
      }
      this.currentPage = 1
      this.pageInput = 1
      this.loadData()
    },

    refreshData() {
      if (this.examList.length > 0) {
        this.filters.examId = this.examList[0].id
        this.handleExamChange(this.filters.examId)
      } else {
        this.filters.examId = null
      }
      this.filters.classRoomId = null
      this.filters.teacherId = null

      this.activeFilters = {
        examId: this.extractValue(this.filters.examId),
        classRoomId: '',
        teacherId: '',
      }
      this.currentPage = 1
      this.pageInput = 1
      this.loadData()
    },

    handleAddNew() {
      this.formAdd = {
        teacherId: null,
        examId: this.filters.examId || (this.examList.length > 0 ? this.examList[0].id : null),
        classRoomId: null,
      }
      this.dialogClassList = [...this.classRoomList]
      this.dialogItemList = []
      this.addDialogVisible = true
    },

    async handleDialogExamChange(examId) {
      this.formAdd.classRoomId = null
      this.dialogClassList = []
      this.dialogItemList = []

      if (!examId) return

      try {
        const res = await detailService.getExamSessionList({ examId, channel: 'CMS' })
        if (res) {
          const rawData = res.data !== undefined ? res.data : res
          const listR = Array.isArray(rawData) ? rawData : (rawData.data || rawData.content || rawData.items || [])
          this.dialogClassList = listR.map(item => ({
            ...item,
            displayName: item.name || item.title || item.className || `Lớp ${item.id}`
          }))
        }
      } catch (error) {
        console.error('Lỗi tải danh sách lớp trong dialog:', error)
        this.dialogClassList = []
      }
    },

    handleDialogClassChange(classId) {
      if (!classId) {
        this.dialogItemList = []
        return
      }
      const selectedClass = this.dialogClassList.find(item => item.id === classId)
      if (selectedClass) {
        this.dialogItemList = [selectedClass]
      }
    },

    saveNewData() {
      this.addDialogVisible = false
      this.loadData()
    },

    async loadData() {
      this.loading = true
      try {
        const baseParams = {
          pageIndex: this.currentPage,
          pageSize: this.itemsPerPage,
          decisionTeacherJobFeeId: this.recordId,
          channel: 'CMS',
        }

        if (this.activeFilters.examId !== '') baseParams.examId = this.activeFilters.examId
        if (this.activeFilters.classRoomId !== '') baseParams.classRoomId = this.activeFilters.classRoomId
        if (this.activeFilters.teacherId !== '') baseParams.teacherId = this.activeFilters.teacherId

        const res = await detailService.getPerformance(baseParams)
        if (res) {
          const rootData = res.data !== undefined ? res.data : res
          const allItems = Array.isArray(rootData) ? rootData : (rootData.data || rootData.content || rootData.items || [])
          
          const rawTotal = rootData.totalElements ?? rootData.totalRecords ?? rootData.total ?? (res.totalElements || res.totalRecords || res.total)
          this.totalRecords = rawTotal !== undefined ? Number(rawTotal) : allItems.length

          this.itemList = allItems
          this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage) || 1
        }
      } catch (error) {
        console.error('Lỗi tải bảng thống kê thanh toán:', error)
        this.itemList = []
        this.totalRecords = 0
        this.totalPages = 1
      } finally {
        this.loading = false
      }
    },

    changePage(page) {
      if (page < 1 || page > this.totalPages) return
      this.currentPage = page
      this.pageInput = page
      this.loadData()
    },

    goToPage() {
      const page = parseInt(this.pageInput)
      if (page >= 1 && page <= this.totalPages) {
        this.changePage(page)
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

    async initPageData() {
      try {
        const resDetail = await detailService.getDetail(this.recordId, 'CMS')
        this.decisionInfo = resDetail?.data || resDetail

        const resExam = await detailService.getExamList1({ status: 'ACTIVE', channel: 'CMS' })
        if (resExam) {
          const rawE = resExam.data !== undefined ? resExam.data : resExam
          const listE = Array.isArray(rawE) ? rawE : (rawE.data || rawE.content || rawE.items || [])
          this.examList = listE.map(item => ({
            ...item,
            displayName: item.name || item.title || item.examName || `Kỳ thi ${item.id}`
          }))

          if (this.examList.length > 0 && !this.filters.examId) {
            this.filters.examId = this.examList[0].id
            await this.handleExamChange(this.filters.examId)
          }
        }

        const resTeacher = await detailService.getTeacherList({ status: 'ACTIVE', channel: 'CMS' })
        if (resTeacher) {
          const rawT = resTeacher.data !== undefined ? resTeacher.data : resTeacher
          const listT = Array.isArray(rawT) ? rawT : (rawT.data || rawT.content || rawT.items || [])
          this.teacherList = listT.map(item => ({
            ...item,
            displayName: item.name || item.fullName || item.username || `Giảng viên ${item.id}`
          }))
        }
      } catch (error) {
        console.error('Lỗi khởi tạo dữ liệu trang:', error)
      }
    },

    async handleExamChange(examId) {
      this.filters.classRoomId = null
      this.classRoomList = []

      this.activeFilters.examId = this.extractValue(examId)
      this.activeFilters.classRoomId = ''

      if (!examId) return

      try {
        const res = await detailService.getExamSessionList({ examId, channel: 'CMS' })
        if (res) {
          const rawData = res.data !== undefined ? res.data : res
          const listR = Array.isArray(rawData) ? rawData : (rawData.data || rawData.content || rawData.items || [])
          this.classRoomList = listR.map(item => ({
            ...item,
            displayName: item.name || item.title || item.className || `Lớp ${item.id}`
          }))
        }
      } catch (error) {
        console.error('Lỗi tải danh sách lớp thi lại:', error)
        this.classRoomList = []
      }

      this.currentPage = 1
      this.pageInput = 1
      this.loadData()
    },

    checkExamBeforeClick() {
      if (!this.filters.examId) {
        this.classRoomList = []
      }
    },
  },
}
</script>

<style scoped>
.filter-container {
  background-color: #fff;
}

.sticky-filter {
  position: sticky;
  top: 0;
  z-index: 2;
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

.red-dialog-header {
  background-color: #A62229 !important;
}
</style>