<template>
  <div class="page-wrapper pa-4">
    <!-- 1. HEADER (TIÊU ĐỀ & THANH CÔNG CỤ TÌM KIẾM) -->
    <div class="d-flex align-center justify-space-between mb-4 flex-wrap">
      <!-- Tiêu đề trang -->
      <div class="page-title text-body-1 font-weight-medium black--text">
        Danh sách cấu hình nhận email <span class="red-highlight font-weight-bold">(0)</span>
      </div>

      <!-- Cụm Tìm kiếm & Nút thao tác -->
      <div class="d-flex align-center flex-wrap" style="gap: 12px;">
        <!-- Ô input Tìm kiếm -->
        <v-text-field
          v-model="filters.keyword"
          placeholder="Tìm kiếm"
          outlined
          dense
          hide-details
          class="custom-input field-search"
          @keyup.enter="handleSearch"
        ></v-text-field>

        <!-- Select Trạng thái -->
        <v-select
          v-model="filters.status"
          :items="statusOptions"
          placeholder="Trạng thái"
          outlined
          dense
          hide-details
          clearable
          class="custom-input field-status"
        ></v-select>

        <!-- Icon Reset (Không viền) -->
        <v-btn icon small flat class="btn-reset" @click="resetFilters">
          <v-icon color="#a2212b" size="22">mdi-refresh</v-icon>
        </v-btn>

        <!-- Nút Tìm kiếm (Màu đỏ rượu) -->
        <v-btn
          color="#a2212b"
          dark
          elevation="0"
          height="38"
          min-width="48"
          class="px-0 btn-red-action"
          @click="handleSearch"
        >
          <v-icon size="20">mdi-magnify</v-icon>
        </v-btn>

        <!-- Nút Thêm mới (Màu đỏ rượu) -->
        <v-btn
          color="#a2212b"
          dark
          elevation="0"
          height="38"
          min-width="48"
          class="px-0 btn-red-action"
          @click="openAddModal"
        >
          <v-icon size="22">mdi-plus</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- 2. BẢNG DỮ LIỆU -->
    <v-card flat class="table-card">
      <v-data-table
        :headers="headers"
        :items="items"
        :loading="$store.state.isLoading"
        hide-default-footer
        no-data-text="Không có dữ liệu"
        class="custom-table"
      >
        <!-- Custom Cột Trạng thái (Pill màu đỏ) -->
        <template #[`item.status`]="{ item }">
          <v-select
            v-model="item.status"
            :items="statusOptions"
            dense
            solo
            flat
            hide-details
            class="status-select-pill"
            background-color="#a2212b"
            dark
            @change="(val) => handleStatusChange(item, val)"
          ></v-select>
        </template>

        <!-- Custom Cột Chức năng -->
        <template #[`item.actions`]="{ item }">
          <div class="d-flex align-center">
            <v-btn icon x-small class="mr-1" @click="viewItem(item)">
              <v-icon size="18" color="#1e88e5">mdi-eye</v-icon>
            </v-btn>
            <v-btn icon x-small class="mr-1" @click="editItem(item)">
              <v-icon size="18" color="#f57c00">mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon x-small @click="deleteItem(item)">
              <v-icon size="18" color="#d32f2f">mdi-delete</v-icon>
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- 3. THANH PHÂN TRANG (PAGINATION) -->
    <div class="d-flex align-center justify-end mt-4 pagination-container">
      <!-- Select Số bản ghi -->
      <div class="mr-3">
        <v-select
          v-model="pageSize"
          :items="[10, 20, 50, 100]"
          label="Bản ghi"
          outlined
          dense
          hide-details
          class="custom-outlined-input record-select"
          @change="fetchData"
        ></v-select>
      </div>

      <!-- Input Đi tới trang -->
      <div class="d-flex align-center mr-3">
        <v-text-field
          v-model="pageInput"
          label="Trang"
          outlined
          dense
          hide-details
          class="custom-outlined-input page-input"
        ></v-text-field>
        <v-btn
          color="#a2212b"
          dark
          elevation="0"
          class="btn-go ml-1 text-capitalize"
          @click="goToPage"
        >
          Đi
        </v-btn>
      </div>

      <!-- Điều hướng nút trang (< 1 >) -->
      <div class="d-flex align-center">
        <!-- Nút Trở lại -->
        <v-btn
          outlined
          class="btn-nav mr-2"
          :disabled="page <= 1"
          @click="changePage(page - 1)"
        >
          <v-icon small color="#666">mdi-chevron-left</v-icon>
        </v-btn>

        <!-- Trang hiện tại (Số 1 màu đỏ có shadow nhẹ) -->
        <v-btn
          color="#a2212b"
          dark
          elevation="2"
          class="btn-page-number mr-2"
        >
          {{ page }}
        </v-btn>

        <!-- Nút Kế tiếp -->
        <v-btn
          outlined
          class="btn-nav"
          :disabled="page >= totalPages"
          @click="changePage(page + 1)"
        >
          <v-icon small color="#666">mdi-chevron-right</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- 4. MODAL THÊM MỚI CẤU HÌNH NGƯỜI NHẬN MAIL -->
    <v-dialog v-model="dialog" max-width="650px" persistent>
      <v-card class="dialog-card rounded-lg">
        <v-card-title class="dialog-header py-3 px-4 d-flex justify-space-between align-center">
          <span class="text-subtitle-1 font-weight-medium white--text">
            Thêm mới cấu hình người nhận mail
          </span>
          <v-btn icon dark small @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-5">
          <v-form ref="form" v-model="valid">
            <v-row dense class="mt-1">
              <v-col cols="12" sm="8" class="pr-sm-2">
                <v-select
                  v-model="formModel.templateId"
                  :items="templateOptions"
                  label="Template email (*)"
                  no-data-text="Không có dữ liệu"
                  outlined
                  dense
                  hide-details="auto"
                  class="dialog-input"
                  :rules="[v => !!v || 'Vui lòng chọn template email']"
                ></v-select>
              </v-col>

              <v-col cols="12" sm="4" class="pl-sm-2 mt-3 mt-sm-0">
                <v-select
                  v-model="formModel.status"
                  :items="statusOptions"
                  label="Trạng thái (*)"
                  outlined
                  dense
                  hide-details="auto"
                  class="dialog-input red-label-input"
                  :rules="[v => v !== null && v !== undefined || 'Vui lòng chọn trạng thái']"
                ></v-select>
              </v-col>

              <v-col cols="12" class="mt-4">
                <v-text-field
                  v-model="formModel.receiverEmail"
                  label="Người nhận email (*)"
                  outlined
                  dense
                  hide-details="auto"
                  class="dialog-input"
                  :rules="[v => !!v || 'Vui lòng nhập email người nhận']"
                ></v-text-field>
              </v-col>

              <v-col cols="12" class="mt-4">
                <v-textarea
                  v-model="formModel.description"
                  label="Mô tả"
                  outlined
                  dense
                  rows="4"
                  hide-details
                  class="dialog-input"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-5 pb-5 pt-0 d-flex justify-end">
          <v-btn outlined class="btn-modal-close text-capitalize px-4 mr-2" @click="dialog = false">
            Đóng <v-icon small class="ml-1">mdi-close</v-icon>
          </v-btn>
          <v-btn color="#a2212b" dark elevation="0" class="btn-modal-save text-capitalize px-4" @click="saveItem">
            Lưu <v-icon small class="ml-1">mdi-content-save</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import configMailReceiverService from '~/services/configMailReceiver'

