<template>
    <v-dialog v-model="open" max-width="950px" persistent>
        <v-card class="rounded-lg">
            <!-- TIÊU ĐỀ MODAL -->
            <v-card-title class="pa-4 white--text" style="background-color: #A62229; color: white;">
                <span class="text-h6 font-weight-bold">Cập nhật định mức thanh toán theo công việc cho GV</span>
                <v-spacer></v-spacer>
                <v-btn icon dark @click="closeDialog">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <v-card-text class="pa-5" style="max-height: 75vh; overflow-y: auto;">
                <div v-if="loading" class="text-center py-6">
                    <v-progress-circular indeterminate color="#A62229"></v-progress-circular>
                </div>

                <v-form v-else ref="form" lazy-validation @submit.prevent>
                    <!-- TÊN BAN HÀNH -->
                    <v-text-field
                        v-model="form.name"
                        label="Tên ban hành (*)"
                        outlined
                        dense
                        class="mb-2"
                        :rules="[v => !!(v && String(v).trim()) || 'Vui lòng nhập đủ thông tin']"
                    ></v-text-field>

                    <!-- NGÀY BAN HÀNH -->
                    <div class="mb-2">
                        <base-date-picker
                            v-model="form.timeInform"
                            label="Ngày ban hành (*)"
                            required
                        />
                        <div v-if="submitted && !form.timeInform" class="field-error-text">
                            Vui lòng nhập đủ thông tin
                        </div>
                    </div>

                    <!-- THÔNG TIN BAN HÀNH -->
                    <v-text-field
                        v-model="fileName"
                        label="Thông tin ban hành"
                        readonly
                        outlined
                        dense
                        append-icon="mdi-file-upload-outline"
                        class="mb-3"
                        hide-details
                        @click:append="triggerUpload"
                        @click="triggerUpload"
                    ></v-text-field>

                    <!-- HỌC KỲ -->
                    <v-select
                        v-model="form.semesterId"
                        :items="semesterList"
                        item-text="name"
                        item-value="id"
                        label="Học kỳ (*)"
                        outlined
                        dense
                        class="mb-4"
                        :rules="[v => (v !== null && v !== undefined && v !== '') || 'Vui lòng nhập đủ thông tin']"
                    ></v-select>

                    <!-- THANH TAB CHỌN LOẠI PHÍ & ÁP DỤNG HÀNG LOẠT -->
                    <div class="d-flex align-center mb-4 tabs-header border-bottom">
                        <v-btn
                            v-for="(tab, idx) in tabNames"
                            :key="tab.key"
                            text
                            class="text-none px-4 rounded-0 tab-item"
                            :class="{ 'active-tab': activeTab === idx }"
                            @click="activeTab = idx"
                        >
                            {{ tab.label }}
                        </v-btn>
                    </div>

                    <!-- KHU VỰC NHẬP PHÍ MẶC ĐỊNH THEO TAB -->
                    <div class="mb-3 pa-3 grey lighten-4 rounded">
                        <v-text-field
                            v-model="defaultFees[currentTabConfig.key]"
                            :label="currentTabConfig.defaultLabel"
                            outlined
                            dense
                            suffix="VNĐ"
                            hide-details
                            class="mb-2 bg-white"
                            @input="onDefaultFeeInput(currentTabConfig.key)"
                        ></v-text-field>

                        <v-checkbox
                            v-model="applyDefaultFlags[currentTabConfig.key]"
                            :label="currentTabConfig.applyLabel"
                            dense
                            hide-details
                            class="mt-2"
                            color="#A62229"
                            @change="applyDefaultFee(currentTabConfig.key)"
                        ></v-checkbox>
                    </div>

                    <!-- PHÂN TRANG NẰM TRÊN BẢNG -->
                    <div class="d-flex align-center justify-end mb-3 flex-wrap" style="gap: 8px;">
                        <v-select
                            v-model="itemsPerPage"
                            :items="[20, 50, 100]"
                            label="Bản ghi"
                            outlined
                            dense
                            hide-details
                            class="pagination-box-select"
                            @change="onPageSizeChange"
                        />

                        <v-text-field
                            :value="currentPage"
                            label="Trang"
                            outlined
                            dense
                            hide-details
                            class="pagination-box-input"
                            @change="onPageInputChange"
                        />

                        <v-btn
                            depressed
                            class="pagination-arrow-btn"
                            :disabled="currentPage <= 1"
                            @click="changePage(currentPage - 1)"
                        >
                            <v-icon color="grey darken-1">mdi-chevron-left</v-icon>
                        </v-btn>

                        <template v-for="p in totalPages">
                            <v-btn
                                v-if="p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)"
                                :key="p"
                                depressed
                                class="pagination-page-btn"
                                :color="p === currentPage ? '#A62229' : '#f5f5f5'"
                                :dark="p === currentPage"
                                @click="changePage(p)"
                            >
                                {{ p }}
                            </v-btn>
                            <span v-else-if="p === currentPage - 2 || p === currentPage + 2" :key="'dot-' + p">...</span>
                        </template>

                        <v-btn
                            depressed
                            class="pagination-arrow-btn"
                            :disabled="currentPage >= totalPages"
                            @click="changePage(currentPage + 1)"
                        >
                            <v-icon color="grey darken-1">mdi-chevron-right</v-icon>
                        </v-btn>
                    </div>

                    <!-- DANH SÁCH ĐỊNH MỨC -->
                    <v-card outlined class="rounded">
                        <v-simple-table dense>
                            <template v-slot:default>
                                <thead>
                                    <tr class="grey lighten-4">
                                        <th class="text-center font-weight-bold" style="width: 60px;">STT</th>
                                        <th class="text-left font-weight-bold">Học phần</th>
                                        <th class="text-right font-weight-bold" style="width: 130px;" :class="{'red--text': activeTab === 0}">Phí ra đề (*)</th>
                                        <th class="text-right font-weight-bold" style="width: 130px;" :class="{'red--text': activeTab === 1}">Phí chấm bài (*)</th>
                                        <th class="text-right font-weight-bold" style="width: 130px;" :class="{'red--text': activeTab === 2}">Phí trông thi (*)</th>
                                        <th class="text-right font-weight-bold" style="width: 130px;" :class="{'red--text': activeTab === 3}">Phí đi lại (*)</th>
                                        <th class="text-right font-weight-bold" style="width: 130px;" :class="{'red--text': activeTab === 4}">Phí TTTN (*)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(item, index) in paginatedItemList" :key="item.termId || item.id || index">
                                        <td class="text-center">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                                        <td>{{ item.name }}</td>
                                        <td>
                                            <div class="d-flex align-center justify-end" style="gap: 4px;">
                                                <input
                                                    type="text"
                                                    v-model="item.examPreparationFee"
                                                    class="custom-underline-input"
                                                    :class="{ 'custom-underline-input--error': submitted && isFeeMissing(item, 'examPreparationFee') }"
                                                />
                                                <span class="grey--text text--darken-2" style="font-size: 13px;">VNĐ</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="d-flex align-center justify-end" style="gap: 4px;">
                                                <input
                                                    type="text"
                                                    v-model="item.gradingFee"
                                                    class="custom-underline-input"
                                                    :class="{ 'custom-underline-input--error': submitted && isFeeMissing(item, 'gradingFee') }"
                                                />
                                                <span class="grey--text text--darken-2" style="font-size: 13px;">VNĐ</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="d-flex align-center justify-end" style="gap: 4px;">
                                                <input
                                                    type="text"
                                                    v-model="item.proctoringFee"
                                                    class="custom-underline-input"
                                                    :class="{ 'custom-underline-input--error': submitted && isFeeMissing(item, 'proctoringFee') }"
                                                />
                                                <span class="grey--text text--darken-2" style="font-size: 13px;">VNĐ</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="d-flex align-center justify-end" style="gap: 4px;">
                                                <input
                                                    type="text"
                                                    v-model="item.travelExpenses"
                                                    class="custom-underline-input"
                                                    :class="{ 'custom-underline-input--error': submitted && isFeeMissing(item, 'travelExpenses') }"
                                                />
                                                <span class="grey--text text--darken-2" style="font-size: 13px;">VNĐ</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="d-flex align-center justify-end" style="gap: 4px;">
                                                <input
                                                    type="text"
                                                    v-model="item.graduationInternFee"
                                                    class="custom-underline-input"
                                                    :class="{ 'custom-underline-input--error': submitted && isFeeMissing(item, 'graduationInternFee') }"
                                                />
                                                <span class="grey--text text--darken-2" style="font-size: 13px;">VNĐ</span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </template>
                        </v-simple-table>
                    </v-card>
                </v-form>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions class="pa-3">
                <v-spacer></v-spacer>
                <v-btn outlined color="grey darken-1" class="text-none px-4" :disabled="saving" @click="closeDialog">
                    Đóng <v-icon right small>mdi-close</v-icon>
                </v-btn>
                <v-btn color="#A62229" dark class="text-none px-5" elevation="0" :loading="saving" :disabled="saving" @click="handleUpdate">
                    Lưu <v-icon right small>mdi-content-save</v-icon>
                </v-btn>
            </v-card-actions>
        </v-card>

        <v-file-input
            ref="fileInput"
            accept=".xls,.xlsx,.pdf"
            class="d-none"
            @change="handleUpload"
        />
    </v-dialog>
