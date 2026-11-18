<script>
import uploadServices from "~/services/uploadServices";

export default {
    name: "UploadAvatar",
    props: {
        size: {
            type: [Number, String],
            default: 120,
        },
        avatarUrl: {
            type: [String, null],
            required: true,
        },
    },
    data() {
        return {
            avatar: "",
            file: null,
            inputRef: null,
        };
    },
    methods: {
        handleClick() {
            this.$refs.inputRef.$refs.input.click();
        },
        async handleUpload() {
            if (!this.file) {
                return;
            }
            const formData = new FormData();
            formData.append("file", this.file);
            try {
                const res = await uploadServices.upload(formData);
                this.$emit("setAvatar", res.data.url);
                this.file = null;
            } catch (e) {
                console.error(e);
            }
        },
    },
};
</script>

<template>
    <div
        class="d-flex align-center justify-center rounded-lg mb-2"
        style="min-width: 100%; height: 100%; background: #ffe9eb"
    >
        <v-hover v-if="avatarUrl" v-slot="{ hover }" class="w-100 h-100">
            <div class="relative pointer h-100" @click.stop="handleClick">
                <!--                    height="100%"-->
                <v-img contain class="relative h-100 d-block rounded-xl" :src="avatarUrl">
                    <v-expand-transition>
                        <v-overlay absolute :value="hover" z-index="0">
                            <div class="d-flex align-center justify-center h-100">
                                <v-icon v-if="hover" size="50">mdi-camera</v-icon>
                            </div>
                        </v-overlay>
                    </v-expand-transition>
                </v-img>
                <v-icon
                    class="absolute"
                    style="top: -10px; right: -10px"
                    color="red"
                    @click="$emit('clear')"
                    >mdi-close-circle
                </v-icon>
            </div>
        </v-hover>
        <div
            v-else
            class="d-flex flex-column align-center justify-center pointer py-5"
            @click="handleClick"
        >
            <v-img :width="40" contain src="/images/camera.png" />
            <div class="mt-3 fw-600">Tải ảnh lên</div>
        </div>
        <v-file-input
            ref="inputRef"
            v-model="file"
            class="d-none"
            accept="image/*"
            label="File input"
            @change="handleUpload"
        ></v-file-input>
    </div>
</template>

<style scoped></style>
