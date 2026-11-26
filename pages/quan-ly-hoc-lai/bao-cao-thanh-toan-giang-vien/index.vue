<template>
  <div class="teacher-fee-page pa-2 pa-sm-4 bg-white">
    <!-- THANH TIÊU ĐỀ & BỘ LỌC PHÍA TRÊN -->
    <div class="top-filter-bar bg-white py-2 px-1 mb-3">
      <div class="d-flex align-start align-sm-center justify-space-between flex-wrap gap-2 width-100">
        <div class="d-flex align-center flex-wrap" style="gap: 8px;">
          <span class="text-subtitle-1 font-weight-bold text-no-wrap">
            Danh sách báo cáo thanh toán GV (<span class="red--text text--darken-2">{{ totalRecord }}</span>)
          </span>
          <span class="font-weight-regular text-body-2">
            Tổng tiền chưa thu: <strong class="error--text">{{ formatCurrency(totalMoney) }}</strong>
          </span>
        </div>

        <div class="d-flex align-center gap-2 flex-wrap flex-grow-1 justify-end">
          <!-- Lọc Giảng viên -->
          <v-select
            v-model="search.teacherId"
            :items="teacherOptions"
            item-text="text"
            item-value="value"
            placeholder="Giảng viên"
            outlined
            dense
            hide-details
            clearable
            :menu-props="{ attach: true, offsetY: true, zIndex: 999 }"
            class="bg-white filter-item select-md custom-outlined-input"
          ></v-select>

          <!-- Lọc Lớp học lại -->
          <v-select
            v-model="search.examSessionCode"
            :items="retakeCourseOptions"
            item-text="text"
            item-value="value"
            placeholder="Lớp học lại"
            outlined
            dense
            hide-details
            clearable
            :menu-props="{ attach: true, offsetY: true, zIndex: 999 }"
            class="bg-white filter-item select-md custom-outlined-input"
          ></v-select>

          <!-- Lọc Trạng thái thanh toán -->
          <v-select
            v-model="search.paymentFeeStatus"
            :items="paymentTeacherStatusList"
            item-text="text"
            item-value="value"
            placeholder="Trạng thái thanh toán"
            outlined
            dense
            hide-details
            clearable
            :menu-props="{ attach: true, offsetY: true, zIndex: 999 }"
            class="bg-white filter-item select-md custom-outlined-input"
          ></v-select>

          <!-- Lọc Đợt học lại -->
          <v-select
            v-model="search.examIds"
            :items="examOptions"
            item-text="text"
            item-value="value"
            placeholder="Đợt học lại"
            outlined
            dense
            hide-details
            clearable
            :menu-props="{ attach: true, offsetY: true, zIndex: 999 }"
            class="bg-white filter-item select-md custom-outlined-input"
          ></v-select>

          <!-- Nút Reset & Tìm kiếm -->
          <div class="d-flex gap-2 align-center flex-shrink-0">
            <v-btn
              icon
              color="#a2212b"
              class="rounded-sm action-btn"
              title="Làm mới"
              @click="resetFilters"
            >
              <v-icon color="#a2212b" size="24">mdi-refresh</v-icon>
            </v-btn>

            <v-btn
              color="#a2212b"
              dark
              elevation="0"
              class="min-w-0 px-3 rounded-sm action-btn"
              style="height: 40px;"
              title="Tìm kiếm"
              @click="onSearch"
            >
              <v-icon size="24">mdi-magnify</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- BẢNG DỮ LIỆU + THANH PHÂN TRANG ĐI THEO DANH SÁCH VÀ CỐ ĐỊNH KHI CHẠM ĐÁY -->
    <v-card flat class="rounded-lg border">
      <div class="table-scroll-container">
        <BaseTable
          :headers="headers"
          :items="list"
          hide-default-footer
          disable-pagination
          :loading="isLoading"
          loading-text="Đang tải dữ liệu..."
          no-data-text="Không có dữ liệu"
        >
          <template #[`item.stt`]="{ index }">
            <span class="font-weight-medium mobile-break-text">{{ (pageInfo.pageIndex - 1) * pageInfo.pageSize + index + 1 }}</span>
          </template>

          <!-- Thông tin ngân hàng -->
          <template #[`item.bank`]="{ item }">
            <div class="mobile-break-text" style="line-height: 1.4;">
              <div class="font-weight-medium">{{ item.bankName || '---' }}</div>
              <div class="grey--text text--darken-1" v-if="item.bankNumber">{{ item.bankNumber }}</div>
              <div class="grey--text text--darken-1" v-if="item.bankAccount && !item.bankNumber">{{ item.bankAccount }}</div>
            </div>
          </template>

          <!-- Tổng phí -->
          <template #[`item.totalFee`]="{ item }">
            <span class="font-weight-bold mobile-break-text">
              {{ formatCurrency(item.totalFee) }}
            </span>
          </template>

          <!-- Trạng thái -->
          <template #[`item.paymentFeeStatus`]="{ item }">
            <v-chip
              small
              :color="item.paymentFeeStatus === 'COMPLETE_PAID' || item.paymentFeeStatus === 'PAID' ? 'green' : 'primary'"
              dark
              class="font-weight-medium"
            >
              {{ item.paymentFeeStatus === 'COMPLETE_PAID' || item.paymentFeeStatus === 'PAID' ? 'Đã thanh toán' : 'Chờ thanh toán' }}
            </v-chip>
          </template>

          <!-- Tác vụ (Icon Excel) -->
          <template #[`item.task`]="{ item }">
            <div class="d-flex align-center gap-2">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    size="26"
                    color="#4caf50"
                    class="cursor-pointer"
                    v-bind="attrs"
                    v-on="on"
                    @click="exportItemExcel(item)"
                  >
                    mdi-microsoft-excel
                  </v-icon>
                </template>
                <span>Xuất file Excel</span>
              </v-tooltip>
            </div>
          </template>

          <!-- Chức năng (Icon Xem chi tiết con mắt) -->
          <template #[`item.actions`]="{ item }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  size="26"
                  color="info"
                  class="cursor-pointer"
                  v-bind="attrs"
                  v-on="on"
                  @click="viewDetail(item)"
                >
                  mdi-eye
                </v-icon>
              </template>
              <span>Xem chi tiết</span>
            </v-tooltip>
          </template>
        </BaseTable>
      </div>

      <!-- THANH PHÂN TRANG & XUẤT FILE BÁO CÁO -->
      <div
        class="sticky-pagination-bar d-flex align-center justify-space-between flex-wrap py-2 px-3 bg-white border-top gap-2"
      >
        <v-btn
          color="#2e7d32"
          dark
          elevation="0"
          class="text-capitalize rounded px-4 font-weight-bold"
          @click="exportExcel"
        >
          <v-icon size="16" class="mr-1">mdi-microsoft-excel</v-icon> XUẤT FILE BÁO CÁO
        </v-btn>

        <div class="d-flex align-center flex-wrap gap-2">
          <v-select
            v-model="pageInfo.pageSize"
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

          <v-text-field
            v-model.number="pageInput"
            label="Trang"
            dense
            outlined
            hide-details
            class="pagination-input text-center"
            style="width: 65px"
            @keyup.enter="goToPage(pageInput)"
          ></v-text-field>

          <v-btn
            color="#a2212b"
            dark
            small
            class="text-capitalize px-3 rounded-sm elevation-0"
            style="height: 36px"
            @click="goToPage(pageInput)"
          >
            Đi
          </v-btn>

          <div class="d-flex align-center gap-1">
            <v-btn icon small :disabled="pageInfo.pageIndex <= 1" @click="changePage(pageInfo.pageIndex - 1)">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            <template v-for="p in visiblePages">
              <v-btn
                v-if="p === 1 || p === totalPages || (p >= pageInfo.pageIndex - 1 && p <= pageInfo.pageIndex + 1)"
                :key="p"
                small
                :color="pageInfo.pageIndex === p ? '#a2212b' : ''"
                :dark="pageInfo.pageIndex === p"
                :outlined="pageInfo.pageIndex !== p"
                class="min-w-0 pa-0 rounded-sm elevation-0 mx-1"
                style="width: 28px; height: 28px"
                @click="changePage(p)"
              >
                {{ p }}
              </v-btn>
              <span v-else-if="p === pageInfo.pageIndex - 2 || p === pageInfo.pageIndex + 2" :key="'dots-' + p">...</span>
            </template>
            <v-btn icon small :disabled="pageInfo.pageIndex >= totalPages" @click="changePage(pageInfo.pageIndex + 1)">
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </v-card>

    <!-- MODAL XEM CHI TIẾT BÁO CÁO THANH TOÁN -->
    <v-dialog v-model="isDetailModalOpen" max-width="950px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="headline text-white" style="background-color: #a2212b;">
          <span class="text-h6 font-weight-bold">Chi tiết báo cáo thanh toán giảng viên</span>
          <v-spacer></v-spacer>
          <v-btn icon dark @click="isDetailModalOpen = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-5">
          <div class="text-subtitle-1 font-weight-bold red--text text--darken-2 mb-3">
            Thông tin báo cáo thanh toán giảng viên
          </div>

          <v-row class="mb-4 text-body-2">
            <v-col cols="12" sm="6">
              <div>Tên đợt thanh toán: <strong class="text--darken-3">{{ selectedItem.name || '---' }}</strong></div>
              <div class="mt-2">Mã đợt thanh toán: <strong class="text--darken-3">{{ selectedItem.code || '---' }}</strong></div>
            </v-col>
            <v-col cols="12" sm="6">
              <div>Ngày thanh toán: <strong class="text--darken-3">{{ formatDate(selectedItem.paymentDate) }}</strong></div>
              <div class="mt-2">
                Trạng thái:
                <span :class="selectedItem.paymentFeeStatus === 'PAID' || selectedItem.paymentFeeStatus === 'COMPLETE_PAID' ? 'green--text font-weight-bold' : 'error--text font-weight-bold'">
                  {{ selectedItem.paymentFeeStatus === 'PAID' || selectedItem.paymentFeeStatus === 'COMPLETE_PAID' ? 'Đã thanh toán' : 'Chờ thanh toán' }}
                </span>
              </div>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <div class="text-subtitle-1 font-weight-bold mb-3">
            Danh sách giảng viên (<span class="red--text">{{ Array.isArray(selectedItem.teacherFees) ? selectedItem.teacherFees.length : 0 }}</span>)
          </div>

          <v-data-table
            :headers="[
              { text: 'STT', value: 'stt', align: 'center', sortable: false, width: 60 },
              { text: 'Họ tên giảng viên', value: 'name', sortable: false },
              { text: 'Mã lớp giảng dạy', value: 'classCode', sortable: false },
              { text: 'Số tiết', value: 'period', align: 'center', sortable: false },
              { text: 'Số lượng sinh viên', value: 'numberOfStudent', align: 'center', sortable: false },
              { text: 'Định mức', value: 'unitPrice', align: 'center', sortable: false },
              { text: 'Loại lớp', value: 'classType', align: 'center', sortable: false },
              { text: 'Số tiền', value: 'amount', align: 'center', sortable: false },
            ]"
            :items="Array.isArray(selectedItem.teacherFees) ? selectedItem.teacherFees : []"
            hide-default-footer
            class="elevation-1 border rounded"
          >
            <template #[`item.stt`]="{ index }">
              {{ index + 1 }}
            </template>
            <template #[`item.name`]="{ item }">
              <span class="font-weight-medium">{{ item.name || '---' }}</span>
            </template>
            <template #[`item.classCode`]="{ item }">
              {{ item.classCode || '---' }}
            </template>
            <template #[`item.period`]="{ item }">
              {{ item.period ?? '---' }}
            </template>
            <template #[`item.numberOfStudent`]="{ item }">
              {{ item.numberOfStudent ?? '---' }}
            </template>
            <template #[`item.unitPrice`]="{ item }">
              {{ formatCurrency(item.unitPrice) }}
            </template>
            <template #[`item.classType`]="{ item }">
              <v-chip small outlined color="primary" class="font-weight-medium">
                {{ item.classType === 'COMBINE_CLASS' ? 'Lớp ghép' : (item.classType || '---') }}
              </v-chip>
            </template>
            <template #[`item.amount`]="{ item }">
              <span class="font-weight-bold red--text text--darken-2">{{ formatCurrency(item.amount) }}</span>
            </template>
          </v-data-table>
        </v-card-text>

        <v-card-actions class="pa-4 pt-0 justify-end">
          <v-btn color="grey darken-1" text @click="isDetailModalOpen = false">
            Đóng <v-icon right>mdi-close</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import BaseTable from '~/components/Base/BaseTable.vue'
