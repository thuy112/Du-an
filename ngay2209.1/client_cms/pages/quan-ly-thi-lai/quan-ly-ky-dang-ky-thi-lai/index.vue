<template>
  <div class="page-container pa-4">
    <!-- ==================== HEADER & TIÊU ĐỀ ==================== -->
    <div class="filter-header-wrapper mb-4">
      <div class="text-subtitle-1 font-weight-medium black--text mb-2">
        Danh sách kỳ đăng ký thi lại ( <span class="red--text text--darken-3 font-weight-bold">{{ totalItemsCount }}</span> )
      </div>

      <div class="d-flex align-center justify-end gap-2 flex-wrap">
        <!-- Ô Tìm kiếm -->
        <v-text-field
          v-model="filters.search"
          placeholder="Tìm kiếm"
          outlined
          dense
          hide-details
          class="custom-filter-input bg-white rounded"
          @keyup.enter="handleSearch"
        ></v-text-field>

        <!-- Ô Từ ngày -->
        <v-menu
          v-model="menuFilterStartDate"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template #activator="{ on, attrs }">
            <v-text-field
              v-model="filters.startDate"
              placeholder="Từ ngày"
              outlined
              dense
              readonly
              hide-details
              class="custom-filter-input bg-white rounded"
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="filters.startDate"
            no-title
            @input="menuFilterStartDate = false"
          ></v-date-picker>
        </v-menu>

        <!-- Ô Đến ngày -->
        <v-menu
          v-model="menuFilterEndDate"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template #activator="{ on, attrs }">
            <v-text-field
              v-model="filters.endDate"
              placeholder="Đến ngày"
              outlined
              dense
              readonly
              hide-details
              class="custom-filter-input bg-white rounded"
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="filters.endDate"
            no-title
            @input="menuFilterEndDate = false"
          ></v-date-picker>
        </v-menu>

        <!-- Ô Trạng thái -->
        <v-select
          v-model="filters.status"
          :items="statusOptions"
          item-text="label"
          item-value="value"
          placeholder="Trạng thái"
          outlined
          dense
          hide-details
          clearable
          class="custom-filter-input bg-white rounded"
        ></v-select>

        <!-- Nút Refresh -->
        <v-btn icon color="#a2212b" class="action-btn rounded-sm" @click="resetFilters">
          <v-icon color="#a2212b" size="24">mdi-refresh</v-icon>
        </v-btn>

        <!-- Nút Tìm kiếm -->
        <v-btn color="#a2212b" dark elevation="0" class="action-btn min-w-0 px-3 rounded-sm" @click="handleSearch">
          <v-icon size="24">mdi-magnify</v-icon>
        </v-btn>

        <!-- Nút Thêm mới -->
        <v-btn color="#a2212b" dark elevation="0" class="action-btn min-w-0 px-3 rounded-sm" @click="openCreateModal">
          <v-icon size="24">mdi-plus</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- ==================== BẢNG DỮ LIỆU (ĐÃ SỬA CỐ ĐỊNH CHIỀU CAO ĐỂ LƯỚT ĐƯỢC) ==================== -->
    <v-card flat class="border rounded-lg overflow-hidden mb-4">
      <v-data-table
        :headers="headers"
        :items="paginatedItems"
        :loading="loading"
        hide-default-footer
        disable-pagination
        fixed-header
        height="500px"
        class="custom-table"
      >
        <!-- STT đổi linh hoạt theo trang và vị trí dòng -->
        <template #[`item.stt`]="{ index }">
          {{ (page - 1) * itemsPerPage + index + 1 }}
        </template>

        <template #[`item.registrationTime`]="{ item }">
          {{ item.startDate }} - {{ item.endDate }}
        </template>

        <template #[`item.status`]="{ item }">
          <v-select
            :value="item.status"
            :items="statusSelectItems"
            item-text="label"
            item-value="value"
            dense
            solo
            flat
            hide-details
            class="status-select-btn"
            :class="item.status === 'ACTIVE' ? 'status-active' : 'status-inactive'"
            @change="(val) => openConfirmStatusDialog(item, val)"
          ></v-select>
        </template>

        <template #[`item.actions`]="{ item }">
          <div class="d-flex align-center justify-center gap-1">
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn icon x-small v-bind="attrs" v-on="on" @click="viewDetail(item)">
                  <v-icon size="24" color="blue">mdi-eye</v-icon>
                </v-btn>
              </template>
              <span>Xem chi tiết</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn icon x-small v-bind="attrs" v-on="on" @click="openEditModal(item)">
                  <v-icon size="24" color="warning">mdi-pencil</v-icon>
                </v-btn>
              </template>
              <span>Chỉnh sửa</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn icon x-small v-bind="attrs" v-on="on" @click="openDeleteDialog(item)">
                  <v-icon size="24" color="red">mdi-trash-can</v-icon>
                </v-btn>
              </template>
              <span>Xóa</span>
            </v-tooltip>
          </div>
        </template>

        <template #no-data>
          <div class="py-6 grey--text">Không có dữ liệu.</div>
        </template>
      </v-data-table>
    </v-card>

    <!-- ==================== PHÂN TRANG ==================== -->
    <div class="d-flex align-center justify-end gap-2 custom-pagination">
      <span class="caption grey--text text--darken-1">Bản ghi</span>
      <v-select
        v-model="itemsPerPage"
        :items="[10, 20, 50, 100]"
        dense
        outlined
        hide-details
        style="max-width: 75px"
        class="dense-input"
        @change="onItemsPerPageChange"
      ></v-select>

      <span class="caption grey--text text--darken-1 ml-2">Trang</span>
      <v-text-field
        v-model.number="pageInput"
        dense
        outlined
        hide-details
        style="max-width: 45px"
        class="dense-input"
        @keyup.enter="goToPage"
      ></v-text-field>

      <v-btn
        color="#a2212b"
        dark
        small
        elevation="0"
        class="pagination-square-btn min-w-0 px-2"
        @click="goToPage"
      >
        Đi
      </v-btn>

      <v-btn icon :disabled="page === 1" @click="changePage(page - 1)">
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>

      <v-btn
        v-for="p in visiblePages"
        :key="p"
        small
        elevation="0"
        :color="p === page ? '#a2212b' : 'transparent'"
        :class="p === page ? 'white--text font-weight-bold' : 'grey--text text--darken-2'"
        class="pagination-square-btn min-w-0"
        @click="changePage(p)"
      >
        {{ p }}
      </v-btn>

      <v-btn icon :disabled="page === totalPages" @click="changePage(page + 1)">
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </div>

    <!-- DIALOG THÊM / SỬA -->
    <v-dialog v-model="formDialog" max-width="600px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="pa-3 text-subtitle-1 font-weight-bold white--text d-flex justify-space-between align-center red-header">
          <span>{{ isEdit ? 'Chỉnh sửa kỳ thi lại' : 'Thêm mới kỳ thi lại' }}</span>
          <v-btn icon dark x-small @click="formDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-5 black--text">
          <v-form ref="form" v-model="isFormValid">
            <v-row dense>
              <v-col cols="6">
                <v-text-field
                  v-model="formData.name"
                  placeholder="Tên kỳ thi lại (*)"
                  outlined
                  dense
                  class="custom-field"
                  :rules="[v => !!v || 'Vui lòng nhập tên kỳ thi lại']"
                ></v-text-field>
              </v-col>

              <v-col cols="6">
                <v-text-field
                  v-model="formData.code"
                  placeholder="Mã kỳ thi lại (*)"
                  outlined
                  dense
                  class="custom-field"
                  :rules="[v => !!v || 'Vui lòng nhập mã kỳ thi lại']"
                ></v-text-field>
              </v-col>

              <v-col cols="6">
                <v-select
                  v-model="formData.semester"
                  :items="semesterList"
                  placeholder="Học kỳ (*)"
                  outlined
                  dense
                  class="custom-field"
                  :rules="[v => !!v || 'Vui lòng chọn học kỳ']"
                ></v-select>
              </v-col>

              <v-col cols="6">
                <v-menu
                  v-model="startMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template #activator="{ on, attrs }">
                    <v-text-field
                      v-model="formData.startDate"
                      placeholder="Thời gian bắt đầu đăng ký (*)"
                      outlined
                      dense
                      readonly
                      class="custom-field"
                      v-bind="attrs"
                      v-on="on"
                      :rules="[v => !!v || 'Vui lòng chọn thời gian bắt đầu']"
                    ></v-text-field>
                  </template>

                  <v-date-picker
                    v-if="startPickerStep === 'date'"
                    v-model="tempStartDate"
                    header-color="#a2212b"
                    color="#a2212b"
                    locale="vi"
                    @input="onStartDateSelected"
                  ></v-date-picker>

                  <v-time-picker
                    v-if="startPickerStep === 'time'"
                    v-model="tempStartTime"
                    header-color="#a2212b"
                    color="#a2212b"
                    format="24hr"
                    @change="onStartTimeSelected"
                  ></v-time-picker>
                </v-menu>
              </v-col>

              <v-col cols="6">
                <v-menu
                  v-model="endMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template #activator="{ on, attrs }">
                    <v-text-field
                      v-model="formData.endDate"
                      placeholder="Thời gian kết thúc đăng ký (*)"
                      outlined
                      dense
                      readonly
                      class="custom-field"
                      v-bind="attrs"
                      v-on="on"
                      :rules="[v => !!v || 'Vui lòng chọn thời gian kết thúc']"
                    ></v-text-field>
                  </template>

                  <v-date-picker
                    v-if="endPickerStep === 'date'"
                    v-model="tempEndDate"
                    header-color="#a2212b"
                    color="#a2212b"
                    locale="vi"
                    @input="onEndDateSelected"
                  ></v-date-picker>

                  <v-time-picker
                    v-if="endPickerStep === 'time'"
                    v-model="tempEndTime"
                    header-color="#a2212b"
                    color="#a2212b"
                    format="24hr"
                    @change="onEndTimeSelected"
                  ></v-time-picker>
                </v-menu>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4 pt-0 d-flex justify-end gap-2">
          <v-btn outlined color="#a2212b" class="px-4 font-weight-bold rounded-sm text-capitalize" style="border-color: #a2212b;" @click="formDialog = false">
            Đóng <v-icon small right>mdi-close</v-icon>
          </v-btn>
          <v-btn color="#a2212b" dark elevation="0" class="px-4 font-weight-bold rounded-sm text-capitalize" @click="saveForm">
            Lưu
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIALOG CHI TIẾT -->
    <v-dialog v-model="detailDialog" max-width="520px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="pa-3 text-subtitle-1 font-weight-bold white--text d-flex justify-space-between align-center red-header">
          <span>Chi tiết kỳ thi lại</span>
          <v-btn icon dark x-small @click="detailDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-5 black--text body-2">
          <v-row class="mb-2">
            <v-col cols="6" class="py-1">
              <span class="grey--text text--darken-2">Tên kỳ thi lại: </span>
              <span class="font-weight-bold red--text text--darken-3">{{ selectedItem.name }}</span>
            </v-col>
            <v-col cols="6" class="py-1">
              <span class="grey--text text--darken-2">Mã kỳ thi lại: </span>
              <span class="font-weight-bold red--text text--darken-3">{{ selectedItem.code }}</span>
            </v-col>
          </v-row>

          <v-row class="mb-2">
            <v-col cols="6" class="py-1">
              <span class="grey--text text--darken-2">Học kỳ: </span>
              <span class="font-weight-bold grey--text text--darken-3">{{ selectedItem.semester }}</span>
            </v-col>
            <v-col cols="6" class="py-1">
              <span class="grey--text text--darken-2">Loại hình: </span>
              <span class="font-weight-bold red--text text--darken-3">Thi lại</span>
            </v-col>
          </v-row>

          <v-row class="mb-2">
            <v-col cols="12" class="py-1">
              <span class="grey--text text--darken-2">Thời gian đăng ký: </span>
              <span class="font-weight-bold red--text text--darken-3">
                {{ selectedItem.startDate }} - {{ selectedItem.endDate }}
              </span>
            </v-col>
          </v-row>

          <v-row class="align-center">
            <v-col cols="12" class="py-1 d-flex align-center">
              <span class="grey--text text--darken-2 mr-2">Trạng thái: </span>
              <v-chip
                small
                dark
                :color="selectedItem.status === 'ACTIVE' ? '#a2212b' : '#757575'"
                class="font-weight-bold px-3"
              >
                {{ selectedItem.status === 'ACTIVE' ? 'Kích hoạt' : 'Chưa kích hoạt' }}
              </v-chip>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-4 pt-0 d-flex justify-end">
          <v-btn outlined color="#a2212b" class="px-4 font-weight-bold rounded-sm text-capitalize" style="border-color: #a2212b;" @click="detailDialog = false">
            Đóng <v-icon small right>mdi-close</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIALOG ĐỔI TRẠNG THÁI -->
    <v-dialog v-model="confirmStatusDialog" max-width="450px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="pa-3 text-subtitle-1 font-weight-bold white--text d-flex justify-space-between align-center red-header">
          <span>Xác nhận</span>
          <v-btn icon dark x-small @click="confirmStatusDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-5 black--text body-2">
          Bạn có chắc chắn muốn đổi trạng thái từ 
          <span class="font-weight-bold italic-text">
            {{ pendingStatusChange.oldStatus === 'ACTIVE' ? 'Kích hoạt' : 'Chưa kích hoạt' }}
          </span> 
          sang 
          <span class="font-weight-bold italic-text">
            {{ pendingStatusChange.newStatus === 'ACTIVE' ? 'Kích hoạt' : 'Chưa kích hoạt' }}
          </span> 
          không?
        </v-card-text>

        <v-card-actions class="pa-4 pt-0 d-flex justify-end gap-2">
          <v-btn outlined color="#a2212b" class="px-4 font-weight-bold rounded-sm text-capitalize" style="border-color: #a2212b;" @click="confirmStatusDialog = false">
            Đóng <v-icon small right>mdi-close</v-icon>
          </v-btn>

          <v-btn color="#a2212b" dark elevation="0" class="px-4 font-weight-bold rounded-sm text-capitalize" @click="confirmStatusUpdate">
            Xác Nhận
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIALOG XÓA -->
    <v-dialog v-model="deleteDialog" max-width="450px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="pa-3 text-subtitle-1 font-weight-bold white--text d-flex justify-space-between align-center red-header">
          <span>Xác nhận</span>
          <v-btn icon dark x-small @click="deleteDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-5 black--text body-2">
          Xác nhận xóa <span class="font-weight-bold red--text text--darken-3">{{ itemToDelete.name }}</span>
        </v-card-text>

        <v-card-actions class="pa-4 pt-0 d-flex justify-end gap-2">
          <v-btn outlined color="#a2212b" class="px-4 font-weight-bold rounded-sm text-capitalize" style="border-color: #a2212b;" @click="deleteDialog = false">
            Đóng <v-icon small right>mdi-close</v-icon>
          </v-btn>

          <v-btn color="#a2212b" dark elevation="0" class="px-4 font-weight-bold rounded-sm text-capitalize" :loading="deleteLoading" @click="confirmDelete">
            Xác Nhận
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- TOAST THÔNG BÁO -->
    <v-snackbar v-model="toast.show" :color="toast.color" timeout="3000" top right elevation="3">
      <div class="d-flex align-center justify-space-between w-100">
        <div class="d-flex align-center gap-2">
          <v-icon color="white" small>mdi-check-circle-outline</v-icon>
          <span class="white--text font-weight-medium">{{ toast.message }}</span>
        </div>
        <v-btn icon dark x-small class="ml-4" @click="toast.show = false">
          <v-icon small>mdi-close</v-icon>
        </v-btn>
      </div>
    </v-snackbar>
  </div>
