<script>
import decisionFeeTypeService from "~/services/decisionFeeTypeService";

export default {
    name: "DecisionFeeImportModal",
    props: {
        value: { type: Boolean, default: false },
    },
    data() {
        return {
            open: this.value,
            loading: false,
            selectedFile: null,
            isCheckPassed: false, // Kiểm tra file hợp lệ hay chưa để hiện nút Lưu
        };
    },
    watch: {
        value(val) {
            this.open = val;
            if (val) {
                this.selectedFile = null;
                this.isCheckPassed = false;
            }
        },
        open(val) {
            this.$emit('input', val);
        }
    },
    methods: {
        closeDialog() {
            this.open = false;
        },
        triggerUpload() {
            if (this.$refs.fileInput && this.$refs.fileInput.$refs && this.$refs.fileInput.$refs.input) {
                this.$refs.fileInput.$refs.input.click();
            }
        },
        handleFileChange(file) {
            if (!file) return;
            this.selectedFile = file;
            this.isCheckPassed = false; // Reset trạng thái khi chọn file mới
        },
        
        // Bước 1: Bấm nút "Import" -> Gọi API check
        async handleCheck() {
            if (!this.selectedFile) {
                if (typeof this.$showError === 'function') this.$showError("Vui lòng chọn tệp đính kèm!");
                return;
            }

            this.loading = true;
            try {
                const formData = new FormData();
                formData.append("file", this.selectedFile);

                const res = await decisionFeeTypeService.checkImportFile(formData, "CMS");
                const code = res?.code !== undefined ? res.code : res?.error?.code;

                if (code === 0 || res?.success) {
                    this.isCheckPassed = true; // Check thành công -> Hiện nút Lưu
                    if (typeof this.$showSuccess === 'function') this.$showSuccess("Kiểm tra file thành công, bạn có thể lưu lại!");
                } else {
                    this.isCheckPassed = false;
                    if (typeof this.$showError === 'function') {
                        this.$showError(res?.message || "Vui lòng nhập đầy đủ các trường thông tin bắt buộc");
                    }
                }
            } catch (er) {
                console.error("Lỗi check file:", er);
                this.isCheckPassed = false;
                if (typeof this.$showError === 'function') {
                    this.$showError("File không hợp lệ hoặc thiếu thông tin bắt buộc!");
                }
            } finally {
                this.loading = false;
            }
        },

        // Bước 2: Sau khi check đúng đủ ĐK -> Bấm "Lưu" -> Gọi API import chính thức
        async handleSaveImport() {
            if (!this.selectedFile) return;

            this.loading = true;
            try {
                const formData = new FormData();
                formData.append("file", this.selectedFile);

                const res = await decisionFeeTypeService.importFile(formData, "CMS");
                const code = res?.code !== undefined ? res.code : res?.error?.code;

                if (code === 0 || res?.success) {
                    this.open = false;
                    if (typeof this.$showSuccess === 'function') this.$showSuccess("Nhập file excel thành công!");
                    if (this.$parent && typeof this.$parent.loadData === 'function') {
                        this.$parent.loadData();
                    }
                } else if (typeof this.$showError === 'function') {
                    this.$showError(res?.message || "Có lỗi xảy ra khi import!");
                }
            } catch (er) {
                console.error("Lỗi import:", er);
                if (typeof this.$showError === 'function') this.$showError("Lỗi kết nối khi import file!");
            } finally {
                this.loading = false;
            }
        },

        async downloadTemplateFile() {
            try {
                const res = await decisionFeeTypeService.downloadTemplate("CMS");
                const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = 'template_dinh_muc_phi.xlsx';
                link.click();
            } catch (e) {
                console.log("Lỗi tải file mẫu:", e);
            }
        }
    }
};
</script>

<template>
    <v-dialog v-model="open" max-width="600px" persistent>
        <v-card class="rounded-lg">
            <v-card-title class="pa-4 text-white" style="background-color: #A62229; color: white;">
                <span class="text-h6 font-weight-bold">Nhập file excel</span>
                <v-spacer></v-spacer>
                <v-btn icon dark @click="closeDialog">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <v-card-text class="pa-5">
                <div class="mb-3 text-body-2">
                    Tải file mẫu ở đây: 
                    <a href="#" class="red--text text--darken-2 font-weight-medium" @click.prevent="downloadTemplateFile">
                        template_dinh_muc_phi.xlsx
                    </a>
                </div>

                <!-- Khu vực chọn file -->
                <div 
                    class="upload-drop-zone pa-6 text-center rounded pointer"
                    @click="triggerUpload"
                >
                    <div v-if="!selectedFile">
                        <v-btn icon color="#A62229" class="mb-2" x-large>
                            <v-icon size="40">mdi-plus-circle</v-icon>
                        </v-btn>
                        <div class="grey--text text--darken-1 font-weight-medium">Chọn tệp đính kèm</div>
                    </div>
                    <div v-else class="d-flex align-center justify-center pa-2 success lighten-5 rounded">
                        <v-icon color="success" left>mdi-file-excel</v-icon>
                        <span class="font-weight-medium success--text text--darken-3">{{ selectedFile.name }}</span>
                    </div>
                </div>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions class="pa-3">
                <v-spacer></v-spacer>
                <v-btn outlined color="grey darken-1" class="text-none px-4" @click="closeDialog" :disabled="loading">
                    Đóng <v-icon right small>mdi-close</v-icon>
                </v-btn>

                <!-- Nút Import để chạy API check -->
                <v-btn v-if="!isCheckPassed" color="#A62229" dark class="text-none px-5" @click="handleCheck" :loading="loading">
                    Import
                </v-btn>

                <!-- Nút Lưu chỉ hiện khi check file thành công -->
                <v-btn v-else color="#A62229" dark class="text-none px-5" @click="handleSaveImport" :loading="loading">
                    Lưu <v-icon right small>mdi-content-save</v-icon>
                </v-btn>
            </v-card-actions>
        </v-card>

        <v-file-input
            ref="fileInput"
            accept=".xls,.xlsx"
            class="d-none"
            @change="handleFileChange"
        />
    </v-dialog>
</template>

<style scoped>
.upload-drop-zone {
    border: 2px dashed #A62229;
    background-color: #fafafa;
    transition: background-color 0.2s;
}
.upload-drop-zone:hover {
    background-color: #f5f5f5;
}
.pointer {
    cursor: pointer;
}
</style>