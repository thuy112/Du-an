<template>
  <div class="exam-session-page pa-3 pa-md-4 bg-white">
    <!-- TIÊU ĐỀ TRANG -->
    <div class="d-flex align-center justify-space-between mb-3">
      <div class="text-h6 font-weight-bold black--text">
        Danh sách hội đồng (<span class="text-red-bold">{{ totalRecords }}</span>)
      </div>
    </div>

    <!-- BỘ LỌC TÌM KIẾM PHÍA TRÊN -->
    <div class="mb-3 sticky-filter">
      <div class="d-flex align-center flex-wrap justify-space-between" style="gap: 8px; padding: 6px 0;">
        <div class="d-flex align-center flex-wrap flex-grow-1" style="gap: 8px;">
          <!-- Tìm kiếm -->
          <v-text-field
            v-model="filters.search"
            placeholder="Tìm kiếm"
            outlined
            dense
            hide-details
            clearable
            class="filter-input"
            style="min-width: 180px; max-width: 220px;"
            @keyup.enter="handleSearch"
          ></v-text-field>

          <!-- Đợt bảo vệ -->
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
            class="filter-input"
            style="min-width: 150px;"
          ></v-select>

          <!-- Học phần -->
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
            class="filter-input"
            style="min-width: 180px;"
          ></v-select>

          <!-- Từ ngày -->
          <v-menu
            v-model="fromMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="290px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                :value="formatDisplayDate(filters.fromTime)"
                placeholder="Từ ngày"
                outlined
                dense
                hide-details
                clearable
                readonly
                v-bind="attrs"
                v-on="on"
                class="filter-input"
                style="width: 150px;"
                @click:clear="filters.fromTime = ''"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="filters.fromTime"
              no-title
              @input="fromMenu = false"
            ></v-date-picker>
          </v-menu>

          <!-- Đến ngày -->
          <v-menu
            v-model="toMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="290px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                :value="formatDisplayDate(filters.toTime)"
                placeholder="Đến ngày"
                outlined
                dense
                hide-details
                clearable
                readonly
                v-bind="attrs"
                v-on="on"
                class="filter-input"
                style="width: 150px;"
                @click:clear="filters.toTime = ''"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="filters.toTime"
              no-title
              @input="toMenu = false"
            ></v-date-picker>
          </v-menu>

          <!-- Nút Làm mới & Tìm kiếm -->
          <div class="d-flex align-center" style="gap: 5px;">
            <v-btn icon color="#A62229" @click="refreshData" title="Làm mới">
              <v-icon size="24">mdi-refresh</v-icon>
            </v-btn>

            <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="handleSearch" title="Tìm kiếm">
              <v-icon size="24">mdi-magnify</v-icon>
            </v-btn>
          </div>
        </div>

        <!-- Nút Thêm mới -->
        <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="openAddModal" title="Thêm mới">
          <v-icon size="24">mdi-plus</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- BẢNG HIỂN THỊ DỮ LIỆU -->
    <div class="table-scroll-container">
      <BaseTable
        :headers="tableHeaders"
        :items="itemList"
        :loading="loading"
        :current-page="currentPage"
        :items-per-page="itemsPerPage"
        :total-records="totalRecords"
        hide-default-footer
        @page-change="changePage"
        @per-page-change="handleItemsPerPageChange"
      >
        <!-- STT -->
        <template #[`item.stt`]="{ index }">
          <span>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</span>
        </template>

        <!-- Hội đồng bảo vệ -->
        <template #[`item.examClass`]="{ item }">
          <span class="font-weight-medium">{{ item.examClass || '-' }}</span>
        </template>

        <!-- Đợt bảo vệ -->
        <template #[`item.examName`]="{ item }">
          <span>{{ item.exam ? item.exam.name : '-' }}</span>
        </template>

        <!-- Học phần -->
        <template #[`item.termName`]="{ item }">
          <span>{{ item.term ? item.term.name : '-' }}</span>
        </template>

        <!-- Hình thức đào tạo -->
        <template #[`item.trainingMethod`]="{ item }">
          <span>{{ item.trainingMethod ? item.trainingMethod.name : '-' }}</span>
        </template>

        <!-- Số lượng đăng kí -->
        <template #[`item.quantityCurrent`]="{ item }">
          <div class="text-center">{{ item.quantityCurrent !== undefined ? item.quantityCurrent : 0 }}</div>
        </template>

        <!-- Thời gian -->
        <template #[`item.timeRange`]="{ item }">
          <span>{{ formatTimeRange(item.fromTime, item.toTime) }}</span>
        </template>

        <!-- Trạng thái -->
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

        <!-- Trạng thái bảng điểm -->
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

        <!-- Chức năng -->
        <template #[`item.actions`]="{ item }">
          <div class="d-flex align-center justify-center">
            <v-menu offset-y left>
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon small v-bind="attrs" v-on="on">
                  <v-icon small>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list dense class="action-dropdown-list">
                <!-- Chi tiết -->
                <v-list-item @click="handleDetail(item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="info">mdi-eye</v-icon></v-list-item-icon>
                  <v-list-item-title>Chi tiết</v-list-item-title>
                </v-list-item>

                <!-- Xuất file DSSV -->
                <v-list-item @click="handleExportDSSV(item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="success">mdi-export</v-icon></v-list-item-icon>
                  <v-list-item-title>Xuất file DSSV</v-list-item-title>
                </v-list-item>

                <!-- Nếu chưa duyệt -->
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

                <!-- Nếu đã duyệt -->
                <template v-else>
                  <v-list-item v-if="!item.isEmailSent" @click="openSendEmailConfirm(item)">
                    <v-list-item-icon class="mr-2"><v-icon small color="green">mdi-email-fast</v-icon></v-list-item-icon>
                    <v-list-item-title>Gửi email bảng điểm</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="handleScoreBoard(item)">
                    <v-list-item-icon class="mr-2"><v-icon small color="purple">mdi-table-large</v-icon></v-list-item-icon>
                    <v-list-item-title>Bảng điểm</v-list-item-title>
                  </v-list-item>
                </template>

                <!-- Xóa -->
                <v-list-item @click="handleDelete(item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="error">mdi-delete</v-icon></v-list-item-icon>
                  <v-list-item-title>Xóa</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>
      </BaseTable>
    </div>

    <!-- THANH PHÂN TRANG -->
    <div class="d-flex align-center justify-space-between mt-4 flex-wrap gap-3 sticky-bottom-bar pt-3 border-top">
      <div class="d-flex align-center" style="gap: 8px;">
        <v-btn color="#4caf50" dark class="text-none px-3" height="38" elevation="0" @click="openImportExcelModal">
          <v-icon left small>mdi-microsoft-excel</v-icon> Nhập file excel
        </v-btn>

        <v-btn color="#2e7d32" dark class="text-none px-3" height="38" elevation="0" @click="openImportTeacherModal">
          <v-icon left small>mdi-account-group</v-icon> Import giảng viên hội đồng
        </v-btn>
      </div>

      <div class="d-flex align-center custom-pagination-group" style="gap: 8px;">
        <v-select
          v-model="itemsPerPage"
          :items="[10, 20, 50, 100]"
          label="Bản ghi"
          outlined
          dense
          hide-details
          class="per-page-select"
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
          <v-btn color="#A62229" dark depressed class="text-none px-3" height="36" @click="goToPage">
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
              :color="p === currentPage ? '#A62229' : 'grey lighten-2'"
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

    <!-- MODAL NHẬP FILE EXCEL CHUNG -->
    <v-dialog v-model="importExcelDialog" max-width="550px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="white--text py-3 px-4 d-flex justify-space-between align-center" style="background-color: #A62229;">
          <span class="text-h6 font-weight-bold">Nhập file excel</span>
          <v-btn icon dark @click="importExcelDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text class="pa-5 text-center">
          <div class="upload-dropzone pa-5 rounded-lg mb-2" @click="triggerFileInput('excelInput')">
            <input ref="excelInput" type="file" accept=".xlsx, .xls" class="d-none" @change="handleFileChange($event, 'excel')" />
            <div v-if="!selectedExcelFile" class="py-3 d-flex flex-column align-center" style="gap: 6px;">
              <div class="upload-icon-circle"><v-icon color="#A62229" size="24">mdi-plus</v-icon></div>
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
          <v-btn color="#A62229" dark class="text-none px-5" elevation="0" :disabled="!selectedExcelFile" @click="uploadExcel">Import</v-btn>
          <v-btn text class="text-none" @click="importExcelDialog = false">Đóng</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MODAL IMPORT GIẢNG VIÊN HỘI ĐỒNG -->
    <v-dialog v-model="importTeacherDialog" max-width="550px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="white--text py-3 px-4 d-flex justify-space-between align-center" style="background-color: #A62229;">
          <span class="text-h6 font-weight-bold">Import giảng viên hội đồng</span>
          <v-btn icon dark @click="importTeacherDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text class="pa-5 text-center">
          <div class="upload-dropzone pa-5 rounded-lg mb-2" @click="triggerFileInput('teacherInput')">
            <input ref="teacherInput" type="file" accept=".xlsx, .xls" class="d-none" @change="handleFileChange($event, 'teacher')" />
            <div v-if="!selectedTeacherFile" class="py-3 d-flex flex-column align-center" style="gap: 6px;">
              <div class="upload-icon-circle"><v-icon color="#A62229" size="24">mdi-plus</v-icon></div>
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
          <v-btn color="#A62229" dark class="text-none px-5" elevation="0" :disabled="!selectedTeacherFile" @click="uploadTeacherFile">Import</v-btn>
          <v-btn text class="text-none" @click="importTeacherDialog = false">Đóng</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MODAL XÁC NHẬN XÓA -->
    <v-dialog v-model="deleteDialogVisible" max-width="500px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="red-dialog-header white--text py-3 px-4 d-flex justify-space-between align-center" style="background-color: #a62229;">
          <span class="text-h6 font-weight-bold">Xác nhận</span>
          <v-btn icon dark @click="deleteDialogVisible = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text class="pa-4 text-body-1 black--text">
          Xác nhận xóa hội đồng <span class="font-weight-bold red--text text--darken-3">{{ itemToDelete ? itemToDelete.examClass : '' }}</span>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="px-4 py-3 justify-end" style="gap: 8px;">
          <v-btn text class="text-none" @click="deleteDialogVisible = false">Đóng</v-btn>
          <v-btn color="#A62229" dark class="text-none px-4" elevation="0" @click="confirmDelete">Xác Nhận</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MODAL XÁC NHẬN GỬI EMAIL BẢNG ĐIỂM -->
    <v-dialog v-model="emailConfirmDialog" max-width="500px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="white--text py-3 px-4 d-flex justify-space-between align-center" style="background-color: #a62229;">
          <span class="text-h6 font-weight-bold">Xác nhận</span>
          <v-btn icon dark @click="emailConfirmDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text class="pa-4 text-body-1 black--text">
          Bạn có chắc chắn muốn gửi email bảng điểm của phòng thi <span class="font-weight-bold red--text text--darken-3">{{ itemToSendEmail ? itemToSendEmail.examClass : '' }}</span>?
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="px-4 py-3 justify-end" style="gap: 8px;">
          <v-btn text class="text-none" @click="emailConfirmDialog = false">Đóng</v-btn>
          <v-btn color="#A62229" dark class="text-none px-4" elevation="0" @click="confirmSendEmail">Xác Nhận</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MODAL CHI TIẾT HỘI ĐỒNG -->
    <v-dialog v-model="detailDialog" max-width="800px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="white--text py-3 px-4 d-flex justify-space-between align-center" style="background-color: #A62229;">
          <span class="text-h6 font-weight-bold">Chi tiết hội đồng</span>
          <v-btn icon dark @click="detailDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text class="pa-4" style="max-height: 75vh; overflow-y: auto;">
          <div v-if="detailData">
            <div class="mb-2"><strong>Hội đồng:</strong> <span class="red--text">{{ detailData.examClass }}</span></div>
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

            <div class="text-subtitle-1 font-weight-bold mb-2">Danh sách sinh viên ({{ (studentListDetail || []).length }})</div>
            <v-simple-table dense outlined>
              <thead>
                <tr class="grey lighten-4">
                  <th class="text-center" style="width: 50px;">STT</th>
                  <th>Thông tin chung</th>
                  <th>Giảng viên</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(stu, idx) in studentListDetail" :key="stu.id || idx">
                  <td class="text-center">{{ idx + 1 }}</td>
                  <td>
                    <div class="font-weight-bold red--text">{{ stu.fullName || '-' }}</div>
                    <div>Mã số sinh viên: <strong>{{ stu.code || '-' }}</strong></div>
                    <div>Số điện thoại: {{ stu.phone || '-' }}</div>
                    <div>Ngày sinh: {{ formatDateOnly(stu.birthday) }}</div>
                    <div>Email: {{ stu.email || '-' }}</div>
                    <div>Giới tính: {{ formatGender(stu.gender) }}</div>
                  </td>
                  <td>
                    <template v-if="stu.teachersList && stu.teachersList.length > 0">
                      <div v-for="(tch, tIdx) in stu.teachersList" :key="tIdx">
                        {{ tch.fullName }} <span class="grey--text">({{ getAssessmentTypeText(tch.reAssessmentType) }})</span>
                      </div>
                    </template>
                    <span v-else class="grey--text">-</span>
                  </td>
                </tr>
                <tr v-if="!studentListDetail || studentListDetail.length === 0">
                  <td colspan="3" class="text-center grey--text py-3">Không có sinh viên</td>
                </tr>
              </tbody>
            </v-simple-table>
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="px-4 py-3 justify-end">
          <v-btn color="#A62229" dark class="text-none px-5" @click="detailDialog = false">Đóng</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MODAL CẬP NHẬT HỘI ĐỒNG -->
    <v-dialog v-model="editDialog" max-width="700px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="white--text py-3 px-4 d-flex justify-space-between align-center" style="background-color: #A62229;">
          <span class="text-h6 font-weight-bold">Cập nhật hội đồng</span>
          <v-btn icon dark @click="editDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>

        <v-card-text class="pa-4" style="max-height: 75vh; overflow-y: auto;">
          <!-- Tên hội đồng -->
          <v-text-field
            v-model="editForm.examClass"
            label="Hội đồng bảo vệ (*)"
            outlined
            dense
            class="mb-3"
          ></v-text-field>

          <!-- Hình thức đào tạo -->
          <v-select
            v-model="editForm.trainingMethodId"
            :items="trainingMethodList"
            item-text="name"
            item-value="id"
            label="Hình thức đào tạo (*)"
            outlined
            dense
            class="mb-3"
          ></v-select>

          <!-- Đợt bảo vệ -->
          <v-select
            v-model="editForm.examId"
            :items="examList"
            item-text="name"
            item-value="id"
            label="Đợt bảo vệ (*)"
            outlined
            dense
            class="mb-3"
            @change="onExamChange"
          ></v-select>

          <!-- Học phần -->
          <v-select
            v-model="editForm.termId"
            :items="termList"
            item-text="name"
            item-value="id"
            label="Học phần (*)"
            outlined
            dense
            class="mb-3"
            @change="onTermOrExamChange"
          ></v-select>

          <!-- Sinh viên (Menu dạng bảng) -->
          <v-menu
            v-model="studentMenu"
            :close-on-content-click="false"
            offset-y
            max-height="400"
            min-width="500"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="selectedStudentText"
                label="Sinh viên (*)"
                placeholder="Chọn sinh viên"
                readonly
                outlined
                dense
                clearable
                :error-messages="studentError"
                v-bind="attrs"
                v-on="on"
                @click:clear="clearSelectedStudent"
                class="mb-3"
                append-icon="mdi-menu-down"
              ></v-text-field>
            </template>

            <v-card class="pa-2">
              <v-text-field
                v-model="studentSearch"
                dense
                outlined
                placeholder="Tìm kiếm theo tên hoặc mã sinh viên..."
                hide-details
                class="mb-2"
                prepend-inner-icon="mdi-magnify"
              ></v-text-field>

              <v-simple-table dense fixed-header height="250px">
                <thead>
                  <tr class="grey lighten-4">
                    <th class="text-center" style="width: 50px;">Chọn</th>
                    <th>Mã SV</th>
                    <th>Họ và tên</th>
                    <th>Lớp</th>
                    <th>SĐT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="stu in filteredStudents" 
                    :key="stu.id || stu.studentId"
                    @click="selectStudent(stu)"
                    style="cursor: pointer;"
                  >
                    <td class="text-center">
                      <v-radio-group v-model="editForm.studentId" hide-details class="pa-0 ma-0">
                        <v-radio :value="stu.id || stu.studentId"></v-radio>
                      </v-radio-group>
                    </td>
                    <td><strong>{{ stu.code || stu.studentCode }}</strong></td>
                    <td class="red--text font-weight-bold">{{ stu.fullName || stu.name }}</td>
                    <td>{{ stu.clazz ? stu.clazz.name : (stu.className || '-') }}</td>
                    <td>{{ stu.phone || '-' }}</td>
                  </tr>
                  <tr v-if="filteredStudents.length === 0">
                    <td colspan="5" class="text-center grey--text py-3">Không có dữ liệu sinh viên</td>
                  </tr>
                </tbody>
              </v-simple-table>
            </v-card>
          </v-menu>

          <!-- Thời gian bắt đầu -->
          <v-text-field
            v-model="editForm.fromTime"
            label="Thời gian bắt đầu (*)"
            outlined
            dense
            class="mb-3"
          ></v-text-field>

          <!-- Thời gian kết thúc -->
          <v-text-field
            v-model="editForm.toTime"
            label="Thời gian kết thúc (*)"
            outlined
            dense
            class="mb-0"
          ></v-text-field>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="px-4 py-3 justify-end" style="gap: 8px;">
          <v-btn text class="text-none" @click="editDialog = false">Đóng</v-btn>
          <v-btn color="#A62229" dark class="text-none px-5" elevation="0" @click="handleUpdateSubmit">Lưu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import examSessionService from '~/services/redefend/examSessionService'
