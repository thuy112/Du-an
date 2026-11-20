<template>
    <base-modal
        :loading="isLoading"
        :open="open"
        max-width="1000"
        title="Chi tiết sinh viên phải học lại"
        off-btn
        @toggle="$emit('toggle')"
    >
        <v-row class="mt-3" dense>
            <!-- Thông tin sinh viên -->
            <v-col cols="12">
                <v-card class="mb-3" outlined>
                    <v-card-title class="text-h6 primary--text">Thông tin sinh viên</v-card-title>
                    <v-card-text>
                        <v-row dense>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Họ và tên sinh viên"
                                    :value="dataDetail?.student?.fullName || dataItem?.fullName"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Mã số sinh viên"
                                    :value="dataDetail?.student?.code || dataItem?.studentCode"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Ngày sinh"
                                    :value="formatDate(dataDetail?.student?.birthday)"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Giới tính"
                                    :value="
                                        dataDetail?.student?.gender
                                            ? dataDetail?.student?.gender === 'MALE'
                                                ? 'Nam'
                                                : 'Nữ'
                                            : ''
                                    "
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Email"
                                    :value="dataDetail?.student?.email"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Số điện thoại"
                                    :value="dataDetail?.student?.phone"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Địa chỉ"
                                    :value="dataDetail?.student?.address"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Quê quán"
                                    :value="dataDetail?.student?.homeTown"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Lớp"
                                    :value="dataDetail?.student?.classes?.name || dataItem?.className"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Ngành"
                                    :value="dataDetail?.student?.major?.name"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Khóa"
                                    :value="dataDetail?.student?.course?.name"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Hình thức đào tạo"
                                    :value="dataDetail?.student?.trainingMethod?.name"
                                />
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>

            <!-- Thông tin học lại -->
            <v-col cols="12">
                <v-card class="mb-3" outlined>
                    <v-card-title class="text-h6 primary--text">Thông tin học lại</v-card-title>
                    <v-card-text>
                        <v-row dense>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Đợt học lại"
                                    :value="dataDetail?.retakeSession?.code || dataItem?.sessionCode"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Học kỳ"
                                    :value="dataDetail?.semester?.name || dataItem?.termCode"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Mã học phần"
                                    :value="dataDetail?.term?.code || dataItem?.subjectCode"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Tên học phần"
                                    :value="dataDetail?.term?.name || dataItem?.subjectName"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Số tín chỉ"
                                    :value="dataDetail?.term?.creditHours"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Thời lượng"
                                    :value="dataDetail?.term?.workload"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <base-detail-item title="Trạng thái">
                                    <template #value>
                                        <v-chip
                                            v-if="getStatus(dataDetail?.status)"
                                            :color="getStatus(dataDetail?.status)?.color"
                                            small
                                        >
                                            {{ getStatus(dataDetail?.status)?.text }}
                                        </v-chip>
                                    </template>
                                </base-detail-item>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>

            <!-- Thông tin điểm -->
            <v-col cols="12">
                <v-card class="mb-3" outlined>
                    <v-card-title class="text-h6 primary--text">Thông tin điểm</v-card-title>
                    <v-card-text>
                        <v-row dense>
                            <v-col cols="12" md="3">
                                <base-detail-item
                                    title="Điểm giữa kỳ"
                                    :value="dataDetail?.scoreGk"
                                />
                            </v-col>
                            <v-col cols="12" md="3">
                                <base-detail-item
                                    title="Điểm thực hành thí nghiệm"
                                    :value="dataDetail?.scoreThTn"
                                />
                            </v-col>
                            <v-col cols="12" md="3">
                                <base-detail-item
                                    title="Điểm quá trình"
                                    :value="dataDetail?.scoreQt"
                                />
                            </v-col>
                            <v-col cols="12" md="3">
                                <base-detail-item
                                    title="Điểm cuối kỳ"
                                    :value="dataDetail?.scoreCk"
                                />
                            </v-col>
                            <v-col cols="12" md="3">
                                <base-detail-item
                                    title="Điểm cộng"
                                    :value="dataDetail?.scoreBonus"
                                />
                            </v-col>
                            <v-col cols="12" md="3">
                                <base-detail-item
                                    title="Điểm chữ"
                                    :value="dataDetail?.scoreCharacter"
                                />
                            </v-col>
                            <v-col cols="12" md="3">
                                <base-detail-item
                                    title="Học lại / Thi lại"
                                    :value="
                                        resultList.find(
                                            (item) => item.value === dataDetail?.retakeSession?.type
                                        )?.text
                                    "
                                />
                            </v-col>
                            <v-col cols="12" md="3">
                                <base-detail-item title="Hệ số" :value="dataDetail?.weight" />
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>

            <!-- Thông tin giảng viên -->
            <v-col cols="12">
                <v-card class="mb-3" outlined>
                    <v-card-title class="text-h6 primary--text">Thông tin giảng viên</v-card-title>
                    <v-card-text>
                        <v-row dense>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Họ và tên giảng viên"
                                    :value="dataDetail?.teacher?.fullName"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Mã giảng viên"
                                    :value="dataDetail?.teacher?.code"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Email"
                                    :value="dataDetail?.teacher?.email"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Số điện thoại"
                                    :value="dataDetail?.teacher?.phone"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Trạng thái giảng viên"
                                    :value="
                                        lecturerStatusList.find(
                                            (item) =>
                                                item.value === dataDetail?.teacher?.lecturerStatus
                                        )?.text
                                    "
                                />
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>

            <!-- Thông tin khác -->
            <v-col cols="12">
                <v-card class="mb-3" outlined>
                    <v-card-title class="text-h6 primary--text">Thông tin khác</v-card-title>
                    <v-card-text>
                        <v-row dense>
                            <v-col cols="12" md="6">
                                <base-detail-item
                                    title="Mã phòng thi"
                                    :value="dataDetail?.examRoomCode"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <base-detail-item title="Loại lớp" :value="dataDetail?.classType" />
                            </v-col>
                            <v-col cols="12">
                                <base-detail-item title="Ghi chú" :value="dataDetail?.note" />
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </base-modal>
</template>

<script>
import { allowRegisterStatusList, lecturerStatusList } from "~/consts/list";
import BaseDetailItem from "~/components/Base/DetailItem.vue";
import retakeCourseAuthListServices from "~/services/retakeCourseAuthListServices";

export default {
    name: "RetakeCourseDetailMustRetakeStudentModal",
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
            statusList: allowRegisterStatusList,
            dataDetail: {},
            resultList: [
                { text: "Học lại", value: "RETAKE_COURSES" },
                { text: "Thi lại", value: "RETAKE_EXAM" },
            ],
            lecturerStatusList,
        };
    },
    watch: {
        open: {
            handler(value) {
                if (value && this.dataItem?.id) {
                    this.getDetail();
                } else if (value) {
                    this.dataDetail = this.dataItem || {};
                }
            },
            immediate: true,
        },
    },
    methods: {
        getStatus(value) {
            return this.statusList.find((item) => item.value === value);
        },
        async getDetail() {
            this.isLoading = true;
            try {
                const res = await retakeCourseAuthListServices.getDetail(this.dataItem.id);
                if (res.success) {
                    this.dataDetail = res.data || {};
                } else {
                    this.dataDetail = this.dataItem || {};
                }
            } catch (error) {
                this.dataDetail = this.dataItem || {};
            } finally {
                this.isLoading = false;
            }
        },
        formatDate(date) {
            return date ? this.$formatDate(date) : "";
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