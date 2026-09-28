<template>
  <div class="page-container pa-4">
    <!-- Modal xác nhận đổi trạng thái -->
    <v-dialog v-model="confirmDialog.show" max-width="450px" persistent>
      <v-card class="rounded-sm">
        <v-card-title class="white--text py-2 px-4 d-flex align-center justify-space-between red-header">
          <span class="text-body-1 font-weight-bold white--text">Xác nhận</span>
          <v-btn icon dark x-small @click="cancelStatusChange">
            <v-icon x-small>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pt-5 pb-4 px-4 text-body-2 grey--text text--darken-4">
          Bạn có chắc chắn muốn đổi trạng thái từ
          <strong class="font-weight-bold">{{ confirmDialog.fromStatusText }}</strong>
          sang
          <strong class="font-weight-bold red--text text--darken-2">{{ confirmDialog.toStatusText }}</strong>
          không?
        </v-card-text>

        <v-card-actions class="px-4 pb-4 pt-0 justify-end">
          <v-btn outlined color="grey darken-2" small height="32" class="text-capitalize px-3 font-weight-medium" @click="cancelStatusChange">
            Đóng <v-icon x-small class="ml-1">mdi-close</v-icon>
          </v-btn>
          <v-btn color="#a2212b" dark small height="32" elevation="0" class="text-capitalize px-3 font-weight-medium ml-2" @click="confirmStatusChange">
            Xác nhận
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Header & Bộ lọc -->
    <div class="d-flex align-center justify-space-between flex-wrap mb-4 gap-2">
      <div class="text-subtitle-1 font-weight-bold red--text text--darken-3">
        Danh sách cấu hình email ({{ filteredItems.length }})
      </div>

      <div class="d-flex align-center flex-wrap gap-2">
        <!-- Input Tìm kiếm -->
        <v-text-field
          v-model="filters.keyword"
          placeholder="Tìm kiếm"
          outlined
          dense
          hide-details
          style="max-width: 160px"
          class="bg-white"
          @keyup.enter="handleSearch"
        ></v-text-field>

        <!-- Dropdown Trạng thái -->
        <v-select
          v-model="filters.status"
          :items="statusOptions"
          placeholder="Trạng thái"
          outlined
          dense
          hide-details
          clearable
          style="max-width: 130px"
          class="bg-white"
        ></v-select>

        <!-- Dropdown Loại cấu hình -->
        <v-select
          v-model="filters.type"
          :items="typeOptions"
          placeholder="Loại cấu hình g..."
          outlined
          dense
          hide-details
          clearable
          style="max-width: 150px"
          class="bg-white"
        ></v-select>

        <!-- Nút Refresh -->
        <v-btn icon small color="grey darken-2" class="ml-1" @click="resetFilters">
          <v-icon small>mdi-refresh</v-icon>
        </v-btn>

        <!-- Nút Search đỏ -->
        <v-btn
          color="#a2212b"
          dark
          elevation="0"
          class="px-2"
          min-width="36"
          height="36"
          @click="handleSearch"
        >
          <v-icon small>mdi-magnify</v-icon>
        </v-btn>

        <!-- Nút Thêm mới đỏ -->
        <v-btn
          color="#a2212b"
          dark
          elevation="0"
          class="px-2"
          min-width="36"
          height="36"
          @click="openCreateModal"
        >
          <v-icon small>mdi-plus</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- Bảng Dữ Liệu -->
    <v-data-table
      :headers="headers"
      :items="paginatedItems"
      :loading="loading"
      hide-default-footer
      class="elevation-0 custom-table bg-transparent"
    >
      <!-- Cột STT -->
      <template #[`item.stt`]="{ index }">
        <span>{{ (page - 1) * pageSize + index + 1 }}</span>
      </template>

      <!-- Cột Tên -->
      <template #[`item.name`]="{ item }">
        <span class="font-weight-medium text-caption grey--text text--darken-4">
          {{ item.name }}
        </span>
      </template>

      <!-- Cột Đối tượng gửi mail (Sửa slot key khớp với headers) -->
      <template #[`item.target`]="{ item }">
        <v-chip
          v-if="item.target || item.sendType"
          :color="getSendTypeColor(item.target || item.sendType)"
          x-small
          dark
          class="px-2 caption font-weight-medium"
        >
          {{ getSendTypeLabel(item.target || item.sendType) }}
        </v-chip>
      </template>

      <!-- Cột Loại cấu hình gửi mail -->
      <template #[`item.configType`]="{ item }">
        <v-chip
          v-if="item.configType || item.type"
          :color="getConfigTypeColor(item.configType || item.type)"
          x-small
          dark
          class="px-2 caption font-weight-medium"
        >
          {{ getConfigTypeLabel(item.configType || item.type) }}
        </v-chip>
      </template>

      <!-- Cột Loại hành động (Sửa slot key khớp với headers) -->
      <template #[`item.actionType`]="{ item }">
        <v-chip
          v-if="item.actionType || item.actionSendType"
          :color="getActionTypeColor(item.actionType || item.actionSendType)"
          x-small
          dark
          class="px-2 caption font-weight-medium"
        >
          {{ getActionTypeLabel(item.actionType || item.actionSendType) }}
        </v-chip>
      </template>

      <!-- Cột Nội dung (Tính năng Xem thêm / Ẩn bớt - Đã rút ngắn max-width) -->
      <template #[`item.content`]="{ item }">
        <div class="py-2 content-column">
          <!-- Khi chưa mở rộng: Hiện cắt ngắn 1 dòng -->
          <template v-if="!expandedItems.includes(item.id)">
            <div class="text-caption grey--text text--darken-3 text-truncate" style="max-width: 220px">
              {{ item.content }}
            </div>
          <a
            v-if="item.content && item.content.length > 50"
            href="javascript:void(0)"
            class="caption text-decoration-underline red--text text--darken-2 d-inline-block mt-1"
            @click="toggleExpand(item.id)"
          >
            Xem thêm
          </a>
      </template>

      <!-- Khi đã mở rộng: Hiển thị đầy đủ dòng và các đoạn văn bản -->
      <template v-else>
        <div class="text-caption grey--text text--darken-3 full-content" style="max-width: 220px; white-space: pre-line;">
          {{ item.content }}
        </div>
        <a
          href="javascript:void(0)"
          class="caption text-decoration-underline red--text text--darken-2 d-inline-block mt-1"
          @click="toggleExpand(item.id)"
        >
          Ẩn bớt
        </a>
      </template>
    </div>
  </template>

  <!-- Cột Trạng thái (Đã tăng chiều rộng lên 140px) -->
  <template #[`item.status`]="{ item }">
    <div style="min-width: 140px;">
      <v-select
        v-model="item.status"
        :items="statusOptions"
        dense
        solo
        flat
        hide-details
        class="status-select-btn custom-status-select"
        :background-color="item.status === 1 || item.status === 'ACTIVE' ? '#a2212b' : '#78909C'"
        dark
        @change="handleStatusSelect(item, $event)"
      ></v-select>
    </div>
  </template>

      <!-- Cột Chức năng -->
      <template #[`item.actions`]="{ item }">
        <div class="d-flex align-center justify-center action-icons">
          <v-btn icon x-small color="info" @click="viewDetail(item)">
            <v-icon size="20">mdi-eye</v-icon>
          </v-btn>
          <v-btn icon x-small color="warning" @click="editItem(item)">
            <v-icon size="20">mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon x-small color="error" @click="deleteItem(item)">
            <v-icon size="20">mdi-trash-can</v-icon>
          </v-btn>
        </div>
      </template>
    </v-data-table>

    <!-- Thanh Phân Trang -->
    <div class="d-flex align-center justify-end pt-3 custom-pagination">
      <div class="d-flex align-center mr-3">
        <span class="caption grey--text mr-1">Bản ghi:</span>
        <v-select
          v-model="pageSize"
          :items="[10, 20, 50, 100]"
          dense
          outlined
          hide-details
          style="width: 65px"
          class="bg-white dense-input"
          @change="page = 1"
        ></v-select>
      </div>

      <div class="d-flex align-center mr-3">
        <span class="caption grey--text mr-1">Trang:</span>
        <v-text-field
          v-model="pageInput"
          outlined
          dense
          hide-details
          style="width: 45px"
          class="bg-white text-center dense-input"
          @keyup.enter="goToPage"
        ></v-text-field>
        <v-btn
          color="#a2212b"
          dark
          x-small
          elevation="0"
          width="44"
          height="44"
          class="ml-1 text-capitalize pagination-square-btn"
          @click="goToPage"
        >
          Đi
        </v-btn>
      </div>

      <div class="d-flex align-center">
        <v-btn
          icon
          x-small
          outlined
          width="44"
          height="44"
          class="mr-1 pagination-square-btn"
          :disabled="page <= 1"
          @click="changePage(page - 1)"
        >
          <v-icon size="20">mdi-chevron-left</v-icon>
        </v-btn>

        <v-btn
          color="#a2212b"
          dark
          x-small
          elevation="0"
          min-width="44"
          width="44"
          height="44"
          class="pa-0 font-weight-bold pagination-square-btn"
        >
          {{ page }}
        </v-btn>

        <v-btn
          icon
          x-small
          outlined
          width="44"
          height="44"
          class="ml-1 pagination-square-btn"
          :disabled="page >= totalPages"
          @click="changePage(page + 1)"
        >
          <v-icon size="20">mdi-chevron-right</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- MODAL XEM CHI TIẾT CẤU HÌNH MAIL -->
    <v-dialog v-model="detailModal.show" max-width="680px" scrollable>
      <v-card class="rounded-sm">
        <v-card-title class="white--text py-2 px-4 d-flex align-center justify-space-between red-header">
          <span class="text-body-1 font-weight-bold white--text">Chi tiết cấu hình mail</span>
          <v-btn icon dark x-small @click="detailModal.show = false">
            <v-icon x-small>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pt-4 pb-2 px-5 black--text">
          <div class="mb-3 text-body-2">
            <span class="grey--text text--darken-1 mr-2">Tên:</span>
            <span class="font-weight-medium red--text text--darken-3">{{ detailModal.item.name }}</span>
          </div>

      <v-row dense class="mb-2 align-center">
        <!-- Đối tượng gửi mail -->
        <v-col cols="12" sm="6" class="d-flex align-center">
          <span class="grey--text text--darken-1 mr-2 text-body-2">Đối tượng gửi mail:</span>
            <v-chip
              v-if="detailModal.item.target || detailModal.item.sendType"
              :color="getSendTypeColor(detailModal.item.target || detailModal.item.sendType)"
              x-small
              dark
              class="px-3 caption font-weight-medium"
            >
              {{ getSendTypeLabel(detailModal.item.target || detailModal.item.sendType) }}
            </v-chip>
        </v-col>

        <!-- Loại gửi / Mục tiêu (Thay color="#03A9F4" thành hàm getConfigTypeColor) -->
        <v-col cols="12" sm="6" class="d-flex align-center">
          <span class="grey--text text--darken-1 mr-2 text-body-2">Mục tiêu:</span>
            <v-chip
              v-if="detailModal.item.configType || detailModal.item.type"
              :color="getConfigTypeColor(detailModal.item.configType || detailModal.item.type)"
              x-small
              dark
              class="px-3 caption font-weight-medium"
            >
              {{ getConfigTypeLabel(detailModal.item.configType || detailModal.item.type) }}
            </v-chip>
        </v-col>
      </v-row>

  <v-row dense class="mb-3 align-center">
    <!-- Hành động -->
    <v-col cols="12" sm="6" class="d-flex align-center">
      <span class="grey--text text--darken-1 mr-2 text-body-2">Hành động:</span>

      <!-- Hiển thị chấm tròn xanh nếu là REMIND_REGISTER hoặc không có chữ nhãn -->
      <span
        v-if="(detailModal.item.actionType || detailModal.item.actionSendType) === 'REMIND_REGISTER' || !getActionTypeLabel(detailModal.item.actionType || detailModal.item.actionSendType)"
        class="status-dot-blue"
      ></span>

      <!-- Hiển thị dạng Chip màu đối với các hành động khác -->
      <v-chip
        v-else
        :color="getActionTypeColor(detailModal.item.actionType || detailModal.item.actionSendType)"
        x-small
        dark
        class="px-3 caption font-weight-medium"
      >
        {{ getActionTypeLabel(detailModal.item.actionType || detailModal.item.actionSendType) }}
      </v-chip>
    </v-col>

    <!-- Trạng thái -->
    <v-col cols="12" sm="6" class="d-flex align-center">
      <span class="grey--text text--darken-1 mr-2 text-body-2">Trạng thái:</span>
      <v-chip
        :color="detailModal.item.status === 'ACTIVE' || detailModal.item.status === 1 ? '#a2212b' : '#78909C'"
        x-small
        dark
        class="px-3 caption font-weight-medium"
      >
        {{ (detailModal.item.status === 'ACTIVE' || detailModal.item.status === 1) ? 'Kích hoạt' : 'Chưa kích hoạt' }}
      </v-chip>
    </v-col>
  </v-row>

          <div class="mt-4">
            <div class="grey--text text--darken-1 text-body-2 mb-2">Nội dung:</div>
            <div class="detail-content-box text-body-2 grey--text text--darken-4">
              {{ detailModal.item.content }}
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="px-4 pb-4 pt-2 justify-end">
          <v-btn outlined color="grey darken-2" small height="32" class="text-capitalize px-4 font-weight-medium" @click="detailModal.show = false">
            Đóng <v-icon x-small class="ml-1">mdi-close</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MODAL XÁC NHẬN XÓA CẤU HÌNH MAIL -->
    <v-dialog v-model="deleteModal.show" max-width="480px" persistent>
      <v-card class="rounded-sm">
        <v-card-title class="white--text py-2 px-4 d-flex align-center justify-space-between red-header">
          <span class="text-body-1 font-weight-bold white--text">Xác nhận</span>
          <v-btn icon dark x-small @click="deleteModal.show = false">
            <v-icon x-small>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="py-5 px-5 black--text text-body-2">
          Bạn có chắc chắn muốn xóa cấu hình gửi mail
          <strong class="red--text text--darken-2 font-weight-bold">
            {{ deleteModal.item.actionType || deleteModal.item.actionSendType || deleteModal.item.name }}
          </strong>
          không?
        </v-card-text>

        <v-card-actions class="px-4 pb-4 pt-0 justify-end">
          <v-btn outlined color="grey darken-2" small height="32" class="text-capitalize px-3 font-weight-medium" @click="deleteModal.show = false">
            Đóng <v-icon x-small class="ml-1">mdi-close</v-icon>
          </v-btn>
          <v-btn color="#a2212b" dark small height="32" elevation="0" class="text-capitalize px-3 font-weight-medium ml-2" @click="confirmDelete">
            Xác nhận
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MODAL THÊM MỚI / CẬP NHẬT CẤU HÌNH MAIL -->
    <v-dialog v-model="createModal.show" max-width="720px" persistent scrollable>
      <v-card class="rounded-sm">
        <v-card-title class="white--text py-2 px-4 d-flex align-center justify-space-between red-header">
          <span class="text-body-1 font-weight-bold white--text">
            {{ createModal.isEdit ? 'Cập nhật cấu hình mail' : 'Thêm mới cấu hình mail' }}
          </span>
          <v-btn icon dark x-small @click="createModal.show = false">
            <v-icon x-small>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pt-4 pb-2 px-4">
          <v-form ref="createForm" v-model="createModal.valid">
            <v-row dense>
              <!-- Tên cấu hình mail -->
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="createModal.form.name"
                  label="Tên cấu hình mail (*)"
                  placeholder="Tên cấu hình mail (*)"
                  outlined
                  dense
                  hide-details="auto"
                  class="custom-field mb-2"
                  :rules="[v => !!v || 'Vui lòng nhập tên cấu hình']"
                ></v-text-field>
              </v-col>

              <!-- Đối tượng gửi mail -->
              <v-col cols="12" sm="6">
                <v-select
                  v-model="createModal.form.target"
                  :items="targetOptions"
                  item-text="text"
                  item-value="value"
                  label="Đối tượng gửi mail (*)"
                  placeholder="Đối tượng gửi mail (*)"
                  outlined
                  dense
                  hide-details="auto"
                  class="custom-field mb-2"
                  :rules="[v => !!v || 'Vui lòng chọn đối tượng']"
                ></v-select>
              </v-col>

              <!-- Loại gửi / Loại cấu hình -->
              <v-col cols="12" sm="6">
                <v-select
                  v-model="createModal.form.configType"
                  :items="typeConfigOptions"
                  item-text="text"
                  item-value="value"
                  label="Loại gửi (*)"
                  placeholder="Loại gửi (*)"
                  outlined
                  dense
                  hide-details="auto"
                  class="custom-field mb-2"
                  :rules="[v => !!v || 'Vui lòng chọn loại gửi']"
                ></v-select>
              </v-col>

              <!-- Loại hành động -->
              <v-col cols="12" sm="6">
                <v-select
                  v-model="createModal.form.actionType"
                  :items="actionTypeOptions"
                  item-text="text"
                  item-value="value"
                  label="Loại hành động (*)"
                  placeholder="Loại hành động (*)"
                  outlined
                  dense
                  clearable
                  hide-details="auto"
                  class="custom-field mb-2"
                ></v-select>
              </v-col>

              <!-- Trạng thái -->
              <v-col cols="12" sm="6">
                <v-select
                  v-model="createModal.form.status"
                  :items="statusOptions"
                  item-text="text"
                  item-value="value"
                  label="Trạng thái"
                  outlined
                  dense
                  hide-details="auto"
                  class="custom-field mb-2"
                ></v-select>
              </v-col>
            </v-row>

            <!-- Trình soạn thảo Rich Text Editor -->
            <div class="editor-wrapper mt-2">
              <client-only placeholder="Đang tải bộ soạn thảo...">
                <vue-editor
                  v-model="createModal.form.content"
                  :editor-toolbar="customToolbar"
                  placeholder="Nhập nội dung email..."
                />
              </client-only>
            </div>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-4 pb-4 pt-2 justify-end">
          <v-btn outlined color="grey darken-2" small height="32" class="text-capitalize px-3 font-weight-medium" @click="createModal.show = false">
            Đóng <v-icon x-small class="ml-1">mdi-close</v-icon>
          </v-btn>
          <v-btn color="#a2212b" dark small height="32" elevation="0" class="text-capitalize px-3 font-weight-medium ml-2" @click="saveConfig">
            Lưu <v-icon x-small class="ml-1">mdi-content-save-outline</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import mailConfigService from '~/services/mailConfigService'

