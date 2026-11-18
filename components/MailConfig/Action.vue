<script>
import RequiredLabel from "~/components/Base/RequiredLabel.vue";
import { sendTypeList, statusList, subjectSendMailList, actionSendTypeList } from "~/consts/list";
import { isRequired } from "~/utils/rules";
import mailConfigService from "~/services/mailConfigService";

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
    },
    data: () => ({
        isLoading: false,
        statusList,
        subjectSendMailList,
        sendTypeList,
        actionSendTypeList,
        name: null,
        content: null,
        sendType: null,
        actionSendType: null,
        type: null,
        status: "ACTIVE",
    }),
    watch: {
        open(val) {
            console.log(val);
            if (!val) {
                this.$refs.form.reset();
                this.content = null;
                this.status = "ACTIVE";
            } else if (this.isUpdate) {
                this.name = this.dataItem.name;
                this.content = this.dataItem.content;
                this.sendType = this.dataItem.sendType;
                this.actionSendType = this.dataItem.actionSendType;
                this.type = this.dataItem.type;
                this.status = this.dataItem.status;
            }
        },
    },
    methods: {
        handleSubmit() {
            if (this.isUpdate) this.handleUpdate();
            else this.handleAdd();
        },

        async handleAdd() {
            const valid = this.$refs.form.validate();
            if (!valid) return;
            if (!this.content?.trim()) {
                this.$showWarning("Vui lòng nhập nội dung");
                return;
            }
            try {
                this.isLoading = true;
                const data = {
                    name: this.name,
                    content: this.content,
                    sendType: this.sendType,
                    actionSendType: this.actionSendType,
                    type: this.type,
                    status: this.status,
                };
                const res = await mailConfigService.add(data);
                if (res.success) {
                    this.$emit("toggle");
                    this.$emit("success");
                    this.$showSuccess("Thêm cấu hình mail thành công");
                }
            } catch (e) {
                console.error(e);
            }
            this.isLoading = false;
        },
        async handleUpdate() {
            const valid = this.$refs.form.validate();
            if (!valid) return;
            if (!this.content?.trim()) {
                this.$showWarning("Vui lòng nhập nội dung");
                return;
            }
            try {
                this.isLoading = true;
                const data = {
                    id: this.dataItem.id,
                    name: this.name,
                    content: this.content,
                    sendType: this.sendType,
                    actionSendType: this.actionSendType,
                    type: this.type,
                    status: this.status,
                };
                const res = await mailConfigService.update(data);
                if (res.success) {
                    this.$emit("toggle");
                    this.$emit("success");
                    this.$showSuccess("Cập nhật cấu hình mail thành công");
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
        :title="isUpdate ? 'Cập nhật cấu hình mail' : 'Thêm mới cấu hình mail'"
        :open="open"
        :loading="isLoading"
        max-width="900"
        @toggle="$emit('toggle')"
        @OK="handleSubmit"
    >
        <v-form ref="form" @submit.prevent>
            <v-row class="ma-0 mt-3" dense>
                <v-col cols="12" md="6">
                    <v-text-field
                        v-model="name"
                        outlined
                        dense
                        color="primary"
                        clear-icon="mdi-close-circle"
                        clearable
                        :rules="[isRequired('Vui lòng nhập Tên cấu hình mail')]"
                    >
                        <template #label>
                            <RequiredLabel name="Tên cấu hình mail" />
                        </template>
                    </v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                    <v-select
                        v-model="sendType"
                        outlined
                        dense
                        no-data-text="Không có dữ liệu"
                        color="primary"
                        :items="subjectSendMailList"
                        clear-icon="mdi-close-circle"
                        clearable
                        :rules="[isRequired('Vui lòng chọn Đối tượng gửi mail')]"
                    >
                        <template #label>
                            <RequiredLabel name="Đối tượng gửi mail" />
                        </template>
                    </v-select>
                </v-col>
                <v-col cols="12" md="6">
                    <v-select
                        v-model="type"
                        outlined
                        dense
                        no-data-text="Không có dữ liệu"
                        color="primary"
                        :items="sendTypeList"
                        clear-icon="mdi-close-circle"
                        clearable
                        :rules="[isRequired('Vui lòng chọn Loại gửi')]"
                    >
                        <template #label>
                            <RequiredLabel name="Loại gửi" />
                        </template>
                    </v-select>
                </v-col>
                <v-col cols="12" md="6">
                    <v-select
                        v-model="actionSendType"
                        outlined
                        dense
                        no-data-text="Không có dữ liệu"
                        color="primary"
                        :items="actionSendTypeList"
                        clear-icon="mdi-close-circle"
                        clearable
                        :rules="[isRequired('Vui lòng chọn Loại hành động')]"
                    >
                        <template #label>
                            <RequiredLabel name="Loại hành động" />
                        </template>
                    </v-select>
                </v-col>
                <v-col cols="12" md="6">
                    <base-select
                        v-model="status"
                        :items="statusList"
                        item-text="text"
                        item-value="value"
                        label="Trạng thái"
                        :rules="[isRequired('Vui lòng chọn Trạng thái')]"
                    >
                    </base-select>
                </v-col>

                <client-only>
                    <v-col cols="12">
                        <VueEditor v-model="content" />
                    </v-col>
                </client-only>
            </v-row>
        </v-form>
    </BaseModal>
</template>

<style scoped></style>
