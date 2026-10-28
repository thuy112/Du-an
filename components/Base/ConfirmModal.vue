<script>
export default {
    name: "BaseConfirmModal",
    props: {
        open: {
            type: Boolean,
            required: true,
        },
        title: {
            type: String,
            default: "Xác nhận",
        },
        content: {
            type: String,
            default: "",
        },
        loading: {
            type: Boolean,
            default: false,
        },
        color: {
            type: String,
            default: "primary",
        },
        textBtn: {
            type: String,
            default: "Xác nhận",
        },
        maxWidth: {
            type: [String, Number],
            default: "550px",
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
};
</script>

<template>
    <v-dialog :value="open" scrollable :max-width="maxWidth" persistent>
        <v-card rounded="lg">
            <v-card-title
                :class="`${color}`"
                class="d-flex align-center justify-space-between white--text"
            >
                <div>
                    <slot name="title">
                        {{ title }}
                    </slot>
                </div>
                <v-icon color="white" @click="$emit('toggle')">mdi-close</v-icon>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="pt-2 fs-15">
                <slot name="content">
                    {{ content }}
                </slot>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer />
                <v-btn :color="color" text @click="$emit('toggle')">
                    Đóng
                    <v-icon right>mdi-close</v-icon>
                </v-btn>
                <v-btn :color="color" class="rounded-lg" :loading="loading" :disabled="disabled" @click="$emit('OK')">
                    <span :class="color ? 'white--text' : ''"> {{ textBtn }}</span>
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<style scoped></style>
