<template>
  <div class="registered-students-page pa-4 bg-white">
    <input
      ref="fileImportInput"
      type="file"
      accept=".xlsx, .xls"
      class="d-none"
      @change="handleImportExcel"
    />

    <!-- TIÊU ĐỀ BẢNG -->
    <div class="d-flex align-center mb-3">
      <span class="text-h6 font-weight-bold text-red-bold">
        Danh sách sinh viên đăng ký học lại ({{ totalItems }})
      </span>
    </div>

    <!-- KHU VỰC BỘ LỌC (SEARCH & FILTERS) -->
    <div class="filter-section mb-4">
      <!-- HÀNG LỌC 1 -->
      <v-row dense class="mb-1">
        <v-col cols="12" sm="4" md="2">
          <v-text-field
            v-model="filters.keyword"
            placeholder="Thông tin sinh viên"
            outlined
            dense
            hide-details
            clearable
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="4" md="2">
          <v-select
            v-model="filters.major"
            :items="majorOptions"
            placeholder="Ngành"
            outlined
            dense
            hide-details
            clearable
          ></v-select>
        </v-col>
        <v-col cols="12" sm="4" md="2">
          <v-select
            v-model="filters.studentClass"
            :items="classOptions"
            placeholder="Lớp sinh viên"
            outlined
            dense
            hide-details
            clearable
          ></v-select>
        </v-col>
        <v-col cols="12" sm="4" md="2">
          <v-select
            v-model="filters.session"
            :items="sessionOptions"
            placeholder="Kỳ đăng ký học lại"
            outlined
            dense
            hide-details
            clearable
          ></v-select>
        </v-col>
        <v-col cols="12" sm="4" md="2">
          <v-select
            v-model="filters.retakeClassCode"
            :items="retakeClassOptions"
            placeholder="Mã lớp học lại"
            outlined
            dense
            hide-details
            clearable
          ></v-select>
        </v-col>
        <v-col cols="12" sm="4" md="2">
          <v-select
            v-model="filters.subjectCode"
            :items="subjectOptions"
            placeholder="Mã học phần"
            outlined
            dense
            hide-details
            clearable
          ></v-select>
        </v-col>
      </v-row>

      <!-- HÀNG LỌC 2 & CỤM NÚT THAO TÁC -->
      <v-row dense align="center">
        <v-col cols="12" sm="6" md="2.4" style="flex: 0 0 20%; max-width: 20%;">
          <v-select
            v-model="filters.tuitionStatus"
            :items="['Đã trả học phí', 'Chưa trả học phí']"
            placeholder="Trạng thái trả học phí"
            outlined
            dense
            hide-details
            clearable
          ></v-select>
        </v-col>
        <v-col cols="12" sm="6" md="2.4" style="flex: 0 0 20%; max-width: 20%;">
          <v-select
            v-model="filters.emailStatus"
            :items="['Đã gửi', 'Chưa gửi']"
            placeholder="Trạng thái gửi email"
            outlined
            dense
            hide-details
            clearable
          ></v-select>
        </v-col>
        <v-col cols="12" sm="6" md="2.4" style="flex: 0 0 20%; max-width: 20%;">
          <v-select
            v-model="filters.approvalStatus"
            :items="['Chờ xác nhận', 'Đã xác nhận', 'Từ chối','Đã duyệt lớp']"
            placeholder="Trạng thái duyệt đơn"
            outlined
            dense
            hide-details
            clearable
          ></v-select>
        </v-col>
        <v-col cols="12" sm="6" md="2.4" style="flex: 0 0 20%; max-width: 20%;">
          <v-select
            v-model="filters.bankStatus"
            :items="['Đã lập danh sách', 'Chưa lập danh sách']"
            placeholder="TT thêm DS ngân hàng"
            outlined
            dense
            hide-details
            clearable
          ></v-select>
        </v-col>

        <!-- CỤM NÚT ICON THAO TÁC BÊN PHẢI -->
      <div class="action-toolbar d-flex align-center gap-2">
          <!-- Nút Reload (Dạng icon tròn không nền) -->
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              icon
              text
              class="btn-reload"
              v-on="on"
              @click="onReload"
            >
              <v-icon size="24" color="#a61c1c">mdi-refresh</v-icon>
            </v-btn>
          </template>
          <span>Reset bộ lọc</span>
        </v-tooltip>

        <!-- Nút Tìm kiếm (Search) -->
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <button v-bind="attrs" class="action-btn btn-dark-red" v-on="on" @click="onSearch">
              <v-icon size="24" color="#ffffff">mdi-magnify</v-icon>
            </button>
          </template>
          <span>Tìm kiếm</span>
        </v-tooltip>

        <!-- Nút Thêm mới (Add) -->
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <button v-bind="attrs" class="action-btn btn-dark-red" v-on="on" @click="onAdd">
              <v-icon size="24" color="#ffffff">mdi-plus</v-icon>
            </button>
          </template>
          <span>Thêm mới</span>
        </v-tooltip>

        <!-- Nút gửi email thông báo được phép đóng học phí -->
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <button v-bind="attrs" class="action-btn btn-orange" v-on="on" @click="openConfirmApproveEmail">
              <v-icon size="24" color="#ffffff">mdi-email-plus-outline</v-icon>
            </button>
          </template>
          <span>Gửi email được phép đóng phí</span>
        </v-tooltip>

        <!-- Nút gửi email thông báo từ chối đăng ký -->
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <button v-bind="attrs" class="action-btn btn-red" v-on="on" @click="openConfirmRejectEmail">
              <v-icon size="24" color="#ffffff">mdi-email-remove-outline</v-icon>
            </button>
          </template>
          <span>Gửi email từ chối đăng ký</span>
        </v-tooltip>

        <div class="action-buttons-group d-flex align-center gap-2">
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <div v-bind="attrs" class="btn-badge-wrapper" v-on="on">
                <span v-if="isActionActive" class="badge-count">{{ selectedCount }}</span>
                <button
                  type="button"
                  class="action-btn btn-send"
                  :class="{ active: isActionActive }"
                  :disabled="!isActionActive"
                  @click="handleSendEmail"
                >
                  <v-icon size="22" :color="isActionActive ? '#ffffff' : '#8e8e8e'">mdi-send</v-icon>
                </button>
              </div>
            </template>
            <span>Gửi danh sách thu phí cho các sinh viên đã chọn</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <div v-bind="attrs" class="btn-badge-wrapper" v-on="on">
                <span v-if="isActionActive" class="badge-count">{{ selectedCount }}</span>
                <button
                  type="button"
                  class="action-btn btn-calendar"
                  :class="{ active: isActionActive }"
                  :disabled="!isActionActive"
                  @click="handleSchedule"
                >
                  <v-icon size="22" :color="isActionActive ? '#ffffff' : '#8e8e8e'">mdi-calendar-clock-outline</v-icon>
                </button>
              </div>
            </template>
            <span>Gia hạn nộp học phí cho các sinh viên đã chọn</span>
          </v-tooltip>
        </div>
      </div>
      </v-row>
    </div>

    <!-- BẢNG DỮ LIỆU CHÍNH -->
    <div class="table-container style-scrollbar overflow-x-auto">
      <table class="custom-data-table">
        <thead>
          <tr>
            <th class="text-center" style="width: 40px;">
              <v-checkbox
                v-model="selectAll"
                :disabled="items.length === 0"
                :indeterminate="selectedCount > 0 && !selectAll"
                hide-details
                dense
                class="ma-0 pa-0"
                @change="toggleSelectAll"
              ></v-checkbox>
            </th>
            <th class="text-center" style="width: 50px;">STT</th>
            <th class="text-left" style="min-width: 180px;">Thông tin sinh viên</th>
            <th class="text-left" style="min-width: 110px;">Kỳ đăng ký học lại</th>
            <th class="text-left" style="min-width: 180px;">Học phần đăng ký</th>
            <th class="text-left" style="min-width: 130px;">Mã đơn đăng ký</th>
            <th class="text-center" style="min-width: 130px;">Thời gian đăng ký</th>
            <th class="text-center" style="min-width: 130px;">Thời gian duyệt đơn</th>
            <th class="text-right" style="min-width: 110px;">Tổng học phí</th>
            <th class="text-center" style="min-width: 140px;">Trạng thái trả học phí</th>
            <th class="text-center" style="min-width: 140px;">Thời gian và CB gửi Thu phí</th>
            <th class="text-center" style="min-width: 140px;">TT thêm DS ngân hàng</th>
            <th class="text-center" style="min-width: 120px;">Trạng thái gửi email</th>
            <th class="text-center" style="min-width: 130px;">Trạng thái duyệt đơn</th>
            <th class="text-center" style="min-width: 110px;">Chức năng</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="15" class="text-center py-5">Đang tải dữ liệu...</td>
          </tr>
          <tr v-else-if="items.length === 0">
            <td colspan="15" class="text-center py-5 text-grey">Không có dữ liệu sinh viên đăng ký học lại</td>
          </tr>
          <tr v-for="(item, index) in paginatedItems" :key="item.id || index">
            <td class="text-center">
              <v-checkbox
                v-model="selectedIds"
                :value="item.id"
                hide-details
                dense
                class="ma-0 pa-0"
                @change="onItemSelectChange"
              ></v-checkbox>
            </td>
            <td class="text-center">{{ (page - 1) * pageSize + index + 1 }}</td>

            <!-- THÔNG TIN SINH VIÊN (TÊN, MÃ SV, LỚP) -->
            <td>
              <div class="font-weight-bold text-red-bold mb-1">Tên SV: {{ item.studentName }}</div>
              <div class="text-caption grey--text text--dark-2 mb-1">
                Mã số SV: <span class="font-weight-medium text-red-bold">{{ item.studentCode }}</span>
              </div>
              <div class="text-caption grey--text text--dark-2">
                Tên Lớp: <span class="font-weight-medium text-red-bold">{{ item.className }}</span>
              </div>
            </td>

            <td>{{ item.sessionCode }}</td>

            <!-- HỌC PHẦN ĐĂNG KÝ -->
            <td>
              <div class="text-body-2">1. {{ item.subjectName }} - {{ item.subjectCode }}</div>
            </td>

            <td>{{ item.registrationCode }}</td>

            <!-- THỜI GIAN ĐĂNG KÝ -->
            <td class="text-center">
              <div>{{ item.registerDate }}</div>
              <div class="text-caption grey--text">{{ item.registerTime }}</div>
            </td>

            <!-- THỜI GIAN DUYỆT ĐƠN -->
            <td class="text-center">
              {{ item.approvalDate || '-' }}
            </td>

            <!-- TỔNG HỌC PHÍ -->
            <td class="text-right font-weight-medium">
              {{ formatCurrency(item.totalFee) }}
            </td>

            <!-- TRẠNG THÁI TRẢ HỌC PHÍ -->
            <td class="text-center">
              <span class="status-badge" :style="getStatusStyle(item.tuitionStatus, 'feePaidStatusMap')">
                {{ getStatusLabel(item.tuitionStatus, 'feePaidStatusMap') }}
              </span>
            </td>

            <!-- THỜI GIAN VÀ CB GỬI THU PHÍ -->
            <td class="text-center">{{ item.collectorInfo || '-' }}</td>

            <!-- TT THÊM DS NGÂN HÀNG -->
            <td class="text-center">
              <span class="status-badge" :style="getStatusStyle(item.bankStatus, 'bankStatusMap')">
                {{ getStatusLabel(item.bankStatus, 'bankStatusMap') }}
              </span>
            </td>

            <!-- TRẠNG THÁI GỬI EMAIL -->
            <td class="text-center">
              <span class="status-badge" :style="getStatusStyle(item.emailStatus, 'sendMailStatusMap')">
                {{ getStatusLabel(item.emailStatus, 'sendMailStatusMap') }}
              </span>
            </td>

            <!-- TRẠNG THÁI DUYỆT ĐƠN -->
            <td class="text-center">
              <span class="status-badge" :style="getStatusStyle(item.approvalStatus, 'registerStudentStatusMap')">
                {{ getStatusLabel(item.approvalStatus, 'registerStudentStatusMap') }}
              </span>
            </td>

            <!-- CỘT CHỨC NĂNG -->
            <td class="text-center">
              <div class="d-flex align-center justify-center gap-1">
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      icon
                      text
                      small
                      class="row-action-btn"
                      v-on="on"
                      @click="openDetailModal(item)"
                    >
                      <v-icon size="20" color="#00bcd4">mdi-eye</v-icon>
                    </v-btn>
                  </template>
                  <span>Chi tiết</span>
                </v-tooltip>
                <v-tooltip v-if="canApprove(item)" bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      icon
                      text
                      small
                      class="row-action-btn"
                      v-on="on"
                      @click="openApproveModal(item)"
                    >
                      <v-icon size="20" color="#4caf50">mdi-check-circle</v-icon>
                    </v-btn>
                  </template>
                  <span>Xác nhận duyệt đơn</span>
                </v-tooltip>
                <v-tooltip v-if="canReject(item)" bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      icon
                      text
                      small
                      class="row-action-btn"
                      v-on="on"
                      @click="openStatusConfirm(item, 'REJECTED')"
                    >
                      <v-icon size="20" color="#f44336">mdi-close-circle</v-icon>
                    </v-btn>
                  </template>
                  <span>Từ chối duyệt đơn</span>
                </v-tooltip>
                <v-tooltip v-if="canSetPending(item)" bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      icon
                      text
                      small
                      class="row-action-btn"
                      v-on="on"
                      @click="openStatusConfirm(item, 'AWAITING_CONFIRMATION')"
                    >
                      <v-icon size="20" color="#ff9800">mdi-clock-outline</v-icon>
                    </v-btn>
                  </template>
                  <span>Chờ duyệt đơn</span>
                </v-tooltip>
                <v-tooltip v-if="canEdit(item)" bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      icon
                      text
                      small
                      class="row-action-btn"
                      v-on="on"
                      @click="openEditModal(item)"
                    >
                      <v-icon size="20" color="#ffb300">mdi-pencil</v-icon>
                    </v-btn>
                  </template>
                  <span>Cập nhật</span>
                </v-tooltip>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- HÀNG NÚT XUẤT / NHẬP FILE VÀ PHÂN TRANG -->
    <div class="table-footer d-flex flex-wrap align-center justify-space-between mt-4 gap-2">
      <!-- CỤM NÚT XUẤT EXCEL BÊN TRÁI -->
      <div class="d-flex flex-wrap gap-2">
        <v-btn
          color="#4CAF50"
          dark
          small
          elevation="0"
          class="text-none font-weight-medium rounded-sm"
          @click="exportRequiredFeeResult"
        >
          <v-icon left small>mdi-export</v-icon>
          XUẤT FILE KẾT QUẢ CẦN THU
        </v-btn>
        <v-btn
          color="#4CAF50"
          dark
          small
          elevation="0"
          class="text-none font-weight-medium rounded-sm"
          @click="exportUnpaidList"
        >
          <v-icon left small>mdi-export</v-icon>
          XUẤT FILE DANH SÁCH CHƯA TRẢ HỌC PHÍ
        </v-btn>
        <v-btn
          color="#4CAF50"
          dark
          small
          elevation="0"
          class="text-none font-weight-medium rounded-sm"
          @click="triggerImportFile"
        >
          <v-icon left small>mdi-microsoft-excel</v-icon>
          NHẬP FILE KẾT QUẢ ĐÃ THU
        </v-btn>
        <v-btn
          color="#4CAF50"
          dark
          small
          elevation="0"
          class="text-none font-weight-medium rounded-sm"
          @click="exportAuditList"
        >
          <v-icon left small>mdi-export</v-icon>
          XUẤT FILE RÀ SOÁT HỌC PHÍ
        </v-btn>
      </div>

      <!-- PHÂN TRANG BÊN PHẢI -->
      <div class="d-flex align-center gap-2">
        <div class="d-flex align-center gap-1 text-caption">
          <span>Bản ghi</span>
          <v-select
            v-model="pageSize"
            :items="[10, 20, 50, 100]"
            outlined
            dense
            hide-details
            class="page-size-select"
            @change="page = 1"
          ></v-select>
        </div>

        <div class="d-flex align-center gap-1 text-caption">
          <span>Trang</span>
          <v-text-field
            v-model="pageInput"
            outlined
            dense
            hide-details
            class="page-input-field text-center"
            @keyup.enter="goToPage"
          ></v-text-field>
          <v-btn color="#A62229" dark x-small class="go-btn" elevation="0" @click="goToPage">Đi</v-btn>
        </div>

        <v-pagination
          v-model="page"
          :length="totalPages"
          :total-visible="3"
          color="#A62229"
          dense
        ></v-pagination>
      </div>
    </div>

    <!-- MODAL THÊM SINH VIÊN PHẢI HỌC LẠI -->
    <RegisterRetakeCourseModal
      v-model="showAddModal"
      :students-list="mustRetakeStudentOptions"
      :registered-classes-list="items"
      @success="handleRegisterSuccess"
    />

    <v-dialog v-model="dialogDetail" max-width="900px" scrollable>
      <div class="custom-modal-card">
        <div class="modal-header-sticky">
          <h3 class="text-h6 font-weight-bold text-white mb-0">Thông tin đăng ký học lại</h3>
          <button class="btn-close-x" type="button" aria-label="Đóng" @click="dialogDetail = false">&times;</button>
        </div>

        <div class="modal-body-scrollable">
          <div class="section-title">Thông tin cá nhân</div>
          <v-row dense class="mb-3">
            <v-col cols="6"><strong>Họ tên:</strong> {{ detailData.studentName || '-' }}</v-col>
            <v-col cols="6"><strong>Mã SV:</strong> {{ detailData.studentCode || '-' }}</v-col>
            <v-col cols="12"><strong>Email trường:</strong> {{ detailData.email || '-' }}</v-col>
            <v-col cols="6"><strong>Khóa:</strong> {{ detailData.course || '-' }}</v-col>
            <v-col cols="6"><strong>Lớp:</strong> {{ detailData.className || '-' }}</v-col>
            <v-col cols="6"><strong>Ngành:</strong> {{ detailData.major || '-' }}</v-col>
            <v-col cols="6"><strong>Hình thức đào tạo:</strong> {{ detailData.trainingType || 'Vừa làm vừa học' }}</v-col>
          </v-row>

          <div class="section-title">Thông tin đăng ký</div>
          <v-row dense class="mb-3">
            <v-col cols="6"><strong>Mã đơn đăng ký:</strong> {{ detailData.registrationCode || '-' }}</v-col>
            <v-col cols="6"><strong>Đợt học lại:</strong> {{ detailData.sessionCode || '-' }}</v-col>
            <v-col cols="6">
              <strong>Thời gian đăng ký:</strong>
              {{ [detailData.registerDate, detailData.registerTime].filter(Boolean).join(' ') || '-' }}
            </v-col>
            <v-col cols="6">
              <strong>Trạng thái:</strong>
              <span class="status-badge" :style="getStatusStyle(detailData.registerStudentStatus || detailData.approvalStatus, 'registerStudentStatusMap')">
                {{ getStatusLabel(detailData.registerStudentStatus || detailData.approvalStatus, 'registerStudentStatusMap') }}
              </span>
            </v-col>
            <v-col cols="6">
              <strong>Trạng thái trả học phí:</strong>
              <span class="status-badge" :style="getStatusStyle(detailData.tuitionStatus, 'feePaidStatusMap')">
                {{ getStatusLabel(detailData.tuitionStatus, 'feePaidStatusMap') }}
              </span>
            </v-col>
            <v-col cols="6">
              <strong>Trạng thái gửi email:</strong>
              <span class="status-badge" :style="getStatusStyle(detailData.emailStatus, 'sendMailStatusMap')">
                {{ getStatusLabel(detailData.emailStatus, 'sendMailStatusMap') }}
              </span>
            </v-col>
            <v-col cols="6">
              <strong>Trạng thái lập danh sách:</strong>
              <span class="status-badge" :style="getStatusStyle(detailData.bankStatus, 'bankStatusMap')">
                {{ getStatusLabel(detailData.bankStatus, 'bankStatusMap') }}
              </span>
            </v-col>
          </v-row>

          <div class="section-title">Thông tin duyệt đơn</div>
          <v-row dense class="mb-3">
            <v-col cols="6"><strong>Người duyệt:</strong> {{ detailData.approvedBy || '-' }}</v-col>
            <v-col cols="6"><strong>Email người duyệt:</strong> {{ detailData.approverEmail || '-' }}</v-col>
            <v-col cols="6"><strong>Học phí:</strong> {{ formatCurrency(detailData.totalFee) }} VNĐ</v-col>
            <v-col cols="6"><strong>Sinh viên:</strong> <span class="text-red-bold">{{ detailData.studentName || '-' }}</span></v-col>
          </v-row>

          <div class="section-title">Danh sách học phần đăng ký ({{ detailSubjects.length }})</div>
          <div class="table-scroll-wrapper">
            <v-simple-table class="custom-table elevation-1">
              <thead>
                <tr>
                  <th class="text-center">STT</th>
                  <th>Mã học phần</th>
                  <th>Tên học phần</th>
                  <th>Mã giảng viên</th>
                  <th>Tên giảng viên</th>
                  <th>Mã lớp</th>
                  <th class="text-right">Định mức phí</th>
                  <th class="text-center">Số tín chỉ học phí</th>
                  <th class="text-center">Thu học phí SV</th>
                  <th class="text-center">Thanh toán giảng dạy</th>
                  <th class="text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(subject, index) in detailSubjects" :key="index">
                  <td class="text-center">{{ index + 1 }}</td>
                  <td>{{ subject.subjectCode || subject.maHocPhan || detailData.subjectCode || '-' }}</td>
                  <td>{{ subject.subjectName || subject.tenHocPhan || subject.name || detailData.subjectName || '-' }}</td>
                  <td>{{ subject.lecturerCode || subject.maGV || '-' }}</td>
                  <td>{{ subject.lecturerName || subject.tenGV || '-' }}</td>
                  <td>{{ subject.classCode || subject.maLop || '-' }}</td>
                  <td class="text-right">{{ formatCurrency(subject.feeRate || subject.dinhMucPhi) }}</td>
                  <td class="text-center">{{ subject.feeCredits || subject.credits || subject.soTinChi || '-' }}</td>
                  <td class="text-center">{{ subject.studentFeeCredits || subject.studentFeeCount || subject.thuHocPhiSV || '-' }}</td>
                  <td class="text-center">{{ subject.teachingPayment || subject.thanhToanGiangDay || '-' }}</td>
                  <td class="text-right">{{ formatCurrency(subject.totalAmount || subject.thanhTien || subject.fee) }}</td>
                </tr>
                <tr v-if="detailSubjects.length === 0">
                  <td colspan="11" class="text-center">Không có thông tin học phần</td>
                </tr>
              </tbody>
            </v-simple-table>
          </div>
          <div class="summary-footer">
            <div class="expiry-date">
              Thời hạn đóng học phí: <strong class="text-red-bold">{{ detailData.paymentDeadline || '-' }}</strong>
            </div>
            <div class="total-amount">
              Tổng số tín chỉ: <strong class="text-red-bold">{{ totalSubjectCredits }}</strong>
              <span class="summary-divider">|</span>
              Tổng tiền: <strong class="text-red-bold">{{ formatCurrency(totalSubjectAmount) }} VNĐ</strong>
            </div>
          </div>
        </div>

        <div class="modal-footer-sticky text-right">
          <v-btn outlined color="grey darken-1" @click="dialogDetail = false">Đóng X</v-btn>
        </div>
      </div>
    </v-dialog>

    <v-dialog v-model="dialogApprove" max-width="1100px" persistent>
      <div class="approve-modal-card">
        <div class="approve-modal-header">
          <h3 class="approve-modal-title">Xác nhận duyệt đơn</h3>
          <button class="approve-btn-close" type="button" aria-label="Đóng" @click="dialogApprove = false">&times;</button>
        </div>

        <div class="approve-modal-body">
          <p class="approve-confirm-text">
            Bạn có chắc chắn muốn chuyển từ trạng thái
            <strong class="text-status-warning">{{ getStatusLabel(approveItem && (approveItem.registerStudentStatus || approveItem.approvalStatus), 'registerStudentStatusMap') }}</strong>
            sang trạng thái <strong class="text-status-success">Đã xác nhận</strong> không?
          </p>

          <table class="approve-table">
            <thead>
              <tr>
                <th class="th-stt">STT</th>
                <th class="th-code">Mã học phần</th>
                <th class="th-name">Tên học phần</th>
                <th class="th-select">Lớp học</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in approveItems" :key="index">
                <td class="td-stt">{{ index + 1 }}</td>
                <td class="td-code">{{ item.subjectCode || item.maHocPhan || '-' }}</td>
                <td class="td-name">{{ item.subjectName || item.tenHocPhan || item.name || '-' }}</td>
                <td class="td-select">
                  <v-select
                    v-model="item.selectedClass"
                    :items="item.classList"
                    label="Chọn lớp học"
                    outlined
                    dense
                    hide-details
                    class="approve-select-box"
                  ></v-select>
                </td>
              </tr>
              <tr v-if="approveItems.length === 0">
                <td colspan="4" class="text-center">Không có học phần trong đơn</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="approve-modal-footer">
          <button class="btn-cancel-action" @click="dialogApprove = false">Đóng &times;</button>
          <button class="btn-confirm-action" @click="submitApprove">
            Xác nhận <v-icon size="18" class="ml-1">mdi-content-save-outline</v-icon>
          </button>
        </div>
      </div>
    </v-dialog>

    <v-dialog v-model="dialogEdit" max-width="850px" persistent>
      <div class="edit-modal-card">
        <div class="edit-modal-header">
          <h3 class="edit-modal-title">Cập nhật đăng ký học lại</h3>
          <button class="edit-btn-close" type="button" aria-label="Đóng" @click="dialogEdit = false">&times;</button>
        </div>

        <div class="edit-modal-body">
          <div class="edit-stepper">
            <div class="stepper-item" :class="{ active: editStep >= 1 }">
              <span class="stepper-icon">1</span>
              <span class="stepper-label">Thông tin cá nhân</span>
            </div>
            <div class="stepper-line"></div>
            <div class="stepper-item" :class="{ active: editStep === 2, 'disabled-step': editStep < 2 }">
              <span class="stepper-icon">2</span>
              <span class="stepper-label">Thông tin đăng ký</span>
            </div>
          </div>

          <div v-if="editStep === 1">
            <div class="select-student-box">
              <v-autocomplete
                v-model="selectedStudent"
                :items="studentOptions"
                item-text="name"
                item-value="id"
                :filter="filterStudent"
                label="Sinh viên"
                placeholder="Nhập Mã Số Sinh Viên"
                outlined
                dense
                clearable
                hide-details
                return-object
              ></v-autocomplete>
            </div>

            <div v-if="selectedStudent" class="student-info-section mt-4">
              <div class="info-header-title">Thông tin cá nhân</div>
              <div class="info-grid">
                <div><span>Họ tên:</span> <strong>{{ selectedStudent.name }}</strong></div>
                <div><span>Mã SV:</span> <strong class="text-red">{{ selectedStudent.code }}</strong></div>
                <div><span>Email trường:</span> <strong class="text-red">{{ selectedStudent.email || '-' }}</strong></div>
                <div><span>Khóa:</span> <strong class="text-red">{{ selectedStudent.course || '-' }}</strong></div>
                <div><span>Lớp:</span> <strong class="text-red">{{ selectedStudent.className || '-' }}</strong></div>
                <div><span>Ngành:</span> <strong class="text-red">{{ selectedStudent.major || '-' }}</strong></div>
              </div>
              <div class="text-right mt-4">
                <button class="btn-next-step" @click="editStep = 2">Tiếp tục</button>
              </div>
            </div>
            <div v-else class="text-right mt-4">
              <button class="btn-next-step disabled" disabled>Tiếp tục</button>
            </div>
          </div>

          <div v-else>
            <div class="edit-batch-select">
              <v-select
                v-model="editForm.batch"
                :items="editBatchOptions"
                label="Đợt học lại"
                outlined
                dense
                hide-details
              ></v-select>
            </div>

            <div class="d-flex align-center justify-space-between mb-2">
              <span class="font-weight-bold">Danh sách học phần ({{ editHocPhanList.length }})</span>
              <v-text-field
                v-model="searchKeyword"
                placeholder="Tìm kiếm"
                append-icon="mdi-magnify"
                outlined
                dense
                hide-details
                class="edit-search-field"
              ></v-text-field>
            </div>

            <div class="edit-table-scroll">
              <table class="edit-table">
                <thead>
                  <tr>
                    <th class="text-center">
                      <input
                        type="checkbox"
                        :checked="areAllVisibleEditCoursesSelected"
                        :indeterminate.prop="hasVisibleEditCourseSelection && !areAllVisibleEditCoursesSelected"
                        @change="toggleVisibleEditCourses($event.target.checked)"
                      />
                    </th>
                    <th>STT</th>
                    <th>Mã học phần</th>
                    <th>Tên học phần</th>
                    <th>Mã giảng viên</th>
                    <th>Tên giảng viên</th>
                    <th>Định mức</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="filteredEditHocPhanList.length === 0">
                    <td colspan="7" class="text-center text-grey py-4">Không có dữ liệu</td>
                  </tr>
                  <tr v-for="(course, index) in filteredEditHocPhanList" :key="course.key">
                    <td class="text-center"><input v-model="course.selected" type="checkbox" /></td>
                    <td>{{ index + 1 }}</td>
                    <td>{{ course.subjectCode || '-' }}</td>
                    <td>{{ course.subjectName || '-' }}</td>
                    <td>{{ course.lecturerCode || '-' }}</td>
                    <td>{{ course.lecturerName || '-' }}</td>
                    <td>{{ formatCurrency(course.feeRate) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="hasSelectedEditCourses" class="edit-summary-box mt-3">
              <div class="text-right font-weight-bold">Tổng tiền dự kiến: {{ formatCurrency(totalEditAmount) }} VNĐ</div>
              <p class="text-caption text-red-light mb-0">
                Hệ thống chỉ hiển thị số tiền dự kiến. Học phí chính thức sẽ được thông báo cụ thể qua email của sinh viên.
              </p>
            </div>

            <div class="mt-4">
              <button class="btn-edit-back" @click="editStep = 1">Quay lại</button>
            </div>
          </div>
        </div>

        <div class="edit-modal-footer">
          <button class="btn-edit-close" @click="dialogEdit = false">Đóng &times;</button>
          <button
            class="btn-footer-save"
            :class="{ active: editStep === 2 && hasSelectedEditCourses }"
            :disabled="!(editStep === 2 && hasSelectedEditCourses)"
            @click="onSaveEdit"
          >
            Lưu <v-icon size="16" class="ml-1">mdi-content-save-outline</v-icon>
          </button>
        </div>
      </div>
    </v-dialog>

    <v-dialog v-model="dialogConfirm" max-width="500px" persistent>
      <div class="confirm-modal-card">
        <div class="confirm-modal-header">
          <h3 class="confirm-modal-title">Xác nhận</h3>
          <button class="confirm-btn-close" type="button" aria-label="Đóng" @click="dialogConfirm = false">&times;</button>
        </div>

        <div class="confirm-modal-body">
          <p class="confirm-text">
            Bạn có chắc chắn muốn chuyển từ trạng thái
            <strong class="text-red-bold">{{ getStatusLabel(confirmItem && (confirmItem.registerStudentStatus || confirmItem.approvalStatus), 'registerStudentStatusMap') }}</strong>
            sang trạng thái <strong class="text-red-bold">{{ getStatusLabel(confirmTargetStatus, 'registerStudentStatusMap') }}</strong> không?
          </p>
          <div class="confirm-action-row">
            <button class="btn-confirm-cancel" @click="dialogConfirm = false">Đóng &times;</button>
            <button class="btn-confirm-submit" @click="onActionConfirm">Xác nhận</button>
          </div>
        </div>
      </div>
    </v-dialog>

    <v-dialog v-model="showConfirmEmailModal" max-width="550px" persistent>
      <v-card class="email-confirm-card">
        <div class="email-confirm-header">
          <h2 class="email-confirm-title">Xác nhận</h2>
          <button
            type="button"
            class="email-confirm-close"
            aria-label="Đóng"
            :disabled="isSendingEmail"
            @click="showConfirmEmailModal = false"
          >
            <v-icon color="white" size="24">mdi-close</v-icon>
          </button>
        </div>
        <div class="email-confirm-message">
          {{ emailConfirmMessage }}
        </div>
        <div class="email-confirm-actions">
          <button
            type="button"
            class="email-confirm-dismiss"
            :disabled="isSendingEmail"
            @click="showConfirmEmailModal = false"
          >
            Đóng <v-icon color="#A62229" size="18">mdi-close</v-icon>
          </button>
          <v-btn
            class="email-confirm-submit"
            color="#A62229"
            dark
            :loading="isSendingEmail"
            @click="submitConfirmedEmail"
          >
            Đồng ý
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogPayment" width="750px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="bg-red-bk white--text pa-3 d-flex justify-space-between align-center">
          <span class="text-subtitle-1 font-weight-bold">Xác nhận gửi danh sách thu phí</span>
          <v-btn icon dark small :disabled="isSendingPaymentList" @click="dialogPayment = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-5 black--text">
          <div class="text-caption mb-3">
            Danh sách sinh viên sẽ được gửi thu phí (<strong>{{ paymentSelectedStudents.length }}</strong>):
          </div>
          <v-alert
            v-if="paymentErrorMessage"
            type="error"
            dense
            color="#FFEBEE"
            class="red--text text--darken-3 text-caption font-weight-medium mb-3 border-red-alert"
            icon="mdi-alert"
          >
            {{ paymentErrorMessage }}
          </v-alert>

          <v-simple-table dense class="payment-modal-table mb-4">
            <template #default>
              <thead>
                <tr>
                  <th class="text-left">Mã sinh viên</th>
                  <th class="text-left">Họ và tên</th>
                  <th class="text-left">Mã đơn đăng ký</th>
                  <th class="text-left">Đợt học lại</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="student in paymentSelectedStudents" :key="student.id">
                  <td>{{ student.studentCode || '-' }}</td>
                  <td>{{ student.studentName || '-' }}</td>
                  <td>{{ student.registrationCode || '-' }}</td>
                  <td>{{ student.sessionCode || '-' }}</td>
                </tr>
                <tr v-if="paymentSelectedStudents.length === 0">
                  <td colspan="4" class="text-center">Không có dữ liệu</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>

          <v-menu
            v-model="menuPaymentDate"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="290px"
          >
            <template #activator="{ on, attrs }">
              <v-text-field
                :value="formattedPaymentDate"
                placeholder="Hạn nộp học phí"
                outlined
                dense
                readonly
                hide-details
                style="max-width: 250px;"
                append-icon="mdi-calendar"
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="paymentDueDate"
              color="#A62229"
              locale="vi-VN"
              @input="menuPaymentDate = false"
            ></v-date-picker>
          </v-menu>
        </v-card-text>

        <v-card-actions class="pa-3 d-flex justify-end gap-2">
          <v-btn
            outlined
            small
            color="#333"
            class="text-none"
            :disabled="isSendingPaymentList"
            @click="dialogPayment = false"
          >
            Đóng X
          </v-btn>
          <v-btn
            :color="paymentErrorMessage || !modalSelected.length || !paymentDueDate ? '#E0E0E0' : '#A62229'"
            :dark="!paymentErrorMessage && modalSelected.length > 0 && !!paymentDueDate"
            small
            class="text-none font-weight-bold"
            elevation="0"
            :disabled="!!paymentErrorMessage || !modalSelected.length || !paymentDueDate || isSendingPaymentList"
            :loading="isSendingPaymentList"
            @click="submitSendPaymentList"
          >
            Gửi Danh Sách
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogExtend" width="700px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="bg-red-bk white--text pa-3 d-flex justify-space-between align-center">
          <span class="text-subtitle-1 font-weight-bold">Xác nhận gia hạn hạn nộp học phí</span>
          <v-btn icon dark small :disabled="isExtendingDueDate" @click="dialogExtend = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-5 black--text">
          <div class="text-caption mb-2">
            Danh sách sinh viên sẽ được gia hạn (<strong>{{ extendSelectedStudents.length }}</strong>):
          </div>
          <v-alert
            v-if="extendErrorMessage"
            type="error"
            dense
            color="#FFEBEE"
            class="red--text text--darken-3 text-caption font-weight-medium mb-3 border-red-alert"
            icon="mdi-alert"
          >
            {{ extendErrorMessage }}
          </v-alert>
          <v-chip
            v-else
            color="#E8F5E9"
            class="green--text text--darken-3 font-weight-medium mb-3"
            small
          >
            <v-icon left x-small color="green">mdi-check-circle</v-icon>
            Tất cả đơn đăng ký cùng đợt – Đợt: {{ currentSessionName }}
          </v-chip>

          <v-simple-table dense class="payment-modal-table mb-4">
            <template #default>
              <thead>
                <tr>
                  <th class="text-center">STT</th>
                  <th class="text-left">Mã SV</th>
                  <th class="text-left">Họ và tên</th>
                  <th class="text-left">Đợt học lại</th>
                  <th class="text-left">Học phần đăng ký</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(student, index) in extendSelectedStudents" :key="student.id || index">
                  <td class="text-center">{{ index + 1 }}</td>
                  <td>{{ student.studentCode || '-' }}</td>
                  <td>{{ student.studentName || student.fullName || '-' }}</td>
                  <td>{{ student.sessionCode || '20261-A-5' }}</td>
                  <td>
                    <div
                      v-for="(subject, subjectIndex) in (student.subjects || [student])"
                      :key="subjectIndex"
                    >
                      {{ subjectIndex + 1 }}.
                      {{ subject.subjectName || subject.name || '-' }} -
                      {{ subject.subjectCode || subject.code || '-' }}
                    </div>
                  </td>
                </tr>
                <tr v-if="extendSelectedStudents.length === 0">
                  <td colspan="5" class="text-center">Không có dữ liệu</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>

          <v-menu
            v-model="menuExtendDate"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="290px"
          >
            <template #activator="{ on, attrs }">
              <v-text-field
                :value="formattedExtendDate"
                placeholder="Hạn nộp mới"
                outlined
                dense
                hide-details
                readonly
                style="max-width: 250px;"
                append-icon="mdi-calendar"
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="newDueDate"
              locale="vi-VN"
              color="#A62229"
              @input="menuExtendDate = false"
            ></v-date-picker>
          </v-menu>
        </v-card-text>

        <v-card-actions class="pa-3 d-flex justify-end gap-2">
          <v-btn
            outlined
            small
            color="#333"
            class="text-none"
            :disabled="isExtendingDueDate"
            @click="dialogExtend = false"
          >
            Đóng X
          </v-btn>
          <v-btn
            v-if="!extendErrorMessage"
            :color="newDueDate ? '#A62229' : '#E0E0E0'"
            :dark="!!newDueDate"
            small
            class="text-none font-weight-bold"
            elevation="0"
            :disabled="!newDueDate || isExtendingDueDate"
            :loading="isExtendingDueDate"
            @click="submitExtendDueDate"
          >
            Gia Hạn
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <div class="email-toast-container" aria-live="polite" aria-atomic="false">
      <transition-group name="email-toast-list" tag="div" class="email-toast-stack">
        <div
          v-for="toast in emailToasts"
          :key="toast.id"
          class="email-toast-item"
          :style="{ backgroundColor: toast.color }"
          role="status"
        >
          <div class="email-toast-content">
            <v-icon color="white" class="mr-3" small>{{ toast.icon }}</v-icon>
            <span class="email-toast-text">{{ toast.text }}</span>
            <v-btn
              icon
              x-small
              dark
              class="ml-2"
              :aria-label="'Đóng thông báo: ' + toast.text"
              @click="removeEmailToast(toast.id)"
            >
              <v-icon x-small>mdi-close</v-icon>
            </v-btn>
          </div>
          <div class="email-toast-progress-track">
            <div
              class="email-toast-progress"
              :style="{ animationDuration: toast.duration + 'ms' }"
              @animationend="removeEmailToast(toast.id)"
            ></div>
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
import * as XLSX from 'xlsx'
import RegisterRetakeCourseModal from '~/components/RetakeCourse/RegisterRetakeCourseModal.vue'

export default {
  name: 'RegisteredStudentsPage',
  components: {
    RegisterRetakeCourseModal
  },
  data() {
    return {
      loading: false,
      showAddModal: false,
      dialogDetail: false,
      dialogApprove: false,
      dialogEdit: false,
      dialogConfirm: false,
      dialogPayment: false,
      dialogExtend: false,
      paymentErrorMessage: '',
      extendErrorMessage: '',
      currentSessionName: '',
      paymentDueDate: '',
      newDueDate: '',
      menuPaymentDate: false,
      menuExtendDate: false,
      modalSelected: [],
      paymentSelectedStudents: [],
      extendSelectedStudents: [],
      isSendingPaymentList: false,
      isExtendingDueDate: false,
      detailData: {},
      approveItem: null,
      approveItems: [],
      editItem: null,
      selectedStudent: null,
      editForm: {},
      editHocPhanList: [],
      editStep: 1,
      searchKeyword: '',
      confirmItem: null,
      confirmTargetStatus: '',
      showConfirmEmailModal: false,
      emailTypeToSend: '',
      emailConfirmMessage: '',
      emailIdsToSend: [],
      isSendingEmail: false,
      emailToasts: [],
      nextEmailToastId: 0,
      importedPaymentResults: [],
      approvalClassOptions: ['G_20261_5_046'],
      selectAll: false,
      selectedIds: [],

      page: 1,
      pageSize: 50,
      pageInput: '1',

      filters: {
        keyword: '',
        major: null,
        studentClass: null,
        session: null,
        retakeClassCode: null,
        subjectCode: null,
        tuitionStatus: null,
        emailStatus: null,
        approvalStatus: null,
        bankStatus: null
      },

      registerStudentStatusMap: {
        AWAITING_CONFIRMATION: { label: 'Chờ xác nhận', color: '#FFC107' },
        CONFIRMED: { label: 'Đã xác nhận', color: '#28A745' },
        REJECTED: { label: 'Từ chối', color: '#DC3545' },
        CLASS_APPROVED: { label: 'Đã duyệt lớp', color: '#28A745' }
      },
      feePaidStatusMap: {
        NOT_PAID: { label: 'Chưa trả học phí', color: '#FFC107' },
        PAID: { label: 'Đã trả học phí', color: '#28A745' }
      },
      sendMailStatusMap: {
        NOT_SENT: { label: 'Chưa gửi', color: '#FFC107' },
        SENDING: { label: 'Đã gửi', color: '#28A745' },
        DELIVERED: { label: 'Gửi được', color: '#007BFF' }
      },
      bankStatusMap: {
        NOT_ADDED: { label: 'Chưa lập danh sách', color: '#FFC107' },
        ADDED: { label: 'Đã lập danh sách', color: '#28A745' }
      },

      majorOptions: ['Công nghệ thông tin', 'Kế toán', 'Kinh tế'],
      classOptions: ['ĐH-BK-CNTT1.1-K66', 'ĐH-BK-CNTT1.2-K66'],
      sessionOptions: ['20261-A-5', '20261-A-4'],
      retakeClassOptions: ['L01', 'L02'],
      subjectOptions: ['IT3100', 'IT3090', 'IT3080'],

      // DỮ LIỆU MẪU CHUẨN THEO ẢNH SỐ 1
      items: [
        {
          id: 1,
          studentName: 'Đỗ Tiến Tây Anh',
          studentCode: '20210112P',
          className: 'ĐH-BK-CNTT1.1-K66',
          sessionCode: '20261-A-5',
          subjectCode: 'IT3100',
          subjectName: 'Lập trình hướng đối tượng',
          registrationCode: 'HL_2026_1254',
          registerDate: '07/09/2026',
          registerTime: '17:45:21',
          approvalDate: null,
          totalFee: 1000000,
          tuitionStatus: 'Chưa trả học phí',
          collectorInfo: null,
          bankStatus: 'Chưa lập danh sách',
          emailStatus: 'Chưa gửi',
          approvalStatus: 'Chờ xác nhận'
        },
        {
          id: 2,
          studentName: 'Lê Tuấn Anh',
          studentCode: '20210110P',
          className: 'ĐH-BK-CNTT1.2-K66',
          sessionCode: '20261-A-5',
          subjectCode: 'IT3090',
          subjectName: 'CƠ SỞ DỮ LIỆU',
          registrationCode: 'HL_2026_1253',
          registerDate: '07/09/2026',
          registerTime: '17:45:21',
          approvalDate: null,
          totalFee: 1500000,
          tuitionStatus: 'Chưa trả học phí',
          collectorInfo: null,
          bankStatus: 'Chưa lập danh sách',
          emailStatus: 'Chưa gửi',
          approvalStatus: 'Chờ xác nhận'
        },
        {
          id: 3,
          studentName: 'Nguyễn Linh Anh',
          studentCode: '20210108P',
          className: 'ĐH-BK-CNTT1.1-K66',
          sessionCode: '20261-A-5',
          subjectCode: 'IT3080',
          subjectName: 'Mạng máy tính',
          registrationCode: 'HL_2026_1252',
          registerDate: '07/09/2026',
          registerTime: '17:45:21',
          approvalDate: null,
          totalFee: 1500000,
          tuitionStatus: 'Chưa trả học phí',
          collectorInfo: null,
          bankStatus: 'Chưa lập danh sách',
          emailStatus: 'Chưa gửi',
          approvalStatus: 'Chờ xác nhận'
        },
        {
          id: 4,
          studentName: 'Phạm Minh Quốc Quân',
          studentCode: '20259058P',
          className: 'Lớp 39',
          sessionCode: '20261-A-4',
          subjects: [
            '1. Đồ án tốt nghiệp cử nhân - IT4995',
            '2. Pháp luật đại cương H - MHP...'
          ],
          registrationCode: 'HL_2026_1161',
          registerDate: '13/08/2026',
          registerTime: '16:54:32',
          approvalDate: '15:44 25/08/2026',
          totalFee: 12950000,
          tuitionStatus: 'Chưa trả học phí',
          collectorInfo: null,
          bankStatus: 'Chưa lập danh sách',
          emailStatus: 'Chưa gửi',
          approvalStatus: 'Từ chối'
        },
        {
          id: 5,
          studentName: 'string',
          studentCode: 'TESST',
          className: 'Tin học kinh tế',
          sessionCode: '20252-A-1',
          subjects: [
            '1. Cloud & Computing - CC'
          ],
          registrationCode: 'HL_2026_1141',
          registerDate: '04/08/2026',
          registerTime: '15:33:04',
          approvalDate: '15:59 05/08/2026',
          totalFee: 1050000,
          tuitionStatus: 'Chưa trả học phí',
          collectorInfo: null,
          bankStatus: 'Đã lập danh sách',
          emailStatus: 'Gửi được',
          approvalStatus: 'Đã duyệt lớp'
        },
        {
          id: 6,
          studentName: 'Trần Thị Bảo Yến',
          studentCode: '21103100651',
          className: 'Tin học kinh tế',
          sessionCode: '20252-A-1',
          subjects: [
            '1. IoT trong y tế - ET4235'
          ],
          registrationCode: 'HL_2026_1121',
          registerDate: '03/06/2026',
          registerTime: '11:15:57',
          approvalDate: null,
          totalFee: 1785000,
          tuitionStatus: 'Đã trả học phí',
          collectorInfo: null,
          bankStatus: 'Đã lập danh sách',
          emailStatus: 'Đã gửi',
          approvalStatus: 'Đã duyệt lớp'
        },
        {
          id: 7,
          studentName: 'Nguyễn Thị Trà',
          studentCode: '20210344P',
          className: 'Tin học kinh tế',
          sessionCode: '20252-A-1',
          subjects: [
            '1. Docker & Deploy - DD',
            '2. Cloud & Computing - CC',
            '3. Quản trị học đ...'
          ],
          registrationCode: 'HL_2026_1101',
          registerDate: '02/06/2026',
          registerTime: '14:32:53',
          approvalDate: null,
          totalFee: 2100000,
          tuitionStatus: 'Chưa trả học phí',
          collectorInfo: null,
          bankStatus: 'Chưa lập danh sách',
          emailStatus: 'Đã gửi',
          approvalStatus: 'Từ chối'
        },
        {
          id: 8,
          studentName: 'Nguyễn Thị Trà',
          studentCode: '20210344P',
          className: 'Tin học kinh tế',
          sessionCode: '20261-A-4',
          subjects: [
            '1. Quản trị học đại cương - EM1010',
            '2. Thiết kế quảng bá sản phẩm - ME3124...'
          ],
          registrationCode: 'HL_2026_1084',
          registerDate: '01/06/2026',
          registerTime: '10:45:29',
          approvalDate: null,
          totalFee: 3500000,
          tuitionStatus: 'Đã trả học phí',
          collectorInfo: null,
          bankStatus: 'Chưa lập danh sách',
          emailStatus: 'Chưa gửi',
          approvalStatus: 'Đã xác nhận'
        },
        {
          id: 9,
          studentName: 'Nguyễn Thanh B',
          studentCode: '20232035P',
          className: 'Tin học kinh tế',
          sessionCode: '20261-A-4',
          subjects: [
            '1. Lập trình C# - CSHARP'
          ],
          registrationCode: 'HL_2026_1083',
          registerDate: '01/06/2026',
          registerTime: '10:45:17',
          approvalDate: null,
          totalFee: 3640000,
          tuitionStatus: 'Đã trả học phí',
          collectorInfo: null,
          bankStatus: 'Chưa lập danh sách',
          emailStatus: 'Gửi được',
          approvalStatus: 'Đã duyệt lớp'
        }
        ],
      mustRetakeStudentOptions: [
        {
          fullName: 'Đỗ Tiến Tây Anh',
          studentCode: '20210112P',
          className: 'ĐH-BK-CNTT1.1-K66',
          gender: 'Nam',
          email: 'Anh.DTT210112P@sis.hust.edu.vn'
        },
        {
          fullName: 'Lê Tuấn Anh',
          studentCode: '20210110P',
          className: 'ĐH-BK-CNTT1.2-K66',
          gender: 'Nam',
          email: 'Anh.LT210110P@sis.hust.edu.vn'
        }
      ]
    }
  },
  computed: {
    formattedPaymentDate() {
      return this.formatDate(this.paymentDueDate)
    },
    formattedExtendDate() {
      return this.formatDate(this.newDueDate)
    },
    studentOptions() {
      const studentsByCode = new Map()
      this.items.forEach(item => {
        const code = item.studentCode || String(item.id)
        if (studentsByCode.has(code)) return
        studentsByCode.set(code, {
          id: item.id,
          name: item.studentName || '',
          code: item.studentCode || '',
          email: item.email || '',
          course: item.course || '',
          className: item.className || '',
          major: item.major || ''
        })
      })
      return Array.from(studentsByCode.values())
    },
    editBatchOptions() {
      return Array.from(new Set([...(this.sessionOptions || []), this.editForm.batch].filter(Boolean)))
    },
    filteredEditHocPhanList() {
      const keyword = (this.searchKeyword || '').trim().toLowerCase()
      if (!keyword) return this.editHocPhanList

      return this.editHocPhanList.filter(course =>
        [course.subjectCode, course.subjectName, course.lecturerCode, course.lecturerName]
          .some(value => String(value || '').toLowerCase().includes(keyword))
      )
    },
    selectedEditCourseCount() {
      return this.editHocPhanList.filter(course => course.selected).length
    },
    hasSelectedEditCourses() {
      return this.selectedEditCourseCount > 0
    },
    hasVisibleEditCourseSelection() {
      return this.filteredEditHocPhanList.some(course => course.selected)
    },
    areAllVisibleEditCoursesSelected() {
      return this.filteredEditHocPhanList.length > 0 && this.filteredEditHocPhanList.every(course => course.selected)
    },
    totalEditAmount() {
      return this.editHocPhanList.reduce((total, course) => {
        if (!course.selected) return total
        const amount = Number(course.totalAmount || course.feeRate || 0)
        return total + (Number.isFinite(amount) ? amount : 0)
      }, 0)
    },
    detailSubjects() {
      if (!this.detailData) return []
      const subjects = Array.isArray(this.detailData.subjects)
        ? this.detailData.subjects
        : (this.detailData.subjectCode || this.detailData.subjectName ? [this.detailData] : [])

      return subjects.map(subject => {
        if (typeof subject !== 'string') return subject
        const match = subject.match(/^\s*\d+\.\s*(.*?)\s*-\s*([^-]+)\s*$/)
        return match
          ? { subjectName: match[1], subjectCode: match[2] }
          : { subjectName: subject }
      })
    },
    totalSubjectCredits() {
      return this.detailSubjects.reduce((total, subject) => {
        const credits = Number(subject.feeCredits || subject.credits || subject.soTinChi || 0)
        return total + (Number.isFinite(credits) ? credits : 0)
      }, 0)
    },
    totalSubjectAmount() {
      const lineAmounts = this.detailSubjects
        .map(subject => Number(subject.totalAmount || subject.thanhTien || subject.fee || 0))
      const hasLineAmounts = lineAmounts.some(amount => amount > 0)
      return hasLineAmounts
        ? lineAmounts.reduce((total, amount) => total + (Number.isFinite(amount) ? amount : 0), 0)
        : Number(this.detailData.totalFee) || 0
    },
    totalItems() {
      return this.items.length
    },
    totalPages() {
      return Math.ceil(this.totalItems / this.pageSize) || 1
    },
    paginatedItems() {
      const start = (this.page - 1) * this.pageSize
      return this.items.slice(start, start + this.pageSize)
    },
    selectedCount() {
      return this.selectedIds.length
    },
    selectedRows() {
      const selectedIdSet = new Set(this.selectedIds)
      return this.items.filter(item => selectedIdSet.has(item.id))
    },
    isActionActive() {
      return this.selectedCount > 0
    }
  },
  watch: {
    page(value) {
      this.pageInput = String(value)
    }
  },
  methods: {
    getStatusConfig(status, mapType) {
      const statusMap = this[mapType]
      if (!statusMap) return null

      const defaultKeys = {
        registerStudentStatusMap: 'AWAITING_CONFIRMATION',
        feePaidStatusMap: 'NOT_PAID',
        sendMailStatusMap: 'NOT_SENT',
        bankStatusMap: 'NOT_ADDED'
      }
      const statusKey = status || defaultKeys[mapType]
      return statusMap[statusKey] || Object.values(statusMap).find(config => config.label === status) || null
    },
    getStatusStyle(status, mapType) {
      const config = this.getStatusConfig(status, mapType)
      return config
        ? { backgroundColor: config.color, color: '#FFFFFF' }
        : { backgroundColor: '#6C757D', color: '#FFFFFF' }
    },
    getStatusLabel(status, mapType) {
      const config = this.getStatusConfig(status, mapType)
      return config ? config.label : (status || '--')
    },
    filterStudent(item, queryText) {
      const query = (queryText || '').toLowerCase()
      return [item.name, item.code].some(value => String(value || '').toLowerCase().includes(query))
    },
    normalizeEditCourse(course, parentItem, index) {
      if (typeof course === 'string') {
        const match = course.match(/^\s*\d+\.\s*(.*?)\s*-\s*([^-]+)\s*$/)
        course = match
          ? { subjectName: match[1], subjectCode: match[2] }
          : { subjectName: course }
      }

      const subjectCode = course.subjectCode || course.maHocPhan || parentItem.subjectCode || ''
      const subjectName = course.subjectName || course.tenHocPhan || course.name || parentItem.subjectName || ''
      return {
        ...course,
        key: `${subjectCode || subjectName || 'course'}-${index}`,
        subjectCode,
        subjectName,
        lecturerCode: course.lecturerCode || course.maGV || '',
        lecturerName: course.lecturerName || course.tenGV || '',
        feeRate: Number(course.feeRate || course.dinhMucPhi || (Number(parentItem.totalFee) / (Array.isArray(parentItem.subjects) ? parentItem.subjects.length : 1))) || 0,
        totalAmount: Number(course.totalAmount || course.thanhTien || course.fee || 0) || 0
      }
    },
    openEditModal(item) {
      this.editItem = item
      this.selectedStudent = this.studentOptions.find(student => student.id === item.id) || null
      this.editForm = {
        batch: item.sessionCode || ''
      }

      const existingSubjects = Array.isArray(item.subjects)
        ? item.subjects
        : (item.subjectCode || item.subjectName ? [item] : [])
      const existingKeys = existingSubjects.map((subject, index) => {
        const normalized = this.normalizeEditCourse(subject, item, index)
        return normalized.subjectCode || normalized.subjectName
      })
      const allCourses = this.items.reduce((courses, parentItem, itemIndex) => {
        const subjects = Array.isArray(parentItem.subjects)
          ? parentItem.subjects
          : (parentItem.subjectCode || parentItem.subjectName ? [parentItem] : [])
        return courses.concat(subjects.map((subject, subjectIndex) =>
          this.normalizeEditCourse(subject, parentItem, `${itemIndex}-${subjectIndex}`)
        ))
      }, [])
      const uniqueCourses = []
      const seenCourseKeys = new Set()
      allCourses.forEach(course => {
        const courseKey = course.subjectCode || course.subjectName
        if (!courseKey || seenCourseKeys.has(courseKey)) return
        seenCourseKeys.add(courseKey)
        uniqueCourses.push({
          ...course,
          selected: existingKeys.includes(courseKey)
        })
      })
      this.editHocPhanList = uniqueCourses
      this.editStep = 2
      this.searchKeyword = ''
      this.dialogEdit = true
    },
    toggleVisibleEditCourses(checked) {
      this.filteredEditHocPhanList.forEach(course => {
        course.selected = checked
      })
    },
    onBackStep() {
      this.editStep = 1
    },
    onSaveEdit() {
      if (!this.editItem || !this.selectedStudent || !this.hasSelectedEditCourses || this.editStep !== 2) return

      const selectedCourses = this.editHocPhanList
        .filter(course => course.selected)
        .map(course => {
          const courseData = { ...course }
          delete courseData.key
          delete courseData.selected
          return courseData
        })
      const firstCourse = selectedCourses[0]
      this.$set(this.editItem, 'studentName', this.selectedStudent.name)
      this.$set(this.editItem, 'studentCode', this.selectedStudent.code)
      this.$set(this.editItem, 'email', this.selectedStudent.email)
      this.$set(this.editItem, 'course', this.selectedStudent.course)
      this.$set(this.editItem, 'className', this.selectedStudent.className)
      this.$set(this.editItem, 'major', this.selectedStudent.major)
      this.$set(this.editItem, 'sessionCode', this.editForm.batch)
      this.$set(this.editItem, 'subjects', selectedCourses)
      this.$set(this.editItem, 'subjectCode', firstCourse.subjectCode)
      this.$set(this.editItem, 'subjectName', firstCourse.subjectName)
      if (this.totalEditAmount > 0) this.$set(this.editItem, 'totalFee', this.totalEditAmount)
      this.$emit('edit', {
        item: this.editItem,
        subjects: selectedCourses,
        batch: this.editForm.batch,
        student: this.selectedStudent
      })
      this.dialogEdit = false
    },
    openStatusConfirm(item, status) {
      this.confirmItem = item
      this.confirmTargetStatus = status
      this.dialogConfirm = true
    },
    onActionConfirm() {
      if (!this.confirmItem || !this.confirmTargetStatus) return
      const targetStatus = this.confirmTargetStatus
      this.setRegisterStudentStatus(this.confirmItem, targetStatus)
      this.$emit(targetStatus === 'REJECTED' ? 'reject' : 'pending', this.confirmItem)
      this.dialogConfirm = false
    },
    getRegisterStudentStatus(item) {
      const statusMap = this.registerStudentStatusMap
      if (item.registerStudentStatus && statusMap[item.registerStudentStatus]) {
        return item.registerStudentStatus
      }

      const label = item.approvalStatus
      const statusKey = Object.keys(statusMap).find(key => statusMap[key].label === label)
      return statusKey || 'AWAITING_CONFIRMATION'
    },
    canApprove(item) {
      return ['AWAITING_CONFIRMATION', 'REJECTED'].includes(this.getRegisterStudentStatus(item))
    },
    canReject(item) {
      return ['AWAITING_CONFIRMATION', 'CONFIRMED'].includes(this.getRegisterStudentStatus(item))
    },
    canSetPending(item) {
      return ['REJECTED', 'CONFIRMED'].includes(this.getRegisterStudentStatus(item))
    },
    canEdit(item) {
      return this.getRegisterStudentStatus(item) !== 'CLASS_APPROVED'
    },
    setRegisterStudentStatus(item, status) {
      this.$set(item, 'registerStudentStatus', status)
      item.approvalStatus = this.registerStudentStatusMap[status].label
    },
    openDetailModal(item) {
      this.detailData = item ? { ...item } : {}
      this.dialogDetail = true
      this.$emit('view-detail', item)
    },
    openApproveModal(item) {
      this.approveItem = item
      const subjects = Array.isArray(item.subjects)
        ? item.subjects
        : (item.subjectCode || item.subjectName ? [item] : [])

      this.approveItems = subjects.map(subject => {
        let course = subject
        if (typeof subject === 'string') {
          const match = subject.match(/^\s*\d+\.\s*(.*?)\s*-\s*([^-]+)\s*$/)
          course = match
            ? { subjectName: match[1], subjectCode: match[2] }
            : { subjectName: subject }
        }

        const classList = Array.isArray(course.classList) && course.classList.length
          ? course.classList
          : this.approvalClassOptions
        return {
          ...course,
          classList,
          selectedClass: course.selectedClass || classList[0]
        }
      })
      this.dialogApprove = true
    },
    onApprove(item) {
      if (confirm('Bạn có chắc chắn muốn duyệt đơn này?')) {
        this.setRegisterStudentStatus(item, 'CONFIRMED')
      }
    },
    submitApprove() {
      if (!this.approveItem) return
      this.setRegisterStudentStatus(this.approveItem, 'CONFIRMED')
      this.$emit('approve', {
        item: this.approveItem,
        subjects: this.approveItems.map(subject => ({
          subjectCode: subject.subjectCode || subject.maHocPhan || '',
          subjectName: subject.subjectName || subject.tenHocPhan || subject.name || '',
          className: subject.selectedClass
        }))
      })
      this.dialogApprove = false
    },
    onEdit(item) {
      this.openEditModal(item)
    },
    toggleSelectAll() {
      this.selectedIds = this.selectAll ? this.items.map(item => item.id) : []
    },
    onItemSelectChange() {
      this.selectAll = this.items.length > 0 && this.items.every(item => this.selectedIds.includes(item.id))
    },
    openConfirmApproveEmail() {
      if (this.items.length === 0) {
        this.showEmailNotification('Không có sinh viên trong danh sách để gửi email!', '#F9A825')
        return
      }
      this.emailIdsToSend = this.items.map(item => item.id)
      this.emailTypeToSend = 'APPROVE'
      this.emailConfirmMessage = 'Gửi email thông báo được phép đóng phí học lại'
      this.showConfirmEmailModal = true
    },
    openConfirmRejectEmail() {
      if (this.items.length === 0) {
        this.showEmailNotification('Không có sinh viên trong danh sách để gửi email!', '#F9A825')
        return
      }
      this.emailIdsToSend = this.items.map(item => item.id)
      this.emailTypeToSend = 'REJECT'
      this.emailConfirmMessage = 'Gửi email thông báo từ chối đăng ký học lại'
      this.showConfirmEmailModal = true
    },
    handleSendEmail() {
      if (!this.isActionActive) return
      this.openSendPaymentModal()
    },
    async submitConfirmedEmail() {
      if (this.isSendingEmail || this.emailIdsToSend.length === 0 || !this.emailTypeToSend) return

      this.isSendingEmail = true
      try {
        const payload = {
          ids: this.emailIdsToSend.slice(),
          type: this.emailTypeToSend
        }
        await this.$axios.$post('/api/quan-ly-hoc-lai/send-email', payload)
        this.showConfirmEmailModal = false
        this.showEmailNotification(
          this.emailTypeToSend === 'APPROVE'
            ? 'Gửi email được phép đăng ký thành công'
            : 'Gửi email từ chối đăng ký thành công',
          '#2E7D32'
        )
      } catch (error) {
        this.showEmailNotification(
          error.response && error.response.data && error.response.data.message
            ? error.response.data.message
            : 'Gửi email thất bại, vui lòng thử lại!',
          '#C62828'
        )
      } finally {
        this.isSendingEmail = false
      }
    },
    showEmailNotification(message, color) {
      const icon = color === '#2E7D32'
        ? 'mdi-check-circle'
        : (color === '#F9A825' ? 'mdi-alert-circle' : 'mdi-alert')
      this.emailToasts.unshift({
        id: ++this.nextEmailToastId,
        text: message,
        color,
        icon,
        duration: 3500
      })
    },
    removeEmailToast(id) {
      this.emailToasts = this.emailToasts.filter(toast => toast.id !== id)
    },
    handleSchedule() {
      if (!this.isActionActive) return;
      this.openExtendDueDateModal()
    },
    openSendPaymentModal() {
      this.paymentSelectedStudents = this.selectedRows.slice()
      this.modalSelected = this.paymentSelectedStudents.map(student => student.id)
      this.paymentDueDate = ''
      this.menuPaymentDate = false
      this.paymentErrorMessage = ''

      const isInvalid = this.paymentSelectedStudents.some(student =>
        student.approvalStatus !== 'Đã duyệt' || student.bankStatus !== 'Đã duyệt'
      )
      if (isInvalid) {
        this.paymentErrorMessage = 'Không lấy được token CED (host chính) để kiểm tra dữ liệu master'
      }

      this.dialogPayment = true
    },
    openExtendDueDateModal() {
      this.extendSelectedStudents = this.selectedRows.slice()
      this.newDueDate = ''
      this.menuExtendDate = false
      this.extendErrorMessage = ''
      this.currentSessionName = this.extendSelectedStudents.length
        ? this.extendSelectedStudents[0].sessionCode || '20261-A-5'
        : '20261-A-5'

      const paidList = this.extendSelectedStudents.filter(student =>
        [student.paymentStatus, student.tuitionStatus].some(status =>
          ['paid', 'đã trả học phí'].includes(String(status || '').trim().toLowerCase())
        ) ||
        student.isPaid === true
      )
      if (paidList.length > 0) {
        const codes = paidList.map(student => student.registrationCode || student.code || 'HL_2026_1207').join(', ')
        this.extendErrorMessage = `Các đăng ký sau đã được đóng học phí, không thể gia hạn: ${codes}`
      } else {
        const invalidStatus = this.extendSelectedStudents.some(student => {
          const status = String(student.approvalStatus || '').trim()
          return !['Đã duyệt lớp', 'Đã xác nhận'].includes(status)
        })

        if (invalidStatus) {
          this.extendErrorMessage = 'Chỉ cho phép gia hạn đối với đơn có trạng thái là "Đã duyệt lớp" hoặc "Đã xác nhận"!'
        }
      }

      this.dialogExtend = true
    },
    async submitSendPaymentList() {
      if (this.paymentErrorMessage || this.modalSelected.length === 0 || !this.paymentDueDate || this.isSendingPaymentList) return

      this.isSendingPaymentList = true
      try {
        await this.$axios.$post('/api/send-payment', {
          studentIds: this.modalSelected,
          dueDate: this.paymentDueDate
        })
        this.dialogPayment = false
        this.$emit('send', this.modalSelected.slice())
        this.showEmailNotification('Gửi danh sách thu phí thành công!', '#2E7D32')
      } catch (error) {
        this.showEmailNotification(
          error.response && error.response.data && error.response.data.message
            ? error.response.data.message
            : 'Có lỗi xảy ra khi gửi danh sách!',
          '#C62828'
        )
      } finally {
        this.isSendingPaymentList = false
      }
    },
    async submitExtendDueDate() {
      if (this.extendErrorMessage || this.extendSelectedStudents.length === 0 || !this.newDueDate || this.isExtendingDueDate) return

      this.isExtendingDueDate = true
      try {
        await this.$axios.$post('/api/extend-due-date', {
          studentIds: this.extendSelectedStudents.map(student => student.id),
          newDueDate: this.newDueDate
        })
        this.dialogExtend = false
        this.$emit('calendar', this.extendSelectedStudents.map(student => student.id))
        this.showEmailNotification('Gia hạn hạn nộp học phí thành công!', '#2E7D32')
      } catch (error) {
        this.showEmailNotification(
          error.response && error.response.data && error.response.data.message
            ? error.response.data.message
            : 'Có lỗi xảy ra khi gia hạn!',
          '#C62828'
        )
      } finally {
        this.isExtendingDueDate = false
      }
    },
    fetchData() {
      this.loading = true
      setTimeout(() => {
        this.loading = false
      }, 300)
    },

    formatCurrency(val) {
      if (!val) return '0'
      return new Intl.NumberFormat('vi-VN').format(val)
    },
    formatDate(date) {
      if (!date) return ''
      const [year, month, day] = date.split('-')
      return `${day}/${month}/${year}`
    },

    goToPage() {
      const p = parseInt(this.pageInput)
      if (p && p >= 1 && p <= this.totalPages) {
        this.page = p
      } else {
        this.pageInput = String(this.page)
      }
    },
    exportToExcel(rows, fileName) {
      try {
        const exportData = rows.map((item, index) => ({
          STT: index + 1,
          'Mã sinh viên': item.studentCode || '',
          'Họ và tên': item.studentName || '',
          'Lớp sinh viên': item.className || '',
          'Kỳ đăng ký': item.sessionCode || '',
          'Học phần đăng ký': Array.isArray(item.subjects)
            ? item.subjects.map(subject => typeof subject === 'string'
              ? subject
              : `${subject.subjectName || subject.tenHocPhan || ''} - ${subject.subjectCode || subject.maHocPhan || ''}`).join('; ')
            : item.subjectName
              ? `${item.subjectName} - ${item.subjectCode || ''}`
              : '',
          'Mã đơn đăng ký': item.registrationCode || '',
          'Thời gian đăng ký': [item.registerDate, item.registerTime].filter(Boolean).join(' '),
          'Thời gian duyệt': item.approvalDate || '',
          'Tổng học phí (VNĐ)': Number(item.totalFee) || 0,
          'Trạng thái trả học phí': item.tuitionStatus || ''
        }))
        const worksheet = XLSX.utils.json_to_sheet(exportData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSach')
        const now = new Date()
        const date = [
          now.getFullYear(),
          String(now.getMonth() + 1).padStart(2, '0'),
          String(now.getDate()).padStart(2, '0')
        ].join('-')
        XLSX.writeFile(workbook, `${fileName}_${date}.xlsx`)
      } catch (error) {
        this.showEmailNotification(`Xuất file ${fileName} thất bại`, '#C62828')
      }
    },
    exportRequiredFeeResult() {
      const requiredFeeData = this.items.filter(item =>
        Number(item.totalFee) > 0 && this.isUnpaidFeeStatus(item.tuitionStatus)
      )
      if (!requiredFeeData.length) {
        this.showEmailNotification('Không có dữ liệu cần thu để xuất file', '#F9A825')
        return
      }
      this.exportToExcel(requiredFeeData, 'Ket_Qua_Can_Thu')
    },
    exportUnpaidList() {
      const unpaidData = this.items.filter(item => this.isUnpaidFeeStatus(item.tuitionStatus))
      if (!unpaidData.length) {
        this.showEmailNotification('Không có sinh viên chưa trả học phí để xuất file', '#F9A825')
        return
      }
      this.exportToExcel(unpaidData, 'Danh_Sach_Chua_Tra_Hoc_Phi')
    },
    exportAuditList() {
      if (!this.items.length) {
        this.showEmailNotification('Không có dữ liệu để xuất file rà soát học phí', '#F9A825')
        return
      }
      this.exportToExcel(this.items, 'Danh_Sach_Ra_Soat_Hoc_Phi')
    },
    isUnpaidFeeStatus(status) {
      const normalizedStatus = String(status || '').trim().toLowerCase()
      return ['chưa trả học phí', 'not_paid', 'unpaid', 'cần thu'].includes(normalizedStatus)
    },
    triggerImportFile() {
      this.$refs.fileImportInput.click()
    },
    async handleImportExcel(event) {
      const file = event.target.files && event.target.files[0]
      if (!file) return

      if (!/\.(xlsx|xls)$/i.test(file.name)) {
        this.showEmailNotification('Vui lòng chọn file Excel đúng định dạng (.xlsx, .xls)', '#F9A825')
        event.target.value = ''
        return
      }

      try {
        const arrayBuffer = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = loadEvent => resolve(loadEvent.target.result)
          reader.onerror = () => reject(new Error('Không thể đọc file Excel'))
          reader.readAsArrayBuffer(file)
        })
        const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        if (!firstSheetName) {
          this.showEmailNotification('File Excel không có dữ liệu', '#F9A825')
          return
        }

        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName])
        if (!rows.length) {
          this.showEmailNotification('File Excel không có dữ liệu', '#F9A825')
          return
        }

        this.importedPaymentResults = rows
        this.$emit('import-results', rows)
        this.showEmailNotification(`Đã đọc ${rows.length} bản ghi kết quả đã thu từ file`, '#2E7D32')
      } catch (error) {
        this.showEmailNotification('File Excel không đúng định dạng hoặc bị lỗi!', '#C62828')
      } finally {
        event.target.value = ''
      }
    },
    onReload() { this.$emit('reload') },
    onSearch() { this.$emit('search') },
    onAdd() {
      this.showAddModal = true
      this.$emit('add')
    },
    onEmailAdd() { this.$emit('email-add') },
    onEmailRemove() { this.$emit('email-remove') },
    onSend() { this.$emit('send', this.selectedIds.slice()) },
    onCalendar() { this.$emit('calendar', this.selectedIds.slice()) },

    handleRegisterSuccess(payload) {
      const student = payload.student || {}
      const courses = payload.selectedCourses || []
      const now = new Date()
      const registrationCode = `HL_${now.getFullYear()}_${now.getTime()}`
      const registerDate = [
        String(now.getDate()).padStart(2, '0'),
        String(now.getMonth() + 1).padStart(2, '0'),
        now.getFullYear()
      ].join('/')
      const registerTime = now.toLocaleTimeString('vi-VN')

      const registeredRows = courses.map((course, index) => ({
        id: `registered_${now.getTime()}_${index}`,
        studentName: student.fullName || '',
        studentCode: payload.studentCode,
        className: student.className || '',
        sessionCode: payload.sessionId,
        subjectCode: course.code || '',
        subjectName: course.name || '',
        registrationCode,
        registerDate,
        registerTime,
        approvalDate: null,
        totalFee: Number(course.totalPrice) || 0,
        tuitionStatus: 'Chưa trả học phí',
        collectorInfo: null,
        bankStatus: 'Chưa lập danh sách',
        emailStatus: 'Chưa gửi',
        approvalStatus: 'Chờ xác nhận'
      }))

      if (registeredRows.length) {
        this.items.unshift(...registeredRows)
        this.page = 1
        this.selectedIds = []
        this.selectAll = false
      }

      this.$emit('register-success', payload)
      this.showEmailNotification('Đăng ký học lại thành công', '#2E7D32')
    },

    onAddSuccess(newItem) {
      // Khi thêm thành công sinh viên mới, đẩy thẳng vào bảng với trạng thái đã đăng ký
      this.items.unshift({
        id: newItem.id || Date.now(),
        studentName: newItem.fullName,
        studentCode: newItem.studentCode,
        className: newItem.className || 'ĐH-BK-CNTT1.1-K66',
        sessionCode: newItem.sessionId || '20261-A-5',
        subjectCode: newItem.subjectCode || 'IT3100',
        subjectName: newItem.subjectName || 'Lập trình hướng đối tượng',
        registrationCode: newItem.registrationCode || `HL_2026_${Math.floor(1000 + Math.random() * 9000)}`,
        registerDate: '07/09/2026',
        registerTime: new Date().toLocaleTimeString('vi-VN'),
        approvalDate: null,
        totalFee: 1000000,
        tuitionStatus: 'Chưa trả học phí',
        collectorInfo: null,
        bankStatus: 'Chưa lập danh sách',
        emailStatus: 'Chưa gửi',
        approvalStatus: 'Chờ xác nhận'
      })
      this.page = 1
    }
  }
}
</script>