export default {
  name: 'CauHinhEmailPage',
  middleware: 'authenticated',
  components: {
    VueEditor: () =>
      process.client
        ? import('vue2-editor').then((m) => m.VueEditor)
        : Promise.resolve(null),
  },
  data() {
  return {
    loading: false,
    page: 1,
    pageSize: 50,
    pageInput: 1,
    totalRecords: 0,

    customToolbar: [
      [{ header: [false, 1, 2, 3, 4, 5, 6] }],
      ['bold', 'italic', 'underline', 'strike'],
      [
        { align: '' },
        { align: 'center' },
        { align: 'right' },
        { align: 'justify' },
      ],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ color: [] }, { background: [] }],
      ['link', 'image'],
      ['clean'],
    ],
    
    // Mảng lưu ID của các dòng được mở rộng Xem thêm
    expandedItems: [],

    confirmDialog: {
      show: false,
      item: null,
      targetValue: null,
      oldValue: null,
      fromStatusText: '',
      toStatusText: '',
    },

    detailModal: {
      show: false,
      item: {
        name: '',
        target: '',
        configType: '',
        actionType: '',
        status: 1,
        content: '',
      },
    },

    deleteModal: {
      show: false,
      item: {},
    },

    // Các ô nhập bộ lọc
    filters: {
      keyword: '',
      status: null,
      type: null,
    },

    // Điều kiện lọc thực tế
    activeFilters: {
      keyword: '',
      status: null,
      type: null,
    },

    // Danh mục Option lọc/thêm/sửa (Hỗ trợ cả chuỗi Tiếng Việt lẫn Code)
    statusOptions: [
      { text: 'Kích hoạt', value: 1 },
      { text: 'Chưa kích hoạt', value: 0 },
    ],

    typeConfigOptions: [
      { text: 'Học lại', value: 'Học lại' },
      { text: 'Thi lại', value: 'Thi lại' },
      { text: 'Bảo vệ lại', value: 'Bảo vệ lại' },
      { text: 'Danh mục hệ thống', value: 'Danh mục hệ thống' },
    ],

    targetOptions: [
      { text: 'Sinh viên', value: 'Sinh viên' },
      { text: 'Cán bộ quản lý', value: 'Cán bộ quản lý' },
      { text: 'Giảng viên', value: 'Giảng viên' },
    ],

    actionTypeOptions: [
      { text: 'Lịch thi', value: 'Lịch thi' },
      { text: 'Xác nhận đăng ký', value: 'Xác nhận đăng ký' },
      { text: 'Thanh toán thành công', value: 'Thanh toán thành công' },
      { text: 'Từ chối', value: 'Từ chối' },
      { text: 'Nhắc đóng học phí', value: 'Nhắc đóng học phí' },
      { text: 'Kết quả thi', value: 'Kết quả thi' },
      { text: 'Gửi mã OTP', value: 'Gửi mã OTP' },
      { text: 'Nhắc đăng ký', value: 'Nhắc đăng ký' },
    ],

    typeOptions: [
      { text: 'Học lại', value: 'Học lại' },
      { text: 'Thi lại', value: 'Thi lại' },
      { text: 'Bảo vệ lại', value: 'Bảo vệ lại' },
      { text: 'Danh mục hệ thống', value: 'Danh mục hệ thống' },
    ],

    headers: [
      { text: 'STT', value: 'stt', width: '50px', align: 'center', sortable: false },
      { text: 'Tên', value: 'name', width: '160px' },
      { text: 'Đối tượng gửi mail', value: 'target', width: '130px' },
      { text: 'Loại cấu hình gửi mail', value: 'configType', width: '140px' },
      { text: 'Loại hành động', value: 'actionType', width: '150px' },
      { text: 'Nội dung', value: 'content', width: '280px', cellClass: 'content-cell' }, // Nới rộng Nội dung
      { text: 'Trạng thái', value: 'status', width: '160px', align: 'left' }, // Căn trái Header Trạng thái
      { text: 'Chức năng', value: 'actions', width: '90px', align: 'center', sortable: false },
    ],

    items: [
      {
        id: 1,
        name: 'Thông báo sinh viên đăng ký học lại trước thời hạn',
        target: 'Sinh viên',
        configType: 'Học lại',
        actionType: '',
        content: `Trung tâm Đào tạo liên tục - ĐẠI HỌC BÁCH KHOA HÀ NỘI xin thông báo:\n\nCăn cứ vào kết quả học tập, Sinh viên [TEN_SV] (MSSV: [MA_SV]) cần thực hiện đăng ký học lại môn học: [TEN_MON_HOC].\n• Đợt học lại: [DOT_HOC_LAI]\n• Thời hạn đăng ký cuối cùng: Trước ngày [HAN_CHOT]\nLưu ý: Sinh viên cần hoàn thành đăng ký đúng hạn để đảm bảo tiến độ học tập. Nếu cần hỗ trợ thêm thông tin, bạn vui lòng liên hệ trực tiếp với Cán bộ quản lý lớp để được hướng dẫn.\n\nTrân trọng!`,
        status: 1,
      },
      {
        id: 2,
        name: 'Thông báo thanh toán tiền giảng dạy lớp học lại',
        target: 'Giảng viên',
        configType: 'Học lại',
        actionType: 'Thanh toán thành công',
        content: 'Trung tâm Đào tạo liên tục - ĐẠI HỌC BÁCH KHOA HÀ NỘI xin thông báo:...',
        status: 1,
      },
      {
        id: 3,
        name: 'Thông báo đăng ký bảo vệ lại thành công',
        target: 'Sinh viên',
        configType: 'Bảo vệ lại',
        actionType: 'Xác nhận đăng ký',
        content: 'Trung tâm Đào tạo liên tục - ĐẠI HỌC BÁCH KHOA HÀ NỘI xin thông báo:...',
        status: 1,
      },
      {
        id: 4,
        name: 'Thông báo gửi mã OTP dành cho sinh viên',
        target: 'Sinh viên',
        configType: 'Bảo vệ lại',
        actionType: 'Gửi mã OTP',
        content: 'Trung tâm Đào tạo liên tục - ĐẠI HỌC BÁCH KHOA HÀ NỘI xin thông báo:...',
        status: 1,
      },
      {
        id: 5,
        name: 'Thông báo sinh viên thanh toán thành công',
        target: 'Sinh viên',
        configType: 'Học lại',
        actionType: 'Thanh toán thành công',
        content: 'Trung tâm Đào tạo liên tục - ĐẠI HỌC BÁCH KHOA HÀ NỘI xin thông báo:...',
        status: 1,
      },
      {
        id: 6,
        name: 'Nhắc đóng học phí học',
        target: 'Sinh viên',
        configType: 'Học lại',
        actionType: 'Nhắc đóng học phí',
        content: 'Trung tâm Đào tạo liên tục - ĐẠI HỌC BÁCH KHOA HÀ NỘI xin thông báo tới [MA_SV] - [TEN_SV]...',
        status: 1,
      },
    ],

    // Dialog Thêm mới/Sửa
    createModal: {
      show: false,
      isEdit: false,
      valid: true,
      form: {
        id: null,
        name: '',
        target: 'Sinh viên',
        configType: 'Học lại',
        actionType: null,
        status: 1,
        content: '',
      },
    },
  }
},

  computed: {
  filteredItems() {
    return this.items.filter(item => {
      // 1. Lọc theo trạng thái
      if (this.activeFilters.status !== null && this.activeFilters.status !== undefined) {
        if (item.status !== this.activeFilters.status) return false
      }

      // 2. Lọc theo loại cấu hình (hỗ trợ cả type và configType)
      if (this.activeFilters.type) {
        const itemType = item.configType || item.type
        if (itemType !== this.activeFilters.type) return false
      }

      // 3. Tìm kiếm từ khóa
      if (this.activeFilters.keyword) {
        const kw = this.activeFilters.keyword.toLowerCase().trim()
        
        const nameVal = (item.name || '').toLowerCase()
        const targetVal = (item.target || item.sendType || '').toLowerCase()
        const configTypeVal = (item.configType || item.type || '').toLowerCase()
        const actionTypeVal = (item.actionType || item.actionSendType || '').toLowerCase()
        const contentVal = (item.content || '').toLowerCase()

        return (
          nameVal.includes(kw) ||
          targetVal.includes(kw) ||
          configTypeVal.includes(kw) ||
          actionTypeVal.includes(kw) ||
          contentVal.includes(kw)
        )
      }

      return true
    })
  },

  paginatedItems() {
    const start = (this.page - 1) * this.pageSize
    return this.filteredItems.slice(start, start + this.pageSize)
  },

  totalPages() {
    return Math.ceil(this.filteredItems.length / this.pageSize) || 1
  },
},

  mounted() {
    this.$store.commit('SET_PAGE_TITLE', 'Cấu hình email')
    this.fetchData()
  },

  methods: {
  // Đảo trạng thái Mở rộng / Thu gọn dòng nội dung
  toggleExpand(id) {
    const idx = this.expandedItems.indexOf(id)
    if (idx > -1) {
      this.expandedItems.splice(idx, 1)
    } else {
      this.expandedItems.push(id)
    }
  },

  // 1. CHUYỂN ĐỔI ĐỐI TƯỢNG GỬI MAIL
getSendTypeLabel(type) {
  if (!type) return ''
  const map = {
    SV: 'Sinh viên',
    GV: 'Giảng viên',
    CBQL: 'Cán bộ quản lý',
    STUDENT: 'Sinh viên',
    TEACHER: 'Giảng viên',
    MANAGER: 'Cán bộ quản lý',
  }
  return map[type] || type
},

getSendTypeColor(type) {
  if (!type) return '#757575'
  const map = {
    // Mã enum tiếng Anh / Viết tắt
    SV: '#2196F3',
    GV: '#00897B',
    CBQL: '#FB8C00',
    STUDENT: '#2196F3',
    TEACHER: '#00897B',
    MANAGER: '#FB8C00',

    // Trường hợp dữ liệu trả về sẵn tiếng Việt
    'Sinh viên': '#2196F3',
    'Giảng viên': '#00897B',
    'Cán bộ quản lý': '#FB8C00',
  }
  return map[type] || '#757575'
},

// Thêm hàm lấy màu cho Loại cấu hình gửi mail
  // 1. CHUYỂN ĐỔI LOẠI CẤU HÌNH GỬI MAIL (Nhãn chữ)
    getConfigTypeLabel(type) {
      if (!type) return ''
      const map = {
        RETAKE_COURSES: 'Học lại',
        RETAKE_EXAM: 'Thi lại',
        REASSESSMENT: 'Bảo vệ lại',
        RE_LEARN: 'Học lại',
        RE_EXAM: 'Thi lại',
        RE_DEFEND: 'Bảo vệ lại',
      }
      return map[type] || type
    },

    // 2. CHUYỂN ĐỔI LOẠI CẤU HÌNH GỬI MAIL (Màu sắc)
    getConfigTypeColor(type) {
      if (!type) return '#0288D1'
      const map = {
        RETAKE_COURSES: '#0288D1',
        RE_LEARN: '#0288D1',
        RETAKE_EXAM: '#7B1FA2',
        RE_EXAM: '#7B1FA2',
        REASSESSMENT: '#00838F',
        RE_DEFEND: '#00838F',
        'Học lại': '#0288D1',
        'Thi lại': '#7B1FA2',
        'Bảo vệ lại': '#00838F',
      }
      return map[type] || '#0288D1'
    },

// 3. CHUYỂN ĐỔI LOẠI HÀNH ĐỘNG
getActionTypeLabel(action) {
  if (!action) return ''
  const map = {
    REMIND_REGISTER: '', // Chấm tròn xanh
    PAY_SUCCESS: 'Thanh toán thành công',
    PAYMENT_SUCCESS: 'Thanh toán thành công',
    CONFIRM: 'Xác nhận đăng ký',
    CONFIRM_REGISTER: 'Xác nhận đăng ký',
    REMIND_PAY: 'Nhắc đóng học phí',
    REMIND_FEE: 'Nhắc đóng học phí',
    REJECT: 'Từ chối',
    RESULT: 'Kết quả thi',
    RESULT_EXAM: 'Kết quả thi',
    OTP: 'Gửi mã OTP',
    SEND_OTP: 'Gửi mã OTP',
  }
  return map[action] !== undefined ? map[action] : action
},

getActionTypeColor(action) {
  if (!action) return '#757575'
  const map = {
    // Mã enum
    REMIND_REGISTER: '#2196F3',
    PAY_SUCCESS: '#4CAF50',
    PAYMENT_SUCCESS: '#4CAF50',
    CONFIRM: '#00BCD4',
    CONFIRM_REGISTER: '#00BCD4',
    REMIND_PAY: '#FF9800',
    REMIND_FEE: '#FF9800',
    REJECT: '#F44336',
    RESULT: '#9C27B0',
    RESULT_EXAM: '#9C27B0',
    OTP: '#009688',
    SEND_OTP: '#009688',

    // Dữ liệu văn bản tiếng Việt
    'Thanh toán thành công': '#4CAF50',
    'Xác nhận đăng ký': '#00BCD4',
    'Nhắc đóng học phí': '#FF9800',
    'Từ chối': '#F44336',
    'Kết quả thi': '#9C27B0',
    'Gửi mã OTP': '#009688',
  }
  return map[action] || '#757575'
},

  async fetchData() {
    this.loading = true
    try {
      const params = {
        pageIndex: this.page,
        pageSize: this.pageSize,
        ...this.activeFilters,
      }
      const res = await mailConfigService.getList(params)
      // Cấu trúc response API: res.data.data là mảng danh sách
      if (res && res.data && res.data.data) {
        this.items = res.data.data
        this.totalRecords = res.data.totalRecords || 0
        this.totalPages = res.data.totalPages || 1
      }
    } catch (e) {
      console.error(e)
    } finally {
      this.loading = false
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
      type: null,
    }
    this.handleSearch()
  },

  handleStatusSelect(item, newValue) {
    const oldValue = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    item.status = oldValue

    this.confirmDialog = {
      show: true,
      item,
      targetValue: newValue,
      oldValue,
      fromStatusText: oldValue === 'ACTIVE' ? 'Kích hoạt' : 'Chưa kích hoạt',
      toStatusText: newValue === 'ACTIVE' ? 'Kích hoạt' : 'Chưa kích hoạt',
    }
  },

  async confirmStatusChange() {
    const { item, targetValue } = this.confirmDialog

    try {
      await mailConfigService.updateStatus(item.id, targetValue)
    } catch (e) {
      // Vẫn cập nhật trạng thái tại client khi API chưa sẵn sàng.
    } finally {
      item.status = targetValue
      this.confirmDialog.show = false
    }
  },

  cancelStatusChange() {
    const { item, oldValue } = this.confirmDialog
    if (item) item.status = oldValue
    this.confirmDialog.show = false
  },

  goToPage() {
    const p = parseInt(this.pageInput)
    if (p >= 1 && p <= this.totalPages) {
      this.page = p
      this.fetchData()
    } else {
      this.pageInput = this.page
    }
  },

  changePage(newPage) {
    this.page = newPage
    this.pageInput = newPage
    this.fetchData()
  },

  openCreateModal() {
    this.createModal.isEdit = false
    this.createModal.form = {
      id: Date.now(),
      name: '',
      sendType: 'SV',
      type: 'RETAKE_COURSES',
      actionSendType: 'REMIND_REGISTER',
      status: 'ACTIVE',
      content: '',
    }
    this.createModal.show = true
    this.$nextTick(() => {
      if (this.$refs.createForm) this.$refs.createForm.resetValidation()
    })
  },

  saveConfig() {
    if (this.$refs.createForm && !this.$refs.createForm.validate()) return

    if (this.createModal.isEdit) {
      const index = this.items.findIndex(i => i.id === this.createModal.form.id)
      if (index !== -1) {
        this.$set(this.items, index, { ...this.createModal.form })
      }
    } else {
      this.items.unshift({ ...this.createModal.form })
    }

    this.createModal.show = false
    if (this.$showSuccess) this.$showSuccess('Lưu cấu hình thành công')
  },

  viewDetail(item) {
  this.detailModal.item = { ...item }
  this.detailModal.show = true
},

editItem(item) {
  this.createModal.isEdit = true
  this.createModal.form = {
    id: item.id,
    name: item.name || '',
    target: item.target || item.sendType || 'Sinh viên',
    configType: item.configType || item.type || 'Học lại',
    actionType: item.actionType || item.actionSendType || null,
    status: item.status !== undefined ? item.status : 1,
    content: item.content || '',
  }
  this.createModal.show = true
  this.$nextTick(() => {
    if (this.$refs.createForm) this.$refs.createForm.resetValidation()
  })
},

  deleteItem(item) {
    this.deleteModal.item = { ...item }
    this.deleteModal.show = true
  },

  confirmDelete() {
    this.items = this.items.filter(i => i.id !== this.deleteModal.item.id)
    this.deleteModal.show = false
  },
},
}
</script>

