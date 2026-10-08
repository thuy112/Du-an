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
        <v-text-field
          v-model="filters.keyword"
          placeholder="Tìm kiếm"
          outlined
          dense
          hide-details
          clearable
          style="max-width: 160px"
          class="bg-white"
          @keyup.enter="handleSearch"
        ></v-text-field>

        <v-select
          v-model="filters.status"
          :items="statusOptions"
          item-text="text"
          item-value="value"
          placeholder="Trạng thái"
          outlined
          dense
          hide-details
          clearable
          style="max-width: 130px"
          class="bg-white"
        ></v-select>

        <v-select
          v-model="filters.type"
          :items="typeOptions"
          item-text="text"
          item-value="value"
          placeholder="Loại cấu hình"
          outlined
          dense
          hide-details
          clearable
          style="max-width: 160px"
          class="bg-white"
        ></v-select>

        <v-btn icon small color="grey darken-2" class="ml-1" @click="resetFilters">
          <v-icon small>mdi-refresh</v-icon>
        </v-btn>

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

    <!-- Bảng Dữ Liệu Tích Hợp BaseTable (Responsive Mobile & Desktop) -->
    <div class="w-100">
      <div class="table-scroll-panel">
        <BaseTable
          :headers="headers"
          :items="paginatedItems"
          :loading="loading"
          disable-pagination
          hide-default-footer
          class="custom-table full-table bg-transparent"
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

          <!-- Cột Đối tượng -->
          <template #[`item.target`]="{ item }">
            <v-chip
              v-if="item.sendType || item.target"
              :color="getSendTypeColor(item.sendType || item.target)"
              x-small
              dark
              class="px-2 caption font-weight-medium"
            >
              {{ getSendTypeLabel(item.sendType || item.target) }}
            </v-chip>
          </template>

          <!-- Cột Loại cấu hình -->
          <template #[`item.configType`]="{ item }">
            <v-chip
              v-if="item.type || item.configType"
              :color="getConfigTypeColor(item.type || item.configType)"
              x-small
              dark
              class="px-2 caption font-weight-medium"
            >
              {{ getConfigTypeLabel(item.type || item.configType) }}
            </v-chip>
          </template>

          <!-- Cột Loại hành động -->
          <template #[`item.actionType`]="{ item }">
            <v-chip
              v-if="item.actionSendType || item.actionType"
              :color="getActionTypeColor(item.actionSendType || item.actionType)"
              x-small
              dark
              class="px-2 caption font-weight-medium"
            >
              {{ getActionTypeLabel(item.actionSendType || item.actionType) }}
            </v-chip>
          </template>

          <!-- Cột Nội dung -->
          <template #[`item.content`]="{ item }">
            <div class="py-2 content-column">
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

          <!-- Cột Trạng thái -->
          <template #[`item.status`]="{ item }">
            <div style="min-width: 140px;">
              <v-select
                v-model="item.status"
                :items="statusOptions"
                item-text="text"
                item-value="value"
                dense
                solo
                flat
                hide-details
                class="status-select-btn custom-status-select"
                :background-color="item.status === 'ACTIVE' || item.status === 1 ? '#a2212b' : '#78909C'"
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
        </BaseTable>
      </div>
    </div>

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

    <!-- MODAL XEM CHI TIẾT -->
    <v-dialog v-model="detailModal.show" max-width="680px" scrollable>
      <v-card class="rounded-sm">
        <v-card-title class="white--text py-2 px-4 d-flex align-center justify-space-between red-header">
          <span class="text-body-1 font-weight-bold white--text">Chi tiết cấu hình mail</span>
          <v-btn icon dark x-small @click="detailModal.show = false"><v-icon x-small>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text class="pt-4 pb-2 px-5 black--text">
          <div class="mb-3 text-body-2">
            <span class="grey--text text--darken-1 mr-2">Tên:</span>
            <span class="font-weight-medium red--text text--darken-3">{{ detailModal.item.name }}</span>
          </div>
          <v-row dense class="mb-2 align-center">
            <v-col cols="12" sm="6" class="d-flex align-center">
              <span class="grey--text text--darken-1 mr-2 text-body-2">Đối tượng:</span>
              <v-chip :color="getSendTypeColor(detailModal.item.sendType || detailModal.item.target)" x-small dark class="px-3 caption font-weight-medium">
                {{ getSendTypeLabel(detailModal.item.sendType || detailModal.item.target) }}
              </v-chip>
            </v-col>
            <v-col cols="12" sm="6" class="d-flex align-center">
              <span class="grey--text text--darken-1 mr-2 text-body-2">Loại cấu hình:</span>
              <v-chip :color="getConfigTypeColor(detailModal.item.type || detailModal.item.configType)" x-small dark class="px-3 caption font-weight-medium">
                {{ getConfigTypeLabel(detailModal.item.type || detailModal.item.configType) }}
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
          <v-btn outlined color="grey darken-2" small height="32" class="text-capitalize px-4 font-weight-medium" @click="detailModal.show = false">Đóng X</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MODAL XÓA -->
    <v-dialog v-model="deleteModal.show" max-width="480px" persistent>
      <v-card class="rounded-sm">
        <v-card-title class="white--text py-2 px-4 d-flex align-center justify-space-between red-header">
          <span class="text-body-1 font-weight-bold white--text">Xác nhận</span>
          <v-btn icon dark x-small @click="deleteModal.show = false"><v-icon x-small>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text class="py-5 px-5 black--text text-body-2">
          Bạn có chắc chắn muốn xóa cấu hình gửi mail <strong class="red--text text--darken-2 font-weight-bold">{{ deleteModal.item.name }}</strong> không?
        </v-card-text>
        <v-card-actions class="px-4 pb-4 pt-0 justify-end">
          <v-btn outlined color="grey darken-2" small height="32" class="text-capitalize px-3 font-weight-medium" @click="deleteModal.show = false">Đóng</v-btn>
          <v-btn color="#a2212b" dark small height="32" elevation="0" class="text-capitalize px-3 font-weight-medium ml-2" @click="confirmDelete">Xác nhận</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MODAL THÊM / SỬA -->
    <v-dialog v-model="createModal.show" max-width="720px" persistent scrollable>
      <v-card class="rounded-sm">
        <v-card-title class="white--text py-2 px-4 d-flex align-center justify-space-between red-header">
          <span class="text-body-1 font-weight-bold white--text">
            {{ createModal.isEdit ? 'Cập nhật cấu hình mail' : 'Thêm mới cấu hình mail' }}
          </span>
          <v-btn icon dark x-small @click="createModal.show = false"><v-icon x-small>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text class="pt-4 pb-2 px-4">
          <v-form ref="createForm" v-model="createModal.valid">
            <v-row dense>
              <v-col cols="12" sm="6">
                <v-text-field v-model="createModal.form.name" label="Tên cấu hình mail (*)" outlined dense hide-details="auto" class="custom-field mb-2" :rules="[v => !!v || 'Vui lòng nhập tên']"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select v-model="createModal.form.sendType" :items="targetOptions" item-text="text" item-value="value" label="Đối tượng gửi mail (*)" outlined dense hide-details="auto" class="custom-field mb-2"></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select v-model="createModal.form.type" :items="typeConfigOptions" item-text="text" item-value="value" label="Loại cấu hình (*)" outlined dense hide-details="auto" class="custom-field mb-2"></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select v-model="createModal.form.actionSendType" :items="actionTypeOptions" item-text="text" item-value="value" label="Loại hành động (*)" outlined dense clearable hide-details="auto" class="custom-field mb-2"></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select v-model="createModal.form.status" :items="statusOptions" item-text="text" item-value="value" label="Trạng thái" outlined dense hide-details="auto" class="custom-field mb-2"></v-select>
              </v-col>
            </v-row>
            <div class="editor-wrapper mt-2">
              <client-only>
                <vue-editor v-model="createModal.form.content" :editor-toolbar="customToolbar" placeholder="Nhập nội dung email..." />
              </client-only>
            </div>
          </v-form>
        </v-card-text>
        <v-card-actions class="px-4 pb-4 pt-2 justify-end">
          <v-btn outlined color="grey darken-2" small height="32" class="text-capitalize px-3 font-weight-medium" @click="createModal.show = false">Đóng</v-btn>
          <v-btn color="#a2212b" dark small height="32" elevation="0" class="text-capitalize px-3 font-weight-medium ml-2" @click="saveConfig">Lưu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import mailConfigService from '~/services/mailConfigService'
