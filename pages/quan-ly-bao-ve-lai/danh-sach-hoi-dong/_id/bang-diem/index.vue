<template>
  <div class="score-board-page pa-3 pa-md-4 bg-white">
    <!-- TIÊU ĐỀ VÀ THANH CÔNG CỤ -->
    <div class="d-flex align-center justify-space-between mb-3 flex-wrap" style="gap: 8px;">
      <div class="text-h6 font-weight-bold black--text">
        Bảng điểm hội đồng bảo vệ: <span class="red--text">{{ examClassName }}</span> (<span class="text-red-bold">{{ totalRecords }}</span>)
      </div>

      <div class="d-flex align-center" style="gap: 8px;">
        <v-text-field
          v-model="searchKeyword"
          placeholder="Sinh viên"
          outlined
          dense
          hide-details
          clearable
          style="width: 200px;"
          @keyup.enter="loadScoreBoardData"
        ></v-text-field>

        <v-btn icon color="#A62229" @click="loadScoreBoardData" title="Làm mới">
          <v-icon size="24">mdi-refresh</v-icon>
        </v-btn>

        <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="loadScoreBoardData" title="Tìm kiếm">
          <v-icon size="24">mdi-magnify</v-icon>
        </v-btn>

        <!-- Nút (+) chỉ hiện khi chưa có dữ liệu điểm -->
        <v-btn v-if="!hasData" color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="openAddScoreModal" title="Thêm mới">
          <v-icon size="24">mdi-plus</v-icon>
        </v-btn>

        <!-- Nút cam duyệt điểm: hiện khi có dữ liệu và chưa duyệt -->
        <v-btn v-if="hasData && !isApproved" color="orange" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="openClosed = true" title="Duyệt điểm">
          <v-icon size="24">mdi-checkbox-marked-circle-plus-outline</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- BẢNG HIỂN THỊ DỮ LIỆU -->
    <div class="table-scroll-container">
      <BaseTable
        :headers="dynamicHeaders"
        :items="scoreItemList"
        :loading="loading"
        :current-page="currentPage"
        :items-per-page="itemsPerPage"
        :total-records="totalRecords"
        hide-default-footer
        @page-change="changePage"
      >
        <!-- Mã số sinh viên -->
        <template #[`item.studentCode`]="{ item }">
          <strong>{{ item.code || item.studentCode || (item.student ? item.student.code : '-') }}</strong>
        </template>

        <!-- Họ và tên -->
        <template #[`item.fullName`]="{ item }">
          <span class="font-weight-medium">{{ item.name || item.fullName || (item.student ? item.student.name : '-') }}</span>
        </template>

        <!-- Lớp SV -->
        <template #[`item.className`]="{ item }">
          <span>{{ item.classesCode || (item.student ? item.student.classesCode : '-') }}</span>
        </template>

        <!-- Điểm -->
        <template #[`item.score`]="{ item }">
          <span class="font-weight-bold">{{ item.score !== undefined && item.score !== null ? item.score : '-' }}</span>
        </template>

        <!-- Ghi chú -->
        <template #[`item.note`]="{ item }">
          <span>{{ item.notes || item.note || '-' }}</span>
        </template>

        <!-- Trạng thái -->
        <template #[`item.status`]="{ item }">
          <v-chip small dark :color="getScoreStatusColor(item.scoreStatus)">
            {{ getScoreStatusText(item.scoreStatus) }}
          </v-chip>
        </template>

        <!-- Cột Chức năng: CHỈ CÒN ICON SỬA (MÀU VÀNG), BỎ ICON XÓA -->
        <template v-if="!isApproved" #[`item.actions`]="{ item }">
          <div class="d-flex align-center justify-center" style="gap: 4px;">
            <v-btn icon small color="warning" @click="openEditScoreModal(item)" title="Sửa">
              <v-icon small>mdi-pencil</v-icon>
            </v-btn>
          </div>
        </template>
      </BaseTable>
    </div>

    <!-- THANH PHÂN TRANG & NÚT IMPORT (MỜ ĐI KHI ĐÃ CÓ DỮ LIỆU ĐIỂM) -->
    <div class="d-flex align-center justify-space-between mt-4 flex-wrap gap-3 pt-3 border-top">
      <v-btn 
        color="#4caf50" 
        :disabled="hasData" 
        dark 
        class="text-none px-4 custom-disabled-btn" 
        height="38" 
        elevation="0" 
        @click="openImport = true"
      >
        <v-icon left small>mdi-microsoft-excel</v-icon> Import bảng điểm
      </v-btn>

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

    <!-- MODAL CẬP NHẬT BẢNG ĐIỂM HỘI ĐỒNG -->
    <v-dialog v-model="open" max-width="700px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="white--text py-3 px-4 d-flex justify-space-between align-center" style="background-color: #A62229;">
          <span class="text-h6 font-weight-bold">Cập nhật bảng điểm hội đồng</span>
          <v-btn icon dark @click="open = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>

        <v-card-text class="pa-4" style="max-height: 70vh; overflow-y: auto;">
          <v-form ref="form">
            <v-simple-table dense outlined>
              <thead>
                <tr class="grey lighten-4">
                  <th class="text-center" style="width: 60px;">STT</th>
                  <th>Họ và tên</th>
                  <th style="width: 120px;">Điểm</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in list" :key="item.id || idx">
                  <td class="text-center">{{ idx + 1 }}</td>
                  <td class="font-weight-medium">{{ item.name || '-' }}</td>
                  <td>
                    <v-text-field
                      v-model.number="item.score"
                      type="number"
                      outlined
                      dense
                      hide-details
                      class="my-1"
                      @input="formatScore(item)"
                      :rules="[v => v !== null && v !== '' || 'Nhập điểm']"
                    ></v-text-field>
                  </td>
                  <td>
                    <v-text-field
                      v-model="item.notes"
                      outlined
                      dense
                      hide-details
                      class="my-1"
                      placeholder="Nhập ghi chú..."
                    ></v-text-field>
                  </td>
                </tr>
              </tbody>
            </v-simple-table>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="px-4 py-3 justify-end" style="gap: 8px;">
          <v-btn text class="text-none" @click="open = false">Đóng</v-btn>
          <v-btn color="#A62229" dark class="text-none px-5" elevation="0" :loading="loadSubmit" @click="handleUpdate">Lưu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MODAL XÁC NHẬN DUYỆT ĐIỂM -->
    <base-confirm-modal
        :open="openClosed"
        @OK="handleClosed"
        @toggle="openClosed = !openClosed"
    >
        <template #content>
            <div class="pt-2">
                Xác nhận duyệt điểm hội đồng bảo vệ
                <span class="primary--text font-weight-bold">{{ examSessionId }}</span> ?
            </div>
        </template>
    </base-confirm-modal>

    <!-- COMPONENT IMPORT EXCEL -->
    <base-import
        ref="Import"
        :template-url="templateUrl"
        :loading="loadingImport"
        width="900"
        :template-error-url="templateErrorUrl"
        :open="openImport"
        @close="openImport = false"
        @import="handleImport"
        @save="handleSave"
    />
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import examSessionService from '~/services/redefend/examSessionService'
import { closeStatusList } from "~/consts/list"

