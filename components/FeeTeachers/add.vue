<template>
    <base-modal
        :open="open"
        max-width="750"
        title="Thêm mới định mức giảng viên"
        @OK="handleAdd"
        @toggle="open = !open"
    >
        <v-form ref="form" lazy-validation @submit.prevent>
            <v-row class="mt-3" dense>
                <v-col cols="12" md="6">
                    <base-select
                        v-model="params.classType"
                        :items="retakeCourseStatusList"
                        item-text="text"
                        item-value="value"
                        label="Loại lớp"
                        required
                    />
                </v-col>
                <v-col cols="12" md="6">
                    <BaseMoneyInput
                        :data="params"
                        field="fee"
                        label="Giá tiền"
                        hide-details
                        required
                    />
                </v-col>
                <v-col cols="12">
                    <base-select
                        v-model="params.trainingMethodId"
                        :items="trainingMethodList"
                        item-text="name"
                        item-value="id"
                        label="Hình thức đào tạo"
                        required
                    />
                </v-col>
            </v-row>
        </v-form>
    </base-modal>
</template>
<script>
import feeTeacherServices from '~/services/feeTeacherServics' 

export default {
    name: "FeeTeacherAdd",
    data() {
        return {
            open: false,
            params: {
                classType: "",
                fee: "",
                trainingMethodId: null,
                note: null,
            },
            trainingMethodList: [],
            retakeCourseStatusList: [],
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
        async handleAdd() {
            if (!this.$refs.form.validate()) return;
            try {
                const res = await feeTeacherServices.add({
                    ...this.params,
                });
                if (res.success) {
                    this.open = false;
                    this.$showSuccess("Thêm mới thành công");
                    this.$parent.getList();
                }
            } catch (er) {
                console.log(er);
            }
        },
    },
};
</script>