export default {
  name: 'CauHinhNhanEmailPage',
  middleware: 'authenticated',
  data() {
    return {
      dialog: false,
      valid: true,
      totalItems: 0,
      page: 1,
      pageSize: 50,
      pageInput: 1,
      totalPages: 1,
      filters: {
        keyword: '',
        status: null,
      },
      activeFilters: {
        keyword: '',
        status: null,
      },
      formModel: {
        templateId: null,
        status: 1,
        receiverEmail: '',
        description: '',
      },
      templateOptions: [],
      statusOptions: [
        { text: 'Kích hoạt', value: 1 },
        { text: 'Chưa kích hoạt', value: 0 },
      ],
      headers: [
        { text: 'STT', value: 'stt', width: '80px', align: 'start' },
        { text: 'Tên template email', value: 'templateName', align: 'start' },
        { text: 'Email người nhận', value: 'receiverEmail', align: 'start' },
        { text: 'Mô tả', value: 'description', align: 'start' },
        { text: 'Trạng thái', value: 'status', width: '140px', align: 'start' },
        { text: 'Chức năng', value: 'actions', width: '120px', sortable: false, align: 'start' },
      ],
      items: [],
    }
  },
  mounted() {
    this.$store.commit('SET_PAGE_TITLE', 'Cấu hình nhận email')
    this.fetchData()
  },
  methods: {
    async fetchData() {
      try {
        const params = {
          ...this.activeFilters,
          page: this.page,
          pageSize: this.pageSize,
        }
        const res = await configMailReceiverService.getList(params)
        if (res && res.success && res.data) {
          this.items = res.data.list || []
          this.templateOptions = [...new Set(this.items.map(item => item.templateName).filter(Boolean))]
          this.totalItems = res.data.total || 0
          this.totalPages = Math.ceil(this.totalItems / this.pageSize) || 1
        }
      } catch (error) {
        console.error(error)
      }
    },
    handleSearch() {
      this.activeFilters = { ...this.filters }
      this.page = 1
      this.pageInput = 1
      this.fetchData()
    },
    resetFilters() {
      this.filters = {
        keyword: '',
        status: null,
      }
      this.handleSearch()
    },
    openAddModal() {
      this.formModel = {
        templateId: null,
        status: 1,
        receiverEmail: '',
        description: '',
      }
      this.dialog = true
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.resetValidation()
      })
    },
    async saveItem() {
      if (this.$refs.form && !this.$refs.form.validate()) return

      this.dialog = false
      await this.fetchData()
    },
    viewItem(item) {},
    editItem(item) {},
    deleteItem(item) {},
    handleStatusChange(item, val) {},
    goToPage() {
      const p = parseInt(this.pageInput)
      if (p >= 1 && p <= this.totalPages) {
        this.page = p
        this.fetchData()
      }
    },
    changePage(p) {
      this.page = p
      this.pageInput = p
      this.fetchData()
    },
  },
}
</script>

