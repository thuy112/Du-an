<template>
  <div class="ket-qua-thi-page pa-4">
    <!-- TIÊU ĐỀ BẢNG -->
    <div class="d-flex align-center justify-space-between mb-4">
      <div class="text-subtitle-1 font-weight-bold black--text">
        Danh sách kết quả học lại (
        <span class="text-red-bold">{{ resultList.length }}</span> )
      </div>
    </div>

    <!-- CỤM LỌC TÌM KIẾM (FILTER TOOLBAR) -->
    <div class="d-flex align-center justify-end gap-2 mb-4 flex-wrap">
      <v-text-field
        v-model="filters.keyword"
        placeholder="Mã sv, tên sv"
        outlined
        dense
        hide-details
        class="filter-input"
        style="max-width: 200px"
        @change="fetchData"
      ></v-text-field>

      <v-select
        v-model="filters.class"
        :items="classList"
        placeholder="Lớp sinh viên"
        outlined
        dense
        hide-details
        clearable
        class="filter-select"
        style="max-width: 180px"
        @change="fetchData"
      ></v-select>

      <v-select
        v-model="filters.session"
        :items="sessionList"
        placeholder="Đợt học lại"
        outlined
        dense
        hide-details
        clearable
        class="filter-select"
        style="max-width: 180px"
        @change="fetchData"
      ></v-select>

      <v-select
        v-model="filters.retakeClass"
        :items="retakeClassList"
        placeholder="Lớp học lại"
        outlined
        dense
        hide-details
        clearable
        class="filter-select"
        style="max-width: 180px"
        @change="fetchData"
      ></v-select>

      <!-- CỤM NÚT ICON ACTION BÊN PHẢI -->
      <div class="d-flex align-center gap-1">
        <v-btn
          icon
          class="action-icon-btn"
          title="Bộ lọc nâng cao"
          @click="showAdvancedFilter = true"
        >
          <v-icon color="#A62229" size="24">mdi-filter-variant-plus</v-icon>
        </v-btn>

        <v-btn icon class="action-icon-btn" title="Làm mới" @click="fetchData">
          <v-icon color="#A62229" size="24">mdi-refresh</v-icon>
        </v-btn>

        <v-btn
          color="#A62229"
          dark
          elevation="0"
          class="search-btn min-w-0 px-3"
          @click="fetchData"
        >
          <v-icon size="24">mdi-magnify</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- BẢNG DANH SÁCH KẾT QUẢ HỌC LẠI -->
    <div class="border-table overflow-x-auto">
      <table class="custom-data-table">
        <thead>
          <tr class="bg-gray-head">
            <th class="text-caption font-weight-bold">Mã SV</th>
            <th class="text-caption font-weight-bold">Họ và tên</th>
            <th class="text-caption font-weight-bold">Lớp SV</th>
            <th class="text-caption font-weight-bold">Lớp học lại</th>
            <th class="text-caption font-weight-bold">Loại lớp</th>
            <th class="text-caption font-weight-bold">Điểm</th>
            <th class="text-caption font-weight-bold">Ghi chú</th>
            <th class="text-caption font-weight-bold">Đợt học lại</th>
            <th class="text-caption font-weight-bold">Học phần</th>
            <th class="text-caption font-weight-bold">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          <!-- KHI KHÔNG CÓ DỮ LIỆU -->
          <tr v-if="resultList.length === 0">
            <td
              colspan="10"
              class="text-center py-6 text-caption text-grey-color"
            >
              Không có dữ liệu
            </td>
          </tr>

          <!-- DỮ LIỆU KHI CÓ KẾT QUẢ -->
          <tr v-for="(item, index) in paginatedResults" :key="item.id || index">
            <td class="text-caption font-weight-bold">
              {{ item.studentCode }}
            </td>
            <td class="text-caption">{{ item.studentName }}</td>
            <td class="text-caption">{{ item.className }}</td>
            <td class="text-caption">{{ item.retakeClassName }}</td>
            <td class="text-caption">{{ item.classType }}</td>
            <td class="text-caption font-weight-bold">{{ item.score }}</td>
            <td class="text-caption">{{ item.note }}</td>
            <td class="text-caption">{{ item.session }}</td>
            <td class="text-caption">{{ item.subject }}</td>
            <td class="text-caption">{{ item.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- FOOTER PHÂN TRANG (CHỈNH GIỐNG HÌNH THIẾT KẾ MỚI) -->
    <div class="d-flex align-center justify-end mt-4 gap-2">
      <!-- BẢN GHI -->
      <v-select
        v-model="pageSize"
        :items="pageSizeOptions"
        label="Bản ghi"
        aria-label="Số bản ghi mỗi trang"
        outlined
        dense
        hide-details
        class="custom-pagination-select"
        @change="onPageSizeChange"
      ></v-select>

      <!-- TRANG -->
      <v-text-field
        v-model="pageInput"
        label="Trang"
        aria-label="Số trang"
        outlined
        dense
        hide-details
        class="custom-pagination-input"
        @keyup.enter="goToPage"
      ></v-text-field>

      <!-- NÚT ĐI -->
      <v-btn
        color="#A62229"
        dark
        elevation="0"
        class="custom-go-btn"
        @click="goToPage"
      >
        Đi
      </v-btn>

      <!-- NÚT NEXT / PREV -->
      <div class="d-flex align-center gap-1">
        <button class="custom-nav-btn" :disabled="page <= 1" @click="prevPage">
          <v-icon small color="#666">mdi-chevron-left</v-icon>
        </button>
        <button
          class="custom-nav-btn"
          :disabled="page >= totalPages"
          @click="nextPage"
        >
          <v-icon small color="#666">mdi-chevron-right</v-icon>
        </button>
      </div>
    </div>

    <!-- MODAL BỘ LỌC NÂNG CAO -->
    <v-dialog v-model="showAdvancedFilter" width="560px" persistent>
      <div class="advanced-filter-card">
        <div
          class="modal-header d-flex align-center justify-space-between px-5 py-3"
        >
          <span class="text-subtitle-1 white--text font-weight-medium"
            >Bộ lọc nâng cao</span
          >
          <v-btn
            icon
            dark
            x-small
            class="ma-0"
            aria-label="Đóng"
            @click="showAdvancedFilter = false"
          >
            <v-icon small>mdi-close</v-icon>
          </v-btn>
        </div>

        <div class="modal-body px-5 py-5">
          <v-row dense>
            <v-col cols="6">
              <v-select
                v-model="advancedFilters.heSo"
                :items="heSoList"
                placeholder="Hệ số"
                outlined
                dense
                hide-details
                clearable
                class="modal-select"
              ></v-select>
            </v-col>

            <v-col cols="6">
              <v-select
                v-model="advancedFilters.trangThai"
                :items="trangThaiList"
                placeholder="Trạng thái"
                outlined
                dense
                hide-details
                clearable
                class="modal-select"
              ></v-select>
            </v-col>
          </v-row>
        </div>

        <div
          class="modal-footer d-flex align-center justify-end px-5 pb-4 pt-2 gap-3"
        >
          <button
            type="button"
            class="btn-cancel d-flex align-center"
            @click="showAdvancedFilter = false"
          >
            <span>Đóng</span>
            <v-icon x-small color="#333" class="ml-1">mdi-close</v-icon>
          </button>

          <v-btn
            color="#A62229"
            dark
            small
            elevation="0"
            class="btn-search-modal text-none font-weight-medium"
            @click="handleAdvancedSearch"
          >
            Tìm Kiếm
            <v-icon right small>mdi-magnify</v-icon>
          </v-btn>
        </div>
      </div>
    </v-dialog>

    <!-- DANH SÁCH THÔNG BÁO LỖI (MỚI XẾP TRÊN CỦ, HIỆN LIÊN TỤC) -->
    <div class="toast-container">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="system-error-toast"
        role="alert"
      >
        <div class="system-error-toast-content">
          <v-icon dark small>mdi-alert-triangle</v-icon>
          <span class="font-weight-medium white--text text-subtitle-2"
            >Lỗi hệ thống</span
          >
          <v-btn
            icon
            x-small
            aria-label="Đóng thông báo"
            @click="removeToast(toast.id)"
          >
            <v-icon small dark>mdi-close</v-icon>
          </v-btn>
        </div>
        <div class="system-error-progress-track">
          <div
            class="system-error-progress"
            @animationend="removeToast(toast.id)"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import examResultServices from '~/services/examResultServices' 

export default {
  name: 'KetQuaThiPage',
  ssr: false,
  data() {
    return {
      filters: {
        keyword: '',
        class: null,
        session: null,
        retakeClass: null,
      },
      // Chuyển các mảng tĩnh sang mảng động để hứng dữ liệu từ API trả về
      classList: [],
      sessionList: [],
      retakeClassList: [],

      // Bộ lọc nâng cao Modal
      showAdvancedFilter: false,
      advancedFilters: {
        heSo: null,
        trangThai: null,
      },
      heSoList: [],
      trangThaiList: ['Chưa duyệt', 'Đã duyệt'],

      resultList: [],

      page: 1,
      pageSize: 50,
      pageSizeOptions: [10, 20, 50, 100, 200, 500, 1000],
      pageInput: '1',

      toasts: [],
      toastCounter: 0,
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.resultList.length / this.pageSize) || 1
    },
    paginatedResults() {
      const start = (this.page - 1) * this.pageSize
      return this.resultList.slice(start, start + this.pageSize)
    },
  },
  watch: {
    page(value) {
      this.pageInput = String(value)
    },
  },
  mounted() {
    this.initPageData()
  },
  methods: {
    // Gọi tổng hợp dữ liệu danh mục lọc và danh sách chính khi vào trang
    async initPageData() {
      await Promise.all([
        this.fetchFilterOptions(),
        this.fetchData()
      ])
    },

    // Lấy dữ liệu các dropdown bộ lọc từ API
    async fetchFilterOptions() {
      try {
        // 1. Lấy đợt học lại
        const sessionRes = await examResultServices.getRetakeSessions({ status: 'ACTIVE', channel: 'CMS' })
        this.sessionList = sessionRes?.data?.objects || sessionRes?.data || []

        // 2. Lấy danh sách lớp
        const classRes = await examResultServices.getClasses({ channel: 'CMS' })
        this.classList = classRes?.data?.objects || classRes?.data || []

        // 3. Lấy hệ số (cho modal nâng cao)
        const coefRes = await examResultServices.getCoefficients({ pageSize: 100, pageIndex: 1, channel: 'CMS' })
        this.heSoList = coefRes?.data?.objects || coefRes?.data || []

        // 4. Lấy lớp học lại
        const retakeClassRes = await examResultServices.getRetakeCourses({ pageSize: 100, pageIndex: 1, channel: 'CMS' })
        this.retakeClassList = retakeClassRes?.data?.objects || retakeClassRes?.data || []
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu danh mục bộ lọc:', err)
      }
    },

    // Lấy danh sách kết quả chính (Xử lý cả trường hợp API bảng chính bị lỗi như bạn đề cập)
    async fetchData() {
      try {
        const params = {
          pageIndex: this.page,
          pageSize: this.pageSize,
          fullName: this.filters.keyword || '',
          channel: 'CMS'
        }

        const res = await examResultServices.getRetakeCourseResults(params)
        
        // In ra console để bạn mở F12 xem cấu trúc chính xác của backend trả về là gì
        console.log('API RetakeCourseResult response:', res)

        // Hứng linh hoạt tất cả các dạng cấu trúc dữ liệu trả về phổ biến của hệ thống
        const responseData = res?.data || res
        
        if (Array.isArray(responseData)) {
          this.resultList = responseData
        } else {
          this.resultList = 
            responseData?.objects || 
            responseData?.content || 
            responseData?.data?.objects || 
            responseData?.data?.content || 
            responseData?.data || 
            []
        }
      } catch (err) {
        console.warn('API bảng kết quả học lại đang gặp lỗi, chuyển sang cơ chế dự phòng:', err)
        
        // Đọc dữ liệu dự phòng từ localStorage nếu API lỗi 500
        const localData = localStorage.getItem('local_retake_course_results')
        if (localData) {
          this.resultList = JSON.parse(localData)
        } else {
          this.resultList = []
        }
      }
    },

    handleAdvancedSearch() {
      this.showAdvancedFilter = false
      this.fetchData()
    },

    goToPage() {
      const p = parseInt(this.pageInput, 10)
      if (p >= 1 && p <= this.totalPages) {
        this.page = p
        this.fetchData()
      } else {
        this.pageInput = String(this.page)
      }
    },

    onPageSizeChange() {
      this.page = 1
      this.pageInput = '1'
      this.fetchData()
    },

    prevPage() {
      if (this.page > 1) {
        this.page--
        this.pageInput = String(this.page)
        this.fetchData()
      }
    },

    nextPage() {
      if (this.page < this.totalPages) {
        this.page++
        this.pageInput = String(this.page)
        this.fetchData()
      }
    },
  },
}
</script>

<style scoped>
.text-red-bold {
  color: #a62229 !important;
}

.bg-gray-head {
  background-color: #f5f5f5;
}

.border-table {
  border: 0;
  border-radius: 0;
}

.custom-data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.custom-data-table th {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
  color: #333333;
}

.custom-data-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #eeeeee;
  color: #4a4a4a;
}

