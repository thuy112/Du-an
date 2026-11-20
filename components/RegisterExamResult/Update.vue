<template>
    <base-modal :loading="loadSubmit" :open="open" max-width="700" title="Cập nhật bảng điểm học lại" @OK="handleUpdate"
        @toggle="open = !open">
        <v-form ref="form" lazy-validation @submit.prevent>
            <v-row class="mt-3" dense>
                <v-col cols="12">
                    <v-data-table :headers="headers" :items="list" no-data-text="Không có dữ liệu"
                        checkbox-color="primary" fixed-header hide-default-footer item-key="id" :loading="loadOpen">
                        <template #[`item.stt`]="{ index }">
                            {{ ++index }}
                        </template>
                        <template #[`item.score`]="{ item }">
                            <div class="d-flex align-center justify-center">
                                <v-text-field v-model="item.score" type="number" dense hide-details single-line outlined
                                    :rules="[$required]" @input="formatScore(item)" />
                            </div>
                        </template>
                        <template #[`item.note`]="{ item }">
                            <div class="d-flex align-center justify-center">
                                <v-text-field v-model="item.notes" single-line :rules="[$over255]" />
                            </div>
                        </template>
                    </v-data-table>
                </v-col>
            </v-row>
        </v-form>
    </base-modal>
</template>

<script>
import retakeCourseService from "~/services/retakeCourseService";

export default {
    name: "RegisterExamResultUpdate",
    data() {
        return {
            search: "",
            open: false,
            list: [],
            headers: [
                { value: "stt", text: "STT", sortable: false },
                { value: "name", text: "Họ và tên", sortable: false },
                { value: "score", text: "Điểm", sortable: false, width: 80 },
                { value: "note", text: "Ghi chú", sortable: false },
            ],
            loadOpen: false,
            loadSubmit: false,
        };
    },
    watch: {
        open(newVal) {
            if (!newVal) {
                Object.assign(this.$data, this.$options.data());
                this.$refs.form.resetValidation();
            }
        },
    },
    methods: {
        async handleUpdate() {
            if (!this.$refs.form.validate()) return;
            this.loadSubmit = true;
            try {
                const params = this.list[0];

                const res = await retakeCourseService.updateResult(params);
                if (res.success) {
                    this.open = false;
                    this.$showSuccess("Cập nhật thông tin thành công");
                    this.$parent.getList();
                    this.$parent.getExamSession(this.$route.query.examSessionId);
                }
            } catch (er) {
                console.log(er);
            }
            this.loadSubmit = false;
        },

        async getUpdate(item) {
            this.loadOpen = true;
            try {
                const res = await retakeCourseService.getDetailResult(item.id);
                if (res.success) {
                    this.list = [
                        {
                            id: item.id,
                            score: res.data.score,
                            name: res.data.name,
                            registerStudentTermId: res.data.registerStudentTermId,
                            notes: res.data.notes ? res.data.notes : "",
                        },
                    ];
                }
            } catch (e) {
                console.error(e);
            }
            this.loadOpen = false;
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
:deep .v-data-table__wrapper {
    max-height: calc(100vh - 500px);
}
</style>
