<template>
    <base-modal
        :loading="isLoading"
        :open="open"
        max-width="900"
        title="Chi tiết thanh toán GV theo lớp học lại"
        off-btn
        @toggle="$emit('toggle')"
    >
        <v-row class="mt-3" dense>
            <!-- Thông tin thanh toán -->
            <v-col cols="12">
                <v-card class="mb-3" outlined>
                    <v-card-title class="text-h6 primary--text"
                        >Thông tin thanh toán giảng viên</v-card-title
                    >
                    <v-card-text>
                        <v-row dense>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Tên giảng viên"
                                    :value="dataDetail?.teacherName"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Mã lớp học lại"
                                    :value="dataDetail?.classCode"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Loại lớp"
                                    :value="
                                        getRetakeClassTypeText(
                                            dataDetail?.classCoefficientDto?.classType ??
                                                dataDetail?.classType,
                                            dataDetail?.classCoefficientDto?.courseType ??
                                                dataDetail?.courseType,
                                            dataDetail?.classCoefficientDto?.isCourseNormal ??
                                                dataDetail?.isCourseNormal
                                        )
                                    "
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Đợt học lại"
                                    :value="dataDetail?.examName"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Tên học phần"
                                    :value="dataDetail?.courseName"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Định mức"
                                    :value="$formatNumber(dataDetail?.unitPrice) + ' đ'"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Số tín chỉ học phí"
                                    :value="dataDetail?.creditTuition"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Tổng số tiết"
                                    :value="dataDetail?.period"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Số lượng sinh viên"
                                    :value="dataDetail?.numberOfStudent"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Tổng phí"
                                    :value="$formatNumber(dataDetail?.totalFee) + ' đ'"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Thuế thu nhập cá nhân"
                                    :value="$formatNumber(dataDetail?.totalTaxFee) + ' đ'"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Trạng thái"
                                    :value="getStatus(dataDetail?.status)"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <div class="d-flex align-center">
                                    <span class="mr-3">File thông tin:</span>
                                    <v-btn
                                        :disabled="!dataDetail?.fileInform"
                                        color="primary"
                                        icon
                                        large
                                        @click="$download(dataDetail.fileInform)"
                                    >
                                        <v-icon>mdi-file-download-outline</v-icon>
                                    </v-btn>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </base-modal>
</template>
<script>
import BaseDetailItem from "~/components/Base/DetailItem.vue";
import decisionTeacherJobFeeServices from "~/services/re-learning/decisionTeacherJobFeeServices";
import { getRetakeClassTypeText } from "~/utils/heppers";
export default {
    name: "ReLearingPaymentTeacherClassDetail",
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
    emits: ["toggle"],
    data() {
        return {
            isLoading: false,
            dataDetail: {},
            paymentTeacherStatusList: [
                { value: "WAIT_PAID", text: "Chưa thanh toán", color: "primary" },
                { value: "COMPLETE_PAID", text: "Đã thanh toán", color: "green" },
                { value: "CANCELED_PAID", text: "Hủy thanh toán", color: "red" },
            ],
            classTypeList: [
                { value: "NEW_CLASS", text: "Lớp mở", color: "primary" },
                { value: "COMBINE_CLASS", text: "Lớp ghép", color: "warning" },
                { value: "PROJECT_BASED_CLASS", text: "Đồ án môn học", color: "red" },
            ],
            getRetakeClassTypeText,
        };
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
            this.isLoading = true;
            try {
                const res = await decisionTeacherJobFeeServices.getDetailClass(this.dataItem.id);
                if (res.success) {
                    this.dataDetail = res.data;
                }
            } catch (error) {
                console.error("Error getting detail:", error);
            } finally {
                this.isLoading = false;
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
