<template>
  <div class="score-board-page pa-3 pa-md-4 bg-white">
    <!-- TIÊU ĐỀ VÀ THANH CÔNG CỤ -->
    <div class="d-flex align-center justify-space-between mb-3 flex-wrap" style="gap: 8px;">
      <div class="text-h6 font-weight-bold black--text">
        Bảng điểm hội đồng bảo vệ: <span class="red--text">{{ examClassName }}</span> (<span class="text-red-bold">{{ totalRecords }}</span>)
      </div>

      <div class="d-flex align-center" style="gap: 8px;">
        <v-text-field
          v-model="searchKeyword"
          placeholder="Sinh viên"
          outlined
          dense
          hide-details
          clearable
          style="width: 200px;"
          @keyup.enter="loadScoreBoardData"
        ></v-text-field>

        <v-btn icon color="#A62229" @click="loadScoreBoardData" title="Làm mới">
          <v-icon size="24">mdi-refresh</v-icon>
        </v-btn>

        <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="loadScoreBoardData" title="Tìm kiếm">
          <v-icon size="24">mdi-magnify</v-icon>
        </v-btn>

        <!-- CHỈ HIỆN NÚT (+) VÀ NÚT CAM KHI CHƯA DUYỆT -->
        <template v-if="!isApproved">
          <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="openAddScoreModal" title="Thêm mới">
            <v-icon size="24">mdi-plus</v-icon>
          </v-btn>

          <v-btn color="orange" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="handleApproveScores" title="Duyệt điểm">
            <v-icon size="24">mdi-checkbox-marked-circle-plus-outline</v-icon>
          </v-btn>
        </template>
      </div>
    </div>

    <!-- BẢNG HIỂN THỊ DỮ LIỆU -->
    <div class="table-scroll-container">
      <BaseTable
        :headers="dynamicHeaders"
        :items="scoreItemList"
        :loading="loading"
        :current-page="currentPage"
        :items-per-page="itemsPerPage"
        :total-records="totalRecords"
        hide-default-footer
        @page-change="changePage"
      >
        <!-- Mã số sinh viên -->
        <template #[`item.studentCode`]="{ item }">
          <strong>{{ item.code || item.studentCode || (item.student ? item.student.code : '-') }}</strong>
        </template>

        <!-- Họ và tên -->
        <template #[`item.fullName`]="{ item }">
          <span class="font-weight-medium">{{ item.name || item.fullName || (item.student ? item.student.name : '-') }}</span>
        </template>

        <!-- Lớp SV (Lấy từ classesCode) -->
        <template #[`item.className`]="{ item }">
          <span>{{ item.classesCode || (item.student ? item.student.classesCode : '-') }}</span>
        </template>

        <!-- Điểm -->
        <template #[`item.score`]="{ item }">
          <span class="font-weight-bold">{{ item.score !== undefined && item.score !== null ? item.score : '-' }}</span>
        </template>

        <!-- Ghi chú (Lấy từ notes hoặc note) -->
        <template #[`item.note`]="{ item }">
          <span>{{ item.notes || item.note || '-' }}</span>
        </template>

        <!-- Trạng thái (Sử dụng closeStatusList) -->
        <template #[`item.status`]="{ item }">
          <v-chip small dark :color="getScoreStatusColor(item.scoreStatus)">
            {{ getScoreStatusText(item.scoreStatus) }}
          </v-chip>
        </template>

        <!-- Cột Chức năng (Chỉ hiện khi chưa duyệt) -->
        <template v-if="!isApproved" #[`item.actions`]="{ item }">
          <div class="d-flex align-center justify-center" style="gap: 4px;">
            <v-btn icon small color="warning" @click="openEditScoreModal(item)" title="Sửa">
              <v-icon small>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon small color="error" @click="handleDeleteScore(item)" title="Xóa">
              <v-icon small>mdi-delete</v-icon>
            </v-btn>
          </div>
        </template>
      </BaseTable>
    </div>

    <!-- THANH PHÂN TRANG & NÚT IMPORT (MÀU XÁM KHI ĐÃ CÓ ĐIỂM) -->
    <div class="d-flex align-center justify-space-between mt-4 flex-wrap gap-3 pt-3 border-top">
      <v-btn 
        color="#4caf50" 
        :disabled="isApproved" 
        dark 
        class="text-none px-4" 
        height="38" 
        elevation="0" 
        @click="openImportScoreModal"
      >
        <v-icon left small>mdi-microsoft-excel</v-icon> Import bảng điểm
      </v-btn>

      <div class="d-flex align-center custom-pagination-group" style="gap: 8px;">
        <v-select
          v-model="itemsPerPage"
          :items="[10, 20, 50, 100]"
          label="Bản ghi"
          outlined
          dense
          hide-details
          style="width: 90px;"
          @change="handleItemsPerPageChange"
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
          <v-btn color="#A62229" dark depressed class="text-none px-3" height="36" @click="goToPage">
            Đi
          </v-btn>
        </div>

        <v-btn icon outlined small color="grey" :disabled="currentPage <= 1" @click="changePage(currentPage - 1)">
          <v-icon small>mdi-chevron-left</v-icon>
        </v-btn>

        <div class="d-flex align-center font-weight-bold px-2">
          {{ currentPage }}
        </div>

        <v-btn icon outlined small color="grey" :disabled="currentPage >= totalPages" @click="changePage(currentPage + 1)">
          <v-icon small>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import examSessionService from '~/services/redefend/examSessionService'
