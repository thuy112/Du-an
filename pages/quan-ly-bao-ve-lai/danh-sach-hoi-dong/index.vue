<template>
  <div class="exam-session-page pa-3 pa-md-4 bg-white">
    <v-data-table
      :headers="headers"
      :items="itemList"
      :items-per-page="itemsPerPage"
      :loading="loading"
      checkbox-color="primary"
      fixed-header
      hide-default-footer
      item-key="id"
      loading-text="Đang tải dữ liệu..."
      max-height="calc(100vh - 250px)"
      no-data-text="Không có dữ liệu"
    >
      <template #top>
        <v-row class="mb-3 align-center">
          <v-col class="fs-17 fw-500" cols="12" md="auto">
            Danh sách hội đồng
            <span class="primary--text">({{ totalRecords }})</span>
          </v-col>

          <v-row dense justify="end" align="center" class="ma-0">
            <v-col cols="12" md="2">
              <v-text-field
                v-model="filters.search"
                outlined
                dense
                hide-details
                clearable
                placeholder="Tìm kiếm"
                @keyup.enter="handleSearch"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="auto">
              <v-select
                v-model="filters.examType"
                :items="examList"
                item-text="name"
                item-value="id"
                placeholder="Đợt bảo vệ"
                outlined
                dense
                hide-details
                clearable
                style="min-width: 150px;"
              ></v-select>
            </v-col>

            <v-col cols="12" md="auto">
              <v-select
                v-model="filters.termId"
                :items="classList"
                item-text="name"
                item-value="id"
                placeholder="Học phần"
                outlined
                dense
                hide-details
                clearable
                style="min-width: 180px;"
              ></v-select>
            </v-col>

            <v-col cols="12" md="auto">
              <base-date-picker
                v-model="filters.fromTime"
                label="Từ ngày"
                outlined
                dense
                hide-details
                clearable
                style="width: 160px;"
              ></base-date-picker>
            </v-col>

            <v-col cols="12" md="auto">
              <base-date-picker
                v-model="filters.toTime"
                label="Đến ngày"
                outlined
                dense
                hide-details
                clearable
                style="width: 160px;"
              ></base-date-picker>
            </v-col>

            <v-col class="d-flex align-center" style="gap: 8px;" cols="auto">
              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-btn
                    icon
                    color="primary"
                    v-bind="attrs"
                    @click="refreshData"
                    v-on="on"
                  >
                    <v-icon>mdi-refresh</v-icon>
                  </v-btn>
                </template>
                <span>Làm mới</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-btn
                    color="primary"
                    elevation="0"
                    v-bind="attrs"
                    @click="handleSearch"
                    v-on="on"
                  >
                    <v-icon>mdi-magnify</v-icon>
                  </v-btn>
                </template>
                <span>Tìm kiếm</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-btn
                    color="primary"
                    elevation="0"
                    v-bind="attrs"
                    @click="openAddModal"
                    v-on="on"
                  >
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </template>
                <span>Thêm mới</span>
              </v-tooltip>
            </v-col>
          </v-row>
        </v-row>
      </template>

      <template #[`item.stt`]="{ index }">
        <span>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</span>
      </template>

      <template #[`item.examClass`]="{ item }">
        <span class="font-weight-medium">{{ item.examClass || '-' }}</span>
      </template>

      <template #[`item.examName`]="{ item }">
        <span>{{ item.exam ? item.exam.name : '-' }}</span>
      </template>

      <template #[`item.termName`]="{ item }">
        <span>{{ item.term ? item.term.name : '-' }}</span>
      </template>

      <template #[`item.trainingMethod`]="{ item }">
        <span>{{ item.trainingMethod ? item.trainingMethod.name : '-' }}</span>
      </template>

      <template #[`item.quantityCurrent`]="{ item }">
        <div class="text-center">{{ item.quantityCurrent !== undefined ? item.quantityCurrent : 0 }}</div>
      </template>

      <template #[`item.timeRange`]="{ item }">
        <span>{{ formatTimeRange(item.fromTime, item.toTime) }}</span>
      </template>

      <template #[`item.examSessionStatus`]="{ item }">
        <v-menu v-if="item.examSessionStatus === 'NOT_FINALIZED'" offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-chip
              small
              dark
              v-bind="attrs"
              v-on="on"
              :color="getExamSessionStatusColor(item.examSessionStatus)"
              class="px-3 font-weight-medium cursor-pointer"
            >
              {{ getExamSessionStatusText(item.examSessionStatus) }}
              <v-icon right small>mdi-menu-down</v-icon>
            </v-chip>
          </template>
          <v-list dense>
            <v-list-item @click="onChangeExamStatus(item, 'FINALIZED')">
              <v-list-item-title>Đã duyệt danh sách</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-chip
          v-else
          small
          dark
          :color="getExamSessionStatusColor(item.examSessionStatus)"
          class="px-3 font-weight-medium"
        >
          {{ getExamSessionStatusText(item.examSessionStatus) }}
        </v-chip>
      </template>

      <template #[`item.examSessionScoreStatus`]="{ item }">
        <v-menu v-if="item.examSessionScoreStatus === 'NO_SCOREBOARD'" offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-chip
              small
              dark
              v-bind="attrs"
              v-on="on"
              :color="getScoreStatusColor(item.examSessionScoreStatus)"
              class="px-3 font-weight-medium cursor-pointer"
            >
              {{ getScoreStatusText(item.examSessionScoreStatus) }}
              <v-icon right small>mdi-menu-down</v-icon>
            </v-chip>
          </template>
          <v-list dense>
            <v-list-item @click="onChangeScoreStatus(item, 'SCOREBOARD_AVAILABLE')">
              <v-list-item-title>Đã có điểm</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-chip
          v-else
          small
          dark
          :color="getScoreStatusColor(item.examSessionScoreStatus)"
          class="px-3 font-weight-medium"
        >
          {{ getScoreStatusText(item.examSessionScoreStatus) }}
        </v-chip>
      </template>

      <template #[`item.actions`]="{ item }">
        <div class="d-flex align-center justify-center">
          <v-menu offset-y left>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon small v-bind="attrs" v-on="on">
                <v-icon small>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list dense class="action-dropdown-list">
              <v-list-item @click="handleDetail(item)">
                <v-list-item-icon class="mr-2"><v-icon small color="info">mdi-eye</v-icon></v-list-item-icon>
                <v-list-item-title>Chi tiết</v-list-item-title>
              </v-list-item>

              <v-list-item @click="handleExportDSSV(item)">
                <v-list-item-icon class="mr-2"><v-icon small color="success">mdi-export</v-icon></v-list-item-icon>
                <v-list-item-title>Xuất file DSSV</v-list-item-title>
              </v-list-item>

              <template v-if="item.examSessionStatus !== 'FINALIZED' && item.examStatus !== 'FINALIZED'">
                <v-list-item @click="handleStudentList(item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="teal">mdi-school</v-icon></v-list-item-icon>
                  <v-list-item-title>Danh sách sinh viên</v-list-item-title>
                </v-list-item>
                <v-list-item @click="openEditModal(item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="warning">mdi-pencil</v-icon></v-list-item-icon>
                  <v-list-item-title>Cập nhật</v-list-item-title>
                </v-list-item>
              </template>

              <template v-else>
                <v-list-item v-if="!item.isEmailSent" @click="openSendEmailConfirm(item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="green">mdi-email-arrow-right-outline</v-icon></v-list-item-icon>
                  <v-list-item-title>Gửi email bảng điểm</v-list-item-title>
                </v-list-item>
                <v-list-item @click="handleScoreBoard(item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="purple">mdi-table</v-icon></v-list-item-icon>
                  <v-list-item-title>Bảng điểm</v-list-item-title>
                </v-list-item>
              </template>

              <v-list-item @click="handleDelete(item)">
                <v-list-item-icon class="mr-2"><v-icon small color="error">mdi-trash-can</v-icon></v-list-item-icon>
                <v-list-item-title>Xóa</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </template>
    </v-data-table>

    <!-- THANH PHÂN TRANG & NÚT EXCEL -->
    <div class="d-flex align-center justify-space-between mt-4 flex-wrap" style="gap: 12px;">
      <div class="d-flex align-center" style="gap: 8px;">
        <v-btn color="#4caf50" dark class="text-none px-3" height="38" elevation="0" @click="openImportExcelModal">
          <v-icon left small>mdi-microsoft-excel</v-icon> Nhập file excel
        </v-btn>

        <v-btn color="#4caf50" dark class="text-none px-3" height="38" elevation="0" @click="openImportTeacherModal">
          <v-icon left small>mdi-microsoft-excel</v-icon> Import giảng viên hội đồng
        </v-btn>
      </div>

      <div class="d-flex align-center" style="gap: 8px;">
        <v-select
          v-model="itemsPerPage"
          :items="[10, 20, 50, 100]"
          label="Bản ghi"
          outlined
          dense
          hide-details
          style="width: 90px;"
          @change="handleItemsPerPageChange(itemsPerPage)"
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
          <v-btn color="primary" dark depressed class="text-none px-3" height="36" @click="goToPage">
            Đi
          </v-btn>
        </div>

        <v-btn icon outlined small color="grey" :disabled="currentPage <= 1" @click="changePage(currentPage - 1)">
          <v-icon small>mdi-chevron-left</v-icon>
        </v-btn>

        <div class="d-flex align-center" style="gap: 4px;">
          <template v-for="p in totalPages">
            <v-btn
              v-if="p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)"
              :key="p"
              :color="p === currentPage ? 'primary' : 'grey lighten-2'"
              :dark="p === currentPage"
              depressed
              min-width="32"
              height="32"
              small
              @click="changePage(p)"
            >
              {{ p }}
            </v-btn>
            <span v-else-if="p === currentPage - 2 || p === currentPage + 2" :key="'dot-' + p">...</span>
          </template>
        </div>

        <v-btn icon outlined small color="grey" :disabled="currentPage >= totalPages" @click="changePage(currentPage + 1)">
          <v-icon small>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- MODAL THÊM MỚI HỘI ĐỒNG -->
    <council-add-modal
      :open.sync="addExamDialog"
      @success="loadData"
    ></council-add-modal>

    <!-- MODAL CẬP NHẬT HỘI ĐỒNG -->
    <council-update-modal
      :open.sync="editDialog"
      :item="editingItem"
      @success="loadData"
    ></council-update-modal>

    <!-- MODAL NHẬP FILE EXCEL CHUNG -->
    <v-dialog v-model="importExcelDialog" max-width="550px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="white--text py-3 px-4 d-flex justify-space-between align-center primary">
          <span class="text-h6 font-weight-bold">Nhập file excel</span>
          <v-btn icon dark @click="importExcelDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text class="pa-5 text-center">
          <div class="upload-dropzone pa-5 rounded-lg mb-2" @click="triggerFileInput('excelInput')">
            <input ref="excelInput" type="file" accept=".xlsx, .xls" class="d-none" @change="handleFileChange($event, 'excel')" />
            <div v-if="!selectedExcelFile" class="py-3 d-flex flex-column align-center" style="gap: 6px;">
              <div class="upload-icon-circle"><v-icon color="primary" size="24">mdi-plus</v-icon></div>
              <span class="text-subtitle-2 grey--text text--darken-2">Chọn tệp đính kèm</span>
            </div>
            <div v-else class="d-flex align-center justify-space-between pa-2 bg-file-selected rounded">
              <span class="font-weight-medium text-truncate text-body-2">{{ selectedExcelFile.name }}</span>
              <v-btn icon x-small @click.stop="selectedExcelFile = null"><v-icon size="16">mdi-close</v-icon></v-btn>
            </div>
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="px-4 py-3 justify-end" style="gap: 8px;">
          <v-btn color="primary" dark class="text-none px-5" elevation="0" :disabled="!selectedExcelFile" @click="uploadExcel">Import</v-btn>
          <v-btn text class="text-none" @click="importExcelDialog = false">Đóng</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MODAL IMPORT GIẢNG VIÊN HỘI ĐỒNG -->
    <v-dialog v-model="importTeacherDialog" max-width="550px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="white--text py-3 px-4 d-flex justify-space-between align-center primary">
          <span class="text-h6 font-weight-bold">Import giảng viên hội đồng</span>
          <v-btn icon dark @click="importTeacherDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text class="pa-5 text-center">
          <div class="upload-dropzone pa-5 rounded-lg mb-2" @click="triggerFileInput('teacherInput')">
            <input ref="teacherInput" type="file" accept=".xlsx, .xls" class="d-none" @change="handleFileChange($event, 'teacher')" />
            <div v-if="!selectedTeacherFile" class="py-3 d-flex flex-column align-center" style="gap: 6px;">
              <div class="upload-icon-circle"><v-icon color="primary" size="24">mdi-plus</v-icon></div>
              <span class="text-subtitle-2 grey--text text--darken-2">Chọn tệp đính kèm</span>
            </div>
            <div v-else class="d-flex align-center justify-space-between pa-2 bg-file-selected rounded">
              <span class="font-weight-medium text-truncate text-body-2">{{ selectedTeacherFile.name }}</span>
              <v-btn icon x-small @click.stop="selectedTeacherFile = null"><v-icon size="16">mdi-close</v-icon></v-btn>
            </div>
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="px-4 py-3 justify-end" style="gap: 8px;">
          <v-btn color="primary" dark class="text-none px-5" elevation="0" :disabled="!selectedTeacherFile" @click="uploadTeacherFile">Import</v-btn>
          <v-btn text class="text-none" @click="importTeacherDialog = false">Đóng</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MODAL XÁC NHẬN XÓA -->
    <v-dialog v-model="deleteDialogVisible" max-width="500px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="white--text py-3 px-4 d-flex justify-space-between align-center primary">
          <span class="text-h6 font-weight-bold">Xác nhận</span>
          <v-btn icon dark @click="deleteDialogVisible = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text class="pa-4 text-body-1 black--text">
          Bạn có chắc chắn muốn xóa hội đồng <span class="font-weight-bold primary--text">{{ itemToDelete ? itemToDelete.examClass : '' }}</span>?
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="px-4 py-3 justify-end" style="gap: 8px;">
          <v-btn text class="text-none" @click="deleteDialogVisible = false">Đóng</v-btn>
          <v-btn color="primary" dark class="text-none px-4" elevation="0" @click="confirmDelete">Xác Nhận</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MODAL XÁC NHẬN GỬI EMAIL BẢNG ĐIỂM -->
    <v-dialog v-model="emailConfirmDialog" max-width="500px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="white--text py-3 px-4 d-flex justify-space-between align-center primary">
          <span class="text-h6 font-weight-bold">Xác nhận</span>
          <v-btn icon dark @click="emailConfirmDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text class="pa-4 text-body-1 black--text">
          Bạn có chắc chắn muốn gửi email bảng điểm của phòng thi <span class="font-weight-bold primary--text">{{ itemToSendEmail ? itemToSendEmail.examClass : '' }}</span>?
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="px-4 py-3 justify-end" style="gap: 8px;">
          <v-btn text class="text-none" @click="emailConfirmDialog = false">Đóng</v-btn>
          <v-btn color="primary" dark class="text-none px-4" elevation="0" @click="confirmSendEmail">Xác Nhận</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MODAL CHI TIẾT HỘI ĐỒNG -->
    <v-dialog v-model="detailDialog" max-width="860px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="white--text py-3 px-4 d-flex justify-space-between align-center primary">
          <span class="text-h6 font-weight-bold">Chi tiết hội đồng</span>
          <v-btn icon dark @click="detailDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text class="pa-4" style="max-height: 75vh; overflow-y: auto;">
          <div v-if="detailData">
            <div class="mb-2"><strong>Hội đồng:</strong> <span class="primary--text">{{ detailData.examClass }}</span></div>
            <div class="mb-2"><strong>Hình thức đào tạo:</strong> {{ detailData.trainingMethod ? detailData.trainingMethod.name : '-' }}</div>
            <div class="mb-2"><strong>Tổng sinh viên:</strong> {{ (studentListDetail || []).length }}</div>
            <div class="mb-2"><strong>Thời gian bảo vệ:</strong> {{ detailData.fromTime }} - {{ detailData.toTime }}</div>
            <div class="mb-2 d-flex align-center" style="gap: 6px;">
              <strong>Trạng thái:</strong>
              <v-chip small dark :color="getExamSessionStatusColor(detailData.examSessionStatus)">
                {{ getExamSessionStatusText(detailData.examSessionStatus) }}
              </v-chip>
            </div>
            <div class="mb-4 d-flex align-center" style="gap: 6px;">
              <strong>Trạng thái bảng điểm:</strong>
              <v-chip small dark :color="getScoreStatusColor(detailData.examSessionScoreStatus)">
                {{ getScoreStatusText(detailData.examSessionScoreStatus) }}
              </v-chip>
            </div>

            <div class="text-subtitle-1 font-weight-bold mb-2">
              Danh sách sinh viên ({{ (studentListDetail || []).length }})
            </div>
            <v-simple-table dense outlined>
              <thead>
                <tr class="grey lighten-4">
                  <th class="text-center" style="width: 50px;">STT</th>
                  <th>Thông tin chung</th>
                  <th style="width: 110px;">Khóa</th>
                  <th style="width: 120px;">Lớp</th>
                  <th style="min-width: 240px;">Giảng viên</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(stu, idx) in studentListDetail" :key="stu.id || idx">
                  <td class="text-center">{{ idx + 1 }}</td>
                  <td>
                    <div class="font-weight-bold primary--text">{{ stu.fullName || '-' }}</div>
                    <div>Mã số sinh viên: <strong>{{ stu.code || '-' }}</strong></div>
                    <div>Số điện thoại: {{ stu.phone || '-' }}</div>
                    <div>Ngày sinh: {{ formatDateOnly(stu.birthday) }}</div>
                    <div>Email: {{ stu.email || '-' }}</div>
                    <div>Giới tính: {{ formatGender(stu.gender) }}</div>
                  </td>
                  <td>{{ stu.courseName || '-' }}</td>
                  <td>{{ stu.className || '-' }}</td>
                  <td>
                    <template v-if="stu.teachersList && stu.teachersList.length > 0">
                      <div
                        v-for="(tch, tIdx) in stu.teachersList"
                        :key="tIdx"
                        class="mb-1"
                      >
                        {{ tch.fullName }}<span v-if="tch.roleText"> ({{ tch.roleText }})</span>
                      </div>
                    </template>
                    <span v-else class="grey--text">-</span>
                  </td>
                </tr>
                <tr v-if="!studentListDetail || studentListDetail.length === 0">
                  <td colspan="5" class="text-center grey--text py-3">Không có sinh viên</td>
                </tr>
              </tbody>
            </v-simple-table>
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="px-4 py-3 justify-end">
          <v-btn color="primary" dark class="text-none px-5" @click="detailDialog = false">Đóng</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import BaseDatePicker from "~/components/Base/DatePicker.vue"
