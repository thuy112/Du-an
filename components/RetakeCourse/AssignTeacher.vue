<script>
import teacherServices from "~/services/teacherServices";
import retakeCourseService from "~/services/retakeCourseService";

const INIT = {
    teacherId: null,
    assistantTeacherId: null,
};

export default {
    name: "RetakeCourseAssignTeacher",
    props: {
        dataItem: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            open: false,
            body: {
                ...INIT,
            },
            isLoading: false,
            teacherList: [],
        };
    },
    computed: {
        filteredAssistantTeacherList() {
            if (!this.body.teacherId) {
                return this.teacherList;
            }
            return this.teacherList.filter((teacher) => teacher.id !== this.body.teacherId);
        },
        filteredTeacherList() {
            if (!this.body.assistantTeacherId) {
                return this.teacherList;
            }
            return this.teacherList.filter(
                (teacher) => teacher.id !== this.body.assistantTeacherId
            );
        },
    },
    watch: {
        open(newVal) {
            if (!newVal) {
                Object.assign(this.$data, this.$options.data());
                this.$refs.form.resetValidation();
                return;
            }
            this.getTeachers();
        },
        "body.teacherId"(newVal) {
            if (newVal === this.body.assistantTeacherId) {
                this.body.assistantTeacherId = null;
            }
        },
        "body.assistantTeacherId"(newVal) {
            if (newVal === this.body.teacherId) {
                this.body.teacherId = null;
            }
        },
    },
    methods: {
        async getTeachers() {
            try {
                const res = await teacherServices.getAll({ status: "ACTIVE" });
                if (res.success) {
                    this.teacherList = res.data.map((item) => ({
                        id: item?.id,
                        name: [item?.fullName, item?.email, item?.code, item?.workUnit?.name]
                            .filter((v) => v && String(v).trim())
                            .join(" - "),
                        fullName: item?.fullName,
                        email: item?.email,
                        code: item?.code,
                    }));
                }
            } catch (e) {
                console.error(e);
            }
        },

        async handleAssign() {
            if (!this.$refs.form.validate()) return;
            this.isLoading = true;
            try {
                const selectedData = {
                    examSessionId: this.dataItem.id,
                    teacherId: this.body.teacherId,
                    teachingAssistantId: this.body.assistantTeacherId,
                };
                const res = await retakeCourseService.assignTeacher(selectedData);
                if (res.success) {
                    this.open = false;
                    this.$showSuccess("Gán giảng viên thành công");
                    this.$emit("teacherAssigned");
                }
            } catch (er) {
                console.log(er);
                this.$showError("Có lỗi xảy ra khi gán giảng viên");
            }
            this.isLoading = false;
        },
        openModal() {
            this.open = true;
        },
        closeModal() {
            this.open = false;
        },
    },
};
</script>

<template>
    <base-modal
        :loading="isLoading"
        :open="open"
        max-width="800"
        title="Gán giảng viên"
        @OK="handleAssign"
        @toggle="open = !open"
    >
        <v-form ref="form" lazy-validation @submit.prevent>
            <v-row class="mt-3" dense>
                <v-col cols="12">
                    <base-select
                        v-model="body.teacherId"
                        :items="filteredTeacherList"
                        item-text="name"
                        item-value="id"
                        label="Giảng viên chính"
                        required
                        :rules="[(v) => !!v || 'Vui lòng chọn giảng viên chính']"
                    />
                </v-col>
                <v-col cols="12">
                    <base-select
                        v-model="body.assistantTeacherId"
                        :items="filteredAssistantTeacherList"
                        item-text="name"
                        item-value="id"
                        label="Trợ giảng (tùy chọn)"
                        clearable
                    />
                </v-col>
            </v-row>
        </v-form>
    </base-modal>
</template>
