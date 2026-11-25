<script>
import moment from "moment";
import registerRetakeCourseServices from "~/services/registerRetakeCourseServices";

export default {
    name: "RegisterRetakeCourseExtendDeadline",
    props: {
        open: { type: Boolean, required: true },
        selectedItems: { type: Array, default: () => [] },
    },
    data: () => ({
        loading: false,
        validating: false,
        validationResult: null,
        deadlineTime: "",
    }),
    computed: {
        isBatchValid() {
            return !!(this.validationResult && this.validationResult.success);
        },
        canSubmit() {
            return this.isBatchValid && !this.validating && !!this.deadlineTime && !this.loading;
        },
        validationMessage() {
            const raw = this.validationResult?.message;
            if (!raw) return "";
            const lookup = {};
            for (const it of this.selectedItems || []) {
                if (it?.id != null) lookup[String(it.id)] = this.formatRegisterCode(it);
            }
            for (const it of this.validationResult?.items || []) {
                if (it?.id != null && !lookup[String(it.id)]) {
                    lookup[String(it.id)] = this.formatRegisterCode(it);
                }
            }
            return raw.replace(/\[([^\]]+)\]/g, (_, inner) => {
                const parts = inner
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((s) => lookup[s] || s);
                return parts.join(", ");
            });
        },
    },
    watch: {
        open: {
            immediate: true,
            handler(val) {
                if (val) this.init();
            },
        },
    },
    methods: {
        async init() {
            this.validationResult = null;
            this.deadlineTime = "";
            await this.validateBatch();
        },
        toDateInput(iso) {
            if (!iso) return "";
            const d = moment(iso);
            if (!d.isValid()) return "";
            return d.format("DD/MM/YYYY 23:59:59");
        },
        extractYear(source) {
            if (!source) return "";
            if (typeof source === "string") {
                const dmy = source.match(/^\s*\d{1,2}\/\d{1,2}\/(\d{4})/);
                if (dmy) return dmy[1];
                const ymd = source.match(/(\d{4})[-/]\d{1,2}[-/]\d{1,2}/);
                if (ymd) return ymd[1];
            }
            const d = new Date(source);
            const y = d.getFullYear();
            return isNaN(y) ? "" : y;
        },
        formatRegisterCode(item) {
            if (!item) return "";
            if (item.registerCode) return item.registerCode;
            const year = this.extractYear(item.createTime || item.createdTime || item.createdAt);
            if (year) return `HL_${year}_${item.id}`;
            return `HL_${item.id}`;
        },
        async validateBatch() {
            try {
                this.validating = true;
                const res = await registerRetakeCourseServices.validateExtendSameBatch({
                    ids: this.selectedItems.map((item) => item.id),
                });
                if (res.success) {
                    this.validationResult = res.data;
                    if (res.data?.success) {
                        this.deadlineTime = this.toDateInput(new Date());
                    }
                }
            } catch (e) {
                console.error(e);
            }
            this.validating = false;
        },
        async handleSubmit() {
            if (!this.canSubmit) return;
            try {
                this.loading = true;
                const res = await registerRetakeCourseServices.extendDeadline({
                    ids: this.selectedItems.map((item) => item.id),
                    deadline: `${moment(this.deadlineTime, "DD/MM/YYYY HH:mm:ss").format(
                        "YYYY-MM-DD"
                    )}T23:59:59`,
                });
                if (res.success) {
                    this.$showSuccess("Gia hạn hạn nộp học phí thành công");
                    this.$emit("success");
                    this.$emit("toggle");
                }
            } catch (e) {
                console.error(e);
            }
            this.loading = false;
        },
    },
};
</script>

