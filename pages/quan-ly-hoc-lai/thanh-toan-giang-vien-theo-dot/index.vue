<script>
import BaseConfirmModal from "~/components/Base/ConfirmModal.vue";
import ChangeableStatus from "~/components/Base/ChangeableStatus.vue";
// import paymentTeacherExamServices from "~/services/paymentTeacherExamServices";
import teacherServices from "~/services/teacherServices";
import decisionTeacherJobFeeServices from "~/services/re-learning/decisionTeacherJobFeeServices";
import ReLearingPaymentTeacherExamDetail from "~/components/ReLearingPaymentTeacherExam/Detail.vue";
import retakeCourseServices from "~/services/retakeCourseServices";
import { sendMailPaymentTeacherList, exportedSummaryList } from "~/consts/list";

const INIT_PAGE_INFO = {
    pageIndex: 1,
    pageSize: 50,
};

const INIT_SEARCH = {
    examSessionCode: "",
    paymentFeeStatus: "",
    examSessionId: null,
    teacherId: null,
};

export default {
    components: {
        BaseConfirmModal,
        ChangeableStatus,
        ReLearingPaymentTeacherExamDetail,
    },
    data: () => ({
        headers: [
            { value: "stt", text: "STT", sortable: false },
            { value: "examName", text: "Đợt học lại", sortable: false },
            { value: "name", text: "Tên đợt thanh toán", sortable: false },
            { value: "code", text: "Mã đợt thanh toán", sortable: false },
            { value: "paymentDate", text: "Ngày thanh toán", sortable: false },
            { value: "examSessionsCode", text: "Mã lớp học lại", sortable: false },
            { value: "fileName", text: "File thanh toán", sortable: false },
            { value: "totalFee", text: "Tổng phí", sortable: false },
            { value: "totalTaxFee", text: "Thuế thu nhập cá nhân", sortable: false },
            { value: "paymentFeeStatus", text: "Trạng thái", align: "center", sortable: false },
            { value: "isSendEmail", text: "Trạng thái gửi mail", align: "center", sortable: false },
            {
                value: "isExportedSummary",
                text: "T.T xuất file tổng hợp",
                align: "center",
                sortable: false,
            },
            { value: "actions", text: "Chức năng", align: "center", sortable: false },
        ],
        paymentTeacherStatusList: [
            { value: "WAIT_PAID", text: "Chờ thanh toán", color: "primary" },
            { value: "COMPLETE_PAID", text: "Đã thanh toán", color: "green" },
            { value: "CANCELED_PAID", text: "Hủy thanh toán", color: "red" },
        ],
        sendMailPaymentTeacherList,
        exportedSummaryList,
        list: [],
        pageInfo: { ...INIT_PAGE_INFO },
        totalPage: 0,
        totalRecord: 0,
        isLoading: false,
        openDelete: false,
        search: { ...INIT_SEARCH },
        isOpenAdd: false,
        selectedItem: {},
        examSessionList: [],
        loadingExport: false,
        teacherList: [],
        openSendMail: false,
        isOpenDetail: false,
    }),
    
    // Đảm bảo hook created gọi trực tiếp hàm getList()
    created() {
        console.log("Component created - Đang gọi API...");
        this.getList();
        this.getRetakeCourseList();
        this.getTeachers();
    },

    methods: {
        // API chính để load danh sách
        async getList() {
            try {
                this.isLoading = true;
                const params = {
                    pageIndex: this.pageInfo.pageIndex,
                    pageSize: this.pageInfo.pageSize,
                    examSessionCode: this.search.examSessionCode || undefined,
                    paymentFeeStatus: this.search.paymentFeeStatus || undefined,
                    channel: "CMS",
                };

                const res = await decisionTeacherJobFeeServices.getListExam(params);
                console.log("CHI TIẾT API RESPONSE:", res);

                // Hỗ trợ bắt mọi dạng cấu trúc trả về của backend (res.data.data, res.data.items, res.data, hoặc chính res)
                const responseData = res?.data !== undefined ? res.data : res;

                if (Array.isArray(responseData)) {
                    this.list = responseData;
                } else if (responseData && Array.isArray(responseData.data)) {
                    this.list = responseData.data;
                } else if (responseData && Array.isArray(responseData.items)) {
                    this.list = responseData.items;
                } else if (responseData && responseData.result && Array.isArray(responseData.result.items)) {
                    this.list = responseData.result.items;
                } else {
                    this.list = [];
                }

                this.totalPage = responseData?.totalPages || responseData?.totalPage || 1;
                this.totalRecord = responseData?.totalRecords || responseData?.total || this.list.length;
            } catch (e) {
                console.error("Lỗi gọi API getList:", e);
                this.list = [];
            } finally {
                this.isLoading = false;
            }
        },

        async getTeachers() {
            try {
                const res = await teacherServices.getAll({ status: "ACTIVE", channel: "CMS" });
                const teacherData = res?.data || res;
                const dataList = teacherData?.data || teacherData?.items || (Array.isArray(teacherData) ? teacherData : []);
                this.teacherList = dataList.map((item) => ({
                    value: item.id,
                    text: (item.fullName || '') + (item.code ? " - " + item.code : ''),
                }));
            } catch (e) {
                console.error('Lỗi tải giảng viên:', e);
            }
        },

        async getRetakeCourseList() {
            try {
                const res = await retakeCourseServices.getList({ pageSize: 100, pageIndex: 1, channel: "CMS" });
                const retakeData = res?.data || res;
                const dataList = retakeData?.data || retakeData?.items || (Array.isArray(retakeData) ? retakeData : []);
                this.examSessionList = dataList.map((item) => ({
                    id: item.id,
                    name: item?.examClass || item?.name,
                    code: item?.code,
                }));
            } catch (e) {
                console.error('Lỗi tải lớp học lại:', e);
            }
        },

        handleReset() {
            this.search = { ...INIT_SEARCH };
            this.pageInfo = { ...INIT_PAGE_INFO };
            this.getList();
        },
        handleSearch() {
            this.pageInfo.pageIndex = 1;
            this.getList();
        },
        changePage(val) {
            this.pageInfo.pageIndex = val;
            this.getList();
        },
        changePageSize(val) {
            this.pageInfo.pageIndex = 1;
            this.pageInfo.pageSize = val;
            this.getList();
        },
        openAdd() {
            this.$refs.ReLearingPaymentTeacherExamAdd.open = true;
        },
        openDetail(item) {
            this.selectedItem = item;
            this.isOpenDetail = true;
        },
        handleClick(item) {
            this.selectedItem = item;
            this.openDelete = true;
        },
        async handleDelete() {
            const res = await decisionTeacherJobFeeServices.deleteExam(this.selectedItem.id);
            if (res.success) {
                this.$showSuccess("Xoá thành công đợt thanh toán");
                this.getList();
            }
            this.openDelete = false;
        },
        async handleChangeStatus(paymentFeeStatus, item) {
            try {
                const res = await decisionTeacherJobFeeServices.changeStatusExam(
                    item.id,
                    paymentFeeStatus.value
                );
                if (res.success) {
                    this.$showSuccess("Cập nhật trạng thái thành công");
                    this.getList();
                }
            } catch (e) {
                console.error(e);
            }
        },
    },
};
</script>

