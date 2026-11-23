<template>
    <v-dialog v-model="open" max-width="1000px" persistent scrollable>
        <v-card class="rounded-lg">
            <!-- Header Modal -->
            <v-card-title class="pa-4 text-white" style="background-color: #A62229; color: white;">
                <span class="text-h6 font-weight-bold">
                    {{ body.id ? "Cập nhật định mức phí" : "Thêm định mức phí" }}
                </span>
                <v-spacer></v-spacer>
                <v-btn icon dark @click="closeDialog">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <!-- Body Modal -->
            <v-card-text class="pa-5 modal-body-scroll">
                <v-form ref="form" lazy-validation @submit.prevent>
                    <v-row class="mt-2" dense>
                        <v-col cols="12" lg="6" md="6">
                            <v-text-field
                                v-model="body.name"
                                label="Tên ban hành (*)"
                                outlined
                                dense
                                :rules="[v => !!(v && String(v).trim()) || 'Tên ban hành không được để trống']"
                            />
                        </v-col>

                        <v-col cols="12" lg="6" md="6">
                            <BaseDatePicker
                                v-model="body.timeInform"
                                label="Ngày ban hành"
                                required
                            />
                        </v-col>

                        <v-col cols="12" lg="6" md="6">
                            <v-text-field
                                v-model="fileName"
                                readonly
                                outlined
                                dense
                                append-icon="mdi-file-upload-outline"
                                label="Thông tin ban hành"
                                @click:append="triggerUpload"
                                @click="triggerUpload"
                            />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-select
                                v-model="body.semesterId"
                                hide-details
                                :items="semesterList"
                                item-value="id"
                                item-text="name"
                                label="Học kỳ (*)"
                                outlined
                                dense
                                :rules="[v => !!v || 'Vui lòng chọn học kỳ']"
                            />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-select
                                v-model="body.status"
                                :items="statusList"
                                item-text="text"
                                item-value="value"
                                label="Trạng thái (*)"
                                outlined
                                dense
                            />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-select
                                v-model="body.decisionFeeType"
                                hide-details
                                :items="listType"
                                item-value="value"
                                item-text="text"
                                label="Định mức phân hệ (*)"
                                outlined
                                dense
                            />
                        </v-col>

                        <v-col cols="12" md="12" class="d-flex align-center flex-wrap pt-2">
                            <div style="flex: 1; min-width: 260px;" class="mr-4">
                                <v-text-field
                                    v-model="body.defaultFeeDisplay"
                                    label="Phí mặc định"
                                    outlined
                                    dense
                                    suffix="VNĐ"
                                    hide-details
                                    @input="onDefaultFeeInput"
                                />
                            </div>
                            <div class="d-flex align-center mt-2">
                                <v-btn
                                    icon
                                    class="ma-0"
                                    :color="checkbox ? 'primary' : 'grey'"
                                    :title="checkbox ? 'Bỏ chọn' : 'Chọn'"
                                    @click="handleCheckboxClick"
                                >
                                    <v-icon>
                                        {{ checkbox ? "mdi-checkbox-marked" : "mdi-checkbox-blank-outline" }}
                                    </v-icon>
                                </v-btn>
                                <span class="font-weight-medium">Dùng cho tất cả ngành học</span>
                            </div>

                            <!-- Xác nhận bật -->
                            <v-dialog v-model="confirmDialog" max-width="400" persistent>
                                <v-card class="pa-4">
                                    <div class="text-h6 font-weight-bold mb-3">Xác nhận</div>
                                    <div class="mb-4">Bạn có chắc chắn muốn áp dụng cho tất cả ngành học?</div>
                                    <div class="d-flex justify-end" style="gap: 8px;">
                                        <v-btn text @click="cancelChange">Hủy</v-btn>
                                        <v-btn color="#A62229" dark depressed @click="confirmChange">Đồng ý</v-btn>
                                    </div>
                                </v-card>
                            </v-dialog>

                            <!-- Xác nhận tắt -->
                            <v-dialog v-model="cancelConfirmDialog" max-width="400" persistent>
                                <v-card class="pa-4">
                                    <div class="text-h6 font-weight-bold mb-3">Xác nhận</div>
                                    <div class="mb-4">Bạn có chắc chắn muốn hủy áp dụng cho tất cả ngành học?</div>
                                    <div class="d-flex justify-end" style="gap: 8px;">
                                        <v-btn text @click="cancelUncheck">Hủy</v-btn>
                                        <v-btn color="#A62229" dark depressed @click="confirmUncheck">Đồng ý</v-btn>
                                    </div>
                                </v-card>
                            </v-dialog>
                        </v-col>

                        <!-- Bảng chi tiết -->
                        <v-col cols="12" class="mt-4">
                            <div class="table-responsive-container">
                                <v-data-table
                                    :headers="headers"
                                    :items="list"
                                    :items-per-page="-1"
                                    :loading="loadingTable"
                                    fixed-header
                                    hide-default-footer
                                    item-key="name"
                                    dense
                                    class="elevation-1"
                                >
                                    <template #[`item.stt`]="{ index }">
                                        {{ index + 1 }}
                                    </template>

                                    <template #[`item.trainingMethods`]="{ item }">
                                        <div>
                                            <div
                                                v-for="(trainingMethod, index) in item.trainingMethods"
                                                :key="index"
                                                style="height: 36px; display: flex; align-items: center; border-bottom: 1px solid #eee;"
                                            >
                                                {{ trainingMethod.name }}
                                            </div>
                                        </div>
                                    </template>

                                    <template #[`item.fee`]="{ item }">
                                        <div>
                                            <div
                                                v-for="(trainingMethod, index) in item.trainingMethods"
                                                :key="index"
                                                style="height: 36px; display: flex; align-items: center; justify-content: flex-end; border-bottom: 1px solid #eee;"
                                            >
                                                <div class="input-with-clear">
                                                    <input
                                                        :value="trainingMethod.feeDisplay"
                                                        type="text"
                                                        class="line-underline-input text-right pr-6"
                                                        placeholder=""
                                                        @input="onFeeInput(trainingMethod, $event.target.value)"
                                                    />
                                                    <span
                                                        v-if="trainingMethod.feeDisplay !== ''"
                                                        class="clear-btn"
                                                        title="Xóa"
                                                        @click="clearSingleFee(trainingMethod)"
                                                    >
                                                        &times;
                                                    </span>
                                                </div>
                                                <span class="grey--text text--darken-1 pl-1 font-weight-medium">VNĐ</span>
                                            </div>
                                        </div>
                                    </template>
                                </v-data-table>
                            </div>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>

            <v-divider></v-divider>

            <!-- Footer Modal -->
            <v-card-actions class="pa-3">
                <v-spacer></v-spacer>
                <v-btn outlined color="grey darken-1" class="text-none px-4" @click="closeDialog" :disabled="loading">
                    Đóng <v-icon right small>mdi-close</v-icon>
                </v-btn>
                <v-btn color="#A62229" dark class="text-none px-5" @click="handleAdd" :loading="loading">
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
import { statusList } from "~/consts/list";
import BaseDatePicker from "~/components/Base/DatePicker.vue";
import uploadServices from "~/services/uploadServices";
import majorServices from "~/services/majorServices";
import decisionFeeServices from "~/services/redefend/decisionFeeServices";
import trainingMethodServices from "~/services/trainingMethodServices";
import decisionFeeService from "~/services/decisionFeeService";