import feeTeacherService from '~/services/re-learning/feeTeacherService'

export default {
    name: 'TeacherFeeReportView',
    components: { BaseTable },
    data: () => ({
        statusList: [
            { value: "ACTIVE", text: "Đã thanh toán", color: "primary" },
            { value: "INACTIVE", text: "Chưa thanh toán", color: "grey" },
        ],
        paymentTeacherStatusList: [
            { value: "WAIT_PAID", text: "Chờ thanh toán", color: "primary" },
            { value: "COMPLETE_PAID", text: "Đã thanh toán", color: "green" },
            { value: "CANCELED_PAID", text: "Hủy thanh toán", color: "red" },
        ],
        headers: [
            { value: "teacher.code", text: "Mã số GV", class: "text-center", sortable: false },
            { value: "teacher.name", text: "Họ tên GV", sortable: false, width: 150 },
            { value: "bank", text: "T.tin Ngân hàng", sortable: false, width: 150 },
            { value: "examSessions", text: "Lớp học phần", sortable: false, align: "center" },
            {
                value: "totalFee",
                text: "Tổng phí",
                align: "center",
                sortable: false,
            },
            {
                value: "paymentFeeStatus",
                text: "Trạng thái",
                align: "center",
                sortable: false,
            },
            {
                value: "task",
                text: "Tác vụ",
                align: "center",
                sortable: false,
            },
            { value: "actions", text: "Chức năng", align: "center", sortable: false },
        ],

        list: [],
        pageInfo: {
            pageIndex: 1,
            pageSize: 50,
        },
        pageInput: 1,
        totalPage: 0,
        totalRecord: 0,
        isLoading: false,
        search: {
            teacherId: null,
            examSessionCode: null,
            paymentFeeStatus: null,
            examIds: null,
        },
        examList: [],
        examSessionList: [],
        teacherList: [],
        selectedItem: {},
        totalMoney: 0,
        isDetailModalOpen: false,
        loadingExport: false,
    }),

    computed: {
        teacherOptions() {
            return (this.teacherList || []).map(item => ({
                text: `${item.code} - ${item.fullName || item.name}`,
                value: item.id || item.code,
            }))
        },
        examOptions() {
            return (this.examList || []).map(item => ({
                text: item.name || item.code,
                value: item.id || item.code,
            }))
        },
        retakeCourseOptions() {
            return (this.examSessionList || []).map(item => ({
                text: item.name || item.code,
                value: item.code || item.id,
            }))
        },
        totalPages() {
            const total = Math.ceil(this.totalRecord / this.pageInfo.pageSize)
            return total > 0 ? total : 1
        },
        visiblePages() {
            const pages = []
            for (let i = 1; i <= this.totalPages; i++) pages.push(i)
            return pages
        },
    },

    async mounted() {
        if (this.$store) {
            this.$store.commit('SET_PAGE_TITLE', 'Danh sách báo cáo thanh toán GV')
        }
        await Promise.all([
            this.fetchTeachers(),
            this.fetchExams(),
            this.fetchRetakeCourses(),
            this.fetchData(),
        ])
    },

    methods: {
        async fetchTeachers() {
            try {
                const res = await feeTeacherService.getTeacherList({ status: 'ACTIVE', channel: 'CMS' })
                const data = res?.data !== undefined ? res.data : res
                this.teacherList = data?.data || data?.items || (Array.isArray(data) ? data : [])
            } catch (err) {
                console.error('Lỗi tải danh sách giảng viên:', err)
            }
        },

        async fetchExams() {
            try {
                const res = await feeTeacherService.getExamList({ pageIndex: 1, pageSize: 100, status: 'ACTIVE', channel: 'CMS' })
                const data = res?.data !== undefined ? res.data : res
                this.examList = data?.data || data?.items || (Array.isArray(data) ? data : [])
            } catch (err) {
                console.error('Lỗi tải đợt học lại:', err)
            }
        },

        async fetchRetakeCourses() {
            try {
                const res = await feeTeacherService.getRetakeCourseList({ pageIndex: 1, pageSize: 100, channel: 'CMS' })
                const data = res?.data !== undefined ? res.data : res
                this.examSessionList = data?.data || data?.items || (Array.isArray(data) ? data : [])
            } catch (err) {
                console.error('Lỗi tải lớp học lại:', err)
            }
        },

        formatCurrency(val) {
            if (val === null || val === undefined) return '0đ';
            return `${Number(val).toLocaleString('en-US')}đ`;
        },

        async fetchData() {
            try {
                this.isLoading = true;
                const params = {
                    pageIndex: this.pageInfo.pageIndex,
                    pageSize: this.pageInfo.pageSize,
                    teacherId: this.search?.teacherId || undefined,
                    examSessionCode: this.search?.examSessionCode || undefined,
                    paymentFeeStatus: this.search?.paymentFeeStatus || undefined,
                    examIds: this.search?.examIds || undefined,
                    channel: 'CMS',
                };

                const res = await feeTeacherService.getByExam(params);
                const raw = res?.data !== undefined ? res.data : res;
                
                let items = [];
                if (Array.isArray(raw)) {
                    items = raw;
                } else if (Array.isArray(raw?.data)) {
                    items = raw.data;
                } else if (Array.isArray(raw?.items)) {
                    items = raw.items;
                } else if (Array.isArray(raw?.data?.items)) {
                    items = raw.data.items;
                }

                this.list = items.map((item) => ({
                    ...item,
                    teacher: {
                        code: item.teacher?.code || item.code || '---',
                        name: item.teacher?.fullName || item.teacher?.name || item.fullName || '---',
                    },
                    bankName: item.bankName || item.teacher?.bankName || '',
                    bankAccount: item.bankAccount || item.teacher?.bankAccount || '',
                    bankNumber: item.bankNumber || item.teacher?.bankNumber || '',

                    examSessions: Array.isArray(item.examSessions) && item.examSessions.length > 0
                        ? item.examSessions.map(es => es.code).filter(Boolean).join(', ')
                        : (item.courseName || item.examSessionCode || '---'),

                    totalFee: item.totalFee !== undefined ? Number(item.totalFee) : 0,
                    paymentFeeStatus: item.paymentFeeStatus || 'WAIT_PAID',
                }));

                this.totalRecord = raw?.totalRecords || raw?.data?.totalRecords || this.list.length;
                this.totalMoney = raw?.totalAmount || raw?.data?.totalAmount || 0;
                this.totalPage = Math.ceil(this.totalRecord / this.pageInfo.pageSize) || 1;
            } catch (err) {
                console.error('Lỗi tải dữ liệu:', err);
                this.list = [];
            } finally {
                this.isLoading = false;
            }
        },

        onSearch() {
            this.pageInfo.pageIndex = 1
            this.pageInput = 1
            this.fetchData()
        },

        resetFilters() {
            this.search = {
                teacherId: null,
                examSessionCode: null,
                paymentFeeStatus: null,
                examIds: null,
            }
            this.pageInfo.pageIndex = 1
            this.pageInput = 1
            this.fetchData()
        },

        changePage(p) {
            if (p >= 1 && p <= this.totalPages) {
                this.pageInfo.pageIndex = p
                this.pageInput = p
                this.fetchData()
            }
        },

        goToPage(val) {
            let target = parseInt(val, 10)
            if (isNaN(target) || target < 1) target = 1
            if (target > this.totalPages) target = this.totalPages
            this.pageInfo.pageIndex = target
            this.pageInput = target
            this.fetchData()
        },

        onItemsPerPageChange(val) {
            this.pageInfo.pageSize = Number(val) || 50
            this.pageInfo.pageIndex = 1
            this.pageInput = 1
            this.fetchData()
        },

        async exportExcel() {
            try {
                this.loadingExport = true;
                
                let examIdsParam = '';
                if (this.search.examIds) {
                    examIdsParam = Array.isArray(this.search.examIds) 
                        ? this.search.examIds.join(',') 
                        : this.search.examIds;
                } else if (this.examList && this.examList.length > 0) {
                    examIdsParam = this.examList.map(item => item.id || item.code).join(',');
                } else {
                    if (this.$toast) {
                        this.$toast.warning('Vui lòng chọn đợt học lại trước khi xuất file!');
                    } else {
                        alert('Vui lòng chọn đợt học lại trước khi xuất file!');
                    }
                    return;
                }

                const params = {
                    search: '',
                    fromTime: '',
                    toTime: '',
                    examIds: examIdsParam,
                    channel: 'CMS',
                };

                const res = await feeTeacherService.exportResult(params);
                const downloadUrl = res?.data?.url || res?.url || res?.data;
                if (downloadUrl && this.$download) {
                    this.$download(downloadUrl);
                }
            } catch (error) {
                console.error('Lỗi xuất file:', error);
                const errorMessage = error?.response?.data?.message || error?.message || 'Vui lòng chọn kỳ thi lại!';
                if (this.$toast) {
                    this.$toast.error(errorMessage);
                } else {
                    alert(errorMessage);
                }
            } finally {
                this.loadingExport = false;
            }
        },

        async exportItemExcel(item) {
            try {
                this.isLoading = true;
                const res = await feeTeacherService.exportExcelSummary(item.id);
                const downloadUrl = res?.data?.url || res?.url || res?.data;
                if (downloadUrl && typeof downloadUrl === 'string' && downloadUrl.startsWith('http')) {
                    if (this.$download) {
                        this.$download(downloadUrl);
                    }
                } else if (res && this.$download && (res instanceof Blob || res.data instanceof Blob)) {
                    const blob = res instanceof Blob ? res : res.data;
                    const url = window.URL.createObjectURL(blob);
                    this.$download(url);
                }
            } catch (error) {
                console.error('Lỗi xuất file excel dòng:', error);
                const errorMessage = error?.response?.data?.message || error?.message || 'Không thể xuất file do chưa có định mức giảng viên!';
                if (this.$toast) {
                    this.$toast.error(errorMessage);
                } else {
                    alert(errorMessage);
                }
            } finally {
                this.isLoading = false;
            }
        },

        formatDate(dateStr) {
            if (!dateStr) return '---';
            if (dateStr.includes(' ')) {
                return dateStr.split(' ')[0];
            }
            return dateStr;
        },

        async viewDetail(item) {
            try {
                this.isLoading = true;
                const itemId = item.id || item.decisionTeacherJobFeeId;
                const res = await feeTeacherService.getDetailById(itemId, { channel: 'CMS' });
                
                const rawData = res?.data !== undefined ? res.data : res;
                this.selectedItem = rawData?.data || rawData || item;
                this.isDetailModalOpen = true;
            } catch (err) {
                console.error('Lỗi tải chi tiết báo cáo:', err);
                this.selectedItem = item;
                this.isDetailModalOpen = true;
            } finally {
                this.isLoading = false;
            }
        },
    },
}
</script>