<style scoped>
.registered-students-page {
  display: flex;
  height: calc(100vh - 60px);
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.registered-students-page > .d-flex:first-child,
.filter-section,
.table-footer {
  flex: 0 0 auto;
}

.table-container {
  min-height: 0;
  flex: 1 1 auto;
  overflow: auto;
}

.email-toast-container {
  position: fixed;
  z-index: 99999;
  top: 24px;
  right: 24px;
  width: min(380px, calc(100vw - 32px));
  pointer-events: none;
}

.email-toast-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.email-toast-item {
  overflow: hidden;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
  color: #ffffff;
  pointer-events: auto;
}

.email-toast-content {
  display: flex;
  min-height: 54px;
  align-items: center;
  padding: 10px 14px;
}

.email-toast-text {
  flex: 1 1 auto;
  font-size: 14px;
  font-weight: 500;
}

.email-toast-progress-track {
  width: 100%;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.3);
}

.email-toast-progress {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  animation: emailToastCountdown linear forwards;
}

.email-toast-list-enter-active,
.email-toast-list-leave-active,
.email-toast-list-move {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.email-toast-list-enter {
  opacity: 0;
  transform: translateY(-15px) scale(0.96);
}

.email-toast-list-leave-to {
  opacity: 0;
  transform: translateX(40px);
}

@keyframes emailToastCountdown {
  from { width: 100%; }
  to { width: 0%; }
}

.email-confirm-card {
  display: flex;
  width: 550px;
  max-width: 100%;
  height: 162px;
  flex-direction: column;
  overflow: hidden;
  border-radius: 8px !important;
}

.email-confirm-header {
  display: flex;
  min-height: 50px;
  align-items: center;
  justify-content: space-between;
  flex: 0 0 50px;
  padding: 0 20px;
  background-color: #a62229;
  color: #ffffff;
}

.email-confirm-title {
  margin: 0;
  font-size: 20px;
  font-weight: 400;
  line-height: 1.2;
}

.email-confirm-close {
  display: inline-flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.email-confirm-message {
  display: flex;
  min-height: 0;
  flex: 1 1 auto;
  align-items: center;
  padding: 8px 20px;
  color: #707070;
  font-size: 14px;
  line-height: 1.4;
}

.email-confirm-actions {
  display: flex;
  min-height: 58px;
  align-items: center;
  justify-content: flex-end;
  flex: 0 0 58px;
  gap: 14px;
  padding: 6px 14px;
  border-top: 1px solid #dedede;
}

.email-confirm-dismiss {
  display: inline-flex;
  min-height: 34px;
  align-items: center;
  gap: 6px;
  padding: 0 4px;
  border: 0;
  background: transparent;
  color: #a62229;
  font-size: 14px;
  cursor: pointer;
}

.email-confirm-submit {
  min-width: 72px !important;
  min-height: 34px !important;
  padding: 0 14px !important;
  border-radius: 6px !important;
  font-size: 14px !important;
  letter-spacing: 0 !important;
  text-transform: none !important;
}

.email-confirm-close:disabled,
.email-confirm-dismiss:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

@media (max-width: 600px) {
  .email-confirm-card {
    width: calc(100vw - 32px);
    height: 162px;
  }

  .email-confirm-header {
    min-height: 50px;
    padding: 0 16px;
  }

  .email-confirm-title {
    font-size: 20px;
  }

  .email-confirm-message {
    min-height: 0;
    padding: 8px 16px;
    font-size: 13px;
  }

  .email-confirm-actions {
    min-height: 58px;
    gap: 10px;
    padding: 6px 10px;
  }

  .email-confirm-dismiss {
    min-height: 34px;
    gap: 4px;
    font-size: 14px;
  }

  .email-confirm-submit {
    min-width: 72px !important;
    min-height: 34px !important;
    border-radius: 6px !important;
    font-size: 14px !important;
  }
}

.text-red-bold { color: #A62229 !important; }
.bg-red-bk { background-color: #A62229 !important; color: white !important; }
.border-red-alert {
  border: 1px solid #FFCDD2 !important;
}

.payment-modal-table {
  border: 1px solid #E0E0E0;
  border-radius: 4px;
}
.bg-orange-btn { background-color: #F57C00 !important; color: white !important; }

.btn-action-icon {
  border: 1px solid #E0E0E0;
  border-radius: 4px;
}

/* Badge trạng thái */
.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
  color: #ffffff !important;
}

.approve-modal-card {
  display: flex;
  width: 100%;
  max-height: 90vh;
  flex-direction: column;
  overflow: hidden;
  border-radius: 6px;
  background-color: #ffffff;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.25);
}

.approve-modal-header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  background-color: #a61c24;
  color: #ffffff;
}

.approve-modal-title {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}

.approve-btn-close {
  padding: 0;
  border: none;
  background: transparent;
  color: #ffffff;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
}

.approve-modal-body {
  min-height: 0;
  overflow-y: auto;
  padding: 24px;
}

.approve-confirm-text {
  margin-bottom: 20px;
  color: #555555;
  font-size: 15px;
}

.text-status-warning,
.text-status-success {
  color: #a61c24;
  font-weight: bold;
}

.approve-table {
  width: 100%;
  margin-bottom: 8px;
  border-collapse: collapse;
}

.approve-table th {
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f2f2f2;
  color: #222222;
  font-weight: 600;
  text-align: left;
}

.approve-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #eeeeee;
  vertical-align: middle;
}

.th-stt,
.td-stt { width: 8%; }
.th-code,
.td-code { width: 22%; font-weight: 500; }
.th-name,
.td-name { width: 42%; }
.th-select,
.td-select { width: 28%; }

.approve-select-box {
  background-color: #ffffff;
}

.approve-modal-footer {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #eeeeee;
  background-color: #ffffff;
}

.btn-cancel-action {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #333333;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}

.btn-cancel-action:hover {
  background-color: #f5f5f5;
}

.btn-confirm-action {
  display: inline-flex;
  align-items: center;
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  background-color: #a61c24;
  color: #ffffff;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}

.btn-confirm-action:hover {
  background-color: #8c141a;
}

.edit-modal-card {
  display: flex;
  width: 100%;
  max-height: 90vh;
  flex-direction: column;
  overflow: hidden;
  border-radius: 8px;
  background-color: #ffffff;
}

.edit-modal-header,
.confirm-modal-header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background-color: #a61c24;
  color: #ffffff;
}

.edit-modal-title,
.confirm-modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.edit-btn-close,
.confirm-btn-close {
  border: none;
  background: transparent;
  color: #ffffff;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.edit-modal-body {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.edit-stepper {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 24px;
  padding-left: 20px;
}

.stepper-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #aaaaaa;
  font-size: 14px;
}

.stepper-item.active {
  color: #222222;
  font-weight: 500;
}

.stepper-icon {
  display: flex;
  width: 26px;
  height: 26px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: #e0e0e0;
  color: #ffffff;
  font-size: 13px;
  font-weight: bold;
}

.stepper-item.active {
  color: #222222;
}

.stepper-item.active .stepper-icon {
  background-color: #a61c24;
}

.stepper-line {
  width: 1px;
  height: 30px;
  margin: 0 40px;
  background-color: #e0e0e0;
}

.disabled-step {
  color: #aaaaaa;
}

.select-student-box {
  max-width: 420px;
  margin: 0 auto;
}

.info-header-title {
  margin-bottom: 16px;
  border-left: 4px solid #a61c24;
  padding-left: 10px;
  font-size: 16px;
  font-weight: bold;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 24px;
  font-size: 14px;
}

.text-red {
  color: #a61c24;
}

.btn-next-step {
  padding: 8px 24px;
  border: none;
  border-radius: 6px;
  background-color: #a61c24;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.btn-next-step.disabled {
  background-color: #e0e0e0;
  color: #999999;
  cursor: not-allowed;
}

.edit-batch-select {
  max-width: 380px;
  margin: 0 auto 16px;
}

.edit-search-field {
  max-width: 200px;
}

.edit-table-scroll {
  overflow-x: auto;
  border-bottom: 2px solid #a61c24;
}

.edit-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  white-space: nowrap;
}

.edit-table th {
  padding: 10px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f2f2f2;
  text-align: left;
}

.edit-table td {
  padding: 10px;
  border-bottom: 1px solid #eeeeee;
}

.edit-summary-box {
  padding: 12px;
  background-color: #fff5f5;
}

.text-red-light {
  color: #e57373;
}

.btn-edit-back {
  padding: 8px 18px;
  border: none;
  border-radius: 6px;
  background-color: #a61c24;
  color: #ffffff;
  cursor: pointer;
}

.edit-modal-footer {
  display: flex;
  flex-shrink: 0;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 20px;
  border-top: 1px solid #eeeeee;
  background-color: #ffffff;
}

.btn-edit-close {
  padding: 6px 14px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.btn-edit-save {
  display: inline-flex;
  align-items: center;
  padding: 6px 16px;
  border: none;
  border-radius: 4px;
  background-color: #a61c24;
  color: #ffffff;
  cursor: pointer;
}

.btn-edit-save:disabled {
  background-color: #e0e0e0;
  color: #666666;
  cursor: not-allowed;
}

.confirm-modal-card {
  overflow: hidden;
  border-radius: 6px;
  background-color: #ffffff;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.confirm-modal-body {
  padding: 24px;
}

.confirm-text {
  margin-bottom: 24px;
  color: #444444;
  font-size: 15px;
}

.confirm-action-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.btn-confirm-cancel {
  padding: 6px 12px;
  border: none;
  background: transparent;
  color: #333333;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.btn-confirm-submit {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  background-color: #a61c24;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-confirm-submit:hover {
  background-color: #88141b;
}

.custom-modal-card {
  display: flex;
  width: 900px;
  max-width: 95vw;
  max-height: 90vh;
  flex-direction: column;
  overflow: hidden;
  border-radius: 8px;
  background-color: #ffffff;
}

.modal-header-sticky {
  flex-shrink: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background-color: #a61c24 !important;
}

.btn-close-x {
  border: none;
  background: transparent;
  color: #ffffff;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
}

.modal-body-scrollable {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.modal-footer-sticky {
  flex-shrink: 0;
  padding: 12px 20px;
  border-top: 1px solid #e9ecef;
  background-color: #f8f9fa;
}

.section-title {
  margin-top: 12px;
  margin-bottom: 12px;
  border-left: 4px solid #a61c24;
  padding-left: 8px;
  color: #a61c24;
  font-size: 16px;
  font-weight: bold;
}

.custom-table >>> th {
  background-color: #f1f3f5 !important;
  font-weight: 600 !important;
  white-space: nowrap;
}

.custom-table >>> td,
.custom-table >>> th {
  padding: 0 12px;
}

.custom-table.border {
  border: 1px solid #e0e0e0;
}

.table-scroll-wrapper {
  overflow-x: auto;
  margin-bottom: 8px;
}

.table-scroll-wrapper::-webkit-scrollbar {
  height: 6px;
}

.table-scroll-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.table-scroll-wrapper::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background-color: #a61c24;
}

.table-scroll-wrapper .custom-table >>> table {
  width: 100%;
  min-width: 1050px;
  border-collapse: collapse;
  white-space: nowrap;
}

.table-scroll-wrapper .custom-table >>> td,
.table-scroll-wrapper .custom-table >>> th {
  padding: 10px 12px;
}

.table-scroll-wrapper .custom-table >>> td {
  border-top: 1px solid #eeeeee;
}

.summary-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 6px;
  font-size: 14px;
  color: #555555;
}

.summary-divider {
  margin: 0 10px;
}

/* BẢNG CUSTOM GIỐNG ẢNH MẪU */
.custom-data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.custom-data-table th {
  position: sticky;
  z-index: 1;
  top: 0;
  background-color: #EEEEEE;
  color: #333;
  font-weight: 600;
  padding: 10px 8px;
  border-bottom: 2px solid #E0E0E0;
  white-space: nowrap;
}

.table-footer {
  padding-bottom: 4px;
}
.custom-data-table td {
  padding: 12px 8px;
  border-bottom: 1px solid #EEEEEE;
  vertical-align: middle;
}
.custom-data-table tbody tr:hover {
  background-color: #F9F9F9;
}

.action-btn {
  cursor: pointer;
  padding: 2px;
}

.page-size-select {
  width: 65px !important;
}
.page-size-select >>> .v-input__slot {
  min-height: 28px !important;
  padding: 0 6px !important;
}

.page-input-field {
  width: 45px !important;
}
.page-input-field >>> .v-input__slot {
  min-height: 28px !important;
  padding: 0 4px !important;
}
.page-input-field >>> input {
  text-align: center;
}

.go-btn {
  min-width: 28px !important;
  height: 28px !important;
}

.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }

