<script>
import examResultServices from "~/services/examResultServices";
import { closeStatusList } from "~/consts/list";

export default {
    name: "RegisterRetakeCourseScoreboard",

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
        closeStatusList,

        list: [],
        headers: [
            { value: "stt", text: "STT", sortable: false },
            { value: "examSession.examClass", text: "Phòng thi", align: "center", sortable: false },
            {
                value: "term.name",
                text: "Học phần",
                align: "center",
                sortable: false,
            },

            { value: "score", text: "Điểm", sortable: false },
            { value: "notes", text: "Ghi chú", align: "center", sortable: false },
            { value: "scoreStatus", text: "Trạng thái", align: "center", sortable: false },
            // { value: "actions", text: "Chức năng", align: "center", sortable: false },
        ],
    }),
    watch: {
        open: {
            handler(val) {
                if (val) {
                    this.getList();
                }
            },
            immediate: true,
        },
    },
    methods: {
        async getList() {
            try {
                this.isLoading = true;
                const res = await examResultServices.getRetakeCourseResultByRegisterExam({
                    registerExamId: this.dataItem.id,
                });
                if (res.success) {
                    this.list = res.data.filter((i) => i !== null);
                }
            } catch (e) {
                console.error(e);
            }
            this.isLoading = false;
        },
    },
};
</script>

<template>
    <BaseModal
        :loading="isLoading"
        :open="open"
        title="Bảng điểm"
        max-width="1000"
        off-btn
        @toggle="$emit('toggle')"
    >
        <v-row class="ma-0" dense>
            <v-col cols="12" class="mt-3">
                <v-data-table
                    checkbox-color="primary"
                    hide-default-footer
                    no-data-text="Không có dữ liệu"
                    :items="list"
                    :headers="headers"
                    disable-pagination
                >
                    <template #[`item.stt`]="{ index }">
                        <span>{{ $getStt(index, pageInfo) }}</span>
                    </template>
                    <template #[`item.scoreStatus`]="{ item }">
                        <BaseStatusItem :status="item.scoreStatus" :status-list="closeStatusList" />
                    </template>
                </v-data-table>
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
</style>