import CouncilAddModal from "~/components/Council/AddModal.vue"
import CouncilUpdateModal from "~/components/Council/UpdateModal.vue"
import examSessionService from '~/services/redefend/examSessionService'
import { examStatusList, scoreStatusList } from "~/consts/list"

const INIT_FILTERS = {
  search: '',
  examType: '',
  termId: '',
  fromTime: null,
  toTime: null,
}

export default {
  name: 'ExamSessionPage',
  components: { BaseDatePicker, CouncilAddModal, CouncilUpdateModal },
  data() {
    return {
      addExamDialog: false,
      editDialog: false,
      editingItem: null,

      detailDialog: false,
      detailData: null,
      studentListDetail: [],

      emailConfirmDialog: false,
      itemToSendEmail: null,

      loading: false,
      filters: { ...INIT_FILTERS },
      activeFilters: { ...INIT_FILTERS },

      examList: [],
      classList: [],
      itemList: [],
      totalRecords: 0,
      totalPages: 1,
      currentPage: 1,
      pageInput: 1,
      itemsPerPage: 50,

      headers: [
        { value: 'stt', text: 'STT', align: 'center', width: '60px', sortable: false },
        { value: 'examClass', text: 'Hội đồng bảo vệ', align: 'left', minWidth: '180px', sortable: false },
        { value: 'examName', text: 'Đợt bảo vệ', align: 'left', width: '130px', sortable: false },
        { value: 'termName', text: 'Học phần', align: 'left', width: '150px', sortable: false },
        { value: 'trainingMethod', text: 'Hình thức đào tạo', align: 'center', width: '130px', sortable: false },
        { value: 'quantityCurrent', text: 'Số lượng đăng kí', align: 'center', width: '110px', sortable: false },
        { value: 'timeRange', text: 'Thời gian', align: 'center', width: '180px', sortable: false },
        { value: 'examSessionStatus', text: 'Trạng thái', align: 'center', width: '160px', sortable: false },
        { value: 'examSessionScoreStatus', text: 'Trạng thái bảng điểm', align: 'center', width: '150px', sortable: false },
        { value: 'actions', text: 'Chức năng', align: 'center', width: '100px', sortable: false },
      ],

      importExcelDialog: false,
      selectedExcelFile: null,
      importTeacherDialog: false,
      selectedTeacherFile: null,
      deleteDialogVisible: false,
      itemToDelete: null,
    }
  },
  async mounted() {
    await this.initDropdowns()
    await this.loadData()
  },
  methods: {
    async initDropdowns() {
      try {
        const resExam = await examSessionService.getExamList({ status: 'ACTIVE', channel: 'CMS' })
        if (resExam) {
          const raw = resExam.data !== undefined ? resExam.data : resExam
          this.examList = Array.isArray(raw) ? raw : (raw.data || raw.content || [])
        }

        const resTerm = await examSessionService.getTermList({ status: 'ACTIVE', channel: 'CMS' })
        if (resTerm) {
          const rawT = resTerm.data !== undefined ? resTerm.data : resTerm
          this.classList = Array.isArray(rawT) ? rawT : (rawT.data || rawT.content || [])
        }
      } catch (error) {
        console.error('Lỗi tải danh mục phụ:', error)
      }
    },

    handleSearch() {
      this.activeFilters = { ...this.filters }
      this.currentPage = 1
      this.pageInput = 1
      this.loadData()
    },

    refreshData() {
      this.filters = { ...INIT_FILTERS }
      this.activeFilters = { ...INIT_FILTERS }
      this.currentPage = 1
      this.pageInput = 1
      this.loadData()
    },

    async loadData() {
      this.loading = true
      try {
        const params = {
          pageIndex: this.currentPage,
          pageSize: this.itemsPerPage,
          channel: 'CMS',
        }
        if (this.activeFilters.search) params.search = this.activeFilters.search
        if (this.activeFilters.examType) {
          params.examType = this.activeFilters.examType
          params.examId = this.activeFilters.examType
        }
        if (this.activeFilters.termId) {
          params.termId = this.activeFilters.termId
        }
        if (this.activeFilters.fromTime) {
          params.fromTime = this.activeFilters.fromTime
        }
        if (this.activeFilters.toTime) {
          params.toTime = this.activeFilters.toTime
        }

        const res = await examSessionService.getList(params)
        if (res) {
          const rawData = res.data !== undefined ? res.data : res
          this.itemList = Array.isArray(rawData) ? rawData : (rawData.data || rawData.content || rawData.items || [])

          const total = rawData.totalElements ?? rawData.totalRecords ?? rawData.total ?? (res.totalElements || res.total)
          this.totalRecords = total !== undefined ? Number(total) : this.itemList.length
          this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage) || 1
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu hội đồng:', error)
        this.itemList = []
        this.totalRecords = 0
      } finally {
        this.loading = false
      }
    },

    getExamSessionStatusText(status) {
      const found = examStatusList.find(item => item.value === status)
      return found ? found.text : (status || 'Chưa duyệt')
    },
    getExamSessionStatusColor(status) {
      const found = examStatusList.find(item => item.value === status)
      return found ? found.color : 'warning'
    },
    getScoreStatusText(status) {
      const found = scoreStatusList.find(item => item.value === status)
      return found ? found.text : (status || 'Chưa có điểm')
    },
    getScoreStatusColor(status) {
      const found = scoreStatusList.find(item => item.value === status)
      return found ? found.color : 'warning'
    },
    formatTimeRange(from, to) {
      if (!from && !to) return '-'
      return `${from || ''} - ${to || ''}`
    },

    changePage(page) {
      if (page < 1 || page > this.totalPages) return
      this.currentPage = page
      this.pageInput = page
      this.loadData()
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
      this.loadData()
    },

    openAddModal() {
      this.addExamDialog = true
    },

    openImportExcelModal() {
      this.selectedExcelFile = null
      this.importExcelDialog = true
    },
    openImportTeacherModal() {
      this.selectedTeacherFile = null
      this.importTeacherDialog = true
    },
    triggerFileInput(refName) {
      if (this.$refs[refName]) this.$refs[refName].click()
    },
    handleFileChange(e, type) {
      const file = e.target.files[0]
      if (file) {
        if (type === 'excel') this.selectedExcelFile = file
        if (type === 'teacher') this.selectedTeacherFile = file
      }
    },
    uploadExcel() {
      if (!this.selectedExcelFile) return
      this.importExcelDialog = false
    },
    uploadTeacherFile() {
      if (!this.selectedTeacherFile) return
      this.importTeacherDialog = false
    },

    formatDateOnly(dateStr) {
      if (!dateStr) return '-'
      return String(dateStr).split(' ')[0]
    },

    formatGender(gender) {
      if (!gender) return '-'
      const val = String(gender).toUpperCase()
      if (val === 'FEMALE' || val === 'NỮ') return 'Nữ'
      if (val === 'MALE' || val === 'NAM') return 'Nam'
      return gender
    },

    getAssessmentTypeText(type) {
      switch (String(type || '').trim().toUpperCase()) {
        case 'SUPPORT':
          return 'Hướng dẫn DATN'
        case 'REBUTTAL':
          return 'Phản biện DATN'
        case 'JOIN':
          return 'Tham gia chấm DATN'
        default:
          return type || ''
      }
    },

    async handleDetail(item) {
      try {
        const [resDetail, resStudents] = await Promise.all([
          examSessionService.getDetail(item.id, 'CMS'),
          examSessionService.getStudentsByExamSession({ examSessionId: item.id, channel: 'CMS' }),
        ])

        this.detailData = resDetail?.data !== undefined ? resDetail.data : resDetail

        const rawStu = resStudents?.data !== undefined ? resStudents.data : resStudents
        const itemsList = Array.isArray(rawStu) ? rawStu : (rawStu?.data || rawStu?.content || [])

        const studentMap = new Map()

        itemsList.forEach(row => {
          const stuInfo = row.student || {}
          const stuId = stuInfo.id || row.studentId || row.id

          const assignList = Array.isArray(row.studentAssignTeacher)
            ? row.studentAssignTeacher
            : (Array.isArray(row.studentAssignTeachers) ? row.studentAssignTeachers : [])

          const mappedTeachers = assignList
            .map(assign => {
              const teacherObj = assign.teacher || {}
              const fullName = teacherObj.fullName || teacherObj.name || assign.teacherName || ''
              const roleText = this.getAssessmentTypeText(assign.reAssessmentType || assign.type)
              return fullName ? { fullName, roleText } : null
            })
            .filter(Boolean)

          if (!studentMap.has(stuId)) {
            studentMap.set(stuId, {
              ...stuInfo,
              courseName: stuInfo.courseName || (stuInfo.course && stuInfo.course.name) || '-',
              className: stuInfo.className || (stuInfo.clazz && stuInfo.clazz.name) || '-',
              teachersList: mappedTeachers,
            })
          } else {
            const existing = studentMap.get(stuId)
            if (existing.courseName === '-' && stuInfo.courseName) {
              existing.courseName = stuInfo.courseName
            }
            if (existing.className === '-' && stuInfo.className) {
              existing.className = stuInfo.className
            }
            const seen = new Set(existing.teachersList.map(t => `${t.fullName}__${t.roleText}`))
            mappedTeachers.forEach(t => {
              const key = `${t.fullName}__${t.roleText}`
              if (!seen.has(key)) {
                seen.add(key)
                existing.teachersList.push(t)
              }
            })
          }
        })

        this.studentListDetail = Array.from(studentMap.values())
        this.detailDialog = true
      } catch (error) {
        console.error('Lỗi tải chi tiết hội đồng:', error)
      }
    },

    async handleExportDSSV(item) {
      try {
        const res = await examSessionService.exportExcel(item.id, 'CMS')
        const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = `dssv_bao_ve_lai_${item.examClass || item.id}.xlsx`
        link.click()
      } catch (error) {
        console.error('Lỗi xuất file excel:', error)
      }
    },

    openSendEmailConfirm(item) {
      this.itemToSendEmail = item
      this.emailConfirmDialog = true
    },

    async confirmSendEmail() {
      if (!this.itemToSendEmail) return
      try {
        await examSessionService.sendEmailResult(this.itemToSendEmail.id, 'CMS')
        this.$set(this.itemToSendEmail, 'isEmailSent', true)
        this.emailConfirmDialog = false
        this.itemToSendEmail = null
      } catch (error) {
        console.error('Lỗi gửi email bảng điểm:', error)
        if (typeof this.$showError === 'function') {
          this.$showError('Chưa có template email hoặc template email chưa kích hoạt')
        }
      }
    },

    handleDelete(item) {
      this.itemToDelete = item
      this.deleteDialogVisible = true
    },

    async confirmDelete() {
      if (!this.itemToDelete) return
      try {
        await examSessionService.deleteItem(this.itemToDelete.id, 'CMS')
        this.deleteDialogVisible = false
        this.itemToDelete = null
        await this.loadData()
      } catch (error) {
        console.error('Lỗi khi xóa:', error)
      }
    },

    onChangeExamStatus(item, newStatus) {
      if (item.examSessionStatus === newStatus) return
      try {
        item.examSessionStatus = newStatus
        if (typeof this.$showSuccess === 'function') {
          this.$showSuccess('Cập nhật trạng thái thành công')
        }
      } catch (error) {
        console.error('Lỗi cập nhật trạng thái hội đồng:', error)
      }
    },

    onChangeScoreStatus(item, newStatus) {
      if (item.examSessionScoreStatus === newStatus) return
      try {
        item.examSessionScoreStatus = newStatus
        if (typeof this.$showSuccess === 'function') {
          this.$showSuccess('Cập nhật trạng thái bảng điểm thành công')
        }
      } catch (error) {
        console.error('Lỗi cập nhật trạng thái bảng điểm:', error)
      }
    },

    async openEditModal(item) {
      try {
        const resDetail = await examSessionService.getExamSessionDetail(item.id, 'CMS')
        const data = resDetail?.data !== undefined ? resDetail.data : resDetail
        if (data?.examSessionStatus === 'FINALIZED') {
          if (typeof this.$showError === 'function') {
            this.$showError('Hội đồng bảo vệ lại không thể sửa do đã chốt dữ liệu')
          }
          return
        }
        this.editingItem = item
        this.editDialog = true
      } catch (error) {
        console.error('Lỗi kiểm tra trạng thái cập nhật hội đồng:', error)
      }
    },

    handleScoreBoard(item) {
      this.$router.push({
        path: `/quan-ly-bao-ve-lai/danh-sach-hoi-dong/${item.id}/bang-diem`,
        query: { channel: 'CMS' }
      })
    },

    handleStudentList(item) {
      const examSessionId = item.id || this.$route.params.id
      this.$router.push(`/quan-ly-bao-ve-lai/danh-sach-hoi-dong/${examSessionId}/sinh-vien`)
    }
  }
}
</script>

<style scoped>
.exam-session-page {
  background-color: #ffffff;
}

:deep .v-data-table__wrapper {
  max-height: calc(100vh - 250px);
}

.upload-dropzone {
  border: 1.5px dashed #d0d0d0;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.upload-dropzone:hover {
  border-color: var(--v-primary-base, #a62229);
  background-color: #fafafa;
}

.upload-icon-circle {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background-color: #fdecef;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-file-selected {
  background-color: #f5f5f5;
}

.cursor-pointer {
  cursor: pointer;
}
</style>