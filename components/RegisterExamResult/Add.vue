<template>
    <base-modal
        :open="open"
        :loading="loadSubmit"
        max-width="1100"
        title="Thêm bảng điểm"
        @OK="handleAdd"
        @toggle="open = !open"
    >
        <v-form ref="form" lazy-validation @submit.prevent>
            <v-row class="mt-3" dense>
                <v-col cols="12">
                    <div class="table-container" style="max-height: 700px; overflow-y: auto">
                        <v-data-table
                            :headers="headers"
                            :items="list"
                            checkbox-color="primary"
                            no-data-text="Không có dữ liệu"
                            :loading="loadOpen"
                            item-key="id"
                            hide-default-footer
                            :items-per-page="-1"
                            :footer-props="{
                                'items-per-page-options': [-1],
                                'items-per-page-text': 'Hiển thị tất cả',
                            }"
                        >
                            <template #[`item.stt`]="{ index }">
                                {{ ++index }}
                            </template>
                            <template #[`item.score`]="{ item }">
                                <div class="d-flex align-center justify-center">
                                    <v-text-field
                                        v-model="item.score"
                                        type="number"
                                        dense
                                        hide-details
                                        single-line
                                        outlined
                                        :rules="[$required]"
                                        @input="formatScore(item)"
                                    />
                                </div>
                            </template>
                            <template #[`item.note`]="{ item }">
                                <div class="d-flex align-center justify-center">
                                    <v-text-field
                                        v-model="item.notes"
                                        single-line
                                        :rules="[$over255]"
                                    />
                                </div>
                            </template>
                        </v-data-table>
                    </div>
                </v-col>
            </v-row>
        </v-form>
    </base-modal>
</template>
<script>
import registerRetakeCourseServices from "~/services/registerRetakeCourseServices";
import retakeCourseService from "~/services/retakeCourseService";
export default {
    name: "RegisterExamResult",
    props: {
        examSessionId: {
            type: String,
            default: () => "",
        },
    },
    data() {
        return {
            list: [],
            open: false,
            loadOpen: false,
            loadSubmit: false,
            headers: [
                { value: "stt", text: "STT", sortable: false },
                { value: "name", text: "Họ và tên", sortable: false },
                { value: "score", text: "Điểm", sortable: false, width: 80 },
                { value: "note", text: "Ghi chú", sortable: false },
            ],
            fileName: "",
        };
    },
    watch: {
        open(newVal) {
            if (!newVal) {
                Object.assign(this.$data, this.$options.data());
                this.$refs.form.resetValidation();
            } else {
                this.getData();
            }
        },
    },
    methods: {
        async getData() {
            this.loadOpen = true;
            try {
                const res = await registerRetakeCourseServices.getStudentByExamSession({
                    examSessionId: this.examSessionId,
                });
                if (res.success) {
                    this.list = res?.data.map((item) => ({
                        name: item.name,
                        id: item.id,
                        notes: "",
                    }));
                }
            } catch (e) {}
            this.loadOpen = false;
        },

        async handleAdd() {
            if (!this.$refs.form.validate()) return;
            this.loadSubmit = true;
            try {
                const params = {
                    examSessionId: this.$route.query.examSessionId,
                    examResultCreateList: this.list.map((i) => ({
                        score: parseFloat(i.score),
                        registerStudentTermId: i.id,
                        scoreStatus: "NOT_CLOSED",
                        notes: i.notes,
                    })),
                };
                const res = await retakeCourseService.addResults(params);
                if (res.success) {
                    this.open = false;
                    this.$showSuccess("Thêm mới thành công");
                    this.$parent.getList();
                    this.$parent.getExamSession(this.$route.query.examSessionId);
                }
            } catch (er) {
                console.log(er);
            }
            this.loadSubmit = false;
        },

        formatScore(item) {
            if (item.score >= 100) {
                this.$nextTick(() => {
                    item.score = 10;
                });
                return;
            }
            if (item.score > 10) {
                this.$nextTick(() => {
                    item.score = item.score / 10;
                });
                return;
            }
            if (!Number.isInteger(Number(item.score)) && item.score > 0) {
                this.$nextTick(() => {
                    item.score = Number.parseFloat(item.score).toFixed(1);
                });
                return;
            }
            if (item.score < 0) {
                this.$nextTick(() => {
                    item.score = 0;
                });
            }
        },
    },
};
</script>

<style scoped>
.table-container {
    border: 1px solid #e0e0e0;
    border-radius: 4px;
}

.table-container::-webkit-scrollbar {
    width: 8px;
}

.table-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}
</style>
