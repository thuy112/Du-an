<template>
  <div class="assign-teacher-page pa-3 pa-md-4 bg-white">
    <!-- TIÊU ĐỀ VÀ THANH CÔNG CỤ -->
    <div class="d-flex align-center justify-space-between mb-3 flex-wrap" style="gap: 8px;">
      <div class="text-h6 font-weight-bold black--text">
        Gán giảng viên cho học sinh
      </div>

      <div class="d-flex align-center" style="gap: 8px;">
        <v-select
          v-model="filterTeacherId"
          :items="teacherList"
          item-text="fullName"
          item-value="id"
          placeholder="Giảng viên"
          outlined
          dense
          hide-details
          clearable
          style="width: 220px;"
        ></v-select>

        <v-select
          v-model="filterProcessType"
          :items="processTypeList"
          item-text="text"
          item-value="value"
          placeholder="Quy trình bảo vệ"
          outlined
          dense
          hide-details
          clearable
          style="width: 220px;"
        ></v-select>

        <v-btn icon color="#A62229" @click="resetFilters" title="Làm mới">
          <v-icon size="24">mdi-refresh</v-icon>
        </v-btn>

        <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="loadAssignedTeachers" title="Tìm kiếm">
          <v-icon size="24">mdi-magnify</v-icon>
        </v-btn>

        <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="openAddModal" title="Thêm mới">
          <v-icon size="24">mdi-plus</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- BẢNG HIỂN THỊ DANH SÁCH GIẢNG VIÊN ĐÃ GÁN -->
    <div class="table-scroll-container">
      <BaseTable
        :headers="headers"
        :items="assignedTeacherList"
        :loading="loading"
        :current-page="currentPage"
        :items-per-page="itemsPerPage"
        :total-records="totalRecords"
        hide-default-footer
        @page-change="changePage"
      >
        <!-- STT -->
        <template #[`item.stt`]="{ index }">
          {{ (currentPage - 1) * itemsPerPage + index + 1 }}
        </template>

        <!-- Tên giảng viên -->
        <template #[`item.teacher.fullName`]="{ item }">
          <span class="font-weight-medium">
            {{ item.teacher?.fullName || '-' }}
          </span>
        </template>

        <!-- Mã giảng viên -->
        <template #[`item.teacher.code`]="{ item }">
          <strong>
            {{ item.teacher?.code || '-' }}
          </strong>
        </template>

        <!-- Quy trình bảo vệ dùng BaseStatusItem -->
        <template #[`item.reAssessmentType`]="{ item }">
          <BaseStatusItem
            v-if="item.reAssessmentType"
            :status-list="graduationTaskList"
            :status="item.reAssessmentType"
          />
        </template>

        <!-- Cột Chức năng -->
        <template #[`item.actions`]="{ item }">
          <div class="d-flex align-center justify-center" style="gap: 4px;">
            <v-btn icon small color="warning" @click="openEditModal(item)" title="Sửa">
              <v-icon size="24">mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon small color="#f44336" @click="confirmDelete(item)" title="Xóa">
              <v-icon size="24">mdi-trash-can</v-icon>
            </v-btn>
          </div>
        </template>
      </BaseTable>
    </div>

    <!-- THANH PHÂN TRANG (BÊN PHẢI) VÀ NÚT QUAY LẠI (BÊN TRÁI) -->
    <div class="d-flex align-center justify-space-between mt-4 flex-wrap gap-3 pt-3 border-top">
      <!-- Nút Quay lại bên trái -->
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

      <!-- Cụm phân trang bên phải -->
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

    <!-- MODAL THÊM MỚI / CẬP NHẬT -->
    <v-dialog v-model="isOpenAddModal" max-width="600px" persistent>
      <v-card>
        <v-card-title class="headline white--text px-4 py-3" style="background-color: #A62229;">
          <span>{{ isEditMode ? 'Cập nhật giảng viên' : 'Thêm mới giảng viên' }}</span>
          <v-spacer></v-spacer>
          <v-btn icon dark @click="isOpenAddModal = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-4 pt-5">
          <v-form ref="form" lazy-validation @submit.prevent>
            <v-row dense>
              <v-col cols="12" class="mb-3">
                <v-autocomplete
                  v-model="params.teacherId"
                  :items="teacherList"
                  item-text="fullName"
                  item-value="id"
                  label="Giảng viên (*)"
                  outlined
                  dense
                  hide-details="auto"
                  :rules="[v => !!v || 'Vui lòng chọn giảng viên']"
                ></v-autocomplete>
              </v-col>

              <v-col cols="12">
                <v-select
                  v-model="params.type"
                  :items="graduationTaskList"
                  item-text="text"
                  item-value="value"
                  label="Quy trình bảo vệ (*)"
                  outlined
                  dense
                  hide-details="auto"
                  :rules="[v => !!v || 'Vui lòng chọn quy trình bảo vệ']"
                ></v-select>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="px-4 py-3">
          <v-spacer></v-spacer>
          <v-btn outlined color="grey darken-1" text @click="isOpenAddModal = false">
            Đóng <v-icon right small>mdi-close</v-icon>
          </v-btn>
          <v-btn color="#A62229" dark depressed @click="handleAdd">
            Lưu <v-icon right small>mdi-content-save</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MODAL XÁC NHẬN XÓA -->
    <base-confirm-modal
      :open="openDeleteModal"
      @OK="handleDelete"
      @toggle="openDeleteModal = !openDeleteModal"
    >
      <template #content>
        <div>
          Xác nhận xóa GV được gán
          <span class="primary--text font-weight-bold">{{
            selectedItem?.teacher?.fullName
          }}</span>
        </div>
      </template>
    </base-confirm-modal>
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import BaseStatusItem from '~/components/Base/StatusItem.vue'
import BaseConfirmModal from '~/components/Base/ConfirmModal.vue'
import examSessionService from '~/services/redefend/examSessionService'
import studentAssignTeacherServices from '~/services/redefend/studentAssignTeacherServices'
import { graduationTaskList } from '~/consts/list'

