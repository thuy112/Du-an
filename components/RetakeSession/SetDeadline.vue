<script>
import retakeCourseServices from "~/services/retakeCourseServices";
import BaseDatePicker from "~/components/Base/DatePicker.vue";

const INIT = {
    id: null,
    deadline: "",
};

export default {
    name: "RetakeSessionSetDeadline",
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
            body: {
                ...INIT,
            },
            isLoading: false,
        };
    },
    watch: {
        open(newVal) {
            if (!newVal) {
                Object.assign(this.$data, this.$options.data());
                this.$refs.form.resetValidation();
            } else {
                this.body.id = this.dataItem?.id;
                this.body.deadline = this.dataItem?.paymentToTime || "";
            }
        },
    },
    methods: {
        async handleSetDeadline() {
            if (!this.$refs.form.validate()) return;
            this.isLoading = true;
            try {
                const res = await retakeCourseServices.setDeadline({
                    id: this.body.id,
                    date: this.body.deadline,
                });
                if (res.success) {
                    this.open = false;
                    this.$showSuccess("Cài đặt thời hạn đóng thành công");
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
        max-width="500"
        title="Cài đặt thời hạn đóng"
        @OK="handleSetDeadline"
        @toggle="open = !open"
    >
        <v-form ref="form" lazy-validation @submit.prevent>
            <v-row class="mt-3" dense>
                <!-- <v-col cols="12">
                    <base-detail-item title="Tên đợt học lại" :value="dataItem?.name" />
                </v-col> -->
                <v-col cols="12">
                    <base-detail-item title="Mã đợt học lại" :value="dataItem?.code" />
                </v-col>
                <v-col cols="12" class="mt-2">
                    <base-date-picker
                        v-model="body.deadline"
                        label="Hạn chót đóng học phí"
                        required
                    />
                </v-col>
            </v-row>
        </v-form>
    </base-modal>
</template>
