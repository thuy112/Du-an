<script>
import registerRetakeCourseServices from "~/services/registerRetakeCourseServices";

export default {
    name: "RegisterRetakeCourseConfirmApproval",
    props: {
        open: {
            type: Boolean,
            required: true,
        },
        item: {
            type: Object,
            default: () => ({}),
        },
    },
    data: () => ({
        isLoading: false,
        isFetching: false,
        list: [],
        headers: [
            { text: "STT", value: "stt", align: "start", sortable: false },
            { text: "Mã học phần", value: "termCode", align: "start", sortable: false },
            { text: "Tên học phần", value: "termName", align: "start", sortable: false },
            {
                text: "Lớp học",
                value: "examSessionId",
                align: "center",
                sortable: false,
                width: 320,
            },
        ],
    }),
    watch: {
        open: {
            immediate: true,
            handler(val) {
                if (val) this.fetchData();
            },
        },
    },
    methods: {
        examSessionLabel(session) {
            if (!session) return "";
            const teacher = [session.nameTeacher, session.codeTeacher].filter(Boolean);
            if (!teacher.length) return session.code;
            const teacherText = session.codeTeacher
                ? `${session.nameTeacher || ""}(${session.codeTeacher})`.trim()
                : session.nameTeacher;
            return `${session.code} - ${teacherText}`;
        },
        async fetchData() {
            if (!this.item?.id) return;
            this.isFetching = true;
            try {
                const res = await registerRetakeCourseServices.getAvailableExamSessions(
                    this.item.id
                );
                if (res.success) {
                    this.list = (res.data || []).map((row) => {
                        const sessions = row.availableExamSessions || [];
                        return {
                            ...row,
                            examSessionId: sessions.length === 1 ? sessions[0].id : null,
                        };
                    });
                }
            } catch (e) {
                console.error(e);
            }
            this.isFetching = false;
        },
        async submit() {
            const missing = this.list.find(
                (row) =>
                    (row.availableExamSessions || []).length > 0 && !row.examSessionId
            );
            if (missing) {
                this.$showError(
                    `Vui lòng chọn lớp học cho học phần "${missing.termCode} - ${missing.termName}"`
                );
                return;
            }
            this.isLoading = true;
            try {
                const res = await registerRetakeCourseServices.changeStatus({
                    id: this.item.id,
                    registerStudentStatus: "CONFIRMED",
                    termSessions: this.list
                        .filter((row) => row.examSessionId)
                        .map((row) => ({
                            registerStudentTermId: row.registerStudentTermId,
                            examSessionId: row.examSessionId,
                        })),
                });
                if (res.success) {
                    this.$showSuccess("Xác nhận duyệt đơn thành công");
                    this.$emit("toggle");
                    this.$emit("success");
                }
            } catch (e) {
                console.error(e);
            }
            this.isLoading = false;
        },
    },
};
</script>

<template>
    <BaseModal
        :loading="isLoading"
        :open="open"
        title="Xác nhận duyệt đơn"
        text-btn="Xác nhận"
        max-width="1100"
        @toggle="$emit('toggle')"
        @OK="submit"
    >
        <v-row class="ma-0" dense>
            <v-col cols="12" class="pb-2">
                <span>
                    Bạn có chắc chắn muốn chuyển từ trạng thái
                    <strong class="primary--text">Chờ xác nhận</strong>
                    sang trạng thái
                    <strong class="primary--text">Đã xác nhận</strong>
                    không?
                </span>
            </v-col>
            <v-col cols="12">
                <v-data-table
                    :headers="headers"
                    :items="list"
                    :loading="isFetching"
                    hide-default-footer
                    disable-pagination
                    no-data-text="Không có dữ liệu"
                    loading-text="Đang tải dữ liệu..."
                >
                    <template #[`item.stt`]="{ index }">{{ index + 1 }}</template>
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
                            :disabled="!(item.availableExamSessions || []).length"
                            :rules="
                                (item.availableExamSessions || []).length
                                    ? [(v) => !!v || 'Bắt buộc']
                                    : []
                            "
                            no-data-text="Không có lớp học"
                            @input="$set(item, 'examSessionId', $event)"
                        >
                            <template #selection="{ item: session }">
                                <span class="text-no-wrap">{{ examSessionLabel(session) }}</span>
                            </template>
                            <template #item="{ item: session }">
                                {{ examSessionLabel(session) }}
                            </template>
                        </v-select>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
    </BaseModal>
</template>

<style scoped>
::v-deep .v-data-table__wrapper {
    overflow-x: auto;
}
::v-deep .v-data-table__wrapper table {
    table-layout: auto;
    min-width: 100%;
}
::v-deep .v-select__selections {
    flex-wrap: nowrap;
}
</style>
