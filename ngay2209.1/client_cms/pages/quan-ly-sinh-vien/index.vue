<template>
  <div class="quan-ly-sinh-vien-container pa-4">
    <!-- Header / Bộ lọc chính -->
    <v-row class="student-filter-bar align-center justify-space-between" no-gutters>
      <div class="d-flex align-center gap-2 flex-wrap" style="width: 100%;">
        <span class="text-h6 font-weight-bold">Danh sách sinh viên ({{ filteredStudents.length }})</span>
        <v-spacer></v-spacer>

        <!-- Ô Tìm kiếm -->
        <v-text-field
          v-model="filters.search"
          placeholder="Tìm kiếm"
          outlined
          dense
          hide-details
          class="bg-white rounded filter-item search-input custom-outlined-input"
          @keyup.enter="search"
        ></v-text-field>

        <!-- Lớp sinh viên -->
        <v-select
          v-model="filters.class"
          :items="['DH-BK-KTO1-K67', 'DH-BK-QTKD2.2-K66', 'DH-BK-CNTT1.1-K66']"
          placeholder="Lớp sinh viên"
          outlined
          dense
          hide-details
          clearable
          class="bg-white rounded filter-item select-md custom-outlined-input"
        ></v-select>

        <!-- Trạng thái -->
        <v-select
          v-model="filters.status"
          :items="[
            { text: 'Đang học tập', value: 'STUDYING' },
            { text: 'Bảo lưu', value: 'LEAVE_OF_ABSENCE' },
            { text: 'Đã nghỉ học', value: 'DROP_OUT_OF_SCHOOL' }
          ]"
          item-text="text"
          item-value="value"
          placeholder="Trạng thái"
          outlined
          dense
          hide-details
          clearable
          class="bg-white rounded filter-item select-md custom-outlined-input"
        ></v-select>

        <!-- Nút Filter Nâng cao -->
        <v-btn icon color="#a2212b" @click="openFilterDialog">
          <v-icon size="24">mdi-filter-variant-plus</v-icon>
        </v-btn>

        <!-- Nút Reset -->
        <v-btn icon color="#a2212b" @click="resetFilters">
          <v-icon size="24">mdi-refresh</v-icon>
        </v-btn>

        <!-- Nút Tìm kiếm -->
        <v-btn color="#a2212b" class="action-btn white--text elevation-0 font-weight-bold" @click="search">
          <v-icon size="24">mdi-magnify</v-icon>
        </v-btn>
      </div>
    </v-row>

    <!-- Bảng Dữ Liệu Sinh Viên -->
    <v-card flat class="student-table-card transparent overflow-hidden">
      <div class="table-responsive-wrapper">
        <v-data-table
          :headers="headers"
          :items="paginatedStudents"
          :page.sync="page"
          :items-per-page="itemsPerPage"
          :headers-length="headers.length"
          fixed-header
          height="100%"
          hide-default-footer
          class="custom-table"
        >
          <!-- STT -->
          <template #[`item.stt`]="{ index }">
            {{ (page - 1) * itemsPerPage + index + 1 }}
          </template>

          <!-- Thông tin chung -->
          <template #[`item.generalInfo`]="{ item }">
            <div class="py-2">
              <div class="font-weight-bold red--text text--darken-3 text-subtitle-2 mb-1">{{ item.fullName }}</div>
              <div class="text-caption text-grey-darken-1">Mã số sinh viên: <span class="font-weight-medium red--text text--darken-3">{{ item.studentCode }}</span></div>
              <div class="text-caption text-grey-darken-1">Email: <span class="red--text text--darken-3">{{ item.schoolEmail || item.email || '---' }}</span></div>
              <div class="text-caption text-grey-darken-1">Giới tính: {{ item.gender }}</div>
            </div>
          </template>

          <!-- Trạng thái -->
          <template #[`item.status`]="{ item }">
            <v-menu offset-y class="d-inline-block">
              <template #activator="{ on, attrs }">
                <div
                  v-bind="attrs"
                  v-on="on"
                  class="status-badge style-pointer d-flex align-center justify-space-between px-3 py-1"
                  :class="getStatusClass(item.status)"
                  style="cursor: pointer; width: 130px; height: 32px;"
                >
                  <span class="text-caption font-weight-bold text-no-wrap">
                    {{ getStatusText(item.status) }}
                  </span>
                  <v-icon size="18" class="ml-1" :color="item.status === 'LEAVE_OF_ABSENCE' ? 'black' : 'white'">
                    mdi-menu-down
                  </v-icon>
                </div>
              </template>

              <v-list dense class="py-1">
                <v-list-item @click="openConfirmStatusDialog(item, 'STUDYING')">
                  <v-list-item-title class="text-body-2">Đang học tập</v-list-item-title>
                </v-list-item>
                <v-list-item @click="openConfirmStatusDialog(item, 'LEAVE_OF_ABSENCE')">
                  <v-list-item-title class="text-body-2">Bảo lưu</v-list-item-title>
                </v-list-item>
                <v-list-item @click="openConfirmStatusDialog(item, 'DROP_OUT_OF_SCHOOL')">
                  <v-list-item-title class="text-body-2">Đã nghỉ học</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>

          <!-- GIỮ NGUYÊN HOÀN TOÀN TỪNG DÒNG THEO YÊU CẦU CỦA BẠN -->
          <template #[`item.actions`]="{ item }">
            <div class="d-flex align-center justify-center gap-1">
              <v-btn icon x-small color="cyan darken-1" @click="viewDetail(item)">
                <v-icon size="24" color="blue">mdi-eye</v-icon>
              </v-btn>

              <v-btn icon x-small color="teal" @click="checkHistory(item)">
                <v-icon size="24" color="green">mdi-table-account</v-icon>
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </div>

      <!-- Footer & Phân trang chính -->
      <div class="bottom-fixed-bar d-flex align-center justify-space-between flex-wrap gap-2 py-3 px-1 bg-white border-top table-footer">
      <v-btn
        color="#2e7d32"
        dark
        elevation="0"
        class="text-capitalize rounded px-4 font-weight-bold"
        @click="exportToExcel"
      >
        <v-icon left small>mdi-export</v-icon> XUẤT FILE EXCEL
      </v-btn>

      <div class="d-flex align-center gap-2">
        <!-- Ô Chọn Bản ghi -->
        <v-select
          v-model="itemsPerPage"
          :items="[10, 20, 50, 100]"
          label="Bản ghi"
          dense
          outlined
          hide-details
          :menu-props="{ attach: true, top: true, offsetY: true, zIndex: 999 }"
          class="pagination-input"
          style="width: 85px"
          @change="onItemsPerPageChange"
        ></v-select>

        <!-- Ô Nhập Trang -->
        <v-text-field
          v-model.number="pageInput"
          label="Trang"
          dense
          outlined
          hide-details
          class="pagination-input text-center"
          style="width: 65px"
          @keyup.enter="goToPage"
        ></v-text-field>

        <v-btn 
          color="#a2212b" 
          dark 
          small 
          class="text-capitalize px-3 rounded-sm elevation-0" 
          style="height: 36px;" 
          @click="goToPage"
        >
          Đi
        </v-btn>

        <v-btn icon small :disabled="page <= 1" @click="changePage(page - 1)">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        
        <v-btn
          v-for="p in visiblePages"
          :key="p"
          small
          :color="page === p ? '#a2212b' : ''"
          :dark="page === p"
          :outlined="page !== p"
          class="min-w-0 pa-0 rounded-sm elevation-0"
          style="width: 28px; height: 28px"
          @click="changePage(p)"
        >
          {{ p }}
        </v-btn>

        <v-btn icon small :disabled="page >= totalPages" @click="changePage(page + 1)">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
    </div>
    </v-card>

    <!-- ========================================================================= -->
    <!-- DIALOG 1: THÔNG TIN SINH VIÊN CHI TIẾT (GIỮ ĐẦY ĐỦ 100% CODE CŨ) -->
    <!-- ========================================================================= -->
    <v-dialog v-model="detailDialog" max-width="850px" scrollable>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="pa-3 text-subtitle-1 font-weight-bold white--text d-flex justify-space-between align-center" style="background-color: #a2212b;">
          <span>Thông tin sinh viên chi tiết</span>
          <v-btn icon small color="white" @click="detailDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-card-text class="pt-4 black--text custom-dialog-body" style="max-height: 80vh;">
          <!-- SECTION 1: THÔNG TIN CÁ NHÂN -->
          <div class="d-flex align-center mb-3">
            <div class="section-title-indicator mr-2"></div>
            <h3 class="text-subtitle-1 font-weight-bold" style="color: #000;">Thông tin cá nhân</h3>
          </div>

          <v-row dense class="text-body-2 mb-4">
            <v-col cols="12" md="6" class="py-1">
              <span class="grey--text text--darken-1">Họ tên:</span>
              <span class="font-weight-medium red--text text--darken-3 ml-1">{{ selectedStudent.fullName }}</span>
            </v-col>
            <v-col cols="12" md="6" class="py-1">
              <span class="grey--text text--darken-1">Giới tính:</span>
              <span class="font-weight-bold red--text text--darken-3 font-italic ml-1">{{ selectedStudent.gender }}</span>
            </v-col>

            <v-col cols="12" md="6" class="py-1">
              <span class="grey--text text--darken-1">Mã số sinh viên:</span>
              <span class="font-weight-bold red--text text--darken-3 ml-1">{{ selectedStudent.studentCode }}</span>
            </v-col>
            <v-col cols="12" md="6" class="py-1">
              <span class="grey--text text--darken-1">CCCD:</span>
              <span class="font-weight-medium red--text text--darken-3 ml-1">{{ selectedStudent.identityCard || '030303010695' }}</span>
            </v-col>

            <v-col cols="12" md="6" class="py-1">
              <span class="grey--text text--darken-1">Ngày sinh:</span>
              <span class="ml-1">{{ selectedStudent.dob || '' }}</span>
            </v-col>
            <v-col cols="12" md="6" class="py-1">
              <span class="grey--text text--darken-1">Email trường:</span>
              <span class="red--text text--darken-3 font-weight-medium ml-1">{{ selectedStudent.schoolEmail || selectedStudent.email }}</span>
            </v-col>

            <v-col cols="12" md="6" class="py-1">
              <span class="grey--text text--darken-1">Nơi sinh:</span>
              <span class="ml-1">{{ selectedStudent.pob || '' }}</span>
            </v-col>
            <v-col cols="12" md="6" class="py-1">
              <span class="grey--text text--darken-1">Email cá nhân:</span>
              <span class="ml-1">{{ selectedStudent.personalEmail || '' }}</span>
            </v-col>

            <v-col cols="12" md="6" class="py-1">
              <span class="grey--text text--darken-1">Trú quán:</span>
              <span class="ml-1">{{ selectedStudent.permanentAddress || '' }}</span>
            </v-col>
            <v-col cols="12" md="6" class="py-1">
              <span class="grey--text text--darken-1">Dân tộc:</span>
              <span class="ml-1">{{ selectedStudent.ethnicity || '' }}</span>
            </v-col>

            <v-col cols="12" md="6" class="py-1">
              <span class="grey--text text--darken-1">Địa chỉ liên hệ:</span>
              <span class="ml-1">{{ selectedStudent.contactAddress || '' }}</span>
            </v-col>
            <v-col cols="12" md="6" class="py-1 d-flex align-center">
              <span class="grey--text text--darken-1 mr-2">Trạng thái:</span>
              <div
                class="status-badge px-3 py-1 text-center"
                :class="getStatusClass(selectedStudent.status)"
              >
                <span class="text-caption font-weight-bold">{{ getStatusText(selectedStudent.status) }}</span>
              </div>
            </v-col>

            <v-col cols="12" md="6" class="py-1">
              <span class="grey--text text--darken-1">SĐT:</span>
              <span class="ml-1">{{ selectedStudent.phone || '' }}</span>
            </v-col>
          </v-row>

          <v-divider class="my-3"></v-divider>

          <!-- SECTION 2: THÔNG TIN ĐÀO TẠO DẠNG ACCORDION -->
          <div class="d-flex align-center mb-3">
            <div class="section-title-indicator mr-2"></div>
            <h3 class="text-subtitle-1 font-weight-bold" style="color: #000;">Thông tin đào tạo</h3>
          </div>

          <v-expansion-panels flat class="custom-panels">
            <!-- 1. Địa điểm đào tạo -->
            <v-expansion-panel>
              <v-expansion-panel-header class="pa-2 min-h-0 text-body-2">
                <div>
                  <span class="grey--text text--darken-1">Địa điểm đào tạo:</span>
                  <span class="red--text text--darken-3 font-weight-medium ml-2">{{ selectedStudent.location }}</span>
                </div>
              </v-expansion-panel-header>
              <v-expansion-panel-content class="grey lighten-5 pt-2 text-body-2">
                <v-row dense>
                  <v-col cols="6"><span class="grey--text text--darken-1">Mã địa điểm đào tạo:</span> <span class="ml-1">DHBK</span></v-col>
                  <v-col cols="6"><span class="grey--text text--darken-1">Địa chỉ:</span> <span class="ml-1">Hai Bà Trưng, Hà Nội</span></v-col>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>

            <!-- 2. Tên lớp -->
            <v-expansion-panel>
              <v-expansion-panel-header class="pa-2 min-h-0 text-body-2">
                <div>
                  <span class="grey--text text--darken-1">Tên lớp:</span>
                  <span class="red--text text--darken-3 font-weight-medium ml-2">{{ selectedStudent.className }}</span>
                </div>
              </v-expansion-panel-header>
              <v-expansion-panel-content class="grey lighten-5 pt-2 text-body-2">
                <div><span class="grey--text text--darken-1">Mã lớp:</span> <span class="ml-1">{{ selectedStudent.className }}</span></div>
              </v-expansion-panel-content>
            </v-expansion-panel>

            <!-- 3. Tên khóa học -->
            <v-expansion-panel>
              <v-expansion-panel-header class="pa-2 min-h-0 text-body-2">
                <div>
                  <span class="grey--text text--darken-1">Tên khóa học:</span>
                  <span class="red--text text--darken-3 font-weight-medium ml-2">{{ selectedStudent.course }}</span>
                </div>
              </v-expansion-panel-header>
              <v-expansion-panel-content class="grey lighten-5 pt-2 text-body-2">
                <v-row dense>
                  <v-col cols="6"><span class="grey--text text--darken-1">Mã khóa học:</span> <span class="ml-1">K67</span></v-col>
                  <v-col cols="6"><span class="grey--text text--darken-1">Thời gian:</span> <span class="ml-1">18/06/2024 - 29/06/2024</span></v-col>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>

            <!-- 4. Loại hình đào tạo -->
            <v-expansion-panel>
              <v-expansion-panel-header class="pa-2 min-h-0 text-body-2">
                <div>
                  <span class="grey--text text--darken-1">Loại hình đào tạo:</span>
                  <span class="red--text text--darken-3 font-weight-medium ml-2">{{ selectedStudent.durationCategory || 'Dài hạn' }}</span>
                </div>
              </v-expansion-panel-header>
              <v-expansion-panel-content class="grey lighten-5 pt-2 text-body-2">
                <div><span class="grey--text text--darken-1">Mã loại hình đào tạo:</span> <span class="ml-1">LONG_TERM</span></div>
              </v-expansion-panel-content>
            </v-expansion-panel>

            <!-- 5. Hình thức đào tạo -->
            <v-expansion-panel>
              <v-expansion-panel-header class="pa-2 min-h-0 text-body-2">
                <div>
                  <span class="grey--text text--darken-1">Hình thức đào tạo:</span>
                  <span class="red--text text--darken-3 font-weight-medium ml-2">{{ selectedStudent.trainingType }}</span>
                </div>
              </v-expansion-panel-header>
              <v-expansion-panel-content class="grey lighten-5 pt-2 text-body-2">
                <div><span class="grey--text text--darken-1">Mã hình thức đào tạo:</span> <span class="ml-1">study_and_works</span></div>
              </v-expansion-panel-content>
            </v-expansion-panel>

            <!-- 6. Ngành -->
            <v-expansion-panel>
              <v-expansion-panel-header class="pa-2 min-h-0 text-body-2">
                <div>
                  <span class="grey--text text--darken-1">Ngành:</span>
                  <span class="red--text text--darken-3 font-weight-medium ml-2">{{ selectedStudent.major }}</span>
                </div>
              </v-expansion-panel-header>
              <v-expansion-panel-content class="grey lighten-5 pt-2 text-body-2">
                <div><span class="grey--text text--darken-1">Mã ngành:</span> <span class="ml-1">7340301</span></div>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>

          <!-- Bằng cấp & Thời gian -->
          <v-row dense class="text-body-2 mt-2 px-2">
            <v-col cols="12" md="4" class="py-1">
              <span class="grey--text text--darken-1">Bằng cấp:</span>
              <span class="red--text text--darken-3 font-weight-medium ml-1">{{ selectedStudent.degree }}</span>
            </v-col>
            <v-col cols="12" md="4" class="py-1">
              <span class="grey--text text--darken-1">Thời gian bắt đầu:</span>
              <span class="ml-1">{{ selectedStudent.startDate || '' }}</span>
            </v-col>
            <v-col cols="12" md="4" class="py-1">
              <span class="grey--text text--darken-1">Thời gian kết thúc:</span>
              <span class="ml-1">{{ selectedStudent.endDate || '' }}</span>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="justify-end pb-3 pr-4 border-top">
          <v-btn outlined color="grey darken-2" class="px-4 text-capitalize" @click="detailDialog = false">
            Đóng X
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ========================================================================= -->
    <!-- DIALOG 2: LỊCH SỬ DỮ LIỆU SINH VIÊN (CẬP NHẬT TÊN CỘT "TÊN HỌC PHẦN" THEO ẢNH) -->
    <!-- ========================================================================= -->
    <v-dialog v-model="historyDialog" max-width="900px">
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="pa-3 text-h6 font-weight-bold white--text d-flex justify-space-between align-center" style="background-color: #a2212b;">
          <span>Lịch sử dữ liệu sinh viên</span>
          <v-btn icon small color="white" @click="historyDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-card-text class="pt-4 px-6">
          <!-- Bộ lọc góc phải -->
          <div class="d-flex align-center justify-end gap-2 mb-4 flex-wrap">
            <v-select
              v-model="historyFilters.subject"
              :items="['Kỹ thuật điện', 'Lập trình Java', 'Nhập môn ngành Điện', 'Đại số đại cương']"
              placeholder="Học phần"
              outlined
              dense
              hide-details
              clearable
              class="custom-outlined-input"
              style="max-width: 200px;"
            ></v-select>

            <v-select
              v-model="historyFilters.process"
              :items="['Đã hoàn thành', 'Đang học', 'Chưa tích lũy']"
              placeholder="Quy trình học tập"
              outlined
              dense
              hide-details
              clearable
              class="custom-outlined-input"
              style="max-width: 180px;"
            ></v-select>

            <v-btn icon color="#a2212b" class="border" @click="resetHistoryFilters">
              <v-icon size="20">mdi-refresh</v-icon>
            </v-btn>

            <v-btn color="#a2212b" min-width="40" width="40" height="38" class="white--text elevation-0 px-0" @click="filterHistory">
              <v-icon size="20">mdi-magnify</v-icon>
            </v-btn>
          </div>

          <!-- Bảng Lịch sử -->
          <v-data-table
            :headers="historyHeaders"
            :items="filteredHistoryLogs"
            hide-default-footer
            dense
            class="custom-table border rounded"
          >
            <template #no-data>
              <div class="text-center py-6 grey--text text--darken-1 font-weight-medium">
                Không có dữ liệu
              </div>
            </template>

            <template #[`item.stt`]="{ index }">
              {{ (historyPage - 1) * historyItemsPerPage + index + 1 }}
            </template>
          </v-data-table>

          <!-- Phân trang Popup Lịch sử (Chuẩn 100% theo ảnh) -->
          <div class="d-flex align-center justify-end mt-4 gap-2">
            <div class="d-flex align-center">
              <v-select
                v-model="historyItemsPerPage"
                :items="[10, 20, 50, 100, 200, 500]"
                label="Bản ghi"
                outlined
                dense
                hide-details
                style="width: 80px;"
                class="custom-outlined-input"
              ></v-select>
            </div>

            <div class="d-flex align-center ml-2">
              <v-text-field
                v-model="historyPageInput"
                label="Trang"
                outlined
                dense
                hide-details
                style="width: 60px;"
                class="text-center custom-outlined-input"
                @keyup.enter="goToHistoryPage"
              ></v-text-field>
            </div>

            <v-btn
              outlined
              small
              min-width="36"
              height="36"
              class="ml-1"
              :disabled="historyPage <= 1"
              @click="changeHistoryPage(historyPage - 1)"
            >
              <v-icon size="18">mdi-chevron-left</v-icon>
            </v-btn>

            <v-btn
              outlined
              small
              min-width="36"
              height="36"
              :disabled="historyPage >= totalHistoryPages"
              @click="changeHistoryPage(historyPage + 1)"
            >
              <v-icon size="18">mdi-chevron-right</v-icon>
            </v-btn>
          </div>
        </v-card-text>

        <v-card-actions class="justify-end pb-4 pr-6 border-top">
          <v-btn text class="text-capitalize font-weight-bold grey--text text--darken-3" @click="historyDialog = false">
            Đóng <v-icon right size="18">mdi-close</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIALOG 3: BỘ LỌC NÂNG CAO (GIỮ NGUYÊN) -->
    <v-dialog v-model="filterDialog" max-width="500px">
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="pa-3 text-subtitle-1 font-weight-bold white--text d-flex justify-space-between align-center" style="background-color: #a2212b;">
          <span>Bộ lọc nâng cao</span>
          <v-btn icon small color="white" @click="filterDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pt-4">
          <v-select
            v-model="tempDialogFilters.trainingType"
            :items="['Vừa làm vừa học', 'Chính quy']"
            label="Hình thức đào tạo"
            outlined
            dense
            clearable
            class="custom-outlined-input mb-2"
          ></v-select>
          <v-select
            v-model="tempDialogFilters.major"
            :items="['Kế toán', 'Quản trị kinh doanh', 'Công nghệ thông tin']"
            label="Ngành học"
            outlined
            dense
            clearable
            class="custom-outlined-input mb-2"
          ></v-select>
          <v-select
            v-model="tempDialogFilters.course"
            :items="['Khóa 66', 'Khóa 67', 'Khóa 68']"
            label="Khóa"
            outlined
            dense
            clearable
            class="custom-outlined-input mb-2"
          ></v-select>
          <v-select
            v-model="tempDialogFilters.gender"
            :items="['Nam', 'Nữ', 'Khác']"
            label="Giới tính"
            outlined
            dense
            clearable
            class="custom-outlined-input"
          ></v-select>
        </v-card-text>
        <v-card-actions class="justify-end pb-3 pr-4">
          <v-btn text color="grey darken-1" @click="filterDialog = false">Hủy</v-btn>
          <v-btn color="#a2212b" class="white--text elevation-0 px-4" @click="applyAdvancedFilters">Áp dụng</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIALOG 4: XÁC NHẬN THAY ĐỔI TRẠNG THÁI (GIỮ NGUYÊN) -->
    <v-dialog v-model="confirmStatusDialog" max-width="500px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="pa-3 text-subtitle-1 font-weight-bold white--text d-flex justify-space-between align-center" style="background-color: #a2212b;">
          <span>Xác nhận đổi trạng thái</span>
        </v-card-title>
        <v-card-text class="pt-4 text-body-1 black--text">
          Bạn có chắc chắn muốn đổi trạng thái
          từ <span class="font-weight-bold red--text">{{ getStatusText(pendingStatusChange.oldStatus) }}</span> 
          sang <span class="font-weight-bold red--text text--darken-2">{{ getStatusText(pendingStatusChange.newStatus) }}</span> không?
        </v-card-text>
        <v-card-actions class="justify-end pb-4 pr-4">
          <v-btn text color="grey darken-1" @click="confirmStatusDialog = false">Hủy</v-btn>
          <v-btn color="#a2212b" class="white--text elevation-0 px-4" @click="confirmStatusUpdate">Đồng ý</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Toast Notification (GIỮ NGUYÊN) -->
    <v-snackbar
      v-model="toast.show"
      :color="toast.color"
      timeout="3000"
      top
      right
      class="custom-toast"
    >
      <div class="d-flex align-center justify-space-between w-100">
        <span>{{ toast.message }}</span>
        <v-btn icon small color="white" class="ml-2" @click="toast.show = false">
          <v-icon size="18">mdi-close</v-icon>
        </v-btn>
      </div>
    </v-snackbar>
  </div>
