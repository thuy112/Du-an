<template>
    <p
        class="text-h6 black--text pl-2 mb-4 mt-2"
        :style="{
            'border-left': '5px solid',
            'border-left-color': $vuetify.theme.themes.light.primary,
        }"
    >
        {{ title }}
    </p>
</template>
<script>
export default {
    name: "BaseTitle",
    props: {
        title: {
            type: String,
            default: () => "",
        },
    },
};
</script>