import { MOCK_MAIL_CONFIGS } from '~/consts/mockCauHinhEmail.js'
import BaseTable from '@/components/Base/BaseTable.vue'

export default {
  name: 'CauHinhEmailPage',
  middleware: 'authenticated',
  components: {
    BaseTable,
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
        [{ align: '' }, { align: 'center' }, { align: 'right' }, { align: 'justify' }],
        ['blockquote', 'code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ color: [] }, { background: [] }],
        ['link', 'image'],
        ['clean'],
      ],
      
      expandedItems: [],
      confirmDialog: { show: false, item: null, targetValue: null, oldValue: null, fromStatusText: '', toStatusText: '' },
      detailModal: { show: false, item: {} },
      deleteModal: { show: false, item: {} },

      filters: { keyword: '', status: null, type: null },
      activeFilters: { keyword: '', status: null, type: null },

      statusOptions: [
        { text: 'Kích hoạt', value: 'ACTIVE' },
        { text: 'Chưa kích hoạt', value: 'INACTIVE' },
      ],
      typeConfigOptions: [
        { text: 'Học lại', value: 'RETAKE_COURSES' },
        { text: 'Thi lại', value: 'RETAKE_EXAM' },
        { text: 'Bảo vệ lại', value: 'REASSESSMENT' },
      ],
      targetOptions: [
        { text: 'Sinh viên', value: 'SV' },
        { text: 'Giảng viên', value: 'GV' },
        { text: 'Cán bộ quản lý', value: 'CBQL' },
      ],
      actionTypeOptions: [
        { text: 'Nhắc đăng ký', value: 'REMIND_REGISTER' },
        { text: 'Thanh toán thành công', value: 'PAY_SUCCESS' },
        { text: 'Xác nhận', value: 'CONFIRM' },
        { text: 'Gửi mã OTP', value: 'OTP' },
        { text: 'Nhắc đóng học phí', value: 'REMIND_PAY' },
        { text: 'Từ chối', value: 'REJECT' },
        { text: 'Kết quả thi', value: 'RESULT' },
      ],
      typeOptions: [
        { text: 'Học lại', value: 'RETAKE_COURSES' },
        { text: 'Thi lại', value: 'RETAKE_EXAM' },
        { text: 'Bảo vệ lại', value: 'REASSESSMENT' },
      ],

      headers: [
        { text: 'STT', value: 'stt', width: '50px', align: 'center', sortable: false },
        { text: 'Tên', value: 'name', width: '160px' },
        { text: 'Đối tượng gửi mail', value: 'target', width: '130px' },
        { text: 'Loại cấu hình gửi mail', value: 'configType', width: '140px' },
        { text: 'Loại hành động', value: 'actionType', width: '150px' },
        { text: 'Nội dung', value: 'content', width: '280px', cellClass: 'content-cell' },
        { text: 'Trạng thái', value: 'status', width: '160px', align: 'left' },
        { text: 'Chức năng', value: 'actions', width: '90px', align: 'center', sortable: false },
      ],

      items: [...MOCK_MAIL_CONFIGS],

      createModal: {
        show: false,
        isEdit: false,
        valid: true,
        form: { id: null, name: '', sendType: 'SV', type: 'RETAKE_COURSES', actionSendType: 'REMIND_REGISTER', status: 'ACTIVE', content: '' },
      },
    }
  },

  computed: {
    filteredItems() {
      return this.items.filter(item => {
        if (this.activeFilters.status !== null && this.activeFilters.status !== undefined && this.activeFilters.status !== '') {
          if (item.status !== this.activeFilters.status) return false
        }
        if (this.activeFilters.type) {
          if (item.type !== this.activeFilters.type) return false
        }
        if (this.activeFilters.keyword) {
          const kw = this.activeFilters.keyword.toLowerCase().trim()
          return (
            (item.name || '').toLowerCase().includes(kw) ||
            (item.content || '').toLowerCase().includes(kw)
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
    toggleExpand(id) {
      const idx = this.expandedItems.indexOf(id)
      if (idx > -1) this.expandedItems.splice(idx, 1)
      else this.expandedItems.push(id)
    },

    getSendTypeLabel(type) {
      const map = { SV: 'Sinh viên', GV: 'Giảng viên', CBQL: 'Cán bộ quản lý' }
      return map[type] || type
    },
    getSendTypeColor(type) {
      const map = { SV: '#2196F3', GV: '#00897B', CBQL: '#FB8C00' }
      return map[type] || '#757575'
    },

    getConfigTypeLabel(type) {
      const map = { RETAKE_COURSES: 'Học lại', RETAKE_EXAM: 'Thi lại', REASSESSMENT: 'Bảo vệ lại' }
      return map[type] || type
    },
    getConfigTypeColor(type) {
      const map = { RETAKE_COURSES: '#0288D1', RETAKE_EXAM: '#7B1FA2', REASSESSMENT: '#00838F' }
      return map[type] || '#0288D1'
    },

    getActionTypeLabel(action) {
      const map = {
        REMIND_REGISTER: 'Nhắc đăng ký',
        PAY_SUCCESS: 'Thanh toán thành công',
        CONFIRM: 'Xác nhận',
        REMIND_PAY: 'Nhắc đóng học phí',
        REJECT: 'Từ chối',
        RESULT: 'Kết quả thi',
        OTP: 'Gửi mã OTP',
      }
      return map[action] || action
    },

    // ĐÃ BỔ SUNG ĐẦY ĐỦ HÀM NÀY ĐỂ KHẮC PHỤC LỖI RENDER
    getActionTypeColor(action) {
      const map = {
        REMIND_REGISTER: '#2196F3',
        PAY_SUCCESS: '#4CAF50',
        CONFIRM: '#00BCD4',
        REMIND_PAY: '#FF9800',
        REJECT: '#F44336',
        RESULT: '#9C27B0',
        OTP: '#009688',
      }
      return map[action] || '#757575'
    },

    async fetchData() {
      this.loading = true
      try {
        const params = { pageIndex: this.page, pageSize: this.pageSize, ...this.activeFilters }
        const res = await mailConfigService.getList(params)
        if (res && res.data && res.data.data) {
          this.items = res.data.data
        }
      } catch (e) {
        // Fallback dùng mock data
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
      this.filters = { keyword: '', status: null, type: null }
      this.handleSearch()
    },

    handleStatusSelect(item, newValue) {
      const oldValue = item.status
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
      } catch (e) {} finally {
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
    },

    saveConfig() {
      if (this.$refs.createForm && !this.$refs.createForm.validate()) return
      if (this.createModal.isEdit) {
        const index = this.items.findIndex(i => i.id === this.createModal.form.id)
        if (index !== -1) this.$set(this.items, index, { ...this.createModal.form })
      } else {
        this.items.unshift({ ...this.createModal.form })
      }
      this.createModal.show = false
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
        sendType: item.sendType || 'SV',
        type: item.type || 'RETAKE_COURSES',
        actionSendType: item.actionSendType || 'REMIND_REGISTER',
        status: item.status || 'ACTIVE',
        content: item.content || '',
      }
      this.createModal.show = true
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
.page-container { width: 100%; box-sizing: border-box; position: relative; z-index: 1; font-size: 15px; }
.gap-2 { gap: 6px; }
.table-scroll-panel { max-height: calc(100vh - 220px); overflow-y: auto !important; overflow-x: auto; border: 1px solid #f0f0f0; }
.status-select-btn { min-width: 135px !important; width: 135px !important; }
.status-select-btn >>> .v-input__slot { min-height: 28px !important; height: 28px !important; padding: 0 8px !important; border-radius: 14px !important; }
.status-select-btn >>> .v-select__selection { color: #ffffff !important; font-size: 0.76rem !important; font-weight: 500 !important; }
.red-header { background-color: #a2212b !important; }
.editor-wrapper { border: 1px solid #d0d0d0; border-radius: 4px; background: #fff; }
</style>