import { closeStatusList } from "~/consts/list"

export default {
  name: 'ScoreBoardDetail',
  components: { BaseTable },
  data() {
    return {
      examSessionId: null,
      examClassName: '',
      searchKeyword: '',
      loading: false,
      scoreItemList: [],
      totalRecords: 0,
      totalPages: 1,
      currentPage: 1,
      pageInput: 1,
      itemsPerPage: 50,
      closeStatusList,
    }
  },
  computed: {
    isApproved() {
      if (!this.scoreItemList || this.scoreItemList.length === 0) return false
      return this.scoreItemList.every(item => this.isItemApproved(item))
    },
    dynamicHeaders() {
      const headers = [
        { value: 'studentCode', text: 'Mã số sinh viên', align: 'left', width: '150px', sortable: false },
        { value: 'fullName', text: 'Họ và tên', align: 'left', minWidth: '180px', sortable: false },
        { value: 'className', text: 'Lớp SV', align: 'left', width: '130px', sortable: false },
        { value: 'score', text: 'Điểm', align: 'center', width: '100px', sortable: false },
        { value: 'note', text: 'Ghi chú', align: 'left', width: '150px', sortable: false },
        { value: 'status', text: 'Trạng thái', align: 'center', width: '130px', sortable: false },
      ]
      if (!this.isApproved) {
        headers.push({ value: 'actions', text: 'Chức năng', align: 'center', width: '100px', sortable: false })
      }
      return headers
    }
  },
  async mounted() {
    this.examSessionId = this.$route.params.id
    if (this.examSessionId) {
      await this.loadScoreBoardData()
    }
  },
  methods: {
    getScoreStatusText(status) {
      const found = closeStatusList.find(item => item.value === status)
      return found ? found.text : (status || 'Chưa duyệt')
    },
    getScoreStatusColor(status) {
      const found = closeStatusList.find(item => item.value === status)
      return found ? found.color : 'warning'
    },
    isItemApproved(item) {
      const st = item.scoreStatus || item.status || ''
      return st === 'CLOSED' || st === 'APPROVED' || st === 'Đã duyệt'
    },
    async loadScoreBoardData() {
      this.loading = true
      try {
        const [resResult, resSession] = await Promise.all([
          examSessionService.getResultList({
            pageIndex: this.currentPage,
            pageSize: this.itemsPerPage,
            examSessionId: this.examSessionId,
            fullName: this.searchKeyword || '',
            channel: 'CMS'
          }),
          examSessionService.getExamSessionDetail(this.examSessionId, 'CMS')
        ])

        const rawResult = resResult.data !== undefined ? resResult.data : resResult
        this.scoreItemList = Array.isArray(rawResult) ? rawResult : (rawResult.data || rawResult.content || [])
        this.totalRecords = rawResult.totalElements ?? rawResult.totalRecords ?? this.scoreItemList.length
        this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage) || 1

        const rawSession = resSession.data !== undefined ? resSession.data : resSession
        if (rawSession && rawSession.examClass) {
          this.examClassName = rawSession.examClass
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu bảng điểm:', error)
        this.scoreItemList = []
        this.totalRecords = 0
      } finally {
        this.loading = false
      }
    },
    changePage(page) {
      if (page < 1 || page > this.totalPages) return
      this.currentPage = page
      this.pageInput = page
      this.loadScoreBoardData()
    },
    goToPage() {
      const p = parseInt(this.pageInput)
      if (p >= 1 && p <= this.totalPages) {
        this.changePage(p)
      } else {
        this.pageInput = this.currentPage
      }
    },
    handleItemsPerPageChange(size) {
      this.itemsPerPage = size
      this.currentPage = 1
      this.pageInput = 1
      this.loadScoreBoardData()
    },
    openAddScoreModal() {},
    openEditScoreModal(item) {},
    handleDeleteScore(item) {},
    openImportScoreModal() {},
    handleApproveScores() {}
  }
}
</script>