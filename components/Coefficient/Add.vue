<template>
    <base-modal
        :open="open"
        max-width="600"
        title="Thêm mới hệ số lớp"
        @OK="handleAdd"
        @toggle="open = !open"
    >
        <v-form ref="form" lazy-validation @submit.prevent>
            <v-row class="mt-3" dense>
                <v-col cols="12">
                    <base-select
                        v-model="params.classType"
                        :items="retakeCourseStatus"
                        label="Loại lớp"
                        item-text="text"
                        item-value="value"
                        required
                    />
                </v-col>
                <v-col cols="12" v-if="params.classType === 'COMBINE_CLASS'">
                    <base-select
                        v-model="params.courseType"
                        :items="retakeCourseSubClassTypes"
                        label="Loại học phần"
                        item-text="text"
                        item-value="value"
                        required
                    />
                </v-col>
                <v-col cols="12">
                    <base-text-field
                        v-model.number="params.coefficient"
                        label="Thu học phí SV"
                        type="number"
                        step="0.1"
                        min="0"
                        required
                    />
                </v-col>
                <v-col cols="12">
                    <base-text-field
                        v-model.number="params.coefficientTeacher"
                        label="Thanh toán giảng dạy"
                        type="number"
                        step="0.1"
                        min="0"
                        required
                    />
                </v-col>
                <v-col cols="12">
                    <base-text-field v-model="params.description" label="Mô tả" textarea rows="2" />
                </v-col>
                <v-col cols="12">
                    <base-text-field
                        v-model.number="params.minStudent"
                        label="Số lượng tối thiểu"
                        type="number"
                        min="0"
                        :rules="[(v) => v >= 0 || 'Số lượng tối thiểu phải lớn hơn hoặc bằng 0']"
                        required
                    />
                </v-col>
                <v-col cols="12">
                    <base-text-field
                        v-model.number="params.maxStudent"
                        label="Số lượng tối đa"
                        type="number"
                        min="0"
                        :rules="maxStudentRules"
                        required
                    />
                </v-col>
                <v-col cols="12" v-if="params.classType === 'PROJECT_BASED_CLASS'" class="pb-2 d-flex align-center">
                    <v-switch
                        v-model="params.isCourseNormal"
                        label="Học phần thường"
                        color="primary"
                        class="mt-0"
                        hide-details
                    />
                </v-col>
            </v-row>
        </v-form>
    </base-modal>
</template>

<script>
import coefficientServices from "~/services/coefficientServices";
import { retakeCourseStatus, retakeCourseSubClassTypes } from "~/consts/list";

export default {
    name: "CoefficientAdd",
    data() {
        return {
            open: false,
            retakeCourseStatus,
            retakeCourseSubClassTypes,
            params: {
                classType: "NEW_CLASS",
                coefficient: null,
                coefficientTeacher: null,
                description: "",
                minStudent: null,
                maxStudent: null,
                courseType: "OUTLINE",
                isCourseNormal: false,
            },
        };
    },
    computed: {
        maxStudentRules() {
            return [
                (v) => {
                    if (this.params.minStudent !== null && v < this.params.minStudent) {
                        return "Số lượng tối đa không thể nhỏ hơn số lượng tối thiểu";
                    }
                    return true;
                },
            ];
        },
    },
    watch: {
        open(newVal) {
            if (!newVal) {
                Object.assign(this.$data, this.$options.data());
                this.$refs.form && this.$refs.form.resetValidation();
            }
        },
        "params.classType"(newVal) {
            if (newVal === "COMBINE_CLASS") {
                this.params.courseType = "OUTLINE";
            }
        },
    },
    methods: {
        async handleAdd() {
            if (!this.$refs.form.validate()) return;
            try {
                const addParams = {
                    ...this.params,
                    isCourseNormal: this.params.classType === "PROJECT_BASED_CLASS" ? this.params.isCourseNormal : false,
                };
                const res = await coefficientServices.addNew(addParams);
                if (res && (res.success || res.status === 200 || res.data)) {
                    this.open = false;
                    this.$emit("close");
                    this.$showSuccess("Thêm mới hệ số lớp thành công");
                }
            } catch (er) {
                console.log(er);
            }
        },
    },
};
</script>