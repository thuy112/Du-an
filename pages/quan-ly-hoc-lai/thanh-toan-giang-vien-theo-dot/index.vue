<template>
  <div class="fee-teacher-exam-page pa-3 pa-md-4 bg-white" :class="{ 'is-mobile-device': isMobileDevice }">
    <!-- TIÊU ĐỀ TRANG -->
    <div class="text-h6 font-weight-bold black--text mb-3">
      Danh sách thanh toán giảng viên theo đợt (<span class="text-red-bold">{{ totalRecords }}</span>)
    </div>

    <!-- BỘ LỌC TÌM KIẾM CỐ ĐỊNH -->
    <div class="filter-container mb-3 sticky-filter">
      <div class="d-flex align-center flex-wrap" style="gap: 5px; padding: 6px;">
        <v-text-field
          v-model="filters.classCode"
          placeholder="Mã lớp học lại"
          outlined
          dense
          hide-details
          clearable
          class="filter-input flex-grow-1"
          style="min-width: 150px;"
        ></v-text-field>

        <v-select
          v-model="filters.teacherId"
          :items="teacherOptions"
          placeholder="Giảng viên"
          outlined
          dense
          hide-details
          clearable
          class="filter-input flex-grow-1"
          style="min-width: 160px;"
        ></v-select>

        <v-select
          v-model="filters.examSessionCode"
          :items="examOptions"
          placeholder="Lớp học lại"
          outlined
          dense
          hide-details
          clearable
          class="filter-input flex-grow-1"
          style="min-width: 150px;"
        ></v-select>

        <v-select
          v-model="filters.paymentFeeStatus"
          :items="paymentTeacherStatusList"
          item-text="text"
          item-value="value"
          placeholder="Trạng thái"
          outlined
          dense
          hide-details
          clearable
          class="filter-input flex-grow-1"
          style="min-width: 140px;"
        ></v-select>

        <div class="d-flex align-center" style="gap: 5px;">
          <v-btn icon color="#A62229" class="btn-square-action" @click="refreshData" title="Làm mới">
            <v-icon size="22">mdi-refresh</v-icon>
          </v-btn>

          <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="handleSearch" title="Tìm kiếm">
            <v-icon size="22">mdi-magnify</v-icon>
          </v-btn>

          <v-btn color="#A62229" dark class="btn-square-action min-w-0 px-3" elevation="0" @click="openAddModal" title="Thêm mới">
            <v-icon size="22">mdi-plus</v-icon>
          </v-btn>
        </div>
      </div>
    </div>

    <!-- KHUNG BASETABLE CÓ THANH CUỘN & CỐ ĐỊNH TIÊU ĐỀ -->
    <div class="table-scroll-container">
      <BaseTable
        :headers="tableHeaders"
        :items="itemList"
        :loading="loading"
        :is-mobile="isMobileDevice"
        :current-page="currentPage"
        :items-per-page="itemsPerPage"
        :total-records="totalRecords"
        hide-default-footer
        @page-change="changePage"
        @per-page-change="handleItemsPerPageChange"
      >
        <!-- Cột STT -->
        <template #[`item.stt`]="{ index }">
          <span>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</span>
        </template>

        <!-- Đợt học lại -->
        <template #[`item.examName`]="{ item }">
          <span>{{ item.examName || '-' }}</span>
        </template>

        <!-- Tên đợt thanh toán -->
        <template #[`item.name`]="{ item }">
          <span>{{ item.name || '-' }}</span>
        </template>

        <!-- Mã đợt thanh toán -->
        <template #[`item.code`]="{ item }">
          <span>{{ item.code || '-' }}</span>
        </template>

        <!-- Ngày thanh toán -->
        <template #[`item.paymentDate`]="{ item }">
          <span>{{ formatDate(item.paymentDate) }}</span>
        </template>

        <!-- Mã lớp học lại -->
        <template #[`item.examSessionsCode`]="{ item }">
          <span>{{ formatExamSessions(item.examSessions) }}</span>
        </template>

        <!-- File thanh toán -->
        <template #[`item.fileName`]="{ item }">
          <v-btn
            v-if="item.fileName"
            icon
            small
            color="#A62229"
            :href="item.fileName"
            target="_blank"
            title="Tải xuống file thanh toán"
          >
            <v-icon size="26">mdi-file-download-outline</v-icon>
          </v-btn>
          <v-btn
            v-else
            icon
            small
            disabled
            color="grey"
            title="Chưa có file"
          >
            <v-icon size="26">mdi-file-download-outline</v-icon>
          </v-btn>
        </template>

        <!-- Tổng phí -->
        <template #[`item.totalFee`]="{ item }">
          <span>{{ formatMoney(item.totalFee) }}</span>
        </template>

        <!-- Thuế TNCN -->
        <template #[`item.totalTaxFee`]="{ item }">
          <span>{{ formatMoney(item.totalTaxFee) }}</span>
        </template>

        <!-- Trạng thái thanh toán -->
        <template #[`item.paymentFeeStatus`]="{ item }">
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-chip
                v-bind="attrs"
                v-on="on"
                small
                dark
                :color="getStatusColor(item.paymentFeeStatus)"
                class="font-weight-medium cursor-pointer"
              >
                {{ getStatusText(item.paymentFeeStatus) }}
                <v-icon right x-small>mdi-menu-down</v-icon>
              </v-chip>
            </template>
            <v-list dense>
              <v-list-item v-for="st in paymentTeacherStatusList" :key="st.value" @click="updateStatus(item, st.value)">
                <v-list-item-title>{{ st.text }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>

        <!-- Trạng thái gửi mail -->
        <template #[`item.isSendEmail`]="{ item }">
          <v-chip
            small
            dark
            :color="item.isSendEmail === 1 || item.isSendEmail === true ? '#4caf50' : '#ffae1f'"
            class="font-weight-medium text-caption"
          >
            {{ item.isSendEmail === 1 || item.isSendEmail === true ? 'Đã gửi' : 'Chưa gửi' }}
          </v-chip>
        </template>

        <!-- T.T xuất file tổng hợp -->
        <template #[`item.isExportedSummary`]="{ item }">
          <v-chip
            small
            dark
            :color="item.isExportedSummary === 1 || item.isExportedSummary === true ? '#4caf50' : '#ffae1f'"
            class="font-weight-medium text-caption"
          >
            {{ item.isExportedSummary === 1 || item.isExportedSummary === true ? 'Đã xuất' : 'Chưa xuất' }}
          </v-chip>
        </template>

        <!-- Cột Chức năng -->
        <template #[`item.actions`]="{ item }">
          <v-menu offset-y left>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon small v-bind="attrs" v-on="on">
                <v-icon size="20">mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list dense class="action-dropdown-list">
              <v-list-item @click="viewDetail(item)">
                <v-list-item-icon class="mr-2">
                  <v-icon small color="#00bcd4">mdi-eye-outline</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Chi tiết</v-list-item-title>
              </v-list-item>

              <v-list-item @click="exportExcelSummary(item)">
                <v-list-item-icon class="mr-2">
                  <v-icon small color="#4caf50">mdi-export</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Xuất Excel file tổng hợp</v-list-item-title>
              </v-list-item>

              <v-list-item @click="exportExcelDetail(item)">
                <v-list-item-icon class="mr-2">
                  <v-icon small color="#4caf50">mdi-export</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Xuất Excel file chi tiết</v-list-item-title>
              </v-list-item>

              <v-list-item @click="exportExcelCompact(item)">
                <v-list-item-icon class="mr-2">
                  <v-icon small color="#4caf50">mdi-export</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Xuất Excel file chi tiết (Rút gọn)</v-list-item-title>
              </v-list-item>

              <!-- Nếu là Chờ thanh toán: Hiện nút Cập nhật -->
              <v-list-item v-if="item.paymentFeeStatus === 'WAIT_PAID'" @click="updateRecord(item)">
                <v-list-item-icon class="mr-2">
                  <v-icon small color="#ffae1f">mdi-pencil-outline</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Cập nhật</v-list-item-title>
              </v-list-item>

              <!-- Nếu là Đã thanh toán: Đổi thành Gửi mail thông báo (Ảnh 3) -->
              <v-list-item v-if="item.paymentFeeStatus === 'COMPLETE_PAID'" @click="sendEmailNotification(item)">
                <v-list-item-icon class="mr-2">
                  <v-icon small color="#9c27b0">mdi-email-outline</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Gửi mail thông báo</v-list-item-title>
              </v-list-item>

              <v-list-item @click="deleteRecord(item)">
                <v-list-item-icon class="mr-2">
                  <v-icon small color="#f44336">mdi-delete-outline</v-icon>
                </v-list-item-icon>
                <v-list-item-title class="red--text">Xóa</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </BaseTable>
    </div>

    <!-- THANH BOTTOM ACTIONS & PHÂN TRANG THU GỌN -->
    <div class="pagination-bottom-container mt-4 pt-3 d-flex align-center justify-space-between flex-wrap gap-3 border-top">
      <div class="d-flex align-center gap-2 flex-wrap"></div>

      <div class="d-flex align-center custom-pagination-group" style="gap: 8px;">
        <v-select
          v-model="itemsPerPage"
          :items="[5, 10, 20, 50, 100]"
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
          <v-btn color="#A2212B" dark depressed class="text-none px-3" height="36" @click="goToPage">
            Đi
          </v-btn>
        </div>

        <v-btn icon outlined small color="grey" :disabled="currentPage <= 1" @click="changePage(currentPage - 1)">
          <v-icon small>mdi-chevron-left</v-icon>
        </v-btn>

        <v-btn color="#A2212B" dark depressed class="page-current-btn" min-width="36" height="36" small>
          {{ currentPage }}
        </v-btn>

        <v-btn icon outlined small color="grey" :disabled="currentPage >= totalPages" @click="changePage(currentPage + 1)">
          <v-icon small>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- MODAL THÊM MỚI ĐỢT THANH TOÁN -->
    <v-dialog v-model="open" max-width="900px" persistent>
      <v-form ref="form" @submit.prevent="handleAdd">
        <v-card class="pa-0 rounded-lg overflow-hidden">
          <!-- Header Modal màu đỏ -->
          <div class="px-4 py-3 d-flex align-center justify-space-between" style="background-color: #A2212B; color: white;">
            <div class="text-subtitle-1 font-weight-bold">Thêm mới đợt thanh toán GV theo lớp học lại</div>
            <v-btn icon dark small @click="open = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <div class="pa-4">
            <v-row>
              <!-- Thông tin thanh toán (Tải file .xlsx) -->
              <v-col cols="12" md="7">
                <v-file-input
                  placeholder="Thông tin thanh toán"
                  accept=".xlsx, .xls, .pdf"
                  outlined
                  dense
                  hide-details
                  prepend-icon=""
                  append-icon="mdi-file-upload-outline"
                  class="custom-input"
                  @change="handleUpload"
                ></v-file-input>
              </v-col>

              <!-- Ngày thanh toán -->
              <v-col cols="12" md="5">
                <v-menu
                  v-model="menuDate"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="params.paymentDate"
                      label="Ngày thanh toán (*)"
                      outlined
                      dense
                      hide-details
                      readonly
                      clearable
                      v-bind="attrs"
                      v-on="on"
                      append-icon="mdi-close"
                      @click:append="params.paymentDate = ''"
                      class="custom-input custom-date-input"
                      :rules="[v => !!v || 'Vui lòng chọn ngày thanh toán']"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="pickerDate"
                    no-title
                    scrollable
                    color="#A2212B"
                    @input="menuDate = false; formatSelectedDate(pickerDate)"
                  ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>

            <!-- Chọn lớp học lại -->
            <v-select
              v-model="params.examSessionIds"
              :items="examSessionList"
              item-text="name"
              item-value="id"
              label="Chọn lớp học lại (*)"
              outlined
              dense
              multiple
              chips
              small-chips
              clearable
              @change="onClassesSelected"
              class="mt-3 mb-3 custom-input"
              :rules="[v => (v && v.length > 0) || 'Vui lòng chọn ít nhất một lớp học lại']"
            ></v-select>

            <!-- Tiêu đề danh sách giảng viên & Ô tìm kiếm -->
            <div class="d-flex align-center justify-space-between mb-2 flex-wrap" style="gap: 10px;">
              <div class="text-subtitle-2 font-weight-bold">
                Danh sách giảng viên (<span class="text-red-bold">{{ filteredTeacherList.length }}</span>)
              </div>
              <v-text-field
                v-model="teacherSearchKeyword"
                placeholder="Tìm kiếm"
                outlined
                dense
                hide-details
                clearable
                append-icon="mdi-magnify"
                style="max-width: 280px;"
                class="custom-input"
              ></v-text-field>
            </div>

            <!-- Bảng danh sách giảng viên -->
            <v-data-table
              :headers="teacherTableHeaders"
              :items="filteredTeacherList"
              dense
              class="elevation-1 mb-3"
              no-data-text="Vui lòng chọn lớp học lại để xem danh sách giảng viên"
              style="max-height: 280px; overflow-y: auto;"
            >
              <template #[`item.stt`]="{ index }">
                <span>{{ index + 1 }}</span>
              </template>
              <template #[`item.unitPrice`]="{ item }">
                <span>{{ formatMoney(item.unitPrice) }}</span>
              </template>
              <template #[`item.classType`]="{ item }">
                <span>{{ formatClassType(item.classType) }}</span>
              </template>
              <template #[`item.totalAmount`]="{ item }">
                <span>{{ formatMoney(item.totalAmount) }}</span>
              </template>
            </v-data-table>

            <!-- Tổng tiền -->
            <div class="text-right font-weight-bold text-subtitle-1 mb-4 text-red-bold">
              Tổng tiền: {{ formatMoney(calculateTotalAmount) }} VNĐ
            </div>

            <!-- Footer Modal: Đóng / Lưu -->
            <div class="d-flex justify-end align-center pt-2 border-top" style="gap: 8px;">
              <v-btn outlined color="grey darken-1" class="text-none px-4" height="38" @click="open = false">
                Đóng <v-icon right small>mdi-close</v-icon>
              </v-btn>
              <v-btn color="#A2212B" dark depressed class="text-none px-4" height="38" @click="handleAdd">
                Lưu <v-icon right small class="ml-1">mdi-content-save</v-icon>
              </v-btn>
            </div>
          </div>
        </v-card>
      </v-form>
    </v-dialog>

    <!-- ================= 1. MODAL XEM CHI TIẾT ================= -->
    <v-dialog v-model="dialogDetail" max-width="900px" persistent>
      <v-card class="pa-0 rounded-lg overflow-hidden">
        <!-- Header màu đỏ Bách khoa -->
        <div class="px-4 py-3 d-flex align-center justify-space-between" style="background-color: #A2212B; color: white;">
          <div class="text-subtitle-1 font-weight-bold">Chi tiết đợt thanh toán GV theo lớp học lại</div>
          <v-btn icon dark small @click="dialogDetail = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <div class="pa-4">
          <div class="mb-4">
            <div class="text-subtitle-2 font-weight-bold mb-3 text-red-bold">Thông tin đợt thanh toán</div>
            <v-row class="body-2">
              <v-col cols="6">
                <strong>Tên đợt thanh toán:</strong> 
                <span class="text-red-bold ml-1">{{ selectedItem.name || selectedItem.examName || selectedItem.code || '-' }}</span>
              </v-col>
              <v-col cols="6">
                <strong>Mã đợt thanh toán:</strong> 
                <span class="text-red-bold ml-1">{{ selectedItem.code || '-' }}</span>
              </v-col>
              <v-col cols="6">
                <strong>Ngày thanh toán:</strong> 
                <span class="text-red-bold ml-1">{{ formatDate(selectedItem.paymentDate) }}</span>
              </v-col>
              <v-col cols="6">
                <strong>Trạng thái:</strong> 
                <span class="text-red-bold ml-1">{{ getStatusText(selectedItem.paymentFeeStatus) }}</span>
              </v-col>
              
              <!-- File thanh toán theo đúng yêu cầu -->
              <v-col cols="12" class="d-flex align-center pt-2">
                <strong class="mr-2">File thanh toán:</strong>
                <v-btn
                  v-if="selectedItem.fileName || selectedItem.fileUrl"
                  icon
                  small
                  color="#A62229"
                  :href="selectedItem.fileUrl || selectedItem.fileName"
                  target="_blank"
                  title="Tải xuống file thanh toán"
                >
                  <v-icon size="26">mdi-file-upload-outline</v-icon>
                </v-btn>
                <v-btn
                  v-else
                  icon
                  small
                  disabled
                  color="grey"
                  title="Chưa có file thanh toán"
                >
                  <v-icon size="26">mdi-file-upload-outline</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </div>

          <v-divider class="my-3"></v-divider>

          <!-- Danh sách giảng viên -->
          <div class="text-subtitle-2 font-weight-bold mb-2">
            Danh sách giảng viên (<span class="text-red-bold">{{ detailTeacherList.length }}</span>)
          </div>

          <v-data-table
            :headers="detailHeaders"
            :items="detailTeacherList"
            dense
            hide-default-footer
            class="elevation-1"
            no-data-text="Không có dữ liệu giảng viên"
          >
            <template #[`item.stt`]="{ index }">
              <span>{{ index + 1 }}</span>
            </template>
            <template #[`item.unitPrice`]="{ item }">
              <span>{{ formatMoney(item.unitPrice) }}</span>
            </template>
            <template #[`item.classType`]="{ item }">
              <span>{{ formatClassType(item.classType) }}</span>
            </template>
            <template #[`item.totalAmount`]="{ item }">
              <span>{{ formatMoney(item.totalAmount) }}</span>
            </template>
          </v-data-table>

          <div class="d-flex justify-end align-center pt-4 border-top mt-3">
            <v-btn text color="#A2212B" class="text-none font-weight-bold" @click="dialogDetail = false">
              Đóng <v-icon right small>mdi-close</v-icon>
            </v-btn>
          </div>
        </div>
      </v-card>
    </v-dialog>

    <!-- ================= MODAL CẬP NHẬT (Chuẩn Ảnh 2) ================= -->
    <v-dialog v-model="dialogEdit" max-width="900px" persistent>
      <v-form ref="editForm" @submit.prevent="saveUpdate">
        <v-card class="pa-0 rounded-lg overflow-hidden">
          <!-- Header màu đỏ Bách khoa -->
          <div class="px-4 py-3 d-flex align-center justify-space-between" style="background-color: #A2212B; color: white;">
            <div class="text-subtitle-1 font-weight-bold">Cập nhật đợt thanh toán GV theo lớp học lại</div>
            <v-btn icon dark small @click="dialogEdit = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <div class="pa-4">
            <!-- Thông tin thanh toán (Upload File) -->
            <v-file-input
              placeholder="Thông tin thanh toán"
              accept=".xlsx, .xls, .pdf"
              outlined
              dense
              hide-details
              prepend-icon=""
              append-icon="mdi-file-upload-outline"
              class="custom-input mb-3"
              @change="handleUploadEdit"
            ></v-file-input>

            <v-row class="mb-1">
              <!-- Ngày thanh toán -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formEditData.paymentDate"
                  label="Ngày thanh toán (*)"
                  outlined
                  dense
                  hide-details
                  readonly
                  class="custom-input"
                ></v-text-field>
              </v-col>

              <!-- Chọn lớp học lại -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="formEditData.examSessionIds"
                  :items="examSessionList"
                  item-text="name"
                  item-value="id"
                  label="Chọn lớp học lại (*)"
                  outlined
                  dense
                  hide-details
                  multiple
                  chips
                  small-chips
                  clearable
                  class="custom-input"
                  @change="onEditClassSelected"
                ></v-select>
              </v-col>
            </v-row>

            <!-- Tiêu đề Danh sách giảng viên & Ô tìm kiếm -->
            <div class="d-flex align-center justify-space-between my-3 flex-wrap" style="gap: 10px;">
              <div class="text-subtitle-2 font-weight-bold">
                Danh sách giảng viên (<span class="text-red-bold">{{ filteredEditTeacherList.length }}</span>)
              </div>
              <v-text-field
                v-model="editTeacherSearchKeyword"
                placeholder="Tìm kiếm"
                outlined
                dense
                hide-details
                clearable
                append-icon="mdi-magnify"
                style="max-width: 280px;"
                class="custom-input"
              ></v-text-field>
            </div>

            <!-- Bảng danh sách giảng viên -->
            <v-data-table
              :headers="detailHeaders"
              :items="filteredEditTeacherList"
              dense
              hide-default-footer
              class="elevation-1 mb-3"
              no-data-text="Không có dữ liệu giảng viên"
              style="max-height: 280px; overflow-y: auto;"
            >
              <template #[`item.stt`]="{ index }">
                <span>{{ index + 1 }}</span>
              </template>
              <template #[`item.unitPrice`]="{ item }">
                <span>{{ formatMoney(item.unitPrice) }}</span>
              </template>
              <template #[`item.classType`]="{ item }">
                <span>{{ formatClassType(item.classType) }}</span>
              </template>

              <!-- Hiển thị đúng số tiền 210,000 đ -->
              <template #[`item.totalAmount`]="{ item }">
                <span>{{ formatMoney(item.totalAmount || item.amount) }}</span>
              </template>
            </v-data-table>

            <!-- Tổng tiền -->
            <div class="text-right font-weight-bold text-subtitle-1 mb-4 text-red-bold">
              Tổng tiền: {{ formatMoney(calculateEditTotalAmount) }} VNĐ
            </div>

            <!-- Footer: Đóng & Nút Lưu luôn xuất hiện có icon đĩa lưu -->
            <div class="d-flex justify-end align-center pt-2 border-top" style="gap: 8px;">
              <v-btn text color="#A2212B" class="text-none font-weight-bold px-3" height="38" @click="dialogEdit = false">
                Đóng <v-icon right small class="ml-1">mdi-close</v-icon>
              </v-btn>
              <v-btn color="#A2212B" dark depressed class="text-none px-4" height="38" @click="saveUpdate">
                Lưu <v-icon right small class="ml-1">mdi-content-save</v-icon>
              </v-btn>
            </div>
          </div>
        </v-card>
      </v-form>
    </v-dialog>

    <!-- THANH THÔNG BÁO ĐỎ KHI BẤM LƯU MÀ KHÔNG CÓ GIẢNG VIÊN -->
    <v-snackbar
      v-model="snackbar.show"
      color="#f44336"
      top
      right
      timeout="3000"
    >
      <v-icon left dark>mdi-alert-circle</v-icon>
      {{ snackbar.text }}
      <template v-slot:action="{ attrs }">
        <v-btn text dark v-bind="attrs" @click="snackbar.show = false">Đóng</v-btn>
      </template>
    </v-snackbar>

    <!-- ================= 3. MODAL XÁC NHẬN XÓA (Ảnh 6 chuẩn) ================= -->
    <v-dialog v-model="dialogDelete" max-width="450px" persistent>
      <v-card class="pa-0 rounded-lg overflow-hidden">
        <div class="px-4 py-3 d-flex align-center justify-space-between" style="background-color: #A2212B; color: white;">
          <div class="text-subtitle-1 font-weight-bold">Xác nhận</div>
          <v-btn icon dark small @click="dialogDelete = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <div class="pa-6 text-center text-body-1">
          Xác nhận xóa <strong class="text-red-bold">{{ itemToDelete?.name || itemToDelete?.examName || itemToDelete?.code }}</strong>?
        </div>

        <div class="d-flex justify-end align-center pa-3 bg-light border-top" style="gap: 8px;">
          <v-btn text color="#A2212B" class="text-none font-weight-bold px-3" height="36" @click="dialogDelete = false">
            Đóng <v-icon right small class="ml-1">mdi-close</v-icon>
          </v-btn>
          <v-btn color="#A2212B" dark depressed class="text-none px-4" height="36" @click="confirmDelete">
            Xác Nhận
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Dialog Xác nhận đổi trạng thái / Gửi email -->
    <v-dialog v-model="dialogConfirmStatus" max-width="500px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="headline error white--text py-3">
          <span>Xác nhận</span>
          <v-spacer></v-spacer>
          <v-btn icon dark @click="dialogConfirmStatus = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-card-text class="py-4 text-body-1">
          {{ statusConfirmText }}
        </v-card-text>

        <v-card-actions class="px-4 pb-4">
          <v-spacer></v-spacer>
          <v-btn text class="grey--text text--darken-1 px-4" @click="dialogConfirmStatus = false">
            Đóng
          </v-btn>
          <v-btn color="error" class="px-4 white--text" @click="confirmChangeStatus">
            Xác Nhận
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import feeService from '~/services/feeTeacherByExamService'

export default {
  name: 'FeeTeacherByExamPage',
  components: {
    BaseTable,
  },
  data() {
    return {
      pickerDate: '',
      isMobileDevice: false,
      loading: false,
      dialogDetail: false,
      dialogEdit: false,
      dialogDelete: false,
      dialogConfirmStatus: false,
      statusConfirmText: '',
      pendingItem: null,
      pendingStatus: '',

      selectedItem: {},
      itemToDelete: null,
      detailTeacherList: [],

      formEditData: {
        id: null,
        paymentDate: '',
        examSessionId: null,
        fileName: '',
        fileUrl: '',
        items: []
      },
      editTeacherSearchKeyword: '',
      
      snackbar: {
        show: false,
        text: ''
      },

      filters: {
        classCode: '',
        teacherId: '',
        examSessionCode: '',
        paymentFeeStatus: '',
      },
      activeFilters: {
        classCode: '',
        teacherId: '',
        examSessionCode: '',
        paymentFeeStatus: '',
      },
      teacherOptions: [],
      examOptions: [],
      
      paymentTeacherStatusList: [
        { value: 'WAIT_PAID', text: 'Chờ thanh toán', color: '#a2212b' },
        { value: 'COMPLETE_PAID', text: 'Đã thanh toán', color: '#4caf50' },
        { value: 'CANCELED_PAID', text: 'Hủy thanh toán', color: '#f44336' },
      ],

      detailHeaders: [
        { text: 'STT', value: 'stt', align: 'center', width: '60px', sortable: false },
        { text: 'Họ tên giảng viên', value: 'teacherName', align: 'left', sortable: false },
        { text: 'Lớp giảng dạy', value: 'classCode', align: 'left', sortable: false },
        { text: 'Số tiết', value: 'period', align: 'center', sortable: false },
        { text: 'Số lượng sinh viên', value: 'numberOfStudent', align: 'center', sortable: false },
        { text: 'Định mức', value: 'unitPrice', align: 'right', sortable: false },
        { text: 'Loại lớp', value: 'classType', align: 'left', sortable: false },
        { text: 'Số tiền', value: 'totalAmount', align: 'right', sortable: false },
      ],

      itemList: [],
      totalRecords: 0,
      totalPages: 1,
      currentPage: 1,
      pageInput: 1,
      itemsPerPage: 50,

      tableHeaders: [
        { value: 'stt', text: 'STT', align: 'center', width: '60px', sortable: false },
        { value: 'examName', text: 'Đợt học lại', align: 'left', minWidth: '110px', sortable: false },
        { value: 'name', text: 'Tên đợt thanh toán', align: 'left', minWidth: '180px', sortable: false },
        { value: 'code', text: 'Mã đợt thanh toán', align: 'left', minWidth: '150px', sortable: false },
        { value: 'paymentDate', text: 'Ngày thanh toán', align: 'center', minWidth: '120px', sortable: false },
        { value: 'examSessionsCode', text: 'Mã lớp học lại', align: 'left', minWidth: '140px', sortable: false },
        { value: 'fileName', text: 'File thanh toán', align: 'center', minWidth: '90px', sortable: false },
        { value: 'totalFee', text: 'Tổng phí', align: 'right', minWidth: '120px', sortable: false },
        { value: 'totalTaxFee', text: 'Thuế thu nhập cá nhân', align: 'right', minWidth: '140px', sortable: false },
        { value: 'paymentFeeStatus', text: 'Trạng thái', align: 'center', minWidth: '140px', sortable: false },
        { value: 'isSendEmail', text: 'Trạng thái gửi mail', align: 'center', minWidth: '130px', sortable: false },
        {
            value: 'isExportedSummary',
            text: 'T.T xuất file tổng hợp',
            align: 'center',
            minWidth: '140px',
            sortable: false,
        },
        { value: 'actions', text: 'Chức năng', align: 'center', width: '90px', sortable: false },
      ],

      open: false,
      menuDate: false,
      teacherSearchKeyword: '',
      examSessionList: [],
      teacherList: [],
      params: {
        fileUrl: '',
        fileName: '',
        paymentDate: '',
        examSessionIds: [],
        channel: 'CMS'
      },
      teacherTableHeaders: [
        { text: 'STT', value: 'stt', align: 'center', width: '60px', sortable: false },
        { text: 'Họ tên giảng viên', value: 'teacherName', align: 'left', sortable: false },
        { text: 'Lớp giảng dạy', value: 'classCode', align: 'left', sortable: false },
        { text: 'Số tiết', value: 'period', align: 'center', sortable: false },
        { text: 'Số lượng sinh viên', value: 'numberOfStudent', align: 'center', sortable: false },
        { text: 'Định mức', value: 'unitPrice', align: 'right', sortable: false },
        { text: 'Loại lớp', value: 'classType', align: 'left', sortable: false },
        { text: 'Số tiền', value: 'totalAmount', align: 'right', sortable: false },
      ],
    }
  },
  watch: {
    open(newVal) {
      if (!newVal) {
        Object.assign(this.$data, this.$options.data());
        if (this.$refs.form) this.$refs.form.resetValidation();
      } else {
        this.getTrainingTypes(); // Gọi API 4: /decisionTeacherJobFee/rc/teacher-class
      }
    },
  },
  async mounted() {
    if (typeof navigator !== 'undefined') {
      this.isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }
    // Khi vừa vào trang, kích hoạt song song API 2 và API 3 để đổ dữ liệu vào các ô select Tìm kiếm
    await this.fetchCatalogs()
    // Kích hoạt API 1 để lấy danh sách bảng chính
    await this.loadData()
  },
  computed: {
    filteredTeacherList() {
      if (!this.teacherSearchKeyword) return this.teacherList
      const keyword = this.teacherSearchKeyword.toLowerCase().trim()
      return this.teacherList.filter(item => 
        (item.teacherName && item.teacherName.toLowerCase().includes(keyword)) ||
        (item.classCode && item.classCode.toLowerCase().includes(keyword))
      )
    },
    calculateTotalAmount() {
      return this.teacherList.reduce((sum, item) => sum + (Number(item.totalAmount) || 0), 0)
    },
    filteredEditTeacherList() {
      if (!this.editTeacherSearchKeyword) return this.formEditData.items || []
      const keyword = this.editTeacherSearchKeyword.toLowerCase().trim()
      return (this.formEditData.items || []).filter(item => 
        (item.teacherName && item.teacherName.toLowerCase().includes(keyword)) ||
        (item.classCode && item.classCode.toLowerCase().includes(keyword))
      )
    },
    calculateEditTotalAmount() {
      return (this.formEditData.items || []).reduce((sum, item) => sum + (Number(item.totalAmount || item.amount) || 0), 0)
    }
  },
  methods: {
    // Kết nối API 2 (/api/retakeCourse) và API 3 (/api/teacher/list?status=ACTIVE) cho phần ô chọn Tìm kiếm
    async fetchCatalogs() {
      try {
        const [teacherRes, examRes] = await Promise.all([
          feeService.getTeachers({ status: 'ACTIVE', channel: 'CMS' }).catch(() => null), // API 3: Danh sách giảng viên
          feeService.getRetakeCourses({ pageSize: 100, pageIndex: 1, channel: 'CMS' }).catch(() => null), // API 2: Danh sách đợt học lại
        ])

        // Đổ dữ liệu vào ô chọn Giảng viên ở bộ lọc
        const teacherData = teacherRes?.data !== undefined ? teacherRes.data : teacherRes
        const teacherListRaw = Array.isArray(teacherData) ? teacherData : (teacherData?.data || teacherData?.content || teacherData?.items || [])
        this.teacherOptions = Array.isArray(teacherListRaw) 
          ? teacherListRaw.map(item => ({ text: item.fullName || item.name, value: item.id }))
          : []

        // Đổ dữ liệu vào ô chọn Lớp học lại ở bộ lọc
        const examData = examRes?.data !== undefined ? examRes.data : examRes
        const examListRaw = Array.isArray(examData) ? examData : (examData?.data || examData?.content || examData?.items || [])
        this.examOptions = Array.isArray(examListRaw) 
          ? examListRaw.map(item => ({ text: item.code || item.name, value: item.code || item.id }))
          : []

      } catch (error) {
        console.error('Lỗi tải danh mục tìm kiếm:', error)
      }
    },

    // Kết nối API 1 (/api/decisionTeacherJobFee/byExam) để hiển thị danh sách bảng chính
    async loadData() {
      this.loading = true
      try {
        const params = {
          pageIndex: this.currentPage,
          pageSize: this.itemsPerPage,
          channel: 'CMS',
          classCode: this.activeFilters.classCode || '',
          teacherId: this.activeFilters.teacherId || '',
          examSessionCode: this.activeFilters.examSessionCode || '',
          paymentFeeStatus: this.activeFilters.paymentFeeStatus || '',
        }

        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === null || params[key] === undefined) {
            delete params[key]
          }
        })

        const res = await feeService.getList(params)
        const responseData = res?.data !== undefined ? res.data : res

        if (responseData) {
          const rootData = responseData.data !== undefined ? responseData.data : responseData
          
          this.itemList = Array.isArray(rootData) 
            ? rootData 
            : (rootData.content || rootData.items || rootData.list || rootData.rows || rootData.result || [])
            
          this.totalRecords = rootData.totalElements ?? rootData.totalRecords ?? rootData.total ?? responseData.totalElements ?? responseData.totalRecords ?? this.itemList.length
          this.totalPages = Math.max(1, Math.ceil(this.totalRecords / this.itemsPerPage))
        }
      } catch (error) {
        console.error('Lỗi tải danh sách thanh toán theo đợt:', error)
        this.itemList = []
        this.totalRecords = 0
        this.totalPages = 1
      } finally {
        this.loading = false
      }
    },

    formatExamSessions(sessions) {
      if (!sessions || !Array.isArray(sessions) || sessions.length === 0) return '-'
      return sessions.map(s => s.code).filter(Boolean).join(', ')
    },

    formatClassType(type) {
      if (type === 'NEW_CLASS') return 'Lớp mở'
      if (type === 'COMBINE_CLASS') return 'Lớp ghép'
      if (type === 'PROJECT_BASED_CLASS') return 'Đồ án môn học'
      return type || 'Khác'
    },

    formatSelectedDate(dateVal) {
      if (!dateVal) return
      const [year, month, day] = dateVal.split('-')
      this.params.paymentDate = `${day}/${month}/${year}`
    },

    getStatusText(status) {
      const found = this.paymentTeacherStatusList.find(s => s.value === status)
      return found ? found.text : 'Chờ thanh toán'
    },

    getStatusColor(status) {
      const found = this.paymentTeacherStatusList.find(s => s.value === status)
      return found ? found.color : '#1976D2'
    },

    formatMoney(val) {
      if (!val && val !== 0) return '0đ'
      return Number(val).toLocaleString('vi-VN') + 'đ'
    },

    handleSearch() {
      this.activeFilters = { ...this.filters }
      this.currentPage = 1
      this.pageInput = 1
      this.loadData()
    },

    refreshData() {
      this.filters = { classCode: '', teacherId: '', examSessionCode: '', paymentFeeStatus: '' }
      this.handleSearch()
    },

    changePage(page) {
      if (page < 1 || page > this.totalPages) return
      this.currentPage = page
      this.pageInput = page
      this.loadData()
    },

    goToPage() {
      const page = parseInt(this.pageInput)
      if (page >= 1 && page <= this.totalPages) {
        this.changePage(page)
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

    updateStatus(item, newStatus) {
      if (item.paymentFeeStatus === newStatus) return
      this.pendingItem = item
      this.pendingStatus = newStatus
      this.statusConfirmText = `Bạn có chắc chắn muốn đổi trạng thái từ ${this.getStatusLabel(item.paymentFeeStatus)} sang ${this.getStatusLabel(newStatus)} không?`
      this.dialogConfirmStatus = true
    },

    async confirmChangeStatus() {
      try {
        if (!this.pendingItem) return

        await feeService.updateStatus(this.pendingItem.id, {
          paymentFeeStatus: this.pendingStatus,
          channel: 'CMS'
        })

        if (this.$toast) {
          this.$toast.success('Cập nhật trạng thái thành công!')
        }
        
        this.dialogConfirmStatus = false
        this.loadData()
      } catch (error) {
        console.error('Lỗi cập nhật trạng thái:', error)
        if (this.$toast) {
          this.$toast.error(error?.message || 'Có lỗi xảy ra khi cập nhật trạng thái!')
        }
      }
    },

    getStatusLabel(status) {
      const map = {
        'WAIT_PAID': 'Chờ thanh toán',
        'COMPLETE_PAID': 'Đã thanh toán',
        'CANCELED_PAID': 'Hủy thanh toán'
      }
      return map[status] || status
    },

    async viewDetail(item) {
      try {
        const res = await feeService.getDetail(item.id)
        const rootData = res?.data !== undefined ? res.data : res
        this.selectedItem = rootData || item

        const rawList = rootData?.teacherFees || rootData?.teachers || rootData?.details || rootData?.items || []
        
        this.detailTeacherList = Array.isArray(rawList) ? rawList.map(t => ({
          teacherName: t.name || t.teacherName || '',
          classCode: t.classCode || '',
          period: t.period || 0,
          numberOfStudent: t.numberOfStudent || 0,
          unitPrice: t.unitPrice || 0,
          classType: t.classType || '',
          totalAmount: t.amount || t.totalAmount || 0
        })) : []

        this.dialogDetail = true
      } catch (error) {
        console.error('Lỗi lấy chi tiết:', error)
        this.detailTeacherList = []
      }
    },

    async updateRecord(item) {
      try {
        const resClass = await feeService.getTeacherClass({ paymentTeacherId: item.id, channel: 'CMS' })
        const rootData = resClass?.data !== undefined ? resClass.data : resClass

        let matchedSessions = []
        if (rootData && Array.isArray(rootData.data)) {
          matchedSessions = rootData.data
        } else if (Array.isArray(rootData)) {
          matchedSessions = rootData
        } else if (rootData?.examSessions && Array.isArray(rootData.examSessions)) {
          matchedSessions = rootData.examSessions
        } else if (item.examSessions && Array.isArray(item.examSessions)) {
          matchedSessions = item.examSessions
        }

        this.examSessionList = matchedSessions.map(s => ({
          id: s.id || s.classId || s.examSessionId,
          name: s.name || s.code || s.examName || s.classCode || s.examClass
        }))

        const defaultClassId = matchedSessions.length > 0 ? (matchedSessions[0].id || matchedSessions[0].classId || matchedSessions[0].examSessionId) : null

        this.formEditData = {
          id: item.id,
          paymentDate: this.formatDate(item.paymentDate),
          examSessionId: defaultClassId,
          fileName: item.fileName || '',
          fileUrl: item.fileUrl || '',
          items: []
        }

        if (defaultClassId) {
          await this.onEditClassSelected(defaultClassId)
        }

        this.dialogEdit = true
      } catch (error) {
        console.error('Lỗi tải dữ liệu cập nhật:', error)
      }
    },

    async onEditClassSelected(selectedId) {
      if (!selectedId) {
        this.formEditData.items = []
        return
      }

      try {
        const resList = await feeService.getListByClass({ ids: selectedId, channel: 'CMS' })
        const listRoot = resList?.data !== undefined ? resList.data : resList
        const listArr = Array.isArray(listRoot) ? listRoot : [listRoot]

        this.formEditData.items = listArr.filter(Boolean).map(t => ({
          id: t.id,
          teacherId: t.id || t.teacherId,
          teacherName: t.name || t.teacherName,
          classId: t.classId || selectedId,
          classCode: t.classCode,
          period: t.period || 0,
          numberOfStudent: t.numberOfStudent || 0,
          unitPrice: t.unitPrice || 0,
          classType: t.classType || '',
          totalAmount: t.amount || t.totalAmount || 0
        }))
      } catch (err) {
        console.error(`Lỗi gọi getListByClass cho ID ${selectedId}:`, err)
        this.formEditData.items = []
      }
    },

    handleUploadEdit(data) {
      if (data) {
        this.formEditData.fileName = data.name
      }
    },

    saveUpdate() {
      if (!this.formEditData.items || this.formEditData.items.length === 0) {
        this.snackbar = {
          show: true,
          text: 'Không có giảng viên nào cho các lớp đã chọn'
        }
        return
      }

      try {
        this.dialogEdit = false
        this.loadData()
      } catch (error) {
        console.error('Lỗi cập nhật đợt thanh toán:', error)
      }
    },

    deleteRecord(item) {
      this.itemToDelete = item
      this.dialogDelete = true
    },

    async confirmDelete() {
      try {
        if (this.itemToDelete?.id) {
          await feeService.deleteItem(this.itemToDelete.id)
        }
        this.dialogDelete = false
        this.loadData()
      } catch (error) {
        console.error('Lỗi xóa bản ghi:', error)
      }
    },

    openAddModal() {
      this.open = true
      const today = new Date()
      const day = String(today.getDate()).padStart(2, '0')
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const year = today.getFullYear()
      
      this.params = {
        fileUrl: '',
        fileName: '',
        paymentDate: `${day}/${month}/${year}`,
        examSessionIds: [],
        channel: 'CMS'
      }
      this.pickerDate = `${year}-${month}-${day}`
    },

    formatDate(dateStr) {
      if (!dateStr) return '-'
      const parts = dateStr.split(' ')[0]
      return parts
    },

    async handleUpload(data) {
      if (!data) return
      try {
        const formData = new FormData()
        formData.append("file", data)
        const res = feeService.uploadFile ? await feeService.uploadFile(formData) : null
        if (res && res.success) {
          this.params.fileUrl = res?.data?.url || ''
          this.params.fileName = res?.data?.name || data.name
        } else {
          this.params.fileName = data.name
        }
      } catch (error) {
        console.error("Lỗi upload file:", error)
        this.params.fileName = data.name
      }
    },

    // Kết nối API 4 (/api/decisionTeacherJobFee/rc/teacher-class) khi mở modal Thêm mới
    async getTrainingTypes() {
      try {
        const res = await feeService.getTeacherClass({ channel: 'CMS' })
        const rootData = res.data !== undefined ? res.data : res
        const list = Array.isArray(rootData) ? rootData : rootData.data || rootData.content || []
        this.examSessionList = list.map((item) => ({
          id: item?.id,
          name: item?.name || `${item?.code || ''}-${item?.classroom || ''}`,
        }))
      } catch (error) {
        console.error("Lỗi lấy danh mục lớp:", error)
      }
    },

    async onClassesSelected(selectedIds) {
      if (!selectedIds || selectedIds.length === 0) {
        this.teacherList = []
        return
      }

      this.teacherList = []
      for (const id of selectedIds) {
        try {
          const res = await feeService.getTeacherListByClass({ ids: id, channel: 'CMS' })
          const rootData = res.data !== undefined ? res.data : res
          const data = Array.isArray(rootData) ? rootData : [rootData]
          
          const mappedData = data.filter(Boolean).map(item => ({
            id: item.id,
            teacherId: item.id || item.teacherId,
            teacherName: item.name,
            classId: item.classId || id,
            classCode: item.classCode,
            period: item.period,
            numberOfStudent: item.numberOfStudent,
            unitPrice: item.unitPrice,
            classType: item.classType,
            fee: item.amount || item.totalAmount || 0,
            totalAmount: item.amount,
          }))

          this.teacherList.push(...mappedData)
        } catch (error) {
          console.error(`Lỗi tải giảng viên cho lớp ID ${id}:`, error)
        }
      }
    },

    async handleAdd() {
      if (this.$refs.form && !this.$refs.form.validate()) return;
      try {
        let formattedDate = this.params.paymentDate;
        if (formattedDate && formattedDate.includes('-')) {
          const [year, month, day] = formattedDate.split(" ")[0].split('-');
          formattedDate = `${day}/${month}/${year}`;
        }

        const sessionPayloads = this.teacherList.map(item => ({
          classId: item.classId,
          teacherId: item.teacherId,
          fee: item.fee
        }));

        const payload = {
          fileUrl: this.params.fileUrl || '',
          fileName: this.params.fileName || '',
          paymentDate: formattedDate,
          examSessionIds: sessionPayloads.length > 0 ? sessionPayloads : this.params.examSessionIds,
          channel: 'CMS'
        };

        if (feeService.createDecision) {
          await feeService.createDecision(payload);
        }

        this.open = false;
        this.loadData();
      } catch (error) {
        console.error("Error adding payment:", error);
      }
    },

    async exportExcelSummary(item) {
      try {
        const res = await feeService.exportExcelSummary(item.id)
        this.downloadFile(res, `Tong_hop_${item.id}.xlsx`)
      } catch (error) {
        console.error('Lỗi xuất file tổng hợp:', error)
      }
    },

    async exportExcelDetail(item) {
      try {
        const res = await feeService.exportExcelDetail(item.id)
        this.downloadFile(res, `Chi_tiet_${item.id}.xlsx`)
      } catch (error) {
        console.error('Lỗi xuất file chi tiết:', error)
      }
    },

    async exportExcelCompact(item) {
      try {
        const res = await feeService.exportExcelCompact(item.id)
        this.downloadFile(res, `Rut_gon_${item.id}.xlsx`)
      } catch (error) {
        console.error('Lỗi xuất file rút gọn:', error)
      }
    },

    sendEmailNotification(item) {
      this.selectedItemForMail = item
      this.dialogSendMail = true 
    },

    downloadFile(response, filename) {
      const url = window.URL.createObjectURL(new Blob([response.data || response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
    }
  },
}
</script>

<style scoped>
.text-red-bold {
  color: #A62229 !important;
}
.bg-white {
  background-color: #ffffff !important;
}
.filter-input >>> .v-input__slot {
  border-radius: 6px !important;
  min-height: 38px !important;
}
.btn-square-action {
  border-radius: 6px !important;
  height: 38px !important;
  min-width: 38px !important;
}
.cursor-pointer {
  cursor: pointer;
}

.sticky-filter {
  position: sticky;
  top: 0;
  z-index: 3;
  background-color: #ffffff;
}

.table-scroll-container {
  max-height: 600px;
  overflow-y: auto;
  position: relative;
}

.table-scroll-container >>> th {
  position: sticky !important;
  top: 0;
  z-index: 2;
  background-color: #f5f5f5 !important;
}

::v-deep .v-data-footer {
  display: none !important;
}

/* Tùy chỉnh màu sắc lịch Vuetify */
::v-deep .v-date-picker-header {
  background-color: #A2212B !important;
  color: white !important;
}
::v-deep .v-date-picker-header .v-btn {
  color: white !important;
}
::v-deep .v-date-picker-table .v-btn.v-btn--active {
  background-color: #A2212B !important;
  color: white !important;
}
</style>