</template>

<script>
import * as XLSX from 'xlsx'

export default {
  name: 'QuanLySinhVienPage',
  middleware: 'authenticated',
  data() {
    return {
      page: 1,
      pageInput: 1,
      itemsPerPage: 50,
      
      filters: { 
        search: '', 
        class: null, 
        status: null,
      },

      tempDialogFilters: {
        trainingType: null,
        location: null,
        major: null,
        course: null,
        gender: null
      },

      appliedFilters: {
        search: '', 
        class: null, 
        status: null,
        trainingType: null,
        location: null,
        major: null,
        course: null,
        gender: null
      },

      filterDialog: false,
      detailDialog: false,
      historyDialog: false,
      confirmStatusDialog: false,

      selectedStudent: {},
      pendingStatusChange: {
        student: null,
        oldStatus: '',
        newStatus: ''
      },

      toast: {
        show: false,
        message: '',
        color: '#4caf50'
      },

      // Dữ liệu Popup Lịch sử sinh viên
      historyPage: 1,
      historyPageInput: 1,
      historyItemsPerPage: 50,
      historyFilters: { subject: null, process: null },
      historyHeaders: [
        { text: 'STT', value: 'stt', sortable: false, width: '60px', align: 'center' },
        { text: 'Tên học phần', value: 'subjectName', sortable: false },
        { text: 'Mã học phần', value: 'subjectCode', sortable: false },
        { text: 'Quy trình học tập', value: 'process', sortable: false },
        { text: 'Thời gian hoàn thành', value: 'completedAt', sortable: false },
      ],
      historyLogs: [], 

      headers: [
        { text: 'STT', value: 'stt', sortable: false, width: '50px' },
        { text: 'Thông tin chung', value: 'generalInfo', sortable: false, width: '280px' },
        { text: 'Khóa', value: 'course', sortable: false, width: '80px' },
        { text: 'Lớp', value: 'className', sortable: false, width: '130px'},
        { text: 'Hình thức đào tạo', value: 'trainingType', sortable: false, width: '120px' },
        { text: 'Bằng cấp', value: 'degree', sortable: false, width: '90px' },
        { text: 'Địa điểm đào tạo', value: 'location', sortable: false, width: '160px' },
        { text: 'Thời gian bắt đầu', value: 'startDate', sortable: false, width: '100px'},
        { text: 'Thời gian kết thúc', value: 'endDate', sortable: false, width: '100px' },
        { text: 'Trạng thái', value: 'status', sortable: false, width: '143px' },
        { text: 'Chức năng', value: 'actions', sortable: false, align: 'center', width: '80px' },
      ],
      students: [
        { 
          id: 1, 
          fullName: 'Phan Thị Phương', 
          studentCode: '20210452P', 
          schoolEmail: 'Phuong.PT210452P@sis.hust.edu.vn', 
          personalEmail: '',
          gender: 'Khác', 
          identityCard: '030303010695',
          dob: '', pob: '', permanentAddress: '', ethnicity: '', contactAddress: '', phone: '',
          course: 'Khóa 67', 
          className: 'DH-BK-KTO1-K67', 
          durationCategory: 'Dài hạn',
          trainingType: 'Vừa làm vừa học', 
          degree: 'Cử nhân', 
          location: 'Đại học Bách khoa Hà Nội', 
          startDate: '', 
          endDate: '', 
          status: 'STUDYING', 
          major: 'Kế toán' 
        },
        { id: 2, fullName: 'Vũ Phương Linh', studentCode: '20210344P', schoolEmail: 'Linh.VP210344P@sis.hust.edu.vn', gender: 'Khác', course: 'Khóa 66', className: 'DH-BK-QTKD2.2-K66', trainingType: 'Vừa làm vừa học', degree: 'Cử nhân', location: 'Đại học Bách khoa Hà Nội', status: 'STUDYING', major: 'Quản trị kinh doanh' },
        { id: 3, fullName: 'Trịnh Thanh Tâm', studentCode: '20210377P', schoolEmail: 'Tam.TT210377P@sis.hust.edu.vn', gender: 'Khác', course: 'Khóa 66', className: 'DH-BK-QTKD2.2-K66', trainingType: 'Vừa làm vừa học', degree: 'Cử nhân', location: 'Đại học Bách khoa Hà Nội', status: 'STUDYING', major: 'Quản trị kinh doanh' },
        { id: 4, fullName: 'Nguyễn Khánh An', studentCode: '20210105P', schoolEmail: 'An.NK210105P@sis.hust.edu.vn', gender: 'Khác', course: 'Khóa 66', className: 'DH-BK-CNTT1.1-K66', trainingType: 'Vừa làm vừa học', degree: 'Cử nhân', location: 'Đại học Bách khoa Hà Nội', status: 'STUDYING', major: 'Công nghệ thông tin' },
        { id: 5, fullName: 'Nguyễn Linh Anh', studentCode: '20210108P', schoolEmail: '', gender: 'Khác', course: 'Khóa 66', className: 'DH-BK-CNTT1.1-K66', trainingType: 'Vừa làm vừa học', degree: 'Cử nhân', location: 'Đại học Bách khoa Hà Nội', status: 'STUDYING', major: 'Công nghệ thông tin' },
        { id: 2, fullName: 'Vũ Phương Linh', studentCode: '20210344P', schoolEmail: 'Linh.VP210344P@sis.hust.edu.vn', gender: 'Khác', course: 'Khóa 66', className: 'DH-BK-QTKD2.2-K66', trainingType: 'Vừa làm vừa học', degree: 'Cử nhân', location: 'Đại học Bách khoa Hà Nội', status: 'STUDYING', major: 'Quản trị kinh doanh' },
        { id: 3, fullName: 'Trịnh Thanh Tâm', studentCode: '20210377P', schoolEmail: 'Tam.TT210377P@sis.hust.edu.vn', gender: 'Khác', course: 'Khóa 66', className: 'DH-BK-QTKD2.2-K66', trainingType: 'Vừa làm vừa học', degree: 'Cử nhân', location: 'Đại học Bách khoa Hà Nội', status: 'STUDYING', major: 'Quản trị kinh doanh' },
        { id: 4, fullName: 'Nguyễn Khánh An', studentCode: '20210105P', schoolEmail: 'An.NK210105P@sis.hust.edu.vn', gender: 'Khác', course: 'Khóa 66', className: 'DH-BK-CNTT1.1-K66', trainingType: 'Vừa làm vừa học', degree: 'Cử nhân', location: 'Đại học Bách khoa Hà Nội', status: 'STUDYING', major: 'Công nghệ thông tin' },
        { id: 5, fullName: 'Nguyễn Linh Anh', studentCode: '20210108P', schoolEmail: '', gender: 'Khác', course: 'Khóa 66', className: 'DH-BK-CNTT1.1-K66', trainingType: 'Vừa làm vừa học', degree: 'Cử nhân', location: 'Đại học Bách khoa Hà Nội', status: 'STUDYING', major: 'Công nghệ thông tin' },
        { id: 2, fullName: 'Vũ Phương Linh', studentCode: '20210344P', schoolEmail: 'Linh.VP210344P@sis.hust.edu.vn', gender: 'Khác', course: 'Khóa 66', className: 'DH-BK-QTKD2.2-K66', trainingType: 'Vừa làm vừa học', degree: 'Cử nhân', location: 'Đại học Bách khoa Hà Nội', status: 'STUDYING', major: 'Quản trị kinh doanh' },
        { id: 3, fullName: 'Trịnh Thanh Tâm', studentCode: '20210377P', schoolEmail: 'Tam.TT210377P@sis.hust.edu.vn', gender: 'Khác', course: 'Khóa 66', className: 'DH-BK-QTKD2.2-K66', trainingType: 'Vừa làm vừa học', degree: 'Cử nhân', location: 'Đại học Bách khoa Hà Nội', status: 'STUDYING', major: 'Quản trị kinh doanh' },
        { id: 4, fullName: 'Nguyễn Khánh An', studentCode: '20210105P', schoolEmail: 'An.NK210105P@sis.hust.edu.vn', gender: 'Khác', course: 'Khóa 66', className: 'DH-BK-CNTT1.1-K66', trainingType: 'Vừa làm vừa học', degree: 'Cử nhân', location: 'Đại học Bách khoa Hà Nội', status: 'STUDYING', major: 'Công nghệ thông tin' },
        { id: 5, fullName: 'Nguyễn Linh Anh', studentCode: '20210108P', schoolEmail: '', gender: 'Khác', course: 'Khóa 66', className: 'DH-BK-CNTT1.1-K66', trainingType: 'Vừa làm vừa học', degree: 'Cử nhân', location: 'Đại học Bách khoa Hà Nội', status: 'STUDYING', major: 'Công nghệ thông tin' }
      ],
    }
  },
  computed: {
    filteredStudents() {
      return this.students.filter(s => {
        const matchSearch = !this.appliedFilters.search || 
          s.fullName.toLowerCase().includes(this.appliedFilters.search.toLowerCase()) || 
          s.studentCode.toLowerCase().includes(this.appliedFilters.search.toLowerCase())
          
        const matchClass = !this.appliedFilters.class || s.className === this.appliedFilters.class
        const matchStatus = !this.appliedFilters.status || s.status === this.appliedFilters.status
        const matchTrainingType = !this.appliedFilters.trainingType || s.trainingType === this.appliedFilters.trainingType
        const matchLocation = !this.appliedFilters.location || s.location === this.appliedFilters.location
        const matchMajor = !this.appliedFilters.major || s.major === this.appliedFilters.major
        const matchCourse = !this.appliedFilters.course || s.course === this.appliedFilters.course
        const matchGender = !this.appliedFilters.gender || s.gender === this.appliedFilters.gender

        return matchSearch && matchClass && matchStatus && matchTrainingType && matchLocation && matchMajor && matchCourse && matchGender
      })
    },
    filteredHistoryLogs() {
      return this.historyLogs.filter(log => {
        const matchSubject = !this.historyFilters.subject || log.subjectName === this.historyFilters.subject
        const matchProcess = !this.historyFilters.process || log.process === this.historyFilters.process
        return matchSubject && matchProcess
      })
    },
    paginatedStudents() {
      const start = (this.page - 1) * this.itemsPerPage
      return this.filteredStudents.slice(start, start + this.itemsPerPage)
    },
    totalPages() {
      const total = Math.ceil(this.filteredStudents.length / this.itemsPerPage)
      return total > 0 ? total : 1
    },
    visiblePages() {
      const pages = []
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i)
      }
      return pages
    },
    totalHistoryPages() {
      return Math.ceil(this.filteredHistoryLogs.length / this.historyItemsPerPage) || 1
    }
  },
  mounted() {
    if (this.$store) {
      this.$store.commit('SET_PAGE_TITLE', 'Quản lý sinh viên')
    }
  },
  methods: {
    getStatusText(status) {
      const statusMap = {
        STUDYING: 'Đang học tập',
        LEAVE_OF_ABSENCE: 'Bảo lưu',
        DROP_OUT_OF_SCHOOL: 'Đã nghỉ học'
      }
      return statusMap[status] || status
    },

    getStatusClass(status) {
      switch (status) {
        case 'STUDYING':
          return 'status-studying'
        case 'LEAVE_OF_ABSENCE':
          return 'status-leave'
        case 'DROP_OUT_OF_SCHOOL':
          return 'status-dropout'
        default:
          return 'status-unknown'
      }
    },

    search() {
      this.appliedFilters = {
        ...this.appliedFilters,
        ...this.filters,
        ...this.tempDialogFilters
      }
      this.page = 1
      this.pageInput = 1
    },

    openFilterDialog() {
      this.tempDialogFilters = {
        trainingType: this.appliedFilters.trainingType,
        location: this.appliedFilters.location,
        major: this.appliedFilters.major,
        course: this.appliedFilters.course,
        gender: this.appliedFilters.gender
      }
      this.filterDialog = true
    },

    applyAdvancedFilters() {
      this.search()
      this.filterDialog = false
    },

    resetFilters() {
      this.filters = { search: '', class: null, status: null }
      this.tempDialogFilters = { trainingType: null, location: null, major: null, course: null, gender: null }
      this.appliedFilters = { search: '', class: null, status: null, trainingType: null, location: null, major: null, course: null, gender: null }
      this.page = 1
      this.pageInput = 1
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

    viewDetail(item) {
      this.selectedStudent = { ...item }
      this.detailDialog = true
    },

    checkHistory(item) {
      this.selectedStudent = { ...item }
      this.historyDialog = true
    },

    filterHistory() {},

    resetHistoryFilters() {
      this.historyFilters = { subject: null, process: null }
    },

    changeHistoryPage(p) {
      if (p >= 1 && p <= this.totalHistoryPages) {
        this.historyPage = p
        this.historyPageInput = p
      }
    },

    goToHistoryPage() {
      const target = parseInt(this.historyPageInput) || 1
      this.historyPage = Math.min(Math.max(target, 1), this.totalHistoryPages)
      this.historyPageInput = this.historyPage
    },

    openConfirmStatusDialog(item, newStatus) {
      if (item.status === newStatus) return
      this.pendingStatusChange = {
        student: item,
        oldStatus: item.status,
        newStatus
      }
      this.confirmStatusDialog = true
    },

    confirmStatusUpdate() {
      if (this.pendingStatusChange.student) {
        const student = this.pendingStatusChange.student
        student.status = this.pendingStatusChange.newStatus
        this.confirmStatusDialog = false
        this.showToast('Cập nhật trạng thái thành công', '#4caf50')
      }
    },

    exportToExcel() {
      const dataToExport = this.filteredStudents.map((item, index) => ({
        'STT': index + 1,
        'Họ và Tên': item.fullName,
        'Mã Sinh Viên': item.studentCode,
        'Email': item.schoolEmail || item.email || '---',
        'Giới tính': item.gender || '---',
        'Khóa': item.course || '---',
        'Lớp': item.className || '---',
        'Hình thức đào tạo': item.trainingType || '---',
        'Ngành': item.major || '---',
        'Bằng cấp': item.degree || '---',
        'Địa điểm đào tạo': item.location || '---',
        'Trạng thái': this.getStatusText(item.status),
      }))

      if (dataToExport.length === 0) {
        this.showToast('Không có dữ liệu để xuất file!', '#f44336')
        return
      }

      const worksheet = XLSX.utils.json_to_sheet(dataToExport)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách sinh viên')
      XLSX.writeFile(workbook, `danh_sach_sinh_vien.xlsx`)
    },

    showToast(message, color) {
      this.toast.message = message
      this.toast.color = color
      this.toast.show = true
    }
  }
}
</script>