.filter-input >>> .v-input__slot,
.filter-select >>> .v-input__slot,
.modal-select >>> .v-input__slot {
  min-height: 36px !important;
  font-size: 13px !important;
}

.action-icon-btn {
  border: 0 !important;
  border-radius: 50% !important;
  width: 36px !important;
  height: 36px !important;
}

.search-btn {
  height: 36px !important;
  border-radius: 4px;
}

/* CSS PHÂN TRANG THEO THIẾT KẾ MỚI IN IMAGE */
.custom-pagination-select {
  width: 92px !important;
  flex: 0 0 92px;
}
.custom-pagination-select >>> .v-input__slot {
  min-height: 32px !important;
  height: 32px !important;
  padding: 0 6px !important;
  border-radius: 4px !important;
}
.custom-pagination-select >>> .v-select__slot,
.custom-pagination-select >>> .v-select__selections,
.custom-pagination-select >>> .v-input__append-inner {
  min-height: 32px !important;
  align-items: center;
}
.custom-pagination-select >>> .v-select__selection {
  font-size: 13px;
}

.custom-pagination-input {
  width: 64px !important;
  flex: 0 0 64px;
}
.custom-pagination-input >>> .v-input__slot {
  min-height: 32px !important;
  height: 32px !important;
  padding: 0 6px !important;
  border-radius: 4px !important;
}
.custom-pagination-input >>> input {
  text-align: center;
  font-size: 13px;
}
.custom-pagination-input >>> .v-input__slot,
.custom-pagination-input >>> .v-text-field__slot {
  align-items: center;
}

