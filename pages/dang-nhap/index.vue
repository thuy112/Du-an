<script>
import Cookies from "js-cookie";
import AuthServices from "~/services/authServices";

export default {
    name: "Index",
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
            const valid = this.$refs.formRef.validate();
            if (!valid) return;
            try {
                this.isLoading = true;
                const res = await AuthServices.login({
                    username: this.username,
                    password: this.password,
                });

                if (res.success) {
                    this.$showSuccess("Đăng nhập thành công");
                    Cookies.set("token", res.data.token, { expires: 30 });
                    this.$router.push("/");
                }
            } catch (e) {
                console.error(e);
            }
            this.isLoading = false;
        },
    },
};
</script>

<template>
    <v-sheet class="h-fullscreen Auth">
        <v-row justify="center" align="center" class="h-100">
            <v-col cols="12" sm="8" md="6" lg="4" xl="3">
                <v-card elevation="0" rounded="lg" class="pa-4">
                    <v-card-title>
                        <v-img src="/logos/logobkhn12.png" height="80" contain />
                    </v-card-title>
                    <v-card-text>
                        <v-form ref="formRef" @submit.prevent="handleSubmit">
                            <v-divider class="mb-3" />
                            <v-row>
                                <v-col cols="12" sm="12" md="12" lg="12" class="pa-1">
                                    <div class="mb-2 fw-600 fs-16">
                                        Tài khoản <span class="red--text">(*)</span>
                                    </div>
                                    <v-text-field
                                        v-model="username"
                                        clearable
                                        class="rounded-lg"
                                        color="primary"
                                        outlined
                                        clear-icon="mdi-close-circle"
                                        :rules="[(v) => !!v || 'Vui lòng nhập tài khoản']"
                                    ></v-text-field>
                                </v-col>

                                <v-col cols="12" sm="12" md="12" lg="12" class="pa-1">
                                    <div class="mb-2 fw-600 fs-16">
                                        Mật khẩu <span class="red--text">(*)</span>
                                    </div>
                                    <v-text-field
                                        v-model="password"
                                        color="primary"
                                        class="rounded-lg"
                                        :type="showPassword ? 'text' : 'password'"
                                        outlined
                                        height="40"
                                        clearable
                                        clear-icon="mdi-close-circle"
                                        append-icon="mdi-eye"
                                        :rules="[(v) => !!v || 'Vui lòng nhập mật khẩu']"
                                        @click:append="showPassword = !showPassword"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="12" md="12" lg="12" class="pa-1 py-0 pb-2">
                                    <div
                                        class="text-right pointer primary--text fw-500"
                                        @click="$router.push('/quen-mat-khau')"
                                    >
                                        Quên mật khẩu?
                                    </div>
                                </v-col>
                                <v-col cols="12" sm="12" md="12" lg="12" class="pa-1">
                                    <v-btn
                                        color="primary"
                                        class="rounded-lg fs-14"
                                        height="50"
                                        elevation="0"
                                        block
                                        type="submit"
                                        :loading="isLoading"
                                        >Đăng nhập
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

<style lang="scss">
.Auth {
    background: radial-gradient(#d2f1df, #d3d7fa, #bad8f4) 0 0/400%;
}
</style>
