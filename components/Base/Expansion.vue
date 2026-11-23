<template>
    <div>
        <v-expansion-panels flat>
            <v-expansion-panel :disabled="disable">
                <v-expansion-panel-header :hide-actions="disable">
                    <slot name="header">
                        <BaseDetailItem :title="title" :value="value" />
                    </slot>
                </v-expansion-panel-header>
                <v-expansion-panel-content v-if="!disable">
                    <slot name="content"></slot>
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>
    </div>
</template>

<script>
export default {
    name: "BaseExpansion",
    props: {
        title: {
            type: String,
            default: () => "",
        },
        value: {
            type: String,
            default: () => "",
        },
        disable: {
            type: Boolean,
            default: false,
        },
    },
};
</script>

<style scoped></style>
