<script>
export default {
    name: "BaseModal",
    props: {
        contentClass: {
            type: String,
            required: false,
            default: "",
        },
        open: {
            type: Boolean,
            required: true,
        },
        title: {
            type: String,
            required: true,
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
            default: "Lưu",
        },
        offBtn: {
            type: Boolean,
            default: false,
        },
        iconBtn: {
            type: String,
            default: "mdi-content-save-outline",
        },
        disabledBtn: {
            type: Boolean,
            default: false,
        },
        maxWidth: {
            type: [String, Number],
            default: "700px",
        },
    },
};
</script>

<template>
    <v-row justify="center">
        <v-dialog
            :value="open"
            scrollable
            :max-width="maxWidth"
            :content-class="contentClass"
            persistent
        >
            <v-card rounded="lg">
                <v-card-title
                    class="d-flex align-center justify-space-between"
                    :class="color ? `white--text ${color} ` : `black--text`"
                >
                    <div>
                        <slot name="title">
                            {{ title }}
                        </slot>
                    </div>
                    <v-icon
                        :color="color ? 'white' : 'black'"
                        :disabled="loading"
                        @click="$emit('toggle')"
                        >mdi-close
                    </v-icon>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                    <slot />
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                    <v-spacer />
                    <v-btn text class="rounded-lg" :disabled="loading" @click="$emit('toggle')">
                        Đóng
                        <v-icon right>mdi-close</v-icon>
                    </v-btn>
                    <v-btn
                        v-if="!offBtn"
                        color="primary"
                        class="rounded-lg"
                        :loading="loading"
                        :disabled="disabledBtn || loading"
                        @click="$emit('OK')"
                    >
                        {{ textBtn }}
                        <v-icon right>{{ iconBtn }}</v-icon>
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-row>
</template>

<style scoped></style>
