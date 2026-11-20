<template>
    <BaseModal
        :disabled-btn="!form.termId && !form.semesterId && !form.retakeSessionId"
        :loading="isLoading"
        :open="open"
        max-width="1000"
        title="Thêm sinh viên phải học lại"
        @OK="submit"
        @toggle="$emit('toggle')"
    >
        <v-form ref="form" @submit.prevent>
            <v-stepper v-model="step" elevation="0" rounded="xl" vertical>
                <v-stepper-step :complete="step > 1" step="1"> Thông tin cá nhân</v-stepper-step>

                <v-stepper-content step="1">
                    <v-row class="ma-0" dense>
                        <v-col cols="12"></v-col>
                        <v-col cols="12" md="8" offset="0" offset-md="2">
                            <div class="primary--text text-center fw-500 mb-2">
                                Nhập Mã Số Sinh Viên
                            </div>
                            <div class="d-flex gap-2 align-center">
                                <v-autocomplete
                                    v-model="form.student"
                                    :items="studentList"
                                    :search-input.sync="search"
                                    clearable
                                    dense
                                    hide-details
                                    item-text="fullName"
                                    item-value="id"
                                    label="Sinh viên"
                                    no-data-text="Không có dữ liệu"
                                    no-filter
                                    outlined
                                    return-object
                                    @update:search-input="handleDebounce"
                                >
                                    <template #item="{ item }">
                                        {{ item.code }} - {{ item.fullName }}
                                    </template>
                                    <template #append-item>
                                        <div v-intersect="endIntersect" />
                                    </template>
                                </v-autocomplete>
                            </div>
                        </v-col>
                        <v-col class="mt-4" cols="12">
                            <template v-if="form.student">
                                <div class="border-left mb-3 mt-8 relative">Thông tin cá nhân</div>
                                <RegisterInfo :student="form.student" />
                            </template>
                        </v-col>
                        <v-col cols="12">
                            <v-row class="ma-0">
                                <v-spacer />

                                <v-btn
                                    :disabled="$isEmptyObject(form.student)"
                                    class="text-none"
                                    color="primary"
                                    elevation="0"
                                    @click="step = 2"
                                >
                                    Tiếp tục
                                </v-btn>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-stepper-content>

                <v-stepper-step :complete="step > 2" step="2"> Thông tin lớp</v-stepper-step>

                <v-stepper-content step="2">
                    <v-row class="ma-0" dense>
                        <v-col cols="12" md="6">
                            <v-autocomplete
                                v-model="form.retakeSessionId"
                                :items="retakeSessionList"
                                :rules="[isRequired()]"
                                clearable
                                dense
                                item-text="code"
                                item-value="id"
                                label="Đợt học lại"
                                no-data-text="Không có dữ liệu"
                                outlined
                                @change="handleRetakeSessionChange"
                            >
                                <template #label>
                                    <div>
                                        <span>Đợt học lại</span>
                                        <span class="red--text">*</span>
                                    </div>
                                </template>
                            </v-autocomplete>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-autocomplete
                                v-model="form.semesterId"
                                :items="semesterList"
                                :rules="[isRequired()]"
                                clearable
                                dense
                                item-text="name"
                                disabled
                                item-value="id"
                                label="Học kỳ"
                                no-data-text="Không có dữ liệu"
                                outlined
                            >
                                <template #label>
                                    <div>
                                        <span>Học kỳ</span>
                                        <span class="red--text">*</span>
                                    </div>
                                </template>
                            </v-autocomplete>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model="form.classType"
                                clearable
                                dense
                                label="Loại lớp thi"
                                outlined
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model="form.examRoomCode"
                                clearable
                                dense
                                label="Mã lớp thi"
                                outlined
                            />
                        </v-col>
                        <v-col cols="12" md="12">
                            <v-textarea
                                v-model="form.note"
                                clearable
                                dense
                                label="Ghi chú"
                                outlined
                                rows="2"
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-autocomplete
                                v-model="form.result"
                                :items="resultList"
                                clearable
                                dense
                                item-text="text"
                                item-value="value"
                                label="Học lại / Thi lại"
                                no-data-text="Không có dữ liệu"
                                disabled
                                outlined
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model.number="form.scoreBonus"
                                clearable
                                dense
                                label="Điểm thưởng"
                                outlined
                                type="number"
                                step="0.1"
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model="form.scoreCharacter"
                                clearable
                                dense
                                label="Điểm chữ"
                                outlined
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model.number="form.scoreCk"
                                clearable
                                dense
                                label="Điểm chuyên cần"
                                outlined
                                type="number"
                                step="0.1"
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model.number="form.scoreGk"
                                clearable
                                dense
                                label="Điểm giữa kỳ"
                                outlined
                                type="number"
                                step="0.1"
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model.number="form.scoreQt"
                                clearable
                                dense
                                label="Điểm quá trình"
                                outlined
                                type="number"
                                step="0.1"
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model.number="form.scoreThTn"
                                clearable
                                dense
                                label="Điểm thực hành thí nghiệm"
                                outlined
                                type="number"
                                step="0.1"
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model.number="form.weight"
                                clearable
                                dense
                                label="Trọng số"
                                outlined
                                type="number"
                                step="0.1"
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-autocomplete
                                v-model="form.teacherId"
                                :items="teacherList"
                                clearable
                                dense
                                item-text="fullName"
                                item-value="id"
                                label="Giảng viên"
                                no-data-text="Không có dữ liệu"
                                outlined
                            >
                                <template #item="{ item }">
                                    {{ item.code }} - {{ item.fullName }}
                                </template>
                            </v-autocomplete>
                        </v-col>
                        <v-col class="d-flex justify-space-between align-center" cols="12">
                            <div class="fw-600" style="height: max-content">
                                Danh sách học phần (<span class="primary--text">{{
                                    selectedList.length
                                }}</span>
                                / <span class="primary--text">{{ termList.length }}</span
                                >)
                            </div>
                            <v-text-field
                                v-if="termList.length !== 0"
                                v-model="filter"
                                append-icon="mdi-magnify"
                                hide-details
                                label="Tìm kiếm"
                                single-line
                                style="margin-left: auto; max-width: 300px; height: max-content"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-data-table
                                v-model="selectedList"
                                :search="filter"
                                item-key="id"
                                :loading="loadingExam"
                                checkbox-color="primary"
                                show-select
                                hide-default-footer
                                no-data-text="Không có dữ liệu"
                                :items="termList"
                                :headers="headers"
                                disable-pagination
                                fixed-header
                                height="400"
                                class="elevation-1"
                            >
                                <template #[`item.stt`]="{ index }">{{ index + 1 }}</template>
                            </v-data-table>
                        </v-col>
                        <v-col cols="12">
                            <v-row class="ma-0">
                                <v-btn
                                    class="text-none"
                                    color="primary"
                                    elevation="0"
                                    @click="step = 1"
                                >
                                    Quay lại
                                </v-btn>
                                <v-spacer />
                            </v-row>
                        </v-col>
                    </v-row>
                </v-stepper-content>
            </v-stepper>
        </v-form>
    </BaseModal>
