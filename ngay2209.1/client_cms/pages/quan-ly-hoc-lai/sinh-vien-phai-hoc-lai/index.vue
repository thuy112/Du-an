<template>
  <div class="must-retake-page pa-4 bg-white">
    <!-- TIÊU ĐỀ TRANG (SỐ ĐIỀU CHỈNH ĐỘNG THEO DỮ LIỆU BẢNG) -->
    <div class="text-h6 font-weight-bold black--text mb-3">
      Danh sách sinh viên phải học lại (<span class="text-red-bold">{{ totalItems }}</span>)
    </div>

    <!-- BỘ LỌC VÀ THANH CÔNG CỤ -->
    <div class="d-flex align-center justify-space-between mb-4 gap-2 flex-wrap">
      <!-- CÁC Ô LỌC DỮ LIỆU -->
      <div class="d-flex align-center gap-2 flex-grow-1 flex-wrap">
        <v-text-field
          v-model="filters.keyword"
          placeholder="Tìm kiếm"
          outlined
          dense
          hide-details
          class="filter-input"
          style="width: 200px;"
          @keyup.enter="handleSearch"
        ></v-text-field>

        <v-select
          v-model="filters.termId"
          :items="termOptions"
          placeholder="Học kỳ"
          outlined
          dense
          hide-details
          clearable
          class="filter-input"
          style="width: 150px;"
        ></v-select>

        <v-select
          v-model="filters.sessionId"
          :items="sessionOptions"
          placeholder="Đợt học lại"
          outlined
          dense
          hide-details
          clearable
          class="filter-input"
          style="width: 150px;"
        ></v-select>

        <v-select
          v-model="filters.subjectId"
          :items="subjectOptions"
          placeholder="Học phần"
          outlined
          dense
          hide-details
          clearable
          class="filter-input"
          style="width: 150px;"
        ></v-select>

        <v-select
          v-model="filters.status"
          :items="statusOptions"
          placeholder="Trạng thái"
          outlined
          dense
          hide-details
          clearable
          class="filter-input"
          style="width: 140px;"
        ></v-select>
      </div>

      <!-- BỘ NÚT ICON GÓC PHẢI -->
      <div class="d-flex align-center gap-2">
        <v-btn icon color="#A62229" class="btn-square-action" @click="refreshData">
          <v-icon size="24">mdi-refresh</v-icon>
        </v-btn>

        <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="handleSearch">
          <v-icon size="24">mdi-magnify</v-icon>
        </v-btn>

        <!-- NÚT GỬI EMAIL CÓ BADGE SỐ LƯỢNG -->
        <v-badge
            :content="selectedItems.length"
            :value="selectedItems.length > 0"
            color="#FF5252"
            overlap
            offset-x="12"
            offset-y="12"
        >
        <v-btn
            elevation="0"
             :disabled="selectedItems.length === 0"
             :class="selectedItems.length > 0 ? 'btn-email-active' : 'btn-email-disabled'"
             class="btn-email-custom"
             @click="sendEmailDirectly"
            >
             <v-icon :color="selectedItems.length > 0 ? '#FFFFFF' : '#8C8C8C'" small>
                     mdi-email
             </v-icon>
        </v-btn>
    </v-badge>

        <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="openAddModal">
          <v-icon size="24">mdi-plus</v-icon>
          
        </v-btn>
      </div>
    </div>

    <!-- BẢNG DỮ LIỆU (ĐÃ BỎ KHUNG VIỀN NGOÀI) -->
    <v-simple-table class="flat-table">
      <template v-slot:default>
        <thead>
          <tr class="bg-gray-head">
            <th style="width: 40px;" class="text-center">
              <v-checkbox
                v-model="selectAll"
                hide-details
                dense
                class="ma-0 pa-0"
                @change="handleSelectAll"
              ></v-checkbox>
            </th>
            <th class="text-left font-weight-bold gray-head-text" style="width: 60px;">STT</th>
            <th class="text-left font-weight-bold gray-head-text" style="width: 250px;">Thông tin sinh viên</th>
            <th class="text-left font-weight-bold gray-head-text" style="width: 120px;">Đợt học lại</th>
            <th class="text-left font-weight-bold gray-head-text" style="width: 90px;">Học kỳ</th>
            <th class="text-left font-weight-bold gray-head-text" style="width: 110px;">Mã học phần</th>
            <th class="text-left font-weight-bold gray-head-text">Tên học phần</th>
            <th class="text-center font-weight-bold gray-head-text" style="width: 90px;">Điểm trượt</th>
            <th class="text-center font-weight-bold gray-head-text" style="width: 130px;">Trạng thái</th>
            <th class="text-center font-weight-bold gray-head-text" style="width: 100px;">Chức năng</th>
          </tr>
        </thead>
        <tbody>
          <template v-if="studentList && studentList.length > 0">
            <tr v-for="(item, idx) in studentList" :key="item.id || idx">
              <td class="text-center">
                <v-checkbox
                  v-model="selectedItems"
                  :value="item.id"
                  :disabled="item.isRegistered"
                  hide-details
                  dense
                  class="ma-0 pa-0"
                  @change="handleItemSelect"
                ></v-checkbox>
              </td>
              <td>{{ (currentPage - 1) * itemsPerPage + idx + 1 }}</td>
              <td class="py-2">
                <div class="font-weight-bold text-red-bold cursor-pointer" @click="viewDetail(item)">
                  {{ item.fullName }}
                </div>
                <div class="text-caption font-weight-medium">
                  Mã số sinh viên: <span class="text-red-bold">{{ item.studentCode }}</span>
                </div>
                <div class="text-caption text-grey-darken-1">
                  Lớp: {{ item.className }}
                </div>
              </td>
              <td>{{ item.sessionCode }}</td>
              <td>{{ item.termCode }}</td>
              <td class="font-weight-medium">{{ item.subjectCode }}</td>
              <td>{{ item.subjectName }}</td>
              <td class="text-center font-weight-bold">{{ item.failedScore || '' }}</td>
              <td class="text-center">
                <span :class="['status-badge', item.isRegistered ? 'bg-green' : 'bg-grey']">
                  {{ item.isRegistered ? 'Đã đăng ký' : 'Chưa đăng ký' }}
                </span>
              </td>
              <td class="text-center">
                <div class="d-flex align-center justify-center gap-1">
                  <v-btn icon small color="blue" @click="viewDetail(item)">
                    <v-icon size="24">mdi-eye</v-icon>
                  </v-btn>
                  <v-btn
                    v-if="!item.isRegistered"
                    icon
                    small
                    color="error"
                    aria-label="Xóa sinh viên chưa đăng ký"
                    @click="confirmDelete(item)"
                  >
                    <v-icon size="24">mdi-delete</v-icon>
                  </v-btn>
                </div>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="10" class="text-center py-8 text-grey-color">
              Không có dữ liệu
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>

    <!-- BOTTOM BAR: XUẤT/NHẬP FILE VÀ PHÂN TRANG -->
    <div class="d-flex align-center justify-space-between pt-4 mt-2 flex-wrap gap-2">
      <!-- NÚT XUẤT/NHẬP FILE -->
      <div class="d-flex align-center gap-2">
        <input
          ref="fileInput"
          type="file"
          accept=".xlsx, .xls"
          class="d-none"
          @change="handleImportFile"
        />

        <v-btn
          color="#2E7D32"
          dark
          class="text-none font-weight-medium"
          elevation="0"
          @click="exportToExcel"
        >
          <v-icon left small>mdi-export</v-icon>
          XUẤT FILE BÁO CÁO
        </v-btn>

        <v-btn
          color="#2E7D32"
          dark
          class="text-none font-weight-medium ml-2"
          elevation="0"
          @click="triggerFileInput"
        >
          <v-icon left small>mdi-microsoft-excel</v-icon>
          NHẬP FILE ĐĂNG KÝ
        </v-btn>
      </div>

      <!-- PHÂN TRANG PAGINATION -->
      <div class="d-flex align-center gap-2">
        <span class="text-caption text-grey-color">Bản ghi</span>
        <v-select
          v-model="itemsPerPage"
          :items="[10, 20, 50, 100]"
          dense
          outlined
          hide-details
          class="select-per-page"
          style="width: 75px;"
          @change="fetchData"
        ></v-select>

        <span class="text-caption text-grey-color ml-2">Trang</span>
        <v-text-field
          v-model="currentPage"
          dense
          outlined
          hide-details
          class="input-page-num"
          style="width: 50px;"
          @keyup.enter="fetchData"
        ></v-text-field>

        <v-btn color="#A62229" dark small class="px-3 min-w-0" elevation="0" @click="fetchData">Đi</v-btn>
        
        <v-btn icon small :disabled="currentPage <= 1" class="border-btn" @click="currentPage--; fetchData()">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>

        <v-btn
          v-for="p in totalPages"
          :key="p"
          small
          :color="p === currentPage ? '#A62229' : ''"
          :dark="p === currentPage"
          class="min-w-0 px-2 border-btn"
          elevation="0"
          @click="currentPage = p; fetchData()"
        >
          {{ p }}
        </v-btn>

        <v-btn icon small :disabled="currentPage >= totalPages" class="border-btn" @click="currentPage++; fetchData()">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
    </div>

    <RetakeCourseAddMustRetakeStudentModal
      v-model="showAddModal"
      :retake-class-list="studentList"
      @success="handleAddSuccess"
    />
    <!-- DIALOG XÁC NHẬN XÓA -->