</template>

<script>
import examServices from '~/services/examServices'

export default {
  name: 'QuanLyKyDangKyThiLaiPage',
  middleware: 'authenticated',

  data() {
    return {
      loading: false,
      page: 1,
      pageInput: 1,
      itemsPerPage: 50,

      // Bộ lọc
      filters: { search: '', startDate: null, endDate: null, status: null },
      appliedFilters: { search: '', startDate: null, endDate: null, status: null },
      menuFilterStartDate: false,
      menuFilterEndDate: false,

      // State cho DateTime Picker
      startMenu: false,
      startPickerStep: 'date',
      tempStartDate: null,
      tempStartTime: '00:00',

      endMenu: false,
      endPickerStep: 'date',
      tempEndDate: null,
      tempEndTime: '23:59',

      // Dialog Thêm / Sửa
      formDialog: false,
      isEdit: false,
      isFormValid: false,
      formData: {
        id: null,
        name: '',
        code: '',
        semester: '',
        startDate: '',
        endDate: '',
        status: 'INACTIVE',
      },

      semesterList: ['20241', '20242', '20251', '20252'],

      // Dialog Chi Tiết
      detailDialog: false,
      selectedItem: {},

      // Dialog Đổi trạng thái
      confirmStatusDialog: false,
      pendingStatusChange: { item: null, oldStatus: '', newStatus: '' },

      // Dialog Xóa
      deleteDialog: false,
      deleteLoading: false,
      itemToDelete: {},

      // Toast
      toast: { show: false, message: '', color: '#4caf50' },

      statusOptions: [
        { label: 'Kích hoạt', value: 'ACTIVE' },
        { label: 'Chưa kích hoạt', value: 'INACTIVE' },
      ],

      statusSelectItems: [
        { label: 'Kích hoạt', value: 'ACTIVE' },
        { label: 'Chưa kích hoạt', value: 'INACTIVE' },
      ],

      headers: [
        { text: 'STT', value: 'stt', width: '60px', align: 'center', sortable: false },
        { text: 'Tên kỳ đăng ký thi lại', value: 'name', width: '220px' },
        { text: 'Mã kỳ đăng ký thi lại', value: 'code', width: '160px' },
        { text: 'Học kỳ', value: 'semester', width: '100px' },
        { text: 'Thời gian đăng ký', value: 'registrationTime', width: '220px', align: 'center' },
        { text: 'Trạng thái', value: 'status', width: '150px', align: 'center', sortable: false },
        { text: 'Chức năng', value: 'actions', width: '110px', align: 'center', sortable: false },
      ],

      // Dữ liệu mẫu ban đầu
      items: [
        { id: 1, name: 'Kỳ thi 13', code: 'TL13', semester: '20251', startDate: '31/10/2025 08:00', endDate: '04/11/2025 17:00', status: 'ACTIVE' },
        { id: 2, name: 'học kì 1b', code: '1BTL', semester: '20241', startDate: '22/10/2024 08:00', endDate: '31/10/2025 17:00', status: 'INACTIVE' },
        { id: 3, name: 'Thi lại kì 1A 2025', code: '20251A1', semester: '20251', startDate: '22/10/2024 08:00', endDate: '03/11/2025 17:00', status: 'INACTIVE' },
        { id: 4, name: 'Lê Anh Tú', code: 'TEST12', semester: '20251', startDate: '11/07/2025 08:00', endDate: '02/07/2025 17:00', status: 'INACTIVE' },
        { id: 5, name: 'a', code: 'A', semester: '20251', startDate: '05/06/2025 08:00', endDate: '03/06/2025 17:00', status: 'INACTIVE' },
        { id: 6, name: 'AnhTus', code: 'AT', semester: '20251', startDate: '05/06/2025 08:00', endDate: '21/06/2025 17:00', status: 'INACTIVE' },
        { id: 7, name: 'Kỳ thi 13', code: '13', semester: '20251', startDate: '10/06/2025 08:00', endDate: '30/04/2025 17:00', status: 'ACTIVE' },
        { id: 8, name: 'Kỳ thi DXER', code: 'DXER', semester: '20251', startDate: '03/02/2025 08:00', endDate: '28/02/2025 17:00', status: 'INACTIVE' },
        { id: 9, name: 'Kỳ đăng ký thi lại', code: 'DKTL', semester: '20251', startDate: '01/01/2025 08:00', endDate: '30/07/2025 17:00', status: 'ACTIVE' },
        { id: 10, name: 'Đăng ký học kỳ 2', code: 'DKHK2', semester: '20252', startDate: '01/01/2025 08:00', endDate: '28/02/2025 17:00', status: 'INACTIVE' },
        { id: 11, name: 'TL 202311', code: 'TL 202311', semester: '20241', startDate: '13/04/2025 08:00', endDate: '30/04/2025 17:00', status: 'INACTIVE' },
        { id: 12, name: 'Thi lại đợt 1 2024', code: 'TL20241', semester: '20241', startDate: '01/03/2025 08:00', endDate: '15/03/2025 17:00', status: 'ACTIVE' },
        { id: 13, name: 'Thi lại đợt 2 2024', code: 'TL20242', semester: '20242', startDate: '10/04/2025 08:00', endDate: '25/04/2025 17:00', status: 'INACTIVE' },
        { id: 14, name: 'Kỳ thi hè 2024', code: 'KTH2024', semester: '20242', startDate: '01/06/2025 08:00', endDate: '15/06/2025 17:00', status: 'INACTIVE' },
        { id: 15, name: 'Thi cải thiện HK1', code: 'CT20241', semester: '20241', startDate: '20/06/2025 08:00', endDate: '30/06/2025 17:00', status: 'ACTIVE' },
        { id: 16, name: 'Thi cải thiện HK2', code: 'CT20242', semester: '20242', startDate: '05/07/2025 08:00', endDate: '15/07/2025 17:00', status: 'INACTIVE' },
      ],
    }
  },

  computed: {
    totalItemsCount() {
      return this.filteredItems.length
    },
    filteredItems() {
      return this.items.filter((item) => {
        const matchSearch =
          !this.appliedFilters.search ||
          item.name.toLowerCase().includes(this.appliedFilters.search.toLowerCase()) ||
          item.code.toLowerCase().includes(this.appliedFilters.search.toLowerCase())

        const matchStatus = !this.appliedFilters.status || item.status === this.appliedFilters.status

        return matchSearch && matchStatus
      })
    },
    paginatedItems() {
      const start = (this.page - 1) * this.itemsPerPage
      return this.filteredItems.slice(start, start + this.itemsPerPage)
    },
    totalPages() {
      const total = Math.ceil(this.filteredItems.length / this.itemsPerPage)
      return total > 0 ? total : 1
    },
    visiblePages() {
      const pages = []
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i)
      }
      return pages
    },
  },

  watch: {
    startMenu(val) {
      if (val) this.startPickerStep = 'date'
    },
    endMenu(val) {
      if (val) this.endPickerStep = 'date'
    },
  },

  mounted() {
    this.fetchData()
  },

  methods: {
    formatDateToVN(dateStr) {
      if (!dateStr) return ''
      const [year, month, day] = dateStr.split('-')
      return `${day}/${month}/${year}`
    },

    onStartDateSelected(val) {
      this.tempStartDate = val
      this.startPickerStep = 'time'
    },

    onStartTimeSelected(val) {
      this.tempStartTime = val
      const formattedDate = this.formatDateToVN(this.tempStartDate)
      this.formData.startDate = `${formattedDate} ${this.tempStartTime}`
      this.startMenu = false
    },

    onEndDateSelected(val) {
      this.tempEndDate = val
      this.endPickerStep = 'time'
    },

    onEndTimeSelected(val) {
      this.tempEndTime = val
      const formattedDate = this.formatDateToVN(this.tempEndDate)
      this.formData.endDate = `${formattedDate} ${this.tempEndTime}`
      this.endMenu = false
    },

    async fetchData() {
      this.loading = true
      try {
        const res = await examServices.getExamList(this.appliedFilters)
        if (res && res.success && res.data && res.data.length > 0) {
          this.items = res.data
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách kỳ thi lại:', error)
      } finally {
        this.loading = false
      }
    },

    handleSearch() {
      this.appliedFilters = { ...this.filters }
      this.page = 1
      this.pageInput = 1
      this.fetchData()
    },

    resetFilters() {
      this.filters = { search: '', startDate: null, endDate: null, status: null }
      this.appliedFilters = { search: '', startDate: null, endDate: null, status: null }
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

    goToPage() {
      let target = parseInt(this.pageInput)
      if (isNaN(target) || target < 1) target = 1
      if (target > this.totalPages) target = this.totalPages
      this.page = target
      this.pageInput = target
    },

    onItemsPerPageChange() {
      this.page = 1
      this.pageInput = 1
    },

    openCreateModal() {
      this.isEdit = false
      this.formData = { id: null, name: '', code: '', semester: '', startDate: '', endDate: '', status: 'INACTIVE' }
      this.formDialog = true
    },

    openEditModal(item) {
      this.isEdit = true
      this.formData = { ...item }
      this.formDialog = true
    },

    async saveForm() {
      if (this.$refs.form.validate()) {
        try {
          if (this.isEdit) {
            await examServices.updateExam(this.formData.id, this.formData)
            const idx = this.items.findIndex((i) => i.id === this.formData.id)
            if (idx !== -1) this.items.splice(idx, 1, { ...this.formData })
            this.showToast('Cập nhật kỳ đăng ký thành công', '#4caf50')
          } else {
            const res = await examServices.createExam(this.formData)
            if (res && res.data) {
              this.items.unshift(res.data)
            } else {
              this.items.unshift({ ...this.formData, id: Date.now() })
            }
            this.showToast('Thêm mới kỳ đăng ký thành công', '#4caf50')
          }
          this.formDialog = false
        } catch (error) {
          this.showToast('Lưu thông tin thất bại', '#f44336')
        }
      }
    },

    openConfirmStatusDialog(item, newStatus) {
      if (item.status === newStatus) return
      this.pendingStatusChange = { item, oldStatus: item.status, newStatus }
      this.confirmStatusDialog = true
    },

    async confirmStatusUpdate() {
      if (this.pendingStatusChange.item) {
        try {
          await examServices.updateExamStatus(
            this.pendingStatusChange.item.id,
            this.pendingStatusChange.newStatus
          )
          this.pendingStatusChange.item.status = this.pendingStatusChange.newStatus
          this.showToast('Cập nhật trạng thái thành công', '#4caf50')
        } catch (error) {
          this.showToast('Cập nhật trạng thái thất bại', '#f44336')
        } finally {
          this.confirmStatusDialog = false
        }
      }
    },

    openDeleteDialog(item) {
      this.itemToDelete = { ...item }
      this.deleteDialog = true
    },

    async confirmDelete() {
      if (!this.itemToDelete || !this.itemToDelete.id) return

      this.deleteLoading = true
      try {
        await examServices.deleteExam(this.itemToDelete.id)
        this.items = this.items.filter((i) => i.id !== this.itemToDelete.id)
        this.showToast('Xóa thông tin thành công', '#4caf50')
      } catch (error) {
        console.error('Lỗi khi xóa:', error)
        this.showToast('Xóa thông tin thất bại', '#f44336')
      } finally {
        this.deleteLoading = false
        this.deleteDialog = false
      }
    },

    viewDetail(item) {
      this.selectedItem = { ...item }
      this.detailDialog = true
    },

    showToast(message, color) {
      this.toast.message = message
      this.toast.color = color
      this.toast.show = true
    },
  },
}
</script>

<style scoped>
.page-container {
  width: 100%;
  box-sizing: border-box;
  font-size: 15px;
}

.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }

/* Ô FILTER INPUT */
.custom-filter-input {
  width: 200px !important;
  max-width: 200px !important;
}

.custom-filter-input >>> .v-input__slot {
  min-height: 40px !important;
  height: 40px !important;
  padding: 0 12px !important;
}

.custom-filter-input >>> input,
.custom-filter-input >>> .v-select__selection {
  font-size: 0.9rem !important;
}

.action-btn {
  height: 40px !important;
  min-height: 40px !important;
}

/* ==================== CẤU HÌNH CUỘN CHO BẢNG ==================== */
.custom-table >>> table {
  width: 100% !important;
  table-layout: fixed !important;
}

/* Ép buộc container wrapper nhận thuộc tính scroll dọc */
.custom-table >>> .v-data-table__wrapper {
  max-height: 500px !important;
  overflow-y: auto !important;
  overflow-x: auto !important;
}

.custom-table >>> th {
  position: sticky !important;
  top: 0 !important;
  z-index: 3 !important;
}

.custom-table >>> td {
  border-bottom: 1px solid #f0f0f0 !important;
  padding: 6px 10px !important;
  vertical-align: middle !important;
  font-size: 0.86rem !important;
}

/* NÚT TRẠNG THÁI CĂN GIỮA */
.custom-table >>> td.text-center .status-select-btn {
  margin: 0 auto !important;
}