<template>
    <BaseConfirmModal
        text-btn="Gia hạn"
        max-width="800px"
        :open="open"
        :loading="loading"
        :disabled="!canSubmit"
        @toggle="$emit('toggle')"
        @OK="handleSubmit"
    >
        <template #title>Xác nhận gia hạn hạn nộp học phí</template>
        <template #content>
            <div class="mb-3">
                Danh sách sinh viên sẽ được gia hạn
                <span class="primary--text font-weight-bold">({{ selectedItems.length }})</span>
                :
            </div>

            <v-alert v-if="validating" type="info" dense text class="mb-3">
                Đang kiểm tra đợt đăng ký...
            </v-alert>

            <v-alert
                v-if="!validating && validationResult && !validationResult.success"
                type="error"
                dense
                text
                class="mb-3"
            >
                <div class="font-weight-bold">
                    {{ validationMessage || "Các đơn đăng ký không cùng đợt" }}
                </div>
            </v-alert>

            <v-alert v-if="!validating && isBatchValid" type="success" dense text class="mb-3">
                {{ validationMessage || "Tất cả đơn đăng ký hợp lệ" }}
                <span v-if="validationResult.examCode">
                    — Đợt: <strong>{{ validationResult.examCode }}</strong>
                </span>
            </v-alert>

            <v-data-table
                fixed-header
                :headers="[
                    { text: 'STT', value: 'stt', sortable: false, align: 'center', width: 60 },
                    { text: 'Mã SV', value: 'code', sortable: false, width: 110 },
                    { text: 'Họ tên', value: 'fullName', sortable: false, width: 180 },
                    {
                        text: 'Kỳ đăng ký học lại',
                        value: 'retakeSession.code',
                        sortable: false,
                        width: 160,
                    },
                    {
                        text: 'Học phần đăng ký',
                        value: 'registerStudentTerms',
                        sortable: false,
                        width: 260,
                    },
                    { text: 'Mã đơn đăng ký', value: 'id', sortable: false, width: 140 },
                    {
                        text: 'Tổng học phí',
                        value: 'totalFee',
                        sortable: false,
                        align: 'right',
                        width: 130,
                    },
                ]"
                :items="selectedItems"
                hide-default-footer
                dense
                disable-pagination
                :items-per-page="-1"
                class="elevation-0 mb-4 preview-table"
                no-data-text="Chưa có sinh viên nào được chọn"
            >
                <template #[`item.stt`]="{ index }">{{ index + 1 }}</template>
                <template #[`item.registerStudentTerms`]="{ item }">
                    <!-- eslint-disable vue/no-v-html -->
                    <div
                        v-html="
                            (item.registerStudentTerms || [])
                                .map(
                                    (i, index) => `${index + 1}. ${i.term?.name} - ${i.term?.code}`
                                )
                                .join(`<br />`)
                        "
                    ></div>
                </template>
                <template #[`item.id`]="{ item }">{{ formatRegisterCode(item) }}</template>
                <template #[`item.totalFee`]="{ item }">
                    {{ $formatNumber(item.totalFee) }}
                </template>
            </v-data-table>

            <div class="d-flex align-center mt-2">
                <base-date-picker
                    v-model="deadlineTime"
                    label="Hạn nộp mới"
                    to-time
                    hide-details
                    width="260px"
                    :disabled="!isBatchValid"
                />
            </div>
        </template>
    </BaseConfirmModal>
</template>

<style scoped>
.preview-table {
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 6px;
}
.preview-table ::v-deep .v-data-table__wrapper {
    max-height: 360px;
    overflow-x: auto;
    overflow-y: auto;
}
.preview-table ::v-deep table {
    min-width: 1040px;
    table-layout: fixed;
}
.preview-table ::v-deep th,
.preview-table ::v-deep td {
    white-space: nowrap;
    vertical-align: middle !important;
}
.preview-table ::v-deep th {
    background-color: #fafafa !important;
    font-weight: 600;
}
.preview-table ::v-deep td {
    padding: 6px 12px !important;
}
.preview-table ::v-deep td:nth-child(5) {
    white-space: normal;
    line-height: 1.4;
}
.preview-table ::v-deep tbody tr:hover {
    background-color: #f5f7fa !important;
}
.preview-table ::v-deep .v-data-table__wrapper::-webkit-scrollbar {
    height: 8px;
    width: 8px;
}
.preview-table ::v-deep .v-data-table__wrapper::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
}
.preview-table ::v-deep .v-data-table__wrapper::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.35);
}
</style>
