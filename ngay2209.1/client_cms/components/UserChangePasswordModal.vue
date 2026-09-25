<template>
  <v-dialog v-model="isOpen" max-width="500px" persistent>
    <v-card class="rounded-lg dialog-card">
      <v-card-title class="dialog-header py-3 px-4 d-flex justify-space-between align-center">
        <span class="text-subtitle-1 font-weight-medium white--text">
          Đổi mật khẩu tài khoản
        </span>
        <v-btn icon dark small @click="isOpen = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-5">
        <v-form ref="changePassForm" v-model="valid">
          <v-text-field
            v-model="passForm.oldPassword"
            :type="showOldPass ? 'text' : 'password'"
            label="Mật khẩu cũ (*)"
            outlined
            dense
            hide-details="auto"
            class="dialog-input red-label-input mb-4"
            :rules="[requiredRule]"
            :append-icon="showOldPass ? 'mdi-eye' : 'mdi-eye-outline'"
            @click:append="showOldPass = !showOldPass"
          ></v-text-field>

          <v-text-field
            v-model="passForm.newPassword"
            :type="showNewPass ? 'text' : 'password'"
            label="Mật khẩu mới (*)"
            outlined
            dense
            hide-details="auto"
            class="dialog-input red-label-input mb-4"
            :rules="[requiredRule]"
            :append-icon="showNewPass ? 'mdi-eye' : 'mdi-eye-outline'"
            @click:append="showNewPass = !showNewPass"
          ></v-text-field>

          <v-text-field
            v-model="passForm.confirmPassword"
            :type="showConfirmPass ? 'text' : 'password'"
            label="Nhập lại mật khẩu mới (*)"
            outlined
            dense
            hide-details="auto"
            class="dialog-input red-label-input"
            :rules="[requiredRule, confirmPasswordRule]"
            :append-icon="showConfirmPass ? 'mdi-eye' : 'mdi-eye-outline'"
            @click:append="showConfirmPass = !showConfirmPass"
          ></v-text-field>
        </v-form>
      </v-card-text>

      <v-card-actions class="px-5 pb-5 pt-0 d-flex justify-end">
        <v-btn outlined class="btn-modal-close text-capitalize px-4 mr-2" @click="isOpen = false">
          Đóng <v-icon small class="ml-1">mdi-close</v-icon>
        </v-btn>
        <v-btn color="#a2212b" dark elevation="0" class="btn-modal-save text-capitalize px-4" @click="submitChangePassword">
          Lưu <v-icon small class="ml-1">mdi-content-save</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'UserChangePasswordModal',
  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      valid: true,
      showOldPass: false,
      showNewPass: false,
      showConfirmPass: false,
      passForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      },
    }
  },
  computed: {
    isOpen: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      },
    },
    requiredRule() {
      return value => !!value || 'Vui lòng nhập mật khẩu'
    },
    confirmPasswordRule() {
      return value => value === this.passForm.newPassword || 'Mật khẩu nhập lại không khớp'
    },
  },
  watch: {
    value(value) {
      if (value) this.resetForm()
    },
  },
  methods: {
    resetForm() {
      this.passForm = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      }
      this.showOldPass = false
      this.showNewPass = false
      this.showConfirmPass = false
      this.$nextTick(() => {
        if (this.$refs.changePassForm) this.$refs.changePassForm.resetValidation()
      })
    },
    submitChangePassword() {
      if (!this.$refs.changePassForm.validate()) return
      this.isOpen = false
    },
  },
}
</script>

<style scoped>
.dialog-header {
  background-color: #a2212b !important;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.dialog-input >>> fieldset {
  display: none !important;
}

.dialog-input >>> .v-input__slot {
  min-height: 42px !important;
  border-radius: 4px !important;
  border: 1px solid #b0b0b0 !important;
  background-color: #ffffff !important;
  box-shadow: none !important;
}

.dialog-input >>> .v-label {
  top: -6px !important;
  font-size: 0.82rem !important;
  background-color: #ffffff !important;
  padding: 0 4px !important;
  z-index: 2;
}

.red-label-input >>> .v-label {
  color: #d32f2f !important;
}

.btn-modal-close {
  border: 1px solid #b0b0b0 !important;
  border-radius: 4px !important;
  height: 36px !important;
  color: #333333 !important;
}

.btn-modal-save {
  border-radius: 4px !important;
  height: 36px !important;
  background-color: #a2212b !important;
}
</style>
