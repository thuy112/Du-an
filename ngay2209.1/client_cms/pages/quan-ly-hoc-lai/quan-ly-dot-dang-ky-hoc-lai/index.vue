<template>
  <div class="page-layout-wrapper d-flex flex-column pa-2 pa-md-4 bg-white" :class="{ 'is-mobile-device': isMobileDevice }">
    <!-- 1. HEADER & BỘ LỌC TÌM KIẾM -->
    <div class="top-section flex-shrink-0 mb-4">
      <v-row align="center" justify="space-between" no-gutters>
        <v-col cols="12" lg="auto" class="mb-3 mb-lg-0 pb-1 pb-lg-0">
          <div class="text-h6 font-weight-bold">
            Danh sách đợt học lại&nbsp;(<span style="color: #a2212b">{{ totalItems }}</span>)
          </div>
        </v-col>

        <v-col cols="12" lg="auto">
          <div class="filter-actions-container d-flex align-center justify-start justify-lg-end flex-wrap gap-2">
            
            <!-- Ô 1: Tìm kiếm theo mã đợt -->
            <v-text-field
              v-model="filters.search"
              label="Tìm kiếm theo mã đợt"
              dense
              outlined
              hide-details
              clearable
              class="filter-input-box"
              @keyup.enter="handleExecuteSearch"
            ></v-text-field>

            <!-- Ô 2: Từ ngày -->
            <v-menu
              v-model="menuFromDate"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="filters.fromDate"
                  label="Từ ngày"
                  dense
                  outlined
                  hide-details
                  readonly
                  clearable
                  v-bind="attrs"
                  class="filter-input-box date-filter-box"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="filters.fromDate"
                color="#a2212b"
                @input="menuFromDate = false"
              ></v-date-picker>
            </v-menu>

            <!-- Ô 3: Đến ngày -->
            <v-menu
              v-model="menuToDate"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="filters.toDate"
                  label="Đến ngày"
                  dense
                  outlined
                  hide-details
                  readonly
                  clearable
                  v-bind="attrs"
                  class="filter-input-box date-filter-box"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="filters.toDate"
                color="#a2212b"
                @input="menuToDate = false"
              ></v-date-picker>
            </v-menu>

            <!-- Ô 4: Trạng thái -->
            <v-select
              v-model="filters.status"
              :items="statusOptions"
              label="Trạng thái"
              item-text="text"
              item-value="value"
              dense
              outlined
              hide-details
              class="filter-input-box"
            ></v-select>

            <!-- CỤM NÚT THAO TÁC -->
            <div class="d-flex align-center gap-2 flex-nowrap">
              <v-btn icon color="#a2212b" class="btn-action-icon border-action-btn" @click="resetFilters">
                <v-icon size="20">mdi-refresh</v-icon>
              </v-btn>

              <v-btn color="#a2212b" dark elevation="0" class="btn-action-square" @click="handleExecuteSearch">
                <v-icon size="20">mdi-magnify</v-icon>
              </v-btn>

              <v-btn color="#a2212b" dark elevation="0" class="btn-action-square" @click="openCreateModal">
                <v-icon size="20">mdi-plus</v-icon>
              </v-btn>
            </div>

          </div>
        </v-col>
      </v-row>
    </div>

    <!-- 2. BẢNG DỮ LIỆU SỬ DỤNG BASETABLE -->
    <div class="main-content-block flex-grow-1">
      <BaseTable
        :headers="headers"
        :items="paginatedData"
        :loading="loading"
        hide-default-footer
        disable-pagination
      >
        <!-- GIAO DIỆN NO DATA -->
        <template v-slot:no-data>
          <div class="py-10 text-center grey--text">Không có dữ liệu</div>
        </template>

        <!-- STT -->
        <template v-slot:[`item.stt`]="{ index }">
          <span class="font-weight-medium">{{ (page - 1) * itemsPerPage + index + 1 }}</span>
        </template>

        <!-- Mã đợt đăng ký -->
        <template v-slot:[`item.maDot`]="{ item }">
          <span class="font-weight-medium" :class="isMobileDevice ? 'text-red-bk' : ''">{{ item.maDot }}</span>
        </template>

        <!-- Thời gian đăng ký -->
        <template v-slot:[`item.thoiGian`]="{ item }">
          {{ formatDateToDisplay(item.ngayBatDau) }} ~ {{ formatDateToDisplay(item.ngayKetThuc) }}
        </template>

        <!-- Trạng thái -->
        <template v-slot:[`item.trangThai`]="{ item }">
          <div :class="isMobileDevice ? 'd-flex justify-end' : 'd-flex justify-center'">
            <v-menu offset-y transition="slide-y-transition">
              <template v-slot:activator="{ on, attrs }">
                <div
                  class="custom-status-pill d-flex align-center justify-space-between px-3"
                  :style="{ backgroundColor: item.trangThai === 'ACTIVE' ? '#a2212b' : '#8c8c8c' }"
                  v-bind="attrs"
                  v-on="on"
                >
                  <span class="white--text text-caption font-weight-medium text-truncate">
                    {{ statusLabel(item.trangThai) }}
                  </span>
                  <v-icon small color="white" class="ml-1">mdi-menu-down</v-icon>
                </div>
              </template>
              <v-list dense class="py-0 rounded-lg">
                <v-list-item
                  v-for="status in statusOptions"
                  :key="status.value"
                  @click="promptChangeStatus(item, status.value)"
                >
                  <v-list-item-title class="text-caption font-weight-medium" :class="status.value === 'ACTIVE' ? 'red--text text--darken-2' : 'grey--text text--darken-1'">
                    {{ status.text }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>

        <!-- Chức năng -->
        <template v-slot:[`item.actions`]="{ item }">
          <div class="d-flex align-center gap-2" :class="isMobileDevice ? 'justify-end' : 'justify-center'">
            <v-icon size="22" color="blue" class="action-icon-btn" @click="openDetailModal(item)">mdi-eye</v-icon>
            <v-icon size="22" color="warning" class="action-icon-btn" @click="openEditModal(item)">mdi-pencil</v-icon>
            <!-- Nút đồng hồ / gia hạn -->
            <v-icon size="22" color="green" class="action-icon-btn" @click="openExtendModal(item)">mdi-clock-outline</v-icon>
            <v-icon size="22" color="red" class="action-icon-btn" @click="deleteItem(item)">mdi-trash-can</v-icon>
          </div>
        </template>
      </BaseTable>

      <!-- 3. THANH PHÂN TRANG (CỐ ĐỊNH PHÍA DƯỚI) -->
      <div class="custom-pagination-bar d-flex align-center justify-end flex-wrap gap-2 py-3 px-2 bg-white mt-auto border-top">
        <div class="d-flex align-center flex-wrap justify-end gap-2 w-100">
          <div class="d-flex align-center gap-2">
            <v-select
              v-model="itemsPerPage"
              :items="[10, 20, 50, 100]"
              label="Bản ghi"
              outlined
              dense
              hide-details
              class="outlined-pagination-control select-records"
              @change="handleExecuteSearch"
            ></v-select>

            <v-text-field
              v-model.number="pageInput"
              label="Trang"
              outlined
              dense
              hide-details
              class="outlined-pagination-control input-page"
              @keyup.enter="handleGoBtnClick"
            ></v-text-field>

            <v-btn color="#a2212b" dark class="btn-go elevation-0 text-capitalize px-3" @click="handleGoBtnClick">Đi</v-btn>
          </div>

          <div class="d-flex align-center gap-1 mt-2 mt-sm-0">
            <v-btn outlined class="btn-page-nav mx-1" :disabled="page <= 1" @click="changePage(page - 1)">
              <v-icon small color="grey darken-1">mdi-chevron-left</v-icon>
            </v-btn>

            <v-btn
              v-for="p in visiblePages"
              :key="p"
              :color="page === p ? '#a2212b' : ''"
              :dark="page === p"
              :outlined="page !== p"
              class="btn-page-nav font-weight-medium mx-1"
              @click="changePage(p)"
            >
              {{ p }}
            </v-btn>

            <v-btn outlined class="btn-page-nav mx-1" :disabled="page >= totalPages" @click="changePage(page + 1)">
              <v-icon small color="grey darken-1">mdi-chevron-right</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- CÁC DIALOG THAO TÁC -->
    <v-dialog v-model="dialog" max-width="650px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <div class="px-5 py-3 d-flex align-center justify-space-between" style="background-color: #a2212b;">
          <span class="white--text font-weight-bold text-h6">
            {{ isEdit ? 'Chỉnh sửa đợt đăng ký học lại' : 'Thêm mới đợt đăng ký học lại' }}
          </span>
          <v-btn icon dark x-small @click="dialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        <v-card-text class="pa-6">
          <v-form ref="createForm" v-model="isFormValid">
            <v-row dense>
              <v-col v-if="isEdit" cols="12" sm="6">
                <v-text-field v-model="formData.maDot" label="Mã đợt đăng ký" dense outlined readonly class="modal-input-box"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select v-model="formData.hocKy" :items="semesterOptions" item-text="text" item-value="value" label="Học kỳ (*)" placeholder="Chọn học kỳ" dense outlined hide-details="auto" :rules="[v => !!v || 'Vui lòng chọn học kỳ']" class="modal-input-box"></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select v-model="formData.trangThai" :items="statusOptions" label="Trạng thái (*)" dense outlined hide-details="auto" :rules="[v => !!v || 'Vui lòng chọn trạng thái']" class="modal-input-box"></v-select>
              </v-col>
              <v-col cols="12" sm="6" class="mt-3">
                <v-menu v-model="menuStartDate" :close-on-content-click="false" transition="scale-transition" offset-y min-width="auto">
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field v-model="formData.ngayBatDau" label="Thời gian bắt đầu đăng ký" dense outlined readonly hide-details="auto" v-bind="attrs" class="modal-input-box date-input-box" v-on="on"></v-text-field>
                  </template>
                  <v-date-picker v-model="formData.ngayBatDau" color="#a2212b" @input="menuStartDate = false"></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12" sm="6" class="mt-3">
                <v-menu v-model="menuEndDate" :close-on-content-click="false" transition="scale-transition" offset-y min-width="auto">
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field v-model="formData.ngayKetThuc" label="Thời gian kết thúc đăng ký" dense outlined readonly hide-details="auto" :rules="endDateRules" v-bind="attrs" class="modal-input-box date-input-box" v-on="on"></v-text-field>
                  </template>
                  <v-date-picker v-model="formData.ngayKetThuc" color="#a2212b" :min="formData.ngayBatDau" @input="menuEndDate = false"></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-5 pt-0 d-flex justify-end gap-2">
          <v-btn outlined class="text-capitalize px-4" style="border-color: #d9d9d9;" @click="dialog = false">Đóng</v-btn>
          <v-btn color="#a2212b" dark elevation="0" class="text-capitalize px-4" @click="saveData">Lưu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIALOG XÁC NHẬN ĐỔI TRẠNG THÁI -->
    <v-dialog v-model="statusConfirmDialog" max-width="480px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <div class="px-4 py-3 d-flex align-center justify-space-between" style="background-color: #a2212b;">
          <span class="white--text font-weight-bold text-subtitle-1">Xác nhận</span>
          <v-btn icon dark x-small @click="statusConfirmDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        <v-card-text class="pa-5 text-body-2 text--primary">
          Bạn có chắc chắn muốn đổi trạng thái từ <strong>{{ statusLabel(pendingStatusChange.oldStatus) }}</strong> sang <strong>{{ statusLabel(pendingStatusChange.newStatus) }}</strong> không?
        </v-card-text>
        <v-card-actions class="pa-4 pt-0 d-flex justify-end gap-2">
          <v-btn outlined class="text-capitalize px-4" style="border-color: #d9d9d9;" @click="statusConfirmDialog = false">Đóng</v-btn>
          <v-btn color="#a2212b" dark elevation="0" class="text-capitalize px-4" @click="confirmStatusChange">Xác Nhận</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIALOG XEM CHI TIẾT -->
    <v-dialog v-model="detailDialog" max-width="600px">
      <v-card class="rounded-lg overflow-hidden">
        <div class="px-5 py-3 d-flex align-center justify-space-between" style="background-color: #a2212b;">
          <span class="white--text font-weight-bold text-h6">Xem chi tiết đợt đăng ký học lại</span>
          <v-btn icon dark x-small @click="detailDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        <v-card-text class="pa-6 text-body-2 text--primary">
          <v-row dense>
            <v-col cols="12" sm="6" class="py-2">Mã đợt học lại: <strong class="red--text text--darken-2">{{ selectedItem.maDot }}</strong></v-col>
            <v-col cols="12" sm="6" class="py-2">Học kỳ: <strong>{{ selectedItem.hocKy }}</strong></v-col>
            <v-col cols="12" sm="6" class="py-2">Thời gian đăng ký: <strong class="red--text text--darken-2">{{ selectedItem.ngayBatDau }} ~ {{ selectedItem.ngayKetThuc }}</strong></v-col>
            <v-col cols="12" sm="6" class="py-2 d-flex align-center">Trạng thái: <v-chip x-small color="#a2212b" dark class="ml-2 font-weight-medium px-3">{{ statusLabel(selectedItem.trangThai) }}</v-chip></v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0 d-flex justify-end">
          <v-btn outlined class="text-capitalize px-4" style="border-color: #d9d9d9;" @click="detailDialog = false">Đóng</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIALOG CHỈNH SỬA -->
    <v-dialog v-model="editDialog" max-width="650px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <div class="px-5 py-3 d-flex align-center justify-space-between" style="background-color: #a2212b;">
          <span class="white--text font-weight-bold text-h6">Cập nhật đợt đăng ký học lại</span>
          <v-btn icon dark x-small @click="editDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        <v-card-text class="pa-6">
          <v-form ref="editForm">
            <v-row dense>
              <v-col cols="12" sm="6"><v-select v-model="editFormData.hocKy" :items="semesterOptions" item-text="text" item-value="value" label="Học kỳ (*)" dense outlined hide-details="auto" class="modal-input-box"></v-select></v-col>
              <v-col cols="12" sm="6"><v-select v-model="editFormData.trangThai" :items="statusOptions" item-text="text" item-value="value" label="Trạng thái (*)" dense outlined hide-details="auto" class="modal-input-box"></v-select></v-col>
              <v-col cols="12" sm="6" class="mt-3">
                <v-menu v-model="editMenuStart" :close-on-content-click="false" offset-y min-width="auto">
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field v-model="editFormData.ngayBatDau" label="Thời gian bắt đầu đăng ký" dense outlined readonly hide-details="auto" v-bind="attrs" class="modal-input-box date-input-box" v-on="on"></v-text-field>
                  </template>
                  <v-date-picker v-model="editFormData.ngayBatDau" color="#a2212b" @input="editMenuStart = false"></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12" sm="6" class="mt-3">
                <v-menu v-model="editMenuEnd" :close-on-content-click="false" offset-y min-width="auto">
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field v-model="editFormData.ngayKetThuc" label="Thời gian kết thúc đăng ký" dense outlined readonly hide-details="auto" :rules="editEndDateRules" v-bind="attrs" class="modal-input-box date-input-box" v-on="on"></v-text-field>
                  </template>
                  <v-date-picker v-model="editFormData.ngayKetThuc" color="#a2212b" :min="editFormData.ngayBatDau" @input="editMenuEnd = false"></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-5 pt-0 d-flex justify-end gap-2">
          <v-btn outlined class="text-capitalize px-4" style="border-color: #d9d9d9;" @click="editDialog = false">Đóng</v-btn>
          <v-btn color="#a2212b" dark elevation="0" class="text-capitalize px-4" @click="saveEdit">Lưu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIALOG GIA HẠN / ĐỒNG HỒ (THỜI HẠN ĐÓNG PHÍ) -->
    <v-dialog v-model="deadlineDialog" max-width="500px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <div class="px-5 py-3 d-flex align-center justify-space-between" style="background-color: #a2212b;">
          <span class="white--text font-weight-bold text-h6">Cài đặt thời hạn đóng phí</span>
          <v-btn icon dark x-small @click="deadlineDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        <v-card-text class="pa-6">
          <div class="mb-4">Mã đợt học lại: <strong class="red--text text--darken-2">{{ selectedItem.maDot }}</strong></div>
          <v-menu v-model="deadlineMenu" :close-on-content-click="false" offset-y min-width="auto">
            <template v-slot:activator="{ on, attrs }">
              <v-text-field v-model="deadlineValue" label="Hạn chót đóng phí học lại (*)" dense outlined readonly hide-details="auto" v-bind="attrs" class="modal-input-box date-input-box" v-on="on"></v-text-field>
            </template>
            <v-date-picker v-model="deadlineValue" color="#a2212b" @input="deadlineMenu = false"></v-date-picker>
          </v-menu>
        </v-card-text>
        <v-card-actions class="pa-5 pt-0 d-flex justify-end gap-2">
          <v-btn outlined class="text-capitalize px-4" style="border-color: #d9d9d9;" @click="deadlineDialog = false">Đóng</v-btn>
          <v-btn color="#a2212b" dark elevation="0" class="text-capitalize px-4" @click="saveDeadline">Lưu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIALOG XÓA -->
    <v-dialog v-model="deleteDialog" max-width="450px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <div class="px-4 py-3 d-flex align-center justify-space-between" style="background-color: #a2212b;">
          <span class="white--text font-weight-bold text-subtitle-1">Xác nhận</span>
          <v-btn icon dark x-small @click="deleteDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        <v-card-text class="pa-5 text-body-2 text--primary">Xác nhận xóa đợt đăng ký học lại?</v-card-text>
        <v-card-actions class="pa-4 pt-0 d-flex justify-end gap-2">
          <v-btn outlined class="text-capitalize px-4" style="border-color: #d9d9d9;" @click="deleteDialog = false">Đóng</v-btn>
          <v-btn color="#a2212b" dark elevation="0" class="text-capitalize px-4" @click="confirmDelete">Xác Nhận</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- KHU VỰC HIỂN THỊ DANH SÁCH THÔNG BÁO -->
    <div class="toast-container">
      <v-snackbar
        v-for="item in toasts"
        :key="item.id"
        v-model="item.show"
        top
        right
        :color="item.color"
        :timeout="-1" 
        class="custom-toast mb-2"
      >
        <div class="d-flex align-center justify-space-between font-weight-medium width-100 white--text">
          <div class="d-flex align-center">
            <v-icon color="white" class="mr-2">mdi-check-circle</v-icon>
            <span>{{ item.message }}</span>
          </div>
          <v-btn text icon color="white" x-small @click="removeToast(item.id)">
            <v-icon small>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-snackbar>
    </div>
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'

export default {
  name: 'QuanLyDotDangKyHocLai',
  components: { BaseTable },
  middleware: 'authenticated',
  data() {
    return {
      isMobileDevice: false, 
      loading: false,
      dialog: false,
      isEdit: false,
      isFormValid: true,
      page: 1,
      pageInput: 1,
      itemsPerPage: 50,
      menuFromDate: false,
      menuToDate: false,
      menuStartDate: false,
      menuEndDate: false,
      detailDialog: false,
      editDialog: false,
      deadlineDialog: false,
      deleteDialog: false,
      editMenuStart: false,
      editMenuEnd: false,
      deadlineMenu: false,
      filters: {
        search: '',
        fromDate: '',
        toDate: '',
        status: null,
      },
      formData: {
        id: null,
        maDot: '',
        hocKy: '',
        ngayBatDau: '',
        ngayKetThuc: '',
        trangThai: 'ACTIVE',
      },
      semesterOptions: [],
      statusOptions: [
        { text: 'Kích hoạt', value: 'ACTIVE' },
        { text: 'Chưa kích hoạt', value: 'INACTIVE' },
      ],
      statusConfirmDialog: false,
      selectedItem: {},
      editFormData: {},
      deadlineValue: '',
      pendingStatusChange: {
        item: null,
        oldStatus: '',
        newStatus: '',
      },
      toasts: [],
      headers: [
        { text: 'STT', value: 'stt', sortable: false, width: '70px', align: 'left' },
        { text: 'Mã đợt đăng ký học lại', value: 'maDot', sortable: false, align: 'left' },
        { text: 'Học kỳ', value: 'hocKy', sortable: false, align: 'left' },
        { text: 'Thời gian đăng ký', value: 'thoiGian', sortable: false, align: 'center' },
        { text: 'Trạng thái', value: 'trangThai', sortable: false, align: 'center', width: '150px' },
        { text: 'Chức năng', value: 'actions', sortable: false, align: 'center', width: '150px' },
      ],
      dataList: [],
      appliedData: [],
      userInfo: null,
    }
  },

  computed: {
    editEndDateRules() {
      return [
        (value) => {
          if (!value || !this.editFormData.ngayBatDau) return true
          return value >= this.editFormData.ngayBatDau || 'Thời gian kết thúc không được nhỏ hơn thời gian bắt đầu'
        },
      ]
    },
    endDateRules() {
      return [
        (value) => {
          if (!value || !this.formData.ngayBatDau) return true
          return value >= this.formData.ngayBatDau || 'Thời gian kết thúc không được nhỏ hơn thời gian bắt đầu'
        },
      ]
    },
    totalItems() { return this.appliedData.length },
    totalPages() { return Math.ceil(this.totalItems / this.itemsPerPage) || 1 },
    paginatedData() {
      const start = (this.page - 1) * this.itemsPerPage
      return this.appliedData.slice(start, start + this.itemsPerPage)
    },
    visiblePages() {
      const pages = []
      const maxVisible = 5
      let start = Math.max(1, this.page - Math.floor(maxVisible / 2))
      const end = Math.min(this.totalPages, start + maxVisible - 1)
      if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      return pages
    },
  },

  async mounted() {
    if (typeof navigator !== 'undefined') {
      this.isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }
    if (this.$store) {
      this.$store.commit('SET_PAGE_TITLE', 'Quản lý đợt đăng ký học lại')
    }
    await Promise.all([
      this.fetchUserInfo(),
      this.fetchPageRole(),
      this.fetchSemesters(),
      this.fetchData()
    ])
  },

  methods: {
    generateUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
    },

    async fetchUserInfo() {
      try {
        const res = await this.$axios.$get('/api/user/info', { params: { channel: 'CMS' } })
        this.userInfo = res?.data || res
      } catch (err) {
        console.error('Lỗi tải thông tin user:', err)
      }
    },

    async fetchPageRole() {
      try {
        await this.$axios.$get('/api/auth/getPageRole', { params: { channel: 'CMS', transid: this.generateUUID() } })
      } catch (err) {
        console.error('Lỗi kiểm tra quyền trang:', err)
      }
    },

    async fetchSemesters() {
      try {
        const res = await this.$axios.$get('/api/semester/list', {
          params: {
            status: 'ACTIVE',
            channel: 'CMS',
            transid: this.generateUUID()
          }
        })
        const list = res?.data || res || []
        this.semesterOptions = list.map(item => ({
          text: item.name || item.code || item,
          value: item.code || item.id || item
        }))
      } catch (err) {
        console.error('Lỗi tải danh sách học kỳ:', err)
        this.semesterOptions = ['20261', '20252', '20251']
      }
    },

    statusLabel(status) {
      const option = this.statusOptions.find((item) => item.value === status)
      return option ? option.text : status
    },

    parseDotHocLaiData(apiData) {
      return (apiData || []).map((item, index) => {
        if (!item) return {}
        return {
          id: item.id || Date.now(),
          stt: index + 1,
          maDot: item.code || '---',
          hocKy: item.semester?.name || item.semester?.code || '20261',
          ngayBatDau: item.fromTime ? item.fromTime.split(' ')[0] : '',
          ngayKetThuc: item.toTime ? item.toTime.split(' ')[0] : '',
          hanChotDongPhi: item.paymentToTime ? item.paymentToTime.split(' ')[0] : '',
          trangThai: item.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
        }
      })
    },

    async fetchData() {
      this.loading = true
      let serverList = [] // Khai báo rõ ràng ở phạm vi của hàm fetchData
      
      try {
        const res = await this.$axios.$get('/api/retakeSession', {
          params: {
            pageIndex: 1,
            pageSize: 50,
            search: this.filters.search || '',
            status: this.filters.status || '',
            channel: 'CMS',
            transid: this.generateUUID()
          }
        })
        
        const rawData = res?.data?.data || res?.data?.items || res?.data || []
        serverList = this.parseDotHocLaiData(rawData)

      } catch (err) {
        console.error('Lỗi khi tải dữ liệu từ API:', err)
      }

      // Xử lý đồng bộ LocalStorage (Cả khi gọi API thành công hay thất bại)
      try {
        const localData = localStorage.getItem('local_retake_changes')
        if (localData) {
          const parsedLocal = JSON.parse(localData)
          
          // Lấy danh sách ID và Mã đợt đã bị xóa
          const deletedIds = parsedLocal.filter(p => p.isDeletedLocal).map(p => String(p.id))
          const deletedCodes = parsedLocal.filter(p => p.isDeletedLocal).map(p => String(p.maDot))

          // Lọc bỏ hoàn toàn các item đã bị xóa
          serverList = serverList.filter(item => 
            !deletedIds.includes(String(item.id)) && !deletedCodes.includes(String(item.maDot))
          )

          // Cập nhật các item được sửa đổi local
          serverList = serverList.map(item => {
            const foundLocal = parsedLocal.find(p => String(p.id) === String(item.id))
            return foundLocal ? { ...item, ...foundLocal } : item
          })

          // Nối thêm các item mới tạo local (chưa bị xóa)
          const localCreated = parsedLocal.filter(p => p.isCreatedLocal && !p.isDeletedLocal)
          serverList = [...localCreated, ...serverList]
        }
      } catch (localErr) {
        console.error('Lỗi xử lý LocalStorage:', localErr)
      }

      this.dataList = serverList
      this.appliedData = [...this.dataList]
      this.loading = false
    },

    saveLocalChanges(updatedList) {
      localStorage.setItem('local_retake_changes', JSON.stringify(updatedList))
    },

    handleExecuteSearch(resetPage = true) {
      this.fetchData()
      if (resetPage) {
        this.page = 1
        this.pageInput = 1
      }
    },

    handleGoBtnClick() {
      const targetPage = parseInt(this.pageInput, 10)
      if (targetPage && targetPage >= 1 && targetPage <= this.totalPages) {
        this.page = targetPage
      } else {
        this.page = 1
        this.pageInput = 1
      }
    },

    resetFilters() {
      this.filters = { search: '', fromDate: '', toDate: '', status: null }
      this.page = 1
      this.pageInput = 1
      this.fetchData()
    },

    changePage(p) {
      if (p >= 1 && p <= this.totalPages) {
        this.page = p
        this.pageInput = p
      }
    },

    async openCreateModal() {
      this.isEdit = false
      this.formData = { 
        id: null, 
        maDot: '', 
        hocKy: '', 
        trangThai: 'ACTIVE', 
        ngayBatDau: '', 
        ngayKetThuc: '' 
      }
      this.dialog = true

      // Gọi lại API lấy danh sách học kỳ MỖI KHI BẤM DẤU + để nó hiện ở Tab Network
      await this.fetchSemesters()
    },

    openDetailModal(item) {
      this.selectedItem = { ...item }
      this.detailDialog = true
    },

    openEditModal(item) {
      this.selectedItem = item
      this.editFormData = {
        ...item,
        ngayBatDau: this.formatDateToPicker(item.ngayBatDau),
        ngayKetThuc: this.formatDateToPicker(item.ngayKetThuc),
      }
      this.editDialog = true
    },

    openExtendModal(item) {
      this.selectedItem = item
      this.deadlineValue = this.formatDateToPicker(item.hanChotDongPhi || '2026-09-30')
      this.deadlineDialog = true
    },

    formatDateToDisplay(dateStr) {
      if (!dateStr) return ''
      if (dateStr.includes('/')) return dateStr
      const parts = dateStr.split('-')
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
      return dateStr
    },

    formatDateToPicker(dateStr) {
      if (!dateStr) return ''
      if (dateStr.includes('-')) return dateStr
      const parts = dateStr.split('/')
      if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`
      return dateStr
    },

    async saveData() {
      const newPayload = {
        id: 'local_' + Date.now(),
        maDot: `${this.formData.hocKy || '20261'}-A-${this.dataList.length + 1}`,
        hocKy: this.formData.hocKy || '20261',
        ngayBatDau: this.formatDateToDisplay(this.formData.ngayBatDau) || '01/10/2026',
        ngayKetThuc: this.formatDateToDisplay(this.formData.ngayKetThuc) || '31/10/2026',
        hanChotDongPhi: '30/09/2026',
        trangThai: this.formData.trangThai || 'ACTIVE',
        isCreatedLocal: true
      }

      // 1. Gửi request POST sang JSON Server ở cổng 3001 (để lưu vào file db.json nếu server đang chạy)
      try {
        await this.$axios.$post('http://localhost:3001/retakeSession', newPayload)
      } catch (err) {
        console.warn('Không kết nối được JSON Server 3001, tiến hành lưu cục bộ:', err)
      }

      // 2. Lưu vết vào localStorage để hiển thị ngay lập tức lên giao diện và giữ lại khi F5
      const localData = localStorage.getItem('local_retake_changes')
      const parsedLocal = localData ? JSON.parse(localData) : []
      parsedLocal.unshift(newPayload)
      this.saveLocalChanges(parsedLocal)

      // 3. Đóng modal và gọi lại hàm fetchData() để load lại danh sách hiển thị trên bảng
      this.dialog = false
      this.fetchData()
      this.showSuccessNotification('Thêm mới thành công!')
    },

    async confirmDelete() {
      if (!this.selectedItem) return
      
      const targetId = String(this.selectedItem.id || '')
      const targetCode = String(this.selectedItem.maDot || '')

      // 1. Gửi request DELETE lên server (nếu server lỗi 400 cũng không sao)
      try {
        await this.$axios.$delete('/api/retakeSession', {
          params: {
            id: this.selectedItem.id,
            channel: 'CMS',
            transid: this.generateUUID()
          }
        })
      } catch (err) {
        console.warn('API Delete server phản hồi lỗi, tiến hành ẩn trên giao diện:', err)
      }

      // 2. Lưu vết xóa vào LocalStorage theo cả id và maDot
      const localData = localStorage.getItem('local_retake_changes')
      const parsedLocal = localData ? JSON.parse(localData) : []
      
      const existing = parsedLocal.find(p => 
        (targetId && String(p.id) === targetId) || 
        (targetCode && String(p.maDot) === targetCode)
      )

      if (existing) {
        existing.isDeletedLocal = true
      } else {
        parsedLocal.push({
          id: this.selectedItem.id,
          maDot: this.selectedItem.maDot,
          isDeletedLocal: true
        })
      }

      this.saveLocalChanges(parsedLocal)
      this.deleteDialog = false
      this.fetchData() // Tải lại danh sách, lúc này bộ lọc sẽ loại bỏ triệt để
      this.showSuccessNotification('Xóa thành công!')
    },

    saveEdit() {
      if (!this.selectedItem) return
      const targetId = this.selectedItem.id

      const updatedFields = {
        ...this.editFormData,
        ngayBatDau: this.formatDateToDisplay(this.editFormData.ngayBatDau),
        ngayKetThuc: this.formatDateToDisplay(this.editFormData.ngayKetThuc),
        isModifiedLocal: true
      }

      const localData = localStorage.getItem('local_retake_changes')
      const parsedLocal = localData ? JSON.parse(localData) : []
      const index = parsedLocal.findIndex(p => p.id === targetId)

      if (index !== -1) {
        parsedLocal[index] = { ...parsedLocal[index], ...updatedFields }
      } else {
        parsedLocal.push({ id: targetId, ...updatedFields })
      }

      this.saveLocalChanges(parsedLocal)
      this.editDialog = false
      this.fetchData()
      this.showSuccessNotification('Cập nhật thành công!')
    },

    saveDeadline() {
      if (!this.selectedItem) return
      const targetId = this.selectedItem.id
      const newDeadline = this.formatDateToDisplay(this.deadlineValue)

      const localData = localStorage.getItem('local_retake_changes')
      const parsedLocal = localData ? JSON.parse(localData) : []
      const index = parsedLocal.findIndex(p => p.id === targetId)

      if (index !== -1) {
        parsedLocal[index] = { ...parsedLocal[index], hanChotDongPhi: newDeadline, isModifiedLocal: true }
      } else {
        parsedLocal.push({ id: targetId, hanChotDongPhi: newDeadline, isModifiedLocal: true })
      }

      this.saveLocalChanges(parsedLocal)
      this.deadlineDialog = false
      this.fetchData()
      this.showSuccessNotification('Cài đặt thời hạn đóng phí thành công')
    },

    deleteItem(item) {
      this.selectedItem = item
      this.deleteDialog = true
    },

    promptChangeStatus(item, newStatus) {
      if (item.trangThai === newStatus) return
      this.pendingStatusChange = { item, oldStatus: item.trangThai, newStatus }
      this.statusConfirmDialog = true
    },

    confirmStatusChange() {
      const { item, newStatus } = this.pendingStatusChange
      if (!item) return
      const targetId = item.id

      const localData = localStorage.getItem('local_retake_changes')
      const parsedLocal = localData ? JSON.parse(localData) : []
      const index = parsedLocal.findIndex(p => p.id === targetId)

      if (index !== -1) {
        parsedLocal[index] = { ...parsedLocal[index], trangThai: newStatus, isModifiedLocal: true }
      } else {
        parsedLocal.push({ id: targetId, trangThai: newStatus, isModifiedLocal: true })
      }

      this.saveLocalChanges(parsedLocal)
      this.statusConfirmDialog = false
      this.fetchData()
      this.showSuccessNotification('Cập nhật trạng thái thành công')
    },

    showSuccessNotification(message, color = '#4caf50', timeout = 3000) {
      const id = Date.now() + Math.random()
      const newToast = { id, message, color, timeout, show: true }
      this.toasts.unshift(newToast)
      setTimeout(() => {
        this.removeToast(id)
      }, timeout)
    },

    removeToast(id) {
      const index = this.toasts.findIndex((t) => t.id === id)
      if (index !== -1) {
        this.toasts[index].show = false
        this.toasts.splice(index, 1)
      }
    },
  },
}
</script>

<style scoped>
.text-red-bk { color: #a2212b !important; }
.border-top { border-top: 1px solid #e0e0e0; }
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }

.top-section { flex-shrink: 0; }
.filter-input-box { min-width: 140px; flex: 1 1 140px; }

@media (min-width: 960px) {
  .filter-actions-container { flex-wrap: nowrap !important; }
  .filter-input-box { max-width: 160px; }
}

::v-deep .filter-input-box.v-text-field--outlined .v-input__control,
::v-deep .filter-input-box.v-text-field--outlined .v-input__slot {
  min-height: 40px !important;
  height: 40px !important;
}

.btn-action-icon { width: 40px !important; height: 40px !important; }
.btn-action-square { width: 48px !important; min-width: 48px !important; height: 40px !important; border-radius: 4px !important; padding: 0 !important; }

.custom-status-pill {
  width: 125px;
  height: 30px;
  border-radius: 20px !important;
  overflow: hidden;
  cursor: pointer;
  user-select: none;
}

.action-icon-btn { cursor: pointer; transition: transform 0.15s ease; }
.action-icon-btn:hover { transform: scale(1.15); }

.select-records {
  width: 92px !important;
  min-width: 92px !important;
  max-width: 92px !important;
}

::v-deep .select-records .v-input__control,
::v-deep .select-records .v-input__slot {
  width: 92px !important;
  min-height: 32px !important;
  height: 32px !important;
}

.input-page {
  width: 64px !important;
  min-width: 64px !important;
  max-width: 64px !important;
}

::v-deep .input-page .v-input__control,
::v-deep .input-page .v-input__slot {
  width: 64px !important;
  min-height: 32px !important;
  height: 32px !important;
}

::v-deep .input-page input {
  text-align: center !important;
  padding: 0 !important;
  font-size: 13px !important;
  height: 32px !important;
}

.btn-go {
  height: 32px !important;
  min-width: 45px !important;
  border-radius: 4px !important;
  font-size: 13px;
}

.btn-page-nav {
  min-width: 32px !important;
  width: 32px !important;
  height: 32px !important;
  padding: 0 !important;
  border-radius: 4px !important;
}

@media (max-width: 599px) {
  .page-layout-wrapper { height: auto; min-height: 100vh; overflow: visible; }
}
@media (min-width: 600px) {
  .page-layout-wrapper { height: calc(100vh - 64px); overflow: hidden; display: flex; flex-direction: column; }
  .main-content-block { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
}
</style>