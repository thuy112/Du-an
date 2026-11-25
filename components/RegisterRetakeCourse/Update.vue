<script>
import { statusList } from "~/consts/list";
import registerRetakeCourseServices from "~/services/registerRetakeCourseServices";
import termService from "~/services/termService";
import retakeCourseAuthListServices from "~/services/retakeCourseAuthListServices";
import retakeSessionServices from "~/services/retakeSessionServices";

const INIT = {
    student: null,
    retake: null,
};

const INIT_PAGE_INFO = {
    pageIndex: 1,
    pageSize: 50,
};

export default {
    name: "RegisterRetakeCourseUpdate",
    props: {
        open: {
            type: Boolean,
            required: true,
        },
        selected: {
            type: Object,
            required: true,
        },
    },
    data: () => ({
        filter: "",
        isLoading: false,
        step: 1,
        search: null,
        statusList,
        studentList: [],
        totalPage: 0,
        feeCreditHour: 0,
        totalRecord: 0,
        pageInfo: {
            ...INIT_PAGE_INFO,
        },
        form: { ...INIT },
        list: [],
        selectedList: [],
        subjectList: [],
        idTimeout: null,
        headers: [
            {
                text: "STT",
                align: "start",
                sortable: false,
                value: "stt",
            },
            {
                text: "Mã học phần",
                align: "start",
                sortable: false,
                value: "code",
            },
            {
                text: "Tên học phần",
                align: "start",
                sortable: false,
                value: "name",
            },
            {
                text: "Mã giảng viên",
                align: "start",
                sortable: false,
                value: "codeTeacher",
            },
            {
                text: "Tên giảng viên",
                align: "start",
                sortable: false,
                value: "nameTeacher",
            },
            {
                text: "Định mức",
                align: "right",
                sortable: false,
                value: "fee",
            },
            {
                text: "Số tín chỉ",
                align: "right",
                sortable: false,
                value: "creditHours",
            },
            {
                text: "Thành tiền",
                align: "right",
                sortable: false,
                value: "totalFee",
            },
            {
                text: "Lớp học",
                align: "center",
                sortable: false,
                value: "examSessionId",
                width: 220,
            },
        ],
        selectedOriginal: [],
        retakeSessionList: [],
        termList: [],
        selectedRetakeSessionId: null,
    }),
    computed: {
        totalMoney() {
            return this.selectedList.reduce((acc, cur) => acc + cur.fee * cur.creditHours, 0);
        },
        filteredTermList() {
            if (!this.filter) return this.termList;
            const searchTerm = this.filter.toLowerCase();
            return this.termList.filter(
                (item) =>
                    item.code?.toLowerCase().includes(searchTerm) ||
                    item.name?.toLowerCase().includes(searchTerm)
            );
        },
        filteredSelectedList() {
            const filteredIds = this.filteredTermList.map((item) => item.id);
            return this.selectedList.filter((item) => filteredIds.includes(item.id));
        },
        filteredTotalMoney() {
            return this.filteredSelectedList.reduce(
                (acc, cur) => acc + cur.fee * cur.creditHours,
                0
            );
        },
    },
    watch: {
        step(val) {
            if (val === 2) {
                this.getRetakeSession();
            }
        },
        async "form.retake"(val) {
            if (val) {
                await this.getTerm();
            } else {
                this.list = [];
                this.termList = [];
                this.selectedList = [];
            }
        },
        async "form.term"(val) {
            if (val) {
                await this.getSubject();
            } else {
                this.list = [];
            }
        },
        open(val) {
            if (val) {
                this.initForm();
            }
        },
    },
    mounted() {
        this.getStudent();
        this.initForm();
    },
    methods: {
        initForm() {
            if (this.selected) {
                const studentData = {
                    id: this.selected.id,
                    student: {
                        id: this.selected.id,
                        fullName: this.selected.fullName,
                        code: this.selected.code,
                        birthday: this.selected.birthday,
                        email: this.selected.email,
                        phone: this.selected.phone,
                        classes: this.selected.clazz,
                        course: this.selected.course,
                        major: this.selected.major,
                        trainingUnit: this.selected.trainingUnit,
                    },
                };

                this.form.student = studentData;
                this.selectedRetakeSessionId = this.selected.retakeSession?.id;

                if (
                    this.selected.registerStudentTerms &&
                    Array.isArray(this.selected.registerStudentTerms)
                ) {
                    this.selectedOriginal = this.selected.registerStudentTerms.map(
                        (i) => i.term?.id || i.id
                    );
                } else {
                    this.selectedList = [];
                    this.selectedOriginal = [];
                }

                this.$nextTick(() => {
                    this.step = 2;
                    this.getRetakeSession();
                });
            }
        },
        async getRetakeSession() {
            const res = await retakeSessionServices.getListRegisterRetakeSession({
                studentId: this.form.student.id,
                status: "ACTIVE",
            });
            if (res.success) {
                this.retakeSessionList = res.data;
                if (this.selectedRetakeSessionId) {
                    const foundSession = this.retakeSessionList.find(
                        (session) => session.id === this.selectedRetakeSessionId
                    );
                    if (foundSession) {
                        this.form.retake = foundSession;
                    }
                }
            }
        },
        async getTerm() {
            const retakeSessionId = this.form.student?.id;
            const res = await registerRetakeCourseServices.getListRegisterExamTerm(retakeSessionId);
            if (res.success) {
                this.termList = (res.data.registerStudentTerms || []).map((item) => {
                    const sessions = item.availableExamSessions || [];
                    return {
                        ...item,
                        examSessionId:
                            item.examSessionId ||
                            (sessions.length === 1 ? sessions[0].id : null),
                    };
                });
                this.selectedList = this.termList.filter((item) =>
                    this.selectedOriginal.includes(item.id)
                );
            }
        },
        async getSubject() {
            try {
                const res = await termService.getListForRegisterRetakeSession({
                    studentId: this.form.student.student.code,
                    examId: this.form.retake?.id,
                    status: "ACTIVE",
                });
                if (res.success) {
                    this.list = res.data;
                }
            } catch (error) {
                console.log(error);
            }
        },
        async getStudent() {
            try {
                const res = await retakeCourseAuthListServices.getListStudent({
                    ...this.pageInfo,
                    search: this.search,
                });
                if (res.success) {
                    this.studentList.push(...res.data);
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
                const res = await retakeCourseAuthListServices.getListStudent({
                    ...this.pageInfo,
                    search: this.search,
                });
                if (res.success) {
                    this.studentList = res.data;
                }
            } catch (error) {
                console.log(error);
            }
        },
        async submit() {
            if (!this.form.student || !this.form.student.student) {
                this.$showError("Dữ liệu sinh viên không hợp lệ");
                return;
            }
            if (!this.selected || !this.selected.id) {
                this.$showError("Dữ liệu bản ghi cần cập nhật không hợp lệ");
                return;
            }
            const newSelected = this.selectedList.filter(
                (item) => !this.selectedOriginal.includes(item.id)
            );
            const missingClass = newSelected.find((item) => !item.examSessionId);
            if (missingClass) {
                this.$showError(
                    `Vui lòng chọn lớp học cho học phần "${missingClass.code} - ${missingClass.name}"`
                );
                return;
            }
            this.isLoading = true;
            try {
                const studentData = this.form.student.student;
                const currentSelectedIds = this.selectedList.map((item) => item.id);
                const selectedTermIds = currentSelectedIds;
                const res = await registerRetakeCourseServices.update(studentData?.id, {
                    retakeSessionId: this.form.retake.id,
                    termFees: selectedTermIds.map((id) => {
                        const item = this.selectedList.find((selected) => selected.id === id);
                        return {
                            termId: id,
                            fee: item.fee,
                            examSessionId: item.examSessionId,
                        };
                    }),
                    totalFee: +this.filteredTotalMoney,
                });
                if (res.success) {
                    this.$emit("toggle");
                    this.$emit("success");
                }
            } catch (error) {
                console.error(error);
                this.$showError("Có lỗi xảy ra khi cập nhật");
            }
            this.isLoading = false;
        },
        endIntersect(args) {
            if (!this.search) return;
            const { isIntersecting } = args[0];
            if (isIntersecting && this.pageInfo.pageIndex < this.totalPage) {
                this.pageInfo.pageIndex++;
                this.getStudent();
            }
        },
    },
};
</script>

<template>
    <BaseModal
        :loading="isLoading"
        :open="open"
        title="Cập nhật đăng ký học lại"
        max-width="1000"
        :disabled-btn="!selectedList.length"
        @toggle="$emit('toggle')"
        @OK="submit"
    >
        <v-stepper v-model="step" vertical elevation="0" rounded="xl">
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
                                clearable
                                no-filter
                                label="Sinh viên"
                                outlined
                                :search-input.sync="search"
                                hide-details
                                dense
                                return-object
                                :items="studentList"
                                item-value="this.selected.id"
                                item-text="student.fullName"
                                no-data-text="Không có dữ liệu"
                                @update:search-input="handleDebounce"
                            >
                                <template #item="{ item }">
                                    {{ item.student.code }} - {{ item.student.fullName }}
                                </template>
                                <template #append-item>
                                    <div v-intersect="endIntersect" />
                                </template>
                            </v-autocomplete>
                        </div>
                    </v-col>
                    <v-col cols="12" class="mt-4">
                        <template v-if="form.student">
                            <div class="border-left mb-3 mt-8 relative">Thông tin cá nhân</div>
                            <RegisterInfo :student="form.student.student" />
                        </template>
                    </v-col>
                    <v-col cols="12">
                        <v-row class="ma-0">
                            <v-spacer />

                            <v-btn
                                :disabled="$isEmptyObject(form.student)"
                                elevation="0"
                                color="primary"
                                class="text-none"
                                @click="step = 2"
                            >
                                Tiếp tục
                            </v-btn>
                        </v-row>
                    </v-col>
                </v-row>
            </v-stepper-content>

            <v-stepper-step :complete="step > 2" step="2"> Thông tin đăng ký</v-stepper-step>
            <v-stepper-content step="2">
                <v-row class="ma-0" dense>
                    <v-col cols="12" md="8" offset="0" offset-md="2">
                        <div class="d-flex gap-2 align-center">
                            <v-autocomplete
                                v-model="form.retake"
                                clearable
                                label="Đợt học lại"
                                outlined
                                hide-details
                                dense
                                :items="retakeSessionList"
                                item-value="id"
                                return-object
                                item-text="code"
                                no-data-text="Không có dữ liệu"
                            >
                            </v-autocomplete>
                        </div>
                    </v-col>
                    <v-col cols="12" class="mt-3">
                        <div class="fw-600">
                            Danh sách học phần (<span class="primary--text">{{
                                filteredTermList.length
                            }}</span
                            >)
                        </div>
                        <v-spacer />
                        <v-text-field
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
                            checkbox-color="primary"
                            show-select
                            :search="filter"
                            hide-default-footer
                            class="overflow-auto table-scroll-x"
                            no-data-text="Không có dữ liệu"
                            :items="filteredTermList"
                            :headers="headers"
                            disable-pagination
                        >
                            <template #[`item.stt`]="{ index }">{{ index + 1 }}</template>
                            <template #[`item.data-table-select`]="{ item, isSelected, select }">
                                <v-simple-checkbox
                                    color="primary"
                                    :value="isSelected"
                                    :disabled="
                                        selectedOriginal.includes(item.id) ||
                                        !(item.availableExamSessions || []).length
                                    "
                                    @input="select($event)"
                                ></v-simple-checkbox>
                            </template>
                            <template #[`item.fee`]="{ item }">{{ $money(item.fee) }} đ </template>
                            <template #[`item.totalFee`]="{ item }"
                                >{{ $money(item.totalFee) }} đ
                            </template>
                            <template #[`item.examSessionId`]="{ item }">
                                <v-select
                                    :value="item.examSessionId"
                                    :items="item.availableExamSessions || []"
                                    item-text="code"
                                    item-value="id"
                                    :label="
                                        (item.availableExamSessions || []).length
                                            ? 'Chọn lớp học'
                                            : 'Không có lớp học'
                                    "
                                    outlined
                                    dense
                                    hide-details
                                    :disabled="selectedOriginal.includes(item.id)"
                                    :rules="
                                        selectedList.some((s) => s.id === item.id)
                                            ? [(v) => !!v || 'Bắt buộc']
                                            : []
                                    "
                                    no-data-text="Không có lớp học"
                                    @input="$set(item, 'examSessionId', $event)"
                                ></v-select>
                            </template>
                        </v-data-table>
                    </v-col>
                    <v-col cols="12" class="d-flex align-center justify-end">
                        Tổng tiền:
                        <span class="primary--text fw-500"
                            >{{ $formatNumber(filteredTotalMoney) }} VNĐ</span
                        >
                    </v-col>
                    <v-col
                        cols="12"
                        class="py-0 text-right fs-13 font-italic error--text"
                    >
                        Hệ thống chỉ hiển thị số tiền dự kiến. Học phí chính thức sẽ được thông báo cụ thể qua email của sinh viên.
                    </v-col>
                    <v-col cols="12">
                        <v-row class="ma-0">
                            <v-btn
                                elevation="0"
                                color="primary"
                                class="text-none"
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
    </BaseModal>
</template>

<style scoped>
.border-left {
    border-left: 4px var(--primary) solid;
    padding: 2px 8px;
    color: black;
    font-weight: 600;
    font-size: 20px;
}

:deep .v-data-table__wrapper {
    max-height: calc(100vh - 250px);
    overflow-y: scroll;
    overflow-x: auto;
}

:deep .table-scroll-x .v-data-table__wrapper > table {
    min-width: 1300px;
}
</style>