.custom-go-btn {
  height: 32px !important;
  min-width: 48px !important;
  border-radius: 4px !important;
  font-size: 13px !important;
  text-transform: none;
}

.custom-nav-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.custom-nav-btn:hover:not(:disabled) {
  background-color: #f5f5f5;
}

.custom-nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.text-grey-color {
  color: #9e9e9e;
}

.gap-1 {
  gap: 4px;
}
.gap-2 {
  gap: 8px;
}
.gap-3 {
  gap: 12px;
}

/* MODAL STYLES */
.advanced-filter-card {
  background-color: #ffffff;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  background-color: #a62229;
}

.btn-cancel {
  background: transparent;
  border: none;
  color: #333333;
  font-size: 14px;
  cursor: pointer;
  padding: 6px 12px;
}

.btn-search-modal {
  background-color: #a62229 !important;
  border-radius: 6px;
  height: 36px !important;
  padding: 0 16px !important;
}

/* QUẢN LÝ DANH SÁCH TOAST XẾP CHỒNG THÔNG BÁO */
.toast-container {
  position: fixed;
  top: 70px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.system-error-toast {
  width: 320px;
  overflow: hidden;
  border-radius: 6px;
  background-color: #ff5252;
  box-shadow: 0 4px 12px rgba(255, 82, 82, 0.3);
  animation: slideInRight 0.3s ease-out;
}

.system-error-toast-content {
  display: flex;
  min-height: 44px;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  font-size: 14px;
  font-weight: 500;
}

.system-error-toast-content span {
  flex: 1 1 auto;
}

.system-error-progress-track {
  width: 100%;
  height: 4px;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.3);
}

.system-error-progress {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  animation: systemErrorCountdown 4s linear forwards;
}

@keyframes systemErrorCountdown {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
