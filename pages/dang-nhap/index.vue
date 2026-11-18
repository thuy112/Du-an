<script>
import Cookies from "js-cookie";
import AuthServices from "~/services/authServices";

export default {
    name: "LoginPage",
    layout: "blank",
    data: () => ({
        showPassword: false,
        username: "",
        password: "",
        isLoading: false,
    }),
    created() {
        if (Cookies.get("token")) {
            this.$router.push("/");
        }
    },
    methods: {
        async handleSubmit() {
            const valid = this.$refs.formRef?.validate();
            if (!valid) return;
            try {
                this.isLoading = true;
                const res = await AuthServices.login({
                    username: this.username,
                    password: this.password,
                });

                if (res && res.success) {
                    const token = res.data?.token || res.token;
                    if (token) {
                        Cookies.set("token", token, { expires: 30 });
                    }
                    // Lưu thông tin user vào store nếu API login trả về kèm user
                    if (res.data?.user && this.$store?.commit) {
                        this.$store.commit("auth/SET_USER", res.data.user);
                    }
                    localStorage.setItem("login_success", "true");
                    this.$showSuccess("Đăng nhập thành công");
                    this.$router.push("/");
                }
            } catch (e) {
                console.error("Lỗi đăng nhập:", e);
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
                    <v-card-text class="pt-2">
                        <v-form ref="formRef" @submit.prevent="handleSubmit">
                            <v-row dense>
                                <v-col cols="12" class="mb-2">
                                    <div class="mb-2 fw-600 fs-15 black--text">
                                        Tài khoản <span class="red--text">(*)</span>
                                    </div>
                                    <v-text-field
                                        v-model.trim="username"
                                        clearable
                                        class="rounded-lg"
                                        color="primary"
                                        outlined
                                        dense
                                        height="44"
                                        clear-icon="mdi-close-circle"
                                        :rules="[(v) => !!v || 'Vui lòng nhập tài khoản']"
                                    ></v-text-field>
                                </v-col>

                                <v-col cols="12" class="mb-1">
                                    <div class="mb-2 fw-600 fs-15 black--text">
                                        Mật khẩu <span class="red--text">(*)</span>
                                    </div>
                                    <v-text-field
                                        v-model="password"
                                        color="primary"
                                        class="rounded-lg"
                                        :type="showPassword ? 'text' : 'password'"
                                        outlined
                                        dense
                                        height="44"
                                        clearable
                                        clear-icon="mdi-close-circle"
                                        :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                                        :rules="[(v) => !!v || 'Vui lòng nhập mật khẩu']"
                                        @click:append="showPassword = !showPassword"
                                    ></v-text-field>
                                </v-col>

                                <v-col cols="12" class="py-0 pb-4">
                                    <div
                                        class="text-right pointer primary--text fw-500 fs-14"
                                        @click="$router.push('/quen-mat-khau')"
                                    >
                                        Quên mật khẩu?
                                    </div>
                                </v-col>

                                <v-col cols="12">
                                    <v-btn
                                        color="primary"
                                        class="rounded-lg fs-15 text-none font-weight-medium"
                                        height="46"
                                        elevation="0"
                                        block
                                        type="submit"
                                        :loading="isLoading"
                                    >
                                        Đăng Nhập
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
.pointer {
    cursor: pointer;
}
</style>