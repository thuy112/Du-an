<script>
import { statusList } from "~/consts/list";
import decisionFeeService from "~/services/decisionFeeService";

export default {
    name: "DecisionFeeModal",
    props: {
        value: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            open: this.value,
            loading: false,
            semesterList: [],
            trainingMethodList: [],
            list: [],
            body: {
                name: "",
                timeInform: "",
                fileInform: "",
                semesterId: null,
                status: "ACTIVE",
                decisionFeeType: "REDEFENCES",
                defaultFee: null,
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
                { value: "RETAKE", text: "Học lại" },
                { value: "REDEFENCES", text: "Bảo vệ lại" },
            ],
        };
    },
    watch: {
        value(val) {
            this.open = val;
            if (val) {
                this.initData();
            }
        },
        open(val) {
            this.$emit('input', val);
            if (!val) {
                Object.assign(this.$data, this.$options.data());
                if (this.$refs.form) {
                    this.$refs.form.resetValidation();
                }
            }
        },
        fileName(newVal) {
            if (!newVal) {
                this.body.fileInform = "";
            }
        },
        "body.defaultFee"(val) {
            if (val !== null && val !== '' && this.checkbox) {
                this.applyDefaultFeeToAll();
            }
        }
    },
    methods: {
        closeDialog() {
            this.open = false;
        },
        async initData() {
            this.loading = true;
            try {
                await Promise.all([
                    this.getSemesters(),
                    this.getTrainingMethod(),
                ]);
                await this.getMajors();
            } catch (e) {
                console.log(e);
            } finally {
                this.loading = false;
            }
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
                const res = decisionFeeService.getTrainingMethodList 
                    ? await decisionFeeService.getTrainingMethodList({ status: "ACTIVE", channel: "CMS" })
                    : [];
                
                const data = res?.data !== undefined ? res.data : res;
                this.trainingMethodList = Array.isArray(data) ? data : (data?.data || data?.content || data?.items || []);
            } catch (e) {
                console.log(e);
            }
        },
        async getMajors() {
            this.loading = true;
            try {
                const res = decisionFeeService.getMajorList 
                    ? await decisionFeeService.getMajorList({ status: "ACTIVE", channel: "CMS" })
                    : await decisionFeeService.getList({ status: "ACTIVE", channel: "CMS" });

                const dataItems = res?.data !== undefined ? res.data : res;
                const majors = Array.isArray(dataItems) ? dataItems : (dataItems?.data || dataItems?.content || dataItems?.items || []);

                this.list = majors.map((item) => ({
                    name: item.name || item.code || '',
                    majorId: item.id,
                    educationProgram: item?.educationProgram?.name || item.educationProgramName || item.programName || "-",
                    trainingMethods: this.trainingMethodList.length > 0 
                        ? this.trainingMethodList.map((i) => ({
                            trainingMethodId: i.id,
                            name: i.name || i.code,
                            fee: this.checkbox ? this.body.defaultFee : null,
                        }))
                        : [{ trainingMethodId: null, name: 'Chính quy', fee: this.checkbox ? this.body.defaultFee : null }]
                }));
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
            this.list.forEach((i) => {
                i.trainingMethods = i.trainingMethods.map((j) => ({
                    ...j,
                    fee: this.body.defaultFee,
                }));
            });
            this.list = JSON.parse(JSON.stringify(this.list));
        },
        clearAllFees() {
            this.list.forEach((i) => {
                i.trainingMethods = i.trainingMethods.map((j) => ({
                    ...j,
                    fee: null,
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
            this.fileName = data.name;
            const file = new FormData();
            file.append("file", data);
            try {
                const res = decisionFeeService.uploadFile ? await decisionFeeService.uploadFile(file) : { success: true, data: { url: data.name } };
                if (res && res.success) {
                    this.body.fileInform = res?.data?.url || data.name;
                }
            } catch (er) {
                console.log(er);
                this.body.fileInform = data.name;
            }
        },
        async handleAdd() {
            const isFormValid = this.$refs.form.validate();
            const missingFees = this.list.some((item) => item.trainingMethods.some((i) => !i.fee && i.fee !== 0));

            if (!isFormValid) {
                if (typeof this.$showError === 'function') this.$showError("Vui lòng kiểm tra các trường bắt buộc!");
                return;
            }

            if (missingFees) {
                if (typeof this.$showError === 'function') this.$showError("Vui lòng nhập định mức học phí cho tất cả các hình thức đào tạo!");
                return;
            }

            try {
                const trainingmethodCreates = [];

                this.trainingMethodList.forEach((item) => {
                    trainingmethodCreates.push({
                        trainingMethodId: item.id,
                        estimationRequests: this.list.map((method) => ({
                            educationProgram: method.educationProgram,
                            majorId: method.majorId,
                            name: method.name,
                            fee: Number(method.trainingMethods?.find((i) => i.trainingMethodId === item.id)?.fee) || 0,
                        })),
                    });
                });

                const payload = {
                    ...this.body,
                    defaultFee: this.body.defaultFee ? Number(this.body.defaultFee) : 0,
                    applyAllMajor: this.checkbox,
                    trainingmethodCreates,
                    channel: "CMS"
                };

                const res = decisionFeeService.createItem 
                    ? await decisionFeeService.createItem(payload, "CMS") 
                    : await decisionFeeService.add(payload);
                
                if (res && (res.success || res.code === 0 || res)) {
                    this.open = false;
                    if (typeof this.$showSuccess === 'function') this.$showSuccess("Thêm mới thành công");
                    if (this.$parent && typeof this.$parent.getList === 'function') {
                        this.$parent.getList();
                    }
                }
            } catch (er) {
                console.log(er);
            }
        },
    },
};
</script>

<template>
    <v-dialog v-model="open" max-width="1000px" persistent scrollable>
        <v-card class="rounded-lg">
            <!-- Header Modal -->
            <v-card-title class="pa-4 text-white" style="background-color: #A62229; color: white;">
                <span class="text-h6 font-weight-bold">Thêm định mức phí</span>
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
                                :rules="[v => !!v || 'Tên ban hành không được để trống']"
                            />
                        </v-col>

                        <v-col cols="12" lg="6" md="6">
                            <v-text-field
                                v-model="body.timeInform"
                                label="Ngày ban hành (*)"
                                outlined
                                dense
                                placeholder="DD/MM/YYYY"
                                :rules="[v => !!v || 'Ngày ban hành không được để trống']"
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
                                    v-model="body.defaultFee"
                                    label="Phí mặc định"
                                    outlined
                                    dense
                                    type="number"
                                    suffix="VNĐ"
                                    hide-details
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

                            <!-- POPUP XÁC NHẬN BẬT -->
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

                            <!-- POPUP XÁC NHẬN TẮT -->
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

                        <!-- BẢNG CHI TIẾT -->
                        <v-col cols="12" class="mt-4">
                            <div class="table-responsive-container">
                                <v-data-table
                                    :headers="headers"
                                    :items="list"
                                    :items-per-page="-1"
                                    :loading="loading"
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
                                                style="height: 36px; display: flex; align-items: center; border-bottom: 1px solid #eee;"
                                            >
                                                <input
                                                    v-model="trainingMethod.fee"
                                                    type="text"
                                                    class="line-underline-input text-right pr-2"
                                                    placeholder=""
                                                />
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

<style scoped>
.modal-body-scroll {
    max-height: 75vh;
    overflow-y: auto;
}

.table-responsive-container {
    max-height: 380px;
    overflow-y: auto;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
}

.table-responsive-container >>> th {
    position: sticky !important;
    top: 0;
    z-index: 2;
    background-color: #f5f5f5 !important;
}

.line-underline-input {
    width: 130px;
    border: none;
    border-bottom: 1px solid #c0c0c0;
    outline: none;
    padding: 4px 2px;
    background: transparent;
    transition: border-color 0.2s ease;
}
.line-underline-input:focus {
    border-bottom: 1.5px solid #A62229;
}
</style>