<template>
    <div>
        <v-data-table
            :headers="headers"
            :items="list"
            :items-per-page="pageInfo.pageSize"
            :loading="isLoading"
            checkbox-color="primary"
            fixed-header
            hide-default-footer
            item-key="id"
            loading-text="Đang tải dữ liệu..."
            max-height="calc(100vh - 300px)"
            no-data-text="Không có dữ liệu"
        >
            <template #top>
                <div class="px-4 pt-4">
                    <!-- HÀNG 1: TIÊU ĐỀ VÀ TỔNG SỐ BẢN GHI -->
                    <v-row class="mb-3" align="center">
                        <v-col class="fs-17 fw-500" cols="12" md="4">
                            Danh sách thanh toán giảng viên theo đợt
                            <span class="primary--text">({{ totalRecord }})</span>
                        </v-col>
                    </v-row>

                    <!-- HÀNG 2: 4 Ô TÌM KIẾM ĐÚNG GIAO DIỆN & NÚT CÔNG CỤ -->
                    <v-row dense align="center" class="mb-3">
                        <v-col cols="12" sm="6" md="3" class="mb-2 mb-md-0">
                            <base-text-field
                                v-model="search.examSessionCode"
                                hide-details
                                dense
                                outlined
                                label="Mã lớp học lại"
                            ></base-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="3" class="mb-2 mb-md-0">
                            <base-select
                                v-model="search.teacherId"
                                hide-details
                                dense
                                outlined
                                item-text="text"
                                item-value="value"
                                :items="teacherList"
                                label="Giảng viên"
                                clearable
                            ></base-select>
                        </v-col>
                        <v-col cols="12" sm="6" md="2" class="mb-2 mb-md-0">
                            <base-select
                                v-model="search.examSessionId"
                                hide-details
                                dense
                                outlined
                                item-text="code"
                                item-value="id"
                                :items="examSessionList"
                                label="Lớp học lại"
                                clearable
                            ></base-select>
                        </v-col>
                        <v-col cols="12" sm="6" md="2" class="mb-2 mb-md-0">
                            <base-select
                                v-model="search.paymentFeeStatus"
                                hide-details
                                dense
                                outlined
                                item-text="text"
                                item-value="value"
                                :items="paymentTeacherStatusList"
                                label="Trạng thái"
                                clearable
                            ></base-select>
                        </v-col>

                        <v-col cols="12" md="2" class="d-flex align-center justify-end">
                            <v-tooltip bottom>
                                <template #activator="{ on, attrs }">
                                    <v-icon
                                        color="primary"
                                        class="cursor-pointer mr-2"
                                        v-bind="attrs"
                                        @click="handleReset"
                                        v-on="on"
                                    >mdi-refresh</v-icon>
                                </template>
                                <span>Reset bộ lọc</span>
                            </v-tooltip>

                            <v-tooltip bottom>
                                <template #activator="{ on, attrs }">
                                    <v-btn
                                        color="primary"
                                        elevation="0"
                                        class="px-3 mr-2"
                                        v-bind="attrs"
                                        @click="handleSearch"
                                        v-on="on"
                                    >
                                        <v-icon left>mdi-magnify</v-icon>
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
                                        @click="openAdd"
                                        v-on="on"
                                    >
                                        <v-icon>mdi-plus</v-icon>
                                    </v-btn>
                                </template>
                                <span>Thêm mới</span>
                            </v-tooltip>
                        </v-col>
                    </v-row>
                </div>
            </template>

            <template #[`item.stt`]="{ index }">
                <span>{{ $getStt ? $getStt(index, pageInfo) : (pageInfo.pageIndex - 1) * pageInfo.pageSize + index + 1 }}</span>
            </template>
            <template #[`item.paymentDate`]="{ item }">
                <span>{{ $formatDate ? $formatDate(item.paymentDate) : item.paymentDate }}</span>
            </template>
            <template #[`item.totalFee`]="{ item }"> 
                {{ $formatNumber ? $formatNumber(item.totalFee) : item.totalFee }}đ 
            </template>
            <template #[`item.totalTaxFee`]="{ item }">
                {{ $formatNumber ? $formatNumber(item.totalTaxFee) : item.totalTaxFee }}đ
            </template>
            <template #[`item.isSendEmail`]="{ item }">
                <BaseStatusItem
                    :status="item.isSendEmail"
                    :status-list="sendMailPaymentTeacherList"
                />
            </template>
            <template #[`item.isExportedSummary`]="{ item }">
                <BaseStatusItem
                    :status="item.isExportedSummary"
                    :status-list="exportedSummaryList"
                />
            </template>
            <template #[`item.fileName`]="{ item }">
                <v-btn
                    :disabled="!item.fileUrl"
                    color="primary"
                    icon
                    large
                    @click="$download ? $download(item.fileUrl) : null"
                >
                    <v-icon>mdi-file-download-outline</v-icon>
                </v-btn>
            </template>
            <template #[`item.paymentFeeStatus`]="{ item }">
                <ChangeableStatus
                    :status="item.paymentFeeStatus"
                    :status-list="paymentTeacherStatusList"
                    @changeStatus="handleChangeStatus($event, item)"
                />
            </template>
            <template #[`item.examSessionsCode`]="{ item }">
                <span>
                    {{
                        item.examSessions
                            ?.map((session) => session.code)
                            .filter(Boolean)
                            .join(", ")
                    }}
                </span>
            </template>

            <template #[`item.actions`]="{ item }">
                <v-menu bottom nudge-bottom="20" left>
                    <template #activator="{ on, attrs }">
                        <v-btn icon v-bind="attrs" v-on="on" :loading="loadingExport">
                            <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                    </template>

                    <v-list dense>
                        <v-list-item @click="openDetail(item)">
                            <v-list-item-icon class="mr-2">
                                <v-icon color="cyan" size="20">mdi-eye</v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>Chi tiết</v-list-item-title>
                        </v-list-item>

                        <v-list-item @click="handleExportTotal(item)">
                            <v-list-item-icon class="mr-2">
                                <v-icon color="green" size="20">mdi-export</v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>Xuất Excel file tổng hợp </v-list-item-title>
                        </v-list-item>

                        <v-list-item @click="handleExportDetail(item)">
                            <v-list-item-icon class="mr-2">
                                <v-icon color="green" size="20">mdi-export</v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>Xuất Excel file chi tiết </v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="handleExportDetailShort(item)">
                            <v-list-item-icon class="mr-2">
                                <v-icon color="green" size="20">mdi-export</v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>Xuất Excel file chi tiết (Rút gọn)</v-list-item-title>
                        </v-list-item>
                        <v-list-item
                            v-if="item.paymentFeeStatus === 'COMPLETE_PAID'"
                            @click="handleSendMail(item)"
                        >
                            <v-list-item-icon class="mr-2">
                                <v-icon color="purple" size="20">mdi-email</v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>Gửi mail thông báo</v-list-item-title>
                        </v-list-item>
                        <v-list-item
                            v-if="item.paymentFeeStatus === 'WAIT_PAID'"
                            @click="handleUpdate(item)"
                        >
                            <v-list-item-icon class="mr-2">
                                <v-icon color="warning" size="20">mdi-pencil</v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>Cập nhật</v-list-item-title>
                        </v-list-item>
                        <v-list-item color="teal" @click="handleClick(item)">
                            <v-list-item-icon class="mr-2">
                                <v-icon color="red" size="20">mdi-trash-can</v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>Xóa</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </template>
        </v-data-table>

        <div class="d-flex justify-space-between pa-3">
            <div class="d-flex"></div>
            <BasePagination
                :page="pageInfo.pageIndex"
                :page-count="totalPage"
                :page-size="pageInfo.pageSize"
                @changePage="changePage"
                @changePageSize="changePageSize"
            />
        </div>

        <ReLearingPaymentTeacherExamUpdate ref="ReLearingPaymentTeacherExamUpdate" />
        <ReLearingPaymentTeacherExamAdd ref="ReLearingPaymentTeacherExamAdd" />
        <ReLearingPaymentTeacherExamDetail
            v-if="isOpenDetail"
            :open="isOpenDetail"
            :data-item="selectedItem"
            @toggle="isOpenDetail = !isOpenDetail"
        />

        <base-confirm-modal
            :open="openDelete"
            @OK="handleDelete"
            @toggle="openDelete = !openDelete"
        >
            <template #content>
                <div>
                    Xác nhận xóa
                    <span class="primary--text font-weight-bold">{{ selectedItem?.name }}</span>
                </div>
            </template>
        </base-confirm-modal>

        <base-confirm-modal
            :open="openSendMail"
            @OK="confirmSendMail"
            @toggle="openSendMail = !openSendMail"
        >
            <template #content>
                <div>Xác nhận gửi mail thông báo tới giảng viên</div>
            </template>
        </base-confirm-modal>
    </div>
</template>

<style scoped>
:deep .v-data-table__wrapper {
    max-height: calc(100vh - 250px);
}
.cursor-pointer {
    cursor: pointer;
}
</style>