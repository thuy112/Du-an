<script>
import { statusList } from "~/consts/list";
import decisionFeeTypeService from "~/services/decisionFeeTypeService";

export default {
    name: "DecisionFeeTypeModal",
    props: {
        value: {
            type: Boolean,
            default: false,
        },
        editData: {
            type: Object,
            default: null,
        },
        semesterList: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            menuDate: false,
            open: this.value,
            loading: false,
            loadingMajor: false,
            majorList: [],
            body: {
                id: null,
                name: "",
                timeInform: "",
                fileInform: "",
                semesterId: null,
                status: "ACTIVE",
                defaultFee: null,
                defaultFeeDisplay: "",
                isAllMajor: false,
            },
            fileName: "",
            statusList,
            headers: [
                { value: "stt", text: "STT", sortable: false, width: "60px", align: "center" },
                { value: "name", text: "Ngành", sortable: false },
                { value: "educationProgram", text: "Chương trình đào tạo", sortable: false },
                { value: "fee", text: "Phí thi lại", sortable: false, width: 220, align: "right" },
            ],
            confirmDialog: false,
            cancelConfirmDialog: false,
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
            if (num !== null && this.body.isAllMajor) {
                this.applyDefaultFeeToAll();
            }
        }
    },
    methods: {
        formatCurrency(val) {
            if (val === null || val === undefined || val === '') return '';
            const cleaned = String(val).replace(/\D/g, '');
            if (!cleaned) return '';
            // Sử dụng 'vi-VN' để tự động định dạng 100.000 (dấu chấm phân cách 3 chữ số)
            return Number(cleaned).toLocaleString('vi-VN');
        },
        parseCurrency(val) {
            if (!val) return null;
            const cleaned = String(val).replace(/\D/g, '');
            return cleaned ? Number(cleaned) : null;
        },
        formatDisplayDate(dateStr) {
            if (!dateStr) return '';
            if (dateStr.includes('-')) {
                const parts = dateStr.split('-');
                if (parts.length === 3) {
                    return `${parts[2]}/${parts[1]}/${parts[0]}`;
                }
            }
            return dateStr;
        },
        onFeeInput(item, val) {
            const formatted = this.formatCurrency(val);
            item.feeDisplay = formatted;
            item.fee = this.parseCurrency(formatted);
        },
        clearSingleFee(item) {
            item.feeDisplay = '';
            item.fee = null;
        },
        closeDialog() {
            this.open = false;
        },

        async initData() {
            this.loading = true;
            try {
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
                const detailRes = await decisionFeeTypeService.getDetail(id, "CMS").catch(() => null);

                if (detailRes) {
                    const detail = detailRes.data !== undefined ? detailRes.data : detailRes;
                    
                    this.body.id = detail.id;
                    this.body.name = detail.name || '';
                    this.body.timeInform = detail.timeInform || detail.issueDate || '';
                    this.body.fileInform = detail.fileInform || '';
                    this.fileName = detail.fileInform || '';
                    this.body.semesterId = detail.semester?.id || detail.semesterId || null;
                    this.body.status = detail.status || 'ACTIVE';
                    this.body.defaultFee = detail.defaultFee || null;
                    this.body.defaultFeeDisplay = this.formatCurrency(detail.defaultFee);
                    this.body.isAllMajor = !!detail.applyAllMajor;

                    const savedFees = detail.details || detail.estimationFees || [];
                    await this.getMajors(savedFees);
                }
            } catch (e) {
                console.log(e);
            } finally {
                this.loading = false;
            }
        },

        async getMajors(savedFees = []) {
            this.loadingMajor = true;
            try {
                const res = await decisionFeeTypeService.getMajorList({ status: "ACTIVE", channel: "CMS" });
                const dataItems = res?.data !== undefined ? res.data : res;
                const majors = Array.isArray(dataItems) ? dataItems : (dataItems?.data || dataItems?.content || []);

                this.majorList = majors.map((item) => {
                    const majorId = item.id;
                    const educationProgram = item?.educationProgram?.name || item.educationProgramName || item.programName || "-";

                    let foundFee = this.body.isAllMajor ? this.body.defaultFee : null;

                    if (savedFees && savedFees.length > 0) {
                        const matched = savedFees.find(r => r.majorId === majorId || r.id === majorId);
                        if (matched && matched.fee !== undefined && matched.fee !== null) {
                            foundFee = matched.fee;
                        }
                    }

                    return {
                        majorId,
                        name: item.name || item.code || '',
                        educationProgram,
                        fee: foundFee,
                        feeDisplay: this.formatCurrency(foundFee),
                    };
                });
            } catch (e) {
                console.log(e);
            } finally {
                this.loadingMajor = false;
            }
        },

        handleCheckboxClick() {
            if (this.body.isAllMajor) {
                this.cancelConfirmDialog = true;
            } else {
                this.confirmDialog = true;
            }
        },
        confirmChange() {
            this.body.isAllMajor = true;
            this.confirmDialog = false;
            this.applyDefaultFeeToAll();
        },
        cancelChange() {
            this.confirmDialog = false;
        },
        confirmUncheck() {
            this.body.isAllMajor = false;
            this.cancelConfirmDialog = false;
            this.clearAllFees();
        },
        cancelUncheck() {
            this.cancelConfirmDialog = false;
        },
        applyDefaultFeeToAll() {
            this.majorList.forEach((item) => {
                item.fee = this.body.defaultFee;
                item.feeDisplay = this.formatCurrency(this.body.defaultFee);
            });
            this.majorList = JSON.parse(JSON.stringify(this.majorList));
        },
        clearAllFees() {
            this.majorList.forEach((item) => {
                item.fee = null;
                item.feeDisplay = "";
            });
            this.majorList = JSON.parse(JSON.stringify(this.majorList));
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
                const res = decisionFeeTypeService.uploadFile ? await decisionFeeTypeService.uploadFile(file) : { success: true, data: { url: data.name } };
                if (res && res.success) {
                    this.body.fileInform = res?.data?.url || data.name;
                }
            } catch (er) {
                console.log(er);
                this.body.fileInform = data.name;
            }
        },

        formatDateForApi(dateStr) {
            if (!dateStr) return '';
            if (dateStr.includes('-')) {
                const parts = dateStr.split('-');
                if (parts.length === 3) {
                    return `${parts[2]}/${parts[1]}/${parts[0]}`;
                }
            }
            return dateStr;
        },

        async handleAdd() {
            const isFormValid = this.$refs.form.validate();
            const missingFees = this.majorList.some((item) => item.fee === null || item.fee === undefined);

            if (!isFormValid) {
                if (typeof this.$showError === 'function') this.$showError("Vui lòng kiểm tra các trường bắt buộc!");
                return;
            }

            if (missingFees) {
                if (typeof this.$showError === 'function') this.$showError("Vui lòng nhập phí thi lại cho tất cả các ngành học!");
                return;
            }

            this.loading = true;
            try {
                // Chuẩn bị payload gửi lên khớp chính xác với API
                const payload = {
                    id: this.body.id || null,
                    name: this.body.name,
                    timeInform: this.formatDateForApi(this.body.timeInform), // Đổi về dạng DD/MM/YYYY
                    fileInform: this.body.fileInform || "",
                    semesterId: this.body.semesterId, // Giữ nguyên kiểu dữ liệu của semesterId (hoặc bọc String() nếu backend cần chuỗi)
                    status: this.body.status,
                    defaultFee: this.body.defaultFee ? Number(this.body.defaultFee) : 0,
                    applyAllMajor: !!this.body.isAllMajor,
                    details: this.majorList.map((m) => ({
                        majorId: m.majorId,
                        fee: Number(m.fee) || 0,
                    })),
                    channel: "CMS"
                };

                let res;
                if (this.body.id) {
                    res = await decisionFeeTypeService.updateItem(this.body.id, payload, "CMS");
                } else {
                    res = await decisionFeeTypeService.createItem(payload, "CMS");
                }
                
                if (res && (res.success || res.code === 0 || res.error?.code === 0 || res.id)) {
                    this.open = false;
                    if (typeof this.$showSuccess === 'function') {
                        this.$showSuccess(this.body.id ? "Cập nhật thành công" : "Thêm mới thành công");
                    }
                    this.$emit("saved");
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
            <v-card-title class="pa-4 text-white" style="background-color: #A62229; color: white;">
                <span class="text-h6 font-weight-bold">{{ body.id ? 'Cập nhật quyết định học phí' : 'Thêm quyết định học phí' }}</span>
                <v-spacer></v-spacer>
                <v-btn icon dark @click="closeDialog">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

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

                        <!-- Ô Ngày ban hành -->
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
                                        :value="formatDisplayDate(body.timeInform)"
                                        label="Ngày ban hành (*)"
                                        outlined
                                        dense
                                        readonly
                                        v-bind="attrs"
                                        v-on="on"
                                        :rules="[v => !!body.timeInform || 'Ngày ban hành không được để trống']"
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
                                    :color="body.isAllMajor ? 'primary' : 'grey'"
                                    @click="handleCheckboxClick"
                                >
                                    <v-icon>
                                        {{ body.isAllMajor ? "mdi-checkbox-marked" : "mdi-checkbox-blank-outline" }}
                                    </v-icon>
                                </v-btn>
                                <span class="font-weight-medium">Dùng cho tất cả ngành học</span>
                            </div>

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

                        <!-- BẢNG CHI TIẾT NGÀNH HỌC -->
                        <v-col cols="12" class="mt-4">
                            <div class="table-responsive-container">
                                <v-data-table
                                    :headers="headers"
                                    :items="majorList"
                                    :items-per-page="-1"
                                    :loading="loadingMajor"
                                    fixed-header
                                    hide-default-footer
                                    item-key="majorId"
                                    dense
                                    class="elevation-1"
                                >
                                    <template #[`item.stt`]="{ index }">
                                        {{ index + 1 }}
                                    </template>

                                    <template #[`item.fee`]="{ item }">
                                        <div class="d-flex align-center justify-end">
                                            <div class="input-with-clear">
                                                <input
                                                    :value="item.feeDisplay"
                                                    type="text"
                                                    class="line-underline-input text-right pr-6"
                                                    placeholder=""
                                                    @input="onFeeInput(item, $event.target.value)"
                                                />
                                                <span
                                                    v-if="item.feeDisplay"
                                                    class="clear-btn"
                                                    title="Xóa"
                                                    @click="clearSingleFee(item)"
                                                >
                                                    &times;
                                                </span>
                                            </div>
                                            <span class="grey--text text--darken-1 pl-1 font-weight-medium">VNĐ</span>
                                        </div>
                                    </template>
                                </v-data-table>
                            </div>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>

            <v-divider></v-divider>

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