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
                <v-row>
                    <v-col class="fs-17 fw-500" cols="auto" md="auto">
                        Bảng điểm lớp học lại: {{ $route.params.id }}
                        <span class="primary--text mr-3">( {{ totalRecord }} )</span>
                    </v-col>

                    <v-row class="mb-3" dense justify="end">
                        <v-col cols="12" md="3">
                            <base-text-field
                                v-model="search.fullName"
                                hide-details
                                label="Sinh viên"
                            ></base-text-field>
                        </v-col>

                        <v-col class="d-flex align-center search-actions gap-8" cols="auto">
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

                            <v-tooltip v-if="isAdded == 'NO_SCOREBOARD'" bottom>
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
                            <v-tooltip v-if="isClosed !== 'CLOSED'" bottom>
                                <template #activator="{ on, attrs }">
                                    <v-btn
                                        color="orange"
                                        elevation="0"
                                        v-bind="attrs"
                                        @click="handleClick(item)"
                                        v-on="on"
                                    >
                                        <v-icon color="white"
                                            >mdi-checkbox-marked-circle-plus-outline
                                        </v-icon>
                                    </v-btn>
                                </template>
                                <span>Duyệt điểm</span>
                            </v-tooltip>
                        </v-col>
                    </v-row>
                </v-row>
            </template>
            <template #[`item.stt`]="{ index }">
                <span>{{ $getStt(index, pageInfo) }}</span>
            </template>
            <template #[`item.totalFee`]="{ item }">
                <span> {{ $money(item.totalFee) }}đ </span>
            </template>
            <template #[`item.scoreStatus`]="{ item }">
                <BaseStatusItem :status="item?.scoreStatus" :status-list="closeStatusList" />
            </template>
            <template #[`item.actions`]="{ item }">
                <v-tooltip v-if="isClosed !== 'CLOSED'" bottom>
                    <template #activator="{ on, attrs }">
                        <v-icon
                            color="warning"
                            dark
                            icon
                            v-bind="attrs"
                            @click="handleUpdate(item)"
                            v-on="on"
                        >
                            mdi-pencil
                        </v-icon>
                    </template>
                    <span>Sửa</span>
                </v-tooltip>
            </template>
        </v-data-table>
        <div class="d-flex justify-space-between">
            <div>
                <base-btn-exel
                    :disabled="isAdded !== 'NO_SCOREBOARD'"
                    class="mx-1"
                    text="Import bảng điểm"
                    @click="openImportFile"
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
        <register-exam-result ref="RegisterExamResult" :exam-session-id="search.examSessionId" />
        <register-exam-result-update ref="ExamResultUpdate" />
        <base-import
            ref="Import"
            :template-url="templateUrl"
            :loading="loadingImport"
            width="900"
            :template-error-url="templateErrorUrl"
            :open="openImport"
            @close="openImport = false"
            @import="handleImport"
            @save="handleSave"
        />
        <base-confirm-modal
            :open="openClosed"
            @OK="handleClosed"
            @toggle="openClosed = !openClosed"
        >
            <template #content>
                <div class="pt-2">
                    Xác nhận duyệt điểm lớp học lại
                    <span class="primary--text font-weight-bold">{{ $route.params.id }}</span> ?
                </div>
            </template>
        </base-confirm-modal>
    </div>
</template>

<script>
import termService from "~/services/termService";
// import BaseBtnExel from "~/components/Base/BtnExcel.vue";
import { closeStatusList } from "~/consts/list";
import RegisterExamResult from "~/components/RegisterExamResult/Add.vue";
import RegisterExamResultUpdate from "~/components/RegisterExamResult/Update.vue";
import BaseConfirmModal from "~/components/Base/ConfirmModal.vue";
import BaseImport from "~/components/Base/Import.vue";
import { examResultHeaders2 } from "~/consts/importHeaders";
import BaseBtnExel from "~/components/Base/BtnExcel.vue";
import resultServices from "~/services/resultServices";
import retakeCourseService from "~/services/retakeCourseService";

const INIT_PAGE_INFO = {
    pageIndex: 1,
    pageSize: 50,
};

