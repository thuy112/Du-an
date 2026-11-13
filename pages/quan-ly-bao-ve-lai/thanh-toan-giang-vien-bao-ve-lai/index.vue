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
                <v-row>
                    <v-col class="fs-17 fw-500" cols="auto" md="auto">
                        Danh sách báo cáo thanh toán GV bảo vệ lại
                        <span class="primary--text mr-3">( {{ totalRecord }} )</span>
                    </v-col>

                    <v-row class="mb-3" dense justify="end">
                        <v-col cols="12" md="2">
                            <v-select
                                v-model="search.teacherId"
                                :items="teacherList"
                                item-text="fullName"
                                item-value="id"
                                clearable
                                dense
                                hide-details
                                label="Giảng viên"
                                no-data-text="Không có dữ liệu"
                                outlined
                            >
                            </v-select>
                        </v-col>
                        <v-col cols="12" md="2">
                            <v-select
                                v-model="search.examId"
                                :items="examList"
                                item-text="name"
                                item-value="id"
                                clearable
                                dense
                                hide-details
                                label="Đợt bảo vệ lại"
                                no-data-text="Không có dữ liệu"
                                outlined
                            >
                            </v-select>
                        </v-col>

                        <v-col cols="12" md="2">
                            <v-select
                                v-model="search.examSessionId"
                                :items="examSessionList"
                                item-text="examClass"
                                item-value="id"
                                clearable
                                dense
                                hide-details
                                label="Hội đồng bảo vệ"
                                no-data-text="Không có dữ liệu"
                                outlined
                            >
                            </v-select>
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
            <template #[`item.bank`]="{ item }">
                <span
                    >{{ item.teacherDto?.bankName }} &nbsp; {{ item.teacherDto?.bankNumber }}
                </span>
            </template>
            <template #[`item.examSessionTerm`]="{ item }">
                <div v-for="data in item.paymentTeacherDetails" :key="data.id">
                    {{ data?.teacher?.code }} - {{ data?.teacher?.fullName }}
                </div>
            </template>
            <template #[`item.totalAmount`]="{ item }">
                {{ $money(item.totalAmount) ? $money(item.totalAmount) : 0 }}đ
            </template>
            <template #[`item.registerStudentTerms`]="{ item }">
                <ol style="list-style-type: none">
                    <li
                        v-for="data in item.registerStudentTerms"
                        :key="data.term.id"
                        class="text-left"
                    >
                        <span>{{ data?.term?.code }}</span> - <span>{{ data?.term?.name }}</span> -
                        <span> {{ $money(data.fee) }}đ </span>
                    </li>
                </ol>
            </template>
            <template #[`item.registerSemesterTerms`]="{ item }">
                <ol style="list-style-type: none">
                    <li
                        v-for="data in item.registerStudentTerms"
                        :key="data.term.id"
                        class="text-left"
                    >
                        <span>{{ data?.semester?.name }}</span>
                    </li>
                </ol>
            </template>

            <!-- <template #[`item.paymentStatus`]="{ item }">
                <BaseStatusItem :status-list="statusListPayment" :status="item.paymentStatus" />
            </template> -->

            <!-- <template #[`item.actions`]="{ item }">
                <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                        <v-icon
                            color="green"
                            dark
                            icon
                            v-bind="attrs"
                            @click="handleExportSingle(item)"
                            v-on="on"
                        >
                            mdi-microsoft-excel
                        </v-icon>
                    </template>
                    <span>Xuất file Excel</span>
                </v-tooltip>
            </template> -->

            <template #[`item.actions`]="{ item }">
                <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                        <v-icon
                            color="blue"
                            dark
                            icon
                            v-bind="attrs"
                            @click="openDetail(item)"
                            v-on="on"
                        >
                            mdi-eye
                        </v-icon>
                    </template>
                    <span>Chi tiết</span>
                </v-tooltip>
            </template>
        </v-data-table>
        <div class="d-flex justify-space-between">
            <div>
                <base-btn-exel text="Xuất file báo cáo" :disabled="!list" @click="handleExport" />
            </div>
            <BasePagination
                :page="pageInfo.pageIndex"
                :page-count="totalPage"
                :page-size="pageInfo.pageSize"
                @changePage="changePage"
                @changePageSize="changePageSize"
            />
        </div>
        <RedefendTeacherPaymentDetail
            ref="RedefendTeacherPaymentDetail"
            :data-item="selectedItem"
        />
    </div>
</template>

