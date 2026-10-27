<template>
    <base-modal
        :open="open"
        max-width="750"
        title="Cập nhật định mức giảng viên"
        @OK="handleUpdate"
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
                        disabled
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
                        disabled
                    />
                </v-col>
            </v-row>
        </v-form>
    </base-modal>
</template>
<script>
import feeTeacherServices from '~/services/feeTeacherServics' 

export default {
    name: "FeeTeacherUpdate",
    data() {
        return {
            open: false,
            params: {
                id: null,
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
        async handleUpdate() {
            if (!this.$refs.form.validate()) return;
            try {
                const res = await feeTeacherServices.update({
                    ...this.params,
                });
                if (res.success) {
                    this.open = false;
                    this.$showSuccess("Cập nhật thành công");
                    this.$parent.getList();
                }
            } catch (er) {
                console.log(er);
            }
        },

        getUpdate(item) {
            const { id, classType, fee, trainingMethod } = item;
            this.params = {
                id,
                classType,
                fee,
                trainingMethodId: trainingMethod?.id || null,
                note: item.note || null,
                isDelete: 0,
            };
        },
    },
};
</script>
