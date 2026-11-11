<template>
  <div class="student-list-page pa-3 pa-md-4 bg-white">
    <!-- THÔNG TIN HỘI ĐỒNG VÀ THỜI GIAN BẢO VỆ -->
    <div class="d-flex align-center justify-space-between mb-4 flex-wrap pb-3 border-bottom" style="gap: 16px;">
      <div class="text-subtitle-1 font-weight-bold">
        Hội đồng: <span class="red--text">{{ examClassName }}</span>
      </div>
      <div class="text-subtitle-1 font-weight-bold">
        Thời gian bảo vệ: <span class="red--text">{{ examTime }}</span>
      </div>
    </div>

    <!-- KHUNG TIÊU ĐỀ HỒNG NHẠT -->
    <div class="px-4 py-3 mb-3 rounded" style="background-color: #fdf2f2; border: 1px solid #f5c6c6;">
      <div class="text-h6 font-weight-bold red--text text--darken-3">
        Danh sách sinh viên ({{ totalRecords }})
      </div>
    </div>

    <!-- THANH TÌM KIẾM -->
    <div class="d-flex align-center justify-end mb-3">
      <v-text-field
        v-model="searchKeyword"
        placeholder="Tìm kiếm"
        outlined
        dense
        hide-details
        clearable
        style="max-width: 350px;"
        @keyup.enter="loadStudentListData"
      >
        <template #append>
          <v-icon size="20">mdi-magnify</v-icon>
        </template>
      </v-text-field>
    </div>

    <!-- BẢNG HIỂN THỊ DỮ LIỆU SINH VIÊN -->
    <div class="table-scroll-container">
      <BaseTable
        :headers="headers"
        :items="studentList"
        :loading="loading"
        :current-page="currentPage"
        :items-per-page="itemsPerPage"
        :total-records="totalRecords"
        hide-default-footer
        @page-change="changePage"
      >
        <!-- Checkbox tổng ở Header -->
        <template #[`header.data-table-select`]>
          <v-checkbox
            :input-value="isAllSelected"
            :indeterminate="isIndeterminate"
            hide-details
            dense
            @change="handleSelectAll"
          ></v-checkbox>
        </template>

        <!-- Cột Checkbox chọn từng dòng -->
        <template #[`item.data-table-select`]="{ item }">
          <v-checkbox
            v-model="selectedItems"
            :value="item"
            hide-details
            dense
          ></v-checkbox>
        </template>

        <!-- STT -->
        <template #[`item.stt`]="{ index }">
          {{ (currentPage - 1) * itemsPerPage + index + 1 }}
        </template>

        <!-- Họ và tên -->
        <template #[`item.fullName`]="{ item }">
          <span class="font-weight-medium">
            {{ item.registerStudentExam?.fullName || item.name || '-' }}
          </span>
        </template>

        <!-- MSSV -->
        <template #[`item.studentCode`]="{ item }">
          <strong>
            {{ item.registerStudentExam?.studentCode || item.studentCode || '-' }}
          </strong>
        </template>

        <!-- Lớp SV -->
        <template #[`item.className`]="{ item }">
          <span>
            {{ item.registerStudentExam?.clazz?.name || '-' }}
          </span>
        </template>

        <!-- Cột Chức năng -->
        <template #[`item.actions`]="{ item }">
          <div class="d-flex align-center justify-center" style="gap: 4px;">
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-icon
                  color="green"
                  dark
                  v-bind="attrs"
                  @click="goToAssignTeacher(item)"
                  v-on="on"
                >
                  mdi-table-account
                </v-icon>
              </template>
              <span>Gán giảng viên</span>
            </v-tooltip>
          </div>
        </template>
      </BaseTable>
    </div>

    <!-- NÚT QUAY LẠI Ở GÓC DƯỚI BÊN PHẢI -->
    <div class="d-flex align-center justify-end mt-4 pt-3">
      <v-btn 
        outlined 
        color="grey darken-2" 
        class="text-none px-5" 
        height="38" 
        elevation="0" 
        @click="goBack"
      >
        <v-icon left small>mdi-arrow-left</v-icon> Quay Lại
      </v-btn>
    </div>
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import examSessionService from '~/services/redefend/examSessionService'