import { examStatusList, scoreStatusList } from "~/consts/list"

export default {
  name: 'ExamSessionPage',
  components: { BaseTable },
  data() {
    return {
      // Modal Cập nhật
      editDialog: false,
      editForm: {
        id: null,
        examClass: '',
        trainingMethodId: null,
        examId: null,
        termId: null,
        studentId: null,
        fromTime: '',
        toTime: ''
      },
      trainingMethodList: [],
      examList: [],
      termList: [],
      studentDropdownList: [],
      studentMenu: false,
      studentSearch: '',
      selectedStudentText: '',
      studentError: '',

      // Modal Chi tiết
      detailDialog: false,
      detailData: null,
      studentListDetail: [],

      // Modal Email
      emailConfirmDialog: false,
      itemToSendEmail: null,

      // Filter & Table
      loading: false,
      filters: {
        search: '',
        examType: '',
        termId: '',
        fromTime: '',
        toTime: '',
      },
      activeFilters: {
        search: '',
        examType: '',
        termId: '',
        fromTime: '',
        toTime: '',
      },
      fromMenu: false,
      toMenu: false,
      classList: [],
      itemList: [],
      totalRecords: 0,
      totalPages: 1,
      currentPage: 1,
      pageInput: 1,
      itemsPerPage: 50,

      tableHeaders: [
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

      // Import & Delete
      importExcelDialog: false,
      selectedExcelFile: null,
      importTeacherDialog: false,
      selectedTeacherFile: null,
      deleteDialogVisible: false,
      itemToDelete: null,
    }
  },
  computed: {
    // Computed lọc sinh viên trong bảng dropdown chọn sinh viên
    filteredStudents() {
      const list = Array.isArray(this.studentDropdownList) ? this.studentDropdownList : []
      if (!this.studentSearch) return list
      const keyword = this.studentSearch.toLowerCase()
      return list.filter(stu => {
        const name = (stu.fullName || stu.name || '').toLowerCase()
        const code = (stu.code || stu.studentCode || '').toLowerCase()
        return name.includes(keyword) || code.includes(keyword)
      })
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

    formatDisplayDate(dateStr) {
      if (!dateStr) return ''
      const parts = dateStr.split('-')
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`
      }
      return dateStr
    },

    handleSearch() {
      this.activeFilters = { ...this.filters }
      this.currentPage = 1
      this.pageInput = 1
      this.loadData()
    },

    refreshData() {
      this.filters = { search: '', examType: '', termId: '', fromTime: '', toTime: '' }
      this.activeFilters = { ...this.filters }
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
          params.fromTime = `${this.activeFilters.fromTime} 00:00:00`
        }
        if (this.activeFilters.toTime) {
          params.toTime = `${this.activeFilters.toTime} 23:59:59`
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

    openAddModal() {},
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
      return dateStr.split(' ')[0]
    },

    formatGender(gender) {
      if (!gender) return '-'
      if (gender === 'FEMALE') return 'Nữ'
      if (gender === 'MALE') return 'Nam'
      return gender
    },

    getAssessmentTypeText(type) {
      switch (type) {
        case 'SUPPORT':
          return 'Hướng dẫn DATN'
        case 'REBUTTAL':
          return 'Phản biện DATN'
        case 'JOIN':
          return 'Tham gia chấm DATN'
        default:
          return type || 'Giảng viên'
      }
    },

    // 1. Xem Chi tiết
    async handleDetail(item) {
      try {
        const [resDetail, resStudents] = await Promise.all([
          examSessionService.getDetail(item.id, 'CMS'),
          examSessionService.getStudentsByExamSession({ examSessionId: item.id, channel: 'CMS' })
        ])
        
        this.detailData = resDetail.data !== undefined ? resDetail.data : resDetail
        
        const rawStu = resStudents.data !== undefined ? resStudents.data : resStudents
        const itemsList = Array.isArray(rawStu) ? rawStu : (rawStu.data || rawStu.content || [])

        const studentMap = {}
        itemsList.forEach(row => {
          const stuInfo = row.student || {}
          const stuId = stuInfo.id || row.id

          if (!studentMap[stuId]) {
            studentMap[stuId] = {
              ...stuInfo,
              teachersList: []
            }
          }

          if (row.teacher) {
            studentMap[stuId].teachersList.push({
              fullName: row.teacher.fullName || row.teacher.name,
              reAssessmentType: row.reAssessmentType
            })
          }
        })

        this.studentListDetail = Object.values(studentMap)
        this.detailDialog = true
      } catch (error) {
        console.error('Lỗi tải chi tiết hội đồng:', error)
      }
    },

    // 2. Xuất file DSSV
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

    // 3. Gửi email bảng điểm
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

    handleStudentList(item) {},

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

    // 4. Mở Modal Cập nhật
    async openEditModal(item) {
      try {
        const resDetail = await examSessionService.getExamSessionDetail(item.id, 'CMS')
        const data = resDetail.data !== undefined ? resDetail.data : resDetail
        
        if (data.examSessionStatus === 'FINALIZED') {
          if (typeof this.$showError === 'function') {
            this.$showError('Hội đồng bảo vệ lại không thể sửa do đã chốt dữ liệu')
          }
          return
        }

        const currentStudent = (data.studentTerms && data.studentTerms.length > 0) ? data.studentTerms[0] : null
        
        this.editForm = {
          id: data.id,
          examClass: data.examClass,
          trainingMethodId: data.trainingMethod ? data.trainingMethod.id : null,
          examId: data.exam ? data.exam.id : null,
          termId: data.term ? data.term.id : null,
          studentId: currentStudent ? (currentStudent.id || currentStudent.studentId) : null,
          fromTime: data.fromTime,
          toTime: data.toTime
        }

        if (currentStudent) {
          const name = currentStudent.fullName || currentStudent.name || ''
          const code = currentStudent.code || currentStudent.studentCode || ''
          this.selectedStudentText = name ? `${name} - ${code}` : ''
        } else {
          this.selectedStudentText = ''
        }

        await Promise.all([
          this.loadTrainingMethods(),
          this.loadExams()
        ])

        if (this.editForm.examId) {
          await this.loadTermsByExam(this.editForm.examId)
        }
        if (this.editForm.termId && this.editForm.examId) {
          await this.loadStudentsForEdit(this.editForm.termId, this.editForm.examId, this.editForm.id, this.editForm.trainingMethodId)
        }

        this.editDialog = true
      } catch (error) {
        console.error('Lỗi mở form cập nhật hội đồng:', error)
      }
    },

    async loadTrainingMethods() {
      const res = await examSessionService.getTrainingMethodList({ status: 'ACTIVE', channel: 'CMS' })
      const raw = res.data !== undefined ? res.data : res
      this.trainingMethodList = Array.isArray(raw) ? raw : (raw.data || [])
    },

    async loadExams() {
      const res = await examSessionService.getExamList({ status: 'ACTIVE', channel: 'CMS' })
      const raw = res.data !== undefined ? res.data : res
      this.examList = Array.isArray(raw) ? raw : (raw.data || [])
    },

    async loadTermsByExam(examId) {
      const res = await examSessionService.getTermListByExam({ status: 'ACTIVE', examId, channel: 'CMS' })
      const raw = res.data !== undefined ? res.data : res
      this.termList = Array.isArray(raw) ? raw : (raw.data || [])
    },

    async loadStudentsForEdit(termId, examId, examSessionId, trainingMethodId) {
      const params = {
        status: 'ACTIVE',
        termId,
        examId,
        examSessionId,
        trainingMethodId: trainingMethodId || 202,
        channel: 'CMS'
      }
      const res = await examSessionService.getRegisterListByTermAndExam(params)
      const raw = res.data !== undefined ? res.data : res
      this.studentDropdownList = Array.isArray(raw) ? raw : (raw.data || raw.content || [])
    },

    async handleUpdateSubmit() {
      if (!this.editForm.studentId) {
        this.studentError = 'Vui lòng nhập đủ thông tin'
        return
      }
      this.studentError = ''

      try {
        const payload = {
          examClass: this.editForm.examClass,
          trainingMethodId: this.editForm.trainingMethodId,
          examId: this.editForm.examId,
          termId: this.editForm.termId,
          studentIds: [this.editForm.studentId],
          fromTime: this.editForm.fromTime,
          toTime: this.editForm.toTime,
          channel: 'CMS'
        }

        const res = await examSessionService.updateExamSession(this.editForm.id, payload, 'CMS')
        
        // Lấy đúng object response
        const resData = res.data !== undefined ? res.data : res

        // KIỂM TRA LỖI NGHIỆP VỤ TỪ BACKEND TRẢ VỀ
        if (resData && (resData.code === 400 || (resData.error && resData.error.code !== 0))) {
          const errorMsg = (resData.error && resData.error.message) || resData.message || 'Hội đồng bảo vệ lại không thể sửa do đã chốt dữ liệu'
          if (typeof this.$showError === 'function') {
            this.$showError(errorMsg)
          } else if (typeof this.$showWarning === 'function') {
            this.$showWarning(errorMsg)
          }
          return // Dừng lại tại đây, KHÔNG chạy xuống thông báo thành công
        }

        this.loadData()
      } catch (error) {
        console.error('Lỗi cập nhật hội đồng:', error)
        const serverMsg = error.response && error.response.data && error.response.data.error && error.response.data.error.message
        if (typeof this.$showError === 'function') {
          this.$showError(serverMsg || 'Hội đồng bảo vệ lại không thể sửa do đã chốt dữ liệu')
        }
      }
    },

    selectStudent(stu) {
      const id = stu.id || stu.studentId
      const name = stu.fullName || stu.name || ''
      const code = stu.code || stu.studentCode || ''
      
      this.editForm.studentId = id
      this.selectedStudentText = name ? `${name} - ${code}` : ''
      this.studentError = ''
      this.studentMenu = false
    },

    clearSelectedStudent() {
      this.editForm.studentId = null
      this.selectedStudentText = ''
    },

    async onExamChange(examId) {
      this.editForm.termId = null
      this.termList = []
      if (examId) {
        await this.loadTermsByExam(examId)
      }
    },

    async onTermOrExamChange() {
      if (this.editForm.termId && this.editForm.examId) {
        await this.loadStudentsForEdit(
          this.editForm.termId,
          this.editForm.examId,
          this.editForm.id,
          this.editForm.trainingMethodId
        )
      } else {
        this.studentDropdownList = []
      }
    },
    handleScoreBoard(item) {
      // item.id chính là _id của hội đồng (ví dụ: 277 hoặc 252)
      this.$router.push({
        path: `/quan-ly-bao-ve-lai/danh-sach-hoi-dong/${item.id}/bang-diem`,
        query: { channel: 'CMS' }
      })
    },
  }
}
</script>

<style scoped>
.sticky-filter {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #fff;
}
.sticky-bottom-bar {
  position: sticky;
  bottom: 0;
  z-index: 2;
  background: #fff;
}
.text-red-bold {
  color: #A62229;
  font-weight: bold;
}
.btn-square-action {
  height: 38px !important;
  min-width: 38px !important;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}
.filter-input >>> .v-input__control >>> .v-input__slot {
  min-height: 38px !important;
  display: flex;
  align-items: center;
}
.upload-dropzone {
  border: 2px dashed #A62229;
  background-color: #fafafa;
  cursor: pointer;
  transition: background-color 0.2s;
}
.upload-dropzone:hover {
  background-color: #f5f5f5;
}
.bg-file-selected {
  background-color: #f1f8e9;
  border: 1px solid #c8e6c9;
}
.upload-icon-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: #ffebee;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>