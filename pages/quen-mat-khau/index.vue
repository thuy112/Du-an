<script>
import Cookies from "js-cookie"
import AuthServices from "~/services/authServices"
import { isEmail, isRequired } from "~/utils/rules"

export default {
    name: "Index",
    layout: "blank",
    data: () => ({
        showPassword: false,
        username: "",
        password: "",
        email: "",
        isLoading: false,
        transId: null,
    }),
    created() {
        if (Cookies.get("token")) {
            this.$router.push("/")
        }
    },
    methods: {
        isEmail,
        isRequired,
        async handleSubmit() {
            const valid = this.$refs.formRef.validate()
            if (!valid) return
            try {
                this.isLoading = true
                const res = await AuthServices.getCode({
                    username: this.email,
                })
                if (res.success) {
                    // this.$showSuccess("Đăng nhập thành công")
                    // Cookies.set("token", res.data.token)
                    console.log({ res })
                    // Cookies.set("user_name", res.data.user_info.user_name)
                    this.$router.push(
                        `/confirm-password?transId=${res.data.transId}&email=${this.email}`
                    )
                }
            } catch (e) {
                console.error(e)
            }
            this.isLoading = false
        },
    },
}
</script>

<template>
    <v-sheet class="h-fullscreen Auth">
        <v-row justify="center" align="center" class="h-100">
            <v-col cols="12" sm="8" md="6" lg="4" xl="3">
                <v-card elevation="0" rounded="lg" class="pa-4">
                    <v-card-title>
                        <v-img src="/logos/logobkhn12.png" height="70" contain />
                    </v-card-title>
                    <v-card-text>
                        <v-form ref="formRef" @submit.prevent="handleSubmit">
                            <!--                            <v-divider class="mb-3" />-->
                            <div class="text-center mb-3">
                                <div class="text-h5 black--text">Lấy lại mật khẩu</div>
                                <div>Nhập Email đăng ký để chúng tôi giúp bạn lấy lại mật khẩu</div>
                            </div>
                            <v-divider class="my-3" />
                            <v-row>
                                <v-col cols="12" sm="12" md="12" lg="12" class="pa-1">
                                    <div class="mb-1 fw-600 fs-16">
                                        Email <span class="red--text">(*)</span>
                                    </div>
                                    <v-text-field
                                        v-model="email"
                                        color="primary"
                                        class="rounded-lg"
                                        outlined
                                        height="30"
                                        clearable
                                        clear-icon="mdi-close-circle"
                                        :rules="[isRequired('Vui lòng nhập Email'), isEmail()]"
                                    ></v-text-field>
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
                                        >Gửi mã
                                    </v-btn>
                                </v-col>
                                <v-col cols="12" sm="12" md="12" lg="12" class="pa-1 mt-4">
                                    <v-btn
                                        color="primary lighten-5"
                                        class="rounded-lg fs-14"
                                        height="50"
                                        elevation="0"
                                        block
                                        to="/dang-nhap"
                                    >
                                        Quay lại đăng nhập
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
