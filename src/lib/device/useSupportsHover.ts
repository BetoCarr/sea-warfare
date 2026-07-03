import { useEffect, useState } from "react";

export function useSupportsHover() {
    const [supportsHover, setSupportsHover] =
        useState(false);

    useEffect(() => {
        const media =
            window.matchMedia(
                '(hover: hover) and (pointer: fine)',
            );

        setSupportsHover(media.matches);

        const listener = (
            e: MediaQueryListEvent,
        ) => {
            setSupportsHover(e.matches);
        };

        media.addEventListener(
            'change',
            listener,
        );

        return () =>
            media.removeEventListener(
                'change',
                listener,
            );
    }, []);

    return supportsHover;
}