<script>
import reportServices from "~/services/reportServices";
import examServices from "~/services/redefend/examServices";
import BaseBtnExel from "~/components/Base/BtnExcel.vue";
import { sendTypeList, statusListPayment } from "~/consts/list";
import RedefendTeacherPaymentDetail from "~/components/RedefendTeacherPayment/detail-redefend.vue";
import examSessionServices from "~/services/redefend/examSessionServices";
import teacherServices from "~/services/teacherServices";

const INIT_PAGE_INFO = {
    pageIndex: 1,
    pageSize: 50,
};

const INIT_SEARCH = {
    examId: null,
    examSessionId: null,
    teacherId: null,
};
export default {
    name: "Index",
    components: { BaseBtnExel, RedefendTeacherPaymentDetail },
    data: () => ({
        headers: [
            {
                value: "examSession.examClass",
                text: "Hội đồng bảo vệ",
                class: "text-center",
                sortable: false,
            },
            { value: "examSession.semester.name", text: "Học kỳ", sortable: false },
            { value: "examSession.exam.name", text: "Đợt bảo vệ", sortable: false },
            { value: "examSessionTerm", text: "MGV - Giảng viên", sortable: false },
            {
                value: "totalAmount",
                text: "Tổng phí",
                align: "center",
                sortable: false,
            },
            {
                value: "paymentStatus",
                text: "Trạng thái",
                align: "center",
                sortable: false,
            },
            { value: "paymentDate", text: "Ngày thanh toán", sortable: false },
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
        sendTypeList,
        examList: [],
        examSessionList: [],
        teacherList: [],
        statusListPayment,
        selectedItem: {},
    }),
    computed: {},
    created() {
        this.getList();
        this.getexam();
        this.getExamSession();
        this.getTeachers();
    },
    methods: {
        openDetail(item) {
            this.$refs.RedefendTeacherPaymentDetail.isOpen = true;

            this.selectedItem = item.paymentTeacherDetails?.map(({ teacher, jobs }) => {
                const jobMapping = jobs.reduce((acc, job) => {
                    acc[job.paymentCategoryCode] = {
                        quantity: job.quantity || 0,
                        credit: job.credit || 0,
                        subTotal: job.subTotal || 0,
                        unitPrice: job.unitPrice || 0,
                    };
                    return acc;
                }, {});

                return {
                    id: teacher.id,
                    fullName: teacher.fullName,
                    code: teacher.code,
                    phone: teacher.phone,
                    SUPPORT: jobMapping.SUPPORT || {
                        quantity: 0,
                        credit: 0,
                        subTotal: 0,
                        unitPrice: 0,
                    },
                    JOIN: jobMapping.JOIN || { quantity: 0, subTotal: 0, unitPrice: 0 },
                    REBUTTAL: jobMapping.REBUTTAL || { quantity: 0, subTotal: 0, unitPrice: 0 },
                    RESIDENCE: jobMapping.RESIDENCE || { quantity: 0, subTotal: 0, unitPrice: 0 },
                };
            });
        },

        async handleExportSingle(item) {
            const res = await reportServices.exportTeacherPayment({
                teacherPaymentId: item.id,
            });
            if (res.success) {
                return this.$download(res?.data?.url);
            }
        },

        // @@@ export file
        async handleExport() {
            console.log("examSessionId:", this.search.examSessionId);
            console.log("examId:", this.search.examId);

            if (!this.search.examId) {
                return this.$showWarning("Vui lòng chọn đợt bảo vệ lại");
            }
            if (!this.search.examSessionId) {
                return this.$showWarning("Vui lòng chọn hội đồng bảo vệ");
            }

            const res = await reportServices.exportReportTeacherPayment({
                examId: this.search.examId,
                examSessionId: this.search.examSessionId,
            });

            if (res.success) {
                this.$download(res?.data?.url);
            }
        },

        async getexam() {
            const res = await examServices.getAll();
            if (res.success)
                this.examList = res?.data?.map((item) => ({ id: item?.id, name: item?.name }));
        },

        async getExamSession() {
            const res = await examSessionServices.getAll({ status: "ACTIVE" });
            if (res.success) this.examSessionList = res.data;
        },

        async getTeachers() {
            const res = await teacherServices.getAll({
                status: "ACTIVE",
            });
            if (res.success) {
                this.teacherList = res.data;
            }
        },

        async getList() {
            try {
                this.isLoading = true;
                const res = await reportServices.reportTeacherPayment({
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
    },
};
</script>

<style scoped>
:deep .v-data-table__wrapper {
    max-height: calc(100vh - 250px);
}

:deep .v-select__selections {
    display: flex;
    flex-wrap: nowrap;
    overflow: hidden;
    max-width: 100%;
    white-space: nowrap;
    align-items: center;
}

:deep .v-select__selections > * {
    flex: 0 0 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
