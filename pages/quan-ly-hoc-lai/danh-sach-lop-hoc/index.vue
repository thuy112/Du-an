<script>
import {
    examStatusList,
    scoreStatusList,
    sendTypeList,
    statusList,
    retakeCourseStatus,
} from "~/consts/list";
import BaseConfirmModal from "~/components/Base/ConfirmModal.vue";
import retakeCourseService from "~/services/retakeCourseService";
import termService from "~/services/termService";
import retakeSessionServices from "~/services/retakeSessionServices";
import coefficientServices from "~/services/coefficientServices";
import BaseDatePicker from "~/components/Base/DatePicker.vue";
import BaseSelect from "~/components/Base/Select.vue";
import BaseBtnExel from "~/components/Base/BtnExcel.vue";
import BaseWeekField from "~/components/Base/BaseWeekField.vue";
// import BaseImport from "~/components/Base/Import.vue";
import BaseModal from "~/components/Base/Modal.vue";
import RetakeCourseDetail from "~/components/RetakeCourse/Detail.vue";
import RetakeCourseAssignTeacher from "~/components/RetakeCourse/AssignTeacher.vue";
import BasePagination from "~/components/Base/Pagination.vue";
// import { examSessionHeaders } from "~/consts/importHeaders";
import classServices from "~/services/classServices";
import { IS_CTT_SYNCED } from "~/consts/consts";
import {
    getRetakeClassTypeText,
    formatWeekbyDateTime,
    getStartOfISOWeek,
    getEndOfISOWeek,
} from "~/utils/heppers";

const INIT_PAGE_INFO = {
    pageIndex: 1,
    pageSize: 50,
};

const INIT_SEARCH = {
    search: "",
    examId: null,
    termId: null,
    classCoefficientId: null,
    fromTime: "",
    toTime: "",
    weekFromTime: "",
    weekToTime: "",
};

