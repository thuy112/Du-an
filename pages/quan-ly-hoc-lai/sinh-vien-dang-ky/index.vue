<script>
import {
    payStatusList,
    registerStatusList,
    registerStudentStatusList,
    sendMailStatusList,
    browsingInfoList,
    listForBankStatus,
    paymentSendStatusList,
} from "~/consts/list";
import { IS_CEDF_INTEGRATED } from "~/consts/consts";
import registerRetakeCourseServices from "~/services/registerRetakeCourseServices";
import BaseImport from "~/components/Base/Import.vue";
import { registerStudentRetakeHeaders } from "~/consts/importHeaders";
import classServices from "~/services/classServices";
import majorServices from "~/services/majorServices";
import termService from "~/services/termService";
import BaseStatusItem from "~/components/Base/StatusItem.vue";
import retakeSessionServices from "~/services/retakeSessionServices";
import retakeCourseServices from "~/services/retakeCourseServices";
import RegisterRetakeCourseDetail from "~/components/RegisterRetakeCourse/Detail.vue";
import RegisterRetakeCourseAdd from "~/components/RegisterRetakeCourse/Add.vue";
import RegisterRetakeCourseUpdate from "~/components/RegisterRetakeCourse/Update.vue";
import RegisterRetakeCourseScoreboard from "~/components/RegisterRetakeCourse/Scoreboard.vue";
import RegisterRetakeCourseSendFeeList from "~/components/RegisterRetakeCourse/SendFeeList.vue";
import RegisterRetakeCourseExtendDeadline from "~/components/RegisterRetakeCourse/ExtendDeadline.vue";
import RegisterRetakeCourseConfirmApproval from "~/components/RegisterRetakeCourse/ConfirmApproval.vue";

const INIT_PAGE_INFO = {
    pageIndex: 1,
    pageSize: 50,
};