</template>

<script>
import BaseDatePicker from "~/components/Base/DatePicker.vue";
import decisionTeacherJobFeeService from "~/services/decisionTeacherJobFeeService";
import uploadServices from "~/services/uploadServices";

const FEE_FIELDS = [
    "examPreparationFee",
    "gradingFee",
    "proctoringFee",
    "travelExpenses",
    "graduationInternFee",
];

export default {
    name: "DecisionTeacherJobFeeUpdateModal",
    components: {
        BaseDatePicker,
    },
    props: {
        value: { type: Boolean, default: false },
        itemData: { type: Object, default: () => ({}) },
    },
    data() {
        return {
            open: this.value,
            loading: false,
            saving: false,
            submitted: false,
            activeTab: 0,
            fileName: "",
            form: {
                id: null,
                name: "",
                timeInform: "",
                fileInform: "",
                semesterId: null,
                status: "ACTIVE",
            },
            semesterList: [],
            itemList: [],
            currentPage: 1,
            itemsPerPage: 20,
            defaultFees: {
                examPreparationFee: "",
                gradingFee: "",
                proctoringFee: "",
                travelExpenses: "",
                graduationInternFee: "",
            },
            applyDefaultFlags: {
                examPreparationFee: false,
                gradingFee: false,
                proctoringFee: false,
                travelExpenses: false,
                graduationInternFee: false,
            },
            tabNames: [
                { key: "examPreparationFee", label: "Ra Đề", defaultLabel: "Phí ra đề mặc định", applyLabel: "Áp dụng phí ra đề mặc định" },
                { key: "gradingFee", label: "Chấm Bài", defaultLabel: "Phí chấm bài mặc định", applyLabel: "Áp dụng phí chấm bài mặc định" },
                { key: "proctoringFee", label: "Trông Thi", defaultLabel: "Phí trông thi mặc định", applyLabel: "Áp dụng phí trông thi mặc định" },
                { key: "travelExpenses", label: "Đi Lại", defaultLabel: "Phí đi lại mặc định", applyLabel: "Áp dụng phí đi lại mặc định" },
                { key: "graduationInternFee", label: "TTTN", defaultLabel: "Phí TTTN mặc định", applyLabel: "Áp dụng phí TTTN mặc định" },
            ],
        };
    },
    watch: {
        value(val) {
            this.open = val;
            if (val && this.itemData && this.itemData.id) {
                this.submitted = false;
                this.populateData();
            }
        },
        open(val) {
            this.$emit("input", val);
            if (!val) {
                this.submitted = false;
                if (this.$refs.form) {
                    this.$refs.form.resetValidation();
                }
            }
        },
        itemData(val) {
            if (val && val.id && this.open) {
                this.submitted = false;
                this.populateData();
            }
        },
        fileName(newVal) {
            if (!newVal) {
                this.form.fileInform = "";
            }
        },
    },
    computed: {
        currentTabConfig() {
            return this.tabNames[this.activeTab];
        },
        totalPages() {
            if (!this.itemList.length) return 1;
            return Math.ceil(this.itemList.length / this.itemsPerPage) || 1;
        },
        paginatedItemList() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.itemList.slice(start, end);
        },
    },
    methods: {
        closeDialog() {
            this.open = false;
        },
        isFeeMissing(item, field) {
            const val = item?.[field];
            return val === null || val === undefined || String(val).trim() === "";
        },
        hasMissingFees() {
            return this.itemList.some(item => FEE_FIELDS.some(field => this.isFeeMissing(item, field)));
        },
        getFileNameFromURL(url) {
            if (!url) return "";
            if (typeof this.$fileName === "function") {
                const name = this.$fileName(url);
                if (name) return name;
            }
            if (url.includes("?o=")) {
                const parts = url.split("?o=");
                return parts[parts.length - 1];
            }
            const cleanUrl = String(url).split("?")[0];
            const segments = cleanUrl.split("/");
            return segments[segments.length - 1] || cleanUrl;
        },
        async populateData() {
            this.loading = true;
            try {
                let detail = this.itemData;
                if (typeof decisionTeacherJobFeeService.getDetail === "function") {
                    const detailRes = await decisionTeacherJobFeeService.getDetail(this.itemData.id, "CMS");
                    const rawDetail = detailRes?.data !== undefined ? detailRes.data : detailRes;
                    const resolved = rawDetail?.data !== undefined ? rawDetail.data : rawDetail;
                    if (resolved && typeof resolved === "object" && (resolved.id || resolved.estimationTeacherFees)) {
                        detail = { ...this.itemData, ...resolved };
                    }
                }

                this.form.id = detail.id;
                this.form.name = detail.name || "";
                this.form.timeInform = detail.timeInform || "";
                this.form.fileInform = detail.fileInform || "";
                this.form.semesterId = detail.semester?.id || detail.semesterId || null;
                this.form.status = detail.status || "ACTIVE";
                this.fileName = this.getFileNameFromURL(detail.fileInform);

                await this.loadSemesters();

                const rawFees = detail.estimationTeacherFees || detail.details || [];
                this.itemList = rawFees.map(item => ({
                    id: item.id,
                    termId: item.term?.id || item.termId || item.id,
                    name: item.term?.name || item.termName || item.name || "-",
                    examPreparationFee: item.examPreparationFee ?? 0,
                    gradingFee: item.gradingFee ?? 0,
                    proctoringFee: item.proctoringFee ?? 0,
                    travelExpenses: item.travelExpenses ?? 0,
                    graduationInternFee: item.graduationInternFee ?? 0,
                }));
                this.currentPage = 1;
            } catch (e) {
                console.error("Lỗi nạp dữ liệu cập nhật:", e);
            } finally {
                this.loading = false;
            }
        },
        async loadSemesters() {
            try {
                const res = await decisionTeacherJobFeeService.getSemesterList({ status: "ACTIVE", channel: "CMS" });
                const raw = res?.data !== undefined ? res.data : res;
                this.semesterList = Array.isArray(raw) ? raw : (raw?.data || raw?.content || []);
            } catch (e) {
                console.error("Lỗi tải học kỳ:", e);
                this.semesterList = [];
            }
        },
        triggerUpload() {
            if (this.$refs.fileInput?.$refs?.input) {
                this.$refs.fileInput.$refs.input.click();
            }
        },
        async handleUpload(fileObj) {
            if (!fileObj) return;
            this.fileName = fileObj.name;
            const formData = new FormData();
            formData.append("file", fileObj);
            try {
                const res = await uploadServices.upload(formData);
                const raw = res?.data !== undefined ? res.data : res;
                const url = raw?.url || raw?.data?.url;
                if (url) {
                    this.form.fileInform = url;
                }
            } catch (e) {
                console.error("Lỗi tải file:", e);
            }
        },
        applyDefaultFee(field) {
            const val = this.defaultFees[field];
            if (this.applyDefaultFlags[field]) {
                this.itemList.forEach(item => {
                    item[field] = val;
                });
            }
        },
        onDefaultFeeInput(field) {
            if (this.applyDefaultFlags[field]) {
                this.applyDefaultFee(field);
            }
        },
        onPageSizeChange() {
            this.currentPage = 1;
        },
        onPageInputChange(val) {
            const parsed = parseInt(val, 10);
            if (Number.isNaN(parsed)) {
                this.$forceUpdate();
                return;
            }
            const clamped = Math.min(Math.max(parsed, 1), this.totalPages);
            this.changePage(clamped);
            this.$forceUpdate();
        },
        changePage(page) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
            }
        },
        async handleUpdate() {
            this.submitted = true;
            const isFormValid = this.$refs.form ? this.$refs.form.validate() : true;
            const missingRequired = !this.form.name || !String(this.form.name).trim() || !this.form.timeInform || !this.form.semesterId;
            const missingFees = this.hasMissingFees();

            if (!isFormValid || missingRequired || missingFees) {
                return;
            }

            this.saving = true;
            try {
                const estimationTeacherFees = this.itemList.map(item => ({
                    id: item.id,
                    termId: item.termId,
                    name: item.name,
                    examPreparationFee: Number(item.examPreparationFee) || 0,
                    gradingFee: Number(item.gradingFee) || 0,
                    proctoringFee: Number(item.proctoringFee) || 0,
                    travelExpenses: Number(item.travelExpenses) || 0,
                    graduationInternFee: Number(item.graduationInternFee) || 0,
                }));

                const payload = {
                    id: this.form.id,
                    name: this.form.name,
                    timeInform: this.form.timeInform,
                    fileInform: this.form.fileInform || "",
                    semesterId: this.form.semesterId,
                    status: this.form.status,
                    estimationTeacherFees,
                    channel: "CMS",
                };

                const res = await decisionTeacherJobFeeService.updateItem(this.form.id, payload, "CMS");

                const isSuccess =
                    res?.success === true ||
                    res?.error?.code === 0 ||
                    res?.code === 0 ||
                    (res?.status >= 200 && res?.status < 300 && !res?.error);

                if (!isSuccess) {
                    return;
                }

                if (typeof this.$showSuccess === "function") {
                    this.$showSuccess("Cập nhật thông tin thành công");
                }
                this.open = false;
                this.$emit("saved");

                if (this.$parent && typeof this.$parent.getList === "function") {
                    this.$parent.getList();
                } else if (this.$parent && typeof this.$parent.loadData === "function") {
                    this.$parent.loadData();
                }
            } catch (error) {
                console.error("Lỗi cập nhật:", error);
            } finally {
                this.saving = false;
            }
        },
    },
};
</script>