export default {
    components: {
        BasePagination,
        RetakeCourseDetail,
        RetakeCourseAssignTeacher,
        BaseModal,
        // BaseImport,
        BaseBtnExel,
        BaseSelect,
        BaseDatePicker,
        BaseConfirmModal,
        BaseWeekField,
    },
    data: () => ({
        isCttSynced: IS_CTT_SYNCED,
        headers: [
            { value: "stt", text: "STT", sortable: false },
            { value: "code", text: "Mã lớp", sortable: false },
            // { value: "examClass", text: "Tên lớp học lại", sortable: false },
            {
                value: "classCoefficientDto.classType",
                text: "Loại lớp",
                align: "left",
                sortable: false,
                width: 150,
            },
            {
                value: "classCoefficientDto.coefficient",
                text: "Thu học phí SV",
                sortable: false,
                align: "center",
                width: 50,
            },
            {
                value: "classCoefficientDto.coefficientTeacher",
                text: "Thanh toán giảng dạy",
                sortable: false,
                align: "center",
                width: 50,
            },
            { value: "exam.code", text: "Đợt học lại", sortable: false, align: "center" },
            { value: "term.code", text: "Học phần", sortable: false, align: "center" },
            { value: "quantitySeat", text: "Số lượng sinh viên", sortable: false, align: "center" },
            {
                value: "quantityCurrent",
                text: "Số lượng SV đăng ký",
                sortable: false,
                align: "center",
            },
            { value: "time", text: "Thời gian", sortable: false, align: "center" },
            {
                value: "examSessionStatus",
                text: "Trạng thái duyệt danh sách",
                align: "center",
                sortable: false,
            },
            {
                value: "scoreStatus",
                text: "Trạng thái bảng điểm",
                align: "center",
                sortable: false,
            },
            { value: "actions", text: "Chức năng", align: "center", sortable: false },
        ],
        list: [],
        pageInfo: {
            ...INIT_PAGE_INFO,
        },
        isStatusLocked(item) {
            return (
                item?.examSessionStatus === "FINALIZED" &&
                item?.scoreStatus === "SCOREBOARD_AVAILABLE"
            );
        },
        totalPage: 0,
        totalRecord: 0,
        isLoading: false,
        statusList,
        openDelete: false,
        search: { ...INIT_SEARCH },
        isOpenAdd: false,
        selectedItem: {},
        termList: [],
        examList: [],
        coefficientList: [],
        isOpenAssignTeacher: false,
        openAssignStudent: false,
        examStatusList,
        scoreStatusList,
        studentList: [],
        listExistTeacher: [],
        isOpenSearch: false,
        loadingExport: false,
        classList: [],
        isOpenSend: false,
        isOpenImportModal: false,
        retakeCourseStatus,
        formatWeekbyDateTime,
        getStartOfISOWeek,
        getEndOfISOWeek,
        useWeekInput: false,
    }),
    created() {
        this.getTerms();
        this.getExams();
        this.getCoefficientList();
        this.getClassList();
        this.getList();
    },
    methods: {
        handleMoveCalendar(item) {
            this.$router.push({
                path: `/quan-ly-hoc-lai/danh-sach-lop-hoc/${item.id}`,
                query: {
                    teacherId: item?.teacher?.id,
                },
            });
            this.$store.commit("education/addExamSession", this.list);
            this.$mitt.emit(
                "addBreadcrumb",
                this.$createBreadcrumb({ pageName: ` Thời khóa biểu` })
            );
        },
        toggleTimeInputMode(useWeek) {
            if (useWeek) {
                this.search.fromTime = "";
                this.search.toTime = "";
            } else {
                this.search.weekFromTime = "";
                this.search.weekToTime = "";
            }
        },
        buildSearchPayload() {
            const payload = {
                ...this.pageInfo,
                ...this.search,
            };
            if (this.useWeekInput) {
                if (payload.weekFromTime)
                    payload.fromTime = getStartOfISOWeek(payload.weekFromTime);
                else delete payload.fromTime;
                if (payload.weekToTime) payload.toTime = getEndOfISOWeek(payload.weekToTime);
                else delete payload.toTime;
                delete payload.weekFromTime;
                delete payload.weekToTime;
            } else {
                if (payload.fromTime) payload.fromTime = payload.fromTime + " 00:00:00";
                else delete payload.fromTime;
                if (payload.toTime) payload.toTime = payload.toTime + " 23:59:59";
                else delete payload.toTime;
                delete payload.weekFromTime;
                delete payload.weekToTime;
            }
            return payload;
        },
        async getClassList() {
            const res = await classServices.getListAll();
            if (res.success) this.classList = res?.data;
        },

        async getExams() {
            try {
                const res = await retakeSessionServices.getAll();
                if (res.success) {
                    this.examList = res.data.map((item) => ({
                        id: item?.id,
                        name: item?.name,
                        code: item?.code,
                    }));
                }
            } catch (e) {
                console.error(e);
            }
        },

        async getCoefficientList() {
            try {
                const res = await coefficientServices.getList({ pageSize: 100, pageIndex: 1 });
                if (res.success) {
                    this.coefficientList = res.data.data.map((item) => ({
                        id: item?.id,
                        name: `${getRetakeClassTypeText(
                            item?.classType,
                            item?.courseType,
                            item?.isCourseNormal
                        )} (${item?.coefficient})`,
                    }));
                }
            } catch (e) {
                console.error(e);
            }
        },

        async handleExportSingle(item) {
            try {
                this.loadingExport = true;
                const res = await retakeCourseService.export(item.id);
                if (res.success) this.$download(res?.data?.url);
            } catch (error) {
                console.error(error);
            } finally {
                this.loadingExport = false;
            }
        },
        handleScoreTable(item) {
            const classCode = item.code || item.maLop
            const raw = item.original || {}
            this.$router.push({
                path: `/quan-ly-hoc-lai/danh-sach-lop-hoc/${classCode}/bang-diem`,
                query: {
                examSessionId: item.id,
                termId: item.term?.id || raw.term?.id || '',
                examId: item.exam?.id || raw.exam?.id || '',
                },
            })
        },
        async handleExport() {
            try {
                this.loadingExport = true;
                const exportParam = this.buildSearchPayload();
                const res = await retakeCourseService.exportScore(exportParam);
                if (res.success) this.$download(res?.data?.url);
            } catch (e) {
                console.error(e);
            } finally {
                this.loadingExport = false;
            }
        },

        sendTypeList() {
            return sendTypeList;
        },

        async getTerms() {
            try {
                const res = await termService.getAll({ status: "ACTIVE" });
                if (res.success) {
                    this.termList = res.data.map((item) => ({
                        id: item?.id,
                        name: item?.name,
                        code: item?.code,
                        text: `${item?.name} - ${item?.code}`,
                    }));
                }
            } catch (e) {}
        },
        handleClick(item) {
            this.selectedItem = item;
            this.openDelete = true;
        },
        openUpdate(item) {
            this.selectedItem = item;
            this.$refs.RetakeCourseUpdate.open = true;
        },
        openDetail(item) {
            this.selectedItem = item;
            this.$refs.RetakeCourseDetail.isOpen = true;
        },
        openAssignTeacher(item) {
            this.selectedItem = item;
            this.$refs.RetakeCourseAssignTeacher.open = true;
        },

        handleWeekFieldUpdate({ field, value }) {
            if (this.formData && field) {
            this.$set(this.formData, field, value);
            }
        },

        async handleDelete() {
            try {
                const res = await retakeCourseService.delete(this.selectedItem.id);
                if (res.success) {
                    this.$showSuccess("Xóa lớp học lại thành công");
                    this.getList();
                }
            } catch (er) {
                console.log(er);
            }
            this.openDelete = false;
        },
        async handleChangeStatus(status, item) {
            try {
                const res = await retakeCourseService.changeStatus({
                    id: item.id,
                    status: status.value,
                });
                if (res.success) {
                    this.$showSuccess("Cập nhật trạng thái thành công");
                    await this.getList();
                }
            } catch (e) {
                console.error(e);
            }
        },
        async getList() {
            try {
                this.isLoading = true;
                const res = await retakeCourseService.getList(this.buildSearchPayload());
                if (res.success) {
                    this.list = res.data.data;
                    this.totalPage = res.data?.totalPages;
                    this.totalRecord = res.data?.totalRecords;
                }
            } catch (e) {
                console.error(e);
            }
            this.isLoading = false;
        },
        async sendMailScore() {
            try {
                const res = await retakeCourseService.sendMail(this.selectedItem.id);
                if (res.success) {
                    this.$showSuccess("Gửi mail thành công");
                    this.getList();
                    this.isOpenSend = false;
                } else {
                    this.$showError(res.message);
                    this.isOpenSend = false;
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
            this.useWeekInput = false;
            this.getList();
        },
        handleSearch() {
            this.pageInfo.pageIndex = 1;
            this.isOpenSearch = false;
            this.getList();
        },
        openAdd() {
            this.$refs.RetakeCourseAdd.open = true;
        },
        openImportFile() {
            this.isOpenImportModal = true;
        },

        getClassTypeText(row) {
            return getRetakeClassTypeText(
                row?.classCoefficientDto?.classType,
                row?.classCoefficientDto?.courseType,
                row?.classCoefficientDto?.isCourseNormal
            );
        },

        getClassTypeColor(classType) {
            const status = this.retakeCourseStatus.find((item) => item.value === classType);
            return status ? status.color : "grey";
        },

        async handleChangeScoreStatus(status, item) {
            try {
                const res = await retakeCourseService.changeScoreStatus(item.id, {
                    status: status.value,
                });
                if (res.success) {
                    this.$showSuccess("Cập nhật trạng thái bảng điểm thành công");
                    await this.getList();
                }
            } catch (e) {
                console.error(e);
            }
        },
        getScoreStatusText(status) {
            const statusObj = this.scoreStatusList.find((s) => s.value === status);
            return statusObj ? statusObj.text : "";
        },
        getExamStatusText(status) {
            const statusObj = this.examStatusList.find((s) => s.value === status);
            return statusObj ? statusObj.text : "";
        },
    },
    computed: {
        privateScoreStatusList() {
            return this.scoreStatusList.filter((status) => status.type === "PRIVATE");
        },
        getFilteredExamStatusList() {
            return (item) => {
                if (item.examSessionStatus === "NOT_FINALIZED") {
                    return this.examStatusList.filter((status) => status.value !== "NON_FINALIZED");
                }
                if (
                    item.examSessionStatus === "FINALIZED" &&
                    item.quantityCurrent < item.quantitySeat
                ) {
                    return this.examStatusList.filter((status) => status.value !== "NOT_FINALIZED");
                }
                if (item.examSessionStatus === "NON_FINALIZED") {
                    return this.examStatusList.filter((status) => status.value !== "NOT_FINALIZED");
                }
                return this.examStatusList;
            };
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
            <v-row class="mb-5 align-center" justify="space-between">
                <v-col class="fs-17 fw-500" cols="12" md="auto">
                    Danh sách lớp học lại
                    <span class="primary--text">({{ totalRecord }})</span>
                </v-col>

                <v-col cols="12" md="auto">
                    <v-row dense align="center" justify="end">
                        <v-col cols="12" sm="6" md="auto">
                            <v-text-field
                                v-model="search.search"
                                label="Tên lớp học lại"
                                outlined
                                dense
                                clearable
                                hide-details
                                style="min-width: 180px"
                                @keyup.enter="handleSearch"
                                @click:clear="handleSearch"
                            />
                        </v-col>
                        <v-col cols="12" sm="6" md="auto">
                            <base-select
                                v-model="search.examId"
                                :items="examList"
                                hide-details
                                item-text="code"
                                item-value="id"
                                label="Đợt học lại"
                                width="150px"
                            ></base-select>
                        </v-col>
                        <v-col cols="12" sm="6" md="auto">
                            <base-select
                                v-model="search.termId"
                                :items="termList"
                                hide-details
                                item-text="text"
                                item-value="id"
                                label="Học phần"
                                width="200px"
                            ></base-select>
                        </v-col>
                        <v-col cols="12" sm="6" md="auto">
                            <base-select
                                v-model="search.classCoefficientId"
                                :items="coefficientList"
                                hide-details
                                item-text="name"
                                item-value="id"
                                label="Hệ số"
                                width="240px"
                            ></base-select>
                        </v-col>

                        <v-col class="d-flex align-center search-actions" cols="auto">
                            <!-- BỘ LỌC NÂNG CAO -->
                            <BaseModal
                                title="Bộ lọc nâng cao"
                                :open="isOpenSearch"
                                text-btn="Tìm kiếm"
                                icon-btn="mdi-magnify"
                                @OK="handleSearch"
                                @toggle="isOpenSearch = !isOpenSearch"
                            >
                                <v-row dense class="ma-0 mt-3">
                                    <v-col cols="12">
                                        <v-switch
                                            v-model="useWeekInput"
                                            label="Nhập theo tuần"
                                            color="primary"
                                            class="mt-0"
                                            hide-details
                                            @change="toggleTimeInputMode($event)"
                                        />
                                    </v-col>
                                    <template v-if="!useWeekInput">
                                        <v-col cols="12" md="6">
                                            <base-date-picker
                                                v-model="search.fromTime"
                                                hide-details
                                                label="Từ ngày"
                                                width="100%"
                                            ></base-date-picker>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <base-date-picker
                                                v-model="search.toTime"
                                                hide-details
                                                label="Đến ngày"
                                                to-time
                                                width="100%"
                                            ></base-date-picker>
                                        </v-col>
                                    </template>
                                    <template v-else>
                                        <v-col cols="12" md="6">
                                            <BaseWeekField
                                                label="Từ tuần"
                                                :data="search"
                                                field="weekFromTime"
                                                required="Vui lòng nhập đủ thông tin"
                                                @update-field="handleWeekFieldUpdate"
                                            />
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <BaseWeekField
                                                label="Đến tuần"
                                                :data="search"
                                                field="weekToTime"
                                                required="Vui lòng nhập đủ thông tin"
                                                @update-field="handleWeekFieldUpdate"
                                            />
                                        </v-col>
                                    </template>
                                </v-row>
                            </BaseModal>

                            <v-tooltip bottom>
                                <template #activator="{ on, attrs }">
                                    <v-icon
                                        color="primary"
                                        v-bind="attrs"
                                        @click="isOpenSearch = true"
                                        v-on="on"
                                    >
                                        mdi-filter-variant-plus
                                    </v-icon>
                                </template>
                                <span>Bộ lọc nâng cao</span>
                            </v-tooltip>

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

                            <!-- Tạm thời luôn hiện nút "Thêm mới" kể cả khi IS_CTT_SYNCED = true -->
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
                </v-col>
            </v-row>
            </template>
            <template #[`item.stt`]="{ index }">
                <span>{{ $getStt(index, pageInfo) }}</span>
            </template>
            <template #[`item.time`]="{ item }">
                <span v-if="!item?.isWeek">{{ $formatDateRange(item.fromTime, item.toTime) }}</span>
                <span v-else
                    >{{ formatWeekbyDateTime(item.fromTime) }} -
                    {{ formatWeekbyDateTime(item.toTime) }}</span
                >
            </template>
            <template #[`item.seatQuantity`]="{ item }">
                <span>{{ item?.quantityCurrent }}</span>
            </template>
            <template #[`item.term.code`]="{ item }">
                <span>{{ item?.term?.code }} - {{ item?.term?.name }}</span>
            </template>
            <template #[`item.teachers`]="{ item }">
                <span>{{ item.teachers.map((i) => i.fullName).join(", ") }}</span>
            </template>

            <template #[`item.examSessionStatus`]="{ item }">
                <BaseStatusItem
                    v-if="
                        isStatusLocked(item) ||
                        (item.examSessionStatus === 'FINALIZED' &&
                            item.quantityCurrent >= item.quantitySeat)
                    "
                    :status="item.examSessionStatus"
                    :status-list="examStatusList"
                />
                <BaseChangeableStatus
                    v-else
                    :status="item.examSessionStatus"
                    :status-list="getFilteredExamStatusList(item)"
                    @changeStatus="handleChangeStatus($event, item)"
                >
                    <template #content="{ data }">
                        <div>
                            Bạn có chắc chắn muốn đổi trạng thái duyệt danh sách lớp học
                            <span class="primary--text fw-500">{{ item.code }}</span> từ
                            <span class="fw-600 primary--text">{{
                                getExamStatusText(item.examSessionStatus)
                            }}</span>
                            sang
                            <span class="fw-600 primary--text">{{
                                getExamStatusText(data.value)
                            }}</span>
                            không?

                            <div
                                v-if="
                                    item.examSessionStatus === 'FINALIZED' &&
                                    data.value === 'NON_FINALIZED'
                                "
                                class="mt-3 pa-3 warning--text"
                                style="
                                    background-color: #fff3cd;
                                    border: 1px solid #ffeaa7;
                                    border-radius: 4px;
                                "
                            >
                                <v-icon color="warning" class="mr-2">mdi-alert</v-icon>
                                <strong>Cảnh báo:</strong> Bạn sẽ không thể chỉnh sửa thông tin lớp
                                học này sau khi chuyển sang trạng thái "Chưa duyệt danh sách".
                            </div>
                        </div>
                    </template>
                </BaseChangeableStatus>
            </template>

            <template #[`item.examSessionScoreStatus`]="{ item }">
                <BaseStatusItem
                    v-if="isStatusLocked(item)"
                    :status="item.examSessionScoreStatus"
                    :status-list="scoreStatusList"
                />
                <BaseChangeableStatus
                    v-else
                    :status="item.examSessionScoreStatus"
                    :status-list="scoreStatusList"
                    @changeStatus="handleChangeStatus($event, item)"
                >
                </BaseChangeableStatus>
            </template>
            <template #[`item.scoreStatus`]="{ item }">
                <BaseStatusItem
                    v-if="isStatusLocked(item)"
                    :status="item.scoreStatus"
                    :status-list="privateScoreStatusList"
                />
                <BaseChangeableStatus
                    v-else
                    :status="item.scoreStatus"
                    :status-list="privateScoreStatusList"
                    @changeStatus="handleChangeScoreStatus($event, item)"
                >
                    <template #content="{ data }">
                        Bạn có chắc chắn muốn đổi trạng thái bảng điểm của lớp học
                        <span class="primary--text fw-500">{{ item.code }}</span> từ
                        <span class="fw-600 primary--text">{{
                            getScoreStatusText(item.scoreStatus)
                        }}</span>
                        sang <span class="fw-600 primary--text">{{ data.text }}</span> không?
                    </template>
                </BaseChangeableStatus>
            </template>
            <template #[`item.quantitySeat`]="{ item }">
                {{ item?.quantityCurrent
                }}<span v-if="item.quantitySeat">/{{ item.quantitySeat }}</span>
            </template>
            <template #[`item.actions`]="{ item }">
                <v-menu bottom nudge-bottom="20">
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
                        <v-list-item
                            v-if="item.examSessionStatus !== 'NOT_FINALIZED'"
                            @click="handleExportSingle(item)"
                        >
                            <v-list-item-icon class="mr-2">
                                <v-icon color="green" size="20">mdi-export</v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>Xuất file DSSV</v-list-item-title>
                        </v-list-item>
                        <template v-if="item.examSessionStatus === 'NOT_FINALIZED'">
                            <v-list-item v-if="!isCttSynced" @click="openUpdate(item)">
                                <v-list-item-icon class="mr-2">
                                    <v-icon color="warning" size="20">mdi-pencil</v-icon>
                                </v-list-item-icon>
                                <v-list-item-title>Cập nhật</v-list-item-title>
                            </v-list-item>
                        </template>
                        <template v-else>
                            <v-list-item @click="handleScoreTable(item)">
                                <v-list-item-icon class="mr-2">
                                    <v-icon color="purple" size="20">mdi-table</v-icon>
                                </v-list-item-icon>
                                <v-list-item-title>Bảng điểm</v-list-item-title>
                            </v-list-item>
                        </template>
                        <v-list-item
                            v-if="
                                !item.teacherExamSessionDtos ||
                                item.teacherExamSessionDtos.length === 0
                            "
                            @click="openAssignTeacher(item)"
                        >
                            <v-list-item-icon class="mr-2">
                                <v-icon color="blue" size="20">mdi-account-tie-hat-outline </v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>Gán giảng viên</v-list-item-title>
                        </v-list-item>

                        <v-list-item
                            v-if="
                                !isCttSynced &&
                                item.examSessionStatus !== 'FINALIZED' &&
                                item.scoreStatus === 'NO_SCOREBOARD'
                            "
                            color="teal"
                            @click="handleClick(item)"
                        >
                            <v-list-item-icon class="mr-2">
                                <v-icon color="red" size="20">mdi-trash-can</v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>Xóa</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </template>

            <template #[`item.classCoefficientDto.classType`]="{ item }">
                <v-chip
                    :color="getClassTypeColor(item.classCoefficientDto?.classType)"
                    small
                    text-color="white"
                >
                    {{ getClassTypeText(item) }}
                </v-chip>
            </template>
        </v-data-table>
        <div class="d-flex justify-space-between">
            <div>
                <base-btn-exel v-if="!isCttSynced" text="Nhập file excel" @click="openImportFile" />
                <base-btn-exel
                    :loading="loadingExport"
                    icon="mdi-export"
                    text="Xuất bảng điểm tổng hợp"
                    @click="handleExport"
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

        <!-- Replace BaseImport with temporary modal -->
        <BaseModal
            title="Nhập file Excel"
            :open="isOpenImportModal"
            off-btn
            icon-btn="mdi-close"
            @toggle="isOpenImportModal = !isOpenImportModal"
        >
            <div class="pa-4 text-center">
                <v-icon size="64" color="warning" class="mb-4">mdi-file-excel</v-icon>
                <h3 class="mb-3">Tính năng đang phát triển</h3>
            </div>
        </BaseModal>

        <retake-course-update ref="RetakeCourseUpdate" :data-item="selectedItem" />
        <retake-course-add ref="RetakeCourseAdd" />
        <RetakeCourseDetail ref="RetakeCourseDetail" :data-item="selectedItem" />
        <RetakeCourseAssignTeacher
            ref="RetakeCourseAssignTeacher"
            :data-item="selectedItem"
            @teacherAssigned="getList"
        />
        <base-confirm-modal
            :open="openDelete"
            @OK="handleDelete"
            @toggle="openDelete = !openDelete"
        >
            <template #content>
                <div>
                    Bạn có chắc chắn muốn xóa phòng thi
                    <span class="primary--text font-weight-bold">{{ selectedItem?.code }}</span
                    >?
                </div>
            </template>
        </base-confirm-modal>
        <base-confirm-modal
            :open="isOpenSend"
            @OK="sendMailScore"
            @toggle="isOpenSend = !isOpenSend"
        >
            <template #content>
                <div>
                    Bạn có chắc chắn muốn gửi email bảng điểm của lớp học lại
                    <span class="primary--text font-weight-bold">{{ selectedItem?.code }}</span
                    >?
                </div>
            </template>
        </base-confirm-modal>
    </div>
</template>

<style scoped>
:deep .v-data-table__wrapper {
    max-height: calc(100vh - 250px);
}
.row--dense {
    margin: 14px;
}
.search-actions {
    gap: 9px;
    margin-left: 8px;
}
</style>
