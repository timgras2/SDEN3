<script>
  import { onMount } from "svelte";
  let Dashboard;

  onMount(async () => {
    const mod = await import("./pages/Dashboard.svelte");
    Dashboard = mod.default;
  });
</script>

<div class="min-h-screen bg-slate-50 text-slate-900">
  <header class="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
      <h1 class="text-lg font-semibold tracking-tight">Product Console</h1>
      <button class="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
        New Report
      </button>
    </div>
  </header>

  <main class="mx-auto max-w-6xl px-4 py-8">
    {#if Dashboard}
      <svelte:component this={Dashboard} />
    {:else}
      <div class="text-slate-500">Loading dashboard...</div>
    {/if}
  </main>
</div>