<v-dialog v-model="deleteDialog" width="500px" persistent class="confirm-delete-dialog">
  <v-card class="rounded-lg overflow-hidden">
    <!-- HEADER -->
    <v-card-title class="bg-red-bk white--text pa-3 px-4 d-flex justify-space-between align-center">
      <span class="text-subtitle-1 font-weight-bold">Xác nhận</span>
      <v-btn icon dark small class="ma-0" @click="deleteDialog = false">
        <v-icon small>mdi-close</v-icon>
      </v-btn>
    </v-card-title>

    <!-- CONTENT -->
    <v-card-text class="pa-5 text-subtitle-2 font-weight-normal grey--text text--dark-3">
      Bạn có chắc chắn muốn xóa sinh viên được đăng ký này không?
    </v-card-text>

    <v-divider></v-divider>

    <!-- ACTIONS -->
    <v-card-actions class="pa-3 px-4 d-flex justify-end bg-white">
      <!-- Nút Đóng -->
      <v-btn
        text
        small
        class="text-none btn-close-custom mr-2"
        @click="deleteDialog = false"
      >
        Đóng
        <v-icon right small class="ml-1">mdi-close</v-icon>
      </v-btn>

      <!-- Nút Xác Nhận -->
      <v-btn
        dark
        small
        elevation="0"
        class="text-none btn-confirm-custom"
        @click="executeDelete"
      >
        Xác Nhận
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

    <RetakeCourseDetailMustRetakeStudentModal
      v-model="showDetailModal"
      :student-data="selectedStudentDetail"
    />

    <div class="toast-container">
      <transition-group name="toast-list" tag="div" class="d-flex flex-column gap-2">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast-item rounded-lg elevation-2 d-flex flex-column overflow-hidden"
        >
          <div class="toast-content px-4 py-3 d-flex align-center white--text">
            <v-icon color="white" class="mr-3" small>mdi-check-circle</v-icon>
            <span class="text-body-2 flex-grow-1 font-weight-medium">{{ toast.message }}</span>
            <v-btn icon x-small dark class="ml-2 opacity-80" @click="removeToast(toast.id)">
              <v-icon x-small>mdi-close</v-icon>
            </v-btn>
          </div>
          <div class="toast-progress-bg">
            <div
              class="toast-progress-bar"
              :style="{ animationDuration: toast.duration + 'ms' }"
              @animationend="removeToast(toast.id)"
            ></div>
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
import * as XLSX from 'xlsx'
import RetakeCourseDetailMustRetakeStudentModal from '~/components/RetakeCourse/DetailMustRetakeStudentModal.vue'