<style scoped>
.page-container {
  width: 100%;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
  font-size: 15px;
}

.gap-2 {
  gap: 6px;
}

/* --- BẢNG DỮ LIỆU --- */
.custom-table >>> table {
  width: 100% !important;
  table-layout: fixed !important;
}

/* Header Bảng */
.custom-table >>> th {
  font-weight: 700 !important;
  color: #111111 !important;
  background-color: #f8f9fa !important;
  border-bottom: 1px solid #e0e0e0 !important;
  font-size: 0.86rem !important;
  padding: 7px 9px !important;
}

/* Nội dung Cell Bảng - Mặc định căn giữa theo chiều dọc */
.custom-table >>> td {
  border-bottom: 1px solid #f0f0f0 !important;
  padding: 6px 9px !important;
  vertical-align: middle !important;
  font-size: 0.86rem !important;
}

/* Cột Nội dung căn lên trên để không bị khoảng trống khi mở rộng */
.custom-table >>> td.content-cell {
  vertical-align: top !important;
}

.content-column .full-content {
  line-height: 1.5;
  color: #333 !important;
}

.custom-table >>> .v-chip {
  font-size: 0.76rem !important;
  min-height: 24px !important;
}

/* --- CUSTOM NÚT TRẠNG THÁI (MỞ RỘNG HIỂN THỊ TRỌN CHỮ CHƯA KÍCH HOẠT) --- */
.status-select-btn {
  min-width: 135px !important;
  width: 135px !important;
}

