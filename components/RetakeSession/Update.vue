<script>
import retakeSessionServices from "~/services/retakeSessionServices";
import semesterServices from "~/services/semesterServices";
import BaseDatePicker from "~/components/Base/DatePicker.vue";
import { statusList } from "~/consts/list";

const INIT = {
    id: null,
    semesterId: null,
    status: "",
    fromTime: "",
    toTime: "",
    type: "RETAKE_COURSES",
};

export default {
    name: "RetakeSessionUpdate",
    components: { BaseDatePicker },
    props: {
        dataItem: {
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        return {
            open: false,
            timeChoose: [],
            body: {
                ...INIT,
            },
            isLoading: false,
            examList: [],
            // termList: [],
            semesterList: [],
        };
    },
    watch: {
        open(newVal) {
            if (!newVal) {
                Object.assign(this.$data, this.$options.data());
                this.$refs.form.resetValidation();
            } else {
                this.getSemester();
                this.body.status = this.dataItem?.status;
                this.body.id = this.dataItem?.id;
                this.body.toTime = this.dataItem?.toTime;
                this.body.fromTime = this.dataItem?.fromTime;
                this.body.semesterId = this.dataItem?.semester?.id;
            }
        },
    },
    methods: {
        statusList() {
            return statusList;
        },
        async getSemester() {
            const res = await semesterServices.getAll({ status: "ACTIVE" });
            if (res.success) this.semesterList = res.data;
        },
        async handleUpdate() {
            if (!this.$refs.form.validate()) return;
            this.isLoading = true;
            try {
                const res = await retakeSessionServices.update({
                    ...this.body,
                });

                if (res.success) {
                    this.open = false;
                    this.$showSuccess("Cập nhật thành công");
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
        title="Cập nhật đợt đăng ký học lại"
        @OK="handleUpdate"
        @toggle="open = !open"
    >
        <v-form ref="form" lazy-validation @submit.prevent>
            <v-row class="mt-3" dense>
                <v-col cols="12" md="6">
                    <base-select
                        v-model="body.semesterId"
                        :items="semesterList"
                        item-text="name"
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
                        label="Thời gian kết thúc đăng ký"
                        v-model="body.toTime"
                        :rules="[(e) => $isAfter(e, body.fromTime)]"
                    />
                </v-col>
            </v-row>
        </v-form>
    </base-modal>
</template>
