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

      <!-- Cột Đối tượng gửi mail -->
      <template #[`item.target`]="{ item }">
        <v-chip
          v-if="item.target"
          :color="getTargetColor(item.target)"
          x-small
          dark
          class="px-2 caption font-weight-medium"
        >
          {{ item.target }}
        </v-chip>
      </template>

      <!-- Cột Loại cấu hình gửi mail -->
      <template #[`item.configType`]="{ item }">
        <v-chip
          v-if="item.configType"
          color="#2196F3"
          x-small
          dark
          class="px-2 caption font-weight-medium"
        >
          {{ item.configType }}
        </v-chip>
      </template>

      <!-- Cột Loại hành động -->
      <template #[`item.actionType`]="{ item }">
        <v-chip
          v-if="item.actionType"
          :color="getActionColor(item.actionType)"
          x-small
          dark
          class="px-2 caption font-weight-medium"
        >
          {{ item.actionType }}
        </v-chip>
      </template>

      <!-- Cột Nội dung (Tính năng Xem thêm / Ẩn bớt) -->
      <template #[`item.content`]="{ item }">
        <div class="py-2 content-column">
          <!-- Khi chưa mở rộng: Hiện cắt ngắn 1 dòng -->
          <template v-if="!expandedItems.includes(item.id)">
            <div class="text-caption grey--text text--darken-3 text-truncate" style="max-width: 420px">
              {{ item.content }}
            </div>
            <a
              v-if="item.content && item.content.length > 80"
              href="javascript:void(0)"
              class="caption text-decoration-underline red--text text--darken-2 d-inline-block mt-1"
              @click="toggleExpand(item.id)"
            >
              Xem thêm
            </a>
          </template>

          <!-- Khi đã mở rộng: Hiển thị đầy đủ dòng và các đoạn văn bản -->
          <template v-else>
            <div class="text-caption grey--text text--darken-3 full-content" style="max-width: 420px; white-space: pre-line;">
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

      <!-- Cột Trạng thái -->
      <template #[`item.status`]="{ item }">
        <v-select
          v-model="item.status"
          :items="statusOptions"
          dense
          solo
          flat
          hide-details
          class="status-select-btn"
          :background-color="item.status === 1 ? '#a2212b' : '#78909C'"
          dark
          @change="handleStatusSelect(item, $event)"
        ></v-select>
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
            <v-col cols="12" sm="6" class="d-flex align-center">
              <span class="grey--text text--darken-1 mr-2 text-body-2">Đối tượng gửi mail:</span>
              <v-chip
                v-if="detailModal.item.target"
                :color="getTargetColor(detailModal.item.target)"
                x-small
                dark
                class="px-3 caption font-weight-medium"
              >
                {{ detailModal.item.target }}
              </v-chip>
            </v-col>

            <v-col cols="12" sm="6" class="d-flex align-center">
              <span class="grey--text text--darken-1 mr-2 text-body-2">Mục tiêu:</span>
              <v-chip
                v-if="detailModal.item.configType"
                color="#2196F3"
                x-small
                dark
                class="px-3 caption font-weight-medium"
              >
                {{ detailModal.item.configType }}
              </v-chip>
            </v-col>
          </v-row>

          <v-row dense class="mb-3 align-center">
            <v-col cols="12" sm="6" class="d-flex align-center">
              <span class="grey--text text--darken-1 mr-2 text-body-2">Hành động:</span>
              <v-chip
                v-if="detailModal.item.actionType"
                :color="getActionColor(detailModal.item.actionType)"
                x-small
                dark
                class="px-3 caption font-weight-medium"
              >
                {{ detailModal.item.actionType }}
              </v-chip>
            </v-col>

            <v-col cols="12" sm="6" class="d-flex align-center">
              <span class="grey--text text--darken-1 mr-2 text-body-2">Trạng thái:</span>
              <v-chip
                :color="detailModal.item.status === 1 ? '#a2212b' : '#78909C'"
                x-small
                dark
                class="px-3 caption font-weight-medium"
              >
                {{ detailModal.item.status === 1 ? 'Kích hoạt' : 'Chưa kích hoạt' }}
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
            {{ deleteModal.item.actionType || deleteModal.item.name }}
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
                  label="Đối tượng gửi mail (*)"
                  placeholder="Đối tượng gửi mail (*)"
                  outlined
                  dense
                  hide-details="auto"
                  class="custom-field mb-2"
                  :rules="[v => !!v || 'Vui lòng chọn đối tượng']"
                ></v-select>
              </v-col>

              <!-- Loại gửi -->
              <v-col cols="12" sm="6">
                <v-select
                  v-model="createModal.form.configType"
                  :items="typeConfigOptions"
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
                  label="Loại hành động (*)"
                  placeholder="Loại hành động (*)"
                  outlined
                  dense
                  clearable
                  hide-details="auto"
                  class="custom-field mb-2"
                  :rules="[v => !!v || 'Vui lòng chọn loại hành động']"
                ></v-select>
              </v-col>

              <!-- Trạng thái -->
              <v-col cols="12" sm="6">
                <v-select
                  v-model="createModal.form.status"
                  :items="statusOptions"
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
              <div class="editor-toolbar d-flex align-center flex-wrap px-2 py-1">
                <v-select :items="['Normal', 'Heading 1', 'Heading 2']" value="Normal" dense solo flat hide-details style="max-width: 90px" class="caption-select mr-1"></v-select>
                <div class="divider-vertical"></div>
                <button type="button" class="editor-btn"><b>B</b></button>
                <button type="button" class="editor-btn"><i>I</i></button>
                <button type="button" class="editor-btn"><u>U</u></button>
                <button type="button" class="editor-btn"><s>S</s></button>
                <div class="divider-vertical"></div>
                <button type="button" class="editor-btn"><v-icon x-small>mdi-format-align-left</v-icon></button>
                <button type="button" class="editor-btn"><v-icon x-small>mdi-format-align-center</v-icon></button>
                <button type="button" class="editor-btn"><v-icon x-small>mdi-format-align-right</v-icon></button>
                <button type="button" class="editor-btn"><v-icon x-small>mdi-format-align-justify</v-icon></button>
                <div class="divider-vertical"></div>
                <button type="button" class="editor-btn"><v-icon x-small>mdi-format-quote-close</v-icon></button>
                <button type="button" class="editor-btn"><v-icon x-small>mdi-code-tags</v-icon></button>
                <div class="divider-vertical"></div>
                <button type="button" class="editor-btn"><v-icon x-small>mdi-format-list-bulleted</v-icon></button>
                <button type="button" class="editor-btn"><v-icon x-small>mdi-format-list-numbered</v-icon></button>
                <div class="divider-vertical"></div>
                <button type="button" class="editor-btn"><v-icon x-small>mdi-format-indent-decrease</v-icon></button>
                <button type="button" class="editor-btn"><v-icon x-small>mdi-format-indent-increase</v-icon></button>
                <div class="divider-vertical"></div>
                <button type="button" class="editor-btn"><v-icon x-small>mdi-format-color-text</v-icon></button>
                <button type="button" class="editor-btn"><v-icon x-small>mdi-format-color-fill</v-icon></button>
                <div class="divider-vertical"></div>
                <button type="button" class="editor-btn"><v-icon x-small>mdi-link</v-icon></button>
                <button type="button" class="editor-btn"><v-icon x-small>mdi-image</v-icon></button>
                <button type="button" class="editor-btn"><v-icon x-small>mdi-table</v-icon></button>
                <button type="button" class="editor-btn"><v-icon x-small>mdi-format-clear</v-icon></button>
              </div>
              <v-textarea
                v-model="createModal.form.content"
                rows="7"
                flat
                solo
                hide-details
                class="editor-textarea"
              ></v-textarea>
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
  data() {
    return {
      loading: false,
      page: 1,
      pageSize: 50,
      pageInput: 1,
      
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

      statusOptions: [
        { text: 'Kích hoạt', value: 1 },
        { text: 'Chưa kích hoạt', value: 0 },
      ],

      // Danh mục
      typeConfigOptions: [
        'Học lại',
        'Thi lại',
        'Bảo vệ lại',
        'Danh mục hệ thống'
      ],
      targetOptions: [
        'Sinh viên',
        'Cán bộ quản lý',
        'Giảng viên'
      ],
      actionTypeOptions: [
        'Lịch thi',
        'Xác nhận đăng ký',
        'Thanh toán thành công',
        'Từ chối',
        'Nhắc đóng học phí',
        'Kết quả thi',
        'Gửi mã OTP'
      ],

      typeOptions: [
        { text: 'Học lại', value: 'Học lại' },
        { text: 'Thi lại', value: 'Thi lại' },
        { text: 'Bảo vệ lại', value: 'Bảo vệ lại' },
        { text: 'Danh mục hệ thống', value: 'Danh mục hệ thống' }
      ],

      headers: [
        { text: 'STT', value: 'stt', width: '45px', align: 'center', sortable: false },
        { text: 'Tên', value: 'name', width: '180px', sortable: false },
        { text: 'Đối tượng gửi mail', value: 'target', width: '130px', align: 'center', sortable: false },
        { text: 'Loại cấu hình gửi mail', value: 'configType', width: '140px', align: 'center', sortable: false },
        { text: 'Loại hành động', value: 'actionType', width: '150px', align: 'center', sortable: false },
        { text: 'Nội dung', value: 'content', sortable: false, cellClass: 'content-cell' },
        { text: 'Trạng thái', value: 'status', width: '110px', align: 'center', sortable: false },
        { text: 'Chức năng', value: 'actions', width: '90px', align: 'center', sortable: false },
      ],

      items: [
        {
          id: 1,
          name: 'Thông báo sinh viên đăng ký học lại trước thời hạn',
          target: 'Sinh viên',
          configType: 'Học lại',
          actionType: null,
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
        if (this.activeFilters.status !== null && this.activeFilters.status !== undefined) {
          if (item.status !== this.activeFilters.status) return false
        }

        if (this.activeFilters.type) {
          if (item.configType !== this.activeFilters.type) return false
        }

        if (this.activeFilters.keyword) {
          const kw = this.activeFilters.keyword.toLowerCase().trim()
          const nameMatch = item.name ? item.name.toLowerCase().includes(kw) : false
          const targetMatch = item.target ? item.target.toLowerCase().includes(kw) : false
          const configTypeMatch = item.configType ? item.configType.toLowerCase().includes(kw) : false
          const actionTypeMatch = item.actionType ? item.actionType.toLowerCase().includes(kw) : false
          const contentMatch = item.content ? item.content.toLowerCase().includes(kw) : false

          return nameMatch || targetMatch || configTypeMatch || actionTypeMatch || contentMatch
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

    async fetchData() {
      this.loading = true
      try {
        const params = {
          page: this.page,
          pageSize: this.pageSize,
          ...this.activeFilters,
        }
        const res = await mailConfigService.getList(params)
        if (res && res.success && res.data && res.data.list) {
          this.items = res.data.list
        }
      } catch (e) {
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

    getTargetColor(target) {
      if (target === 'Sinh viên') return '#2196F3'
      if (target === 'Giảng viên') return '#009688'
      if (target === 'Cán bộ quản lý') return '#673AB7'
      return 'grey'
    },

    getActionColor(action) {
      if (action === 'Thanh toán thành công') return '#4CAF50'
      if (action === 'Xác nhận đăng ký') return '#8BC34A'
      if (action === 'Gửi mã OTP') return '#00BCD4'
      if (action === 'Nhắc đóng học phí') return '#FF9800'
      return '#009688'
    },

    handleStatusSelect(item, newValue) {
      const oldValue = item.status === 1 ? 0 : 1
      item.status = oldValue

      this.confirmDialog = {
        show: true,
        item,
        targetValue: newValue,
        oldValue,
        fromStatusText: oldValue === 1 ? 'Kích hoạt' : 'Chưa kích hoạt',
        toStatusText: newValue === 1 ? 'Kích hoạt' : 'Chưa kích hoạt',
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
      } else {
        this.pageInput = this.page
      }
    },

    changePage(newPage) {
      this.page = newPage
      this.pageInput = newPage
    },

    openCreateModal() {
      this.createModal.isEdit = false
      this.createModal.form = {
        id: Date.now(),
        name: '',
        target: 'Sinh viên',
        configType: 'Học lại',
        actionType: null,
        status: 1,
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
      this.createModal.form = { ...item }
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
}

.gap-2 {
  gap: 6px;
}

.custom-table >>> table {
  width: 100% !important;
  table-layout: fixed !important;
}

/* TẤT CẢ CÁC CỘT MẶC ĐỊNH SẼ CĂN GIỮA THEO CHIỀU DỌC */
.custom-table >>> td {
  border-bottom: 1px solid #f0f0f0 !important;
  padding: 0 8px !important;
  vertical-align: middle !important;
}

/* RIÊNG CỘT NỘI DUNG SẼ CĂN LÊN TRÊN ĐỂ KHÔNG BỊ TRỐNG KHI MỞ RỘNG */
.custom-table >>> td.content-cell {
  vertical-align: top !important;
}

.content-column .full-content {
  line-height: 1.5;
  color: #333 !important;
}

/* Custom Nút trạng thái dạng Pill đỏ trong bảng */
.status-select-btn >>> .v-input__slot {
  min-height: 24px !important;
  padding: 0 6px !important;
  border-radius: 12px !important;
}

.status-select-btn >>> .v-select__selection {
  color: #ffffff !important;
  font-size: 0.7rem !important;
  margin: 0 !important;
}

.status-select-btn >>> .v-icon {
  color: #ffffff !important;
  font-size: 14px !important;
}

/* Bảng dữ liệu Header */
.custom-table >>> th {
  font-weight: 700 !important;
  color: #111111 !important;
  background-color: #f8f9fa !important;
  border-bottom: 1px solid #e0e0e0 !important;
  font-size: 0.78rem !important;
  padding: 0 8px !important;
}

.dense-input >>> .v-input__slot {
  min-height: 28px !important;
  padding: 0 4px !important;
}

.dense-input >>> input {
  padding: 2px 0 !important;
  font-size: 0.75rem !important;
}

/* Header Modal màu đỏ rượu */
.red-header {
  background-color: #a2212b !important;
}

.detail-content-box {
  white-space: pre-line;
  line-height: 1.6;
  font-size: 0.875rem;
}

/* Custom Field Outline sát viền */
.custom-field >>> .v-input__slot {
  min-height: 38px !important;
}

.custom-field >>> .v-label {
  font-size: 0.85rem !important;
}

/* Khung Rich Text Editor */
.editor-wrapper {
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  background: #fff;
}

.editor-toolbar {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  gap: 2px;
}

.editor-btn {
  background: transparent;
  border: none;
  outline: none;
  padding: 2px 6px;
  cursor: pointer;
  border-radius: 3px;
  font-size: 13px;
  color: #444;
}

.editor-btn:hover {
  background-color: #e0e0e0;
}

.divider-vertical {
  width: 1px;
  height: 16px;
  background-color: #d0d0d0;
  margin: 0 4px;
}

.editor-textarea >>> textarea {
  font-size: 0.85rem !important;
  line-height: 1.4 !important;
  color: #333 !important;
  padding: 8px !important;
}

.caption-select >>> .v-input__slot {
  min-height: 24px !important;
  padding: 0 4px !important;
}

.caption-select >>> .v-select__selection {
  font-size: 0.75rem !important;
}

/* Tăng nhẹ kích thước tổng thể giao diện */
.page-container {
  font-size: 15px;
}

.page-container >>> .v-input input,
.page-container >>> .v-select__selection,
.page-container >>> .v-label {
  font-size: 0.9rem !important;
}

.custom-table >>> th {
  font-size: 0.86rem !important;
  padding: 7px 9px !important;
}

.custom-table >>> td {
  font-size: 0.86rem !important;
  padding: 6px 9px !important;
}

.custom-table >>> .v-chip {
  font-size: 0.76rem !important;
  min-height: 24px !important;
}

.status-select-btn >>> .v-select__selection {
  font-size: 0.76rem !important;
}

.dense-input >>> input,
.dense-input >>> .v-select__selection {
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

.editor-btn {
  padding: 4px 7px;
  font-size: 14px;
}

.editor-textarea >>> textarea {
  font-size: 0.9rem !important;
  padding: 10px !important;
}

</style>