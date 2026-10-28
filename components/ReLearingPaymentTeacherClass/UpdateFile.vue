<template>
    <base-modal
        :loading="isLoading"
        :open="open"
        max-width="500"
        title="Cập nhật file thông tin"
        @OK="handleUpdate"
        @toggle="$emit('toggle')"
    >
        <v-form ref="form" lazy-validation @submit.prevent>
            <v-row class="mt-3" dense>
                <v-col cols="12">
                    <div class="d-flex align-center mb-3">
                        <span class="mr-3">File hiện tại:</span>
                        <v-btn
                            :disabled="!dataItem?.fileInform"
                            color="primary"
                            icon
                            small
                            @click="$download(dataItem.fileInform)"
                        >
                            <v-icon>mdi-file-download-outline</v-icon>
                        </v-btn>
                        <span v-if="!dataItem?.fileInform" class="text-caption grey--text ml-2">
                            Chưa có file
                        </span>
                    </div>
                </v-col>
                <v-col cols="12">
                    <v-file-input
                        v-model="selectedFile"
                        accept=".xls,.xlsx,.pdf,.doc,.docx"
                        label="Chọn file mới"
                        placeholder="Chọn file để cập nhật"
                        prepend-icon="mdi-file-upload-outline"
                        :rules="fileRules"
                        show-size
                        counter
                    />
                </v-col>
            </v-row>
        </v-form>
    </base-modal>
</template>

<script>
import uploadServices from "~/services/uploadServices";
import decisionTeacherJobFeeServices from "~/services/re-learning/decisionTeacherJobFeeServices";

export default {
    name: "ReLearingPaymentTeacherClassUpdateFile",
    props: {
        open: {
            type: Boolean,
            default: false,
        },
        dataItem: {
            type: Object,
            default: () => ({}),
        },
    },
    emits: ["toggle", "success"],
    data() {
        return {
            isLoading: false,
            selectedFile: null,
            fileRules: [(v) => !!v || "Vui lòng chọn file"],
        };
    },
    watch: {
        open(newVal) {
            if (!newVal) {
                this.selectedFile = null;
                this.$refs.form?.resetValidation();
            }
        },
    },
    methods: {
        async handleUpdate() {
            if (!this.$refs.form.validate()) return;

            this.isLoading = true;
            try {
                // Upload file mới
                const formData = new FormData();
                formData.append("file", this.selectedFile);

                const uploadRes = await uploadServices.upload(formData);

                if (!uploadRes.success) {
                    this.$showError("Upload file thất bại");
                    return;
                }

                // Cập nhật thông tin file
                const updateRes = await decisionTeacherJobFeeServices.updateFile(this.dataItem.id, {
                    fileInform: uploadRes.data.url,
                });

                if (updateRes.success) {
                    this.$emit("toggle");
                    this.$showSuccess("Cập nhật file thành công");
                    this.$emit("success");
                } else {
                    this.$showError("Cập nhật file thất bại");
                }
            } catch (error) {
                console.error("Error updating file:", error);
                this.$showError("Có lỗi xảy ra khi cập nhật file");
            } finally {
                this.isLoading = false;
            }
        },
    },
};
</script>
