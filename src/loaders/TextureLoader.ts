class TextureLoader {
    private imageBitmap?: ImageBitmap;

    public async load(url: string): Promise<ImageBitmap> {
        const response = await fetch(url);
        const blob = await response.blob();
        this.imageBitmap = await createImageBitmap(blob);

        return this.imageBitmap;
    }
}

export { TextureLoader }