export default {
    name: "DecisionFeeModal",
    components: {
        BaseDatePicker,
    },
    props: {
        value: {
            type: Boolean,
            default: false,
        },
        editData: {
            type: Object,
            default: null,
        },
    },
    data() {
        return {
            open: this.value,
            loading: false,
            loadingTable: false,
            semesterList: [],
            trainingMethodList: [],
            list: [],
            body: {
                id: null,
                trainingmethodCreates: [],
                fileInform: "",
                semesterId: null,
                name: "",
                status: "ACTIVE",
                timeInform: "",
                defaultFee: null,
                defaultFeeDisplay: "",
                trainingMethodId: null,
                decisionFeeType: "REDEFENCES",
            },
            fileName: "",
            statusList,
            headers: [
                { value: "stt", text: "STT", sortable: false, width: "60px", align: "center" },
                { value: "name", text: "Ngành", sortable: false },
                { value: "educationProgram", text: "Chương trình đào tạo", sortable: false },
                { value: "trainingMethods", text: "Hình thức đào tạo", sortable: false, width: 200 },
                { value: "fee", text: "Định mức tín chỉ học phí", sortable: false, width: 220, align: "right" },
            ],
            checkbox: false,
            confirmDialog: false,
            cancelConfirmDialog: false,
            listType: [
                { value: "RETAKE", text: "Học lại", color: "blue" },
                { value: "REDEFENCES", text: "Bảo vệ lại", color: "teal" },
            ],
        };
    },
    watch: {
        value(val) {
            this.open = val;
        },
        async open(newVal) {
            this.$emit("input", newVal);
            if (!newVal) {
                Object.assign(this.$data, this.$options.data());
                if (this.$refs.form) {
                    this.$refs.form.resetValidation();
                }
            } else if (this.editData && this.editData.id) {
                await this.initDataForEdit(this.editData.id);
            } else {
                this.loading = true;
                try {
                    await Promise.all([this.getSemesters(), this.getTrainingMethod()]);
                    await this.getMajors([]);
                } finally {
                    this.loading = false;
                }
            }
        },
        fileName(newVal) {
            if (!newVal) {
                this.body.fileInform = "";
            }
        },
    },
    methods: {
        toBaseDatePickerValue(val) {
            if (!val) return "";
            const str = String(val).trim();
            if (!str) return "";

            if (/^\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}$/.test(str)) {
                return str;
            }

            const vnMatch = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
            if (vnMatch) {
                const dd = vnMatch[1].padStart(2, "0");
                const mm = vnMatch[2].padStart(2, "0");
                const yyyy = vnMatch[3];
                return `${dd}/${mm}/${yyyy} 00:00:00`;
            }

            const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (isoMatch) {
                const yyyy = isoMatch[1];
                const mm = isoMatch[2];
                const dd = isoMatch[3];
                return `${dd}/${mm}/${yyyy} 00:00:00`;
            }

            return "";
        },
        formatCurrency(val) {
            if (val === null || val === undefined || val === "") return "";
            const cleaned = String(val).replace(/\D/g, "");
            if (!cleaned) return "";
            return Number(cleaned).toLocaleString("de-DE");
        },
        parseCurrency(val) {
            if (val === null || val === undefined || val === "") return null;
            const cleaned = String(val).replace(/\D/g, "");
            return cleaned !== "" ? Number(cleaned) : null;
        },
        onDefaultFeeInput(val) {
            const formatted = this.formatCurrency(val);
            this.body.defaultFeeDisplay = formatted;
            this.body.defaultFee = this.parseCurrency(formatted);
            if (this.body.defaultFee !== null && this.checkbox) {
                this.applyDefaultFeeToAll();
            }
        },
        onFeeInput(trainingMethod, val) {
            const formatted = this.formatCurrency(val);
            trainingMethod.feeDisplay = formatted;
            trainingMethod.fee = this.parseCurrency(formatted);
        },
        clearSingleFee(trainingMethod) {
            trainingMethod.feeDisplay = "";
            trainingMethod.fee = null;
        },
        closeDialog() {
            this.open = false;
        },

        async getSemesters() {
            try {
                const res = await decisionFeeService.getSemesterList({ status: "ACTIVE", channel: "CMS" });
                const data = res?.data !== undefined ? res.data : res;
                this.semesterList = Array.isArray(data) ? data : (data?.data || data?.content || []);
            } catch (e) {
                console.log(e);
            }
        },
        async getTrainingMethod() {
            try {
                const res = await trainingMethodServices.getAll({ status: "ACTIVE" });
                if (res && res.success !== false) {
                    const data = res?.data !== undefined ? res.data : res;
                    this.trainingMethodList = Array.isArray(data) ? data : (data?.data || data?.content || []);
                }
            } catch (er) {
                console.log(er);
            }
        },
        async getMajors(savedFeesData = []) {
            this.loadingTable = true;
            try {
                const res = await majorServices.getAll({ status: "ACTIVE" });
                if (res && res.success !== false) {
                    const data = res?.data !== undefined ? res.data : res;
                    const majors = Array.isArray(data) ? data : (data?.data || data?.content || []);
                    const hasSavedData = Array.isArray(savedFeesData) && savedFeesData.length > 0;

                    this.list = majors.map((item) => {
                        const majorId = item.id;
                        const majorCode = item.code || "";
                        const educationProgram = item?.educationProgram?.name || item.educationProgramName || "";

                        const trainingMethods = (this.trainingMethodList || []).map((i) => {
                            let matchedReq = null;
                            if (hasSavedData) {
                                const matchedGroup = savedFeesData.find(
                                    (g) =>
                                        (g.trainingMethod &&
                                            (g.trainingMethod.id === i.id || g.trainingMethod.code === i.code)) ||
                                        g.trainingMethodId === i.id
                                );
                                if (matchedGroup) {
                                    const reqList = matchedGroup.estimationFees || matchedGroup.estimationRequests || [];
                                    matchedReq =
                                        reqList.find(
                                            (r) => r.majorId === majorId || (majorCode && r.majorCode === majorCode)
                                        ) || null;
                                }
                            }

                            let feeVal = null;
                            let feeDisp = "";
                            if (matchedReq && matchedReq.fee !== undefined && matchedReq.fee !== null) {
                                feeVal = Number(matchedReq.fee) || 0;
                                feeDisp = this.formatCurrency(feeVal);
                            } else if (this.checkbox && this.body.defaultFee !== null) {
                                feeVal = Number(this.body.defaultFee) || 0;
                                feeDisp = this.formatCurrency(feeVal);
                            } else if (hasSavedData) {
                                feeVal = 0;
                                feeDisp = this.formatCurrency(0);
                            }

                            return {
                                trainingMethodId: i.id,
                                name: i.name,
                                fee: feeVal,
                                feeDisplay: feeDisp,
                            };
                        });

                        return {
                            name: item.name,
                            majorId,
                            educationProgram,
                            trainingMethods,
                        };
                    });
                }
            } catch (e) {
                console.log(e);
            } finally {
                this.loadingTable = false;
            }
        },
        async initDataForEdit(id) {
            this.loading = true;
            try {
                const [detailRes, methodRes] = await Promise.all([
                    decisionFeeServices.getDetail(id).catch(() => null),
                    trainingMethodServices.getAll({ status: "ACTIVE" }).catch(() => null),
                ]);
                await this.getSemesters();

                if (methodRes && methodRes.success !== false) {
                    const mData = methodRes?.data !== undefined ? methodRes.data : methodRes;
                    this.trainingMethodList = Array.isArray(mData) ? mData : (mData?.data || mData?.content || []);
                }

                const rawDetail = detailRes?.data !== undefined ? detailRes.data : detailRes;
                const detail =
                    rawDetail && typeof rawDetail === "object" && !Array.isArray(rawDetail)
                        ? (rawDetail.data || rawDetail)
                        : (this.editData || {});

                const rawDate =
                    detail.timeInform ||
                    detail.issueDate ||
                    this.editData?.timeInform ||
                    this.editData?.issueDate ||
                    "";

                this.body.id = detail.id || this.editData?.id || id;
                this.body.name = detail.name ?? this.editData?.name ?? "";
                this.body.timeInform = this.toBaseDatePickerValue(rawDate);
                this.body.fileInform = detail.fileInform || this.editData?.fileInform || "";
                this.fileName = this.body.fileInform;
                this.body.semesterId = detail.semester?.id || detail.semesterId || this.editData?.semester?.id || null;
                this.body.status = detail.status || this.editData?.status || "ACTIVE";
                this.body.decisionFeeType = detail.decisionFeeType || this.editData?.decisionFeeType || "REDEFENCES";

                const rawDef = detail.defaultFee ?? this.editData?.defaultFee ?? null;
                this.body.defaultFee = rawDef !== null && rawDef !== undefined && rawDef !== "" ? Number(rawDef) : null;
                this.body.defaultFeeDisplay = this.body.defaultFee !== null ? this.formatCurrency(this.body.defaultFee) : "";
                this.checkbox = false;

                const savedFees = detail.feeTrainingmethodsDtos || this.editData?.feeTrainingmethodsDtos || [];
                await this.getMajors(savedFees);
            } catch (e) {
                console.log(e);
            } finally {
                this.loading = false;
            }
        },

        handleCheckboxClick() {
            if (this.checkbox) {
                this.cancelConfirmDialog = true;
            } else {
                this.confirmDialog = true;
            }
        },
        confirmChange() {
            this.checkbox = true;
            this.confirmDialog = false;
            this.applyDefaultFeeToAll();
        },
        cancelChange() {
            this.confirmDialog = false;
        },
        confirmUncheck() {
            this.checkbox = false;
            this.cancelConfirmDialog = false;
            this.clearAllFees();
        },
        cancelUncheck() {
            this.cancelConfirmDialog = false;
        },
        applyDefaultFeeToAll() {
            const feeVal =
                this.body.defaultFee !== null && this.body.defaultFee !== undefined
                    ? Number(this.body.defaultFee)
                    : null;
            const feeDisp = feeVal !== null ? this.formatCurrency(feeVal) : "";
            this.list.forEach((i) => {
                i.trainingMethods = i.trainingMethods.map((j) => ({
                    ...j,
                    fee: feeVal,
                    feeDisplay: feeDisp,
                }));
            });
            this.list = JSON.parse(JSON.stringify(this.list));
        },
        clearAllFees() {
            this.list.forEach((i) => {
                i.trainingMethods = i.trainingMethods.map((j) => ({
                    ...j,
                    fee: null,
                    feeDisplay: "",
                }));
            });
            this.list = JSON.parse(JSON.stringify(this.list));
        },

        triggerUpload() {
            if (this.$refs.fileInput && this.$refs.fileInput.$refs && this.$refs.fileInput.$refs.input) {
                this.$refs.fileInput.$refs.input.click();
            }
        },
        async handleUpload(data) {
            if (!data) return;
            this.fileName = data?.name;
            const file = new FormData();
            file.append("file", data);
            try {
                const res = await uploadServices.upload(file);
                if (res && res.success) {
                    this.body.fileInform = res?.data?.url || data.name;
                }
            } catch (er) {
                console.log(er);
            }
        },

        async handleAdd() {
            const isFormValid = this.$refs.form ? this.$refs.form.validate() : true;
            const missingFees = this.list.some((item) =>
                item.trainingMethods.some((i) => i.fee === null || i.fee === undefined || i.fee === "")
            );

            if (!isFormValid) {
                if (typeof this.$showError === "function") {
                    this.$showError("Vui lòng kiểm tra các trường bắt buộc!");
                }
                return;
            }

            if (missingFees) {
                if (typeof this.$showError === "function") {
                    this.$showError("Vui lòng nhập phí bảo vệ lại cho tất cả ngành học!");
                }
                return;
            }

            this.loading = true;
            try {
                const trainingmethodCreates = [];

                this.trainingMethodList.forEach((item) => {
                    trainingmethodCreates.push({
                        trainingMethodId: item.id,
                        estimationRequests: this.list.map((method) => ({
                            educationProgram: method.educationProgram,
                            majorId: method.majorId,
                            name: method.name,
                            fee:
                                Number(
                                    method.trainingMethods?.find(
                                        (i) => i.trainingMethodId === item.id
                                    )?.fee
                                ) || 0,
                        })),
                    });
                });

                const payload = {
                    ...(this.body.id ? { id: this.body.id } : {}),
                    fileInform: this.body.fileInform || "",
                    semesterId: this.body.semesterId,
                    name: (this.body.name || "").trim(),
                    status: this.body.status,
                    timeInform: this.body.timeInform,
                    defaultFee:
                        this.body.defaultFee !== null && this.body.defaultFee !== undefined
                            ? Number(this.body.defaultFee)
                            : null,
                    trainingMethodId: this.body.trainingMethodId,
                    decisionFeeType: this.body.decisionFeeType,
                    trainingmethodCreates,
                };

                const res = this.body.id
                    ? await decisionFeeServices.update(payload)
                    : await decisionFeeServices.add(payload);

                if (res && (res.success || res.code === 0 || res.error?.code === 0 || res.id)) {
                    this.open = false;
                    if (typeof this.$showSuccess === "function") {
                        this.$showSuccess(this.body.id ? "Cập nhật định mức phí thành công" : "Thêm mới thành công");
                    }
                    this.$emit("success");
                } else if (typeof this.$showError === "function") {
                    this.$showError(res?.error?.message || res?.message || "Có lỗi xảy ra, vui lòng thử lại!");
                }
            } catch (er) {
                console.log(er);
                if (typeof this.$showError === "function") {
                    this.$showError(
                        er?.response?.data?.error?.message ||
                            er?.response?.data?.message ||
                            er?.message ||
                            "Yêu cầu không hợp lệ!"
                    );
                }
            } finally {
                this.loading = false;
            }
        },
    },
};
</script>