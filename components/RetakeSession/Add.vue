<script>
import retakeCourseServices from "~/services/retakeCourseServices";
import examServices from "~/services/examServices";
import semesterServices from "~/services/semesterServices";
import BaseDatePicker from "~/components/Base/DatePicker.vue";
import { statusList } from "~/consts/list";

const INIT = {
    fromTime: "",
    semesterId: null,
    status: "ACTIVE",
    toTime: "",
    type: "RETAKE_COURSES",
    // name: "",
    // code: "",
    // terms: [],
};

export default {
    name: "RetakeSessionAdd",
    components: { BaseDatePicker },
    data() {
        return {
            headers: [
                { text: "Tên học phần", value: "name", sortable: false },
                { text: "Mã học phần", value: "code", sortable: false },
                { text: "Số tín chỉ học phí", value: "creditHours", sortable: false },
            ],
            search: "",
            selectedTerms: [],
            open: false,
            body: {
                ...INIT,
            },
            isLoading: false,
            examList: [],
            semesterList: [],
            // termList: [],
        };
    },
    watch: {
        open(newVal) {
            if (!newVal) {
                Object.assign(this.$data, this.$options.data());
                this.$refs.form.resetValidation();
                return;
            }
            this.getSemester();
        },
    },
    methods: {
        statusList() {
            return statusList;
        },
        async getExam() {
            const res = await examServices.getAll({
                status: "ACTIVE",
            });
            if (res.success) {
                this.examList = res.data;
            }
        },
        async getSemester() {
            const res = await semesterServices.getAll({ status: "ACTIVE" });
            if (res.success)
                this.semesterList = res.data.map((item) => ({
                    id: item?.id,
                    name: item?.name,
                    code: item?.code,
                    text: `${item?.name} | ${item?.code}`,
                }));
        },

        async handleAdd() {
            if (this.isLoading) return;
            if (!this.$refs.form.validate()) return;
            this.isLoading = true;
            try {
                const res = await retakeCourseServices.addNew(this.body);
                if (res.success) {
                    this.open = false;
                    this.$showSuccess("Thêm mới thành công");
                    this.$parent.getList();
                }
            } catch (er) {
                console.log(er);
            }
            this.isLoading = false;
        },
    },
};
</script>

<template>
    <base-modal
        :loading="isLoading"
        :open="open"
        max-width="900"
        title="Thêm mới đợt đăng ký học lại"
        @OK="handleAdd"
        @toggle="open = !open"
    >
        <v-form ref="form" lazy-validation @submit.prevent>
            <v-row class="mt-3" dense>
                <v-col cols="12" md="6">
                    <base-select
                        v-model="body.semesterId"
                        :items="semesterList"
                        item-text="text"
                        item-value="id"
                        label="Học kỳ"
                        required
                    />
                </v-col>

                <v-col cols="12" md="6">
                    <base-select
                        v-model="body.status"
                        :items="statusList()"
                        item-text="text"
                        item-value="value"
                        label="Trạng thái"
                        required
                    />
                </v-col>
                <v-col cols="12" md="6">
                    <base-date-picker v-model="body.fromTime" label="Thời gian bắt đầu đăng ký" />
                </v-col>
                <v-col cols="12" md="6">
                    <base-date-picker
                        v-model="body.toTime"
                        label="Thời gian kết thúc đăng ký"
                        :rules="[(e) => $isAfter(e, body.fromTime)]"
                    />
                </v-col>
            </v-row>
        </v-form>
    </base-modal>
</template>
