<script>
import BasePagination from "~/components/Base/Pagination.vue";
import BaseSelect from "~/components/Base/Select.vue";
import BaseBtnExel from "~/components/Base/BtnExcel.vue";
import feeTeacherByClassService from "~/services/feeTeacherByClassService.js";
import { retakeCourseStatus, exportedSummaryList } from "~/consts/list";
import ChangeableStatus from "~/components/Base/ChangeableStatus.vue";
import StatusItem from "~/components/Base/StatusItem.vue";
import ReLearingPaymentTeacherClassDetail from "~/components/ReLearingPaymentTeacherClass/Detail.vue";
import ReLearingPaymentTeacherClassUpdateFile from "~/components/ReLearingPaymentTeacherClass/UpdateFile.vue";

const INIT_PAGE_INFO = {
    pageIndex: 1,
    pageSize: 50,
};

const INIT_SEARCH = {
    search: "",
    paymentFeeStatus: null,
    examSessionId: null,
    teacherId: null,
    examId: null,
};

export default {
    components: {
        BaseBtnExel,
        BasePagination,
        BaseSelect,
        ReLearingPaymentTeacherClassDetail,
        ReLearingPaymentTeacherClassUpdateFile,
        ChangeableStatus,
        StatusItem,
    },
    data: () => ({
        statusList: [
            { value: "COMPLETE_PAID", text: "Đã thanh toán", color: "green" },
            { value: "WAIT_PAID", text: "Chưa thanh toán", color: "primary" },
            { value: "CANCELED_PAID", text: "Hủy thanh toán", color: "red" },
        ],

        classTypeList: retakeCourseStatus,
        exportedSummaryList,

        headers: [
            { value: "stt", text: "STT", sortable: false },
            { value: "classCode", text: "Mã lớp học lại", sortable: false },
            { value: "classType", text: "Loại lớp", sortable: false },
            { value: "examName", text: "Đợt học lại", sortable: false },
            { value: "coefficient", text: "Thu học phí SV", sortable: false },
            { value: "coefficientTeacher", text: "Thanh toán giảng dạy", sortable: false },
            { value: "creditTuition", text: "Số tín chỉ học phí", sortable: false },
            { value: "teacherName", text: "Giảng viên", sortable: false },
            { value: "courseName", text: "Tên học phần", sortable: false },
            { value: "totalFee", text: "Tổng phí", sortable: false },
            { value: "totalTaxFee", text: "Thuế thu nhập cá nhân", sortable: false },
            { value: "fileInform", text: "File thông tin", sortable: false },
            { value: "status", text: "Trạng thái", align: "center", sortable: false },
            {
                value: "isExported",
                text: "T.T xuất giấy xác nhận",
                align: "center",
                sortable: false,
            },
            { value: "actions", text: "Chức năng", align: "center", sortable: false },
        ],

        list: [],
        pageInfo: {
            ...INIT_PAGE_INFO,
        },
        totalPage: 0,
        totalRecord: 0,
        isLoading: false,
        openDelete: false,
        search: { ...INIT_SEARCH },
        selectedItem: {},
        trainingList: [],
        paymentTeacherList: [],
        templateUrl: null,
        openImport: false,
        examSessionList: [],
        templateErrorUrl: "",
        loadingImport: false,
        loadingExport: false,
        loadingExportList: false,
        teacherList: [],
        isLoadingTeachers: false,
        isOpenDetail: false,
        isOpenUpdateFile: false,
        selectedFileItem: {},
        examList: [],
    }),
    computed: {},
    watch: {
        "search.examSessionId": {
            handler(newVal) {
                if (newVal) {
                    this.search.teacherId = null;
                    this.getTeachersByClass(newVal);
                } else {
                    this.search.teacherId = null;
                    this.getTeachers();
                }
            },
            immediate: false,
        },
    },
    created() {
        this.getRetakeCourseList();
        this.getExamList();
        this.getList();
        this.getTeachers();
    },
    methods: {
        // @@@ Danh sách giảng viên
        async getTeachers() {
            try {
                const res = await feeTeacherByClassService.getTeacherList();
                if (res && ((res.error && res.error.code === 0) || res.success)) {
                    const rawData = res.data?.data || res.data || [];
                    this.teacherList = rawData.map((item) => ({
                        value: item.id,
                        text: (item.fullName || item.name || '') + (item.code ? " - " + item.code : ''),
                        name: item.fullName || item.name || '',
                    }));
                } else {
                    this.teacherList = [];
                }
            } catch (e) {
                console.error("Lỗi tải danh sách giảng viên:", e);
                this.teacherList = [];
            }
        },

        // @@@ Danh sách đợt học lại
        async getExamList() {
            try {
                const res = await feeTeacherByClassService.getAllExam();
                if (res && ((res.error && res.error.code === 0) || res.success)) {
                    this.examList = res.data?.data || res.data || [];
                } else {
                    this.examList = [];
                }
            } catch (e) {
                console.error("Lỗi tải đợt học lại:", e);
                this.examList = [];
            }
        },

        // @@@ Danh sách giảng viên theo lớp học lại
        async getTeachersByClass(classId) {
            try {
                this.isLoadingTeachers = true;
                const res = await feeTeacherByClassService.getTeachersByClass(classId);
                if (res && ((res.error && res.error.code === 0) || res.success)) {
                    const rawData = res.data?.data || res.data || [];
                    this.teacherList = rawData.map((item) => ({
                        value: item.id,
                        text: (item.name || item.fullName || '') + (item.code ? " - " + item.code : ''),
                    }));
                } else {
                    this.teacherList = [];
                }
            } catch (error) {
                console.error("Error getting teachers by class:", error);
                this.teacherList = [];
                this.$showError("Không thể tải danh sách giảng viên cho lớp này");
            } finally {
                this.isLoadingTeachers = false;
            }
        },

        async getRetakeCourseList() {
            try {
                const res = await feeTeacherByClassService.getShortRetakeCourse();
                if (res && ((res.error && res.error.code === 0) || res.success)) {
                    const courseList = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
                    this.examSessionList = courseList.map(({ id, examClass, code, exam }) => ({
                        id,
                        name: examClass || exam?.code || code,
                        code,
                    }));
                }
            } catch (e) {
                console.error("Lỗi tải danh sách lớp học lại ngắn:", e);
            }
        },

        async handleExportList() {
            this.loadingExport = true;
            try {
                const res = await feeTeacherByClassService.exportAllV1({
                    ...this.pageInfo,
                    ...this.search,
                });
                if (res && ((res.error && res.error.code === 0) || res.success)) {
                    this.$download(res?.data?.url);
                }
            } catch (e) {
                console.error(e);
            } finally {
                this.loadingExport = false;
            }
        },

        async handleExportPaymentList() {
            this.loadingExportList = true;
            try {
                const res = await feeTeacherByClassService.exportPaymentList({
                    ...this.search,
                });
                if (res && ((res.error && res.error.code === 0) || res.success)) {
                    this.$download(res?.data?.url);
                }
            } catch (e) {
                console.error(e);
            } finally {
                this.loadingExportList = false;
            }
        },

        handlePushTeacher(item) {
            this.$router.push({
                path: `/quan-ly-bao-ve-lai/dinh-muc-thanh-toan-giang-vien/${item.id}`,
            });
            this.$mitt.emit("addBreadcrumb", this.$createBreadcrumb({ pageName: ` ${item.name}` }));
        },

        async handleExport(item) {
            const res = await feeTeacherByClassService.export(item.id);
            if (res && ((res.error && res.error.code === 0) || res.success)) {
                this.$download(res?.data?.url);
            }
        },

        handleClick(item) {
            this.selectedItem = item;
            this.openDelete = true;
        },

        // @@@ Danh sách thanh toán chính
        async getList() {
            try {
                this.isLoading = true;
                const params = {
                    pageIndex: this.pageInfo.pageIndex || 1,
                    pageSize: this.pageInfo.pageSize || 50,
                    search: this.search.search || '',
                    ...(this.search.teacherId && { teacherId: this.search.teacherId }),
                    ...(this.search.examId && { examId: this.search.examId }),
                    ...(this.search.examSessionId && { classCode: this.search.examSessionId }),
                    ...(this.search.paymentFeeStatus && { status: this.search.paymentFeeStatus }),
                };

                const res = await feeTeacherByClassService.getByClassList(params);
                console.log("Dữ liệu API bảng byClass:", res);

                if (res && ((res.error && res.error.code === 0) || res.success)) {
                    const responseData = res.data;
                    const rawList = responseData?.data || responseData?.content || responseData?.items || (Array.isArray(responseData) ? responseData : []);

                    this.list = rawList;
                    this.totalRecord = responseData?.totalRecords || responseData?.totalElements || responseData?.total || rawList.length;
                    this.totalPage = responseData?.totalPages || Math.ceil(this.totalRecord / this.pageInfo.pageSize) || 1;
                } else {
                    this.list = [];
                }
            } catch (e) {
                console.error("Lỗi khi tải danh sách bảng:", e);
                this.list = [];
            } finally {
                this.isLoading = false;
            }
        },

        // @@@ Thay đổi trạng thái
        async handleChangeStatus(status, item) {
            try {
                const res = await feeTeacherByClassService.changeStatus(item.id, {
                    paymentFeeStatus: status.value,
                });
                if (res && ((res.error && res.error.code === 0) || res.success)) {
                    this.$showSuccess("Cập nhật trạng thái thành công");
                    this.getList();
                }
            } catch (e) {
                console.error(e);
            }
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
            this.getTeachers();
            this.getList();
        },
        handleSearch() {
            this.pageInfo.pageIndex = 1;
            if (this.search.examSessionId) {
                this.getTeachersByClass(this.search.examSessionId);
            }
            this.getList();
        },

        openImportFile() {
            this.openImport = true;
            this.paymentTeacherList = [];
            this.templateErrorUrl = "";
        },

        openDetail(item) {
            this.selectedItem = item;
            this.isOpenDetail = true;
        },

        openUpdateFile(item) {
            this.selectedFileItem = item;
            this.isOpenUpdateFile = true;
        },

        handleUpdateFileSuccess() {
            this.isOpenUpdateFile = false;
            this.getList();
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
            item-key="teacher_id"
            loading-text="Đang tải dữ liệu..."
            max-height="calc(100vh - 300px)"
            no-data-text="Không có dữ liệu"
        >
            <template #top>
                <v-row class="mb-3">
                    <v-col class="fs-17 fw-500" cols="12" md="auto">
                        Danh sách thanh toán giảng viên theo lớp
                        <span class="primary--text">({{ totalRecord }})</span>
                    </v-col>

                    <v-row dense justify="end">
                        <v-col cols="12" md="2">
                            <base-select
                                v-model="search.teacherId"
                                hide-details
                                item-text="text"
                                item-value="value"
                                :items="teacherList"
                                label="Giảng viên"
                                :loading="isLoadingTeachers"
                                :disabled="isLoadingTeachers"
                                :placeholder="
                                    teacherList.length === 0 && !isLoadingTeachers
                                        ? 'Không có giảng viên nào'
                                        : 'Chọn giảng viên'
                                "
                            ></base-select>
                        </v-col>
                        <v-col cols="12" md="2">
                            <base-select
                                v-model="search.examId"
                                hide-details
                                item-text="code"
                                item-value="id"
                                :items="examList"
                                label="Đợt học lại"
                                placeholder="Đợt học lại"
                            ></base-select>
                        </v-col>
                        <v-col cols="12" md="2">
                            <base-select
                                v-model="search.examSessionId"
                                hide-details
                                item-text="code"
                                item-value="id"
                                :items="examSessionList"
                                label="Lớp học lại"
                                placeholder="Lớp học lại"
                            ></base-select>
                        </v-col>
                        <v-col cols="12" md="2">
                            <base-select
                                v-model="search.paymentFeeStatus"
                                hide-details
                                item-text="text"
                                item-value="value"
                                :items="statusList"
                                label="Trạng thái"
                            ></base-select>
                        </v-col>

                        <v-col class="d-flex align-center gap-8" cols="auto">
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
                        </v-col>
                    </v-row>
                </v-row>
            </template>
            <template #[`item.stt`]="{ index }">
                <span>{{ $getStt(index, pageInfo) }}</span>
            </template>

            <template #[`item.totalFee`]="{ item }"> {{ $formatNumber(item.totalFee) }}đ </template>

            <template #[`item.totalTaxFee`]="{ item }">
                {{ $formatNumber(item.totalTaxFee) }}đ
            </template>

            <template #[`item.fileInform`]="{ item }">
                <v-btn
                    :disabled="!item.fileInform"
                    color="primary"
                    icon
                    large
                    @click="$download(item.fileInform)"
                >
                    <v-icon>mdi-file-download-outline</v-icon>
                </v-btn>
            </template>

            <template #[`item.classType`]="{ item }">
                <StatusItem
                    :status="item.classCoefficientDto?.classType ?? item.classType"
                    :status-list="classTypeList"
                    :use-custom-text="true"
                    :additional-data="item.classCoefficientDto?.courseType ?? item.courseType"
                    :is-course-normal="
                        item.classCoefficientDto?.isCourseNormal ?? item.isCourseNormal
                    "
                />
            </template>

            <template #[`item.status`]="{ item }">
                <ChangeableStatus
                    :status="item.status"
                    :status-list="statusList"
                    @changeStatus="handleChangeStatus($event, item)"
                />
            </template>

            <template #[`item.isExported`]="{ item }">
                <BaseStatusItem :status="item.isExported" :status-list="exportedSummaryList" />
            </template>

            <template #[`item.actions`]="{ item }">
                <v-menu bottom nudge-bottom="20">
                    <template #activator="{ on, attrs }">
                        <v-btn icon v-bind="attrs" v-on="on">
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

                        <v-list-item @click="openUpdateFile(item)">
                            <v-list-item-icon class="mr-2">
                                <v-icon color="blue" size="20">mdi-file-upload</v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>Cập nhật file</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </template>
        </v-data-table>

        <div class="d-flex justify-space-between">
            <div class="d-flex gap-8">
                <base-btn-exel
                    :loading="loadingExport"
                    icon="mdi-export"
                    :disabled="!search.examSessionId || !search.teacherId"
                    text="Xuất giấy xác nhận thanh toán (A5)"
                    @click="handleExportList"
                />
                <base-btn-exel
                    :loading="loadingExportList"
                    icon="mdi-export"
                    text="Xuất file danh sách thanh toán"
                    @click="handleExportPaymentList"
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

        <ReLearingPaymentTeacherClassDetail
            v-if="isOpenDetail"
            :open="isOpenDetail"
            :data-item="selectedItem"
            @toggle="isOpenDetail = !isOpenDetail"
        />

        <ReLearingPaymentTeacherClassUpdateFile
            v-if="isOpenUpdateFile"
            :open="isOpenUpdateFile"
            :data-item="selectedFileItem"
            @toggle="isOpenUpdateFile = !isOpenUpdateFile"
            @success="handleUpdateFileSuccess"
        />
    </div>
</template>

<style scoped>
:deep .v-data-table__wrapper {
    max-height: calc(100vh - 250px);
}
</style>