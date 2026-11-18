<script>
import RequiredLabel from "~/components/Base/RequiredLabel.vue";
import { statusList } from "~/consts/list";
import { isMultiEmail, isRequired } from "~/utils/rules";
import configMailReceiver from "~/services/configMailReceiver";

export default {
    name: "Action",
    components: { RequiredLabel },
    props: {
        open: {
            type: Boolean,
            required: true,
        },
        isUpdate: {
            type: Boolean,
            default: false,
        },
        dataItem: {
            type: Object,
            default: () => ({}),
        },
        mailConfigList: {
            type: Array,
            default: () => [],
        },
    },
    data: () => ({
        isLoading: false,
        statusList,
        description: null,
        receiver: null,
        configMailId: null,
        type: null,
        status: "ACTIVE",
    }),
    watch: {
        open(val) {
            if (this.isUpdate && val) {
                this.status = this.dataItem.status;
                this.description = this.dataItem.description;
                this.configMailId = this.dataItem.configMail.id;
                this.receiver = this.dataItem.receiver;
            } else {
                this.description = null;
                this.configMailId = null;
                this.receiver = null;
                this.status = "ACTIVE";
            }
            this.$refs.form?.resetValidation();
        },
    },
    methods: {
        isMultiEmail,
        handleSubmit() {
            if (this.isUpdate) this.handleUpdate();
            else this.handleAdd();
        },

        async handleAdd() {
            const valid = this.$refs.form.validate();
            if (!valid) return;

            try {
                this.isLoading = true;
                const data = {
                    status: this.status,
                    description: this.description?.trim() || "",
                    configMailId: this.configMailId,
                    receiver: this.receiver,
                };
                const res = await configMailReceiver.add(data);
                if (res.success) {
                    this.$emit("toggle");
                    this.$emit("success");
                    this.$showSuccess("Thêm cấu hình người nhận mail thành công");
                }
            } catch (e) {
                console.error(e);
            }
            this.isLoading = false;
        },
        async handleUpdate() {
            const valid = this.$refs.form.validate();
            if (!valid) return;

            try {
                this.isLoading = true;
                const data = {
                    id: this.dataItem.id,
                    status: this.status,
                    description: this.description?.trim() || "",
                    configMailId: this.configMailId,
                    receiver: this.receiver,
                };
                const res = await configMailReceiver.update(data);
                if (res.success) {
                    this.$emit("toggle");
                    this.$emit("success");
                    this.$showSuccess("Cập nhật cấu hình người nhận mail thành công");
                }
            } catch (e) {
                console.error(e);
            }
            this.isLoading = false;
        },
        isRequired,
    },
};
</script>

<template>
    <BaseModal
        :title="
            isUpdate ? 'Cập nhật cấu hình người nhận mail' : 'Thêm mới cấu hình người nhận mail'
        "
        :open="open"
        :loading="isLoading"
        max-width="900"
        @toggle="$emit('toggle')"
        @OK="handleSubmit"
    >
        <v-form ref="form" @submit.prevent>
            <v-row class="ma-0 mt-3" dense>
                <v-col cols="12" md="6">
                    <v-autocomplete
                        v-model="configMailId"
                        outlined
                        dense
                        no-data-text="Không có dữ liệu"
                        color="primary"
                        item-value="id"
                        item-text="name"
                        autocomplete="off"
                        :items="mailConfigList"
                        clear-icon="mdi-close-circle"
                        clearable
                        :rules="[isRequired('Vui lòng chọn Template email')]"
                    >
                        <template #label>
                            <RequiredLabel name="Template email" />
                        </template>
                    </v-autocomplete>
                </v-col>

                <v-col cols="12" md="6">
                    <v-select
                        v-model="status"
                        outlined
                        dense
                        no-data-text="Không có dữ liệu"
                        color="primary"
                        :items="statusList"
                        clear-icon="mdi-close-circle"
                        clearable
                        :rules="[isRequired('Vui lòng chọn Trạng thái')]"
                    >
                        <template #label>
                            <RequiredLabel name="Trạng thái" />
                        </template>
                    </v-select>
                </v-col>
                <v-col cols="12">
                    <v-text-field
                        v-model.trim="receiver"
                        outlined
                        dense
                        color="primary"
                        autocomplete="off"
                        clear-icon="mdi-close-circle"
                        clearable
                        hint="Nhập ';' để ngăn cách nếu có nhiều email"
                        :rules="[isMultiEmail('Email không hợp lệ')]"
                    >
                        <template #label>
                            <RequiredLabel name="Người nhận email" />
                        </template>
                    </v-text-field>
                </v-col>

                <v-col cols="12">
                    <v-textarea v-model="description" label="Mô tả" outlined dense />
                </v-col>
            </v-row>
        </v-form>
    </BaseModal>
</template>

<style scoped></style>