.style-scrollbar::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}
.style-scrollbar::-webkit-scrollbar-thumb {
  background: #CCCCCC;
  border-radius: 4px;
}
.action-toolbar {
  display: flex;
  align-items: center;
  gap: 8px; /* Khoảng cách giữa các nút */
  margin-left: auto;
}

/* Nút Reload tròn */
.btn-reload {
  width: 36px !important;
  height: 36px !important;
  min-width: 36px !important;
}

/* Quy định kích thước chuẩn 64px x 36px cho các nút khung */
.action-btn {
  width: 64px;
  height: 36px;
  min-width: 64px;
  border-radius: 6px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.1s ease;
}

.action-btn:hover {
  opacity: 0.88;
}

.action-btn:active {
  transform: scale(0.97);
}

.row-action-btn {
  width: 32px;
  height: 32px;
  min-width: 32px;
}

/* Các tone màu chính xác theo hình */
.btn-dark-red {
  background-color: #a61c24; /* Đỏ đô */
}

.btn-orange {
  background-color: #fca02e; /* Vàng cam */
}

.btn-red {
  background-color: #f93d32; /* Đỏ tươi */
}

.btn-gray {
  background-color: #e0e0e0; /* Xám nhạt */
}

.btn-badge-wrapper {
  position: relative;
  display: inline-block;
}

.badge-count {
  position: absolute;
  top: -8px;
  right: -8px;
  z-index: 2;
  display: flex;
  min-width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  border-radius: 10px;
  background-color: #f44336;
  color: #ffffff;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.action-buttons-group .action-btn {
  width: 60px !important;
  min-width: 60px !important;
  height: 36px !important;
  border-radius: 6px;
  border: none;
  transition: all 0.25s ease;
}

.action-buttons-group .action-btn:disabled {
  background-color: #e0e0e0 !important;
  cursor: not-allowed !important;
  opacity: 0.7;
}

.action-buttons-group .action-btn.active {
  cursor: pointer !important;
  opacity: 1;
}

.btn-send.active {
  background-color: #10ce99 !important;
}

.btn-send.active:hover {
  background-color: #0eb889 !important;
}

.btn-calendar.active {
  background-color: #4285f4 !important;
}

.btn-calendar.active:hover {
  background-color: #3367d6 !important;
}
</style>