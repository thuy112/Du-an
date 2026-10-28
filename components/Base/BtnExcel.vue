<script>
export default {
    name: "BaseBtnExel",
    props: {
        disabled: {
            type: Boolean,
            default: false,
        },
        text: {
            type: String,
            default: "Xuất file",
        },
        color: {
            type: String,
            default: "green",
        },
        loading: {
            type: Boolean,
            default: false,
        },
        icon: {
            type: String,
            default: "mdi-microsoft-excel",
        },
    },
};
</script>

<template>
    <v-btn
        :color="color"
        :disabled="disabled"
        :loading="loading"
        class="white--text text-uppercase mt-5"
        elevation="0"
        small
        @click="$emit('click')"
    >
        <v-icon left small>{{ icon }}</v-icon>
        {{ text }}
    </v-btn>
</template>

<style scoped></style>
