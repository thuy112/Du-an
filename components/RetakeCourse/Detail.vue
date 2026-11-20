<template>
    <BaseModal
        :loading="isLoading"
        :open="isOpen"
        max-width="1000"
        title="Chi tiết lớp học lại"
        off-btn
        @toggle="isOpen = !isOpen"
    >
        <!-- Phần 1: Thông tin lớp học lại -->
        <v-row dense class="ma-0 mt-3">
            <v-col cols="12">
                <div class="black--text fw-500 fs-16 my-3">Thông tin lớp học lại</div>
            </v-col>
            <v-col v-if="dataItem.examClass" cols="12" sm="6" md="6" lg="6" xl="6">
                <BaseDetailItem title="Lớp học lại" :value="dataItem?.examClass" />
            </v-col>
            <v-col v-if="dataItem.code" cols="12" sm="6" md="6" lg="6" xl="6">
                <BaseDetailItem title="Mã lớp học lại" :value="dataItem?.code" />
            </v-col>
            <v-col
                v-if="dataItem?.classCoefficientDto?.classType"
                cols="12"
                sm="6"
                md="6"
                lg="6"
                xl="6"
            >
                <BaseDetailItem title="Loại lớp" :value="getRetakeClassTypeText()" />
            </v-col>
            <v-col
                v-if="dataItem?.classCoefficientDto?.coefficient"
                cols="12"
                sm="6"
                md="6"
                lg="6"
                xl="6"
            >
                <BaseDetailItem
                    title="Hệ số lớp"
                    :value="dataItem?.classCoefficientDto?.coefficient"
                />
            </v-col>
            <v-col v-if="dataItem?.quantitySeat" cols="12" sm="6" md="6" lg="6" xl="6">
                <BaseDetailItem title="Tổng sinh viên" :value="dataItem?.quantitySeat" />
            </v-col>
            <v-col v-if="dataItem?.exam?.name" cols="12" sm="6" md="6" lg="6" xl="6">
                <BaseDetailItem title="Đợt học lại" :value="dataItem?.exam.name" />
            </v-col>
            <v-col v-if="dataItem?.fromTime" cols="12" sm="6" md="6" lg="6" xl="6">
                <BaseDetailItem
                    title="Thời gian học lại"
                    :value="
                        dataItem?.isWeek
                            ? formatWeekbyDateTime(dataItem?.fromTime) +
                              ' - ' +
                              formatWeekbyDateTime(dataItem?.toTime)
                            : $formatDateRange(dataItem?.fromTime, dataItem?.toTime)
                    "
                />
            </v-col>
            <v-col v-if="dataItem?.workUnitDto?.name" cols="12" sm="6" md="6" lg="6" xl="6">
                <BaseDetailItem title="Đơn vị" :value="dataItem?.workUnitDto.name" />
            </v-col>
            <v-col v-if="dataItem?.exam?.semester?.name" cols="12" sm="6" md="6" lg="6" xl="6">
                <BaseDetailItem title="Học kỳ" :value="dataItem?.exam.semester.name" />
            </v-col>
            <v-col v-if="dataItem?.code" cols="12" sm="6" md="6" lg="6" xl="6">
                <BaseDetailItem title="Mã lớp" :value="dataItem?.code" />
            </v-col>
            <v-col v-if="dataItem?.faculty" cols="12" sm="6" md="6" lg="6" xl="6">
                <BaseDetailItem title="Khoa" :value="dataItem?.faculty" />
            </v-col>
            <v-col v-if="dataItem?.term?.code" cols="12" sm="6" md="6" lg="6" xl="6">
                <BaseDetailItem title="Mã học phần" :value="dataItem?.term.code" />
            </v-col>
            <v-col v-if="dataItem?.term?.name" cols="12" sm="6" md="6" lg="6" xl="6">
                <BaseDetailItem title="Tên học phần" :value="dataItem?.term.name" />
            </v-col>
            <v-col v-if="dataItem?.examClass" cols="12" sm="6" md="6" lg="6" xl="6">
                <BaseDetailItem title="Tên lớp học lại" :value="dataItem?.examClass" />
            </v-col>
            <v-col v-if="dataItem?.term?.creditHours" cols="12" sm="6" md="6" lg="6" xl="6">
                <BaseDetailItem title="Tín chỉ" :value="dataItem?.term.creditHours" />
            </v-col>
            <v-col v-if="dataItem?.term?.workload" cols="12" sm="6" md="6" lg="6" xl="6">
                <BaseDetailItem title="Thời lượng" :value="dataItem?.term.workload" />
            </v-col>
            <v-col v-if="dataItem?.note" cols="12" sm="6" md="6" lg="6" xl="6">
                <BaseDetailItem title="Ghi chú" :value="dataItem?.note" />
            </v-col>
            <v-col v-if="dataItem?.educationProgramDto?.name" cols="12" sm="6" md="6" lg="6" xl="6">
                <BaseDetailItem
                    title="Chương trình đào tạo"
                    :value="dataItem?.educationProgramDto.name"
                />
            </v-col>
            <v-col v-if="dataItem?.period" cols="12" sm="6" md="6" lg="6" xl="6">
                <BaseDetailItem title="Thời khoá biểu (Số tiết)" :value="dataItem?.period" />
            </v-col>
            <v-col v-if="dataItem?.examSessionStatus" cols="12" sm="6" md="6" lg="6" xl="6">
                <BaseDetailItem
                    title="Trạng thái duyệt danh sách"
                    :value="dataItem?.examSessionStatus"
                >
                    <template #value>
                        <BaseStatusItem
                            v-if="dataItem?.examSessionStatus"
                            :status-list="examStatusList()"
                            :status="dataItem.examSessionStatus"
                        />
                    </template>
                </BaseDetailItem>
            </v-col>
            <v-col v-if="dataItem.examStatus" cols="12" sm="6" md="6" lg="6" xl="6">
                <BaseDetailItem title="Trạng thái bảng điểm" :value="dataItem?.scoreStatus">
                    <template #value>
                        <BaseStatusItem
                            v-if="dataItem?.scoreStatus"
                            :status-list="scoreStatusList()"
                            :status="dataItem?.scoreStatus"
                        />
                    </template>
                </BaseDetailItem>
            </v-col>
            <v-col v-if="dataItem.examEducationType" cols="12" sm="6" md="6" lg="6" xl="6">
                <BaseDetailItem title="Hình thức giảng dạy" :value="dataItem?.examEducationType">
                    <template #value>
                        <BaseStatusItem
                            v-if="dataItem.examEducationType"
                            :status-list="examEducationOptionList()"
                            :status="dataItem.examEducationType"
                        />
                    </template>
                </BaseDetailItem>
            </v-col>
        </v-row>

        <v-col cols="12">
            <v-divider />
        </v-col>

        <!-- Phần 2: Thông tin giảng viên -->
        <v-row dense class="ma-0">
            <v-col cols="12">
                <div class="black--text fw-500 fs-16 my-3">Thông tin giảng viên</div>
            </v-col>

            <!-- Giảng viên chính -->
            <v-col cols="12">
                <div class="primary--text fw-600 fs-14 mb-2">Giảng viên chính:</div>
            </v-col>
            <v-col
                v-for="(teacher, index) in mainTeachers"
                :key="`main-teacher-code-${teacher.id}-${index}`"
                cols="12"
                sm="6"
                md="6"
                lg="6"
                xl="6"
            >
                <BaseDetailItem title="Mã giảng viên" :value="teacher.teacher?.code" />
            </v-col>
            <v-col
                v-for="(teacher, index) in mainTeachers"
                :key="`main-teacher-name-${teacher.id}-${index}`"
                cols="12"
                sm="6"
                md="6"
                lg="6"
                xl="6"
            >
                <BaseDetailItem title="Tên giảng viên" :value="teacher.teacher?.fullName" />
            </v-col>

            <!-- Trợ giảng -->
            <v-col v-if="assistantTeachers.length > 0" cols="12">
                <div class="primary--text fw-600 fs-14 mb-2 mt-4">Trợ giảng:</div>
            </v-col>
            <v-col
                v-for="(teacher, index) in assistantTeachers"
                :key="`assistant-teacher-code-${teacher.id}-${index}`"
                cols="12"
                sm="6"
                md="6"
                lg="6"
                xl="6"
            >
                <BaseDetailItem title="Mã giảng viên" :value="teacher.teacher?.code" />
            </v-col>
            <v-col
                v-for="(teacher, index) in assistantTeachers"
                :key="`assistant-teacher-name-${teacher.id}-${index}`"
                cols="12"
                sm="6"
                md="6"
                lg="6"
                xl="6"
            >
                <BaseDetailItem title="Tên giảng viên" :value="teacher.teacher?.fullName" />
            </v-col>
        </v-row>

        <v-col cols="12">
            <v-divider />
        </v-col>
        <v-row dense class="ma-0">
            <v-col cols="12">
                <div class="black--text fw-500 fs-16 my-3">
                    Danh sách sinh viên
                    <span class="primary--text fw-600">({{ studentList.length }})</span>
                </div>
                <v-data-table
                    :items="studentList"
                    :headers="studentHeaders"
                    hide-default-footer
                    disable-pagination
                    no-data-text="Không có dữ liệu"
                    style="max-height: calc(100vh - 500px); overflow-y: auto"
                    item-key="id"
                >
                    <template #[`item.stt`]="{ index }"> {{ index + 1 }}</template>
                    <template #[`item.info`]="{ item }">
                        <div class="d-flex flex-column gap-2 py-1">
                            <div class="primary--text font-weight-bold">
                                {{ item?.registerStudentExam?.fullName }}
                            </div>
                            <div class="">
                                Mã số sinh viên:
                                <span class="primary--text font-weight-bold">{{
                                    item?.registerStudentExam?.code
                                }}</span>
                            </div>
                            <div class="">
                                Số điện thoại:
                                <span class="primary--text font-weight-bold">{{
                                    item?.registerStudentExam?.phone
                                }}</span>
                            </div>
                            <div v-if="item.registerStudentExam?.birthday">
                                Ngày sinh:
                                <span class="primary--text font-weight-bold">{{
                                    $formatDate(item.registerStudentExam.birthday)
                                }}</span>
                            </div>
                            <div class="">
                                Email:
                                <span class="primary--text font-weight-bold">
                                    {{ item?.registerStudentExam?.email }}</span
                                >
                            </div>
                            <div class="">
                                Giới tính:
                                <span class="primary--text font-weight-bold">
                                    {{
                                        $getText(item?.registerStudentExam?.gender, genderList())
                                    }}</span
                                >
                            </div>
                        </div>
                    </template>
                    <template #[`item.course`]="{ item }">
                        <div class="text-center">
                            {{ item?.registerStudentExam?.course?.name }}
                        </div>
                    </template>
                    <template #[`item.clazz`]="{ item }">
                        <div class="text-center">
                            {{ item?.registerStudentExam?.clazz?.name }}
                        </div>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
    </BaseModal>
