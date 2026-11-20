<template>
    <base-modal
        :loading="isLoading"
        :open="open"
        max-width="900"
        title="Thêm mới lớp học lại"
        @OK="handleAdd"
        @toggle="open = !open"
    >
        <v-form ref="form" lazy-validation @submit.prevent>
            <v-row class="mt-3" dense>
                <!-- Đợt học lại -->
                <v-col cols="12" md="6">
                    <base-select
                        v-model="body.retakeSessionId"
                        :items="examList"
                        item-text="code"
                        item-value="id"
                        label="Đợt học lại"
                        required
                    />
                </v-col>

                <!-- Học phần -->
                <v-col cols="12" md="6">
                    <base-select
                        v-model="body.termId"
                        :items="termList"
                        item-text="termItemText"
                        item-value="id"
                        label="Học phần"
                        required
                    />
                </v-col>

                <!-- Đơn vị -->
                <v-col cols="12" md="6">
                    <base-select
                        v-model="body.workUnitId"
                        :items="workUnitList"
                        item-text="name"
                        item-value="id"
                        label="Đơn vị"
                    />
                </v-col>

                <!-- Khoa -->
                <v-col cols="12" md="6">
                    <v-text-field
                        v-model="body.faculty"
                        label="Khoa"
                        outlined
                        dense
                        hide-details="auto"
                    />
                </v-col>

                <!-- Ghi chú -->
                <v-col cols="12" md="6">
                    <v-text-field
                        v-model="body.note"
                        label="Ghi chú"
                        outlined
                        dense
                        hide-details="auto"
                    />
                </v-col>

                <!-- Số lượng SV tối đa -->
                <v-col cols="12" md="6">
                    <v-text-field
                        v-model.number="body.quantitySeat"
                        label="Số lượng SV tối đa (*)"
                        type="number"
                        min="1"
                        outlined
                        dense
                        hide-details="auto"
                        :rules="[(v) => v > 0 || 'Vui lòng nhập số lượng SV tối đa']"
                    />
                </v-col>

                <!-- Loại lớp -->
                <v-col cols="12" md="6">
                    <base-select
                        v-model="body.classCoefficientId"
                        :items="classTypeOptions"
                        item-text="text"
                        item-value="id"
                        :loading="classTypeLoading"
                        label="Loại lớp"
                        required
                    />
                </v-col>

                <!-- Hình thức đào tạo -->
                <v-col cols="12" md="6">
                    <base-select
                        v-model="body.trainingMethodId"
                        :items="trainingMethodList"
                        item-text="name"
                        item-value="id"
                        label="Hình thức đào tạo"
                        required
                    />
                </v-col>

                <!-- Switch nhập theo tuần -->
                <v-col cols="12" class="pb-2 d-flex align-center">
                    <v-switch
                        v-model="useWeekInput"
                        label="Nhập theo tuần"
                        color="primary"
                        class="mt-0"
                        hide-details
                    />
                </v-col>

                <!-- Date inputs -->
                <template v-if="!useWeekInput">
                    <v-col cols="12" md="6">
                        <v-text-field
                            v-model="body.fromTime"
                            label="Thời gian bắt đầu (*)"
                            type="date"
                            outlined
                            dense
                            hide-details="auto"
                            :max="body.toTime"
                            :rules="[(v) => !!v || 'Vui lòng nhập đủ thông tin']"
                        />
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-text-field
                            v-model="body.toTime"
                            label="Thời gian kết thúc (*)"
                            type="date"
                            outlined
                            dense
                            hide-details="auto"
                            :min="body.fromTime"
                            :rules="[
                                (v) => !!v || 'Vui lòng nhập đủ thông tin',
                                (e) =>
                                    !body.fromTime ||
                                    !e ||
                                    e >= body.fromTime ||
                                    'Thời gian kết thúc phải sau thời gian bắt đầu',
                            ]"
                        />
                    </v-col>
                </template>

                <!-- Week inputs -->
                <template v-if="useWeekInput">
                    <v-col cols="12" md="6">
                        <BaseWeekField
                            label="Từ tuần"
                            :data="body"
                            field="weekFromTime"
                            required="Vui lòng nhập đủ thông tin"
                            @update-field="handleWeekFieldUpdate"
                        />
                    </v-col>
                    <v-col cols="12" md="6">
                        <BaseWeekField
                            label="Đến tuần"
                            :data="body"
                            field="weekToTime"
                            required="Vui lòng nhập đủ thông tin"
                            @update-field="handleWeekFieldUpdate"
                        />
                    </v-col>
                </template>

                <!-- Hình thức giảng dạy -->
                <v-col cols="12" md="12">
                    <base-select
                        v-model="body.examEducationType"
                        :items="examEducationOptions()"
                        item-text="text"
                        item-value="value"
                        label="Hình thức giảng dạy"
                    />
                </v-col>
            </v-row>
        </v-form>
    </base-modal>
</template>

<script>
import retakeCourseService from "~/services/retakeCourseService";
import retakeSessionServices from "~/services/retakeSessionServices";
import termService from "~/services/termService";
import workUnitServices from "~/services/workUnitServices";
import { examEducationOptionList } from "~/consts/list";
import trainingMethodServices from "~/services/trainingMethodServices";
import coefficientServices from "~/services/coefficientServices";
import { getEndOfISOWeek, getRetakeClassTypeText, getStartOfISOWeek } from "~/utils/heppers";
import BaseWeekField from "~/components/Base/BaseWeekField.vue";