<style scoped>
.teacher-fee-page {
  min-height: 100dvh;
  background-color: #ffffff;
}

.top-filter-bar {
  background-color: #ffffff;
}

.filter-item {
  min-width: 150px;
  max-width: 200px;
}

.select-md {
  width: 180px;
}

:deep(.custom-outlined-input .v-input__control .v-input__slot) {
  min-height: 38px !important;
  border-radius: 6px !important;
}

:deep(.custom-outlined-input .v-select__selection) {
  font-size: 14px;
}

.action-btn {
  min-width: 38px !important;
  width: 38px;
  height: 38px;
}

.table-scroll-container {
  overflow-x: auto;
  width: 100%;
  background-color: #ffffff;
}

.table-scroll-container >>> th {
  position: sticky !important;
  top: 0;
  z-index: 2;
  background-color: #f5f5f5 !important;
}

:deep(.v-data-table) {
  height: auto !important;
}

:deep(.v-data-table__wrapper) {
  max-height: none !important;
  overflow-y: visible !important;
}

.sticky-pagination-bar {
  position: sticky;
  bottom: 0;
  z-index: 4;
  border-top: 1px solid #e0e0e0;
  background-color: #ffffff;
  width: 100%;
  border-bottom-left-radius: inherit;
  border-bottom-right-radius: inherit;
}

:deep(.pagination-input .v-input__control .v-input__slot) {
  min-height: 36px !important;
  max-height: 36px !important;
  border-radius: 4px !important;
}

:deep(.pagination-input input) {
  text-align: center;
  font-size: 14px;
}

.cursor-pointer {
  cursor: pointer;
}

::v-deep .v-data-footer {
  display: none !important;
}

@media (max-width: 768px) {
  .teacher-fee-page {
    max-width: 100vw;
    overflow-x: hidden;
  }

  .sticky-pagination-bar {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 8px;
    padding: 8px !important;
  }

  .filter-item,
  .select-md {
    width: 100% !important;
    max-width: none !important;
  }

  .mobile-break-text,
  .table-scroll-container >>> .v-data-table__mobile-row__cell {
    max-width: 62%;
    overflow-wrap: anywhere;
    word-break: break-word;
  }
}
</style>