.status-select-btn {
  min-width: 135px !important;
  width: 135px !important;
  border-radius: 14px !important;
}

.status-select-btn >>> .v-input__slot {
  min-height: 28px !important;
  height: 28px !important;
  padding: 0 10px !important;
  border-radius: 14px !important;
}

.status-select-btn >>> .v-select__selection {
  color: #ffffff !important;
  font-size: 0.76rem !important;
  font-weight: 600 !important;
  margin: 0 !important;
  white-space: nowrap !important;
}

.status-select-btn >>> .v-icon {
  color: #ffffff !important;
  font-size: 16px !important;
}

.status-active >>> .v-input__slot {
  background-color: #a2212b !important;
}

.status-inactive >>> .v-input__slot {
  background-color: #757575 !important;
}

/* PHÂN TRANG */
.dense-input >>> .v-input__slot {
  min-height: 28px !important;
  padding: 0 6px !important;
}

.dense-input >>> input,
.dense-input >>> .v-select__selection {
  font-size: 0.82rem !important;
}

.pagination-square-btn {
  min-width: 28px !important;
  width: 28px !important;
  height: 28px !important;
  min-height: 28px !important;
  padding: 0 !important;
  border-radius: 6px !important;
}

.border-btn {
  border: 1px solid #d0d0d0 !important;
}

.red-header {
  background-color: #a2212b !important;
}

.custom-field >>> .v-input__slot {
  min-height: 38px !important;
}

.italic-text {
  font-style: italic;
}
</style>