</template>
<script>
import {
    examStatusList,
    genderList,
    scoreStatusList,
    retakeCourseStatus,
    examEducationOptionList,
} from "~/consts/list";
import BaseModal from "~/components/Base/Modal.vue";
import BaseDetailItem from "~/components/Base/DetailItem.vue";
import BaseStatusItem from "~/components/Base/StatusItem.vue";
import retakeCourseService from "~/services/retakeCourseService";
import { getRetakeClassTypeText, formatWeekbyDateTime } from "~/utils/heppers";

export default {
    name: "ExamSessionDetail",
    components: { BaseStatusItem, BaseDetailItem, BaseModal },
    props: {
        dataItem: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            isOpen: false,
            isLoading: false,
            studentHeaders: [
                { value: "stt", text: "STT", sortable: false, width: "10%" },
                {
                    value: "info",
                    text: "Thông tin sinh viên",
                    sortable: false,
                    width: "30%",
                    align: "left",
                },
                { value: "course", text: "Khóa", sortable: false, width: "20%", align: "center" },
                { value: "clazz", text: "Lớp", sortable: false, width: "20%", align: "center" },
            ],
            studentList: [],
            detailData: null,
            formatWeekbyDateTime,
        };
    },
    computed: {
        teacherList() {
            if (!this.detailData?.teacherExamSessionDtos) return [];
            return this.detailData.teacherExamSessionDtos.map((item) => item.teacher);
        },
        mainTeachers() {
            if (!this.detailData?.teacherExamSessionDtos) return [];
            return this.detailData.teacherExamSessionDtos.filter((item) => item.type === "TEACHER");
        },
        assistantTeachers() {
            if (!this.detailData?.teacherExamSessionDtos) return [];
            return this.detailData.teacherExamSessionDtos.filter(
                (item) => item.type === "TEACHER_ASSISTANT"
            );
        },
    },
    watch: {
        isOpen(newVal) {
            if (!newVal) {
                Object.assign(this.$data, this.$options.data());
            } else this.getStudentList();
        },
    },
    methods: {
        getRetakeClassTypeText() {
            return getRetakeClassTypeText(
                this.dataItem?.classCoefficientDto?.classType,
                this.dataItem?.classCoefficientDto?.courseType,
                this.dataItem?.classCoefficientDto?.isCourseNormal
            );
        },
        genderList() {
            return genderList;
        },
        examStatusList() {
            return examStatusList;
        },
        scoreStatusList() {
            return scoreStatusList;
        },
        examEducationOptionList() {
            return examEducationOptionList;
        },
        retakeCourseStatus() {
            return retakeCourseStatus;
        },
        getTeacherNames() {
            if (!this.teacherList || this.teacherList.length === 0) {
                return;
            }
            return this.teacherList.map((teacher) => teacher.fullName);
        },
        getTeacherNamesWithRole() {
            if (
                !this.detailData?.teacherExamSessionDtos ||
                this.detailData.teacherExamSessionDtos.length === 0
            ) {
                return [];
            }
            return this.detailData.teacherExamSessionDtos.map((item) => {
                let typeText = "";
                if (item.type === "TEACHER") typeText = "Giảng viên";
                else if (item.type === "TEACHER_ASSISTANT") typeText = "Trợ giảng";
                return `${item.teacher?.fullName || ""}${typeText ? " (" + typeText + ")" : ""}`;
            });
        },
        async getStudentList() {
            try {
                const res = await retakeCourseService.getDetail(this.dataItem.id);
                if (res.success) {
                    this.detailData = res.data;
                    this.studentList = res.data.registerStudentTerms;
                    // .filter((item) => item.feePaidStatus === "PAID");
                }
            } catch (e) {
                console.error(e);
            }
        },
    },
};
</script>
