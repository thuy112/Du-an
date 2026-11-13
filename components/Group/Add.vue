<script>
import Cookies from "js-cookie"
import groupServices from "~/services/groupServices"

export default {
  name: "GroupAdd",
  props: {
    open: {
      type: Boolean,
      required: true
    }
  },
  data: () => ({
    name: "",
    description: "",
    isLoading: false
  }),
  watch: {
    open(val) {
      if (!val) {
        this.$refs.form.reset()
      }
    }
  },
  methods: {
    async handleSubmit() {
      const valid = this.$refs.form.validate()
      if (!valid) return
      try {
        this.isLoading = true
        const data = {
          groupName: this.name,
          description: this.description,
          status: 1,
          groupPage: "",
          create_by: Cookies.get("user_name")
        }
        const res = await groupServices.add(data)
        if (res.success) {
          this.$emit("toggle")
          this.$emit("success")
          this.$showSuccess("Thêm nhóm người dùng thành công")
        }
      } catch (e) {
        console.error(e)
      }
      this.isLoading = false
    }
  }
}
</script>

<template>
  <BaseModal
    title="Thêm mới"
    :open="open"
    :loading="isLoading"
    @toggle="$emit('toggle')"
    @OK="handleSubmit"
  >
    <v-form ref="form" lazy-validation @submit.prevent>
      <v-row class="ma-0 mt-3" no-gutters>
        <v-col cols="12">
          <v-text-field
            v-model="name"
            class="rounded-lg"
            label="Tên nhóm"
            outlined
            color="primary"
            clear-icon="mdi-close-circle"
            clearable
            :rules="[(v) => !!v || 'Vui lòng nhập tên nhóm']"
          >
            <template #label> Tên nhóm <span class="red--text">(*)</span></template>
          </v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field
            v-model="description"
            class="rounded-lg"
            color="primary"
            outlined
            clear-icon="mdi-close-circle"
            clearable
            :rules="[(v) => !!v || 'Vui lòng nhập mô tả']"
          >
            <template #label> Mô tả <span class="red--text">(*)</span></template>
          </v-text-field>
        </v-col>
      </v-row>
    </v-form>
  </BaseModal>
</template>

<style scoped></style>