const INITIAL_STATE = {
    fromTime: "",
    quantitySeat: 0,
    retakeSessionId: null,
    termId: 0,
    workUnitId: null,
    faculty: "",
    note: "",
    toTime: "",
    examEducationType: "",
    trainingMethodId: null,
    classCoefficientId: null,
    weekFromTime: "",
    weekToTime: "",
};

const API_PAGE_SIZE = 100;

export default {
    name: "RetakeCourseAdd",
    components: {
        BaseWeekField,
    },
    data() {
        return {
            open: false,
            timeChoose: [],
            body: { ...INITIAL_STATE },
            isLoading: false,
            examList: [],
            termList: [],
            workUnitList: [],
            trainingMethodList: [],
            classTypeOptions: [],
            classTypeLoading: false,
            useWeekInput: false,
        };
    },
    watch: {
        open(newVal) {
            if (!newVal) {
                this.resetForm();
                return;
            }
            this.initializeData();
        },
        useWeekInput(newVal) {
            this.toggleTimeInputMode(newVal);
        },
    },
    methods: {
        handleWeekFieldUpdate({ field, value }) {
            if (this.body && field) {
                this.$set(this.body, field, value);
            }
        },

        resetForm() {
            Object.assign(this.$data, this.$options.data());
            this.$refs.form?.resetValidation();
        },

        async initializeData() {
            try {
                await Promise.all([
                    this.getExams(),
                    this.getTerms(),
                    this.getWorkUnits(),
                    this.getTrainingMethods(),
                    this.getClassTypes(),
                ]);
            } catch (error) {
                console.error("Error initializing data:", error);
                this.$showError("Có lỗi xảy ra khi tải dữ liệu");
            }
        },

        async getExams() {
            try {
                const res = await retakeSessionServices.getAll({ status: "ACTIVE" });
                if (res.success) {
                    this.examList = res.data.map((item) => ({
                        id: item.id,
                        code: item?.code,
                    }));
                }
            } catch (error) {
                console.error("Error fetching exams:", error);
            }
        },

        async getTrainingMethods() {
            try {
                const res = await trainingMethodServices.getList({
                    pageSize: API_PAGE_SIZE,
                    pageIndex: 1,
                });
                if (res.success) {
                    this.trainingMethodList = res.data.data.map((item) => ({
                        id: item.id,
                        name: item.name,
                    }));
                }
            } catch (error) {
                console.error("Error fetching training methods:", error);
            }
        },

        async getTerms() {
            try {
                const res = await termService.getAll({ status: "ACTIVE" });
                if (res.success) {
                    this.termList = (res.data || []).map((item) => {
                        const isCourseProjectZero = item.isCourseProject === 0;
                        const baseText = `${item.name} - ${item.code}`;
                        const termItemText = isCourseProjectZero
                            ? `${baseText} - ${item.period}`
                            : baseText;
                        return { ...item, termItemText };
                    });
                }
            } catch (error) {
                console.error("Error fetching terms:", error);
            }
        },

        async getWorkUnits() {
            try {
                const res = await workUnitServices.getList({
                    pageSize: API_PAGE_SIZE,
                    pageIndex: 1,
                });
                if (res.success) {
                    this.workUnitList = res.data.data.map((item) => ({
                        id: item.id,
                        name: item.name,
                    }));
                }
            } catch (error) {
                console.error("Error fetching work units:", error);
            }
        },

        async getClassTypes() {
            try {
                this.classTypeLoading = true;
                const res = await coefficientServices.getList({
                    pageSize: API_PAGE_SIZE,
                    pageIndex: 1,
                });

                if (res.success) {
                    const list = Array.isArray(res.data.data) ? res.data.data : [];
                    this.classTypeOptions = list.map((item) => {
                        const baseText = getRetakeClassTypeText(item.classType, item.courseType);
                        const displayText = `${baseText} ( Từ ${item.minStudent} - ${item.maxStudent} sinh viên )`;

                        return {
                            id: item.id,
                            value: baseText,
                            text: displayText,
                        };
                    });
                }
            } catch (error) {
                console.error("Error fetching class types:", error);
            } finally {
                this.classTypeLoading = false;
            }
        },

        toggleTimeInputMode(useWeekInput) {
            if (useWeekInput) {
                this.body.fromTime = "";
                this.body.toTime = "";
            } else {
                this.body.weekFromTime = "";
                this.body.weekToTime = "";
            }
        },

        async handleAdd() {
            if (!this.$refs.form.validate()) return;

            this.isLoading = true;
            try {
                const requestBody = this.prepareRequestBody();
                const res = await retakeCourseService.addNew(requestBody);

                if (res.success) {
                    this.open = false;
                    this.$showSuccess("Thêm mới thành công");
                    this.$parent.getList();
                }
            } catch (error) {
                console.error("Error adding retake course:", error);
                this.$showError("Có lỗi xảy ra khi thêm mới");
            } finally {
                this.isLoading = false;
            }
        },

        prepareRequestBody() {
            const requestBody = {
                ...this.body,
                isWeek: this.useWeekInput ? 1 : 0,
            };

            if (this.useWeekInput) {
                requestBody.fromTime = getStartOfISOWeek(requestBody.weekFromTime);
                requestBody.toTime = getEndOfISOWeek(requestBody.weekToTime);
                delete requestBody.weekFromTime;
                delete requestBody.weekToTime;
            } else {
                requestBody.fromTime = requestBody.fromTime ? `${requestBody.fromTime} 00:00:00` : "";
                requestBody.toTime = requestBody.toTime ? `${requestBody.toTime} 23:59:59` : "";
                delete requestBody.weekFromTime;
                delete requestBody.weekToTime;
            }

            return requestBody;
        },

        examEducationOptions() {
            return examEducationOptionList;
        },
    },
};
</script>