<template>
    <div
        class="page-shell fill-height d-flex flex-column align-center justify-center text-center py-12"
    >
        <!-- Hình ảnh Banner WELCOME -->
        <div class="welcome-banner mb-6">
            <img src="/img/banner.jpg" alt="Welcome Banner" />
        </div>

        <!-- Dòng tiêu đề giới thiệu hệ thống -->
        <h2 class="system-title">
            Hệ thống quản trị học lại, thi lại, bảo vệ lại
        </h2>
    </div>
</template>

<script>
export default {
    name: "IndexPage",
    middleware: "authenticated",
    data() {
        return {
            snackbar: {
                show: false,
                text: "Đăng nhập thành công",
            },
        };
    },
    mounted() {
        if (localStorage.getItem("login_success") === "true") {
            this.snackbar.show = true;
            localStorage.removeItem("login_success");
        }
    },
};
</script>

<style scoped>
.page-shell {
    width: 100%;
    min-height: calc(100vh - 64px);
    background: #fff;
}

.welcome-banner {
    display: inline-block;
    margin-top: 10px;
}

.welcome-banner img {
    display: block;
    max-width: 100%;
    height: auto;
    max-height: 220px;
    object-fit: contain;
    mix-blend-mode: multiply;
}

.system-title {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 26px !important;
    font-weight: 700;
    color: #a2212b !important;
    letter-spacing: 0.2px;
}
</style>