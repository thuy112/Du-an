<template>
    <base-modal
        :loading="isLoading"
        :open="open"
        max-width="900"
        title="Chi tiết đợt thanh toán GV theo lớp học lại"
        off-btn
        @toggle="$emit('toggle')"
    >
        <v-row class="mt-3" dense>
            <!-- Thông tin đợt thanh toán -->
            <v-col cols="12">
                <v-card class="mb-3" outlined>
                    <v-card-title class="text-h6 primary--text"
                        >Thông tin đợt thanh toán</v-card-title
                    >
                    <v-card-text>
                        <v-row dense>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Tên đợt thanh toán"
                                    :value="dataDetail?.name"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Mã đợt thanh toán"
                                    :value="dataDetail?.code"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Ngày thanh toán"
                                    :value="$formatDate(dataDetail?.paymentDate)"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Trạng thái"
                                    :value="getStatus(dataDetail?.paymentFeeStatus)"
                                />
                            </v-col>
                            <v-col cols="12" md="12">
                                <div class="d-flex align-center">
                                    <span class="mr-3">File thanh toán:</span>
                                    <v-btn
                                        :disabled="!dataDetail?.fileUrl"
                                        color="primary"
                                        icon
                                        large
                                        @click="$download(dataDetail.fileUrl)"
                                    >
                                        <v-icon>mdi-file-download-outline</v-icon>
                                    </v-btn>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                    <v-col cols="12" class="mt-3">
                        <div class="d-flex align-center justify-space-between">
                            <div class="fw-600">
                                Danh sách giảng viên (<span class="primary--text">{{
                                    (dataDetail?.teacherFees || []).length
                                }}</span
                                >)
                            </div>
                        </div>
                    </v-col>
                    <v-col cols="12">
                        <v-data-table
                            hide-default-footer
                            class="overflow-y-auto"
                            no-data-text="Không có dữ liệu"
                            :items="dataDetail?.teacherFees || []"
                            :headers="teacherPaymentHeaders"
                            disable-pagination
                        >
                            <template #[`item.stt`]="{ index }">{{ index + 1 }}</template>
                            <template #[`item.amount`]="{ item }">
                                {{ $formatNumber(item.amount || 0) }} đ
                            </template>
                            <template #[`item.unitPrice`]="{ item }">
                                {{ $formatNumber(item.unitPrice || 0) }} đ
                            </template>
                            <template #[`item.classType`]="{ item }">
                                {{ getClassTypeText(item.classType) }}
                            </template>
                        </v-data-table>
                    </v-col>
                </v-card>
            </v-col>
        </v-row>
    </base-modal>
</template>
<script>
import BaseDetailItem from "~/components/Base/DetailItem.vue";
import decisionTeacherJobFeeServices from "~/services/re-learning/decisionTeacherJobFeeServices";
import { retakeCourseStatusList } from "~/consts/list";

export default {
    name: "ReLearingPaymentTeacherExamDetail",
    components: { BaseDetailItem },

    props: {
        open: {
            type: Boolean,
            default: false,
        },
        dataItem: {
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        return {
            isLoading: false,
            dataDetail: {},
            teacherPaymentHeaders: [
                { text: "STT", value: "stt", sortable: false, width: 80 },
                { text: "Họ tên giảng viên", value: "name", sortable: true },
                { text: "Mã lớp giảng dạy", value: "classCode", sortable: true },
                { text: "Số tiết", value: "period", sortable: false },
                { text: "Số lượng sinh viên", value: "numberOfStudent", sortable: false },
                { text: "Định mức", value: "unitPrice", sortable: false },
                { text: "Loại lớp", value: "classType", sortable: false },
                { text: "Số tiền", value: "amount", sortable: true },
            ],
            paymentTeacherStatusList: [
                { value: "WAIT_PAID", text: "Chờ thanh toán", color: "primary" },
                { value: "COMPLETE_PAID", text: "Đã thanh toán", color: "green" },
                { value: "CANCELED_PAID", text: "Hủy thanh toán", color: "red" },
            ],
        };
    },
    computed: {
        getClassTypeText() {
            return (classType) => {
                return (
                    retakeCourseStatusList.find((status) => status.value === classType)?.text || ""
                );
            };
        },
    },
    watch: {
        open: {
            handler(value) {
                if (value) {
                    this.getDetail();
                }
            },
            immediate: true,
        },
    },

    methods: {
        async getDetail() {
            const res = await decisionTeacherJobFeeServices.getDetailExam(this.dataItem.id);
            if (res.success) {
                this.dataDetail = res.data || {};
            }
        },
        getStatus(status) {
            const found = this.paymentTeacherStatusList.find((item) => item.value === status);
            return found ? found.text : status;
        },
    },
};
</script>
<style scoped>
:deep .v-data-table__wrapper {
    max-height: 200px;
    overflow: scroll;
}
</style>