export default {
  name: 'AssignTeacherPage',
  components: { BaseTable, BaseStatusItem, BaseConfirmModal },
  data() {
    return {
      examSessionId: null,
      studentId: null,
      filterTeacherId: null,
      filterProcessType: null,
      
      loading: false,
      teacherList: [],
      assignedTeacherList: [],
      graduationTaskList,
      processTypeList: graduationTaskList || [
        { text: 'Phản biện DATN', value: 'REBUTTAL' },
        { text: 'Tham gia HĐ chấm TN', value: 'JOIN' }
      ],

      totalRecords: 0,
      totalPages: 1,
      currentPage: 1,
      pageInput: 1,
      itemsPerPage: 50,

      isOpenAddModal: false,
      isEditMode: false,
      params: {
        id: null,
        examSessionId: null,
        teacherId: null,
        studentId: null,
        type: '',
      },

      openDeleteModal: false,
      selectedItem: null,

      headers: [
        { value: 'stt', text: 'STT', align: 'center', width: '80px', sortable: false },
        { value: 'teacher.fullName', text: 'Tên giảng viên', align: 'left', minWidth: '200px', sortable: false },
        { value: 'teacher.code', text: 'Mã giảng viên', align: 'left', width: '150px', sortable: false },
        { value: 'reAssessmentType', text: 'Quy trình bảo vệ', align: 'center', width: '180px', sortable: false },
        { value: 'actions', text: 'Chức năng', align: 'center', width: '120px', sortable: false },
      ]
    }
  },
  async mounted() {
    this.studentId = Number(this.$route.params.id)
    this.examSessionId = Number(this.$route.query.examSessionId)
    
    if (this.studentId && this.examSessionId) {
      await Promise.all([
        this.loadTeacherMasterData(),
        this.loadAssignedTeachers()
      ])
    }
  },
  methods: {
    async loadTeacherMasterData() {
      try {
        const res = await examSessionService.getTeacherList({ status: 'ACTIVE', channel: 'CMS' })
        const data = res.data !== undefined ? res.data : res
        this.teacherList = Array.isArray(data) ? data : (data.data || data.content || [])
      } catch (error) {
        console.error('Lỗi tải danh sách giảng viên:', error)
      }
    },

    async loadAssignedTeachers() {
      this.loading = true
      try {
        const params = {
          pageIndex: this.currentPage,
          pageSize: this.itemsPerPage,
          examSessionId: this.examSessionId,
          studentId: this.studentId,
          teacherId: this.filterTeacherId || '', // Truyền ID giảng viên để tìm kiếm
          type: this.filterProcessType || '',
          channel: 'CMS'
        }
        const res = await examSessionService.getStudentAssignTeacher(params)
        const rawData = res.data !== undefined ? res.data : res
        
        this.assignedTeacherList = Array.isArray(rawData) ? rawData : (rawData.data || rawData.content || rawData.items || [])
        this.totalRecords = rawData.totalElements ?? rawData.totalRecords ?? this.assignedTeacherList.length
        this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage) || 1
      } catch (error) {
        console.error('Lỗi tải danh sách giảng viên được gán:', error)
        this.assignedTeacherList = []
        this.totalRecords = 0
      } finally {
        this.loading = false
      }
    },

    // Reset bộ lọc và tải lại danh sách
    resetFilters() {
      this.filterTeacherId = null
      this.filterProcessType = null
      this.currentPage = 1
      this.pageInput = 1
      this.loadAssignedTeachers()
    },

    openAddModal() {
      this.isEditMode = false
      this.params = {
        id: null,
        examSessionId: this.examSessionId,
        teacherId: null,
        studentId: this.studentId,
        type: '',
      }
      this.isOpenAddModal = true
    },

    async openEditModal(item) {
      this.isEditMode = true
      try {
        const res = await studentAssignTeacherServices.getDetail(item.id)
        const detailData = res?.data || item
        
        this.params = {
          id: detailData.id,
          examSessionId: this.examSessionId,
          teacherId: detailData.teacher?.id || detailData.teacherId,
          studentId: this.studentId,
          type: detailData.reAssessmentType || detailData.type,
        }
        this.isOpenAddModal = true
      } catch (error) {
        console.error('Lỗi lấy chi tiết:', error)
      }
    },

    async handleAdd() {
      if (this.$refs.form && !this.$refs.form.validate()) return
      try {
        const payload = {
          ...this.params,
          channel: 'CMS'
        }
        let res
        if (this.isEditMode) {
          res = await studentAssignTeacherServices.update(payload)
        } else {
          res = await studentAssignTeacherServices.addNews(payload)
        }

        if (res && res.success !== false) {
          this.isOpenAddModal = false
          this.$showSuccess?.(this.isEditMode ? "Cập nhật giảng viên thành công" : "Thêm mới giảng viên thành công")
          await this.loadAssignedTeachers()
        }
      } catch (er) {
        console.error('Lỗi lưu dữ liệu:', er)
      }
    },

    confirmDelete(item) {
      this.selectedItem = item
      this.openDeleteModal = true
    },

    async handleDelete() {
      try {
        const res = await studentAssignTeacherServices.delete(this.selectedItem?.id)
        if (res && res.success !== false) {
          this.$showSuccess?.("Xóa giảng viên được gán thành công")
          await this.loadAssignedTeachers()
        }
      } catch (error) {
        console.error('Lỗi khi xóa:', error)
      }
      this.openDeleteModal = false
    },

    changePage(page) {
      if (page < 1 || page > this.totalPages) return
      this.currentPage = page
      this.pageInput = page
      this.loadAssignedTeachers()
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
      this.loadAssignedTeachers()
    },
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>