<script>
    import { Button, Modal } from 'sveltestrap';
    export let open = false
    export let isDefault = true
</script>

<div>
    <Modal body header="Modal title" isOpen={open}>
        <div class="d-flex justify-content-center">
            {#if isDefault}<img src="https://cdn.dribbble.com/users/2973561/screenshots/5757826/loading__.gif"/>{/if}
            <slot></slot>
        </div>
    </Modal>
</div>