<script>
  let shown = false;
  let message;
  let success;

  export const hide = () => {
    shown = false;
  };

  export const show = err => {
    shown = true;
    if (err) {
      success = 'failed';
      message = `${err.message}`;
      return;
    }
    success = 'successful';
    message = 'Your message was successfully sent';
  };
</script>

{#if shown}
  <div class="modal-wrapper">
    <div class="modal">
      <p class={`message-${success}`}>{message}</p>
      <slot />
    </div>
  </div>
{/if}

<style>
  .modal-wrapper {
    position: fixed;
    background-color: rgba(0, 0, 0, 0.6);
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
  }
  .modal {
    text-align: center;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--modal-border-color);
    opacity: 1;
    align-items: center;
    align-content: center;
    background-color: var(--pure-white);
    z-index: 10000;
    min-width: 20vw;
    max-width: 40vw;
    padding: 1rem;
    margin: 15% auto;
  }

  .modal > p {
    font-weight: bold;
  }

  .message-successful {
    color: var(--message-suc-color);
  }

  .message-failed {
    color: var(--message-err-color);
  }
</style>