<style scoped>
.tabs-header {
    border-bottom: 2px solid #e0e0e0;
}
.tab-item {
    font-weight: 500;
    color: #666;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
}
.active-tab {
    color: #A62229 !important;
    border-bottom: 2px solid #A62229 !important;
    background-color: #f9f9f9;
}
.field-error-text {
    color: #e53935;
    font-size: 12px;
    margin-top: 4px;
    padding-left: 12px;
}
.pagination-box-select {
    width: 32px;
    max-width: 92px;
}
.pagination-box-input {
    width: 32px;
    max-width: 64px;
}
.pagination-box-input >>> input {
    text-align: left;
}
.pagination-arrow-btn {
    min-width: 32px !important;
    width: 32px;
    height: 32px !important;
    padding: 0 !important;
    border-radius: 6px !important;
    background-color: #f5f5f5 !important;
}
.pagination-page-btn {
    min-width: 36px !important;
    width: 36px;
    height: 36px !important;
    padding: 0 !important;
    border-radius: 6px !important;
}
.custom-underline-input {
    width: 85px;
    border: none;
    border-bottom: 1px solid #757575;
    background: transparent;
    text-align: right;
    font-size: 13px;
    outline: none;
    padding: 2px 0;
    color: #333;
}
.custom-underline-input:focus {
    border-bottom: 1px solid #A62229;
}
.custom-underline-input--error {
    border-bottom: 1.5px solid #e53935 !important;
}
</style>