<template>
    <base-modal
        :open="open"
        max-width="600"
        title="Cập nhật hệ số lớp"
        @OK="handleUpdate"
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
                        label="Loại lớp ghép"
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
                        min="0.1"
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
            </v-row>
            <v-col cols="12" v-if="params.classType === 'PROJECT_BASED_CLASS'" class="pb-2 d-flex align-center">
                <v-switch
                    v-model="params.isCourseNormal"
                    label="Học phần thường"
                    color="primary"
                    class="mt-0"
                    hide-details
                />
            </v-col>
        </v-form>
    </base-modal>
</template>

<script>
import coefficientServices from "~/services/coefficientServices";
import { retakeCourseStatus, retakeCourseSubClassTypes } from "~/consts/list";

export default {
    name: "CoefficientUpdate",
    data() {
        return {
            open: false,
            retakeCourseStatus,
            retakeCourseSubClassTypes,
            params: {
                id: null,
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
            if (newVal !== "COMBINE_CLASS") {
                this.params.courseType = "OUTLINE";
            }
        },
    },
    methods: {
        async handleUpdate() {
            if (!this.$refs.form.validate()) return;
            try {
                const updateParams = {
                    ...this.params,
                    isCourseNormal:
                        this.params.classType === "PROJECT_BASED_CLASS" ? Boolean(this.params.isCourseNormal) : false,
                };
                const res = await coefficientServices.update(updateParams);
                if (res && (res.success || res.status === 200 || res.data)) {
                    this.open = false;
                    this.$emit("close");
                    this.$showSuccess("Cập nhật hệ số lớp thành công");
                }
            } catch (er) {
                console.log(er);
            }
        },
        getUpdate(item) {
            this.open = true;
            this.params = {
                ...this.params,
                ...item,
                classType: item.classType || "NEW_CLASS",
                isCourseNormal: item.isCourseNormal ?? false,
            };
        },
    },
};
</script>