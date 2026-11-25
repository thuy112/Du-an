<script>
import DetailItem from "~/components/Base/DetailItem.vue";
import {
    payStatusList,
    registerStatusList,
    sendMailStatusList,
    browsingInfoList,
    listFinalStatus,
} from "~/consts/list";
import registerRetakeCourseServices from "~/services/registerRetakeCourseServices";

export default {
    name: "RegisterRetakeCourseDetail",
    components: {
        DetailItem,
    },
    props: {
        open: {
            type: Boolean,
            required: true,
        },
        dataItem: {
            type: [Object],
            required: true,
        },
    },
    data: () => ({
        isLoading: false,
        search: null,
        studentList: [],
        registerStatusList,
        listFinalStatus,
        browsingInfoList,
        payStatusList,
        sendMailStatusList,
        retakeSessionList: [],
        totalPage: 0,
        feeCreditHour: 0,
        dataDetail: {},
        list: [],
        selectedList: [],
        headers: [
            {
                text: "STT",
                align: "start",
                sortable: false,
                value: "stt",
            },

            {
                text: "Mã học phần",
                align: "start",
                sortable: false,
                value: "term.code",
            },
            {
                text: "Tên học phần",
                align: "start",
                sortable: false,
                value: "term.name",
            },
            {
                text: "Mã giảng viên",
                align: "start",
                sortable: false,
                value: "codeTeacher",
            },
            {
                text: "Tên giảng viên",
                align: "start",
                sortable: false,
                value: "nameTeacher",
            },
            {
                text: "Mã lớp",
                align: "start",
                sortable: false,
                value: "examSessionDto.code",
            },
            {
                text: "Định mức phí",
                align: "start",
                sortable: false,
                value: "fee",
            },
            {
                text: "Số tín chỉ học phí",
                align: "center",
                sortable: false,
                value: "creditHour",
            },
            {
                text: "Thu học phí SV",
                align: "center",
                sortable: false,
                value: "coefficient",
            },
            {
                text: "Thanh toán giảng dạy",
                align: "center",
                sortable: false,
                value: "coefficientTeacher",
            },
            {
                text: "Thành tiền",
                align: "start",
                sortable: false,
                value: "totalFee",
            },
        ],
    }),
    computed: {
        registerCode() {
            const item = this.dataDetail && Object.keys(this.dataDetail).length
                ? this.dataDetail
                : this.dataItem;
            if (!item) return "";
            if (item.registerCode) return item.registerCode;
            const source = item.createTime || item.createdTime || item.createdAt;
            let year = "";
            if (typeof source === "string") {
                const dmy = source.match(/^\s*\d{1,2}\/\d{1,2}\/(\d{4})/);
                const ymd = source.match(/(\d{4})[-/]\d{1,2}[-/]\d{1,2}/);
                year = dmy ? dmy[1] : ymd ? ymd[1] : "";
            }
            if (!year && source) {
                const y = new Date(source).getFullYear();
                if (!isNaN(y)) year = y;
            }
            if (year) return `HL_${year}_${item.id}`;
            return item.id ? `HL_${item.id}` : "";
        },
    },
    watch: {
        open: {
            handler(val) {
                if (val) {
                    this.list = this.dataItem.registerStudentTerms.map((i) => {
                        return {
                            ...i.term,
                            fee: i.fee,
                            totalFee: i.totalFee,
                            examSessionDto: i.examSessionDto,
                        };
                    });
                }
            },
            immediate: true,
        },
    },
    created() {
        this.getDetail();
    },
    methods: {
        async getDetail() {
            const res = await registerRetakeCourseServices.getDetail(this.dataItem.id);
            if (res.success) {
                this.dataDetail = res.data;
                this.list = res.data.registerStudentTerms.map((i) => {
                    return {
                        ...i,
                        fee: i.fee,
                        totalFee: i.totalFee,
                        examSessionDto: i.examSessionDto,
                    };
                });
            }
        },
    },
};
</script>

