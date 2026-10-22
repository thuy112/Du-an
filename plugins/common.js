// Import the CSS or use your own!
import "vue-toastification/dist/index.css"
import Vue from "vue"
import Toast, { POSITION } from "vue-toastification"

Vue.use(Toast, {
  // Setting the global default position
  position: POSITION.TOP_RIGHT,
  timeout: 4000
})

Vue.directive("limit", {
  inserted(el, binding) {
    const computed = window.getComputedStyle(el)
    const resizeObserver = new ResizeObserver((entries) => {
      const pt = computed.getPropertyValue("padding-top").replace("px", "")
      const pb = computed.getPropertyValue("padding-bottom").replace("px", "")
      const lineHeight = computed.getPropertyValue("line-height").replace("px", "")
      const height = entries[0].target.clientHeight

      const isOverFlow = Math.floor((height - pb - pt) / lineHeight) > binding.value

      // Thêm biến cờ để kiểm tra xem nút đã được thêm hay chưa
      let buttonsAdded = false

      if (isOverFlow && !buttonsAdded) {
        const readMoreBtn = document.createElement("span")
        readMoreBtn.textContent = "Xem thêm"
        readMoreBtn.classList.add("pointer", "text-decoration-underline", "primary--text")
        const className = `limit-text-${binding.value}`
        const hiddenBtn = document.createElement("span")
        hiddenBtn.textContent = "Ẩn bớt"
        hiddenBtn.classList.add("pointer", "text-decoration-underline", "primary--text")

        // Thay đổi trạng thái biến cờ
        buttonsAdded = true

        // Event delegation
        el.parentElement.addEventListener("click", function(event) {
          if (event.target === readMoreBtn) {
            resizeObserver.disconnect()
            el.classList.remove(className)
            el.parentElement.removeChild(readMoreBtn)
            el.parentElement.appendChild(hiddenBtn)
          } else if (event.target === hiddenBtn) {
            resizeObserver.disconnect()
            el.classList.add(className)
            el.parentElement.removeChild(hiddenBtn)
            el.parentElement.appendChild(readMoreBtn)
          }
        })

        el.classList.add(className)
        el.parentElement.appendChild(readMoreBtn)
      }
    })

    resizeObserver.observe(el)
  }
})

export default (context, inject) => {
  const { store } = context;

  inject("showSuccess", (message, options) => {
    if (!message) return
    return Vue.$toast.success(message, options)
  })

  inject("showWarning", (message, options) => {
    if (!message) return
    return Vue.$toast.warning(message, options)
  })

  inject("showError", (message, options) => {
    if (!message) return
    return Vue.$toast.error(message, options)
  })

  inject("hasPermission", (roleId) => {
    const roles = store.getters["auth/roles"] || "";
    const roleList = roles.split(",").map((id) => id.trim());
    return roleList.includes(roleId.toString());
  });
};