<style scoped>
/* Highlight chữ (0) màu đỏ */
.red-highlight {
  color: #a2212b !important;
}

/* ============================================================
   LÀM SẠCH KHUNG VIỀN CỦA VUETIFY (CHỈ GIỮ LẠI 1 KHUNG VIỀN)
   ============================================================ */

/* Xóa đường viền mặc định của thuộc tính outlined từ Vuetify */
.custom-input >>> fieldset,
.custom-outlined-input >>> fieldset,
.dialog-input >>> fieldset {
  display: none !important;
}

/* Style Khung duy nhất cho Tìm kiếm & Trạng thái */
.custom-input >>> .v-input__slot {
  min-height: 38px !important;
  height: 38px !important;
  border-radius: 4px !important;
  border: 1px solid #797979 !important;
  background-color: #ffffff !important;
  box-shadow: none !important;
}

.field-search {
  width: 200px;
}

.field-status {
  width: 150px;
}

/* Các nút thao tác */
.btn-red-action {
  border-radius: 4px !important;
}

/* Bảng dữ liệu */
.table-card {
  border-radius: 0px !important;
  border-top: 1px solid #e0e0e0;
}

.custom-table >>> table {
  border-collapse: collapse;
}

.custom-table >>> th {
  background-color: #efefef !important;
  color: #000000 !important;
  font-weight: 600 !important;
  font-size: 0.85rem !important;
  height: 42px !important;
}

.custom-table >>> td {
  font-size: 0.85rem !important;
  color: #333333 !important;
  height: 44px !important;
}

/* Trạng thái bảng không có dữ liệu */
.custom-table >>> .v-data-table__empty-wrapper td {
  color: #888888 !important;
  border-bottom: 1px solid #e0e0e0 !important;
  text-align: center !important;
}

/* Pill Trạng thái màu đỏ */
.status-select-pill >>> .v-input__slot {
  min-height: 28px !important;
  max-width: 120px !important;
  padding: 0 10px !important;
  border-radius: 14px !important;
}

/* Khung duy nhất cho Bản ghi & Trang */
.custom-outlined-input >>> .v-input__slot {
  position: relative !important;
  min-height: 38px !important;
  height: 38px !important;
  border-radius: 4px !important;
  border: 1px solid #797979 !important;
  padding: 0 8px !important;
  background-color: #ffffff !important;
  box-shadow: none !important;
}

/* Nhãn 'Bản ghi' và 'Trang' đè lên đường viền */
.custom-outlined-input >>> .v-label {
  position: absolute !important;
  top: -9px !important;
  left: 8px !important;
  transform: none !important;
  font-size: 0.78rem !important;
  color: #555555 !important;
  background-color: #ffffff !important;
  padding: 0 4px !important;
  z-index: 2;
}

.custom-outlined-input >>> .v-select__selection,
.custom-outlined-input >>> input {
  position: relative !important;
  z-index: 1 !important;
  margin-top: 4px !important;
}

.record-select {
  width: 80px !important;
}

.page-input {
  width: 58px !important;
}

.page-input >>> input {
  text-align: center !important;
  padding: 0 !important;
}

/* Nút Đi */
.btn-go {
  height: 38px !important;
  min-width: 48px !important;
  border-radius: 4px !important;
  background-color: #a2212b !important;
  font-size: 0.9rem !important;
}

/* Nút điều hướng */
.btn-nav {
  height: 38px !important;
  width: 38px !important;
  min-width: 38px !important;
  padding: 0 !important;
  border-radius: 4px !important;
  border: 1px solid #e0e0e0 !important;
  background-color: #ffffff !important;
}

/* Ô số trang màu đỏ */
.btn-page-number {
  height: 38px !important;
  width: 38px !important;
  min-width: 38px !important;
  padding: 0 !important;
  border-radius: 4px !important;
  background-color: #a2212b !important;
  font-weight: bold;
}

/* Modal thêm mới cấu hình người nhận mail */
.dialog-header {
  background-color: #a2212b !important;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.dialog-input >>> .v-input__slot {
  border-radius: 4px !important;
  border: 1px solid #a0a0a0 !important;
  background-color: #ffffff !important;
  box-shadow: none !important;
}

.dialog-input >>> .v-label {
  top: -6px !important;
  font-size: 0.8rem !important;
  color: #666666 !important;
  background-color: #ffffff !important;
  padding: 0 4px !important;
  z-index: 2;
}

.red-label-input >>> .v-label {
  color: #d32f2f !important;
}

.btn-modal-close {
  border: 1px solid #a0a0a0 !important;
  border-radius: 4px !important;
  height: 36px !important;
  color: #333333 !important;
}

.btn-modal-save {
  border-radius: 4px !important;
  height: 36px !important;
  background-color: #a2212b !important;
}
</style>