<template>
    <BaseModal
        :loading="isLoading"
        :open="open"
        title="Thông tin đăng ký học lại"
        max-width="1000"
        :disabled-btn="!selectedList.length"
        off-btn
        @toggle="$emit('toggle')"
    >
        <v-row class="ma-0" dense>
            <v-col cols="12">
                <div class="border-left mb-3 mt-8 relative">Thông tin cá nhân</div>
                <RegisterInfo :student="dataDetail" />
            </v-col>
            <v-col cols="12" class="mt-3">
                <div class="border-left mb-3 mt-8 relative">Thông tin đăng ký</div>
            </v-col>
            <v-col cols="12" md="6">
                <DetailItem title="Mã đơn đăng ký" :value="registerCode" />
            </v-col>
            <v-col cols="12" md="6">
                <DetailItem title="Đợt học lại" :value="dataDetail?.retakeSession?.code || ''" />
            </v-col>
            <v-col cols="12" md="6">
                <DetailItem title="Thời gian đăng ký" :value="dataDetail?.createTime" />
            </v-col>

            <v-col cols="12" md="6">
                <BaseDetailItem title="Trạng thái" :value="dataDetail?.registerStudentStatus">
                    <template #value>
                        <BaseStatusItem
                            v-if="
                                dataDetail?.registerStudentStatus !== undefined &&
                                dataDetail?.registerStudentStatus !== null
                            "
                            :status-list="registerStatusList"
                            :status="
                                dataDetail?.registerStudentStatus === 'FINALIZED'
                                    ? 'CONFIRMED'
                                    : dataDetail?.registerStudentStatus
                            "
                        />
                        <span v-else>-</span>
                    </template>
                </BaseDetailItem>
            </v-col>
            <v-col cols="12" md="6">
                <BaseDetailItem title="Trạng thái trả học phí" :value="dataDetail?.feePaidStatus">
                    <template #value>
                        <BaseStatusItem
                            v-if="
                                dataDetail?.feePaidStatus !== undefined &&
                                dataDetail?.feePaidStatus !== null
                            "
                            :status-list="payStatusList"
                            :status="dataDetail?.feePaidStatus"
                        />
                        <span v-else>-</span>
                    </template>
                </BaseDetailItem>
            </v-col>
            <v-col cols="12" md="6">
                <BaseDetailItem title="Trạng thái gửi email" :value="dataDetail?.sendMailStatus">
                    <template #value>
                        <BaseStatusItem
                            v-if="
                                dataDetail?.sendMailStatus !== undefined &&
                                dataDetail?.sendMailStatus !== null
                            "
                            :status-list="sendMailStatusList"
                            :status="dataDetail?.sendMailStatus"
                        />
                        <span v-else>-</span>
                    </template>
                </BaseDetailItem>
            </v-col>
            <v-col cols="12" md="6">
                <BaseDetailItem
                    title="Trạng thái lập danh sách lớp"
                    :value="dataDetail?.listFinalStatus"
                >
                    <template #value>
                        <BaseStatusItem
                            v-if="
                                dataDetail?.listFinalStatus !== undefined &&
                                dataDetail?.listFinalStatus !== null
                            "
                            :status-list="listFinalStatus"
                            :status="dataDetail?.listFinalStatus"
                        />
                        <span v-else>-</span>
                    </template>
                </BaseDetailItem>
            </v-col>
            <v-col cols="12" class="mt-3">
                <div class="border-left mb-3 mt-2 relative">Thông tin duyệt đơn</div>
            </v-col>
            <v-col cols="12" md="6">
                <DetailItem title="Người duyệt" :value="dataDetail?.accountDto?.fullName || ''" />
            </v-col>
            <v-col cols="12" md="6">
                <DetailItem
                    title="Email người duyệt"
                    :value="dataDetail?.accountDto?.email || ''"
                />
            </v-col>
            <v-col cols="12" md="6">
                <BaseDetailItem
                    title="Học phí"
                    :value="$formatNumber(dataDetail?.totalFee || 0) + ' VNĐ'"
                ></BaseDetailItem>
            </v-col>
            <v-col cols="12" md="6">
                <BaseDetailItem
                    title="Sinh viên"
                    :value="dataDetail?.fullName || '-'"
                ></BaseDetailItem>
            </v-col>
            <v-col cols="12">
                <div class="fw-600 black--text fs-16 mb-2 mt-4">
                    Danh sách học phần đăng ký (<span class="primary--text">{{ list.length }}</span
                    >)
                </div>
                <v-data-table
                    v-model="selectedList"
                    checkbox-color="primary"
                    hide-default-footer
                    no-data-text="Không có dữ liệu"
                    :items="list"
                    :headers="headers"
                    disable-pagination
                    class="table-scroll-x"
                >
                    <template #[`item.stt`]="{ index }">{{ index + 1 }}</template>
                    <template #[`item.fee`]="{ item }">{{ $formatNumber(item?.fee) }}</template>
                    <template #[`item.totalFee`]="{ item }">{{
                        $formatNumber(item?.totalFee)
                    }}</template>
                    <template #[`item.examSessionDto.code`]="{ item }">
                        {{ item?.retakeClassCode || "-" }}
                    </template>
                    <template #[`item.examSessionDto.coefficient`]="{ item }">
                        {{ item?.examSessionDto?.coefficient || "-" }}
                    </template>
                    <template #[`item.examSessionDto.coefficientTeacher`]="{ item }">
                        {{ item?.examSessionDto?.coefficientTeacher || "-" }}
                    </template>
                </v-data-table>
            </v-col>
            <v-col cols="12" md="6" class="d-flex align-center justify-end justify-md-start">
                Thời hạn đóng học phí:
                <span class="primary--text fw-500 ml-2">{{
                    $formatDate(dataDetail?.retakeSession?.paymentToTime)
                }}</span>
            </v-col>
            <v-col cols="12" md="6" class="d-flex align-center justify-end">
                Tổng tiền:
                <span class="primary--text fw-500 ml-2"
                    >{{ $formatNumber(dataDetail?.totalFee) }} VNĐ</span
                >
            </v-col>
        </v-row>
    </BaseModal>
</template>

<style scoped>
.border-left {
    border-left: 4px var(--primary) solid;
    padding: 2px 8px;
    color: black;
    font-weight: 600;
    font-size: 20px;
}

:deep .table-scroll-x .v-data-table__wrapper {
    overflow-x: auto;
}

:deep .table-scroll-x .v-data-table__wrapper > table {
    min-width: 1200px;
}
</style>
