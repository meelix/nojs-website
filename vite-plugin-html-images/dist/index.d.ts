import { ResolvedConfig } from 'vite';
import * as sharp from 'sharp';
import { OutputOptions } from 'sharp';

declare type OptimizationOptions = Record<keyof sharp.FormatEnum, OutputOptions>;
interface ImageOptions {
    /**
     * The temporary directory must be inside the source directory (src)
     * so that the images can be accessed from the browser while the dev server is running.
     */
    tempDirname?: string;
    /**
     * Regular expression that retrieves URLs of images in HTML.
     * Match (the image url) must be on index 0.
     */
    regexp?: RegExp;
}

declare const _default: (imgOptions?: ImageOptions, optOptions?: Partial<OptimizationOptions>) => {
    name: string;
    enforce: string;
    configResolved: (resolvedConfig: ResolvedConfig) => void;
    transformIndexHtml: {
        enforce: string;
        transform: (html: string) => Promise<string | null | void>;
    };
};

export { _default as default };
