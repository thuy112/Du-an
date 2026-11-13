<script>
import RequiredLabel from "~/components/Base/RequiredLabel.vue";
import { genderList, statusList } from "~/consts/list";
import { isEmail, isPhone, isRequired } from "~/utils/rules";
import userServices from "~/services/userServices";

export default {
    name: "UserAdd",
    components: { RequiredLabel },
    props: {
        open: {
            type: Boolean,
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
        password: null,
        phone: null,
        position: null,
        status: "ACTIVE",
        groupIds: [],
    }),
    watch: {
        open(val) {
            if (!val) {
                // Reset dữ liệu về giá trị rỗng/mặc định ban đầu
                this.avatar = null;
                this.email = "";
                this.fullName = "";
                this.password = "";
                this.phone = "";
                this.position = "";
                this.status = "ACTIVE";
                this.groupIds = [];

                // Xóa thông báo lỗi validate an toàn
                this.$nextTick(() => {
                    this.$refs.form?.resetValidation();
                });
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
                    avatar: this.avatar,
                    email: this.email,
                    fullName: this.fullName,
                    password: this.password,
                    phone: this.phone,
                    position: this.position,
                    status: this.status,
                    groupIds: this.groupIds,
                };
                const res = await userServices.add(data);
                if (res.success) {
                    this.$emit("toggle");
                    this.$emit("success");
                    this.$showSuccess("Thêm người dùng thành công");
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
        title="Thêm người dùng"
        :open="open"
        :loading="isLoading"
        max-width="1000"
        @toggle="$emit('toggle')"
        @OK="handleSubmit"
    >
        <v-form ref="form" lazy-validation @submit.prevent>
            <v-row class="ma-0 mt-3">
                <v-col cols="12" md="4" class="d-flex align-center justify-center">
                    <BaseUploadAvatar
                        :avatar-url="avatar"
                        @setAvatar="avatar = $event"
                        @clear="avatar = null"
                    />
                </v-col>
                <v-col cols="12" md="8">
                    <v-row dense>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model.trim="fullName"
                                outlined
                                dense
                                color="primary"
                                clear-icon="mdi-close-circle"
                                clearable
                                :rules="[isRequired('Vui lòng nhập Họ & tên')]"
                            >
                                <template #label>
                                    <RequiredLabel name="Họ & tên" />
                                </template>
                            </v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model.trim="password"
                                color="primary"
                                outlined
                                dense
                                autocomplete="new-password"
                                clear-icon="mdi-close-circle"
                                clearable
                                :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                                :type="showPassword ? 'text' : 'password'"
                                :rules="[isRequired('Vui lòng nhập Mật khẩu')]"
                                @click:append="showPassword = !showPassword"
                            >
                                <template #label>
                                    <RequiredLabel name="Mật khẩu" />
                                </template>
                            </v-text-field>
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model.trim="email"
                                outlined
                                dense
                                name="username"
                                autocomplete="nope"
                                color="primary"
                                clear-icon="mdi-close-circle"
                                clearable
                                :rules="[isRequired('Vui lòng nhập Email'), isEmail()]"
                            >
                                <template #label>
                                    <RequiredLabel name="Email" />
                                </template>
                            </v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model.trim="phone"
                                outlined
                                dense
                                color="primary"
                                type="number"
                                clear-icon="mdi-close-circle"
                                clearable
                                :rules="[isRequired('Vui lòng nhập Số điện thoại'), isPhone()]"
                            >
                                <template #label>
                                    <RequiredLabel name="Số điện thoại" />
                                </template>
                            </v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model.trim="position"
                                outlined
                                dense
                                color="primary"
                                clear-icon="mdi-close-circle"
                                clearable
                                :rules="[isRequired('Vui lòng nhập Chức vụ'), $over255]"
                            >
                                <template #label>
                                    <RequiredLabel name="Chức vụ" />
                                </template>
                            </v-text-field>
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-select
                                v-model.trim="status"
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
                            <v-autocomplete
                                v-model="groupIds"
                                outlined
                                dense
                                no-data-text="Không có dữ liệu"
                                color="primary"
                                :items="groupList"
                                item-text="groupName"
                                item-value="id"
                                clear-icon="mdi-close-circle"
                                clearable
                                multiple
                                label="Nhóm người dùng"
                            >
                            </v-autocomplete>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </v-form>
    </BaseModal>
</template>

<style scoped></style>
