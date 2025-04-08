<template>
  <div>
    <svg
      v-if="icon === 'indent'"
      class="icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 5H21M3 19H21M11 12H21M3 9V15L7 12L3 9Z"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>

    <svg
      v-else-if="icon === 'outdent'"
      class="icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 5H21M3 19H21M11 12H21M7 9V15L3 12L7 9Z"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </div>
</template>

<script>
export default {
  name: 'IndentIcon',
  props: {
    icon: {
      type: String,
      required: true,
    },
  },
};
</script> 