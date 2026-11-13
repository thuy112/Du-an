<script>
import RequiredLabel from "~/components/Base/RequiredLabel.vue";
import { genderList, statusList } from "~/consts/list";
import { isEmail, isPhone, isRequired } from "~/utils/rules";
import userServices from "~/services/userServices";

export default {
    name: "UserUpdate",
    components: { RequiredLabel },
    props: {
        open: {
            type: Boolean,
            required: true,
        },
        dataDetail: {
            type: Object,
            required: true,
        },
        groupList: {
            type: Array,
            required: true,
        },
    },
    data: () => ({
        isLoading: false,
        showPassword: false,
        genderList,
        statusList,
        avatar: null,
        email: null,
        fullName: null,
        phone: null,
        position: null,
        status: "ACTIVE",
        groupIds: [],
    }),
    watch: {
        open(val) {
            if (val) {
                this.status = this.dataDetail.status;
                this.avatar = this.dataDetail.avatar;
                this.email = this.dataDetail.email;
                this.fullName = this.dataDetail.fullName;
                this.phone = this.dataDetail.phone;
                this.position = this.dataDetail.position;
                this.groupIds = this.dataDetail.groups.map((i) => i.id);
            }
        },
    },
    methods: {
        isPhone,
        isEmail,
        async handleSubmit() {
            const valid = this.$refs.form.validate();
            if (!valid) return;
            try {
                this.isLoading = true;
                const data = {
                    id: this.dataDetail.id,
                    avatar: this.avatar,
                    email: this.email,
                    fullName: this.fullName,
                    phone: this.phone,
                    position: this.position,
                    status: this.status,
                    groupIds: this.groupIds,
                };
                const res = await userServices.update(data);
                if (res.success) {
                    this.$emit("toggle");
                    this.$emit("success");
                    this.$showSuccess("Cập nhật người dùng thành công");
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
        :loading="isLoading"
        :open="open"
        max-width="900"
        title="Cập nhật người dùng"
        @OK="handleSubmit"
        @toggle="$emit('toggle')"
    >
        <v-form ref="form" lazy-validation @submit.prevent>
            <v-row class="ma-0 mt-3">
                <v-col class="d-flex align-center justify-center" cols="12" md="4">
                    <BaseUploadAvatar
                        :avatar-url="avatar"
                        @clear="avatar = null"
                        @setAvatar="avatar = $event"
                    />
                </v-col>
                <v-col cols="12" md="8">
                    <v-row dense>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model.trim="fullName"
                                :rules="[isRequired('Vui lòng nhập Họ & tên')]"
                                chips
                                clear-icon="mdi-close-circle"
                                clearable
                                color="primary"
                                dense
                                outlined
                            >
                                <template #label>
                                    <RequiredLabel name="Họ & tên" />
                                </template>
                            </v-text-field>
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model.trim="email"
                                :rules="[isRequired('Vui lòng nhập Email'), isEmail()]"
                                autocomplete="nope"
                                clear-icon="mdi-close-circle"
                                clearable
                                color="primary"
                                dense
                                name="username"
                                outlined
                            >
                                <template #label>
                                    <RequiredLabel name="Email" />
                                </template>
                            </v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model.trim="phone"
                                :rules="[isRequired('Vui lòng nhập Số điện thoại'), isPhone()]"
                                clear-icon="mdi-close-circle"
                                clearable
                                color="primary"
                                dense
                                outlined
                                type="number"
                            >
                                <template #label>
                                    <RequiredLabel name="Số điện thoại" />
                                </template>
                            </v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model.trim="position"
                                :rules="[isRequired('Vui lòng nhập Chức vụ'), $over255]"
                                clear-icon="mdi-close-circle"
                                clearable
                                color="primary"
                                dense
                                outlined
                            >
                                <template #label>
                                    <RequiredLabel name="Chức vụ" />
                                </template>
                            </v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-autocomplete
                                v-model="groupIds"
                                :items="groupList"
                                clear-icon="mdi-close-circle"
                                clearable
                                color="primary"
                                dense
                                item-text="groupName"
                                item-value="id"
                                label="Nhóm người dùng"
                                multiple
                                no-data-text="Không có dữ liệu"
                                outlined
                            >
                            </v-autocomplete>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-select
                                v-model.trim="status"
                                :items="statusList"
                                :rules="[isRequired('Vui lòng chọn Trạng thái')]"
                                clear-icon="mdi-close-circle"
                                clearable
                                color="primary"
                                dense
                                no-data-text="Không có dữ liệu"
                                outlined
                            >
                                <template #label>
                                    <RequiredLabel name="Trạng thái" />
                                </template>
                            </v-select>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </v-form>
    </BaseModal>
</template>

<style scoped></style>