const INIT_SEARCH = {
    clazzId: null,
    confirmBy: null,
    courseId: null,
    registerStudentStatus: "",
    retakeCourseStatus: "",
    retakeSessionId: null,
    isListedForBank: null,
    search: "",
    studentId: "",
    majorId: null,
    feePaidStatus: null,
    sendMailStatus: null,
    examSessionId: null,
    termId: null,
};
export default {
    name: "Index",
    components: {
        RegisterRetakeCourseScoreboard,
        RegisterRetakeCourseAdd,
        RegisterRetakeCourseDetail,
        RegisterRetakeCourseUpdate,
        RegisterRetakeCourseSendFeeList,
        RegisterRetakeCourseExtendDeadline,
        RegisterRetakeCourseConfirmApproval,
        BaseStatusItem,
        BaseImport,
    },
    data: () => ({
        headers: [
            { value: "stt", text: "STT", sortable: false },
            { value: "info", text: "Thông tin sinh viên", sortable: false },
            {
                text: "Kỳ đăng ký học lại",
                align: "start",
                sortable: false,
                value: "retakeSession.code",
            },
            {
                value: "registerStudentTerms",
                text: "Học phần đăng ký",
                sortable: false,
                width: 150,
            },
            {
                value: "id",
                text: "Mã đơn đăng ký",
                sortable: false,
                width: 100,
            },
            {
                value: "createTime",
                text: "Thời gian đăng ký",
                align: "right",
                sortable: false,
            },
            {
                value: "classFinalizedAt",
                text: "Thời gian lập DS Lớp",
                align: "center",
                sortable: false,
            },
            {
                value: "paymentDeadline",
                text: "Hạn thanh toán",
                align: "center",
                sortable: false,
                width: 110,
            },
            {
                value: "totalFee",
                text: "Tổng học phí",
                sortable: false,
                align: "right",
            },
            {
                value: "feePaidStatus",
                text: "Trạng thái trả học phí",
                align: "center",
                sortable: false,
            },
            {
                value: "paymentSendStatusName",
                text: "Trạng thái gửi HP",
                align: "center",
                sortable: false,
            },
            {
                value: "paymentSendInfo",
                text: "Thời gian và CB gửi Thu phí",
                align: "center",
                sortable: false,
                width: 170,
            },
            {
                value: "isListedForBank",
                text: "TT thêm DS ngân hàng",
                align: "center",
                sortable: false,
            },
            {
                value: "sendMailStatus",
                text: "Trạng thái gửi email",
                align: "center",
                sortable: false,
            },
            {
                value: "registerStudentStatus",
                text: "Trạng thái duyệt đơn",
                align: "center",
                sortable: false,
            },
            {
                value: "actions",
                text: "Chức năng",
                align: "center",
                sortable: false,
            },
        ],
        listStatus: [
            { status: "Không hoạt động", value: "INACTIVE" },
            { status: "Hoạt động", value: "ACTIVE" },
        ],
        list: [],
        pageInfo: {
            ...INIT_PAGE_INFO,
        },
        totalPage: 0,
        totalRecord: 0,
        isLoading: false,
        registerStatusList,
        registerStudentStatusList,
        sendMailStatusList,
        payStatusList,
        browsingInfoList,
        listForBankStatus,
        paymentSendStatusList,
        majorList: [],
        termList: [],
        search: { ...INIT_SEARCH },
        isOpenAdd: false,
        isOpenUpdate: false,
        isOpenSuccess: false,
        successMessage: "",
        loadingExport: false,
        loadingExportNotPaid: false,
        loadingExportFeePreview: false,
        isOpenDetail: false,
        isOpenScoreboard: false,
        selectedItem: {},
        openImport: false,
        loadingImport: false,
        templateErrorUrl: "",
        openNotifyEmail: false,
        openNotifyEmailRefuse: false,
        classList: [],
        retakeSessionList: [],
        retakeCourseList: [],
        templateUrl: "",
        registerStudentRetakeHeaders,
        registerStudentTermIds: [],
        openConfirmApproval: false,
        openConfirmRejection: false,
        openConfirmPending: false,
        selectedItemForAction: {},
        selectedItems: [],
        openSendFeeList: false,
        openExtendDeadline: false,
        isCedfIntegrated: IS_CEDF_INTEGRATED,
    }),
    computed: {
        // Cột chỉ hiển thị khi đã tích hợp CEDF (IS_CEDF_INTEGRATED)
        visibleHeaders() {
            return this.headers.filter((header) => !header.cedfOnly || this.isCedfIntegrated);
        },
        isShowExportResult() {
            if (!this.list || this.list.length === 0) {
                return false;
            }
            return this.list.some((item) => item.isListedForBank !== "YES");
        },
    },
    created() {
        this.getRetakeSession();
        this.getRetakeCourseList();
        this.getList();
        this.getClassList();
        this.getMajorList();
        this.getTerms();
        this.getTemplate();
    },
    methods: {
        async getRetakeCourseList() {
            try {
                const res = await retakeCourseServices.getList({ pageIndex: 1, pageSize: 100 });
                if (res.success) this.retakeCourseList = res.data?.data || res.data || [];
            } catch (e) {
                console.error(e);
            }
        },
        async getRetakeSession() {
            const res = await retakeSessionServices.getAll();
            if (res.success) this.retakeSessionList = res.data;
        },
        async getClassList() {
            const res = await classServices.getListAll();
            if (res.success) this.classList = res?.data;
        },
        async getMajorList() {
            const res = await majorServices.getAll({ status: "ACTIVE" });
            if (res.success) this.majorList = res?.data || [];
        },
        async getTerms() {
            try {
                const res = await termService.getAll({ status: "ACTIVE" });
                if (res.success) this.termList = res?.data || [];
            } catch (e) {
                console.error(e);
            }
        },
        async getTemplate() {
            const res = await registerRetakeCourseServices.getTemplate();
            if (res.success) this.templateUrl = res.data.url;
        },
        async handleNotifyEmail() {
            const res = await registerRetakeCourseServices.notifyEmail({
                RetakeSessionId: this.search.retakeSessionId,
            });
            if (res.success) {
                this.$showSuccess("Thông báo nhắc học phí thành công");
                this.openNotifyEmail = false;
                this.getList();
            }
        },
        async handleNotifyEmailRefuse() {
            this.openNotifyEmailRefuse = false;
            const res = await registerRetakeCourseServices.refusedEmail();
            if (res.success) {
                this.$showSuccess("Thông báo từ chối đăng ký học lại thành công");
                this.getList();
            }
        },
        async handleSave(data) {
            this.loadingImport = true;
            const payload = {
                registerStudentRetakeImport: [...data],
                registerStudentTermIds: this.registerStudentTermIds?.length
                    ? this.registerStudentTermIds
                    : data.map((item) => item.registerStudentTermId),
            };
            const res = await registerRetakeCourseServices.confirmImport(payload);
            if (res.success) {
                this.$showSuccess("Import dữ liệu thành công");
                await this.getList();
                this.openImport = false;
            }
            this.loadingImport = false;
        },
        async handleImport(file) {
            this.loadingImport = true;
            const res = await registerRetakeCourseServices.checkImport(file);
            if (res.success) {
                const importData =
                    res?.data?.objects || res?.data?.object?.registerStudentRetakeImport || [];
                // Lưu danh sách registerStudentTermIds trả về từ API để dùng khi confirm
                this.registerStudentTermIds =
                    res?.data?.object?.registerStudentTermIds ||
                    res?.data?.registerStudentTermIds ||
                    [];

                this.$refs.Import.list = [...importData];

                if (res?.data?.status === 1) {
                    this.templateErrorUrl = "";
                    this.$refs.Import.showFile = false;
                    this.$refs.Import.headers = [...registerStudentRetakeHeaders];
                    this.loadingImport = false;
                    return;
                }

                let headerErrors = [...registerStudentRetakeHeaders];
                for (const item of importData) {
                    if (item.amountPaid) item.amountPaid = this.$money(item.amountPaid);
                    if (item.amountDue) item.amountDue = this.$money(item.amountDue);
                    if (item.remainingAmount)
                        item.remainingAmount = this.$money(item.remainingAmount);
                    if (item.messErrors) {
                        const errors = Array.isArray(item.messErrors)
                            ? item.messErrors.join("<br>")
                            : item.messErrors;
                        item.messageError = errors + "<br>";
                    }
                }

                headerErrors = headerErrors.toSpliced(1, 0, {
                    value: "messageError",
                    text: "Thông tin lỗi",
                    sortable: false,
                    width: 250,
                    cellClass: "error--text",
                });
                this.$refs.Import.headers = [...headerErrors];
                this.$refs.Import.errMsg = res?.data?.message;
                this.templateErrorUrl = res?.data?.file?.url;
                this.$showWarning(res?.data?.message);
            }

            this.loadingImport = false;
        },
        handleUpdate(item) {
            this.selectedItem = item;
            this.isOpenUpdate = true;
        },
        openDetail(item) {
            this.selectedItem = item;
            this.isOpenDetail = true;
        },

        async getList() {
            try {
                this.isLoading = true;
                const res = await registerRetakeCourseServices.getList({
                    ...this.pageInfo,
                    ...this.search,
                });
                if (res.success) {
                    this.list = res.data.data;
                    this.totalPage = res.data.totalPages;
                    this.totalRecord = res.data.totalRecords;
                }
            } catch (e) {
                console.error(e);
            }
            this.isLoading = false;
        },
        async handleExport() {
            try {
                this.loadingExport = true;
                const res = await registerRetakeCourseServices.export({
                    ...this.pageInfo,
                    ...this.search,
                });
                if (res.success && res.data?.url) {
                    this.$download(res.data.url);
                    await this.getList();
                } else if (res.success) {
                    this.$showWarning("Không có file để tải");
                }
            } catch (e) {
                console.error(e);
            }
            this.loadingExport = false;
        },
        // Xuất file rà soát học phí: theo tích chọn nếu có, ngược lại theo bộ lọc hiện tại
        async handleExportFeePreview() {
            try {
                this.loadingExportFeePreview = true;
                const ids = this.selectedItems.map((item) => item.id).join(",");
                const res = await registerRetakeCourseServices.exportFeePreview({
                    ...this.pageInfo,
                    ...this.search,
                    ...(ids ? { ids } : {}),
                });
                if (res.success && res.data?.url) {
                    this.$download(res.data.url);
                } else if (res.success) {
                    this.$showWarning("Không có file để tải");
                }
            } catch (e) {
                console.error(e);
            }
            this.loadingExportFeePreview = false;
        },
        async handleExportNotPaid() {
            try {
                this.loadingExportNotPaid = true;
                const res = await registerRetakeCourseServices.exportNotPaid({
                    ...this.pageInfo,
                    ...this.search,
                });
                if (res.success && res.data?.url) {
                    this.$download(res.data.url);
                } else if (res.success) {
                    this.$showWarning("Không có file để tải");
                }
            } catch (e) {
                console.error(e);
            }
            this.loadingExportNotPaid = false;
        },
        changePageSize(val) {
            this.pageInfo.pageIndex = 1;
            this.pageInfo.pageSize = val;
            this.getList();
        },
        changePage(val) {
            this.pageInfo.pageIndex = val;
            this.getList();
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

        handleRegisterSuccess() {
            this.handleSearch();
            this.successMessage = "Bạn đã đăng ký học lại thành công !";
            this.isOpenSuccess = true;
        },

        handleUpdateSuccess() {
            this.handleSearch();
            this.successMessage = "Bạn đã cập nhật đăng ký học lại thành công !";
            this.isOpenSuccess = true;
        },

        openAdd() {
            this.isOpenAdd = true;
        },
        openNotifyEmailRefuseModal() {
            this.openNotifyEmailRefuse = true;
        },

        async handleConfirmRegistration(item) {
            try {
                const res = await registerRetakeCourseServices.changeStatus({
                    id: item.id,
                    registerStudentStatus: "CONFIRMED",
                });
                if (res.success) {
                    this.$showSuccess("Xác nhận duyệt đơn thành công");
                    this.getList();
                }
            } catch (e) {
                console.error(e);
            }
        },

        async handleRejectRegistration(item) {
            try {
                const res = await registerRetakeCourseServices.changeStatus({
                    id: item.id,
                    registerStudentStatus: "REJECTED",
                });
                if (res.success) {
                    this.$showSuccess("Từ chối duyệt đơn thành công");
                    this.getList();
                }
            } catch (e) {
                console.error(e);
            }
        },

        // Phương thức chuyển về trạng thái chờ duyệt
        async handlePendingRegistration(item) {
            try {
                const res = await registerRetakeCourseServices.changeStatus({
                    id: item.id,
                    registerStudentStatus: "AWAITING_CONFIRMATION",
                });
                if (res.success) {
                    this.$showSuccess("Chuyển về trạng thái chờ duyệt thành công");
                    this.getList();
                }
            } catch (e) {
                console.error(e);
            }
        },

        openConfirmApprovalModal(item) {
            this.selectedItemForAction = item;
            this.openConfirmApproval = true;
        },

        openConfirmRejectionModal(item) {
            this.selectedItemForAction = item;
            this.openConfirmRejection = true;
        },

        openConfirmPendingModal(item) {
            this.selectedItemForAction = item;
            this.openConfirmPending = true;
        },

        async handleConfirmRegistrationWithModal() {
            this.openConfirmApproval = false;
            await this.handleConfirmRegistration(this.selectedItemForAction);
        },

        async handleRejectRegistrationWithModal() {
            this.openConfirmRejection = false;
            await this.handleRejectRegistration(this.selectedItemForAction);
        },

        async handlePendingRegistrationWithModal() {
            this.openConfirmPending = false;
            await this.handlePendingRegistration(this.selectedItemForAction);
        },

        getStatusText(status) {
            const statusItem = this.registerStatusList.find((item) => item.value === status);
            return statusItem ? statusItem.text : status;
        },

        extractYear(source) {
            if (!source) return "";
            if (typeof source === "string") {
                const dmy = source.match(/^\s*\d{1,2}\/\d{1,2}\/(\d{4})/);
                if (dmy) return dmy[1];
                const ymd = source.match(/(\d{4})[-/]\d{1,2}[-/]\d{1,2}/);
                if (ymd) return ymd[1];
            }
            const d = new Date(source);
            const y = d.getFullYear();
            return isNaN(y) ? "" : y;
        },
        formatRegisterCode(item) {
            if (!item) return "";
            if (item.registerCode) return item.registerCode;
            const year = this.extractYear(
                item.createTime || item.createdTime || item.createdAt
            );
            if (year) return `HL_${year}_${item.id}`;
            return `HL_${item.id}`;
        },

        formatDeadline(value) {
            if (!value) return "-";
            const d = new Date(value);
            if (isNaN(d.getTime())) return value;
            const day = String(d.getDate()).padStart(2, "0");
            const month = String(d.getMonth() + 1).padStart(2, "0");
            return `${day}/${month}/${d.getFullYear()}`;
        },
        handleSendFeeSuccess() {
            this.selectedItems = [];
            this.getList();
        },
        handleExtendSuccess() {
            this.selectedItems = [];
            this.getList();
        },
    },
};
</script>

<template>
    <div>
        <!-- Đã tích hợp CEDF (IS_CEDF_INTEGRATED) -> ẩn checkbox chọn SV (chỉ dùng cho gửi DS thu phí / gia hạn) -->
        <v-data-table
            v-model="selectedItems"
            :headers="visibleHeaders"
            :items="list"
            :items-per-page="pageInfo.pageSize"
            :loading="isLoading"
            :show-select="!isCedfIntegrated"
            checkbox-color="primary"
            fixed-header
            hide-default-footer
            item-key="id"
            loading-text="Đang tải dữ liệu..."
            height="calc(100vh - 220px)"
            no-data-text="Không có dữ liệu"
        >
            <template #top>
                <v-row class="mb-3">
                    <v-col class="fs-17 fw-500" cols="12" md="auto">
                        Danh sách sinh viên đăng ký học lại
                        <span class="primary--text">({{ totalRecord }})</span>
                    </v-col>

                    <v-row dense justify="end" class="d-flex">
                        <v-col cols="12" md="2">
                            <base-text-field
                                v-model="search.search"
                                hide-details
                                label="Thông tin sinh viên"
                                @keyup.enter="handleSearch"
                            ></base-text-field>
                        </v-col>
                        <v-col cols="12" md="2">
                            <base-select
                                v-model="search.majorId"
                                hide-details
                                :items="majorList"
                                item-text="name"
                                item-value="id"
                                label="Ngành"
                            ></base-select>
                        </v-col>
                        <v-col cols="12" md="2">
                            <base-select
                                v-model="search.clazzId"
                                hide-details
                                :items="classList"
                                item-text="name"
                                item-value="id"
                                label="Lớp sinh viên"
                            ></base-select>
                        </v-col>
                        <v-col cols="12" md="2">
                            <base-select
                                v-model="search.retakeSessionId"
                                :items="retakeSessionList"
                                hide-details
                                item-text="code"
                                item-value="id"
                                label="Kỳ đăng ký học lại"
                            ></base-select>
                        </v-col>
                        <v-col cols="12" md="2">
                            <base-select
                                v-model="search.examSessionId"
                                :items="retakeCourseList"
                                hide-details
                                item-text="code"
                                item-value="id"
                                label="Mã lớp học lại"
                            ></base-select>
                        </v-col>
                        <v-col cols="12" md="2">
                            <base-select
                                v-model="search.termId"
                                :items="termList"
                                hide-details
                                :item-text="(item) => `${item.code} - ${item.name}`"
                                item-value="id"
                                label="Mã học phần"
                            ></base-select>
                        </v-col>
                        <v-col cols="12" md="2">
                            <base-select
                                v-model="search.feePaidStatus"
                                :items="payStatusList"
                                hide-details
                                item-text="text"
                                item-value="value"
                                label="Trạng thái trả học phí"
                            ></base-select>
                        </v-col>
                        <v-col cols="12" md="2">
                            <base-select
                                v-model="search.sendMailStatus"
                                :items="sendMailStatusList"
                                hide-details
                                item-text="text"
                                item-value="value"
                                label="Trạng thái gửi email"
                            ></base-select>
                        </v-col>
                        <v-col cols="12" md="2">
                            <base-select
                                v-model="search.registerStudentStatus"
                                :items="registerStudentStatusList"
                                hide-details
                                item-text="text"
                                item-value="value"
                                label="Trạng thái duyệt đơn"
                            ></base-select>
                        </v-col>
                        <v-col cols="12" md="2">
                            <base-select
                                v-model="search.isListedForBank"
                                :items="listForBankStatus"
                                hide-details
                                item-text="text"
                                item-value="value"
                                label="TT thêm DS ngân hàng"
                            ></base-select>
                        </v-col>

                        <v-col class="d-flex align-center gap-8 toolbar-actions" cols="auto">
                            <v-tooltip bottom>
                                <template #activator="{ on, attrs }">
                                    <v-icon
                                        color="primary"
                                        v-bind="attrs"
                                        @click="handleReset"
                                        v-on="on"
                                        >mdi-refresh
                                    </v-icon>
                                </template>
                                <span>Reset bộ lọc</span>
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
                                        @click="openAdd"
                                        v-on="on"
                                    >
                                        <v-icon>mdi-plus</v-icon>
                                    </v-btn>
                                </template>
                                <span>Thêm mới</span>
                            </v-tooltip>
                            <v-tooltip bottom>
                                <template #activator="{ on, attrs }">
                                    <v-btn
                                        color="warning"
                                        elevation="0"
                                        v-bind="attrs"
                                        @click="openNotifyEmail = true"
                                        v-on="on"
                                    >
                                        <v-icon>mdi-email-plus-outline</v-icon>
                                    </v-btn>
                                </template>
                                <span>Gửi email danh sách đã đăng ký</span>
                            </v-tooltip>
                            <v-tooltip bottom>
                                <template #activator="{ on, attrs }">
                                    <v-btn
                                        color="error"
                                        elevation="0"
                                        v-bind="attrs"
                                        @click="openNotifyEmailRefuseModal"
                                        v-on="on"
                                    >
                                        <v-icon>mdi-email-remove-outline</v-icon>
                                    </v-btn>
                                </template>
                                <span>Gửi email từ chối đăng ký</span>
                            </v-tooltip>

                            <!-- Đã tích hợp CEDF (IS_CEDF_INTEGRATED) -> ẩn nút gửi DS thu phí / gia hạn -->
                            <v-tooltip v-if="!isCedfIntegrated" bottom>
                                <template #activator="{ on, attrs }">
                                    <div v-bind="attrs" v-on="on">
                                        <v-badge
                                            :value="selectedItems.length > 0"
                                            :content="selectedItems.length"
                                            color="error"
                                            overlap
                                        >
                                            <v-btn
                                                color="success"
                                                elevation="0"
                                                :disabled="!selectedItems.length"
                                                @click="openSendFeeList = true"
                                            >
                                                <v-icon>mdi-send</v-icon>
                                            </v-btn>
                                        </v-badge>
                                    </div>
                                </template>
                                <span>Gửi danh sách thu phí các sinh viên đã chọn</span>
                            </v-tooltip>

                            <v-tooltip v-if="!isCedfIntegrated" bottom>
                                <template #activator="{ on, attrs }">
                                    <div v-bind="attrs" v-on="on">
                                        <v-badge
                                            :value="selectedItems.length > 0"
                                            :content="selectedItems.length"
                                            color="error"
                                            overlap
                                        >
                                            <v-btn
                                                color="info"
                                                elevation="0"
                                                :disabled="!selectedItems.length"
                                                @click="openExtendDeadline = true"
                                            >
                                                <v-icon>mdi-calendar-clock</v-icon>
                                            </v-btn>
                                        </v-badge>
                                    </div>

                                </template>
                                <span>Gia hạn hạn nộp học phí cho các sinh viên đã chọn</span>
                            </v-tooltip>
                        </v-col>
                    </v-row>
                </v-row>
            </template>
            <template #[`item.stt`]="{ index }">
                <span>{{ $getStt(index, pageInfo) }}</span>
            </template>
            <template #[`item.info`]="{ item }">
                <div class="d-flex flex-column gap-2 py-1">
                    <div class="">
                        Tên SV:
                        <span class="primary--text font-weight-bold">{{ item?.fullName }}</span>
                    </div>
                    <div class="">
                        Mã số SV:
                        <span class="primary--text font-weight-bold">{{ item?.code }}</span>
                    </div>
                    <div class="">
                        Tên Lớp:
                        <span class="primary--text font-weight-bold">{{ item?.clazz?.name }}</span>
                    </div>
                </div>
            </template>

            <template #[`item.registerStudentTerms`]="{ item }">
                <!-- eslint-disable vue/no-v-html -->
                <div
                    v-limit="5"
                    v-html="
                        item.registerStudentTerms
                            .map((i, index) => `${index + 1}.  ${i.term?.name} - ${i.term?.code}`)
                            .join(`<br />`)
                    "
                ></div>
            </template>
            <template #[`item.id`]="{ item }">
                <span>{{ formatRegisterCode(item) }}</span>
            </template>
            <template #[`item.paymentDeadline`]="{ item }">
                {{ formatDeadline(item.paymentDeadline) }}
            </template>
            <template #[`item.totalFee`]="{ item }">
                {{ $formatNumber(item.totalFee) }}
            </template>
            <template #[`item.feePaidStatus`]="{ item }">
                <BaseStatusItem :status="item.feePaidStatus" :status-list="payStatusList" />
            </template>
            <template #[`item.paymentSendStatusName`]="{ item }">
                <BaseStatusItem
                    :status="item.paymentSendStatusName"
                    :status-list="paymentSendStatusList"
                />
            </template>
            <template #[`item.paymentSendInfo`]="{ item }">
                <div v-if="item.paymentSendAt || item.paymentSendByAccount">
                    <div v-if="item.paymentSendAt">{{ $formatDateV2(item.paymentSendAt) }}</div>
                    <div v-if="item.paymentSendByAccount" class="primary--text">
                        {{ item.paymentSendByAccount }}
                    </div>
                </div>
                <span v-else>-</span>
            </template>
            <template #[`item.isListedForBank`]="{ item }">
                <BaseStatusItem :status="item.isListedForBank" :status-list="listForBankStatus" />
            </template>
           
            <template #[`item.sendMailStatus`]="{ item }">
                <BaseStatusItem :status="item.sendMailStatus" :status-list="sendMailStatusList" />
            </template>
            <template #[`item.registerStudentStatus`]="{ item }">
                <BaseStatusItem
                    :status="item.registerStudentStatus"
                    :status-list="registerStudentStatusList"
                />
            </template>
            <template #[`item.confirmAt`]="{ item }">
                <span>{{ $formatDateV2(item.confirmAt) }}</span>
            </template>

            <template #[`item.actions`]="{ item }">
                <div class="d-flex justify-center gap-2">
                    <!-- Chi tiết - luôn hiển thị -->
                    <v-tooltip :key="`detail-${item.id}`" bottom>
                        <template #activator="{ on, attrs }">
                            <v-btn
                                icon
                                small
                                color="cyan"
                                v-bind="attrs"
                                v-on="on"
                                @click="openDetail(item)"
                            >
                                <v-icon size="20">mdi-eye</v-icon>
                            </v-btn>
                        </template>
                        <span>Chi tiết</span>
                    </v-tooltip>

                    <!-- Xác nhận duyệt đơn -->
                    <v-tooltip
                        v-if="
                            item.paymentSendStatusName !== 'SENT' &&
                            (item.registerStudentStatus === 'AWAITING_CONFIRMATION' ||
                                item.registerStudentStatus === 'REJECTED')
                        "
                        :key="`approve-${item.id}`"
                        bottom
                    >
                        <template #activator="{ on, attrs }">
                            <v-btn
                                icon
                                small
                                color="green"
                                v-bind="attrs"
                                v-on="on"
                                @click="openConfirmApprovalModal(item)"
                            >
                                <v-icon size="20">mdi-check-circle</v-icon>
                            </v-btn>
                        </template>
                        <span>Xác nhận duyệt đơn</span>
                    </v-tooltip>

                    <!-- Từ chối duyệt đơn -->
                    <v-tooltip
                        v-if="
                            item.paymentSendStatusName !== 'SENT' &&
                            ['AWAITING_CONFIRMATION', 'CONFIRMED'].includes(
                                item.registerStudentStatus
                            )
                        "
                        :key="`reject-${item.id}`"
                        bottom
                    >
                        <template #activator="{ on, attrs }">
                            <v-btn
                                icon
                                small
                                color="red"
                                v-bind="attrs"
                                v-on="on"
                                @click="openConfirmRejectionModal(item)"
                            >
                                <v-icon size="20">mdi-close-circle</v-icon>
                            </v-btn>
                        </template>
                        <span>Từ chối duyệt đơn</span>
                    </v-tooltip>

                    <!-- Chờ duyệt đơn -->
                    <v-tooltip
                        v-if="
                            item.paymentSendStatusName !== 'SENT' &&
                            ['CONFIRMED', 'REJECTED'].includes(item.registerStudentStatus)
                        "
                        :key="`pending-${item.id}`"
                        bottom
                    >
                        <template #activator="{ on, attrs }">
                            <v-btn
                                icon
                                small
                                color="warning"
                                v-bind="attrs"
                                v-on="on"
                                @click="openConfirmPendingModal(item)"
                            >
                                <v-icon size="20">mdi-clock-outline</v-icon>
                            </v-btn>
                        </template>
                        <span>Chờ duyệt đơn</span>
                    </v-tooltip>

                    <!-- Cập nhật -->
                    <v-tooltip
                        v-if="
                            item.paymentSendStatusName !== 'SENT' &&
                            item.registerStudentStatus !== 'FINALIZED'
                        "
                        :key="`update-${item.id}`"
                        bottom
                    >
                        <template #activator="{ on, attrs }">
                            <v-btn
                                icon
                                small
                                color="warning"
                                v-bind="attrs"
                                v-on="on"
                                @click="handleUpdate(item)"
                            >
                                <v-icon size="20">mdi-pencil</v-icon>
                            </v-btn>
                        </template>
                        <span>Cập nhật</span>
                    </v-tooltip>
                </div>
            </template>
        </v-data-table>
        <div class="d-flex justify-space-between flex-sm-wrap">
            <div>
                <!-- Đã tích hợp CEDF (IS_CEDF_INTEGRATED) -> ẩn nút xuất file KQ thu thủ công -->
                <base-btn-excel
                    v-if="$hasPermission(215) && !isCedfIntegrated"
                    :loading="loadingExport"
                    text="Xuất file kết quả cần thu"
                    icon="mdi-export"
                    :disabled="!isShowExportResult"
                    @click="handleExport"
                />
               
                <base-btn-excel
                    v-if="$hasPermission(216)"
                    :loading="loadingExportNotPaid"
                    text="Xuất file danh sách chưa trả học phí"
                    icon="mdi-export"
                    @click="handleExportNotPaid"
                />

                <!-- Rà soát học phí trước khi đẩy đơn sang CEDF thu phí -->
                <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                        <span
                            class="d-inline-block mt-5 pl-1"
                            style="vertical-align: middle"
                            v-bind="attrs"
                            v-on="on"
                        >
                            <v-badge
                                :value="selectedItems.length > 0"
                                :content="selectedItems.length"
                                color="error"
                                overlap
                            >
                                <base-btn-excel
                                    :loading="loadingExportFeePreview"
                                    text="Xuất file rà soát học phí"
                                    icon="mdi-export"
                                    style="margin-top: 0 !important"
                                    @click="handleExportFeePreview"
                                />
                            </v-badge>
                        </span>
                    </template>
                    <span>
                        {{
                            selectedItems.length
                                ? `Xuất file rà soát học phí của ${selectedItems.length} sinh viên đã chọn`
                                : "Xuất file rà soát học phí theo bộ lọc hiện tại"
                        }}
                    </span>
                </v-tooltip>
                <!-- Đã tích hợp CEDF (IS_CEDF_INTEGRATED) -> ẩn nút nhập file KQ thu thủ công -->
                <base-btn-excel
                    v-if="$hasPermission(217) && !isCedfIntegrated"
                    text="Nhập file kết quả đã thu"
                    @click="openImport = true"
                />
            </div>
            <BasePagination
                :page="pageInfo.pageIndex"
                :page-count="totalPage"
                :page-size="pageInfo.pageSize"
                @changePage="changePage"
                @changePageSize="changePageSize"
            />
        </div>
        <base-import
            ref="Import"
            width="1100"
            :open="openImport"
            :loading="loadingImport"
            :template-error-url="templateErrorUrl"
            :template-url="templateUrl"
            @close="openImport = false"
            @import="handleImport"
            @save="handleSave"
        />
        <register-retake-course-add
            v-if="isOpenAdd"
            :open="isOpenAdd"
            @toggle="isOpenAdd = !isOpenAdd"
            @success="handleRegisterSuccess"
        />
        <register-retake-course-update
            v-if="isOpenUpdate"
            :open="isOpenUpdate"
            :selected="selectedItem"
            @toggle="isOpenUpdate = !isOpenUpdate"
            @success="handleUpdateSuccess"
        />
        <BaseSuccessDialog
            :open="isOpenSuccess"
            :message="successMessage"
            @toggle="isOpenSuccess = false"
        />
        <register-retake-course-detail
            v-if="isOpenDetail"
            :open="isOpenDetail"
            :data-item="selectedItem"
            @toggle="isOpenDetail = !isOpenDetail"
        />
        <RegisterRetakeCourseScoreboard
            v-if="isOpenScoreboard"
            :open="isOpenScoreboard"
            :data-item="selectedItem"
            @toggle="isOpenScoreboard = !isOpenScoreboard"
        />
        <BaseConfirmModal
            text-btn="Đồng ý"
            :open="openNotifyEmail"
            @toggle="openNotifyEmail = !openNotifyEmail"
            @OK="handleNotifyEmail"
        >
            <template #content>
                <span> Gửi email thông báo được phép đóng phí học lại </span>
            </template>
        </BaseConfirmModal>
        <BaseConfirmModal
            text-btn="Đồng ý"
            :open="openNotifyEmailRefuse"
            @toggle="openNotifyEmailRefuse = !openNotifyEmailRefuse"
            @OK="handleNotifyEmailRefuse"
        >
            <template #content>
                <span>Gửi email thông báo từ chối đăng ký học lại</span>
            </template>
        </BaseConfirmModal>

        <RegisterRetakeCourseConfirmApproval
            v-if="openConfirmApproval"
            :open="openConfirmApproval"
            :item="selectedItemForAction"
            @toggle="openConfirmApproval = false"
            @success="getList"
        />

        <BaseConfirmModal
            text-btn="Từ chối"
            :open="openConfirmRejection"
            @toggle="openConfirmRejection = !openConfirmRejection"
            @OK="handleRejectRegistrationWithModal"
        >
            <template #content>
                <span
                    >Bạn có chắc chắn muốn chuyển từ trạng thái
                    <strong class="primary--text">{{
                        getStatusText(selectedItemForAction.registerStudentStatus)
                    }}</strong>
                    sang trạng thái
                    <strong class="primary--text">{{ getStatusText("REJECTED") }}</strong>
                    không?</span
                >
            </template>
        </BaseConfirmModal>

        <RegisterRetakeCourseSendFeeList
            v-if="openSendFeeList"
            :open="openSendFeeList"
            :selected-items="selectedItems"
            @toggle="openSendFeeList = false"
            @success="handleSendFeeSuccess"
        />

        <RegisterRetakeCourseExtendDeadline
            v-if="openExtendDeadline"
            :open="openExtendDeadline"
            :selected-items="selectedItems"
            @toggle="openExtendDeadline = false"
            @success="handleExtendSuccess"
        />

        <BaseConfirmModal
            text-btn="Xác nhận"
            :open="openConfirmPending"
            @toggle="openConfirmPending = !openConfirmPending"
            @OK="handlePendingRegistrationWithModal"
        >
            <template #content>
                <span
                    >Bạn có chắc chắn muốn chuyển từ trạng thái
                    <strong class="primary--text">{{
                        getStatusText(selectedItemForAction.registerStudentStatus)
                    }}</strong>
                    sang trạng thái
                    <strong class="primary--text">{{
                        getStatusText("AWAITING_CONFIRMATION")
                    }}</strong>
                    không?</span
                >
            </template>
        </BaseConfirmModal>
    </div>
</template>

<style scoped>
:deep .v-data-table__wrapper {
    max-height: calc(100vh - 300px);
}
.row--dense {
    margin: 15px;
}
.toolbar-actions {
    gap: 8px;
}
</style>
