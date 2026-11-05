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
        editData: {
            type: Object,
            default: null,
        },
    },
    data() {
        return {
            menuDate: false,
            open: this.value,
            loading: false,
            semesterList: [],
            trainingMethodList: [],
            list: [],
            body: {
                id: null,
                name: "",
                timeInform: "",
                fileInform: "",
                semesterId: null,
                status: "ACTIVE",
                decisionFeeType: "REDEFENCES",
                defaultFee: null,
                defaultFeeDisplay: "",
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
                if (this.editData && this.editData.id) {
                    this.initDataForEdit(this.editData.id);
                } else {
                    this.initData();
                }
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
        "body.defaultFeeDisplay"(val) {
            const num = this.parseCurrency(val);
            this.body.defaultFee = num;
            if (num !== null && this.checkbox) {
                this.applyDefaultFeeToAll();
            }
        }
    },
    methods: {
        // --- ĐỔI PHÂN CÁCH HÀNG NGHÌN THÀNH DẤU PHẨY (,) ---
        formatCurrency(val) {
            if (val === null || val === undefined || val === '') return '';
            const cleaned = String(val).replace(/\D/g, '');
            if (!cleaned) return '';
            // Thay dấu chấm mặc định thành dấu phẩy (,)
            return Number(cleaned).toLocaleString('de-DE'); // 'de-DE' mặc định dùng dấu phẩy cho hàng nghìn
        },
        parseCurrency(val) {
            if (!val) return null;
            const cleaned = String(val).replace(/\D/g, '');
            return cleaned ? Number(cleaned) : null;
        },
        onFeeInput(trainingMethod, val) {
            const formatted = this.formatCurrency(val);
            trainingMethod.feeDisplay = formatted;
            trainingMethod.fee = this.parseCurrency(formatted);
        },
        // Hàm xóa nhanh số tiền khi bấm icon 'x'
        clearSingleFee(trainingMethod) {
            trainingMethod.feeDisplay = '';
            trainingMethod.fee = null;
        },

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
                await this.getMajors([]);
            } catch (e) {
                console.log(e);
            } finally {
                this.loading = false;
            }
        },

        async initDataForEdit(id) {
            this.loading = true;
            try {
                const [detailRes, semesterRes, methodRes] = await Promise.all([
                    decisionFeeService.getDetail(id, "CMS").catch(() => null),
                    decisionFeeService.getSemesterList({ status: "ACTIVE", channel: "CMS" }).catch(() => []),
                    decisionFeeService.getTrainingMethodList({ status: "ACTIVE", channel: "CMS" }).catch(() => [])
                ]);

                const semData = semesterRes?.data !== undefined ? semesterRes.data : semesterRes;
                this.semesterList = Array.isArray(semData) ? semData : (semData?.data || semData?.content || []);

                const methodData = methodRes?.data !== undefined ? methodRes.data : methodRes;
                this.trainingMethodList = Array.isArray(methodData) ? methodData : (methodData?.data || methodData?.content || methodData?.items || []);

                if (detailRes) {
                    const detail = detailRes.data !== undefined ? detailRes.data : detailRes;
                    
                    this.body.id = detail.id;
                    this.body.name = detail.name || '';
                    this.body.timeInform = detail.timeInform || detail.issueDate || '';
                    this.body.fileInform = detail.fileInform || '';
                    this.fileName = detail.fileInform || '';
                    this.body.semesterId = detail.semester?.id || detail.semesterId || null;
                    this.body.status = detail.status || 'ACTIVE';
                    this.body.decisionFeeType = detail.decisionFeeType || 'REDEFENCES';
                    this.body.defaultFee = detail.defaultFee || null;
                    this.body.defaultFeeDisplay = this.formatCurrency(detail.defaultFee);
                    this.checkbox = !!detail.applyAllMajor;

                    const savedFeesData = detail.feeTrainingmethodsDtos || detail.trainingmethodCreates || detail.trainingMethods || [];
                    await this.getMajors(savedFeesData);
                }
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

        async getMajors(savedFeesData = []) {
            try {
                const res = decisionFeeService.getMajorList 
                    ? await decisionFeeService.getMajorList({ status: "ACTIVE", channel: "CMS" })
                    : await decisionFeeService.getList({ status: "ACTIVE", channel: "CMS" });

                const dataItems = res?.data !== undefined ? res.data : res;
                const majors = Array.isArray(dataItems) ? dataItems : (dataItems?.data || dataItems?.content || dataItems?.items || []);

                this.list = majors.map((item) => {
                    const majorId = item.id;
                    const majorCode = item.code || '';
                    const educationProgram = item?.educationProgram?.name || item.educationProgramName || item.programName || "-";

                    const trainingMethods = this.trainingMethodList.length > 0 
                        ? this.trainingMethodList.map((i) => {
                            let foundFee = this.checkbox ? this.body.defaultFee : null;

                            if (savedFeesData && savedFeesData.length > 0) {
                                const matchedGroup = savedFeesData.find((g) => 
                                    (g.trainingMethod && (g.trainingMethod.id === i.id || g.trainingMethod.code === i.code)) ||
                                    (g.trainingMethodId && g.trainingMethodId === i.id) ||
                                    (g.id && g.id === i.id)
                                );

                                if (matchedGroup) {
                                    const reqList = matchedGroup.estimationFees || matchedGroup.estimationRequests || matchedGroup.details || [];
                                    const matchedReq = reqList.find((r) => 
                                        (r.majorId && r.majorId === majorId) ||
                                        (r.majorCode && r.majorCode === majorCode)
                                    );

                                    if (matchedReq && matchedReq.fee !== undefined && matchedReq.fee !== null) {
                                        foundFee = matchedReq.fee;
                                    }
                                }
                            }

                            return {
                                trainingMethodId: i.id,
                                name: i.name || i.code,
                                fee: foundFee,
                                feeDisplay: this.formatCurrency(foundFee),
                            };
                        })
                        : [{ trainingMethodId: null, name: 'Chính quy', fee: this.checkbox ? this.body.defaultFee : null, feeDisplay: this.formatCurrency(this.body.defaultFee) }];

                    return {
                        name: item.name || item.code || '',
                        majorId,
                        educationProgram,
                        trainingMethods
                    };
                });
            } catch (e) {
                console.log(e);
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
                    feeDisplay: this.formatCurrency(this.body.defaultFee),
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

        // Thêm hàm format ngày sang DD/MM/YYYY nếu cần, hoặc giữ nguyên tùy backend
        formatDateForApi(dateStr) {
            if (!dateStr) return ''
            if (dateStr.includes('-')) {
                const parts = dateStr.split('-')
                if (parts.length === 3) {
                    return `${parts[2]}/${parts[1]}/${parts[0]}`
                }
            }
            return dateStr
        },

        async handleAdd() {
            const isFormValid = this.$refs.form.validate();
            const missingFees = this.list.some((item) => item.trainingMethods.some((i) => i.fee === null || i.fee === undefined));

            if (!isFormValid) {
                if (typeof this.$showError === 'function') this.$showError("Vui lòng kiểm tra các trường bắt buộc!");
                return;
            }

            if (missingFees) {
                if (typeof this.$showError === 'function') this.$showError("Vui lòng nhập định mức học phí cho tất cả các hình thức đào tạo!");
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
                            fee: Number(method.trainingMethods?.find((i) => i.trainingMethodId === item.id)?.fee) || 0,
                        })),
                    });
                });

                const payload = {
                    ...this.body,
                    timeInform: this.formatDateForApi(this.body.timeInform), // Chuẩn hóa lại định dạng ngày gửi lên
                    defaultFee: this.body.defaultFee ? Number(this.body.defaultFee) : 0,
                    applyAllMajor: this.checkbox,
                    trainingmethodCreates,
                    channel: "CMS"
                };

                let res;
                if (this.body.id) {
                    res = decisionFeeService.updateItem 
                        ? await decisionFeeService.updateItem(this.body.id, payload, "CMS") 
                        : await decisionFeeService.update(this.body.id, payload);
                } else {
                    res = decisionFeeService.createItem 
                        ? await decisionFeeService.createItem(payload, "CMS") 
                        : await decisionFeeService.add(payload);
                }
                
                if (res && (res.success || res.code === 0 || res.error?.code === 0 || res.id)) {
                    this.open = false;
                    if (typeof this.$showSuccess === 'function') {
                        this.$showSuccess(this.body.id ? "Cập nhật định mức phí thành công" : "Thêm mới thành công");
                    }
                    if (this.$parent && typeof this.$parent.loadData === 'function') {
                        this.$parent.loadData();
                    } else if (this.$parent && typeof this.$parent.getList === 'function') {
                        this.$parent.getList();
                    }
                } else if (typeof this.$showError === 'function') {
                    this.$showError(res?.message || "Có lỗi xảy ra, vui lòng thử lại!");
                }
            } catch (er) {
                console.error("Lỗi:", er);
                if (typeof this.$showError === 'function') {
                    this.$showError("Yêu cầu không hợp lệ hoặc lỗi kết nối!");
                }
            } finally {
                this.loading = false;
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
                <span class="text-h6 font-weight-bold">{{ body.id ? 'Cập nhật định mức phí' : 'Thêm định mức phí' }}</span>
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
                            <v-menu
                                v-model="menuDate"
                                :close-on-content-click="false"
                                transition="scale-transition"
                                offset-y
                                min-width="auto"
                            >
                                <template #activator="{ on, attrs }">
                                    <v-text-field
                                        v-model="body.timeInform"
                                        label="Ngày ban hành (*)"
                                        outlined
                                        dense
                                        readonly
                                        v-bind="attrs"
                                        v-on="on"
                                        :rules="[v => !!v || 'Ngày ban hành không được để trống']"
                                    ></v-text-field>
                                </template>
                                <v-date-picker
                                    v-model="body.timeInform"
                                    color="#A62229"
                                    locale="vi"
                                    @input="menuDate = false"
                                ></v-date-picker>
                            </v-menu>
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
                                    @input="body.defaultFeeDisplay = formatCurrency($event)"
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
                                                    <!-- ICON DẤU X ĐỂ XÓA NHANH -->
                                                    <span
                                                        v-if="trainingMethod.feeDisplay"
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
.input-with-clear {
    position: relative;
    display: inline-block;
}

.line-underline-input {
    width: 140px;
    border: none;
    border-bottom: 1px solid #c0c0c0;
    outline: none;
    padding: 4px 18px 4px 2px;
    background: transparent;
    transition: border-color 0.2s ease;
}
.line-underline-input:focus {
    border-bottom: 1.5px solid #A62229;
}

.clear-btn {
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: #999;
    font-size: 16px;
    font-weight: bold;
    line-height: 1;
    user-select: none;
}
.clear-btn:hover {
    color: #A62229;
}
</style>