const INIT_SEARCH = {
    fullName: "",
    examId: null,
    termId: null,
};
export default {
    name: "Index",
    head() {
        return {
            titleTemplate: "%s Bảng điểm lớp học lại",
        };
    },
    components: {
        BaseImport,
        // BaseBtnExel,
        RegisterExamResult,
        RegisterExamResultUpdate,
        BaseConfirmModal,
        BaseBtnExel,
    },
    data: () => ({
        headers: [
            { value: "stt", text: "STT", sortable: false },
            { value: "code", text: "Mã số sinh viên", sortable: false },
            { value: "name", text: "Họ và tên", sortable: false },
            { value: "classesCode", text: "Lớp SV", sortable: false },
            { value: "score", text: "Điểm", sortable: false },
            { value: "notes", text: "Ghi chú", align: "center", sortable: false },
            { value: "scoreStatus", text: "Trạng thái", align: "center", sortable: false },
            { value: "actions", text: "Chức năng", align: "center", sortable: false },
        ],

        list: [],
        pageInfo: {
            ...INIT_PAGE_INFO,
        },
        totalPage: 0,
        totalRecord: 0,
        isLoading: false,
        search: { ...INIT_SEARCH },
        closeStatusList,
        semesterList: [],
        isAdded: null,
        isClosed: null,
        termList: [],
        openClosed: false,
        loadingExport: false,
        openImport: false,
        templateUrl: "",
        templateErrorUrl: "",
        loadingImport: false,
    }),
    computed: {},

    async created() {
        const { examId, termId, examSessionId } = this.$route.query;
        this.search = { fullName: "", examId, termId, examSessionId, score: null };
        await this.getExamSession(examSessionId);
        await this.getList();
        this.getTemplate();
    },

    methods: {
        async handleSave(data) {
            this.loadingImport = true;

            const { examSessionId } = this.$route.query;
            const res = await retakeCourseService.importScoreBoard(examSessionId, data);
            if (res.success) {
                this.$showSuccess("Import bảng điểm thành công");
                this.getList();
                this.openImport = false;
            }
            this.loadingImport = false;
        },

        handleClick(item) {
            this.selectedItem = item;
            this.openClosed = true;
        },

        async getTemplate() {
            const res = await retakeCourseService.getTemplateScoreBoard();
            if (res.success) this.templateUrl = res.data.url;
        },

        async handleClosed() {
            try {
                const res = await retakeCourseService.comfirmResult(
                    this.$route.query.examSessionId
                );
                if (res.success) {
                    this.$showSuccess("Duyệt điểm thành công");
                    this.getList();
                    this.getExamSession(this.$route.query.examSessionId);
                }
            } catch (er) {
                console.log(er);
            }
            this.openClosed = false;
        },

        async handleImport(file) {
            this.loadingImport = true;
            const res = await retakeCourseService.checkImportScoreBoard(file);
            this.$refs.Import.list = [...res?.data?.objects];
            if (res?.data?.status === 1) {
                this.templateErrorUrl = "";
                this.$refs.Import.showFile = false;
                this.$refs.Import.headers = [...examResultHeaders2];
                this.loadingImport = false;
                return;
            }
            let headerErrors = [...examResultHeaders2];
            for (const item of res?.data?.objects) {
                if (item.messErrors) {
                    item.messageError = item.messErrors.map((msg) => `${msg} <br>`).join("");
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
            // this.$showWarning(res?.data?.message);
            this.loadingImport = false;
        },

        async getExamSession(examSessionId) {
            const res = await retakeCourseService.getDetail(examSessionId);
            if (res.success) {
                this.isAdded = res.data.scoreStatus;
            }
        },

        async getTerms() {
            try {
                const res = await termService.getAll({ status: "ACTIVE" });
                if (res.success) {
                    this.termList = res.data.map((item) => ({ id: item.id, name: item.name }));
                }
            } catch (e) {}
        },

        async getList() {
            try {
                this.isLoading = true;
                const res = await resultServices.getListResult({
                    ...this.pageInfo,
                    examSessionId: this.search.examSessionId,
                });
                if (res.success) {
                    this.list = res.data.data;
                    if (res.data.data && res.data.data.length > 0 && res.data.data[0]) {
                        this.isClosed = res.data.data[0].scoreStatus;
                    } else {
                        this.isClosed = null;
                    }
                    this.totalPage = res.data.totalPages;
                    this.totalRecord = res.data.totalRecords;
                    if (this.isClosed === "CLOSED") {
                        this.headers = this.headers.filter((i) => i.value !== "actions");
                    }
                }
            } catch (e) {
                console.error(e);
            }
            this.isLoading = false;
        },

        handleUpdate(item) {
            if (this.$refs.ExamResultUpdate) {
                this.$refs.ExamResultUpdate.open = true;
                this.$refs.ExamResultUpdate.getUpdate({ ...item });
            } else {
                console.error("ExamResultUpdate component ref is not available");
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
            const { examId, termId, examSessionId } = this.$route.query;
            this.search = { fullName: "", examId, termId, examSessionId, score: null };
            this.pageInfo = { ...INIT_PAGE_INFO };
            this.getList();
        },

        handleSearch() {
            this.pageInfo.pageIndex = 1;
            this.getList();
        },

        openImportFile() {
            this.openImport = true;
            this.templateErrorUrl = "";
        },

        openAddModal() {
            if (this.$refs.RegisterExamResult) {
                this.$refs.RegisterExamResult.open = true;
            } else {
                console.error("RegisterExamResult component ref is not available");
            }
        },
    },
};
</script>

<style scoped>
:deep .v-data-table__wrapper {
    max-height: calc(100vh - 250px);
}
.row--dense {
    margin: 14px;
}
.search-actions {
    gap: 9px;
}
</style>