export default {
  name: 'MustRetakeStudentPage',
  components: {
    RetakeCourseDetailMustRetakeStudentModal
  },
  data() {
    return {
      filters: {
        keyword: '',
        termId: null,
        sessionId: null,
        subjectId: null,
        status: null,
      },

      termOptions: [],
      sessionOptions: [],
      subjectOptions: [],
      statusOptions: [
        { text: 'Chưa đăng ký', value: 0 },
        { text: 'Đã đăng ký', value: 1 }
      ],

      selectAll: false,
      selectedItems: [],

      showAddModal: false,
      toasts: [],
      deleteDialog: false,
      showDetailModal: false,
      itemToDelete: null,
      selectedStudentDetail: null,
      loading: false,
      currentPage: 1,
      itemsPerPage: 50,
      totalItems: 0, // Mặc định là 0, sẽ tự động cập nhật số lượng thực tế khi gọi API/mockData
      studentList: [],
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.totalItems / this.itemsPerPage) || 1
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.loading = true
      this.mockData()
      this.loading = false
    },

    mockData() {
      this.studentList = [
        { id: 1, fullName: 'Lê Tuấn Anh', studentCode: '20210110P', className: 'ĐH-BK-CNTT1.2-K66', sessionCode: '20261-A-4', termCode: '20261', subjectCode: 'IT3100', subjectName: 'Lập trình hướng đối tượng', failedScore: '', isRegistered: false },
        { id: 2, fullName: 'Đỗ Tiến Tây Anh', studentCode: '20210112P', className: 'ĐH-BK-CNTT1.1-K66', sessionCode: '20261-A-4', termCode: '20261', subjectCode: 'IT3100', subjectName: 'Lập trình hướng đối tượng', failedScore: '', isRegistered: false },
        { id: 3, fullName: 'Đỗ Tiến Tây Anh', studentCode: '20210112P', className: 'ĐH-BK-CNTT1.1-K66', sessionCode: '20261-A-5', termCode: '20261', subjectCode: 'IT3100', subjectName: 'Lập trình hướng đối tượng', failedScore: '', isRegistered: true },
        { id: 4, fullName: 'Lê Tuấn Anh', studentCode: '20210110P', className: 'ĐH-BK-CNTT1.2-K66', sessionCode: '20261-A-5', termCode: '20261', subjectCode: 'IT3090', subjectName: 'CƠ SỞ DỮ LIỆU', failedScore: '', isRegistered: true },
        { id: 5, fullName: 'Nguyễn Linh Anh', studentCode: '20210108P', className: 'ĐH-BK-CNTT1.1-K66', sessionCode: '20261-A-5', termCode: '20261', subjectCode: 'IT3080', subjectName: 'Mạng máy tính', failedScore: '', isRegistered: true },
        { id: 6, fullName: 'Nguyễn Quang Anh', studentCode: '20210107P', className: 'ĐH-BK-CNTT1.2-K66', sessionCode: '20261-A-5', termCode: '20261', subjectCode: 'IT3070', subjectName: 'Nguyên lý hệ điều hành', failedScore: '', isRegistered: true },
        { id: 7, fullName: 'Nguyễn Khánh An', studentCode: '20210105P', className: 'ĐH-BK-CNTT1.1-K66', sessionCode: '20261-A-5', termCode: '20261', subjectCode: 'IT3011', subjectName: 'Cấu trúc dữ liệu và thuật toán', failedScore: '', isRegistered: true },
      ]
      // Cập nhật tổng số dòng động
      this.totalItems = this.studentList.length
      this.selectedItems = []
      this.selectAll = false
    },

    handleSearch() {
      this.currentPage = 1
      this.fetchData()
    },

    openAddModal() {
      this.showAddModal = true
    },

    handleAddSuccess(newStudent) {
      if (!newStudent || newStudent.length === 0) {
        this.fetchData()
        return
      }

      const addedStudents = Array.isArray(newStudent) ? newStudent : [newStudent]
      this.studentList.unshift(...addedStudents)
      this.totalItems += addedStudents.length
      this.currentPage = 1
      this.selectedItems = []
      this.selectAll = false
    },

    confirmDelete(item) {
      if (item.isRegistered) return
      this.itemToDelete = item
      this.deleteDialog = true
    },

    executeDelete() {
      if (this.itemToDelete && !this.itemToDelete.isRegistered) {
        this.studentList = this.studentList.filter(student => student.id !== this.itemToDelete.id)
        this.totalItems = Math.max(0, this.totalItems - 1)
        this.selectedItems = this.selectedItems.filter(id => id !== this.itemToDelete.id)
        this.syncSelectAll()
        this.addToast('Xóa thông tin thành công')
      } else if (this.itemToDelete?.isRegistered) {
        this.$toast?.error?.('Không thể xóa sinh viên đã đăng ký!')
      }

      this.deleteDialog = false
      this.itemToDelete = null
    },

    openDetailModal(item) {
      this.selectedStudentDetail = item
      this.showDetailModal = true
    },

    addToast(message = 'Xóa thông tin thành công', duration = 3000) {
      const id = Date.now() + Math.random()
      this.toasts.unshift({ id, message, duration })
    },

    removeToast(id) {
      this.toasts = this.toasts.filter(toast => toast.id !== id)
    },

    handleSelectAll(isChecked) {
      this.selectedItems = isChecked
        ? this.studentList.filter(item => !item.isRegistered).map(item => item.id)
        : []
      this.syncSelectAll()
    },

    handleItemSelect() {
      const selectableItems = this.studentList.filter(item => !item.isRegistered)
      this.selectAll =
        selectableItems.length > 0 &&
        selectableItems.every(item => this.selectedItems.includes(item.id))
    },

    syncSelectAll() {
      const selectableItems = this.studentList.filter(item => !item.isRegistered)
      this.selectAll =
        selectableItems.length > 0 &&
        selectableItems.every(item => this.selectedItems.includes(item.id))
    },

    refreshData() {
      this.fetchData()
    },

    sendEmailDirectly() {
      if (this.selectedItems.length === 0) return

      const count = this.selectedItems.length
      /* Nếu có gọi API gửi Email phía Backend:
      try {
        await this.$axios.$post('/api/retake-student/send-email', {
          studentIds: this.selectedItems
        })
      } catch (err) {
        this.addToast('Gửi email thất bại', 3000)
        return
      }
      */
      this.addToast(`Gửi email thành công (${count} email)`, 3000)
      this.selectedItems = []
      this.selectAll = false
    },

    exportToExcel() {
      try {
        if (!this.studentList.length) {
          this.addToast('Không có dữ liệu sinh viên để xuất file', 3000)
          return
        }

        const itemsToExport = this.selectedItems.length
          ? this.studentList.filter(item => this.selectedItems.includes(item.id))
          : this.studentList
        const dataForExcel = itemsToExport.map((item, index) => ({
          STT: index + 1,
          'Họ và tên': item.fullName || '',
          'Mã sinh viên': item.studentCode || '',
          'Lớp': item.className || '',
          'Đợt học lại': item.sessionId || item.sessionCode || '',
          'Học kỳ': item.termId || item.termCode || '',
          'Mã học phần': item.subjectCode || '',
          'Tên học phần': item.subjectName || '',
          'Điểm trượt': item.failingScore || item.failedScore || '',
          'Trạng thái': item.status || (item.isRegistered ? 'Đã đăng ký' : 'Chưa đăng ký')
        }))

        const worksheet = XLSX.utils.json_to_sheet(dataForExcel)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Bao_Cao_Sinh_Vien')
        XLSX.writeFile(workbook, `Bao_Cao_Sinh_Vien_Phai_Hoc_Lai_${Date.now()}.xlsx`)
        this.addToast('Xuất file báo cáo thành công', 3000)
      } catch (error) {
        this.addToast('Lỗi xuất file báo cáo', 3000)
      }
    },

    triggerFileInput() {
      this.$refs.fileInput.click()
    },

    async handleImportFile(event) {
      const file = event.target.files && event.target.files[0]
      if (!file) return

      if (!/\.(xlsx|xls)$/i.test(file.name)) {
        this.addToast('Vui lòng chọn file Excel đúng định dạng (.xlsx, .xls)', 3000)
        event.target.value = ''
        return
      }

      try {
        const arrayBuffer = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = loadEvent => resolve(loadEvent.target.result)
          reader.onerror = () => reject(new Error('Không thể đọc file Excel'))
          reader.readAsArrayBuffer(file)
        })
        const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        if (!firstSheetName) {
          this.addToast('File Excel không có dữ liệu', 3000)
          return
        }

        const worksheet = workbook.Sheets[firstSheetName]
        const rows = XLSX.utils.sheet_to_json(worksheet)
        if (!rows.length) {
          this.addToast('File Excel không có dữ liệu', 3000)
          return
        }

        const importedStudents = rows.map((row, index) => {
          const status = row['Trạng thái'] || 'Chưa đăng ký'
          return {
            id: Date.now() + index,
            fullName: row['Họ và tên'] || row.fullName || '—',
            studentCode: row['Mã sinh viên'] || row.studentCode || '—',
            className: row['Lớp'] || row.className || '—',
            sessionId: row['Đợt học lại'] || row.sessionId || '—',
            sessionCode: row['Đợt học lại'] || row.sessionCode || row.sessionId || '—',
            termId: row['Học kỳ'] || row.termId || '—',
            termCode: row['Học kỳ'] || row.termCode || row.termId || '—',
            subjectCode: row['Mã học phần'] || row.subjectCode || '—',
            subjectName: row['Tên học phần'] || row.subjectName || '—',
            failingScore: row['Điểm trượt'] || row.failingScore || '',
            failedScore: row['Điểm trượt'] || row.failedScore || row.failingScore || '',
            status,
            isRegistered: status === 'Đã đăng ký'
          }
        })

        this.studentList = [...importedStudents, ...this.studentList]
        this.totalItems += importedStudents.length
        this.currentPage = 1
        this.selectedItems = []
        this.selectAll = false
        this.addToast(`Đã nhập thành công ${importedStudents.length} bản ghi`, 3000)
      } catch (error) {
        this.addToast('File Excel không hợp lệ hoặc bị lỗi cấu trúc', 3000)
      } finally {
        event.target.value = ''
      }
    },

    viewDetail(item) {
      this.openDetailModal(item)
    }
  }
}
</script>