</template>

<script>
import { statusList } from "~/consts/list";
import studentServices from "~/services/studentServices";
import termService from "~/services/termService";
import decisionFeeServices from "~/services/decisionFeeServices";
import semesterServices from "~/services/semesterServices";
import { isRequired } from "~/utils/rules";
import retakeCourseAuthListServices, { RESULT_LIST } from "~/services/retakeCourseAuthListServices";
import retakeSessionServices from "~/services/retakeSessionServices";
import teacherServices from "~/services/teacherServices";
import retakeCourseClientServices from "~/services/re-learning/retakeCourseClientServices";

const INIT = {
    student: null,
    retakeSessionId: null,
    semesterId: null,
    termId: null,
    classType: "",
    examRoomCode: "",
    note: "",
    result: "RETAKE_COURSE",
    scoreBonus: null,
    scoreCharacter: "",
    scoreCk: null,
    scoreGk: null,
    scoreQt: null,
    scoreThTn: null,
    teacherId: null,
    weight: null,
};

const INIT_PAGE_INFO = {
    pageIndex: 1,
    pageSize: 10,
};

export default {
    name: "DetailMustRetakeStudentModal",
    props: {
        open: {
            type: Boolean,
            default: false,
        },
    },
    data: () => ({
        loadingExam: false,
        isLoading: false,
        step: 1,
        search: null,
        statusList,
        studentList: [],
        retakeSessionList: [],
        teacherList: [],
        totalPage: 0,
        feeCreditHour: 0,
        totalRecord: 0,
        pageInfo: {
            ...INIT_PAGE_INFO,
        },
        form: { ...INIT },
        list: [],
        termList: [],
        semesterList: [],
        selectedList: [],
        subjectList: [],
        examSessionList: [],
        idTimeout: null,
        selectedOriginal: [],
        resultList: RESULT_LIST,
        headers: [
            { text: "STT", align: "start", sortable: false, value: "stt" },
            { text: "Mã học phần", align: "start", sortable: false, value: "code" },
            { text: "Tên học phần", align: "start", sortable: false, value: "name" },
            { text: "Số tín chỉ học phí", align: "start", sortable: false, value: "creditHours" },
            { text: "Số tín chỉ đào tạo", align: "start", sortable: false, value: "creditTraining" },
        ],
        filter: "",
    }),
    watch: {
        open(newVal) {
            if (!newVal) {
                Object.assign(this.$data, this.$options.data());
                this.$refs.form?.resetValidation();
            } else {
                this.getStudent();
            }
        },
        search(val) {
            if (!val) this.handleSearch();
        },
        async step(val) {
            if (val === 2) {
                await this.getRetakeSession();
                await this.getSemester();
                await this.getTeachers();
            }
        },
        "form.student": {
            async handler(newVal) {
                if (newVal?.code && this.form.retakeSessionId) {
                    await this.getTerms();
                } else {
                    this.termList = [];
                }
            },
            immediate: false,
        },
        "form.retakeSessionId": {
            async handler(newVal) {
                if (newVal && this.form.student?.code) {
                    await this.getTerms();
                } else {
                    this.termList = [];
                }
            },
            immediate: false,
        },
    },
    mounted() {
        this.getStudent();
    },
    methods: {
        async getRetakeSession() {
            const res = await retakeSessionServices.getAll({ status: "ACTIVE" });
            if (res.success) this.retakeSessionList = res.data;
        },
        async getTerms() {
            if (!this.form.student?.code || !this.form.retakeSessionId) {
                this.termList = [];
                return;
            }
            const res = await retakeCourseClientServices.getListAllForRegister({
                code: this.form.student.code,
                examId: this.form.retakeSessionId,
            });
            if (res.success) {
                const seen = new Set();
                const unique = [];
                for (const item of res.data || []) {
                    const key = item?.id;
                    if (key != null && !seen.has(key)) {
                        seen.add(key);
                        unique.push(item);
                    }
                }
                this.termList = unique;
                if (Array.isArray(this.selectedList) && this.selectedList.length) {
                    this.selectedList = this.selectedList.filter((it) => seen.has(it?.id));
                }
            } else {
                this.termList = [];
            }
        },
        async getTeachers() {
            const res = await teacherServices.getAll({ status: "ACTIVE" });
            if (res.success) {
                this.teacherList = res.data;
            }
        },
        async getSemester() {
            const res = await semesterServices.getAll({ status: "ACTIVE" });
            if (res.success) {
                this.semesterList = res?.data?.map((item) => ({ id: item?.id, name: item?.name }));
            }
        },
        isRequired,
        handleRetakeSessionChange(event) {
            const selectedSession = this.retakeSessionList.find((session) => session.id === event);
            if (selectedSession && selectedSession.semester) {
                this.form.semesterId = selectedSession.semester.id;
                return selectedSession.semester;
            }
            this.form.semesterId = null;
            this.termList = [];
            return null;
        },
        async getStudent() {
            try {
                const res = await studentServices.getList({
                    ...this.pageInfo,
                    search: this.search,
                });
                if (res.success) {
                    this.studentList.push(...res.data.data);
                    this.totalPage = res.data.totalPages;
                }
            } catch (error) {
                console.log(error);
            }
        },
        handleDebounce() {
            if (this.idTimeout) clearTimeout(this.idTimeout);
            if (!this.search) {
                this.pageInfo = { ...INIT_PAGE_INFO };
                this.studentList = [];
                this.getStudent();
                return;
            }
            this.idTimeout = setTimeout(() => {
                this.handleSearch();
            }, 1000);
        },
        async handleSearch() {
            try {
                this.pageInfo.pageIndex = 1;
                const res = await studentServices.getList({
                    ...this.pageInfo,
                    search: this.search,
                });
                if (res.success) {
                    this.studentList = res.data.data;
                    this.totalPage = res.data.totalPages;
                }
            } catch (error) {
                console.log(error);
            }
        },
        async getSubject() {
            try {
                const res = await termService.getAll({});
                if (res.success) {
                    this.list = res.data;
                }
            } catch (error) {
                console.log(error);
            }
        },
        async getFee() {
            try {
                const res = await decisionFeeServices.getFee({
                    majorId: this.form.student.major.id,
                    semesterId: this.form.exam.semester?.id,
                });
                if (res.success) {
                    this.feeCreditHour = res.data.fee;
                }
            } catch (error) {
                console.error(error);
            }
        },
        async submit() {
            if (!this.$refs.form.validate()) return;
            this.isLoading = true;
            try {
                const res = await retakeCourseAuthListServices.add({
                    studentId: this.form.student.id,
                    retakeSessionId: this.form.retakeSessionId,
                    semesterId: this.form.semesterId,
                    termIds: this.selectedList.map((item) => item.id),
                    classType: this.form.classType,
                    examRoomCode: this.form.examRoomCode,
                    note: this.form.note,
                    result: this.form.result,
                    scoreBonus: this.form.scoreBonus,
                    scoreCharacter: this.form.scoreCharacter,
                    scoreCk: this.form.scoreCk,
                    scoreGk: this.form.scoreGk,
                    scoreQt: this.form.scoreQt,
                    scoreThTn: this.form.scoreThTn,
                    teacherId: this.form.teacherId,
                    weight: this.form.weight,
                });
                if (res.success) {
                    this.$emit("toggle");
                    this.$emit("success");
                    this.$showSuccess("Đăng ký thành công");
                }
            } catch (error) {
                console.error(error);
            }
            this.isLoading = false;
        },
        endIntersect(args) {
            const { isIntersecting } = args[0];
            if (isIntersecting && this.pageInfo.pageIndex < this.totalPage) {
                this.pageInfo.pageIndex++;
                this.getStudent();
            }
        },
    },
};
</script>

<style scoped>
.border-left {
    border-left: 4px var(--primary) solid;
    padding: 2px 8px;
    color: black;
    font-weight: 600;
    font-size: 20px;
}
</style>