export default {
  name: 'ScoreBoardDetail',
  components: { BaseTable },
  data() {
    return {
      openClosed: false,
      openImport: false,
      loadingImport: false,
      templateUrl: '',
      templateErrorUrl: '',

      editScoreDialog: false,
      editScoreForm: {
        id: null,
        fullName: '',
        score: null,
        notes: ''
      },
      open: false,
      loadSubmit: false,
      loadOpen: false,
      list: [],

      examSessionId: null,
      examClassName: '',
      searchKeyword: '',
      loading: false,
      scoreItemList: [],
      totalRecords: 0,
      totalPages: 1,
      currentPage: 1,
      pageInput: 1,
      itemsPerPage: 50,
      closeStatusList,
    }
  },
  computed: {
    hasData() {
      return this.scoreItemList && this.scoreItemList.length > 0
    },
    isApproved() {
      if (!this.scoreItemList || this.scoreItemList.length === 0) return false
      return this.scoreItemList.every(item => this.isItemApproved(item))
    },
    dynamicHeaders() {
      const headers = [
        { value: 'studentCode', text: 'Mã số sinh viên', align: 'left', width: '150px', sortable: false },
        { value: 'fullName', text: 'Họ và tên', align: 'left', minWidth: '180px', sortable: false },
        { value: 'className', text: 'Lớp SV', align: 'left', width: '130px', sortable: false },
        { value: 'score', text: 'Điểm', align: 'center', width: '100px', sortable: false },
        { value: 'note', text: 'Ghi chú', align: 'left', width: '150px', sortable: false },
        { value: 'status', text: 'Trạng thái', align: 'center', width: '130px', sortable: false },
      ]
      if (!this.isApproved) {
        headers.push({ value: 'actions', text: 'Chức năng', align: 'center', width: '100px', sortable: false })
      }
      return headers
    }
  },
  async mounted() {
    this.examSessionId = this.$route.params.id
    if (this.examSessionId) {
      await this.loadScoreBoardData()
    }
  },
  methods: {
    getScoreStatusText(status) {
      const found = closeStatusList.find(item => item.value === status)
      return found ? found.text : (status || 'Chưa duyệt')
    },
    getScoreStatusColor(status) {
      const found = closeStatusList.find(item => item.value === status)
      return found ? found.color : 'warning'
    },
    isItemApproved(item) {
      const st = item.scoreStatus || item.status || ''
      return st === 'CLOSED' || st === 'APPROVED' || st === 'Đã duyệt'
    },
    async loadScoreBoardData() {
      this.loading = true
      try {
        const [resResult, resSession] = await Promise.all([
          examSessionService.getResultList({
            pageIndex: this.currentPage,
            pageSize: this.itemsPerPage,
            examSessionId: this.examSessionId,
            fullName: this.searchKeyword || '',
            channel: 'CMS'
          }),
          examSessionService.getExamSessionDetail(this.examSessionId, 'CMS')
        ])

        const rawResult = resResult.data !== undefined ? resResult.data : resResult
        this.scoreItemList = Array.isArray(rawResult) ? rawResult : (rawResult.data || rawResult.content || [])
        this.totalRecords = rawResult.totalElements ?? rawResult.totalRecords ?? this.scoreItemList.length
        this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage) || 1

        const rawSession = resSession.data !== undefined ? resSession.data : resSession
        if (rawSession && rawSession.examClass) {
          this.examClassName = rawSession.examClass
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu bảng điểm:', error)
        this.scoreItemList = []
        this.totalRecords = 0
      } finally {
        this.loading = false
      }
    },
    changePage(page) {
      if (page < 1 || page > this.totalPages) return
      this.currentPage = page
      this.pageInput = page
      this.loadScoreBoardData()
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
      this.loadScoreBoardData()
    },

    openEditScoreModal(item) {
      this.open = true
      this.getUpdate({ ...item })
    },

    async getUpdate(item) {
      this.loadOpen = true
      try {
        const res = await examSessionService.getResultDetail(item.id, 'CMS')
        const data = res.data !== undefined ? res.data : res
        if (data) {
          this.list = [
            {
              id: item.id,
              score: data.score !== undefined ? data.score : item.score,
              name: data.name || data.fullName || item.name || item.fullName || (item.student ? item.student.name : '-'),
              registerStudentTermId: data.registerStudentTermId || item.registerStudentTermId,
              notes: data.notes ? data.notes : (data.note ? data.note : ""),
            },
          ]
        }
      } catch (er) {
        console.log(er)
        this.list = [
          {
            id: item.id,
            score: item.score,
            name: item.name || item.fullName || (item.student ? item.student.name : '-'),
            registerStudentTermId: item.registerStudentTermId,
            notes: item.notes || item.note || "",
          }
        ]
      }
      this.loadOpen = false
    },

    formatScore(item) {
      if (item.score >= 100) {
        this.$nextTick(() => {
          item.score = 10;
        });
        return;
      }
      if (item.score > 10) {
        this.$nextTick(() => {
          item.score = item.score / 10;
        });
        return;
      }
      if (!Number.isInteger(Number(item.score)) && item.score > 0) {
        this.$nextTick(() => {
          item.score = Number.parseFloat(item.score).toFixed(1);
        });
        return;
      }
      if (item.score < 0) {
        this.$nextTick(() => {
          item.score = 0;
        });
      }
    },

    async handleUpdate() {
      if (this.$refs.form && !this.$refs.form.validate()) return;
      this.loadSubmit = true;
      try {
        const params = {
          id: this.list[0].id,
          score: Number(this.list[0].score),
          notes: this.list[0].notes || "",
          registerStudentTermId: this.list[0].registerStudentTermId,
          channel: 'CMS'
        };

        const res = await examSessionService.update(params);
        if (res) {
          this.open = false;
          if (typeof this.$showSuccess === 'function') {
            this.$showSuccess("Cập nhật thông tin thành công");
          }
          await this.loadScoreBoardData();
        }
      } catch (er) {
        console.log(er);
        if (typeof this.$showError === 'function') {
          this.$showError("Không thể cập nhật thông tin");
        }
      }
      this.loadSubmit = false;
    },

    // Xử lý Duyệt điểm
    async handleClosed() {
      try {
        const res = await examSessionService.closed({
          examSessionId: this.examSessionId,
        });
        if (res && (res.success || res.status === 200 || res)) {
          if (typeof this.$showSuccess === 'function') {
            this.$showSuccess("Duyệt điểm thành công");
          }
          await this.loadScoreBoardData();
        }
      } catch (er) {
        console.log(er);
        if (typeof this.$showError === 'function') {
          this.$showError("Không thể duyệt điểm");
        }
      }
      this.openClosed = false;
    },

    // Xử lý Kiểm tra file Import
    async handleImport(file) {
      this.loadingImport = true;
      try {
        const res = await examSessionService.checkImportTranscript(
            this.examSessionId,
            file
        );
        const dataRes = res.data !== undefined ? res.data : res;
        
        if (this.$refs.Import) {
          this.$refs.Import.list = [...(dataRes?.objects || [])];
        }

        if (dataRes?.status === 1) {
            this.templateErrorUrl = "";
            if (this.$refs.Import) {
              this.$refs.Import.showFile = false;
            }
            this.loadingImport = false;
            return;
        }

        for (const item of (dataRes?.objects || [])) {
            if (item.messErrors) {
                item.messageError = item.messErrors.map((msg) => `${msg} <br>`).join("");
            }
        }
        
        if (this.$refs.Import) {
          this.$refs.Import.errMsg = dataRes?.message;
        }
        this.templateErrorUrl = dataRes?.file?.url || "";
      } catch (er) {
        console.log(er);
      }
      this.loadingImport = false;
    },

    // Xử lý Lưu sau khi Import
    async handleSave(data) {
      this.loadingImport = true;
      try {
        const res = await examSessionService.importTranscript(this.examSessionId, data);
        if (res && (res.success || res.status === 200 || res)) {
            if (typeof this.$showSuccess === 'function') {
              this.$showSuccess("Import bảng điểm thành công");
            }
            await this.loadScoreBoardData();
            this.openImport = false;
        }
      } catch (er) {
        console.log(er);
        if (typeof this.$showError === 'function') {
          this.$showError("Không thể import bảng điểm");
        }
      }
      this.loadingImport = false;
    },
  }
}
</script>

<style scoped>
.v-btn.custom-disabled-btn.v-btn--disabled {
  background-color: #b7b7b7 !important;
  color: #ffffff !important;
}
.v-btn.custom-disabled-btn.v-btn--disabled .v-icon {
  color: #ffffff !important;
}
</style>

<style scoped>
.v-btn.custom-disabled-btn.v-btn--disabled {
  background-color: #b7b7b7 !important;
  color: #ffffff !important;
}
.v-btn.custom-disabled-btn.v-btn--disabled .v-icon {
  color: #ffffff !important;
}
</style>