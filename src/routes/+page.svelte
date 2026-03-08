<script>
    let scrollY;
</script>

<svelte:window bind:scrollY />

<div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <!-- Navigation -->
    <nav class="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                sworn.work
            </div>
            <div class="flex gap-4">
                <a href="/login" class="px-4 py-2 text-slate-300 hover:text-white transition">Login</a>
                <a href="/signup" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
                    Get Started
                </a>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="text-center space-y-6">
            <h1 class="text-5xl sm:text-6xl font-bold text-white leading-tight">
                Fair Work, Local First
            </h1>
            <p class="text-xl text-slate-300 max-w-2xl mx-auto">
                Connect with trusted workers and posters in your community. No race to the bottom. Fair wages. Real connections.
            </p>
            <div class="flex gap-4 justify-center pt-4">
                <a href="/signup" class="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition">
                    Post a Task
                </a>
                <a href="/signup" class="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition">
                    Find Work
                </a>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 class="text-3xl font-bold text-white mb-12 text-center">Why sworn.work?</h2>
        <div class="grid md:grid-cols-3 gap-8">
            <div class="bg-slate-800/50 border border-slate-700 rounded-lg
p-8 hover:border-blue-400 transition">
                <div class="text-4xl mb-4">🏘️</div>
                <h3 class="text-xl font-bold text-white mb-2">Local First</h3>
                <p class="text-slate-400">Find workers and tasks in your neighborhood. Supporting your local community.</p>
            </div>

            <div class="bg-slate-800/50 border border-slate-700 rounded-lg p-8 hover:border-blue-400 transition">
                <div class="text-4xl mb-4">⭐</div>
                <h3 class="text-xl font-bold text-white mb-2">Verified & Rated</h3>
                <p class="text-slate-400">Real reviews from real people. Build your reputation. Hire with confidence.</p>
            </div>

            <div class="bg-slate-800/50 border border-slate-700 rounded-lg p-8 hover:border-blue-400 transition">
                <div class="text-4xl mb-4">💰</div>
                <h3 class="text-xl font-bold text-white mb-2">Fair Wages</h3>
                <p class="text-slate-400">No undercutting. Fair rate recommendations. Workers deserve respect.</p>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-slate-700 mt-20 py-12 bg-slate-900/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400">
            <p>&copy; 2026 sworn.work. Supporting local work, fairly.</p>
        </div>
    </footer>
</div>

<style>
    :global(body) {
        background: #0f172a;
    }
</style>