<style scoped>
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }

/* 1. THANH BỘ LỌC MAIN */
.filter-item { flex-grow: 1; flex-shrink: 1; }
.search-input { min-width: 150px; max-width: 200px; }
.select-md { min-width: 140px; max-width: 180px; }
.action-btn { height: 40px !important; min-height: 40px !important; }

.custom-outlined-input >>> .v-input__control { min-height: 38px !important; }
.custom-outlined-input >>> fieldset { border-color: #ccc !important; border-radius: 4px !important; }
.custom-outlined-input.v-input--is-focused >>> fieldset { border-color: #a2212b !important; border-width: 1px !important; }

/* 2. STYLE TIÊU ĐỀ SECTION DIALOG DETAIL (Thanh đỏ bên trái) */
.section-title-indicator {
  width: 4px;
  height: 18px;
  background-color: #a2212b;
  border-radius: 2px;
}

/* 3. BẢNG DỮ LIỆU */
.table-responsive-wrapper {
  width: 100%;
  overflow-x: auto;
}

.custom-table {
  min-width: 1000px !important;
  background-color: transparent !important;
}

.custom-table >>> th {
  background-color: #f8f9fa !important;
  font-weight: bold !important;
  color: #333 !important;
  white-space: nowrap !important;
}

/* 4. EXPANSION PANELS (ACCORDION KHÔNG BỌC BORDER NGOÀI TRONG VIDEO) */
.custom-panels >>> .v-expansion-panel::before {
  box-shadow: none !important;
}

.custom-panels >>> .v-expansion-panel-header {
  border-bottom: 1px solid #f0f0f0;
}

/* 5. MÀU TRẠNG THÁI */
.status-badge {
  transition: opacity 0.2s ease-in-out;
  user-select: none;
  border-radius: 16px !important;
  display: inline-flex;
  align-items: center;
}

.status-studying {
  background-color: #a2212b !important;
  color: #ffffff !important;
}

.status-leave {
  background-color: #fbc02d !important;
  color: #000000 !important;
}

.status-dropout {
  background-color: #616161 !important;
  color: #ffffff !important;
}

.status-unknown {
  background-color: #e0e0e0 !important;
  color: #424242 !important;
}

.border-top {
  border-top: 1px solid #e0e0e0;
}

.table-wrapper {
  display: flex;
  flex-direction: column;
  height: 600px;
}

.table-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
}

.table-footer {
  flex-shrink: 0;
  background: #fff;
  padding: 12px 16px;
  border-top: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
/* Khung trang chiếm chiều cao màn hình, tránh thanh cố định che nội dung */
.quan-ly-sinh-vien-container {
  height: 100vh;
  height: 100dvh;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  padding-bottom: 88px !important;
}

/* Thanh tìm kiếm/bộ lọc luôn nằm trên cùng */
.student-filter-bar {
  position: sticky;
  top: 0;
  z-index: 30;
  flex: 0 0 auto;
  width: 100%;
  padding: 8px 0;
  background: #fff;
}

/* Khu vực bảng co giãn, phần dữ liệu cuộn bên trong */
.student-table-card {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden !important;
}

.table-responsive-wrapper {
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
}

/* Bảng có thể cuộn ngang trên màn hình nhỏ */
.custom-table {
  min-width: 1000px !important;
  height: 100%;
  background-color: transparent !important;
}

/* Vuetify fixed-header: giữ tiêu đề bảng và cột STT hiển thị */
.custom-table >>> .v-data-table__wrapper {
  height: 100%;
  overflow-y: auto !important;
  overflow-x: auto !important;
}

.custom-table >>> thead th {
  position: sticky;
  top: 0;
  z-index: 5;
  background-color: #f8f9fa !important;
  font-weight: bold !important;
  color: #333 !important;
  white-space: nowrap !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

/* Thanh Excel + phân trang luôn cố định ở đáy cửa sổ */
.table-footer {
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
  flex-shrink: 0;
  min-height: 72px;
  background: #fff !important;
  padding: 12px 16px !important;
  border-top: 1px solid #ddd;
  box-shadow: 0 -3px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
}

/* Trên điện thoại, cho phép thanh chân trang xuống dòng và cuộn ngang */
@media (max-width: 600px) {
  .quan-ly-sinh-vien-container {
    padding-left: 8px !important;
    padding-right: 8px !important;
    padding-bottom: 120px !important;
  }

  .table-footer {
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px !important;
  }

  .table-footer > .d-flex {
    flex-wrap: wrap;
  }
}
</style>