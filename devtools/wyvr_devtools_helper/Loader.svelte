<div class="wyvr_loader" />

<style>
    .wyvr_loader {
        text-align: center;
    }
    .wyvr_loader:after {
        display: inline-block;
        content: ' ';
        width: 24px;
        height: 24px;
        margin: 10px;
        border-radius: 50%;
        border: 3px solid transparent;
        border-left-color: var(--wyvr-debug-primary);
        border-right-color: var(--wyvr-debug-primary);
        animation: spin 1.2s linear infinite;
    }
    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>