<template>
  <div class="page-layout-wrapper d-flex flex-column pa-2 pa-md-4 bg-white" :class="{ 'is-mobile-device': isMobileDevice }">
    <!-- 1. HEADER & BỘ LỌC TÌM KIẾM -->
    <div class="top-section flex-shrink-0 mb-4">
      <div class="d-flex flex-column flex-md-row align-md-center justify-space-between w-100 gap-3">
        <!-- Tiêu đề bên trái -->
        <div class="text-h6 font-weight-bold d-flex align-center">
          Danh sách đợt học lại&nbsp;(<span style="color: #a2212b">{{ totalItems }}</span>)
        </div>

        <!-- Bộ lọc và Các Nút Thao Tác bên phải (Sẽ tự động rớt dòng khi không đủ chỗ) -->
        <div class="d-flex align-center justify-end flex-wrap gap-2 flex-grow-1">
          <!-- Ô 1: Tìm kiếm theo mã đợt -->
          <v-text-field
            v-model="filters.search"
            label="Tìm kiếm theo mã đợt"
            dense
            outlined
            hide-details
            clearable
            class="filter-input-box flex-grow-1 flex-md-grow-0"
            @keyup.enter="handleExecuteSearch"
          ></v-text-field>

          <!-- Ô 2: Từ ngày (DatePicker Menu) -->
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
                class="filter-input-box date-filter-box flex-grow-1 flex-md-grow-0"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="filters.fromDate"
              color="#a2212b"
              @input="menuFromDate = false"
            ></v-date-picker>
          </v-menu>

          <!-- Ô 3: Đến ngày (DatePicker Menu) -->
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
                class="filter-input-box date-filter-box flex-grow-1 flex-md-grow-0"
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
            class="filter-input-box flex-grow-1 flex-md-grow-0"
          ></v-select>

          <!-- Cụm nút thao tác -->
          <div class="d-flex align-center gap-2 flex-nowrap mt-2 mt-sm-0">
            <!-- Nút Refresh -->
            <v-btn
              icon
              color="#a2212b"
              class="flex-shrink-0 btn-action-icon border-action-btn"
              @click="resetFilters"
            >
              <v-icon size="20">mdi-refresh</v-icon>
            </v-btn>

            <!-- NÚT 1 TÌM KIẾM: Kính Lúp -->
            <v-btn
              color="#a2212b"
              dark
              elevation="0"
              class="btn-action-square flex-shrink-0"
              @click="handleExecuteSearch"
            >
              <v-icon size="20">mdi-magnify</v-icon>
            </v-btn>

            <!-- Nút Thêm Mới (+) -->
            <v-btn
              color="#a2212b"
              dark
              elevation="0"
              class="btn-action-square flex-shrink-0"
              @click="openCreateModal"
            >
              <v-icon size="20">mdi-plus</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. BẢNG DỮ LIỆU & THANH PHÂN TRANG -->
    <div class="main-content-block flex-grow-1">
      <div class="table-responsive-wrapper">
        <v-data-table
          :headers="headers"
          :items="paginatedData"
          :loading="loading"
          hide-default-footer
          disable-pagination
          fixed-header
          height="100%"
          :mobile-breakpoint="isMobileDevice ? 960 : 0"
          class="elevation-0 bg-transparent custom-table"
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

          <!-- Trạng thái (Viên thuốc Đỏ BK chuẩn) -->
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

          <!-- Chức năng (4 Icon đơn không viền tròn) -->
          <template v-slot:[`item.actions`]="{ item }">
            <div class="d-flex align-center gap-2" :class="isMobileDevice ? 'justify-end' : 'justify-center'">
              <!-- Xem chi tiết (Xanh dương) -->
              <v-icon size="22" color="blue" class="action-icon-btn" @click="openDetailModal(item)">
                mdi-eye
              </v-icon>
              <!-- Chỉnh sửa (Vàng cam) -->
              <v-icon size="22" color="warning" class="action-icon-btn" @click="openEditModal(item)"> 
                mdi-pencil
              </v-icon>
              <!-- Gia hạn (Xanh lá) -->
              <v-icon size="22" color="green" class="action-icon-btn" @click="openExtendModal(item)"> 
                mdi-clock-outline
              </v-icon>
              <!-- Xóa (Đỏ) -->
              <v-icon size="22" color="red" class="action-icon-btn" @click="deleteItem(item)"> 
                mdi-trash-can
              </v-icon>
            </div>
          </template>
        </v-data-table>
      </div>

      <!-- 3. THANH PHÂN TRANG -->
      <div class="custom-pagination-bar d-flex align-center justify-end flex-wrap gap-2 py-3 px-2 bg-white mt-auto border-top">
        <div class="d-flex align-center flex-nowrap gap-2" style="min-width: max-content;">
          <!-- Select Bản ghi -->
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

          <!-- Input Trang -->
          <v-text-field
            v-model.number="pageInput"
            label="Trang"
            outlined
            dense
            hide-details
            class="outlined-pagination-control input-page"
            @keyup.enter="handleGoBtnClick"
          ></v-text-field>

          <!-- NÚT 2 TÌM KIẾM: Nút 'Đi' -->
          <v-btn
            color="#a2212b"
            dark
            class="btn-go elevation-0 text-capitalize font-weight-regular px-3"
            @click="handleGoBtnClick"
          >
            Đi
          </v-btn>

          <!-- Phân trang mũi tên & số -->
          <div class="d-flex align-center gap-1">
            <v-btn
              outlined
              class="btn-page-nav mx-1"
              :disabled="page <= 1"
              @click="changePage(page - 1)"
            >
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

            <v-btn
              outlined
              class="btn-page-nav mx-1"
              :disabled="page >= totalPages"
              @click="changePage(page + 1)"
            >
              <v-icon small color="grey darken-1">mdi-chevron-right</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- CÁC DIALOG GIỮ NGUYÊN HOẠT ĐỘNG LOGIC CŨ -->
    <!-- DIALOG THÊM MỚI / CHỈNH SỬA ĐỢT ĐĂNG KÝ HỌC LẠI -->
    <v-dialog v-model="dialog" max-width="650px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <div class="px-5 py-3 d-flex align-center justify-space-between" style="background-color: #a2212b;">
          <span class="white--text font-weight-bold text-h6">
            {{ isEdit ? 'Chỉnh sửa đợt đăng ký học lại' : 'Thêm mới đợt đăng ký học lại' }}
          </span>
          <v-btn icon dark x-small @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <v-card-text class="pa-6">
          <v-form ref="createForm" v-model="isFormValid">
            <v-row dense>
              <v-col v-if="isEdit" cols="12" sm="6">
                <v-text-field v-model="formData.maDot" label="Mã đợt đăng ký" dense outlined readonly class="modal-input-box"></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-select v-model="formData.hocKy" :items="semesterOptions" label="Học kỳ (*)" placeholder="Chọn học kỳ" dense outlined hide-details="auto" :rules="[v => !!v || 'Vui lòng chọn học kỳ']" class="modal-input-box"></v-select>
              </v-col>

              <v-col cols="12" sm="6">
                <v-select v-model="formData.trangThai" :items="statusOptions" label="Trạng thái (*)" dense outlined hide-details="auto" :rules="[v => !!v || 'Vui lòng chọn trạng thái']" class="modal-input-box"></v-select>
              </v-col>

              <v-col cols="12" sm="6" class="mt-3">
                <v-menu v-model="menuStartDate" :close-on-content-click="false" transition="scale-transition" offset-y min-width="auto">
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field v-model="formData.ngayBatDau" label="Thời gian bắt đầu đăng ký" placeholder="Thời gian bắt đầu đăng ký" dense outlined readonly hide-details="auto" v-bind="attrs" class="modal-input-box date-input-box" v-on="on"></v-text-field>
                  </template>
                  <v-date-picker v-model="formData.ngayBatDau" color="#a2212b" @input="menuStartDate = false"></v-date-picker>
                </v-menu>
              </v-col>

              <v-col cols="12" sm="6" class="mt-3">
                <v-menu v-model="menuEndDate" :close-on-content-click="false" transition="scale-transition" offset-y min-width="auto">
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field v-model="formData.ngayKetThuc" label="Thời gian kết thúc đăng ký" placeholder="Thời gian kết thúc đăng ký" dense outlined readonly hide-details="auto" :rules="endDateRules" v-bind="attrs" class="modal-input-box date-input-box" v-on="on"></v-text-field>
                  </template>
                  <v-date-picker v-model="formData.ngayKetThuc" color="#a2212b" :min="formData.ngayBatDau" @input="menuEndDate = false"></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-5 pt-0 d-flex justify-end gap-2">
          <v-btn outlined class="text-capitalize px-4" style="border-color: #d9d9d9;" @click="dialog = false">
            Đóng <v-icon right small>mdi-close</v-icon>
          </v-btn>
          <v-btn color="#a2212b" dark elevation="0" class="text-capitalize px-4" @click="saveData">
            Lưu <v-icon right small>mdi-content-save</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIALOG XÁC NHẬN ĐỔI TRẠNG THÁI -->
    <v-dialog v-model="statusConfirmDialog" max-width="480px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <div class="px-4 py-3 d-flex align-center justify-space-between" style="background-color: #a2212b;">
          <span class="white--text font-weight-bold text-subtitle-1">Xác nhận</span>
          <v-btn icon dark x-small @click="statusConfirmDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-card-text class="pa-5 text-body-2 text--primary">
          Bạn có chắc chắn muốn đổi trạng thái từ
          <strong>{{ statusLabel(pendingStatusChange.oldStatus) }}</strong> sang
          <strong>{{ statusLabel(pendingStatusChange.newStatus) }}</strong> không?
        </v-card-text>
        <v-card-actions class="pa-4 pt-0 d-flex justify-end gap-2">
          <v-btn outlined class="text-capitalize px-4" style="border-color: #d9d9d9;" @click="statusConfirmDialog = false">
            Đóng <v-icon right small>mdi-close</v-icon>
          </v-btn>
          <v-btn color="#a2212b" dark elevation="0" class="text-capitalize px-4" @click="confirmStatusChange">
            Xác Nhận
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIALOG XEM CHI TIẾT -->
    <v-dialog v-model="detailDialog" max-width="600px">
      <v-card class="rounded-lg overflow-hidden">
        <div class="px-5 py-3 d-flex align-center justify-space-between" style="background-color: #a2212b;">
          <span class="white--text font-weight-bold text-h6">Xem chi tiết đợt đăng ký học lại</span>
          <v-btn icon dark x-small @click="detailDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-card-text class="pa-6 text-body-2 text--primary">
          <v-row dense>
            <v-col cols="12" sm="6" class="py-2">
              Mã đợt học lại: <strong class="red--text text--darken-2">{{ selectedItem.maDot }}</strong>
            </v-col>
            <v-col cols="12" sm="6" class="py-2">
              Học kỳ: <strong>{{ selectedItem.hocKy }}</strong>
            </v-col>
            <v-col cols="12" sm="6" class="py-2">
              Loại hình: <strong class="red--text text--darken-2">Học lại</strong>
            </v-col>
            <v-col cols="12" sm="6" class="py-2">
              Thời gian đăng ký:
              <strong class="red--text text--darken-2">
                {{ selectedItem.ngayBatDau }} ~ {{ selectedItem.ngayKetThuc }}
              </strong>
            </v-col>
            <v-col cols="12" sm="6" class="py-2">
              Hạn chót đóng phí học lại:
              <strong class="red--text text--darken-2">{{ selectedItem.hanChotDongPhi || '30/09/2026' }}</strong>
            </v-col>
            <v-col cols="12" sm="6" class="py-2 d-flex align-center">
              Trạng thái:
              <v-chip x-small color="#a2212b" dark class="ml-2 font-weight-medium px-3">
                {{ statusLabel(selectedItem.trangThai) }}
              </v-chip>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0 d-flex justify-end">
          <v-btn outlined class="text-capitalize px-4" style="border-color: #d9d9d9;" @click="detailDialog = false">
            Đóng <v-icon right small>mdi-close</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIALOG CHỈNH SỬA -->
    <v-dialog v-model="editDialog" max-width="650px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <div class="px-5 py-3 d-flex align-center justify-space-between" style="background-color: #a2212b;">
          <span class="white--text font-weight-bold text-h6">Cập nhật đợt đăng ký học lại</span>
          <v-btn icon dark x-small @click="editDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-card-text class="pa-6">
          <v-form ref="editForm">
            <v-row dense>
              <v-col cols="12" sm="6">
                <v-select v-model="editFormData.hocKy" :items="semesterOptions" label="Học kỳ (*)" dense outlined hide-details="auto" class="modal-input-box"></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select v-model="editFormData.trangThai" :items="statusOptions" item-text="text" item-value="value" label="Trạng thái (*)" dense outlined hide-details="auto" class="modal-input-box"></v-select>
              </v-col>
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
          <v-btn outlined class="text-capitalize px-4" style="border-color: #d9d9d9;" @click="editDialog = false">
            Đóng <v-icon right small>mdi-close</v-icon>
          </v-btn>
          <v-btn color="#a2212b" dark elevation="0" class="text-capitalize px-4" @click="saveEdit">
            Lưu <v-icon right small>mdi-content-save</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIALOG CÀI ĐẶT HẠN CHÓT -->
    <v-dialog v-model="deadlineDialog" max-width="500px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <div class="px-5 py-3 d-flex align-center justify-space-between" style="background-color: #a2212b;">
          <span class="white--text font-weight-bold text-h6">Cài đặt thời hạn đóng</span>
          <v-btn icon dark x-small @click="deadlineDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
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
          <v-btn outlined class="text-capitalize px-4" style="border-color: #d9d9d9;" @click="deadlineDialog = false">Đóng <v-icon right small>mdi-close</v-icon></v-btn>
          <v-btn color="#a2212b" dark elevation="0" class="text-capitalize px-4" @click="saveDeadline">Lưu <v-icon right small>mdi-content-save</v-icon></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIALOG XÁC NHẬN XÓA -->
    <v-dialog v-model="deleteDialog" max-width="450px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <div class="px-4 py-3 d-flex align-center justify-space-between" style="background-color: #a2212b;">
          <span class="white--text font-weight-bold text-subtitle-1">Xác nhận</span>
          <v-btn icon dark x-small @click="deleteDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        <v-card-text class="pa-5 text-body-2 text--primary">Xác nhận xóa đợt đăng ký học lại?</v-card-text>
        <v-card-actions class="pa-4 pt-0 d-flex justify-end gap-2">
          <v-btn outlined class="text-capitalize px-4" style="border-color: #d9d9d9;" @click="deleteDialog = false">Đóng <v-icon right small>mdi-close</v-icon></v-btn>
          <v-btn color="#a2212b" dark elevation="0" class="text-capitalize px-4" @click="confirmDelete">Xác Nhận</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- SNACKBAR THÔNG BÁO CẬP NHẬT THÀNH CÔNG -->
    <v-snackbar
      v-model="snackbar.show"
      color="#4CAF50"
      top
      right
      timeout="3000"
      class="mt-2 custom-toast"
    >
      <div class="d-flex align-center font-weight-medium white--text">
        <v-icon left color="white">mdi-check-circle</v-icon>
        <span>{{ snackbar.text }}</span>
      </div>
      <template v-slot:action="{ attrs }">
        <v-btn icon dark v-bind="attrs" @click="snackbar.show = false">
          <v-icon small>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import retakeSessionServices from '~/services/retakeSessionServices'