.status-select-btn >>> .v-input__slot {
  min-height: 28px !important;
  height: 28px !important;
  padding: 0 8px !important;
  border-radius: 14px !important;
}

.status-select-btn >>> .v-select__selection {
  color: #ffffff !important;
  font-size: 0.76rem !important;
  font-weight: 500 !important;
  margin: 0 !important;
  white-space: nowrap !important;
  overflow: visible !important;
}

.status-select-btn >>> .v-icon {
  color: #ffffff !important;
  font-size: 16px !important;
  margin-left: 2px !important;
}

/* --- PHÂN TRANG --- */
.dense-input >>> .v-input__slot {
  min-height: 28px !important;
  padding: 0 4px !important;
}

.dense-input >>> input,
.dense-input >>> .v-select__selection {
  padding: 2px 0 !important;
  font-size: 0.82rem !important;
}

.custom-pagination .caption,
.custom-pagination .v-btn {
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

/* --- MODAL & EDITOR --- */
.red-header {
  background-color: #a2212b !important;
}

.detail-content-box {
  white-space: pre-line;
  line-height: 1.6;
  font-size: 0.875rem;
}

.custom-field >>> .v-input__slot {
  min-height: 38px !important;
}

.custom-field >>> .v-label {
  font-size: 0.85rem !important;
}

.editor-wrapper {
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  background: #fff;
}

::v-deep .quill-editor {
  background-color: #ffffff;
  border-radius: 4px;
}

::v-deep .ql-toolbar.ql-snow {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  border-color: #d0d0d0;
  background-color: #f8f9fa;
  padding: 6px 8px;
}

::v-deep .ql-container.ql-snow {
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  border-color: #d0d0d0;
  min-height: 180px;
  font-size: 0.9rem;
}

::v-deep .ql-editor.ql-blank::before {
  font-style: normal;
  color: #9e9e9e;
  font-size: 0.875rem;
}

.page-container >>> .v-input input,
.page-container >>> .v-select__selection,
.page-container >>> .v-label {
  font-size: 0.9rem !important;
}

.editor-btn {
  padding: 4px 7px;
  font-size: 14px;
}

.editor-textarea >>> textarea {
  font-size: 0.9rem !important;
  padding: 10px !important;
}

/* Chấm tròn xanh cho hành động REMIND_REGISTER */
.status-dot-blue {
  display: inline-block;
  width: 12px;
  height: 12px;
  background-color: #2196f3;
  border-radius: 50%;
  vertical-align: middle;
}
</style>