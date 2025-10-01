import { effect, untracked, Injector } from '@angular/core';

export function bindMixedRefiner<T>(
    injector: Injector,
    opts: {
        isMixed: () => boolean;
        isRefining: () => boolean;
        ensureRefinedIfMixed: () => Promise<void>;
    }
) {
    effect(() => {
        const mixed = opts.isMixed();
        const refining = untracked(() => opts.isRefining());
        if (mixed && !refining) {
            queueMicrotask(() => {
                if (opts.isMixed() && !opts.isRefining()) {
                    void opts.ensureRefinedIfMixed();
                }
            });
        }
    }, { injector });
}