export default {
  name: 'QuanLyDotDangKyHocLai',
  data() {
    return {
      isMobileDevice: false, // cờ nhận diện mobile thật
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
      semesterOptions: ['20261', '20252', '20251'],
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
      snackbar: {
        show: false,
        text: '',
      },
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
    }
  },

  computed: {
    editEndDateRules() {
      return [
        (value) => {
          if (!value || !this.editFormData.ngayBatDau) return true
          return (
            value >= this.editFormData.ngayBatDau ||
            'Thời gian kết thúc không được nhỏ hơn thời gian bắt đầu'
          )
        },
      ]
    },

    endDateRules() {
      return [
        (value) => {
          if (!value || !this.formData.ngayBatDau) return true
          return (
            value >= this.formData.ngayBatDau ||
            'Thời gian kết thúc không được nhỏ hơn thời gian bắt đầu'
          )
        },
      ]
    },

    totalItems() {
      return this.appliedData.length
    },

    totalPages() {
      return Math.ceil(this.totalItems / this.itemsPerPage) || 1
    },

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

  created() {
    this.fetchData()
  },
  
  mounted() {
    // Nhận diện thiết bị di động
    if (typeof navigator !== 'undefined') {
      this.isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }
  },

  methods: {
    statusLabel(status) {
      const option = this.statusOptions.find((item) => item.value === status)
      return option ? option.text : status
    },

    normalizeStatus(status) {
      return status === 'ACTIVE' || status === 'Kích hoạt' ? 'ACTIVE' : 'INACTIVE'
    },

    async fetchData() {
      this.loading = true
      try {
        const res = await retakeSessionServices.getList()
        if (res?.success) {
          this.dataList = (res.data || []).map((item) => ({
            ...item,
            trangThai: this.normalizeStatus(item.trangThai),
          }))
        } else {
          this.dataList = [
            { id: 1, maDot: '20261-A-5 (demo)', hocKy: '20261', ngayBatDau: '01/08/2026', ngayKetThuc: '31/12/2026', trangThai: 'ACTIVE' },
            { id: 2, maDot: '20261-A-4', hocKy: '20261', ngayBatDau: '01/05/2026', ngayKetThuc: '01/06/2026', trangThai: 'ACTIVE' },
            { id: 3, maDot: '20252-A-3', hocKy: 'Học Kỳ II (2025)', ngayBatDau: '04/05/2026', ngayKetThuc: '13/05/2026', trangThai: 'ACTIVE' },
            { id: 4, maDot: '20252-A-2', hocKy: 'Học Kỳ II (2025)', ngayBatDau: '04/05/2026', ngayKetThuc: '12/08/2026', trangThai: 'ACTIVE' },
            { id: 5, maDot: '20252-A-1', hocKy: 'Học Kỳ II (2025)', ngayBatDau: '01/06/2026', ngayKetThuc: '23/07/2026', trangThai: 'ACTIVE' },
          ]
        }
        this.appliedData = [...this.dataList]
      } catch (err) {
        console.error('Lỗi khi tải danh sách đợt học lại:', err)
      } finally {
        this.loading = false
      }
    },

    handleExecuteSearch(resetPage = true) {
      const keyword = (this.filters?.search || '').toLowerCase().trim()
      
      this.appliedData = this.dataList.filter((item) => {
        const matchSearch =
          !keyword ||
          item.maDot?.toLowerCase().includes(keyword) ||
          item.hocKy?.toLowerCase().includes(keyword)
          
        const matchStatus =
          !this.filters?.status || item.trangThai === this.filters.status

        let matchFromDate = true
        let matchToDate = true
        if (this.filters.fromDate) {
          matchFromDate = item.ngayBatDau >= this.filters.fromDate
        }
        if (this.filters.toDate) {
          matchToDate = item.ngayKetThuc <= this.filters.toDate
        }

        return matchSearch && matchStatus && matchFromDate && matchToDate
      })

      if (resetPage) {
        this.page = 1
        this.pageInput = 1
      }
    },

    handleGoBtnClick() {
      this.handleExecuteSearch(false)

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
      this.appliedData = [...this.dataList]
      this.page = 1
      this.pageInput = 1
    },

    changePage(p) {
      if (p >= 1 && p <= this.totalPages) {
        this.page = p
        this.pageInput = p
      }
    },

    openCreateModal() {
      this.isEdit = false
      this.formData = {
        id: null,
        maDot: '',
        hocKy: '',
        trangThai: 'ACTIVE',
        ngayBatDau: '',
        ngayKetThuc: '',
      }
      this.menuStartDate = false
      this.menuEndDate = false
      if (this.$refs.createForm) this.$refs.createForm.resetValidation()
      this.dialog = true
    },

    openDetailModal(item) {
      this.selectedItem = {
        ...item,
        ngayBatDau: this.formatDateToDisplay(item.ngayBatDau),
        ngayKetThuc: this.formatDateToDisplay(item.ngayKetThuc),
        hanChotDongPhi: this.formatDateToDisplay(item.hanChotDongPhi || '30/09/2026'),
      }
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

    async saveEdit() {
      if (this.$refs.editForm && !this.$refs.editForm.validate()) return

      try {
        await retakeSessionServices.update(this.selectedItem.id, this.editFormData)
      } catch (err) {
        console.error('Lỗi khi cập nhật đợt đăng ký:', err)
      }

      Object.assign(this.selectedItem, {
        ...this.editFormData,
        ngayBatDau: this.formatDateToDisplay(this.editFormData.ngayBatDau),
        ngayKetThuc: this.formatDateToDisplay(this.editFormData.ngayKetThuc),
      })
      this.editDialog = false
      this.showSuccessNotification('Cập nhật đợt đăng ký thành công')
    },

    async saveDeadline() {
      try {
        await retakeSessionServices.update(this.selectedItem.id, {
          hanChotDongPhi: this.deadlineValue,
        })
      } catch (err) {
        console.error('Lỗi khi cập nhật hạn chót đóng phí:', err)
      }

      this.selectedItem.hanChotDongPhi = this.formatDateToDisplay(this.deadlineValue)
      this.deadlineDialog = false
      this.showSuccessNotification('Cài đặt thời hạn đóng phí thành công')
    },

    deleteItem(item) {
      this.selectedItem = item
      this.deleteDialog = true
    },

    async confirmDelete() {
      try {
        await retakeSessionServices.delete(this.selectedItem.id)
      } catch (err) {
        console.error('Lỗi khi xóa đợt đăng ký:', err)
      }

      const index = this.dataList.findIndex((item) => item.id === this.selectedItem.id)
      if (index !== -1) this.dataList.splice(index, 1)
      this.appliedData = [...this.dataList]
      this.deleteDialog = false
      this.showSuccessNotification('Xóa đợt đăng ký thành công')
    },

    showSuccessNotification(message) {
      this.snackbar.text = message
      this.snackbar.show = true
    },

    async saveData() {
      if (this.$refs.createForm && !this.$refs.createForm.validate()) return

      if (this.isEdit) {
        try {
          await retakeSessionServices.update(this.formData.id, this.formData)
          this.dialog = false
          this.fetchData()
          this.snackbar.text = 'Cập nhật thành công'
          this.snackbar.show = true
        } catch (err) {
          console.error('Lỗi khi cập nhật đợt đăng ký:', err)
        }
        return
      }

      const newSession = {
        id: Date.now(),
        maDot: `${this.formData.hocKy}-A-${this.dataList.length + 1}`,
        hocKy: this.formData.hocKy,
        ngayBatDau: this.formData.ngayBatDau || '01/10/2026',
        ngayKetThuc: this.formData.ngayKetThuc || '30/10/2026',
        trangThai: this.formData.trangThai || 'ACTIVE',
      }

      try {
        await retakeSessionServices.create(this.formData)
      } catch (err) {
        console.error('Lỗi khi lưu đợt đăng ký, thêm bản ghi local:', err)
      }

      this.dataList.unshift(newSession)
      this.appliedData = [...this.dataList]
      this.dialog = false
      this.page = 1
      this.pageInput = 1
      this.snackbar.text = 'Thêm mới thành công'
      this.snackbar.show = true
    },

    promptChangeStatus(item, newStatus) {
      if (item.trangThai === newStatus) return
      this.pendingStatusChange = {
        item,
        oldStatus: item.trangThai,
        newStatus,
      }
      this.statusConfirmDialog = true
    },

    async confirmStatusChange() {
      const { item, newStatus } = this.pendingStatusChange
      if (!item) return

      try {
        await retakeSessionServices.update(item.id, { trangThai: newStatus })
        item.trangThai = newStatus
        this.statusConfirmDialog = false
        this.snackbar.text = 'Cập nhật trạng thái thành công'
        this.snackbar.show = true
      } catch (err) {
        console.error('Lỗi cập nhật trạng thái:', err)
      }
    },

  },
}
</script>

<style scoped>
/* ==============================================
   MÀU SẮC & TEXT CƠ BẢN
============================================== */
.text-red-bk { color: #a2212b !important; }
.border-top { border-top: 1px solid #e0e0e0; }
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }

/* ==============================================
   1. BỘ LỌC TÌM KIẾM Ở TOP
============================================== */
/* Responsive width cho thẻ input tìm kiếm */
.filter-input-box {
  min-width: 140px;
}

::v-deep .filter-input-box.v-text-field--outlined .v-input__control {
  min-height: 40px !important;
  height: 40px !important;
}

::v-deep .filter-input-box.v-text-field--outlined .v-input__slot {
  min-height: 40px !important;
  height: 40px !important;
  padding: 0 10px !important;
}

::v-deep .filter-input-box input,
::v-deep .filter-input-box .v-select__selections {
  font-size: 13px !important;
  padding: 0 !important;
  height: 40px !important;
  display: flex;
  align-items: center;
}

::v-deep .filter-input-box input::placeholder {
  color: #777777 !important;
  opacity: 1 !important;
}

::v-deep .filter-input-box fieldset {
  border-color: #a0a0a0 !important;
  border-width: 1px !important;
  border-radius: 4px !important;
}

::v-deep .filter-input-box.v-input--is-focused fieldset {
  border-color: #a2212b !important;
  border-width: 1.5px !important;
}

.date-filter-box { cursor: pointer; }
.date-filter-box input { cursor: pointer !important; }

::v-deep .filter-input-box .v-input__append-inner {
  margin-top: 8px !important;
}

.btn-action-icon {
  width: 40px !important;
  height: 40px !important;
}

.border-action-btn {
  border: 1px solid #a2212b !important;
  border-radius: 6px !important;
}

.btn-action-square {
  width: 48px !important;
  min-width: 48px !important;
  height: 40px !important;
  border-radius: 4px !important;
  padding: 0 !important;
}

/* ==============================================
   2. BẢNG DỮ LIỆU CHUNG (TABLE & THẺ)
============================================== */
.custom-table {
  background-color: transparent !important;
}

::v-deep .custom-table table {
  border-collapse: collapse !important;
}

/* Trạng thái dạng viên thuốc */
.custom-status-pill {
  width: 125px;
  height: 30px;
  border-radius: 20px !important;
  overflow: hidden;
  cursor: pointer;
  user-select: none;
  transition: opacity 0.2s ease;
}

.custom-status-pill:hover { opacity: 0.9; }

::v-deep .custom-status-pill .v-input__control {
  min-height: 30px !important;
  height: 30px !important;
  border-radius: 20px !important;
}

::v-deep .custom-status-pill .v-input__slot {
  border-radius: 20px !important;
  padding: 0 12px !important;
  min-height: 30px !important;
  height: 30px !important;
}

::v-deep .custom-status-pill .v-select__selections {
  font-size: 13px !important;
  font-weight: 500 !important;
  color: #ffffff !important;
  padding: 0 !important;
}

::v-deep .custom-status-pill .v-icon {
  color: #ffffff !important;
  font-size: 18px !important;
}

/* Các Icon Chức Năng */
.action-icon-btn {
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.action-icon-btn:hover {
  opacity: 0.8;
  transform: scale(1.15);
}

/* ==============================================
   3. THANH PHÂN TRANG
============================================== */
::v-deep .outlined-pagination-control.v-text-field--outlined .v-input__control {
  min-height: 32px !important;
  height: 32px !important;
}

::v-deep .outlined-pagination-control.v-text-field--outlined .v-input__slot {
  min-height: 32px !important;
  height: 32px !important;
  padding: 0 12px !important;
}

::v-deep .outlined-pagination-control.v-text-field--outlined fieldset {
  border-color: #8c8c8c !important;
  border-width: 1px !important;
}

::v-deep .outlined-pagination-control .v-label {
  top: 10px !important;
  font-size: 12px !important;
  color: #555 !important;
}

.select-records {
  width: 92px !important;
  min-width: 92px !important;
  max-width: 92px !important;
}

::v-deep .select-records .v-select__selections {
  padding: 0 !important;
  font-size: 13px !important;
}

::v-deep .select-records .v-input__append-inner {
  margin-top: 4px !important;
}

.input-page {
  width: 64px !important;
  min-width: 64px !important;
  max-width: 64px !important;
}

::v-deep .input-page input {
  text-align: center !important;
  padding: 0 !important;
  font-size: 13px !important;
  height: 32px !important;
}

.btn-go {
  height: 32px !important;
  min-width: 50px !important;
  border-radius: 4px !important;
  font-size: 13px;
}

.btn-page-nav {
  min-width: 32px !important;
  width: 32px !important;
  height: 32px !important;
  padding: 0 !important;
  border-radius: 4px !important;
  border: 1px solid #d9d9d9 !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
}

/* ==============================================
   4. TOAST NOTIFICATION
============================================== */
.custom-toast >>> .v-snack__wrapper {
  border-radius: 8px !important;
}

/* ==========================================================
   CSS MÁY TÍNH (DESKTOP)
========================================================== */
.page-layout-wrapper:not(.is-mobile-device) {
  height: calc(100vh - 64px); 
}

.page-layout-wrapper:not(.is-mobile-device) .main-content-block {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Cho phép bao bảng kéo thanh cuộn tự do ngang/dọc */
.page-layout-wrapper:not(.is-mobile-device) .table-responsive-wrapper {
  flex: 1 1 auto;
  min-height: 0; 
  overflow: auto; /* Sinh scrollbar tự nhiên */
}

/* Ép width bảng bằng 1100px để không bao giờ bị bóp nhăn nhúm các cột */
.page-layout-wrapper:not(.is-mobile-device) .custom-table >>> table {
  min-width: 1100px !important;
}

/* Đóng đinh Header Bảng (Tiêu đề cột) không bị trượt mất khi kéo dọc */
.page-layout-wrapper:not(.is-mobile-device) .custom-table >>> thead th {
  position: sticky;
  top: 0;
  z-index: 3;
  background-color: #f2f2f2 !important;
  color: #262626 !important;
  font-size: 14px !important;
  font-weight: 700 !important;
  height: 48px !important;
  border-bottom: 1px solid #e8e8e8 !important;
  box-shadow: 0 1px 0 rgba(0,0,0,0.05) !important;
  white-space: nowrap !important;
}

.page-layout-wrapper:not(.is-mobile-device) .custom-table >>> tbody td {
  font-size: 14px !important;
  color: #262626 !important;
  height: 52px !important;
  border-bottom: 1px solid #f0f0f0 !important;
  white-space: nowrap !important; /* KHÔNG CHO XUỐNG DÒNG */
}

.page-layout-wrapper:not(.is-mobile-device) .custom-table >>> tbody tr:hover {
  background-color: #fafafa !important;
}

/* Custom lại thanh cuộn máy tính cho mượt và đẹp */
.page-layout-wrapper:not(.is-mobile-device) .table-responsive-wrapper::-webkit-scrollbar { 
  height: 8px; width: 8px; 
}
.page-layout-wrapper:not(.is-mobile-device) .table-responsive-wrapper::-webkit-scrollbar-track { 
  background: #f1f1f1; border-radius: 4px; 
}
.page-layout-wrapper:not(.is-mobile-device) .table-responsive-wrapper::-webkit-scrollbar-thumb { 
  background: #c1c1c1; border-radius: 4px; 
}
.page-layout-wrapper:not(.is-mobile-device) .table-responsive-wrapper::-webkit-scrollbar-thumb:hover { 
  background: #a2212b; 
}

/* ==========================================================
   CSS ĐIỆN THOẠI THẬT SỰ (MOBILE)
========================================================== */
.is-mobile-device {
  height: auto;
  min-height: 100vh;
}

.is-mobile-device .top-section {
  position: sticky;
  top: 0;
  z-index: 4; 
  background: #fff;
  padding-bottom: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.is-mobile-device .main-content-block,
.is-mobile-device .table-responsive-wrapper {
  overflow: visible !important;
}

.is-mobile-device .custom-table {
  min-width: 100% !important;
  height: auto !important;
}

.is-mobile-device .custom-table >>> .v-data-table__wrapper {
  height: auto !important;
  overflow: visible !important;
}

/* Chỉnh lại giao diện hiển thị cho Card Mode trên Mobile thật */
.is-mobile-device .custom-table >>> .v-data-table__mobile-row {
  align-items: flex-start !important;
  padding: 12px 16px !important;
  min-height: auto !important;
}
.is-mobile-device .custom-table >>> .v-data-table__mobile-row__header {
  font-weight: 600 !important;
  color: #333 !important;
  min-width: 120px;
  margin-right: 16px;
}
.is-mobile-device .custom-table >>> .v-data-table__mobile-row__cell {
  text-align: right !important;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-start;
}
.is-mobile-device .custom-table >>> .v-data-table__wrapper > table > tbody > tr {
  border-bottom: 8px solid #f0f2f5 !important;
  background-color: #ffffff;
  margin-bottom: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}
</style>