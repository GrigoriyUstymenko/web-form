<script>
  export const prerender = true;
  import { Circle } from 'svelte-loading-spinners';
  import Modal from '$lib/Modal.svelte';
  let form;
  let modal;
  const spinnerColor = '#4d4d4d';

  let buttonDisabled = false;
  let showingSpinner = false;

  const EMAIL_REGEX = '[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$';

  const resetForm = () => {
    showingSpinner = false;
    buttonDisabled = false;
    modal.hide();
  };

  async function sendData() {
    showingSpinner = true;
    buttonDisabled = true;

    const data = {
      name: form.elements.userName.value,
      email: form.elements.userEmail.value,
      message: form.elements.messageText.value,
    };

    try {
      console.log(data);
      const response = await fetch('/api/sendMail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const res = await response.text();
        throw new Error(res);
      }
      modal.show();
    } catch (err) {
      modal.show(err);
    }
  }
</script>

<svelte:head>
  <title>Web form</title>
</svelte:head>

<section>
  <h1>Mail sender</h1>
  <form
    class="mail-form"
    id="mail-form"
    bind:this={form}
    on:submit|preventDefault={sendData}
  >
    <input
      class="mail-form-content mail-form-input"
      type="text"
      name="userName"
      placeholder="Enter your name"
      required
    />
    <input
      class="mail-form-content mail-form-input"
      type="text"
      pattern={EMAIL_REGEX}
      name="userEmail"
      placeholder="Enter your email"
      required
    />
    <textarea
      class="mail-form-content mail-form-textarea"
      name="messageText"
      placeholder="Enter your message"
      required
    />
    <button
      class="mail-form-content mail-form-button"
      name="submitButton"
      disabled={buttonDisabled}>Submit</button
    >
    {#if showingSpinner}
      <Circle color={spinnerColor} />
    {/if}
  </form>
  <Modal bind:this={modal}>
    <button class="modal-button" on:click={resetForm}>OK</button>
  </Modal>
</section>

<style>
  section {
    width: 100%;
    height: 100%;
    display: grid;
    background-color: var(--primary-color);
    justify-content: center;
    align-items: center;
  }

  h1 {
    font-size: 1.7rem;
    text-align: center;
    margin: var(--form-title-margin);
  }

  .mail-form {
    min-width: 50vw;
    min-height: 50vh;
    border: var(--border-width) inset var(--border-color);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 1;
    padding: var(--form-padding);
  }

  .mail-form-input {
    height: var(--from-input-height);
  }

  .mail-form-textarea {
    height: var(--form-textarea-height);
  }

  .mail-form-button {
    min-width: var(--form-button-width);
    max-width: 10%;
  }

  .mail-form-content {
    width: 80%;
    margin: 1rem;
    resize: vertical;
    font-size: 1.25rem;
  }

  .modal-button {
    min-width: var(--form-button-width);
    max-width: 5%;
  }
</style>
