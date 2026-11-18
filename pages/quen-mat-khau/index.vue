<script>
import Cookies from "js-cookie";
import AuthServices from "~/services/authServices";
import { isEmail, isRequired } from "~/utils/rules";

export default {
    name: "ForgotPasswordPage",
    layout: "blank",
    data: () => ({
        email: "",
        isLoading: false,
    }),
    created() {
        if (Cookies.get("token")) {
            this.$router.push("/");
        }
    },
    methods: {
        isEmail,
        isRequired,
        async handleSubmit() {
            const valid = this.$refs.formRef?.validate();
            if (!valid) return;
            try {
                this.isLoading = true;
                const res = await AuthServices.getCode({
                    username: this.email,
                });
                if (res && res.success) {
                    this.$showSuccess("Mã xác nhận đã được gửi tới email của bạn");
                    this.$router.push(
                        `/confirm-password?transId=${res.data?.transId || ""}&email=${this.email}`
                    );
                }
            } catch (e) {
                console.error("Lỗi gửi mã:", e);
            } finally {
                this.isLoading = false;
            }
        },
    },
};
</script>

<template>
    <v-sheet class="Auth-container d-flex align-center justify-center">
        <v-row justify="center" align="center" class="ma-0 w-100">
            <v-col cols="12" sm="8" md="5" lg="4" xl="3">
                <v-card elevation="2" rounded="lg" class="pa-6">
                    <v-card-title class="justify-center pb-2">
                        <v-img src="/logos/logobkhn12.png" height="75" contain />
                    </v-card-title>
                    <v-card-text class="pt-1">
                        <v-form ref="formRef" @submit.prevent="handleSubmit">
                            <div class="text-center mb-4">
                                <div class="text-h5 font-weight-medium black--text mb-1">
                                    Lấy lại mật khẩu
                                </div>
                                <div class="grey--text text--darken-1 fs-14">
                                    Nhập Email đăng ký để chúng tôi giúp bạn lấy lại mật khẩu
                                </div>
                            </div>

                            <v-row dense>
                                <v-col cols="12" class="mb-3">
                                    <div class="mb-2 fw-600 fs-15 black--text">
                                        Email <span class="red--text">(*)</span>
                                    </div>
                                    <v-text-field
                                        v-model.trim="email"
                                        color="primary"
                                        class="rounded-lg"
                                        outlined
                                        dense
                                        height="44"
                                        clearable
                                        clear-icon="mdi-close-circle"
                                        :rules="[isRequired('Vui lòng nhập Email'), isEmail()]"
                                    ></v-text-field>
                                </v-col>

                                <v-col cols="12" class="mb-3">
                                    <v-btn
                                        color="primary"
                                        class="rounded-lg fs-15 text-none font-weight-medium"
                                        height="46"
                                        elevation="0"
                                        block
                                        type="submit"
                                        :loading="isLoading"
                                    >
                                        Gửi Mã
                                    </v-btn>
                                </v-col>

                                <v-col cols="12">
                                    <v-btn
                                        color="#f8b4b4"
                                        class="rounded-lg fs-15 text-none font-weight-medium white--text"
                                        height="46"
                                        elevation="0"
                                        block
                                        to="/dang-nhap"
                                    >
                                        Quay Lại Đăng Nhập
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-sheet>
</template>

<style lang="scss" scoped>
.Auth-container {
    min-height: 100vh;
    width: 100vw;
    background: radial-gradient(#d2f1df, #d3d7fa, #bad8f4) 0 0/400%;
}
.w-100 {
    width: 100%;
}
</style>