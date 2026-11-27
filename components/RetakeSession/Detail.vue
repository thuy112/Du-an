<template>
    <base-modal
        :loading="isLoading"
        :open="open"
        max-width="700"
        title="Xem chi tiết đợt đăng ký học lại"
        off-btn
        @toggle="open = !open"
    >
        <v-row class="mt-3" dense>
            <v-col cols="12" md="6">
                <base-detail-item title="Mã đợt học lại" :value="item?.code" />
            </v-col>
            <v-col cols="12" md="6">
                <base-detail-item title="Học kỳ" :value="item?.semester?.name" />
            </v-col>
            <v-col cols="12" md="6">
                <base-detail-item title="Loại hình">
                    <template #value>
                        {{ sendTypeList().find((data) => item?.type === data.value)?.text }}
                    </template>
                </base-detail-item>
            </v-col>
            <v-col cols="12" md="6">
                <base-detail-item title="Thời gian đăng ký">
                    <template #value>
                        <span v-if="item.fromTime">{{ $formatDate(item.fromTime) }} ~ </span>
                        <span v-if="item.toTime">{{ $formatDate(item.toTime) }}</span>
                    </template>
                </base-detail-item>
            </v-col>
            <v-col cols="12" md="6">
                <base-detail-item title="Hạn chót đóng phí học lại">
                    <template #value>
                        <span v-if="item.paymentToTime">{{ $formatDate(item.paymentToTime) }}</span>
                    </template>
                </base-detail-item>
            </v-col>
            <v-col cols="12" md="6">
                <base-detail-item title="Trạng thái">
                    <template #value>
                        <v-chip :color="getStatus(item?.status)?.color" small
                            >{{ getStatus(item?.status)?.text }}
                        </v-chip>
                    </template>
                </base-detail-item>
            </v-col>
        </v-row>
    </base-modal>
</template>
<script>
import { sendTypeList, statusList } from "~/consts/list";
import BaseDetailItem from "~/components/Base/DetailItem.vue";

export default {
    name: "RetakeSessionDetail",
    components: { BaseDetailItem },
    data() {
        return {
            item: {},
            headers: [
                { text: "STT", value: "stt", sortable: false },
                { text: "Tên học phần", value: "name", sortable: false },
                { text: "Mã học phần", value: "code", sortable: false },
                { text: "Số tín chỉ học phí", value: "creditHours", sortable: false },
            ],
            list: [],
            open: false,
            search: "",
            isLoading: false,
            statusList,
        };
    },
    watch: {
        open(newVal) {
            if (!newVal) {
                Object.assign(this.$data, this.$options.data());
            }
        },
    },
    methods: {
        getStatus(value) {
            const data = this.statusList.find((item) => item.value === value);
            return data;
        },
        sendTypeList() {
            return sendTypeList;
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