<style scoped>
.bg-red-bk { background-color: #A62229 !important; }
.text-red-bold { color: #A62229 !important; }
.text-grey-color { color: #757575 !important; }
.gray-head-text { color: #333333 !important; }

.bg-gray-head { background-color: #F5F5F5 !important; }

.filter-input >>> .v-input__slot {
  border-radius: 6px !important;
  min-height: 38px !important;
}

.select-per-page >>> .v-input__slot,
.input-page-num >>> .v-input__slot {
  min-height: 32px !important;
  padding: 0 8px !important;
}

.btn-square-action {
  border-radius: 6px !important;
  height: 38px !important;
  min-width: 38px !important;
}

.btn-import-excel {
  border-radius: 6px !important;
  height: 38px !important;
  background-color: #2E7D32 !important;
}

.flat-table {
  background: transparent !important;
}

.border-btn {
  border: 1px solid #E0E0E0 !important;
  border-radius: 4px !important;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: white;
}
.bg-green { background-color: #4CAF50 !important; }
.bg-grey { background-color: #9E9E9E !important; }

.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.cursor-pointer { cursor: pointer; }

.toast-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 99999;
  width: 320px;
  pointer-events: none;
}

.toast-item {
  pointer-events: auto;
  background-color: #4CB050 !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.opacity-80 {
  opacity: 0.8;
}

.toast-progress-bg {
  height: 3px;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.25);
}

.toast-progress-bar {
  width: 100%;
  height: 100%;
  background-color: #35feb1;
  animation: shrinkProgress linear forwards;
}

@keyframes shrinkProgress {
  from { width: 100%; }
  to { width: 0%; }
}

.toast-list-enter-active,
.toast-list-leave-active,
.toast-list-move {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.toast-list-enter {
  opacity: 0;
  transform: translateY(-15px) scale(0.96);
}

.toast-list-leave-to {
  opacity: 0;
  transform: translateX(40px);
}
/* Màu đỏ đặc trưng theo giao diện */
.bg-red-bk {
  background-color: #A62229 !important;
}

/* Nút Đóng (Chữ màu đỏ, icon x nhỏ) */
.btn-close-custom {
  color: #A62229 !important;
  font-weight: 500;
  letter-spacing: normal;
  border-radius: 6px;
}

.btn-close-custom:hover {
  background-color: rgba(166, 34, 41, 0.04) !important;
}

/* Nút Xác Nhận (Nền đỏ, chữ trắng, bo góc) */
.btn-confirm-custom {
  background-color: #A62229 !important;
  color: #ffffff !important;
  font-weight: 500;
  letter-spacing: normal;
  border-radius: 8px !important;
  padding: 0 16px !important;
  height: 36px !important;
}

.btn-confirm-custom:hover {
  background-color: #8e1d23 !important;
}
/* Style chung cho nút Mail */
.btn-email-custom {
  min-width: 44px !important;
  width: 44px !important;
  height: 36px !important;
  border-radius: 8px !important;
  padding: 0 !important;
  transition: all 0.2s ease-in-out;
}

/* Ảnh 1: Trạng thái Chưa chọn (Disabled - Nền xám nhạt, Icon xám) */
.btn-email-disabled {
  background-color: #E0E0E0 !important;
  cursor: not-allowed !important;
}

/* Ảnh 2: Trạng thái Đã tích chọn (Active - Nền đỏ, Icon trắng) */
.btn-email-active {
  background-color: #A62229 !important;
  cursor: pointer !important;
}

.btn-email-active:hover {
  background-color: #8E1D23 !important;
}

/* Custom riêng cho Badge đỏ hiện số lượng ở góc trên */
::v-deep .v-badge__badge {
  font-size: 11px !important;
  font-weight: bold !important;
  height: 18px !important;
  min-width: 18px !important;
  padding: 0 5px !important;
  border-radius: 10px !important;
}
</style>