export default {
  name: 'ExamSessionStudentList',
  components: { BaseTable },
  data() {
    return {
      examSessionId: null,
      examClassName: '',
      examTime: '',
      searchKeyword: '',
      loading: false,
      allStudentList: [],
      studentList: [],
      selectedItems: [],
      totalRecords: 0,
      totalPages: 1,
      currentPage: 1,
      itemsPerPage: 50,
      headers: [
        { value: 'data-table-select', text: '', align: 'center', width: '50px', sortable: false },
        { value: 'stt', text: 'STT', align: 'center', width: '80px', sortable: false },
        { value: 'fullName', text: 'Họ và tên', align: 'left', minWidth: '200px', sortable: false },
        { value: 'studentCode', text: 'MSSV', align: 'left', width: '150px', sortable: false },
        { value: 'className', text: 'Lớp', align: 'left', width: '150px', sortable: false },
        { value: 'actions', text: 'Chức năng', align: 'center', width: '100px', sortable: false },
      ]
    }
  },
  computed: {
    isAllSelected() {
      if (this.studentList.length === 0) return false
      return this.studentList.every(item => this.selectedItems.includes(item))
    },
    isIndeterminate() {
      if (this.selectedItems.length === 0) return false
      const selectedInCurrentPage = this.studentList.filter(item => this.selectedItems.includes(item)).length
      return selectedInCurrentPage > 0 && !this.isAllSelected
    }
  },
  async mounted() {
    this.examSessionId = this.$route.params.id || this.$route.query.examSessionId
    if (this.examSessionId) {
      await this.loadStudentListData()
    }
  },
  methods: {
    async loadStudentListData() {
      this.loading = true
      try {
        const resSession = await examSessionService.getExamSessionDetail(this.examSessionId, 'CMS')
        const rawSession = resSession.data !== undefined ? resSession.data : resSession

        if (rawSession) {
          this.examClassName = rawSession.examClass || rawSession.name || ''
          
          if (rawSession.fromTime && rawSession.toTime) {
            const fTime = rawSession.fromTime.substring(11, 16) || '00:00'
            const fDate = rawSession.fromTime.substring(0, 10)
            const tTime = rawSession.toTime.substring(11, 16) || '00:01'
            const tDate = rawSession.toTime.substring(0, 10)
            this.examTime = `${fTime} ${fDate} - ${tTime} ${tDate}`
          } else {
            this.examTime = 'Chưa cập nhật'
          }

          const terms = Array.isArray(rawSession.studentTerms) ? rawSession.studentTerms : []
          
          if (this.searchKeyword) {
            const kw = this.searchKeyword.toLowerCase()
            this.allStudentList = terms.filter(item => {
              const name = (item.registerStudentExam?.fullName || item.name || '').toLowerCase()
              const code = (item.registerStudentExam?.studentCode || item.studentCode || '').toLowerCase()
              const clazz = (item.registerStudentExam?.clazz?.name || '').toLowerCase()
              return name.includes(kw) || code.includes(kw) || clazz.includes(kw)
            })
          } else {
            this.allStudentList = terms
          }

          this.totalRecords = this.allStudentList.length
          this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage) || 1

          const start = (this.currentPage - 1) * this.itemsPerPage
          const end = start + this.itemsPerPage
          this.studentList = this.allStudentList.slice(start, end)
        }
      } catch (error) {
        console.error('Lỗi tải danh sách sinh viên hội đồng:', error)
        this.studentList = []
        this.totalRecords = 0
      } finally {
        this.loading = false
      }
    },
    changePage(page) {
      if (page < 1 || page > this.totalPages) return
      this.currentPage = page
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      this.studentList = this.allStudentList.slice(start, end)
    },
    handleSelectAll(val) {
      if (val) {
        this.studentList.forEach(item => {
          if (!this.selectedItems.includes(item)) {
            this.selectedItems.push(item)
          }
        })
      } else {
        this.studentList.forEach(item => {
          const index = this.selectedItems.indexOf(item)
          if (index > -1) {
            this.selectedItems.splice(index, 1)
          }
        })
      }
    },
    goToAssignTeacher(item) {
      const studentId = item?.registerStudentExam?.studentId || item?.studentId || item?.id
      const examSessionId = this.examSessionId || item?.examSessionId

      this.$router.push({
        path: `/quan-ly-bao-ve-lai/danh-sach-hoi-dong/${studentId}/gan-giang-vien`,
        query: {
          examSessionId
        }
      })
    },
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>